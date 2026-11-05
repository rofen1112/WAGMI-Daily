"""Explicit current-chat handoff. No SDK, CLI, remote call, code or path input."""
import base64
import binascii
import copy
import hashlib
import io
import json
import re
import warnings
from pathlib import Path
from .events import public_text
from .scale import choose_scale, validate_scale_input
from .store import LabError, dump, now, uid
from .workflow import safe_analysis, normalized_review, DEFAULT_LIMITS
from .workflow_prompts import WORKFLOW_PROMPT_VERSION

PIPELINE = "codex-handoff-v1"
MODEL = "codex-current-session"
TERMINAL = {"succeeded", "failed", "cancelled", "canceled", "needs_input"}


def verified_capture(raw, expected_mime):
    """Decode submitted pixels; this does not prove their rendering provenance."""
    try:
        from PIL import Image, ImageFile
    except ImportError:
        raise LabError("capture_decoder_unavailable", "截图校验依赖Pillow，请按server/requirements.txt安装后重试。", 503) from None
    if ImageFile.LOAD_TRUNCATED_IMAGES:
        raise LabError("capture_decoder_config_invalid", "截图解码器不允许容忍截断图片。", 503)
    if len(raw) > 4 * 1024 * 1024:
        raise LabError("invalid_review_image", "截图文件须不超过4MB。", 422)
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(io.BytesIO(raw)) as picture:
                mime = {"PNG": "image/png", "JPEG": "image/jpeg", "WEBP": "image/webp"}.get(picture.format)
                width, height = picture.size
                if mime != expected_mime or not 1 <= width <= 1280 or not 1 <= height <= 1280 or width * height > 1280 * 1280 or getattr(picture, "n_frames", 1) != 1:
                    raise ValueError()
                picture.verify()
            with Image.open(io.BytesIO(raw)) as picture:
                picture.load()
        return mime, width, height
    except Exception:
        raise LabError("invalid_review_image", "截图无法完整解码、格式不一致或尺寸超过1280像素上限。", 422) from None


