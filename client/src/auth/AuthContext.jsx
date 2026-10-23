import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiRequest, TOKEN_KEY } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener("bookleaf:unauthorized", handleUnauthorized);

    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return () => window.removeEventListener("bookleaf:unauthorized", handleUnauthorized);
    }

    apiRequest("/api/auth/me")
      .then((result) => setUser(result?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));

    return () => window.removeEventListener("bookleaf:unauthorized", handleUnauthorized);
  }, []);

  const value = useMemo(() => ({
    user,
    loading,
    async login(email, password) {
      const result = await apiRequest("/api/auth/login", {
        method: "POST",
        body: { email, password },
        auth: false,
      });
      if (!result?.token || !result?.user) throw new Error("The server returned an invalid login response.");
      localStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      return result.user;
    },
    logout() {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
