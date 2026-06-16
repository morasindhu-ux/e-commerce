import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProductById } from "../services/productService";
import { getCart, addToCart } from "../services/cartService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from "chart.js";
import { Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [cartItem, setCartItem] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    loadProductData();
  }, [id]);

  const loadProductData = async () => {
    try {
      const [productRes, cartRes] = await Promise.all([
        getProductById(id),
        getCart()
      ]);

      if (productRes.data.success) {
        const fetchedProduct = productRes.data.product;
        setProduct(fetchedProduct);
        generateMockChart(fetchedProduct.price);
      } else {
        setError("Product not found");
      }

      if (cartRes.data.success) {
        const itemInCart = cartRes.data.cart.items.find(
          (item) => (item.product?._id || item.product) === id
        );
        setCartItem(itemInCart || null);
      }
    } catch (err) {
      console.error("Failed to load product details:", err);
      setError("Error loading product details");
    } finally {
      setLoading(false);
    }
  };

  // Generate simulated price trend chart
  const generateMockChart = (price) => {
    const days = 10;
    const labels = [];
    const dataPoints = [];
    
    let basePrice = price - (Math.random() * 20 - 10);
    for (let i = days; i >= 1; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString(undefined, { month: "short", day: "numeric" }));
      
      const diff = price - basePrice;
      const step = diff / i + (Math.random() * 6 - 3);
      basePrice += step;
      dataPoints.push(Number(basePrice.toFixed(2)));
    }
    
    labels.push("Today");
    dataPoints.push(price);

    setChartData({
      labels,
      datasets: [
        {
          label: "Price Fluctuation (₹)",
          data: dataPoints,
          borderColor: "#8b5cf6",
          backgroundColor: "rgba(139, 92, 246, 0.05)",
          borderWidth: 2,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#fff",
          tension: 0.3,
          fill: true
        }
      ]
    });
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setCartLoading(true);

    try {
      const res = await addToCart(product._id, quantity);
      if (res.data.success) {
        setMessage(`Successfully added ${quantity} unit(s) of ${product.title} to your shopping cart!`);
        setQuantity(1);
        
        // Trigger navbar update
        window.dispatchEvent(new Event("cart-updated"));
        
        // Refresh local representation
        const cartRes = await getCart();
        if (cartRes.data.success) {
          const itemInCart = cartRes.data.cart.items.find(
            (item) => (item.product?._id || item.product) === id
          );
          setCartItem(itemInCart || null);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add to cart");
    } finally {
      setCartLoading(false);
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val || 0);
  };

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

  if (loading) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ padding: "2rem 4rem" }}>
          Loading Product details...
        </div>
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="container animate-fade-in" style={{ padding: "4rem 1rem" }}>
        <div className="glass-card" style={{ maxWidth: "500px", margin: "0 auto" }}>
          <div className="alert alert-danger">{error}</div>
          <Link to="/" className="btn btn-primary">Return to Shop</Link>
        </div>
      </div>
    );
  }

  const estCost = quantity * product.price;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(10, 11, 16, 0.9)",
        borderColor: "rgba(255,255,255,0.08)",
        borderWidth: 1,
        titleFont: { fontFamily: "Inter" },
        bodyFont: { fontFamily: "Inter" }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#9ca3af", font: { family: "Inter" } }
      },
      y: {
        grid: { color: "rgba(255,255,255,0.04)" },
        ticks: { color: "#9ca3af", font: { family: "Inter" } }
      }
    }
  };

  const productReviews = product.reviews && product.reviews.length > 0
    ? product.reviews
    : [
        { _id: "rev1", name: "David M.", rating: 5, comment: "High quality item! Fast order processing.", createdAt: new Date(Date.now() - 86400000 * 3) },
        { _id: "rev2", name: "Amanda P.", rating: 4, comment: "Super convenient tumbler, keeps drinks ice cold.", createdAt: new Date(Date.now() - 86400000 * 7) }
      ];

  return (
    <div className="container animate-fade-in">
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        ← Back to Shop Store
      </Link>

      {/* Product Header */}
      <div className="detail-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          <div style={{
            width: "200px",
            height: "200px",
            borderRadius: "20px",
            background: "rgba(0, 0, 0, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            border: "1px solid var(--border-color)"
          }}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <span style={{ fontSize: "4.5rem" }}>{getCategoryEmoji(product.category)}</span>
            )}
          </div>
          <div className="detail-title-section">
            <h1 style={{ fontSize: "2rem" }}>{product.title}</h1>
            <div className="detail-meta">
              <span style={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--accent-purple)" }}>
                {product.category}
              </span>
              <span style={{ marginLeft: "1rem" }}>SKU: {product.sku}</span>
            </div>
          </div>
        </div>
        <div className="detail-price-section">
          <div className="detail-price">{formatCurrency(product.price)}</div>
          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Retail unit price</div>
        </div>
      </div>

      <div className="detail-layout">
        {/* Left Side: Chart, Spec, and Reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {/* Price Chart */}
          <div className="glass-card">
            <h2 style={{ textAlign: "left", fontSize: "1.3rem", marginBottom: "1rem" }}>Price Trend Chart</h2>
            <div className="chart-container">
              {chartData && <Line data={chartData} options={chartOptions} />}
            </div>
          </div>

          {/* Product description & spec */}
          <div className="glass-card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Product Details & Specifications</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {product.description}
            </p>

            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1.5rem",
              marginTop: "1.5rem",
              borderTop: "1px solid var(--border-color)",
              paddingTop: "1.5rem",
              fontSize: "0.9rem"
            }}>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Stock Inventory Status</span>
                <div style={{
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  color: product.stockQuantity > 0 ? "var(--color-green)" : "var(--color-red)",
                  marginTop: "0.25rem"
                }}>
                  {product.stockQuantity > 0 ? `In Stock (Available: ${product.stockQuantity})` : "Temporarily Out of Stock"}
                </div>
              </div>
              <div>
                <span style={{ color: "var(--text-secondary)" }}>Rating Metrics</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
                  <span style={{ color: "#fbbf24", fontSize: "1.2rem" }}>★</span>
                  <strong style={{ fontSize: "1.1rem" }}>{product.averageRating?.toFixed(1) || "4.5"} / 5</strong>
                  <span style={{ color: "var(--text-secondary)" }}>({product.numReviews || "12"} ratings)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="glass-card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1.3rem", marginBottom: "1.5rem" }}>Customer Reviews ({productReviews.length})</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {productReviews.map((rev) => (
                <div key={rev._id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", paddingBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                    <div style={{ fontWeight: 600 }}>{rev.name}</div>
                    <div style={{ display: "flex", gap: "2px" }}>
                      {[...Array(5)].map((_, i) => (
                        <span key={i} style={{ color: i < rev.rating ? "#fbbf24" : "var(--text-muted)", fontSize: "0.9rem" }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Reviewed on {new Date(rev.createdAt).toLocaleDateString()}
                  </div>
                  <p style={{ color: "var(--text-primary)", fontSize: "0.9rem", lineHeight: "1.5" }}>
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Cart Add Form Widget */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card">
            <div className="trade-widget">
              <h2 style={{ fontSize: "1.3rem", marginBottom: "1.5rem", color: "var(--accent-purple)" }}>Order Checkout</h2>

              {message && <div className="alert alert-success">{message}</div>}
              {error && <div className="alert alert-danger">{error}</div>}

              {/* Ownership metadata context */}
              <div style={{ marginBottom: "1.25rem", padding: "0.75rem", background: "rgba(255,255,255,0.02)", borderRadius: "8px", border: "1px solid var(--border-color)", fontSize: "0.85rem" }}>
                <div>Wallet balance: <strong>{formatCurrency(user?.balance)}</strong></div>
                <div style={{ marginTop: "0.25rem" }}>
                  Units in Cart: <strong>{cartItem ? cartItem.quantity : 0}</strong>
                </div>
              </div>

              <form onSubmit={handleAddToCart}>
                <div className="form-group">
                  <label className="form-label">Quantity to Add</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="form-input"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    required
                    disabled={product.stockQuantity === 0}
                  />
                </div>

                {/* Calculation breakdown summary */}
                <div className="trade-summary-row">
                  <span>Unit Price</span>
                  <span>{formatCurrency(product.price)}</span>
                </div>

                <div className="trade-total">
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>Estimated Cost</span>
                    <span>{formatCurrency(estCost)}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%" }}
                  disabled={cartLoading || product.stockQuantity === 0}
                >
                  {cartLoading ? "Adding..." : product.stockQuantity === 0 ? "Out of Stock" : "Add to Cart"}
                </button>
              </form>
            </div>
          </div>

          {/* Quick link to shopping cart */}
          <div className="glass-card" style={{ textAlign: "left" }}>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "0.75rem" }}>Frictionless Checkout</h3>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "1rem" }}>
              Add items to your cart and check out in seconds using your store wallet credit.
            </p>
            <Link to="/cart" className="btn btn-secondary" style={{ width: "100%", padding: "0.5rem" }}>
              Go to Shopping Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetail;
