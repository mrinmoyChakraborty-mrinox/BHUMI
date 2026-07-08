import { useState, useEffect, useCallback } from "react";
import { Users, Bell, AlertTriangle, MapPin, RefreshCw, Loader2 } from "lucide-react";
import { getDashboardSummary } from "../../api/endpoints/dashboard";
import type { DashboardSummary } from "../../api/types";

export default function DashboardHome() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to load summary");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const stats = summary
    ? [
        {
          label: "Farmers",
          value: summary.farmers,
          icon: Users,
          color: "bg-emerald-100 text-emerald-800",
          iconColor: "text-emerald-600",
        },
        {
          label: "Active Alerts",
          value: summary.active_alerts,
          icon: Bell,
          color: "bg-amber-100 text-amber-800",
          iconColor: "text-amber-600",
        },
        {
          label: "Flagged Health Cases",
          value: summary.flagged_health_cases,
          icon: AlertTriangle,
          color: "bg-red-100 text-red-800",
          iconColor: "text-red-600",
        },
        {
          label: "Wards",
          value: summary.wards,
          icon: MapPin,
          color: "bg-blue-100 text-blue-800",
          iconColor: "text-blue-600",
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            <span>Dashboard Overview</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            High-level summary of your district
          </p>
        </div>
        <button
          onClick={fetchSummary}
          disabled={loading}
          className="bg-white border-2 border-stone-900 rounded-xl px-4 py-2 text-xs font-display font-black text-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center gap-2 hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border-2 border-red-400 rounded-2xl p-4 text-red-800 text-sm font-bold flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading && !summary && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">Loading dashboard...</p>
        </div>
      )}

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex items-center gap-4"
            >
              <div className={`w-12 h-12 rounded-2xl border-2 border-stone-900 flex items-center justify-center shrink-0 ${stat.color}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              <div>
                <p className="text-stone-500 text-xs font-mono font-bold uppercase tracking-wide">{stat.label}</p>
                <p className="text-3xl font-display font-black text-stone-900 mt-0.5">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
