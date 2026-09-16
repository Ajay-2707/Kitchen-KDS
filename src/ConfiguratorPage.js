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
    printMode: config.printMode,
    version: config.version,
  });


  // =====================================================
  // LOAD SAVED CONFIG
  // =====================================================

  useEffect(() => {

    const savedConfig =
      localStorage.getItem("appConfig");

    if (savedConfig) {

      try {

        const parsedConfig =
          JSON.parse(savedConfig);

        setFormData({
          ...config,
          ...parsedConfig,
        });

      } catch (error) {

        console.error(
          "Invalid saved configuration:",
          error
        );

      }
    }

  }, []);


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {

    const {
      name,
      value
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };


  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = () => {

    localStorage.setItem(
      "appConfig",
      JSON.stringify(formData)
    );

    alert(
      "Configuration saved successfully!"
    );

    /*
     * Go back to KDS
     */

    navigate("/");
  };


  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {

    localStorage.removeItem(
      "appConfig"
    );

    setFormData({
      apiBaseUrl: config.apiBaseUrl,
      kdsName: config.kdsName,
      kdsType: config.kdsType,
      DeliveredItemTime: config.DeliveredItemTime,
      printMode: config.printMode,
      version: config.version,
    });

    alert(
      "Configuration reset to default."
    );
  };


  return (
    <div style={containerStyle}>

      <h1 style={titleStyle}>
        Configuration Settings
      </h1>


      <form
        style={formStyle}
        onSubmit={(e) =>
          e.preventDefault()
        }
      >

        {/* ============================================
            API URL
        ============================================ */}

        <div style={fieldStyle}>

          <label style={labelStyle}>
            API Base URL
          </label>

          <input
            type="text"
            name="apiBaseUrl"
            value={formData.apiBaseUrl}
            onChange={handleChange}
            style={inputStyle}
          />

        </div>


        {/* ============================================
            KDS NAME
        ============================================ */}

        <div style={fieldStyle}>

          <label style={labelStyle}>
            KDS Name
          </label>

          <input
            type="text"
            name="kdsName"
            value={formData.kdsName}
            onChange={handleChange}
            style={inputStyle}
          />

        </div>


        {/* ============================================
            KDS TYPE
        ============================================ */}

        <div style={fieldStyle}>

          <label style={labelStyle}>
            KDS Type
          </label>

          <input
            type="text"
            name="kdsType"
            value={formData.kdsType}
            onChange={handleChange}
            style={inputStyle}
          />

        </div>


        {/* ============================================
            DELIVERED ITEM TIME
        ============================================ */}

        {/* <div style={fieldStyle}>

          <label style={labelStyle}>
            Delivered Item Time
          </label>

          <input
            type="text"
            name="DeliveredItemTime"
            value={
              formData.DeliveredItemTime
            }
            onChange={handleChange}
            style={inputStyle}
          />

        </div> */}


        {/* ============================================
            PRINT MODE
        ============================================ */}

        <div style={fieldStyle}>

          <label style={labelStyle}>
            Print Mode
          </label>

          <select
            name="printMode"
            value={
              formData.printMode || "USB"
            }
            onChange={handleChange}
            style={inputStyle}
          >

            <option value="USB">
              USB Printer
            </option>

            <option value="LAN">
              LAN Printer
            </option>

          </select>

        </div>


        {/* ============================================
            VERSION
        ============================================ */}

        <div style={fieldStyle}>

          <label style={labelStyle}>
            Version
          </label>

          <input
            type="text"
            name="version"
            value={formData.version}
            onChange={handleChange}
            style={inputStyle}
          />

        </div>


        {/* ============================================
            BUTTONS
        ============================================ */}

        <div style={buttonGroupStyle}>

          <button
            type="button"
            onClick={handleSave}
            style={saveButtonStyle}
          >
            Save
          </button>


          <button
            type="button"
            onClick={handleReset}
            style={resetButtonStyle}
          >
            Reset to Default
          </button>

        </div>

      </form>

    </div>
  );
}


// =====================================================
// STYLES
// =====================================================

const containerStyle = {
  maxWidth: "450px",
  margin: "40px auto",
  padding: "25px",
  background: "#fff",
  borderRadius: "12px",
  boxShadow:
    "0 8px 20px rgba(0,0,0,0.15)",
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
  background: "#fff",
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