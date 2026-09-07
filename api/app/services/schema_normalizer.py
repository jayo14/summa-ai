"""Provider-specific JSON Schema normalization.

Gemini's ``responseSchema`` field only supports a small subset of JSON Schema.
Passing Pydantic's full ``model_json_schema()`` output — which includes ``$defs``,
``$ref``, ``const``, ``oneOf``, ``anyOf``, ``allOf``, ``discriminator``, etc. —
causes Gemini to reject the request with:

    Invalid JSON payload received.
    Unknown name "$defs"
    Unknown name "const"
    Unknown name "$ref"

This module converts a full JSON Schema into a Gemini-compatible inline schema
that preserves semantic validity while stripping unsupported constructs.
"""

from __future__ import annotations

import copy
from typing import Any, Dict, Optional


_UNSUPPORTED_KEYS = {
    "$defs",
    "$ref",
    "$schema",
    "const",
    "discriminator",
    "prefixItems",
    "unevaluatedProperties",
    "unevaluatedItems",
    "dependentSchemas",
    "dependentRequired",
    "contentEncoding",
    "contentMediaType",
    "$comment",
}


def _resolve_refs(schema: Any, defs: Dict[str, Any]) -> Any:
    """Walk a schema tree and replace every ``$ref`` with the inlined
    definition from *defs*.  Handles ``oneOf``/``anyOf``/``allOf`` by
    selecting the first typed option.  Mutates copies, not originals."""
    if isinstance(schema, bool):
        return schema if schema else {"type": "string"}
    if not isinstance(schema, dict):
        return schema

    result = copy.deepcopy(schema)

    # Step 1: resolve $ref
    if "$ref" in result:
        ref = result["$ref"]
        def_name = ref.split("/")[-1]
        if def_name in defs:
            inlined = _resolve_refs(defs[def_name], defs)
            # Preserve sibling keys that aren't the ref itself
            for k, v in list(result.items()):
                if k != "$ref" and k not in inlined:
                    inlined[k] = v
            result = inlined
        else:
            result.pop("$ref", None)

    # Step 2: flatten oneOf / anyOf / allOf — pick first option that has a type
    for union_key in ("oneOf", "anyOf", "allOf"):
        if union_key in result and isinstance(result[union_key], list):
            options = result[union_key]
            chosen = None
            for opt in options:
                if isinstance(opt, dict) and ("type" in opt or "$ref" in opt):
                    chosen = opt
                    break
            if chosen is None:
                chosen = options[0] if options else {}
            resolved_chosen = _resolve_refs(chosen, defs)
            del result[union_key]
            # Merge chosen keys into result (chosen wins for conflicts)
            for k, v in resolved_chosen.items():
                if k not in result or result.get(k) is None:
                    result[k] = v

    # Step 3: resolve refs and unions in child nodes
    if "properties" in result and isinstance(result["properties"], dict):
        result["properties"] = {
            k: _resolve_refs(v, defs) for k, v in result["properties"].items()
        }
    if "items" in result:
        result["items"] = _resolve_refs(result["items"], defs)
    if "additionalProperties" in result and isinstance(result["additionalProperties"], dict):
        result["additionalProperties"] = _resolve_refs(result["additionalProperties"], defs)

    return result


def _const_to_enum(schema: Any) -> Any:
    """Replace ``const`` with ``enum: [value]`` (Gemini supports enum)."""
    if isinstance(schema, dict):
        if "const" in schema:
            schema["enum"] = [schema["const"]]
            del schema["const"]
        for v in schema.values():
            _const_to_enum(v)
    elif isinstance(schema, list):
        for item in schema:
            _const_to_enum(item)
    return schema


def _strip_unsupported(schema: Dict[str, Any]) -> None:
    """Recursively remove keys Gemini doesn't understand."""
    if isinstance(schema, dict):
        for key in list(schema.keys()):
            if key in _UNSUPPORTED_KEYS:
                del schema[key]
        for value in schema.values():
            if isinstance(value, dict):
                _strip_unsupported(value)
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict):
                        _strip_unsupported(item)
    elif isinstance(schema, list):
        for item in schema:
            if isinstance(item, dict):
                _strip_unsupported(item)


def normalize_for_gemini(schema: Optional[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Convert a full Pydantic JSON Schema into a Gemini-compatible inline schema.

    - Inlines ``$defs`` and resolves every ``$ref`` to its definition
    - Converts ``const`` → ``enum: [value]``
    - Flattens ``oneOf`` / ``anyOf`` / ``allOf`` to the first typed option
    - Removes ``discriminator`` and other unsupported keys
    - Preserves: ``type``, ``description``, ``enum``, ``items``, ``properties``,
      ``required``, ``additionalProperties``, and numeric/string/array constraints
    """
    if not schema or not isinstance(schema, dict):
        return None

    schema_copy = copy.deepcopy(schema)

    # Step 1: collect $defs and resolve all $ref references
    defs = schema_copy.get("$defs") or schema_copy.get("definitions") or {}
    if "$defs" in schema_copy:
        del schema_copy["$defs"]
    if "definitions" in schema_copy:
        del schema_copy["definitions"]

    resolved = _resolve_refs(schema_copy, defs)

    # Step 2: convert const → enum
    resolved = _const_to_enum(resolved)

    # Step 3: strip any remaining unsupported keys
    _strip_unsupported(resolved)

    return resolved
