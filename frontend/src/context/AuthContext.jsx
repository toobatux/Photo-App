import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { customFetch } from "../services/api";

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
      // 1. Refresh or initialize Django's security token
      // await customFetch("/api/csrf/");

      // 2. Ask Django for the profile belonging to the current session cookie
      const userData = await customFetch("/api/users/me/");

      // 3. Save the profile data into React's global memory
      setUser(userData);
      return userData;
    } catch (err) {
      // 4. If the cookie is expired, missing, or Django returns 401/403,
      // clear the user state to log them out cleanly
      console.log("Auth check failed:", err);
      setUser(null);
      return null;
    } finally {
      // 5. Turn off the loading state so the UI knows the check is done
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
