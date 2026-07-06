"""Unit tests for app/services/rule_engine.py — pure logic, no mocking needed."""

from app.services.rule_engine import (
    evaluate_alert_condition,
    should_trigger_dry_spell_alert,
)


class TestShouldTriggerDrySpell:
    def test_triggers_when_above_threshold_and_sensitive_stage(self):
        assert should_trigger_dry_spell_alert(5, "flowering") is True

    def test_triggers_when_at_threshold_and_sensitive_stage(self):
        assert should_trigger_dry_spell_alert(3, "flowering") is True

    def test_not_triggered_when_below_threshold(self):
        assert should_trigger_dry_spell_alert(2, "flowering") is False

    def test_not_triggered_when_zero_dry_days(self):
        assert should_trigger_dry_spell_alert(0, "sowing") is False

    def test_not_triggered_when_stage_not_sensitive(self):
        assert should_trigger_dry_spell_alert(5, "harvest") is False

    def test_case_insensitive_stage(self):
        assert should_trigger_dry_spell_alert(4, "FLOWERING") is True

    def test_none_stage(self):
        assert should_trigger_dry_spell_alert(4, None) is False

    def test_sowing_is_sensitive(self):
        assert should_trigger_dry_spell_alert(3, "sowing") is True


class TestEvaluateAlertCondition:
    def test_force_bypasses_threshold(self):
        assert evaluate_alert_condition("dry_spell", 0, "harvest", force=True) is True

    def test_dry_spell_delegates_to_should_trigger(self):
        assert (
            evaluate_alert_condition("dry_spell", 5, "flowering", force=False) is True
        )
        assert evaluate_alert_condition("dry_spell", 0, "harvest", force=False) is False

    def test_other_alert_types_default_to_true(self):
        assert evaluate_alert_condition("irrigation", 0, None, force=False) is True
        assert evaluate_alert_condition("fertilization", 0, None, force=False) is True
        assert (
            evaluate_alert_condition("general_advisory", 0, None, force=False) is True
        )
