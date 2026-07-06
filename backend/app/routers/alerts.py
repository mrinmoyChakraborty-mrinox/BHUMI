from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request

from app.firebase_client import db
from app.firestore_utils import doc_to_dict, get_or_404, clean_update
from app.schemas import AlertTriggerRequest, AlertUpdate, AlertOut
from app.auth import get_current_user, require_admin
from app.routers.deps import limiter
from app.services.rule_engine import evaluate_alert_condition
from app.services.gemini_service import get_advisory_message, GeminiError
from app.services import twilio_service
from app.config import get_settings

router = APIRouter(tags=["Alerts"])
COLLECTION = "alerts"
settings = get_settings()


@router.post("/alert/trigger")
@limiter.limit(settings.rate_limit_alert_trigger)
def trigger_alert(
    request: Request,
    payload: AlertTriggerRequest,
    user: dict = Depends(get_current_user),
):
    """Per 07_API_SPEC.md — checks the rule condition, generates advisory text via
    Gemini, places a Twilio voice call + SMS, and logs the alert. `force=true`
    bypasses the threshold check for a live demo button.

    Protected by Firebase auth so only logged-in RSK officers/admins can trigger
    paid Twilio calls. Rate-limited per-IP as a second layer of defense."""
    plot = get_or_404(db.collection("plots"), payload.plot_id, "Plot")
    ward = get_or_404(db.collection("ward_data"), plot["ward_id"], "Ward")
    farmer = get_or_404(db.collection("farmers"), plot["farmer_id"], "Farmer")

    # ── Idempotency check ────────────────────────────────────────────────
    if not payload.force:
        cutoff = datetime.now(timezone.utc) - timedelta(
            minutes=settings.idempotency_window_minutes
        )
        dupes = list(
            db.collection(COLLECTION)
            .where("plot_id", "==", payload.plot_id)
            .where("alert_type", "==", payload.alert_type)
            .where("created_at", ">=", cutoff)
            .limit(1)
            .stream()
        )
        if dupes:
            existing = doc_to_dict(dupes[0])
            return {
                "status": "duplicate_skipped",
                "reason": (
                    f"An alert of type '{payload.alert_type}' was already sent "
                    f"for this plot within the last {settings.idempotency_window_minutes} minutes. "
                    "Set force=true to override."
                ),
                "alert_id": existing["id"],
            }

    forecast_dry_days = ward.get("forecast_dry_days", 0)
    condition_met = evaluate_alert_condition(
        payload.alert_type, forecast_dry_days, plot.get("crop_stage"), payload.force
    )
    if not condition_met:
        return {
            "status": "not_triggered",
            "reason": "Rule condition not met (forecast_dry_days/crop_stage below threshold). "
            "Pass force=true to override for a demo.",
        }

    language = farmer.get("preferred_language", "en")
    try:
        message_text = get_advisory_message(
            current_crop=plot.get("current_crop"),
            crop_stage=plot.get("crop_stage"),
            forecast_dry_days=forecast_dry_days,
            alert_type=payload.alert_type,
            language=language,
        )
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    alert_ref = db.collection(COLLECTION).document()
    alert_ref.set(
        {
            "farmer_id": farmer["id"],
            "plot_id": payload.plot_id,
            "alert_type": payload.alert_type,
            "message_text": message_text,
            "channel": "both",
            "status": "sent",
            "farmer_response": None,
            "call_sid": None,
            "created_at": datetime.now(timezone.utc),
        }
    )

    call_sid, sms_sid, warnings = None, None, []
    try:
        call_sid = twilio_service.place_advisory_call(
            farmer["phone"], message_text, language, alert_ref.id
        )
        alert_ref.update({"call_sid": call_sid})
    except Exception as e:
        warnings.append(f"Voice call failed: {e}")

    try:
        sms_sid = twilio_service.send_advisory_sms(farmer["phone"], message_text)
    except Exception as e:
        warnings.append(f"SMS failed: {e}")

    return {
        "status": "sent",
        "channel": "voice+sms",
        "alert_id": alert_ref.id,
        "message_text": message_text,
        "call_sid": call_sid,
        "sms_sid": sms_sid,
        "warnings": warnings or None,
    }


@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(
    farmer_id: str | None = None,
    status: str | None = None,
    limit: int = 50,
    start_after: str | None = None,
):
    query = db.collection(COLLECTION)
    if farmer_id:
        query = query.where("farmer_id", "==", farmer_id)
    if status:
        query = query.where("status", "==", status)
    query = query.order_by("created_at", direction="DESCENDING")
    if start_after:
        cursor_doc = db.collection(COLLECTION).document(start_after).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)
    limit = min(limit, 200)
    docs = query.limit(limit).stream()
    items = [doc_to_dict(d) for d in docs]
    next_cursor = items[-1]["id"] if len(items) == limit else None
    return {"items": items, "next_cursor": next_cursor}


@router.get("/alerts/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: str):
    return get_or_404(db.collection(COLLECTION), alert_id, "Alert")


@router.patch(
    "/alerts/{alert_id}", response_model=AlertOut, dependencies=[Depends(require_admin)]
)
def update_alert(alert_id: str, payload: AlertUpdate):
    get_or_404(db.collection(COLLECTION), alert_id, "Alert")
    updates = clean_update(payload.model_dump())
    if updates:
        db.collection(COLLECTION).document(alert_id).update(updates)
    return doc_to_dict(db.collection(COLLECTION).document(alert_id).get())


@router.delete(
    "/alerts/{alert_id}", status_code=204, dependencies=[Depends(require_admin)]
)
def delete_alert(alert_id: str):
    get_or_404(db.collection(COLLECTION), alert_id, "Alert")
    db.collection(COLLECTION).document(alert_id).delete()
