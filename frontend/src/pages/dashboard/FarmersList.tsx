import { useState, useEffect, useCallback } from "react";
import { Users, Loader2, AlertTriangle, Phone, MapPin, Sprout, LayoutGrid, Bell } from "lucide-react";
import { getDashboardFarmers } from "../../api/endpoints/dashboard";
import type { DashboardFarmer } from "../../api/types";

const alertColor = (status: string | null | undefined) => {
  if (!status) return "bg-stone-100 text-stone-500";
  if (status === "resolved") return "bg-emerald-100 text-emerald-700";
  if (status === "acknowledged") return "bg-amber-100 text-amber-700";
  if (status === "pending") return "bg-red-100 text-red-700";
  return "bg-stone-100 text-stone-500";
};

export default function FarmersList() {
  const [farmers, setFarmers] = useState<DashboardFarmer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFarmers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getDashboardFarmers();
      setFarmers(data);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to load farmers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFarmers();
  }, [fetchFarmers]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-emerald-600" />
            <span>Farmers</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            All registered farmers in your district
          </p>
        </div>
        <button
          onClick={fetchFarmers}
          disabled={loading}
          className="bg-white border-2 border-stone-900 rounded-xl px-4 py-2 text-xs font-display font-black text-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center gap-2 hover:bg-stone-50 transition cursor-pointer disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
            </svg>
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
          <p className="text-stone-500 font-bold text-sm">Loading farmers...</p>
        </div>
      )}

      {!loading && !error && farmers.length === 0 && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Users className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">No farmers found.</p>
        </div>
      )}

      {!loading && farmers.length > 0 && (
        <div className="bg-white border-2 border-stone-900 rounded-3xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-stone-900 bg-stone-50">
                <th className="text-left px-5 py-3.5 text-xs font-mono font-black text-stone-700 uppercase tracking-wide">Name</th>
                <th className="text-left px-5 py-3.5 text-xs font-mono font-black text-stone-700 uppercase tracking-wide">Phone</th>
                <th className="text-left px-5 py-3.5 text-xs font-mono font-black text-stone-700 uppercase tracking-wide">Ward ID</th>
                <th className="text-left px-5 py-3.5 text-xs font-mono font-black text-stone-700 uppercase tracking-wide">Current Crop</th>
                <th className="text-center px-5 py-3.5 text-xs font-mono font-black text-stone-700 uppercase tracking-wide">Plots</th>
                <th className="text-center px-5 py-3.5 text-xs font-mono font-black text-stone-700 uppercase tracking-wide">Alert Status</th>
              </tr>
            </thead>
            <tbody>
              {farmers.map((farmer, idx) => (
                <tr
                  key={farmer.id}
                  className={`border-b border-stone-200 hover:bg-stone-50 transition ${
                    idx === farmers.length - 1 ? "border-b-0" : ""
                  }`}
                >
                  <td className="px-5 py-4 font-bold text-stone-900">
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-stone-400 shrink-0" />
                      {farmer.name}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-stone-700 font-mono text-xs">
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {farmer.phone}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-stone-700 font-mono text-xs">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      {farmer.ward_id}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <Sprout className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      {farmer.current_crop || "—"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="inline-flex items-center gap-1 bg-stone-100 border-2 border-stone-900 rounded-lg px-2.5 py-1 text-xs font-bold text-stone-900">
                      <LayoutGrid className="w-3 h-3" />
                      {farmer.plot_count}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span
                      className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold border-2 border-stone-900 ${alertColor(farmer.latest_alert_status)}`}
                    >
                      <Bell className="w-3 h-3" />
                      {farmer.latest_alert_status || "none"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
