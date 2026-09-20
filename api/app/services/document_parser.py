"""Multi-format academic document parser.

Extracts clean text from PDF, DOCX, TXT, and Markdown files with
page/section-level metadata so that downstream chunking can track the
originating location of every chunk.

Supported formats:
  .pdf       — uses pypdf for page-by-page text extraction
  .docx      — uses python-docx for paragraph-level extraction
  .txt/.md   — UTF-8 with Latin-1 fallback
"""

from __future__ import annotations

import io
import logging
import os
from dataclasses import dataclass, field
from typing import List, Tuple

logger = logging.getLogger(__name__)


@dataclass
class PageSection:
    """One page (PDF) or section (DOCX/TXT) of extracted text."""

    location: str  # e.g. "Page 3" or "Section 2"
    text: str
    index: int = 0


@dataclass
class ParseResult:
    """Result of parsing a document."""

    full_text: str
    sections: List[PageSection] = field(default_factory=list)
    page_count: int = 0
    format: str = "unknown"


class DocumentParser:
    """Stateless parser — call ``extract_text`` with raw bytes."""

    SUPPORTED_EXTENSIONS = {".pdf", ".docx", ".txt", ".md", ".markdown"}

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    @staticmethod
    def extract_text(filename: str, content: bytes) -> ParseResult:
        """Extract text from a document file.

        Args:
            filename: Original filename (used to detect format).
            content: Raw file bytes.

        Returns:
            ParseResult with full concatenated text and per-page/section metadata.

        Raises:
            ValueError: If the file format is unsupported or the file is empty.
        """
        if not content:
            raise ValueError("Empty file content")

        ext = os.path.splitext(filename or "")[-1].lower()

        if ext == ".pdf":
            return DocumentParser._parse_pdf(content)
        elif ext == ".docx":
            return DocumentParser._parse_docx(content)
        elif ext in (".txt", ".md", ".markdown"):
            return DocumentParser._parse_text(content, ext)
        else:
            raise ValueError(
                f"Unsupported file format: '{ext}'. "
                f"Supported: {', '.join(sorted(DocumentParser.SUPPORTED_EXTENSIONS))}"
            )

    # ------------------------------------------------------------------
    # Private parsers
    # ------------------------------------------------------------------

    @staticmethod
    def _parse_pdf(content: bytes) -> ParseResult:
        """Extract text from a PDF file page-by-page."""
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        sections: List[PageSection] = []
        all_text_parts: List[str] = []

        for i, page in enumerate(reader.pages):
            page_text = (page.extract_text() or "").strip()
            if page_text:
                sections.append(
                    PageSection(location=f"Page {i + 1}", text=page_text, index=i)
                )
                all_text_parts.append(page_text)

        full_text = "\n\n".join(all_text_parts)

        if not full_text.strip():
            logger.warning(
                "PDF has %d pages but no extractable text (may be scanned/image-only)",
                len(reader.pages),
            )

        return ParseResult(
            full_text=full_text,
            sections=sections,
            page_count=len(reader.pages),
            format="pdf",
        )

    @staticmethod
    def _parse_docx(content: bytes) -> ParseResult:
        """Extract text from a Word (.docx) document paragraph-by-paragraph."""
        from docx import Document

        doc = Document(io.BytesIO(content))
        sections: List[PageSection] = []
        all_text_parts: List[str] = []
        section_idx = 0

        # Group paragraphs into sections using headings as boundaries
        current_section_text: List[str] = []
        current_heading = "Section 1"

        for para in doc.paragraphs:
            text = para.text.strip()
            if not text:
                continue

            # Detect heading styles to create section boundaries
            style_name = (para.style.name or "").lower() if para.style else ""
            if "heading" in style_name and current_section_text:
                # Flush the previous section
                section_text = "\n".join(current_section_text)
                sections.append(
                    PageSection(
                        location=current_heading,
                        text=section_text,
                        index=section_idx,
                    )
                )
                all_text_parts.append(section_text)
                section_idx += 1
                current_section_text = []
                current_heading = text
            else:
                current_section_text.append(text)

        # Flush last section
        if current_section_text:
            section_text = "\n".join(current_section_text)
            sections.append(
                PageSection(
                    location=current_heading,
                    text=section_text,
                    index=section_idx,
                )
            )
            all_text_parts.append(section_text)

        full_text = "\n\n".join(all_text_parts)

        return ParseResult(
            full_text=full_text,
            sections=sections,
            page_count=len(sections),
            format="docx",
        )

    @staticmethod
    def _parse_text(content: bytes, ext: str) -> ParseResult:
        """Decode a plain-text or Markdown file."""
        # Try UTF-8 first, fall back to Latin-1
        try:
            text = content.decode("utf-8")
        except UnicodeDecodeError:
            text = content.decode("latin-1")

        text = text.strip()
        if not text:
            raise ValueError("Empty text file")

        # Split into sections by double-newline for long documents
        paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

        # Group paragraphs into sections of roughly equal size
        PARAS_PER_SECTION = 10
        sections: List[PageSection] = []
        for i in range(0, len(paragraphs), PARAS_PER_SECTION):
            group = paragraphs[i : i + PARAS_PER_SECTION]
            section_text = "\n\n".join(group)
            sections.append(
                PageSection(
                    location=f"Section {i // PARAS_PER_SECTION + 1}",
                    text=section_text,
                    index=i // PARAS_PER_SECTION,
                )
            )

        fmt = "markdown" if ext in (".md", ".markdown") else "txt"

        return ParseResult(
            full_text=text,
            sections=sections,
            page_count=len(sections),
            format=fmt,
        )
