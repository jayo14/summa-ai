"""Citation Grounding Service — extracts and validates citations from LLM responses,
linking them back to source resource chunks.

Provides:
- CitationExtractor: parse [Source N] references from LLM output
- CitationValidator: verify citations exist in retrieved chunks
- CitationFormatter: render citation footnotes for the frontend
"""

import re
from typing import Any, Dict, List, Optional, Tuple


class CitationExtractor:
    """Extract [Source N] references from LLM-generated text."""

    SOURCE_PATTERN = re.compile(r"\[Source\s+(\d+)\]", re.IGNORECASE)

    @staticmethod
    def extract(text: str) -> List[int]:
        """Return list of source numbers referenced in text."""
        return [int(m) for m in CitationExtractor.SOURCE_PATTERN.findall(text)]

    @staticmethod
    def has_citations(text: str) -> bool:
        return bool(CitationExtractor.SOURCE_PATTERN.search(text))

    @staticmethod
    def replace_with_footnotes(text: str) -> Tuple[str, List[int]]:
        """Replace inline [Source N] with superscript footnote markers."""
        sources = CitationExtractor.extract(text)
        seen = []
        mapping = {}
        counter = 1
        for s in sources:
            if s not in mapping:
                mapping[s] = counter
                counter += 1
                seen.append(s)

        def replacer(match):
            num = int(match.group(1))
            return f"[{mapping[num]}]"

        cleaned = CitationExtractor.SOURCE_PATTERN.sub(replacer, text)
        return cleaned, seen


class CitationValidator:
    """Validate that cited sources exist in the retrieved chunks."""

    @staticmethod
    def validate(
        cited_numbers: List[int],
        rag_chunks: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        max_source = len(rag_chunks)
        valid = [n for n in cited_numbers if 1 <= n <= max_source]
        invalid = [n for n in cited_numbers if n < 1 or n > max_source]

        return {
            "valid_sources": valid,
            "invalid_sources": invalid,
            "all_valid": len(invalid) == 0,
            "total_chunks": max_source,
        }


class CitationFormatter:
    """Format citation footnotes for frontend rendering."""

    @staticmethod
    def format_footnotes(
        source_numbers: List[int],
        rag_chunks: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Return ordered footnote list with source metadata."""
        footnotes = []
        for num in source_numbers:
            idx = num - 1
            if 0 <= idx < len(rag_chunks):
                chunk = rag_chunks[idx]
                footnotes.append({
                    "number": num,
                    "title": chunk.get("material_title") or chunk.get("resource_id", "Unknown"),
                    "chunk_text": chunk.get("chunk_text", "")[:200],
                    "location": chunk.get("location", ""),
                    "score": chunk.get("score", 0),
                })
        return footnotes

    @staticmethod
    def ground_response(
        llm_text: str,
        rag_chunks: List[Dict[str, Any]],
    ) -> Dict[str, Any]:
        """Full citation grounding pipeline: extract, validate, format."""
        cited = CitationExtractor.extract(llm_text)
        validation = CitationValidator.validate(cited, rag_chunks)
        footnotes = CitationFormatter.format_footnotes(validation["valid_sources"], rag_chunks)
        cleaned_text, ordered_sources = CitationExtractor.replace_with_footnotes(llm_text)

        return {
            "text": cleaned_text,
            "citations": footnotes,
            "validation": validation,
            "has_citations": len(cited) > 0,
        }
