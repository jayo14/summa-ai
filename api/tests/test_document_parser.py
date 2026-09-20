"""Tests for multi-format document parser (PDF, DOCX, TXT, Markdown)."""

import io
from unittest.mock import MagicMock, patch

import pytest

from app.services.document_parser import DocumentParser, ParseResult, PageSection


# ---------------------------------------------------------------------------
# Plain-text / Markdown extraction
# ---------------------------------------------------------------------------


class TestTextExtraction:
    def test_utf8_text_file(self):
        content = "Hello, world!\n\nSecond paragraph.".encode("utf-8")
        result = DocumentParser.extract_text("notes.txt", content)
        assert result.format == "txt"
        assert "Hello, world!" in result.full_text
        assert len(result.sections) >= 1

    def test_latin1_fallback(self):
        content = "R\xe9sum\xe9 na\xefve caf\xe9".encode("latin-1")
        result = DocumentParser.extract_text("notes.txt", content)
        assert "caf" in result.full_text

    def test_markdown_detected_as_markdown(self):
        content = b"# Heading\n\nSome text."
        result = DocumentParser.extract_text("notes.md", content)
        assert result.format == "markdown"

    def test_markdown_extension_variant(self):
        content = b"# Heading\n\nSome text."
        result = DocumentParser.extract_text("notes.markdown", content)
        assert result.format == "markdown"

    def test_sections_group_paragraphs(self):
        # 20 paragraphs → should create 2 sections (10 per group)
        paras = [f"Paragraph {i}." for i in range(20)]
        content = "\n\n".join(paras).encode("utf-8")
        result = DocumentParser.extract_text("long.txt", content)
        assert len(result.sections) == 2
        assert result.sections[0].location == "Section 1"
        assert result.sections[1].location == "Section 2"

    def test_empty_text_raises(self):
        with pytest.raises(ValueError, match="Empty text file"):
            DocumentParser.extract_text("empty.txt", b"   \n\n  ")

    def test_empty_content_raises(self):
        with pytest.raises(ValueError, match="Empty file content"):
            DocumentParser.extract_text("file.txt", b"")


# ---------------------------------------------------------------------------
# PDF extraction (mocked pypdf)
# ---------------------------------------------------------------------------


class TestPdfExtraction:
    def test_pdf_extracts_pages(self):
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Page one content"
        mock_page2 = MagicMock()
        mock_page2.extract_text.return_value = "Page two content"

        mock_reader = MagicMock()
        mock_reader.pages = [mock_page1, mock_page2]

        with patch("pypdf.PdfReader", return_value=mock_reader):
            result = DocumentParser.extract_text("lecture.pdf", b"%PDF-fake")

        assert result.format == "pdf"
        assert result.page_count == 2
        assert len(result.sections) == 2
        assert result.sections[0].location == "Page 1"
        assert result.sections[1].location == "Page 2"
        assert "Page one content" in result.full_text
        assert "Page two content" in result.full_text

    def test_pdf_skips_blank_pages(self):
        mock_page1 = MagicMock()
        mock_page1.extract_text.return_value = "Content here"
        mock_page2 = MagicMock()
        mock_page2.extract_text.return_value = ""  # blank page
        mock_page3 = MagicMock()
        mock_page3.extract_text.return_value = "More content"

        mock_reader = MagicMock()
        mock_reader.pages = [mock_page1, mock_page2, mock_page3]

        with patch("pypdf.PdfReader", return_value=mock_reader):
            result = DocumentParser.extract_text("test.pdf", b"%PDF-fake")

        assert result.page_count == 3  # total pages in document
        assert len(result.sections) == 2  # only non-blank pages become sections

    def test_pdf_image_only_returns_empty_text(self):
        mock_page = MagicMock()
        mock_page.extract_text.return_value = None

        mock_reader = MagicMock()
        mock_reader.pages = [mock_page]

        with patch("pypdf.PdfReader", return_value=mock_reader):
            result = DocumentParser.extract_text("scanned.pdf", b"%PDF-fake")

        assert result.full_text == ""
        assert len(result.sections) == 0


# ---------------------------------------------------------------------------
# DOCX extraction (mocked python-docx)
# ---------------------------------------------------------------------------


class TestDocxExtraction:
    def _make_para(self, text: str, style_name: str = "Normal"):
        para = MagicMock()
        para.text = text
        para.style = MagicMock()
        para.style.name = style_name
        return para

    def test_docx_basic_extraction(self):
        paragraphs = [
            self._make_para("Introduction text"),
            self._make_para("More details here"),
        ]

        mock_doc = MagicMock()
        mock_doc.paragraphs = paragraphs

        with patch("docx.Document", return_value=mock_doc):
            result = DocumentParser.extract_text("essay.docx", b"PK-fake-docx")

        assert result.format == "docx"
        assert "Introduction text" in result.full_text
        assert "More details here" in result.full_text

    def test_docx_heading_creates_sections(self):
        paragraphs = [
            self._make_para("Intro text"),
            self._make_para("Chapter 1", "Heading 1"),
            self._make_para("Chapter 1 body"),
            self._make_para("Chapter 2", "Heading 1"),
            self._make_para("Chapter 2 body"),
        ]

        mock_doc = MagicMock()
        mock_doc.paragraphs = paragraphs

        with patch("docx.Document", return_value=mock_doc):
            result = DocumentParser.extract_text("thesis.docx", b"PK-fake")

        # First section: "Section 1" with "Intro text"
        # Second section: "Chapter 1" heading creates boundary
        # Third section: "Chapter 2" heading creates boundary
        assert len(result.sections) == 3
        assert result.sections[0].location == "Section 1"
        assert result.sections[1].location == "Chapter 1"
        assert result.sections[2].location == "Chapter 2"

    def test_docx_skips_empty_paragraphs(self):
        paragraphs = [
            self._make_para("Content"),
            self._make_para(""),  # empty
            self._make_para("   "),  # whitespace only
            self._make_para("More content"),
        ]

        mock_doc = MagicMock()
        mock_doc.paragraphs = paragraphs

        with patch("docx.Document", return_value=mock_doc):
            result = DocumentParser.extract_text("doc.docx", b"PK-fake")

        # Empty paragraphs should be skipped
        assert "Content" in result.full_text
        assert "More content" in result.full_text


# ---------------------------------------------------------------------------
# Unsupported formats
# ---------------------------------------------------------------------------


class TestUnsupportedFormats:
    def test_unsupported_extension_raises(self):
        with pytest.raises(ValueError, match="Unsupported file format"):
            DocumentParser.extract_text("image.png", b"PNG-data")

    def test_no_extension_raises(self):
        with pytest.raises(ValueError, match="Unsupported file format"):
            DocumentParser.extract_text("README", b"some text")


# ---------------------------------------------------------------------------
# ParseResult and PageSection data classes
# ---------------------------------------------------------------------------


class TestDataClasses:
    def test_parse_result_defaults(self):
        r = ParseResult(full_text="hello")
        assert r.sections == []
        assert r.page_count == 0
        assert r.format == "unknown"

    def test_page_section_fields(self):
        s = PageSection(location="Page 1", text="content", index=0)
        assert s.location == "Page 1"
        assert s.text == "content"
        assert s.index == 0
