import { createContext, useState, useEffect, useContext } from "react";
import { loginUser, registerUser, getProfile } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // Recover session on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await getProfile();
          if (res.data && res.data.success) {
            setUser(res.data.user);
          } else {
            // Token is invalid
            handleLogout();
          }
        } catch (error) {
          console.error("Session recovery failed:", error);
          handleLogout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      const res = await loginUser({ email, password });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem("token", userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: "Login failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Invalid credentials";
      return { success: false, message };
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      const res = await registerUser({ name, email, password });
      if (res.data && res.data.success) {
        const { token: userToken, user: userData } = res.data;
        localStorage.setItem("token", userToken);
        setToken(userToken);
        setUser(userData);
        return { success: true };
      }
      return { success: false, message: "Registration failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      return { success: false, message };
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // Provide a manual refresh function to update user balance/holdings after buy/sell
  const refreshUser = async () => {
    if (token) {
      try {
        const res = await getProfile();
        if (res.data && res.data.success) {
          setUser(res.data.user);
        }
      } catch (error) {
        console.error("Failed to refresh user profile:", error);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
export default AuthContext;
