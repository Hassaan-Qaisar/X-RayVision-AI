import React, { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [designation, setDesignation] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name || !email || !password || !instituteName) {
      setError("Please fill in all fields");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()]).{8,}$/.test(password)) {
      setError(
        "Password must contain at least 8 characters, including an uppercase letter, a number, and a special character"
      );
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          instituteName,
          designation,
          licenseNumber,
          phone,
          yearsOfExperience: yearsOfExperience
            ? parseInt(yearsOfExperience)
            : undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.token);
        toast.success("Signed up successfully!", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
        navigate("/");
      } else {
        setError(data.message || "Sign up failed");
        toast.error(data.message || "Sign up failed", {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      toast.error("An error occurred. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <UserPlus className="mx-auto h-12 w-auto text-blue-500" />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-center">{error}</div>}
          <div className="rounded-md shadow-sm space-y-4">
            {/* Input fields for each attribute */}
            <input
              id="name"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              id="email"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              id="institute-name"
              type="text"
              placeholder="Institute Name"
              value={instituteName}
              onChange={(e) => setInstituteName(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              id="designation"
              type="text"
              placeholder="Designation (Optional)"
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              id="license-number"
              type="text"
              placeholder="License Number (Optional)"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              id="phone"
              type="text"
              placeholder="Phone Number (Optional)"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <input
              id="years-of-experience"
              type="number"
              placeholder="Years of Experience (Optional)"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign up
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
