import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { customFetch, setCsrfToken } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Give Django a quick moment to ensure CSRF is initialized,
  // then fetch the current logged-in user profile
  const initAuth = async () => {
    try {
      await customFetch("/api/csrf/");
      const userData = await customFetch("/api/users/me/");
      setUser(userData);
      return userData;
    } catch (err) {
      console.log("User is not logged in");
      setUser(null); // Set to null if 401/403 (unauthenticated)
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const checkAuthStatus = async () => {
  try {
    const userData = await customFetch("/api/users/me/");

    // Save CSRF token in memory for header injection
    // if (userData?.csrfToken) {
    //   setCsrfToken(userData.csrfToken);
    // }

    // 🔍 DEBUG LOG 3
    console.log("[AuthCheck] Received user data from Django:", userData);
    console.log("[AuthCheck] Extracted csrfToken:", userData?.csrfToken);

    if (userData?.csrfToken) {
      setCsrfToken(userData.csrfToken);
      console.log("[AuthCheck] Successfully called setCsrfToken!");
    } else {
      console.warn("[AuthCheck] ⚠️ No csrfToken found in response JSON!");
    }

    setUser(userData);
    return userData;
  } catch (err) {
    console.error("Session check failed:", err);
    setUser(null);
    return null;
  } finally {
    setLoading(false);
  }
};

  // 3. Define an explicit login function to be called by your form
  const login = async (credentials) => {
    setLoading(true);
    try {
      // First, hit your login endpoint
      await customFetch("/api/login/", {
        method: "POST",
        body: JSON.stringify(credentials),
      });

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
      logout
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
