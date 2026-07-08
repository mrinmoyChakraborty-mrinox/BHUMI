import logging

import requests

from app.config import get_settings

logger = logging.getLogger("kisan-alert.geocoding")
settings = get_settings()

GEOCODE_URL = "https://maps.googleapis.com/maps/api/geocode/json"


class GeocodingError(Exception):
    pass


def geocode_district(district: str, state: str) -> dict:
    if not settings.google_maps_api_key:
        raise GeocodingError("GOOGLE_MAPS_API_KEY is not set")

    address = f"{district}, {state}, India"
    params = {"address": address, "key": settings.google_maps_api_key}
    resp = requests.get(GEOCODE_URL, params=params, timeout=15)
    if resp.status_code != 200:
        raise GeocodingError(
            f"Google Maps Geocoding API error {resp.status_code}: {resp.text}"
        )

    data = resp.json()
    if data.get("status") != "OK" or not data.get("results"):
        raise GeocodingError(
            f"Could not geocode address '{address}': {data.get('status')}"
        )

    location = data["results"][0]["geometry"]["location"]
    return {"lat": location["lat"], "lon": location["lng"]}
