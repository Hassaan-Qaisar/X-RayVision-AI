import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Patient from "../models/Patient.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { analyzeXray } from "../utils/yoloInference.js";

const router = express.Router();

// Multer configuration for storing X-ray images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/xrays");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({ storage });

router.get("/patients", authMiddleware, async (req, res) => {
  try {
    const patients = await Patient.find({ user: req.user.id }).select(
      "-xrayImages"
    );

    if (!patients.length) {
      return res.status(404).json({ message: "No patients found" });
    }

    res.status(200).json(patients);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/add", authMiddleware, async (req, res) => {
  const { name, age, gender, description } = req.body;

  if (!name || !age || !gender) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const patient = new Patient({
      name,
      age,
      gender,
      user: req.user.id,
      description,
    });

    await patient.save();
    res.status(201).json({ message: "Patient added successfully", patient });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post(
  "/upload-xray/:patientId",
  authMiddleware,
  upload.single("xray"),
  async (req, res) => {
    const { patientId } = req.params;

    console.log("Received patientId:", patientId);

    try {
      // Find patient
      const patient = await Patient.findOne({
        _id: patientId,
        user: req.user.id,
      });

      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No X-ray image uploaded" });
      }

      // Store uploaded X-ray image path
      const xrayPath = req.file.path;

      console.log("Uploaded X-ray path:", xrayPath);

      // Run YOLO inference on the uploaded X-ray
      const analysisResults = await analyzeXray(xrayPath);

      // Extract results
      const {
        yoloResultPath,
        heatmapResultPath,
        disease,
        description,
        disease_names,
      } = analysisResults;

      // Save results to the patient's record
      patient.xrayImages.push({
        imagePath: xrayPath,
        result: {
          yoloResultImage: yoloResultPath,
          heatmapResultImage: heatmapResultPath || "", // Handle null heatmap path
          disease,
          description,
          disease_names,
        },
      });

      await patient.save();

      // Get base URL for serving images
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      const xrayPath1 = `${baseUrl}/${xrayPath}`;
      const yoloResultPath1 = `${baseUrl}/${yoloResultPath}`;
      // Only include heatmap if it exists
      const heatmapResultPath1 = heatmapResultPath
        ? `${baseUrl}/${heatmapResultPath}`
        : null;

      // Send response with results
      res.status(200).json({
        message: "X-ray uploaded and analyzed successfully",
        result: {
          xrayPath1,
          yoloResultPath1,
          heatmapResultPath1,
          disease,
          description,
          disease_names,
        },
      });
    } catch (err) {
      console.error("Error analyzing X-ray:", err.message);
      res
        .status(500)
        .json({ message: "Failed to analyze X-ray: " + err.message });
    }
  }
);

export default router;
