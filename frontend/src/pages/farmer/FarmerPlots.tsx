import { useState, useEffect, useCallback } from "react";
import {
  MapPin, Plus, Loader2, Sprout, Trash2, Droplet, AlertCircle,
} from "lucide-react";
import { useAuthContext } from "../../auth/AuthContext";
import { listPlots, createPlot, deletePlot } from "../../api/endpoints/plots";
import type { Language, PlotOut } from "../../api/types";

const T = {
  en: {
    title: "My Plots", subtitle: "Add and manage your farmland", add_plot: "Add Plot",
    form_title: "Add a New Plot", address: "Address", district: "District",
    district_hint: "(or type below)", district_placeholder: "e.g. East Godavari",
    state: "State", select_state: "Select state", crop: "Current Crop",
    crop_placeholder: "e.g. Rice, Cotton, Wheat", stage: "Crop Stage",
    select_stage: "Select stage", soil: "Soil Type", select_soil: "Select soil type",
    area: "Area (acres)", area_hint: "(optional)", area_placeholder: "e.g. 2.5",
    save: "Save Plot", cancel: "Cancel", delete_confirm: "Delete this plot?",
    empty_title: "No plots yet", empty_desc: "Add your first plot to start getting personalised advice.",
    loading: "Loading your plots…", delete_aria: "Delete plot",
    unspecified_crop: "Unspecified crop", no_location: "No location set",
    error_required: "Please provide an address or a district for your plot.",
    failed_load: "Failed to load plots", failed_add: "Failed to add plot", failed_delete: "Failed to delete plot",
  },
  hi: {
    title: "मेरे प्लॉट", subtitle: "अपनी कृषि भूमि जोड़ें और प्रबंधित करें", add_plot: "प्लॉट जोड़ें",
    form_title: "नया प्लॉट जोड़ें", address: "पता", district: "जिला",
    district_hint: "(या नीचे लिखें)", district_placeholder: "जैसे पूर्वी गोदावरी",
    state: "राज्य", select_state: "राज्य चुनें", crop: "वर्तमान फसल",
    crop_placeholder: "जैसे धान, कपास, गेहूं", stage: "फसल की अवस्था",
    select_stage: "अवस्था चुनें", soil: "मिट्टी का प्रकार", select_soil: "मिट्टी का प्रकार चुनें",
    area: "क्षेत्रफल (एकड़)", area_hint: "(वैकल्पिक)", area_placeholder: "जैसे 2.5",
    save: "प्लॉट सहेजें", cancel: "रद्द करें", delete_confirm: "क्या आप यह प्लॉट हटाना चाहते हैं?",
    empty_title: "अभी तक कोई प्लॉट नहीं", empty_desc: "व्यक्तिगत सलाह प्राप्त करने के लिए अपना पहला प्लॉट जोड़ें।",
    loading: "आपके प्लॉट लोड हो रहे हैं…", delete_aria: "प्लॉट हटाएं",
    unspecified_crop: "अनिर्दिष्ट फसल", no_location: "कोई स्थान निर्धारित नहीं",
    error_required: "कृपया अपने प्लॉट के लिए पता या जिला प्रदान करें।",
    failed_load: "प्लॉट लोड करने में विफल", failed_add: "प्लॉट जोड़ने में विफल", failed_delete: "प्लॉट हटाने में विफल",
  },
  bn: {
    title: "আমার প্লট", subtitle: "আপনার কৃষি জমি যোগ করুন এবং পরিচালনা করুন", add_plot: "প্লট যোগ করুন",
    form_title: "নতুন প্লট যোগ করুন", address: "ঠিকানা", district: "জেলা",
    district_hint: "(অথবা নিচে লিখুন)", district_placeholder: "যেমন পূর্ব গোদাবরী",
    state: "রাজ্য", select_state: "রাজ্য নির্বাচন করুন", crop: "বর্তমান ফসল",
    crop_placeholder: "যেমন ধান, তুলা, গম", stage: "ফসলের পর্যায়",
    select_stage: "পর্যায় নির্বাচন করুন", soil: "মাটির ধরন", select_soil: "মাটির ধরন নির্বাচন করুন",
    area: "আয়তন (একর)", area_hint: "(ঐচ্ছিক)", area_placeholder: "যেমন ২.৫",
    save: "প্লট সংরক্ষণ করুন", cancel: "বাতিল করুন", delete_confirm: "এই প্লটটি মুছবেন?",
    empty_title: "এখনও কোন প্লট নেই", empty_desc: "ব্যক্তিগত পরামর্শ পেতে আপনার প্রথম প্লট যোগ করুন।",
    loading: "আপনার প্লট লোড হচ্ছে…", delete_aria: "প্লট মুছুন",
    unspecified_crop: "অনির্দিষ্ট ফসল", no_location: "কোন অবস্থান নির্ধারিত নেই",
    error_required: "আপনার প্লটের জন্য একটি ঠিকানা বা জেলা প্রদান করুন।",
    failed_load: "প্লট লোড করতে ব্যর্থ", failed_add: "প্লট যোগ করতে ব্যর্থ", failed_delete: "প্লট মুছতে ব্যর্থ",
  },
  te: {
    title: "నా ప్లాట్లు", subtitle: "మీ వ్యవసాయ భూమిని జోడించండి మరియు నిర్వహించండి", add_plot: "ప్లాట్ జోడించండి",
    form_title: "కొత్త ప్లాట్ జోడించండి", address: "చిరునామా", district: "జిల్లా",
    district_hint: "(లేదా క్రింద టైప్ చేయండి)", district_placeholder: "ఉదా. తూర్పు గోదావరి",
    state: "రాష్ట్రం", select_state: "రాష్ట్రం ఎంచుకోండి", crop: "ప్రస్తుత పంట",
    crop_placeholder: "ఉదా. వరి, పత్తి, గోధుమ", stage: "పంట దశ",
    select_stage: "దశ ఎంచుకోండి", soil: "నేల రకం", select_soil: "నేల రకం ఎంచుకోండి",
    area: "విస్తీర్ణం (ఎకరాలు)", area_hint: "(ఐచ్ఛికం)", area_placeholder: "ఉదా. 2.5",
    save: "ప్లాట్ సేవ్ చేయండి", cancel: "రద్దు చేయండి", delete_confirm: "ఈ ప్లాట్ తొలగించాలా?",
    empty_title: "ఇంకా ప్లాట్లు లేవు", empty_desc: "వ్యక్తిగత సలహా పొందడానికి మీ మొదటి ప్లాట్ జోడించండి.",
    loading: "మీ ప్లాట్లు లోడ్ అవుతున్నాయి…", delete_aria: "ప్లాట్ తొలగించు",
    unspecified_crop: "పేర్కొనని పంట", no_location: "స్థానం సెట్ చేయలేదు",
    error_required: "దయచేసి మీ ప్లాట్ కోసం చిరునామా లేదా జిల్లాను అందించండి.",
    failed_load: "ప్లాట్లను లోడ్ చేయడంలో విఫలమైంది", failed_add: "ప్లాట్ జోడించడంలో విఫలమైంది", failed_delete: "ప్లాట్ తొలగించడంలో విఫలమైంది",
  },
};

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
  const [language, setLanguage] = useState<Language>("en");
  const t = T[language];

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <MapPin className="w-7 h-7 text-emerald-600" />
            <span>{t.title}</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            {t.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border-2 border-stone-900 p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
            {(["en", "hi", "bn", "te"] as Language[]).map((l) => (
              <button key={l} onClick={() => setLanguage(l)}
                className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${language === l ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"}`}>
                {l === "en" ? "EN" : l === "hi" ? "हिन्दी" : l === "bn" ? "বাংলা" : "తెలుగు"}
              </button>
            ))}
          </div>
          {!showForm && (
            <button onClick={() => { setShowForm(true); setError(null); }}
              className="bg-emerald-600 text-white border-2 border-stone-900 rounded-xl px-4 py-2.5 text-xs font-display font-black shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-emerald-700 flex items-center gap-2 cursor-pointer">
              <Plus className="w-4 h-4" /> {t.add_plot}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-4">
          <h3 className="font-display font-black text-stone-900 text-lg">{t.form_title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.address}</label>
              <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder={t.address} className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.district} <span className="text-stone-400 font-normal">{t.district_hint}</span></label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                placeholder={t.district_placeholder} className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.state}</label>
              <select value={state} onChange={(e) => setState(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold">
                <option value="">{t.select_state}</option>
                {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.crop}</label>
              <input type="text" value={crop} onChange={(e) => setCrop(e.target.value)}
                placeholder={t.crop_placeholder} className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.stage}</label>
              <select value={stage} onChange={(e) => setStage(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold">
                <option value="">{t.select_stage}</option>
                {CROP_STAGES.map((s) => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.soil}</label>
              <select value={soil} onChange={(e) => setSoil(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold">
                <option value="">{t.select_soil}</option>
                {SOIL_TYPES.map((s) => (<option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.area} <span className="text-stone-400 font-normal">{t.area_hint}</span></label>
              <input type="number" step="0.1" value={area} onChange={(e) => setArea(e.target.value)}
                placeholder={t.area_placeholder} className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="submit" disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] flex items-center gap-2 cursor-pointer disabled:opacity-60">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {t.save}
            </button>
            <button type="button" onClick={resetForm}
              className="px-6 py-3 text-sm font-bold rounded-2xl border-2 border-stone-300 text-stone-600 hover:bg-stone-50 cursor-pointer">
              {t.cancel}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">{t.loading}</p>
        </div>
      ) : plots.length === 0 && !showForm ? (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-10 text-center shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
          <div className="w-14 h-14 mx-auto rounded-2xl border-2 border-stone-900 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Sprout className="w-7 h-7" />
          </div>
          <p className="font-display font-black text-stone-900">{t.empty_title}</p>
          <p className="text-sm text-stone-500 mt-1">{t.empty_desc}</p>
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
                      {p.current_crop || t.unspecified_crop}
                    </p>
                    <p className="text-xs text-stone-500 truncate">
                      {[p.address, p.district].filter(Boolean).join(", ") || t.no_location}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(p.id)}
                  className="p-2 border-2 border-stone-200 rounded-xl hover:border-red-500 hover:text-red-600 cursor-pointer shrink-0"
                  aria-label={t.delete_aria}>
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
