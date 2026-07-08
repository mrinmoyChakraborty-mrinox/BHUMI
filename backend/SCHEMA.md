# BHUMI — Complete Schema Reference

> Generated from the full backend codebase. Covers every data shape across every layer: environment config, Pydantic schemas, Firestore documents, Gemini prompts, external API shapes, endpoint contracts, internal constants, and access control.

---

## 1. Environment Configuration (`app/config.py:Settings`)

```python
class Settings:
    # Firebase
    firebase_service_account_path: str = "./firebase-service-account.json"

    # ImageKit
    imagekit_private_key: str = ""
    imagekit_public_key: str = ""
    imagekit_url_endpoint: str = "https://ik.imagekit.io/RemediRX/BHUMI"

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    public_base_url: str = "http://localhost:8000"  # ngrok/prod URL for webhooks

    # Weather
    openweather_api_key: str = ""

    # Google Maps
    google_maps_api_key: str = ""

    # App
    env: str = "development"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    admin_bootstrap_uids: str = ""  # comma-separated

    # Rate limiting
    rate_limit_default: str = "30/minute"
    rate_limit_alert_trigger: str = "5/minute"
    rate_limit_health_log: str = "10/minute"
    rate_limit_public_portal: str = "10/minute"

    # Idempotency
    idempotency_window_minutes: int = 30

    # Upload limits
    max_image_size_mb: int = 8

    # Computed properties
    @property cors_origin_list -> list[str]
    @property admin_bootstrap_uid_list -> list[str]
    @property max_image_size_bytes -> int
```

---

## 2. Pydantic Schemas (`app/schemas.py`)

### 2a. Districts

```python
class DistrictCreate(BaseModel):
    name: str
    state: str = "Andhra Pradesh"
    notes: str | None = None

class DistrictUpdate(BaseModel):
    name: str | None = None
    state: str | None = None
    notes: str | None = None

class DistrictOut(DistrictCreate):
    id: str
    created_at: datetime | None = None
```

### 2b. Wards

```python
class WardCreate(BaseModel):
    ward_id: str                                          # human slug, used as doc ID
    district_id: str
    soil_type: str | None = None
    avg_rainfall_mm: float | None = None
    groundwater_depth_m: float | None = None
    forecast_dry_days: int = 0
    lat: float | None = None
    lon: float | None = None

class WardUpdate(BaseModel):
    district_id: str | None = None
    soil_type: str | None = None
    avg_rainfall_mm: float | None = None
    groundwater_depth_m: float | None = None
    forecast_dry_days: int | None = None
    lat: float | None = None
    lon: float | None = None

class WardOut(BaseModel):
    id: str
    district_id: str
    soil_type: str | None = None
    avg_rainfall_mm: float | None = None
    groundwater_depth_m: float | None = None
    forecast_dry_days: int = 0
    lat: float | None = None
    lon: float | None = None
    updated_at: datetime | None = None
```

### 2c. Farmers

```python
class FarmerCreate(BaseModel):
    name: str
    phone: str                                            # E.164, validated via phonenumbers
    preferred_language: str = "hi"                        # en | hi | te | ta | bn
    ward_id: str

class FarmerUpdate(BaseModel):
    name: str | None = None
    phone: str | None = None
    preferred_language: str | None = None
    ward_id: str | None = None

class FarmerOut(FarmerCreate):
    id: str
    created_at: datetime | None = None
```

### 2d. Plots

```python
class PlotCreate(BaseModel):
    farmer_id: str
    ward_id: str
    soil_type: str | None = None
    groundwater_depth_m: float | None = None
    avg_rainfall_mm: float | None = None
    current_crop: str | None = None
    crop_stage: str | None = None                          # sowing | vegetative | flowering | harvest

class PlotUpdate(BaseModel):
    ward_id: str | None = None
    soil_type: str | None = None
    groundwater_depth_m: float | None = None
    avg_rainfall_mm: float | None = None
    current_crop: str | None = None
    crop_stage: str | None = None

class PlotOut(PlotCreate):
    id: str
    last_updated: datetime | None = None
```

### 2e. Recommendations

```python
class RecommendationRequest(BaseModel):
    plot_id: str

class RecommendationOut(BaseModel):
    id: str
    plot_id: str
    recommended_crop: str
    rationale: str
    confidence: str                                        # high | medium | low
    data_gaps: str | None = None
    source_data: dict[str, Any]
    created_at: datetime | None = None
```

