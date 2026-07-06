"""
pytest conftest — sets environment variables before any app module is imported
so that config.py and firebase_client.py don't crash on missing secrets during tests.
"""

import os

os.environ.setdefault("ENV", "test")
os.environ.setdefault("GEMINI_API_KEY", "test-key")
os.environ.setdefault("TWILIO_ACCOUNT_SID", "test-sid")
os.environ.setdefault("TWILIO_AUTH_TOKEN", "test-token")
os.environ.setdefault("TWILIO_PHONE_NUMBER", "+15005550006")
os.environ.setdefault("PUBLIC_BASE_URL", "http://test.example.com")
os.environ.setdefault("OPENWEATHER_API_KEY", "test-owm-key")
os.environ.setdefault("CORS_ORIGINS", "http://localhost:5173")
os.environ.setdefault("ADMIN_BOOTSTRAP_UIDS", "")
