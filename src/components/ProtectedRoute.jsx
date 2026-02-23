import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  // If the AuthContext is still checking localStorage, show nothing/spinner
  if (loading) {
    return <div className="h-screen bg-[#1a164d]" />; 
  }

  // If no user is found, redirect them to the login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists, show the dashboard
  return children;
};

export default ProtectedRoute;