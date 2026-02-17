import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null; // Or a loading spinner

  if (!user) {
    // If no user is logged in, redirect to login page
    return <Navigate replace to="/login" />;
  }

  return children;
};

export default ProtectedRoute;