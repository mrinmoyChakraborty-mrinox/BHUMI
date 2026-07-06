from datetime import datetime, timezone
from fastapi import APIRouter, Depends

from app.firebase_client import db
from app.firestore_utils import doc_to_dict, get_or_404, clean_update
from app.schemas import PlotCreate, PlotUpdate, PlotOut
from app.auth import require_admin

router = APIRouter(prefix="/plots", tags=["Plots"])
COLLECTION = "plots"


@router.get("", response_model=list[PlotOut])
def list_plots(farmer_id: str | None = None, ward_id: str | None = None):
    query = db.collection(COLLECTION)
    if farmer_id:
        query = query.where("farmer_id", "==", farmer_id)
    if ward_id:
        query = query.where("ward_id", "==", ward_id)
    return [doc_to_dict(d) for d in query.stream()]


@router.get("/{plot_id}", response_model=PlotOut)
def get_plot(plot_id: str):
    return get_or_404(db.collection(COLLECTION), plot_id, "Plot")


@router.post("", response_model=PlotOut, status_code=201)
def create_plot(payload: PlotCreate):
    data = payload.model_dump()
    data["last_updated"] = datetime.now(timezone.utc)
    ref = db.collection(COLLECTION).document()
    ref.set(data)
    return doc_to_dict(ref.get())


@router.patch("/{plot_id}", response_model=PlotOut)
def update_plot(plot_id: str, payload: PlotUpdate):
    get_or_404(db.collection(COLLECTION), plot_id, "Plot")
    updates = clean_update(payload.model_dump())
    if updates:
        updates["last_updated"] = datetime.now(timezone.utc)
        db.collection(COLLECTION).document(plot_id).update(updates)
    return doc_to_dict(db.collection(COLLECTION).document(plot_id).get())


@router.delete("/{plot_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_plot(plot_id: str):
    get_or_404(db.collection(COLLECTION), plot_id, "Plot")
    db.collection(COLLECTION).document(plot_id).delete()
