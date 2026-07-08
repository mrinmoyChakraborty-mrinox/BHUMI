import { useState } from "react";
import {
  Sprout, MessageSquare, Compass, ShieldAlert,
  Droplet, CloudSun, FileText, Award, HelpCircle
} from "lucide-react";
import type { Language } from "../../types";
import Chatbot from "../../components/Chatbot";
import CropRecommendation from "../../components/CropRecommendation";
import DiseaseDetection from "../../components/DiseaseDetection";
import IrrigationAdvice from "../../components/IrrigationAdvice";
import WeatherAdvisory from "../../components/WeatherAdvisory";
import SchemesDirectory from "../../components/SchemesDirectory";
import HackathonGuide from "../../components/HackathonGuide";

type Tab = "chat" | "recommendation" | "disease" | "irrigation" | "weather" | "schemes" | "guide";

export default function PublicHomePage() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<Tab>("chat");

  const tabLabels = {
    en: {
      chat: "AI Chat & Voice", recommendation: "Soil & Crop Suggest",
      disease: "Leaf Disease Diagnosis", irrigation: "Water Schedule",
      weather: "Weather Alerts", schemes: "Govt Schemes",
      guide: "Mentor's Guide & Reviews"
    },
    hi: {
      chat: "एआई चैट और आवाज", recommendation: "मिट्टी और फसल",
      disease: "पत्ती रोग निदान", irrigation: "सिंचाई कार्यक्रम",
      weather: "मौसम अलर्ट", schemes: "सरकारी योजनाएं",
      guide: "मेंटर गाइड और समीक्षा"
    },
    bn: {
      chat: "এআই চ্যাট এবং ভয়েস", recommendation: "মাটি ও ফসল পরামর্শ",
      disease: "পাতার রোগ নির্ণয়", irrigation: "সেচের সময়সূচী",
      weather: "আবহাওয়া সতর্কতা", schemes: "সরকারী প্রকল্প",
      guide: "মেন্টর গাইড এবং পর্যালোচনা"
    }
  }[language];

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 flex-wrap">
        <div className="flex bg-white border-2 border-stone-900 p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
          {(["en", "hi", "bn"] as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition cursor-pointer ${
                language === lang ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {lang === "en" ? "EN" : lang === "hi" ? "हिन्दी" : "বাংলা"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-none gap-3">
        {(Object.entries(tabLabels) as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === key
                ? key === "guide"
                  ? "bg-amber-400 text-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                  : "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            {key === "chat" && <MessageSquare className="w-4 h-4" />}
            {key === "recommendation" && <Compass className="w-4 h-4" />}
            {key === "disease" && <ShieldAlert className="w-4 h-4" />}
            {key === "irrigation" && <Droplet className="w-4 h-4" />}
            {key === "weather" && <CloudSun className="w-4 h-4" />}
            {key === "schemes" && <FileText className="w-4 h-4" />}
            {key === "guide" && <Award className="w-4 h-4" />}
            <span>{label}</span>
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
        {activeTab === "guide" && <HackathonGuide />}
      </div>
    </div>
  );
}
