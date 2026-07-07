import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Set up body parsers with limits for handling base64 image uploads
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Initialize Google Gen AI
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined. Please add your Gemini API Key in the AI Studio Settings > Secrets panel.");
  }
  return new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

// ----------------------------------------------------
// API ENDPOINTS
// ----------------------------------------------------

// 1. Crop Recommendation API
app.post("/api/crop-recommendation", async (req, res) => {
  try {
    const { n, p, k, soilType, ph, temperature, rainfall, state, language = "en" } = req.body;
    
    let systemInstruction = "You are an expert agronomist specializing in Indian agriculture and soil science. Your task is to recommend the best crops for a farmer based on soil and climate conditions. Be highly precise, practical, and list scientific but easy-to-understand guidance.";
    
    if (language === "hi") {
      systemInstruction += " Respond entirely in Hindi (हिन्दी). Use clear terms suitable for an Indian farmer.";
    } else if (language === "bn") {
      systemInstruction += " Respond entirely in Bengali (বাংলা). Use clear terms suitable for an Indian farmer.";
    }

    const prompt = `Based on the following parameters, recommend the top 3-4 suitable crops:
- Nitrogen (N): ${n} mg/kg
- Phosphorus (P): ${p} mg/kg
- Potassium (K): ${k} mg/kg
- Soil Type: ${soilType}
- Soil pH: ${ph}
- Average Temperature: ${temperature}°C
- Expected Annual Rainfall: ${rainfall} mm
- Location (State/Region in India): ${state}

For each crop, provide:
1. Crop name
2. Suitability percentage (with logical justification based on the NPK and climate)
3. Expected cultivation duration (in days or months)
4. Key fertilizers or soil amendments needed
5. Potential yield estimate (e.g., in quintals per acre)
6. Water requirement rating (Low / Moderate / High)

Also, provide 3 actionable agronomic tips for preparing the field for the selected crops.
Return the response in structured, beautifully readable markdown format with headings.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    res.json({ success: true, recommendation: response.text });
  } catch (error: any) {
    console.error("Crop Recommendation Error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// 2. Disease Detection API (Multi-modal)
app.post("/api/disease-detection", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", cropName, language = "en" } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ success: false, error: "No image provided" });
    }

    let systemInstruction = "You are a master plant pathologist specializing in South Asian crops. Diagnose diseases from crop leaf/stem images accurately, distinguish healthy plants from diseased ones, and prescribe actionable remedies.";
    
    if (language === "hi") {
      systemInstruction += " Respond entirely in Hindi (हिन्दी).";
    } else if (language === "bn") {
      systemInstruction += " Respond entirely in Bengali (বাংলা).";
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");

    const prompt = `Analyze this crop image. ${cropName ? `The farmer believes this is a ${cropName} plant.` : "Identify the crop first if possible."}
Please provide a detailed report including:
1. **Diagnosis**: Disease name (both scientific and common names in India), or confirm if the crop is healthy.
2. **Confidence Level**: High / Medium / Low.
3. **Primary Symptoms**: What indicators are visible in this image (e.g., chlorosis, leaf spots, mildew)?
4. **Causative Agent**: Is it fungal, bacterial, viral, nutrient deficiency, or pest-induced? Identify the specific pathogen if possible.
5. **Cure & Management**:
   - *Organic/Biological Control*: Eco-friendly, low-cost homemade cures (like Neem oil, buttermilk spray, ash, etc.).
   - *Chemical Control*: Standard recommended chemical treatments (with generic chemical names, e.g., Mancozeb, Carbendazim, Neem-based formulations).
6. **Prevention Strategy**: Actionable steps to prevent recurrence in the next cycle.

Provide the response in highly legible, structured markdown with clear section headers.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: mimeType,
            data: cleanBase64,
          },
        },
        { text: prompt },
      ],
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    res.json({ success: true, diagnosis: response.text });
  } catch (error: any) {
    console.error("Disease Detection Error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// 3. AI Chatbot & Voice Assistant API
app.post("/api/chatbot", async (req, res) => {
  try {
    const { message, history = [], location, language = "en" } = req.body;
    
    let systemInstruction = `You are "Krishi AI Assistant", a friendly, empathetic, and exceptionally knowledgeable agricultural chatbot for Indian farmers. 
Your goal is to answer queries regarding crops, soil health, pesticides, weather impact, market prices (mandi rates), and central/state government schemes (such as PM-KISAN, PM-FBY, KCC).
Provide concise, direct, and actionable advice. Do not use over-complicated jargon.
Always try to relate advice to the local context (Location: ${location || "India"}).
${language === "hi" ? "IMPORTANT: Respond entirely in Hindi (हिन्दी). Use simple, conversational words." : ""}
${language === "bn" ? "IMPORTANT: Respond entirely in Bengali (বাংলা). Use simple, conversational words." : ""}
`;

    const ai = getGeminiClient();
    
    // Format conversation history for Gemini
    const formattedContents = [];
    for (const msg of history) {
      formattedContents.push({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.text }],
      });
    }
    // Append current message
    formattedContents.push({
      role: "user",
      parts: [{ text: message }],
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: formattedContents as any,
      config: {
        systemInstruction,
        temperature: 0.5,
      },
    });

    res.json({ success: true, response: response.text });
  } catch (error: any) {
    console.error("Chatbot Error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// 4. Weather advisory API
app.post("/api/weather-advisory", async (req, res) => {
  try {
    const { state, district, language = "en" } = req.body;
    
    // Simulate current meteorological indices for agriculture
    // (In production, these would be fetched from IMD or OpenMeteo APIs, detailed in our guide)
    const simulatedWeather = {
      temperature: 31,
      humidity: 78,
      rainfallProbability: 65,
      windSpeed: 14,
      soilMoisture: "32%",
      index: "High Humidity & Moderate Temp (Conducive for Blast Disease in Rice)"
    };

    let systemInstruction = "You are a senior agricultural meteorologist. You synthesize current weather metrics into tailored farming guidelines.";
    if (language === "hi") systemInstruction += " Respond entirely in Hindi (हिन्दी).";
    if (language === "bn") systemInstruction += " Respond entirely in Bengali (বাংলা).";

    const prompt = `Generate a 3-day Agricultural Weather Advisory for ${district || "Local District"}, ${state || "State"}.
Simulated metrics:
- Temperature: ${simulatedWeather.temperature}°C
- Relative Humidity: ${simulatedWeather.humidity}%
- Rainfall Probability: ${simulatedWeather.rainfallProbability}%
- Wind Speed: ${simulatedWeather.windSpeed} km/h
- Current Soil Moisture: ${simulatedWeather.soilMoisture}
- Pest Disease Risk Index: ${simulatedWeather.index}

Please provide:
1. **Critical Alert**: Any immediate hazards (e.g. cloudburst, pest alert, waterlogging risk, high temperature stress).
2. **Sowing/Transplanting Advisory**: Is it safe to sow or transplant crops?
3. **Pesticide/Fertilizer Spraying Window**: Recommend if spraying should be delayed due to wind or rainfall.
4. **Irrigation Schedule Advice**: Whether to hold or increase irrigation based on rain probability.

Return the response in a short, scannable, structured markdown layout.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({ 
      success: true, 
      advisory: response.text,
      metrics: simulatedWeather 
    });
  } catch (error: any) {
    console.error("Weather Advisory Error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// 5. Irrigation Advice API
app.post("/api/irrigation-advice", async (req, res) => {
  try {
    const { cropName, soilType, stage, source = "Tube-well", language = "en" } = req.body;
    
    let systemInstruction = "You are a smart irrigation engineer and agronomist. Help the farmer optimize water use, especially under Indian conditions.";
    if (language === "hi") systemInstruction += " Respond entirely in Hindi (हिन्दी).";
    if (language === "bn") systemInstruction += " Respond entirely in Bengali (বাংলা).";

    const prompt = `Provide irrigation advisory for:
- Crop Name: ${cropName}
- Soil Type: ${soilType}
- Cultivation Stage: ${stage} (e.g., Sowing, Seedling, Vegetative, Flowering, Grain-Filling, Maturity)
- Water Source: ${source}

Please advise on:
1. **Optimal Water Depth/Quantity**: Precise guidelines for this stage.
2. **Critical Irrigation Stages**: Is the current stage ${stage} highly critical for water stress?
3. **Smart Irrigation Technique**: (e.g., drip, sprinkler, alternate wetting & drying).
4. **Water Conservation Tip**: A simple low-cost action to reduce evaporation or water wastage.

Provide a short, structured markdown response.`;

    const ai = getGeminiClient();
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    res.json({ success: true, advice: response.text });
  } catch (error: any) {
    console.error("Irrigation Advisory Error:", error);
    res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
});

// ----------------------------------------------------
// VITE MIDDLEWARE & FRONTEND SERVING
// ----------------------------------------------------
// ----------------------------------------------------
// VITE MIDDLEWARE & FRONTEND SERVING
// ----------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  }).then((vite) => {
    app.use(vite.middlewares);
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Development Server running on port ${PORT}`);
    });
  }).catch((err) => {
    console.error("Failed to start Vite dev server:", err);
  });
} else {
  const distPath = path.join(process.cwd(), "dist");
  app.use(express.static(distPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Production Server running on port ${PORT}`);
  });
}
