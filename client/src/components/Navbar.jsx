import { NavLink, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCart } from "../services/cartService";
import { useEffect, useState } from "react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);

  const fetchCartCount = async () => {
    try {
      const res = await getCart();
      if (res.data.success && res.data.cart) {
        const count = res.data.cart.items.reduce((acc, item) => acc + item.quantity, 0);
        setCartCount(count);
      }
    } catch (err) {
      console.error("Error fetching cart count in navbar:", err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user, location.pathname]);

  useEffect(() => {
    window.addEventListener("cart-updated", fetchCartCount);
    return () => {
      window.removeEventListener("cart-updated", fetchCartCount);
    };
  }, []);

  if (!user) return null;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(val);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          ShopEZ
        </Link>

        <div className="navbar-links">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Shop Store
          </NavLink>

          <NavLink
            to="/categories"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Categories
          </NavLink>
          
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            🛒 Cart ({cartCount})
          </NavLink>

          <NavLink
            to="/transactions"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            Order History
          </NavLink>

          <NavLink
            to="/wallet"
            className={({ isActive }) =>
              isActive ? "navbar-link active" : "navbar-link"
            }
          >
            💳 My Wallet
          </NavLink>

          {user.role === "ADMIN" && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                isActive ? "navbar-link active" : "navbar-link"
              }
            >
              Store Manager
            </NavLink>
          )}
        </div>

        <div className="navbar-profile">
          <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
            Hi, <strong>{user.name}</strong>
          </span>
          <button
            onClick={logout}
            className="btn btn-secondary"
            style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
