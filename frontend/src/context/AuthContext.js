import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true); // 🔑 important

  // 🔑 CHECK LOGIN USING COOKIE (RUNS ON EVERY TAB)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch("http://backend.sankalpam/auth/me", {
          credentials: "include", // 🔑 sends cookie
        });

        if (!res.ok) throw new Error("Not logged in");

        const data = await res.json();
        setUser(data.user);
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const logout = async () => {
    await fetch("http://backend.sankalpam/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
