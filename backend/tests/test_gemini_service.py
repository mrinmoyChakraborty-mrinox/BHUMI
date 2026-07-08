"""Unit tests for app/services/gemini_service.py — mocks the HTTP call."""

import json
from unittest.mock import patch

import pytest

from app.services.gemini_service import (
    GeminiError,
    _extract_text,
    _parse_json_block,
    get_crop_recommendation,
)


class TestExtractText:
    def test_extracts_simple_text(self):
        resp = {"candidates": [{"content": {"parts": [{"text": "hello"}]}}]}
        assert _extract_text(resp) == "hello"

    def test_concatenates_multiple_parts(self):
        resp = {
            "candidates": [
                {"content": {"parts": [{"text": "hello "}, {"text": "world"}]}}
            ]
        }
        assert _extract_text(resp) == "hello world"

    def test_raises_on_missing_candidates(self):
        with pytest.raises(GeminiError):
            _extract_text({"candidates": []})


class TestParseJsonBlock:
    def test_parses_clean_json(self):
        result = _parse_json_block('{"a": 1}')
        assert result == {"a": 1}

    def test_strips_json_fence(self):
        result = _parse_json_block('```json\n{"a": 1}\n```')
        assert result == {"a": 1}

    def test_strips_plain_fence(self):
        result = _parse_json_block('```\n{"a": 1}\n```')
        assert result == {"a": 1}

    def test_raises_on_invalid_json(self):
        with pytest.raises(GeminiError):
            _parse_json_block("this is not json")


class TestGetCropRecommendation:
    @patch("app.services.gemini_service._call_gemini")
    def test_returns_parsed_json(self, mock_call):
        expected = {
            "recommended_crop": "Rice",
            "rationale": "Based on rainfall X",
            "confidence": "high",
            "data_gaps": None,
        }
        mock_call.return_value = {
            "candidates": [{"content": {"parts": [{"text": json.dumps(expected)}]}}]
        }

        result = get_crop_recommendation(
            ward_id="w1",
            district="Guntur",
            soil_type="Black Cotton Soil",
            avg_rainfall_mm=846.9,
            groundwater_depth_m=4.0,
            current_crop="Cotton",
            crop_stage="flowering",
            language="en",
        )
        assert result == expected

    @patch("app.services.gemini_service._call_gemini")
    def test_raises_on_gemini_error(self, mock_call):
        mock_call.side_effect = GeminiError("API error")
        with pytest.raises(GeminiError):
            get_crop_recommendation(
                ward_id="w1",
                district="Guntur",
                soil_type="Black",
                avg_rainfall_mm=500,
                groundwater_depth_m=3,
                current_crop=None,
                crop_stage=None,
            )
