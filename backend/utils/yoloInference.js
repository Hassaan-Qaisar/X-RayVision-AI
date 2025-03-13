// utils/yoloInference.js
import { spawn } from "child_process";
import path from "path";
import fs from "fs";

/**
 * Runs YOLO inference on the provided X-ray image.
 * @param {string} xrayPath - Path to the uploaded X-ray image
 * @returns {Promise<object>} - Object containing paths to result images
 */
export const analyzeXray = async (xrayPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create a directory for storing the results if it doesn't exist
      const resultDir = path.join("uploads", "results");
      if (!fs.existsSync(resultDir)) {
        fs.mkdirSync(resultDir, { recursive: true });
      }

      // Generate unique filenames for result images
      const timestamp = Date.now();
      const yoloResultPath = path.join(
        resultDir,
        `yolo_result_${timestamp}.png`
      );
      const heatmapResultPath = path.join(
        resultDir,
        `heatmap_result_${timestamp}.png`
      );

      // Option 1: Using Python script directly through child process
      const pythonProcess = spawn("python", [
        "scripts/run_inference.py", // Create this script based on your provided code
        "--input",
        xrayPath,
        "--yolo-output",
        yoloResultPath,
        "--heatmap-output",
        heatmapResultPath,
      ]);

      // Handle Python script output
      let errorOutput = "";
      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python process error:", errorOutput);
          return reject(
            new Error(`YOLO inference failed with code ${code}: ${errorOutput}`)
          );
        }

        // Check if result files exist
        if (
          !fs.existsSync(yoloResultPath) ||
          !fs.existsSync(heatmapResultPath)
        ) {
          return reject(new Error("Result files were not generated."));
        }

        // Get disease identification based on YOLO results
        // In a real app, this would come from the model
        const disease = "Other Diseases";
        const description = "1) Aortic enlargement \n 2) Cardiomegaly";

        resolve({
          yoloResultPath,
          heatmapResultPath,
          disease,
          description,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
