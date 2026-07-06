from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException

from app.firebase_client import db
from app.firestore_utils import doc_to_dict, get_or_404, clean_update
from app.schemas import WardCreate, WardUpdate, WardOut
from app.auth import require_admin
from app.services.weather_service import get_forecast_dry_days, WeatherServiceError

router = APIRouter(prefix="/wards", tags=["Wards"])
COLLECTION = "ward_data"


@router.get("", response_model=dict)
def list_wards(
    district_id: str | None = None,
    limit: int = 50,
    start_after: str | None = None,
):
    query = db.collection(COLLECTION)
    if district_id:
        query = query.where("district_id", "==", district_id)
    if start_after:
        cursor_doc = db.collection(COLLECTION).document(start_after).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)
    limit = min(limit, 200)
    docs = query.limit(limit).stream()
    items = [doc_to_dict(d) for d in docs]
    next_cursor = items[-1]["id"] if len(items) == limit else None
    return {"items": items, "next_cursor": next_cursor}


@router.get("/{ward_id}", response_model=WardOut)
def get_ward(ward_id: str):
    return get_or_404(db.collection(COLLECTION), ward_id, "Ward")


@router.post(
    "", response_model=WardOut, status_code=201, dependencies=[Depends(require_admin)]
)
def create_ward(payload: WardCreate):
    ref = db.collection(COLLECTION).document(payload.ward_id)
    if ref.get().exists:
        raise HTTPException(
            status_code=409, detail=f"Ward '{payload.ward_id}' already exists"
        )
    data = payload.model_dump(exclude={"ward_id"})
    data["updated_at"] = datetime.now(timezone.utc)
    ref.set(data)
    return doc_to_dict(ref.get())


@router.patch(
    "/{ward_id}", response_model=WardOut, dependencies=[Depends(require_admin)]
)
def update_ward(ward_id: str, payload: WardUpdate):
    get_or_404(db.collection(COLLECTION), ward_id, "Ward")
    updates = clean_update(payload.model_dump())
    if updates:
        updates["updated_at"] = datetime.now(timezone.utc)
        db.collection(COLLECTION).document(ward_id).update(updates)
    return doc_to_dict(db.collection(COLLECTION).document(ward_id).get())


@router.delete("/{ward_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_ward(ward_id: str):
    get_or_404(db.collection(COLLECTION), ward_id, "Ward")
    db.collection(COLLECTION).document(ward_id).delete()


@router.post("/{ward_id}/refresh-forecast", response_model=WardOut)
def refresh_forecast(ward_id: str):
    """Pulls a live dry-day forecast from OpenWeatherMap and updates ward_data.forecast_dry_days."""
    ward = get_or_404(db.collection(COLLECTION), ward_id, "Ward")
    lat, lon = ward.get("lat"), ward.get("lon")
    if lat is None or lon is None:
        raise HTTPException(
            status_code=400,
            detail="Ward has no lat/lon set — required to fetch a live forecast",
        )
    try:
        dry_days = get_forecast_dry_days(lat, lon)
    except WeatherServiceError as e:
        raise HTTPException(status_code=502, detail=str(e))

    db.collection(COLLECTION).document(ward_id).update(
        {"forecast_dry_days": dry_days, "updated_at": datetime.now(timezone.utc)}
    )
    return doc_to_dict(db.collection(COLLECTION).document(ward_id).get())
