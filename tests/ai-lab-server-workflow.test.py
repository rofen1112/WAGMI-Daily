"""Offline staged workflow tests with real engine and injected provider only."""
import base64
import copy
import json
import struct
import sys
import tempfile
import threading
import time
import unittest
import urllib.error
import urllib.request
from unittest import mock
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "ai-lab"))
from engine import scene as real_engine
from server.app import Handler, Lab, PREFIX
from server.scale import choose_scale
from server.store import LabError, uid
from server.workflow import PIPELINE_VERSION, normalized_review, parse_workflow_limits, DEFAULT_LIMITS
from server import workflow_prompts
from server.prompts import parse_json
from server.provider import SeedanceProvider

ANALYSIS = {"summary": "可读平面图，保留原图可见空间与留白", "spaces": ["Office"], "notes": [], "observations": [{"feature": "desk", "evidence": "visible", "confidence": "medium"}], "scale": {"confidence": "high", "evidence": ["图纸两轴标注1000mm"], "assumptions": ["图纸未作透视校正"], "anchors": [{"label": "水平1000", "p1": [0, 0], "p2": [100, 0], "lengthMm": 1000, "source": "dimension_annotation"}, {"label": "垂直1000", "p1": [0, 0], "p2": [0, 100], "lengthMm": 1000, "source": "dimension_annotation"}]}}
STRUCTURE = {"walls": [[0, 0, 100, 2, "e"]], "windows": [], "doors": [], "slides": [], "rooms": [{"id": "r1", "name": "Office", "mat": "wood", "poly": [[0, 0], [100, 0], [100, 100], [0, 100]]}], "furniture": []}
FURNISH = {"furniture": [{"id": "f1", "type": "desk", "name": "Desk", "cx": 50, "cy": 50, "w": 20, "d": 10, "rot": 0}]}
PASS = {"pass": True, "reason": "本轮模型对照检查通过", "issues": [], "limitations": ["比例非现场测量；仍须独立人工验收"]}
FAIL = {"pass": False, "reason": "桌子位置与原图有明显偏差", "issues": [{"severity": "major", "path": "$.furniture[0]", "description": "应向右移动", "suggestedChange": "将像素cx改为55"}], "limitations": []}
UNKNOWN_ANALYSIS = {"summary": "可见床和门，但没有可靠长度标注", "spaces": ["Office"], "notes": ["常见门宽900mm仅是先验，尚未提供端点"], "scale": {"anchors": []}}
ESTIMATED_SCALE = {"mmPerPixel": 10, "rangeMmPerPixel": [8, 12], "confidence": "low", "evidence": ["原图门宽与单人床宽分别作为尺寸量级参照"], "assumptions": ["门宽假设900mm、床宽假设1000mm，都不是读到的标注"], "anchors": [{"label": "门宽常识假设900mm", "p1": [0, 0], "p2": [90, 0], "lengthMm": 900, "source": "object_prior"}, {"label": "单人床宽常识假设1000mm", "p1": [0, 0], "p2": [0, 100], "lengthMm": 1000, "source": "object_prior"}]}


def image_url(width=100, height=100, extra=b""):
    raw = b"\x89PNG\r\n\x1a\n" + b"\x00" * 8 + struct.pack(">II", width, height) + extra
    return "data:image/png;base64," + base64.b64encode(raw).decode()


class ScriptedProvider:
    configured, supports_images = True, True
    model, wire_mode, reasoning_effort, timeout, max_output_tokens = "offline-test-model", "responses", "none", 90, 12000
    def __init__(self, outputs):
        self.outputs = list(outputs)
        self.messages = []
        self.on_call = None

    def complete(self, messages):
        self.messages.append(copy.deepcopy(messages))
        if self.on_call:
            self.on_call(len(self.messages))
        if not self.outputs:
            raise AssertionError("Unexpected model call: budget/idempotency regression")
        value = self.outputs.pop(0)
        if isinstance(value, Exception):
            raise value
        return {"content": json.dumps(value), "usage": {"input_tokens": 10, "output_tokens": 20, "total_tokens": 30, "output_tokens_details": {"reasoning_tokens": 0}}}


class WorkflowTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.provider = ScriptedProvider([ANALYSIS, STRUCTURE, FURNISH, PASS])
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        self.project_id = self.lab.create_project({"title": "Workflow test"})["project"]["id"]
        self.asset = self.lab.upload({"name": "source.png", "dataUrl": image_url()})["asset"]
        self.body = {"pipelineVersion": PIPELINE_VERSION, "assetId": self.asset["id"], "scaleMode": "auto", "prompt": "按原图重建"}

    def tearDown(self):
        self.lab.close()
        self.temp.cleanup()

    def start(self, extra=None):
        job = self.lab.create_job(self.project_id, self.body | (extra or {}))["job"]
        self.lab.run_job(job["id"])
        return self.lab.store.job(job["id"])["record"]

    def captures(self, job_id, marker=b""):
        value = self.lab.workflow.draft(job_id)
        return {"draftId": value["draftId"], "images": [{"view": "2d", "dataUrl": image_url(64, 48, b"plan" + marker)}, {"view": "3d", "dataUrl": image_url(64, 48, b"scene" + marker)}]}

    def finish(self, job_id, marker=b""):
        self.lab.workflow.review_images(job_id, self.captures(job_id, marker))
        self.lab.run_job(job_id)
        return self.lab.store.job(job_id)["record"]

    def test_analysis_structure_furnish_wait_capture_review_save(self):
        spoofed = copy.deepcopy(STRUCTURE)
        spoofed["metadata"] = {"generation": {"model": "model-invented-identity", "jobId": "model-invented-job", "settings": {"apiKey": "model-invented-secret"}}}
        self.provider.outputs = [ANALYSIS, spoofed, FURNISH, PASS]
        waiting = self.start()
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertEqual(waiting["pipelineVersion"], PIPELINE_VERSION)
        self.assertEqual(waiting["promptVersion"], "codex-workflow-prompts-v3")
        self.assertEqual(waiting["scaleProvenance"]["mode"], "measured")
        self.assertEqual(waiting["scaleProvenance"]["mmPerPixel"], 10)
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)
        self.assertEqual(len(self.provider.messages), 3)
        self.assertTrue(waiting["reviewImagesRequired"])
        draft = self.lab.workflow.draft(waiting["id"])
        self.assertEqual(draft["scene"]["furniture"][0]["cx"], 500)
        self.assertEqual(draft["scene"]["metadata"]["scaleProvenance"], waiting["scaleProvenance"])
        self.assertNotIn("generation", draft["scene"]["metadata"])
        private = self.lab.store.workflow(waiting["id"])
        self.assertTrue(private["artifacts"])
        self.assertTrue(all(self.lab.store.artifact_bytes(waiting["id"], item) for item in private["artifacts"]))
        record = self.finish(waiting["id"])
        self.assertEqual(record["status"], "succeeded", record)
        self.assertEqual(len(self.provider.messages), 4)
        self.assertEqual(record["budget"]["visualReviewsUsed"], 1)
        self.assertEqual(self.lab.store.scene(self.project_id)["source"], "generated")
        self.assertEqual(self.lab.store.scene(self.project_id)["version"], 1)
        self.assertEqual(record["visualReview"]["reasons"], [PASS["reason"]])
        self.assertEqual(self.lab.store.scene(self.project_id)["scene"]["metadata"]["pipelineVersion"], PIPELINE_VERSION)
        generation = self.lab.store.scene(self.project_id)["scene"]["metadata"]["generation"]
        self.assertEqual(generation["model"], self.provider.model)
        self.assertEqual(generation["jobId"], waiting["id"])
        self.assertEqual(generation["sourceSha256"], self.lab.store.asset(self.asset["id"])["sha256"])
        self.assertEqual(generation["promptVersion"], "codex-workflow-prompts-v3")
        self.assertEqual(generation["pipelineVersion"], PIPELINE_VERSION)
        self.assertEqual(generation["limits"], DEFAULT_LIMITS)
        self.assertEqual(generation["reviewAppliesTo"], "initial_generated_scene")
        self.assertEqual(generation["modelVisualReview"], record["visualReview"])
        self.assertEqual(set(generation["settings"]), {"model", "wireMode", "reasoningEffort", "jsonMode", "maxOutputTokens", "timeoutSeconds"})
        self.assertFalse(real_engine.validate_scene(self.lab.store.scene(self.project_id)["scene"])["errors"])
        self.assertNotIn("model-invented", json.dumps(generation))
        self.assertNotIn("apiKey", json.dumps(generation))
        local = self.lab.create_job(self.project_id, {"action": "modify", "baseVersion": 1, "prompt": "f1旋转到90度"})["job"]
        self.lab.run_job(local["id"])
        edited = self.lab.store.scene(self.project_id)
        self.assertEqual(edited["version"], 2)
        self.assertEqual(edited["scene"]["metadata"]["generation"], generation)
        self.assertEqual(edited["scene"]["metadata"]["generation"]["reviewAppliesTo"], "initial_generated_scene")
        image_parts = self.provider.messages[-1][1]["content"]
        self.assertEqual(sum(part.get("type") == "image_url" for part in image_parts), 3)
        self.assertNotIn(str(self.root), json.dumps(record))
        self.assertNotIn("candidateIR", record)

    def test_json_mode_is_recorded_in_job_checkpoint_and_each_call_settings(self):
        self.provider.json_mode = True
        waiting = self.start()
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertTrue(waiting["providerSettings"]["jsonMode"])
        state = self.lab.store.workflow(waiting["id"])
        self.assertTrue(state["settings"]["jsonMode"])
        self.assertTrue(all(call["settings"]["jsonMode"] for call in state["calls"]))
        self.assertEqual(self.finish(waiting["id"])["status"], "succeeded")
        self.assertTrue(self.lab.store.scene(self.project_id)["scene"]["metadata"]["generation"]["settings"]["jsonMode"])

    def test_provider_repeat_normalization_and_private_wire_shape_are_audited(self):
        class Response:
            def __init__(self, payload): self.raw = json.dumps(payload).encode()
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self, limit): return self.raw[:limit]
        def payload(parts):
            return {"status": "completed", "output": [{"type": "message", "content": [{"type": "output_text", "text": part}]} for part in parts], "usage": {"total_tokens": 20}}
        analysis_text = json.dumps(ANALYSIS)
        self.lab.provider = SeedanceProvider({"AI_LAB_API_KEY": "private-wire-key", "AI_LAB_GATEWAY_WIRE_MODE": "responses", "AI_LAB_JSON_MODE": "1", "AI_LAB_GATEWAY_IMAGE_VERIFIED": "1"})
        responses = [Response(payload([analysis_text, analysis_text])), Response(payload([json.dumps(STRUCTURE)])), Response(payload([json.dumps(FURNISH)]))]
        with mock.patch("urllib.request.urlopen", side_effect=responses) as send:
            waiting = self.start()
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertEqual(send.call_count, 3)
        self.assertEqual(waiting["usage"]["calls"][0]["normalization"]["count"], 2)
        self.assertTrue(waiting["usage"]["calls"][0]["normalization"]["applied"])
        self.assertFalse(waiting["usage"]["calls"][1]["normalization"]["applied"])
        private = self.lab.store.workflow(waiting["id"])
        output = next(item for item in private["artifacts"] if item["kind"] == "output")
        artifact = json.loads(self.lab.store.artifact_bytes(waiting["id"], output))
        self.assertEqual(artifact["outputStructure"]["outputItemCount"], 2)
        first, second = artifact["outputStructure"]["items"]
        self.assertEqual(first["parts"][0]["textHash"], second["parts"][0]["textHash"])
        self.assertNotIn("outputStructure", waiting["usage"]["calls"][0])
        self.assertNotIn("private-wire-key", json.dumps(artifact))
        self.assertNotIn(str(self.root), json.dumps(artifact))

    def test_conflicting_provider_objects_fail_with_usage_and_private_shape(self):
        class Response:
            def __enter__(self): return self
            def __exit__(self, *args): return False
            def read(self, limit):
                changed = copy.deepcopy(ANALYSIS) | {"summary": "a different result"}
                return json.dumps({"status": "completed", "output": [{"type": "message", "content": [{"type": "output_text", "text": json.dumps(value)}]} for value in (ANALYSIS, changed)], "usage": {"total_tokens": 20}}).encode()[:limit]
        self.lab.provider = SeedanceProvider({"AI_LAB_API_KEY": "private-wire-key", "AI_LAB_GATEWAY_WIRE_MODE": "responses", "AI_LAB_JSON_MODE": "1", "AI_LAB_GATEWAY_IMAGE_VERIFIED": "1"})
        with mock.patch("urllib.request.urlopen", return_value=Response()) as send:
            final = self.start()
        self.assertEqual(final["status"], "failed", final)
        self.assertEqual(final["error"]["code"], "provider_response_json_conflict")
        self.assertEqual(send.call_count, 1)
        call = final["usage"]["calls"][0]
        self.assertEqual(call["usage"]["total_tokens"], 20)
        self.assertEqual(call["normalization"]["count"], 2)
        self.assertFalse(call["normalization"]["applied"])
        private = self.lab.store.workflow(final["id"])
        shape = next(item for item in private["artifacts"] if item["kind"] == "response_structure")
        artifact = json.loads(self.lab.store.artifact_bytes(final["id"], shape))
        self.assertEqual(artifact["outputStructure"]["outputItemCount"], 2)
        self.assertNotIn("private-wire-key", json.dumps(artifact))
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)

    def test_visual_repair_requires_new_draft_and_fresh_captures(self):
        repaired = copy.deepcopy(STRUCTURE)
        repaired["furniture"] = copy.deepcopy(FURNISH["furniture"])
        repaired["furniture"][0]["cx"] = 55
        self.provider.outputs = [ANALYSIS, STRUCTURE, FURNISH, FAIL, repaired, PASS]
        first = self.start()
        old_captures = self.captures(first["id"])
        self.lab.workflow.review_images(first["id"], old_captures)
        self.lab.run_job(first["id"])
        waiting = self.lab.store.job(first["id"])["record"]
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertNotEqual(first["draft"]["id"], waiting["draft"]["id"])
        self.assertEqual(waiting["budget"]["repairsUsed"], 1)
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)
        with self.assertRaises(LabError) as stale:
            self.lab.workflow.review_images(first["id"], old_captures)
        self.assertEqual(stale.exception.code, "stale_draft")
        final = self.finish(first["id"], b"revised")
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(len(self.provider.messages), 6)
        self.assertEqual(self.lab.store.scene(self.project_id)["scene"]["furniture"][0]["cx"], 550)

    def test_waiting_checkpoint_restarts_without_replaying_calls(self):
        waiting = self.start()
        self.lab.close()
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        self.assertEqual(self.lab.store.job(waiting["id"])["record"]["status"], "awaiting_review_images")
        self.assertEqual(len(self.provider.messages), 3)
        final = self.finish(waiting["id"])
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(len(self.provider.messages), 4)

    def test_waiting_job_releases_single_worker_for_another_project(self):
        self.lab.close()
        self.provider.outputs = [ANALYSIS, STRUCTURE, FURNISH, ANALYSIS, STRUCTURE, FURNISH]
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=True)
        second_project = self.lab.create_project({"title": "Independent"})["project"]["id"]
        first = self.lab.create_job(self.project_id, self.body)["job"]
        second = self.lab.create_job(second_project, self.body)["job"]
        deadline = time.monotonic() + 8
        while time.monotonic() < deadline:
            states = [self.lab.store.job(job["id"])["record"]["status"] for job in (first, second)]
            if states == ["awaiting_review_images", "awaiting_review_images"]:
                break
            time.sleep(.01)
        self.assertEqual(states, ["awaiting_review_images", "awaiting_review_images"])
        self.assertEqual(len(self.provider.messages), 6)
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)
        self.assertEqual(self.lab.store.project(second_project)["version"], 0)

    def test_restart_interrupts_running_paid_reservation_without_replay(self):
        waiting = self.start()
        self.lab.workflow.review_images(waiting["id"], self.captures(waiting["id"]))
        state = self.lab.store.workflow(waiting["id"])
        state["calls"].append({"index": 4, "phase": "visual_review", "status": "running", "usage": None})
        state["inFlight"] = {"stage": "visual_review", "callIndex": 4}
        self.lab.store.put_workflow(waiting["id"], state)
        self.lab.store.update_job(waiting["id"], status="running", usage={"calls": state["calls"], "cost": None})
        self.lab.close()
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        record = self.lab.store.job(waiting["id"])["record"]
        self.assertEqual(record["status"], "failed")
        self.assertEqual(record["error"]["code"], "server_restarted")
        self.assertEqual(record["usage"]["calls"][-1]["status"], "interrupted")
        self.assertIsNone(record["usage"]["calls"][-1]["usage"])
        self.lab.run_job(waiting["id"])
        self.assertEqual(len(self.provider.messages), 3)
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)

    def test_identical_capture_submission_is_idempotent_and_conflicts_reject(self):
        waiting = self.start()
        body = self.captures(waiting["id"])
        first = self.lab.workflow.review_images(waiting["id"], body)
        pending = self.lab.pending.qsize()
        duplicate = self.lab.workflow.review_images(waiting["id"], body)
        self.assertFalse(first["idempotent"])
        self.assertTrue(duplicate["idempotent"])
        self.assertEqual(self.lab.pending.qsize(), pending)
        changed = copy.deepcopy(body)
        changed["images"][0]["dataUrl"] = image_url(64, 48, b"changed")
        with self.assertRaises(LabError) as error:
            self.lab.workflow.review_images(waiting["id"], changed)
        self.assertEqual(error.exception.code, "capture_conflict")
        self.assertEqual(len(self.provider.messages), 3)

    def test_immediate_capture_receipt_cannot_be_overwritten_by_worker_finally(self):
        original_public = self.lab.workflow._public
        captured = []
        def publish(job_id, state, **fields):
            original_public(job_id, state, **fields)
            if fields.get("status") == "awaiting_review_images" and not captured:
                captured.append(self.lab.workflow.review_images(job_id, self.captures(job_id)))
        self.lab.workflow._public = publish
        queued = self.start()
        self.assertEqual(queued["status"], "queued")
        private = self.lab.store.workflow(queued["id"])
        self.assertEqual(private["checkpointStage"], "visual_review")
        self.assertTrue(private["captures"])
        self.lab.run_job(queued["id"])
        final = self.lab.store.job(queued["id"])["record"]
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(len(self.provider.messages), 4)

    def test_capture_requires_both_views_and_bounded_original_images(self):
        waiting = self.start()
        body = self.captures(waiting["id"])
        with self.assertRaises(LabError):
            self.lab.workflow.review_images(waiting["id"], body | {"images": body["images"][:1]})
        body["images"][0]["dataUrl"] = image_url(1281, 100)
        with self.assertRaises(LabError) as error:
            self.lab.workflow.review_images(waiting["id"], body)
        self.assertEqual(error.exception.code, "invalid_review_image")
        self.assertEqual(self.lab.store.job(waiting["id"])["record"]["status"], "awaiting_review_images")

    def test_cancel_waiting_and_cancel_during_review_never_save(self):
        waiting = self.start()
        captures = self.captures(waiting["id"])
        self.lab.cancel(waiting["id"])
        with self.assertRaises(LabError):
            self.lab.workflow.review_images(waiting["id"], captures)
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)
        self.provider.outputs = [ANALYSIS, STRUCTURE, FURNISH, PASS]
        second = self.start()
        self.provider.on_call = lambda index: self.lab.cancel(second["id"])
        final = self.finish(second["id"])
        self.assertEqual(final["status"], "cancelled")
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)
        self.assertEqual(final["usage"]["calls"][-1]["usage"]["total_tokens"], 30)

    def test_two_geometry_repairs_are_global_limit_and_private_failure_retained(self):
        bad = copy.deepcopy(STRUCTURE)
        bad["walls"][0] = [0, 0, 0, 2, "e"]
        self.provider.outputs = [ANALYSIS, bad, FURNISH, bad, bad]
        final = self.start()
        self.assertEqual(final["status"], "failed", final)
        self.assertEqual(final["error"]["code"], "workflow_repair_budget_exhausted")
        self.assertEqual(final["budget"]["repairsUsed"], 2)
        self.assertEqual(len(self.provider.messages), 5)
        state = self.lab.store.workflow(final["id"])
        self.assertEqual(state["candidateIR"]["walls"][0][2], 0)
        self.assertTrue(state["validation"]["errors"])
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)

    def test_invalid_editor_state_is_repaired_before_publishing_a_draft(self):
        bad_furnish = copy.deepcopy(FURNISH)
        bad_furnish["furniture"][0]["height"] = 900
        repaired = copy.deepcopy(STRUCTURE) | {"furniture": FURNISH["furniture"]}
        self.provider.outputs = [ANALYSIS, STRUCTURE, bad_furnish, repaired, PASS]
        waiting = self.start()
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertEqual(waiting["budget"]["repairsUsed"], 1)
        self.assertEqual(len(self.provider.messages), 4)
        self.assertTrue(any("Unsupported furniture fields" in part.get("text", "") for part in self.provider.messages[-1][1]["content"]))
        draft = self.lab.workflow.draft(waiting["id"])
        self.assertNotIn("height", draft["state"]["furniture"][0])
        self.assertFalse(real_engine.validate_state(draft["scene"], draft["state"])["errors"])
        self.assertTrue(self.lab.workflow.viewer(waiting["id"], draft["draftId"]).lower().startswith("<!doctype html>"))
        final = self.finish(waiting["id"])
        self.assertEqual(final["status"], "succeeded", final)

    def test_second_visual_failure_never_commits_or_requests_third_review(self):
        repaired = copy.deepcopy(STRUCTURE) | {"furniture": FURNISH["furniture"]}
        self.provider.outputs = [ANALYSIS, STRUCTURE, FURNISH, FAIL, repaired, FAIL]
        first = self.start()
        self.finish(first["id"])
        final = self.finish(first["id"], b"again")
        self.assertEqual(final["status"], "failed", final)
        self.assertEqual(final["error"]["code"], "visual_review_failed")
        self.assertEqual(final["budget"]["visualReviewsUsed"], 2)
        self.assertEqual(len(self.provider.messages), 6)
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)

    def test_review_cannot_hide_critical_issues_beyond_display_limit(self):
        review = copy.deepcopy(PASS)
        review["issues"] = [{"severity": "minor", "path": "$", "description": "minor"}] * 100 + [{"severity": "critical", "path": "$.walls", "description": "missing wall"}]
        with self.assertRaises(LabError) as error:
            normalized_review(review)
        self.assertEqual(error.exception.code, "visual_review_invalid")
        review["issues"] = review["issues"][-1:]
        self.assertFalse(normalized_review(review)["pass"])

    def test_version_conflict_after_wait_does_not_overwrite_project(self):
        waiting = self.start()
        draft = self.lab.workflow.draft(waiting["id"])
        self.lab.store.commit_scene(self.project_id, 0, draft["scene"], draft["state"], draft["validation"], source_type="manual_test")
        final = self.finish(waiting["id"])
        self.assertEqual(final["error"]["code"], "version_conflict")
        self.assertEqual(len(self.provider.messages), 3)
        self.assertEqual(self.lab.store.scene(self.project_id)["source"], "manual_test")

    def test_manual_and_calibrated_scale_still_call_analysis_and_override_model(self):
        manual = self.start({"scaleMode": "manual", "mmPerPixel": 12})
        self.assertEqual(manual["status"], "awaiting_review_images", manual)
        self.assertEqual(manual["scaleProvenance"]["mode"], "manual")
        self.assertEqual(manual["scaleProvenance"]["mmPerPixel"], 12)
        self.lab.cancel(manual["id"])
        self.provider.outputs = [ANALYSIS, STRUCTURE, FURNISH]
        calibrated = self.start({"scaleMode": "calibrated", "calibration": {"p1": [0, 0], "p2": [100, 0], "lengthMm": 2500}})
        self.assertEqual(calibrated["status"], "awaiting_review_images", calibrated)
        self.assertEqual(calibrated["scaleProvenance"]["mmPerPixel"], 25)
        self.assertEqual(calibrated["scaleProvenance"]["anchors"][0]["source"], "user_measurement")
        self.assertEqual(len(self.provider.messages), 6)

    def test_unknown_scale_or_conflicting_annotations_needs_input_not_baseline_scale(self):
        unknown = copy.deepcopy(ANALYSIS)
        unknown["scale"] = {"mode": "measured", "mmPerPixel": 22, "confidence": "high", "evidence": ["no actual evidence"], "anchors": []}
        self.provider.outputs = [unknown, {"scale": {}}]
        first = self.start()
        self.assertEqual(first["status"], "needs_input", first)
        self.assertEqual(first["error"]["code"], "scale_unknown")
        self.assertEqual(first["analysis"]["summary"], ANALYSIS["summary"])
        self.assertEqual([call["phase"] for call in first["usage"]["calls"]], ["analyzing", "scale_estimation"])
        conflict = copy.deepcopy(ANALYSIS)
        conflict["scale"]["anchors"][1]["lengthMm"] = 2000
        self.provider.outputs = [conflict]
        second = self.start()
        self.assertEqual(second["status"], "needs_input", second)
        self.assertEqual(second["error"]["code"], "scale_anchors_conflict")
        self.assertEqual(len(self.provider.messages), 3)
        self.assertEqual([call["phase"] for call in second["usage"]["calls"]], ["analyzing"])

    def test_auto_second_look_uses_visible_priors_and_still_completes_full_flow(self):
        self.provider.outputs = [UNKNOWN_ANALYSIS, {"scale": ESTIMATED_SCALE}, STRUCTURE, FURNISH, PASS]
        job = self.lab.create_job(self.project_id, self.body)["job"]
        def check_analysis_published(index):
            if index == 2:
                record = self.lab.store.job(job["id"])["record"]
                self.assertEqual(record["analysis"]["summary"], UNKNOWN_ANALYSIS["summary"])
                self.assertEqual(record["analysis"]["notes"], UNKNOWN_ANALYSIS["notes"])
        self.provider.on_call = check_analysis_published
        self.lab.run_job(job["id"])
        waiting = self.lab.store.job(job["id"])["record"]
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertEqual(waiting["scaleProvenance"]["mode"], "estimated")
        self.assertEqual(waiting["scaleProvenance"]["confidence"], "low")
        self.assertEqual(len(waiting["scaleProvenance"]["anchors"]), 2)
        self.assertEqual([call["phase"] for call in waiting["usage"]["calls"]], ["analyzing", "scale_estimation", "structure", "furnishing"])
        self.assertTrue(self.lab.store.workflow(job["id"])["scaleEstimationUsed"])
        self.assertEqual(sum(item["type"] == "image_url" for item in self.provider.messages[1][1]["content"]), 1)
        final = self.finish(job["id"])
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(final["budget"]["callsUsed"], 5)

    def test_second_look_cannot_invent_measurement_annotations(self):
        self.provider.outputs = [UNKNOWN_ANALYSIS, {"scale": ANALYSIS["scale"]}]
        final = self.start()
        self.assertEqual(final["status"], "needs_input", final)
        self.assertEqual(final["error"]["code"], "scale_evidence_invalid")
        self.assertEqual(len(self.provider.messages), 2)
        self.assertEqual(final["analysis"]["summary"], UNKNOWN_ANALYSIS["summary"])
        self.assertNotIn("scaleProvenance", final)

    def test_manual_and_calibrated_missing_analysis_scale_do_not_add_a_call(self):
        self.provider.outputs = [UNKNOWN_ANALYSIS, STRUCTURE, FURNISH]
        manual = self.start({"scaleMode": "manual", "mmPerPixel": 12})
        self.assertEqual(manual["status"], "awaiting_review_images", manual)
        self.assertEqual(manual["scaleProvenance"]["mode"], "manual")
        self.assertEqual([call["phase"] for call in manual["usage"]["calls"]], ["analyzing", "structure", "furnishing"])
        self.lab.cancel(manual["id"])
        self.provider.outputs = [UNKNOWN_ANALYSIS, STRUCTURE, FURNISH]
        calibrated = self.start({"scaleMode": "calibrated", "calibration": {"p1": [0, 0], "p2": [100, 0], "lengthMm": 1500}})
        self.assertEqual(calibrated["status"], "awaiting_review_images", calibrated)
        self.assertEqual(calibrated["scaleProvenance"]["mmPerPixel"], 15)
        self.assertEqual([call["phase"] for call in calibrated["usage"]["calls"]], ["analyzing", "structure", "furnishing"])
        self.assertEqual(len(self.provider.messages), 6)

    def test_invalid_prior_geometry_stops_after_one_second_look(self):
        bad = copy.deepcopy(ESTIMATED_SCALE)
        bad["anchors"][0]["p2"] = [101, 0]
        self.provider.outputs = [UNKNOWN_ANALYSIS, {"scale": bad}]
        final = self.start()
        self.assertEqual(final["status"], "needs_input", final)
        self.assertEqual(final["error"]["code"], "scale_evidence_invalid")
        self.assertEqual(len(self.provider.messages), 2)
        self.assertTrue(self.lab.store.workflow(final["id"])["scaleEstimationUsed"])
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)

    def test_malformed_second_look_returns_needs_input_without_a_third_call(self):
        self.provider.outputs = [UNKNOWN_ANALYSIS, []]
        final = self.start()
        self.assertEqual(final["status"], "needs_input", final)
        self.assertEqual(final["error"]["code"], "scale_unknown")
        self.assertEqual(len(self.provider.messages), 2)
        self.assertEqual(final["analysis"]["summary"], UNKNOWN_ANALYSIS["summary"])

    def test_needs_input_reopens_with_original_asset_and_submitted_input(self):
        self.provider.outputs = [UNKNOWN_ANALYSIS, {"scale": {}}]
        first = self.start()
        self.assertEqual(first["status"], "needs_input", first)
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)
        self.assertNotIn("draft", first)
        self.lab.close()
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        recovered = self.lab.public_job(first["id"])
        self.assertEqual(recovered["sourceAsset"], self.asset)
        self.assertEqual(recovered["input"], {"scaleMode": "auto", "prompt": "按原图重建"})
        self.assertEqual(recovered["status"], "needs_input")
        latest = next(project for project in self.lab.projects()["projects"] if project["id"] == self.project_id)["latestJob"]
        self.assertEqual(recovered, latest)
        self.assertEqual(len(self.provider.messages), 2)
        self.assertNotIn(str(self.root), json.dumps(recovered))
        self.assertNotIn("filename", json.dumps(recovered))

    def test_object_priors_are_estimated_with_range_and_never_measured(self):
        value = copy.deepcopy(ANALYSIS)
        value["scale"] = {"mode": "measured", "mmPerPixel": 10, "rangeMmPerPixel": [8, 12], "confidence": "high", "evidence": ["假定可见桌宽在常见范围，不是读到标注"], "assumptions": ["常见桌宽只是先验"], "anchors": [{"label": "桌宽假设200mm", "p1": [0, 0], "p2": [20, 0], "lengthMm": 200, "source": "object_prior"}]}
        self.provider.outputs = [value, STRUCTURE, FURNISH]
        result = self.start()
        self.assertEqual(result["status"], "awaiting_review_images", result)
        self.assertEqual(result["scaleProvenance"]["mode"], "estimated")
        self.assertEqual(result["scaleProvenance"]["confidence"], "low")
        self.assertEqual(result["scaleProvenance"]["rangeMmPerPixel"], [8, 12])

    def test_valid_object_priors_without_model_scale_are_computed_without_fallback(self):
        scale = copy.deepcopy(ESTIMATED_SCALE)
        scale.pop("mmPerPixel")
        analysis = copy.deepcopy(UNKNOWN_ANALYSIS) | {"scale": scale}
        self.provider.outputs = [analysis, STRUCTURE, FURNISH]
        waiting = self.start()
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertEqual(waiting["scaleProvenance"]["mmPerPixel"], 10)
        self.assertEqual(waiting["scaleProvenance"]["mode"], "estimated")
        self.assertTrue(any("基于典型尺寸假设的锚点比值中位数" in value for value in waiting["scaleProvenance"]["evidence"]))
        self.assertEqual([call["phase"] for call in waiting["usage"]["calls"]], ["analyzing", "structure", "furnishing"])
        self.assertEqual(len(self.provider.messages), 3)

    def test_model_scale_guess_cannot_override_prior_anchor_median(self):
        scale = copy.deepcopy(ESTIMATED_SCALE)
        scale["mmPerPixel"], scale["mode"] = 999, "measured"
        provenance = choose_scale({"scaleMode": "auto"}, {"scale": scale}, {"width": 100, "height": 100})
        self.assertEqual(provenance["mmPerPixel"], 10)
        self.assertEqual(provenance["mode"], "estimated")
        self.assertEqual(provenance["rangeMmPerPixel"], [8, 12])

    def test_conflicting_object_prior_range_is_not_widened_or_replaced_by_fallback(self):
        scale = copy.deepcopy(ESTIMATED_SCALE)
        scale["anchors"][1]["lengthMm"] = 2500
        self.provider.outputs = [copy.deepcopy(UNKNOWN_ANALYSIS) | {"scale": scale}]
        final = self.start()
        self.assertEqual(final["status"], "needs_input", final)
        self.assertEqual(final["error"]["code"], "scale_anchors_conflict")
        self.assertEqual(len(self.provider.messages), 1)
        private = self.lab.store.workflow(final["id"])
        self.assertEqual(private["analysis"]["scale"]["rangeMmPerPixel"], [8, 12])
        self.assertEqual(len(private["analysis"]["scale"]["anchors"]), 2)
        self.assertFalse(private.get("scaleEstimationUsed", False))

    def test_hard_call_budget_stops_before_an_extra_request(self):
        waiting = self.start()
        state = self.lab.store.workflow(waiting["id"])
        state["calls"] += [{"phase": "test_reservation", "status": "completed", "usage": None}] * 5
        self.lab.store.put_workflow(waiting["id"], state)
        final = self.finish(waiting["id"])
        self.assertEqual(final["error"]["code"], "workflow_budget_exhausted")
        self.assertEqual(len(self.provider.messages), 3)
        self.assertEqual(final["budget"]["callsUsed"], 8)

    def configure_budget(self, calls=12, repairs=4, reviews=4):
        self.lab.close()
        (self.root / ".env.ai-lab.local").write_text(f"AI_LAB_WORKFLOW_MAX_CALLS={calls}\nAI_LAB_WORKFLOW_MAX_REPAIRS={repairs}\nAI_LAB_WORKFLOW_MAX_REVIEWS={reviews}\n", encoding="utf-8")
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)

    def test_configured_budget_allows_third_review_without_relaxing_its_gate(self):
        self.configure_budget()
        repaired = copy.deepcopy(STRUCTURE) | {"furniture": FURNISH["furniture"]}
        self.provider.outputs = [ANALYSIS, STRUCTURE, FURNISH, FAIL, repaired, FAIL, repaired, PASS]
        expected = {"maxCalls": 12, "maxRepairs": 4, "maxVisualReviews": 4}
        self.assertEqual(self.lab.health()["capabilities"]["workflowBudget"], expected)
        queued = self.lab.create_job(self.project_id, self.body)["job"]
        self.assertEqual({key: queued["budget"][key] for key in expected}, expected)
        self.lab.run_job(queued["id"])
        self.assertEqual(self.finish(queued["id"])["status"], "awaiting_review_images")
        self.assertEqual(self.finish(queued["id"], b"second")["status"], "awaiting_review_images")
        self.assertEqual(self.lab.store.project(self.project_id)["version"], 0)
        final = self.finish(queued["id"], b"third")
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(final["budget"]["visualReviewsUsed"], 3)
        self.assertEqual(final["budget"]["repairsUsed"], 2)
        self.assertEqual(final["budget"]["callsUsed"], 8)
        self.assertEqual(self.lab.store.workflow(queued["id"])["limits"], expected)

    def test_waiting_job_keeps_snapshot_when_restart_configuration_increases(self):
        waiting = self.start()
        self.configure_budget()
        self.assertEqual(self.lab.health()["capabilities"]["workflowBudget"]["maxCalls"], 12)
        repaired = copy.deepcopy(STRUCTURE) | {"furniture": FURNISH["furniture"]}
        self.provider.outputs = [FAIL, repaired, FAIL]
        self.assertEqual(self.finish(waiting["id"])["status"], "awaiting_review_images")
        final = self.finish(waiting["id"], b"second")
        self.assertEqual(final["status"], "failed", final)
        self.assertEqual(final["error"]["code"], "visual_review_failed")
        self.assertEqual(final["budget"]["maxCalls"], 8)
        self.assertEqual(final["budget"]["maxVisualReviews"], 2)
        self.assertEqual(len(self.provider.messages), 6)

    def test_queued_job_snapshots_limits_before_first_checkpoint(self):
        queued = self.lab.create_job(self.project_id, self.body)["job"]
        self.assertEqual(queued["budget"]["maxCalls"], 8)
        self.assertIsNone(self.lab.store.workflow(queued["id"]))
        self.configure_budget()
        self.lab.run_job(queued["id"])
        state = self.lab.store.workflow(queued["id"])
        self.assertEqual(state["limits"], DEFAULT_LIMITS)
        self.assertEqual(self.lab.store.job(queued["id"])["record"]["budget"]["maxCalls"], 8)

    def test_old_checkpoint_without_limits_keeps_historical_defaults(self):
        waiting = self.start()
        state = self.lab.store.workflow(waiting["id"])
        state.pop("limits")
        self.lab.store.put_workflow(waiting["id"], state)
        with self.lab.store.transaction() as db:
            payload = self.lab.store.job(waiting["id"], db)["payload"]
            payload.pop("workflowLimits", None)
            db.execute("UPDATE jobs SET payload=? WHERE id=?", (json.dumps(payload), waiting["id"]))
        self.configure_budget()
        final = self.finish(waiting["id"])
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(final["budget"]["maxCalls"], 8)
        self.assertEqual(final["budget"]["maxVisualReviews"], 2)
        self.assertEqual(self.lab.store.workflow(waiting["id"])["limits"], DEFAULT_LIMITS)

    def test_invalid_private_configuration_fails_startup_before_model_calls(self):
        self.lab.close()
        (self.root / ".env.ai-lab.local").write_text("AI_LAB_WORKFLOW_MAX_CALLS=17\n", encoding="utf-8")
        with self.assertRaises(LabError) as error:
            Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        self.assertEqual(error.exception.code, "workflow_config_invalid")
        self.assertEqual(len(self.provider.messages), 0)

    def test_http_draft_viewer_and_capture_routes_are_same_origin(self):
        waiting = self.start()
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        server.lab, server.allowed_origins = self.lab, {"http://127.0.0.1:5186"}
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{server.server_port}"
        try:
            draft = json.load(urllib.request.urlopen(base + PREFIX + f"/jobs/{waiting['id']}/draft"))
            html = urllib.request.urlopen(base + waiting["draft"]["viewerUrl"]).read().decode()
            self.assertIn("draft-" + draft["draftId"], html)
            self.assertNotIn("__AI_LAB_SCENE_JSON__", html)
            request = urllib.request.Request(base + PREFIX + f"/jobs/{waiting['id']}/review-images", data=json.dumps(self.captures(waiting["id"])).encode(), headers={"Content-Type": "application/json"}, method="POST")
            response = urllib.request.urlopen(request)
            self.assertEqual(response.status, 202)
            self.assertEqual(json.load(response)["job"]["status"], "queued")
            self.lab.run_job(waiting["id"])
            exported = json.load(urllib.request.urlopen(base + PREFIX + f"/projects/{self.project_id}/export"))
            generation = exported["scene"]["metadata"]["generation"]
            self.assertEqual(exported["version"], 1)
            self.assertEqual(generation["jobId"], waiting["id"])
            self.assertEqual(generation["sourceSha256"], self.lab.store.asset(self.asset["id"])["sha256"])
            self.assertEqual(generation["model"], self.provider.model)
            self.assertTrue(generation["modelVisualReview"]["pass"])
            self.assertEqual(generation["reviewAppliesTo"], "initial_generated_scene")
            self.assertNotIn("apiKey", json.dumps(exported))
            self.assertNotIn(str(self.root), json.dumps(exported))
        finally:
            server.shutdown()
            server.server_close()
            thread.join(2)


