import { useState } from "react";
import { CloudRain, Thermometer, Wind, Droplets, AlertTriangle, CloudSun, Loader2, Sparkles } from "lucide-react";
import { weatherAdvisory } from "../api/endpoints/publicPortal";
import type { PublicWeatherAdvisoryResponse } from "../api/types";
import { Language } from "../types";

interface WeatherAdvisoryProps {
  language: Language;
}

export default function WeatherAdvisory({ language }: WeatherAdvisoryProps) {
  const [state, setState] = useState("Andhra Pradesh");
  const [district, setDistrict] = useState("Guntur");
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<PublicWeatherAdvisoryResponse["metrics"] | null>(null);

  const fetchAdvisory = async () => {
    setLoading(true);
    try {
      const data = await weatherAdvisory({ state, district, language });
      if (data.success) {
        setAdvisory(data.advisory);
        setMetrics(data.metrics);
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Failed to generate advisory");
    } finally {
      setLoading(false);
    }
  };

  // Content labels based on selected language
  const labels = {
    en: {
      title: "Agro-Meteorological Advisory",
      sub: "Smart local alerts and 3-day farming forecasts based on district micro-climate",
      stateLabel: "Select State",
      districtLabel: "Select District/Region",
      getAdvisory: "Generate Advisory Report",
      metricsTitle: "Met-Indices for Farming",
      temp: "Temperature",
      humidity: "Humidity",
      wind: "Wind Speed",
      soilMoist: "Soil Moisture",
      pestRisk: "Pest infection Risk Index",
      advisoryReport: "AI Weather Advisory Bulletin",
      errorMsg: "Please select a region and generate your agro-climate advisory report.",
    },
    hi: {
      title: "कृषि-मौसम विज्ञान सलाह",
      sub: "जिला सूक्ष्म जलवायु पर आधारित स्मार्ट स्थानीय अलर्ट और 3-दिवसीय कृषि पूर्वानुमान",
      stateLabel: "राज्य चुनें",
      districtLabel: "जिला/क्षेत्र चुनें",
      getAdvisory: "सलाहकार रिपोर्ट प्राप्त करें",
      metricsTitle: "खेती के लिए मौसम सूचकांक",
      temp: "तापमान",
      humidity: "आर्द्रता (नमी)",
      wind: "हवा की गति",
      soilMoist: "मिट्टी की नमी",
      pestRisk: "कीट संक्रमण जोखिम सूचकांक",
      advisoryReport: "एआई मौसम सलाहकार बुलेटिन",
      errorMsg: "कृपया एक क्षेत्र चुनें और अपनी कृषि-जलवायु सलाहकार रिपोर्ट उत्पन्न करें।",
    },
    bn: {
      title: "কৃষি-আবহাওয়া পরামর্শ",
      sub: "জেলা ক্ষুদ্র-জলবায়ুর উপর ভিত্তি করে স্মার্ট স্থানীয় সতর্কতা এবং ৩ দিনের চাষের পূর্বাভাস",
      stateLabel: "রাজ্য নির্বাচন করুন",
      districtLabel: "জেলা/অঞ্চল নির্বাচন করুন",
      getAdvisory: "পরামর্শ প্রতিবেদন তৈরি করুন",
      metricsTitle: "চাষের জন্য আবহাওয়া সূচক",
      temp: "তাপমাত্রা",
      humidity: "আর্দ্রতা (বাতাসে আর্দ্রতা)",
      wind: "বাতাসের গতি",
      soilMoist: "মাটির আর্দ্রতা",
      pestRisk: "কীটপতঙ্গ সংক্রমণের ঝুঁকি সূচক",
      advisoryReport: "এআই আবহাওয়া পরামর্শ বুলেটিন",
      errorMsg: "দয়া করে একটি অঞ্চল নির্বাচন করুন এবং আপনার কৃষি-জলবায়ু পরামর্শ প্রতিবেদন তৈরি করুন।",
    }
  }[language];

  return (
    <div className="space-y-6" id="weather-advisory-container">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-stone-900 pb-5" id="weather-header">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <CloudSun className="w-7 h-7 text-emerald-600 animate-bounce" />
            <span>{labels.title}</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1 max-w-xl">{labels.sub}</p>
        </div>
      </div>

      {/* Grid selector - Bento styled */}
      <div className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] grid grid-cols-1 md:grid-cols-3 gap-4 items-end" id="weather-selector-panel">
        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5 font-mono">{labels.stateLabel}</label>
          <select 
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
          >
            <option value="Andhra Pradesh">
    Andhra Pradesh
</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5 font-mono">{labels.districtLabel}</label>
          <input 
            type="text"
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
           placeholder="e.g. Guntur"
          />
        </div>

        <button
          onClick={fetchAdvisory}
          disabled={loading || !district}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-display font-black text-sm px-4 py-3 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center justify-center gap-2 transition cursor-pointer"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-200" />
              <span>{labels.getAdvisory}</span>
            </>
          )}
        </button>
      </div>

      {/* Weather Info & Advice Display */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="weather-results-grid">
          {/* Met Indices List */}
          <div className="lg:col-span-1 bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] h-fit space-y-4">
            <h4 className="font-display font-black text-stone-900 border-b-2 border-stone-900 pb-2 text-sm uppercase tracking-wide flex items-center gap-2">
              <CloudSun className="w-4 h-4 text-emerald-600" />
              {labels.metricsTitle}
            </h4>

            <div className="space-y-3.5 text-stone-700 text-sm font-mono">
              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border-2 border-stone-900">
                <span className="flex items-center gap-2 text-stone-800 font-bold">
                  <Thermometer className="w-4 h-4 text-orange-600" />
                  {labels.temp}
                </span>
                <span className="font-black text-stone-900">{metrics.temperature}°C</span>
              </div>

              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border-2 border-stone-900">
                <span className="flex items-center gap-2 text-stone-800 font-bold">
                  <Droplets className="w-4 h-4 text-blue-600" />
                  {labels.humidity}
                </span>
                <span className="font-black text-stone-900">{metrics.humidity}%</span>
              </div>

              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border-2 border-stone-900">
                <span className="flex items-center gap-2 text-stone-800 font-bold">
                  <Wind className="w-4 h-4 text-sky-600" />
                  {labels.wind}
                </span>
                <span className="font-black text-stone-900">{metrics.wind_speed} km/h</span>
              </div>

              <div className="flex justify-between items-center bg-stone-50 p-2.5 rounded-xl border-2 border-stone-900">
                <span className="flex items-center gap-2 text-stone-800 font-bold">
                  <CloudRain className="w-4 h-4 text-teal-600" />
                  {labels.soilMoist}
                </span>
                <span className="font-black text-stone-900">{metrics.soilMoisture}</span>
              </div>

              <div className="bg-amber-50 border-2 border-stone-900 p-3.5 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]">
                <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold uppercase tracking-wider">{labels.pestRisk}</div>
                  <div className="mt-1 text-stone-800 font-bold">{metrics.pestRiskIndex}</div>
                </div>
              </div>
            </div>
          </div>

          {/* AI generated markdown Advisory report */}
          <div className="lg:col-span-2 bg-emerald-50 border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <h4 className="font-display font-black text-emerald-900 border-b-2 border-stone-900 pb-3 mb-4 flex items-center gap-2 text-base">
              <Sparkles className="w-5 h-5 text-emerald-700 animate-pulse" />
              {labels.advisoryReport}
            </h4>

            <div className="prose prose-stone max-w-none text-stone-900 text-sm whitespace-pre-line leading-relaxed space-y-3">
              {advisory}
            </div>
          </div>
        </div>
      )}

      {!metrics && !loading && (
        <div className="bg-stone-50 border-2 border-dashed border-stone-900 rounded-3xl p-12 text-center text-stone-700 font-bold text-sm shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]" id="weather-fallback-prompt">
          <CloudSun className="w-12 h-12 text-stone-400 mx-auto mb-3 animate-pulse" />
          <p>{labels.errorMsg}</p>
        </div>
      )}
    </div>
  );
}