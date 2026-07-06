"""Unit tests for twilio_service.py — assert on generated TwiML XML."""

from app.services.twilio_service import (
    build_outbound_advisory_twiml,
    build_confirmation_twiml,
)


class TestBuildOutboundAdvisoryTwiml:
    def test_contains_gather_and_say(self):
        twiml = build_outbound_advisory_twiml("Irrigate now", "en")
        xml = str(twiml)
        assert "<Response>" in xml
        assert "<Gather" in xml
        assert "<Say" in xml
        assert "Irrigate now" in xml

    def test_uses_correct_language_code(self):
        twiml = build_outbound_advisory_twiml("Hello", "hi")
        xml = str(twiml)
        assert 'language="hi-IN"' in xml

    def test_includes_gather_action(self):
        twiml = build_outbound_advisory_twiml("Test", "en")
        xml = str(twiml)
        assert 'method="POST"' in xml
        assert 'numDigits="1"' in xml


class TestBuildConfirmationTwiml:
    def test_returns_say_response(self):
        twiml = build_confirmation_twiml("Thank you", "en")
        xml = str(twiml)
        assert "<Response>" in xml
        assert "<Say" in xml
        assert "Thank you" in xml

    def test_uses_correct_language_code(self):
        twiml = build_confirmation_twiml("Dhanyavaad", "hi")
        xml = str(twiml)
        assert 'language="hi-IN"' in xml
