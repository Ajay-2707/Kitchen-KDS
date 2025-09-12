import React, { useState, useEffect } from "react";
import "../styles/dashboard.css";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

function Dashboard() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [itemType, setItemType] = useState("all");

  const [data, setData] = useState([]);
  const [runningItems, setRunningItems] = useState([]);
  const [PendingItemsforkds, setPendingItemsforkds] = useState([]);
  const [PendingItemsforkdsDel, SetPendingItemsforkdsDel] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Track which report to show
  const [selectedReport, setSelectedReport] = useState("dashboard");

  // Generate chart data dynamically
  const chartData = {
    pendingKds: PendingItemsforkds.map((item) => ({
      name: item.I_Name || "Item",
      value: 1, // each item counts as 1
    })),
    running: runningItems.map((item) => ({
      name: item.I_Name || "Item",
      value: 1,
    })),
    pendingDel: PendingItemsforkdsDel.map((item) => ({
      name: item.I_Name || "Item",
      value: 1,
    })),
    dashboard: data.map((item) => ({
      name: item.I_Name || "Item",
      value: 1,
    })),
  };
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#845EC2"];

  // Export to Excel
  const exportToExcel = (rows, fileName) => {
    if (!rows || rows.length === 0) {
      alert("No data available to export!");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Report");

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  // Export to PDF
  const exportToPDF = (rows, fileName) => {
    if (!rows || rows.length === 0) {
      alert("No data available to export!");
      return;
    }

    const doc = new jsPDF();
    doc.text(fileName, 14, 15);

    const tableColumn = [
      "Bill No",
      "KOT No",
      "Item Name",
      "Order Time",
      "Delivery Time",
      "TAT",
    ];
    const tableRows = rows.map((row) => [
      row.BillNO,
      row.KOT_NO,
      row.I_Name,
      row.kot_date ? new Date(row.kot_date).toLocaleString() : "-",
      row.del_order_date ? new Date(row.del_order_date).toLocaleString() : "-",
      row.tat ?? "-",
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`${fileName}.pdf`);
  };

  useEffect(() => {
    const FetchRuningitems = async () => {
      try {
        const response = await fetch("http://localhost:5000/runningItems");
        if (!response.ok) throw new Error("Failed to fetch Runningitems");
        const result = await response.json();
        setRunningItems(result);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };
    FetchRuningitems();
  }, []);

  useEffect(() => {
    const fetchPendiginforkds = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/PendingItemsForKds"
        );
        if (!response.ok) throw new Error("failed to fetch PendingItemsForKds");
        const result = await response.json();
        setPendingItemsforkds(result);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPendiginforkds();
  }, []);

  useEffect(() => {
    const fetchPendingItemsforkdsDel = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/PendingItemsforkdsdel"
        );
        if (!response.ok)
          throw new Error("failed to fetch PendingItemsforkdsdel");
        const result = await response.json();
        SetPendingItemsforkdsDel(result);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPendingItemsforkdsDel();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/dashboard");
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  const handleFilterChange = () => {
  // Helper to apply filter logic
  const applyFilter = (rows) => {
    return rows.filter((row) => {
      // Filter by item type
      if (itemType !== "all") {
        const isSweet = row.I_Name?.toLowerCase().includes("sweet");
        if (itemType === "sweet" && !isSweet) return false;
        if (itemType === "non-sweet" && isSweet) return false;
      }

      // Filter by date range
      if (fromDate || toDate) {
        const orderDate = row.kot_date ? new Date(row.kot_date) : null;
        if (orderDate) {
          if (fromDate && orderDate < new Date(fromDate)) return false;
          if (toDate && orderDate > new Date(toDate)) return false;
        }
      }

      return true;
    });
  };

  // Apply filters to each dataset
  setData(applyFilter(data));
  setRunningItems(applyFilter(runningItems));
  setPendingItemsforkds(applyFilter(PendingItemsforkds));
  SetPendingItemsforkdsDel(applyFilter(PendingItemsforkdsDel));
};


  // ✅ Helper to render table
  const renderTable = (rows) => (
    <table
      border="1"
      cellPadding="10"
      style={{ borderCollapse: "collapse", width: "100%" }}
    >
      <thead>
        <tr>
          <th>Bill No</th>
          <th>KOT No</th>
          <th>Item Name</th>
          <th>Order Time</th>
          <th>Delivery Time</th>
          <th>TAT</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <tr key={index}>
            <td>{row.BillNO}</td>
            <td>{row.KOT_NO}</td>
            <td>{row.I_Name}</td>
            <td>
              {row.kot_date ? new Date(row.kot_date).toLocaleString() : "-"}
            </td>
            <td>
              {row.del_order_date
                ? new Date(row.del_order_date).toLocaleString()
                : "-"}
            </td>
            <td>{row.tat ?? "-"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  

  return (
    <div className="container">
      <div className="menu-bar">
        <ul>
          <li>DashBoard</li>
          <li>PendingItemsForKds</li>
          <li>PendingItemsforkdsDel</li>
          {/* <li>option 4</li  > */}
        </ul>
      </div>

      <main className="dashboard-content">
        <header className="header">DASHBOARD</header>

        {/* Filters */}
        <section className="filters">
          <div className="date-filter">
            <label>From: </label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
            <label>To: </label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>

          <div className="type-filter">
            <label>Item Type: </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
            >
              <option value="all">All</option>
              <option value="sweet">Sweet</option>
              <option value="non-sweet">Non-Sweet</option>
            </select>
          </div>

          <button className="apply-btn" onClick={handleFilterChange}>
            Apply Filters
          </button>
        </section>

        {/* ✅ Summary with Click */}
        <section className="item-summary">
          <div
            className="summary-item clickable"
            onClick={() => setSelectedReport("dashboard")}
          >
            Dashboard Report
          </div>
          <div
            className="summary-item clickable"
            onClick={() => setSelectedReport("running")}
          >
            Running Items: <br /> {runningItems.length}
          </div>
          <div
            className="summary-item clickable"
            onClick={() => setSelectedReport("pendingKds")}
          >
            Pending items for KDS : <br /> {PendingItemsforkds.length}
          </div>
          <div
            className="summary-item clickable"
            onClick={() => setSelectedReport("pendingDel")}
          >
            Pending items for KDS Delivery : <br />{" "}
            {PendingItemsforkdsDel.length}
          </div>
        </section>
        <div className="visuals">
          <section className="visual-presentation">
            <div style={{ height: 400 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={chartData[selectedReport]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    label
                  >
                    {chartData[selectedReport].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  {/* <Legend /> */}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
          <section className="table-presentation">
            <img
              src="./image1.png"
              alt="pie"
              width={"550px"}
              height={"500px"}
            />
          </section>
        </div>

        {/* ✅ Conditional Report */}
        <div className="summary-reports">
          <h4 className="header">
            {selectedReport === "pendingKds" && "Pending Items Report"}
            {selectedReport === "running" && "Running Items Report"}
            {selectedReport === "pendingDel" && "Pending Delivery Report"}
            {selectedReport === "dashboard" && "Dashboard Report"}
          </h4>

          <div className="export-btn">
      <button
        className="apply-btn"
        onClick={() =>
          exportToExcel(
            selectedReport === "pendingKds"
              ? PendingItemsforkds
              : selectedReport === "running"
              ? runningItems
              : selectedReport === "pendingDel"
              ? PendingItemsforkdsDel
              : data,
            // reportTitles[selectedReport]
          )
        }
      >
        .xlsx
      </button>
      <button
        className="apply-btn"
        style={{ marginLeft: "10px", background: "#28a745" }}
        onClick={() =>
          exportToPDF(
            selectedReport === "pendingKds"
              ? PendingItemsforkds
              : selectedReport === "running"
              ? runningItems
              : selectedReport === "pendingDel"
              ? PendingItemsforkdsDel
              : data,
            // reportTitles[selectedReport]
          )
        }
      >
      .pdf
      </button>
    </div>

          {selectedReport === "pendingKds" && renderTable(PendingItemsforkds)}
          {selectedReport === "running" && renderTable(runningItems)}
          {selectedReport === "pendingDel" &&
            renderTable(PendingItemsforkdsDel)}
          {selectedReport === "dashboard" && renderTable(data)}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
