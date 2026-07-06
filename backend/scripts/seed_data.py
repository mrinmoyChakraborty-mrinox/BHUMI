"""
Seeds Firestore with real district/ward data for Guntur, Andhra Pradesh —
sourced from the AP government district portal and CGWB reports, per
08_REAL_DATA_GUNTUR.md. Run once after Firebase project setup:

    python -m scripts.seed_data

Safe to re-run: uses deterministic doc IDs for districts/wards so it upserts
rather than duplicating rows. Farmers/plots use a fixed demo set — delete
the 'demo-farmer-*' docs manually if you want to reseed those.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from datetime import datetime, timezone
from app.firebase_client import db

GUNTUR_DISTRICT_ID = "guntur"
GUNTUR_LAT, GUNTUR_LON = 16.3067, 80.4365


def seed_district():
    db.collection("districts").document(GUNTUR_DISTRICT_ID).set(
        {
            "name": "Guntur",
            "state": "Andhra Pradesh",
            "notes": (
                "Normal annual rainfall 846.9mm, area 11,328 sq km. "
                "Groundwater is the primary irrigation source. "
                "Source: AP Govt district portal + CGWB Ground Water Overview, Guntur District."
            ),
            "created_at": datetime.now(timezone.utc),
        }
    )
    print(f"Seeded district: {GUNTUR_DISTRICT_ID}")


def seed_wards():
    wards = [
        {
            "ward_id": "guntur-ward-01",
            "district_id": GUNTUR_DISTRICT_ID,
            "soil_type": "Black Cotton Soil",
            "avg_rainfall_mm": 846.9,
            "groundwater_depth_m": 4.0,
            "forecast_dry_days": 0,
            "lat": GUNTUR_LAT,
            "lon": GUNTUR_LON,
        },
        {
            "ward_id": "guntur-ward-02",
            "district_id": GUNTUR_DISTRICT_ID,
            "soil_type": "Red Loamy Soil",
            "avg_rainfall_mm": 846.9,
            "groundwater_depth_m": 6.5,
            "forecast_dry_days": 0,
            "lat": GUNTUR_LAT,
            "lon": GUNTUR_LON,
        },
    ]
    for w in wards:
        ward_id = w.pop("ward_id")
        w["updated_at"] = datetime.now(timezone.utc)
        db.collection("ward_data").document(ward_id).set(w)
        print(f"Seeded ward: {ward_id}")


def seed_demo_farmers_and_plots():
    demo_farmers = [
        {"doc_id": "demo-farmer-1", "name": "Ravi Kumar", "phone": "+91XXXXXXXXXX",
         "preferred_language": "te", "ward_id": "guntur-ward-01"},
        {"doc_id": "demo-farmer-2", "name": "Lakshmi Devi", "phone": "+91XXXXXXXXXX",
         "preferred_language": "hi", "ward_id": "guntur-ward-02"},
    ]
    for f in demo_farmers:
        doc_id = f.pop("doc_id")
        f["created_at"] = datetime.now(timezone.utc)
        db.collection("farmers").document(doc_id).set(f)
        print(f"Seeded farmer: {doc_id} (replace phone with a real verified Twilio number before demo)")

        plot_id = f"{doc_id}-plot-1"
        db.collection("plots").document(plot_id).set(
            {
                "farmer_id": doc_id,
                "ward_id": f["ward_id"],
                "soil_type": None,  # falls back to ward soil_type in /recommend
                "groundwater_depth_m": None,
                "avg_rainfall_mm": None,
                "current_crop": "Cotton" if f["ward_id"] == "guntur-ward-01" else "Chillies",
                "crop_stage": "flowering",
                "last_updated": datetime.now(timezone.utc),
            }
        )
        print(f"Seeded plot: {plot_id}")


if __name__ == "__main__":
    seed_district()
    seed_wards()
    seed_demo_farmers_and_plots()
    print("\nDone. Remember to replace the demo farmer phone numbers with real, "
          "Twilio-verified numbers before your live demo.")
