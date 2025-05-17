import torch
import cv2
import numpy as np
import matplotlib.pyplot as plt
import argparse
import os
import sys
import json
from ultralytics import YOLO
from PIL import Image
from io import BytesIO
import base64
from typing import List, Optional, Tuple, Union, Dict, Any
from pytorch_grad_cam import (EigenCAM, EigenGradCAM, GradCAM, GradCAMPlusPlus,
                             HiResCAM, LayerCAM, RandomCAM, XGradCAM)
from pytorch_grad_cam.utils.image import scale_cam_image, show_cam_on_image
from ultralytics.nn.tasks import attempt_load_weights
from ultralytics.utils.ops import non_max_suppression, xywh2xyxy
from openai import OpenAI


# Check if OpenAI is available and configured
# try:
#     from openai import OpenAI
#     import os
#     from dotenv import load_dotenv
#     # Load environment variables
#     load_dotenv()
#     OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
#     HAS_OPENAI = OPENAI_API_KEY is not None and OPENAI_API_KEY != ""
#     if HAS_OPENAI:
#         client = OpenAI(api_key=OPENAI_API_KEY)
# except ImportError:
#     HAS_OPENAI = False

client = OpenAI(api_key="")


# -------------------- Utils Functions --------------------

def letterbox(
    im: np.ndarray,
    new_shape=(640, 640),
    color=(114, 114, 114),
    auto=True,
    scaleFill=False,
    scaleup=True,
    stride=32,
):
    """
    Resize and pad image while meeting stride-multiple constraints.
    """
    shape = im.shape[:2]  # current shape [height, width]
    if isinstance(new_shape, int):
        new_shape = (new_shape, new_shape)
    # Scale ratio (new / old)
    r = min(new_shape[0] / shape[0], new_shape[1] / shape[1])
    if not scaleup:  # only scale down, do not scale up (for better val mAP)
        r = min(r, 1.0)
    # Compute padding
    ratio = r, r  # width, height ratios
    new_unpad = int(round(shape[1] * r)), int(round(shape[0] * r))
    dw, dh = new_shape[1] - new_unpad[0], new_shape[0] - new_unpad[1]  # wh padding
    if auto:  # minimum rectangle
        dw, dh = np.mod(dw, stride), np.mod(dh, stride)  # wh padding
    elif scaleFill:  # stretch
        dw, dh = 0.0, 0.0
        new_unpad = (new_shape[1], new_shape[0])
        ratio = new_shape[1] / shape[1], new_shape[0] / shape[0]  # width, height ratios
    dw /= 2  # divide padding into 2 sides
    dh /= 2
    if shape[::-1] != new_unpad:  # resize
        im = cv2.resize(im, new_unpad, interpolation=cv2.INTER_LINEAR)
    top, bottom = int(round(dh - 0.1)), int(round(dh + 0.1))
    left, right = int(round(dw - 0.1)), int(round(dw + 0.1))
    im = cv2.copyMakeBorder(im, top, bottom, left, right, cv2.BORDER_CONSTANT, value=color)  # add border
    
    return im, ratio, (dw, dh)

# -------------------- Custom ActivationsAndGradients Class --------------------

