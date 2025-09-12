import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function ConfigModal({ isOpen, onClose }) {
  const [id, setId] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const STATIC_ID = "admin";
  const STATIC_PASSWORD = "12345";

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (id === STATIC_ID && password === STATIC_PASSWORD) {
      setError("");
      setId("");
      setPassword("");
      onClose();
      navigate("/configurator");
    } else {
      setError("Invalid ID or Password");
    }
  };

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h2 style={titleStyle}>Configuration Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={fieldStyle}>
            <label style={labelStyle}>ID</label>
            <input
              type="text"
              value={id}
              onChange={(e) => setId(e.target.value)}
              required
              style={inputStyle}
              placeholder="Enter your ID"
            />
          </div>
          <div style={fieldStyle}>
            <label style={labelStyle}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={inputStyle}
              placeholder="Enter your password"
            />
          </div>
          {error && <p style={errorStyle}>{error}</p>}
          <div style={buttonGroupStyle}>
            <button type="submit" style={{ ...buttonStyle, backgroundColor: "#4CAF50" }}>
              Submit
            </button>
            <button type="button" onClick={onClose} style={{ ...buttonStyle, backgroundColor: "#f44336" }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.6)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 9999,
  backdropFilter: "blur(3px)",
};

const modalStyle = {
  background: "#fff",
  padding: "25px",
  borderRadius: "12px",
  width: "320px",
  boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  fontFamily: "Arial, sans-serif",
};

const titleStyle = {
  margin: "0 0 15px 0",
  fontSize: "1.2rem",
  color: "#333",
  textAlign: "center",
};

const fieldStyle = {
  marginBottom: "15px",
};

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontSize: "0.9rem",
  color: "#555",
};

const inputStyle = {
  width: "100%",
  padding: "10px",
  border: "1px solid #ccc",
  borderRadius: "8px",
  fontSize: "0.95rem",
  outline: "none",
};

const errorStyle = {
  color: "red",
  fontSize: "0.85rem",
  margin: "5px 0 10px",
  textAlign: "center",
};

const buttonGroupStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "10px",
};

const buttonStyle = {
  flex: 1,
  margin: "0 5px",
  padding: "10px 15px",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontSize: "0.95rem",
  transition: "background 0.3s ease",
};

export default ConfigModal;
