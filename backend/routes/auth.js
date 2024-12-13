import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (licenseNumber) {
      const existingLicense = await User.findOne({ licenseNumber });
      if (existingLicense) {
        return res
          .status(400)
          .json({ message: "License number already in use" });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      instituteName,
      designation,
      licenseNumber,
      phone,
      yearsOfExperience,
    });

    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(201).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    res.status(200).json({ token, userId: user._id });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong" });
  }
});

export default router;
