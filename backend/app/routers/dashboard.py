from fastapi import APIRouter, Depends

from app.firebase_client import db
from app.firestore_utils import doc_to_dict
from app.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"], dependencies=[Depends(get_current_user)])


@router.get("/farmers")
def dashboard_farmers(ward_id: str | None = None):
    """Farmer list with ward, current crop, and their most recent alert status —
    per 07_API_SPEC.md GET /dashboard/farmers."""
    query = db.collection("farmers")
    if ward_id:
        query = query.where("ward_id", "==", ward_id)
    farmers = [doc_to_dict(d) for d in query.stream()]

    results = []
    for farmer in farmers:
        plots = [
            doc_to_dict(d)
            for d in db.collection("plots").where("farmer_id", "==", farmer["id"]).stream()
        ]
        latest_alert = None
        alert_docs = list(
            db.collection("alerts")
            .where("farmer_id", "==", farmer["id"])
            .order_by("created_at", direction="DESCENDING")
            .limit(1)
            .stream()
        )
        if alert_docs:
            latest_alert = doc_to_dict(alert_docs[0])

        results.append(
            {
                **farmer,
                "current_crop": plots[0].get("current_crop") if plots else None,
                "plot_count": len(plots),
                "latest_alert_status": (latest_alert or {}).get("status"),
            }
        )
    return results


@router.get("/alerts")
def dashboard_alerts(ward_id: str | None = None):
    """Active alerts, color-codeable by status on the frontend:
    red = no_response, yellow = sent, green = acknowledged."""
    docs = db.collection("alerts").order_by("created_at", direction="DESCENDING").stream()
    alerts = [doc_to_dict(d) for d in docs]

    if ward_id:
        plot_ids_in_ward = {
            d.id for d in db.collection("plots").where("ward_id", "==", ward_id).stream()
        }
        alerts = [a for a in alerts if a.get("plot_id") in plot_ids_in_ward]

    color_map = {"sent": "yellow", "acknowledged": "green", "no_response": "red"}
    for a in alerts:
        a["ui_color"] = color_map.get(a.get("status"), "yellow")
    return alerts


@router.get("/health-logs")
def dashboard_health_logs(status: str = "flagged_for_rsk"):
    docs = (
        db.collection("health_logs")
        .where("status", "==", status)
        .order_by("created_at", direction="DESCENDING")
        .stream()
    )
    return [doc_to_dict(d) for d in docs]


@router.get("/summary")
def dashboard_summary():
    """Quick counts for a top-of-dashboard stat strip."""
    farmers_count = len(list(db.collection("farmers").stream()))
    active_alerts = len(
        list(db.collection("alerts").where("status", "in", ["sent", "no_response"]).stream())
    )
    flagged_health = len(
        list(db.collection("health_logs").where("status", "==", "flagged_for_rsk").stream())
    )
    wards_count = len(list(db.collection("ward_data").stream()))
    return {
        "farmers": farmers_count,
        "active_alerts": active_alerts,
        "flagged_health_cases": flagged_health,
        "wards": wards_count,
    }