class ActivationsAndGradients:
    """ Class for extracting activations and registering gradients from targetted intermediate layers """
    def __init__(self, model: torch.nn.Module,
                 target_layers: List[torch.nn.Module],
                 reshape_transform: Optional[callable]) -> None:  # type: ignore
        self.model = model
        self.gradients = []
        self.activations = []
        self.reshape_transform = reshape_transform
        self.handles = []
        for target_layer in target_layers:
            self.handles.append(
                target_layer.register_forward_hook(self.save_activation))
            self.handles.append(
                target_layer.register_forward_hook(self.save_gradient))

    def save_activation(self, module: torch.nn.Module,
                        input: Union[torch.Tensor, Tuple[torch.Tensor, ...]],
                        output: torch.Tensor) -> None:
        activation = output
        if self.reshape_transform is not None:
            activation = self.reshape_transform(activation)
        self.activations.append(activation.cpu().detach())

    def save_gradient(self, module: torch.nn.Module,
                      input: Union[torch.Tensor, Tuple[torch.Tensor, ...]],
                      output: torch.Tensor) -> None:
        if not hasattr(output, "requires_grad") or not output.requires_grad:
            return
        # Gradients are computed in reverse order
        def _store_grad(grad: torch.Tensor) -> None:
            if self.reshape_transform is not None:
                grad = self.reshape_transform(grad)
            self.gradients = [grad.cpu().detach()] + self.gradients
        output.register_hook(_store_grad)

    def post_process(self, result: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor, np.ndarray]:
        logits_ = result[:, 4:]
        boxes_ = result[:, :4]
        sorted, indices = torch.sort(logits_.max(1)[0], descending=True)
        return torch.transpose(logits_[0], dim0=0, dim1=1)[indices[0]], torch.transpose(boxes_[0], dim0=0, dim1=1)[
            indices[0]], xywh2xyxy(torch.transpose(boxes_[0], dim0=0, dim1=1)[indices[0]]).cpu().detach().numpy()

    def __call__(self, x: torch.Tensor) -> List[List[Union[torch.Tensor, np.ndarray]]]:
        self.gradients = []
        self.activations = []
        model_output = self.model(x)
        post_result, pre_post_boxes, post_boxes = self.post_process(
            model_output[0])
        return [[post_result, pre_post_boxes]]

    def release(self) -> None:
        for handle in self.handles:
            handle.remove()

# -------------------- YOLOv8 Target Class --------------------

class yolov8_target(torch.nn.Module):
    def __init__(self, ouput_type, conf, ratio) -> None:
        super().__init__()
        self.ouput_type = ouput_type
        self.conf = conf
        self.ratio = ratio

    def forward(self, data):
        post_result, pre_post_boxes = data
        result = []
        for i in range(post_result.size(0)):
            if float(post_result[i].max()) >= self.conf:
                if self.ouput_type == 'class' or self.ouput_type == 'all':
                    result.append(post_result[i].max())
                if self.ouput_type == 'box' or self.ouput_type == 'all':
                    for j in range(4):
                        result.append(pre_post_boxes[i, j])
        return sum(result)

# -------------------- YOLOv8 Heatmap Class --------------------