### 2f. Alerts

```python
class AlertTriggerRequest(BaseModel):
    plot_id: str
    alert_type: str = "dry_spell"                          # dry_spell | irrigation | fertilization | general_advisory
    force: bool = False

class AlertCreate(BaseModel):
    farmer_id: str
    plot_id: str
    alert_type: str
    message_text: str
    channel: str                                           # voice | sms | both

class AlertUpdate(BaseModel):
    status: str | None = None                              # sent | acknowledged | no_response
    farmer_response: str | None = None

class AlertOut(BaseModel):
    id: str
    farmer_id: str
    plot_id: str
    alert_type: str
    message_text: str
    channel: str
    status: str = "sent"
    farmer_response: str | None = None
    call_sid: str | None = None
    created_at: datetime | None = None
```

### 2g. Health Logs

```python
class HealthLogOut(BaseModel):
    id: str
    farmer_id: str
    plot_id: str
    image_url: str | None = None
    diagnosis: str
    confidence: str                                         # high | medium | low
    recommended_action: str
    escalate_to_rsk: bool = True
    status: str = "flagged_for_rsk"                        # flagged_for_rsk | resolved
    rsk_notes: str | None = None
    created_at: datetime | None = None

class HealthLogResolve(BaseModel):
    rsk_notes: str
    status: str = "resolved"
```

### 2h. RSK Officers

```python
class OfficerCreate(BaseModel):
    uid: str                                                # Firebase Auth UID
    name: str
    ward_id: str | None = None
    role: str = "rsk_officer"                               # rsk_officer | admin

class OfficerUpdate(BaseModel):
    name: str | None = None
    ward_id: str | None = None
    role: str | None = None

class OfficerOut(OfficerCreate):
    created_at: datetime | None = None
```

---

## 3. Public Portal Schemas (inline in `app/routers/public_portal.py`)

```python
class CropRecommendationRequest(BaseModel):
    n: float                                                # soil Nitrogen
    p: float                                                # soil Phosphorus
    k: float                                                # soil Potassium
    soilType: str
    ph: float
    temperature: float
    rainfall: float
    state: str
    language: str = "en"

class DiseaseDetectionRequest(BaseModel):
    imageBase64: str                                        # data:image/*;base64,...
    mimeType: str                                           # image/jpeg | image/png | image/webp
    cropName: str | None = None
    language: str = "en"

class IrrigationAdviceRequest(BaseModel):
    cropName: str
    soilType: str
    stage: str
    source: str                                             # water source (e.g. borewell, canal, river)
    language: str = "en"

class WeatherAdvisoryRequest(BaseModel):
    state: str
    district: str
    language: str = "en"
```

---

## 4. Firestore Document Shapes (what actually gets stored)

### 4a. `districts`

| Field | Type | Required |
|-------|------|----------|
| `name` | string | ✓ |
| `state` | string | ✓ (default "Andhra Pradesh") |
| `notes` | string\|null | |
| `created_at` | Timestamp | ✓ |

### 4b. `ward_data` (doc ID = human slug)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `district_id` | string | ✓ | |
| `soil_type` | string\|null | | e.g. "Black Cotton Soil", "Red Loamy Soil" |
| `avg_rainfall_mm` | float\|null | | |
| `groundwater_depth_m` | float\|null | | |
| `forecast_dry_days` | int | ✓ (default 0) | Live via OWM refresh |
| `lat` | float\|null | | |
| `lon` | float\|null | | |
| `updated_at` | Timestamp\|null | | |

### 4c. `farmers`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✓ | |
| `phone` | string | ✓ | E.164 format |
| `preferred_language` | string | ✓ | en/hi/te/ta/bn |
| `ward_id` | string | ✓ | refs ward_data |
| `created_at` | Timestamp | ✓ | |

### 4d. `plots`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `farmer_id` | string | ✓ | refs farmers |
| `ward_id` | string | ✓ | refs ward_data |
| `soil_type` | string\|null | | overrides ward |
| `groundwater_depth_m` | float\|null | | overrides ward |
| `avg_rainfall_mm` | float\|null | | overrides ward |
| `current_crop` | string\|null | | |
| `crop_stage` | string\|null | | sowing/vegetative/flowering/harvest |
| `last_updated` | Timestamp | ✓ | |

### 4e. `recommendations`

