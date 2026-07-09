import { useState, useEffect, useCallback } from "react";
import {
  MapPin, Plus, Loader2, Sprout, Trash2, Droplet, AlertCircle,
} from "lucide-react";
import { useAuthContext } from "../../auth/AuthContext";
import { listPlots, createPlot, deletePlot } from "../../api/endpoints/plots";
import type { PlotOut } from "../../api/types";

const SOIL_TYPES = ["alluvial", "black", "red", "laterite", "sandy", "loamy", "clay"];
const CROP_STAGES = ["sowing", "vegetative", "flowering", "harvest"];
const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Haryana",
  "Karnataka", "Madhya Pradesh", "Maharashtra", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "West Bengal",
];

export default function FarmerPlots() {
  const { farmerProfile } = useAuthContext();
  const farmerId = farmerProfile?.id;

  const [plots, setPlots] = useState<PlotOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [address, setAddress] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [crop, setCrop] = useState("");
  const [stage, setStage] = useState("");
  const [soil, setSoil] = useState("");
  const [area, setArea] = useState("");

  const load = useCallback(async () => {
    if (!farmerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listPlots({ farmer_id: farmerId, limit: 100 });
      setPlots(res.items);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to load plots");
    } finally {
      setLoading(false);
    }
  }, [farmerId]);

  useEffect(() => {
    load();
  }, [load]);

  const resetForm = () => {
    setAddress(""); setDistrict(""); setState(""); setCrop("");
    setStage(""); setSoil(""); setArea("");
    setShowForm(false); setError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerId) return;
    if (!address.trim() && !district.trim()) {
      setError("Please provide an address or a district for your plot.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload: Record<string, unknown> = {
        farmer_id: farmerId,
        ward_id: "general",
      };
      if (address.trim()) payload.address = address.trim();
      if (district.trim()) payload.district = district.trim();
      if (state) payload.state = state;
      if (crop.trim()) payload.current_crop = crop.trim();
      if (stage) payload.crop_stage = stage;
      if (soil) payload.soil_type = soil;
      if (area.trim()) payload.area_acre = Number(area);

      await createPlot(payload as any);
      resetForm();
      load();
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to add plot");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this plot?")) return;
    try {
      await deletePlot(id);
      setPlots((p) => p.filter((x) => x.id !== id));
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to delete plot");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-emerald-600" />
            <span>My Plots</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            Add and manage your farmland
          </p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setShowForm(true); setError(null); }}
            className="bg-emerald-600 text-white border-2 border-stone-900 rounded-xl px-4 py-2.5 text-xs font-display font-black shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-emerald-700 flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Plot
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-4">
          <h3 className="font-display font-black text-stone-900 text-lg">Add a New Plot</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Village, street, landmark"
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">District <span className="text-stone-400 font-normal">(or type below)</span></label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. East Godavari"
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">State</label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="">Select state</option>
                {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Current Crop</label>
              <input
                type="text"
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                placeholder="e.g. Rice, Cotton, Wheat"
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Crop Stage</label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="">Select stage</option>
                {CROP_STAGES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Soil Type</label>
              <select
                value={soil}
                onChange={(e) => setSoil(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              >
                <option value="">Select soil type</option>
                {SOIL_TYPES.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Area (acres) <span className="text-stone-400 font-normal">(optional)</span></label>
              <input
                type="number"
                step="0.1"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. 2.5"
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Save Plot
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-3 text-sm font-bold rounded-2xl border-2 border-stone-300 text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">Loading your plots…</p>
        </div>
      ) : plots.length === 0 && !showForm ? (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-10 text-center shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
          <div className="w-14 h-14 mx-auto rounded-2xl border-2 border-stone-900 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Sprout className="w-7 h-7" />
          </div>
          <p className="font-display font-black text-stone-900">No plots yet</p>
          <p className="text-sm text-stone-500 mt-1">Add your first plot to start getting personalised advice.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plots.map((p) => (
            <div key={p.id} className="bg-white border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-11 h-11 rounded-2xl border-2 border-stone-900 bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-black text-stone-900 truncate">
                      {p.current_crop || "Unspecified crop"}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {[p.address, p.district].filter(Boolean).join(", ") || "No location set"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 border-2 border-stone-200 rounded-xl hover:border-red-500 hover:text-red-600 cursor-pointer shrink-0"
                  aria-label="Delete plot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-mono font-bold">
                {p.state && <span className="bg-stone-100 border-2 border-stone-200 rounded-lg px-2 py-1">{p.state}</span>}
                {p.crop_stage && <span className="bg-amber-100 border-2 border-amber-300 rounded-lg px-2 py-1">{p.crop_stage}</span>}
                {p.soil_type && <span className="bg-blue-100 border-2 border-blue-300 rounded-lg px-2 py-1 flex items-center gap-1"><Droplet className="w-3 h-3" />{p.soil_type}</span>}
                {p.area_acre != null && <span className="bg-stone-100 border-2 border-stone-200 rounded-lg px-2 py-1">{p.area_acre} ac</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
