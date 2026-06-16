import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/cartService";
import { checkout } from "../services/orderService";

const CheckoutPage = () => {
  const { user, refreshUser } = useAuth();
  const [cart, setCart] = useState(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadCheckoutDetails();
  }, []);

  const loadCheckoutDetails = async () => {
    setLoading(true);
    try {
      const res = await getCart();
      if (res.data.success) {
        setCart(res.data.cart);
        if (!res.data.cart.items || res.data.cart.items.length === 0) {
          navigate("/cart");
        }
      }
    } catch (err) {
      console.error("Failed to load checkout details:", err);
      setError("Error loading cart details");
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setCheckoutLoading(true);

    try {
      const res = await checkout(shippingAddress);
      if (res.data.success) {
        setSuccess(res.data.message || "Order placed successfully!");
        await refreshUser(); // Update balance in navbar
        
        setTimeout(() => {
          navigate("/transactions");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Order placement failed");
    } finally {
      setCheckoutLoading(false);
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
          Loading Checkout Details...
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const cartTotal = items.reduce((acc, item) => acc + (item.product?.price || 0) * item.quantity, 0);
  const balanceAfter = user ? user.balance - cartTotal : 0;

  return (
    <div className="container animate-fade-in">
      <Link to="/cart" style={{ display: "inline-flex", alignItems: "center", color: "var(--text-secondary)", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        ← Back to Shopping Cart
      </Link>

      <div style={{ textAlign: "left", marginBottom: "2rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem" }}>Secure Checkout</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
          Confirm your delivery address and pay securely with your store wallet credit
        </p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="dashboard-grid">
        {/* Left Side: Shipping Address & Payment Form */}
        <div className="glass-card">
          <h2 style={{ textAlign: "left", marginBottom: "1.5rem" }}>Shipping Details</h2>
          
          <form onSubmit={handlePlaceOrder}>
            <div className="form-group" style={{ marginBottom: "2rem" }}>
              <label className="form-label">Full Shipping Address</label>
              <textarea
                className="form-input"
                style={{ minHeight: "100px", resize: "vertical", padding: "10px" }}
                placeholder="Enter street name, apartment, city, state, and zip code..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
                disabled={checkoutLoading || success}
              />
            </div>

            <h2 style={{ textAlign: "left", marginBottom: "1rem" }}>Payment Method</h2>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "1rem",
              borderRadius: "8px",
              background: "rgba(16, 185, 129, 0.05)",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              marginBottom: "2rem"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", textAlign: "left" }}>
                <span style={{ fontSize: "1.5rem" }}>💳</span>
                <div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>ShopEZ Store Wallet</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Direct debit from your account credit</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, color: "var(--color-green)" }}>
                {formatCurrency(user?.balance)}
              </div>
            </div>

            {user && user.balance < cartTotal && (
              <div className="alert alert-danger" style={{ fontSize: "0.85rem" }}>
                ⚠️ Your wallet balance is insufficient to process this order. Please contact administration or adjust your shopping cart.
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", padding: "0.9rem" }}
              disabled={checkoutLoading || success || (user && user.balance < cartTotal)}
            >
              {checkoutLoading ? "Processing Checkout..." : `Pay & Place Order (${formatCurrency(cartTotal)})`}
            </button>
          </form>
        </div>

        {/* Right Side: Order Summary Item List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card">
            <h2 style={{ textAlign: "left", marginBottom: "1rem" }}>Items in Order</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", maxHeight: "300px", overflowY: "auto", paddingRight: "5px" }}>
              {items.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                    paddingBottom: "0.5rem",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                    textAlign: "left"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{item.product?.title}</span>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>Qty: {item.quantity} × {formatCurrency(item.product?.price)}</div>
                  </div>
                  <div style={{ fontWeight: 600, color: "var(--text-primary)", textAlign: "right" }}>
                    {formatCurrency((item.product?.price || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", borderTop: "1px solid var(--border-color)", paddingTop: "1rem", marginTop: "1rem", fontSize: "0.85rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Current Wallet Balance</span>
                <span>{formatCurrency(user?.balance)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-secondary)" }}>Checkout Total Cost</span>
                <span>-{formatCurrency(cartTotal)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "0.95rem", borderTop: "1px dashed var(--border-color)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                <span style={{ color: "var(--text-primary)" }}>Balance After Checkout</span>
                <span style={{ color: balanceAfter < 0 ? "var(--color-red)" : "var(--color-green)" }}>
                  {formatCurrency(balanceAfter)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
