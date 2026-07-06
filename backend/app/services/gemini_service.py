"""
Gemini API client — implements the three prompts from 06_PROMPTS.md:
  1. Crop recommendation (structured context-stuffing, JSON output)
  2. Dry-spell / advisory alert text (short, TTS-friendly)
  3. Crop health diagnosis (vision)

Calls the Gemini API directly (generativelanguage.googleapis.com), matching
the JS example already in 06_PROMPTS.md — kept separate from any
Anthropic/Claude usage elsewhere in the stack.
"""

import base64
import json
import logging
import re
from typing import Optional

import requests
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import get_settings

logger = logging.getLogger("kisan-alert.gemini")
settings = get_settings()

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


class GeminiError(Exception):
    pass


def _is_retryable(exc: BaseException) -> bool:
    """Retry on timeouts, connectivity errors, and 5xx responses."""
    if isinstance(exc, GeminiError):
        # Check if the underlying cause was a 5xx
        cause = exc.__cause__
        if cause is not None and hasattr(cause, "response"):
            status = cause.response.status_code
            return status >= 500
        return False
    return isinstance(exc, (requests.ConnectionError, requests.Timeout))


def _extract_text(response_json: dict) -> str:
    try:
        candidates = response_json["candidates"]
        parts = candidates[0]["content"]["parts"]
        return "".join(p.get("text", "") for p in parts)
    except (KeyError, IndexError) as e:
        raise GeminiError(f"Unexpected Gemini response shape: {response_json}") from e


def _parse_json_block(text: str) -> dict:
    """Gemini sometimes wraps JSON in ```json fences — strip them before parsing."""
    cleaned = re.sub(
        r"^```(?:json)?|```$", "", text.strip(), flags=re.MULTILINE
    ).strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise GeminiError(f"Could not parse Gemini JSON output: {cleaned}") from e


@retry(
    retry=retry_if_exception_type(
        (GeminiError, requests.ConnectionError, requests.Timeout)
    ),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    before_sleep=lambda retry_state: logger.warning(
        "Gemini API call attempt %d failed, retrying...", retry_state.attempt_number
    ),
)
def _call_gemini(contents: list[dict], use_search_grounding: bool = False) -> dict:
    if not settings.gemini_api_key:
        raise GeminiError("GEMINI_API_KEY is not set")

    url = f"{GEMINI_BASE}/{settings.gemini_model}:generateContent"
    payload = {"contents": contents}
    if use_search_grounding:
        payload["tools"] = [{"googleSearch": {}}]

    resp = requests.post(
        url,
        params={"key": settings.gemini_api_key},
        json=payload,
        timeout=30,
    )
    if resp.status_code != 200:
        raise GeminiError(f"Gemini API error {resp.status_code}: {resp.text}")
    return resp.json()


# ---------- 1. Crop Recommendation ----------
def get_crop_recommendation(
    ward_id: str,
    district: str,
    soil_type: str,
    avg_rainfall_mm: float,
    groundwater_depth_m: float,
    current_crop: Optional[str],
    crop_stage: Optional[str],
    language: str = "en",
) -> dict:
    prompt = f"""SYSTEM:
You are an agricultural advisor. You must ONLY use the data provided below.
Do not use general knowledge to fill gaps. If the provided data is insufficient
to make a confident recommendation, say so explicitly rather than guessing.
Always cite which specific data point(s) informed each part of your answer.

DATA PROVIDED:
- Ward ID: {ward_id}
- District: {district}
- Soil type: {soil_type}
- Average rainfall: {avg_rainfall_mm} mm
- Groundwater depth: {groundwater_depth_m} m
- Current crop (if any): {current_crop or "none"}
- Crop stage: {crop_stage or "unknown"}

TASK:
Recommend the most suitable crop for this plot for the upcoming season.
Respond in language code: {language}.

Respond with ONLY a raw JSON object, no markdown fences, no preamble, in exactly this shape:
{{
  "recommended_crop": "...",
  "rationale": "... (must reference the specific data points above)",
  "confidence": "high | medium | low",
  "data_gaps": "note any missing info that limited the recommendation, or null"
}}"""

    response_json = _call_gemini([{"parts": [{"text": prompt}]}])
    text = _extract_text(response_json)
    return _parse_json_block(text)


# ---------- 2. Dry-Spell / Advisory Alert ----------
def get_advisory_message(
    current_crop: Optional[str],
    crop_stage: Optional[str],
    forecast_dry_days: int,
    alert_type: str,
    language: str = "en",
    use_search_grounding: bool = False,
) -> str:
    prompt = f"""SYSTEM:
You are generating a short voice/SMS advisory for a farmer with low literacy.
Keep it under 3 short sentences. Use simple, direct language — no jargon.
Only use the data provided. Respond in language code: {language}.

DATA PROVIDED:
- Crop: {current_crop or "unspecified"}, stage: {crop_stage or "unknown"}
- Forecast dry days remaining: {forecast_dry_days}
- Alert type: {alert_type}

TASK:
Write an advisory message telling the farmer what action to take and why,
in one short paragraph suitable for text-to-speech.

End with an instruction for a keypress response, e.g.:
"Press 1 if you have already irrigated. Press 2 to request a callback from your local Kisan agent."

If search results are used, note this was supplemented with current information.
Respond with plain text only, no markdown."""

    response_json = _call_gemini(
        [{"parts": [{"text": prompt}]}], use_search_grounding=use_search_grounding
    )
    return _extract_text(response_json).strip()


# ---------- 3. Crop Health Diagnosis (Vision) ----------
def diagnose_crop_photo(
    image_bytes: bytes, mime_type: str, language: str = "en"
) -> dict:
    prompt = f"""SYSTEM:
You are assisting a farmer with a crop health issue based on a photo.
You are not a replacement for expert diagnosis — flag uncertainty honestly.
Respond in language code: {language}.

TASK:
Look at the attached image of a crop. Identify the likely issue (disease, pest,
nutrient deficiency, or none detected). Provide:
1. Likely issue
2. Confidence (high/medium/low)
3. Immediate recommended action (simple, actionable)
4. Whether this should be escalated to a human agent at the Rythu Seva Kendra (yes/no)

Respond with ONLY a raw JSON object, no markdown fences, no preamble, in exactly this shape:
{{
  "diagnosis": "...",
  "confidence": "high | medium | low",
  "recommended_action": "...",
  "escalate_to_rsk": true
}}

Rule of thumb: set escalate_to_rsk to true whenever confidence is "low"."""

    b64_image = base64.b64encode(image_bytes).decode("utf-8")
    contents = [
        {
            "parts": [
                {"text": prompt},
                {"inline_data": {"mime_type": mime_type, "data": b64_image}},
            ]
        }
    ]
    response_json = _call_gemini(contents)
    text = _extract_text(response_json)
    result = _parse_json_block(text)

    # Enforce the honesty rule server-side too, don't just trust the model
    if str(result.get("confidence", "")).lower() == "low":
        result["escalate_to_rsk"] = True
    return result
