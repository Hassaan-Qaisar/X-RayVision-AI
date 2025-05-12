"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import {
  User,
  Calendar,
  Users,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Clock,
  FileText,
  Stethoscope,
  AlertCircle,
  Loader2,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  RefreshCw,
} from "lucide-react";

// Import ReactMarkdown and rehype-highlight at the top of the file
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import generatePdfReport from "../utils/generatePDFreport";

type XrayImage = {
  imagePath: string;
  uploadDate: string;
  result: {
    yoloResultImage: string;
    heatmapResultImage: string;
    disease: string;
    description: string;
    disease_names: string[];
  };
};

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
  xrayImages: XrayImage[];
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

export default function History() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGender, setFilterGender] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("name");
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);

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

  // Add state for analysis modal in the History component
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState("");

  useEffect(() => {
    fetchPatientHistory();
  }, []);

  useEffect(() => {
    // Apply filters and sorting
    let result = [...patients];

    // Apply search
    if (searchTerm) {
      result = result.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply gender filter
    if (filterGender) {
      result = result.filter(
        (patient) => patient.gender.toLowerCase() === filterGender.toLowerCase()
      );
    }

    // Apply sorting
    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "age") {
      result.sort((a, b) => a.age - b.age);
    } else if (sortBy === "recent") {
      result.sort((a, b) => {
        const aLatest =
          a.xrayImages.length > 0
            ? new Date(a.xrayImages[0].uploadDate).getTime()
            : 0;
        const bLatest =
          b.xrayImages.length > 0
            ? new Date(b.xrayImages[0].uploadDate).getTime()
            : 0;
        return bLatest - aLatest;
      });
    }

    setFilteredPatients(result);
  }, [patients, searchTerm, filterGender, sortBy]);

  const fetchPatientHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/api/history/getpatients",
        {
          method: "GET",
          headers: {
            Authorization: `${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.status === 404) {
        throw new Error("No patients found for this user.");
      }

      if (!response.ok) {
        throw new Error("Failed to fetch patient history");
      }

      const data = await response.json();

      // Add data validation and default values
      const validatedPatients = data.patients.map((patient) => ({
        ...patient,
        xrayImages: patient.xrayImages.map((xray) => ({
          ...xray,
          result: xray.result
            ? {
                ...xray.result,
                disease: xray.result.disease || "Unknown disease",
                description:
                  xray.result.description || "No description available",
                disease_names: xray.result.disease_names || [],
              }
            : null,
        })),
      }));

      setPatients(validatedPatients);
    } catch (error) {
      console.error("Error fetching patient history:", error);
      if (error.message === "No patients found for this user.") {
        toast.error(error.message);
      } else {
        toast.error("Failed to load patient history. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const togglePatientExpansion = (patientId: string) => {
    setExpandedPatient(expandedPatient === patientId ? null : patientId);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const toggleFilters = () => {
    setIsFiltersVisible(!isFiltersVisible);
  };

  // Add a function to handle opening the analysis modal
  const openAnalysisModal = (description: string) => {
    setCurrentAnalysis(description);
    setShowAnalysisModal(true);
  };

  // Add a function to generate and download PDF report
  const handleGeneratePdfReport = (patient: Patient, xray: XrayImage) => {
    try {
      // Create a properly formatted result object for the PDF generator
      const formattedResult = {
        ...xray.result,
        // Ensure image paths are absolute URLs
        xrayPath1: xray.imagePath,
        yoloResultPath1: xray.result?.yoloResultImage || "",
        heatmapResultPath1: xray.result?.heatmapResultImage || "",
        // Make sure these fields exist even if they're empty
        disease: xray.result?.disease || "Unknown",
        description: xray.result?.description || "No description available",
        disease_names: xray.result?.disease_names || [],
      };
      generatePdfReport(patient, formattedResult);
      toast.success("PDF report generated successfully!");
    } catch (error) {
      console.error("Error generating PDF report:", error);
      toast.error("Failed to generate PDF report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-gray-600 font-medium">Loading patient records...</p>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <AlertCircle className="h-16 w-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Patient Records Found
          </h2>
          <p className="text-gray-600 mb-6">
            It looks like there are no patient records available at the moment.
          </p>
          <button
            onClick={() => (window.location.href = "/upload")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Upload Your First X-ray
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Patient History
          </h1>
          <p className="text-gray-600">
            View and manage your patients' X-ray records and diagnoses
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={toggleFilters}
            className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200"
          >
            <Filter className="h-5 w-5 mr-2" />
            <span>Filters & Sorting</span>
            {isFiltersVisible ? (
              <ChevronUp className="h-5 w-5 ml-1" />
            ) : (
              <ChevronDown className="h-5 w-5 ml-1" />
            )}
          </button>

          <div className="text-sm text-gray-500">
            {filteredPatients.length}{" "}
            {filteredPatients.length === 1 ? "patient" : "patients"} found
          </div>
        </div>

        <AnimatePresence>
          {isFiltersVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="name">Name (A-Z)</option>
                    <option value="age">Age (Youngest First)</option>
                    <option value="recent">Most Recent X-ray</option>
                  </select>
                </div>

                <div className="flex items-end">
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setFilterGender("");
                      setSortBy("name");
                    }}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No matching patients found
          </h3>
          <p className="text-gray-500">
            Try adjusting your search or filter criteria
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredPatients.map((patient) => (
            <motion.div
              key={patient._id}
              className="bg-white shadow-md rounded-xl overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div
                className={`flex items-center justify-between p-6 cursor-pointer transition-colors duration-200 ${
                  expandedPatient === patient._id
                    ? "bg-blue-50"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => togglePatientExpansion(patient._id)}
              >
                <div className="flex items-center space-x-4">
                  <div
                    className={`rounded-full p-3 ${
                      patient.gender.toLowerCase() === "male"
                        ? "bg-blue-100 text-blue-600"
                        : patient.gender.toLowerCase() === "female"
                        ? "bg-pink-100 text-pink-600"
                        : "bg-purple-100 text-purple-600"
                    }`}
                  >
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800">
                      {patient.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                        {patient.age} years
                      </span>
                      <span className="flex items-center">
                        <Users className="h-4 w-4 mr-1 text-gray-400" />
                        {patient.gender}
                      </span>
                      <span className="flex items-center">
                        <FileText className="h-4 w-4 mr-1 text-gray-400" />
                        {patient.xrayImages.length}{" "}
                        {patient.xrayImages.length === 1 ? "X-ray" : "X-rays"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  {patient.xrayImages.length > 0 && (
                    <span className="text-sm text-gray-500 mr-4 hidden md:block">
                      Last upload:{" "}
                      {new Date(
                        patient.xrayImages[0].uploadDate
                      ).toLocaleDateString()}
                    </span>
                  )}
                  <div
                    className={`rounded-full p-2 transition-colors duration-200 ${
                      expandedPatient === patient._id
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {expandedPatient === patient._id ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </div>
              </div>

              <AnimatePresence>
                {expandedPatient === patient._id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-6 border-t border-gray-100 pt-4">
                      {patient.description && (
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <FileText className="h-4 w-4 mr-2 text-gray-500" />
                            Patient Notes
                          </h4>
                          <p className="text-gray-600 text-sm">
                            {patient.description}
                          </p>
                        </div>
                      )}

                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Stethoscope className="h-5 w-5 mr-2 text-blue-500" />
                        X-ray History
                      </h3>

                      {patient.xrayImages.length > 0 ? (
                        <div className="space-y-8">
                          {patient.xrayImages.map((xray, index) => (
                            <div
                              key={index}
                              className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm"
                            >
                              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-sm font-medium text-gray-700 flex items-center">
                                    <Clock className="h-4 w-4 mr-2 text-gray-500" />
                                    Uploaded on:{" "}
                                    {new Date(xray.uploadDate).toLocaleString()}
                                  </h4>
                                  <div className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {xray.result?.disease || "Unknown disease"}
                                  </div>
                                </div>
                              </div>

                              <div className="p-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                  <div className="space-y-2">
                                    <h5 className="text-sm font-medium text-gray-700">
                                      Original X-ray
                                    </h5>
                                    <div
                                      className="aspect-square bg-black rounded-lg overflow-hidden cursor-pointer"
                                      onClick={() =>
                                        openImageViewer(
                                          xray.imagePath || "/placeholder.svg",
                                          "Original X-ray"
                                        )
                                      }
                                    >
                                      <img
                                        src={
                                          xray.imagePath || "/placeholder.svg"
                                        }
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
                                    <h5 className="text-sm font-medium text-gray-700">
                                      Bounding Boxes
                                    </h5>
                                    <div
                                      className="aspect-square bg-black rounded-lg overflow-hidden cursor-pointer"
                                      onClick={() =>
                                        openImageViewer(
                                          xray.result?.yoloResultImage ||
                                            "/placeholder.svg",
                                          "Bounding Boxes"
                                        )
                                      }
                                    >
                                      <img
                                        src={
                                          xray.result?.yoloResultImage ||
                                          "/placeholder.svg"
                                        }
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
                                    <h5 className="text-sm font-medium text-gray-700">
                                      Heatmap Result
                                    </h5>
                                    <div
                                      className="aspect-square bg-black rounded-lg overflow-hidden cursor-pointer"
                                      onClick={() =>
                                        openImageViewer(
                                          xray.result?.heatmapResultImage ||
                                            "/placeholder.svg",
                                          "Heatmap Result"
                                        )
                                      }
                                    >
                                      <img
                                        src={
                                          xray.result?.heatmapResultImage ||
                                          "/placeholder.svg"
                                        }
                                        alt="Heatmap result"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                          e.currentTarget.src =
                                            "/placeholder.svg?height=400&width=400";
                                        }}
                                      />
                                    </div>
                                  </div>
                                </div>

                                <div className="border-t border-gray-100 pt-4">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                                        Diagnosis
                                      </h5>
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        <p className="text-gray-800 font-medium">
                                          {xray.result?.disease ||
                                            "No diagnosis available"}
                                        </p>
                                      </div>
                                    </div>

                                    <div>
                                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                                        Analysis
                                      </h5>
                                      <div className="bg-gray-50 p-3 rounded-lg">
                                        {xray.result?.disease_names &&
                                          xray.result.disease_names.length >
                                            0 && (
                                            <div className="mb-3">
                                              <h6 className="text-xs font-semibold text-gray-700 mb-1">
                                                Detected Conditions:
                                              </h6>
                                              <div className="flex flex-wrap gap-1">
                                                {xray.result.disease_names.map(
                                                  (disease, idx) => (
                                                    <span
                                                      key={idx}
                                                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                                                    >
                                                      {disease}
                                                    </span>
                                                  )
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        <div className="flex justify-between items-center mt-2">
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openAnalysisModal(
                                                xray.result?.description ||
                                                  "No description available"
                                              );
                                            }}
                                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors flex items-center"
                                          >
                                            <FileText className="h-4 w-4 mr-1" />
                                            View AI Analysis
                                          </button>
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleGeneratePdfReport(
                                                patient,
                                                xray
                                              );
                                            }}
                                            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors flex items-center"
                                          >
                                            <FileText className="h-4 w-4 mr-1" />
                                            Download PDF Report
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-gray-50 rounded-lg p-8 text-center">
                          <AlertCircle className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                          <p className="text-gray-600">
                            No X-ray records available for this patient.
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
      <ImageViewer
        isOpen={imageViewerOpen}
        onClose={() => setImageViewerOpen(false)}
        imageSrc={currentImage}
        title={currentImageTitle}
      />
      {showAnalysisModal && (
        <AnalysisModal
          description={currentAnalysis}
          onClose={() => setShowAnalysisModal(false)}
        />
      )}
    </motion.div>
  );
}

// Add the AnalysisModal component after the ImageViewer component
const AnalysisModal = ({
  description,
  onClose,
}: {
  description: string;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
      <div className="flex justify-between items-center p-4 border-b bg-gradient-to-r from-blue-600 to-blue-800">
        <h3 className="text-lg font-semibold text-white flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          AI Generated Analysis
        </h3>
        <button
          onClick={onClose}
          className="text-white hover:text-blue-200 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="p-6 overflow-y-auto">
        <div className="prose prose-blue max-w-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight]}
            components={{
              h1: ({ node, ...props }) => (
                <h1
                  className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b"
                  {...props}
                />
              ),
              h2: ({ node, ...props }) => (
                <h2
                  className="text-xl font-bold text-gray-800 mt-6 mb-3"
                  {...props}
                />
              ),
              h3: ({ node, ...props }) => (
                <h3
                  className="text-lg font-semibold text-gray-800 mt-5 mb-2"
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p className="text-gray-700 mb-4 leading-relaxed" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-6 mb-4 space-y-1" {...props} />
              ),
              ol: ({ node, ...props }) => (
                <ol className="list-decimal pl-6 mb-4 space-y-1" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-gray-700 mb-1" {...props} />
              ),
              a: ({ node, ...props }) => (
                <a
                  className="text-blue-600 hover:text-blue-800 underline"
                  {...props}
                />
              ),
              blockquote: ({ node, ...props }) => (
                <blockquote
                  className="border-l-4 border-blue-200 pl-4 py-2 my-4 bg-blue-50 rounded-r-md text-gray-700 italic"
                  {...props}
                />
              ),
              code: ({ node, inline, className, children, ...props }) => {
                if (inline) {
                  return (
                    <code
                      className="bg-gray-100 text-blue-700 px-1 py-0.5 rounded text-sm font-mono"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }
                return (
                  <div className="bg-gray-800 rounded-md overflow-hidden my-4">
                    <div className="px-4 py-2 bg-gray-700 text-gray-200 text-xs font-mono">
                      Code
                    </div>
                    <pre className="p-4 overflow-x-auto">
                      <code className={`${className} text-sm`} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              table: ({ node, ...props }) => (
                <div className="overflow-x-auto my-6">
                  <table
                    className="min-w-full divide-y divide-gray-300 border border-gray-300 rounded-md"
                    {...props}
                  />
                </div>
              ),
              thead: ({ node, ...props }) => (
                <thead className="bg-gray-50" {...props} />
              ),
              tbody: ({ node, ...props }) => (
                <tbody className="divide-y divide-gray-200" {...props} />
              ),
              tr: ({ node, ...props }) => (
                <tr className="hover:bg-gray-50" {...props} />
              ),
              th: ({ node, ...props }) => (
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  {...props}
                />
              ),
              td: ({ node, ...props }) => (
                <td className="px-4 py-3 text-sm text-gray-700" {...props} />
              ),
              img: ({ node, ...props }) => (
                <img
                  className="max-w-full h-auto rounded-md my-4 border border-gray-200"
                  {...props}
                />
              ),
              hr: ({ node, ...props }) => (
                <hr className="my-6 border-t border-gray-300" {...props} />
              ),
              strong: ({ node, ...props }) => (
                <strong className="font-bold text-gray-900" {...props} />
              ),
              em: ({ node, ...props }) => (
                <em className="italic text-gray-800" {...props} />
              ),
            }}
          >
            {description}
          </ReactMarkdown>
        </div>
      </div>
      <div className="p-4 border-t bg-gray-50 flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);
