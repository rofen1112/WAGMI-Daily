"""Resumable image→data→real browser captures→vision review workflow.

There is one worker. Awaiting browser captures is a persisted checkpoint, not a
blocking wait, and no project scene is committed until both gates pass.
"""
import base64
import binascii
import copy
import hashlib
import json
import math
import re
import time

from . import workflow_prompts as prompts
from .prompts import parse_json
from .provider import MODEL, ProviderError, normalize_usage
from .scale import choose_scale, texts, validate_scale_input
from .store import LabError, dump, now, uid
from .events import public_text

PIPELINE_VERSION = "codex-workflow-v1"
LEGACY_PIPELINE = "legacy-single-v1"
MAX_CALLS, MAX_REPAIRS, MAX_REVIEWS = 8, 2, 2
DEFAULT_LIMITS = {"maxCalls": MAX_CALLS, "maxRepairs": MAX_REPAIRS, "maxVisualReviews": MAX_REVIEWS}
MEMORY_PROMPT_VERSION = "codex-workflow-prompts-v5"
MEMORY_LIMIT_BYTES = 16 * 1024


def memory_enabled(state):
    return state.get("promptVersion") == MEMORY_PROMPT_VERSION


def geometry_fingerprint(candidate):
    """Hash renderable geometry/materials, independent of labels, IDs and order."""
    from engine.primitives import expand_primitives
    try: candidate = expand_primitives(copy.deepcopy(candidate))
    except (ValueError, TypeError, KeyError): candidate = copy.deepcopy(candidate)
    if not isinstance(candidate, dict): return hashlib.sha256(dump(candidate).encode()).hexdigest()
    ignored = {"id", "name", "label", "labels", "warnings", "notes", "metadata", "title", "titleEn", "description", "evidence", "assumptions", "at"}
    def canonical(value, key=None):
        if isinstance(value, dict):
            return {k: canonical(v, k) for k, v in sorted(value.items()) if k not in ignored}
        if isinstance(value, list):
            items = [canonical(item) for item in value]
            if key == "poly" and items and all(isinstance(p, list) and len(p) == 2 and all(isinstance(n, (int, float)) and not isinstance(n, bool) and math.isfinite(n) for n in p) for p in items):
                # Closed polygons are invalid upstream; canonicalize only the
                # start vertex and winding, never move or simplify vertices.
                forward = min(range(len(items)), key=lambda i: items[i])
                reverse_items = list(reversed(items))
                reverse = min(range(len(items)), key=lambda i: reverse_items[i])
                items = min(items[forward:] + items[:forward], reverse_items[reverse:] + reverse_items[:reverse])
            return items
        if isinstance(value, (int, float)) and not isinstance(value, bool) and math.isfinite(value):
            value = value % 360 if key == "rot" else value
            return int(value) if int(value) == value else value
        return value
    result = {}
    for primitive in ("wallSegments", "furnitureRows", "stairRuns"):
        if primitive in candidate: result[primitive] = canonical(candidate[primitive])
    metadata = candidate.get("metadata", {})
    ceiling = metadata.get("ceilingHeightMm", 2800) if isinstance(metadata, dict) else 2800
    result["ceilingHeightMm"] = canonical(ceiling)
    for collection in ("walls", "doors", "slides", "rooms", "furniture", "polygonWalls", "columns", "steps", "extraLintels"):
        values = candidate.get(collection, [])
        if not isinstance(values, list):
            result[collection] = canonical(values)
            continue
        rows = []
        for item in values:
            if isinstance(item, dict):
                item = copy.deepcopy(item)
                if collection == "rooms": item.setdefault("mat", "wood")
                if collection == "furniture":
                    item.setdefault("rot", 0); item.setdefault("color", "#d8c2a2")
                if collection == "slides": item.setdefault("v", False)
                if collection in ("polygonWalls", "columns", "steps"):
                    item.setdefault("height", ceiling); item.setdefault("color", "#cbd0d1")
            rows.append(canonical(item))
        result[collection] = sorted(rows, key=dump)
    windows = candidate.get("windows", [])
    if isinstance(windows, list):
        # Window heights belong to each rectangle; sorting them independently
        # would hide a real change in which aperture received which height.
        rows = []
        for index, window in enumerate(windows):
            row = {"rect": canonical(window)}
            for key, default in (("windowSills", 900), ("windowHeads", 2400)):
                values = candidate.get(key)
                row[key] = default if key not in candidate else canonical(values[index]) if isinstance(values, list) and index < len(values) else {"invalid": canonical(values)}
            rows.append(row)
        result["windows"] = sorted(rows, key=dump)
        for key in ("windowSills", "windowHeads"):
            if key in candidate and (not isinstance(candidate[key], list) or len(candidate[key]) != len(windows)):
                result[key + "Invalid"] = canonical(candidate[key])
    else:
        result["windows"] = canonical(windows)
    if "outerBoundary" in candidate:
        result["outerBoundary"] = canonical(candidate["outerBoundary"], "poly")
    return hashlib.sha256(dump(result).encode()).hexdigest()


def review_summary(review, text_limit=400):
    """Only normalized public findings; never model-private extra fields."""
    if not isinstance(review, dict): return None
    issues = [item for item in review.get("issues", []) if isinstance(item, dict) and item.get("severity") in ("critical", "major", "minor")]
    issues.sort(key=lambda item: {"critical": 0, "major": 1, "minor": 2}[item["severity"]])
    return {"pass": review.get("pass") is True, "reason": public_text(review.get("reason"), text_limit), "issues": [{"severity": item["severity"], **{key: public_text(item.get(key), text_limit) for key in ("path", "description", "suggestedChange")}} for item in issues[:6]], "limitations": [public_text(item, text_limit) for item in review.get("limitations", [])[:4] if isinstance(item, str)]}


