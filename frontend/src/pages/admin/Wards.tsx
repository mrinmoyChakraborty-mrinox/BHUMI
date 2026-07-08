import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Check, Loader2, RefreshCw } from "lucide-react";
import { usePaginatedList } from "../../hooks/usePaginatedList";
import {
  listWards,
  createWard,
  updateWard,
  deleteWard,
  refreshWardForecast,
} from "../../api/endpoints/wards";
import type { WardOut, WardCreate, WardUpdate } from "../../api/types";

const emptyForm: WardCreate = {
  ward_id: "",
  district_id: "",
  soil_type: null,
  avg_rainfall_mm: null,
  groundwater_depth_m: null,
  forecast_dry_days: 0,
};

export default function Wards() {
  const { items, loading, error, load } = usePaginatedList<WardOut>();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);

  const [form, setForm] = useState<WardCreate>({ ...emptyForm });

  useEffect(() => {
    load("/wards");
  }, [load]);

  function resetForm() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setAdding(false);
  }

  function startEdit(w: WardOut) {
    setForm({
      ward_id: w.id,
      district_id: w.district_id,
      soil_type: w.soil_type ?? null,
      avg_rainfall_mm: w.avg_rainfall_mm ?? null,
      groundwater_depth_m: w.groundwater_depth_m ?? null,
      forecast_dry_days: w.forecast_dry_days,
    });
    setEditingId(w.id);
    setAdding(false);
  }

  async function handleSubmit() {
    setSubmitting(true);
    try {
      const payload: WardCreate = {
        ward_id: form.ward_id,
        district_id: form.district_id,
        soil_type: form.soil_type || null,
        avg_rainfall_mm: form.avg_rainfall_mm ?? null,
        groundwater_depth_m: form.groundwater_depth_m ?? null,
        forecast_dry_days: form.forecast_dry_days,
      };
      if (editingId) {
        const upd: WardUpdate = { ...payload };
        await updateWard(editingId, upd);
      } else {
        await createWard(payload);
      }
      resetForm();
      await load("/wards");
    } catch {
      // handled by hook
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this ward?")) return;
    try {
      await deleteWard(id);
      await load("/wards");
    } catch {
      // handled by hook
    }
  }

  async function handleRefresh(id: string) {
    setRefreshingId(id);
    try {
      await refreshWardForecast(id);
      await load("/wards");
    } catch {
      // handled by hook
    } finally {
      setRefreshingId(null);
    }
  }

  function numVal(v: number | null | undefined) {
    return v ?? "—";
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-black font-mono tracking-tight">Wards</h1>
        <button
          onClick={() => {
            resetForm();
            setAdding(true);
          }}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold font-mono bg-amber-50 text-stone-900 border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-amber-100 transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Add Ward
        </button>
      </div>

      {adding || editingId ? (
        <div className="mb-6 bg-white border-2 border-stone-900 rounded-2xl p-4 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Ward ID</label>
              <input
                value={form.ward_id}
                onChange={(e) => setForm({ ...form, ward_id: e.target.value })}
                placeholder="ward-xxx"
                className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">District ID</label>
              <input
                value={form.district_id}
                onChange={(e) => setForm({ ...form, district_id: e.target.value })}
                placeholder="district-id"
                className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Soil Type</label>
              <input
                value={form.soil_type ?? ""}
                onChange={(e) => setForm({ ...form, soil_type: e.target.value || null })}
                placeholder="e.g. loamy"
                className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Rainfall (mm)</label>
              <input
                type="number"
                value={form.avg_rainfall_mm ?? ""}
                onChange={(e) => setForm({ ...form, avg_rainfall_mm: e.target.value ? Number(e.target.value) : null })}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">GW Depth (m)</label>
              <input
                type="number"
                step="0.1"
                value={form.groundwater_depth_m ?? ""}
                onChange={(e) => setForm({ ...form, groundwater_depth_m: e.target.value ? Number(e.target.value) : null })}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-stone-600 mb-1">Dry Days</label>
              <input
                type="number"
                value={form.forecast_dry_days}
                onChange={(e) => setForm({ ...form, forecast_dry_days: Number(e.target.value) })}
                placeholder="0"
                className="w-full px-3 py-2 text-sm border-2 border-stone-900 rounded-xl bg-white font-mono focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.ward_id.trim() || !form.district_id.trim()}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono bg-emerald-600 text-white border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-emerald-700 disabled:opacity-40 transition cursor-pointer"
            >
              {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              {editingId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono bg-white text-stone-900 border-2 border-stone-900 rounded-2xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-stone-100 transition cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="bg-white border-2 border-stone-900 rounded-2xl overflow-hidden shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-amber-50 border-b-2 border-stone-900">
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Ward ID</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">District ID</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Soil Type</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Rainfall (mm)</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">GW Depth (m)</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider">Dry Days</th>
                <th className="px-4 py-3 text-xs font-mono font-bold text-stone-600 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-stone-400" />
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-red-600 text-xs font-mono font-bold">
                    {error}
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-stone-400 text-xs font-mono">
                    No wards found.
                  </td>
                </tr>
              ) : (
                items.map((w) => (
                  <tr key={w.id} className="border-b border-stone-200 last:border-b-0 hover:bg-stone-50 transition">
                    <td className="px-4 py-3 text-sm font-bold font-mono">{w.id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700">{w.district_id}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700">{w.soil_type ?? "—"}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700">{numVal(w.avg_rainfall_mm)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700">{numVal(w.groundwater_depth_m)}</td>
                    <td className="px-4 py-3 text-sm font-mono text-stone-700">{w.forecast_dry_days}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleRefresh(w.id)}
                          disabled={refreshingId === w.id}
                          className="p-1.5 border-2 border-stone-900 rounded-xl hover:bg-amber-50 transition cursor-pointer disabled:opacity-40"
                          title="Refresh Forecast"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${refreshingId === w.id ? "animate-spin" : ""}`} />
                        </button>
                        <button
                          onClick={() => startEdit(w)}
                          className="p-1.5 border-2 border-stone-900 rounded-xl hover:bg-amber-50 transition cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(w.id)}
                          className="p-1.5 border-2 border-stone-900 rounded-xl hover:bg-red-50 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
