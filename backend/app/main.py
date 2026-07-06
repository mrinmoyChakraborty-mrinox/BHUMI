from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
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

settings = get_settings()

app = FastAPI(
    title="Kisan Alert API",
    description="Voice-and-SMS agricultural intelligence backend — see 00_README.md / "
                 "01_PRD.md / 07_API_SPEC.md in the planning docs for full context.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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


@app.get("/")
def root():
    return {"service": "Kisan Alert API", "status": "ok"}


@app.get("/healthz")
def healthz():
    return {"status": "ok"}
