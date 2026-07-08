import React, { useState } from "react";
import { GOVERNMENT_SCHEMES } from "../data";
import { FileText, Search, Landmark, ArrowUpRight, HelpCircle, UserCheck } from "lucide-react";
import { Language } from "../types";

interface SchemesDirectoryProps {
  language: Language;
}

export default function SchemesDirectory({ language }: SchemesDirectoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [landSize, setLandSize] = useState(1.5);
  const [age, setAge] = useState(35);
  const [isTaxpayer, setIsTaxpayer] = useState(false);
  const [eligibleSchemes, setEligibleSchemes] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const checkEligibility = (e: React.FormEvent) => {
    e.preventDefault();
    const eligible: string[] = [];
    
    // PM Kisan Rule: land holding in cultivable area, generally up to 2 hectares (historically, now expanded but restricted from tax payers)
    if (!isTaxpayer) {
      eligible.push("pm-kisan");
    }
    
    // PMFBY Rule: land holding, not restricted by age
    eligible.push("pm-fby");
    
    // KCC Rule: owner cultivators or sharecroppers, no age restriction
    eligible.push("kcc");
    
    // PM-KMY (Pension Scheme) Rule: Small and marginal farmers, age between 18 and 40, land size <= 2 hectares
    if (age >= 18 && age <= 40 && landSize <= 2.0 && !isTaxpayer) {
      eligible.push("pm-kmy");
    }

    setEligibleSchemes(eligible);
    setChecked(true);
  };

  const labels = {
    en: {
      title: "Government Agrarian Schemes",
      sub: "Search central and state welfare initiatives, check eligibility, and link to registration channels",
      searchPlaceholder: "Search PM-Kisan, KCC, crop insurance...",
      eligTitle: "Smart Welfare Eligibility Checker",
      eligSub: "Enter parameters to test matching government support schemes",
      landSize: "Total Agricultural Land Size (Hectares)",
      age: "Farmer Age (Years)",
      taxpayer: "Are you an active Income Tax Payer?",
      checkBtn: "Evaluate Scheme Eligibility",
      eligibleResult: "Your Custom Eligibility Report",
      noLand: "Yes",
      hasLand: "No",
      applySimSuccess: "SMS with application guidelines dispatched to your registered phone number!",
      ministry: "Ministry / Agency",
      benefits: "Benefits & Subsidies Offered",
      eligibility: "Eligibility Guidelines",
      applyNow: "Official Registration Portal",
      applyDemo: "Trigger SMS Guidelines",
    },
    hi: {
      title: "सरकारी कृषि योजनाएं",
      sub: "केंद्रीय और राज्य कल्याण पहलों की खोज करें, पात्रता की जांच करें, और पंजीकरण चैनलों से जुड़ें",
      searchPlaceholder: "पीएम-किसान, केसीसी, फसल बीमा खोजें...",
      eligTitle: "स्मार्ट कल्याण पात्रता जाँचकर्ता",
      eligSub: "मैचिंग सरकारी सहायता योजनाओं का परीक्षण करने के लिए मापदंड दर्ज करें",
      landSize: "कुल कृषि भूमि आकार (हेक्टेयर)",
      age: "किसान की आयु (वर्ष)",
      taxpayer: "क्या आप सक्रिय आयकर दाता हैं?",
      checkBtn: "योजना पात्रता का मूल्यांकन करें",
      eligibleResult: "आपकी कस्टम पात्रता रिपोर्ट",
      noLand: "हाँ",
      hasLand: "नहीं",
      applySimSuccess: "आपके पंजीकृत फोन नंबर पर आवेदन दिशानिर्देशों वाला एसएमएस भेजा गया!",
      ministry: "मंत्रालय / एजेंसी",
      benefits: "प्रदान किए जाने वाले लाभ और सब्सिडी",
      eligibility: "पात्रता दिशानिर्देश",
      applyNow: "आधिकारिक पंजीकरण पोर्टल",
      applyDemo: "एसएमएस दिशानिर्देश ट्रिगर करें",
    },
    bn: {
      title: "সরকারী কৃষি প্রকল্প",
      sub: "কেন্দ্রীয় এবং রাষ্ট্রীয় কল্যাণমূলক উদ্যোগগুলি অনুসন্ধান করুন, যোগ্যতা পরীক্ষা করুন এবং অফিসিয়াল লিঙ্কে প্রবেশ করুন",
      searchPlaceholder: "পিএম-কিষাণ, কেসিসি, ফসল বিমা খুঁজুন...",
      eligTitle: "স্মার্ট কল্যাণ যোগ্যতা যাচাইকারী",
      eligSub: "সরকারি সহায়তা প্রকল্পের যোগ্যতা পরীক্ষা করতে আপনার বিবরণ লিখুন",
      landSize: "মোট কৃষি জমির পরিমাণ (হেক্টর)",
      age: "কৃষকের বয়স (বছর)",
      taxpayer: "আপনি কি একজন করদাতা?",
      checkBtn: "যোগ্যতা মূল্যায়ন করুন",
      eligibleResult: "আপনার কাস্টম যোগ্যতা প্রতিবেদন",
      noLand: "হ্যাঁ",
      hasLand: "না",
      applySimSuccess: "আপনার নিবন্ধিত ফোন নম্বরে আবেদন নির্দেশিকা সহ একটি এসএমএস পাঠানো হয়েছে!",
      textSearch: "অনুসন্ধান",
      ministry: "মন্ত্রণালয় / সংস্থা",
      benefits: "সুবিধা ও ভর্তুকি",
      eligibility: "যোগ্যতার নির্দেশিকা",
      applyNow: "অফিসিয়াল রেজিস্ট্রেশন পোর্টাল",
      applyDemo: "এসএমএস নির্দেশিকা পাঠান",
    },
    te: {
      title: "ప్రభుత్వ వ్యవసాయ పథకాలు",
      sub: "కేంద్ర మరియు రాష్ట్ర సంక్షేమ కార్యక్రమాలను అన్వేషించండి, అర్హత తనిఖీ చేయండి మరియు నమోదు లింక్‌లతో కనెక్ట్ అవ్వండి",
      searchPlaceholder: "PM-కిసాన్, KCC, పంట బీమా కోసం వెతకండి...",
      eligTitle: "స్మార్ట్ సంక్షేమ అర్హత తనిఖీదారు",
      eligSub: "సరిపోలే ప్రభుత్వ సహాయ పథకాలను పరీక్షించడానికి పారామితులను నమోదు చేయండి",
      landSize: "మొత్తం వ్యవసాయ భూమి పరిమాణం (హెక్టార్లు)",
      age: "రైతు వయస్సు (సంవత్సరాలు)",
      taxpayer: "మీరు చురుకైన ఆదాయపు పన్ను చెల్లింపుదారులా?",
      checkBtn: "పథకం అర్హతను మూల్యాంకనం చేయండి",
      eligibleResult: "మీ వ్యక్తిగతీకరించిన అర్హత నివేదిక",
      noLand: "అవును",
      hasLand: "కాదు",
      applySimSuccess: "దరఖాస్తు మార్గదర్శకాలతో SMS మీ నమోదిత ఫోన్ నంబర్‌కు పంపబడింది!",
      ministry: "మంత్రిత్వ శాఖ / సంస్థ",
      benefits: "అందించే ప్రయోజనాలు & సబ్సిడీలు",
      eligibility: "అర్హత మార్గదర్శకాలు",
      applyNow: "అధికారిక నమోదు పోర్టల్",
      applyDemo: "SMS మార్గదర్శకాలను ప్రారంభించండి",
    }
  }[language];

  const filteredSchemes = GOVERNMENT_SCHEMES.filter(scheme => {
    const query = searchTerm.toLowerCase();
    const localName = language === "en" ? scheme.name : scheme.nameLocal[language as "hi" | "bn" | "te" | "te"] || scheme.name;
    return localName.toLowerCase().includes(query) || scheme.ministry.toLowerCase().includes(query);
  });

  return (
    <div className="space-y-6" id="schemes-directory-container">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-4 border-stone-900 pb-5" id="schemes-header">
        <div>
          <h2 className="text-2xl font-display font-black text-stone-900 flex items-center gap-2">
            <Landmark className="w-7 h-7 text-emerald-600 animate-bounce" />
            <span>{labels.title}</span>
          </h2>
          <p className="text-stone-500 font-medium text-xs mt-1 max-w-xl">{labels.sub}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: Searchable Directory */}
        <div className="lg:col-span-7 space-y-4" id="schemes-directory-panel">
          <div className="relative">
            <Search className="w-5 h-5 text-stone-700 absolute left-3.5 top-3.5" />
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border-2 border-stone-900 rounded-2xl pl-11 pr-4 py-3.5 text-stone-900 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
              placeholder={labels.searchPlaceholder}
            />
          </div>

          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2" id="schemes-list-scroller">
            {filteredSchemes.map((scheme) => (
              <div key={scheme.id} className="bg-white border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <span className="bg-emerald-50 text-emerald-850 border-2 border-stone-900 font-black px-2.5 py-1 rounded text-[10px] uppercase tracking-wider">
                      {scheme.tag}
                    </span>
                    <h4 className="text-lg font-display font-black text-stone-900 mt-2.5">
                      {language === "en" ? scheme.name : scheme.nameLocal[language as "hi" | "bn" | "te"]}
                    </h4>
                  </div>
                  <a 
                    href={scheme.link} target="_blank" rel="noreferrer"
                    className="p-2 text-stone-800 hover:text-emerald-700 bg-stone-50 hover:bg-stone-100 border-2 border-stone-900 rounded-xl shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer"
                    title={labels.applyNow}
                  >
                    <ArrowUpRight className="w-4 h-4" />
                  </a>
                </div>

                <div className="space-y-3 text-xs text-stone-700 border-t-2 border-stone-900 pt-3">
                  <div>
                    <span className="font-bold text-stone-900 block mb-0.5 font-mono uppercase text-[10px] tracking-wider">{labels.ministry}</span>
                    <span className="font-medium">{scheme.ministry}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block mb-0.5 font-mono uppercase text-[10px] tracking-wider">{labels.benefits}</span>
                    <span className="font-medium">{language === "en" ? scheme.benefits : scheme.benefitsLocal[language as "hi" | "bn" | "te"]}</span>
                  </div>
                  <div>
                    <span className="font-bold text-stone-900 block mb-0.5 font-mono uppercase text-[10px] tracking-wider">{labels.eligibility}</span>
                    <span className="font-medium">{language === "en" ? scheme.eligibility : scheme.eligibilityLocal[language as "hi" | "bn" | "te"]}</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-1">
                  <a 
                    href={scheme.link} target="_blank" rel="noreferrer"
                    className="text-stone-950 hover:bg-stone-50 font-display font-black text-xs flex items-center gap-1.5 border-2 border-stone-900 px-4 py-2.5 rounded-2xl bg-white shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition"
                  >
                    <Landmark className="w-4 h-4 text-stone-700" />
                    <span>{labels.applyNow}</span>
                  </a>
                  <button 
                    onClick={() => alert(labels.applySimSuccess)}
                    className="text-white bg-emerald-600 hover:bg-emerald-700 font-display font-black text-xs flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer"
                  >
                    <span>{labels.applyDemo}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column: Interactive Checker */}
        <div className="lg:col-span-5 bg-white border-2 border-stone-900 rounded-3xl p-6 h-fit space-y-4 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]" id="schemes-checker-panel">
          <div>
            <h4 className="font-display font-black text-stone-900 text-sm flex items-center gap-1.5">
              <UserCheck className="w-5 h-5 text-emerald-700" />
              {labels.eligTitle}
            </h4>
            <p className="text-stone-500 text-xs mt-0.5">{labels.eligSub}</p>
          </div>

          <form onSubmit={checkEligibility} className="space-y-4 text-xs">
            <div>
              <div className="flex justify-between font-bold text-stone-700 mb-1.5 font-mono">
                <span>{labels.landSize}</span>
                <span className="text-emerald-700 font-black">{landSize} ha</span>
              </div>
              <input 
                type="range" min="0.1" max="5" step="0.1" value={landSize} onChange={(e) => setLandSize(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-bold text-stone-700 mb-1.5 font-mono">
                <span>{labels.age}</span>
                <span className="text-emerald-700 font-black">{age} yrs</span>
              </div>
              <input 
                type="range" min="15" max="75" value={age} onChange={(e) => setAge(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-50 border-2 border-stone-900 rounded-2xl p-4 gap-3">
              <span className="font-bold text-stone-700 font-mono text-[11px] uppercase tracking-wider">{labels.taxpayer}</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsTaxpayer(true)}
                  className={`px-3.5 py-1.5 rounded-xl border-2 border-stone-900 font-black transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] ${
                    isTaxpayer ? "bg-red-500 text-white" : "bg-white text-stone-800"
                  }`}
                >
                  {labels.noLand}
                </button>
                <button
                  type="button"
                  onClick={() => setIsTaxpayer(false)}
                  className={`px-3.5 py-1.5 rounded-xl border-2 border-stone-900 font-black transition cursor-pointer shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] ${
                    !isTaxpayer ? "bg-emerald-600 text-white" : "bg-white text-stone-800"
                  }`}
                >
                  {labels.hasLand}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-stone-950 hover:bg-stone-900 text-white font-display font-black text-sm px-4 py-3 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] transition cursor-pointer"
            >
              {labels.checkBtn}
            </button>
          </form>

          {checked && (
            <div className="bg-emerald-50 border-2 border-stone-900 rounded-2xl p-4 space-y-3.5 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]" id="checker-result-card">
              <h5 className="font-display font-black text-emerald-950 border-b-2 border-stone-900 pb-1.5 text-xs flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-700" />
                {labels.eligibleResult}
              </h5>
              {eligibleSchemes.length > 0 ? (
                <div className="space-y-2.5">
                  {eligibleSchemes.map(id => {
                    const matched = GOVERNMENT_SCHEMES.find(s => s.id === id);
                    if (!matched) return null;
                    return (
                      <div key={id} className="flex items-start gap-2.5 text-xs">
                        <span className="text-emerald-700 font-black shrink-0">✓</span>
                        <div>
                          <div className="font-bold text-stone-900">
                            {language === "en" ? matched.name : matched.nameLocal[language as "hi" | "bn" | "te"]}
                          </div>
                          <div className="text-stone-500 text-[10px] line-clamp-1 font-mono">{matched.tag} • {matched.ministry}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-stone-500 text-xs flex items-center gap-1.5 font-bold">
                  <HelpCircle className="w-4 h-4 shrink-0 text-stone-400" />
                  <span>No matches found. Adjust land size, age or taxpayer status.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
