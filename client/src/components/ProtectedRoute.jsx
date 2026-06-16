import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading, token } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: "flex",
        height: "100vh",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "var(--font-heading)",
        fontSize: "1.2rem",
        color: "var(--text-secondary)"
      }}>
        <div className="glass-card" style={{ padding: "2rem 4rem" }}>
          Loading Session...
        </div>
      </div>
    );
  }

  // No authenticated user or token
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Guard for admin routes
  if (adminOnly && user.role !== "ADMIN") {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
