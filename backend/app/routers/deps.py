"""
Shared FastAPI dependencies used across multiple routers.
"""

from typing import Optional

from fastapi import Header, HTTPException, Request, status
from slowapi import Limiter
from slowapi.util import get_remote_address
from twilio.request_validator import RequestValidator

from app.config import get_settings

settings = get_settings()
_twilio_validator: Optional[RequestValidator] = None

# Global rate limiter — wired into main.py via add_middleware
limiter = Limiter(key_func=get_client_ip)


def get_client_ip(request: Request) -> str:
    """Client IP for rate limiting.

    Behind a trusted reverse proxy (env TRUST_PROXY=true) we honour the
    leftmost X-Forwarded-For / X-Real-IP hop; otherwise we fall back to the
    direct peer address so a client cannot spoof the limiter key.
    """
    if settings.trust_proxy:
        forwarded = request.headers.get("x-forwarded-for")
        if forwarded:
            return forwarded.split(",")[0].strip()
        real_ip = request.headers.get("x-real-ip")
        if real_ip:
            return real_ip.strip()
    return get_remote_address(request)


def get_twilio_validator() -> RequestValidator:
    global _twilio_validator
    if _twilio_validator is None:
        if not settings.twilio_auth_token:
            raise RuntimeError("TWILIO_AUTH_TOKEN not set — cannot validate webhooks")
        _twilio_validator = RequestValidator(settings.twilio_auth_token)
    return _twilio_validator


async def verify_twilio_webhook(request: Request) -> None:
    """
    FastAPI dependency that validates the X-Twilio-Signature header
    using Twilio's RequestValidator. Run this as Depends on any
    Twilio webhook route.
    """
    signature = request.headers.get("X-Twilio-Signature")
    if signature is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Missing X-Twilio-Signature header",
        )

    validator = get_twilio_validator()
    url = str(request.url)
    body = {}
    if request.method == "POST":
        form = await request.form()
        body = dict(form)

    if not validator.validate(url, body, signature):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid Twilio signature — request may not be from Twilio",
        )
