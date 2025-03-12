import React from "react";
import { motion } from "framer-motion";
import {
  Upload,
  Search,
  BarChart,
  History,
  Shield,
  Users,
  Clock,
  UserCircle,
  CheckCircle,
  Zap,
  Brain,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="block">Advanced Chest X-ray</span>
              <span className="block text-blue-600">Analysis Platform</span>
            </motion.h1>
            <motion.p
              className="mt-6 max-w-lg mx-auto text-xl text-gray-500"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Empowering healthcare professionals with AI-powered chest disease
              detection
            </motion.p>
            {!isLoggedIn && (
              <motion.div
                className="mt-10 flex justify-center gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <button
                  onClick={() => navigate("/login")}
                  className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 shadow-md transition-all duration-200"
                >
                  Get Started
                </button>
                <button
                  onClick={() => navigate("/signup")}
                  className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 shadow-sm transition-all duration-200"
                >
                  Learn More
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 hidden lg:block">
          <svg width="404" height="384" fill="none" viewBox="0 0 404 384">
            <defs>
              <pattern
                id="de316486-4a29-4312-bdfc-fbce2132a2c1"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  className="text-blue-100"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width="404"
              height="384"
              fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c1)"
            />
          </svg>
        </div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 hidden lg:block">
          <svg width="404" height="384" fill="none" viewBox="0 0 404 384">
            <defs>
              <pattern
                id="de316486-4a29-4312-bdfc-fbce2132a2c2"
                x="0"
                y="0"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <rect
                  x="0"
                  y="0"
                  width="4"
                  height="4"
                  className="text-gray-200"
                  fill="currentColor"
                />
              </pattern>
            </defs>
            <rect
              width="404"
              height="384"
              fill="url(#de316486-4a29-4312-bdfc-fbce2132a2c2)"
            />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Key Features</h2>
          <p className="mt-4 text-xl text-gray-600">
            Access powerful tools to streamline your workflow
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/upload")}
          >
            <div className="p-1 bg-gradient-to-r from-blue-500 to-blue-600"></div>
            <div className="p-8">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 text-blue-600 mb-6 mx-auto">
                <Upload className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Upload X-ray
              </h3>
              <p className="text-gray-600 text-center">
                Upload chest X-ray images for instant AI-powered analysis and
                diagnosis
              </p>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center text-blue-600 font-medium">
                  Get started
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/history")}
          >
            <div className="p-1 bg-gradient-to-r from-green-500 to-green-600"></div>
            <div className="p-8">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-green-100 text-green-600 mb-6 mx-auto">
                <History className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                History
              </h3>
              <p className="text-gray-600 text-center">
                Access and review your patients' past X-ray uploads and analysis
                results
              </p>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center text-green-600 font-medium">
                  View history
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            whileHover={{ y: -8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/profile")}
          >
            <div className="p-1 bg-gradient-to-r from-purple-500 to-purple-600"></div>
            <div className="p-8">
              <div className="flex items-center justify-center h-14 w-14 rounded-full bg-purple-100 text-purple-600 mb-6 mx-auto">
                <UserCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-semibold text-center mb-3">
                Profile
              </h3>
              <p className="text-gray-600 text-center">
                Manage your account settings and update your professional
                information
              </p>
              <div className="mt-6 text-center">
                <span className="inline-flex items-center text-purple-600 font-medium">
                  Manage profile
                  <svg
                    className="ml-1 w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    ></path>
                  </svg>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2
              className="text-3xl font-extrabold text-gray-900 sm:text-4xl"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Why Choose X-RayVision?
            </motion.h2>
            <motion.p
              className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Our advanced AI-powered platform offers unparalleled accuracy and
              efficiency in chest X-ray analysis.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <motion.div
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white mb-5">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Advanced AI Technology
              </h3>
              <p className="text-gray-600">
                Our deep learning models provide highly accurate disease
                detection and classification, trained on extensive medical
                datasets.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    State-of-the-art neural networks for accurate disease
                    detection
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Continuous model improvements
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white mb-5">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Time-Saving Efficiency
              </h3>
              <p className="text-gray-600">
                Get instant results, allowing for quicker decision-making and
                treatment planning for your patients.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Rapid analysis in seconds
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Streamlined patient management
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-gradient-to-r from-blue-600 to-blue-700 text-white mb-5">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                User-Friendly Interface
              </h3>
              <p className="text-gray-600">
                Intuitive interface designed for healthcare professionals of all
                experience levels.
              </p>
              <ul className="mt-4 space-y-2">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Clean, modern design
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-600">
                    Minimal learning curve
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-blue-600 text-4xl font-bold mb-2">99%</div>
            <div className="text-gray-700 font-medium">Accuracy Rate</div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-blue-600 text-4xl font-bold mb-2">10+</div>
            <div className="text-gray-700 font-medium">
              Detectable Conditions
            </div>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-md">
            <div className="text-blue-600 text-4xl font-bold mb-2">&lt;5s</div>
            <div className="text-gray-700 font-medium">Analysis Time</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-6">
            Ready to transform your diagnostic workflow?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of healthcare professionals already using X-RayVision
          </p>
          <button
            onClick={() => navigate(isLoggedIn ? "/upload" : "/signup")}
            className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 shadow-lg transition-all duration-200"
          >
            {isLoggedIn ? "Upload X-ray Now" : "Get Started for Free"}
            <Zap className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
