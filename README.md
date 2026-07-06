# BHUMI — Kisan Alert

**Voice-first agricultural intelligence for small and marginal farmers.**

BHUMI is a hackathon-built platform that recommends crops, sends voice/SMS dry-spell alerts, and diagnoses crop health via photo — all in the farmer's language, on a basic phone, with no data connection required.

Built in 24–48 hours for [insert hackathon name]. Extensible from 1 ward to a full district with no schema changes.

---

## Problem

Small farmers make crop decisions based on habit or hearsay rather than soil health, groundwater depth, or rainfall data — leading to crop failure and financial loss. Existing digital tools assume literacy, smartphones, and data connectivity that most small farmers don't have.

## Solution

BHUMI calls the farmer, speaks their language, and tells them exactly what to do:

1. **Crop recommendation** — grounded in real soil, rainfall, and groundwater data (not a black box)
2. **Dry-spell alerts** — outbound voice call + SMS with DTMF response (press 1 for irrigated, 2 for callback)
3. **Crop health diagnosis** — upload a photo, get an AI diagnosis in seconds, flagged for RSK follow-up
4. **RSK Dashboard** — ward officer view of all farmers, alerts, and flagged cases

---

## Project structure

```
BHUMI/
├── README.md                  ← You are here
├── frontend/
│   ├── README.md              Docs Viewer + RSK Dashboard
│   ├── index.html             Vite-based planning-doc viewer
│   ├── src/main.ts            Static doc viewer app
│   └── public/md/             Planning document markdown files
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
├── BWA/                        Planning documents (PRD, architecture, schema, etc.)
│   ├── 00_README.md → 10_*.md
│   └── README.md
├── .env.example               Env var template
├── .gitignore
└── requirements.txt
```

---

## Stack

| Layer | Choice | Why |
|---|---|---|
| **API** | FastAPI | Fast to build, familiar stack |
| **Database** | Cloud Firestore (Firebase) | Replaces Supabase from original spec; collections mirror `03_SCHEMA.md` 1:1 |
| **File storage** | Firebase Storage | Crop health photos |
| **Auth** | Firebase Authentication | RSK officer / admin dashboard login |
| **AI** — text/reasoning | Gemini API | Free tier, no GCP billing needed |
| **AI** — vision | Gemini Vision | Crop photo diagnosis |
| **AI** — grounding | Gemini `googleSearch` tool | Live weather/advisory context |
| **Voice/SMS** | Twilio | Outbound calls, DTMF gather, SMS fallback |
| **Live weather** | OpenWeatherMap | Dry-spell forecast (free tier) |
| **Frontend** (docs) | Vite + TypeScript | Planning doc viewer |
| **Frontend** (dashboard) | Vanilla JS (planned) | No build step, lightweight |

---

## Quick start

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

## Endpoints overview

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

## Data provenance

- **Static, real**: soil type, avg rainfall — sourced from AP govt district portal + CGWB reports
- **Live**: `forecast_dry_days` via OpenWeatherMap (free tier)
- **Simplified, labeled as such**: groundwater depth uses representative coastal-AP value (see `BWA/08_REAL_DATA_GUNTUR.md`)

---

## Demo flow (5-minute pitch)

1. **Trigger dry-spell alert** → real phone rings → advisory plays in Hindi → farmer presses 1 → logged on dashboard instantly
2. **Upload crop photo** → Gemini Diagnosis in ~10s → flagged on dashboard for RSK follow-up
3. **Show recommendation** with source data visible next to AI output ("rainfall X mm, soil type Y, groundwater Z m") — proves it's not a black box

---

## Planning documents

All product, architecture, and technical planning docs live in `BWA/`. Read in this order:

1. `01_PRD.md` — Problem, scope, user stories, rubric alignment
2. `02_ARCHITECTURE.md` — Stack decisions, system diagram, data flow
3. `03_SCHEMA.md` — Supabase/Firestore schema
4. `04_TASKS.md` — Hour-by-hour build tracker
5. `05_PITCH_OUTLINE.md` — 5-minute demo script
6. `06_PROMPTS.md` — Gemini prompt templates + anti-hallucination strategy
7. `07_API_SPEC.md` — FastAPI endpoint contracts
8. `08_REAL_DATA_GUNTUR.md` — Real district data (Guntur, AP)
9. `09_IMD_SOIL_CGWB_INTEGRATION.md` — Government data source integration guide
10. `10_VIBECODING_PROMPTS.md` — AI coding assistant prompts

Or browse them visually by running the frontend docs viewer:

```bash
cd frontend && npm run dev
```
