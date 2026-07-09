import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Sprout, MessageSquare, Compass, ShieldAlert,
  Droplet, CloudSun, FileText, ArrowRight,
  Languages, Leaf, Wheat, HeartHandshake, Download,
} from "lucide-react";
import type { Language } from "../../types";
import LOGO from "../../LOGO_BHUMI.png";

const features = [
  {
    icon: MessageSquare,
    title: "AI Chat & Voice Assistant",
    desc: "Talk or type in English, Hindi, Bengali, or Telugu. Get instant farming advice.",
    color: "bg-emerald-50 text-emerald-700",
    border: "border-emerald-600",
  },
  {
    icon: Compass,
    title: "Crop Recommendation",
    desc: "Enter your soil data and get AI-powered crop suggestions tailored to your land.",
    color: "bg-amber-50 text-amber-700",
    border: "border-amber-600",
  },
  {
    icon: ShieldAlert,
    title: "Disease Detection",
    desc: "Upload a leaf photo and Gemini AI identifies plant diseases instantly.",
    color: "bg-red-50 text-red-700",
    border: "border-red-600",
  },
  {
    icon: Droplet,
    title: "Irrigation Advice",
    desc: "Smart watering schedules based on crop type, soil, and growth stage.",
    color: "bg-blue-50 text-blue-700",
    border: "border-blue-600",
  },
  {
    icon: CloudSun,
    title: "Weather Alerts",
    desc: "Real-time agro-meteorological advisories for your district.",
    color: "bg-sky-50 text-sky-700",
    border: "border-sky-600",
  },
  {
    icon: FileText,
    title: "Government Schemes",
    desc: "Explore PM-KISAN, PMFBY, KCC and check your eligibility instantly.",
    color: "bg-violet-50 text-violet-700",
    border: "border-violet-600",
  },
];

const LANG_LABELS: Record<Language, { label: string; flag: string }> = {
  en: { label: "English", flag: "EN" },
  hi: { label: "हिन्दी", flag: "HI" },
  bn: { label: "বাংলা", flag: "BN" },
  te: { label: "తెలుగు", flag: "TE" },
};

const HERO_TEXT: Record<Language, { title: string; subtitle: string; cta: string }> = {
  en: {
    title: "Smart Farming, Powered by AI",
    subtitle: "Free AI tools for Indian farmers — crop advice, disease detection, weather alerts & government schemes in your language.",
    cta: "Enter Krishi AI Portal",
  },
  hi: {
    title: "स्मार्ट खेती, AI की मदद से",
    subtitle: "भारतीय किसानों के लिए मुफ्त AI उपकरण — फसल सलाह, रोग पहचान, मौसम अलर्ट और सरकारी योजनाएं आपकी भाषा में।",
    cta: "कृषि AI पोर्टल में प्रवेश करें",
  },
  bn: {
    title: "স্মার্ট চাষ, AI দ্বারা চালিত",
    subtitle: "ভারতীয় কৃষকদের জন্য বিনামূল্যে AI টুলস — ফসলের পরামর্শ, রোগ সনাক্তকরণ, আবহাওয়া সতর্কতা ও সরকারি প্রকল্প আপনার ভাষায়।",
    cta: "কৃষি AI পোর্টালে প্রবেশ করুন",
  },
  te: {
    title: "స్మార్ట్ వ్యవసాయం, AI తో",
    subtitle: "భారత రైతుల కోసం ఉచిత AI సాధనాలు — పంట సలహా, వ్యాధి గుర్తింపు, వాతావరణ హెచ్చరికలు & ప్రభుత్వ పథకాలు మీ భాషలో.",
    cta: "కృషి AI పోర్టల్‌లో ప్రవేశించండి",
  },
};

