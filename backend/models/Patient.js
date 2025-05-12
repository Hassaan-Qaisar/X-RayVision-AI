import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  yoloResultImage: {
    type: String,
    required: true,
  },
  heatmapResultImage: {
    type: String,
    required: true,
  },
  disease: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  disease_names: {
    type: [String],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const XrayImageSchema = new mongoose.Schema({
  imagePath: {
    type: String,
    required: true,
  },
  result: ResultSchema,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const PatientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
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
    enum: ["male", "female"],
  },
  description: {
    type: String,
  },
  xrayImages: [XrayImageSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Patient", PatientSchema);
