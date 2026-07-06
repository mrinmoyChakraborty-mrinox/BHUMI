"""
Central Firebase Admin SDK bootstrap.

Provides:
- db          -> Firestore client
- bucket      -> Cloud Storage bucket (for crop photo uploads)
- verify_token -> wrapper around Firebase Auth ID token verification
"""
import os
import firebase_admin
from firebase_admin import credentials, firestore, storage, auth

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
        # Falls back to Application Default Credentials
        # (useful on Cloud Run / GCE where a service account is attached to the runtime)
        cred = credentials.ApplicationDefault()

    options = {}
    if settings.firebase_storage_bucket:
        options["storageBucket"] = settings.firebase_storage_bucket

    _app = firebase_admin.initialize_app(cred, options)
    return _app


init_firebase()

db = firestore.client()
bucket = storage.bucket() if settings.firebase_storage_bucket else None


def verify_token(id_token: str) -> dict:
    """Raises firebase_admin.auth.InvalidIdTokenError / ExpiredIdTokenError on failure."""
    return auth.verify_id_token(id_token)


def set_admin_claim(uid: str, is_admin: bool = True):
    auth.set_custom_user_claims(uid, {"admin": is_admin})
