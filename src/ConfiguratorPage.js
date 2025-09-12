// ConfiguratorPage.jsx
import React, { useEffect, useState } from "react";
import config from "./config";
import { useNavigate } from "react-router-dom";

function ConfiguratorPage() {
    const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
    apiBaseUrl: config.apiBaseUrl,
    kdsName: config.kdsName,
    kdsType: config.kdsType,
    DeliveredItemTime: config.DeliveredItemTime,
    version: config.version,
  });

  useEffect(() => {
    const savedConfig = localStorage.getItem("appConfig");
    if (savedConfig) {
      setFormData(JSON.parse(savedConfig));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    localStorage.setItem("appConfig", JSON.stringify(formData));
    alert("Configuration saved successfully!");
     navigate("/");
  };


  const handleReset = () => {
    localStorage.removeItem("appConfig");
    setFormData(config);
    alert("Configuration reset to default.");
  };

  return (
    <div style={containerStyle}>
      <h1 style={titleStyle}>Configuration Settings</h1>
      <form style={formStyle} onSubmit={(e) => e.preventDefault()}>
        {Object.keys(formData).map((key) => (
          <div key={key} style={fieldStyle}>
            <label style={labelStyle}>{key}</label>
            <input
              type="text"
              name={key}
              value={formData[key]}
              onChange={handleChange}
              style={inputStyle}
            />
          </div>
        ))}
        <div style={buttonGroupStyle}>
          <button type="button" onClick={handleSave} style={saveButtonStyle}>
            Save
          </button>
          <button type="button" onClick={handleReset} style={resetButtonStyle}>
            Reset to Default
          </button>
        </div>
      </form>
    </div>
  );
}

const containerStyle = {
  maxWidth: "450px",
  margin: "40px auto",
  padding: "25px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
  fontFamily: "Arial, sans-serif",
};

const titleStyle = {
  textAlign: "center",
  marginBottom: "20px",
  color: "#222",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
};

const labelStyle = {
  marginBottom: "5px",
  fontWeight: "bold",
  color: "#444",
};

const inputStyle = {
  padding: "10px",
  borderRadius: "8px",
  border: "1px solid #ccc",
  fontSize: "0.95rem",
};

const buttonGroupStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "15px",
};

const saveButtonStyle = {
  padding: "10px 15px",
  background: "#4CAF50",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

const resetButtonStyle = {
  padding: "10px 15px",
  background: "#f44336",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
};

export default ConfiguratorPage;
