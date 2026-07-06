<p align="center">
  <img src="https://img.shields.io/badge/BHUMI-Bharat's%20Harvest%20Understanding%20%26%20Monitoring%20Intelligence-2d7d46?style=for-the-badge&labelColor=1a4d2e" alt="BHUMI" />
</p>

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white" alt="Twilio" />
  <img src="https://img.shields.io/badge/OpenWeatherMap-E67E22?style=for-the-badge&logo=openweathermap&logoColor=white" alt="OpenWeatherMap" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
</p>

<h1 align="center">BHUMI — Kisan Alert</h1>
<h3 align="center">Bharat's Harvest Understanding & Monitoring Intelligence</h3>
<h4 align="center">Voice-first agricultural intelligence for small and marginal farmers.</h4>

<p align="center">
  <img src="https://img.shields.io/badge/Status-Prototype-2d7d46?style=flat-square" alt="Status: Prototype" />
  <img src="https://img.shields.io/badge/License-MIT-blue?style=flat-square" alt="License: MIT" />
  <img src="https://img.shields.io/badge/Build-24--48h%20Hackathon-ff6b35?style=flat-square" alt="Build: 24-48hr Hackathon" />
</p>

<br>

BHUMI is a hackathon-built platform that recommends crops, sends voice/SMS dry-spell alerts, and diagnoses crop health via photo — all in the farmer's language, on a basic phone, with no data connection required.

Built in 24–48 hours. Extensible from **1 ward to a full district** with no schema changes.

---

## 🌱 Problem

Small farmers make crop decisions based on habit or hearsay rather than soil health, groundwater depth, or rainfall data — leading to crop failure and financial loss. Existing digital tools assume literacy, smartphones, and data connectivity that most small farmers don't have.

## 🚜 Solution

BHUMI calls the farmer, speaks their language, and tells them exactly what to do:

1. 🌾 **Crop recommendation** — grounded in real soil, rainfall, and groundwater data (not a black box)
2. 📞 **Dry-spell alerts** — outbound voice call + SMS with DTMF response (press 1 for irrigated, 2 for callback)
3. 📷 **Crop health diagnosis** — upload a photo, get an AI diagnosis in seconds, flagged for RSK follow-up
4. 📊 **RSK Dashboard** — ward officer view of all farmers, alerts, and flagged cases

---

## 📁 Project structure

```
BHUMI/
├── README.md                  ← You are here
├── frontend/
│   ├── README.md              Docs Viewer + RSK Dashboard
│   ├── index.html             Vite-based doc viewer
│   ├── src/main.ts            Static doc viewer app
│   └── public/md/             Documentation markdown files
├── backend/
│   ├── README.md              Full backend setup & API reference
│   ├── app/
│   │   ├── main.py            FastAPI app entry point
│   │   ├── config.py          Env var settings (pydantic-settings)
│   │   ├── firebase_client.py Firebase Admin SDK init
│   │   ├── schemas.py          Pydantic request/response models
│   │   ├── services/           Gemini, Twilio, weather, rule engine
│   │   └── routers/            13 route modules (recommend, alerts, dashboard, etc.)
│   ├── scripts/seed_data.py   Real Guntur district data seeder
│   └── firestore.rules        Locks down direct client Firestore access
├── .env.example               Env var template
├── .gitignore
└── requirements.txt
```

---

## 🧰 Stack

<p align="center">
  <img src="https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
  <img src="https://img.shields.io/badge/Gemini-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/Twilio-F22F46?style=for-the-badge&logo=twilio&logoColor=white" alt="Twilio" />
  <img src="https://img.shields.io/badge/OpenWeatherMap-E67E22?style=for-the-badge&logo=openweathermap&logoColor=white" alt="OpenWeatherMap" />
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vanilla%20JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="Vanilla JS" />
</p>

