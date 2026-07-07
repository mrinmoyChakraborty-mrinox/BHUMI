import React, { useState } from "react";
import { Info, Sparkles, Loader2, HelpCircle, ClipboardCheck } from "lucide-react";
import { Language } from "../types";

interface CropRecommendationProps {
  language: Language;
}

export default function CropRecommendation({ language }: CropRecommendationProps) {
  // Form values
  const [n, setN] = useState(80);
  const [p, setP] = useState(40);
  const [k, setK] = useState(40);
  const [soilType, setSoilType] = useState("Alluvial Soil");
  const [ph, setPh] = useState(6.5);
  const [temperature, setTemperature] = useState(26);
  const [rainfall, setRainfall] = useState(1200);
  const [state, setState] = useState("Punjab");
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // Quick preset loader (Judge helper)
  const loadPreset = (type: string) => {
    if (type === "rice") {
      setN(90); setP(45); setK(42); setSoilType("Clayey Soil"); setPh(6.2); setTemperature(29); setRainfall(1800); setState("West Bengal");
    } else if (type === "wheat") {
      setN(80); setP(40); setK(38); setSoilType("Alluvial Soil"); setPh(6.8); setTemperature(19); setRainfall(600); setState("Punjab");
    } else if (type === "cotton") {
      setN(60); setP(30); setK(45); setSoilType("Black Soil"); setPh(7.5); setTemperature(32); setRainfall(800); setState("Gujarat");
    }
  };

  const labels = {
    en: {
      title: "Smart Crop Suggestion",
      sub: "Enter soil macronutrients and regional variables to receive an optimized crop recommendation",
      n: "Nitrogen (N) - Leaf Growth",
      p: "Phosphorus (P) - Root Development",
      k: "Potassium (K) - Disease Resistance",
      soil: "Soil Classification",
      ph: "Soil acidity level (pH)",
      temp: "Mean Temperature (°C)",
      rain: "Expected Annual Precipitation (mm)",
      state: "State Location",
      presets: "Quick Soil Presets (Demo Helper)",
      presetRice: "Rice (Paddy) Profile",
      presetWheat: "Wheat Profile",
      presetCotton: "Cotton Profile",
      submit: "Analyze Soil & Recommend Crops",
      reportTitle: "AI Agronomic Advisory & Crop Report",
      placeholder: "Click recommend to generate your crop plan.",
    },
    hi: {
      title: "स्मार्ट फसल सुझाव",
      sub: "इष्टतम फसल अनुशंसा प्राप्त करने के लिए मिट्टी के मैक्रोन्यूट्रिएंट्स और क्षेत्रीय चर दर्ज करें",
      n: "नाइट्रोजन (N) - पत्ती का विकास",
      p: "फास्फोरस (P) - जड़ का विकास",
      k: "पोटेशियम (K) - रोग प्रतिरोधक क्षमता",
      soil: "मिट्टी का वर्गीकरण",
      ph: "मिट्टी की अम्लता स्तर (pH)",
      temp: "औसत तापमान (°C)",
      rain: "अपेक्षित वार्षिक वर्षा (mm)",
      state: "राज्य स्थान",
      presets: "त्वरित मिट्टी प्रीसेट (डेमो सहायक)",
      presetRice: "धान (चावल) मिट्टी प्रोफाइल",
      presetWheat: "गेहूं मिट्टी प्रोफाइल",
      presetCotton: "कपास मिट्टी प्रोफाइल",
      submit: "मिट्टी का विश्लेषण करें और फसल की सिफारिश करें",
      reportTitle: "एआई कृषि विज्ञान सलाहकार और फसल रिपोर्ट",
      placeholder: "अपनी फसल योजना बनाने के लिए सिफारिश पर क्लिक करें।",
    },
    bn: {
      title: "স্মার্ট ফসল পরামর্শ",
      sub: "অনুকূল ফসল সুপারিশ পেতে মাটির পুষ্টি উপাদান এবং আঞ্চলিক ভেরিয়েবল প্রবেশ করান",
      n: "নাইট্রোজেন (N) - পাতার বৃদ্ধি",
      p: "ফসফরাস (P) - শিকড়ের বিকাশ",
      k: "পটাশিয়াম (K) - রোগ প্রতিরোধ ক্ষমতা",
      soil: "মাটির শ্রেণীবিভাগ",
      ph: "মাটির অম্লতার মাত্রা (pH)",
      temp: "গড় তাপমাত্রা (°C)",
      rain: "বার্ষিক বৃষ্টিপাতের পরিমাণ (mm)",
      state: "রাজ্য অবস্থান",
      presets: "দ্রুত মাটির প্রি-সেট (ডেমো সহায়ক)",
      presetRice: "ধানের মাটির প্রোফাইল",
      presetWheat: "গমের মাটির প্রোফাইল",
      presetCotton: "তুলার মাটির প্রোফাইল",
      submit: "মাটি বিশ্লেষণ এবং ফসল সুপারিশ করুন",
      reportTitle: "এআই কৃষিবিদ্যা পরামর্শ এবং ফসল প্রতিবেদন",
      placeholder: "আপনার ফসল পরিকল্পনা তৈরি করতে সুপারিশ বোতামে ক্লিক করুন।",
    }
  }[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ n, p, k, soilType, ph, temperature, rainfall, state, language }),
      });
      const data = await response.json();
      if (data.success) {
        setResult(data.recommendation);
      } else {
        alert(data.error || "Failed to recommend crops");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" id="crop-recommendation-container">
      {/* Header */}
      <div>
        <h3 className="text-xl font-bold text-stone-900">{labels.title}</h3>
        <p className="text-stone-500 text-sm">{labels.sub}</p>
      </div>

      {/* Demo helper Presets row */}
      <div className="bg-amber-50 border-2 border-stone-900 rounded-3xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-amber-900 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
        <div className="flex items-center gap-2">
          <Info className="w-5 h-5 text-amber-700 shrink-0" />
          <span><strong>{labels.presets}</strong>: Click to instantly load realistic soil metrics from Kaggle Indian agriculture datasets.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => loadPreset("rice")}
            className="bg-white border-2 border-stone-900 hover:bg-stone-50 px-3 py-1.5 rounded-xl text-stone-900 font-mono font-bold shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer"
          >
            🌾 {labels.presetRice}
          </button>
          <button 
            onClick={() => loadPreset("wheat")}
            className="bg-white border-2 border-stone-900 hover:bg-stone-50 px-3 py-1.5 rounded-xl text-stone-900 font-mono font-bold shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer"
          >
            🌾 {labels.presetWheat}
          </button>
          <button 
            onClick={() => loadPreset("cotton")}
            className="bg-white border-2 border-stone-900 hover:bg-stone-50 px-3 py-1.5 rounded-xl text-stone-900 font-mono font-bold shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer"
          >
            🌱 {labels.presetCotton}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters Form Card */}
        <form onSubmit={handleSubmit} className="lg:col-span-5 bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-4">
          {/* N Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1 font-mono">
              <span>{labels.n}</span>
              <span className="text-emerald-700 font-black">{n} mg/kg</span>
            </div>
            <input 
              type="range" min="10" max="150" value={n} onChange={(e) => setN(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* P Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1 font-mono">
              <span>{labels.p}</span>
              <span className="text-emerald-700 font-black">{p} mg/kg</span>
            </div>
            <input 
              type="range" min="5" max="90" value={p} onChange={(e) => setP(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* K Slider */}
          <div>
            <div className="flex justify-between text-xs font-bold text-stone-700 mb-1 font-mono">
              <span>{labels.k}</span>
              <span className="text-emerald-700 font-black">{k} mg/kg</span>
            </div>
            <input 
              type="range" min="5" max="90" value={k} onChange={(e) => setK(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
          </div>

          {/* Soil dropdown */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 font-mono">{labels.soil}</label>
            <select 
              value={soilType} onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              <option value="Alluvial Soil">Alluvial Soil (गंगा का जلوढ़)</option>
              <option value="Black Soil">Black Cotton Soil (काली मिट्टी)</option>
              <option value="Red Soil">Red Clayey Soil (लाल मिट्टी)</option>
              <option value="Sandy Soil">Sandy Loam Soil (बलुई मिट्टी)</option>
              <option value="Clayey Soil">Clayey Rich Soil (चिकनी मिट्टी)</option>
            </select>
          </div>

          {/* pH & Temperature row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1 font-mono">
                <span>{labels.ph}</span>
                <span className="text-emerald-700 font-black">{ph}</span>
              </div>
              <input 
                type="range" min="4" max="9" step="0.1" value={ph} onChange={(e) => setPh(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-stone-700 mb-1 font-mono">
                <span>{labels.temp}</span>
                <span className="text-emerald-700 font-black">{temperature}°C</span>
              </div>
              <input 
                type="range" min="10" max="45" value={temperature} onChange={(e) => setTemperature(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Rainfall & Location row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 font-mono">{labels.rain}</label>
              <input 
                type="number" value={rainfall} onChange={(e) => setRainfall(Number(e.target.value))}
                className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase mb-1 font-mono">{labels.state}</label>
              <input 
                type="text" value={state} onChange={(e) => setState(e.target.value)}
                className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3 py-2 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                placeholder="e.g. West Bengal"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-display font-black text-sm px-4 py-3 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center justify-center gap-2 transition cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing soil matrices...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{labels.submit}</span>
              </>
            )}
          </button>
        </form>

        {/* Advisory Report Display Column */}
        <div className="lg:col-span-7 bg-emerald-50 border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-emerald-900 border-b-2 border-stone-900 pb-3 mb-4 flex items-center gap-2 text-base">
              <ClipboardCheck className="w-5 h-5 text-emerald-700" />
              {labels.reportTitle}
            </h4>

            {result ? (
              <div className="prose prose-stone max-w-none text-stone-800 text-sm whitespace-pre-line leading-relaxed space-y-3">
                {result}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-center gap-2">
                <HelpCircle className="w-10 h-10 text-stone-300 animate-pulse" />
                <p className="text-sm max-w-xs">{labels.placeholder}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
