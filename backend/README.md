# BHUMI — Backend

FastAPI + Firebase backend powering BHUMI's AI-driven crop advisory, disease detection, and alert system for smallholder farmers. Firestore replaces the original Supabase/Postgres schema — collection names mirror the original table names 1:1.

## Stack

| Layer | Technology |
|-------|-----------|
| **API framework** | FastAPI (async, auto-docs at `/docs`) |
| **Database** | Cloud Firestore via `firebase-admin` Python SDK |
| **Auth** | Firebase Authentication (ID token verification for RSK/admin) |
| **Image storage** | ImageKit (crop health photos) |
| **AI / LLM** | Gemini API (recommendation, advisory text, vision diagnosis) |
| **Voice / SMS** | Twilio (outbound calls + SMS with webhook signature validation) |
| **Weather** | OpenWeatherMap (forecast for dry-spell detection) |
| **Geocoding** | Google Maps Geocoding API (district → lat/lon) |
| **Rate limiting** | `slowapi` (per-IP, configurable limits on paid endpoints) |
| **Phone validation** | `phonenumbers` (E.164 enforcement on farmer creation) |
| **Retry / resilience** | `tenacity` (exponential backoff on Gemini, OWM calls) |
| **Config** | `pydantic-settings` (`.env` → `Settings` dataclass) |
| **Serialization** | Pydantic v2 (request/response models, field validators) |
| **Container** | Docker multi-stage build (non-root, slim image) |

## Project layout

```
app/
  main.py                 FastAPI app — lifespan, CORS, exception handler, /healthz
  config.py               pydantic-settings: all env vars (Firebase, ImageKit, Gemini, Twilio, etc.)
  firebase_client.py      Firebase Admin SDK init — Firestore client + Auth (no Storage)
  firestore_utils.py      doc_to_dict(), get_or_404() helpers
  auth.py                 Firebase ID token verification + admin claim gating
  schemas.py              Pydantic models: District, Ward, Farmer, Plot, Recommendation,
                          Alert, HealthLog, Officer + E.164 phone validator
  routers/
    __init__.py
    deps.py               Shared dependencies: rate limiter, Twilio signature validation
    districts.py           CRUD for district reference data
    wards.py               CRUD + /{ward_id}/refresh-forecast (live OWM dry-days)
    farmers.py             CRUD + /by-phone/{phone} lookup + /{farmer_id}/timeline
    plots.py               CRUD for farmer plots
    recommendations.py     POST /recommend (Gemini) + history listing
    alerts.py              POST /alert/trigger (rule engine → Gemini → Twilio) + CRUD
    health_logs.py         POST /health/log (image upload → Gemini Vision → Firestore)
    twilio_webhooks.py     POST /voice-response, /sms-response (signature-validated)
    dashboard.py           RSK officer dashboard endpoints (me, summary, farmers, alerts, health-logs)
    admin.py               RSK officer profile management (CRUD)
    public_portal.py       Public /api/* endpoints + /api/chatbot WebSocket
  services/
    __init__.py
    gemini_service.py      6 Gemini prompt functions with tenacity retry (3 attempts)
    twilio_service.py       Outbound call + SMS + TwiML per-language builders
    weather_service.py      OpenWeatherMap forecast + current-weather with tenacity retry
    geocoding_service.py    Google Maps Geocoding API (district → lat/lon)
    rule_engine.py          Dry-spell trigger condition logic
    imagekit_service.py     ImageKit.io upload wrapper (REST API, Basic Auth)
scripts/
  seed_data.py             Seeds real Guntur district + ward + 2 demo farmers/plots
  create_admin_user.py     One-shot: Firebase Auth user + admin claim + Firestore profile
tests/
  test_rule_engine.py      Unit tests (pure logic, no deps)
  test_gemini_service.py   Unit tests (mocked HTTP)
  test_twilio_service.py   Unit tests (TwiML assertion)
firestore.rules            Blocks direct client Firestore access
firestore.indexes.json     Composite indexes for production query performance
Dockerfile                 Multi-stage, non-root
.dockerignore
requirements.txt           Python dependencies
.env.example               All config keys with defaults/instructions
```

## Firestore collections

| Collection | Doc ID | Key fields |
|-----------|--------|-----------|
| `districts` | auto | `name`, `state`, `notes` |
| `ward_data` | slug (e.g. `guntur-ward-01`) | `district_id`, `soil_type`, `avg_rainfall_mm`, `groundwater_depth_m`, `forecast_dry_days`, `lat`, `lon` |
| `farmers` | auto | `name`, `phone` (E.164), `preferred_language`, `ward_id`, `state`, `district` |
| `plots` | auto | `farmer_id`, `ward_id`, `soil_type`, `current_crop`, `crop_stage` |
| `recommendations` | auto | `plot_id`, `recommended_crop`, `rationale`, `confidence`, `source_data` |
| `alerts` | auto | `farmer_id`, `plot_id`, `alert_type`, `message_text`, `channel`, `status`, `farmer_response`, `call_sid` |
| `health_logs` | auto | `farmer_id`, `plot_id`, `image_url`, `diagnosis`, `confidence`, `recommended_action`, `status`, `crop_name`, `source` |
| `rsk_officers` | Firebase Auth UID | `name`, `ward_id`, `role` (`rsk_officer` / `admin`) |
| `public_recommendations` | auto | `n`, `p`, `k`, `soilType`, `ph`, `temperature`, `rainfall`, `state`, `language`, `recommendation` |
| `portal_queries` | auto | `type` (irrigation/weather), `inputs`, `output`, `metrics` |

