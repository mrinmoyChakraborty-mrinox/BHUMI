from datetime import datetime, timezone
from fastapi import APIRouter, Depends

from app.firebase_client import db
from app.firestore_utils import doc_to_dict, get_or_404, clean_update
from app.schemas import DistrictCreate, DistrictUpdate, DistrictOut
from app.auth import require_admin

router = APIRouter(prefix="/districts", tags=["Districts"])
COLLECTION = "districts"


@router.get("", response_model=list[DistrictOut])
def list_districts():
    docs = db.collection(COLLECTION).stream()
    return [doc_to_dict(d) for d in docs]


@router.get("/{district_id}", response_model=DistrictOut)
def get_district(district_id: str):
    return get_or_404(db.collection(COLLECTION), district_id, "District")


@router.post("", response_model=DistrictOut, status_code=201, dependencies=[Depends(require_admin)])
def create_district(payload: DistrictCreate):
    data = payload.model_dump()
    data["created_at"] = datetime.now(timezone.utc)
    ref = db.collection(COLLECTION).document()
    ref.set(data)
    return doc_to_dict(ref.get())


@router.patch("/{district_id}", response_model=DistrictOut, dependencies=[Depends(require_admin)])
def update_district(district_id: str, payload: DistrictUpdate):
    get_or_404(db.collection(COLLECTION), district_id, "District")
    updates = clean_update(payload.model_dump())
    if updates:
        db.collection(COLLECTION).document(district_id).update(updates)
    return doc_to_dict(db.collection(COLLECTION).document(district_id).get())


@router.delete("/{district_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_district(district_id: str):
    get_or_404(db.collection(COLLECTION), district_id, "District")
    db.collection(COLLECTION).document(district_id).delete()
