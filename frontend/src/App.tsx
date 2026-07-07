import { useState } from "react";
import { 
  Sprout, MessageSquare, Compass, ShieldAlert, 
  Droplet, CloudSun, FileText, Award, HelpCircle, 
  Languages, GraduationCap, Github 
} from "lucide-react";
import { Language } from "./types";
import Chatbot from "./components/Chatbot";
import CropRecommendation from "./components/CropRecommendation";
import DiseaseDetection from "./components/DiseaseDetection";
import IrrigationAdvice from "./components/IrrigationAdvice";
import WeatherAdvisory from "./components/WeatherAdvisory";
import SchemesDirectory from "./components/SchemesDirectory";
import HackathonGuide from "./components/HackathonGuide";

export default function App() {
  const [language, setLanguage] = useState<Language>("en");
  const [activeTab, setActiveTab] = useState<
    "chat" | "recommendation" | "disease" | "irrigation" | "weather" | "schemes" | "guide"
  >("chat");

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  const appTitle = {
    en: { name: "Krishi AI Portal", sub: "National AgriTech MVP" },
    hi: { name: "कृषि एआई पोर्टल", sub: "राष्ट्रीय कृषि-तकनीक एमवीपी" },
    bn: { name: "কৃষি এআই পোর্টাল", sub: "জাতীয় কৃষি-প্রযুক্তি এমভিটি" }
  }[language];

  const tabLabels = {
    en: {
      chat: "AI Chat & Voice",
      recommendation: "Soil & Crop Suggest",
      disease: "Leaf Disease Diagnosis",
      irrigation: "Water Schedule",
      weather: "Weather Alerts",
      schemes: "Govt Schemes",
      guide: "Mentor's Guide & Reviews"
    },
    hi: {
      chat: "एआई चैट और आवाज",
      recommendation: "मिट्टी और फसल",
      disease: "पत्ती रोग निदान",
      irrigation: "सिंचाई कार्यक्रम",
      weather: "मौसम अलर्ट",
      schemes: "सरकारी योजनाएं",
      guide: "मेंटर गाइड और समीक्षा"
    },
    bn: {
      chat: "এআই চ্যাট এবং ভয়েস",
      recommendation: "মাটি ও ফসল পরামর্শ",
      disease: "পাতার রোগ নির্ণয়",
      irrigation: "সেচের সময়সূচী",
      weather: "আবহাওয়া সতর্কতা",
      schemes: "সরকারী প্রকল্প",
      guide: "মেন্টর গাইড এবং পর্যালোচনা"
    }
  }[language];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans antialiased selection:bg-emerald-200" id="main-app-root">
      {/* Top Banner Navigation bar - Bento Style */}
      <header className="bg-white border-b-4 border-stone-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 border-2 border-stone-900 rounded-xl flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] shrink-0">
              <Sprout className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 font-mono">Hackathon MVP • Track: AgriTech</span>
                <span className="bg-amber-400 text-stone-900 border border-stone-900 text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded">
                  READY FOR DEMO
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-display font-black text-stone-900 tracking-tight flex items-center gap-2 mt-0.5">
                <span>{appTitle.name}</span>
              </h1>
            </div>
          </div>

          {/* Configuration toolbar & Live Telemetry (Language & Mentorship guide anchor) */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="hidden sm:flex gap-4 border-r border-stone-300 pr-4">
              <div className="text-right">
                <div className="text-[9px] uppercase font-mono font-bold text-stone-400">System Status</div>
                <div className="text-xs font-mono font-bold text-emerald-700 underline underline-offset-4">API: STABLE (0.4ms)</div>
              </div>
              <div className="text-right">
                <div className="text-[9px] uppercase font-mono font-bold text-stone-400">Team ID</div>
                <div className="text-xs font-mono font-bold">ALPHA-99-IND</div>
              </div>
            </div>

            {/* Language Selection controls */}
            <div className="flex bg-white border-2 border-stone-900 p-1 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              <button
                onClick={() => handleLanguageChange("en")}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                  language === "en" ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                EN
              </button>
              <button
                onClick={() => handleLanguageChange("hi")}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                  language === "hi" ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                हिन्दी
              </button>
              <button
                onClick={() => handleLanguageChange("bn")}
                className={`px-3 py-1.5 text-xs font-mono font-bold rounded-lg transition ${
                  language === "bn" ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
                }`}
              >
                বাংলা
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Controls Navigation Rail styled as Bento grid items */}
        <div className="flex overflow-x-auto pb-4 mb-8 scrollbar-none gap-3">
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "chat"
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{tabLabels.chat}</span>
          </button>

          <button
            onClick={() => setActiveTab("recommendation")}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "recommendation"
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>{tabLabels.recommendation}</span>
          </button>

          <button
            onClick={() => setActiveTab("disease")}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "disease"
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{tabLabels.disease}</span>
          </button>

          <button
            onClick={() => setActiveTab("irrigation")}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "irrigation"
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <Droplet className="w-4 h-4" />
            <span>{tabLabels.irrigation}</span>
          </button>

          <button
            onClick={() => setActiveTab("weather")}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "weather"
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <CloudSun className="w-4 h-4" />
            <span>{tabLabels.weather}</span>
          </button>

          <button
            onClick={() => setActiveTab("schemes")}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "schemes"
                ? "bg-emerald-600 text-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-white text-stone-800 hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{tabLabels.schemes}</span>
          </button>

          <button
            onClick={() => setActiveTab("guide")}
            className={`px-5 py-3 text-xs font-display font-black rounded-2xl border-2 border-stone-900 flex items-center gap-2 shrink-0 transition-all cursor-pointer ${
              activeTab === "guide"
                ? "bg-amber-400 text-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transform -translate-y-0.5"
                : "bg-amber-50 text-amber-900 hover:bg-amber-100 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            }`}
          >
            <Award className="w-4 h-4" />
            <span>{tabLabels.guide}</span>
          </button>
        </div>

        {/* Tab Panel Content switcher within Bento-styled Panel */}
        <div className="bg-white rounded-3xl border-2 border-stone-900 p-6 sm:p-8 shadow-[6px_6px_0px_0px_rgba(28,25,23,1)]">
          {activeTab === "chat" && <Chatbot language={language} />}
          {activeTab === "recommendation" && <CropRecommendation language={language} />}
          {activeTab === "disease" && <DiseaseDetection language={language} />}
          {activeTab === "irrigation" && <IrrigationAdvice language={language} />}
          {activeTab === "weather" && <WeatherAdvisory language={language} />}
          {activeTab === "schemes" && <SchemesDirectory language={language} />}
          {activeTab === "guide" && <HackathonGuide />}
        </div>
      </main>

      {/* Earthy Retro-Brutalist Footer */}
      <footer className="bg-stone-100 border-t-4 border-stone-900 text-stone-600 py-8 mt-16 text-center text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-stone-900 font-display font-black">
            <Sprout className="w-5 h-5 text-emerald-600" />
            <span>KRISHI AI • MVP BLUEPRINT</span>
          </div>
          <p className="font-mono text-stone-500">
            National AgriTech Hackathon • Built with <span className="underline underline-offset-2 text-emerald-700 font-bold">@google/genai</span> & Gemini 3.5 Flash
          </p>
          <div className="flex gap-6 font-mono font-bold">
            <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-stone-900 hover:text-emerald-700 hover:underline">data.gov.in</a>
            <a href="https://pmkisan.gov.in" target="_blank" rel="noreferrer" className="text-stone-900 hover:text-emerald-700 hover:underline">PM-Kisan</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
