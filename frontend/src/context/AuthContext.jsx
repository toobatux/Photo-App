import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { customFetch, setCsrfToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const initAuth = async () => {
    const token = localStorage.getItem("accessToken");
  if (!token) {
    setUser(null);
    setLoading(false);
    return null;
  }

  // 2. Fetch current logged-in user profile using the JWT
  try {
    const userData = await customFetch("/api/users/me/");
    setUser(userData);
    return userData;
  } catch (err) {
    console.log("User token is invalid or expired");
    // Clean up stale tokens if request fails (401/403)
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    return null;
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    initAuth();
  }, []);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await customFetch("/api/users/me/");
      setUser(userData);
    } catch (err) {
      console.error("Failed to fetch user:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 3. Define an explicit login function to be called by your form
  const login = async (credentials) => {
    setLoading(true);
    try {
      const data = await customFetch('/api/token/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Save JWT access and refresh tokens in browser storage
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);

      // Immediately pull the fresh user details right after a successful 200 OK login
      await checkAuthStatus();
    } catch (err) {
      setLoading(false);
      throw err; // Pass the error back up to your login form UI
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await customFetch("/api/logout/", {
        method: "POST",
      });

      // Clear the user state on the frontend
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error.message);
      alert("Error logging out.");
    }
  };

  const contextValue = useMemo(
    () => ({
      user,
      setUser,
      loading,
      login,
      logout,
    }),
    [user, loading],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
