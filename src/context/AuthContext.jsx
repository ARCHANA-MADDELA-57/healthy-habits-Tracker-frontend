import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on page load
    const loggedInStatus = localStorage.getItem("isLoggedIn");
    const storedUser = JSON.parse(localStorage.getItem("registeredUser"));
    
    if (loggedInStatus === "true" && storedUser) {
      setUser(storedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("isLoggedIn", "true");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("isLoggedIn");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};