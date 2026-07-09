import { Suspense, type ReactNode } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import FarmerRoute from "./auth/FarmerRoute";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import AdminLayout from "./layouts/AdminLayout";
import FarmerLayout from "./layouts/FarmerLayout";

import LandingPage from "./pages/public/LandingPage";
import PublicHomePage from "./pages/public/PublicHomePage";
import LoginPage from "./pages/public/LoginPage";
import UnauthorizedPage from "./pages/public/UnauthorizedPage";
import NotFoundPage from "./pages/public/NotFoundPage";

import DashboardHome from "./pages/dashboard/DashboardHome";
import FarmersList from "./pages/dashboard/FarmersList";
import AlertsList from "./pages/dashboard/AlertsList";
import HealthLogsList from "./pages/dashboard/HealthLogsList";

import FarmerHome from "./pages/farmer/FarmerHome";
import FarmerPlots from "./pages/farmer/FarmerPlots";
import FarmerAlerts from "./pages/farmer/FarmerAlerts";
import FarmerHealthLogs from "./pages/farmer/FarmerHealthLogs";
import FarmerProfile from "./pages/farmer/FarmerProfile";

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
    element: <SuspenseWrapper><LandingPage /></SuspenseWrapper>,
  },
  {
    path: "/app",
    element: <SuspenseWrapper><PublicLayout /></SuspenseWrapper>,
    children: [
      { index: true, element: <SuspenseWrapper><PublicHomePage /></SuspenseWrapper> },
    ],
  },
  {
    path: "/login",
    element: <SuspenseWrapper><PublicLayout /></SuspenseWrapper>,
    children: [
      { index: true, element: <SuspenseWrapper><LoginPage /></SuspenseWrapper> },
    ],
  },
  {
    path: "/unauthorized",
    element: <SuspenseWrapper><PublicLayout /></SuspenseWrapper>,
    children: [
      { index: true, element: <SuspenseWrapper><UnauthorizedPage /></SuspenseWrapper> },
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
    path: "/farmer",
    element: (
      <FarmerRoute>
        <SuspenseWrapper><FarmerLayout /></SuspenseWrapper>
      </FarmerRoute>
    ),
    children: [
      { index: true, element: <SuspenseWrapper><FarmerHome /></SuspenseWrapper> },
      { path: "plots", element: <SuspenseWrapper><FarmerPlots /></SuspenseWrapper> },
      { path: "alerts", element: <SuspenseWrapper><FarmerAlerts /></SuspenseWrapper> },
      { path: "health-logs", element: <SuspenseWrapper><FarmerHealthLogs /></SuspenseWrapper> },
      { path: "profile", element: <SuspenseWrapper><FarmerProfile /></SuspenseWrapper> },
    ],
  },
  {
    path: "*",
    element: <SuspenseWrapper><NotFoundPage /></SuspenseWrapper>,
  },
]);
