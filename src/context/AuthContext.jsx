import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateUserState = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem("user", JSON.stringify(updatedUser));
  };

  const fetchUserProfile = async (token) => {
    try {
      const response = await fetch("http://localhost:5000/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
      } else {
        logout();
      }
    } catch (e) {
      console.error("Profile fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
  };

  const logout = async () => {
    try {
      // 1. Tell Supabase to end the session
      await supabase.auth.signOut(); 
    } catch (error) {
      console.error("Error logging out from Supabase:", error.message);
    } finally {
      // 2. Clear local data regardless of backend success
      setUser(null);
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUserState }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};