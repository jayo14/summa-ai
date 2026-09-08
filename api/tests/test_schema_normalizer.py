"""Tests for the Gemini schema normalization layer.

Verifies that Pydantic JSON Schemas are correctly converted into Gemini-
compatible inline schemas that contain no unsupported constructs.
"""

import pytest

from app.services.schema_normalizer import normalize_for_gemini
from app.models.components import (
    QuizComponent,
    FlashcardsComponent,
    ShortAnswerComponent,
    RecallPromptComponent,
    HexagonComponent,
    ComparisonComponent,
    GapAnalysisComponent,
    COMPONENT_TYPE_MAP,
)


class TestSchemaNormalization:
    @pytest.mark.parametrize("component_type", list(COMPONENT_TYPE_MAP.keys()))
    def test_all_component_schemas_have_no_unsupported_keys(self, component_type):
        schema_cls = COMPONENT_TYPE_MAP[component_type]
        schema = schema_cls.model_json_schema()
        normalized = normalize_for_gemini(schema)

        assert normalized is not None

        text = str(normalized)
        assert "$defs" not in text
        assert "$ref" not in text
        assert "$schema" not in text
        assert '"const"' not in text
        assert "discriminator" not in text

    def test_quiz_schema_resolves_refs(self):
        schema = QuizComponent.model_json_schema()
        normalized = normalize_for_gemini(schema)

        assert normalized["type"] == "object"
        assert "questions" in normalized["properties"]
        assert normalized["properties"]["questions"]["type"] == "array"
        # items should be an inline object, not a $ref
        items = normalized["properties"]["questions"]["items"]
        assert "type" in items
        assert items["type"] == "object"
        assert "$ref" not in str(items)

    def test_quiz_question_options_preserved(self):
        schema = QuizComponent.model_json_schema()
        normalized = normalize_for_gemini(schema)

        items_prop = normalized["properties"]["questions"]["items"]
        props = items_prop["properties"]
        assert "options" in props
        assert props["options"]["type"] == "array"

    def test_const_converted_to_enum(self):
        schema = QuizComponent.model_json_schema()
        normalized = normalize_for_gemini(schema)

        # The "type" field has a const value "quiz" — should become enum
        type_field = normalized["properties"]["type"]
        assert "enum" in type_field
        assert type_field["enum"] == ["quiz"]

    def test_none_schema_returns_none(self):
        assert normalize_for_gemini(None) is None
        assert normalize_for_gemini({}) is None

    def test_flashcards_schema_no_refs(self):
        schema = FlashcardsComponent.model_json_schema()
        normalized = normalize_for_gemini(schema)
        assert "$ref" not in str(normalized)

    def test_comparison_schema_no_refs(self):
        schema = ComparisonComponent.model_json_schema()
        normalized = normalize_for_gemini(schema)
        assert "$ref" not in str(normalized)

    def test_gap_analysis_schema_no_refs(self):
        schema = GapAnalysisComponent.model_json_schema()
        normalized = normalize_for_gemini(schema)
        assert "$ref" not in str(normalized)
