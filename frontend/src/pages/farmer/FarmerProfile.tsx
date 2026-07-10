import { useState, useEffect } from "react";
import { User, Loader2, AlertCircle, CheckCircle2, Pencil, Save } from "lucide-react";
import { useAuthContext } from "../../auth/AuthContext";
import { updateOwnFarmer } from "../../api/endpoints/farmers";
import type { FarmerUpdate, Language } from "../../api/types";
import { API_BASE_URL } from "../../config/env";

const T = {
  en: {
    title: "My Profile", subtitle: "Manage your personal details",
    edit: "Edit", loading: "Loading profile…", saved: "Profile updated successfully.",
    name: "Full Name", phone: "Phone", email: "Email (optional)",
    email_placeholder: "your@email.com", language: "Preferred Language",
    state: "State", select_state: "Select state", district: "District",
    district_placeholder: "e.g. East Godavari", save_changes: "Save Changes",
    cancel: "Cancel", name_empty: "Name cannot be empty.",
    failed: "Failed to update profile",
    farmer_id: "Farmer ID",
  },
  hi: {
    title: "मेरी प्रोफाइल", subtitle: "अपनी व्यक्तिगत जानकारी प्रबंधित करें",
    edit: "संपादित करें", loading: "प्रोफाइल लोड हो रही है…", saved: "प्रोफाइल सफलतापूर्वक अपडेट की गई।",
    name: "पूरा नाम", phone: "फ़ोन", email: "ईमेल (वैकल्पिक)",
    email_placeholder: "आपका ईमेल", language: "पसंदीदा भाषा",
    state: "राज्य", select_state: "राज्य चुनें", district: "जिला",
    district_placeholder: "जैसे पूर्वी गोदावरी", save_changes: "बदलाव सहेजें",
    cancel: "रद्द करें", name_empty: "नाम खाली नहीं हो सकता।",
    failed: "प्रोफाइल अपडेट करने में विफल",
    farmer_id: "किसान आईडी",
  },
  bn: {
    title: "আমার প্রোফাইল", subtitle: "আপনার ব্যক্তিগত বিবরণ পরিচালনা করুন",
    edit: "সম্পাদনা করুন", loading: "প্রোফাইল লোড হচ্ছে…", saved: "প্রোফাইল সফলভাবে আপডেট করা হয়েছে।",
    name: "পুরো নাম", phone: "ফোন", email: "ইমেল (ঐচ্ছিক)",
    email_placeholder: "আপনার ইমেল", language: "পছন্দের ভাষা",
    state: "রাজ্য", select_state: "রাজ্য নির্বাচন করুন", district: "জেলা",
    district_placeholder: "যেমন পূর্ব গোদাবরী", save_changes: "পরিবর্তন সংরক্ষণ করুন",
    cancel: "বাতিল করুন", name_empty: "নাম খালি হতে পারে না।",
    failed: "প্রোফাইল আপডেট করতে ব্যর্থ",
    farmer_id: "কৃষক আইডি",
  },
  te: {
    title: "నా ప్రొఫైల్", subtitle: "మీ వ్యక్తిగత వివరాలను నిర్వహించండి",
    edit: "సవరించు", loading: "ప్రొఫైల్ లోడ్ అవుతోంది…", saved: "ప్రొఫైల్ విజయవంతంగా నవీకరించబడింది.",
    name: "పూర్తి పేరు", phone: "ఫోన్", email: "ఇమెయిల్ (ఐచ్ఛికం)",
    email_placeholder: "మీ ఇమెయిల్", language: "ఇష్టపడే భాష",
    state: "రాష్ట్రం", select_state: "రాష్ట్రం ఎంచుకోండి", district: "జిల్లా",
    district_placeholder: "ఉదా. తూర్పు గోదావరి", save_changes: "మార్పులను సేవ్ చేయండి",
    cancel: "రద్దు చేయండి", name_empty: "పేరు ఖాళీగా ఉండకూడదు.",
    failed: "ప్రొఫైల్ నవీకరించడంలో విఫలమైంది",
    farmer_id: "రైతు ID",
  },
};

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
  const [language, setLanguage] = useState<Language>("en");
  const t = T[language];

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [langPref, setLangPref] = useState("en");
  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (farmerProfile) {
      setName(farmerProfile.name || "");
      setEmail(farmerProfile.email || "");
      setLangPref(farmerProfile.preferred_language || "en");
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
      setError(t.name_empty);
      return;
    }
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      const payload: FarmerUpdate = {
        name: name.trim(),
        email: email.trim() || undefined,
        preferred_language: langPref,
        state: state || undefined,
        district: district || undefined,
      };
      const updated = await updateOwnFarmer(farmerProfile.id, payload);
      setFarmerProfile(updated);
      setEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err?.detail || err?.message || t.failed);
    } finally {
      setSaving(false);
    }
  };

  if (!farmerProfile) {
    return (
      <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
        <p className="text-stone-500 font-bold text-sm">{t.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <User className="w-7 h-7 text-emerald-600" />
            <span>{t.title}</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">{t.subtitle}</p>
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
          {!editing && (
            <button onClick={startEdit}
              className="bg-emerald-600 text-white border-2 border-stone-900 rounded-xl px-4 py-2.5 text-xs font-display font-black shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:bg-emerald-700 flex items-center gap-2 cursor-pointer">
              <Pencil className="w-4 h-4" /> {t.edit}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> <span>{error}</span>
        </div>
      )}
      {saved && (
        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-4 text-emerald-800 text-sm font-bold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 shrink-0" /> <span>{t.saved}</span>
        </div>
      )}

      <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
        {editing ? (
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.name}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.phone}</label>
              <input type="text" value={farmerProfile.phone || ""} readOnly
                className="w-full py-2.5 px-3 text-sm bg-stone-100 border-2 border-stone-200 rounded-2xl font-semibold text-stone-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.email}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder={t.email_placeholder}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.language}</label>
                <select value={langPref} onChange={(e) => setLangPref(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold">
                  {LANGUAGES.map((l) => (<option key={l.value} value={l.value}>{l.label}</option>))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">{t.state}</label>
                <select value={state} onChange={(e) => setState(e.target.value)}
                  className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold">
                  <option value="">{t.select_state}</option>
                  {INDIAN_STATES.map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">{t.district}</label>
              <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)}
                placeholder={t.district_placeholder}
                className="w-full py-2.5 px-3 text-sm bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 font-semibold" />
            </div>
            <div className="flex gap-3 pt-1">
              <button type="submit" disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-sm px-6 py-3 rounded-2xl border-2 border-emerald-800 shadow-[3px_3px_0px_0px_rgba(5,150,105,1)] flex items-center gap-2 cursor-pointer disabled:opacity-60">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {t.save_changes}
              </button>
              <button type="button" onClick={() => { setEditing(false); setError(null); }}
                className="px-6 py-3 text-sm font-bold rounded-2xl border-2 border-stone-300 text-stone-600 hover:bg-stone-50 cursor-pointer">
                {t.cancel}
              </button>
            </div>
          </form>
        ) : (
          <dl className="divide-y-2 divide-stone-100">
            <Row label={t.name} value={farmerProfile.name} />
            <Row label={t.phone} value={farmerProfile.phone || "—"} />
            <Row label={t.email} value={farmerProfile.email || "—"} />
            <Row label={t.language} value={LANGUAGES.find((l) => l.value === farmerProfile.preferred_language)?.label || farmerProfile.preferred_language} />
            <Row label={t.state} value={farmerProfile.state || "—"} />
            <Row label={t.district} value={farmerProfile.district || "—"} />
          </dl>
        )}
      </div>

      <p className="text-[10px] text-stone-400 font-mono">
        {t.farmer_id}: {farmerProfile.id} · {API_BASE_URL}
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
