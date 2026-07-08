import asyncio
import base64
import json
import logging
import time
import re
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, HTTPException, Request, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, field_validator

from app.config import get_settings
from app.firebase_client import db
from app.services.imagekit_service import upload_image
from app.routers.deps import limiter
from app.services.geocoding_service import GeocodingError, geocode_district
from app.services.gemini_service import (
    GeminiError,
    diagnose_crop_photo,
    get_crop_recommendation_public,
    get_chatbot_response,
    get_irrigation_advice,
    get_weather_advisory,
)
from app.services.weather_service import (
    WeatherServiceError,
    get_current_weather_metrics,
)

logger = logging.getLogger("kisan-alert.public_portal")
router = APIRouter(tags=["Public Portal"])
settings = get_settings()

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}
DATA_URL_RE = re.compile(r"^data:(image/\w+);base64,(.+)$")


# ── Request schemas ──────────────────────────────────────────────────────
class CropRecommendationRequest(BaseModel):
    n: float
    p: float
    k: float
    soilType: str
    ph: float
    temperature: float
    rainfall: float
    state: str
    language: str = "en"


class DiseaseDetectionRequest(BaseModel):
    imageBase64: str
    mimeType: str
    cropName: Optional[str] = None
    language: str = "en"

    @field_validator("mimeType")
    @classmethod
    def validate_mime(cls, v: str) -> str:
        if v not in ALLOWED_MIME_TYPES:
            raise ValueError(
                f"Unsupported mime type '{v}'. Use image/jpeg, image/png, or image/webp."
            )
        return v


class IrrigationAdviceRequest(BaseModel):
    cropName: str
    soilType: str
    stage: str
    source: str
    language: str = "en"


class WeatherAdvisoryRequest(BaseModel):
    state: str
    district: str
    language: str = "en"


# ── Helpers ──────────────────────────────────────────────────────────────
def _decode_data_url(data_url: str, expected_mime: str) -> bytes:
    match = DATA_URL_RE.match(data_url)
    if not match:
        raise HTTPException(
            status_code=400,
            detail="Invalid data URL format — expected data:image/...;base64,...",
        )
    actual_mime = match.group(1)
    if actual_mime != expected_mime:
        raise HTTPException(
            status_code=400,
            detail=f"mimeType '{expected_mime}' does not match data URL prefix '{actual_mime}'",
        )
    b64_data = match.group(2)
    try:
        return base64.b64decode(b64_data)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Base64 decode failed: {e}")


def _upload_image(image_bytes: bytes, mime_type: str) -> str | None:
    return upload_image(image_bytes, mime_type, folder="public_web")


# ── 1. Crop Recommendation ───────────────────────────────────────────────
@router.post("/api/crop-recommendation")
@limiter.limit(settings.rate_limit_public_portal)
async def crop_recommendation(
    request: Request,
    payload: CropRecommendationRequest,
):
    try:
        recommendation = await asyncio.to_thread(
            get_crop_recommendation_public,
            payload.n,
            payload.p,
            payload.k,
            payload.soilType,
            payload.ph,
            payload.temperature,
            payload.rainfall,
            payload.state,
            payload.language,
        )
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    record = {
        "n": payload.n,
        "p": payload.p,
        "k": payload.k,
        "soilType": payload.soilType,
        "ph": payload.ph,
        "temperature": payload.temperature,
        "rainfall": payload.rainfall,
        "state": payload.state,
        "language": payload.language,
        "recommendation": recommendation,
        "created_at": datetime.now(timezone.utc),
    }
    db.collection("public_recommendations").document().set(record)

    return {"success": True, "recommendation": recommendation}


# ── 2. Disease Detection ─────────────────────────────────────────────────
@router.post("/api/disease-detection")
@limiter.limit(settings.rate_limit_public_portal)
async def disease_detection(
    request: Request,
    payload: DiseaseDetectionRequest,
):
    max_bytes = settings.max_image_size_bytes
    image_bytes = _decode_data_url(payload.imageBase64, payload.mimeType)
    if len(image_bytes) > max_bytes:
        raise HTTPException(
            status_code=413,
            detail=f"Image too large. Maximum size is {settings.max_image_size_mb} MB.",
        )

    try:
        result = await asyncio.to_thread(
            diagnose_crop_photo,
            image_bytes,
            payload.mimeType,
            payload.language,
            payload.cropName,
        )
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    image_url = _upload_image(image_bytes, payload.mimeType)

    record = {
        "farmer_id": "",
        "plot_id": "",
        "image_url": image_url,
        "diagnosis": result.get("diagnosis", ""),
        "confidence": result.get("confidence", "low"),
        "recommended_action": result.get("recommended_action", ""),
        "escalate_to_rsk": bool(result.get("escalate_to_rsk", True)),
        "status": "flagged_for_rsk",
        "rsk_notes": None,
        "crop_name": payload.cropName,
        "source": "public_web",
        "created_at": datetime.now(timezone.utc),
    }
    ref = db.collection("health_logs").document()
    ref.set(record)

    return {"success": True, "diagnosis": result.get("diagnosis", "")}


