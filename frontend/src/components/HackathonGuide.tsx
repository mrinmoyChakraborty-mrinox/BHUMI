import { useState } from "react";
import { BookOpen, MapPin, Terminal, ShieldAlert, Award, FileText, ChevronRight, Copy, Check } from "lucide-react";
import { MENTOR_GUIDE_MARKDOWN } from "../data";

export default function HackathonGuide() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"blueprint" | "datasets" | "sql" | "judges">("blueprint");

  const handleCopy = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const sqlCode = `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100) NOT NULL,
    soil_type VARCHAR(50) NOT NULL,
    area_acres NUMERIC(5,2) NOT NULL,
    irrigation_source VARCHAR(50) DEFAULT 'Tube-well',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE disease_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    image_url TEXT NOT NULL,
    diagnosis_raw TEXT NOT NULL,
    severity VARCHAR(10) DEFAULT 'Medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`;

  return (
    <div className="bg-white rounded-3xl border-2 border-stone-900 p-6 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] overflow-hidden" id="hackathon-guide-container">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b-4 border-stone-900 pb-5 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 font-mono font-bold text-xs tracking-wider uppercase mb-1">
            <Award className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Hackathon Mentorship Portal</span>
          </div>
          <h2 className="text-2xl font-display font-black text-stone-900 tracking-tight">AI Krishi Architect Blueprint</h2>
          <p className="text-stone-500 font-medium text-xs mt-1">A complete 48-Hour MVP design blueprint and judge review criteria</p>
        </div>
        
        {/* Toggle Controls */}
        <div className="flex bg-white p-1 rounded-2xl border-2 border-stone-900 self-start lg:self-center shadow-[2px_2px_0px_0px_rgba(28,25,23,1)] gap-1 flex-wrap">
          <button
            onClick={() => setActiveTab("blueprint")}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition ${
              activeTab === "blueprint" ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            Blueprint
          </button>
          <button
            onClick={() => setActiveTab("datasets")}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition ${
              activeTab === "datasets" ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            15 Indian Datasets
          </button>
          <button
            onClick={() => setActiveTab("sql")}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition ${
              activeTab === "sql" ? "bg-emerald-600 text-white" : "text-stone-500 hover:text-stone-900"
            }`}
          >
            SQL Schemas
          </button>
          <button
            onClick={() => setActiveTab("judges")}
            className={`px-3.5 py-1.5 text-xs font-mono font-bold rounded-xl transition ${
              activeTab === "judges" ? "bg-red-500 text-white" : "text-red-600 hover:bg-red-50"
            }`}
          >
            Judges' Critique
          </button>
        </div>
      </div>

      {/* Blueprint Tab */}
      {activeTab === "blueprint" && (
        <div className="space-y-6 text-stone-800 leading-relaxed text-sm">
          <div className="bg-emerald-50 border-2 border-stone-900 rounded-3xl p-5 flex gap-3.5 items-start shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <BookOpen className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-black text-emerald-950">48-Hour MVP Philosophy</h4>
              <p className="text-stone-800 text-xs mt-1 font-medium">
                True craft means narrowing features down to absolute excellence. This assistant demonstrates a robust full-stack architecture with localized AI triggers that can actually be coded, verified, and compiled within two days.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="border-2 border-stone-900 bg-white p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
              <h3 className="font-display font-black text-stone-900 flex items-center gap-2 text-base mb-3 border-b-2 border-stone-100 pb-2">
                <Terminal className="w-4 h-4 text-emerald-600" />
                Product Architecture
              </h3>
              <ul className="space-y-2.5 text-stone-700 font-medium text-xs">
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Frontend:</strong> Single Page React 19 + Tailwind v4 UI, using Framer Motion layout state transitions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>Backend:</strong> Express Node.js. Serves server-side proxies for security, hiding sensitive API keys.</span>
                </li>
                <li className="flex items-start gap-2">
                  <ChevronRight className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span><strong>AI Layer:</strong> Official <code className="bg-stone-100 px-1 py-0.5 rounded text-xs font-mono font-bold">@google/genai</code> SDK utilizing the fast <code className="bg-stone-100 px-1 py-0.5 rounded text-xs font-mono font-bold">gemini-3.5-flash</code> model.</span>
                </li>
              </ul>
            </div>

            <div className="border-2 border-stone-900 bg-white p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
              <h3 className="font-display font-black text-stone-900 flex items-center gap-2 text-base mb-3 border-b-2 border-stone-100 pb-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                Feature Milestones
              </h3>
              <ul className="space-y-2 text-stone-700 font-medium text-xs">
                <li><strong className="text-emerald-800 font-bold font-mono uppercase text-[10px] tracking-wider block mb-0.5">Must Have:</strong> Multilingual AI chatbot, Soil crop recommendation sliders, leaf disease multi-modal vision diagnosis.</li>
                <li><strong className="text-amber-800 font-bold font-mono uppercase text-[10px] tracking-wider block mb-0.5">Good To Have:</strong> Web Speech API for voice interactions, searchable government schemes matched to crop types.</li>
                <li><strong className="text-stone-800 font-bold font-mono uppercase text-[10px] tracking-wider block mb-0.5">Future Scope:</strong> IoT hardware soil sensor integration, regional credit scoring, and satellite weather indexing.</li>
              </ul>
            </div>
          </div>

          <div className="bg-stone-900 text-stone-300 p-5 rounded-3xl border-2 border-stone-900 font-mono text-xs shadow-[4px_4px_0px_0px_rgba(28,25,23,1)] relative">
            <button 
              onClick={() => handleCopy(MENTOR_GUIDE_MARKDOWN, "markdown")}
              className="absolute top-3 right-3 text-stone-400 hover:text-white p-1.5 rounded-lg border-2 border-stone-700 hover:border-stone-500 bg-stone-800 hover:bg-stone-750 transition cursor-pointer"
              title="Copy complete design blueprint markdown"
            >
              {copiedSection === "markdown" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <div className="text-emerald-400 mb-2 font-bold">// Absolute Source of Truth: Comprehensive 12-Section Specification</div>
            <div className="max-h-60 overflow-y-auto pr-2 space-y-1 text-stone-300 select-all">
              {MENTOR_GUIDE_MARKDOWN.split("\n").map((line, idx) => (
                <div key={idx} className={line.startsWith("#") ? "text-white font-bold mt-3" : ""}>{line}</div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Indian Datasets Tab */}
      {activeTab === "datasets" && (
        <div className="space-y-5">
          <div className="bg-blue-50 border-2 border-stone-900 rounded-3xl p-5 flex gap-3.5 items-start text-sm shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <MapPin className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-display font-black text-blue-950">Regional Agribusiness Datasets</h4>
              <p className="text-stone-800 text-xs mt-1 font-medium">
                Indian agriculture demands region-specific parameters. Below is a structured analysis of 15 essential datasets, categorized by suitability for a 48-hour MVP vs a scaling startup.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-3xl border-2 border-stone-900 bg-white shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <table className="w-full text-left border-collapse text-xs font-mono font-bold">
              <thead>
                <tr className="bg-stone-100 text-stone-900 uppercase font-black border-b-2 border-stone-900">
                  <th className="p-3">Dataset Name</th>
                  <th className="p-3">Official Provider / Link</th>
                  <th className="p-3">Update Rate</th>
                  <th className="p-3">MVP Strategy</th>
                  <th className="p-3">Scale Strategy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-300 text-stone-800">
                <tr>
                  <td className="p-3 font-bold text-stone-900">1. IMD Weather API</td>
                  <td className="p-3">imd.gov.in (NIC restricted)</td>
                  <td className="p-3">3 Hours</td>
                  <td className="p-3 text-red-600 font-extrabold">Skip (Too slow to approve)</td>
                  <td className="p-3 text-emerald-800">Official Localized Alerts</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold text-stone-900">2. Soil Health Card</td>
                  <td className="p-3">soilhealth.dac.gov.in</td>
                  <td className="p-3">Seasonal</td>
                  <td className="p-3 text-amber-600 font-extrabold">Interactive Sliders</td>
                  <td className="p-3 text-emerald-800">Aadhaar API integration</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-stone-900">3. data.gov.in APMC</td>
                  <td className="p-3">data.gov.in (Instant Key)</td>
                  <td className="p-3">Daily</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Include live Mandi rates!</td>
                  <td className="p-3 text-emerald-800">Full API caching</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold text-stone-900">4. ISRO Bhuvan</td>
                  <td className="p-3">bhuvan.nrsc.gov.in</td>
                  <td className="p-3">Monthly</td>
                  <td className="p-3 text-red-600 font-extrabold">Skip</td>
                  <td className="p-3 text-emerald-800">WMS GIS overlays</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-stone-900">5. Agmarknet</td>
                  <td className="p-3">agmarknet.gov.in</td>
                  <td className="p-3">Daily</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Include via data.gov.in</td>
                  <td className="p-3 text-emerald-800">Direct APMC polling</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold text-stone-900">6. eNAM Integration</td>
                  <td className="p-3">enam.gov.in (No public API)</td>
                  <td className="p-3">Live</td>
                  <td className="p-3 text-red-600 font-extrabold">Simulate trade</td>
                  <td className="p-3 text-emerald-800">Cooperative bidding</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-stone-900">7. PM Kisan</td>
                  <td className="p-3">pmkisan.gov.in</td>
                  <td className="p-3">Quarterly</td>
                  <td className="p-3 text-amber-600 font-extrabold">Rule-based checker</td>
                  <td className="p-3 text-emerald-800">NIC beneficiary link</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold text-stone-900">8. PMFBY (Insurance)</td>
                  <td className="p-3">pmfby.gov.in</td>
                  <td className="p-3">Seasonal</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Pre-compute premium%</td>
                  <td className="p-3 text-emerald-800">Live API premiums</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-stone-900">9. ICAR Database</td>
                  <td className="p-3">icar.org.in (Bulletins)</td>
                  <td className="p-3">Static</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Inject as LLM System Rules</td>
                  <td className="p-3 text-emerald-800">Vector Knowledge DB (RAG)</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold text-stone-900">10. Sentinel Hub</td>
                  <td className="p-3">sentinel-hub.com (30-day Free)</td>
                  <td className="p-3">5 Days</td>
                  <td className="p-3 text-amber-600 font-extrabold">Mock NDVI coordinates</td>
                  <td className="p-3 text-emerald-800">Live GIS vegetative indices</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-stone-900">11. Google Earth Eng.</td>
                  <td className="p-3">earthengine.google.com</td>
                  <td className="p-3">Varies</td>
                  <td className="p-3 text-red-600 font-extrabold">Skip (Slow credentials)</td>
                  <td className="p-3 text-emerald-800">Soil moisture mapping</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold text-stone-900">12. PlantVillage</td>
                  <td className="p-3">PlantVillage Kaggle dataset</td>
                  <td className="p-3">Static</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Use for demo leaf images!</td>
                  <td className="p-3 text-emerald-800">Fine-tune specialized CNN</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-stone-900">13. Kaggle Agri CSVs</td>
                  <td className="p-3">Crop Suggestion Dataset</td>
                  <td className="p-3">Static</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Preset realistic sliders</td>
                  <td className="p-3 text-emerald-800">Heuristics calibrator</td>
                </tr>
                <tr className="bg-stone-50/50">
                  <td className="p-3 font-bold text-stone-900">14. NASA POWER</td>
                  <td className="p-3">power.larc.nasa.gov (Free API)</td>
                  <td className="p-3">Daily</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Direct fetch anywhere</td>
                  <td className="p-3 text-emerald-800">Climatological trends</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-stone-900">15. Open-Meteo</td>
                  <td className="p-3">open-meteo.com (Free API)</td>
                  <td className="p-3">Hourly</td>
                  <td className="p-3 text-emerald-700 font-extrabold">Live forecasts & indices!</td>
                  <td className="p-3 text-emerald-800">Agrometeorological models</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SQL Schemas Tab */}
      {activeTab === "sql" && (
        <div className="space-y-4">
          <div className="bg-stone-900 text-stone-200 p-5 rounded-3xl border-2 border-stone-900 relative font-mono text-xs shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <button 
              onClick={() => handleCopy(sqlCode, "sql")}
              className="absolute top-3 right-3 text-stone-400 hover:text-white p-1.5 rounded-lg border-2 border-stone-700 hover:border-stone-500 bg-stone-800 hover:bg-stone-750 transition cursor-pointer"
              title="Copy SQL code block"
            >
              {copiedSection === "sql" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
            <div className="text-emerald-400 mb-3 font-bold">-- Relational Database DDL for Production Scalability</div>
            <pre className="overflow-x-auto leading-relaxed max-h-96 select-all">{sqlCode}</pre>
          </div>
        </div>
      )}

      {/* Judges Critique Tab */}
      {activeTab === "judges" && (
        <div className="space-y-5 text-stone-850 text-sm font-medium">
          <div className="bg-red-50 border-2 border-stone-900 rounded-3xl p-5 shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <div className="flex items-center gap-2 text-red-900 font-display font-black text-base mb-2">
              <ShieldAlert className="w-5 h-5 text-red-600 animate-pulse" />
              <span>Critical Review: From the Judge's Desk</span>
            </div>
            <p className="text-stone-800 text-xs leading-relaxed font-bold">
              In a national-level hackathon, 90% of agriculture entries fail because they build a <strong>"Feature Soup"</strong>—a list of 10 generic features styled with basic templates and simulated by random text generators. We dissect this proposal with surgical critique to guarantee you stand on the gold podium.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-2">
            <div className="border-2 border-stone-900 bg-white p-5 rounded-3xl shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]">
              <h4 className="font-display font-black text-red-600 mb-2 text-sm uppercase tracking-wider flex items-center gap-1">
                <span>●</span> Core Weaknesses
              </h4>
              <p className="text-stone-700 text-xs leading-relaxed">
                Your target users (Indian farmers) cannot read or type in complex English terms. Text-heavy inputs like typing chemical parameters are a barrier. A classic pitfall is relying on internet connectivity in dry zones.
              </p>
            </div>
            <div className="border-2 border-stone-900 bg-white p-5 rounded-3xl shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]">
              <h4 className="font-display font-black text-amber-600 mb-2 text-sm uppercase tracking-wider flex items-center gap-1">
                <span>●</span> Features Judges Hate
              </h4>
              <p className="text-stone-700 text-xs leading-relaxed">
                Generic static weather dashboards or long, unsorted PDF lists of PM schemes. They've seen it a thousand times. Also, mock status boxes labeled "ML Server Online" look unprofessional.
              </p>
            </div>
            <div className="border-2 border-stone-900 bg-white p-5 rounded-3xl shadow-[3px_3px_0px_0px_rgba(28,25,23,1)]">
              <h4 className="font-display font-black text-emerald-700 mb-2 text-sm uppercase tracking-wider flex items-center gap-1">
                <span>●</span> Features Judges LOVE
              </h4>
              <p className="text-stone-700 text-xs leading-relaxed">
                <strong>Vocal UI Integration.</strong> Speaking in raw Hindi and having the AI synthesize immediate, organic remedies back via sound. Real visual diagnosis with pre-loaded samples that execute in seconds.
              </p>
            </div>
          </div>

          <div className="bg-emerald-50 border-2 border-stone-900 p-5 rounded-3xl shadow-[4px_4px_0px_0px_rgba(28,25,23,1)]">
            <h4 className="font-display font-black text-emerald-950 flex items-center gap-1.5 text-base">
              <Award className="w-5 h-5 text-emerald-700" />
              How to Win this Hackathon
            </h4>
            <ul className="list-disc pl-5 text-stone-800 text-xs space-y-2 mt-3 font-bold">
              <li><strong>Perfect the Multilingual Sync:</strong> Tap Hindi/Bengali and show that the chatbot prompts, weather alerts, and crop reports switch natively without missing characters.</li>
              <li><strong>Zero-Barrier Demos:</strong> Keep soil parameters preset with a "Quick Load Paddy Soil" button so the judges can verify recommendations in a single tap instead of sliding 8 dials manually.</li>
              <li><strong>Actionable AI Advice:</strong> Keep descriptions short, actionable, and focused on economic and biological farming techniques (saving money on fertilizers).</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