| Field | Type | Required |
|-------|------|----------|
| `plot_id` | string | ✓ |
| `recommended_crop` | string | ✓ |
| `rationale` | string | ✓ |
| `confidence` | string | ✓ (high/medium/low) |
| `data_gaps` | string\|null | |
| `source_data` | map | ✓ {soil_type, avg_rainfall_mm, groundwater_depth_m, ward_id, district_id} |
| `created_at` | Timestamp | ✓ |

### 4f. `alerts`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `farmer_id` | string | ✓ | |
| `plot_id` | string | ✓ | |
| `alert_type` | string | ✓ | dry_spell/irrigation/fertilization/general_advisory |
| `message_text` | string | ✓ | Gemini-generated |
| `channel` | string | ✓ | "both" currently |
| `status` | string | ✓ | sent/acknowledged/no_response |
| `farmer_response` | string\|null | | DTMF digit or SMS text |
| `call_sid` | string\|null | | Twilio Call SID |
| `created_at` | Timestamp | ✓ | |
| `responded_at` | Timestamp\|null | | set by webhook |

### 4g. `health_logs`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `farmer_id` | string | ✓ | "" for anonymous public submissions |
| `plot_id` | string | ✓ | "" for anonymous public submissions |
| `image_url` | string\|null | | ImageKit public URL |
| `diagnosis` | string | ✓ | Gemini Vision output |
| `confidence` | string | ✓ | high/medium/low |
| `recommended_action` | string | ✓ | |
| `escalate_to_rsk` | bool | ✓ (default true) | forced true when confidence=low |
| `status` | string | ✓ | flagged_for_rsk/resolved |
| `rsk_notes` | string\|null | | set by RSK on resolution |
| `crop_name` | string\|null | | only public portal submissions |
| `source` | string\|null | | "public_web" for portal submissions |
| `created_at` | Timestamp | ✓ | |

### 4h. `rsk_officers` (doc ID = Firebase Auth UID)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | ✓ | |
| `ward_id` | string\|null | | |
| `role` | string | ✓ | rsk_officer/admin |
| `created_at` | Timestamp | ✓ | |

### 4i. `public_recommendations`

| Field | Type | Required |
|-------|------|----------|
| `n` | float | ✓ |
| `p` | float | ✓ |
| `k` | float | ✓ |
| `soilType` | string | ✓ |
| `ph` | float | ✓ |
| `temperature` | float | ✓ |
| `rainfall` | float | ✓ |
| `state` | string | ✓ |
| `language` | string | ✓ |
| `recommendation` | string | ✓ (Gemini plain text output) |
| `created_at` | Timestamp | ✓ |

### 4j. `portal_queries`

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `type` | string | ✓ | irrigation/weather |
| `inputs` | map | ✓ | full request payload |
| `output` | string | ✓ | Gemini-generated text |
| `metrics` | map\|null | | only for weather queries |
| `created_at` | Timestamp | ✓ | |

---

## 5. Gemini Prompt Inputs / Outputs

### 5a. `get_crop_recommendation()` — ward-based crop recommendation

```
Input:  ward_id, district, soil_type, avg_rainfall_mm, groundwater_depth_m,
        current_crop, crop_stage, language
Output JSON: { recommended_crop: str, rationale: str, confidence: str,
               data_gaps: str|null }
```

### 5b. `get_advisory_message()` — alert TTS message

```
Input:  current_crop, crop_stage, forecast_dry_days, alert_type, language,
        use_search_grounding (optional)
Output: plain text (≤3 short sentences, TTS-optimized)
```

### 5c. `diagnose_crop_photo()` — vision-based health diagnosis

```
Input:  image_bytes, mime_type, language, crop_name (optional)
Output JSON: { diagnosis: str, confidence: str, recommended_action: str,
               escalate_to_rsk: bool }
```

### 5d. `get_crop_recommendation_public()` — stand-alone crop rec

```
Input:  n, p, k, soil_type, ph, temperature, rainfall, state, language
Output: plain text (recommendation with rationale)
```

### 5e. `get_irrigation_advice()` — irrigation scheduling

```
Input:  crop_name, soil_type, stage, source (water), language
Output: plain text (schedule/advice)
```

### 5f. `get_weather_advisory()` — weather bulletin

```
Input:  temperature, humidity, wind_speed, soil_moisture, pest_risk_index, language
Output: plain text (advisory bulletin)
```

---

## 6. External API Request/Response Shapes

