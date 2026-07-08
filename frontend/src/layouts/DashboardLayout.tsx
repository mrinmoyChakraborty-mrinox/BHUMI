import { Outlet, Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Sprout, LayoutDashboard, Users, Bell, Activity, LogOut } from "lucide-react";

const navItems = [
  { to: "/dashboard", label: "Summary", icon: LayoutDashboard },
  { to: "/dashboard/farmers", label: "Farmers", icon: Users },
  { to: "/dashboard/alerts", label: "Alerts", icon: Bell },
  { to: "/dashboard/health-logs", label: "Health Logs", icon: Activity },
];

export default function DashboardLayout() {
  const { officerName, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased flex">
      <aside className="w-64 bg-white border-r-4 border-stone-900 flex flex-col shrink-0">
        <div className="p-4 border-b-4 border-stone-900">
          <Link to="/dashboard" className="flex items-center gap-2 no-underline">
            <Sprout className="w-6 h-6 text-emerald-600" />
            <span className="font-black text-sm">BHUMI RSK</span>
          </Link>
          <div className="mt-2 text-[10px] font-mono text-stone-500">
            {officerName && (
              <span className="block font-bold text-stone-700">{officerName}</span>
            )}
            <span className="uppercase tracking-wider">
              {role === "admin" ? "Admin" : "RSK Officer"}
            </span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 transition ${
                  active
                    ? "bg-emerald-600 text-white border-emerald-600"
                    : "bg-white text-stone-700 border-transparent hover:border-stone-900 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t-4 border-stone-900">
          {role === "admin" && (
            <Link
              to="/admin/districts"
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 border-transparent hover:border-stone-900 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] mb-2"
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold font-mono border-2 border-transparent hover:border-red-500 hover:text-red-600 hover:shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
