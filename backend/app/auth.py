"""
Auth dependencies for the RSK/admin dashboard endpoints.

Farmer-facing endpoints (Twilio webhooks, photo upload) are intentionally NOT
gated by these — they're validated by phone number / plot_id instead, per
07_API_SPEC.md. Only dashboard + admin CRUD routes require a Firebase ID token.

Frontend sends: Authorization: Bearer <firebase_id_token>
"""
from fastapi import Header, HTTPException, status
from firebase_admin import auth as firebase_auth

from app.config import get_settings

settings = get_settings()


async def get_current_user(authorization: str = Header(default=None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or malformed Authorization header",
        )
    id_token = authorization.split(" ", 1)[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        )
    return decoded


async def require_admin(user: dict = None, authorization: str = Header(default=None)) -> dict:
    """
    Use as a route dependency to restrict to admin users.
    Admin = custom claim {"admin": true} OR uid listed in ADMIN_BOOTSTRAP_UIDS
    (bootstrap convenience for before you've set any custom claims yet).
    """
    decoded = await get_current_user(authorization=authorization)
    uid = decoded.get("uid")
    is_admin = bool(decoded.get("admin")) or uid in settings.admin_bootstrap_uid_list
    if not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required",
        )
    return decoded
