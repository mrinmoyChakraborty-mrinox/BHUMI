# BHUMI — Backend

FastAPI + Firebase backend implementing the full spec from the planning docs
(`00_README.md` → `09_IMD_SOIL_CGWB_INTEGRATION.md`). Firestore replaces the
Supabase/Postgres schema from `03_SCHEMA.md` — collection names mirror the
original table names 1:1 so the mapping is easy to follow.

## Stack
- **API**: FastAPI
- **DB**: Cloud Firestore (via `firebase-admin`)
- **File storage**: Firebase Storage (crop health photos)
- **Auth**: Firebase Authentication (RSK officer / admin dashboard login)
- **AI**: Gemini API (recommendation, advisory text, vision diagnosis) — direct HTTP, not the Anthropic SDK
- **Voice/SMS**: Twilio
- **Live weather**: OpenWeatherMap (dry-spell forecast)

## Project layout
```
app/
  main.py                 FastAPI app + router wiring
  config.py                Env var settings (pydantic-settings)
  firebase_client.py        Firebase Admin SDK init (Firestore/Storage/Auth)
  firestore_utils.py        Small doc-to-dict / 404 helpers
  auth.py                    Firebase ID token verification, admin gating
  schemas.py                  Pydantic request/response models
  services/
    gemini_service.py         3 Gemini prompts from 06_PROMPTS.md
    twilio_service.py          Outbound call + SMS + TwiML builders
    weather_service.py         OpenWeatherMap live forecast_dry_days
    rule_engine.py              Dry-spell trigger condition
  routers/
    districts.py    farmers.py       plots.py          wards.py
    recommendations.py               alerts.py
    twilio_webhooks.py               health_logs.py
    dashboard.py                     admin.py
scripts/
  seed_data.py     Seeds real Guntur data from 08_REAL_DATA_GUNTUR.md
firestore.rules     Locks down direct client Firestore access
requirements.txt
.env.example
```

## Firestore collections (mirrors 03_SCHEMA.md)
| Collection | Doc ID | Notes |
|---|---|---|
| `districts` | auto | name, state, notes |
| `ward_data` | `ward_id` slug (e.g. `guntur-ward-01`) | soil_type, avg_rainfall_mm, groundwater_depth_m, forecast_dry_days, lat/lon |
| `farmers` | auto | name, phone, preferred_language, ward_id |
| `plots` | auto | farmer_id, ward_id, soil_type, groundwater_depth_m, avg_rainfall_mm, current_crop, crop_stage |
| `recommendations` | auto | plot_id, recommended_crop, rationale, confidence, source_data (transparency snapshot) |
| `alerts` | auto | farmer_id, plot_id, alert_type, message_text, channel, status, farmer_response, call_sid |
| `health_logs` | auto | farmer_id, plot_id, image_url, diagnosis, confidence, recommended_action, escalate_to_rsk, status, rsk_notes |
| `rsk_officers` | Firebase Auth `uid` | name, ward_id, role (`rsk_officer` \| `admin`) |

## Setup

### 1. Firebase project
1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore**, **Storage**, and **Authentication** (Email/Password or whatever sign-in method your dashboard will use).
3. Project Settings → Service Accounts → **Generate new private key** → save as `firebase-service-account.json` in the project root (already gitignored — see below).
4. Deploy `firestore.rules`:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore   # point at this existing firestore.rules file
   firebase deploy --only firestore:rules
   ```

### 2. Environment
```bash
cp .env.example .env
# fill in: FIREBASE_STORAGE_BUCKET, GEMINI_API_KEY, TWILIO_*, OPENWEATHER_API_KEY, PUBLIC_BASE_URL
```

`PUBLIC_BASE_URL` must be a URL Twilio can reach for webhooks — use `ngrok http 8000` during local dev and put the ngrok URL here.

### 3. Install & run
```bash
python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger UI covering every endpoint below.

