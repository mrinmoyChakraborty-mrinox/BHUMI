from datetime import datetime, timezone
from fastapi import APIRouter, Depends

from app.firebase_client import db
from app.firestore_utils import doc_to_dict, get_or_404, clean_update
from app.schemas import FarmerCreate, FarmerUpdate, FarmerOut
from app.auth import require_admin

router = APIRouter(prefix="/farmers", tags=["Farmers"])
COLLECTION = "farmers"


@router.get("", response_model=list[FarmerOut])
def list_farmers(ward_id: str | None = None):
    query = db.collection(COLLECTION)
    if ward_id:
        query = query.where("ward_id", "==", ward_id)
    return [doc_to_dict(d) for d in query.stream()]


@router.get("/{farmer_id}", response_model=FarmerOut)
def get_farmer(farmer_id: str):
    return get_or_404(db.collection(COLLECTION), farmer_id, "Farmer")


@router.post("", response_model=FarmerOut, status_code=201)
def create_farmer(payload: FarmerCreate):
    # Intentionally unauthenticated create — farmer registration can happen via
    # a field-agent flow or an RSK officer on the dashboard; tighten with
    # Depends(require_admin) if you want registration locked to officers only.
    data = payload.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    ref = db.collection(COLLECTION).document()
    ref.set(data)
    return doc_to_dict(ref.get())


@router.patch("/{farmer_id}", response_model=FarmerOut, dependencies=[Depends(require_admin)])
def update_farmer(farmer_id: str, payload: FarmerUpdate):
    get_or_404(db.collection(COLLECTION), farmer_id, "Farmer")
    updates = clean_update(payload.model_dump())
    if updates:
        db.collection(COLLECTION).document(farmer_id).update(updates)
    return doc_to_dict(db.collection(COLLECTION).document(farmer_id).get())


@router.delete("/{farmer_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_farmer(farmer_id: str):
    get_or_404(db.collection(COLLECTION), farmer_id, "Farmer")
    db.collection(COLLECTION).document(farmer_id).delete()
