import { useState, useEffect } from "react";
import api from "../services/api";

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productPages, setProductPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("customers"); // customers, products, orders

  // Form state for creating a new product listing
  const [sku, setSku] = useState("");
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadAdminData();
  }, [productPage]);

  const loadAdminData = async () => {
    setLoading(true);
    setError("");
    try {
      const [statsRes, usersRes, ordersRes, productsRes] = await Promise.all([
        api.get("/admin/stats"),
        api.get("/admin/users"),
        api.get("/admin/orders"),
        api.get(`/products?page=${productPage}`)
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (ordersRes.data.success) setOrders(ordersRes.data.orders);
      if (productsRes.data.success) {
        setProducts(productsRes.data.products);
        setProductPages(productsRes.data.pages);
      }
    } catch (err) {
      console.error("Failed to load admin data:", err);
      setError(err.response?.data?.message || "Failed to load store manager data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setActionLoading(true);

    if (!sku || !title || !price || !stockQuantity || !category || !description) {
      setError("Please fill in all required fields");
      setActionLoading(false);
      return;
    }

    try {
      const res = await api.post("/products", {
        sku,
        title,
        price: Number(price),
        stockQuantity: Number(stockQuantity),
        category,
        description,
        imageUrl
      });

      if (res.data.success) {
        setSuccess(`Successfully listed new product SKU: ${sku.toUpperCase()}`);
        setSku("");
        setTitle("");
        setPrice("");
        setStockQuantity("");
        setCategory("");
        setDescription("");
        setImageUrl("");
        setShowForm(false);
        
        // Reload statistics and product directory list
        const [statsRes, productsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get(`/products?page=${productPage}`)
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
          setProductPages(productsRes.data.pages);
        }
      }
    } catch (err) {
      console.error("Failed to create product:", err);
      setError(err.response?.data?.message || "Failed to create product listing");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to remove this product from the store catalog?")) {
      return;
    }

    setSuccess("");
    setError("");
    setActionLoading(true);

    try {
      const res = await api.delete(`/products/${productId}`);
      if (res.data.success) {
        setSuccess(res.data.message);
        
        // Reload stats and products
        const [statsRes, productsRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get(`/products?page=${productPage}`)
        ]);
        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
          setProductPages(productsRes.data.pages);
        }
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
      setError(err.response?.data?.message || "Failed to delete product listing");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    setError("");
    setSuccess("");
    setActionLoading(true);

    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        setSuccess(`Order status updated to ${newStatus} successfully!`);
        
        // Reload order lists and KPIs stats
        const [ordersRes, statsRes] = await Promise.all([
          api.get("/admin/orders"),
          api.get("/admin/stats")
        ]);
        if (ordersRes.data.success) setOrders(ordersRes.data.orders);
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      setError(err.response?.data?.message || "Failed to update shipment status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this customer? All their order invoices and inventory lists will be deleted.")) {
      return;
    }

    setSuccess("");
    setError("");
    setActionLoading(true);

    try {
      const res = await api.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        setSuccess(res.data.message);
        
        // Reload users list, active orders, and statistics KPIs
        const [usersRes, ordersRes, statsRes] = await Promise.all([
          api.get("/admin/users"),
          api.get("/admin/orders"),
          api.get("/admin/stats")
        ]);
        if (usersRes.data.success) setUsers(usersRes.data.users);
        if (ordersRes.data.success) setOrders(ordersRes.data.orders);
        if (statsRes.data.success) setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error("Failed to delete customer:", err);
      setError(err.response?.data?.message || "Failed to delete customer account");
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val || 0);
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ padding: "2rem 4rem" }}>
          Loading Store Manager Panel...
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      <div style={{ textAlign: "left", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem" }}>Store Manager Dashboard</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Monitor store statistics, manage product inventories, and update customer order fulfillment statuses
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Admin KPIs stats block */}
      {stats && (
        <div className="admin-stats-grid">
          <div className="glass-card admin-card">
            <div className="stat-label">Registered Customers</div>
            <div className="stat-value">{stats.totalUsers}</div>
          </div>
          <div className="glass-card admin-card">
            <div className="stat-label">Product Catalog Items</div>
            <div className="stat-value">{stats.totalStocks}</div>
          </div>
          <div className="glass-card admin-card">
            <div className="stat-label">Active Customer Carts</div>
            <div className="stat-value">{stats.totalPortfolios}</div>
          </div>
          <div className="glass-card admin-card">
            <div className="stat-label">Gross Store Sales</div>
            <div className="stat-value" style={{ color: "var(--color-green)" }}>
              {formatCurrency(stats.totalVolume)}
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="trade-tabs" style={{ marginBottom: "2rem" }}>
        <button
          className={`btn trade-tab ${activeTab === "customers" ? "active buy" : ""}`}
          onClick={() => setActiveTab("customers")}
          style={{ background: "transparent", border: "none" }}
        >
          👤 Customer Directory
        </button>
        <button
          className={`btn trade-tab ${activeTab === "products" ? "active buy" : ""}`}
          onClick={() => setActiveTab("products")}
          style={{ background: "transparent", border: "none" }}
        >
          📦 Product Catalog
        </button>
        <button
          className={`btn trade-tab ${activeTab === "orders" ? "active buy" : ""}`}
          onClick={() => setActiveTab("orders")}
          style={{ background: "transparent", border: "none" }}
        >
          🚚 Fulfillment Center ({orders.filter(o => o.status === "PENDING").length} Pending)
        </button>
      </div>

      {/* TAB CONTENT: Customers Directory */}
      {activeTab === "customers" && (
        <div className="glass-card">
          <h2 style={{ textAlign: "left", marginBottom: "1rem" }}>Customer Accounts Directory</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Registration Date</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Store Wallet Credit</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ fontWeight: 600 }}>{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`badge ${u.role === "ADMIN" ? "badge-success" : "badge-secondary"}`} style={{
                        background: u.role === "ADMIN" ? "rgba(139, 92, 246, 0.15)" : "rgba(255,255,255,0.05)",
                        color: u.role === "ADMIN" ? "var(--accent-purple)" : "var(--text-secondary)"
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600, color: "var(--color-green)" }}>
                      {formatCurrency(u.balance)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {u.role !== "ADMIN" ? (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          className="btn btn-danger"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          disabled={actionLoading}
                        >
                          Remove Customer
                        </button>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Protected Admin Account</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT: Products Catalog */}
      {activeTab === "products" && (
        <div>
          {/* Create Product Expandable section */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
            <h2 style={{ margin: 0, fontSize: "1.5rem" }}>Product Inventory Listings</h2>
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn btn-primary"
              style={{ fontSize: "0.85rem", padding: "0.5rem 1rem" }}
            >
              {showForm ? "✕ Close Listing Form" : "＋ Add New Product Listing"}
            </button>
          </div>

          {showForm && (
            <div className="glass-card" style={{ marginBottom: "2rem", textAlign: "left" }}>
              <h3 style={{ marginBottom: "1.25rem" }}>Create New Product Listing</h3>
              <form onSubmit={handleCreateProduct}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
                  <div className="form-group">
                    <label className="form-label">Product SKU (Must be unique)*</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. IPHONE15PRO"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Product Title / Name*</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Apple iPhone 15 Pro"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Price (INR)*</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      className="form-input"
                      placeholder="e.g. 999.99"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Initial Stock Quantity*</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      placeholder="e.g. 50"
                      value={stockQuantity}
                      onChange={(e) => setStockQuantity(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category (e.g. Electronics, Fashion)*</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Electronics"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Image URL (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="https://example.com/product.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group" style={{ marginTop: "0.5rem" }}>
                  <label className="form-label">Detailed Product Description*</label>
                  <textarea
                    className="form-input"
                    rows="3"
                    placeholder="Provide full specifications, package content details, and warranty terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={{ resize: "vertical" }}
                    required
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Creating Listing..." : "List Product on Store"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Product list table */}
          <div className="glass-card">
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>SKU</th>
                    <th>Product Title</th>
                    <th>Category</th>
                    <th style={{ textAlign: "right" }}>Price</th>
                    <th style={{ textAlign: "center" }}>Stock Left</th>
                    <th style={{ textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id}>
                      <td style={{ fontFamily: "monospace", fontWeight: 600, color: "var(--accent-purple)" }}>
                        {p.sku}
                      </td>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td>{p.category}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>{formatCurrency(p.price)}</td>
                      <td style={{ textAlign: "center" }}>
                        <span
                          className="badge"
                          style={{
                            background: p.stockQuantity < 10 ? "var(--color-red-glow)" : "rgba(255,255,255,0.05)",
                            color: p.stockQuantity < 10 ? "var(--color-red)" : "var(--text-primary)",
                            fontWeight: 700
                          }}
                        >
                          {p.stockQuantity} units
                        </span>
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          onClick={() => handleDeleteProduct(p._id)}
                          className="btn btn-danger"
                          style={{ padding: "0.3rem 0.6rem", fontSize: "0.75rem" }}
                          disabled={actionLoading}
                        >
                          Remove Listing
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {productPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", marginTop: "1.5rem" }}>
                <button
                  onClick={() => setProductPage(prev => Math.max(prev - 1, 1))}
                  disabled={productPage === 1}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  ◀ Previous
                </button>
                <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
                  Page <strong>{productPage}</strong> of {productPages}
                </span>
                <button
                  onClick={() => setProductPage(prev => Math.min(prev + 1, productPages))}
                  disabled={productPage === productPages}
                  className="btn btn-secondary"
                  style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Order Fulfillment Center */}
      {activeTab === "orders" && (
        <div className="glass-card">
          <h2 style={{ textAlign: "left", marginBottom: "1rem" }}>Shipment Fulfillment Directory</h2>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Order Date</th>
                  <th>Customer Info</th>
                  <th>Purchased Items</th>
                  <th style={{ textAlign: "right" }}>Total Amount</th>
                  <th>Delivery Address</th>
                  <th>Shipment Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
                      No active orders found in the database.
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o._id}>
                      <td>
                        <div>{new Date(o.createdAt).toLocaleDateString()}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {new Date(o.createdAt).toLocaleTimeString()}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{o.user?.name || "Deleted User"}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          {o.user?.email || "N/A"}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "0.85rem", maxWidth: "300px", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "normal" }}>
                          {o.items.map((item, idx) => (
                            <div key={idx} style={{ marginBottom: "2px" }}>
                              • {item.product?.title || "Item"} <strong>x{item.quantity}</strong>
                            </div>
                          ))}
                        </div>
                      </td>
                      <td style={{ textAlign: "right", fontWeight: 700, color: "var(--text-primary)" }}>
                        {formatCurrency(o.totalAmount)}
                      </td>
                      <td>
                        <div style={{ fontSize: "0.8rem", maxWidth: "200px", whiteSpace: "normal" }}>
                          {o.shippingAddress}
                        </div>
                      </td>
                      <td>
                        <select
                          value={o.status}
                          onChange={(e) => handleUpdateOrderStatus(o._id, e.target.value)}
                          className="form-input"
                          style={{
                            padding: "0.3rem 0.6rem",
                            fontSize: "0.8rem",
                            borderRadius: "6px",
                            background: o.status === "DELIVERED" ? "var(--color-green-glow)" : o.status === "PENDING" ? "rgba(245, 158, 11, 0.15)" : "rgba(59, 130, 246, 0.15)",
                            color: o.status === "DELIVERED" ? "var(--color-green)" : o.status === "PENDING" ? "#f59e0b" : "var(--accent-blue)",
                            border: "1px solid var(--border-color)",
                            fontWeight: 600,
                            cursor: "pointer"
                          }}
                          disabled={actionLoading}
                        >
                          <option value="PENDING" style={{ background: "var(--bg-secondary)", color: "#f59e0b" }}>PENDING</option>
                          <option value="SHIPPED" style={{ background: "var(--bg-secondary)", color: "var(--accent-blue)" }}>SHIPPED</option>
                          <option value="DELIVERED" style={{ background: "var(--bg-secondary)", color: "var(--color-green)" }}>DELIVERED</option>
                          <option value="CANCELLED" style={{ background: "var(--bg-secondary)", color: "var(--color-red)" }}>CANCELLED</option>
                        </select>
                      </td>
                    </tr>
                  )))}
                </tbody>
              </table>
            </div>
          </div>
      )}
    </div>
  );
};

export default Admin;

