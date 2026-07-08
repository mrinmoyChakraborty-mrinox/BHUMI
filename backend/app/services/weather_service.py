"""
Live forecast_dry_days via OpenWeatherMap — per 08_REAL_DATA_GUNTUR.md.
This is the one field in ward_data that should stay live rather than static;
everything else (soil_type, avg_rainfall_mm, groundwater_depth_m) is a
one-time real-data pull seeded via scripts/seed_data.py.
"""

import logging

import requests
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.config import get_settings

logger = logging.getLogger("kisan-alert.weather")
settings = get_settings()

OWM_FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast"
OWM_CURRENT_URL = "https://api.openweathermap.org/data/2.5/weather"


class WeatherServiceError(Exception):
    pass


@retry(
    retry=retry_if_exception_type((requests.ConnectionError, requests.Timeout)),
    stop=stop_after_attempt(3),
    wait=wait_exponential(multiplier=1, min=1, max=10),
    before_sleep=lambda retry_state: logger.warning(
        "OpenWeatherMap call attempt %d failed, retrying...", retry_state.attempt_number
    ),
)
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
        raise WeatherServiceError(
            f"OpenWeatherMap error {resp.status_code}: {resp.text}"
        )

    data = resp.json()
    dry_blocks = 0
    for entry in data.get("list", []):
        rain = entry.get("rain", {}).get("3h", 0)
        if rain == 0:
            dry_blocks += 1
    # 8 x 3-hour blocks per day -> approx dry days in the 5-day forecast window
    return dry_blocks // 8


def get_current_weather_metrics(lat: float, lon: float) -> dict:
    if not settings.openweather_api_key:
        raise WeatherServiceError("OPENWEATHER_API_KEY is not set")

    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.openweather_api_key,
        "units": "metric",
    }
    resp = requests.get(OWM_CURRENT_URL, params=params, timeout=15)
    if resp.status_code != 200:
        raise WeatherServiceError(
            f"OpenWeatherMap current-weather error {resp.status_code}: {resp.text}"
        )

    data = resp.json()
    main = data.get("main", {})
    wind = data.get("wind", {})
    rain = data.get("rain", {})

    temperature = main.get("temp")
    humidity = main.get("humidity")
    wind_speed = wind.get("speed", 0)

    # soilMoisture: estimated from humidity + recent rain
    rain_1h = rain.get("1h", 0)
    if rain_1h > 0:
        soil_moisture = min(100, humidity * 0.5 + rain_1h * 10)
    else:
        soil_moisture = round(humidity * 0.3, 1) if humidity else None

    # pestRiskIndex: simple heuristic based on humidity + temperature
    if humidity is not None and temperature is not None:
        if humidity > 70 and temperature > 30:
            pest_risk = "high"
        elif humidity > 70 or temperature > 30:
            pest_risk = "medium"
        else:
            pest_risk = "low"
    else:
        pest_risk = "unknown"

    return {
        "temperature": temperature,
        "humidity": humidity,
        "wind_speed": wind_speed,
        "soilMoisture": soil_moisture,
        "soilMoisture_note": "estimated from humidity and rainfall — not a direct sensor reading",
        "pestRiskIndex": pest_risk,
    }
