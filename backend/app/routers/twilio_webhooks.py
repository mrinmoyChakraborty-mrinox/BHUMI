from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Form, Query, Response

from app.firebase_client import db
from app.routers.deps import verify_twilio_webhook
from app.services.twilio_service import build_confirmation_twiml, DIGIT_MEANING

router = APIRouter(prefix="/twilio", tags=["Twilio Webhooks"])
COLLECTION = "alerts"


def _find_alert_by_call_sid(call_sid: str) -> str | None:
    docs = db.collection(COLLECTION).where("call_sid", "==", call_sid).limit(1).stream()
    for d in docs:
        return d.id
    return None


@router.post("/voice-response", dependencies=[Depends(verify_twilio_webhook)])
async def voice_response(
    alert_id: str | None = Query(default=None),
    Digits: str = Form(default=""),
    CallSid: str = Form(default=""),
):
    """Twilio calls this after <Gather> captures a DTMF digit. `alert_id` is
    passed as a query param when we build the call; CallSid is a fallback
    lookup in case the query param gets stripped anywhere in the call chain."""
    resolved_alert_id = alert_id or _find_alert_by_call_sid(CallSid)

    if resolved_alert_id:
        meaning = DIGIT_MEANING.get(Digits, "unrecognized")
        new_status = "acknowledged" if Digits in DIGIT_MEANING else "no_response"
        db.collection(COLLECTION).document(resolved_alert_id).update(
            {
                "farmer_response": Digits or None,
                "status": new_status,
                "responded_at": datetime.now(timezone.utc),
            }
        )
        if Digits == "1":
            confirmation = "Thank you. We have noted that irrigation is done."
        elif Digits == "2":
            confirmation = "Thank you. A Kisan agent will call you back soon."
        else:
            confirmation = "Sorry, that was not a valid option. Goodbye."
    else:
        confirmation = "Thank you for your response. Goodbye."

    twiml = build_confirmation_twiml(confirmation)
    return Response(content=str(twiml), media_type="application/xml")


@router.post("/sms-response", dependencies=[Depends(verify_twilio_webhook)])
async def sms_response(From: str = Form(default=""), Body: str = Form(default="")):
    """Inbound SMS reply handler — matches the farmer by phone number and logs
    the free-text reply against their most recent alert."""
    farmer_docs = list(
        db.collection("farmers").where("phone", "==", From).limit(1).stream()
    )
    if farmer_docs:
        farmer_id = farmer_docs[0].id
        recent_alerts = list(
            db.collection(COLLECTION)
            .where("farmer_id", "==", farmer_id)
            .order_by("created_at", direction="DESCENDING")
            .limit(1)
            .stream()
        )
        if recent_alerts:
            recent_alerts[0].reference.update(
                {
                    "farmer_response": Body.strip(),
                    "status": "acknowledged",
                    "responded_at": datetime.now(timezone.utc),
                }
            )

    # Empty TwiML response = no auto-reply SMS sent back
    return Response(content="<Response></Response>", media_type="application/xml")
