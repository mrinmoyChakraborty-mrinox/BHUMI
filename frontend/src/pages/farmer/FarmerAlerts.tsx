import { useState, useEffect, useCallback } from "react";
import { Bell, Loader2, AlertCircle, Phone, MessageSquare, CheckCircle2 } from "lucide-react";
import { useAuthContext } from "../../auth/AuthContext";
import { listAlerts } from "../../api/endpoints/alerts";
import type { AlertOut, Language } from "../../api/types";

const T = {
  en: {
    title: "My Alerts", subtitle: "Advisory and irrigation alerts for your plots",
    empty_title: "No alerts yet", empty_desc: "Add a plot to start receiving weather & irrigation alerts.",
    loading: "Loading alerts…", failed: "Failed to load alerts",
    acknowledged: "Acknowledged",
  },
  hi: {
    title: "मेरे अलर्ट", subtitle: "आपके प्लॉट के लिए सलाह और सिंचाई अलर्ट",
    empty_title: "अभी तक कोई अलर्ट नहीं", empty_desc: "मौसम और सिंचाई अलर्ट प्राप्त करने के लिए एक प्लॉट जोड़ें।",
    loading: "अलर्ट लोड हो रहे हैं…", failed: "अलर्ट लोड करने में विफल",
    acknowledged: "स्वीकृत",
  },
  bn: {
    title: "আমার সতর্কতা", subtitle: "আপনার প্লটের জন্য পরামর্শ এবং সেচ সতর্কতা",
    empty_title: "এখনও কোন সতর্কতা নেই", empty_desc: "আবহাওয়া ও সেচ সতর্কতা পেতে একটি প্লট যোগ করুন।",
    loading: "সতর্কতা লোড হচ্ছে…", failed: "সতর্কতা লোড করতে ব্যর্থ",
    acknowledged: "স্বীকৃত",
  },
  te: {
    title: "నా హెచ్చరికలు", subtitle: "మీ ప్లాట్ల కోసం సలహా మరియు నీటి హెచ్చరికలు",
    empty_title: "ఇంకా హెచ్చరికలు లేవు", empty_desc: "వాతావరణ మరియు నీటి హెచ్చరికలను స్వీకరించడానికి ప్లాట్ జోడించండి.",
    loading: "హెచ్చరికలు లోడ్ అవుతున్నాయి…", failed: "హెచ్చరికలను లోడ్ చేయడంలో విఫలమైంది",
    acknowledged: "ఆమోదించబడింది",
  },
};

const STATUS_STYLE: Record<string, string> = {
  sent: "bg-amber-100 text-amber-800 border-amber-300",
  acknowledged: "bg-emerald-100 text-emerald-800 border-emerald-300",
  no_response: "bg-stone-100 text-stone-600 border-stone-300",
  resolved: "bg-emerald-100 text-emerald-800 border-emerald-300",
};

function formatDate(d?: string | null) {
  if (!d) return "";
  try { return new Date(d).toLocaleString(); } catch { return ""; }
}

export default function FarmerAlerts() {
  const { farmerProfile } = useAuthContext();
  const farmerId = farmerProfile?.id;
  const [language, setLanguage] = useState<Language>("en");
  const t = T[language];

  const [alerts, setAlerts] = useState<AlertOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!farmerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listAlerts({ farmer_id: farmerId, limit: 100 });
      setAlerts(res.items);
    } catch (err: any) {
      setError(err?.detail || err?.message || t.failed);
    } finally {
      setLoading(false);
    }
  }, [farmerId, t.failed]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <Bell className="w-7 h-7 text-emerald-600" />
            <span>{t.title}</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">{t.subtitle}</p>
        </div>
        <div className="flex bg-white border-2 border-stone-900 p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
          {(["en", "hi", "bn", "te"] as Language[]).map((l) => (
            <button key={l} onClick={() => setLanguage(l)}
              className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${language === l ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"}`}>
              {l === "en" ? "EN" : l === "hi" ? "हिन्दी" : l === "bn" ? "বাংলা" : "తెలుగు"}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 text-rose-700 text-sm font-bold flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-16 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-600 mx-auto mb-3" />
          <p className="text-stone-500 font-bold text-sm">{t.loading}</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-10 text-center shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
          <div className="w-14 h-14 mx-auto rounded-2xl border-2 border-stone-900 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Bell className="w-7 h-7" />
          </div>
          <p className="font-display font-black text-stone-900">{t.empty_title}</p>
          <p className="text-sm text-stone-500 mt-1">{t.empty_desc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => (
            <div key={a.id} className="bg-white border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-mono font-black uppercase tracking-wide px-2 py-1 rounded-lg border-2 ${STATUS_STYLE[a.status] || "bg-stone-100 text-stone-600 border-stone-300"}`}>
                    {a.status}
                  </span>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wide bg-stone-100 border-2 border-stone-200 px-2 py-1 rounded-lg">
                    {a.alert_type}
                  </span>
                  <span className="text-[10px] font-mono font-bold text-stone-500 flex items-center gap-1">
                    {a.channel === "voice" ? <Phone className="w-3 h-3" /> : a.channel === "sms" ? <MessageSquare className="w-3 h-3" /> : null}
                    {a.channel}
                  </span>
                </div>
                <span className="text-[11px] font-mono text-stone-400 shrink-0">{formatDate(a.created_at)}</span>
              </div>
              <p className="mt-3 text-sm font-semibold text-stone-800 leading-relaxed">{a.message_text}</p>
              {a.status === "acknowledged" && (
                <p className="mt-2 text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> {t.acknowledged}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
