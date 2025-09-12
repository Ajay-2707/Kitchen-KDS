/* eslint-disable jsx-a11y/alt-text */
import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import KitchenScreen from "./Components/KitchenScreen";
import config from "./config";
import ConfigModal from "./configModal";
import ConfiguratorPage from "./ConfiguratorPage";
import Dashboard from "./Components/Dashboard";
import { MdMoreVert } from "react-icons/md";

function AppContent() {
  const [time, setTime] = useState(new Date());
  const [isModalOpen, setModalOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuModalOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="app-container">
      <nav className="nav-header">
        <p>Powered by Synoweb &nbsp;|&nbsp; {config.version}</p>
        <h2 className="kitchen-title">Kitchen Display System</h2>
        <div style={{ position: "relative" }}>
          <p>
            {time.toLocaleTimeString()}{" "}
            <button
              onClick={() => setMenuModalOpen(!menuModalOpen)}
              style={{
                backgroundColor: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <MdMoreVert size={20} color="white" />
            </button>
          </p>

          {menuModalOpen && (
            <div className="menu-dropdown" ref={menuRef}>
              <ul>
                <li
                  onClick={() => {
                    setModalOpen(true);
                    setMenuModalOpen(false);
                  }}
                >
                  Configuration
                </li>
                <li
                  onClick={() => {
                    navigate("/dashboard");
                    setMenuModalOpen(false);
                  }}
                >
                  Dashboard
                </li>
              </ul>
            </div>
          )}
        </div>

        <ConfigModal
          isOpen={isModalOpen}
          onClose={() => setModalOpen(false)}
        />
      </nav>
      <Routes>
        <Route path="/configurator" element={<ConfiguratorPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/" element={<KitchenScreen />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
