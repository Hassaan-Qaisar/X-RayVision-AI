import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { User, Calendar, Users, ChevronDown, ChevronUp } from "lucide-react";

type XrayImage = {
  imagePath: string;
  uploadDate: string;
  result: {
    yoloResultImage: string;
    heatmapResultImage: string;
    disease: string;
    description: string;
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

export default function History() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);

  useEffect(() => {
    fetchPatientHistory();
  }, []);

  const fetchPatientHistory = async () => {
    try {
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
      console.log("Response data:", data); // Debug log

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
              }
            : null,
        })),
      }));

      setPatients(validatedPatients);

      // Debug: Check if we have disease and description data
      if (
        validatedPatients.length > 0 &&
        validatedPatients[0].xrayImages.length > 0 &&
        validatedPatients[0].xrayImages[0].result
      ) {
        console.log(
          "Sample disease:",
          validatedPatients[0].xrayImages[0].result.disease
        );
        console.log(
          "Sample description:",
          validatedPatients[0].xrayImages[0].result.description
        );
      }
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          No Patient Records Found
        </h2>
        <p className="text-gray-600">
          It looks like there are no patient records available at the moment.
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Patient History</h1>
      <div className="space-y-6">
        {patients.map((patient) => (
          <div
            key={patient._id}
            className="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <div
              className="flex items-center justify-between p-6 cursor-pointer"
              onClick={() => togglePatientExpansion(patient._id)}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-500 rounded-full p-3">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    {patient.name}
                  </h2>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {patient.age} years
                    </span>
                    <span className="flex items-center">
                      <Users className="h-4 w-4 mr-1" />
                      {patient.gender}
                    </span>
                  </div>
                </div>
              </div>
              {expandedPatient === patient._id ? (
                <ChevronUp className="h-6 w-6 text-gray-600" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-600" />
              )}
            </div>
            {expandedPatient === patient._id && (
              <div className="px-6 pb-6">
                <p className="text-gray-700 mb-4">{patient.description}</p>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  X-ray History
                </h3>
                {patient.xrayImages.length > 0 ? (
                  <div className="space-y-6">
                    {patient.xrayImages.map((xray, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex flex-wrap -mx-2">
                          <div className="w-full md:w-1/3 px-2 mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">
                              Original X-ray
                            </h4>
                            <img
                              src={xray.imagePath}
                              alt="Original X-ray"
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-2 mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">
                              YOLO Detection
                            </h4>
                            <img
                              src={xray.result?.yoloResultImage}
                              alt="YOLO detection result"
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-2 mb-4">
                            <h4 className="text-md font-semibold text-gray-700 mb-2">
                              Heatmap Result
                            </h4>
                            <img
                              src={xray.result?.heatmapResultImage}
                              alt="Heatmap result"
                              className="w-full h-64 object-cover rounded-lg"
                            />
                          </div>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-md font-semibold text-gray-700 mb-2">
                            Diagnosis
                          </h4>
                          <p className="text-gray-600">
                            {xray.result?.disease || "No diagnosis available"}
                          </p>
                        </div>
                        <div className="mt-4">
                          <h4 className="text-md font-semibold text-gray-700 mb-2">
                            Description
                          </h4>
                          <p className="text-gray-600">
                            {xray.result?.description ||
                              "No description available"}
                          </p>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                          Uploaded on:{" "}
                          {new Date(xray.uploadDate).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    No X-ray records available for this patient.
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
