from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # Firebase
    firebase_service_account_path: str = "./firebase-service-account.json"
    firebase_storage_bucket: str = ""

    # Gemini
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"

    # Twilio
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    public_base_url: str = "http://localhost:8000"

    # Weather
    openweather_api_key: str = ""

    # App
    env: str = "development"
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    admin_bootstrap_uids: str = ""

    # Rate limiting (per-IP)
    rate_limit_default: str = "30/minute"
    rate_limit_alert_trigger: str = "5/minute"
    rate_limit_health_log: str = "10/minute"

    # Idempotency (minutes to block duplicate alert triggers for the same plot+type)
    idempotency_window_minutes: int = 30

    # Upload limits
    max_image_size_mb: int = 8

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def admin_bootstrap_uid_list(self) -> list[str]:
        return [u.strip() for u in self.admin_bootstrap_uids.split(",") if u.strip()]

    @property
    def max_image_size_bytes(self) -> int:
        return self.max_image_size_mb * 1024 * 1024


@lru_cache
def get_settings() -> Settings:
    return Settings()