def repair_change_summary(before, after):
    """Data deltas only: a change is not evidence that a finding was resolved."""
    from engine.primitives import expand_primitives
    try: before = expand_primitives(copy.deepcopy(before))
    except (ValueError, TypeError, KeyError): before = copy.deepcopy(before)
    try: after = expand_primitives(copy.deepcopy(after))
    except (ValueError, TypeError, KeyError): after = copy.deepcopy(after)
    if not isinstance(before, dict) or not isinstance(after, dict): return {"counts": {}, "objects": [], "truncated": True}
    counts, objects = {}, []
    fields = {"type", "rect", "h", "len", "c", "o", "v", "cx", "cy", "w", "d", "rot", "color", "mat", "height", "opacity", "outline", "tableShape"}
    def geometry(item):
        if not isinstance(item, dict): return item[:8] if isinstance(item, list) else None
        result = {key: public_geometry_value(value) for key, value in item.items() if key in fields}
        if "poly" in item and isinstance(item["poly"], list):
            result["polySha256"] = hashlib.sha256(dump(item["poly"]).encode()).hexdigest()
        # Malformed unbounded nested values cannot enter a public ledger.
        return result if len(dump(result).encode()) <= 800 else {"geometrySha256": hashlib.sha256(dump(result).encode()).hexdigest()}
    for collection in ("doors", "slides", "furniture", "walls", "windows", "rooms", "polygonWalls", "columns", "steps"):
        left, right = before.get(collection, []), after.get(collection, [])
        if not isinstance(left, list) or not isinstance(right, list): continue
        counts[collection] = {"before": len(left), "after": len(right)}
        stable = all(isinstance(item, dict) and isinstance(item.get("id"), str) for item in left + right) and len({item["id"] for item in left}) == len(left) and len({item["id"] for item in right}) == len(right)
        if stable:
            a, b = {item["id"]: item for item in left}, {item["id"]: item for item in right}
            pairs = [(ident, a.get(ident), b.get(ident)) for ident in sorted(set(a) | set(b))]
        else:
            pairs = [(str(index), left[index] if index < len(left) else None, right[index] if index < len(right) else None) for index in range(max(len(left), len(right)))]
        for ident, old, new in pairs:
            a, b = geometry(old), geometry(new)
            if a != b:
                objects.append({"collection": collection, "id": public_text(ident, 80) if stable else None, "path": f"$.{collection}[{public_text(ident, 80)}]", "match": "stable_id" if stable else "index", "before": a, "after": b})
    return {"counts": counts, "objects": objects[:6], "truncated": len(objects) > 6}


def public_geometry_value(value, depth=0):
    if isinstance(value, dict) and set(value) == {"valueSha256"} and isinstance(value["valueSha256"], str) and re.fullmatch(r"[a-f0-9]{64}", value["valueSha256"]):
        return {"valueSha256": value["valueSha256"]}
    if isinstance(value, str): return public_text(value, 80)
    if value is None or isinstance(value, bool): return value
    if isinstance(value, (int, float)) and math.isfinite(value): return value
    if isinstance(value, list) and depth < 2 and len(value) <= 8:
        return [public_geometry_value(item, depth + 1) for item in value]
    # Invalid/oversized geometry is audited by hash, never copied as prose.
    return {"valueSha256": hashlib.sha256(dump(value).encode()).hexdigest()}


def public_change_summary(value):
    if not isinstance(value, dict): return {"counts": {}, "objects": [], "truncated": True}
    collections = {"doors", "slides", "furniture", "walls", "windows", "rooms", "polygonWalls", "columns", "steps"}
    counts = {}
    for key, item in value.get("counts", {}).items() if isinstance(value.get("counts"), dict) else []:
        if key in collections and isinstance(item, dict) and all(isinstance(item.get(k), int) and not isinstance(item[k], bool) and 0 <= item[k] <= 100000 for k in ("before", "after")):
            counts[key] = {k: item[k] for k in ("before", "after")}
    fields = {"type", "rect", "h", "len", "c", "o", "v", "cx", "cy", "w", "d", "rot", "color", "mat", "height", "opacity", "outline", "tableShape", "polySha256", "geometrySha256"}
    objects = []
    for item in value.get("objects", [])[:6] if isinstance(value.get("objects"), list) else []:
        if not isinstance(item, dict) or item.get("collection") not in collections: continue
        row = {"collection": item["collection"], "id": public_text(item.get("id"), 80) or None, "path": public_text(item.get("path"), 160), "match": "stable_id" if item.get("match") == "stable_id" else "index"}
        for key in ("before", "after"):
            geometry = item.get(key)
            row[key] = {k: public_geometry_value(v) for k, v in geometry.items() if k in fields} if isinstance(geometry, dict) else public_geometry_value(geometry)
        objects.append(row)
    return {"counts": counts, "objects": objects, "truncated": value.get("truncated") is True}


def decision_memory(state):
    def fingerprint(value): return value if isinstance(value, str) and re.fullmatch(r"[a-f0-9]{64}", value) else None
    reviews = [{"draftId": public_text(item.get("draftId"), 80), "candidateHash": fingerprint(item.get("candidateHash")), "review": review_summary(item.get("review"))} for item in state.get("reviewHistory", [])[-4:] if isinstance(item, dict)]
    repairs = [{"targetedReview": review_summary(item.get("targetedReview")), "beforeFingerprint": fingerprint(item.get("beforeFingerprint")), "afterFingerprint": fingerprint(item.get("afterFingerprint")), "changed": item.get("changed") if isinstance(item.get("changed"), bool) else None, "changeSummary": public_change_summary(item.get("changeSummary"))} for item in state.get("repairHistory", [])[-4:] if isinstance(item, dict)]
    result = {"type": "PUBLIC_DECISION_MEMORY_V1", "workflowMemory": {"version": "bounded-model-ledger-v1", "source": "previous_model_findings_not_ground_truth", "previousModelReviews": reviews, "repairAttempts": repairs}}
    def size(): return len(dump(result).encode())
    # Prefer recent complete claims. Never exceed the request's fixed memory
    # budget by accumulating old full scenes, outputs or large findings arrays.
    while size() > MEMORY_LIMIT_BYTES and (len(reviews) > 1 or len(repairs) > 1):
        if len(reviews) >= len(repairs) and len(reviews) > 1: reviews.pop(0)
        elif len(repairs) > 1: repairs.pop(0)
    for text_limit in (200, 80, 0):
        if size() <= MEMORY_LIMIT_BYTES: break
        for item in reviews: item["review"] = review_summary(item["review"], text_limit)
        for item in repairs:
            item["targetedReview"] = review_summary(item["targetedReview"], text_limit)
            item["changeSummary"]["objects"] = item["changeSummary"].get("objects", [])[:2]
            item["changeSummary"]["truncated"] = True
    if size() > MEMORY_LIMIT_BYTES:
        for item in repairs: item["changeSummary"] = {"counts": item["changeSummary"].get("counts", {}), "objects": [], "truncated": True}
    return result


