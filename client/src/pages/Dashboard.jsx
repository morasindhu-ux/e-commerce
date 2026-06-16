import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProducts } from "../services/productService";
import { getCart, addToCart } from "../services/cartService";
import { getOrders } from "../services/orderService";

const Dashboard = () => {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryParam = searchParams.get("category") || "";

  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState(null);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(categoryParam);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);

  // Sync category from URL search params
  useEffect(() => {
    setCategory(categoryParam);
  }, [categoryParam]);

  // Fetch all initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        await refreshUser(); // Update balance
        const [cartRes, productsRes, ordersRes] = await Promise.all([
          getCart(),
          getProducts(1, "", ""),
          getOrders(),
        ]);

        if (cartRes.data.success) setCart(cartRes.data.cart);
        if (productsRes.data.success) setProducts(productsRes.data.products);
        if (ordersRes.data.success) {
          // Display last 5 orders
          setOrders(ordersRes.data.orders);
        }
      } catch (err) {
        console.error("Failed to load storefront data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Fetch products based on search query or category
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        const res = await getProducts(1, search, category);
        if (res.data.success) {
          setProducts(res.data.products);
        }
      } catch (err) {
        console.error("Filtering failed:", err);
      }
    };

    const delayDebounce = setTimeout(() => {
      fetchFilteredProducts();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, category]);

  // Currency format helper
  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val || 0);
  };

  // Get matching category icon/emoji
  const getCategoryEmoji = (cat) => {
    if (!cat) return "📦";
    if (cat.includes("Electronics")) return "💻";
    if (cat.includes("Health")) return "🌿";
    if (cat.includes("Finance")) return "📊";
    if (cat.includes("Fashion") || cat.includes("Apparel")) return "👕";
    if (cat.includes("Hardware")) return "🛠️";
    if (cat.includes("Smartphones")) return "📱";
    if (cat.includes("Energy")) return "⚡";
    return "📦";
  };

  const handleAddToCart = async (e, productId) => {
    e.stopPropagation(); // Prevent navigation to details page
    setCartLoading(true);
    try {
      const res = await addToCart(productId, 1);
      if (res.data.success) {
        setCart(res.data.cart);
        // Trigger navbar count update
        window.dispatchEvent(new Event("cart-updated"));
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add product to cart");
    } finally {
      setCartLoading(false);
    }
  };

  // Calculations
  const cartItemCount = cart?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  const cartSubtotal = cart?.items?.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0) || 0;
  const totalAmountSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);

  if (loading) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ padding: "2rem 4rem" }}>
          Loading ShopEZ Storefront...
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in">
      {/* Welcome Hero Banner */}
      <div className="glass-card" style={{
        padding: "2rem",
        marginBottom: "2.5rem",
        textAlign: "left",
        background: "linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(59, 82, 246, 0.08) 100%)",
        borderRadius: "20px",
        border: "1px solid var(--border-color)",
        position: "relative",
        overflow: "hidden"
      }}>
        <div style={{ position: "relative", zIndex: 1 }}>
          <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 800 }}>Welcome to ShopEZ</h1>
          <p style={{ color: "var(--text-primary)", fontSize: "1rem", marginTop: "0.5rem", maxWidth: "800px", lineHeight: "1.5" }}>
            ShopEZ is your one-stop destination for effortless online shopping. Browse our comprehensive product catalog, navigate through detailed product descriptions, and enjoy secure checkouts with instant order confirmation.
          </p>
        </div>
        <div style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "150px",
          height: "150px",
          background: "var(--accent-purple)",
          filter: "blur(60px)",
          opacity: 0.15,
          pointerEvents: "none"
        }} />
      </div>

      {/* KPI Stats cards */}
      <div className="stats-panel">

        <div className="glass-card stat-card">
          <div className="stat-label">Items in Active Cart</div>
          <div className="stat-value">{cartItemCount} unit{cartItemCount !== 1 ? "s" : ""}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-label">Active Cart Value</div>
          <div className="stat-value" style={{ color: "var(--accent-purple)" }}>{formatCurrency(cartSubtotal)}</div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-label">Total Checkout Expenditure</div>
          <div className="stat-value" style={{ color: "var(--text-secondary)" }}>
            {formatCurrency(totalAmountSpent)}
          </div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1fr 300px" }}>
        {/* Left Side: Product Catalog Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Search & Category Filter Section */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, textAlign: "left" }}>Product Catalog</h2>
              <div style={{ display: "flex", gap: "0.5rem", flex: 1, maxWidth: "500px" }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by title or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ flex: 1 }}
                />
                <select
                  className="form-input"
                  value={category}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCategory(val);
                    if (val) {
                      setSearchParams({ category: val });
                    } else {
                      setSearchParams({});
                    }
                  }}
                  style={{ width: "160px" }}
                >
                  <option value="">All Categories</option>
                  <option value="Electronics & Tech">Electronics</option>
                  <option value="Fashion & Apparel">Fashion</option>
                  <option value="Health & Wellness">Health & Care</option>
                  <option value="Hardware & Tools">Hardware</option>
                </select>
              </div>
            </div>

            {products.length === 0 ? (
              <div style={{ padding: "4rem 1rem", color: "var(--text-secondary)", textAlign: "center" }}>
                <p style={{ fontSize: "1.1rem", fontWeight: 600 }}>No products found</p>
                <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Try adjusting your search criteria or category filter.</p>
              </div>
            ) : (
              <div className="product-grid">
                {products.map((p) => {
                  const cartItem = cart?.items?.find(item => (item.product?._id || item.product) === p._id);
                  return (
                    <div
                      key={p._id}
                      className="product-card"
                      onClick={() => navigate(`/stocks/${p._id}`)} // Route maps detail page
                      style={{ cursor: "pointer" }}
                    >
                      <div className="product-image-container">
                        {p.imageUrl ? (
                          <img src={p.imageUrl} alt={p.title} className="product-image" />
                        ) : (
                          <div className="product-image-placeholder" style={{ borderBottom: "none", height: "100%", width: "100%" }}>
                            {getCategoryEmoji(p.category)}
                          </div>
                        )}
                      </div>
                      <div className="product-info">
                        <div className="product-meta">
                          <span className="product-category">{p.category}</span>
                          <span className="product-ticker">SKU: {p.sku}</span>
                        </div>
                        <h3 className="product-name">{p.title}</h3>
                        <p className="product-desc-short">{p.description}</p>

                        {/* Rating block */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", marginBottom: "1rem", fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                          <span style={{ color: "#fbbf24" }}>★</span>
                          <strong style={{ color: "var(--text-primary)" }}>{p.averageRating?.toFixed(1) || "4.5"}</strong>
                          <span>({p.numReviews || "12"} reviews)</span>
                        </div>

                        <div className="product-footer">
                          <div className="product-price">{formatCurrency(p.price)}</div>
                          <button
                            onClick={(e) => handleAddToCart(e, p._id)}
                            className="btn btn-primary product-action-btn"
                            disabled={cartLoading || p.stockQuantity === 0}
                          >
                            {p.stockQuantity === 0 ? "Out of Stock" : cartItem ? `In Cart (${cartItem.quantity})` : "Add to Cart"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Cart Summary & Recent Orders */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Direct Cart Summary Panel */}
          <div className="glass-card" style={{ textAlign: "left" }}>
            <h2 style={{ marginBottom: "1rem" }}>My Cart</h2>
            {(!cart?.items || cart.items.length === 0) ? (
              <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "1rem 0" }}>
                Your shopping cart is empty
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "5px" }}>
                  {cart.items.map((item) => (
                    <div key={item._id} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", padding: "0.25rem 0" }}>
                      <span style={{ color: "var(--text-primary)", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", maxWidth: "150px" }}>
                        {item.product?.title}
                      </span>
                      <span style={{ color: "var(--text-secondary)", fontWeight: 600 }}>
                        {item.quantity} × {formatCurrency(item.product?.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div style={{ borderTop: "1px dashed var(--border-color)", paddingTop: "0.75rem", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem" }}>
                  <span>Subtotal:</span>
                  <span>{formatCurrency(cartSubtotal)}</span>
                </div>
                <button
                  onClick={() => navigate("/cart")}
                  className="btn btn-primary"
                  style={{ width: "100%", padding: "0.5rem", fontSize: "0.85rem", marginTop: "0.5rem" }}
                >
                  View Cart & Checkout
                </button>
              </div>
            )}
          </div>

          {/* Recent Orders Panel */}
          <div className="glass-card">
            <h2 style={{ textAlign: "left", marginBottom: "1rem" }}>Recent Orders</h2>
            {orders.length === 0 ? (
              <div style={{ padding: "1.5rem 1rem", color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center" }}>
                No orders placed yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {orders.slice(0, 4).map((order) => (
                  <div
                    key={order._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: "0.85rem",
                      padding: "0.5rem 0",
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)"
                    }}
                  >
                    <div style={{ textAlign: "left" }}>
                      <span className={`badge ${order.status === "DELIVERED"
                          ? "badge-success"
                          : order.status === "PENDING"
                            ? "badge-danger"
                            : "badge-secondary"
                        }`} style={{
                          background: order.status === "DELIVERED" ? "var(--color-green-glow)" : "rgba(251, 191, 36, 0.15)",
                          color: order.status === "DELIVERED" ? "var(--color-green)" : "#fbbf24"
                        }}>
                        {order.status}
                      </span>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div>{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</div>
                      <div style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                        {formatCurrency(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
