import React, { useState, useRef } from "react";
import { Upload, Image as ImageIcon, Camera, Loader2, Sparkles, AlertTriangle, ShieldCheck } from "lucide-react";
import { DISEASE_SAMPLES } from "../data";
import { Language } from "../types";

interface DiseaseDetectionProps {
  language: Language;
}

export default function DiseaseDetection({ language }: DiseaseDetectionProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState("image/jpeg");
  const [cropName, setCropName] = useState("");
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMimeType(file.type);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setDiagnosis(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectSample = (sample: any) => {
    // For demo purposes, we load the sample visual placeholder representation
    setSelectedImage(`data:${sample.mimeType};base64,${sample.image}`);
    setMimeType(sample.mimeType);
    setCropName(sample.cropName);
    setDiagnosis(null);
  };

  const diagnoseImage = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const response = await fetch("/api/disease-detection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: selectedImage,
          mimeType,
          cropName,
          language,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setDiagnosis(data.diagnosis);
      } else {
        alert(data.error || "Diagnosis failed");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const labels = {
    en: {
      title: "AI Crop Disease Detection",
      sub: "Upload an image of a crop leaf or select a preloaded sample to identify plant diseases and organic treatments",
      drag: "Drag & drop or click to upload leaf photo",
      demoTitle: "One-Click Demo Leaf Samples (For Hackathon Judges)",
      cropInput: "Specify Crop Name (Optional)",
      diagnoseBtn: "Perform AI Plant Diagnosis",
      reportTitle: "Plant Pathology Report & Prescription",
      placeholder: "Upload a photo or click a demo sample, then run analysis to see organic and chemical treatments.",
    },
    hi: {
      title: "एआई फसल रोग पहचान",
      sub: "पौधों के रोगों और जैविक उपचारों की पहचान करने के लिए फसल की पत्ती की एक तस्वीर अपलोड करें या प्रीलोडेड नमूना चुनें",
      drag: "पत्ती की फोटो अपलोड करने के लिए खींचें और छोड़ें या क्लिक करें",
      demoTitle: "एक-क्लिक डेमो पत्ती नमूने (हैकाथॉन न्यायाधीशों के लिए)",
      cropInput: "फसल का नाम निर्दिष्ट करें (वैकल्पिक)",
      diagnoseBtn: "एआई संयंत्र निदान निष्पादित करें",
      reportTitle: "पादप रोगविज्ञान रिपोर्ट और नुस्खा",
      placeholder: "एक फोटो अपलोड करें या एक डेमो नमूना पर क्लिक करें, फिर जैविक और रासायनिक उपचार देखने के लिए विश्लेषण चलाएं।",
    },
    bn: {
      title: "এআই ফসল রোগ সনাক্তকরণ",
      sub: "উদ্ভিদের রোগ এবং জৈব প্রতিকার সনাক্ত করতে ফসলের পাতার ছবি আপলোড করুন বা প্রি-লোড করা নমুনা নির্বাচন করুন",
      drag: "পাতার ছবি আপলোড করতে ড্র্যাগ অ্যান্ড ড্রপ করুন অথবা ক্লিক করুন",
      demoTitle: "এক-ক্লিক ডেমো পাতার নমুনা (হ্যাকথনের বিচারকদের জন্য)",
      cropInput: "ফসলের নাম লিখুন (ঐচ্ছিক)",
      diagnoseBtn: "এআই উদ্ভিদ রোগ নির্ণয় সম্পাদন করুন",
      reportTitle: "উদ্ভিদ রোগবিদ্যা রিপোর্ট ও প্রেসক্রিপশন",
      placeholder: "একটি ছবি আপলোড করুন বা ডেমো নমুনা ক্লিক করুন, তারপর জৈব এবং রাসায়নিক প্রতিকার দেখতে বিশ্লেষণ চালু করুন।",
    }
  }[language];

  return (
    <div className="space-y-6" id="disease-detection-container">
      {/* Title block */}
      <div>
        <h3 className="text-xl font-bold text-stone-900">{labels.title}</h3>
        <p className="text-stone-500 text-sm">{labels.sub}</p>
      </div>

      {/* Demo helper Presets block */}
      <div className="bg-amber-50 border-2 border-stone-900 rounded-3xl p-5 space-y-3 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-900 uppercase tracking-wide">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{labels.demoTitle}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {DISEASE_SAMPLES.map((sample) => (
            <button
              key={sample.id}
              onClick={() => selectSample(sample)}
              className="bg-white border-2 border-stone-900 hover:border-emerald-600 p-3 rounded-xl text-left flex items-start gap-2.5 transition text-xs shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] hover:shadow-[3px_3px_0px_0px_rgba(28,25,23,1)] cursor-pointer"
            >
              <div className="w-10 h-10 bg-emerald-50 text-emerald-800 rounded-lg flex items-center justify-center shrink-0 border-2 border-stone-900 font-bold font-mono">
                {sample.cropName[0]}
              </div>
              <div>
                <div className="font-bold text-stone-900">{sample.name}</div>
                <div className="text-stone-500 text-[10px] font-medium mt-0.5 line-clamp-1">{sample.symptoms}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Column */}
        <div className="lg:col-span-5 space-y-4">
          <div 
            onClick={triggerUpload}
            className="border-2 border-dashed border-stone-900 hover:border-emerald-500 bg-white rounded-3xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[220px] shadow-[2px_2px_0px_0px_rgba(28,25,23,1)]"
          >
            <input 
              type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden"
            />
            {selectedImage ? (
              <div className="relative w-full h-44 rounded-2xl overflow-hidden border-2 border-stone-900">
                <img src={selectedImage} alt="Selected crop leaf" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                  <ImageIcon className="w-8 h-8 text-white" />
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center border-2 border-stone-900 mx-auto">
                  <Upload className="w-5 h-5 text-stone-700" />
                </div>
                <p className="text-stone-700 font-bold text-xs max-w-[180px] mx-auto">{labels.drag}</p>
              </div>
            )}
          </div>

          {/* Optional parameters */}
          <div>
            <label className="block text-xs font-bold text-stone-700 uppercase mb-1 font-mono">{labels.cropInput}</label>
            <input 
              type="text" value={cropName} onChange={(e) => setCropName(e.target.value)}
              className="w-full bg-stone-50 border-2 border-stone-900 rounded-xl px-3.5 py-2.5 text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
              placeholder="e.g. Tomato, Rice"
            />
          </div>

          <button
            onClick={diagnoseImage}
            disabled={loading || !selectedImage}
            className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-display font-black text-sm px-4 py-3 rounded-2xl border-2 border-stone-900 shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] flex items-center justify-center gap-2 transition cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Running visual pathology AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{labels.diagnoseBtn}</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnostic Report Column */}
        <div className="lg:col-span-7 bg-emerald-50 border-2 border-stone-900 rounded-3xl p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] flex flex-col justify-between">
          <div>
            <h4 className="font-display font-black text-emerald-900 border-b-2 border-stone-900 pb-3 mb-4 flex items-center gap-2 text-base">
              <ShieldCheck className="w-5 h-5 text-emerald-700 animate-pulse" />
              {labels.reportTitle}
            </h4>

            {diagnosis ? (
              <div className="prose prose-stone max-w-none text-stone-800 text-sm whitespace-pre-line leading-relaxed space-y-3">
                {diagnosis}
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-stone-400 text-center gap-2">
                <ImageIcon className="w-10 h-10 text-stone-300" />
                <p className="text-sm max-w-xs">{labels.placeholder}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
