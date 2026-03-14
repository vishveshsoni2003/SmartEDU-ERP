import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, role, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (role && user.role !== role) {
    // Special case: TRANSPORT_MANAGER (faculty) can access DRIVER routes
    if (role === "DRIVER" && user.role === "FACULTY" && user.facultyType?.includes("TRANSPORT_MANAGER")) {
      return children;
    }
    return <Navigate to="/" replace />;
  }

  // Check if user has one of required roles
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
