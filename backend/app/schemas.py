from datetime import datetime
from typing import Dict, Optional, Any
from pydantic import BaseModel, validator
import phonenumbers


def validate_e164(v: str) -> str:
    try:
        z = phonenumbers.parse(v, None)
        if not phonenumbers.is_valid_number(z):
            raise ValueError
    except Exception:
        raise ValueError("Phone number must be in E.164 format (e.g. +919876543210)")
    return v


# ---------- Districts ----------
class DistrictCreate(BaseModel):
    name: str
    state: str = "Andhra Pradesh"
    notes: Optional[str] = None


class DistrictUpdate(BaseModel):
    name: Optional[str] = None
    state: Optional[str] = None
    notes: Optional[str] = None


class DistrictOut(DistrictCreate):
    id: str
    created_at: Optional[datetime] = None


# ---------- Wards ----------
class WardCreate(BaseModel):
    ward_id: str  # human-friendly slug, also used as Firestore doc id
    district_id: str
    soil_type: Optional[str] = None
    avg_rainfall_mm: Optional[float] = None
    groundwater_depth_m: Optional[float] = None
    forecast_dry_days: int = 0
    lat: Optional[float] = None
    lon: Optional[float] = None


class WardUpdate(BaseModel):
    district_id: Optional[str] = None
    soil_type: Optional[str] = None
    avg_rainfall_mm: Optional[float] = None
    groundwater_depth_m: Optional[float] = None
    forecast_dry_days: Optional[int] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class WardOut(BaseModel):
    id: str
    district_id: str
    soil_type: Optional[str] = None
    avg_rainfall_mm: Optional[float] = None
    groundwater_depth_m: Optional[float] = None
    forecast_dry_days: int = 0
    lat: Optional[float] = None
    lon: Optional[float] = None
    updated_at: Optional[datetime] = None


# ---------- Farmers ----------
class FarmerCreate(BaseModel):
    name: str
    phone: str
    preferred_language: str = "hi"
    ward_id: str = "general"
    state: Optional[str] = None
    district: Optional[str] = None
    email: Optional[str] = None

    @validator("phone")
    def validate_phone(cls, v: str) -> str:
        return validate_e164(v)


class FarmerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None
    ward_id: Optional[str] = None
    state: Optional[str] = None
    district: Optional[str] = None


class FarmerOut(FarmerCreate):
    id: str
    created_at: Optional[datetime] = None
    email: Optional[str] = None


# ---------- Plots ----------
class PlotCreate(BaseModel):
    farmer_id: str
    ward_id: str = "general"
    soil_type: Optional[str] = None
    groundwater_depth_m: Optional[float] = None
    avg_rainfall_mm: Optional[float] = None
    current_crop: Optional[str] = None
    crop_stage: Optional[str] = None  # sowing | vegetative | flowering | harvest
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    area_acre: Optional[float] = None


class PlotUpdate(BaseModel):
    ward_id: Optional[str] = None
    soil_type: Optional[str] = None
    groundwater_depth_m: Optional[float] = None
    avg_rainfall_mm: Optional[float] = None
    current_crop: Optional[str] = None
    crop_stage: Optional[str] = None


class PlotOut(PlotCreate):
    id: str
    last_updated: Optional[datetime] = None


# ---------- Recommendations ----------
class RecommendationRequest(BaseModel):
    plot_id: str


class RecommendationOut(BaseModel):
    id: str
    plot_id: str
    recommended_crop: str
    rationale: str
    confidence: str
    data_gaps: Optional[str] = None
    source_data: Dict[str, Any]
    created_at: Optional[datetime] = None


# ---------- Alerts ----------
class AlertTriggerRequest(BaseModel):
    plot_id: str
    alert_type: str = (
        "dry_spell"  # dry_spell | irrigation | fertilization | general_advisory
    )
    force: bool = (
        False  # bypass rule-engine threshold check (useful for live demo button)
    )


class AlertCreate(BaseModel):
    farmer_id: str
    plot_id: str
    alert_type: str
    message_text: str
    channel: str  # voice | sms | both


class AlertUpdate(BaseModel):
    status: Optional[str] = None  # sent | acknowledged | no_response
    farmer_response: Optional[str] = None
    message_text: Optional[str] = None


class AlertOut(BaseModel):
    id: str
    farmer_id: str
    plot_id: str
    alert_type: str
    message_text: str
    channel: str
    status: str = "sent"
    farmer_response: Optional[str] = None
    call_sid: Optional[str] = None
    created_at: Optional[datetime] = None


# ---------- Health logs ----------
class HealthLogOut(BaseModel):
    id: str
    farmer_id: str
    plot_id: str
    image_url: Optional[str] = None
    diagnosis: str
    confidence: str
    recommended_action: str
    escalate_to_rsk: bool = True
    status: str = "flagged_for_rsk"
    rsk_notes: Optional[str] = None
    created_at: Optional[datetime] = None


class HealthLogResolve(BaseModel):
    rsk_notes: str
    status: str = "resolved"


# ---------- Admin / RSK officers ----------
class OfficerCreate(BaseModel):
    uid: str  # Firebase Auth UID
    name: str
    ward_id: Optional[str] = None
    role: str = "rsk_officer"  # rsk_officer | admin


class OfficerUpdate(BaseModel):
    name: Optional[str] = None
    ward_id: Optional[str] = None
    role: Optional[str] = None


class OfficerOut(OfficerCreate):
    created_at: Optional[datetime] = None
