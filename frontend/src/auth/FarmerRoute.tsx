import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "./AuthContext";

interface Props {
  children: ReactNode;
}

export default function FarmerRoute({ children }: Props) {
  const { user, role, loading, farmerProfile, setLoginRedirect } = useAuthContext();
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

  // A farmer is identified by having a farmer profile record.
  if (farmerProfile) {
    return <>{children}</>;
  }

  // Logged in, but not as a farmer (e.g. RSK officer / admin).
  if (role === "admin" || role === "rsk_officer") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/app" replace />;
}
