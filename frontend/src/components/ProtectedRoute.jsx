import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const user  = token ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  if (!token || !user) return <Navigate to="/login" replace />;

  if (requiredRole && user.role !== requiredRole)
    return <Navigate to="/" replace />;

  return children;
}