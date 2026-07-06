"""
Live forecast_dry_days via OpenWeatherMap — per 08_REAL_DATA_GUNTUR.md.
This is the one field in ward_data that should stay live rather than static;
everything else (soil_type, avg_rainfall_mm, groundwater_depth_m) is a
one-time real-data pull seeded via scripts/seed_data.py.
"""
import requests

from app.config import get_settings

settings = get_settings()

OWM_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"


class WeatherServiceError(Exception):
    pass


def get_forecast_dry_days(lat: float, lon: float) -> int:
    """Returns the approximate number of dry days (no rain) in the next 5-day
    OpenWeatherMap forecast window for the given coordinates."""
    if not settings.openweather_api_key:
        raise WeatherServiceError("OPENWEATHER_API_KEY is not set")

    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.openweather_api_key,
        "units": "metric",
    }
    resp = requests.get(OWM_FORECAST_URL, params=params, timeout=15)
    if resp.status_code != 200:
        raise WeatherServiceError(f"OpenWeatherMap error {resp.status_code}: {resp.text}")

    data = resp.json()
    dry_blocks = 0
    for entry in data.get("list", []):
        rain = entry.get("rain", {}).get("3h", 0)
        if rain == 0:
            dry_blocks += 1
    # 8 x 3-hour blocks per day -> approx dry days in the 5-day forecast window
    return dry_blocks // 8