# ── 3. Irrigation Advice ─────────────────────────────────────────────────
@router.post("/api/irrigation-advice")
@limiter.limit(settings.rate_limit_public_portal)
async def irrigation_advice(
    request: Request,
    payload: IrrigationAdviceRequest,
):
    try:
        advice = await asyncio.to_thread(
            get_irrigation_advice,
            payload.cropName,
            payload.soilType,
            payload.stage,
            payload.source,
            payload.language,
        )
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    db.collection("portal_queries").document().set(
        {
            "type": "irrigation",
            "inputs": payload.model_dump(),
            "output": advice,
            "created_at": datetime.now(timezone.utc),
        }
    )

    return {"success": True, "advice": advice}


# ── 4. Weather Advisory ──────────────────────────────────────────────────
@router.post("/api/weather-advisory")
@limiter.limit(settings.rate_limit_public_portal)
async def weather_advisory(
    request: Request,
    payload: WeatherAdvisoryRequest,
):
    try:
        coords = await asyncio.to_thread(
            geocode_district, payload.district, payload.state
        )
    except GeocodingError as e:
        raise HTTPException(status_code=502, detail=str(e))

    try:
        metrics = await asyncio.to_thread(
            get_current_weather_metrics, coords["lat"], coords["lon"]
        )
    except WeatherServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))

    try:
        advisory = await asyncio.to_thread(
            get_weather_advisory,
            metrics["temperature"],
            metrics["humidity"],
            metrics["wind_speed"],
            metrics["soilMoisture"],
            metrics["pestRiskIndex"],
            payload.language,
        )
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    db.collection("portal_queries").document().set(
        {
            "type": "weather",
            "inputs": payload.model_dump()
            | {"lat": coords["lat"], "lon": coords["lon"]},
            "output": advisory,
            "metrics": metrics,
            "created_at": datetime.now(timezone.utc),
        }
    )

    return {"success": True, "advisory": advisory, "metrics": metrics}


# ── 5. Chatbot (WebSocket) ─────────────────────────────────────────────────
# Lightweight per-connection guard so a single WS can't hammer the (paid) Gemini
# endpoint. The /api/chatbot socket is intentionally unauthenticated (public),
# so we cap messages and enforce a minimum interval here.
WS_MAX_MESSAGES = 100
WS_MIN_INTERVAL_SECONDS = 1.0


@router.websocket("/api/chatbot")
async def chatbot_ws(websocket: WebSocket):
    await websocket.accept()
    msg_count = 0
    last_msg_ts = 0.0
    try:
        while True:
            raw = await websocket.receive_text()
            now = time.monotonic()
            if now - last_msg_ts < WS_MIN_INTERVAL_SECONDS:
                await websocket.send_json(
                    {"type": "error", "message": "Please wait a moment before sending another message."}
                )
                continue
            last_msg_ts = now
            msg_count += 1
            if msg_count > WS_MAX_MESSAGES:
                await websocket.send_json(
                    {"type": "error", "message": "Session message limit reached. Please refresh to continue."}
                )
                await websocket.close()
                return

            data = json.loads(raw)

            msg_type = data.get("type", "message")
            if msg_type != "message":
                continue

            message = data.get("message", "")
            history = data.get("history", [])
            language = data.get("language", "en")
            location = data.get("location", "India")

            if not message.strip():
                await websocket.send_json({"type": "error", "message": "Empty message"})
                continue

            await websocket.send_json({"type": "typing"})

            try:
                loop = asyncio.get_event_loop()
                response = await loop.run_in_executor(
                    None,
                    get_chatbot_response,
                    message,
                    history,
                    language,
                    location,
                )
                await websocket.send_json({"type": "response", "text": response})
            except GeminiError as e:
                await websocket.send_json({"type": "error", "message": str(e)})

    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.exception("Chatbot WebSocket error")
        try:
            await websocket.send_json({"type": "error", "message": str(e)})
        except Exception:
            pass