### 6a. OpenWeatherMap Forecast

```
GET https://api.openweathermap.org/data/2.5/forecast
  ?lat={lat}&lon={lon}&appid={key}&units=metric

Response → get_forecast_dry_days():
  list[].rain.3h  → count entries where rain=0 → dry_blocks ÷ 8 = dry days
```

### 6b. OpenWeatherMap Current Weather

```
GET https://api.openweathermap.org/data/2.5/weather
  ?lat={lat}&lon={lon}&appid={key}&units=metric

Response → get_current_weather_metrics():
  main.temp       → temperature (float)
  main.humidity   → humidity (int)
  wind.speed      → wind_speed (float)
  rain.1h         → rain_1h (float, optional) → estimate soilMoisture
  Server-derived  → pestRiskIndex: high (humidity>70 & temp>30) | medium | low
```

### 6c. Google Maps Geocoding

```
GET https://maps.googleapis.com/maps/api/geocode/json
  ?address={district},{state},India&key={key}

Response → geocode_district():
  results[0].geometry.location  → { lat: float, lng: float }
```

### 6d. Twilio Voice Call

```
Client.calls.create(
  to=farmer_phone,
  from_=TWILIO_PHONE_NUMBER,
  twiml=build_outbound_advisory_twiml(message, lang)
  status_callback="{PUBLIC_BASE_URL}/twilio/voice-response?alert_id={id}"
)
Returns: call.sid (string)
```

### 6e. Twilio SMS

```
Client.messages.create(
  to=farmer_phone,
  from_=TWILIO_PHONE_NUMBER,
  body=message_text
)
Returns: msg.sid (string)
```

---

## 7. API Endpoint Shapes (Request → Response)

### 7a. Districts (`/districts`)

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/districts` | none | `?limit=50&start_after=` | `{items: DistrictOut[], next_cursor: str\|null}` |
| GET | `/districts/{id}` | none | — | `DistrictOut` |
| POST | `/districts` | admin | `DistrictCreate` | `DistrictOut` (201) |
| PATCH | `/districts/{id}` | admin | `DistrictUpdate` | `DistrictOut` |
| DELETE | `/districts/{id}` | admin | — | 204 |

### 7b. Wards (`/wards`)

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/wards` | none | `?district_id=&limit=50&start_after=` | `{items: WardOut[], next_cursor}` |
| GET | `/wards/{id}` | none | — | `WardOut` |
| POST | `/wards` | admin | `WardCreate` | `WardOut` (201) |
| PATCH | `/wards/{id}` | admin | `WardUpdate` | `WardOut` |
| DELETE | `/wards/{id}` | admin | — | 204 |
| POST | `/wards/{id}/refresh-forecast` | none | — | `WardOut` (live OWM update) |

### 7c. Farmers (`/farmers`)

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/farmers` | none | `?ward_id=&limit=50&start_after=` | `{items: FarmerOut[], next_cursor}` |
| GET | `/farmers/{id}` | none | — | `FarmerOut` |
| GET | `/farmers/{id}/timeline` | none | `?limit=20` | `{farmer_id, events: [{event_type, ...}]}` |
| POST | `/farmers` | none | `FarmerCreate` | `FarmerOut` (201) |
| PATCH | `/farmers/{id}` | admin | `FarmerUpdate` | `FarmerOut` |
| DELETE | `/farmers/{id}` | admin | — | 204 |

### 7d. Plots (`/plots`)

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| GET | `/plots` | none | `?farmer_id=&ward_id=&limit=50&start_after=` | `{items: PlotOut[], next_cursor}` |
| GET | `/plots/{id}` | none | — | `PlotOut` |
| POST | `/plots` | none | `PlotCreate` | `PlotOut` (201) |
| PATCH | `/plots/{id}` | none | `PlotUpdate` | `PlotOut` |
| DELETE | `/plots/{id}` | admin | — | 204 |

### 7e. Recommendations (`/recommend`)

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/recommend` | none | `RecommendationRequest{plot_id}` | `RecommendationOut` |
| GET | `/recommend/{plot_id}/history` | none | — | `list[RecommendationOut]` |

