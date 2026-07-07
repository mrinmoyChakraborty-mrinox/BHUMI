import React, { useState } from "react";
import { Droplet, Sparkles, Loader2, Info, HelpCircle } from "lucide-react";
import { Language } from "../types";

interface IrrigationAdviceProps {
  language: Language;
}

export default function IrrigationAdvice({ language }: IrrigationAdviceProps) {
  const [cropName, setCropName] = useState("Rice");
  const [soilType, setSoilType] = useState("Clayey Soil");
  const [stage, setStage] = useState("Vegetative Growth");
  const [source, setSource] = useState("Tube-well");
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const fetchAdvice = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/irrigation-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cropName, soilType, stage, source, language }),
      });
      const data = await response.json();
      if (data.success) {
        setAdvice(data.advice);
      } else {
        alert(data.error || "Failed to calculate advice");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const labels = {
    en: {
      title: "Smart Irrigation & Water Advisor",
      sub: "Map soil water capacities, growth stages, and weather data to optimize irrigation intervals",
      crop: "Select Crop Type",
      soil: "Select Soil Type",
      stage: "Current Cultivation Stage",
      source: "Primary Water Source",
      submit: "Calculate Watering Schedule",
      reportTitle: "AI Irrigation Recommendation",
      placeholder: "Click calculate to generate watering guidelines.",
    },
    hi: {
      title: "स्मार्ट सिंचाई और जल सलाहकार",
      sub: "सिंचाई अंतराल को अनुकूलित करने के लिए मिट्टी के जल की क्षमता, विकास चरणों और मौसम के आंकड़ों का मिलान करें",
      crop: "फसल का प्रकार चुनें",
      soil: "मिट्टी का प्रकार चुनें",
      stage: "वर्तमान खेती का चरण",
      source: "प्राथमिक जल स्रोत",
      submit: "सिंचाई कार्यक्रम की गणना करें",
      reportTitle: "एआई सिंचाई सिफ़ारिश",
      placeholder: "पानी देने की दिशा-निर्देश उत्पन्न करने के लिए गणना करें पर क्लिक करें।",
    },
    bn: {
      title: "স্মার্ট সেচ এবং জল উপদেষ্টা",
      sub: "সেচ ব্যবধান অপ্টিমাইজ করতে মাটির জল ধারণ ক্ষমতা, বৃদ্ধির পর্যায় এবং আবহাওয়ার ডেটা ম্যাপিং করুন",
      crop: "ফসলের ধরন নির্বাচন করুন",
      soil: "মাটির ধরন নির্বাচন করুন",
      stage: "বর্তমান চাষের পর্যায়",
      source: "প্রাথমিক জলের উৎস",
      submit: "সেচ সময়সূচী গণনা করুন",
      reportTitle: "এআই সেচ সুপারিশ",
      placeholder: "সেচ নির্দেশিকা তৈরি করতে গণনা করুন ক্লিক করুন।",
    }
  }[language];

  return (
    <div className="space-y-6" id="irrigation-advisory-section">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-stone-900 pb-5" id="irrigation-header">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <Droplet className="w-7 h-7 text-emerald-600 animate-bounce" />
            <span>{labels.title}</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1 max-w-xl">{labels.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Inputs */}
        <form onSubmit={fetchAdvice} className="lg:col-span-5 bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-4" id="irrigation-form">
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5 font-mono">{labels.crop}</label>
            <select 
              value={cropName} onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              <option value="Rice">Rice (ধান / धान)</option>
              <option value="Wheat">Wheat (গম / गेहूं)</option>
              <option value="Maize">Maize (ভুট্টা / मक्का)</option>
              <option value="Cotton">Cotton (তুলা / कपास)</option>
              <option value="Sugarcane">Sugarcane (আখ / गन्ना)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5 font-mono">{labels.soil}</label>
            <select 
              value={soilType} onChange={(e) => setSoilType(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              <option value="Alluvial Soil">Alluvial Soil (गंगा का जलोढ़)</option>
              <option value="Black Soil">Black Cotton Soil (काली मिट्टी)</option>
              <option value="Clayey Soil">Clayey Rich Soil (चिकनी मिट्टी)</option>
              <option value="Sandy Soil">Sandy Loam Soil (बलुई मिट्टी)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5 font-mono">{labels.stage}</label>
            <select 
              value={stage} onChange={(e) => setStage(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              <option value="Sowing / Seedling">Sowing / Seedling (बुआई / बीज विकास)</option>
              <option value="Vegetative Growth">Vegetative Growth (वानस्पतिक विकास)</option>
              <option value="Flowering / Booting">Flowering / Booting (फूल आना)</option>
              <option value="Yield Formation / Grain Filling">Yield Formation / Grain Filling (दाना भरना)</option>
              <option value="Ripening / Maturity">Ripening / Maturity (फसल पकना)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1.5 font-mono">{labels.source}</label>
            <select 
              value={source} onChange={(e) => setSource(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
            >
              <option value="Tube-well">Tube-well (नलकूप / টিউবওয়েল)</option>
              <option value="Canal Irrigation">Canal Irrigation (नहर / খাল)</option>
              <option value="Rainfed (No active pump)">Rainfed (वर्षा आधारित / বৃষ্টি নির্ভর)</option>
              <option value="Micro Drip system">Micro Drip system (टपकन सिंचाई / ড্রিপ সেচ)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-display font-black text-sm px-4 py-3 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center justify-center gap-2 transition cursor-pointer mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating water metrics...</span>
              </>
            ) : (
              <>
                <Droplet className="w-4 h-4 text-emerald-200" />
                <span>{labels.submit}</span>
              </>
            )}
          </button>
        </form>

        {/* Advisory Display */}
        <div className="lg:col-span-7 bg-emerald-50 border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex flex-col justify-between" id="irrigation-advisory-display">
          <div>
            <h4 className="font-display font-black text-emerald-900 border-b-2 border-stone-900 pb-3 mb-4 flex items-center gap-2 text-base">
              <Droplet className="w-5 h-5 text-emerald-700" />
              {labels.reportTitle}
            </h4>

            {advice ? (
              <div className="prose prose-stone max-w-none text-stone-800 text-sm whitespace-pre-line leading-relaxed space-y-3">
                {advice}
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
