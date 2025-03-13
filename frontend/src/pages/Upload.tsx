"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  User,
  Calendar,
  Users,
  FileText,
  UploadIcon,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Stethoscope,
  PlusCircle,
  UserPlus,
  Image,
  FileImage,
  Microscope,
  Zap,
  ArrowRight,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  X,
  RotateCw,
} from "lucide-react";
import { format } from "date-fns";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
};

type AnalysisResult = {
  xrayPath1: string;
  yoloResultPath1: string;
  heatmapResultPath1: string;
  disease: string;
  description: string;
};

const ImageViewer = ({
  isOpen,
  onClose,
  imageSrc,
  title,
}: {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  title: string;
}) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));
  const rotateClockwise = () => setRotation((prev) => prev + 90);
  const rotateCounterClockwise = () => setRotation((prev) => prev - 90);
  const resetView = () => {
    setScale(1);
    setRotation(0);
  };

  // Reset view when opening a new image
  useEffect(() => {
    resetView();
  }, [imageSrc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl bg-gray-900 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <h3 className="text-xl font-medium text-white">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="relative h-[calc(100vh-12rem)] overflow-hidden bg-black flex items-center justify-center">
          <img
            src={imageSrc}
            alt={title}
            className="max-h-full max-w-full object-contain transition-all duration-200 ease-in-out"
            style={{
              transform: `scale(${scale}) rotate(${rotation}deg)`,
            }}
            onError={(e) => {
              e.currentTarget.src = "/placeholder.svg";
            }}
          />
        </div>

        <div className="flex justify-center items-center gap-4 p-4 bg-gray-800">
          <button
            onClick={zoomIn}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            title="Zoom In"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button
            onClick={zoomOut}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            title="Zoom Out"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button
            onClick={rotateCounterClockwise}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            title="Rotate Counter-Clockwise"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
          <button
            onClick={rotateClockwise}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            title="Rotate Clockwise"
          >
            <RotateCw className="h-5 w-5" />
          </button>
          <button
            onClick={resetView}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 text-white"
            title="Reset View"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Upload() {
  const [step, setStep] = useState(1);
  const [isNewPatient, setIsNewPatient] = useState(true);
  const [patientList, setPatientList] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [patientDetails, setPatientDetails] = useState({
    name: "",
    age: "",
    gender: "",
    description: "",
  });
  const [xrayFile, setXrayFile] = useState<File | null>(null);
  const [xrayPreview, setXrayPreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isPatientListLoading, setIsPatientListLoading] = useState(true);
  const [dragActive, setDragActive] = useState(false);

  // State for image viewer modal
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [currentImageTitle, setCurrentImageTitle] = useState("");

  // Function to open the image viewer
  const openImageViewer = (imageSrc: string, title: string) => {
    setCurrentImage(imageSrc);
    setCurrentImageTitle(title);
    setImageViewerOpen(true);
  };

  useEffect(() => {
    fetchPatientList();
  }, []);

  useEffect(() => {
    // Create preview URL for the uploaded file
    if (xrayFile) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setXrayPreview(reader.result as string);
      };
      reader.readAsDataURL(xrayFile);
    } else {
      setXrayPreview(null);
    }

    // Cleanup function to revoke the object URL when component unmounts
    return () => {
      if (xrayPreview && xrayPreview.startsWith("blob:")) {
        URL.revokeObjectURL(xrayPreview);
      }
    };
  }, [xrayFile]);

  const fetchPatientList = async () => {
    setIsPatientListLoading(true);
    try {
      const response = await fetch(
        "http://localhost:5000/api/upload/patients",
        {
          method: "GET",
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      if (!response.ok) {
        // Check if the response has a message body (error response)
        const errorData = await response.json();
        const errorMessage = errorData.message || "Failed to load patient list";
        throw new Error(errorMessage);
      }

      const data = await response.json();
      setPatientList(data);
    } catch (error) {
      console.error("Error fetching patient list:", error);
      toast.error(error.message);
    } finally {
      setIsPatientListLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setPatientDetails((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setXrayFile(file);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        toast.error("File size exceeds 10MB limit");
        return;
      }
      setXrayFile(file);
    }
  };

  const handleCreatePatient = async () => {
    setIsLoading(true);
    try {
      // Validate inputs
      if (!patientDetails.name.trim()) {
        throw new Error("Patient name is required");
      }
      if (!patientDetails.age) {
        throw new Error("Patient age is required");
      }
      if (!patientDetails.gender) {
        throw new Error("Patient gender is required");
      }

      const response = await fetch("http://localhost:5000/api/upload/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(patientDetails),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create patient");
      }

      const newPatient = await response.json();
      setSelectedPatient(newPatient.patient);
      setPatientList((prevList) => [...prevList, newPatient.patient]);
      toast.success("Patient created successfully!");
      setPatientDetails({
        name: "",
        age: "",
        gender: "",
        description: "",
      });
      setStep(2);
    } catch (error) {
      console.error("Error creating patient:", error);
      toast.error(
        error.message || "Failed to create patient. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      if (isNewPatient) {
        await handleCreatePatient();
      } else {
        if (selectedPatient) {
          setStep(2);
        } else {
          toast.error("Please select a patient.");
        }
      }
    } else if (step === 2) {
      await handleAnalyzeXray();
    }
  };

  const handleAnalyzeXray = async () => {
    setIsLoading(true);
    try {
      if (!selectedPatient) {
        throw new Error("No patient selected");
      }
      if (!xrayFile) {
        throw new Error("No X-ray file selected");
      }

      const formData = new FormData();
      formData.append("xray", xrayFile);

      const response = await fetch(
        `http://localhost:5000/api/upload/upload-xray/${selectedPatient._id}`,
        {
          method: "POST",
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to analyze X-ray");
      }

      const result = await response.json();
      setAnalysisResult(result.result);
      setStep(3);
    } catch (error) {
      console.error("Error analyzing X-ray:", error);
      toast.error(
        error.message || "Failed to analyze X-ray. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setStep(1);
    setXrayFile(null);
    setXrayPreview(null);
    setAnalysisResult(null);
    setSelectedPatient(null);
    setPatientDetails({
      name: "",
      age: "",
      gender: "",
      description: "",
    });
    setIsNewPatient(true);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Stethoscope className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Patient Information
            </h3>
            <p className="mt-1 text-sm text-blue-600">
              {isNewPatient
                ? "Create a new patient record to associate with the X-ray"
                : "Select an existing patient from your records"}
            </p>
          </div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
            isNewPatient
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setIsNewPatient(true)}
        >
          <UserPlus className="h-5 w-5 mr-2" />
          New Patient
        </button>
        <button
          type="button"
          className={`flex-1 py-3 px-4 rounded-lg flex items-center justify-center transition-all duration-200 ${
            !isNewPatient
              ? "bg-blue-600 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
          onClick={() => setIsNewPatient(false)}
        >
          <User className="h-5 w-5 mr-2" />
          Existing Patient
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isNewPatient ? (
          <motion.div
            key="new-patient"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700"
              >
                Name <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm"
                  placeholder="John Doe"
                  value={patientDetails.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="age"
                  className="block text-sm font-medium text-gray-700"
                >
                  Age <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    name="age"
                    id="age"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm"
                    placeholder="30"
                    value={patientDetails.age}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="gender"
                  className="block text-sm font-medium text-gray-700"
                >
                  Gender <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Users className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="gender"
                    id="gender"
                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm"
                    value={patientDetails.gender}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Medical Notes (Optional)
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-lg pl-2 pt-1 pr-1"
                  placeholder="Patient's medical history, symptoms, or other relevant information"
                  value={patientDetails.description}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="existing-patient"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4 bg-white rounded-lg p-6 border border-gray-200 shadow-sm"
          >
            {isPatientListLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                <span className="ml-2 text-gray-600">Loading patients...</span>
              </div>
            ) : patientList.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  No patients found
                </h3>
                <p className="text-gray-500 mb-4">
                  You haven't created any patients yet.
                </p>
                <button
                  type="button"
                  onClick={() => setIsNewPatient(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create New Patient
                </button>
              </div>
            ) : (
              <>
                <label
                  htmlFor="existingPatient"
                  className="block text-sm font-medium text-gray-700"
                >
                  Select Patient <span className="text-red-500">*</span>
                </label>
                <select
                  id="existingPatient"
                  name="existingPatient"
                  className="mt-1 block w-full pl-3 pr-10 py-3 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-lg shadow-sm"
                  value={selectedPatient?._id || ""}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const patient = patientList.find(
                      (p) => p._id === selectedId
                    );
                    setSelectedPatient(patient || null);
                  }}
                  required
                >
                  <option value="">Select a patient</option>
                  {patientList.map((patient) => (
                    <option key={patient._id} value={patient._id}>
                      {patient.name} ({patient.age} years, {patient.gender})
                    </option>
                  ))}
                </select>

                {selectedPatient && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Patient Information
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Name:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedPatient.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Age:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedPatient.age} years
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Gender:</span>
                        <span className="ml-2 text-gray-900">
                          {selectedPatient.gender}
                        </span>
                      </div>
                    </div>
                    {selectedPatient.description && (
                      <div className="mt-2">
                        <span className="text-gray-500">Medical Notes:</span>
                        <p className="mt-1 text-gray-700">
                          {selectedPatient.description}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <FileImage className="h-5 w-5 text-blue-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">X-ray Upload</h3>
            <p className="mt-1 text-sm text-blue-600">
              Upload a chest X-ray image for AI-powered analysis
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        {selectedPatient && (
          <div className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500" />
              Selected Patient
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-500">Name:</span>
                <span className="ml-2 text-gray-900">
                  {selectedPatient.name}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Age:</span>
                <span className="ml-2 text-gray-900">
                  {selectedPatient.age} years
                </span>
              </div>
              <div>
                <span className="text-gray-500">Gender:</span>
                <span className="ml-2 text-gray-900">
                  {selectedPatient.gender}
                </span>
              </div>
            </div>
          </div>
        )}

        <div>
          <label
            htmlFor="xrayUpload"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Upload X-ray Image <span className="text-red-500">*</span>
          </label>
          <div
            className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 bg-gray-50"
            } border-dashed rounded-lg transition-colors duration-200`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-3 text-center">
              {xrayPreview ? (
                <div className="mx-auto w-40 h-40 relative">
                  <img
                    src={xrayPreview || "/placeholder.svg"}
                    alt="X-ray preview"
                    className="w-full h-full object-contain rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setXrayFile(null);
                      setXrayPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-100 text-red-600 rounded-full p-1 hover:bg-red-200 transition-colors duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              ) : (
                <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
              )}

              <div className="flex text-sm text-gray-600 justify-center">
                <label
                  htmlFor="xrayUpload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 px-3 py-2"
                >
                  <span>{xrayFile ? "Change file" : "Upload a file"}</span>
                  <input
                    id="xrayUpload"
                    name="xrayUpload"
                    type="file"
                    className="sr-only"
                    onChange={handleFileChange}
                    accept="image/*"
                    required
                  />
                </label>
                {!xrayFile && (
                  <p className="pl-1 flex items-center">or drag and drop</p>
                )}
              </div>
              <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              {xrayFile && (
                <div className="flex items-center justify-center text-sm text-gray-600">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span>
                    {xrayFile.name} (
                    {(xrayFile.size / (1024 * 1024)).toFixed(2)} MB)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            What happens next?
          </h4>
          <ul className="space-y-2">
            <li className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Microscope className="h-5 w-5 text-blue-500" />
              </div>
              <p className="ml-2 text-sm text-gray-600">
                Your X-ray will be analyzed by our AI system
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <Zap className="h-5 w-5 text-blue-500" />
              </div>
              <p className="ml-2 text-sm text-gray-600">
                Results include disease detection and detailed analysis
              </p>
            </li>
            <li className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <FileText className="h-5 w-5 text-blue-500" />
              </div>
              <p className="ml-2 text-sm text-gray-600">
                The analysis will be saved to the patient's record
              </p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-green-50 rounded-lg p-4 border border-green-100">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircle className="h-5 w-5 text-green-500" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              Analysis Complete
            </h3>
            <p className="mt-1 text-sm text-green-600">
              The X-ray has been successfully analyzed and the results are ready
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
          <Stethoscope className="h-6 w-6 mr-2 text-blue-600" />
          Analysis Results
        </h2>

        {analysisResult && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Image className="h-4 w-4 mr-2 text-gray-500" />
                  Original X-ray
                </h3>
                <div
                  className="aspect-square bg-black rounded-lg overflow-hidden shadow-md cursor-pointer"
                  onClick={() =>
                    openImageViewer(
                      analysisResult.xrayPath1 || "/placeholder.svg",
                      "Original X-ray"
                    )
                  }
                >
                  <img
                    src={analysisResult.xrayPath1 || "/placeholder.svg"}
                    alt="Original X-ray"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=400&width=400";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <FileImage className="h-4 w-4 mr-2 text-gray-500" />
                  Bounding Boxes
                </h3>
                <div
                  className="aspect-square bg-black rounded-lg overflow-hidden shadow-md cursor-pointer"
                  onClick={() =>
                    openImageViewer(
                      analysisResult.yoloResultPath1 || "/placeholder.svg",
                      "Bounding Boxes"
                    )
                  }
                >
                  <img
                    src={analysisResult.yoloResultPath1 || "/placeholder.svg"}
                    alt="YOLO detection result"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=400&width=400";
                    }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 flex items-center">
                  <Microscope className="h-4 w-4 mr-2 text-gray-500" />
                  Heatmap Analysis
                </h3>
                <div
                  className="aspect-square bg-black rounded-lg overflow-hidden shadow-md cursor-pointer"
                  onClick={() =>
                    openImageViewer(
                      analysisResult.heatmapResultPath1 || "/placeholder.svg",
                      "Heatmap Analysis"
                    )
                  }
                >
                  <img
                    src={
                      analysisResult.heatmapResultPath1 || "/placeholder.svg"
                    }
                    alt="Heatmap analysis"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.currentTarget.src =
                        "/placeholder.svg?height=400&width=400";
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-blue-600" />
                  Diagnosis
                </h3>
                <div className="px-3 py-2 bg-white rounded-md border border-gray-200">
                  <p className="text-gray-900 font-medium">
                    {analysisResult.disease}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-2 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-600" />
                  Description
                </h3>
                <div className="px-3 py-2 bg-white rounded-md border border-gray-200 max-h-32 overflow-y-auto">
                  <p className="text-gray-700">{analysisResult.description}</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:justify-between gap-4 mt-8">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={resetForm}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New Analysis
              </button>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={() => (window.location.href = "/history")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Patient History
                </button>

                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  // onClick={() => {
                  //   toast.info(
                  //     "Download functionality will be implemented soon"
                  //   );
                  // }}
                  onClick={() => {
                    if (selectedPatient && analysisResult) {
                      // Import function dynamically to reduce initial bundle size
                      import("../utils/generatePDFreport")
                        .then((module) => {
                          const generatePdfReport = module.default;
                          generatePdfReport(selectedPatient, analysisResult);
                          toast.success("Report downloaded successfully!");
                        })
                        .catch((error) => {
                          console.error("Error generating PDF:", error);
                          toast.error(
                            "Failed to generate report. Please try again."
                          );
                        });
                    } else {
                      toast.error(
                        "Patient data or analysis results are missing"
                      );
                    }
                  }}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Download Report
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
      >
        <div className="bg-white shadow-xl rounded-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
            <h1 className="text-2xl font-bold text-white">
              Upload and Analyze X-ray
            </h1>
            <p className="text-blue-100 mt-1">
              Get instant AI-powered analysis of chest X-rays
            </p>
          </div>

          <div className="px-6 py-8">
            <div className="mb-8">
              <div className="flex items-center justify-between">
                {[1, 2, 3].map((stepNumber) => (
                  <div key={stepNumber} className="flex flex-col items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${
                        step >= stepNumber
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      } ${step === stepNumber ? "ring-4 ring-blue-100" : ""}`}
                    >
                      {step > stepNumber ? (
                        <CheckCircle className="h-6 w-6" />
                      ) : (
                        <span className="text-lg font-semibold">
                          {stepNumber}
                        </span>
                      )}
                    </div>
                    <span
                      className={`mt-2 text-sm font-medium ${
                        step === stepNumber ? "text-blue-600" : "text-gray-500"
                      }`}
                    >
                      {stepNumber === 1 && "Patient Details"}
                      {stepNumber === 2 && "Upload X-ray"}
                      {stepNumber === 3 && "Results"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStep1()}
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStep2()}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    {renderStep3()}
                  </motion.div>
                )}
              </AnimatePresence>

              {step < 3 && (
                <div className="mt-8 flex justify-between">
                  {step > 1 && (
                    <button
                      type="button"
                      onClick={() => setStep(step - 1)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Previous
                    </button>
                  )}

                  {step === 1 && (
                    <button
                      type="submit"
                      disabled={
                        isLoading || (isNewPatient ? false : !selectedPatient)
                      }
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Next Step
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}

                  {step === 2 && (
                    <button
                      type="submit"
                      disabled={isLoading || !xrayFile}
                      className="inline-flex items-center px-6 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="animate-spin mr-2 h-4 w-4" />
                          Analyzing X-ray...
                        </>
                      ) : (
                        <>
                          Analyze X-ray
                          <Microscope className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        </div>
      </motion.div>
      <ImageViewer
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageSrc={currentImage}
        title={currentImageTitle}
      />
    </div>
  );
}
