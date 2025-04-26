import { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import AdminForm from "./components/AdminForm";
import Codespace from "./components/Codespace";
import Dashboard from "./components/Dashboard";
import EditProfile from "./components/EditProfile";
import Footer from "./components/Footer";
import Home from "./components/Home";
import Login from "./components/Login";
import Navbar from "./components/Navbar";
import Profile from "./components/Profile";
import Project from "./components/Project";
import ProtectedRoute from "./components/ProtectedRoute";
import Signup from "./components/Signup";
import { useAuth } from "./context/AuthContext";
import { AuthProvider } from "./context/AuthContext.js";
import { ToastContainer } from "react-toastify";
import { ThemeProvider } from './components/ThemeProvider';


function App() {
  const [dots, setDots] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const numDots = 30;
    const dotElements = [];

    for (let i = 0; i < numDots; i++) {
      const size = Math.random() * 6 + 4;
      const duration = Math.random() * 10 + 5;
      const top = Math.random() * 100;
      const left = Math.random() * 100;

      dotElements.push(
        <div
          key={i}
          className="dot"
          style={{
            top: `${top}vh`,
            left: `${left}vw`,
            width: `${size}px`,
            height: `${size}px`,
            animationDuration: `${duration}s`,
          }}
        />
      );
    }

    setDots(dotElements);
  }, []);

  return (
    <>
      <div className="background-container">{dots}</div>
      <div className="main-content">
        <ThemeProvider>
          <AuthProvider>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/admin-form" element={<ProtectedRoute><AdminForm /></ProtectedRoute>} />
              <Route path="/project" element={<ProtectedRoute><Project /></ProtectedRoute>} />
              <Route path="/codespace/:projectId" element={<ProtectedRoute><Codespace /></ProtectedRoute>} />
              <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
            </Routes>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </div>
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
    </>
  );
}

export default App;