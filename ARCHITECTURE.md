# BHUMI — Architecture & Data Flow

## Overview

BHUMI is a full-stack agricultural advisory platform for Indian smallholder farmers. It combines AI (Gemini), voice/SMS (Twilio), live weather (OpenWeatherMap), and image hosting (ImageKit) with a Firebase/FastAPI backend and a React 19 + TypeScript + Tailwind frontend.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          FRONTEND (Vite + React 19)                     │
│                                                                         │
│  LandingPage  LoginPage  PublicHomePage  Dashboard/*  Admin/*          │
│       │            │            │              │          │             │
│       └────────────┴────────────┴──────────────┴──────────┘             │
│                              │                                          │
│                    api/client.ts (Bearer token injection)                │
│                              │                                          │
│                        AuthContext (Firebase onAuthStateChanged)         │
└──────────────────────────────┼──────────────────────────────────────────┘
                               │ HTTP / WebSocket
                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       BACKEND (FastAPI + Uvicorn)                        │
│                                                                         │
│  ┌──────────────┐  ┌──────────────────────────────────────────────┐     │
│  │  middleware   │  │  Router Layer (11 routers, rate-limited)      │     │
│  │  CORS         │  │                                              │     │
│  │  Security     │  │  Public (no auth)                            │     │
│  │  Rate Limiter │  │    /api/crop-recommendation                  │     │
│  │  Exception    │  │    /api/disease-detection     ──── ImageKit ─┤     │
│  │  Handler      │  │    /api/irrigation-advice                   │     │
│  └──────────────┘  │    /api/weather-advisory   ──── OpenWeather ─┤     │
│                    │    /api/chatbot (WebSocket) ──── Gemini ─────┼     │
│                    │    /farmers, /plots, /wards, /districts      │     │
│                    │    /health/log  ──── Gemini Vision ──────────┤     │
│                    │    /recommend  ──── Gemini ──────────────────┤     │
│                    │    /alerts, /alert/trigger                   │     │
│                    │    /twilio/voice-response (signature-valid.) │     │
│                    │    /twilio/sms-response (signature-valid.)   │     │
│                    │                                              │     │
│                    │  Dashboard (Firebase token required)         │     │
│                    │    /dashboard/me, /summary, /farmers,        │     │
│                    │    /dashboard/alerts, /health-logs           │     │
│                    │                                              │     │
│                    │  Admin (custom claim admin:true)             │     │
│                    │    /admin/officers, /districts CRUD          │     │
│                    │    /wards CRUD, PATCH/DELETE core entities    │     │
│                    └──────────────────────────────────────────────┘     │
│                               │                                        │
│  ┌────────────────────────────┴──────────────────────────────┐         │
│  │                    Service Layer                            │         │
│  │  ┌──────────────┐ ┌────────────┐ ┌──────────────────┐      │         │
│  │  │gemini_service│ │twilio_svc  │ │weather_service   │      │         │
│  │  │ (7 prompts,  │ │(call+SMS,  │ │(OWM forecast +   │      │         │
│  │  │  tenacity     │ │ TwiML,     │ │ current weather) │      │         │
│  │  │  retry 3×)   │ │ DTMF)      │ └──────────────────┘      │         │
│  │  └──────┬───────┘ └─────┬──────┘                          │         │
│  │  ┌──────┴───────┐ ┌─────┴──────┐ ┌──────────────────┐      │         │
│  │  │imagekit_svc  │ │geocoding   │ │rule_engine       │      │         │
│  │  │(upload to    │ │(Google Maps│ │(dry-spell check) │      │         │
│  │  │ ImageKit.io) │ │ district → │ └──────────────────┘      │         │
│  │  └──────────────┘ │ lat/lon)   │                          │         │
│  │                   └────────────┘                          │         │
│  └────────────────────────────────────────────────────────────┘         │
│                               │                                        │
│  ┌────────────────────────────┴──────────────────────────────┐         │
│  │                  Data Layer                                 │         │
│  │  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐    │         │
│  │  │  Firestore    │  │  Postgres/     │  │  Firebase    │    │         │
│  │  │  (primary)    │  │  Supabase      │  │  Auth        │    │         │
│  │  │  10 cols     │  │  (reference     │  │  (ID token   │    │         │
│  │  │              │  │   data only)    │  │  verify)     │    │         │
│  │  │  districts   │  │  districts      │  └──────────────┘    │         │
│  │  │  ward_data   │  │  ward_reference_│                      │         │
│  │  │  farmers     │  │  data           │                      │         │
│  │  │  plots       │  └────────────────┘                       │         │
│  │  │  recommendations               ┌──────────────┐          │         │
│  │  │  alerts       │  ─────────────>│  ImageKit.io │          │         │
│  │  │  health_logs  │  ─────────────>│  (images)    │          │         │
│  │  │  rsk_officers │                └──────────────┘          │         │
│  │  │  public_recommendations        ┌──────────────┐          │         │
│  │  │  portal_queries│  ────────────>│  Gemini API  │          │         │
│  │  └──────────────┘                └──────────────┘          │         │
│  └────────────────────────────────────────────────────────────┘         │
└─────────────────────────────────────────────────────────────────────────┘
                               │
                    ┌──────────┴───────────┐
                    ▼                      ▼
            ┌──────────────┐      ┌──────────────────┐
            │  Twilio      │      │  OpenWeatherMap   │
            │  (Voice/SMS) │      │  (Live weather)   │
            └──────────────┘      └──────────────────┘
```

---

## 1. Request Lifecycles

### 1a. Public Disease Detection (most complex public flow)

```
User uploads leaf photo
  │
  ▼
DiseaseDetection.tsx ── FileReader.readAsDataURL() ──► base64 data URL
  │
  ▼
POST /api/disease-detection  { imageBase64, mimeType, cropName, language }
  │  (rate-limited: 10/min per IP)
  ▼
public_portal.py:_decode_data_url()
  │  Validates MIME (JPEG/PNG/WebP) + size (≤8 MB)
  ▼
gemini_service.py:diagnose_crop_photo()
  │  base64 → inline_data → Gemini Vision API
  │  (tenacity retry 3× on 5xx/timeout)
  ▼  Returns { diagnosis, confidence, recommended_action, escalate_to_rsk }
  │
  ├── imagekit_service.py:upload_image() ──► ImageKit.io public URL
  │
  └── Firestore: health_logs { image_url, diagnosis, confidence, ... }
        │
        └── Dashboard RSK reviews → PATCH /health/log/{id}/resolve
```

### 1b. Alert Trigger Pipeline (RSK officer → farmer)

```
RSK officer clicks "Trigger Alert"
  │  (Firebase ID token required)
  ▼
POST /alert/trigger  { plot_id, alert_type, force? }
  │  (rate-limited: 5/min per IP, idempotent 30 min)
  ▼
alerts.py:
  ├── Idempotency check (same plot+type within 30 min → skip)
  ├── Firestore: get plot → get ward → get farmer
  ├── rule_engine:evaluate_alert_condition(forecast_dry_days, crop_stage)
  ├── gemini_service:get_advisory_message()  → short TTS text
  ├── twilio_service:make_call()  → Voice call with DTMF options
  ├── twilio_service:send_sms()   → SMS fallback
  └── Firestore: alerts { message_text, call_sid, sms_sid, status: "sent" }
        │
        └── Farmer presses "1" (irrigated) or "2" (callback)
              │
              ▼
            POST /twilio/voice-response?alert_id=...
              │  (Twilio signature validated)
              ▼
            twilio_webhooks.py → updates alert.status + farmer_response
```

### 1c. Chatbot (WebSocket)

```
User opens chatbot tab
  │
  ▼
WS /api/chatbot
  │  (per-connection: max 100 messages, 1s interval)
  ▼
public_portal.py: chatbot WebSocket handler
  │
  ├── Throttle check (rate-limit per connection)
  │
  └── gemini_service:get_chatbot_response(message, history, language, location)
        │  Sends system prompt + conversation history as contents array
        │  (no search grounding)
        ▼
      Streams back { type: "response", text } or { type: "error" }
```

### 1d. Weather Advisory Pipeline

```
User fills form: state, district, language
  │
  ▼
POST /api/weather-advisory
  │
  ▼
public_portal.py:
  ├── geocoding_service:geocode_district(district, state)
  │     Google Maps Geocoding → lat/lon
  │
  ├── weather_service:get_current_weather_metrics(lat, lon)
  │     OpenWeatherMap → temperature, humidity, wind_speed, soilMoisture, pestRiskIndex
  │     (tenacity retry 3×)
  │
  ├── gemini_service:get_weather_advisory(metrics, language)
  │     → plain text advisory bulletin
  │
  ├── Firestore: portal_queries { type: "weather", inputs, output, metrics }
  │
  └── Response: { success, advisory, metrics }
```

---

## 2. Authentication & Authorization

```
                   ┌─────────────────────────────┐
                   │  Firebase Authentication      │
                   │  (Phone OTP / Email+Password)  │
                   └──────────────┬──────────────┘
                                  │ ID token
                                  ▼
   ┌─────────────────────────────────────────────┐
   │  AuthContext (frontend)                       │
   │  onAuthStateChanged → fetchRole(token)        │
   │    → GET /dashboard/me                         │
   │      ├── RSK officer → role="rsk_officer"      │
   │      ├── Admin claim → role="admin"             │
   │      └── 404 + has phone → GET /farmers/by-phone│
   │            → role="farmer"                       │
   └─────────────────────────────────────────────┘

   ProtectedRoute component (frontend):
     requiredRole="admin"    → AdminLayout
     requiredRole="rsk_officer" → DashboardLayout (admin also passes)
     requiredRole="any"      → DashboardLayout (any authenticated)
     farmer user             → redirect /app

   Backend auth.py:
     get_current_user() → Bearer token → firebase_admin.auth.verify_id_token()
     require_admin()     → checks admin custom claim OR ADMIN_BOOTSTRAP_UIDS
```

### Route access matrix

| Route group | Frontend guard | Backend guard |
|-------------|---------------|---------------|
| `/` (landing) | none | none |
| `/app` (portal) | none | none |
| `/login` | none | none |
| `/dashboard/*` | `ProtectedRoute(any)` | `get_current_user()` |
| `/admin/*` | `ProtectedRoute(admin)` | `require_admin()` |
| `/alert/trigger` | none (JIT token) | `get_current_user()` |
| `/twilio/*` | — | `verify_twilio_webhook()` |

---

## 3. Data Storage Architecture

### Primary store: Firestore (10 collections)

```
districts          → name, state, notes
ward_data          → district_id, soil_type, avg_rainfall_mm, groundwater_depth_m,
                     forecast_dry_days, lat, lon (doc ID = human slug)
farmers            → name, phone (E.164), preferred_language, ward_id, state, district
plots              → farmer_id, ward_id, soil_type, current_crop, crop_stage
recommendations    → plot_id, recommended_crop, rationale, confidence, source_data
alerts             → farmer_id, plot_id, alert_type, message_text, channel, status,
                     farmer_response, call_sid, created_at, responded_at
health_logs        → farmer_id, plot_id, image_url, diagnosis, confidence,
                     recommended_action, escalate_to_rsk, status, crop_name, source
rsk_officers       → name, ward_id, role (doc ID = Firebase UID)
public_recommendations → n, p, k, soilType, ph, temperature, rainfall, state, language, recommendation
portal_queries     → type (irrigation|weather), inputs, output, metrics
```

### Reference store: Postgres / Supabase (2 tables)

```
districts              → id, name, state, notes, created_at
ward_reference_data    → district_code, soil_type, avg_rainfall_mm, groundwater_depth_m, source_notes

One-way sync: Postgres → Firestore via POST /wards/{id}/sync-reference-data
  Only fills null fields in the Firestore ward doc (preserving manual overrides)
```

### Media store: ImageKit.io

```
Image upload path: POST https://upload.imagekit.io/api/v1/files/upload
  Auth: HTTP Basic (IMAGEKIT_PRIVATE_KEY)
  Folder: /BHUMI/health_logs  or  /BHUMI/public_web
  Returns: public image URL (served via CDN at ik.imagekit.io)
```

---

## 4. Gemini AI Service Detail

All 7 prompts follow the **context-stuffing** pattern: code fetches the data, injects it into a prompt template, and the model reasons over exactly those values.

| Function | Input | Prompt style | Output |
|----------|-------|-------------|--------|
| `get_crop_recommendation` | ward/district/soil/rainfall/groundwater/crop/stage | Structured JSON instruction | `{ recommended_crop, rationale, confidence, data_gaps }` |
| `get_advisory_message` | crop, stage, dry_days, alert_type, language | Short TTS-optimized text | Plain text (≤3 sentences) |
| `diagnose_crop_photo` | image_bytes, mime_type, language, crop_name  | Vision: inline_data + JSON instruction | `{ diagnosis, confidence, recommended_action, escalate_to_rsk }` |
| `get_crop_recommendation_public` | N, P, K, soilType, pH, temp, rainfall, state, language | Plain text prompt | Plain text explanation |
| `get_irrigation_advice` | crop, soil, stage, water source, language | Plain text prompt | Plain text schedule |
| `get_weather_advisory` | temp, humidity, wind, soilMoisture, pestRisk, language | Structured metrics + text instruction | Plain text bulletin |
| `get_chatbot_response` | message, history, language, location | Conversational system prompt | Plain text response |

All calls go through `_call_gemini()`:
- Endpoint: `POST https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`
- Model: `gemini-2.0-flash` (configurable via `GEMINI_MODEL` env var)
- Retry: 3 attempts, exponential backoff (1–10s, `tenacity`), 5xx/timeout only
- Search grounding: available for `get_advisory_message` (off by default)

---

## 5. External API Dependencies

| Service | SDK / Method | Auth | Reliability | Cost |
|---------|-------------|------|-------------|------|
| **Firebase Auth** | `firebase-admin.auth` | Service account JSON | Google SLA | Free tier |
| **Firestore** | `firebase-admin.firestore` | Service account JSON | Google SLA | Pay-per-read/write |
| **Gemini** | REST HTTP + API key | `GEMINI_API_KEY` query param | tenacity 3× retry, 30s timeout | Pay-per-token |
| **Twilio** | `twilio` Python SDK | `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` | Webhook callback, retry on failure | Pay-per-call/SMS |
| **ImageKit** | REST HTTP + Basic Auth | `IMAGEKIT_PRIVATE_KEY` | No retry (best-effort), 30s timeout | Free tier (20 GB) |
| **OpenWeatherMap** | REST HTTP + API key | `OPENWEATHER_API_KEY` | tenacity 3× retry, 10s timeout | Free tier (1000/day) |
| **Google Maps Geocoding** | REST HTTP + API key | `GOOGLE_MAPS_API_KEY` | No retry, 10s timeout | Free tier ($200/mo credit) |
| **Postgres / Supabase** | `psycopg2` | `DATABASE_URL` connection string | Connection pooling via context manager | Per-plan |

---

## 6. Frontend Routing Map

```
/                          LandingPage (public, 4-language hero + features)
/login                     LoginPage (phone OTP / email + registration)
/app                       PublicHomePage (tabs: chat, crop rec, disease,
                            irrigation, weather, schemes, guide)
/unauthorized              UnauthorizedPage
/dashboard                 DashboardHome (stat strip + recent alerts/logs)
/dashboard/farmers         FarmersList
/dashboard/alerts          AlertsList
/dashboard/health-logs     HealthLogsList
/admin/districts           Districts CRUD
/admin/wards               Wards CRUD
/admin/officers            Officers CRUD
/admin/alerts              AlertsManage
*                          NotFoundPage
```

Layout structure:
```
PublicLayout (header + footer)       DashboardLayout (sidebar + outlet)
  ├── LandingPage                      ├── DashboardHome
  ├── LoginPage                        ├── FarmersList
  ├── PublicHomePage                   ├── AlertsList
  ├── UnauthorizedPage                 └── HealthLogsList
  └── NotFoundPage
```

---

## 7. Farmer Login & Registration Flow

```
                          ┌──────────────────────┐
                          │  /login               │
                          │  Phone OTP Tab         │
                          └──────────┬───────────┘
                                     │ Enter phone number
                                     ▼
                          SignInWithPhoneNumber (Firebase)
                                     │ OTP sent
                                     ▼
                          6-digit code confirmation
                                     │
                                     ▼
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
           GET /farmers/by-phone              Registration form
           Found?                              (name, email, language,
                    │                           password, state, district,
                    │                           crop, soil type)
                    │ Yes                              │
                    ▼                                  ▼
           Redirect /app              createUserWithEmailAndPassword
                                               │
                                               ▼
                                      POST /farmers  (Firestore)
                                               │
                                               ▼
                                      POST /plots  (Firestore, try/catch)
                                               │
                                               ▼
                                      Redirect /app
```

---

## 8. Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Firestore over Postgres for operational data** | Serverless, scales to zero, familiar to Firebase devs. Postgres kept only for reference/seed data |
| **ImageKit over Firebase Storage** | ImageKit provides CDN, transformations, and lighter SDK. All uploads proxied through backend (never client-side) |
| **Context-stuffing over RAG** | Predictable cost/latency per call. No vector DB, no embedding pipeline, no chunking. Model sees exactly the data we picked |
| **Base64 images over multipart for public portal** | Simpler client code (JSON body, no FormData). Health log multipart kept for RSK dashboard |
| **WebSocket for chatbot** | Real-time multi-turn conversation without polling. Server-side rate-guarded per connection |
| **Twilio DTMF over SMS for responses** | Voice is more accessible for low-literacy farmers. DTMF digits are simpler than composing SMS text |
| **Idempotent alert triggers** | Prevents double-charging Twilio calls when RSK officer double-clicks or network retries |
| **Admin bootstrap UIDs** | Escape hatch to create first admin without running a script. Comma-separated UIDs in `.env` |
| **Phone OTP + email dual auth** | Farmers authenticate via phone (OTP), RSK officers via email/password. Both share the same Firebase Auth backend |
| **farmerId/farmerProfile in AuthContext** | Allows the frontend to check farmer registration status immediately after login without extra API call |

---

## 9. Backend File Dependency Graph

```
main.py
  ├── routers/districts.py            → reference_data_service (Postgres)
  ├── routers/wards.py                → reference_data_service, weather_service
  ├── routers/farmers.py              → db (Firestore)
  ├── routers/plots.py                → db
  ├── routers/recommendations.py      → db, gemini_service
  ├── routers/alerts.py               → db, gemini_service, twilio_service, rule_engine
  ├── routers/twilio_webhooks.py      → twilio_service (validator only)
  ├── routers/health_logs.py          → db, gemini_service, imagekit_service
  ├── routers/dashboard.py            → db
  ├── routers/admin.py                → db, auth
  └── routers/public_portal.py        → db, gemini_service, imagekit_service, geocoding_service, weather_service
        │
        └── services/
              ├── gemini_service.py   → config (api key)
              ├── twilio_service.py   → config
              ├── weather_service.py  → config
              ├── geocoding_service.py → config
              ├── imagekit_service.py → config, requests
              └── rule_engine.py      → (pure logic, no deps)
```

---

## 10. Security Layers

```
┌──────────── Layer 1: Network ──────────────┐
│  CORS whitelist (configurable origins)      │
│  Security headers (HSTS, X-Frame, etc.)     │
│  Proxy trust mode (X-Forwarded-For)         │
└─────────────────────────────────────────────┘
┌──────────── Layer 2: Rate Limiting ─────────┐
│  slowapi per-IP on paid/AI endpoints:       │
│    5/min  POST /alert/trigger               │
│   10/min  POST /health/log                  │
│   10/min  POST /api/*                       │
│   30/min  default                           │
│  Chatbot: 100 msg/conn, 1s interval          │
└─────────────────────────────────────────────┘
┌──────────── Layer 3: Authentication ────────┐
│  Firebase ID token (Bearer header)           │
│  Twilio webhook signature (X-Twilio-Signature)│
│  Postgres connection via DATABASE_URL only    │
└─────────────────────────────────────────────┘
┌──────────── Layer 4: Authorization ─────────┐
│  admin custom claim → full CRUD access       │
│  ADMIN_BOOTSTRAP_UIDS → escape hatch         │
│  Any authenticated user → dashboard read     │
└─────────────────────────────────────────────┘
┌──────────── Layer 5: Input Validation ──────┐
│  E.164 phone (phonenumbers library)          │
│  Image MIME type whitelist (JPEG/PNG/WebP)   │
│  Image size cap (8 MB)                       │
│  Pydantic field validators everywhere        │
│  404 on missing Firestore docs               │
└─────────────────────────────────────────────┘
┌──────────── Layer 6: Idempotency ───────────┐
│  Alert trigger: 30-min dedup per plot+type   │
│  force=true override via RSK                  │
└─────────────────────────────────────────────┘
┌──────────── Layer 7: Firestore Rules ───────┐
│  All client direct access BLOCKED            │
│  Every read/write goes through FastAPI       │
│  via Admin SDK (bypasses all Firestore rules) │
└─────────────────────────────────────────────┘
```

---

## 11. Development Setup

```
Frontend (Vite, port 3000)          Backend (FastAPI, port 8000)
┌──────────────────────┐            ┌────────────────────────────┐
│  npm run dev          │            │  uvicorn app.main:app      │
│  Vite dev server      │  /api ──►  │  --reload --port 8000     │
│  Proxy: /api → :8000  │            │  Swagger: /docs            │
└──────────────────────┘            └────────────────────────────┘

Docker:
  docker build -t bhumi-backend .
  docker run -p 8000:8000 --env-file .env bhumi-backend
```

Required env vars in `.env`:
- `IMAGEKIT_PRIVATE_KEY` — ImageKit.io API key
- `GEMINI_API_KEY` — Google AI Studio API key
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER` — Twilio credentials
- `OPENWEATHER_API_KEY` — OpenWeatherMap API key
- `FIREBASE_SERVICE_ACCOUNT_PATH` — path to Firebase service account JSON
- `PUBLIC_BASE_URL` — public URL (ngrok for local dev)
- `DATABASE_URL` — Postgres connection string (optional, for reference data)
- `GOOGLE_MAPS_API_KEY` — Google Maps Geocoding (optional, for weather advisory)
