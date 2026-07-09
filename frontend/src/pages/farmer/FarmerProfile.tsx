import { useState, useEffect } from "react";
import { User, Loader2, AlertCircle, CheckCircle2, Pencil, Save } from "lucide-react";
import { useAuthContext } from "../../auth/AuthContext";
import { updateOwnFarmer } from "../../api/endpoints/farmers";
import type { FarmerUpdate } from "../../api/types";
import { API_BASE_URL } from "../../config/env";

const INDIAN_STATES = [
  "Andhra Pradesh", "Assam", "Bihar", "Gujarat", "Haryana",
  "Karnataka", "Madhya Pradesh", "Maharashtra", "Odisha",
  "Punjab", "Rajasthan", "Tamil Nadu", "Telangana",
  "Uttar Pradesh", "West Bengal",
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "hi", label: "हिन्दी" },
  { value: "bn", label: "বাংলা" },
  { value: "te", label: "తెలుగు" },
];

export default function FarmerProfile() {
  const { farmerProfile, setFarmerProfile } = useAuthContext();

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("en");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (farmerProfile) {
      setName(farmerProfile.name || "");
      setEmail(farmerProfile.email || "");
      setLanguage(farmerProfile.preferred_language || "en");
      setState(farmerProfile.state || "");
      setDistrict(farmerProfile.district || "");
    }
  }, [farmerProfile]);

  const startEdit = () => {
    setEditing(true);
    setError(null);
    setSaved(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!farmerProfile?.id) return;
    if (!name.trim()) {
      setError("Name cannot be empty.");
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload: FarmerUpdate = {
        name: name.trim(),
        email: email.trim() || undefined,
        preferred_language: language,
        state: state || undefined,
        district: district || undefined,
      };
      const updated = await updateOwnFarmer(farmerProfile.id, payload);
      setFarmerProfile(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.detail || err?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!farmerProfile) {
    return (
      <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-stone-500 font-bold text-sm">Loading profile…</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <User className="w-7 h-7 text-emerald-600" />
            <span>My Profile</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            Manage your personal details
          </p>
        </div>
        {!editing && (
          <button
            onClick={startEdit}
            className="bg-emerald-600 text-white border-2 border-stone-900 rounded-xl px-4 py-2.5 text-xs font-display font-black shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-emerald-700 flex items-center gap-2 cursor-pointer"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
        )}
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {saved && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>Profile updated successfully.</span>
        </div>
      )}

      <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Phone</label>
              <input
                type="text"
                value={farmerProfile.phone}
                readOnly
                className="w-full py-2.5 px-3 text-sm bg-stone-100 border-2 border-stone-200 rounded-2xl font-semibold text-stone-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Preferred Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
                >
                  {LANGUAGES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                </select>
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
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                placeholder="e.g. East Godavari"
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold"
              />
            </div>
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => { setEditing(false); setError(null); }}
                className="px-6 py-3 text-sm font-bold rounded-2xl border-2 border-stone-300 text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <dl className="divide-y-2 divide-stone-100">
            <Row label="Full Name" value={farmerProfile.name} />
            <Row label="Phone" value={farmerProfile.phone} />
            <Row label="Email" value={farmerProfile.email || "—"} />
            <Row label="Preferred Language" value={LANGUAGES.find((l) => l.value === farmerProfile.preferred_language)?.label || farmerProfile.preferred_language} />
            <Row label="State" value={farmerProfile.state || "—"} />
            <Row label="District" value={farmerProfile.district || "—"} />
          </dl>
        )}
      </div>

      <p className="text-[10px] text-stone-400 font-mono">
        Farmer ID: {farmerProfile.id} · {API_BASE_URL}
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between py-3">
      <dt className="text-xs font-mono font-bold uppercase tracking-wide text-stone-500">{label}</dt>
      <dd className="text-sm font-bold text-stone-900 text-right">{value}</dd>
    </div>
  );
}
