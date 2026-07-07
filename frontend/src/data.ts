import { Scheme, DiseaseSample } from "./types";

export const GOVERNMENT_SCHEMES: Scheme[] = [
  {
    id: "pm-kisan",
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    nameLocal: {
      hi: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
      bn: "পিএম-কিষাণ (প্রধানমন্ত্রী কিষাণ সম্মান নিধি)"
    },
    ministry: "Ministry of Agriculture and Farmers Welfare",
    tag: "Direct Benefit",
    benefits: "Direct income support of ₹6,000 per year in three equal installments of ₹2,000 directly into the bank accounts of small and marginal farmer families.",
    benefitsLocal: {
      hi: "छोटे और सीमांत किसान परिवारों के बैंक खातों में सीधे ₹6,000 प्रति वर्ष की प्रत्यक्ष आय सहायता (₹2,000 की तीन समान किस्तों में)।",
      bn: "ক্ষুদ্র ও প্রান্তিক কৃষক পরিবারের ব্যাঙ্ক অ্যাকাউন্টে সরাসরি প্রতি বছর ₹৬,০০০ আয় সহায়তা (₹২,০০০ এর তিনটি সমান কিস্তিতে)।"
    },
    eligibility: "All landholding farmers' families who have cultivable landholding in their names (subject to certain exclusion criteria like high-income individuals and taxpayers).",
    eligibilityLocal: {
      hi: "सभी भूमिधारक किसान परिवार जिनके नाम पर कृषि योग्य भूमि है (उच्च आय वाले व्यक्तियों और करदाताओं को छोड़कर)।",
      bn: "সমস্ত জমিধারী কৃষক পরিবার যাদের নামে চাষযোগ্য জমি রয়েছে (উচ্চ আয়ের ব্যক্তি এবং করদাতাদের বাদ দিয়ে)।"
    },
    howToApply: "Register online on PM-KISAN portal (pmkisan.gov.in) using Aadhaar card, land records, and bank account, or visit nearest Common Service Center (CSC).",
    link: "https://pmkisan.gov.in"
  },
  {
    id: "pm-fby",
    name: "PMFBY (Pradhan Mantri Fasal Bima Yojana)",
    nameLocal: {
      hi: "प्रधानमंत्री फसल बीमा योजना (PMFBY)",
      bn: "প্রধানমন্ত্রী ফসল বিমা যোজনা (PMFBY)"
    },
    ministry: "Ministry of Agriculture and Farmers Welfare",
    tag: "Insurance",
    benefits: "Comprehensive insurance coverage against crop failure due to non-preventable natural risks (drought, flood, pests, storms). Premium is heavily subsidized: farmers pay only 2% for Kharif crops, 1.5% for Rabi crops, and 5% for commercial/horticultural crops.",
    benefitsLocal: {
      hi: "अपरिहार्य प्राकृतिक जोखिमों (सूखा, बाढ़, कीट, तूफान) के कारण फसल खराब होने पर व्यापक बीमा सुरक्षा। प्रीमियम अत्यधिक सब्सिडी वाला है: खरीफ के लिए 2%, रबी के लिए 1.5% और वाणिज्यिक फसलों के लिए 5%।",
      bn: "প্রতিরোধ অযোগ্য প্রাকৃতিক ঝুঁকি (খরা, বন্যা, কীটপতঙ্গ, ঝড়) এর কারণে ফসল নষ্ট হওয়ার বিরুদ্ধে ব্যাপক বিমা কভারেজ। প্রিমিয়ামে ব্যাপক ভর্তুকি দেওয়া হয়: খরিফ ফসলের জন্য ২%, রবি ফসলের জন্য ১.৫% এবং বাণিজ্যিক ফসলের জন্য ৫%।"
    },
    eligibility: "All farmers, including tenant farmers and sharecroppers, growing the notified crops in the notified areas are eligible.",
    eligibilityLocal: {
      hi: "अधिसूचित क्षेत्रों में अधिसूचित फसलें उगाने वाले बटाईदार और काश्तकार किसानों सहित सभी किसान पात्र हैं।",
      bn: "বিজ্ঞপ্তিভুক্ত এলাকায় বিজ্ঞপ্তিভুক্ত ফসল চাষকারী ভাগচাষী এবং ভাড়াটে কৃষক সহ সমস্ত কৃষক যোগ্য।"
    },
    howToApply: "Enroll through banks, cooperative societies, authorized insurance agents, or directly online on PMFBY portal (pmfby.gov.in).",
    link: "https://pmfby.gov.in"
  },
  {
    id: "kcc",
    name: "KCC (Kisan Credit Card)",
    nameLocal: {
      hi: "किसान क्रेडिट कार्ड (KCC)",
      bn: "কিষাণ ক্রেডিট কার্ড (KCC)"
    },
    ministry: "Reserve Bank of India & NABARD",
    tag: "Credit",
    benefits: "Provides timely, low-interest credit (loans) for crop cultivation, post-harvest expenses, and farm maintenance. Effectively offers interest rates as low as 4% per annum upon prompt repayment.",
    benefitsLocal: {
      hi: "फसल खेती, कटाई के बाद के खर्चों और कृषि रखरखाव के लिए समय पर, कम ब्याज पर ऋण। समय पर पुनर्भुगतान करने पर प्रति वर्ष 4% जैसी न्यूनतम ब्याज दर।",
      bn: "ফসল চাষ, ফসল কাটার পরবর্তী খরচ এবং খামার রক্ষণাবেক্ষণের জন্য সময়মতো, স্বল্প সুদে ঋণ। সময়মতো ঋণ পরিশোধ করলে বার্ষিক সর্বনিম্ন ৪% সুদে ঋণ পাওয়া যায়।"
    },
    eligibility: "Owner-cultivators, tenant farmers, sharecroppers, and self-help groups of farmers.",
    eligibilityLocal: {
      hi: "मालिक-काश्तकार, किरायेदार किसान, बटाईदार और किसानों के स्वयं सहायता समूह।",
      bn: "মালিক-চাষী, ভাড়াটে কৃষক, ভাগচাষী এবং কৃষকদের স্বনির্ভর গোষ্ঠী।"
    },
    howToApply: "Apply at any rural, cooperative, or nationalized bank. Requires land record papers, identity proof, and photograph.",
    link: "https://www.nabard.org"
  },
  {
    id: "pm-kmy",
    name: "PM-KMY (Pradhan Mantri Kisan Maandhan Yojana)",
    nameLocal: {
      hi: "किसान मानधन योजना (PM-KMY)",
      bn: "কিষাণ মানধন যোজনা (PM-KMY)"
    },
    ministry: "Ministry of Agriculture and Farmers Welfare",
    tag: "Subsidy",
    benefits: "A voluntary and contributory pension scheme offering a assured monthly pension of ₹3,000 to small and marginal farmers upon reaching 60 years of age.",
    benefitsLocal: {
      hi: "एक स्वैच्छिक और अंशदायी पेंशन योजना जो 60 वर्ष की आयु प्राप्त करने पर छोटे और सीमांत किसानों को ₹3,000 की सुनिश्चित मासिक पेंशन प्रदान करती है।",
      bn: "একটি স্বেচ্ছাসেবী এবং সহযোগিতামূলক পেনশন স্কিম যা ৬০ বছর বয়স পূর্ণ হলে ক্ষুদ্র ও প্রান্তিক কৃষকদের প্রতি মাসে ₹৩,০০০ নিশ্চিত পেনশন প্রদান করে।"
    },
    eligibility: "Small and marginal farmers aged between 18 and 40 years, with cultivable land up to 2 hectares.",
    eligibilityLocal: {
      hi: "18 से 40 वर्ष की आयु के छोटे और सीमांत किसान, जिनके पास 2 हेक्टेयर तक कृषि योग्य भूमि है।",
      bn: "১৮ থেকে ৪০ বছর বয়সী ক্ষুদ্র ও প্রান্তিক কৃষক, যাদের চাষযোগ্য জমি ২ হেক্টর পর্যন্ত রয়েছে।"
    },
    howToApply: "Register at the nearest Common Service Centre (CSC) or self-enroll online at maandhan.in. Requires Aadhaar and bank details.",
    link: "https://maandhan.in"
  }
];

