from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException, status

from app.firebase_client import db
from app.firestore_utils import doc_to_dict, get_or_404, clean_update
from app.schemas import FarmerCreate, FarmerUpdate, FarmerOut
from app.auth import require_admin, get_current_user

router = APIRouter(prefix="/farmers", tags=["Farmers"])
COLLECTION = "farmers"


@router.get("", response_model=dict)
def list_farmers(
    ward_id: str | None = None,
    limit: int = 50,
    start_after: str | None = None,
):
    query = db.collection(COLLECTION)
    if ward_id:
        query = query.where("ward_id", "==", ward_id)
    query = query.order_by("created_at", direction="DESCENDING")
    if start_after:
        cursor_doc = db.collection(COLLECTION).document(start_after).get()
        if cursor_doc.exists:
            query = query.start_after(cursor_doc)
    limit = min(limit, 200)
    docs = query.limit(limit).stream()
    items = [doc_to_dict(d) for d in docs]
    next_cursor = items[-1]["id"] if len(items) == limit else None
    return {"items": items, "next_cursor": next_cursor}


@router.get("/by-phone/{phone}", response_model=FarmerOut | None)
def get_farmer_by_phone(phone: str):
    docs = list(db.collection(COLLECTION).where("phone", "==", phone).limit(1).stream())
    return doc_to_dict(docs[0]) if docs else None


@router.get("/by-email/{email}", response_model=FarmerOut | None)
def get_farmer_by_email(email: str):
    docs = list(db.collection(COLLECTION).where("email", "==", email).limit(1).stream())
    return doc_to_dict(docs[0]) if docs else None


@router.get("/{farmer_id}", response_model=FarmerOut)
def get_farmer(farmer_id: str):
    return get_or_404(db.collection(COLLECTION), farmer_id, "Farmer")


@router.get("/{farmer_id}/timeline", response_model=dict)
def farmer_timeline(farmer_id: str, limit: int = 20):
    """Merges alerts + health_logs + recommendations for a farmer,
    sorted by created_at descending — useful for an RSK officer drill-down."""
    get_or_404(db.collection(COLLECTION), farmer_id, "Farmer")

    alerts = list(
        db.collection("alerts")
        .where("farmer_id", "==", farmer_id)
        .order_by("created_at", direction="DESCENDING")
        .limit(limit)
        .stream()
    )
    health_logs = list(
        db.collection("health_logs")
        .where("farmer_id", "==", farmer_id)
        .order_by("created_at", direction="DESCENDING")
        .limit(limit)
        .stream()
    )
    plots = list(db.collection("plots").where("farmer_id", "==", farmer_id).stream())
    plot_ids = [p.id for p in plots]
    recommendations = []
    if plot_ids:
        for pid in plot_ids:
            recs = list(
                db.collection("recommendations")
                .where("plot_id", "==", pid)
                .order_by("created_at", direction="DESCENDING")
                .limit(limit)
                .stream()
            )
            recommendations.extend(recs)

    events = []
    for d in alerts:
        item = doc_to_dict(d)
        item["event_type"] = "alert"
        events.append(item)
    for d in health_logs:
        item = doc_to_dict(d)
        item["event_type"] = "health_log"
        events.append(item)
    for d in recommendations:
        item = doc_to_dict(d)
        item["event_type"] = "recommendation"
        events.append(item)

    events.sort(key=lambda e: e.get("created_at") or datetime.min, reverse=True)
    events = events[:limit]

    return {"farmer_id": farmer_id, "events": events}


@router.post("", response_model=FarmerOut, status_code=201)
def create_farmer(payload: FarmerCreate):
    data = payload.dict()
    data["created_at"] = datetime.now(timezone.utc)
    ref = db.collection(COLLECTION).document()
    ref.set(data)
    return doc_to_dict(ref.get())


@router.patch(
    "/{farmer_id}", response_model=FarmerOut, dependencies=[Depends(require_admin)]
)
def update_farmer(farmer_id: str, payload: FarmerUpdate):
    get_or_404(db.collection(COLLECTION), farmer_id, "Farmer")
    updates = clean_update(payload.dict())
    if updates:
        db.collection(COLLECTION).document(farmer_id).update(updates)
    return doc_to_dict(db.collection(COLLECTION).document(farmer_id).get())


@router.delete("/{farmer_id}", status_code=204, dependencies=[Depends(require_admin)])
def delete_farmer(farmer_id: str):
    get_or_404(db.collection(COLLECTION), farmer_id, "Farmer")
    db.collection(COLLECTION).document(farmer_id).delete()


@router.patch("/{farmer_id}/self", response_model=FarmerOut)
async def update_own_farmer(
    farmer_id: str,
    payload: FarmerUpdate,
    authorization: str = Header(default=None),
):
    """Allow a farmer to update their own profile.

    The caller must be the owner — verified by matching the Firebase token's
    `phone_number` claim against the stored farmer phone.
    """
    decoded = await get_current_user(authorization=authorization)
    doc_ref = db.collection(COLLECTION).document(farmer_id)
    snap = doc_ref.get()
    if not snap.exists:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Farmer not found")

    token_phone = decoded.get("phone_number")
    if not token_phone or snap.to_dict().get("phone") != token_phone:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile",
        )

    allowed: dict = {}
    if payload.name is not None:
        allowed["name"] = payload.name
    if payload.preferred_language is not None:
        allowed["preferred_language"] = payload.preferred_language
    if payload.state is not None:
        allowed["state"] = payload.state
    if payload.district is not None:
        allowed["district"] = payload.district
    if payload.email is not None:
        allowed["email"] = payload.email

    if allowed:
        doc_ref.update(allowed)
    return doc_to_dict(doc_ref.get())
