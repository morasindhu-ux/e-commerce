import { useState, useEffect } from "react";
import { getOrders } from "../services/orderService";

const Transactions = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await getOrders();
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch order history:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleOrder = (orderId) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val || 0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "DELIVERED":
        return "var(--color-green)";
      case "SHIPPED":
        return "var(--accent-blue)";
      case "CANCELLED":
        return "var(--color-red)";
      default:
        return "#f59e0b"; // Warning gold for PENDING
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case "DELIVERED":
        return "var(--color-green-glow)";
      case "SHIPPED":
        return "rgba(59, 130, 246, 0.15)";
      case "CANCELLED":
        return "var(--color-red-glow)";
      default:
        return "rgba(245, 158, 11, 0.15)";
    }
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ padding: "2rem 4rem" }}>
          Loading Order Invoices...
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: "left", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem" }}>Order History</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Track shipments, view detailed invoice details, and inspect purchase receipts
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {orders.length === 0 ? (
          <div className="glass-card" style={{ padding: "4rem 1rem", color: "var(--text-secondary)", textAlign: "center" }}>
            No purchase orders found. Browse products in the Store and complete checkout to generate your first invoice receipt.
          </div>
        ) : (
          orders.map((order) => {
            const isExpanded = expandedOrders[order._id];
            
            // Calculate stepper progress parameters
            let stepPercent = "0%";
            if (order.status === "SHIPPED") stepPercent = "50%";
            if (order.status === "DELIVERED") stepPercent = "100%";

            return (
              <div
                key={order._id}
                className="glass-card"
                style={{
                  padding: 0,
                  overflow: "hidden",
                  borderLeft: `4px solid ${getStatusColor(order.status)}`,
                  transition: "all 0.3s ease",
                }}
              >
                {/* Header of Collapsible receipt card */}
                <div
                  onClick={() => toggleOrder(order._id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "1.25rem 1.5rem",
                    cursor: "pointer",
                    userSelect: "none",
                    background: "rgba(255, 255, 255, 0.01)",
                  }}
                >
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center", textAlign: "left" }}>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ORDER PLACED</div>
                      <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>TOTAL AMOUNT</div>
                      <div style={{ fontWeight: 700, color: "var(--text-primary)", fontSize: "0.95rem" }}>
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>ORDER ID</div>
                      <div style={{ fontFamily: "monospace", fontSize: "0.85rem", color: "var(--accent-purple)", fontWeight: 600 }}>
                        #{order._id.substring(order._id.length - 8).toUpperCase()}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <span
                      className="badge"
                      style={{
                        background: getStatusBg(order.status),
                        color: getStatusColor(order.status),
                        fontSize: "0.8rem",
                        padding: "0.3rem 0.6rem",
                        borderRadius: "6px",
                      }}
                    >
                      {order.status}
                    </span>
                    <span style={{
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 0.2s ease",
                      fontSize: "1.2rem",
                      color: "var(--text-secondary)"
                    }}>
                      ▼
                    </span>
                  </div>
                </div>

                {/* Collapsible Details section */}
                {isExpanded && (
                  <div
                    style={{
                      borderTop: "1px solid var(--border-color)",
                      padding: "1.5rem",
                      background: "rgba(0, 0, 0, 0.15)",
                    }}
                  >
                    {/* Visual Stepper timeline */}
                    {order.status !== "CANCELLED" ? (
                      <div style={{ marginBottom: "2rem", padding: "0 1rem" }}>
                        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", height: "30px" }}>
                          {/* Background tracker line */}
                          <div style={{
                            position: "absolute",
                            left: "0",
                            right: "0",
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: "3px",
                            background: "rgba(255, 255, 255, 0.08)",
                            zIndex: 1,
                          }} />
                          {/* Active tracker line */}
                          <div style={{
                            position: "absolute",
                            left: "0",
                            width: stepPercent,
                            top: "50%",
                            transform: "translateY(-50%)",
                            height: "3px",
                            background: "var(--accent-purple)",
                            boxShadow: "0 0 8px var(--accent-glow)",
                            zIndex: 2,
                            transition: "width 0.5s ease",
                          }} />
                          
                          {/* Dot 1: Placed */}
                          <div style={{ zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              background: "var(--accent-purple)",
                              border: "3px solid var(--bg-primary)",
                              boxShadow: "0 0 6px var(--accent-glow)",
                            }} />
                            <div style={{ fontSize: "0.75rem", fontWeight: 600, marginTop: "4px", color: "var(--text-primary)" }}>Placed</div>
                          </div>

                          {/* Dot 2: Shipped */}
                          <div style={{ zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              background: (order.status === "SHIPPED" || order.status === "DELIVERED") ? "var(--accent-purple)" : "var(--bg-secondary)",
                              border: `3px solid ${(order.status === "SHIPPED" || order.status === "DELIVERED") ? "var(--bg-primary)" : "var(--border-color)"}`,
                              boxShadow: (order.status === "SHIPPED" || order.status === "DELIVERED") ? "0 0 6px var(--accent-glow)" : "none",
                              transition: "all 0.3s ease",
                            }} />
                            <div style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              marginTop: "4px",
                              color: (order.status === "SHIPPED" || order.status === "DELIVERED") ? "var(--text-primary)" : "var(--text-muted)",
                            }}>Shipped</div>
                          </div>

                          {/* Dot 3: Delivered */}
                          <div style={{ zIndex: 3, display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <div style={{
                              width: "18px",
                              height: "18px",
                              borderRadius: "50%",
                              background: order.status === "DELIVERED" ? "var(--color-green)" : "var(--bg-secondary)",
                              border: `3px solid ${order.status === "DELIVERED" ? "var(--bg-primary)" : "var(--border-color)"}`,
                              boxShadow: order.status === "DELIVERED" ? "0 0 6px var(--color-green-glow)" : "none",
                              transition: "all 0.3s ease",
                            }} />
                            <div style={{
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              marginTop: "4px",
                              color: order.status === "DELIVERED" ? "var(--text-primary)" : "var(--text-muted)",
                            }}>Delivered</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="alert alert-danger" style={{ marginBottom: "1.5rem", textAlign: "left" }}>
                        This order was Cancelled. If you paid via Wallet Credit, your balance has been refunded.
                      </div>
                    )}

                    {/* Metadata & Delivery Info */}
                    <div style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                      gap: "1.5rem",
                      marginBottom: "1.5rem",
                      padding: "1rem",
                      background: "rgba(255, 255, 255, 0.02)",
                      borderRadius: "8px",
                      border: "1px solid var(--border-color)",
                      textAlign: "left",
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                          Shipping Address
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-primary)", whiteSpace: "pre-line" }}>
                          {order.shippingAddress}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "0.25rem" }}>
                          Payment Information
                        </div>
                        <div style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>
                          Method: {order.paymentMethod || "Wallet Credit"}
                        </div>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "2px" }}>
                          Transaction Status: Paid & Settled
                        </div>
                      </div>
                    </div>

                    {/* Ordered Items Invoice Listing */}
                    <div className="table-container" style={{ margin: 0 }}>
                      <table className="custom-table" style={{ background: "transparent" }}>
                        <thead>
                          <tr>
                            <th>Product Thumbnail</th>
                            <th>Item Specs Title</th>
                            <th style={{ textAlign: "center" }}>Qty</th>
                            <th style={{ textAlign: "right" }}>Unit Price</th>
                            <th style={{ textAlign: "right" }}>Subtotal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items.map((item, idx) => (
                            <tr key={item._id || idx}>
                              <td style={{ width: "100px" }}>
                                <div
                                  className="product-image-placeholder"
                                  style={{
                                    height: "50px",
                                    width: "70px",
                                    borderRadius: "6px",
                                    fontSize: "1rem",
                                    margin: 0,
                                  }}
                                >
                                  📦
                                </div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: "var(--text-primary)", textAlign: "left" }}>
                                  {item.product?.title || "Retail Product Listing"}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", textAlign: "left" }}>
                                  SKU: {item.product?.sku || "N/A"} | Category: {item.product?.category || "General"}
                                </div>
                              </td>
                              <td style={{ textAlign: "center", fontWeight: 600 }}>{item.quantity}</td>
                              <td style={{ textAlign: "right" }}>{formatCurrency(item.price)}</td>
                              <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>
                                {formatCurrency(item.price * item.quantity)}
                              </td>
                            </tr>
                          ))}
                          {/* Invoice Bottom Subtotals */}
                          <tr>
                            <td colSpan="3" style={{ border: "none" }}></td>
                            <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "none" }}>
                              Subtotal:
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "none" }}>
                              {formatCurrency(order.totalAmount)}
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="3" style={{ border: "none" }}></td>
                            <td style={{ textAlign: "right", fontWeight: 600, color: "var(--text-secondary)", borderBottom: "none" }}>
                              Shipping & Handling:
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 600, color: "var(--color-green)", borderBottom: "none" }}>
                              FREE
                            </td>
                          </tr>
                          <tr>
                            <td colSpan="3" style={{ border: "none" }}></td>
                            <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>
                              Order Total:
                            </td>
                            <td style={{ textAlign: "right", fontWeight: 800, color: "var(--accent-purple)", fontSize: "1.1rem" }}>
                              {formatCurrency(order.totalAmount)}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Transactions;

