import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import Patient from "../models/Patient.js";

const router = express.Router();

router.get("/getpatients", authMiddleware, async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.id;

    const BASE_URL = `${req.protocol}://${req.get("host")}`;

    // Fetch all patients related to the specific user
    const patients = await Patient.find({ user: userId }).sort({
      "xrayImages.uploadDate": -1,
    }); // Sort by latest uploaded X-ray

    if (!patients.length) {
      return res.status(404).json({
        success: false,
        message: "No patients found for this user.",
      });
    }

    // Modify the response to include the base URL for image paths
    const updatedPatients = patients.map((patient) => ({
      ...patient.toObject(), // Convert Mongoose document to plain object
      xrayImages: patient.xrayImages.map((xray) => ({
        ...xray,
        imagePath: `${BASE_URL}/${xray.imagePath}`, // Append base URL
        uploadDate: xray.uploadDate,
        result: xray.result
          ? {
              ...xray.result,
              resultImage: xray.result.resultImage
                ? `${BASE_URL}/${xray.result.resultImage}` // Append base URL
                : null,
            }
          : null,
      })),
    }));

    // Send response with updated patients
    res.status(200).json({
      success: true,
      patients: updatedPatients,
    });
  } catch (error) {
    console.error("Error fetching patients:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

export default router;
