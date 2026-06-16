import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCart, updateCartItem, removeFromCart } from "../services/cartService";

const CartPage = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      setError("Error loading shopping cart");
    } finally {
      setLoading(false);
    }
  };

  const handleQtyChange = async (productId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;

    try {
      const res = await updateCartItem(productId, newQty);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemove = async (productId) => {
    if (!window.confirm("Remove this item from your cart?")) return;
    try {
      const res = await removeFromCart(productId);
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      setError("Failed to remove item");
    }
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val || 0);
  };

  const getCategoryEmoji = (sector) => {
    if (!sector) return "📦";
    if (sector.includes("Tech") || sector.includes("Technology")) return "💻";
    if (sector.includes("Health") || sector.includes("Wellness")) return "🌿";
    if (sector.includes("Fashion") || sector.includes("Apparel")) return "👕";
    if (sector.includes("Hardware") || sector.includes("Tools")) return "🛠️";
    return "📦";
  };

  if (loading) {
    return (
      <div style={{ display: "flex", flex: 1, alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div className="glass-card" style={{ padding: "2rem 4rem" }}>
          Loading Shopping Cart...
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const cartSubtotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);

  return (
    <div className="container animate-fade-in">
      <Link to="/" style={{ display: "inline-flex", alignItems: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        ← Back to Shop Store
      </Link>

      <div style={{ textAlign: "left", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem" }}>Shopping Cart</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Review your selected items and finalize your order
        </p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-grid">
        {/* Left Side: Cart Items List */}
        <div className="glass-card" style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <h2 style={{ textAlign: "left", marginBottom: "0.5rem" }}>Cart Items ({items.length})</h2>

          {items.length === 0 ? (
            <div style={{ padding: "4rem 1rem", color: "var(--text-secondary)", textAlign: "center" }}>
              <p style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Your cart is empty</p>
              <p style={{ fontSize: "0.85rem", marginBottom: "1.5rem" }}>Looks like you haven't added any products to your cart yet.</p>
              <Link to="/" className="btn btn-primary">Start Shopping</Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {items.map((item) => {
                const product = item.product;
                if (!product) return null;

                return (
                  <div
                    key={item._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1rem",
                      borderRadius: "12px",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--border-color)",
                      flexWrap: "wrap",
                      gap: "1rem"
                    }}
                  >
                    {/* Product visual info */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", textAlign: "left", flex: 1, minWidth: "200px" }}>
                      <div style={{
                        width: "50px",
                        height: "50px",
                        borderRadius: "8px",
                        background: "rgba(139, 92, 246, 0.1)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.5rem"
                      }}>
                        {getCategoryEmoji(product.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{product.title}</div>
                        <div style={{ fontSize: "0.75rem", color: "var(--accent-purple)", fontWeight: 700 }}>
                          {product.category}
                        </div>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                          SKU: {product.sku}
                        </div>
                      </div>
                    </div>

                    {/* Unit Price */}
                    <div style={{ minWidth: "80px", textAlign: "right" }}>
                      <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Price</div>
                      <div style={{ fontWeight: 600 }}>{formatCurrency(product.price)}</div>
                    </div>

                    {/* Quantity Selector */}
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        onClick={() => handleQtyChange(product._id, item.quantity, -1)}
                        className="btn btn-secondary"
                        style={{ padding: "0.3rem 0.6rem", minWidth: "28px" }}
                        disabled={item.quantity <= 1}
                      >
                        -
                      </button>
                      <span style={{ fontSize: "0.95rem", fontWeight: 700, minWidth: "24px", textAlign: "center" }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQtyChange(product._id, item.quantity, 1)}
                        className="btn btn-secondary"
                        style={{ padding: "0.3rem 0.6rem", minWidth: "28px" }}
                      >
                        +
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem", minWidth: "120px", justifyContent: "flex-end" }}>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Total</div>
                        <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>
                          {formatCurrency(product.price * item.quantity)}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(product._id)}
                        className="btn btn-danger"
                        style={{ padding: "0.4rem 0.6rem", fontSize: "0.8rem" }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Order Summary Card */}
        {items.length > 0 && (
          <div className="glass-card" style={{ height: "fit-content" }}>
            <h2 style={{ textAlign: "left", marginBottom: "1.5rem" }}>Order Summary</h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "1rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1.5rem", marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Subtotal</span>
                <span style={{ fontWeight: 600 }}>{formatCurrency(cartSubtotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem" }}>
                <span style={{ color: "var(--text-secondary)" }}>Shipping</span>
                <span style={{ color: "var(--color-green)", fontWeight: 600 }}>FREE</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "1.25rem", fontWeight: 700, marginBottom: "2rem" }}>
              <span>Total Price</span>
              <span>{formatCurrency(cartSubtotal)}</span>
            </div>

            <button
              onClick={() => navigate("/checkout")}
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.9rem" }}
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;