class yolov8_heatmap:
    def __init__(
            self,
            weight: str,
            device=torch.device("cuda:0" if torch.cuda.is_available() else "cpu"),
            method="EigenGradCAM",
            layer=[12, 17, 21],
            conf_threshold=0.2,
            ratio=0.02,
            show_box=True,
            renormalize=False,
    ) -> None:
        device = device
        backward_type = "all"
        ckpt = torch.load(weight)
        model_names = ckpt['model'].names
        model = attempt_load_weights(weight, device)
        model.info()
        for p in model.parameters():
            p.requires_grad_(True)
        model.eval()
        target = yolov8_target(backward_type, conf_threshold, ratio)
        target_layers = [model.model[l] for l in layer]
        method = eval(method)(model, target_layers,
                              use_cuda=device.type == 'cuda')
        method.activations_and_grads = ActivationsAndGradients(
            model, target_layers, None)
        colors = np.random.uniform(
            0, 255, size=(len(model_names), 3)).astype(int)
        self.__dict__.update(locals())

    def post_process(self, result):
        processed_result = non_max_suppression(
            result,
            conf_thres=self.conf_threshold,
            iou_thres=0.45
        )
        if len(processed_result) == 0 or processed_result[0].numel() == 0:
            return torch.empty(0, 6)
        detections = processed_result[0]
        mask = detections[:, 4] >= self.conf_threshold
        filtered_detections = detections[mask]
        return filtered_detections

    def draw_detections(self, box, color, name, img):
        xmin, ymin, xmax, ymax = map(int, box[:4])
        cv2.rectangle(img, (xmin, ymin), (xmax, ymax),
                      tuple(int(x) for x in color), 2)
        cv2.putText(img, name, (xmin, ymin - 5),
                    cv2.FONT_HERSHEY_SIMPLEX,
                    0.8, tuple(int(x) for x in color), 2,
                    lineType=cv2.LINE_AA)
        return img

    def renormalize_cam_in_bounding_boxes(
            self,
            boxes: np.ndarray,
            image_float_np: np.ndarray,
            grayscale_cam: np.ndarray,
    ) -> np.ndarray:
        renormalized_cam = np.zeros(grayscale_cam.shape, dtype=np.float32)
        for x1, y1, x2, y2 in boxes:
            x1, y1 = max(x1, 0), max(y1, 0)
            x2, y2 = min(grayscale_cam.shape[1] - 1,
                         x2), min(grayscale_cam.shape[0] - 1, y2)
            renormalized_cam[y1:y2, x1:x2] = scale_cam_image(
                grayscale_cam[y1:y2, x1:x2].copy())
        renormalized_cam = scale_cam_image(renormalized_cam)
        eigencam_image_renormalized = show_cam_on_image(
            image_float_np, renormalized_cam, use_rgb=True)
        return eigencam_image_renormalized

    def renormalize_cam(self, boxes, image_float_np, grayscale_cam):
        renormalized_cam = scale_cam_image(grayscale_cam)
        eigencam_image_renormalized = show_cam_on_image(
            image_float_np, renormalized_cam, use_rgb=True)
        return eigencam_image_renormalized

    def process(self, img_path):
        img = cv2.imread(img_path)
        img = letterbox(img)[0]
        img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        img = np.float32(img) / 255.0
        tensor = (
            torch.from_numpy(np.transpose(img, axes=[2, 0, 1]))
            .unsqueeze(0)
            .to(self.device)
        )
        try:
            grayscale_cam = self.method(tensor, [self.target])
        except AttributeError as e:
            print(f"Error generating CAM: {e}")
            return None
        grayscale_cam = grayscale_cam[0, :]
        pred1 = self.model(tensor)[0]
        pred = non_max_suppression(
            pred1,
            conf_thres=self.conf_threshold,
            iou_thres=0.45
        )[0]
        
        if self.renormalize:
            cam_image = self.renormalize_cam(
                pred[:, :4].cpu().detach().numpy().astype(np.int32),
                img,
                grayscale_cam
            )
        else:
            cam_image = show_cam_on_image(img, grayscale_cam, use_rgb=True)
        
        if self.show_box and len(pred) > 0:
            for detection in pred:
                detection = detection.cpu().detach().numpy()
                class_index = int(detection[5])
                cam_image = self.draw_detections(
                    detection[:4],
                    self.colors[class_index],
                    f"{self.model_names[class_index]}",
                    cam_image,
                )
        cam_image = Image.fromarray(cam_image)
        return cam_image

    def save_result(self, img_path, output_path):
        """Process an image and save the result to a file"""
        result = self.process(img_path)
        if result is not None:
            result.save(output_path)
            return True
        return False

# Function to preprocess image for inference
def preprocess_image(image_path, target_size=(1024, 1024)):
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not load image from {image_path}")
        return None, None, None

    # Resize to target size
    image_resized = cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)
    
    # Convert to RGB (YOLO expects RGB images)
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
    
    return image_rgb, image_resized, image

# Function to run YOLO inference
def run_yolo_inference(image_path, output_path, model_path):
    try:
        # Load the model
        model = YOLO(model_path)
        
        # Preprocess the image
        preprocessed_image, _, _ = preprocess_image(image_path)
        if preprocessed_image is None:
            return False, [], []
        
        # Run YOLOv8 inference
        results = model(preprocessed_image, conf=0.2)
        
        # Get detected conditions and their bounding boxes
        detected_conditions = []
        detected_boxes = []
        
        for r in results:
            boxes = r.boxes
            for box in boxes:
                # Get class name
                cls_id = int(box.cls[0])
                cls_name = model.names[cls_id]
                conf = float(box.conf[0])
                detected_conditions.append(f"{cls_name} (confidence: {conf:.2f})")
                
                # Get coordinates (x1, y1, x2, y2 format)
                x1, y1, x2, y2 = box.xyxy[0].tolist()
                detected_boxes.append([x1, y1, x2, y2])
        
        # Get the result image with annotations (even if no detections)
        result_image = results[0].plot()
        
        # Convert from RGB to BGR for OpenCV
        result_image_bgr = cv2.cvtColor(result_image, cv2.COLOR_RGB2BGR)
        
        # Save the result image
        cv2.imwrite(output_path, result_image_bgr)
        
        return True, detected_conditions, detected_boxes
    except Exception as e:
        print(f"Error in YOLO inference: {str(e)}")
        return False, [], []

