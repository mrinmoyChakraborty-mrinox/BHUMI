"""
Twilio integration: outbound voice call (TTS advisory + DTMF gather),
SMS fallback, and TwiML response builders for the webhook endpoints.
"""
from twilio.rest import Client
from twilio.twiml.voice_response import VoiceResponse, Gather

from app.config import get_settings

settings = get_settings()

VOICE_LANGUAGE_MAP = {
    # Twilio <Say> language codes — extend as needed for your demo languages
    "en": "en-IN",
    "hi": "hi-IN",
    "te": "en-IN",  # Twilio TTS has no native Telugu voice; fall back to en-IN accent
    "ta": "ta-IN",
    "bn": "bn-IN",
}


def _client() -> Client:
    if not settings.twilio_account_sid or not settings.twilio_auth_token:
        raise RuntimeError("Twilio credentials are not configured")
    return Client(settings.twilio_account_sid, settings.twilio_auth_token)


def place_advisory_call(to_phone: str, message_text: str, language: str, alert_id: str) -> str:
    """Places an outbound call that speaks the advisory and gathers a DTMF response.
    Returns the Twilio Call SID."""
    twiml = build_outbound_advisory_twiml(message_text, language)
    call = _client().calls.create(
        to=to_phone,
        from_=settings.twilio_phone_number,
        twiml=str(twiml),
        status_callback=f"{settings.public_base_url}/twilio/voice-response?alert_id={alert_id}",
        status_callback_event=["completed"],
    )
    return call.sid


def send_advisory_sms(to_phone: str, message_text: str) -> str:
    """Sends the SMS fallback with the same advisory text. Returns the Twilio message SID."""
    msg = _client().messages.create(
        to=to_phone,
        from_=settings.twilio_phone_number,
        body=message_text,
    )
    return msg.sid


def build_outbound_advisory_twiml(message_text: str, language: str) -> VoiceResponse:
    """TTS the advisory, then <Gather> a single DTMF digit and post it to our webhook."""
    voice_lang = VOICE_LANGUAGE_MAP.get(language, "en-IN")
    response = VoiceResponse()

    gather = Gather(
        num_digits=1,
        action=f"{settings.public_base_url}/twilio/voice-response",
        method="POST",
        timeout=8,
    )
    gather.say(message_text, language=voice_lang)
    response.append(gather)

    # If no input received, repeat once then hang up gracefully
    response.say(
        "We did not receive a response. Goodbye." if language == "en" else message_text,
        language=voice_lang,
    )
    return response


def build_confirmation_twiml(confirmation_text: str, language: str = "en") -> VoiceResponse:
    """TwiML played back after we've processed the farmer's DTMF response."""
    voice_lang = VOICE_LANGUAGE_MAP.get(language, "en-IN")
    response = VoiceResponse()
    response.say(confirmation_text, language=voice_lang)
    return response


DIGIT_MEANING = {
    "1": "irrigation_done",
    "2": "callback_requested",
}