// Sample crop images for disease detection hackathon demo
// Using actual tiny transparent/colored standard placeholder representations, 
// so the user can easily click "Demo Leaf Image" and trigger the backend analysis!
export const DISEASE_SAMPLES: DiseaseSample[] = [
  {
    id: "rice-blast",
    name: "Rice Blast (Magnaporthe oryzae)",
    cropName: "Rice",
    symptoms: "Spindle-shaped, diamond lesions with ash-colored centers and dark brown margins on the leaves. Severe cases cause stem nodule rot and head collapse.",
    mimeType: "image/jpeg",
    image: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAEAAQADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJcovK1grNDR4kW5OkoIURUZUVDlistEBDCRURkxSWhcYGl4cYG6Gg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebnGlqc3R1ndnd4eXpd3g8fX1f393h5+v/gQCv/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5jpndnd4eXpd3g8fX1f393h5+v/aAAwDAQACEEMAPIAP/9k="
  },
  {
    id: "tomato-late-blight",
    name: "Tomato Late Blight (Phytophthora infestans)",
    cropName: "Tomato",
    symptoms: "Water-soaked, dark green-to-black lesions on leaves, often expanding rapidly in humid conditions, accompanied by white, downy fungal-like growth on the leaf underside.",
    mimeType: "image/jpeg",
    image: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAEAAQADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJcovK1grNDR4kW5OkoIURUZUVDlistEBDCRURkxSWhcYGl4cYG6Gg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebnGlqc3R1ndnd4eXpd3g8fX1f393h5+v/gQCv/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5jpndnd4eXpd3g8fX1f393h5+v/aAAwDAQACEEMAPIAP/9k="
  },
  {
    id: "wheat-rust",
    name: "Wheat Stem Rust (Puccinia graminis)",
    cropName: "Wheat",
    symptoms: "Elongated, brick-red to brownish pustules on leaf sheaths, stems, and leaves. Ruptured pustules release powdery spores that disrupt water flow, leading to lodging and shriveled grains.",
    mimeType: "image/jpeg",
    image: "/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAIBAQIBAQICAgICAgICAwUDAwMDAwYEBAMFBwYHBwcGBwcICQsJCAgKCAcHCg0KCgsMDAwMBwkODw0MDgsMDAz/2wBDAQICAgMDAwYDAwYMCAcIDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAz/wAARCAEAAQADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJcovK1grNDR4kW5OkoIURUZUVDlistEBDCRURkxSWhcYGl4cYG6Gg4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebnGlqc3R1ndnd4eXpd3g8fX1f393h5+v/gQCv/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5jpndnd4eXpd3g8fX1f393h5+v/aAAwDAQACEEMAPIAP/9k="
  }
];

