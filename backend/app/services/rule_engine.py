"""
Simple, explainable rule engine — per 04_TASKS.md Phase 1.
Deliberately not ML-based: judges/RSK officers should be able to read the
condition and understand exactly why an alert fired.
"""

DRY_SPELL_THRESHOLD_DAYS = 3
SENSITIVE_STAGES = {"flowering", "sowing"}


def should_trigger_dry_spell_alert(forecast_dry_days: int, crop_stage: str | None) -> bool:
    stage = (crop_stage or "").lower()
    return forecast_dry_days >= DRY_SPELL_THRESHOLD_DAYS and stage in SENSITIVE_STAGES


def evaluate_alert_condition(alert_type: str, forecast_dry_days: int, crop_stage: str | None, force: bool) -> bool:
    if force:
        return True
    if alert_type == "dry_spell":
        return should_trigger_dry_spell_alert(forecast_dry_days, crop_stage)
    # irrigation / fertilization / general_advisory are currently manually/dashboard-triggered
    return True
