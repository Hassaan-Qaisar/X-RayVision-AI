import mongoose from "mongoose";

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    enum: ["male", "female", "other"],
  },
  description: {
    type: String,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  xrayImages: [
    {
      imagePath: { type: String, required: true }, // Uploaded X-ray image
      uploadDate: { type: Date, default: Date.now },
      result: {
        resultImage: { type: String }, // ML-generated result image
        disease: { type: String }, // Disease detected
        description: { type: String }, // Description of findings
      },
    },
  ],
});

export default mongoose.model("Patient", PatientSchema);
