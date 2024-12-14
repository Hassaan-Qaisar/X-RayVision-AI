import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
} from "lucide-react";

type Patient = {
  _id: string;
  name: string;
  age: number;
  gender: string;
  description: string;
};

type AnalysisResult = {
  xrayPath1: string;
  resultImagePath1: string;
  disease: string;
  description: string;
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
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPatientList();
  }, []);

  const fetchPatientList = async () => {
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
      setXrayFile(e.target.files[0]);
    }
  };

  const handleCreatePatient = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/upload/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(patientDetails),
      });
      if (!response.ok) {
        throw new Error("Failed to create patient");
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
      toast.error("Failed to create patient. Please try again.");
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
        throw new Error("Failed to analyze X-ray");
      }

      const result = await response.json();
      setAnalysisResult(result.result);
      setStep(3);
    } catch (error) {
      console.error("Error analyzing X-ray:", error);
      toast.error("Failed to analyze X-ray. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  console.log(analysisResult);

  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md ${
            isNewPatient
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setIsNewPatient(true)}
        >
          New Patient
        </button>
        <button
          type="button"
          className={`flex-1 py-2 px-4 rounded-md ${
            !isNewPatient
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setIsNewPatient(false)}
        >
          Existing Patient
        </button>
      </div>
      {isNewPatient ? (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                name="name"
                id="name"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                placeholder="John Doe"
                value={patientDetails.name}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>
          <div>
            <label
              htmlFor="age"
              className="block text-sm font-medium text-gray-700"
            >
              Age
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="number"
                name="age"
                id="age"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
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
              Gender
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="gender"
                id="gender"
                className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
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
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <div className="mt-1">
              <textarea
                id="description"
                name="description"
                rows={3}
                className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border-gray-300 rounded-md"
                placeholder="Patient's medical history or symptoms"
                value={patientDetails.description}
                onChange={handleInputChange}
              ></textarea>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <label
            htmlFor="existingPatient"
            className="block text-sm font-medium text-gray-700"
          >
            Select Patient
          </label>
          <select
            id="existingPatient"
            name="existingPatient"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={selectedPatient?._id || ""}
            onChange={(e) => {
              const selectedId = e.target.value;
              const patient = patientList.find((p) => p._id === selectedId);
              setSelectedPatient(patient || null);
            }}
            required
          >
            <option value="">Select a patient</option>
            {patientList.map((patient) => (
              <option key={patient._id} value={patient._id}>
                {patient.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="xrayUpload"
          className="block text-sm font-medium text-gray-700"
        >
          Upload X-ray Image
        </label>
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
          <div className="space-y-1 text-center">
            <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="xrayUpload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Upload a file</span>
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
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
          </div>
        </div>
      </div>
      {xrayFile && (
        <p className="text-sm text-gray-600">Selected file: {xrayFile.name}</p>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Analysis Results</h2>
      {analysisResult && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Original X-ray
              </h3>
              <img
                src={analysisResult.xrayPath1}
                alt="Original X-ray"
                className="mt-2 w-full h-auto object-contain rounded-lg"
              />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Analysis Result
              </h3>
              <img
                src={analysisResult.resultImagePath1}
                alt="X-ray analysis result"
                className="mt-2 w-full h-auto object-contain rounded-lg"
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Diagnosis</h3>
            <p className="mt-1 text-sm text-gray-600">
              {analysisResult.disease}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">Description</h3>
            <p className="mt-1 text-sm text-gray-600">
              {analysisResult.description}
            </p>
          </div>
        </>
      )}
      <button
        type="button"
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        onClick={() => {
          setStep(1);
          setXrayFile(null);
          setAnalysisResult(null);
          setSelectedPatient(null);
          setPatientDetails({
            name: "",
            age: "",
            gender: "",
            description: "",
          });
        }}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Start New Analysis
      </button>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white shadow-xl rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Upload and Analyze X-ray
          </h1>
          <div className="mb-8">
            <div className="flex items-center">
              {[1, 2, 3].map((stepNumber) => (
                <React.Fragment key={stepNumber}>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full ${
                      step >= stepNumber
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`flex-1 h-1 ${
                        step > stepNumber ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs font-medium text-gray-500">
                Patient Details
              </span>
              <span className="text-xs font-medium text-gray-500">
                Upload X-ray
              </span>
              <span className="text-xs font-medium text-gray-500">Results</span>
            </div>
          </div>
          <form onSubmit={handleSubmit}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            <div className="mt-8 flex justify-between">
              {step > 1 && step < 3 && (
                <button
                  type="button"
                  onClick={() => setStep(step - 1)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Previous
                </button>
              )}
              {step < 2 && (
                <button
                  type="submit"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next
                  <ChevronRight className="ml-2 h-4 w-4" />
                </button>
              )}
              {step === 2 && (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="animate-spin mr-2 h-4 w-4" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      Analyze X-ray
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </motion.div>
  );
}
