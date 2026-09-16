import React, { useState, useEffect } from "react";
import "../styles/KitchenScreen.css";
import Masonry from "react-masonry-css";
import config from "../config.js";

function CDScreen() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let timer;

    async function fetchOrders() {
      try {
        const res = await fetch(`${config.apiBaseUrl}/kds-del`);
        const data = await res.json();

        if (Array.isArray(data)) {
          // ✅ GROUP BY KOT_NO (TOKEN)
          const grouped = {};

          data
            .filter((item) => item.ready_status === 1)
            .forEach((item) => {
              const kot = item.KOT_NO;

              if (!grouped[kot]) {
                grouped[kot] = {
                  id: kot, // unique per token
                  kotId: kot,
                  tokenNo: item.TockenNo || item.TokenNo || "-", // handle both cases
                  timestamp: new Date(item.CreatedOn).getTime(),
                };
              }
            });

          // ✅ Convert object → array
          const filtered = Object.values(grouped);

          // ✅ OPTIONAL: latest first
          filtered.sort((a, b) => b.timestamp - a.timestamp);

          setOrders(filtered);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        timer = setTimeout(fetchOrders, 2000);
      }
    }

    fetchOrders();
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="kitchen-container" style={{ display: "grid" }}>
      <Masonry
        breakpointCols={{
          default: 6,
          1400: 4,
          1024: 3,
          768: 2,
          480: 1,
        }}
        className="kitchen-grid"
        columnClassName="kitchen-grid-column"
      >
        {orders.map((order) => (
          <div
            key={order.id}
            style={{
              borderRadius: "10px",
              padding: "5px",
              margin: "5px",
              background: "#38913e", // ✅ unchanged
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "18px",
            }}
          >
            <div
              style={{
                fontSize: "100px",
                marginBottom: "10px",
                color: "#fff",
              }}
            >
              {order.tokenNo}
            </div>
          </div>
        ))}
      </Masonry>
    </div>
  );
}

export default CDScreen;