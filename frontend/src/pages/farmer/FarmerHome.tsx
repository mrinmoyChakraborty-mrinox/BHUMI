import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare, Compass, ShieldAlert, Droplet, CloudSun, FileText,
  MapPin, Bell, Leaf, Plus, Loader2, Sprout,
} from "lucide-react";
import type { Language } from "../../types";
import { useAuthContext } from "../../auth/AuthContext";
import Chatbot from "../../components/Chatbot";
import CropRecommendation from "../../components/CropRecommendation";
import DiseaseDetection from "../../components/DiseaseDetection";
import IrrigationAdvice from "../../components/IrrigationAdvice";
import WeatherAdvisory from "../../components/WeatherAdvisory";
import SchemesDirectory from "../../components/SchemesDirectory";
import { listPlots } from "../../api/endpoints/plots";
import { listAlerts } from "../../api/endpoints/alerts";
import { listHealthLogs } from "../../api/endpoints/healthLogs";

type Tab = "chat" | "recommendation" | "disease" | "irrigation" | "weather" | "schemes";

const tabMeta: { key: Tab; label: Record<Language, string>; icon: typeof MessageSquare }[] = [
  { key: "chat", label: { en: "AI Chat & Voice", hi: "एआई चैट और आवाज", bn: "এআই চ্যাট এবং ভয়েস", te: "AI చాట్ & వాయిస్" }, icon: MessageSquare },
  { key: "recommendation", label: { en: "Soil & Crop Suggest", hi: "मिट्टी और फसल", bn: "মাটি ও ফসল পরামর্শ", te: "నేల & పంట సూచన" }, icon: Compass },
  { key: "disease", label: { en: "Leaf Disease Diagnosis", hi: "पत्ती रोग निदान", bn: "পাতার রোগ নির্ণয়", te: "ఆకు వ్యాధి నిర్ధారణ" }, icon: ShieldAlert },
  { key: "irrigation", label: { en: "Water Schedule", hi: "सिंचाई कार्यक्रम", bn: "সেচের সময়সূচী", te: "నీటి షెడ్యూల్" }, icon: Droplet },
  { key: "weather", label: { en: "Weather Alerts", hi: "मौसम अलर्ट", bn: "আবহাওয়া সতর্কতা", te: "వాతావరణ హెచ్చరికలు" }, icon: CloudSun },
  { key: "schemes", label: { en: "Govt Schemes", hi: "सरकारी योजनाएं", bn: "সরকারী প্রকল্প", te: "ప్రభుత్వ పథకాలు" }, icon: FileText },
];

export default function FarmerHome() {
  const { farmerProfile } = useAuthContext();
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const [stats, setStats] = useState<{ plots: number; alerts: number; health: number } | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const farmerId = farmerProfile?.id;

  const loadStats = useCallback(async () => {
    if (!farmerId) return;
    setLoadingStats(true);
    try {
      const [plots, alerts, health] = await Promise.all([
        listPlots({ farmer_id: farmerId, limit: 100 }),
        listAlerts({ farmer_id: farmerId, limit: 100 }),
        listHealthLogs({ farmer_id: farmerId, limit: 100 }),
      ]);
      setStats({
        plots: plots.items.length,
        alerts: alerts.items.filter((a) => a.status !== "resolved" && a.status !== "acknowledged").length,
        health: health.items.filter((h) => h.status !== "resolved").length,
      });
    } catch {
      setStats({ plots: 0, alerts: 0, health: 0 });
    } finally {
      setLoadingStats(false);
    }
  }, [farmerId]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const overview = stats
    ? [
        { label: "My Plots", value: stats.plots, icon: MapPin, to: "/farmer/plots", color: "bg-emerald-100 text-emerald-800" },
        { label: "Active Alerts", value: stats.alerts, icon: Bell, to: "/farmer/alerts", color: "bg-amber-100 text-amber-800" },
        { label: "Health Cases", value: stats.health, icon: Leaf, to: "/farmer/health-logs", color: "bg-red-100 text-red-800" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <Sprout className="w-7 h-7 text-emerald-600" />
            <span>Welcome, {farmerProfile?.name || "Farmer"}</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1">
            Your AI farming tools and personal dashboard
          </p>
        </div>
        <div className="flex bg-white border-2 border-stone-900 p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
          {(["en", "hi", "bn", "te"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition cursor-pointer ${
                language === lang ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : lang === "bn" ? "বাংলা" : "తెలుగు"}
            </button>
          ))}
        </div>
      </div>

      {/* Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {loadingStats
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl border-2 border-stone-900 bg-stone-100 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-stone-400" />
                </div>
                <div>
                  <p className="text-stone-400 text-xs font-mono font-bold uppercase">…</p>
                  <p className="text-3xl font-display font-black text-stone-300">–</p>
                </div>
              </div>
            ))
          : overview.map((o) => (
              <Link
                key={o.label}
                to={o.to}
                className="bg-white border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex items-center gap-4 hover:-translate-y-0.5 transition-transform no-underline"
              >
                <div className={`w-12 h-12 rounded-2xl border-2 border-stone-900 flex items-center justify-center shrink-0 ${o.color}`}>
                  <o.icon className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-stone-500 text-xs font-mono font-bold uppercase tracking-wide">{o.label}</p>
                  <p className="text-3xl font-display font-black text-stone-900 mt-0.5">{o.value}</p>
                </div>
              </Link>
            ))}
      </div>

      {!loadingStats && stats && stats.plots === 0 && (
        <Link
          to="/farmer/plots"
          className="block bg-emerald-50 border-2 border-emerald-600 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(5,150,105,1)] flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform no-underline"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl border-2 border-emerald-700 bg-emerald-600 text-white flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </div>
            <div>
              <p className="font-display font-black text-emerald-900">Add your first plot</p>
              <p className="text-xs font-medium text-emerald-800">Track crops, get alerts and personalised advice.</p>
            </div>
          </div>
          <span className="text-emerald-700 font-bold text-sm">Get started →</span>
        </Link>
      )}

      {/* AI Tools */}
      <div className="flex overflow-x-auto pb-4 scrollbar-none gap-3">
        {tabMeta.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === tab.key
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label[language]}</span>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border-2 border-stone-900 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]">
        {activeTab === "chat" && <Chatbot language={language} />}
        {activeTab === "recommendation" && <CropRecommendation language={language} />}
        {activeTab === "disease" && <DiseaseDetection language={language} />}
        {activeTab === "irrigation" && <IrrigationAdvice language={language} />}
        {activeTab === "weather" && <WeatherAdvisory language={language} />}
        {activeTab === "schemes" && <SchemesDirectory language={language} />}
      </div>
    </div>
  );
}
