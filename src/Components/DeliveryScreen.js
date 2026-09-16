import React, { useState, useRef, useEffect, useMemo } from "react";
import "../styles/KitchenScreen.css";
import Masonry from "react-masonry-css";
import config from "../config.js";
import { printKOT } from "../utils/printService";

function DeliveryScreen() {
  const [printEnabled, setPrintEnabled] = useState(true);
  const [showRecall, setShowRecall] = useState(false);
  const [clickLocked, setClickLocked] = useState({});
  const [recallData, setRecallData] = useState([]);
  const [recallLoading, setRecallLoading] = useState(false);
  const [selectedRecallItems, setSelectedRecallItems] = useState({});

  const [modalMessage, setModalMessage] = useState(null); // null | "Accepted" | "Delivered"

  const [viewMode, setViewMode] = useState("kot"); // "kot" | "item"

  const [orders, setOrders] = useState(
    [].map((order) => ({
      ...order,
      timestamp: new Date().getTime(),
    })),
  );
  const clickTimingRef = useRef({});
  const [now, setNow] = useState(Date.now());
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [orderTypeFilter, setOrderTypeFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState([]);
  const [toast, setToast] = useState(null);

  const orderTypes = ["Dine-in", "Take Away", "Delivery", "Table billing"];
  const prevOrdersCount = useRef(0);
  const clickTimeRef = useRef({});
  const toggleRecallItem = (item) => {
    const key = `${item.KOT_NO}-${item.I_Code}-${item.BillNO}`;

    setSelectedRecallItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  useEffect(() => {
    if (orders.length > prevOrdersCount.current) {
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
          // `${config.apiBaseUrl}/kds-del?kds=${encodeURIComponent(config.kdsName)}`,
          `${config.apiBaseUrl}/kds-del`,
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const orders = transformApiData(data);
          setOrders(orders);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        timer = setTimeout(fetchOrders, 1000);
      }
    }
    fetchOrders();
    return () => clearTimeout(timer);
  }, []);

  const fetchRecallData = async () => {
    try {
      setRecallLoading(true);

      const res = await fetch(`${config.apiBaseUrl}/api/kds-del/recall`);

      const data = await res.json();

      if (Array.isArray(data)) {
        setRecallData(data);
      } else {
        setRecallData([]);
      }
    } catch (err) {
      console.error("Recall fetch error:", err);
      setRecallData([]);
    } finally {
      setRecallLoading(false);
    }
  };

  function transformApiData(apiData) {
    const orderTypeMap = {
      "table billing": "Table",
      "dine-in": "Dine-in",
      "take away": "Take Away",
      delivery: "Delivery",
      zomato: "ZOMATO",
    };

    const getOrderType = (billType) =>
      orderTypeMap[(billType || "").trim().toLowerCase()] || "Unknown";

    const groupedOrders = {};

    apiData.forEach((item) => {
      // GROUP by Bill No
      const bill = item.BillNO;

      if (!groupedOrders[bill]) {
        groupedOrders[bill] = {
          // Keep KOT for display
          id: item.KOT_NO,
          kotId: item.KOT_NO,

          I_Code: item?.I_Code || "",
          tokenNo: item.TokenNo || item.TockenNo || "",
          orderType: getOrderType(item.bill_type) || "Unknown",
          tableNo: item.TableName || "N/A",
          name: item.I_Name,
          bill_type: item.bill_type,
          stwd: item.stwd || item.PunchBy || item.cashier || item.steward,
          items: [],
          timestamp: new Date(item.CreatedOn.replace("Z", "")).getTime(),
          comments: item.comments,
          Bill_NO: item.BillNO,
          order_status: item.order_status,
        };
      }

      groupedOrders[bill].items.push({
        name: item.I_Name,
        tokenNo: item.TokenNo || item.TockenNo || "",
        I_Code: item?.I_Code || "",
        Bill_NO: item.BillNO,
        qty: String(item.Qty),
        bill_type: item.bill_type,
        stwd: item.stwd || item.PunchBy || item.cashier || item.steward,
        comments: item.comments,
        timestamp: new Date(item.CreatedOn).getTime(),
        orderType: getOrderType(item.bill_type) || "Unknown",
        ready_status: item.ready_status,
        order_status: item.order_status,
      });
    });

    return Object.values(groupedOrders);
  }

  const handleFilterChange = (filter, setFilter, value) => {
    setFilter((prev) =>
      prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value],
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

  const updateSingleItem = async (order, item, newStatus) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/kds-del/update?kds=${encodeURIComponent(config.kdsType)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            KOT_NO: order.kotId ?? order.id,
            I_Code: item.I_Code,
            Bill_NO: item.Bill_NO,
          }),
        },
      );

      const result = await response.json();

      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (String(o.id) !== String(order.kotId ?? order.id)) return o;

          return {
            ...o,
            items: o.items.map((it) =>
              it.I_Code === item.I_Code
                ? {
                    ...it,
                    ready_status:
                      Number(it.ready_status) === 0 ? 1 : it.ready_status,
                  }
                : it,
            ),
          };
        }),
      );
      return result;
    } catch (error) {
      console.error("Item update failed:", error);
    }
  };

  const updateFullOrder = async (order) => {
    try {
      const response = await fetch(
        `${config.apiBaseUrl}/kds-del/update?kds=${encodeURIComponent(config.kdsType)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            KOT_NO: order.kotId ?? order.id,
            Bill_NO: order.Bill_NO,
          }),
        },
      );

      const result = await response.json();

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((o) => {
          if (String(o.id) !== String(order.kotId ?? order.id)) return o;

          return {
            ...o,
            items: o.items.map((it) => ({
              ...it,
              ready_status: Number(it.ready_status) === 0 ? 1 : it.ready_status,
            })),
          };
        }),
      );

      return result;
    } catch (error) {
      console.error("Order update failed:", error);
    }
  };

  const getCardStyleMerged = (order) => {
    const hasReadyItem = order.items?.some(
      (item) => Number(item.ready_status) === 1,
    );

    // 🔥 If ANY item is READY → ORANGE CARD
    if (hasReadyItem) {
      return {
        style: {
          borderRadius: "12px",
          transition: "border 0.3s ease",
          border: "3px solid orange",
          backgroundColor: "#ffe5b4", // light orange
        },
      };
    }

    // 🔴 Default (same as your current)
    return {
      style: {
        borderRadius: "12px",
        transition: "border 0.3s ease",
        border: "2px solid red",
        backgroundColor: "#fad9d9ff",
      },
    };
  };

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
      return orders.map((o) => ({ ...o, __mode: "kot", kotId: o.id }));
    }
    return orders.flatMap((o) =>
      o.items.map((item, idx) => ({
        ...o,
        items: [item],
        id: `${o.id}-${idx}`, // unique per card
        kotId: o.id, // preserve source KOT id
        __mode: "item",
        __itemIndex: idx,
      })),
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

  // const savedConfig = localStorage.getItem("appConfig");
  // if (savedConfig) {
  //   Object.assign(config, JSON.parse(savedConfig)); // Override defaults
  // }

  useEffect(() => {
    if (!modalMessage) return;

    const timer = setTimeout(() => {
      setModalMessage(null);
    }, 750); // 1000ms = 1 second

    return () => clearTimeout(timer);
  }, [modalMessage]);

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

  useEffect(() => {
    if (!showRecall) return;

    const interval = setInterval(() => {
      fetchRecallData();
    }, 5000);

    return () => clearInterval(interval);
  }, [showRecall]);

  const groupedRecallData = useMemo(() => {
    const grouped = {};

    recallData.forEach((item) => {
      const kot = item.KOT_NO;

      if (!grouped[kot]) {
        grouped[kot] = {
          kotNo: kot,
          token: item.TokenNo,
          table: item.TableName,
          orderType: item.bill_type,
          createdOn: item.CreatedOn,
          items: [],
        };
      }

      grouped[kot].items.push(item);
    });

    return Object.values(grouped);
  }, [recallData]);

  const handleRecallPerOrder = async (order) => {
    const selectedItems = order.items.filter((item) => {
      const key = `${item.KOT_NO}-${item.I_Code}-${item.BillNO}`;
      return selectedRecallItems[key];
    });

    if (selectedItems.length === 0) {
      alert("No items selected for this order");
      return;
    }

    try {
      await Promise.all(
        selectedItems.map((item) =>
          fetch(`${config.apiBaseUrl}/api/kds-del/recall-update`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              KOT_NO: item.KOT_NO,
              I_Code: item.I_Code,
              Bill_NO: item.BillNO,
            }),
          }),
        ),
      );

      // refresh + cleanup
      fetchRecallData();

      setSelectedRecallItems((prev) => {
        const updated = { ...prev };
        selectedItems.forEach((item) => {
          const key = `${item.KOT_NO}-${item.I_Code}-${item.BillNO}`;
          delete updated[key];
        });
        return updated;
      });
    } catch (err) {
      console.error("Recall failed:", err);
    }
  };

  const isAllSelected = (order) => {
    return order.items.every((item) => {
      const key = `${item.KOT_NO}-${item.I_Code}-${item.BillNO}`;
      return selectedRecallItems[key];
    });
  };

  const toggleSelectAll = (order) => {
    const allSelected = isAllSelected(order);

    setSelectedRecallItems((prev) => {
      const updated = { ...prev };

      order.items.forEach((item) => {
        const key = `${item.KOT_NO}-${item.I_Code}-${item.BillNO}`;

        if (allSelected) {
          delete updated[key]; // unselect all
        } else {
          updated[key] = true; // select all
        }
      });

      return updated;
    });
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
            className="recall-btn"
            style={{
              background: setShowRecall ? "#6c757d" : "#28a745",
            }}
            onClick={() => {
              console.log("RECALL CLICKED");
              setShowRecall(true);
              fetchRecallData(); // 🔥 trigger API
            }}
          >
            Recall Orders
          </button>

          <button
            className="recall-btn"
            onClick={() => setPrintEnabled((prev) => !prev)}
            style={{
              background: printEnabled ? "#28a745" : "#6c757d",
            }}
          >
            {printEnabled ? "Print ON" : "Print OFF"}
          </button>
        </div>
        <div className="status-filters" style={{ visibility: "hidden" }}>
          {""}
        </div>
        <div className="count">
          <div>
            Total Count: <strong>{getVisibleCardCount()}</strong>{" "}
          </div>
        </div>
      </div>

      <div
        className="kitchen-container"
        style={{
          display: "grid",
        }}
      >
        <Masonry
          breakpointCols={{
            default: 5,
            1400: 4,
            1024: 3,
            768: 2,
            480: 1,
          }}
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
            .map((order) => {
              // Get style & shake info
              const card = getCardStyleMerged(order, now);

              return (
                <div
                  key={order.id}
                  className={`kitchen-card`} // shake class if needed
                  style={card.style} // updated styles
                >
                  <div
                    className="Pressable-card"
                    onClick={async () => {
                      const orderId = order.id;

                      const currentClickTime = performance.now();
                      const currentClickDate = new Date().toISOString();

                      // 🔒 Check if this order is currently locked
                      if (clickLocked[orderId]) {
                        console.log("========================================");
                        console.log("🚫 CLICK BLOCKED - API STILL RUNNING");
                        console.log("KOT:", order.kotId ?? order.id);
                        console.log("BILL:", order.Bill_NO);
                        console.log("Blocked Click Time:", currentClickDate);
                        console.log("🔒 LOCK STATUS: LOCKED");
                        console.log("========================================");

                        return;
                      }

                      // =====================================================
                      // 🔥 CHECK INTERVAL FROM FIRST CLICK → SECOND CLICK
                      // =====================================================

                      const firstClickTime = clickTimeRef.current[orderId];

                      if (firstClickTime) {
                        const clickInterval = currentClickTime - firstClickTime;

                        console.log("========================================");
                        console.log("🟢 SECOND CLICK ALLOWED");
                        console.log("KOT:", order.kotId ?? order.id);
                        console.log("BILL:", order.Bill_NO);
                        console.log("Second Click Time:", currentClickDate);

                        console.log(
                          "⏱️ INTERVAL FIRST CLICK → SECOND CLICK:",
                          `${clickInterval.toFixed(2)} ms`,
                        );

                        console.log(
                          "⏱️ INTERVAL FIRST CLICK → SECOND CLICK:",
                          `${(clickInterval / 1000).toFixed(3)} seconds`,
                        );

                        console.log(
                          "🔓 LOCK STATUS BEFORE SECOND CLICK: UNLOCKED",
                        );
                        console.log("========================================");
                      } else {
                        // =====================================================
                        // FIRST CLICK
                        // =====================================================

                        clickTimeRef.current[orderId] = currentClickTime;

                        console.log("========================================");
                        console.log("🟢 FIRST CLICK ALLOWED");
                        console.log("KOT:", order.kotId ?? order.id);
                        console.log("BILL:", order.Bill_NO);
                        console.log("First Click Time:", currentClickDate);
                        console.log(
                          "🔓 LOCK STATUS BEFORE FIRST CLICK: UNLOCKED",
                        );
                        console.log("========================================");
                      }

                      // 🔒 Lock immediately while API request is running
                      setClickLocked((prev) => ({
                        ...prev,
                        [orderId]: true,
                      }));

                      console.log("🔒 LOCK STATUS: LOCKED");

                      console.log("PRINT ENABLED:", printEnabled);

                      // Items that are ready in KDS
                      const readyItems = order.items.filter(
                        (item) => Number(item.order_status) === 1,
                      );

                      if (readyItems.length === 0) {
                        // Unlock because API will not be called
                        setClickLocked((prev) => ({
                          ...prev,
                          [orderId]: false,
                        }));

                        // Clear stored first click
                        delete clickTimeRef.current[orderId];

                        setToast("Item(s) not ready yet");

                        setTimeout(() => {
                          setToast(null);
                        }, 2000);

                        return;
                      }

                      try {
                        // ⏱️ Start API timing
                        const apiStart = performance.now();

                        console.log(
                          "API REQUEST START:",
                          new Date().toISOString(),
                        );

                        const result = await updateFullOrder(order);

                        // ⏱️ API acknowledgement received
                        const apiEnd = performance.now();
                        const apiTime = apiEnd - apiStart;

                        console.log(
                          "API ACK RECEIVED:",
                          new Date().toISOString(),
                        );

                        console.log(
                          `⏱️ API RESPONSE TIME: ${apiTime.toFixed(2)} ms`,
                        );

                        console.log("API RESPONSE:", result);
                        console.log("ACTION:", result?.action);

                        // =====================================================
                        // FIRST CLICK → READY
                        // =====================================================

                        if (result?.action === "READY") {
                          console.log("✅ FIRST CLICK ACKNOWLEDGED → READY");

                          setModalMessage({
                            message: "Order Ready",
                            kotNo: order.kotId ?? order.id,
                            orderType: order.orderType,
                          });
                        }

                        // =====================================================
                        // SECOND CLICK → DELIVERED
                        // =====================================================

                        if (result?.action === "DELIVERED") {
                          console.log(
                            "✅ SECOND CLICK ACKNOWLEDGED → DELIVERED",
                          );

                          if (printEnabled && result?.printData) {
                            console.log("🖨️ Printing...", result.printData);

                            printKOT(result.printData);
                          }

                          setModalMessage({
                            message: "Order Delivered",
                            kotNo: order.kotId ?? order.id,
                            orderType: order.orderType,
                          });

                          // 🧹 Second click completed → clear first-click timestamp
                          delete clickTimeRef.current[orderId];
                        }
                      } finally {
                        // 🔓 Unlock immediately after API acknowledgement
                        const unlockTime = new Date().toISOString();

                        setClickLocked((prev) => ({
                          ...prev,
                          [orderId]: false,
                        }));

                        console.log("🔓 CLICK UNLOCKED:", unlockTime);

                        console.log("🔓 LOCK STATUS: UNLOCKED");

                        console.log("========================================");
                      }
                    }}
                  >
                    {/* --- Your existing card content --- */}
                    <div
                      className={`ticket-header ${order.orderType
                        .toLowerCase()
                        .replace(" ", "-")}`}
                      style={{
                        background: "#1c2543",
                        // padding: ".1px 5px .1px 0 ",
                      }}
                    >
                      <span className="ticket-type">{order.orderType}</span>
                      <span className="ticket-id" style={{ color: "#eeecec" }}>
                        <strong>
                          Bill # {order.Bill_NO || "-"} |{" "}
                          {order.orderType === "Table"
                            ? `table #${order.tableNo || "-"}`
                            : `token #${order.tokenNo || "-"}`}
                        </strong>
                      </span>
                      {/* <span className="ticket-id">
                        KOT #{order.__mode === "item" ? order.kotId : order.id}
                      </span> */}
                    </div>

                    <ul className="kitchen-item-list">
                      {order.items.map((item, index) => {
                        const itemId = `${order.id}-${index}`;

                        return (
                          <li
                            key={index}
                            // onClick={(e) => {
                            //   e.stopPropagation();
                            //   // if (printEnabled) {
                            //   //   console.log("PRINT TRIGGERED");
                            //   //   printKOT(order);
                            //   // }

                            //   const item = order.items[index];

                            //   if (item.order_status !== 1) {
                            //     setToast("Item not ready yet");

                            //     setTimeout(() => setToast(null), 2000);
                            //     return;
                            //   }

                            //   // ✅ PRINT ONLY IF READY
                            //   if (
                            //     printEnabled &&
                            //     Number(item.ready_status) === 1
                            //   ) {
                            //     console.log("PRINT TRIGGERED (READY ITEM)");
                            //     printKOT(order);
                            //   } else {
                            //     console.log("NOT PRINTING - item not ready");
                            //   }

                            //   updateSingleItem(order, item); // just call API

                            //   setModalMessage({
                            //     message: "Item Updated",
                            //     kotNo: order.kotId ?? order.id,
                            //     orderType: order.orderType,
                            //   });
                            // }}
                            style={{
                              cursor: "pointer",
                              backgroundColor:
                                item.order_status === 1
                                  ? "#c8f7c5"
                                  : "#fad9d9ff",
                              borderRadius: "6px",
                              padding: "4px",
                              margin: "2px",
                            }}
                          >
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns: "1fr auto auto",
                                gap: "10px",
                              }}
                            >
                              <div>
                                <strong>{item.name}</strong>
                                <br />
                                <span
                                  style={{ fontSize: "0.75rem", color: "blue" }}
                                >
                                  {item.comments}
                                </span>
                              </div>

                              <div>
                                <strong> {item.qty}</strong>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <p className="kitchen-timer">
                      <strong>
                        Waiting: {getElapsedTime(order.timestamp)}
                      </strong>
                    </p>
                  </div>
                </div>
              );
            })}
        </Masonry>
      </div>
      {toast && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",

            backgroundColor: "rgba(255, 77, 79, 0.85)", // 🔴 low opacity red
            color: "#fff",

            padding: "16px 24px",
            borderRadius: "10px",

            zIndex: 9999,
            fontWeight: "600",

            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
            backdropFilter: "blur(4px)",

            textAlign: "center",
            minWidth: "250px",
          }}
        >
          {toast}
        </div>
      )}
      {showRecall && (
        <div className="recall-backdrop">
          <div className="recall-modal">
            <div className="recall-header-bar">
              <h2 className="recall-title">
                Delivered Orders ({groupedRecallData.length})
              </h2>

              <button
                className="recall-close-btn"
                onClick={() => setShowRecall(false)}
              >
                ✕
              </button>
            </div>

            <div className="recall-content">
              <Masonry
                breakpointCols={{
                  default: 3,
                  1024: 2,
                  768: 1,
                }}
                className="kitchen-grid"
                columnClassName="kitchen-grid-column"
              >
                {groupedRecallData.map((order) => (
                  <div
                    key={order.kotNo}
                    className="kitchen-card"
                    style={{
                      border: "2px solid green",
                      backgroundColor: "#eaffea",
                    }}
                  >
                    <div className="Pressable-card">
                      {/* HEADER */}
                      <div className="ticket-header">
                        <div style={{ borderBottom: "1px solid #ddd" }}>
                          <label
                            style={{ cursor: "pointer", fontWeight: "bold" }}
                          >
                            <input
                              type="checkbox"
                              checked={isAllSelected(order)}
                              onChange={() => toggleSelectAll(order)}
                              style={{ marginRight: "6px" }}
                            />
                            {""}
                          </label>
                        </div>
                        <span>
                          <strong>{order.orderType}</strong>
                        </span>
                        <span>
                          <strong>KOT #{order.kotNo}</strong>
                        </span>
                        <span>
                          <strong>Token #{order.token || "-"}</strong>
                        </span>
                      </div>

                      {/* SELECT ALL */}

                      {/* ITEMS */}
                      <ul className="kitchen-item-list">
                        {order.items.map((item, idx) => {
                          const key = `${item.KOT_NO}-${item.I_Code}-${item.BillNO}`;

                          return (
                            <li key={idx} className="recall-item">
                              <input
                                type="checkbox"
                                checked={!!selectedRecallItems[key]}
                                onChange={() => toggleRecallItem(item)}
                              />

                              <span>{item.I_Name}</span>
                              <span>x{item.Qty}</span>
                            </li>
                          );
                        })}
                      </ul>

                      {/* TIME */}
                    </div>
                    <div className="recall-card-footer">
                      <button
                        className="recall-action-btn"
                        onClick={() => handleRecallPerOrder(order)}
                      >
                        Recall
                      </button>
                    </div>
                  </div>
                ))}
              </Masonry>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default DeliveryScreen;
