"use client";

import React from "react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  Building,
  Briefcase,
  CreditCard,
  Phone,
  Clock,
  Edit2,
  Save,
  Camera,
  Shield,
  Award,
  Calendar,
} from "lucide-react";

export default function Profile() {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    password: "",
    instituteName: "",
    designation: "",
    licenseNumber: "",
    phone: "",
    yearsOfExperience: "",
    createdAt: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [error, setError] = useState("");

  const formattedDate = new Date(profile.createdAt).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:5000/api/profile/get", {
        method: "GET",
        headers: {
          Authorization: `${localStorage.getItem("token")}`,
        },
      });
      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const validateProfileUpdate = () => {
    // Reset error
    setError("");

    // Validate name if it's being changed
    if (profile.name && !/^[a-zA-Z\s]+$/.test(profile.name)) {
      setError("Name can only contain letters and spaces");
      return false;
    }

    // Validate email if it's being changed
    if (profile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    // Validate password if it's being changed (only if not empty)
    if (profile.password) {
      const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/;
      if (!passwordRegex.test(profile.password)) {
        setError(
          "Password must contain at least 8 characters, including an uppercase letter, a number, and one of these special characters: !@#$%^&*()"
        );
        return false;
      }
    }

    // Validate phone if it's being changed
    if (profile.phone) {
      // Pakistan phone format
      const phoneRegex = /^(\+92|0)[0-9]{10}$/;
      if (!phoneRegex.test(profile.phone.replace(/\s+/g, ""))) {
        setError("Please enter a valid Pakistani phone number");
        return false;
      }
    }

    // Validate years of experience if it's being changed
    if (profile.yearsOfExperience) {
      const years = parseInt(profile.yearsOfExperience.toString());
      if (isNaN(years) || years < 0 || years > 100) {
        setError("Enter valid years of experience (0-100)");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateProfileUpdate()) {
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("http://localhost:5000/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(profile),
      });
      if (!response.ok) {
        throw new Error("Failed to update profile");
      }
      toast.success("Profile updated successfully!");
      setError("");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white shadow-xl rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-40 flex items-center justify-center relative">
          <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black/30 to-transparent"></div>
          <div className="absolute bottom-0 left-0 w-full px-8 py-4 flex justify-between items-end">
            <h1 className="text-2xl font-bold text-white">User Profile</h1>
            {!isEditing && (
              <button
                type="button"
                className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-md py-2 px-4 inline-flex items-center text-sm font-medium text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                onClick={() => {
                  setError("");
                  setIsEditing(true);
                }}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            )}
          </div>
          {/* <div className="absolute -bottom-16 left-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-white p-1 shadow-lg">
                <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <User className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              {isEditing && (
                <button
                  type="button"
                  className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-2 text-white shadow-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
          </div> */}
        </div>

        <div className="mt-12 px-8 pb-8">
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                className={`${
                  activeTab === "personal"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                onClick={() => {
                  setError("");
                  setActiveTab("personal");
                }}
              >
                Personal Information
              </button>
              <button
                className={`${
                  activeTab === "professional"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                onClick={() => {
                  setError("");
                  setActiveTab("professional");
                }}
              >
                Professional Details
              </button>
              <button
                className={`${
                  activeTab === "security"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
                onClick={() => {
                  setError("");
                  setActiveTab("security");
                }}
              >
                Security
              </button>
            </nav>
          </div>

          {error && (
            <motion.div
              className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md mb-6"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <p className="text-red-500 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === "personal" && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Full Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="John Doe"
                      value={profile.name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="you@example.com"
                      value={profile.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Phone Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="+1 (555) 987-6543"
                      value={profile.phone}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "professional" && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="instituteName"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Institute Name
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="instituteName"
                      id="instituteName"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="Medical Institute"
                      value={profile.instituteName}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="designation"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Designation
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Briefcase className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="designation"
                      id="designation"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="Radiologist"
                      value={profile.designation}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="licenseNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    License Number
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <CreditCard className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="licenseNumber"
                      id="licenseNumber"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="123456789"
                      value={profile.licenseNumber}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="yearsOfExperience"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Years of Experience
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Clock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="yearsOfExperience"
                      id="yearsOfExperience"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="5"
                      value={profile.yearsOfExperience}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="password"
                      name="password"
                      id="password"
                      className={`${
                        isEditing
                          ? "bg-white focus:ring-blue-500 focus:border-blue-500"
                          : "bg-gray-50"
                      } block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 sm:text-sm transition-colors duration-200`}
                      placeholder="••••••••"
                      value={profile.password}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                    />
                  </div>
                  {isEditing && (
                    <p className="mt-2 text-sm text-gray-500">
                      Leave blank to keep your current password.
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2 mt-4">
                  <div className="bg-blue-50 rounded-lg p-4 flex items-start">
                    <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-800">
                        Security Recommendations
                      </h4>
                      <ul className="mt-2 text-sm text-blue-700 space-y-1">
                        <li>• Use a strong, unique password</li>
                        <li>• Regularly update your security information</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {isEditing && (
              <div className="mt-8 flex items-center justify-end space-x-4">
                <button
                  type="button"
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
                  onClick={() => {
                    setError("");
                    setIsEditing(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="bg-blue-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-70"
                >
                  {isSaving ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </form>

          {!isEditing && (
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <Calendar className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Account Created
                    </h3>
                    <p className="text-sm text-gray-500">{formattedDate}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <Award className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Professional Status
                    </h3>
                    <p className="text-sm text-gray-500">
                      {profile.designation}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <div className="flex items-center">
                  <Shield className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Security Level
                    </h3>
                    <p className="text-sm text-gray-500">Standard Protection</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
