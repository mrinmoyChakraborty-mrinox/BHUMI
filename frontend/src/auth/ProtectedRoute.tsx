import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext, type UserRole } from "./AuthContext";

interface Props {
  requiredRole?: UserRole | "any";
  children: ReactNode;
}

export default function ProtectedRoute({ requiredRole = "any", children }: Props) {
  const { user, role, loading, setLoginRedirect } = useAuthContext();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    setLoginRedirect(location.pathname + location.search);
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "admin" && role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}
