import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import config from "../config.js";

export default function KDSReport() {
  const [filters, setFilters] = useState({
    from: "",
    to: "",
    item: "",
    counter: "",
  });

  const [data, setData] = useState([]);
  const savedConfig = localStorage.getItem("appConfig");
  if (savedConfig) {
    Object.assign(config, JSON.parse(savedConfig));
  }

  // API CALL (MAPS EXACT STORED PROCEDURE COLUMNS)
  const fetchData = async (customFilters = filters) => {
    try {
      const params = new URLSearchParams();

      if (customFilters.from) params.append("from", customFilters.from);
      if (customFilters.to) params.append("to", customFilters.to);
      if (customFilters.item) params.append("item", customFilters.item);
      if (customFilters.counter)
        params.append("department", customFilters.counter);

      const res = await fetch(
        `${config.apiBaseUrl}/api/kds/reports?${params.toString()}`
      );

      const json = await res.json();
      console.log(json);
      
      setData(json?.Data || []);
    } catch (err) {
      console.error("KDS Fetch Error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const exportToExcel = () => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Convert JSON → Excel Sheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "KDS Report");

    // Save File
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const fileData = new Blob([excelBuffer], {
      type: "application/octet-stream",
    });

    saveAs(fileData, "KDS_Report.xls");
  };
  const formatIST = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    return date.toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };
  const formatISTTime = (dateString) => {
  if (!dateString) return "-";

  const date = new Date(dateString);

  return date.toLocaleTimeString("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};


  return (
    <div className="kds-container">
      {/* PAGE HEADER */}
      <div className="header-row">
        <h2>KDS Report</h2>
        <button className="btn-export" onClick={exportToExcel}>
          Export .XLS
        </button>
      </div>

      {/* FILTERS */}
      <div className="filter-card">
        <div className="filter-group">
          <label>From</label>
          <input
            type="datetime-local"
            value={filters.from}
            onChange={(e) => setFilters({ ...filters, from: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>To</label>
          <input
            type="datetime-local"
            value={filters.to}
            onChange={(e) => setFilters({ ...filters, to: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Item</label>
          <input
            type="text"
            placeholder="Search item..."
            value={filters.item}
            onChange={(e) => setFilters({ ...filters, item: e.target.value })}
          />
        </div>

        <div className="filter-group">
          <label>Department</label>
          <select
            value={filters.counter}
            onChange={(e) =>
              setFilters({ ...filters, counter: e.target.value })
            }
          >
            <option value="">All</option>
            <option value="South Indian">South Indian</option>
            <option value="Fast Food">Fast Food</option>
            <option value="Italian">Italian</option>
          </select>
        </div>

        {/* FILTER BUTTONS */}
        <div className="filter-buttons">
          <button className="btn-primary" onClick={() => fetchData()}>
            Search
          </button>
          <button
            className="btn-outline"
            onClick={() => {
              const cleared = { from: "", to: "", item: "", counter: "" };
              setFilters(cleared);
              fetchData(cleared);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* TABLE CARD */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>S.No</th>
              <th>Item Code</th>
              <th>Department</th>
              <th>Item Name</th>
              <th>Bill No</th>
              <th>Bill Date</th>
              <th>Punch</th>
              <th>Ack</th>
              <th>Ready</th>
              <th>Delivered</th>
              <th>Ack TD</th>
              <th>Ready TD</th>
              <th>Del TD</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td>{row.SNo}</td>
                <td>{row.ItemCode}</td>
                <td>{row.Department}</td>
                <td className="item-name">{row.ItemName}</td>
                <td>{row.BillNo}</td>
                <td>{formatIST(row.BillDate)}</td>
                <td>{formatISTTime(row.PunchTime)}</td>
                <td>{formatISTTime(row.AckTime)}</td>
                <td>{formatISTTime(row.ReadyTime)}</td>
                <td>{formatISTTime(row.DelTime)}</td>
                <td>{row.AckTD} min</td>
                <td>{row.ReadyTD} min</td>
                <td>{row.DelTD} min</td>
              </tr>
            ))}

            {data.length === 0 && (
              <tr>
                <td colSpan="11" className="no-data">
                  ⚠ No records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