### 7f. Alerts

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/alert/trigger` | Firebase auth (RSK) | `AlertTriggerRequest` | `{status, channel, alert_id, message_text, call_sid, sms_sid, warnings}` |
| GET | `/alerts` | none | `?farmer_id=&status=&limit=50&start_after=` | `{items: AlertOut[], next_cursor}` |
| GET | `/alerts/{id}` | none | — | `AlertOut` |
| PATCH | `/alerts/{id}` | admin | `AlertUpdate` | `AlertOut` |
| DELETE | `/alerts/{id}` | admin | — | 204 |

### 7g. Health Logs

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/health/log` | none (rate-limited) | `multipart: plot_id, farmer_id, image` | `HealthLogOut` |
| GET | `/health/logs` | none | `?status=&farmer_id=&limit=50&start_after=` | `{items: HealthLogOut[], next_cursor}` |
| GET | `/health/log/{id}` | none | — | `HealthLogOut` |
| PATCH | `/health/log/{id}/resolve` | admin | `HealthLogResolve` | `HealthLogOut` |

### 7h. Twilio Webhooks

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| POST | `/twilio/voice-response` | Twilio signature | form: `Digits, CallSid`, query: `alert_id` | TwiML XML |
| POST | `/twilio/sms-response` | Twilio signature | form: `From, Body` | TwiML XML (empty) |

### 7i. Dashboard (`/dashboard`) — all require Firebase auth token

| Method | Path | Response |
|--------|------|----------|
| GET | `/dashboard/me` | `OfficerOut \| {uid, note}` |
| GET | `/dashboard/farmers` | `[{...farmer, current_crop, plot_count, latest_alert_status}]` |
| GET | `/dashboard/alerts` | `[{...AlertOut, ui_color: "yellow"\|"green"\|"red"}]` |
| GET | `/dashboard/health-logs` | `[HealthLogOut]` filtered by status |
| GET | `/dashboard/summary` | `{farmers: int, active_alerts: int, flagged_health_cases: int, wards: int}` |

### 7j. Admin (`/admin`) — all require admin auth

| Method | Path | Request | Response |
|--------|------|---------|----------|
| GET | `/admin/officers` | `?ward_id=` | `list[OfficerOut]` |
| GET | `/admin/officers/{uid}` | — | `OfficerOut` |
| POST | `/admin/officers` | `OfficerCreate` | `OfficerOut` (201) |
| PATCH | `/admin/officers/{uid}` | `OfficerUpdate` | `OfficerOut` |
| DELETE | `/admin/officers/{uid}` | — | 204 |

### 7k. Public Portal (`/api`) — no auth, rate-limited

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/api/crop-recommendation` | `CropRecommendationRequest` | `{success: bool, recommendation: str}` |
| POST | `/api/disease-detection` | `DiseaseDetectionRequest` | `{success: bool, diagnosis: str}` |
| POST | `/api/irrigation-advice` | `IrrigationAdviceRequest` | `{success: bool, advice: str}` |
| POST | `/api/weather-advisory` | `WeatherAdvisoryRequest` | `{success: bool, advisory: str, metrics: {...}}` |

### 7l. System

| Method | Path | Response |
|--------|------|----------|
| GET | `/` | `{service: "Kisan Alert API", status: "ok"}` |
| GET | `/healthz` | `{status, env, version, firestore, gemini_configured, twilio_configured, openweather_configured, imagekit_configured}` |

---

## 8. Internal Constants & Enums

| Domain | Values | Defined In |
|--------|--------|-----------|
| **Languages** | `en`, `hi`, `te`, `ta`, `bn` | `schemas.py:73`, `twilio_service.py:12-19` |
| **Crop stages** | `sowing`, `vegetative`, `flowering`, `harvest` | `schemas.py:102` |
| **Alert types** | `dry_spell`, `irrigation`, `fertilization`, `general_advisory` | `schemas.py:138` |
| **Alert status** | `sent`, `acknowledged`, `no_response` | `schemas.py:167`, updated by webhooks |
| **Health status** | `flagged_for_rsk`, `resolved` | `schemas.py:183,189` |
| **Confidence** | `high`, `medium`, `low` | Gemini output, enforced in `gemini_service.py:225` |
| **Roles** | `rsk_officer`, `admin` | `schemas.py:198` |
| **Channels** | `voice`, `sms`, `both` | `schemas.py:150` |
| **DTMF digits** | `"1"`=irrigation_done, `"2"`=callback_requested | `twilio_service.py:82-85` |
| **MIME types** | `image/jpeg`, `image/png`, `image/webp` | `health_logs.py:18`, `public_portal.py:31` |
| **Dry spell threshold** | `DRY_SPELL_THRESHOLD_DAYS = 3` | `rule_engine.py:7` |
| **Sensitive stages** | `{"flowering", "sowing"}` | `rule_engine.py:8` |
| **Portal query types** | `irrigation`, `weather` | `public_portal.py:215,256` |
| **Health log sources** | `"public_web"` (optional) | `public_portal.py:188` |

---

## 9. Firestore Indexes (10 composite indexes)

| Collection | Fields | Direction |
|------------|--------|-----------|
| `alerts` | `farmer_id` + `created_at` | ASC + DESC |
| `alerts` | `status` + `created_at` | ASC + DESC |
| `alerts` | `plot_id` + `alert_type` + `created_at` | ASC + ASC + DESC |
| `recommendations` | `plot_id` + `created_at` | ASC + DESC |
| `health_logs` | `status` + `created_at` | ASC + DESC |
| `health_logs` | `farmer_id` + `created_at` | ASC + DESC |
| `farmers` | `ward_id` + `created_at` | ASC + DESC |
| `plots` | `farmer_id` + `last_updated` | ASC + DESC |
| `plots` | `ward_id` + `last_updated` | ASC + DESC |
| `ward_data` | `district_id` + `__name__` | ASC + ASC |

---

## 10. Rule Engine

```python
DRY_SPELL_THRESHOLD_DAYS = 3
SENSITIVE_STAGES = {"flowering", "sowing"}

