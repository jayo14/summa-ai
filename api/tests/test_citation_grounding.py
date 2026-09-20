"""Tests for citation extraction, validation, and grounding."""

import pytest
from app.services.citation_grounding import (
    CitationExtractor,
    CitationValidator,
    CitationFormatter,
)


class TestCitationExtractor:
    def test_extract_single(self):
        text = "This is explained in [Source 1] of your notes."
        assert CitationExtractor.extract(text) == [1]

    def test_extract_multiple(self):
        text = "See [Source 2] and [Source 1] and [Source 3]."
        assert CitationExtractor.extract(text) == [2, 1, 3]

    def test_extract_none(self):
        assert CitationExtractor.extract("No citations here.") == []

    def test_has_citations_true(self):
        assert CitationExtractor.has_citations("Refer to [Source 1].") is True

    def test_has_citations_false(self):
        assert CitationExtractor.has_citations("No refs.") is False

    def test_replace_with_footnotes_dedup(self):
        text = "A [Source 1] and B [Source 1] and C [Source 2]."
        cleaned, sources = CitationExtractor.replace_with_footnotes(text)
        assert "[1]" in cleaned
        assert "[2]" in cleaned
        assert sources == [1, 2]


class TestCitationValidator:
    def test_all_valid(self):
        chunks = [{"id": "1"}, {"id": "2"}]
        result = CitationValidator.validate([1, 2], chunks)
        assert result["all_valid"] is True
        assert result["valid_sources"] == [1, 2]

    def test_invalid_source(self):
        chunks = [{"id": "1"}]
        result = CitationValidator.validate([1, 5], chunks)
        assert result["all_valid"] is False
        assert 5 in result["invalid_sources"]

    def test_empty_chunks(self):
        result = CitationValidator.validate([1], [])
        assert result["all_valid"] is False

    def test_zero_index_invalid(self):
        result = CitationValidator.validate([0], [{"id": "1"}])
        assert 0 in result["invalid_sources"]


class TestCitationFormatter:
    def test_format_footnotes(self):
        chunks = [
            {"material_title": "Notes Ch1", "chunk_text": "Hello world content here", "location": "Page 1", "score": 0.9},
            {"material_title": "Notes Ch2", "chunk_text": "Second chunk", "location": "Page 2", "score": 0.7},
        ]
        footnotes = CitationFormatter.format_footnotes([1, 2], chunks)
        assert len(footnotes) == 2
        assert footnotes[0]["title"] == "Notes Ch1"
        assert footnotes[1]["score"] == 0.7

    def test_ground_response(self):
        chunks = [
            {"material_title": "Lecture Notes", "chunk_text": "Polymorphism allows...", "location": "S3", "score": 0.85},
        ]
        text = "Polymorphism is covered in [Source 1] of your notes."
        result = CitationFormatter.ground_response(text, chunks)
        assert result["has_citations"] is True
        assert len(result["citations"]) == 1
        assert result["validation"]["all_valid"] is True

    def test_ground_response_no_citations(self):
        result = CitationFormatter.ground_response("No refs.", [])
        assert result["has_citations"] is False
        assert result["citations"] == []

    def test_ground_response_invalid_citation(self):
        chunks = [{"material_title": "X", "chunk_text": "Y", "location": "", "score": 0.5}]
        result = CitationFormatter.ground_response("See [Source 3].", chunks)
        assert result["validation"]["all_valid"] is False
