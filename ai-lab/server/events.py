"""Persisted public progress projections; never consume reasoning/tool traces."""
import re
from .store import LabError


def public_text(value, limit=1500):
    if not isinstance(value, str):
        return ""
    value = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f]", "", value)[:limit]
    value = re.sub(r"(?i)\b(?:(?:sk|ak)-[A-Za-z0-9_-]{12,}|bearer\s+\S+|(?:api[_-]?key|token|secret)\s*[=:]\s*\S+)", "[已隐藏凭据]", value)
    return re.sub(r"(?:[A-Za-z]:[\\/]|/(?:Users|home|tmp|private)/)[^\s，。；]+", "[已隐藏本地路径]", value)


def public_events(record):
    result = []
    for index, item in enumerate(record.get("events", [])):
        item = item if isinstance(item, dict) else {"message": item}
        kind = item.get("type")
        if kind not in ("stage", "agent_message", "status"):
            kind = "stage" if item.get("stage") else "agent_message"
        result.append({"id": index + 1, "at": str(item.get("at", ""))[:40], "type": kind, "stage": str(item.get("stage", ""))[:80], "message": public_text(item.get("message", ""))})
    return result


def event_page(record, after=0, limit=100):
    if not isinstance(after, int) or isinstance(after, bool) or after < 0 or not isinstance(limit, int) or isinstance(limit, bool) or not 1 <= limit <= 200:
        raise LabError("invalid_event_cursor", "事件游标或分页大小无效。")
    events = public_events(record)
    if after > len(events):
        raise LabError("invalid_event_cursor", "事件游标超出当前任务记录。", 409)
    page = events[after:after + limit]
    return {"events": page, "cursor": after + len(page), "hasMore": after + len(page) < len(events), "terminal": record.get("status") in ("succeeded", "failed", "cancelled", "canceled", "needs_input")}
