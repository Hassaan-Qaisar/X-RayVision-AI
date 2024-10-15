import React from "react";
import { motion } from "framer-motion";
import { Upload, Search, BarChart, Shield, Users, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <motion.h1
        className="text-4xl font-bold text-center text-gray-900 mb-12"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to X-RayVision
      </motion.h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
        <motion.div
          className="bg-white p-6 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-center mb-2">
            Upload X-ray
          </h2>
          <p className="text-gray-600 text-center">
            Upload chest X-ray images for analysis
          </p>
        </motion.div>
        <motion.div
          className="bg-white p-6 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Search className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-center mb-2">Analyze</h2>
          <p className="text-gray-600 text-center">
            Get instant analysis of chest diseases
          </p>
        </motion.div>
        <motion.div
          className="bg-white p-6 rounded-lg shadow-md"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <BarChart className="h-12 w-12 text-purple-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-center mb-2">Visualize</h2>
          <p className="text-gray-600 text-center">
            View detailed visual interpretations
          </p>
        </motion.div>
      </div>
      <div className="bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Why Choose X-RayVision?
          </h2>
          <p className="mt-4 text-lg text-gray-500">
            Our advanced AI-powered platform offers unparalleled accuracy and
            efficiency in chest X-ray analysis.
          </p>
        </div>
        <div className="mt-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
                Accurate Diagnosis
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Our deep learning models provide highly accurate disease
                detection and classification.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
                Time-Saving
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Get instant results, allowing for quicker decision-making and
                treatment planning.
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-lg leading-6 font-medium text-gray-900">
                User-Friendly
              </h3>
              <p className="mt-2 text-base text-gray-500">
                Intuitive interface designed for healthcare professionals of all
                experience levels.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
