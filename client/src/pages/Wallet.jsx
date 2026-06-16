import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { topupWallet } from "../services/authService";
import { getOrders } from "../services/orderService";

const Wallet = () => {
  const { user, refreshUser } = useAuth();
  const [amount, setAmount] = useState("");
  const [orders, setOrders] = useState([]);
  const [topupLoading, setTopupLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const res = await getOrders();
        if (res.data.success) {
          setOrders(res.data.orders);
        }
      } catch (err) {
        console.error("Failed to load orders in wallet page:", err);
      }
    };
    loadOrders();
  }, []);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR"
    }).format(val || 0);
  };

  const handleTopup = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    setErrorMessage("");

    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMessage("Please enter a valid amount greater than zero.");
      return;
    }

    setTopupLoading(true);
    try {
      const res = await topupWallet(numericAmount);
      if (res.data.success) {
        setSuccessMessage(res.data.message || `Successfully added ${formatCurrency(numericAmount)} to your wallet!`);
        setAmount("");
        await refreshUser(); // Update the global auth balance
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || "Failed to process topup. Please try again.");
    } finally {
      setTopupLoading(false);
    }
  };

  const handlePresetSelect = (presetVal) => {
    setAmount(presetVal.toString());
  };

  // Calculations
  const totalSpent = orders.reduce((acc, order) => acc + order.totalAmount, 0);
  const totalOrders = orders.length;

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: "3rem" }}>
      <div style={{ textAlign: "left", marginBottom: "2.5rem" }}>
        <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 800 }}>My Wallet</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1rem", marginTop: "0.5rem" }}>
          Manage your account balance and deposit mock credits for seamless purchases.
        </p>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        {/* Left column: Wallet Balance Display and Topup Card */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card wallet-card">
            <span style={{ fontSize: "0.95rem", color: "var(--text-secondary)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Available Balance
            </span>
            <div className="wallet-balance-display">
              {formatCurrency(user?.balance)}
            </div>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Wallet credits are directly deducted during order checkouts.
            </p>
          </div>

          <div className="glass-card" style={{ textAlign: "left" }}>
            <h2 style={{ marginBottom: "1rem" }}>Deposit Credits</h2>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginBottom: "1.5rem", lineHeight: "1.5" }}>
              Need more funds? Select a preset amount or enter a custom value below to mock-add credits instantly to your account.
            </p>

            {successMessage && <div className="alert alert-success">{successMessage}</div>}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <form onSubmit={handleTopup}>
              {/* Preset buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {[50, 100, 500, 1000].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className="btn btn-secondary"
                    style={{ padding: "0.5rem", fontSize: "0.85rem", fontWeight: 600 }}
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              <div className="form-group" style={{ marginBottom: "1.5rem" }}>
                <label className="form-label">Custom Deposit Amount (INR)</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>₹</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="form-input"
                    style={{ paddingLeft: "25px" }}
                    placeholder="Enter custom amount..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: "100%", padding: "0.8rem", fontWeight: 600 }}
                disabled={topupLoading}
              >
                {topupLoading ? "Depositing..." : "Add Funds to Wallet"}
              </button>
            </form>
          </div>
        </div>

        {/* Right column: Wallet Activity & Ledger stats */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div className="glass-card" style={{ textAlign: "left" }}>
            <h2 style={{ marginBottom: "1.5rem" }}>Activity Ledger</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Total Expenditures</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Spent on checkouts</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--text-primary)" }}>
                  {formatCurrency(totalSpent)}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Orders Placed</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Total checked out invoices</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                  {totalOrders}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>Average Order Value</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "0.2rem" }}>Spent per checkout transaction</div>
                </div>
                <div style={{ fontWeight: 700, fontSize: "1.1rem", color: "var(--accent-purple)" }}>
                  {formatCurrency(totalOrders > 0 ? totalSpent / totalOrders : 0)}
                </div>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ textAlign: "left", background: "rgba(139, 92, 246, 0.03)" }}>
            <h3 style={{ fontSize: "1.05rem", marginBottom: "0.75rem" }}>Frictionless & Free</h3>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
              ShopEZ runs on a virtual sandbox. No real money or payment integrations are used. Feel free to deposit and spend credit test assets as needed to validate features.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
