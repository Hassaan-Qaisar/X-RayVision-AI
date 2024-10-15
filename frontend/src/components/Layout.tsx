import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Stethoscope, Home, LogIn, UserPlus, LogOut } from "lucide-react";
import { toast } from "react-toastify";

export default function Layout() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

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
    <div className="min-h-screen flex flex-col bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex-shrink-0 flex items-center">
                <Stethoscope className="h-8 w-8 text-blue-500" />
                <span className="ml-2 text-xl font-bold text-gray-800">
                  X-RayVision
                </span>
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                to="/"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home className="inline-block mr-1" size={18} />
                Home
              </Link>
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="inline-block mr-1" size={18} />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <LogIn className="inline-block mr-1" size={18} />
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    <UserPlus className="inline-block mr-1" size={18} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow">
        <Outlet />
      </main>
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-between">
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">X-RayVision</h3>
              <p className="text-sm">
                Enhancing chest disease detection with Deep Learning and
                Explainable AI
              </p>
            </div>
            <div className="w-full md:w-1/3 mb-6 md:mb-0">
              <h3 className="text-lg font-semibold mb-2">Quick Links</h3>
              <ul className="text-sm">
                <li>
                  <Link to="/" className="hover:text-blue-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/login" className="hover:text-blue-300">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" className="hover:text-blue-300">
                    Sign Up
                  </Link>
                </li>
              </ul>
            </div>
            <div className="w-full md:w-1/3">
              <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
              <p className="text-sm">Email: hassaanqaisar2@gmail.com</p>
              <p className="text-sm">Phone: +92 314 9875336</p>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            © 2024 X-RayVision. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
