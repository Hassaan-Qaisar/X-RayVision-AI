import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  instituteName: { type: String, required: true },
  designation: { type: String },
  licenseNumber: { type: String, unique: true },
  phone: { type: String },
  yearsOfExperience: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);
