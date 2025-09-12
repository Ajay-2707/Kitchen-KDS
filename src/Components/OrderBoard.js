import React from "react";
import "../styles/OrderBoard.css";

const orders = [
  {
    type: "Dine In",
    color: "red",
    time: "1:45 pm",
    items: [
      { name: "Paneer Chilli", qty: 1 },
      { name: "Chicken Tandoori", qty: 2 },
      { name: "Veg Hyderabadi", qty: 1 },
    ],
    drinks: ["Pepsi"],
  },
  {
    type: "Take Away",
    color: "yellow",
    time: "1:48 pm",
    items: [
      { name: "Mountain Dew", qty: 2 },
      { name: "Paneer 65", qty: 1 },
    ],
    drinks: ["Pepsi"],
  },
  {
    type: "Home Delivery",
    color: "orange",
    time: "1:52 pm",
    items: [
      { name: "Paneer Hotpan", qty: 1 },
      { name: "Veg Hyderabadi", qty: 2 },
    ],
    drinks: ["Sprite", "Smirnoff"],
  },
];

const summary = [
  { name: "Chicken Tandoori", pending: 4 },
  { name: "Veg Hyderabadi", pending: 2 },
  { name: "Mountain Dew", pending: 2 },
  { name: "Paneer 65", pending: 1 },
  { name: "Paneer Punjabi Tikka", pending: 1 },
  { name: "Fish Finger", pending: 2 },
];

export default function OrderBoard() {
  return (
    <div className="order-board">
      {/* Status Bar */}
      <div className="status-bar">
        <div className="status-left">
          <span className="orders-count">07 Orders</span>
          <span className="kitchen-count">31 In Kitchen</span>
        </div>
        <div className="status-buttons">
          <button className="status-btn status-5min">1 Crossed 5 min</button>
          <button className="status-btn status-10min">7 Crossed 10 min</button>
          <button className="status-btn status-15min">6 Crossed 15 min</button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="main-grid">
        {/* Orders Section */}
        <div className="orders-grid">
          {orders.map((order, index) => (
            <div key={index} className={`order-card ${order.color}`}>
              <h2>{order.type}</h2>
              <p className="order-time">{order.time}</p>

              <div className="order-section">
                <h3>Food Items</h3>
                <ul>
                  {order.items.map((item, i) => (
                    <li key={i}>{item.name} × {item.qty}</li>
                  ))}
                </ul>
              </div>

              {order.drinks.length > 0 && (
                <div className="order-section">
                  <h3>Drinks</h3>
                  <ul>
                    {order.drinks.map((drink, i) => (
                      <li key={i}>{drink}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button className="done-btn">Done</button>
            </div>
          ))}
        </div>

        {/* Pending Item Summary */}
        <aside className="pending-summary">
          <h2>Pending Item Summary</h2>
          <ul>
            {summary.map((item, idx) => (
              <li key={idx}>
                <span>{item.name}</span>
                <span className="pending-count">{item.pending}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
<div className="kitchen-grid">
        {orders.map((order) => (
          <div
            key={order.id}
            className="kitchen-card"
            style={getCardStyle(order.timestamp)}
          >
            <div
              className="Pressable-card"
              onClick={() => setSelectedOrder(order)}
            >
              <div
                className={`ticket-header ${order.orderType
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                <span className="ticket-type">{order.orderType}</span>
                <span className="ticket-id">KOT #{order.id}</span>
              </div>
              <ul className="kitchen-item-list">
                {order.items.map((item, index) => (
                  <li key={index}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span>{item.name}</span>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#666",
                          fontWeight: "500",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>
                    {order.showItemStatus && (
                      <div style={{ marginTop: "4px" }}>
                        <button
                          style={getButtonStyle(item.status, "Pending")}
                          onClick={() =>
                            updateItemStatus(order.id, index, "Pending")
                          }
                        >
                          Pending
                        </button>
                        <button
                          style={getButtonStyle(item.status, "Cooking")}
                          onClick={() =>
                            updateItemStatus(order.id, index, "Cooking")
                          }
                        >
                          Cooking
                        </button>
                        <button
                          style={getButtonStyle(item.status, "Ready")}
                          onClick={() =>
                            updateItemStatus(order.id, index, "Ready")
                          }
                        >
                          Ready
                        </button>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              <p className={`kitchen-status ${order.status.toLowerCase()}`}>
                Status: {order.status}
              </p>
              <p className="kitchen-timer">
                <strong>Waiting: {getElapsedTime(order.timestamp)}</strong>
              </p>
            </div>
          </div>
        ))}
      </div>
