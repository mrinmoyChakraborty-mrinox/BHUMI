import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LOGO from "../LOGO_BHUMI.png";
import {
  Map, Layers, Users, Bell, ArrowLeft, LogOut, Menu, X,
} from "lucide-react";

const navItems = [
  { to: "/admin/districts", label: "Districts", icon: Map },
  { to: "/admin/wards", label: "Wards", icon: Layers },
  { to: "/admin/officers", label: "Officers", icon: Users },
  { to: "/admin/alerts", label: "Alert Mgmt", icon: Bell },
];

export default function AdminLayout() {
  const { officerName, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex flex-col md:flex-row">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between bg-white border-b-4 border-stone-900 px-4 py-3 sticky top-0 z-50">
        <Link to="/admin/districts" className="flex items-center gap-2 no-underline">
          <img src={LOGO} alt="BHUMI" className="w-8 h-8 rounded-lg border-2 border-stone-900 object-cover" />
          <span className="font-black text-sm">BHUMI Admin</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 border-2 border-stone-900 rounded-xl cursor-pointer"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={[
          "fixed md:sticky top-0 z-40 md:z-auto",
          "w-64 bg-white border-r-4 border-stone-900 flex flex-col shrink-0",
          "transition-transform duration-200 ease-in-out",
          "h-full md:h-screen",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="p-4 border-b-4 border-stone-900 hidden md:block">
          <Link to="/admin/districts" className="flex items-center gap-2 no-underline">
            <img src={LOGO} alt="BHUMI" className="w-8 h-8 rounded-lg border-2 border-stone-900 object-cover" />
            <span className="font-black text-sm">BHUMI Admin</span>
          </Link>
          <div className="mt-2 text-[10px] font-mono text-stone-500">
            {officerName && (
              <span className="block font-bold text-stone-700">{officerName}</span>
            )}
            <span className="uppercase tracking-wider text-amber-700">Admin</span>
          </div>
        </div>

        <div className="p-4 border-b-4 border-stone-900 md:hidden">
          <span className="block text-sm font-bold text-stone-900">{officerName || "Admin"}</span>
          <span className="text-[10px] font-mono uppercase tracking-wider text-amber-700">Admin</span>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 transition",
                  active
                    ? "bg-amber-500 text-white border-amber-500"
                    : "bg-white text-stone-700 border-transparent hover:border-stone-900 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]",
                ].join(" ")}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t-4 border-stone-900 space-y-1">
          <Link
            to="/dashboard"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 border-transparent hover:border-stone-900 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 border-transparent hover:border-red-500 hover:text-red-600 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
