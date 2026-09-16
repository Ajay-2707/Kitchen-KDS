import React, { useEffect, useState } from "react";
import "../styles/Recall.css";
import config from "../config";

function RecallScreen() {
  const [orders, setOrders] = useState([]);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    console.log(config.apiBaseUrl);
    console.log(config.kdsName);
    console.log(config.kdsType);
    
    let timer;
    async function fetchOrders() {
      try {
        // const res = await fetch("http://localhost:5005/del-orders?kds=Beverages");
        const res = await fetch(`${config.apiBaseUrl}/del-orders?kds=${encodeURIComponent(config.kdsName)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        timer = setTimeout(fetchOrders, 20000); // refresh every 20 sec
      }
    }

    fetchOrders();
    return () => clearTimeout(timer);
  }, []);

  const getOrderTypeClass = (type) => {
    if (!type) return "tag-default";

    switch (type.toLowerCase()) {
      case "dine-in":
        return "tag-dinein";
      case "take away":
        return "tag-takeaway";
      case "delivery":
        return "tag-delivery";
      case "table billing":
        return "tag-tablebilling";
      default:
        return "tag-default";
    }
  };

  // ✅ Recall function
  const handleRecall = async (order) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/recall?kds=${encodeURIComponent(config.kdsType)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          KOT_NO: order.KOT_NO,
          I_Code: order.Item_Code || order.I_Code, // adjust as per your field name
          Bill_NO: order.Bill_No_FK || order.BillNO, // adjust field name
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Order recalled successfully!");
        // Optionally refresh order list after recall
        setTimeout(() => {
          setMessage(null);
          window.location.reload();
        }, 1500);
      } else {
        setMessage(`⚠️ Recall failed: ${data.error || "Unknown error"}`);
        setTimeout(() => setMessage(null), 3000);
      }
    } catch (error) {
      console.error("Recall failed:", error);
      setMessage("❌ Error recalling order. Please try again.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  return (
    <div className="recall-container">
      <div className="recall-header">Delivered Orders (Recall)</div>

      {message && (
        <div className="modal-overlay">
          <div className="modal-content">{message}</div>
        </div>
      )}

      <div className="recall-grid">
        {orders.length === 0 ? (
          <p className="no-orders">No delivered orders found.</p>
        ) : (
          orders.map((order, index) => (
            <div key={index} className="recall-card">
              <div className="recall-top">
                <span className={`tag ${getOrderTypeClass(order.bill_type)}`}>
                  {order.bill_type?.toUpperCase()} - {order.TableName || "N/A"}
                </span>
                <span className="kot-tag">KOT #{order.KOT_NO}</span>
              </div>

              <div className="recall-body">
                {order.I_Name} × {order.Qty}
              </div>

              <div className="recall-footer">
                <strong>Delivered</strong>{" "}
                <button onClick={() => handleRecall(order)}>Recall</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default RecallScreen;
