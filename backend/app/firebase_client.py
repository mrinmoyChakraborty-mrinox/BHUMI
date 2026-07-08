"""
Central Firebase Admin SDK bootstrap.

Provides:
- db          -> Firestore client
- verify_token -> wrapper around Firebase Auth ID token verification
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, auth

from app.config import get_settings

settings = get_settings()

_app = None


def init_firebase():
    global _app
    if _app is not None:
        return _app

    cred_path = settings.firebase_service_account_path
    if os.path.exists(cred_path):
        cred = credentials.Certificate(cred_path)
    else:
        cred = credentials.ApplicationDefault()

    _app = firebase_admin.initialize_app(cred)
    return _app


init_firebase()

db = firestore.client()


def verify_token(id_token: str) -> dict:
    """Raises firebase_admin.auth.InvalidIdTokenError / ExpiredIdTokenError on failure."""
    return auth.verify_id_token(id_token)


def set_admin_claim(uid: str, is_admin: bool = True):
    auth.set_custom_user_claims(uid, {"admin": is_admin})