export const MENTOR_GUIDE_MARKDOWN = `
# Indian AgriTech Hackathon Blueprint
## 48-Hour MVP Design Specification & Mentorship Guide
**Compiled by:** Senior AI Architect & Hackathon Mentor

---

### 1. Product Architecture

\`\`\`
       ┌───────────────────────────────────────────────────────────────┐
       │                   REACT FRONTEND (Vite, TS)                   │
       │  • Responsive Dashboard  • Form Engines  • Audio Mic Stream   │
       └──────────────┬────────────────────────────────┬───────────────┘
                      │ HTTP (REST JSON)               │ Media Files
                      ▼                                ▼
       ┌───────────────────────────────────────────────────────────────┐
       │                 EXPRESS MIDDLEWARE BACKEND                    │
       │  • Route Controllers • Vite SSR Dev Handler • Error Catchers │
       └──────────────┬────────────────────────────────┬───────────────┘
                      │                                │
                      ▼ @google/genai SDK (v2.4.0)     ▼ Direct API Calls
       ┌──────────────────────────────┐ ┌──────────────────────────────┐
       │           AI LAYER           │ │        EXTERNAL SERVICES     │
       │  • gemini-3.5-flash          │ │  • IMD Weather / Open-Meteo  │
       │  • Multilingual Sys Prompts  │ │  • data.gov.in Mandi Rates   │
       │  • Image Pathogen Diagnosis  │ │  • Web Speech Audio API      │
       └──────────────────────────────┘ └──────────────────────────────┘
\`\`\`

#### Frontend
- **Technology**: Single Page Application with React 19, TypeScript, and Vite.
- **Styling**: Tailwind CSS v4 with custom warm earth colors (\`emerald\`, \`amber\`, \`stone\`).
- **State Management**: React state hooks coupled with context providers for global configurations (language, user location, theme).
- **Core Views**: Tab-based single view layout to avoid routing complexity during demo.
- **Micro-interactions**: Framer Motion (\`motion/react\`) for page transitions, spinner feedback, and voice waves.

#### Backend
- **Technology**: Lightweight Node.js Express server configured to bind to port \`3000\`.
- **API Routing**: Distinct REST API routes handling file payloads (base64) and forms.
- **Dev/Prod Hydration**: Integrates Vite dev server middleware in development mode and serves compiled files from \`dist/\` in production.
- **Build System**: \`esbuild\` bundling the Express \`server.ts\` file to \`dist/server.cjs\` (CommonJS) to completely bypass runtime relative import strictness in ES module configurations.

#### AI Layer
- **Client Interface**: Zero client-side Gemini dependencies. All requests are routed through backend proxies.
- **API Engine**: Fully migrated to the modern \`@google/genai\` TypeScript SDK.
- **Model Selection**: \`gemini-3.5-flash\` for both high-speed text generation, chat conversations, and multi-modal image-based plant disease analysis.
- **Localization Integration**: System prompts include runtime constraints injected dynamically depending on language header (English, Hindi, Bengali) for immediate native outputs.

#### Database
- **MVP Tier**: In-memory data caches and local storage persistence. For a 48-hour hackathon, do not let database setups slow down your frontend/AI validation.
- **Startup Tier**: Relational schema prepared for immediate Cloud SQL PostgreSQL integration (using Drizzle ORM) or Firestore for non-relational document trees.

#### External APIs
- **Weather Services**: Open-Meteo (free, no key required) and IMD (official, paid/restricted key) for agricultural meteorology.
- **Mandi Pricing**: National Horticulture Board and data.gov.in APIs for commodity pricing.

---

### 2. Features Categorization

| MUST HAVE (MVP) | GOOD TO HAVE (Demo-Ready) | FUTURE STARTUP SCOPE |
| :--- | :--- | :--- |
| **Multilingual AI Chatbot**: Real-time advice in English, Hindi, and Bengali. | **Speech Synthesis**: Text-to-speech for farmers who cannot read well. | **IoT Soil Probe**: Hardened sensors feeding NPK levels automatically via cellular. |
| **Crop Recommendation Engine**: Form calculating optimal crops based on NPK, pH, and climate. | **Interactive Mandi Price Tracker**: Charting local commodity rates. | **DGPS Satellite Moisture Indices**: Sentinel-2 / Bhuvan analytics. |
| **Visual Disease Diagnosis**: base64 leaf analyzer powered by Gemini. | **Government Schemes Matching**: Form to query scheme eligibility. | **Localized Micro-credit Scoring**: KCC loan pre-approvals via machine learning. |
| **Agricultural Weather Alerts**: 3-day window advisories. | **Offline PWA support**: Cache static components for zero-signal fields. | **Supply Chain Integration**: Contract farming portals with eNAM integration. |

---

### 3. Comprehensive Indian Agriculture Datasets Reference

This section details critical data points for Indian AgriTech. We examine both the official government pipelines (complex, slow access) and the best free/open-source alternatives for rapid MVP assembly.

#### 1. IMD Weather API (India Meteorological Department)
*   **Official Website**: [https://internal.imd.gov.in/](https://internal.imd.gov.in/)
*   **API Link**: Restricted/Paid. Accessed via requests to IMD's Web Service Portal (often requires manual government vetting/MoU signing for research/startup access).
*   **Authentication**: Custom API Token + IP Whitelisting.
*   **Update Frequency**: 3-hour intervals for observational data; daily for forecasts.
*   **Best Use Case**: Region-specific high-accuracy rainfall, humidity, and extreme weather alerts (cyclones, heatwaves) tailored for Indian sub-districts.
*   **MVP vs Production Recommendation**: **Production only**. For a 48-hour hackathon, IMD is *impossible* to get approved. Use **Open-Meteo** (with lat/long mapped to Indian districts) instead!

#### 2. Soil Health Card (SHC) API
*   **Official Website**: [https://soilhealth.dac.gov.in/](https://soilhealth.dac.gov.in/)
*   **API Link**: Internal NIC (National Informatics Centre) endpoints. No open public API, though farmers can search by sample ID.
*   **Authentication**: Govt-auth credentials for laboratory operators.
*   **Best Use Case**: Direct retrieval of actual macro/micronutrient levels (N, P, K, Sulphur, Zinc, pH, EC) from the farm's unique registration ID.
*   **MVP vs Production Recommendation**: **Production only**. For the MVP, simulate or allow farmers to enter their soil test values manually (which is what they do after getting their paper card!).

#### 3. data.gov.in Agriculture APIs (Mandi & Crop Yield)
*   **Official Website**: [https://data.gov.in/](https://data.gov.in/)
*   **API Link**: \`https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070\` (Daily Mandi Prices)
*   **Authentication**: API Key (requires a quick registration on data.gov.in which approves keys in minutes!).
*   **Free or Paid**: Free.
*   **Update Frequency**: Daily (as updated by Agmarknet officials across municipal markets).
*   **Example Response**:
    \`\`\`json
    {
      "index_name": "Mandi Prices Daily",
      "records": [
        {
          "state": "West Bengal",
          "district": "Nadia",
          "market": "Ranaghat",
          "commodity": "Paddy(Dhan)",
          "variety": "Common",
          "arrival_date": "05/07/2026",
          "min_price": "2100",
          "max_price": "2300",
          "modal_price": "2200"
        }
      ]
    }
    \`\`\`
*   **Best Use Case**: Fetching real-time market rates for specific agricultural crops across local Mandis (APMCs) so farmers know where to sell.
*   **MVP vs Production Recommendation**: **Highly recommended for MVP!** You can obtain a free API key on data.gov.in instantly, allowing your demo to showcase real, live price data.

#### 4. ISRO Bhuvan Geo-Platform
*   **Official Website**: [https://bhuvan.nrsc.gov.in/](https://bhuvan.nrsc.gov.in/)
*   **API Link**: WMS/WFS Web Map Services (GIS tiles).
*   **Authentication**: Registered Developer Credentials.
*   **Update Frequency**: Monthly / Seasonal based on satellite passes.
*   **Best Use Case**: High-resolution Indian spatial maps, soil moisture vectors, and vegetative index layers.
*   **MVP vs Production Recommendation**: **Production only** due to high GIS integration latency. Use Leaflet or Google Maps with simulated overlay coordinates for the hackathon stage.

#### 5. Agmarknet (Agricultural Marketing Information Network)
*   **Official Website**: [https://agmarknet.gov.in/](https://agmarknet.gov.in/)
*   **API Link**: Integrated directly within data.gov.in resource feeds.
*   **Best Use Case**: Access to aggregate price histories and volume trends.
*   **MVP vs Production Recommendation**: Use the data.gov.in proxy.

#### 6. eNAM (National Agriculture Market)
*   **Official Website**: [https://enam.gov.in/](https://enam.gov.in/)
*   **API Link**: Internal portal APIs. Public documentation is limited.
*   **Best Use Case**: Live bidding, interstate trade indices, and transaction logging.
*   **MVP vs Production Recommendation**: **Production only**.

#### 7. PM-KISAN Portal Data
*   **Official Website**: [https://pmkisan.gov.in/](https://pmkisan.gov.in/)
*   **API Link**: NIC Internal secure gateways.
*   **Best Use Case**: Verifying beneficiary payment status via Aadhaar hashing.
*   **MVP vs Production Recommendation**: Simulate eligibility checking in the MVP using simple rules (land size < 2 ha, not a taxpayer) rather than calling internal secure systems.

#### 8. Pradhan Mantri Fasal Bima Yojana (PMFBY) - Crop Insurance Calculator
*   **Official Website**: [https://pmfby.gov.in/](https://pmfby.gov.in/)
*   **API Link**: Public open premium calculator widget endpoint: \`https://pmfby.gov.in/api/premium-calculator\` (varies by season).
*   **Best Use Case**: Instantly pulling crop insurance premium rates based on state, district, crop, and farm area.
*   **MVP vs Production Recommendation**: Integrate a basic local JSON calculation mapping Rabi (1.5%) and Kharif (2.0%) crop premium ratios for rapid demo execution.

#### 9. ICAR Crop Knowledge Base (Indian Council of Agricultural Research)
*   **Official Website**: [https://icar.org.in/](https://icar.org.in/)
*   **Source**: Extensive PDF and static website agronomic manuals.
*   **Best Use Case**: Sourcing precise scientific soil-nutrient thresholds for Indian specific crop types.
*   **MVP vs Production Recommendation**: **Perfect for seeding AI System Prompts!** We extract these thresholds and hard-code them as a context baseline for Gemini to ensure realistic, science-grounded crop suggestions.

#### 10. Sentinel Hub (Copernicus)
*   **Official Website**: [https://www.sentinel-hub.com/](https://www.sentinel-hub.com/)
*   **API Link**: \`https://services.sentinel-hub.com/api/v1/process\`
*   **Authentication**: OAuth2 client secret. Offers a generous 30-day trial!
*   **Best Use Case**: Fetching real-time NDVI (Normalized Difference Vegetation Index) maps to diagnose crop vigor and identify waterlogging.
*   **MVP vs Production Recommendation**: Highly impactful for a *winning* hackathon demo if you can hook up an NDVI visual layer on a mock plot, but can be simulated using colored maps to save integration time.

#### 11. Google Earth Engine (GEE)
*   **Official Website**: [https://earthengine.google.com/](https://earthengine.google.com/)
*   **API Link**: GEE Python/JS client APIs.
*   **Authentication**: Google Cloud Platform Service Account with Earth Engine permissions.
*   **Best Use Case**: Large-scale agricultural modeling, historical crop damage assessments, and groundwater levels.
*   **MVP vs Production Recommendation**: **Production only**. Setting up Earth Engine credentials can take days.

#### 12. PlantVillage Dataset (Open Source Plant Pathology)
*   **Official Website**: [https://plantvillage.psu.edu/](https://plantvillage.psu.edu/)
*   **Dataset Link**: [Kaggle PlantVillage Dataset](https://www.kaggle.com/datasets/emmarex/plantdisease)
*   **Content**: 54,306 images of diseased and healthy plant leaves across 14 crop species.
*   **Best Use Case**: Training machine learning models or seeding a crop image pathology lookup.
*   **MVP vs Production Recommendation**: **Excellent for seeding your Demo!** Use images from this dataset as pre-loaded "Demo Leaf Images" so judges can run disease detection with one click, showing off your multi-modal Gemini analysis instantly!

#### 13. Kaggle Indian Agriculture Datasets
*   **Dataset Link**: [Crop Recommendation Dataset on Kaggle](https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset)
*   **Content**: CSV records specifying Nitrogen, Phosphorus, Potassium, Temperature, Humidity, pH, and Rainfall labels for different crops (Rice, Maize, Cotton, Mango, etc.).
*   **Best Use Case**: Training soil-to-crop classifiers or verifying AI guidelines.
*   **MVP vs Production Recommendation**: Highly recommended! Use this CSV to seed your mock form sliders with realistic parameters (e.g. N=90, P=42, K=43, pH=6.5, Temp=20, Rain=200 for Rice).

#### 14. NASA POWER API (Prediction of Worldwide Energy Resources)
*   **Official Website**: [https://power.larc.nasa.gov/](https://power.larc.nasa.gov/)
*   **API Link**: \`https://power.larc.nasa.gov/api/temporal/daily/point\`
*   **Authentication**: Free, public, no registration key required!
*   **Update Frequency**: Daily (lag of about 1-2 days).
*   **Best Use Case**: Access to surface solar radiation, air temperatures, soil moisture, and wind speeds anywhere in the world.
*   **MVP vs Production Recommendation**: **Excellent for MVP!** Because it requires no API key, you can fetch actual geo-spatial climate averages for any district instantly.

#### 15. Open-Meteo API
*   **Official Website**: [https://open-meteo.com/](https://open-meteo.com/)
*   **API Link**: \`https://api.open-meteo.com/v1/forecast?latitude=22.57&longitude=88.36&daily=temperature_2m_max,temperature_2m_min,rain_sum&timezone=auto\`
*   **Authentication**: Free for non-commercial use, no API key required!
*   **Update Frequency**: Hourly.
*   **Best Use Case**: Live 7-day weather forecasts, historical weather comparisons, and rain estimates.
*   **MVP vs Production Recommendation**: **Absolute best for 48-Hour MVP!** It loads in milliseconds, covers all of India down to coordinate levels, and provides perfect agricultural meteorology markers (like soil temperature and humidity) out-of-the-box.

---

### 4. AI Workflows & Implementation Strategy

\`\`\`
               ┌────────────────────────────────────────────────────────┐
               │                  USER SENDS REQUEST                    │
               │  • Image (Base64) OR Form Data OR Conversational Text  │
               └───────────────────────────┬────────────────────────────┘
                                           │
                    ┌──────────────────────┴──────────────────────┐
                    ▼                                             ▼
          [ MULTI-MODAL PATH ]                           [ CHAT / ADVISORY PATH ]
      Leaf Leaf Image uploaded                      Query & Lang submitted
                    │                                             │
      Inject Plant Pathology Rules                  Inject Local Context (Location, Lang)
                    │                                             │
     "Identify pathogen, diagnose,                "Answer agricultural query,
     prescribe Organic & Chem cures"               refer to PM Kisan/Mandi/Weather"
                    │                                             │
                    └──────────────────────┬──────────────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │      gemini-3.5-flash       │
                            │  Server-side Execution Only  │
                            └──────────────┬──────────────┘
                                           │
                                           ▼
                            ┌─────────────────────────────┐
                            │    LOCALIZED NATIVE RESP    │
                            │  (English / Hindi / Bengali) │
                            └─────────────────────────────┘
\`\`\`

#### Where to use Gemini vs. Hard-coded Rules & Traditional ML

1.  **Crop Recommendation**:
    -   *Hybrid Approach*: Use a **Hard-coded range validator** on the frontend (e.g. soil pH must be between 0 and 14). Use **Gemini 3.5 Flash** for the recommendation logic itself. Why? Traditional ML classification (like Random Forest on Kaggle CSVs) only outputs a single crop string (e.g., "Rice"). It cannot tell the farmer *why*, suggest *organic amendments*, estimate *yield based on district weather*, or output the entire strategy in Bengali! Gemini does all of this in a single, highly creative and scientifically bounded generation.
2.  **Disease Detection**:
    -   *AI Vision*: Send the image base64 directly to **Gemini 3.5 Flash** along with a specialized Plant Pathology prompt. It analyzes visual structures (necrosis, chlorosis spots, mold) and returns diagnoses instantly.
    -   *Rules guard*: If the image uploaded does not appear to contain plant foliage or leaves, Gemini is instructed to politely ask the farmer to take a clearer photo of the affected plant.
3.  **Voice Assistant & Chatbot**:
    -   *Acoustic Layer*: Use the browser's native **Web Speech API (webkitSpeechRecognition)** on the client for zero-cost Speech-to-Text translation. Send this translated string to our Express server.
    -   *Cognitive Layer*: **Gemini 3.5 Flash** processes the text alongside historical conversation arrays to maintain full context.
    -   *Vocalizer*: Express returns the text answer. The client-side uses the browser's native **SpeechSynthesis (TTS)** to read out the response in Hindi or Bengali. This is incredibly stable, completely free, and saves valuable hours of API key configuration during the hackathon!

---

### 5. Database Schema Design (PostgreSQL DDL)

If you scale the MVP to a persistent production stack, this PostgreSQL schema is optimized for scalability and relational integrity.

\`\`\`sql
-- Users and Profile Data
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(15) UNIQUE NOT NULL,
    state VARCHAR(50) NOT NULL,
    district VARCHAR(50) NOT NULL,
    preferred_language VARCHAR(5) DEFAULT 'en', -- 'en', 'hi', 'bn'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Farms registered by Farmers
CREATE TABLE farms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    farm_name VARCHAR(100) NOT NULL,
    soil_type VARCHAR(50) NOT NULL,
    area_acres NUMERIC(5,2) NOT NULL,
    irrigation_source VARCHAR(50) DEFAULT 'Tube-well', -- 'Canal', 'Drip', 'Rainfed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop Cycles on each Farm
CREATE TABLE crop_cycles (
    id SERIAL PRIMARY KEY,
    farm_id INTEGER REFERENCES farms(id) ON DELETE CASCADE,
    crop_name VARCHAR(100) NOT NULL,
    sowing_date DATE NOT NULL,
    expected_harvest_date DATE,
    status VARCHAR(20) DEFAULT 'Active', -- 'Active', 'Harvested', 'Failed'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Disease Reports diagnosed via Vision
CREATE TABLE disease_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    crop_name VARCHAR(100),
    image_url TEXT NOT NULL, -- S3/GCS bucket reference
    diagnosis_raw TEXT NOT NULL, -- Gemini full markdown output
    pathogen VARCHAR(150),
    severity VARCHAR(10) DEFAULT 'Medium', -- 'Low', 'Medium', 'High'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Recommendation Cache to optimize token costs
CREATE TABLE recommendations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    soil_n INTEGER,
    soil_p INTEGER,
    soil_k INTEGER,
    soil_ph NUMERIC(3,1),
    recommended_crops TEXT NOT NULL, -- JSON or raw markdown cached
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Local Weather Cache to prevent API rate limits
CREATE TABLE weather_cache (
    id SERIAL PRIMARY KEY,
    district VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL,
    weather_data JSONB NOT NULL,
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
\`\`\`

---

### 6. REST API Endpoint Contracts

#### 1. Crop Recommendation Endpoint
*   **Verb**: \`POST\`
*   **Path**: \`/api/crop-recommendation\`
*   **Request Headers**: \`Content-Type: application/json\`
*   **Request Payload**:
    \`\`\`json
    {
      "n": 85,
      "p": 40,
      "k": 45,
      "soilType": "Alluvial Soil",
      "ph": 6.4,
      "temperature": 28,
      "rainfall": 1200,
      "state": "Punjab",
      "language": "hi"
    }
    \`\`\`
*   **Response Payload**:
    \`\`\`json
    {
      "success": true,
      "recommendation": "## फसल अनुशंसा रिपोर्ट (Crop Recommendation Report)\n\nआपके मिट्टी के मापदंडों के आधार पर शीर्ष फसलें..."
    }
    \`\`\`

#### 2. Visual Disease Diagnosis Endpoint
*   **Verb**: \`POST\`
*   **Path**: \`/api/disease-detection\`
*   **Request Headers**: \`Content-Type: application/json\`
*   **Request Payload**:
    \`\`\`json
    {
      "imageBase64": "iVBORw0KGgoAAAANS...",
      "mimeType": "image/jpeg",
      "cropName": "Tomato",
      "language": "bn"
    }
    \`\`\`
*   **Response Payload**:
    \`\`\`json
    {
      "success": true,
      "diagnosis": "## টমেটো রোগ নির্ণয় প্রতিবেদন (Tomato Late Blight Diagnosis)\n\n১. **রোগ নির্ণয়**: লেট ব্লাইট (Phytophthora infestans)..."
    }
    \`\`\`

#### 3. AI Chatbot Gateway
*   **Verb**: \`POST\`
*   **Path**: \`/api/chatbot\`
*   **Request Payload**:
    \`\`\`json
    {
      "message": "PM Kisan की किस्त कब आएगी?",
      "history": [
        { "id": "1", "role": "user", "text": "नमस्ते" },
        { "id": "2", "role": "model", "text": "नमस्ते! मैं आपका कृषक मित्र कृषि एआई सहायक हूँ।" }
      ],
      "location": "Punjab",
      "language": "hi"
    }
    \`\`\`
*   **Response Payload**:
    \`\`\`json
    {
      "success": true,
      "response": "पीएम किसान सम्मान निधि योजना की अगली किस्त आम तौर पर भारत सरकार द्वारा हर चार महीने में..."
    }
    \`\`\`

---

### 7. MVP Tech Stack Recommendation

-   **Frontend UI Framework**: **React 19 + TypeScript + Vite**. Blazing fast setup, robust component modularity, instant hot-reloading.
-   **CSS Utility Engine**: **Tailwind CSS v4**. Avoids separate CSS boilerplate and custom styling libraries, which speeds up hackathon work.
-   **Icons Pack**: **Lucide React**. High-quality line vectors matching agricultural themes (leaves, droplets, wind, speech).
-   **Backend REST framework**: **Node.js Express**. Zero-learning curve, highly compatible with standard file serving.
-   **AI SDK**: **@google/genai (v2.4.0)**. The official, modern SDK for Google models.
-   **Audio Layer**: Browser **Web Speech API** for instant, zero-cost voice speech-to-text synthesis.
-   **Maps Engine**: **Leaflet.js** (lightweight, open-source GIS viewer) or static styled Google Maps imagery.
-   **Charts Engine**: **Recharts** (SVG React-friendly charting tool for Mandi Price graphs and moisture meters).
-   **Serverless Cloud Ingress**: **Google Cloud Run**. Standard container hosting that is easy to deploy and scale.

---

### 8. Scalable Product Directory Layout

For our full-stack React + Express App, the folder tree is organized cleanly to maintain separation of client assets, server API logic, and shared types.

\`\`\`
├── dist/                          # Production compiled build targets (client/server)
├── src/                           # Client React Application Root
│   ├── components/                # Modular sub-components
│   │   ├── Chatbot.tsx            # AI Multilingual & Voice Chat panel
│   │   ├── CropRecommendation.tsx # Nutrient form and output card
│   │   ├── DiseaseDetection.tsx   # Image upload and plant pathology diagnostics
│   │   ├── IrrigationAdvice.tsx   # Moisture and scheduling panel
│   │   ├── WeatherAdvisory.tsx    # Climate charts and agrometeorology alerts
│   │   ├── SchemesDirectory.tsx   # NIC government scheme indexing and checks
│   │   └── HackathonGuide.tsx     # The Mentor's Interactive Guide Panel
│   ├── App.tsx                    # Main Dashboard hub & tab-controller
│   ├── main.tsx                   # Client mounting logic
│   ├── index.css                  # Global Tailwind v4 directive stylesheet
│   ├── types.ts                   # Unified TypeScript interface registry
│   └── data.ts                    # Static schemes, demo images, and copy blocks
├── package.json                   # Script configurations & npm dependencies
├── tsconfig.json                  # Type settings
├── vite.config.ts                 # Dev build rules & SSR parameters
├── server.ts                      # Full-stack Express controller & API endpoints
└── .env.example                   # Environment configuration template
\`\`\`

---

### 9. 48-Hour Hackathon Execution Timeline

| TIME WINDOW | CORE OBJECTIVE | DELIVERABLE |
| :--- | :--- | :--- |
| **Hours 00 - 04** | **Setup & Infrastructure** | Initialize repository, configure Tailwind v4, set up Express full-stack routing, verify hot reloading on Port 3000. |
| **Hours 04 - 10** | **AI SDK Core Integration** | Integrate \`@google/genai\` on Express, bind crop recommendation and disease detection routes, test with sample images. |
| **Hours 10 - 18** | **Frontend Core Layout** | Construct responsive Agricultural Dashboard with high-contrast UI, setup state toggles for English, Hindi, Bengali. |
| **Hours 18 - 24** | **Voice & Chat Subsystem** | Connect Speech Recognition on the frontend, wrap prompts around chatbot routes, bind synthesized Audio response loops. |
| **Hours 24 - 32** | **Features Engineering** | Implement the sliders for NPK crop recommends, construct file drop handlers, pull live weather coordinates from Open-Meteo. |
| **Hours 32 - 40** | **Polish & Pitch assets** | Seed mock databases, build beautiful graphs of Mandi price changes using Recharts, add beautiful sliding layouts. |
| **Hours 40 - 45** | **Strict Compilation Check** | Run \`npm run build\` and ensure zero linter warnings. Test base64 upload speed, fix edge-case overflows. |
| **Hours 45 - 48** | **Pitch Practice & Demo dry runs** | Record high-resolution backup MP4 demo, finalize 5-slide pitch, ensure instant startup time. |

---

### 10. Hackathon Pitch Strategy (Judge's Guide)

#### What judges expect from an Agricultural solution:
- **Immediate Farmer Usability**: A farmer with soil-covered hands cannot navigate nested dropdowns or dense text fields. Large click targets, colorful indicators, voice-enabled operations, and native regional dialects are vital.
- **Scientific Foundation**: Crop recommendations must not suggest tropical crops (like rubber) in arid sandy deserts. Grounding the AI using local rules and authentic data parameters is crucial.
- **Scalable Economics**: Showing how the application helps farmers make money (better yields + knowing exact Mandi market prices).

#### What to make REAL vs. DEMO-READY for the stage:

-   **REAL (Must work flawlessly)**:
    1.  **AI Voice Chat**: The live demo must hear Hindi/Bengali vocal audio and answer natively.
    2.  **Crop Disease Diagnosis**: The judges should be able to click a crop leaf image, upload it, and watch Gemini analyze it live in 5 seconds.
    3.  **Language Toggle**: Changing the language must translate everything instantly (no partial English gaps).
-   **DEMO-READY (Okay to simulate)**:
    1.  **Soil Testing (NPK)**: Simulated via interactive sliders. Farmers don't carry digital NPK testers in their pockets; they enter values from printed lab reports. Sliders represent this perfectly.
    2.  **Mandi prices**: Seed local prices from data.gov.in using a daily cache instead of querying active live REST requests during the main presentation (safeguards against network lags).
    3.  **Schemes registration**: Clicking "Apply Scheme" should trigger a mock success dialog confirming SMS alerts sent, rather than trying to interface with NIC government databases!

---

### 11. Post-Hackathon Startup Scale Roadmap

1.  **Hardware Integrations**: Partner with local agricultural centers to seed low-cost IoT soil probes ($15/probe) measuring N, P, K, and soil moisture. Probe connects via GSM/LoRaWAN, feeding live databases.
2.  **Finetuned AI Pathogen Core**: Train a localized custom computer vision model (e.g. YOLOv8 or ResNet-50) optimized for common Indian crop diseases (Rice Blast, Cotton Leaf Curl). Run this model as a fast micro-classifier, utilizing Gemini as a high-level specialist coordinator.
3.  **Financial/Credit Score Pipeline**: Partner with public sector banks to map farm transaction histories, historical yields, and soil viability scorecards. Leverage this dataset to auto-approve Kisan Credit Card micro-loans in under 10 minutes.
4.  **Supply Chain Agmarknet e-Commerce**: Build direct trading channels where local village Cooperatives (FPOs) can pool produce yields, bypassing local middlemen and bidding crops on eNAM via unified APIs.

---

### 12. Crucial Mentor Review & Judge's Critique

As a national-level hackathon judge, I look at solutions with strict scrutiny. Here is my critical, brutally honest assessment of your idea and how to make it a winner.

#### The Weaknesses in Your Current Proposal
1.  **"Feature Soup" Trap**: Your app promises Crop Recommendation + Disease Detection + Irrigation + Weather + Schemes + Voice + Chatbot + Multilingual. This is a massive scope. If you build 8 sub-par, shallow sections with generic mock cards, you will receive a very low score. Focus on high visual quality and deep integration. Ensure that clicking Hindi translates the chatbot, crop results, and disease diagnostics perfectly.
2.  **User Experience Gap**: Farmers do not talk like corporate managers. If your chatbot responds with: *"Cultivation optimization strategies should encompass systematic nitrogenous soil fertilization protocols..."*, the judges will deduct points immediately. Your AI must speak simply, empathetically, and practically in the farmer's native dialect.
3.  **"Simulated Slop" warning**: Avoid placing simulated infrastructure telemetry logs (e.g. "NODE PORT 3000 ONLINE", "AI ENGINE STABLE") anywhere on the UI. Keep it beautifully clean, clear, and human-friendly.

#### What Judges LOVE and How to Win the Gold
-   **Voice-First Integration**: Actually showing a voice dialogue where a farmer asks: *"धान में पत्ता सूख रहा है क्या करें?"* (My rice leaves are drying, what should I do?) and the app speaks back a biological recipe (Neem spray) is what wins competitions!
-   **The "One-Click Demo" Button**: Never make judges manually upload a photo or type 8 numbers. They are impatient. Provide high-quality "Sample Demo Leaves" and "Pre-set Soil profiles" that instantly populate the app so they see the result immediately!
`;
