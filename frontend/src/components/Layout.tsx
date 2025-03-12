import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Stethoscope,
  Home,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { toast } from "react-toastify";

export default function Layout() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "light",
    });
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Stethoscope className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  X-RayVision
                </span>
              </Link>
            </div>

            {/* Desktop menu */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              >
                <Home className="inline-block mr-1" size={18} />
                Home
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:bg-red-50 hover:text-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                >
                  <LogOut className="inline-block mr-1" size={18} />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                  >
                    <LogIn className="inline-block mr-1" size={18} />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 shadow-sm"
                  >
                    <UserPlus className="inline-block mr-1" size={18} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                {mobileMenuOpen ? (
                  <X className="block h-6 w-6" aria-hidden="true" />
                ) : (
                  <Menu className="block h-6 w-6" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link
                to="/"
                className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Home className="inline-block mr-2" size={18} />
                Home
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-gray-700 hover:bg-red-50 hover:text-red-600 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
                >
                  <LogOut className="inline-block mr-2" size={18} />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LogIn className="inline-block mr-2" size={18} />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-gray-700 hover:bg-blue-50 hover:text-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <UserPlus className="inline-block mr-2" size={18} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Stethoscope className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold text-white">
                  X-RayVision
                </span>
              </div>
              <p className="text-gray-300 mb-4">
                Enhancing chest disease detection with Deep Learning and
                Explainable AI
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-300 hover:text-white transition-colors duration-200"
                >
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-300">
                Quick Links
              </h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/upload"
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Upload X-ray
                  </Link>
                </li>
                <li>
                  <Link
                    to="/history"
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
                    History
                  </Link>
                </li>
                <li>
                  <Link
                    to="/profile"
                    className="text-gray-300 hover:text-white transition-colors duration-200 flex items-center"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Profile
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-300">
                Contact Us
              </h3>
              <div className="space-y-3">
                <p className="text-gray-300 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    ></path>
                  </svg>
                  hassaanqaisar2@gmail.com
                </p>
                <p className="text-gray-300 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                  +92 314 9875336
                </p>
                <p className="text-gray-300 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  Lahore, Pakistan
                </p>
              </div>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-gray-700 text-center text-sm text-gray-400">
            © {new Date().getFullYear()} X-RayVision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