class WorkflowBudgetConfigTests(unittest.TestCase):
    def test_defaults_and_explicit_bounded_combinations(self):
        self.assertEqual(parse_workflow_limits({}), DEFAULT_LIMITS)
        for values, expected in (((12, 4, 4), (12, 4, 4)), ((16, 6, 6), (16, 6, 6)), ((4, 0, 1), (4, 0, 1))):
            config = dict(zip(("AI_LAB_WORKFLOW_MAX_CALLS", "AI_LAB_WORKFLOW_MAX_REPAIRS", "AI_LAB_WORKFLOW_MAX_REVIEWS"), map(str, values)))
            self.assertEqual(tuple(parse_workflow_limits(config).values()), expected)

    def test_invalid_values_and_inconsistent_aggregate_budget_are_rejected(self):
        cases = [("AI_LAB_WORKFLOW_MAX_CALLS", value) for value in ("0", "3", "17", "8.0", "", "-1", "not-an-integer", True)]
        cases += [("AI_LAB_WORKFLOW_MAX_REPAIRS", "7"), ("AI_LAB_WORKFLOW_MAX_REVIEWS", "0"), ("AI_LAB_WORKFLOW_MAX_REVIEWS", "7"), ("AI_LAB_WORKFLOW_MAX_REPAIRS", "6")]
        for name, value in cases:
            with self.subTest(name=name, value=value):
                with self.assertRaises(LabError) as error:
                    parse_workflow_limits({name: value})
                self.assertEqual(error.exception.code, "workflow_config_invalid")


