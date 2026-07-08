import { useState, useEffect, useCallback } from "react";
import { Bell, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import { getDashboardAlerts } from "../../api/endpoints/dashboard";
import type { DashboardAlert } from "../../api/types";

const badgeColor = (color: "yellow" | "green" | "red") => {
  const map = {
    yellow: "bg-amber-100 text-amber-800 border-amber-400",
    green: "bg-emerald-100 text-emerald-800 border-emerald-400",
    red: "bg-red-100 text-red-800 border-red-400",
  };
  return map[color] || map.yellow;
};

const statusColor = (status: string) => {
  if (status === "resolved") return "text-emerald-600 bg-emerald-50";
  if (status === "acknowledged") return "text-amber-600 bg-amber-50";
  if (status === "pending") return "text-red-600 bg-red-50";
  return "text-stone-600 bg-stone-50";
};

export default function AlertsList() {
  const [alerts, setAlerts] = useState<DashboardAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardAlerts();
      setAlerts(data);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to load alerts");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-amber-600" />
            <span>Alerts</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            Farmer alerts and notifications
          </p>
        </div>
        <button
          onClick={fetchAlerts}
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

      {loading && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">Loading alerts...</p>
        </div>
      )}

      {!loading && !error && alerts.length === 0 && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Bell className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">No alerts found.</p>
        </div>
      )}

      {!loading && alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border-2 border-stone-900 rounded-2xl p-5 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-start gap-4"
            >
              <span
                className={`w-8 h-8 rounded-xl border-2 border-stone-900 flex items-center justify-center shrink-0 ${badgeColor(alert.ui_color)}`}
              >
                <Bell className="w-4 h-4" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-black text-stone-700 uppercase tracking-wide">
                    {alert.alert_type}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold border-2 border-stone-900 ${statusColor(alert.status)}`}
                  >
                    {alert.status}
                  </span>
                  <span
                    className={`inline-flex items-center rounded-lg px-2 py-0.5 text-xs font-bold border-2 border-stone-900 ${badgeColor(alert.ui_color)}`}
                  >
                    {alert.ui_color}
                  </span>
                </div>
                <p className="text-sm text-stone-700 mt-1.5 leading-relaxed">
                  {alert.message_text.length > 120
                    ? `${alert.message_text.slice(0, 120)}...`
                    : alert.message_text}
                </p>
                <p className="text-xs font-mono text-stone-400 mt-2">
                  Farmer: {alert.farmer_id} &middot; Plot: {alert.plot_id}
                  {alert.created_at && (
                    <>
                      &nbsp;&middot;&nbsp;
                      {new Date(alert.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
