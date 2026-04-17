import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/**
 * ProtectedRoute
 * - `role` (string): require exact role match
 * - `roles` (array): require one of the listed roles
 * - no role/roles prop: any authenticated user passes
 */
export default function ProtectedRoute({ children, role, roles }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
