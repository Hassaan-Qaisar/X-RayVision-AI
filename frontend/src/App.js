import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import SignUp from "./pages/SignUp.tsx";
import History from "./pages/History.tsx";
import Upload from "./pages/Upload.tsx";
import Profile from "./pages/Profile.tsx";

function App() {
  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<SignUp />} />
          <Route path="profile" element={<Profile />} />
          <Route path="upload" element={<Upload />} />
          <Route path="history" element={<History />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
