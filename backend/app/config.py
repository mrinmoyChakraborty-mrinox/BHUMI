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

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def admin_bootstrap_uid_list(self) -> list[str]:
        return [u.strip() for u in self.admin_bootstrap_uids.split(",") if u.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