## Endpoints

### Public — no auth (rate-limited)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | Service info |
| GET | `/healthz` | Health check + external service config status |
| POST | `/farmers` | Create farmer (E.164 phone validation) |
| GET | `/farmers`, `/farmers/{id}` | List / get farmer |
| GET | `/farmers/by-phone/{phone}` | Lookup farmer by phone number |
| GET | `/farmers/{id}/timeline` | Merged alert + health-log + recommendation timeline |
| POST | `/plots` | Create plot |
| GET | `/plots`, `/plots/{id}` | List / get plot |
| POST | `/recommend` | Gemini crop recommendation for a plot |
| GET | `/recommend/{plot_id}/history` | Past recommendations |
| POST | `/health/log` | Upload crop photo (multipart) → Gemini Vision → store result |
| GET | `/health/logs`, `/health/log/{id}` | List / get health logs |
| POST | `/api/crop-recommendation` | Standalone Gemini crop rec (N, P, K, soilType, pH, temp, rainfall) |
| POST | `/api/disease-detection` | Base64 image → Gemini Vision diagnosis |
| POST | `/api/irrigation-advice` | Gemini irrigation scheduling advice |
| POST | `/api/weather-advisory` | Gemini weather bulletin (fetches live OWM metrics) |
| WS | `/api/chatbot` | WebSocket — multi-turn Gemini chat with optional weather fetch |
| GET | `/wards`, `/wards/{id}` | List / get ward data |
| POST | `/wards/{id}/refresh-forecast` | Pull live OWM 5-day forecast → update `forecast_dry_days` |
| POST | `/alerts`, `/alerts/{id}` | List / get alerts |
| POST | `/alert/trigger` | 🔐 **Firebase auth required** — rule engine → Gemini → Twilio call+SMS |

### Twilio webhooks (signature-validated)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/twilio/voice-response` | DTMF keypress capture from farmer |
| POST | `/twilio/sms-response` | Inbound SMS capture |

### RSK Dashboard (Firebase ID token required)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/dashboard/me` | Whoami — returns calling officer profile |
| GET | `/dashboard/summary` | Stat-strip: farmer count, active alerts, flagged health cases, ward count |
| GET | `/dashboard/farmers` | Farmer list with latest alert status (capped at 100) |
| GET | `/dashboard/alerts` | Alerts with `ui_color` (red/yellow/green, capped at 100) |
| GET | `/dashboard/health-logs` | Flagged cases for RSK review (capped at 100) |
| PATCH | `/health/log/{id}/resolve` | Mark a case resolved (adds RSK notes) |

### Admin (Firebase custom claim `admin: true`)

| Method | Path | Purpose |
|--------|------|---------|
| CRUD | `/districts` | Manage district reference data |
| CRUD | `/wards` | Manage ward reference data |
| CRUD | `/admin/officers` | Manage RSK officer profiles |
| PATCH/DELETE | `/farmers/{id}`, `/plots/{id}`, `/alerts/{id}` | Edit/delete core entities |
| POST | `/admin/officers` + `ADMIN_BOOTSTRAP_UIDS` | Bootstrap first admin |

### Pagination

List endpoints return `{"items": [...], "next_cursor": "doc_id"}`. Query params: `limit` (default 50, max 200), `start_after` (doc ID from previous page).

## Architecture

### Image upload flow (ImageKit)

```
Farmer/User uploads photo
  → Frontend: FileReader.readAsDataURL → base64 data URL
  → Backend (public_portal.py / health_logs.py):
      → Validates MIME type (JPEG/PNG/WebP) & size (≤8 MB)
      → Gemini Vision diagnosis (base64 → inline_data)
      → imagekit_service.upload_image() → ImageKit REST API
      → ImageKit returns public URL → stored in Firestore health_logs.image_url
```

ImageKit upload uses HTTP Basic Auth with `IMAGEKIT_PRIVATE_KEY`, stores files under the `/BHUMI/` folder. Returns `None` (non-fatal) if ImageKit credentials are missing — the Gemini diagnosis still runs.

### Gemini AI pipeline

All AI calls follow a **context-stuffing** pattern (no RAG, no vector DB, no dynamic queries):
1. Receive request → hardcoded Firestore query for known data
2. Code explicitly extracts relevant fields
3. Construct prompt with injected values + "use only the data below" instruction
4. Send to Gemini (`diagnose_crop_photo`, `get_crop_recommendation`, `get_advisory_message`, etc.)
5. Parse JSON/text response → store in Firestore + return to caller

