<p align="center">
  <img src="https://img.shields.io/badge/BHUMI-AgriTech-2d7d46?style=for-the-badge&labelColor=1a4d2e" alt="BHUMI" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white" alt="Twilio" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</p>

<h1 align="center">BHUMI — Krishi AI Portal</h1>
<h3 align="center">Bharat's Harvest Understanding & Monitoring Intelligence</h3>
<h4 align="center">AI-powered agricultural platform for Indian farmers — crop advice, disease detection, weather alerts & government schemes</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Production-2d7d46?style=flat-square" alt="Status: Production" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License: MIT" />
</p>

<br>

BHUMI is a full-stack agri-advisory platform serving Indian farmers with:
- **AI Chat & Voice Assistant** (4 languages: EN/HI/BN/TE)
- **Crop Recommendation** powered by Gemini + soil/rainfall data
- **Leaf Disease Diagnosis** via Gemini Vision
- **Irrigation Scheduling** for personalized water management
- **Real-time Weather Alerts** through OpenWeatherMap
- **Government Scheme Discovery** (PM-KISAN, PMFBY, KCC, etc.)
- **Phone OTP Login & Farmer Account** with Firebase Auth + Firestore profiles

---

## 📁 Project structure

```
BHUMI/
├── frontend/                     # React + TypeScript + Tailwind (Vite)
│   ├── src/
│   │   ├── pages/public/         Landing page, login, public portal
│   │   ├── pages/dashboard/      RSK officer dashboard
│   │   ├── pages/admin/          Admin panel
│   │   ├── components/           Chatbot, CropRecommendation, DiseaseDetection, etc.
│   │   ├── auth/                 Firebase Auth + AuthContext
│   │   ├── api/                  API client + types
│   │   └── config/               Env variables
│   ├── public/                   Static assets (favicon, login-bg)
│   └── index.html
├── backend/                      # Python + FastAPI
│   ├── app/
│   │   ├── main.py               FastAPI entry, security headers, health check
│   │   ├── config.py             Pydantic settings
│   │   ├── schemas.py            Request/response models (farmers, plots, alerts…)
│   │   ├── firebase_client.py    Firebase Admin SDK
│   │   ├── auth.py               Firebase token verification
│   │   ├── routers/              farmers, plots, alerts, dashboard, admin, public_portal…
│   │   └── services/             Gemini, Twilio, weather, rule engine
│   ├── scripts/seed_data.py      Guntur district data seeder
│   └── Dockerfile                Production container
├── .gitignore
└── requirements.txt
```

---

## 🧰 Stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | React 19 + TypeScript + Tailwind CSS | Fast, type-safe, utility-first styling |
| **Backend** | Python 3.12 + FastAPI | Async-first, auto-docs, Pydantic validation |
| **Database** | Cloud Firestore (Firebase) | Real-time, serverless, collections for farmers/plots/alerts/health-logs |
| **Auth** | Firebase Auth (Email/Password + Phone OTP) | RSK officer + farmer authentication |
| **AI** | Google Gemini API (gemini-2.0-flash) | Free tier, text + vision + search grounding |
| **Voice/SMS** | Twilio | Outbound calls with DTMF, SMS fallback |
| **Weather** | OpenWeatherMap | Free tier, real-time forecasts |
| **Geocoding** | Google Maps API | District → lat/lon lookup |
| **Build** | Vite | Fast HMR, TypeScript out of the box |

---

## ⚡ Quick start

### Prerequisites
- Python 3.12+
- Node.js 20+
- Firebase project (Firestore + Auth + Storage)
- Gemini API key (free from Google AI Studio)
- Twilio account (for voice/SMS features)
- OpenWeatherMap API key (free tier)

### Backend

```bash
cd backend
cp .env.example .env                    # Fill in your API keys
python -m venv venv
venv\Scripts\activate                   # Windows: .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Seed demo data
python -m scripts.seed_data
```

### Frontend

```bash
cd frontend
cp .env.example .env                    # Set VITE_API_BASE_URL, Firebase keys
npm install
npm run dev                              # → http://localhost:5173
```

Visit `http://localhost:8000/docs` for auto-generated Swagger UI.

---

## 🧭 Routes

| Path | Description |
|---|---|
| `/` | Landing page with hero, feature cards, language selector |
| `/app` | Krishi AI Portal (Chat, Crop, Disease, Irrigation, Weather, Schemes) |
| `/login` | Farmer login (phone OTP) + RSK officer login (email/password) |
| `/dashboard` | RSK officer dashboard (requires Firebase Auth) |
| `/admin` | Admin panel (requires admin claim) |

---

## 📡 Endpoints overview

### Public / farmer-facing

| Method | Path | Purpose |
|---|---|---|
| POST | `/recommend` | Crop recommendation (Gemini + source data) |
| POST | `/alert/trigger` | 🔐 **Auth required** — Rule engine → Gemini → Twilio call+SMS (rate-limited, idempotent) |
| POST | `/twilio/voice-response` | DTMF keypress capture (signature-validated) |
| POST | `/twilio/sms-response` | Inbound SMS capture (signature-validated) |
| POST | `/health/log` | Upload photo → Gemini Vision diagnosis (rate-limited, 8 MB max) |
| GET/POST | `/farmers`, `/plots` | Farmer & plot registration (paginated, phone in E.164) |

### Dashboard (Firebase auth required)

| Method | Path | Purpose |
|---|---|---|
| GET | `/dashboard/me` | Self-service whoami |
| GET | `/dashboard/summary` | Stat strip counts |
| GET | `/dashboard/farmers` | Farmer list + alert status |
| GET | `/dashboard/alerts` | Alerts with ui_color (red/yellow/green) |
| GET | `/dashboard/health-logs` | Flagged RSK cases |
| PATCH | `/health/log/{id}/resolve` | Mark resolved + notes |

### Admin (Firebase custom claim)

| Method | Path | Purpose |
|---|---|---|
| CRUD | `/districts`, `/wards`, `/admin/officers` | Full management |
| POST | `/wards/{ward_id}/refresh-forecast` | Live OpenWeatherMap update |
| GET | `/farmers/{farmer_id}/timeline` | Merged alert + health + recommendation history |

Full endpoint details in `backend/README.md`.

---

## 📊 Data provenance

- **Static, real**: soil type, avg rainfall — sourced from AP govt district portal + CGWB reports
- **Live**: `forecast_dry_days` via OpenWeatherMap (free tier). Alternative for production: **IMD API** (`api.imd.gov.in`) or IMD data through `data.gov.in` for India-specific forecasts — see `09_IMD_SOIL_CGWB_INTEGRATION.md` for integration options
- **Simplified, labeled as such**: groundwater depth uses representative coastal-AP value (see `BWA/08_REAL_DATA_GUNTUR.md`)

---

## 🎯 Demo flow (5-minute pitch)

1. 📞 **Trigger dry-spell alert** → real phone rings → advisory plays in Hindi → farmer presses 1 → logged on dashboard instantly
2. 📷 **Upload crop photo** → Gemini Diagnosis in ~10s → flagged on dashboard for RSK follow-up
3. 📋 **Show recommendation** with source data visible next to AI output ("rainfall X mm, soil type Y, groundwater Z m") — proves it's not a black box