def trim_decision_history(state):
    memory = decision_memory(state)["workflowMemory"]
    state["reviewHistory"], state["repairHistory"] = memory["previousModelReviews"], memory["repairAttempts"]


def parse_workflow_limits(config):
    """Explicit bounded configuration, never silently clamped or inferred."""
    limits = {}
    for variable, key, default, minimum, maximum in (
        ("AI_LAB_WORKFLOW_MAX_CALLS", "maxCalls", 8, 4, 16),
        ("AI_LAB_WORKFLOW_MAX_REPAIRS", "maxRepairs", 2, 0, 6),
        ("AI_LAB_WORKFLOW_MAX_REVIEWS", "maxVisualReviews", 2, 1, 6),
    ):
        raw = config.get(variable, str(default))
        if not isinstance(raw, (str, int)) or isinstance(raw, bool) or not re.fullmatch(r"[0-9]+", str(raw).strip()) or len(str(raw).strip()) > 2:
            raise LabError("workflow_config_invalid", f"{variable} 必须是 {minimum}..{maximum} 的整数。", 500)
        value = int(str(raw).strip())
        if not minimum <= value <= maximum:
            raise LabError("workflow_config_invalid", f"{variable} 必须是 {minimum}..{maximum} 的整数。", 500)
        limits[key] = value
    if 3 + limits["maxRepairs"] + limits["maxVisualReviews"] > limits["maxCalls"]:
        raise LabError("workflow_config_invalid", "工作流总调用上限必须覆盖3次基础调用、修复上限和视觉复核上限。", 500)
    return limits


def limits_for(state):
    # Checkpoints created before configurable budgets retain historical 8/2/2.
    return state.get("limits", DEFAULT_LIMITS)


class WorkflowStopped(Exception):
    pass


def settings(provider):
    return {"model": getattr(provider, "model", MODEL), "wireMode": getattr(provider, "wire_mode", "injected"), "reasoningEffort": getattr(provider, "reasoning_effort", None) or None, "jsonMode": bool(getattr(provider, "json_mode", False)), "maxOutputTokens": getattr(provider, "max_output_tokens", None), "timeoutSeconds": getattr(provider, "timeout", None)}


def safe_analysis(value):
    spaces = value.get("spaces", [])
    if isinstance(spaces, list):
        spaces = [item[:200] if isinstance(item, str) else str(item.get("name", ""))[:200] for item in spaces[:100] if isinstance(item, (str, dict))]
    else:
        spaces = []
    return {"summary": str(value.get("summary", ""))[:3000], "spaces": spaces, "notes": texts(value.get("notes"))}


def may_estimate_scale(payload, analysis, error):
    if payload.get("scaleMode", "auto") != "auto" or error.code not in ("scale_unknown", "scale_evidence_invalid"):
        return False
    scale = analysis.get("scale", analysis.get("scaleProvenance", {}))
    anchors = scale.get("anchors", []) if isinstance(scale, dict) else []
    # A second look at object priors cannot erase contradictory or invalid
    # dimension annotations, even if some other prior in the same list is bad.
    if isinstance(anchors, dict) and anchors.get("source") == "dimension_annotation":
        return False
    return not isinstance(anchors, list) or not any(isinstance(item, dict) and item.get("source") == "dimension_annotation" for item in anchors)


def normalized_review(value):
    if not isinstance(value.get("pass"), bool) or not isinstance(value.get("issues"), list) or len(value["issues"]) > 100:
        raise LabError("visual_review_invalid", "视觉复核未返回明确结论与检查项。", 422)
    issues = []
    for item in value.get("issues", [])[:100]:
        if not isinstance(item, dict) or item.get("severity") not in ("critical", "major", "minor"):
            raise LabError("visual_review_invalid", "视觉复核检查项格式无效。", 422)
        issues.append({"severity": item["severity"], "path": str(item.get("path", "$"))[:300], "description": str(item.get("description", ""))[:1000], "suggestedChange": str(item.get("suggestedChange", ""))[:1000]})
    reason = str(value.get("reason", ""))[:2000]
    return {"pass": value["pass"] and not any(item["severity"] in ("critical", "major") for item in issues), "reason": reason, "reasons": [reason] if reason else [], "issues": issues, "limitations": texts(value.get("limitations")), "acceptance": "model_review_only"}