Retry policy (via `tenacity`): 3 attempts with exponential backoff (1–10 s) on 5xx/timeout; 4xx/auth failures surface immediately as 502/504.

### Alert pipeline

```
POST /alert/trigger (Firebase auth required)
  → rule_engine.should_trigger_dry_spell_alert(forecast_dry_days, crop_stage)
  → gemini_service.get_advisory_message() → short TTS-optimized text
  → twilio_service.make_call() + send_sms()
  → Firestore: alerts document created with status="sent"
  → Twilio webhook captures farmer DTMF/SMS response
```

Rate-limited to 5/min per IP. Idempotent within 30-minute window (same plot+type) — use `force=true` to override.

## Setup

### 1. Firebase project

1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore** and **Authentication** (Email/Password + Phone).
3. Project Settings → Service Accounts → **Generate new private key** → save as `firebase-service-account.json`.
4. Deploy security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```
5. Deploy composite indexes (required for production queries):
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 2. ImageKit

1. Create an account at [ImageKit.io](https://imagekit.io).
2. Go to Developer → API Keys and copy **Private Key** and **Public Key**.
3. Set `IMAGEKIT_PRIVATE_KEY` and `IMAGEKIT_PUBLIC_KEY` in `.env`.

### 3. Environment

```bash
cp .env.example .env
# fill in: IMAGEKIT_PRIVATE_KEY, GEMINI_API_KEY, TWILIO_*, OPENWEATHER_API_KEY, PUBLIC_BASE_URL
```

`PUBLIC_BASE_URL` must be a URL Twilio can reach for webhooks — use `ngrok http 8000` during local dev.

### 4. Install & run

```bash
python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger UI.

### 5. Seed district data

```bash
python -m scripts.seed_data
```

Loads real Guntur, AP data (2 wards) + 2 demo farmers/plots. **Replace `+91XXXXXXXXXX` phone numbers with real Twilio-verified numbers before demo.**

### 6. Create your first admin user

```bash
python -m scripts.create_admin_user --email admin@example.com --password yourpassword --name "Admin"
```

Creates Firebase Auth user, sets admin custom claim, and creates Firestore profile in one step.

### 7. Twilio webhook config

No dashboard config needed — webhook URLs are passed dynamically per-call. All `/twilio/*` endpoints validate `X-Twilio-Signature` using `TWILIO_AUTH_TOKEN` and reject unauthenticated requests with 403. Ensure `PUBLIC_BASE_URL` is internet-reachable.

## Run tests

```bash
pip install pytest pytest-mock
python -m pytest tests/ -v --tb=short
```

## Docker

```bash
docker build -t bhumi-backend .
docker run -p 8000:8000 --env-file .env bhumi-backend
```

## Deploy to Render (Python builder)

1. Push the repo to GitHub
2. Render dashboard → **New Web Service** → connect your repo
3. Settings:
   - **Runtime**: `Python` (native Python builder)
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: `backend` (if your repo has a monorepo structure)
   - **Health Check Path**: `/healthz`
4. Add all env vars from `.env.example` as **Environment Variables**
   - Upload `firebase-service-account.json` as a **Secret File** → set `FIREBASE_SERVICE_ACCOUNT_PATH` to its Render path

## Security

- **Twilio webhook signature validation** — every `/twilio/*` request verified against `X-Twilio-Signature` header; non-Twilio requests rejected with 403
- **Rate limiting** — paid endpoints (`/alert/trigger`, `/health/log`, `/api/*`) per-IP rate-limited via `RATE_LIMIT_*` env vars
- **Auth on paid endpoints** — `/alert/trigger` requires valid Firebase ID token
- **E.164 phone validation** — `FarmerCreate.phone` validated via `phonenumbers` library
- **Image size limit** — 8 MB max (returns 400 if exceeded)
- **CORS tightened** — only `GET/POST/PATCH/DELETE/OPTIONS`; allowed headers: `Authorization`, `Content-Type`, `X-Twilio-Signature`
- **Idempotency** — duplicate `/alert/trigger` for same plot+type within 30 min silently skipped (use `force=true` to override)

## Known gaps

- **Telugu TTS**: Twilio has no native Telugu voice; falls back to `en-IN` (Indian English) for language code `te`
- **Weather source**: OpenWeatherMap used for prototyping. Production should swap to **IMD API** (`api.imd.gov.in`) or data.gov.in proxy
- **Groundwater depth**: Uses a representative coastal-AP value rather than real-time station data

## Data provenance

| Data | Source | Freshness |
|------|--------|-----------|
| District info | AP govt district portal | Static (seeded) |
| Soil type, avg rainfall | CGWB reports + AP govt | Static (seeded) |
| Forecast dry days | OpenWeatherMap 5-day | Live (on refresh) |
| Groundwater depth | Representative coastal-AP value | Static (labeled) |
| Farmer/plot data | User registration | Live |
