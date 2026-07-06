from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException

from app.firebase_client import db
from app.firestore_utils import doc_to_dict, get_or_404
from app.schemas import RecommendationRequest, RecommendationOut
from app.services.gemini_service import get_crop_recommendation, GeminiError

router = APIRouter(tags=["Recommendations"])
COLLECTION = "recommendations"


@router.post("/recommend", response_model=RecommendationOut)
def recommend_crop(payload: RecommendationRequest):
    plot = get_or_404(db.collection("plots"), payload.plot_id, "Plot")
    ward = get_or_404(db.collection("ward_data"), plot["ward_id"], "Ward")

    farmer = None
    if plot.get("farmer_id"):
        farmer_snap = db.collection("farmers").document(plot["farmer_id"]).get()
        farmer = doc_to_dict(farmer_snap) if farmer_snap.exists else None
    language = (farmer or {}).get("preferred_language", "en")

    source_data = {
        "soil_type": plot.get("soil_type") or ward.get("soil_type"),
        "avg_rainfall_mm": plot.get("avg_rainfall_mm") or ward.get("avg_rainfall_mm"),
        "groundwater_depth_m": plot.get("groundwater_depth_m") or ward.get("groundwater_depth_m"),
        "ward_id": plot["ward_id"],
        "district_id": ward.get("district_id"),
    }

    try:
        result = get_crop_recommendation(
            ward_id=plot["ward_id"],
            district=ward.get("district_id", ""),
            soil_type=source_data["soil_type"] or "unknown",
            avg_rainfall_mm=source_data["avg_rainfall_mm"] or 0,
            groundwater_depth_m=source_data["groundwater_depth_m"] or 0,
            current_crop=plot.get("current_crop"),
            crop_stage=plot.get("crop_stage"),
            language=language,
        )
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    record = {
        "plot_id": payload.plot_id,
        "recommended_crop": result.get("recommended_crop", ""),
        "rationale": result.get("rationale", ""),
        "confidence": result.get("confidence", "low"),
        "data_gaps": result.get("data_gaps"),
        "source_data": source_data,
        "created_at": datetime.now(timezone.utc),
    }
    ref = db.collection(COLLECTION).document()
    ref.set(record)
    return doc_to_dict(ref.get())


@router.get("/recommend/{plot_id}/history", response_model=list[RecommendationOut])
def recommendation_history(plot_id: str):
    docs = (
        db.collection(COLLECTION)
        .where("plot_id", "==", plot_id)
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )
    return [doc_to_dict(d) for d in docs]