# Function to crop an image to show only the detected region
def crop_detection(image, box, padding=20):
    x1, y1, x2, y2 = box
    height, width = image.shape[:2]
    
    # Add padding
    x1 = max(0, x1 - padding)
    y1 = max(0, y1 - padding)
    x2 = min(width, x2 + padding)
    y2 = min(height, y2 + padding)
    
    # Crop the image
    return image[int(y1):int(y2), int(x1):int(x2)]

# Function to encode image to base64 string
def encode_image_to_base64(image_array):
    # Convert numpy array to PIL Image
    img = Image.fromarray(image_array)
    
    # Save image to BytesIO object
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    
    # Encode BytesIO to base64
    img_str = base64.b64encode(buffered.getvalue()).decode('utf-8')
    return img_str

# Function to get LLM explanation
def get_technical_explanation(conditions, detected_boxes, original_image):
    # Skip if no OpenAI API
    # if not HAS_OPENAI:
    #     return "AI-assisted explanations not available. Please check OPENAI_API_KEY in environment variables."
    
    try:
        # Prepare the detected regions without detailed coordinates
        detection_details = []
        region_images = []
        
        # Process each detection
        for i, (condition, box) in enumerate(zip(conditions, detected_boxes)):
            # Format condition details
            condition_name = condition.split(" (confidence:")[0]
            confidence = float(condition.split(": ")[1].rstrip(")"))
            
            # Just store condition and confidence - no coordinates
            detection_details.append({
                "condition": condition_name,
                "confidence": confidence
            })
            
            # Crop the region and encode as base64
            cropped_region = crop_detection(original_image, box)
            if cropped_region.size > 0:  # Ensure the crop is not empty
                region_base64 = encode_image_to_base64(cropped_region)
                region_images.append({
                    "condition": condition_name,
                    "base64_image": region_base64
                })
        
        # Encode the full image with annotations
        full_image_base64 = encode_image_to_base64(original_image)
        
        # Create the prompt
        prompt = f"""
        As a radiologist, provide a detailed technical explanation for a chest X-ray showing the following conditions: {[d['condition'] for d in detection_details]}.
        
        For each detected condition:
        1. Describe the precise anatomical location using proper anatomical landmarks (e.g., "upper left lung field near the 3rd anterior rib," "right costophrenic angle," "left hilar region")
        2. Explain the radiographic findings visible at this location
        3. Provide technical insights on why this pathology typically appears at this anatomical location
        4. Detail the underlying anatomical or physiological factors contributing to this presentation
        5. Discuss the severity based on the visual characteristics and anatomical involvement
        6. Explain technical considerations for differential diagnoses given the specific location
        7. Include specific follow-up imaging recommendations with rationale
        
        Format as a professional medical report with technical details appropriate for a specialist.
        """
        
        # Check if we should use vision capabilities
        use_vision = region_images and len(region_images) > 0
        vision_model = "gpt-4o"  # Use the latest model with vision capabilities
        
        # Try to use vision model if we have regions
        if use_vision:
            try:
                messages = [
                    {"role": "system", "content": "You are a radiologist AI assistant with expertise in analyzing chest X-rays. Provide technical analysis of the detected regions."}
                ]
                
                # Add the full annotated image first
                content_parts = [
                    {"type": "text", "text": "Chest X-ray with detected conditions. I need detailed anatomical descriptions and explanations for each finding."},
                    {"type": "image_url", "image_url": {"url": f"data:image/png;base64,{full_image_base64}"}}
                ]
                
                # Add the prompt with detailed instructions
                content_parts.append({"type": "text", "text": prompt})
                
                # Add the cropped regions for detailed analysis
                for region in region_images:
                    content_parts.append({
                        "type": "text", 
                        "text": f"Close-up of detected {region['condition']}. Please describe the specific anatomical location and findings:"
                    })
                    content_parts.append({
                        "type": "image_url", 
                        "image_url": {"url": f"data:image/png;base64,{region['base64_image']}"}
                    })
                
                messages.append({"role": "user", "content": content_parts})
                
                response = client.chat.completions.create(
                    model=vision_model,
                    messages=messages,
                    max_tokens=1500
                )
                return response.choices[0].message.content.strip()
            except Exception as e:
                print(f"Vision model error: {str(e)}. Falling back to text-only model.")
                use_vision = False
        
        # Fallback to text-only if vision not supported or failed
        response = client.chat.completions.create(
            model="gpt-4o",  # Using the latest model as fallback
            messages=[
                {"role": "system", "content": "You are a radiologist AI assistant with expertise in analyzing chest X-rays."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        return f"Error getting explanation: {str(e)}"

def parse_args():
    parser = argparse.ArgumentParser(description='Run YOLO inference on X-ray images')
    parser.add_argument('--input', type=str, required=True, help='Path to input X-ray image')
    parser.add_argument('--yolo-output', type=str, required=True, help='Path to save YOLO result image')
    parser.add_argument('--heatmap-output', type=str, required=True, help='Path to save heatmap result image')
    parser.add_argument('--model', type=str, default=os.path.join(os.path.dirname(__file__), "best.pt"), help='Path to YOLO model')
    parser.add_argument('--output-json', type=str, default='', help='Path to save JSON results (diseases and explanation)')
    return parser.parse_args()

def main():
    args = parse_args()
    
    # Check if input file exists
    if not os.path.isfile(args.input):
        print(f"Error: Input file {args.input} does not exist")
        sys.exit(1)
    
    # Create output directories if needed
    os.makedirs(os.path.dirname(args.yolo_output), exist_ok=True)
    os.makedirs(os.path.dirname(args.heatmap_output), exist_ok=True)
    
    # Run YOLO inference
    yolo_success, detected_conditions, detected_boxes = run_yolo_inference(args.input, args.yolo_output, args.model)
    if not yolo_success:
        print("Error: YOLO inference failed")
        sys.exit(1)
    
    # Check if any diseases were detected
    if not detected_conditions or len(detected_conditions) == 0:
        # No diseases detected - create results and exit
        results = {
            "disease": "No Abnormality Detected",
            "disease_names": ["No abnormalities detected"],
            "description": "No abnormalities were detected in this chest X-ray."
        }
        
        # Save results to JSON file if requested
        if args.output_json:
            with open(args.output_json, 'w') as f:
                json.dump(results, f, indent=2)
        
        # Print the results to stdout for capturing in Node.js
        print(json.dumps(results))
        print("No abnormalities detected in the X-ray")
        sys.exit(0)
    
    # Create heatmap object
    heatmap_model = yolov8_heatmap(
        weight=args.model,
        conf_threshold=0.2,
        method="EigenGradCAM",
        layer=[10, 12, 14, 16, 18, -3],
        ratio=0.02,
        show_box=True,
        renormalize=False,
    )

    # Generate and save heatmap
    try:
        heatmap_success = heatmap_model.save_result(args.input, args.heatmap_output)
        if not heatmap_success:
            print("Warning: Heatmap generation failed, continuing with YOLO results only")
            # Continue with processing without heatmap
    except Exception as e:
        print(f"Warning: Heatmap generation error: {str(e)}, continuing with YOLO results only")
        # Continue with processing without heatmap
    
    # Process results
    # Get disease names (without confidence values)
    disease_names = detected_conditions  # Keep full condition strings with confidence
    
    # Get disease category (defaulting to "Other Diseases" when detections are present)
    category = "Other Diseases"  # Default category when conditions are detected
    
    # Generate report if we have detected conditions
    # Get original image for explanation
    _, _, original_image = preprocess_image(args.input)
    explanation = get_technical_explanation(detected_conditions, detected_boxes, original_image)
    
    # Create result dictionary
    results = {
        "disease": category,
        "disease_names": disease_names,
        "description": explanation
    }
    
    # Save results to JSON file if requested
    if args.output_json:
        with open(args.output_json, 'w') as f:
            json.dump(results, f, indent=2)
    
    # Also print the results to stdout for capturing in Node.js
    print(json.dumps(results))
    
    print("Successfully generated all results")
    sys.exit(0)

if __name__ == "__main__":
    main()