| Layer | Choice | Why |
|---|---|---|
| <img src="https://img.shields.io/badge/-API-005571?logo=fastapi&logoColor=white" height="20" alt="API"/> | FastAPI | Fast to build, familiar stack |
| <img src="https://img.shields.io/badge/-Database-FFCA28?logo=firebase&logoColor=black" height="20" alt="DB"/> | Cloud Firestore (Firebase) | Replaces Supabase from original spec; collections mirror `03_SCHEMA.md` 1:1 |
| <img src="https://img.shields.io/badge/-Storage-FFCA28?logo=firebase&logoColor=black" height="20" alt="Storage"/> | Firebase Storage | Crop health photos |
| <img src="https://img.shields.io/badge/-Auth-FFCA28?logo=firebase&logoColor=black" height="20" alt="Auth"/> | Firebase Authentication | RSK officer / admin dashboard login |
| <img src="https://img.shields.io/badge/-AI%20Text-8E75B2?logo=googlegemini&logoColor=white" height="20" alt="AI Text"/> | Gemini API | Free tier, no GCP billing needed |
| <img src="https://img.shields.io/badge/-AI%20Vision-8E75B2?logo=googlegemini&logoColor=white" height="20" alt="AI Vision"/> | Gemini Vision | Crop photo diagnosis |
| <img src="https://img.shields.io/badge/-Grounding-8E75B2?logo=googlegemini&logoColor=white" height="20" alt="Grounding"/> | Gemini `googleSearch` tool | Live weather/advisory context |
| <img src="https://img.shields.io/badge/-Voice%2FSMS-F22F46?logo=twilio&logoColor=white" height="20" alt="Voice/SMS"/> | Twilio | Outbound calls, DTMF gather, SMS fallback |
| <img src="https://img.shields.io/badge/-Weather-E67E22?logo=openweathermap&logoColor=white" height="20" alt="Weather"/> | OpenWeatherMap | Dry-spell forecast (free tier) |
| <img src="https://img.shields.io/badge/-Docs%20UI-646CFF?logo=vite&logoColor=white" height="20" alt="Docs UI"/> | Vite + TypeScript | Planning doc viewer |
| <img src="https://img.shields.io/badge/-Dashboard-F7DF1E?logo=javascript&logoColor=black" height="20" alt="Dashboard"/> | Vanilla JS (planned) | No build step, lightweight |

---

## ⚡ Quick start

```bash
# Backend
cp .env.example .env          # Fill in Firebase, Gemini, Twilio, OpenWeatherMap keys
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Seed real Guntur district data
python -m scripts.seed_data

# Frontend (docs viewer)
cd frontend
npm install
npm run dev                    # → http://localhost:5173
```

Visit `http://localhost:8000/docs` for Swagger UI covering every endpoint.

---

## 📡 Endpoints overview

### Public / farmer-facing

| Method | Path | Purpose |
|---|---|---|
| POST | `/recommend` | Crop recommendation (Gemini + source data) |
| POST | `/alert/trigger` | Rule engine → Gemini advisory → Twilio call+SMS |
| POST | `/twilio/voice-response` | DTMF keypress capture |
| POST | `/twilio/sms-response` | Inbound SMS capture |
| POST | `/health/log` | Upload photo → Gemini Vision diagnosis |
| GET/POST | `/farmers`, `/plots` | Farmer & plot registration |

### Dashboard (Firebase auth required)

| Method | Path | Purpose |
|---|---|---|
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

Full endpoint details in `backend/README.md`.

---

## 📊 Data provenance

- **Static, real**: soil type, avg rainfall — sourced from AP govt district portal + CGWB reports
- **Live**: `forecast_dry_days` via OpenWeatherMap (free tier)
- **Simplified, labeled as such**: groundwater depth uses representative coastal-AP value (see `BWA/08_REAL_DATA_GUNTUR.md`)

---

## 🎯 Demo flow (5-minute pitch)

1. 📞 **Trigger dry-spell alert** → real phone rings → advisory plays in Hindi → farmer presses 1 → logged on dashboard instantly
2. 📷 **Upload crop photo** → Gemini Diagnosis in ~10s → flagged on dashboard for RSK follow-up
3. 📋 **Show recommendation** with source data visible next to AI output ("rainfall X mm, soil type Y, groundwater Z m") — proves it's not a black box