class HandoffRunner:
    def __init__(self, lab):
        self.lab, self.store = lab, lab.store

    def _state(self, job, db):
        if job["payload"].get("pipelineVersion") != PIPELINE:
            raise LabError("not_handoff_job", "此历史任务不属于当前聊天接力流程。", 409)
        value = self.store.workflow(job["id"], db)
        if value is not None:
            return value
        asset = self.store.asset(job["payload"]["assetId"], db)
        return {"pipelineVersion": PIPELINE, "requestId": job["id"], "revision": 0, "phase": "analysis", "checkpointStage": "handoff_analysis", "asset": {key: asset[key] for key in ("id", "name", "mime", "width", "height")}, "sourceHash": asset["sha256"], "limits": copy.deepcopy(job["payload"].get("workflowLimits", DEFAULT_LIMITS)), "receipts": {}, "artifacts": [], "calls": [], "repairsUsed": 0, "reviewsUsed": 0, "createdAt": now()}

    def public_context(self, job, db):
        state = self._state(job, db)
        return {"requestId": state["requestId"], "revision": state["revision"], "phase": state["phase"]}

    def _safe_file(self, job_id, name, assets=False):
        pattern = r"[a-f0-9]{32}\.(?:bin|png|jpg|jpeg|webp)" if assets else r"[a-f0-9]{32}\.(?:json|bin)"
        if not isinstance(name, str) or not re.fullmatch(pattern, name):
            raise LabError("handoff_asset_invalid", "接力文件引用无效。", 422)
        base = self.store.root / ("assets" if assets else "jobs")
        if not assets:
            base = base / job_id
        path = base / name
        if not path.is_file() or path.is_symlink() or path.resolve().parent != base.resolve() or not base.resolve().is_relative_to(self.store.root.resolve()):
            raise LabError("handoff_asset_invalid", "接力文件不可用。", 422)
        return path

    def request(self, job_id):
        with self.store.transaction() as db:
            job = self.store.job(job_id, db)
            state = self._state(job, db)
            asset = self.store.asset(job["payload"]["assetId"], db)
            source = self._safe_file(job_id, asset["filename"], True)
            if hashlib.sha256(source.read_bytes()).hexdigest() != state["sourceHash"]:
                raise LabError("source_changed", "原图与任务绑定哈希不一致。", 409)
            captures = []
            for view, item in state.get("captures", {}).get("images", {}).items():
                path = self._safe_file(job_id, item["artifact"]["name"])
                if hashlib.sha256(path.read_bytes()).hexdigest() != item["sha256"]:
                    raise LabError("capture_changed", "复核截图哈希不一致。", 409)
                captures.append({"view": view, "path": str(path), **{key: item[key] for key in ("sha256", "mime", "width", "height")}})
            return {"jobId": job_id, **self.public_context(job, db), "status": job["record"]["status"], "pipelineVersion": PIPELINE, "promptVersion": job["record"].get("promptVersion", WORKFLOW_PROMPT_VERSION), "model": MODEL, "sourceHash": state["sourceHash"], "sourceAsset": {**{key: asset[key] for key in ("id", "name", "mime", "width", "height")}, "path": str(source)}, "input": {key: job["payload"][key] for key in ("prompt", "scaleMode", "mmPerPixel", "calibration", "baseVersion") if key in job["payload"]}, "analysis": state.get("analysis"), "scaleProvenance": state.get("scaleProvenance"), "pixelScene": state.get("candidateIR"), "validation": state.get("validation"), "draftId": state.get("draftId"), "captures": captures, "visualReview": state.get("review"), "limits": state["limits"], "usage": None, "instructions": "由当前Codex查看原图，先提交analysis及尺度依据，再提交完整原图像素candidate；网页提交真实2D/3D截图后对照原图提交review，最后finalize。仅提交数据，不提交代码或路径；当前聊天用量未接入本地账单。"}

    def _guard(self, job, state, body, kind, db):
        if not isinstance(body, dict):
            raise LabError("invalid_handoff_input", "接力提交必须为JSON对象。")
        submission = body.get("submissionId")
        if not isinstance(submission, str) or not re.fullmatch(r"[a-f0-9]{32}", submission):
            raise LabError("invalid_submission_id", "submissionId必须为32位随机十六进制标识。")
        digest = hashlib.sha256(dump(body).encode()).hexdigest()
        receipt = state["receipts"].get(submission)
        if receipt:
            if receipt["kind"] != kind or receipt["sha256"] != digest:
                raise LabError("handoff_replay_conflict", "同一提交标识已用于不同内容。", 409)
            return submission, digest, True
        if job["record"]["status"] in TERMINAL:
            raise LabError("handoff_job_stopped", "任务已停止，不能继续提交。", 409)
        if body.get("requestId") != state["requestId"] or not isinstance(body.get("revision"), int) or isinstance(body.get("revision"), bool) or body["revision"] != state["revision"]:
            raise LabError("handoff_revision_conflict", "接力版本已变化，请重新读取request后提交。", 409)
        project = self.store.project(job["project_id"], db)
        if project["version"] != job["payload"]["baseVersion"]:
            raise LabError("version_conflict", "项目已有新版本，本接力不能覆盖。", 409)
        return submission, digest, False

    def _artifact(self, job_id, state, kind, value):
        raw = dump(value).encode()
        directory = self.store.root / "jobs" / job_id
        directory.mkdir(parents=True, exist_ok=True)
        name = uid() + ".json"
        path = directory / name
        path.write_bytes(raw)
        state["artifacts"].append({"kind": kind, "name": name, "sha256": hashlib.sha256(raw).hexdigest(), "bytes": len(raw), "at": now()})

    def _finish(self, job, state, body, kind, submission, digest, db, **fields):
        state["revision"] += 1
        state["checkpointStage"] = "handoff_" + state["phase"]
        state["receipts"][submission] = {"kind": kind, "sha256": digest, "revision": state["revision"]}
        record = job["record"]
        record.update(fields)
        if "error" not in fields:
            record.pop("error", None)
        record["executionMode"], record["model"], record["usage"] = "codex_handoff", MODEL, None
        record.setdefault("events", []).append({"at": now(), "type": "stage", "stage": record["stage"], "message": record["message"]})
        message = public_text(body.get("publicMessage", ""), 1000)
        if message:
            record["events"].append({"at": now(), "type": "agent_message", "stage": record["stage"], "message": message})
        self.store.put_workflow(job["id"], state, db)
        db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job["id"]))

    def submit(self, job_id, kind, body):
        if kind not in ("analysis", "candidate", "review", "finalize", "input"):
            raise LabError("not_found", "接力操作不存在。", 404)
        common = {"requestId", "revision", "submissionId", "publicMessage"}
        allowed = {"analysis": {"analysis"}, "candidate": {"pixelScene"}, "review": {"draftId", "review"}, "finalize": {"draftId"}, "input": {"scaleMode", "mmPerPixel", "calibration", "prompt"}}[kind]
        if not isinstance(body, dict) or set(body) - common - allowed:
            raise LabError("invalid_handoff_input", "接力提交含不支持字段；不得提交代码、命令或文件路径。")
        with self.store.transaction() as db:
            job = self.store.job(job_id, db)
            state = self._state(job, db)
            submission, digest, replay = self._guard(job, state, body, kind, db)
            if replay:
                return {"job": self.lab.public_job(job_id, db), "idempotent": True}
            payload = job["payload"]
            if kind == "analysis":
                if state["phase"] not in ("analysis", "input") or not isinstance(body.get("analysis"), dict):
                    raise LabError("handoff_phase_conflict", "当前阶段不接受analysis。", 409)
                state["analysis"] = copy.deepcopy(body["analysis"])
                self._artifact(job_id, state, "analysis", state["analysis"])
                self._select_scale(job, state, payload, body, kind, submission, digest, db)
            elif kind == "input":
                if state["phase"] != "input":
                    raise LabError("handoff_phase_conflict", "当前任务未等待比例补充。", 409)
                payload = {key: value for key, value in payload.items() if key not in ("scaleMode", "mmPerPixel", "calibration")}
                payload.update({key: body[key] for key in ("scaleMode", "mmPerPixel", "calibration", "prompt") if key in body})
                if "prompt" in payload and (not isinstance(payload["prompt"], str) or len(payload["prompt"]) > 12000):
                    raise LabError("invalid_prompt", "生成要求过长或格式无效。")
                validate_scale_input(payload, state["asset"])
                job["payload"] = payload
                job["record"]["input"] = {key: payload[key] for key in ("scaleMode", "mmPerPixel", "calibration", "prompt") if key in payload}
                db.execute("UPDATE jobs SET payload=? WHERE id=?", (dump(payload), job_id))
                self._select_scale(job, state, payload, body, kind, submission, digest, db)
            elif kind == "candidate":
                self._candidate(job, state, body, submission, digest, db)
            elif kind == "review":
                if state["phase"] != "review" or body.get("draftId") != state.get("draftId"):
                    raise LabError("handoff_phase_conflict", "复核必须绑定当前已截图候选。", 409)
                if state["reviewsUsed"] >= state["limits"]["maxVisualReviews"]:
                    raise LabError("workflow_budget_exhausted", "已达到视觉复核上限。", 422)
                try:
                    review = normalized_review(body["review"])
                except (KeyError, TypeError, AttributeError):
                    raise LabError("visual_review_invalid", "复核应包含pass、issues与limitations。", 422) from None
                self._artifact(job_id, state, "visual_review", review)
                state["reviewsUsed"] += 1
                state["review"], state["reviewDraftId"] = review, state["draftId"]
                exhausted = not review["pass"] and (state["repairsUsed"] >= state["limits"]["maxRepairs"] or state["reviewsUsed"] >= state["limits"]["maxVisualReviews"])
                state["phase"] = "finalize" if review["pass"] else "stopped" if exhausted else "candidate"
                if not review["pass"] and not exhausted:
                    state["repairsUsed"] += 1
                self._finish(job, state, body, kind, submission, digest, db, status="failed" if exhausted else "awaiting_codex", stage="finalize" if review["pass"] else "visual_repair", visualReview=review, review=review, message="复核通过，等待当前Codex显式完成保存。" if review["pass"] else "视觉复核未通过，候选私有保留；等待限定修正。" if not exhausted else "复核未通过且已达限定次数，未保存场景。")
            else:
                self._finalize(job, state, body, submission, digest, db)
            return {"job": self.lab.public_job(job_id, db)}

    def _select_scale(self, job, state, payload, body, kind, submission, digest, db):
        try:
            provenance = choose_scale(payload, state["analysis"], state["asset"])
            check = self.lab.engine.validate_scale_provenance(provenance, provenance["mmPerPixel"], state["asset"]["width"], state["asset"]["height"])
            if check.get("errors"):
                raise LabError("scale_evidence_invalid", "尺度依据未通过校验。", 422)
        except LabError as exc:
            state["phase"] = "input"
            self._finish(job, state, body, kind, submission, digest, db, status="awaiting_input", stage="awaiting_input", analysis=safe_analysis(state["analysis"]), progress=15, error={"code": exc.code, "message": exc.message}, message=exc.message)
            return
        state["scaleProvenance"], state["phase"] = provenance, "candidate"
        self._finish(job, state, body, kind, submission, digest, db, status="awaiting_codex", stage="structure", progress=25, analysis=safe_analysis(state["analysis"]), scaleProvenance=provenance, message="分析与尺度已记录，等待当前Codex识别原图像素结构和家具。")

    def _candidate(self, job, state, body, submission, digest, db):
        if state["phase"] != "candidate" or not isinstance(body.get("pixelScene"), dict):
            raise LabError("handoff_phase_conflict", "当前阶段不接受完整候选。", 409)
        from engine.primitives import expand_primitives
        candidate = copy.deepcopy(body["pixelScene"])
        self._artifact(job["id"], state, "candidate_input", candidate)
        try:
            candidate = expand_primitives(candidate)
            metadata = candidate.get("metadata")
            if isinstance(metadata, dict):
                metadata.pop("generation", None)
                metadata.pop("scaleProvenance", None)
            project = self.store.project(job["project_id"], db)
            scene, validation = self.lab.engine.compile_pixel_scene(candidate, state["asset"]["width"], state["asset"]["height"], state["scaleProvenance"]["mmPerPixel"], project["id"], project["title"], scale_provenance=state["scaleProvenance"])
            editor_state = self.lab.engine.default_state(scene) if not validation.get("errors") else None
            if editor_state is not None:
                validation["errors"].extend(self.lab.engine.validate_state(scene, editor_state).get("errors", []))
        except (ValueError, TypeError, KeyError):
            scene, editor_state, validation = None, None, {"errors": [{"code": "candidate_invalid", "path": "$", "message": "候选未符合像素场景与可编辑状态契约。"}], "warnings": []}
        state["candidateIR"], state["validation"] = candidate, validation
        self._artifact(job["id"], state, "candidate_checks", validation)
        if validation.get("errors"):
            for key in ("draftId", "captures", "scene", "editorState"):
                state.pop(key, None)
            job["record"].pop("draft", None)
            job["record"]["reviewImagesRequired"] = False
            exhausted = state["repairsUsed"] >= state["limits"]["maxRepairs"]
            if not exhausted:
                state["repairsUsed"] += 1
            state["phase"] = "stopped" if exhausted else "candidate"
            self._finish(job, state, body, "candidate", submission, digest, db, status="failed" if exhausted else "awaiting_codex", stage="geometry_repair", validation=validation, message="候选未通过完整几何/编辑状态校验；已私有保留，未保存正式版本。")
            return
        state.update(scene=scene, editorState=editor_state, draftId=uid(), phase="captures")
        state.pop("captures", None)
        state.pop("review", None)
        state.pop("reviewDraftId", None)
        self._artifact(job["id"], state, "validated_scene", {"scene": scene, "state": editor_state})
        self._finish(job, state, body, "candidate", submission, digest, db, status="awaiting_review_images", stage="preview", progress=70, validation=validation, draft={"id": state["draftId"], "viewerUrl": f"/api/ai-lab/v1/jobs/{job['id']}/viewer?draftId={state['draftId']}"}, reviewImagesRequired=True, message="候选已通过数据校验，等待网页真实2D/3D截图；尚未保存。")

    def review_images(self, job_id, body):
        images = body.get("images") if isinstance(body, dict) else None
        if not isinstance(images, list) or len(images) != 2 or any(not isinstance(item, dict) or item.get("view") not in ("2d", "3d") for item in images) or {item["view"] for item in images} != {"2d", "3d"}:
            raise LabError("review_images_required", "请提交当前候选真实2D和3D截图。", 422)
        decoded = {}
        for item in images:
            value = item.get("dataUrl")
            match = re.fullmatch(r"data:(image/(?:png|jpeg|webp));base64,([A-Za-z0-9+/=]+)", value) if isinstance(value, str) and len(value) <= 6 * 1024 * 1024 else None
            if not match:
                raise LabError("invalid_review_image", "截图编码或大小无效。", 422)
            try:
                raw = base64.b64decode(match[2], validate=True)
            except binascii.Error:
                raise LabError("invalid_review_image", "截图编码无效。", 422) from None
            mime, width, height = verified_capture(raw, match[1])
            decoded[item["view"]] = {"raw": raw, "mime": mime, "width": width, "height": height, "sha256": hashlib.sha256(raw).hexdigest()}
        receipt_hash = hashlib.sha256(dump({view: decoded[view]["sha256"] for view in ("2d", "3d")}).encode()).hexdigest()
        with self.store.transaction() as db:
            job = self.store.job(job_id, db)
            state = self._state(job, db)
            if body.get("draftId") != state.get("draftId"):
                raise LabError("stale_draft", "截图对应候选已更新。", 409)
            if job["record"]["status"] in TERMINAL:
                raise LabError("handoff_job_stopped", "任务已停止，不能接收截图。", 409)
            if state.get("captures"):
                if state["captures"]["receiptHash"] != receipt_hash:
                    raise LabError("capture_conflict", "此候选已有不同截图。", 409)
                return {"job": self.lab.public_job(job_id, db), "idempotent": True}
            if state["phase"] != "captures" or job["record"]["status"] != "awaiting_review_images":
                raise LabError("job_not_waiting", "任务当前未等待截图。", 409)
            project = self.store.project(job["project_id"], db)
            if project["version"] != job["payload"]["baseVersion"]:
                raise LabError("version_conflict", "项目已更新，不能复核旧候选。", 409)
            saved = {}
            directory = self.store.root / "jobs" / job_id
            directory.mkdir(parents=True, exist_ok=True)
            for view, item in decoded.items():
                name = uid() + ".bin"
                (directory / name).write_bytes(item["raw"])
                saved[view] = {key: item[key] for key in ("mime", "width", "height", "sha256")} | {"artifact": {"name": name}}
            state["captures"] = {"draftId": state["draftId"], "receiptHash": receipt_hash, "images": saved, "receivedAt": now()}
            state["phase"], state["revision"] = "review", state["revision"] + 1
            state["checkpointStage"] = "handoff_review"
            self.store.put_workflow(job_id, state, db)
            record = job["record"]
            record.update(status="awaiting_codex", stage="visual_review", progress=85, reviewImagesRequired=False, message="客户端提交的2D/3D图片已完整解码，等待当前Codex对照原图核对；服务端不证明渲染来源。")
            record.setdefault("events", []).append({"at": now(), "type": "stage", "stage": "visual_review", "message": record["message"]})
            db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job_id))
            return {"job": self.lab.public_job(job_id, db)}

    def _finalize(self, job, state, body, submission, digest, db):
        if state["phase"] != "finalize" or body.get("draftId") != state.get("draftId") or state.get("reviewDraftId") != state.get("draftId") or not state.get("review", {}).get("pass"):
            raise LabError("review_required", "必须先对当前截图候选完成通过复核。", 409)
        scene, editor_state = copy.deepcopy(state["scene"]), copy.deepcopy(state["editorState"])
        scene.setdefault("metadata", {})["generation"] = {"pipelineVersion": PIPELINE, "promptVersion": job["record"].get("promptVersion", WORKFLOW_PROMPT_VERSION), "model": MODEL, "jobId": job["id"], "sourceSha256": state["sourceHash"], "settings": {"executionMode": "codex_handoff"}, "limits": state["limits"], "reviewAppliesTo": "initial_generated_scene", "modelVisualReview": state["review"], "usageAccounting": "current_session_unreported"}
        validation = self.lab.engine.validate_scene(scene)
        validation["errors"].extend(self.lab.engine.validate_state(scene, editor_state).get("errors", []))
        if validation.get("errors"):
            raise LabError("scene_validation_failed", "保存前完整校验未通过。", 422, validation)
        from .app import public_asset
        asset = self.store.asset(job["payload"]["assetId"], db)
        version = self.store.commit_scene(job["project_id"], job["payload"]["baseVersion"], scene, editor_state, validation, public_asset(asset), "generated", job["id"], db=db)
        state["phase"], state["scene"] = "completed", scene
        self._finish(job, state, body, "finalize", submission, digest, db, status="succeeded", stage="saved", progress=100, sceneVersion=version, validation=validation, reviewImagesRequired=False, message="当前Codex接力完成并保存；复核仅绑定初始生成版本。")
