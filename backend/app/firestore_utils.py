from typing import Optional
from fastapi import HTTPException
from google.cloud.firestore_v1 import DocumentSnapshot


def doc_to_dict(snap: DocumentSnapshot) -> dict:
    data = snap.to_dict() or {}
    data["id"] = snap.id
    return data


def get_or_404(collection, doc_id: str, label: str = "Resource") -> dict:
    snap = collection.document(doc_id).get()
    if not snap.exists:
        raise HTTPException(status_code=404, detail=f"{label} '{doc_id}' not found")
    return doc_to_dict(snap)


def clean_update(fields: dict) -> dict:
    """Drop None values so partial PATCH updates don't overwrite existing fields."""
    return {k: v for k, v in fields.items() if v is not None}
