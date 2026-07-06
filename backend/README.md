# BHUMI — Backend

FastAPI + Firebase backend implementing the full spec from the planning docs.
Firestore replaces the Supabase/Postgres schema — collection names mirror the
original table names 1:1 so the mapping is easy to follow.

## Stack
- **API**: FastAPI
- **DB**: Cloud Firestore (via `firebase-admin`)
- **File storage**: Firebase Storage (crop health photos)
- **Auth**: Firebase Authentication (RSK officer / admin dashboard login)
- **AI**: Gemini API (recommendation, advisory text, vision diagnosis) — direct HTTP
- **Voice/SMS**: Twilio (with webhook signature validation)
- **Live weather**: OpenWeatherMap (dry-spell forecast), with IMD via data.gov.in as production alternative
- **Rate limiting**: `slowapi` (per-IP, configurable limits on paid endpoints)
- **Phone validation**: `phonenumbers` (E.164 format enforced on farmer creation)

## Project layout
```
app/
  main.py                 FastAPI app + logging + global exception handler + healthz
  config.py               Env var settings (pydantic-settings)
  firebase_client.py       Firebase Admin SDK init (Firestore/Storage/Auth)
  firestore_utils.py       Small doc-to-dict / 404 helpers
  auth.py                  Firebase ID token verification, admin gating
  schemas.py               Pydantic request/response models + E.164 phone validator
  routers/
    deps.py                Shared deps: Twilio signature validation, rate limiter
    districts.py    farmers.py       plots.py          wards.py
    recommendations.py               alerts.py
    twilio_webhooks.py               health_logs.py
    dashboard.py                     admin.py
  services/
    gemini_service.py      3 Gemini prompts with exponential-backoff retry
    twilio_service.py       Outbound call + SMS + TwiML builders
    weather_service.py      OpenWeatherMap with exponential-backoff retry
    rule_engine.py          Dry-spell trigger condition
scripts/
  seed_data.py             Seeds real Guntur data
  create_admin_user.py     One-shot admin user creation (Firebase Auth + Firestore profile)
tests/
  test_rule_engine.py      Unit tests for rule engine (pure logic)
  test_gemini_service.py   Unit tests for Gemini client (mocked HTTP)
  test_twilio_service.py   Unit tests for TwiML builders (assert on XML)
firestore.rules            Locks down direct client Firestore access
firestore.indexes.json     Composite indexes for production queries
Dockerfile                 Multi-stage build, non-root user
.dockerignore
requirements.txt
.env.example
```

## Firestore collections (mirrors 03_SCHEMA.md)
| Collection | Doc ID | Notes |
|---|---|---|
| `districts` | auto | name, state, notes |
| `ward_data` | `ward_id` slug (e.g. `guntur-ward-01`) | soil_type, avg_rainfall_mm, groundwater_depth_m, forecast_dry_days, lat/lon |
| `farmers` | auto | name, phone (E.164), preferred_language, ward_id |
| `plots` | auto | farmer_id, ward_id, soil_type, current_crop, crop_stage |
| `recommendations` | auto | plot_id, recommended_crop, rationale, confidence, source_data |
| `alerts` | auto | farmer_id, plot_id, alert_type, message_text, channel, status, farmer_response, call_sid |
| `health_logs` | auto | farmer_id, plot_id, image_url, diagnosis, confidence, recommended_action, status |
| `rsk_officers` | Firebase Auth `uid` | name, ward_id, role (`rsk_officer` \| `admin`) |

## Setup

