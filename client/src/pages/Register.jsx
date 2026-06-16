import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await register(name, email, password);
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

        {/* Right Side: Registration Form Panel */}
        <div className="auth-form-panel">
          <h2 className="auth-title" style={{ fontSize: "1.75rem", marginBottom: "0.5rem", textAlign: "left" }}>Create Account</h2>
          <p className="auth-subtitle" style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: "2rem", textAlign: "left" }}>
            Get started with premium shopping today
          </p>

          {error && <div className="alert alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: "100%", marginTop: "1rem" }}
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>

          <p className="auth-footer" style={{ marginTop: "1.5rem" }}>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
