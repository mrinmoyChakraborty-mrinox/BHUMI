import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import get_settings
from app.firebase_client import db
from app.routers import (
    districts,
    wards,
    farmers,
    plots,
    recommendations,
    alerts,
    twilio_webhooks,
    health_logs,
    dashboard,
    admin,
)
from app.routers.deps import limiter

settings = get_settings()

# ── Logging ──────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO if settings.env != "development" else logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("kisan-alert")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting Kisan Alert API — env=%s", settings.env)
    yield
    logger.info("Shutting down Kisan Alert API")


app = FastAPI(
    title="Kisan Alert API",
    description="Voice-and-SMS agricultural intelligence backend — see README.md for full documentation.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── Rate limiter ─────────────────────────────────────────────────────────
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# ── CORS ─────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Twilio-Signature"],
)

# ── Routers ──────────────────────────────────────────────────────────────
app.include_router(districts.router)
app.include_router(wards.router)
app.include_router(farmers.router)
app.include_router(plots.router)
app.include_router(recommendations.router)
app.include_router(alerts.router)
app.include_router(twilio_webhooks.router)
app.include_router(health_logs.router)
app.include_router(dashboard.router)
app.include_router(admin.router)

# ── Global exception handler ─────────────────────────────────────────────


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled exception on %s %s", request.method, request.url.path)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": 500,
                "message": "Internal server error",
            }
        },
    )


# ── Root & health ────────────────────────────────────────────────────────


@app.get("/")
def root():
    return {"service": "Kisan Alert API", "status": "ok"}


@app.get("/healthz")
def healthz():
    checks = {"status": "ok", "env": settings.env, "version": "1.0.0"}

    # Verify Firestore is reachable (cheap limit(1) read)
    try:
        list(db.collection("districts").limit(1).stream())
        checks["firestore"] = "ok"
    except Exception as e:
        checks["firestore"] = f"unreachable: {e}"
        checks["status"] = "degraded"

    # Report which external services have credentials configured (without calling them)
    checks["gemini_configured"] = "yes" if settings.gemini_api_key else "no"
    checks["twilio_configured"] = (
        "yes" if settings.twilio_account_sid and settings.twilio_auth_token else "no"
    )
    checks["openweather_configured"] = "yes" if settings.openweather_api_key else "no"
    checks["storage_configured"] = "yes" if settings.firebase_storage_bucket else "no"

    return checks
