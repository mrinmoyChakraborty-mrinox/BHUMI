import { useState, useEffect, useCallback } from "react";
import { Leaf, Loader2, AlertCircle, ShieldAlert, ArrowUpRight } from "lucide-react";
import { useAuthContext } from "../../auth/AuthContext";
import { listHealthLogs } from "../../api/endpoints/healthLogs";
import type { HealthLogOut, Language } from "../../api/types";

const T = {
  en: {
    title: "Health Logs", subtitle: "Your leaf disease diagnoses and recommended actions",
    empty_title: "No health logs yet",
    empty_desc: "Use Leaf Disease Diagnosis from Home to check a crop photo.",
    loading: "Loading health logs…", failed: "Failed to load health logs",
    escalated: "Escalated to RSK", recommended: "Recommended",
    confidence: "Confidence",
  },
  hi: {
    title: "स्वास्थ्य लॉग", subtitle: "आपके पत्ती रोग निदान और अनुशंसित कार्रवाइयां",
    empty_title: "अभी तक कोई स्वास्थ्य लॉग नहीं",
    empty_desc: "फसल फोटो जांचने के लिए होम से पत्ती रोग निदान का उपयोग करें।",
    loading: "स्वास्थ्य लॉग लोड हो रहे हैं…", failed: "स्वास्थ्य लॉग लोड करने में विफल",
    escalated: "RSK को भेजा गया", recommended: "अनुशंसित",
    confidence: "विश्वास स्तर",
  },
  bn: {
    title: "স্বাস্থ্য লগ", subtitle: "আপনার পাতার রোগ নির্ণয় এবং প্রস্তাবিত পদক্ষেপ",
    empty_title: "এখনও কোন স্বাস্থ্য লগ নেই",
    empty_desc: "ফসলের ছবি পরীক্ষা করতে হোম থেকে পাতা রোগ নির্ণয় ব্যবহার করুন।",
    loading: "স্বাস্থ্য লগ লোড হচ্ছে…", failed: "স্বাস্থ্য লগ লোড করতে ব্যর্থ",
    escalated: "RSK-তে প্রেরিত", recommended: "প্রস্তাবিত",
    confidence: "আত্মবিশ্বাস",
  },
  te: {
    title: "ఆరోగ్య లాగ్‌లు", subtitle: "మీ ఆకు వ్యాధి నిర్ధారణలు మరియు సిఫార్సు చేసిన చర్యలు",
    empty_title: "ఇంకా ఆరోగ్య లాగ్‌లు లేవు",
    empty_desc: "పంట ఫోటోను తనిఖీ చేయడానికి హోమ్ నుండి ఆకు వ్యాధి నిర్ధారణను ఉపయోగించండి.",
    loading: "ఆరోగ్య లాగ్‌లు లోడ్ అవుతున్నాయి…", failed: "ఆరోగ్య లాగ్‌లను లోడ్ చేయడంలో విఫలమైంది",
    escalated: "RSK కి పంపబడింది", recommended: "సిఫార్సు చేయబడింది",
    confidence: "విశ్వాసం",
  },
};

function formatDate(d?: string | null) {
  if (!d) return "";
  try { return new Date(d).toLocaleString(); } catch { return ""; }
}

export default function FarmerHealthLogs() {
  const { farmerProfile } = useAuthContext();
  const farmerId = farmerProfile?.id;
  const [language, setLanguage] = useState<Language>("en");
  const t = T[language];

  const [logs, setLogs] = useState<HealthLogOut[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!farmerId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await listHealthLogs({ farmer_id: farmerId, limit: 100 });
      setLogs(res.items);
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
            <Leaf className="w-7 h-7 text-emerald-600" />
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
      ) : logs.length === 0 ? (
        <div className="bg-white border-2 border-stone-900 rounded-3xl p-10 text-center shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
          <div className="w-14 h-14 mx-auto rounded-2xl border-2 border-stone-900 bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
            <Leaf className="w-7 h-7" />
          </div>
          <p className="font-display font-black text-stone-900">{t.empty_title}</p>
          <p className="text-sm text-stone-500 mt-1">{t.empty_desc}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => {
            const flagged = log.escalate_to_rsk;
            return (
              <div key={log.id} className="bg-white border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-mono font-black uppercase tracking-wide px-2 py-1 rounded-lg border-2 ${
                      log.status === "resolved" ? "bg-emerald-100 text-emerald-800 border-emerald-300" : "bg-amber-100 text-amber-800 border-amber-300"
                    }`}>
                      {log.status}
                    </span>
                    {flagged && (
                      <span className="text-[10px] font-mono font-black uppercase tracking-wide px-2 py-1 rounded-lg border-2 bg-rose-100 text-rose-700 border-rose-300 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" /> {t.escalated}
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-stone-400 shrink-0">{formatDate(log.created_at)}</span>
                </div>
                <div className="mt-3 flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-2xl border-2 border-stone-900 flex items-center justify-center shrink-0 ${flagged ? "bg-rose-100 text-rose-600" : "bg-emerald-100 text-emerald-600"}`}>
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-display font-black text-stone-900">{log.diagnosis}</p>
                    <p className="text-xs text-stone-400 font-mono mt-0.5">{t.confidence}: {log.confidence}</p>
                  </div>
                </div>
                <p className="mt-3 text-sm font-semibold text-stone-800 leading-relaxed">
                  <span className="text-emerald-700 font-bold">{t.recommended}: </span>
                  {log.recommended_action}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
