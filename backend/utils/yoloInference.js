// utils/yoloInference.js
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Runs YOLO inference on the provided X-ray image.
 * @param {string} xrayPath - Path to the uploaded X-ray image
 * @returns {Promise<object>} - Object containing paths to result images and analysis
 */
export const analyzeXray = async (xrayPath) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create directories for storing the results if they don't exist
      const resultDir = path.join("uploads", "results");
      if (!fs.existsSync(resultDir)) {
        fs.mkdirSync(resultDir, { recursive: true });
      }

      // Generate unique filenames for result images and JSON
      const timestamp = Date.now();
      const yoloResultPath = path.join(
        resultDir,
        `yolo_result_${timestamp}.png`
      );
      const heatmapResultPath = path.join(
        resultDir,
        `heatmap_result_${timestamp}.png`
      );
      const jsonOutputPath = path.join(resultDir, `analysis_${timestamp}.json`);

      // Set up environment for the Python process
      const env = { ...process.env };

      console.log("Running YOLO inference on:", xrayPath);

      // Run Python script for inference
      const pythonProcess = spawn(
        "python",
        [
          "scripts/model_results.py", // Using the new script
          "--input",
          xrayPath,
          "--yolo-output",
          yoloResultPath,
          "--heatmap-output",
          heatmapResultPath,
          "--model",
          path.join(process.cwd(), "scripts", "best.pt"),
          "--output-json",
          jsonOutputPath,
        ],
        { env: env }
      );

      // Capture stdout for direct JSON results
      let stdoutData = "";
      pythonProcess.stdout.on("data", (data) => {
        stdoutData += data.toString();
      });

      // Handle Python script errors
      let errorOutput = "";
      pythonProcess.stderr.on("data", (data) => {
        errorOutput += data.toString();
      });

      console.log("Python process started.");

      pythonProcess.on("close", (code) => {
        if (code !== 0) {
          console.error("Python process exited with code:", code);
          console.error("Python process error:", errorOutput);
          return reject(
            new Error(`YOLO inference failed with code ${code}: ${errorOutput}`)
          );
        }

        // Check if YOLO result file exists (minimum requirement)
        if (!fs.existsSync(yoloResultPath)) {
          return reject(new Error("YOLO result file was not generated."));
        }

        // Heatmap might be missing if generation failed but YOLO succeeded
        const heatmapExists = fs.existsSync(heatmapResultPath);

        // Try to parse the JSON results first from stdout
        try {
          const jsonResults = JSON.parse(stdoutData);
          resolve({
            yoloResultPath,
            heatmapResultPath: heatmapExists ? heatmapResultPath : null,
            disease: jsonResults.disease,
            description: jsonResults.description,
            disease_names: jsonResults.disease_names,
          });
        } catch (e) {
          // If stdout parsing fails, try to read the JSON file
          try {
            if (fs.existsSync(jsonOutputPath)) {
              const jsonData = JSON.parse(
                fs.readFileSync(jsonOutputPath, "utf8")
              );
              resolve({
                yoloResultPath,
                heatmapResultPath: heatmapExists ? heatmapResultPath : null,
                disease: jsonData.disease,
                description: jsonData.description,
                disease_names: jsonData.disease_names,
              });
            } else {
              // Fallback to default values if JSON data is not available
              resolve({
                yoloResultPath,
                heatmapResultPath: heatmapExists ? heatmapResultPath : null,
                disease: "Other Diseases",
                description: "Analysis results are not available.",
                disease_names: ["Unknown"],
              });
            }
          } catch (jsonError) {
            // Last resort fallback
            console.error("Error parsing JSON results:", jsonError);
            resolve({
              yoloResultPath,
              heatmapResultPath: heatmapExists ? heatmapResultPath : null,
              disease: "Other Diseases",
              description: "Could not parse analysis results.",
              disease_names: ["Unknown"],
            });
          }
        }
      });
    } catch (error) {
      reject(error);
    }
  });
};
