import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "../auth/AuthContext.jsx";
import { getHomePath } from "../utils/format.js";
import { LoadingState } from "./States.jsx";

export default function ProtectedRoute({ role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <main className="auth-loading"><LoadingState label="Checking your session…" /></main>;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (role && user.role !== role) return <Navigate to={getHomePath(user)} replace />;
  return <Outlet />;
}
