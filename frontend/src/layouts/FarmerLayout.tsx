import { useState } from "react";
import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";
import LOGO from "../LOGO_BHUMI.png";
import {
  Home, MapPin, Bell, Leaf, User, LogOut, Menu, X, Sparkles, ExternalLink,
} from "lucide-react";

const navItems = [
  { to: "/farmer", label: "Home", icon: Home, end: true },
  { to: "/farmer/plots", label: "My Plots", icon: MapPin },
  { to: "/farmer/alerts", label: "My Alerts", icon: Bell },
  { to: "/farmer/health-logs", label: "Health Logs", icon: Leaf },
  { to: "/farmer/profile", label: "My Profile", icon: User },
];

export default function FarmerLayout() {
  const { farmerProfile, logout } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const displayName = farmerProfile?.name || "Farmer";

  const isActive = (to: string, end?: boolean) =>
    end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex flex-col md:flex-row">
      {/* Top bar (always visible) */}
      <header className="md:hidden sticky top-0 z-50 bg-white border-b-4 border-stone-900 flex items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2 no-underline">
          <img src={LOGO} alt="BHUMI" className="w-8 h-8 rounded-lg border-2 border-stone-900 object-cover" />
          <span className="font-black text-sm">BHUMI Farmer</span>
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLogout}
            className="p-2 border-2 border-stone-200 rounded-xl hover:border-red-500 hover:text-red-600 cursor-pointer"
            aria-label="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 border-2 border-stone-900 rounded-xl cursor-pointer"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

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
        <div className="p-4 border-b-4 border-stone-900">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <img src={LOGO} alt="BHUMI" className="w-8 h-8 rounded-lg border-2 border-stone-900 object-cover" />
            <span className="font-black text-sm">BHUMI Farmer</span>
          </Link>
          <div className="mt-3 flex items-center gap-2 bg-emerald-50 border-2 border-emerald-600 rounded-2xl px-3 py-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-xs font-bold text-emerald-800 truncate">{displayName}</span>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = isActive(item.to, item.end);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={[
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 transition",
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-stone-700 border-transparent hover:border-stone-900 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]",
                ].join(" ")}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          <Link
            to="/app"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 border-transparent text-stone-500 hover:border-stone-900 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
          >
            <ExternalLink className="w-4 h-4" />
            Public Portal
          </Link>
        </nav>

        <div className="p-3 border-t-4 border-stone-900">
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