class WorkflowRunner:
    def __init__(self, lab):
        self.lab, self.store = lab, lab.store

    def _stopped(self, job_id):
        if self.lab._cancelled(job_id) or self.lab.stop_event.is_set():
            raise WorkflowStopped()

    def _save(self, job_id, state):
        self.store.put_workflow(job_id, state)

    def _public(self, job_id, state, **fields):
        self.store.update_job(job_id, usage={"calls": state["calls"], "cost": None}, timings=state["timings"], budget={**limits_for(state), "callsUsed": len(state["calls"]), "repairsUsed": state["repairsUsed"], "visualReviewsUsed": state["reviewsUsed"]}, **fields)

    def _artifact(self, job_id, state, stage, kind, value=None, blob=None):
        artifact = self.store.artifact(job_id, value=value, blob=blob)
        state.setdefault("artifacts", []).append({**artifact, "stage": stage, "kind": kind, "at": now()})
        return artifact

    def _messages(self, job, stage, *args, **kwargs):
        checkpoint = self.store.workflow(job["id"]) or {}
        version = checkpoint.get("promptVersion", job["record"].get("promptVersion", prompts.WORKFLOW_PROMPT_VERSION))
        dispatcher = getattr(prompts, "messages_for_prompt_version", None)
        if dispatcher:
            try:
                messages = dispatcher(version, stage, *args, **kwargs)
            except ValueError:
                raise LabError("workflow_prompt_version_unavailable", "原任务提示版本不可用，未用新提示冒充旧版本继续。", 409) from None
        else:
            if version != prompts.WORKFLOW_PROMPT_VERSION:
                raise LabError("workflow_prompt_version_unavailable", "原任务提示版本不可用，未用新提示冒充旧版本继续。", 409)
            name = {"analyzing": "analyze_messages", "scale_estimation": "scale_estimation_messages", "structure": "structure_messages", "furnishing": "furnish_messages", "geometry_repair": "repair_messages", "visual_repair": "repair_messages", "visual_review": "review_messages"}[stage]
            messages = getattr(prompts, name)(*args, **kwargs)
        if version == MEMORY_PROMPT_VERSION and stage in ("geometry_repair", "visual_repair", "visual_review"):
            messages = list(messages) + [{"role": "user", "content": dump(decision_memory(checkpoint))}]
        return messages

    def _call(self, job_id, state, stage, messages):
        self._stopped(job_id)
        provider = self.lab.provider_for_job(job_id, state)
        if len(state["calls"]) >= limits_for(state)["maxCalls"]:
            raise LabError("workflow_budget_exhausted", "已达到本任务的模型调用上限；候选已私有保留。", 422)
        # Persist a reservation before the network call. Restart never replays it.
        index = len(state["calls"]) + 1
        call = {"index": index, "phase": stage, "status": "running", "usage": None, "startedAt": now(), "promptVersion": state.get("promptVersion"), "settings": copy.deepcopy(state["settings"])}
        state["calls"].append(call)
        audit_messages = []
        for message in messages:
            content = message["content"]
            if isinstance(content, list):
                content = [item if item.get("type") != "image_url" else {"type": "image_reference", "sha256": hashlib.sha256(item["image_url"]["url"].encode()).hexdigest()} for item in content]
            audit_messages.append({"role": message["role"], "content": content})
        self._artifact(job_id, state, stage, "input", {"messages": audit_messages, "inputHash": hashlib.sha256(dump(messages).encode()).hexdigest(), "sourceHash": state["sourceHash"], "settings": state["settings"], "limits": limits_for(state)})
        state["inFlight"] = {"stage": stage, "callIndex": index}
        self._save(job_id, state)
        self._public(job_id, state, stage=stage, message={"analyzing": "分析图纸、细节清单及尺度依据。", "scale_estimation": "再次查看可见参照物，估算示意比例与范围。", "structure": "构建原图像素结构。", "furnishing": "补充可见家具及固定设施。", "geometry_repair": "针对几何错误进行限定修复。", "visual_review": "对照原图和真实2D/3D图像复核。", "visual_repair": "根据视觉复核进行限定数据修复。"}.get(stage, stage))
        started, response, error = time.monotonic(), None, None
        try:
            response = provider.complete(messages)
            call["usage"] = normalize_usage(response.get("usage"))
            for key in ("responseModel", "responseId", "requestId", "responseTransport"):
                value = response.get(key)
                if isinstance(value, str) and re.fullmatch(r"[A-Za-z0-9._:-]{1,200}", value) and not re.match(r"(?:sk|ak)-", value, re.I):
                    call[key] = value
            if response.get("normalization") is not None:
                call["normalization"] = copy.deepcopy(response["normalization"])
            self._artifact(job_id, state, stage, "output", {"content": response.get("content", ""), "outputHash": hashlib.sha256(str(response.get("content", "")).encode()).hexdigest(), "normalization": response.get("normalization"), "outputStructure": response.get("outputStructure")})
            call["status"] = "completed"
        except ProviderError as exc:
            error = exc
            call.update(status="failed", usage=exc.usage, errorCode=exc.code)
            call.update({key: value for key in ("response_status", "incomplete_reason") if (value := getattr(exc, key)) is not None})
            if exc.normalization is not None:
                call["normalization"] = copy.deepcopy(exc.normalization)
            if exc.output_structure is not None:
                self._artifact(job_id, state, stage, "response_structure", {"outputStructure": exc.output_structure, "normalization": exc.normalization})
            raise
        except Exception:
            call.update(status="failed", errorCode="provider_processing_failed")
            raise
        finally:
            duration = round(time.monotonic() - started, 3)
            call.update(durationSeconds=duration, endedAt=now())
            state["timings"][stage] = round(state["timings"].get(stage, 0) + duration, 3)
            state["inFlight"] = None
            self._save(job_id, state)
            self._public(job_id, state)
        self._stopped(job_id)
        try:
            parsed = parse_json(response.get("content", ""))
        except (ValueError, TypeError, AttributeError):
            raise LabError("workflow_output_invalid", "阶段输出不是符合契约的 JSON 数据；已私有保留，未保存正式场景。", 422) from None
        return parsed

    def _compile(self, job_id, state, project):
        candidate = copy.deepcopy(state["candidateIR"])
        # Scale is selected by the service; model-supplied provenance is not authority.
        metadata = candidate.get("metadata")
        if isinstance(metadata, dict):
            metadata.pop("scaleProvenance", None)
            metadata.pop("generation", None)
        from engine.primitives import expand_primitives
        try:
            candidate = expand_primitives(candidate)
            state["candidateIR"] = candidate
            scene, validation = self.lab.engine.compile_pixel_scene(candidate, state["asset"]["width"], state["asset"]["height"], state["scaleProvenance"]["mmPerPixel"], project["id"], project["title"], scale_provenance=state["scaleProvenance"])
        except (ValueError, TypeError, KeyError):
            scene, validation = {}, {"errors": [{"path": "$.primitives", "code": "invalid_primitives", "message": "Explicit primitive fields are invalid; return supported positive pixel primitives or expanded legacy collections."}], "warnings": [], "counts": {}}
        if self.store.job(job_id)["payload"].get("executionMode") == "api":
            from .geometry_audit import audit_pixel_topology
            topology = audit_pixel_topology(candidate)
            validation.setdefault("errors", []).extend(topology.get("errors", []))
            validation.setdefault("warnings", []).extend(topology.get("warnings", []))
        state["scene"], state["validation"] = scene, validation
        if scene:
            scene.setdefault("metadata", {}).update(pipelineVersion=PIPELINE_VERSION, promptVersion=state.get("promptVersion", prompts.WORKFLOW_PROMPT_VERSION))
            if not validation.get("errors"):
                state["editorState"] = self.lab.engine.default_state(scene)
                editor_validation = self.lab.engine.validate_state(scene, state["editorState"])
                validation["errors"].extend(editor_validation.get("errors", []))
                validation["warnings"].extend(editor_validation.get("warnings", []))
        self._artifact(job_id, state, "validating", "candidate", {"candidateIR": state["candidateIR"], "scene": scene, "state": state.get("editorState"), "validation": validation, "scaleProvenance": state["scaleProvenance"]})
        self._public(job_id, state, stage="validating", progress=65, validation=validation, message="校验结构、尺度来源与完整候选。")
        self._save(job_id, state)
        return not validation.get("errors")

    def _capture_urls(self, job_id, state):
        result = []
        for view in ("2d", "3d"):
            item = state["captures"]["images"][view]
            raw = self.store.artifact_bytes(job_id, item["artifact"])
            result.append("data:" + item["mime"] + ";base64," + base64.b64encode(raw).decode())
        return result

    def run(self, job_id):
        job = self.store.job(job_id)
        if job["record"]["status"] != "queued":
            return
        payload, project_id = job["payload"], job["project_id"]
        state = self.store.workflow(job_id)
        if state is None:
            asset = self.store.asset(payload["assetId"])
            state = {"pipelineVersion": PIPELINE_VERSION, "promptVersion": job["record"].get("promptVersion", prompts.WORKFLOW_PROMPT_VERSION), "checkpointStage": "analyzing", "asset": {key: asset[key] for key in ("id", "name", "mime", "width", "height")}, "sourceHash": asset["sha256"], "settings": copy.deepcopy(payload.get("runtimeSnapshot", settings(self.lab.provider))), "limits": copy.deepcopy(payload.get("workflowLimits", DEFAULT_LIMITS)), "calls": [], "timings": {}, "repairsUsed": 0, "reviewsUsed": 0, "artifacts": [], "createdAt": now(), "createdEpoch": time.time(), "executionSeconds": 0}
            self._save(job_id, state)
        elif "limits" not in state:
            state["limits"] = copy.deepcopy(DEFAULT_LIMITS)
            self._save(job_id, state)
        if "promptVersion" not in state:
            state["promptVersion"] = job["record"].get("promptVersion", prompts.WORKFLOW_PROMPT_VERSION)
            self._save(job_id, state)
        started = time.monotonic()
        try:
            self._public(job_id, state, status="running", stage=state["checkpointStage"], message="继续分阶段图纸工作流。")
            self._stopped(job_id)
            project = self.store.project(project_id)
            if project["version"] != payload["baseVersion"]:
                raise LabError("version_conflict", "工作流期间项目版本已更新，请重新开始；候选已保留。", 409)
            provider = self.lab.provider_for_job(job, state)
            if not provider.configured:
                raise ProviderError("api_key_missing", "请在后端私有配置中设置模型 Key。")
            if not provider.supports_images:
                raise LabError("gateway_image_support_unverified", "网关图像能力尚未验证，工作流无法继续。", 422)
            asset_row = self.store.asset(payload["assetId"])
            original_raw = (self.store.root / "assets" / asset_row["filename"]).read_bytes()
            if hashlib.sha256(original_raw).hexdigest() != state["sourceHash"]:
                raise LabError("source_changed", "原图与任务绑定哈希不一致，未继续模型请求。", 409)
            original_url = "data:" + asset_row["mime"] + ";base64," + base64.b64encode(original_raw).decode()
            while True:
                self._stopped(job_id)
                stage = state["checkpointStage"]
                if stage == "analyzing":
                    state["analysis"] = self._call(job_id, state, stage, self._messages(job, stage, state["asset"], original_url, payload))
                    self._public(job_id, state, analysis=safe_analysis(state["analysis"]), progress=15)
                    state["checkpointStage"] = "selecting_scale"
                elif stage == "selecting_scale":
                    try:
                        state["scaleProvenance"] = choose_scale(payload, state["analysis"], state["asset"])
                    except LabError as exc:
                        eligible = not state.get("scaleEstimationUsed") and may_estimate_scale(payload, state["analysis"], exc)
                        self._artifact(job_id, state, "scale_estimation" if state.get("scaleEstimationUsed") else "analyzing", "checks", {"error": {"code": exc.code, "message": exc.message}, "secondLookAllowed": eligible})
                        if not eligible:
                            raise
                        state["checkpointStage"] = "scale_estimation"
                        self._save(job_id, state)
                        continue
                    check = self.lab.engine.validate_scale_provenance(state["scaleProvenance"], state["scaleProvenance"]["mmPerPixel"], state["asset"]["width"], state["asset"]["height"])
                    self._artifact(job_id, state, stage, "checks", {"analysis": state["analysis"], "scaleProvenance": state["scaleProvenance"], "validation": check})
                    if check.get("errors"):
                        raise LabError("scale_evidence_invalid", "尺度来源校验失败，请标定或手动输入。", 422, check)
                    self._public(job_id, state, analysis=safe_analysis(state["analysis"]), scaleProvenance=state["scaleProvenance"], progress=20)
                    state["checkpointStage"] = "structure"
                elif stage == "scale_estimation":
                    if state.get("scaleEstimationUsed"):
                        raise LabError("scale_unknown", "已完成一次参照物估算，仍无有效比例依据；请校准或手动输入。", 422)
                    state["scaleEstimationUsed"] = True
                    self._save(job_id, state)
                    try:
                        result = self._call(job_id, state, stage, self._messages(job, stage, state["asset"], original_url, state["analysis"]))
                    except LabError as exc:
                        if exc.code == "workflow_output_invalid":
                            raise LabError("scale_unknown", "参照物估算未返回有效尺度对象；请校准或手动输入。", 422) from None
                        raise
                    scale = result.get("scale")
                    if set(result) != {"scale"} or not isinstance(scale, dict) or not isinstance(scale.get("anchors", []), list) or any(not isinstance(item, dict) or item.get("source") != "object_prior" for item in scale.get("anchors", [])):
                        raise LabError("scale_evidence_invalid", "参照物估算仅允许常识先验，不得创建标注或测量证据。", 422)
                    state["analysis"]["scale"] = {**scale, "confidence": "low"}
                    state["checkpointStage"] = "selecting_scale"
                elif stage == "structure":
                    state["candidateIR"] = self._call(job_id, state, stage, self._messages(job, stage, state["asset"], original_url, payload, state["analysis"], state["scaleProvenance"]))
                    # Architectural generation cannot smuggle prefilled furnishings.
                    state["candidateIR"]["furniture"] = []
                    state["candidateIR"].pop("furnitureRows", None)
                    state["checkpointStage"] = "furnishing"
                    self._public(job_id, state, progress=35)
                elif stage == "furnishing":
                    furniture = self._call(job_id, state, stage, self._messages(job, stage, state["asset"], original_url, state["candidateIR"], state["analysis"], state["scaleProvenance"]))
                    if not ({"furniture", "furnitureRows"} & set(furniture)) or set(furniture) - {"furniture", "furnitureRows", "notes"} or not isinstance(furniture.get("furniture", []), list) or not isinstance(furniture.get("furnitureRows", []), list):
                        raise LabError("furnishing_scope_invalid", "家具阶段试图修改建筑或返回了不支持的数据；未应用。", 422)
                    state["candidateIR"].update({key: furniture[key] for key in ("furniture", "furnitureRows") if key in furniture})
                    state["checkpointStage"] = "validating"
                    self._public(job_id, state, progress=55)
                elif stage == "validating":
                    if not self._compile(job_id, state, project):
                        state["checkpointStage"] = "geometry_repair"
                    else:
                        if memory_enabled(state):
                            fingerprint = geometry_fingerprint(state["candidateIR"])
                            seen = state.setdefault("validCandidateFingerprints", [])
                            if fingerprint in seen:
                                raise LabError("workflow_repair_cycle", "候选重复了已校验的历史几何，已停止重复复核；失败候选私有保留。", 422)
                            seen.append(fingerprint)
                            state["candidateFingerprint"] = fingerprint
                        state["editorState"] = self.lab.engine.default_state(state["scene"])
                        state["draftId"] = uid()
                        state["captures"] = None
                        state["checkpointStage"] = "preview"
                        self._save(job_id, state)
                        self._public(job_id, state, status="awaiting_review_images", stage="preview", progress=70, draft={"id": state["draftId"], "viewerUrl": f"/api/ai-lab/v1/jobs/{job_id}/viewer?draftId={state['draftId']}"}, reviewImagesRequired=True, message="候选未保存：需要浏览器真实2D/3D截图以继续复核。")
                        return
                elif stage in ("geometry_repair", "visual_repair"):
                    if state["repairsUsed"] >= limits_for(state)["maxRepairs"]:
                        raise LabError("workflow_repair_budget_exhausted", "限定修复次数已用完，仍未通过检查；候选已私有保留。", 422)
                    state["repairsUsed"] += 1
                    if memory_enabled(state):
                        state.setdefault("repairHistory", []).append({"targetedReview": review_summary(state.get("review")) if stage == "visual_repair" else None, "beforeFingerprint": geometry_fingerprint(state["candidateIR"]), "afterFingerprint": None, "changed": None, "changeSummary": {"counts": {}, "objects": [], "truncated": False}})
                        trim_decision_history(state)
                    self._save(job_id, state)
                    candidate = self._call(job_id, state, stage, self._messages(job, stage, state["asset"], original_url, state["candidateIR"], state["scaleProvenance"], validation=state.get("validation") if stage == "geometry_repair" else None, review=state.get("review") if stage == "visual_repair" else None, capture_urls=self._capture_urls(job_id, state) if stage == "visual_repair" else None))
                    if memory_enabled(state):
                        attempt = state["repairHistory"][-1]
                        after = geometry_fingerprint(candidate)
                        attempt.update(afterFingerprint=after, changed=after != attempt["beforeFingerprint"], changeSummary=repair_change_summary(state["candidateIR"], candidate))
                        self._artifact(job_id, state, stage, "repair_change", attempt)
                        trim_decision_history(state)
                        if after == attempt["beforeFingerprint"] or after in state.get("validCandidateFingerprints", []):
                            self._save(job_id, state)
                            raise LabError("workflow_repair_cycle", "修复没有实质几何变化或回到了旧有效候选；未再次付费复核，失败候选已私有保留。", 422)
                    state["candidateIR"] = candidate
                    state["checkpointStage"] = "validating"
                elif stage == "visual_review":
                    if state["reviewsUsed"] >= limits_for(state)["maxVisualReviews"]:
                        raise LabError("workflow_review_budget_exhausted", "视觉复核次数已用完；未通过的候选不会保存为正式场景。", 422)
                    if not state.get("captures") or state["captures"]["draftId"] != state["draftId"]:
                        raise LabError("review_images_required", "当前候选需要真实2D/3D截图。", 422)
                    state["reviewsUsed"] += 1
                    self._save(job_id, state)
                    review = self._call(job_id, state, stage, self._messages(job, stage, state["asset"], original_url, self._capture_urls(job_id, state), state["scene"], state["analysis"], state["scaleProvenance"]))
                    state["review"] = normalized_review(review)
                    if memory_enabled(state):
                        state.setdefault("reviewHistory", []).append({"draftId": state["draftId"], "candidateHash": geometry_fingerprint(state["candidateIR"]), "review": review_summary(state["review"])})
                        trim_decision_history(state)
                    self._artifact(job_id, state, stage, "checks", state["review"])
                    self._public(job_id, state, visualReview=state["review"], progress=85)
                    if not state["review"]["pass"]:
                        if state["reviewsUsed"] >= limits_for(state)["maxVisualReviews"]:
                            raise LabError("visual_review_failed", "达到本任务视觉复核上限后仍有未解决问题；候选已私有保留。", 422)
                        state["checkpointStage"] = "visual_repair"
                    else:
                        self._stopped(job_id)
                        # Never substitute a reference scene. Commit only this checked draft.
                        generation_settings = copy.deepcopy(state["settings"])
                        state["scene"].setdefault("metadata", {})["generation"] = {
                            "pipelineVersion": PIPELINE_VERSION,
                            "promptVersion": state.get("promptVersion", job["record"].get("promptVersion", prompts.WORKFLOW_PROMPT_VERSION)),
                            "model": generation_settings["model"],
                            "jobId": job_id,
                            "sourceSha256": state["sourceHash"],
                            "settings": generation_settings,
                            "limits": copy.deepcopy(limits_for(state)),
                            "reviewAppliesTo": "initial_generated_scene",
                            "modelVisualReview": copy.deepcopy(state["review"]),
                        }
                        final_validation = self.lab.engine.validate_scene(state["scene"])
                        final_state_validation = self.lab.engine.validate_state(state["scene"], state["editorState"])
                        if final_validation.get("errors") or final_state_validation.get("errors"):
                            raise LabError("generation_audit_invalid", "生成审计信息或最终编辑状态未通过校验，未提交场景。", 422)
                        state["validation"] = final_validation
                        self._artifact(job_id, state, "committing", "generation_audit", state["scene"]["metadata"]["generation"])
                        self._public(job_id, state, reviewImagesRequired=False, draft=None)
                        from .app import public_asset
                        version = self.store.commit_scene(project_id, payload["baseVersion"], state["scene"], state["editorState"], state["validation"], public_asset(asset_row), "generated", job_id)
                        if version is None:
                            raise WorkflowStopped()
                        state["checkpointStage"] = "saved"
                        state["sceneVersion"] = version
                        self._save(job_id, state)
                        return
                else:
                    raise LabError("workflow_checkpoint_invalid", "任务检查点不可继续；没有自动重放模型调用。", 422)
                self._save(job_id, state)
        except WorkflowStopped:
            pass
        except ProviderError as exc:
            self._public(job_id, state, status="failed", stage="failed", error={"code": exc.code, "message": exc.message}, message=exc.message, reviewImagesRequired=False)
        except LabError as exc:
            scale_error = exc.code in ("scale_unknown", "scale_anchors_conflict", "scale_evidence_invalid")
            waiting = payload.get("executionMode") == "api" and scale_error
            code = "awaiting_input" if waiting else "needs_input" if exc.code in ("scale_unknown", "scale_anchors_conflict", "scale_evidence_invalid", "gateway_image_support_unverified", "review_images_required") else "failed"
            if waiting:
                state["checkpointStage"] = "selecting_scale"
                state.setdefault("inputRevision", 0)
            error = {"code": exc.code, "message": exc.message}
            if exc.details is not None:
                error["details"] = exc.details
            self._public(job_id, state, status=code, stage=code, error=error, message=exc.message, reviewImagesRequired=False)
        except Exception:
            self._public(job_id, state, status="failed", stage="failed", error={"code": "workflow_processing_failed", "message": "分阶段处理失败，候选已保留，未提交正式版本。"}, message="分阶段处理失败，未提交正式版本。", reviewImagesRequired=False)
        finally:
            state["executionSeconds"] += time.monotonic() - started
            state["timings"]["total"] = round(state["executionSeconds"], 3)
            state["timings"]["wall"] = round(time.time() - state["createdEpoch"], 3)
            # Browser capture may arrive immediately after preview publication.
            # Merge under the same lock/transaction as receipt handling; never
            # overwrite its visual_review checkpoint with this local preview copy.
            with self.store.transaction() as db:
                latest = self.store.workflow(job_id, db)
                if latest and latest.get("inputRevision", 0) > state.get("inputRevision", 0):
                    # Input can arrive immediately after awaiting_input is
                    # published, before this worker finishes its timing audit.
                    latest["executionSeconds"], latest["timings"] = state["executionSeconds"], state["timings"]
                    state = latest
                elif state.get("checkpointStage") == "preview" and latest and latest.get("draftId") == state.get("draftId") and latest.get("captures") and latest.get("checkpointStage") == "visual_review":
                    for key in ("captures", "captureHistory", "checkpointStage"):
                        state[key] = latest[key]
                self.store.put_workflow(job_id, state, db)
            self._public(job_id, state)

    def input(self, job_id, body):
        allowed = {"requestId", "revision", "submissionId", "scaleMode", "mmPerPixel", "calibration", "prompt", "publicMessage"}
        if not isinstance(body, dict) or set(body) - allowed:
            raise LabError("invalid_workflow_input", "比例补充包含不支持字段。")
        submission = body.get("submissionId")
        if not isinstance(submission, str) or not re.fullmatch(r"[a-f0-9]{32}", submission):
            raise LabError("invalid_submission_id", "submissionId必须为32位随机十六进制标识。")
        digest = hashlib.sha256(dump(body).encode()).hexdigest()
        queued = False
        with self.store.transaction() as db:
            job = self.store.job(job_id, db)
            state = self.store.workflow(job_id, db)
            if job["payload"].get("executionMode") != "api" or not state:
                raise LabError("not_api_workflow", "此任务不属于可恢复的API工作流。", 409)
            receipt = state.get("inputReceipts", {}).get(submission)
            if receipt:
                if receipt != digest:
                    raise LabError("workflow_input_replay_conflict", "同一提交标识已用于不同内容。", 409)
                return {"job": self.lab.public_job(job_id, db), "idempotent": True}
            if job["record"]["status"] != "awaiting_input" or state.get("checkpointStage") != "selecting_scale":
                raise LabError("job_not_waiting", "任务当前未等待比例补充。", 409)
            revision = body.get("revision")
            if body.get("requestId") != job_id or not isinstance(revision, int) or isinstance(revision, bool) or revision != state.get("inputRevision", 0):
                raise LabError("workflow_input_revision_conflict", "比例补充版本已变化，请重新读取任务。", 409)
            self.lab.provider_for_job(job, state)
            if self.store.project(job["project_id"], db)["version"] != job["payload"]["baseVersion"]:
                raise LabError("version_conflict", "项目已有新版本，不能继续旧任务。", 409)
            payload = {key: value for key, value in job["payload"].items() if key not in ("scaleMode", "mmPerPixel", "calibration")}
            payload.update({key: body[key] for key in ("scaleMode", "mmPerPixel", "calibration", "prompt") if key in body})
            if not isinstance(payload.get("prompt", ""), str) or len(payload.get("prompt", "")) > 12000:
                raise LabError("invalid_prompt", "生成要求格式无效或过长。")
            validate_scale_input(payload, state["asset"])
            record = job["record"]
            try:
                provenance = choose_scale(payload, state["analysis"], state["asset"])
                check = self.lab.engine.validate_scale_provenance(provenance, provenance["mmPerPixel"], state["asset"]["width"], state["asset"]["height"])
                if check.get("errors"):
                    raise LabError("scale_evidence_invalid", "尺度依据未通过校验。", 422)
            except LabError as exc:
                record.update(error={"code": exc.code, "message": exc.message}, message=exc.message)
            else:
                state["scaleProvenance"], state["checkpointStage"] = provenance, "structure"
                record.pop("error", None)
                record.update(status="queued", stage="structure", scaleProvenance=provenance, message="比例已补充，保留原分析并继续结构构建。")
                queued = True
            state["inputRevision"] = revision + 1
            state.setdefault("inputReceipts", {})[submission] = digest
            from .app import generation_input
            record["input"] = generation_input(payload)
            record.setdefault("events", []).append({"at": now(), "stage": record["stage"], "message": record["message"]})
            # Store.artifact opens its own transaction; this receipt already
            # owns the SQLite lock, so write an opaque audit file directly.
            raw = dump({"input": generation_input(payload), "revision": state["inputRevision"], "error": record.get("error")}).encode()
            artifact_id = uid()
            directory = self.store.root / "jobs" / job_id
            directory.mkdir(parents=True, exist_ok=True)
            name = artifact_id + ".json"
            (directory / name).write_bytes(raw)
            state.setdefault("artifacts", []).append({"id": artifact_id, "name": name, "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "stage": "selecting_scale", "kind": "user_input", "at": now()})
            self.store.put_workflow(job_id, state, db)
            db.execute("UPDATE jobs SET payload=?,record=? WHERE id=?", (dump(payload), dump(record), job_id))
            result = {"job": self.lab.public_job(job_id, db)}
        if queued:
            self.lab.pending.put(job_id)
        return result

    def draft(self, job_id):
        job = self.store.job(job_id)
        state = self.store.workflow(job_id)
        if not state or not state.get("draftId") or state.get("validation", {}).get("errors"):
            raise LabError("draft_not_found", "任务尚无通过几何校验的候选。", 404)
        from .app import public_asset
        return {"draftId": state["draftId"], "scene": state["scene"], "state": state["editorState"], "validation": state["validation"], "sourceAsset": public_asset(self.store.asset(job["payload"]["assetId"])), "scaleProvenance": state["scaleProvenance"]}

    def viewer(self, job_id, draft_id):
        value = self.draft(job_id)
        if draft_id != value["draftId"]:
            raise LabError("stale_draft", "候选已更新，请重新加载预览。", 409)
        from engine.viewer import render_viewer_html
        return render_viewer_html(value["scene"], value["state"], "draft-" + draft_id, 1, source_asset_url=value["sourceAsset"]["url"])

    def review_images(self, job_id, body):
        from .app import image_dimensions
        job = self.store.job(job_id)
        if not self.lab._worker_job(job["payload"]):
            raise LabError("api_runtime_snapshot_missing", "历史任务没有可验证的API配置快照，未继续模型调用。", 409)
        strict = job["payload"].get("executionMode") == "api"
        if strict:
            self.lab.provider_for_job(job, self.store.workflow(job_id))
        draft_id, images = body.get("draftId"), body.get("images")
        if not isinstance(images, list) or len(images) != 2 or any(not isinstance(item, dict) or item.get("view") not in ("2d", "3d") for item in images) or {item["view"] for item in images} != {"2d", "3d"}:
            raise LabError("review_images_required", "请同时提交当前候选的真实2D及3D截图。", 422)
        decoded = {}
        for item in images:
            value = item.get("dataUrl")
            match = re.fullmatch(r"data:(image/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)", value) if isinstance(value, str) and len(value) <= 6 * 1024 * 1024 else None
            if not match:
                raise LabError("invalid_review_image", "截图必须是有效PNG/JPEG/WebP且不超过4MB。", 422)
            try:
                raw = base64.b64decode(match[2], validate=True)
            except binascii.Error:
                raise LabError("invalid_review_image", "截图编码无效。", 422) from None
            if strict:
                from .handoff import verified_capture
                mime, width, height = verified_capture(raw, match[1])
            else:
                mime, width, height = image_dimensions(raw)
            if mime != match[1] or len(raw) > 4 * 1024 * 1024 or not 1 <= width <= 1280 or not 1 <= height <= 1280:
                raise LabError("invalid_review_image", "截图最长边须不超过1280像素，大小不超过4MB。", 422)
            decoded[item["view"]] = {"raw": raw, "mime": mime, "width": width, "height": height, "sha256": hashlib.sha256(raw).hexdigest()}
        receipt_hash = hashlib.sha256(dump({view: decoded[view]["sha256"] for view in ("2d", "3d")}).encode()).hexdigest()
        with self.store.transaction() as db:
            job = self.store.job(job_id, db)
            state = self.store.workflow(job_id, db)
            if not state or draft_id != state.get("draftId"):
                raise LabError("stale_draft", "截图对应的候选已过期。", 409)
            existing = state.get("captures")
            if existing:
                if existing["receiptHash"] != receipt_hash:
                    raise LabError("capture_conflict", "当前候选已接收不同截图，请勿覆盖。", 409)
                return {"job": job["record"], "idempotent": True}
            if job["record"]["status"] != "awaiting_review_images":
                raise LabError("job_not_waiting", "任务当前不在等待截图阶段。", 409)
            if strict and self.store.project(job["project_id"], db)["version"] != job["payload"]["baseVersion"]:
                raise LabError("version_conflict", "项目已更新，不能复核旧候选。", 409)
            saved = {}
            for view, data in decoded.items():
                # write files without nested SQLite transactions
                directory = self.store.root / "jobs" / job_id
                directory.mkdir(parents=True, exist_ok=True)
                name = uid() + ".bin"
                (directory / name).write_bytes(data["raw"])
                saved[view] = {key: data[key] for key in ("mime", "width", "height", "sha256")} | {"artifact": {"name": name}}
            state["captures"] = {"draftId": draft_id, "receiptHash": receipt_hash, "images": saved, "receivedAt": now()}
            self._artifact_manifest_capture(state)
            state["checkpointStage"] = "visual_review"
            self.store.put_workflow(job_id, state, db)
            record = job["record"]
            record.update(status="queued", stage="visual_review", reviewImagesRequired=False, message="客户端提交的2D/3D图片已接收，等待模型对照原图复核；服务端不证明渲染来源。")
            record["events"].append({"at": now(), "stage": "visual_review", "message": record["message"]})
            db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job_id))
        self.lab.pending.put(job_id)
        return {"job": record, "idempotent": False}

    @staticmethod
    def _artifact_manifest_capture(state):
        state.setdefault("captureHistory", []).append(copy.deepcopy(state["captures"]))
