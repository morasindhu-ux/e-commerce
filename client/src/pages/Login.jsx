import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      navigate("/");
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="auth-container animate-fade-in" style={{ minHeight: "calc(100vh - 80px)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="auth-split-container">
        {/* Left Side: Brand Value Proposition Info Panel */}
        <div className="auth-info-panel">
          <div className="auth-brand-name">ShopEZ</div>
          <p style={{ fontSize: "1rem", lineHeight: "1.6", color: "var(--text-secondary)" }}>
            ShopEZ is your one-stop destination for effortless online shopping. With a user-friendly interface and a comprehensive product catalog, finding the perfect items has never been easier.
          </p>
          <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginTop: "1rem" }}>
            Seamlessly navigate through detailed product descriptions, customer reviews, and available discounts to make informed decisions. Enjoy a secure checkout process and receive instant order confirmation.
          </p>
          <p style={{ fontSize: "0.95rem", lineHeight: "1.6", color: "var(--text-secondary)", marginTop: "1rem" }}>
            For sellers, our robust dashboard provides efficient order management and insightful analytics to drive business growth. Experience the future of online shopping with ShopEZ today.
          </p>

          <ul className="auth-feature-list">
            <li className="auth-feature-item">
              <span className="auth-feature-icon">🛍️</span>
              <div>
                <strong>Effortless Discovery:</strong> Find any product in our dynamic retail database instantly.
              </div>
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">🛡️</span>
              <div>
                <strong>Secure Payments:</strong> Instantly process checkout carts using virtual store credits.
              </div>
            </li>
            <li className="auth-feature-item">
              <span className="auth-feature-icon">📈</span>
              <div>
                <strong>Seller Intelligence:</strong> Harness dashboard insights and track gross store sales volume.
              </div>
            </li>
          </ul>
        </div>

        {/* Right Side: Login Form Panel */}
        <div className="auth-form-panel">
          <h2 className="auth-title" style={{ fontSize: "1.75rem", marginBottom: "0.5rem", textAlign: "left" }}>Welcome Back</h2>
          <p className="auth-subtitle" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "2rem", textAlign: "left" }}>
            Sign in to access your ShopEZ account
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: "2rem" }}>
            Don't have an account?{" "}
            <Link to="/register" className="auth-link">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
