import { Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";

import PublicHomePage from "./pages/public/PublicHomePage";
import LoginPage from "./pages/public/LoginPage";
import UnauthorizedPage from "./pages/public/UnauthorizedPage";
import NotFoundPage from "./pages/public/NotFoundPage";

import DashboardHome from "./pages/dashboard/DashboardHome";
import FarmersList from "./pages/dashboard/FarmersList";
import AlertsList from "./pages/dashboard/AlertsList";
import HealthLogsList from "./pages/dashboard/HealthLogsList";

import Districts from "./pages/admin/Districts";
import Wards from "./pages/admin/Wards";
import Officers from "./pages/admin/Officers";
import AlertsManage from "./pages/admin/AlertsManage";

function SuspenseWrapper({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-stone-50">
          <div className="animate-spin h-8 w-8 border-4 border-emerald-600 border-t-transparent rounded-full" />
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <SuspenseWrapper><PublicLayout /></SuspenseWrapper>,
    children: [
      { index: true, element: <SuspenseWrapper><PublicHomePage /></SuspenseWrapper> },
      { path: "login", element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
      { path: "unauthorized", element: <SuspenseWrapper><UnauthorizedPage /></SuspenseWrapper> },
    ],
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute requiredRole="any">
        <SuspenseWrapper><DashboardLayout /></SuspenseWrapper>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <SuspenseWrapper><DashboardHome /></SuspenseWrapper> },
      { path: "farmers", element: <SuspenseWrapper><FarmersList /></SuspenseWrapper> },
      { path: "alerts", element: <SuspenseWrapper><AlertsList /></SuspenseWrapper> },
      { path: "health-logs", element: <SuspenseWrapper><HealthLogsList /></SuspenseWrapper> },
    ],
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute requiredRole="admin">
        <SuspenseWrapper><AdminLayout /></SuspenseWrapper>
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/districts" replace /> },
      { path: "districts", element: <SuspenseWrapper><Districts /></SuspenseWrapper> },
      { path: "wards", element: <SuspenseWrapper><Wards /></SuspenseWrapper> },
      { path: "officers", element: <SuspenseWrapper><Officers /></SuspenseWrapper> },
      { path: "alerts", element: <SuspenseWrapper><AlertsManage /></SuspenseWrapper> },
    ],
  },
  {
    path: "*",
    element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper>,
  },
]);