class WorkflowJsonPromptTests(unittest.TestCase):
    def test_all_stages_require_strict_json_and_scale_schema_is_valid_json(self):
        asset = {"width": 100, "height": 100}
        original = image_url()
        provenance = choose_scale({"scaleMode": "auto"}, ANALYSIS, asset)
        generated = [
            workflow_prompts.analyze_messages(asset, original, {"scaleMode": "auto"}),
            workflow_prompts.scale_estimation_messages(asset, original, UNKNOWN_ANALYSIS),
            workflow_prompts.structure_messages(asset, original, {}, ANALYSIS, provenance),
            workflow_prompts.furnish_messages(asset, original, STRUCTURE, ANALYSIS, provenance),
            workflow_prompts.repair_messages(asset, original, STRUCTURE, provenance, validation={"errors": []}),
            workflow_prompts.review_messages(asset, original, [original, original], STRUCTURE, ANALYSIS, provenance),
        ]
        for messages in generated:
            system = messages[0]["content"]
            self.assertIn(workflow_prompts.JSON_OUTPUT_CONTRACT, system)
            self.assertTrue(system.endswith(workflow_prompts.USER_LANGUAGE))
        self.assertTrue(generated[0][0]["content"].startswith("Analyze a floorplan"))
        self.assertTrue(generated[1][0]["content"].startswith("Estimate ONLY"))
        self.assertTrue(generated[-1][0]["content"].startswith("Review the reconstruction"))
        scale_system = generated[1][0]["content"]
        schema_text = scale_system.split("\nJSON Schema: ", 1)[1].split("\n" + workflow_prompts.JSON_OUTPUT_CONTRACT, 1)[0]
        self.assertEqual(json.loads(schema_text), workflow_prompts.SCALE_ESTIMATION_SCHEMA)
        self.assertEqual(json.loads(schema_text)["required"], ["scale"])
        self.assertNotIn("mmPerPixel", json.loads(schema_text)["properties"]["scale"]["oneOf"][1]["required"])
        self.assertNotIn("Output exactly {scale:", scale_system)
        self.assertEqual(parse_json('{"scale":{}}'), {"scale": {}})
        with self.assertRaises(ValueError):
            parse_json("{scale:{mmPerPixel:25,confidence:'low'}}")


if __name__ == "__main__":
    unittest.main(verbosity=2)