const FOOTER: Record<Language, string> = {
  en: "BHUMI — National AgriTech Initiative",
  hi: "भूमि — राष्ट्रीय कृषि प्रौद्योगिकी पहल",
  bn: "ভূমি — জাতীয় কৃষি প্রযুক্তি উদ্যোগ",
  te: "భూమి — జాతీయ వ్యవసాయ సాంకేతిక కార్యక్రమం",
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>("en");
  const navigate = useNavigate();
  const t = HERO_TEXT[language];

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onAppInstalled);
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 antialiased flex flex-col">
      {/* ── Top nav ─────────────────────────────────────────────── */}
      <header className="bg-white border-b-4 border-stone-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 no-underline">
            <img
              src={LOGO}
              alt="BHUMI"
              className="w-10 h-10 rounded-xl border-2 border-stone-900 object-cover"
            />
            <div>
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-800 font-mono">
                BHUMI
              </span>
              <h1 className="text-lg font-black text-stone-900 leading-tight">
                Krishi AI Portal
              </h1>
            </div>
          </Link>
          <nav className="flex items-center gap-3">
            {/* Language switcher */}
            <div className="hidden sm:flex bg-white border-2 border-stone-900 p-0.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                    language === lang
                      ? "bg-emerald-600 text-white"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                  title={LANG_LABELS[lang].label}
                >
                  {LANG_LABELS[lang].flag}
                </button>
              ))}
            </div>
            {deferredPrompt && !isInstalled && (
              <button
                onClick={handleInstall}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono bg-emerald-600 text-white border-2 border-stone-900 rounded-xl hover:bg-emerald-700 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] cursor-pointer"
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
            )}
            <Link
              to="/login"
              className="px-4 py-2 text-xs font-bold font-mono bg-white border-2 border-stone-900 rounded-xl hover:bg-stone-50 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
            >
              RSK Login
            </Link>
          </nav>
        </div>
      </header>

      {/* ── Hero section ────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          {/* Logo row */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 bg-emerald-600 border-4 border-stone-900 rounded-3xl shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] overflow-hidden">
              <img
                src={LOGO}
                alt="BHUMI"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Mobile language selector */}
          <div className="sm:hidden flex justify-center mb-6">
            <div className="flex bg-white border-2 border-stone-900 p-0.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition cursor-pointer ${
                    language === lang
                      ? "bg-emerald-600 text-white"
                      : "text-stone-500 hover:text-stone-900"
                  }`}
                >
                  {LANG_LABELS[lang].flag}
                </button>
              ))}
            </div>
          </div>

          {/* Tagline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-display font-black text-stone-900 leading-tight mb-4">
            {t.title}
          </h2>
          <p className="text-stone-600 text-base sm:text-lg max-w-2xl mx-auto font-medium mb-10 leading-relaxed">
            {t.subtitle}
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate("/app")}
              className="inline-flex items-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-display font-black text-base px-8 py-4 rounded-2xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all cursor-pointer hover:-translate-y-0.5"
            >
              <Sprout className="w-5 h-5" />
              {t.cta}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Trust badges */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs font-mono font-bold text-stone-500">
            <span className="flex items-center gap-1.5 bg-white border-2 border-stone-900 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" /> 100% Free
            </span>
            <span className="flex items-center gap-1.5 bg-white border-2 border-stone-900 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              <Languages className="w-3.5 h-3.5 text-emerald-600" /> 4 Languages
            </span>
            <span className="flex items-center gap-1.5 bg-white border-2 border-stone-900 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              <Leaf className="w-3.5 h-3.5 text-emerald-600" /> Powered by Google Gemini
            </span>
            <span className="flex items-center gap-1.5 bg-white border-2 border-stone-900 px-3 py-1.5 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
              <Wheat className="w-3.5 h-3.5 text-emerald-600" /> For Indian Farmers
            </span>
          </div>
        </div>
      </section>

      {/* ── Features grid ───────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all hover:-translate-y-0.5"
            >
              <div className={`w-12 h-12 rounded-2xl border-2 border-stone-900 flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon className="w-6 h-6" />
              </div>
              <h3 className="text-base font-display font-black text-stone-900 mb-1.5">
                {f.title}
              </h3>
              <p className="text-xs text-stone-600 font-medium leading-relaxed">
                {f.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <button
            onClick={() => navigate("/app")}
            className="inline-flex items-center gap-2.5 bg-stone-900 hover:bg-stone-800 text-white font-display font-black text-sm px-7 py-3.5 rounded-2xl border-2 border-stone-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] hover:shadow-[6px_6px_0px_0px_rgba(28,25,23,1)] transition-all cursor-pointer hover:-translate-y-0.5"
          >
            <Sprout className="w-4 h-4" />
            {t.cta}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-stone-100 border-t-4 border-stone-900 text-stone-600 py-6 text-center text-xs">
        <p className="font-mono text-stone-500">{FOOTER[language]}</p>
      </footer>
    </div>
  );
}