def should_trigger_dry_spell_alert(forecast_dry_days: int, crop_stage: str | None) -> bool:
    return forecast_dry_days >= 3 and (crop_stage or "").lower() in {"flowering", "sowing"}

def evaluate_alert_condition(alert_type: str, forecast_dry_days: int,
                              crop_stage: str | None, force: bool) -> bool:
    if force:
        return True
    if alert_type == "dry_spell":
        return should_trigger_dry_spell_alert(forecast_dry_days, crop_stage)
    # irrigation / fertilization / general_advisory are currently manually/dashboard-triggered
    return True
```

---

## 11. Auth / Access Control Matrix

| Endpoint Group | Auth Required | Role Check | Notes |
|---------------|--------------|-----------|-------|
| `/districts` GET | — | — | Public read |
| `/districts` POST/PATCH/DELETE | Firebase token | admin | |
| `/wards` GET | — | — | |
| `/wards` POST/PATCH/DELETE | Firebase token | admin | |
| `/farmers` GET/POST | — | — | |
| `/farmers` PATCH/DELETE | Firebase token | admin | |
| `/plots` GET/POST/PATCH | — | — | |
| `/plots` DELETE | Firebase token | admin | |
| `/recommend*` | — | — | |
| `/alert/trigger` | Firebase token | RSK/admin | |
| `/alerts` GET | — | — | |
| `/alerts` PATCH/DELETE | Firebase token | admin | |
| `/health/*` | — | — | Rate-limited, not auth-gated |
| `/twilio/*` | Twilio signature | — | Webhook validation, not Firebase |
| `/dashboard/*` | Firebase token | RSK/admin (any authenticated user) | |
| `/admin/*` | Firebase token | admin | |
| `/api/*` (public portal) | — | — | Rate-limited only |

---

## 12. Seed Data Shape (`scripts/seed_data.py`)

```python
# districts: 1
{ "name": "Guntur", "state": "Andhra Pradesh", "created_at": ... }

# ward_data: 2
{ "district_id": "<guntur-id>", "soil_type": "Black Cotton Soil",
  "avg_rainfall_mm": 846.9, "groundwater_depth_m": 4.0,
  "forecast_dry_days": 0, "lat": 16.3067, "lon": 80.4365,
  "updated_at": ... }  # doc_id = "guntur-ward-01"

{ "district_id": "<guntur-id>", "soil_type": "Red Loamy Soil",
  "avg_rainfall_mm": 846.9, "groundwater_depth_m": 6.5,
  "forecast_dry_days": 0, "lat": 16.3067, "lon": 80.4365,
  "updated_at": ... }  # doc_id = "guntur-ward-02"

# farmers: 2
{ "name": "Ravi Kumar", "phone": "+919876543210",
  "preferred_language": "te", "ward_id": "guntur-ward-01", ... }
{ "name": "Lakshmi Devi", "phone": "+919876543211",
  "preferred_language": "hi", "ward_id": "guntur-ward-02", ... }

# plots: 2 (linked to respective farmers)
{ "farmer_id": "...", "ward_id": "guntur-ward-01",
  "current_crop": "Cotton", "crop_stage": "flowering", ... }
{ "farmer_id": "...", "ward_id": "guntur-ward-02",
  "current_crop": "Chillies", "crop_stage": "flowering", ... }
```

---

## 13. Context-Stuffing Architecture (How the Backend Feeds Data to AI)

This is the core pattern used by every AI-calling endpoint. It is **not** RAG, and it is **not** letting the model query anything on its own.

### 13a. The Pattern (Repeat)

Every recommendation, alert, diagnosis, irrigation, or weather advisory follows these steps:

```
Step 1: Receive request (plot_id, farmer_id, etc.)
Step 2: Hardcoded Firestore query → get_or_404("plots", plot_id)
Step 3: Code explicitly picks which fields to extract:
    soil_type, avg_rainfall_mm, groundwater_depth_m,
    current_crop, crop_stage, forecast_dry_days, ...
Step 4: Build prompt by injecting those values into a template:
    f"DATA PROVIDED:\n- Soil type: {soil_type}\n- ..."
Step 5: Send only that prompt to Gemini (no raw DB dump, no schema access)
Step 6: Instruction: "You must ONLY use the data provided below.
         Do not use general knowledge to fill gaps."
Step 7: Gemini returns text/JSON → stored + returned
```

### 13b. Why It Is Done This Way

| Concern | Mitigation |
|---------|-----------|
| **Hallucination** | Model told to cite specific values or say "insufficient data" |
| **Cost** | Each prompt is small (a few hundred tokens), no large document retrieval |
| **Latency** | A single Firestore `get()` + one Gemini call — predictable timing |
| **Simplicity** | No embedding pipeline, no vector DB, no chunking strategy needed |
| **Predictability** | The model sees exactly the same fields every time — no surprise data |

### 13c. Where Each Endpoint's Data Comes From

| Endpoint | Queries (Hardcoded) | Extracts These Fields |
|----------|---------------------|----------------------|
| `POST /recommend` | `plots[plot_id]` → `ward_data[ward_id]` | soil_type, avg_rainfall_mm, groundwater_depth_m, current_crop, crop_stage, district_id |
| `POST /alert/trigger` | `plots[plot_id]` → `ward_data[ward_id]` → `farmers[farmer_id]` | forecast_dry_days, current_crop, crop_stage, preferred_language |
| `POST /health/log` | `plots[plot_id]`, `farmers[farmer_id]` | preferred_language (image bytes from upload) |
| `POST /api/crop-recommendation` | None (standalone) | All fields from request body (N, P, K, soilType, ph, etc.) |
| `POST /api/disease-detection` | None (standalone) | imageBase64, cropName, language from request |
| `POST /api/irrigation-advice` | None (standalone) | All fields from request body |
| `POST /api/weather-advisory` | Google Maps Geocoding API + OpenWeatherMap API | lat, lon → temperature, humidity, wind, soilMoisture, pestRiskIndex |
| `POST /wards/{id}/refresh-forecast` | `ward_data[ward_id]` | lat, lon → OpenWeatherMap forecast |

### 13d. What the Model Never Sees

- The raw Firestore document (entire farmer/plot/ward record)
- Other farmers' data, other plots, aggregate statistics
- Historical trends (past recommendations, past weather)
- Database schema or collection names
- Any ability to make API calls or run queries
- Embeddings, vector search, or similarity lookup results

---

## 14. Questions for Improvement

### 14a. Could the AI Dynamically Generate Queries Instead?

**Question:** Rather than hardcoding which fields to fetch and inject, could the flow be restructured so that:

1. The user's request (or a chat) first goes to the AI
2. The AI generates efficient database queries (SQL-like or Firestore filters) in real time
3. Those queries are executed against the database
4. The results are fetched and fed back to the AI as context
5. The AI also grounds its response with Google Search (Gemini's built-in `googleSearch` tool)
6. This effectively simulates a **RAG (Retrieval-Augmented Generation)** behavior — the model decides what data it needs, fetches it, and cites sources

**What this would change:**

| Current | Proposed |
|---------|----------|
| Code picks fields, model sees a fixed slice | Model picks fields, sees whatever it asks for |
| One-shot prompt → response | Multi-turn: generate query → execute → feed results → respond |
| No search grounding (off by default in alerts) | Search grounding always available |
| No historical/aggregate context | Model could ask for trends, stats, comparisons |
| Predictable cost per call | Variable cost (depends on model's query complexity) |
| Predictable latency (~1 Firestore get + 1 Gemini call) | Variable latency (multiple rounds) |

**Risks / trade-offs:**
- **Safety:** The model could generate queries that scan entire collections or expose other farmers' data — needs guardrails
- **Cost:** Each "thinking round" is a separate Gemini token burn; query-generation prompts may be large
- **Latency:** Multi-turn could be 3–10× slower
- **Complexity:** Requires a query schema the model can output (structured Firestore filters), a validation layer, and a loop controller
- **Hallucination in queries:** The model might generate invalid collection names, field paths, or filters

---

## 15. Current Code Context (Re: Dynamic Query Generation)

### 15a. Existing Infrastructure That Could Support This

| Asset | File | What It Provides |
|-------|------|-----------------|
| `_call_gemini()` | `gemini_service.py:80-97` | Low-level Gemini caller; could be extended for multi-turn |
| `use_search_grounding` param | `gemini_service.py:80` | Already supports Google Search grounding — currently only used by `get_advisory_message()`, off by default |
| `_parse_json_block()` | `gemini_service.py:59-67` | Can extract JSON from Gemini output — could parse query plans |
| `get_or_404()` | `firestore_utils.py:12-16` | Simple document getter |
| `doc_to_dict()` | `firestore_utils.py:6-9` | Converts Firestore snapshots to dict |
| `geocode_district()` | `geocoding_service.py` | External data fetch — existing pattern of "call external API, feed result to Gemini" |
| `get_current_weather_metrics()` | `weather_service.py:65-113` | Same pattern — external data fetch → Gemini input |
| Gemini `tool` support | `gemini_service.py:87` | Already has `tools: [{"googleSearch": {}}]` plumbing |

### 15b. Current Limitations That Would Need Addressing

| Limitation | Details |
|-----------|---------|
| **No query language** | The model has no structured way to express "I need documents from collection X where field Y = Z". There is no Firestore query DSL defined anywhere in the codebase. |
| **No query executor** | There is no function that takes an arbitrary filter expression and returns results safely. Every query in the codebase is hand-written Python. |
| **No multi-turn loop** | The `_call_gemini()` function is a single request-response. There is no orchestrator that sends a prompt, parses a query, executes it, sends results back, and repeats. |
| **No access control on queries** | If the model could query any collection, it could fetch `rsk_officers` records, other farmers' phone numbers, or raw `alerts` data it shouldn't see. |
| **No cost tracking** | Each Gemini call is billed separately. A multi-turn conversation could burn through quota without visibility. |
| **No timeout management** | A loop with 5–10 turns could take 30–60 seconds, well past the Twilio webhook timeout and uncomfortable for HTTP API clients. |
| **Search grounding is opt-in** | `use_search_grounding=False` is the default in `_call_gemini()`. Only `get_advisory_message()` has it as a parameter; all other prompts never use it. |

### 15c. Minimal Viable Path to Test This

If someone wanted to experiment without a full rewrite:

1. **Define a query schema the model can output**, e.g.:

```json
{
  "query_type": "filter",
  "collection": "ward_data",
  "filters": [
    {"field": "district_id", "op": "==", "value": "guntur"}
  ],
  "limit": 10
}
```

2. **Add a `execute_query(query_json)` function** that validates collection against an allowlist, applies filters safely, and returns results as a string.

3. **Add a `chat_with_tools(prompt, history)` function** that:
   - Sends the prompt to Gemini
   - If the response contains a `query` block → executes it → appends results as a new user message → sends back to Gemini
   - If the response contains `use_search: true` → enables Google Search grounding
   - Repeats until the model returns a final answer (or hits a max-turn limit)

4. **Start with a single endpoint** (e.g., a new `/api/chat-advisory`) rather than changing existing ones.

### 15d. What Would Not Change

Even with this RAG-like approach, the following would remain the same:

- **Anti-hallucination instruction**: Still tell the model to cite only fetched data
- **Firestore as the data source**: Still query the same collections
- **External API fetches**: OWM weather, Google Geocoding, and Twilio would still be called by the backend (not by the AI directly)
- **Persistence**: Results would still be written back to Firestore collections
- **Auth boundaries**: The model's query scope would still be restricted by the calling user's permissions
