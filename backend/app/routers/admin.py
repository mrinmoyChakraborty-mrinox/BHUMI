from datetime import datetime, timezone
from fastapi import APIRouter, Depends

from app.firebase_client import db, set_admin_claim
from app.firestore_utils import doc_to_dict, get_or_404, clean_update
from app.schemas import OfficerCreate, OfficerUpdate, OfficerOut
from app.auth import require_admin

router = APIRouter(
    prefix="/admin", tags=["Admin"], dependencies=[Depends(require_admin)]
)
COLLECTION = "rsk_officers"


@router.get("/officers", response_model=list[OfficerOut])
def list_officers(ward_id: str | None = None):
    query = db.collection(COLLECTION)
    if ward_id:
        query = query.where("ward_id", "==", ward_id)
    return [doc_to_dict(d) for d in query.stream()]


@router.get("/officers/{uid}", response_model=OfficerOut)
def get_officer(uid: str):
    return get_or_404(db.collection(COLLECTION), uid, "Officer")


@router.post("/officers", response_model=OfficerOut, status_code=201)
def create_officer(payload: OfficerCreate):
    """Creates the Firestore profile for an RSK officer / admin. Assumes the
    Firebase Auth user (payload.uid) already exists — create that via Firebase
    Auth (console, SDK, or a separate signup flow) first."""
    data = payload.model_dump(exclude={"uid"})
    data["created_at"] = datetime.now(timezone.utc)
    db.collection(COLLECTION).document(payload.uid).set(data)
    if payload.role == "admin":
        set_admin_claim(payload.uid, True)
    return doc_to_dict(db.collection(COLLECTION).document(payload.uid).get())


@router.patch("/officers/{uid}", response_model=OfficerOut)
def update_officer(uid: str, payload: OfficerUpdate):
    get_or_404(db.collection(COLLECTION), uid, "Officer")
    updates = clean_update(payload.model_dump())
    if updates:
        db.collection(COLLECTION).document(uid).update(updates)
    if updates.get("role") == "admin":
        set_admin_claim(uid, True)
    elif updates.get("role") == "rsk_officer":
        set_admin_claim(uid, False)
    return doc_to_dict(db.collection(COLLECTION).document(uid).get())


@router.delete("/officers/{uid}", status_code=204)
def delete_officer(uid: str):
    get_or_404(db.collection(COLLECTION), uid, "Officer")
    db.collection(COLLECTION).document(uid).delete()
    set_admin_claim(uid, False)