### 1. Firebase project
1. Create a project in the [Firebase Console](https://console.firebase.google.com).
2. Enable **Firestore**, **Storage**, and **Authentication**.
3. Project Settings → Service Accounts → **Generate new private key** → save as `firebase-service-account.json`.
4. Deploy `firestore.rules`:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init firestore
   firebase deploy --only firestore:rules
   ```
5. Deploy `firestore.indexes.json` (required for production queries):
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 2. Environment
```bash
cp .env.example .env
# fill in: FIREBASE_STORAGE_BUCKET, GEMINI_API_KEY, TWILIO_*, OPENWEATHER_API_KEY, PUBLIC_BASE_URL
```

`PUBLIC_BASE_URL` must be a URL Twilio can reach for webhooks — use `ngrok http 8000` during local dev.

### 3. Install & run
```bash
python -m venv venv && source venv/bin/activate     # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for interactive Swagger UI.

### 4. Seed real district data
```bash
python -m scripts.seed_data
```
This loads the real Guntur, AP data plus two demo farmers/plots. **Replace `+91XXXXXXXXXX` phone numbers with real Twilio-verified numbers before demo.**

### 5. Create your first admin user
```bash
python -m scripts.create_admin_user --email admin@example.com --password yourpassword --name "Admin"
```
This creates the Firebase Auth user, sets the admin custom claim, and creates the Firestore profile in one step.

### 6. Twilio webhook config
No dashboard config needed — webhook URLs are passed dynamically per-call. Webhook endpoints validate `X-Twilio-Signature` using your `TWILIO_AUTH_TOKEN` and reject unauthenticated requests with 403. Just make sure `PUBLIC_BASE_URL` is reachable from the internet.

## Run tests
```bash
pip install pytest pytest-mock
python -m pytest tests/ -v --tb=short
```

## Docker
```bash
docker build -t kisan-alert-backend .
docker run -p 8000:8000 --env-file .env kisan-alert-backend
```

## Endpoint reference

### Public / farmer-facing (no auth)
| Method | Path | Purpose |
|---|---|---|
| POST | `/recommend` | Crop recommendation (Gemini + source data) |
| GET | `/recommend/{plot_id}/history` | Past recommendations for a plot (paginated) |
| POST | `/alert/trigger` | 🔐 **Firebase auth required** — runs rule engine → Gemini advisory → Twilio call+SMS. Rate-limited (5/min per IP). Idempotent within 30 min window (use `force=true` to override). |
| POST | `/twilio/voice-response` | Twilio webhook — DTMF keypress capture (signature validated) |
| POST | `/twilio/sms-response` | Twilio webhook — inbound SMS capture (signature validated) |
| POST | `/health/log` | Upload crop photo → Gemini Vision diagnosis. Rate-limited (10/min per IP). Max image size 8 MB. |
| GET | `/health/logs`, `/health/log/{id}` | Read health logs (paginated) |
| GET/POST | `/farmers`, `/plots` | Farmer & plot registration (paginated). Phone must be E.164 format. |

### Dashboard (Firebase ID token required)
| Method | Path | Purpose |
|---|---|---|
| GET | `/dashboard/me` | Self-service whoami — returns calling user's officer profile |
| GET | `/dashboard/summary` | Stat-strip counts |
| GET | `/dashboard/farmers` | Farmer list + latest alert status (capped at 100) |
| GET | `/dashboard/alerts` | Alerts with `ui_color` (red/yellow/green, capped at 100) |
| GET | `/dashboard/health-logs` | Flagged cases for RSK review (capped at 100) |
| PATCH | `/health/log/{id}/resolve` | Mark a case resolved (admin) |

### Admin-only (Firebase custom claim `admin: true`)
| Method | Path | Purpose |
|---|---|---|
| CRUD | `/districts`, `/wards`, `/admin/officers` | Full management |
| PATCH/DELETE | `/farmers/{id}`, `/plots/{id}`, `/alerts/{id}` | Edits/deletes on core entities |
| POST | `/wards/{ward_id}/refresh-forecast` | Pull live OpenWeatherMap dry-day forecast |
| GET | `/farmers/{farmer_id}/timeline` | Merged alert + health-log + recommendation history for a farmer |

**Bootstrapping your first admin:** Use `scripts/create_admin_user.py` (see Setup step 5). Alternatively, add a Firebase Auth UID to `ADMIN_BOOTSTRAP_UIDS` in `.env` and call `POST /admin/officers` with `role: "admin"`.

### Pagination
List endpoints return `{"items": [...], "next_cursor": "doc_id"}`. Pass `limit` (default 50, max 200) and `start_after` (doc ID from previous page) to paginate.

## Security features added
- **Twilio webhook signature validation** — every `/twilio/*` request is verified against `X-Twilio-Signature` header; rejects non-Twilio requests with 403
- **Rate limiting** — paid endpoints (`/alert/trigger`, `/health/log`) are per-IP rate-limited (configurable via `RATE_LIMIT_*` env vars)
- **Auth on paid endpoints** — `/alert/trigger` requires a valid Firebase ID token (any RSK officer or admin can trigger)
- **E.164 phone validation** — `FarmerCreate.phone` rejects malformed numbers at the API boundary
- **Image size limit** — 8 MB max on photo upload (returns 413 if exceeded)
- **CORS tightened** — only `GET`, `POST`, `PATCH`, `DELETE`, `OPTIONS`; only allowed headers are `Authorization`, `Content-Type`, `X-Twilio-Signature`
- **Idempotency** — duplicate `/alert/trigger` calls for the same plot+type within 30 minutes are silently skipped (use `force=true` to override)

## External API reliability
- All external calls (Gemini, OpenWeatherMap) use **exponential-backoff retry** via `tenacity` (3 attempts, 1-10s backoff) for 5xx/timeout errors
- Non-retryable errors (4xx, auth failures) surface immediately as 502/504

## Known gaps
- **Telugu TTS**: Twilio has no native Telugu voice. The code falls back to `en-IN` (Indian English accent) for language code `te`. If this undercuts the accessibility story, consider swapping TTS providers or using a pre-recorded audio file for Telugu messages on critical alerts.
- **Weather source**: OpenWeatherMap is used for hackathon speed. For production in India, swap to **IMD API** (`api.imd.gov.in`) or IMD data proxied through `data.gov.in` — see the planning docs for integration notes. No architecture changes needed.

## Data provenance (for the pitch)
- **Static, real**: soil type, avg rainfall — AP govt district portal + CGWB reports (seeded via `scripts/seed_data.py`)
- **Live**: `forecast_dry_days` via OpenWeatherMap — refresh with `POST /wards/{ward_id}/refresh-forecast` or wire to a cron job
- **Simplified, labeled as such**: groundwater depth uses a representative coastal-AP value rather than real-time station data

## Notes on the Firebase vs. Supabase swap
The original architecture specced Supabase (Postgres + RLS). This build uses Firebase/Firestore instead — everything else (Gemini prompts, Twilio flow, rule engine, API shape) is unchanged. Trade-offs:
- No SQL joins — the dashboard router does the farmer↔plot↔alert stitching in Python
- No native row-level security — `firestore.rules` blocks all direct client access; every read/write goes through this FastAPI backend using the Admin SDK
- Firestore has no server-side foreign key constraints — `firestore_utils.get_or_404` fails loudly instead of silently

## Gitignore reminder
`.env` and `firebase-service-account.json` are in `.gitignore` — both contain live secrets.
