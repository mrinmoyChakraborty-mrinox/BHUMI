import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.firebase_client import db, bucket
from app.firestore_utils import doc_to_dict, get_or_404
from app.schemas import HealthLogOut, HealthLogResolve
from app.auth import require_admin
from app.services.gemini_service import diagnose_crop_photo, GeminiError

router = APIRouter(tags=["Health Logs"])
COLLECTION = "health_logs"

ALLOWED_MIME_TYPES = {"image/jpeg", "image/png", "image/webp"}


def _upload_to_storage(image_bytes: bytes, mime_type: str, farmer_id: str) -> str | None:
    """Uploads the photo to Firebase Storage and returns a public URL.
    Returns None (non-fatal) if Storage isn't configured — the diagnosis still
    runs, we just won't have a persisted image_url for the dashboard to show."""
    if bucket is None:
        return None
    ext = "jpg" if mime_type == "image/jpeg" else mime_type.split("/")[-1]
    blob_path = f"health_logs/{farmer_id}/{uuid.uuid4()}.{ext}"
    blob = bucket.blob(blob_path)
    blob.upload_from_string(image_bytes, content_type=mime_type)
    blob.make_public()
    return blob.public_url


@router.post("/health/log", response_model=HealthLogOut)
async def log_health_issue(
    plot_id: str = Form(...),
    farmer_id: str = Form(...),
    image: UploadFile = File(...),
):
    """Per 07_API_SPEC.md — accepts a crop photo, runs Gemini Vision diagnosis,
    stores the result flagged for RSK follow-up."""
    if image.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type '{image.content_type}'. Use JPEG, PNG, or WebP.",
        )

    get_or_404(db.collection("plots"), plot_id, "Plot")
    farmer = get_or_404(db.collection("farmers"), farmer_id, "Farmer")

    image_bytes = await image.read()

    try:
        result = diagnose_crop_photo(
            image_bytes, image.content_type, language=farmer.get("preferred_language", "en")
        )
    except GeminiError as e:
        raise HTTPException(status_code=502, detail=str(e))

    image_url = _upload_to_storage(image_bytes, image.content_type, farmer_id)

    record = {
        "farmer_id": farmer_id,
        "plot_id": plot_id,
        "image_url": image_url,
        "diagnosis": result.get("diagnosis", ""),
        "confidence": result.get("confidence", "low"),
        "recommended_action": result.get("recommended_action", ""),
        "escalate_to_rsk": bool(result.get("escalate_to_rsk", True)),
        "status": "flagged_for_rsk",
        "rsk_notes": None,
        "created_at": datetime.now(timezone.utc),
    }
    ref = db.collection(COLLECTION).document()
    ref.set(record)
    return doc_to_dict(ref.get())


@router.get("/health/logs", response_model=list[HealthLogOut])
def list_health_logs(status: str | None = None, farmer_id: str | None = None):
    query = db.collection(COLLECTION)
    if status:
        query = query.where("status", "==", status)
    if farmer_id:
        query = query.where("farmer_id", "==", farmer_id)
    docs = query.order_by("created_at", direction="DESCENDING").stream()
    return [doc_to_dict(d) for d in docs]


@router.get("/health/log/{log_id}", response_model=HealthLogOut)
def get_health_log(log_id: str):
    return get_or_404(db.collection(COLLECTION), log_id, "Health log")


@router.patch("/health/log/{log_id}/resolve", response_model=HealthLogOut, dependencies=[Depends(require_admin)])
def resolve_health_log(log_id: str, payload: HealthLogResolve):
    """RSK officer action — marks a flagged case resolved with notes."""
    get_or_404(db.collection(COLLECTION), log_id, "Health log")
    db.collection(COLLECTION).document(log_id).update(
        {"status": payload.status, "rsk_notes": payload.rsk_notes}
    )
    return doc_to_dict(db.collection(COLLECTION).document(log_id).get())
