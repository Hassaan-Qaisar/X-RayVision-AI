import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import bcrypt from "bcryptjs";

const router = express.Router();
import User from "../models/User.js";

router.get("/get", authMiddleware, async (req, res) => {
  try {
    const doctor = await User.findById(req.user.id).select("-password");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", authMiddleware, async (req, res) => {
  const {
    name,
    email,
    password,
    instituteName,
    designation,
    licenseNumber,
    phone,
    yearsOfExperience,
  } = req.body;

  try {
    const doctor = await User.findById(req.user.id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update fields if provided
    if (name) doctor.name = name;
    if (email) doctor.email = email;
    if (password) {
      // Hash the password before saving
      const salt = await bcrypt.genSalt(10);
      doctor.password = await bcrypt.hash(password, salt);
    }
    if (instituteName) doctor.instituteName = instituteName;
    if (designation) doctor.designation = designation;
    if (licenseNumber) doctor.licenseNumber = licenseNumber;
    if (phone) doctor.phone = phone;
    if (yearsOfExperience !== undefined) {
      doctor.yearsOfExperience = yearsOfExperience;
    }

    await doctor.save();

    res.json({ message: "Profile updated successfully", doctor });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
