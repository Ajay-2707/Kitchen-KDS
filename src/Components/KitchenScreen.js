import React, { useState, useRef, useEffect, useMemo } from "react";
import "../styles/KitchenScreen.css";
import Masonry from "react-masonry-css";
import config from "../config.js";

function KitchenScreen() {
  const [showSummary, setShowSummary] = useState(false);
  const [clickStage, setClickStage] = useState({});
  // const [modalData, setModalData] = useState(null);
  const [modalMessage, setModalMessage] = useState(null); // null | "Accepted" | "Delivered"

  const [summary, setSummary] = useState([]);
  const [viewMode, setViewMode] = useState("item"); // "kot" | "item"

  const [orders, setOrders] = useState(
    [].map((order) => ({
      ...order,
      timestamp: new Date().getTime(),
    }))
  );

  const [now, setNow] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [orderTypeFilter, setOrderTypeFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);

  const orderTypes = ["Dine-in", "Take Away", "Delivery", "Table billing"];
  const statuses = ["Pending", "Delivered", "Cancelled"]; // <- added "Cooking"
  const prevOrdersCount = useRef(0);

  // ===== NEW: normalized selection state =====
  // selection = { mode: 'kot', orderId } | { mode: 'item', orderId, itemIndex }
  // const [selection, setSelection] = useState(null);

  // useEffect(() => {
  //   const fetchSummary = async () => {
  //     try {
  //       const response = await fetch(
  //         `${config.apiBaseUrl}/summary?kds=${encodeURIComponent(config.kdsName)}`
  //       );
  //       const data = await response.json();
  //       console.log("KDS Summary:", data);
  //     } catch (error) {
  //       console.error("Error fetching summary:", error);
  //     }
  //   };

  //   fetchSummary();
  // }, []);

  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
      // const newOrder = orders.reduce((latest, order) =>
      //   order.id > latest.id ? order : latest
      // );
      const audio = new Audio("/new_ticket.mp3");
      audio.load();
      audio.play().catch((err) => console.log("Autoplay blocked:", err));
    }
    prevOrdersCount.current = orders.length;
  }, [orders]);

  useEffect(() => {
    let timer;
    async function fetchOrders() {
      try {
        const res = await fetch(
          `${config.apiBaseUrl}/orders?kds=${encodeURIComponent(
            config.kdsName
          )}`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const orders = transformApiData(data);
          setOrders(orders);
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

  useEffect(() => {
    let timer;
    async function fetchsummary() {
      try {
        const res = await fetch(
          `${config.apiBaseUrl}/summary?kds=${encodeURIComponent(
            config.kdsName
          )}`
        );
        const data = await res.json();
        setSummary(data.Data || data);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        timer = setTimeout(fetchsummary, 1000);
      }
    }
    fetchsummary();
    return () => clearTimeout(timer);
  }, []);

  function transformApiData(apiData) {
    const statusMap = {
      0: "Pending",
      1: "Accepted",
    };
    const orderTypeMap = {
      "Table billing": "Table billing",
      "Dine-in": "Dine-in",
      "Take Away": "Take Away",
      Delivery: "Delivery",
    };
    const orderStatusMap = {
      0: "Pending",
      1: "Deliverd",
    };
    const groupedOrders = {};

    apiData.forEach((item) => {
      const kot = item.KOT_NO;
      if (!groupedOrders[kot]) {
        groupedOrders[kot] = {
          id: kot,
          I_Code: item?.I_Code || "",
          orderType: orderTypeMap[item.bill_type] || "Unknown",
          tableNo: item.TableName || "N/A",
          name: item.I_Name,
          items: [],
          status: statusMap[item.ack_status] || "Pending",
          timestamp: new Date(item.CreatedOn.replace("Z", "")).getTime(),
          comments: item.comments,
          Bill_NO: item.BillNO,
          orderStatus: orderStatusMap[item.order_status],
        };
      }
      groupedOrders[kot].items.push({
        name: item.I_Name,
        status: statusMap[item.ack_status] || "Pending",
        I_Code: item?.I_Code || "",
        Bill_NO: item.BillNO,
        qty: String(item.Qty),
        comments: item.comments,
        timestamp: new Date(item.CreatedOn).getTime(),
        orderStatus: orderStatusMap[item.order_status],
        orderType: orderTypeMap[item.bill_type] || "Unknown",
      });
    });

    return Object.values(groupedOrders);
  }

  const handleFilterChange = (filter, setFilter, value) => {
    setFilter((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]
    );
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // const updateStatus = async (orderId, newStatus) => {
  //   try {
  //     const order = orders.find((o) => o.id === orderId);
  //     if (!order) return;

  //     const response = await fetch("http://192.168.1.13:5000/update", {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         KOT_NO: order.id,
  //         I_Code: "",
  //         Bill_NO: order.Bill_NO,
  //       }),
  //     });

  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.error || "Failed to update order");

  //     setOrders((prev) =>
  //       prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
  //     );
  //   } catch (error) {
  //     console.error("Order update failed:", error);
  //   }
  // };

  //  const updateItemStatus = async (orderId, itemIndex, newStatus) => {
  //   try {
  //     const order = orders.find((o) => o.id === orderId);
  //     if (!order) return;

  //     const item = order.items[itemIndex];

  //     const response = await fetch("http://192.168.1.13:5000/update", {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         KOT_NO: order.id,
  //         I_Code: item.code || item.I_Code,
  //         Bill_NO: order.Bill_NO,
  //       }),
  //     });

  //     const data = await response.json();
  //     if (!response.ok) throw new Error(data.error || "Failed to update item");

  //     setOrders((prevOrders) =>
  //       prevOrders.map((o) => {
  //         if (o.id !== orderId) return o;

  //         const updatedItems = o.items.map((it, idx) =>
  //           idx === itemIndex ? { ...it, status: newStatus } : it
  //         );

  //         // Only update KOT status if all items are Delivered
  //         const allDelivered = updatedItems.every(it => it.status === "Delivered");

  //         return {
  //           ...o,
  //           items: updatedItems,
  //           status: allDelivered ? "Delivered" : o.status, // keep old status until all delivered
  //         };
  //       })
  //     );
  //   } catch (error) {
  //     console.error("Item update failed:", error);
  //   }
  // };

  const ackStatus = async (order, newStatus = "Accepted") => {
    try {
      const kotId = order.kotId ?? order.id;
      const Bill_NO = order.Bill_NO;

      if (order.__mode === "item") {
        // ITEM VIEW: always a single item
        const item = order.items?.[order.__itemIndex] ?? order.items?.[0]; // fallback to [0]

        if (!item) {
          console.error("No item found for item mode:", order);
          return;
        }

        await fetch(`${config.apiBaseUrl}/accept`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            KOT_NO: kotId,
            I_Code: item.I_Code || item.code,
            Bill_NO,
          }),
        });
      } else {
        // KOT VIEW: update all active items
        for (const item of order.items) {
          if (item.qty === "0") continue; // skip cancelled
          await fetch(`${config.apiBaseUrl}/accept`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              KOT_NO: kotId,
              I_Code: item.I_Code || item.code,
              Bill_NO,
            }),
          });
        }
      }

      // Update frontend state
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (String(o.id) !== String(kotId)) return o;

          if (order.__mode === "item") {
            const idx = order.__itemIndex ?? 0;
            return {
              ...o,
              items: o.items.map((it, i) =>
                i === idx ? { ...it, status: newStatus } : it
              ),
            };
          } else {
            return {
              ...o,
              status: newStatus,
              items: o.items.map((it) =>
                it.qty !== "0" ? { ...it, status: newStatus } : it
              ),
            };
          }
        })
      );
    } catch (error) {
      console.error("Accept failed:", error);
    }
  };

  const getButtonStyle = (itemStatus, btnStatus) => ({
    backgroundColor: itemStatus === btnStatus ? "#5cb85c" : "#f0f0f0",
    color: itemStatus === btnStatus ? "#fff" : "#000",
    padding: "4px 10px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    marginRight: "6px",
    cursor: "pointer",
  });

  const getCardStyleMerged = (order, now = Date.now()) => {
    // --- TIMER LOGIC OVERRIDES ---
    if (order.timestamp) {
      const diffMins = Math.floor(
        (now - new Date(order.timestamp).getTime()) / 60000
      );
      if (diffMins >= 5) {
        return {
          backgroundColor: "#fad9d9ff",
          border: "3px solid red",
          borderRadius: "12px",
          transition: "border 0.3s ease",
        };
      }
      if (diffMins >= 3) {
        return {
          backgroundColor: "lightyellow",
          border: "3px solid orange",
          borderRadius: "12px",
          transition: "border 0.3s ease",
        };
      }
    }

    // --- ACCEPTED STATUS FALLBACK ---
    const hasAcceptedItem = order.items.some(
      (item) => item.status === "Accepted"
    );
    return {
      backgroundColor: hasAcceptedItem ? "#c4f9c4ff" : "transparent", // default transparent
      border: hasAcceptedItem ? "3px solid green" : "1px solid #ccc",
      borderRadius: "12px",
      transition: "border 0.3s ease",
    };
  };

  // const getCardStyleMerged = (order, now = Date.now()) => {
  //   // Default style
  //   let style = {
  //     backgroundColor: order.items.some(item => item.status === "Accepted") ? "lightgreen" : "transparent",
  //     border: "1px solid #ccc",
  //     borderRadius: "12px",
  //     transition: "border 0.3s ease, background-color 0.3s ease"
  //   };

  //   // --- TIMER LOGIC OVERRIDES ONLY BORDER ---
  //   if (order.timestamp) {
  //     const diffMins = Math.floor((now - new Date(order.timestamp).getTime()) / 60000);
  //     if (diffMins >= 5) {
  //       style.border = "2px solid red";
  //     } else if (diffMins >= 3) {
  //       style.border = "2px solid orange";
  //     }
  //   }

  //   return style;
  // };

  const getElapsedTime = (timestamp) => {
    const diffMs = Date.now() - timestamp;
    const totalSeconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // ===== displayData carries metadata so clicks know original indices =====
  const displayData = useMemo(() => {
    if (viewMode === "kot") {
      // mark mode for click handler clarity
      return orders.map((o) => ({ ...o, __mode: "kot", kotId: o.id }));
    }
    // item view: 1 card per item, with original order id + item index
    return orders.flatMap((o) =>
      o.items.map((item, idx) => ({
        ...o,
        items: [item],
        id: `${o.id}-${idx}`, // unique per card
        kotId: o.id, // preserve source KOT id
        __mode: "item",
        __itemIndex: idx,
      }))
    );
  }, [orders, viewMode]);

  // ===== helpers for sorting IDs across modes =====
  const sortByKotIdDesc = (a, b) => {
    const parseKotId = (x) => {
      if (typeof x.id === "string" && x.id.includes("-")) {
        return Number(x.id.split("-")[0]);
      }
      return Number(x.id);
    };
    return parseKotId(b) - parseKotId(a);
  };

  const savedConfig = localStorage.getItem("appConfig");
    if (savedConfig) {
  Object.assign(config, JSON.parse(savedConfig)); // Override defaults
  // console.log(savedConfig);  
}

  useEffect(() => {
    if (!modalMessage) return;

    const timer = setTimeout(() => {
      setModalMessage(null);
    }, 100); // 1000ms = 1 second

    return () => clearTimeout(timer);
  }, [modalMessage]);

  const totalUniqueItems = useMemo(() => {
    const uniqueSet = new Set();

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (item.qty !== "0") {
          // skip cancelled
          uniqueSet.add(`${order.tableNo}-${item.name}`); // unique per table & item
        }
      });
    });

    return uniqueSet.size;
  }, [orders]);

  const getVisibleCardCount = () => {
    return displayData.filter((order) => {
      const typeMatch =
        orderTypeFilter.length === 0 ||
        orderTypeFilter.includes(order.orderType);
      const statusMatch =
        statusFilter.length === 0 || statusFilter.includes(order.status);
      return typeMatch && statusMatch;
    }).length;
  };
  const getPendingKotCount = () => {
    // Work only with KOT view (not item view)
    const kotOrders = orders.filter((order) => order.status === "Pending");
    return kotOrders.length;
  };

  return (
    <>
      <div className="filters">
        <div className="order-filters">
          {orderTypes.map((type) => (
            <label
              key={type}
              style={{ marginRight: "10px" }}
              className="filter-lable"
            >
              <input
                type="checkbox"
                checked={orderTypeFilter.includes(type)}
                onChange={() =>
                  handleFilterChange(orderTypeFilter, setOrderTypeFilter, type)
                }
              />
              {type}
            </label>
          ))}
        </div>

        <div className="view-toggle">
          <button
            onClick={() =>
              setViewMode((prev) => (prev === "kot" ? "item" : "kot"))
            }
            style={{
              padding: "8px 16px",
              background: viewMode === "kot" ? "#007bff" : "#28a745", // blue for KOT, green for Item
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
          >
            Switch to {viewMode === "kot" ? "Item View" : "KOT View"}
          </button>

          <button
            onClick={() => setShowSummary((prev) => !prev)}
            style={{
              padding: "8px 16px",
              background: showSummary ? "#007bff" : "#28a745", // red when shown, teal when hidden
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              transition: "background 0.3s ease",
            }}
          >
            {showSummary ? "Hide Summary" : "Show Summary"}
          </button>
        </div>

        <div className="status-filters">
          {statuses.map((status) => (
            <label key={status} style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                checked={statusFilter.includes(status)}
                onChange={() =>
                  handleFilterChange(statusFilter, setStatusFilter, status)
                }
              />

              {status}
            </label>
          ))}
        </div>
        <div>
          <p>Total Count: {getVisibleCardCount()}</p>
          <p>Pending KOTs: {getPendingKotCount()}</p>
          {/* <p>Pending Items: {totalUniqueItems}</p> */}
        </div>
        {/* <div><p>Total Pending KOTs: {totalUniqueItems}</p></div> */}
      </div>

      <div
        className="kitchen-container"
        style={{
          display: "grid",
          gridTemplateColumns: showSummary ? "3fr 1fr" : "1fr",
        }}
      >
        <Masonry
           breakpointCols={
      showSummary
        ? { default: 4, 1400: 4, 1024: 3, 768: 2, 480: 1 } // with summary → 4 columns
        : { default: 5, 1400: 4, 1024: 3, 768: 2, 480: 1 } // without summary → 5 columns
    }
          className="kitchen-grid"
          columnClassName="kitchen-grid-column"
        >
          {displayData
            .filter((order) => {
              const typeMatch =
                orderTypeFilter.length === 0 ||
                orderTypeFilter.includes(order.orderType);
              const statusMatch =
                statusFilter.length === 0 ||
                statusFilter.includes(order.status);
              return typeMatch && statusMatch;
            })
            .sort(sortByKotIdDesc)
            .map((order) => (
              <div
                key={order.id}
                className="kitchen-card"
                // style={getCardStyle(order.timestamp)}
                style={getCardStyleMerged(order)}
              >
                <div
                  className="Pressable-card"
                  // onClick={() => ackStatus(order, "Accepted")} // or correct item index
                  onClick={() => {
                    const orderId = order.id; // use order.id or order.id + '-' + index for item mode

                    if (
                      !clickStage[orderId] ||
                      clickStage[orderId] === "delivered"
                    ) {
                      // First click (or reset) → mark Accepted
                      ackStatus(order, "Accepted");
                      setClickStage((prev) => ({
                        ...prev,
                        [orderId]: "accepted",
                      }));
                      setModalMessage({
                        message: "Order Accepted",
                        kotNo: order.__mode === "item" ? order.kotId : order.id,
                        orderType: order.orderType,
                      });
                      // setModalMessage("Order Accepted"); // show modal
                      // setModalMessage({ message: "Accepted"});
                    } else if (clickStage[orderId] === "accepted") {
                      // Second click → mark Delivered
                      ackStatus(order, "Delivered");
                      setClickStage((prev) => ({
                        ...prev,
                        [orderId]: "delivered",
                      }));
                      setModalMessage({
                        message: "Order Delivered",
                        kotNo: order.__mode === "item" ? order.kotId : order.id,
                        orderType: order.orderType,
                      }); // show modal
                    }
                  }}
                  // onClick={() => {
                  //   if (order.__mode === "item") {
                  //     // single item card: open modal for just that item
                  //     setSelection({
                  //       mode: "item",
                  //       orderId: order.kotId,
                  //       itemIndex: order.__itemIndex,
                  //     });
                  //   } else {
                  //     // kot card: open full order
                  //     setSelection({ mode: "kot", orderId: order.id });
                  //   }
                  // }}
                >
                  <div
                    className={`ticket-header ${order.orderType
                      .toLowerCase()
                      .replace(" ", "-")}`}
                    // style={getCardBorderStyle(order)}
                  >
                    <span className="ticket-type">
                      {order.orderType} - {order.tableNo}
                    </span>
                    <span className="ticket-id">
                      KOT #{order.__mode === "item" ? order.kotId : order.id}
                    </span>
                  </div>

                  <ul className="kitchen-item-list">
                    {order.items.map((item, index) => (
                      <li key={index}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr auto auto",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                textDecoration:
                                  item.qty === "0" ? "line-through" : "none",
                              }}
                            >
                              {item.name}
                            </strong>
                            <br />
                            <span
                              style={{
                                fontSize: "0.75rem",
                                color: "blue",
                                fontWeight: 600,
                              }}
                            >
                              {item.comments}
                            </span>
                          </div>
                          <div>
                            <strong
                              style={{
                                textDecoration:
                                  item.qty === "0" ? "line-through" : "none",
                              }}
                            >
                              x {item.qty}
                            </strong>
                          </div>
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#666",
                              fontWeight: "500",
                              textDecoration:
                                item.qty === "0" ? "line-through" : "none",
                            }}
                          >
                            {item.qty === "0" ? "Cancelled" : item.status}
                          </div>
                        </div>

                        {order.showItemStatus && (
                          <div style={{ marginTop: "4px" }}>
                            <button
                              style={getButtonStyle(item.status, "Pending")}
                              // onClick={(e) => {
                              //   e.stopPropagation();
                              //   const effectiveOrderId =
                              //     order.__mode === "item" ? order.kotId : order.id;
                              //   const effectiveIndex =
                              //     order.__mode === "item" ? order.__itemIndex : index;
                              //   updateItemStatus(effectiveOrderId, effectiveIndex, "Pending");
                              // }}
                            >
                              Pending
                            </button>
                            <button
                              style={getButtonStyle(item.status, "Cooking")}
                              // onClick={(e) => {
                              //   e.stopPropagation();
                              //   const effectiveOrderId =
                              //     order.__mode === "item" ? order.kotId : order.id;
                              //   const effectiveIndex =
                              //     order.__mode === "item" ? order.__itemIndex : index;
                              //   updateItemStatus(effectiveOrderId, effectiveIndex, "Cooking");
                              // }}
                            >
                              Cooking
                            </button>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>

                  {/* <p className={`kitchen-status ${order.status.toLowerCase()}`}>
                    Status: {order.status}
                  </p> */}
                  <p className="kitchen-timer">
                    <strong>Waiting: {getElapsedTime(order.timestamp)}</strong>
                  </p>
                </div>
              </div>
            ))}
        </Masonry>
        {showSummary && (
          <div className="kitchen-quatities">
            <aside className="pending-summary">
              <h2>Item Summary</h2>
              <p style={{ fontWeight: "bold" }}>Items: {totalUniqueItems}</p>
              <ul>
                {summary.map((item, idx) => (
                  <li key={idx}>
                    <span>{item.I_Name}</span>
                    <span className="pending-count">{item.Qty}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        )}
        ;
      </div>

      {/* ===== MODAL (works for both modes) ===== */}
      {/* {selectedData && (
        <div
          className="modal-overlay"
          onClick={() => setSelection(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              maxHeight: "85vh",
              width: "90%",
              maxWidth: "600px",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <button
              onClick={() => setSelection(null)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "transparent",
                border: "none",
                fontSize: "1.8rem",
                cursor: "pointer",
                color: "#333",
              }}
            >
              &times;
            </button>

            <h2 style={{ marginBottom: "10px" }}>
              {selectedData.singleItemMode
                ? `Item Details`
                : `Order Details (#${selectedData.id})`}
            </h2>

            {!selectedData.singleItemMode && (
              <>
                <p style={{ marginBottom: 0 }}>Type: {selectedData.orderType}</p>
                {selectedData.tableNo && (
                  <p style={{ marginTop: "5px" }}>Table no: {selectedData.tableNo}</p>
                )}
              </>
            )}

            <div
              style={{
                overflowY: "auto",
                flex: 1,
                margin: "10px 0",
                paddingRight: "5px",
              }}
            >
              <ul
                style={{
                  display: "grid",
                  gridTemplateColumns: selectedData.singleItemMode
                    ? "1fr"
                    : "repeat(3, 1fr)",
                  gap: "10px",
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                }}
              >
                {selectedData.items.map((item, index) => {
                  // if singleItemMode, the index within the base order is selection.itemIndex
                  const effectiveIndex = selectedData.singleItemMode
                    ? selectedData.itemIndex
                    : index;

                  return (
                    <li
                      key={index}
                      style={{
                        border: "1px solid #232222ff",
                        borderRadius: "8px",
                        padding: "8px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <div>
                        <strong>{item.name}</strong>
                        <br />
                        <span style={{ fontSize: ".85rem", color: "#777" }}>
                          {item.comments}
                        </span>
                      </div>
                      <div style={{ marginTop: "6px", display: "flex", gap: "6px" }}>
                        <button
                          style={getButtonStyle(item.status, "Pending")}
                          // onClick={() =>
                          //   updateItemStatus(selectedData.id, effectiveIndex, "Pending")
                          // }
                        >
                          Pending
                        </button>
                        <button
                          style={getButtonStyle(item.status, "Delivered")}
                          // onClick={() =>
                          //   updateItemStatus(selectedData.id, effectiveIndex, "Delivered")
                          // }
                        >
                          Delivered
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div
              style={{
                borderTop: "1px solid #ddd",
                paddingTop: "12px",
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "10px",
              }}
            >
              <button
                style={{
                  border: "2px solid #28a745",
                  color: "#28a745",
                  padding: "10px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                // onClick={() => {
                //   if (selectedData.singleItemMode) {
                //     updateItemStatus(selectedData.id, selectedData.itemIndex, "Delivered");
                //   } else {
                //     updateStatus(selectedData.id, "Delivered");
                //     selectedData.items.forEach((_, idx) =>
                //       updateItemStatus(selectedData.id, idx, "Delivered")
                //     );
                //   }
                //   setSelection(null);
                // }}
              >
                Delivered
              </button>

              <button
                style={{
                  border: "2px solid #dc3545",
                  color: "#dc3545",
                  padding: "10px",
                  borderRadius: "6px",
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
                onClick={() => setSelection(null)}
              >
                close
              </button>
            </div>
          </div>
        </div>
      )} */}

      {modalMessage && (
        <div
          className="modal-overlay"
          onClick={() => setModalMessage(null)}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "20px 40px",
              borderRadius: "10px",
              fontSize: "1.5rem",
              fontWeight: "bold",
              textAlign: "center",
            }}
          > 
            Order Type:{modalMessage.orderType}<br/>
            {modalMessage.message}<br/>
            KOT No:{modalMessage.kotNo}<br/>
            <div style={{ marginTop: "15px" }}>
              <button
                onClick={() => setModalMessage(null)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: "#007bff",
                  color: "#fff",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default KitchenScreen;
