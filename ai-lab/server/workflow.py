"""Resumable image→data→real browser captures→vision review workflow.

There is one worker. Awaiting browser captures is a persisted checkpoint, not a
blocking wait, and no project scene is committed until both gates pass.
"""
import base64
import binascii
import copy
import hashlib
import json
import re
import time

from . import workflow_prompts as prompts
from .prompts import parse_json
from .provider import MODEL, ProviderError, normalize_usage
from .scale import choose_scale, texts
from .store import LabError, dump, now, uid

PIPELINE_VERSION = "codex-workflow-v1"
LEGACY_PIPELINE = "legacy-single-v1"
MAX_CALLS, MAX_REPAIRS, MAX_REVIEWS = 8, 2, 2
DEFAULT_LIMITS = {"maxCalls": MAX_CALLS, "maxRepairs": MAX_REPAIRS, "maxVisualReviews": MAX_REVIEWS}


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

    def _call(self, job_id, state, stage, messages):
        self._stopped(job_id)
        if len(state["calls"]) >= limits_for(state)["maxCalls"]:
            raise LabError("workflow_budget_exhausted", "已达到本任务的模型调用上限；候选已私有保留。", 422)
        # Persist a reservation before the network call. Restart never replays it.
        index = len(state["calls"]) + 1
        call = {"index": index, "phase": stage, "status": "running", "usage": None, "startedAt": now(), "settings": settings(self.lab.provider)}
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
            response = self.lab.provider.complete(messages)
            call["usage"] = normalize_usage(response.get("usage"))
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
        state["scene"], state["validation"] = scene, validation
        if scene:
            scene.setdefault("metadata", {}).update(pipelineVersion=PIPELINE_VERSION, promptVersion=prompts.WORKFLOW_PROMPT_VERSION)
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
            state = {"pipelineVersion": PIPELINE_VERSION, "checkpointStage": "analyzing", "asset": {key: asset[key] for key in ("id", "name", "mime", "width", "height")}, "sourceHash": asset["sha256"], "settings": settings(self.lab.provider), "limits": copy.deepcopy(payload.get("workflowLimits", DEFAULT_LIMITS)), "calls": [], "timings": {}, "repairsUsed": 0, "reviewsUsed": 0, "artifacts": [], "createdAt": now(), "createdEpoch": time.time(), "executionSeconds": 0}
            self._save(job_id, state)
        elif "limits" not in state:
            state["limits"] = copy.deepcopy(DEFAULT_LIMITS)
            self._save(job_id, state)
        started = time.monotonic()
        try:
            self._public(job_id, state, status="running", stage=state["checkpointStage"], message="继续分阶段图纸工作流。")
            self._stopped(job_id)
            project = self.store.project(project_id)
            if project["version"] != payload["baseVersion"]:
                raise LabError("version_conflict", "工作流期间项目版本已更新，请重新开始；候选已保留。", 409)
            if not self.lab.provider.configured:
                raise ProviderError("api_key_missing", "请在后端私有配置中设置模型 Key。")
            if not self.lab.provider.supports_images:
                raise LabError("gateway_image_support_unverified", "网关图像能力尚未验证，工作流无法继续。", 422)
            asset_row = self.store.asset(payload["assetId"])
            original_raw = (self.store.root / "assets" / asset_row["filename"]).read_bytes()
            original_url = "data:" + asset_row["mime"] + ";base64," + base64.b64encode(original_raw).decode()
            while True:
                self._stopped(job_id)
                stage = state["checkpointStage"]
                if stage == "analyzing":
                    state["analysis"] = self._call(job_id, state, stage, prompts.analyze_messages(state["asset"], original_url, payload))
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
                        result = self._call(job_id, state, stage, prompts.scale_estimation_messages(state["asset"], original_url, state["analysis"]))
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
                    state["candidateIR"] = self._call(job_id, state, stage, prompts.structure_messages(state["asset"], original_url, payload, state["analysis"], state["scaleProvenance"]))
                    # Architectural generation cannot smuggle prefilled furnishings.
                    state["candidateIR"]["furniture"] = []
                    state["candidateIR"].pop("furnitureRows", None)
                    state["checkpointStage"] = "furnishing"
                    self._public(job_id, state, progress=35)
                elif stage == "furnishing":
                    furniture = self._call(job_id, state, stage, prompts.furnish_messages(state["asset"], original_url, state["candidateIR"], state["analysis"], state["scaleProvenance"]))
                    if not ({"furniture", "furnitureRows"} & set(furniture)) or set(furniture) - {"furniture", "furnitureRows", "notes"} or not isinstance(furniture.get("furniture", []), list) or not isinstance(furniture.get("furnitureRows", []), list):
                        raise LabError("furnishing_scope_invalid", "家具阶段试图修改建筑或返回了不支持的数据；未应用。", 422)
                    state["candidateIR"].update({key: furniture[key] for key in ("furniture", "furnitureRows") if key in furniture})
                    state["checkpointStage"] = "validating"
                    self._public(job_id, state, progress=55)
                elif stage == "validating":
                    if not self._compile(job_id, state, project):
                        state["checkpointStage"] = "geometry_repair"
                    else:
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
                    self._save(job_id, state)
                    candidate = self._call(job_id, state, stage, prompts.repair_messages(state["asset"], original_url, state["candidateIR"], state["scaleProvenance"], validation=state.get("validation") if stage == "geometry_repair" else None, review=state.get("review") if stage == "visual_repair" else None, capture_urls=self._capture_urls(job_id, state) if stage == "visual_repair" else None))
                    state["candidateIR"] = candidate
                    state["checkpointStage"] = "validating"
                elif stage == "visual_review":
                    if state["reviewsUsed"] >= limits_for(state)["maxVisualReviews"]:
                        raise LabError("workflow_review_budget_exhausted", "视觉复核次数已用完；未通过的候选不会保存为正式场景。", 422)
                    if not state.get("captures") or state["captures"]["draftId"] != state["draftId"]:
                        raise LabError("review_images_required", "当前候选需要真实2D/3D截图。", 422)
                    state["reviewsUsed"] += 1
                    self._save(job_id, state)
                    review = self._call(job_id, state, stage, prompts.review_messages(state["asset"], original_url, self._capture_urls(job_id, state), state["scene"], state["analysis"], state["scaleProvenance"]))
                    state["review"] = normalized_review(review)
                    self._artifact(job_id, state, stage, "checks", state["review"])
                    self._public(job_id, state, visualReview=state["review"], progress=85)
                    if not state["review"]["pass"]:
                        if state["reviewsUsed"] >= limits_for(state)["maxVisualReviews"]:
                            raise LabError("visual_review_failed", "达到本任务视觉复核上限后仍有未解决问题；候选已私有保留。", 422)
                        state["checkpointStage"] = "visual_repair"
                    else:
                        self._stopped(job_id)
                        # Never substitute a reference scene. Commit only this checked draft.
                        generation_settings = {key: copy.deepcopy(state["settings"].get(key)) for key in ("model", "wireMode", "reasoningEffort", "jsonMode", "maxOutputTokens", "timeoutSeconds")}
                        state["scene"].setdefault("metadata", {})["generation"] = {
                            "pipelineVersion": PIPELINE_VERSION,
                            "promptVersion": job["record"].get("promptVersion", prompts.WORKFLOW_PROMPT_VERSION),
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
            code = "needs_input" if exc.code in ("scale_unknown", "scale_anchors_conflict", "scale_evidence_invalid", "gateway_image_support_unverified", "review_images_required") else "failed"
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
                if state.get("checkpointStage") == "preview" and latest and latest.get("draftId") == state.get("draftId") and latest.get("captures") and latest.get("checkpointStage") == "visual_review":
                    for key in ("captures", "captureHistory", "checkpointStage"):
                        state[key] = latest[key]
                self.store.put_workflow(job_id, state, db)
            self._public(job_id, state)

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
            record.update(status="queued", stage="visual_review", reviewImagesRequired=False, message="已接收真实2D/3D截图，等待视觉复核。")
            record["events"].append({"at": now(), "stage": "visual_review", "message": record["message"]})
            db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job_id))
        self.lab.pending.put(job_id)
        return {"job": record, "idempotent": False}

    @staticmethod
    def _artifact_manifest_capture(state):
        state.setdefault("captureHistory", []).append(copy.deepcopy(state["captures"]))