### 4. Seed real district data
```bash
python -m scripts.seed_data
```
This loads the real Guntur, AP data from `08_REAL_DATA_GUNTUR.md` (rainfall, soil types) plus two demo farmers/plots. **Replace the placeholder `+91XXXXXXXXXX` phone numbers with real, Twilio-verified numbers before your live demo** — Twilio trial accounts can only call/text verified numbers.

### 5. Twilio webhook config
No dashboard config needed — webhook URLs are passed dynamically per-call in `twilio_service.place_advisory_call()`. Just make sure `PUBLIC_BASE_URL` in `.env` is reachable from the public internet (ngrok or your deployed URL) before triggering a real call.

## Endpoint reference

### Public / farmer-facing (no auth)
| Method | Path | Purpose |
|---|---|---|
| POST | `/recommend` | Crop recommendation for a plot (Gemini + source data) |
| GET | `/recommend/{plot_id}/history` | Past recommendations for a plot |
| POST | `/alert/trigger` | Runs rule engine → Gemini advisory → Twilio call+SMS |
| POST | `/twilio/voice-response` | Twilio webhook: captures DTMF keypress |
| POST | `/twilio/sms-response` | Twilio webhook: captures inbound SMS reply |
| POST | `/health/log` | Upload crop photo → Gemini Vision diagnosis |
| GET | `/health/logs`, `/health/log/{id}` | Read health logs |
| GET/POST | `/farmers`, `/plots` | Farmer & plot registration (open by default — see note in `farmers.py`) |

### Dashboard (Firebase ID token required)
| Method | Path | Purpose |
|---|---|---|
| GET | `/dashboard/summary` | Stat-strip counts |
| GET | `/dashboard/farmers` | Farmer list + latest alert status |
| GET | `/dashboard/alerts` | Alerts with `ui_color` (red/yellow/green) |
| GET | `/dashboard/health-logs` | Flagged cases for RSK review |
| PATCH | `/health/log/{id}/resolve` | Mark a case resolved (admin) |

### Admin-only (Firebase custom claim `admin: true`, or listed in `ADMIN_BOOTSTRAP_UIDS`)
| Method | Path | Purpose |
|---|---|---|
| CRUD | `/districts`, `/wards`, `/admin/officers` | Full management |
| PATCH/DELETE | `/farmers/{id}`, `/plots/{id}`, `/alerts/{id}` | Edits/deletes on core entities |
| POST | `/wards/{ward_id}/refresh-forecast` | Pull live OpenWeatherMap dry-day forecast into a ward |

**Bootstrapping your first admin:** before any custom claims exist, add your Firebase Auth UID to `ADMIN_BOOTSTRAP_UIDS` in `.env` so you can call `POST /admin/officers` with `role: "admin"` once — that call sets the real custom claim going forward.

## Data provenance (for the pitch — see 08/09 docs)
- **Static, real**: soil type, avg rainfall — AP govt district portal + CGWB reports (seeded via `scripts/seed_data.py`)
- **Live**: `forecast_dry_days` via OpenWeatherMap — refresh with `POST /wards/{ward_id}/refresh-forecast` or wire to a cron job
- **Simplified, labeled as such**: groundwater depth uses a representative coastal-AP value rather than real-time station data (see `08_REAL_DATA_GUNTUR.md` for the honest caveat)

## Notes on the Firebase vs. Supabase swap
The original `02_ARCHITECTURE.md` / `03_SCHEMA.md` specced Supabase (Postgres + RLS). This build uses Firebase/Firestore instead per your stack choice — everything else (Gemini prompts, Twilio flow, rule engine, API shape) is unchanged from `07_API_SPEC.md`. Trade-offs to know:
- No SQL joins — the dashboard router does the farmer↔plot↔alert stitching in Python (see `dashboard.py`).
- No native row-level security — `firestore.rules` blocks all direct client access instead; every read/write goes through this FastAPI backend using the Admin SDK, which bypasses rules entirely.
- Firestore has no server-side foreign key constraints — `firestore_utils.get_or_404` is used everywhere a reference is dereferenced, to fail loudly instead of silently on bad IDs.

## Gitignore reminder
Make sure `.env` and `firebase-service-account.json` are in your `.gitignore` before pushing this anywhere — both contain live secrets.
