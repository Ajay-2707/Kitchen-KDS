/* eslint-disable jsx-a11y/alt-text */
import "./App.css";
import React, { useState, useEffect, useRef } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
  useLocation,
} from "react-router-dom";

import KitchenScreen from "./Components/KitchenScreen";
import DeliveryScreen from "./Components/DeliveryScreen";
import CDScreen from "./Components/CDScreen";
import config from "./config";
import ConfigModal from "./configModal";
import ConfiguratorPage from "./ConfiguratorPage";
import Dashboard from "./Components/Dashboard";
import { MdMoreVert } from "react-icons/md";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const isCDS = location.pathname === "/cds";
  const isDel = location.pathname === "/delivery";
  const currentPath = location.pathname.toLowerCase();

  const [time, setTime] = useState(new Date());
  const [isModalOpen, setModalOpen] = useState(false);
  const [menuModalOpen, setMenuModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const menuRef = useRef(null);

  // ⏱ Live clock
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ❌ Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuModalOpen(false);
      }
    };

    document.addEventListener("pointerdown", handleClickOutside);
    return () =>
      document.removeEventListener("pointerdown", handleClickOutside);
  }, []);

  // 🧠 Dynamic Heading (robust)
  const routeTitles = {
    "/": "Kitchen Display System",
    "/report": "Reports Dashboard",
    "/configurator": "Configuration Panel",
    "/delivery": "KDS - Delivery",
    "/cds": "ORDER READY FOR PICKUP ",
  };

  const cleanPath = location.pathname.toLowerCase().replace(/\/$/, "");
  const heading = routeTitles[cleanPath] || "Kitchen Display System";

  const navStyle = {
    height: isCDS ? "80px" : "40px",
    padding: isCDS ? "10px 20px" : "5px 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  return (
    <div className="app-container">
      <nav className="nav-header" style={navStyle}>
        {isCDS ? (
          <p style={{ display: "flex", alignItems: "center" }}>
            <img
              src="/brijwasi-logo.png"
              alt="logo"
              style={{
                height: "80px",
                objectFit: "contain",
              }}
            />
          </p>
        ) : isDel ? (
          <p>&nbsp; Powered by Synoweb &nbsp;|&nbsp; {config.version}</p>
        ) : (
          <p>
            {config.kdsName} &nbsp;|&nbsp; Powered by Synoweb &nbsp;|&nbsp;{" "}
            {config.version}
          </p>
        )}

        {/* ✅ Dynamic Heading */}
        <h2 className="kitchen-title">{heading}</h2>

        <div style={{ position: "relative" }}>
          <p>
            {time.toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: true,
            })}{" "}
            <button
              aria-label="Open menu"
              onClick={() => setMenuModalOpen((prev) => !prev)}
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

                {/* Hide CDS if already on CDS */}
                {currentPath !== "/cds" && (
                  <li onClick={() => window.open("/cds", "_blank")}>CDS</li>
                )}

                {/* Hide Delivery if already on Delivery */}
                {currentPath !== "/delivery" && (
                  <li onClick={() => window.open("/delivery", "_blank")}>
                    KDS Delivery
                  </li>
                )}

                {/* Hide Kitchen if already on / */}
                {currentPath !== "/" && (
                  <li onClick={() => window.open("/", "_blank")}>
                    KDS Kitchen
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <ConfigModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} />
      </nav>

      <Routes>
        <Route path="/configurator" element={<ConfiguratorPage />} />

        <Route path="/report" element={<Dashboard />} />

        <Route
          path="/"
          element={
            <KitchenScreen
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          }
        />

        {/* ✅ FIXED ROUTE */}
        <Route
          path="/delivery"
          element={
            <DeliveryScreen
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          }
        />
        <Route
          path="/cds"
          element={
            <CDScreen
              showFilters={showFilters}
              setShowFilters={setShowFilters}
            />
          }
        />
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
