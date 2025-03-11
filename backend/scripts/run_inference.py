# scripts/run_inference.py
import torch
import cv2
import numpy as np
import matplotlib.pyplot as plt
import argparse
from ultralytics import YOLO
import os
import sys

# Import your heatmap module
# You might need to add the directory to sys.path if needed
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
try:
    from YOLOv8_Explainer import yolov8_heatmap, display_images
except ImportError:
    print("Error: YOLOv8_Explainer module not found.")
    sys.exit(1)

def parse_args():
    parser = argparse.ArgumentParser(description='Run YOLO inference on X-ray images')
    parser.add_argument('--input', type=str, required=True, help='Path to input X-ray image')
    parser.add_argument('--yolo-output', type=str, required=True, help='Path to save YOLO result image')
    parser.add_argument('--heatmap-output', type=str, required=True, help='Path to save heatmap result image')
    # parser.add_argument('--model', type=str, default='./best.pt', help='Path to YOLO model')
    parser.add_argument('--model', type=str, default=os.path.join(os.path.dirname(__file__), "best.pt"), help='Path to YOLO model')

    return parser.parse_args()

def preprocess_image(image_path, target_size=(1024, 1024)):
    image = cv2.imread(image_path)
    if image is None:
        print(f"Error: Could not load image from {image_path}")
        return None

    # Resize to target size
    image_resized = cv2.resize(image, target_size, interpolation=cv2.INTER_LINEAR)
    
    # Convert to RGB (YOLO expects RGB images)
    image_rgb = cv2.cvtColor(image_resized, cv2.COLOR_BGR2RGB)
    
    return image_rgb, image_resized

def run_yolo_inference(image_path, output_path, model_path):
    # Load the model
    model = YOLO(model_path)
    
    # Preprocess the image
    preprocessed_image, _ = preprocess_image(image_path)
    if preprocessed_image is None:
        return False
    
    # Run YOLOv8 inference
    results = model(preprocessed_image)
    
    # Get the result image with annotations
    result_image = results[0].plot()
    
    # Convert from RGB to BGR for OpenCV
    result_image_bgr = cv2.cvtColor(result_image, cv2.COLOR_RGB2BGR)
    
    # Save the result image
    cv2.imwrite(output_path, result_image_bgr)
    
    return True

def run_heatmap_inference(image_path, output_path, model_path):
    try:
        # Create heatmap model
        model = yolov8_heatmap(
            weight=model_path,
            conf_threshold=0.4,
            method="EigenGradCAM",
            layer=[10, 12, 14, 16, 18, -3],
            ratio=0.02,
            show_box=True,
            renormalize=False,
        )
        
        # Generate heatmap images
        images = model(img_path=image_path)
        
        # Assuming the first image is the one we want
        if images and len(images) > 0:
            heatmap_image = images[0]  # Adjust based on your actual return structure
            
            # Save the heatmap image
            plt.figure(figsize=(8, 8))
            plt.imshow(heatmap_image)
            plt.axis('off')
            plt.savefig(output_path, bbox_inches='tight', pad_inches=0)
            plt.close()
            return True
        else:
            print("Error: No heatmap images generated")
            return False
    except Exception as e:
        print(f"Error in heatmap generation: {str(e)}")
        return False

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
    yolo_success = run_yolo_inference(args.input, args.yolo_output, args.model)
    if not yolo_success:
        print("Error: YOLO inference failed")
        sys.exit(1)
    
    # Run heatmap inference
    heatmap_success = run_heatmap_inference(args.input, args.heatmap_output, args.model)
    if not heatmap_success:
        print("Error: Heatmap generation failed")
        sys.exit(1)
    
    print("Successfully generated both result images")
    sys.exit(0)

if __name__ == "__main__":
    main()