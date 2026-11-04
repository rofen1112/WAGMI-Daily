"""Strict, audited collapse of repeated complete JSON objects; never JSON repair."""
import hashlib
import json
from decimal import Decimal

NORMALIZATION_VERSION = "strict-json-repeat-v1"
WHITESPACE = " \t\r\n"
MAX_OBJECTS = 64


def normalization_report(applied=False, count=None, text_parts=0, reason="json_mode_disabled", equivalence="none"):
    return {"version": NORMALIZATION_VERSION, "applied": applied, "count": count, "textPartCount": text_parts, "equivalence": equivalence, "reason": reason}


class JsonResponseError(ValueError):
    def __init__(self, reason, count, text_parts):
        self.report = normalization_report(count=count, text_parts=text_parts, reason=reason)
        super().__init__(reason)


def _unique_object(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError("ambiguous duplicate JSON property")
        result[key] = value
    return result


def _reject_constant(value):
    raise ValueError("non-JSON numeric constant")


def _same_structure(left, right):
    # All JSON numbers are parsed as exact Decimal values. This allows 1/1.0
    # equality while preventing bool==1 and binary-float rounding collisions.
    if type(left) is not type(right):
        return False
    if isinstance(left, dict):
        return left.keys() == right.keys() and all(_same_structure(value, right[key]) for key, value in left.items())
    if isinstance(left, list):
        return len(left) == len(right) and all(_same_structure(a, b) for a, b in zip(left, right))
    return left == right


def normalize_json_objects(text_parts):
    """Every nonblank part must contain complete objects and nothing else.

    No partial-part stitching, prefix/suffix stripping, coercion, or first-object
    selection occurs. A representative is chosen only after ALL objects agree.
    One complete object returns the original text byte-for-byte.
    """
    if not isinstance(text_parts, list) or any(not isinstance(part, str) for part in text_parts):
        raise JsonResponseError("invalid_text_parts", 0, 0)
    decoder = json.JSONDecoder(object_pairs_hook=_unique_object, parse_int=Decimal, parse_float=Decimal, parse_constant=_reject_constant)
    parsed, fragments = [], []
    for part in text_parts:
        position = 0
        while position < len(part):
            while position < len(part) and part[position] in WHITESPACE:
                position += 1
            if position == len(part):
                break
            start = position
            try:
                value, position = decoder.raw_decode(part, position)
            except (ValueError, TypeError, RecursionError, ArithmeticError):
                raise JsonResponseError("invalid_json_or_extra_text", len(parsed), len(text_parts)) from None
            if not isinstance(value, dict):
                raise JsonResponseError("non_object_json", len(parsed), len(text_parts))
            parsed.append(value)
            fragments.append(part[start:position])
            if len(parsed) > MAX_OBJECTS:
                raise JsonResponseError("too_many_objects", len(parsed), len(text_parts))
    if not parsed:
        raise JsonResponseError("missing_json_object", 0, len(text_parts))
    try:
        if any(not _same_structure(parsed[0], value) for value in parsed[1:]):
            raise JsonResponseError("conflicting_objects", len(parsed), len(text_parts))
    except (RecursionError, ArithmeticError):
        raise JsonResponseError("invalid_json_structure", len(parsed), len(text_parts)) from None
    if len(parsed) == 1:
        return "".join(text_parts), normalization_report(count=1, text_parts=len(text_parts), reason="single_object")
    identical_bytes = all(fragment == fragments[0] for fragment in fragments[1:])
    return fragments[0], normalization_report(applied=True, count=len(parsed), text_parts=len(text_parts), reason="identical_complete_objects", equivalence="byte_identical" if identical_bytes else "structurally_identical")


def _text_shape(text):
    if not isinstance(text, str):
        return {}
    return {"textLength": len(text), "textHash": hashlib.sha256(text.encode("utf-8", errors="surrogatepass")).hexdigest()}


def response_output_structure(payload, wire_mode):
    """Private wire-shape evidence: allowlisted types, counts, hashes and lengths."""
    result = {"version": "output-structure-v1", "wireMode": wire_mode, "outputItemCount": 0, "outputTextPartCount": 0, "items": []}
    if not isinstance(payload, dict):
        return result
    allowed_items = {"message", "reasoning", "function_call", "function_call_output", "custom_tool_call", "custom_tool_call_output", "web_search_call"}
    allowed_parts = {"output_text", "input_text", "reasoning_text", "summary_text", "refusal"}
    if wire_mode == "responses":
        outputs = payload.get("output", [])
        if isinstance(outputs, list):
            result["outputItemCount"] = len(outputs)
            for index, item in enumerate(outputs):
                if not isinstance(item, dict):
                    continue
                parts = item.get("content", [])
                parts = parts if isinstance(parts, list) else []
                result["outputTextPartCount"] += sum(isinstance(part, dict) and part.get("type") == "output_text" for part in parts)
                if index >= 64:
                    result["truncated"] = True
                    continue
                shape = {"index": index, "type": item.get("type") if isinstance(item.get("type"), str) and item["type"] in allowed_items else "unknown", "contentCount": len(parts), "parts": []}
                for part in parts[:64]:
                    if isinstance(part, dict):
                        shape["parts"].append({"type": part.get("type") if isinstance(part.get("type"), str) and part["type"] in allowed_parts else "unknown", **_text_shape(part.get("text"))})
                if len(parts) > 64:
                    shape["truncated"] = True
                result["items"].append(shape)
        if isinstance(payload.get("output_text"), str):
            result["fallbackOutputText"] = _text_shape(payload["output_text"])
    else:
        choices = payload.get("choices", [])
        if isinstance(choices, list):
            result["outputItemCount"] = len(choices)
            for index, item in enumerate(choices[:64]):
                message = item.get("message") if isinstance(item, dict) else None
                if isinstance(message, dict):
                    result["items"].append({"index": index, "type": "message", **_text_shape(message.get("content"))})
    return result
