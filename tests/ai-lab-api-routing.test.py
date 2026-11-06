"""Offline mode-routing/checkpoint tests. No external requests or private data."""
import base64
import copy
import importlib.util
import io
import json
from pathlib import Path
import queue
import sys
import tempfile
import threading
import unittest
import urllib.request
from unittest import mock
from http.server import ThreadingHTTPServer

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "ai-lab"))
from server.app import Lab, Handler, runtime_snapshot, PREFIX
from server.provider import CodexHandoffProvider
from server.store import LabError, dump, now, uid
from server.workflow import PIPELINE_VERSION, LEGACY_PIPELINE
from engine import scene as real_engine

spec = importlib.util.spec_from_file_location("workflow_fixtures", ROOT / "tests/ai-lab-server-workflow.test.py")
fixtures = importlib.util.module_from_spec(spec)
spec.loader.exec_module(fixtures)


def image_url(width=100, height=100, color=(230, 230, 230)):
    output = io.BytesIO()
    Image.new("RGB", (width, height), color).save(output, format="PNG")
    return "data:image/png;base64," + base64.b64encode(output.getvalue()).decode()


class ApiProvider(fixtures.ScriptedProvider):
    execution_mode, provider_id, model = "api", "bananarouter", "gpt-6.1-sol"
    endpoint, json_mode = "https://example.invalid/v1/responses", True
    stream = True


class ApiRoutingTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.provider = ApiProvider([fixtures.ANALYSIS, fixtures.STRUCTURE, fixtures.FURNISH, fixtures.PASS])
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        self.pid = self.lab.create_project({"title": "Synthetic API routing"})["project"]["id"]
        self.asset = self.lab.upload({"name": "synthetic.png", "dataUrl": image_url()})["asset"]
        self.body = {"assetId": self.asset["id"], "scaleMode": "auto", "prompt": "合成测试，不代表真实还原质量"}

    def tearDown(self):
        self.lab.close()
        self.temp.cleanup()

    def start(self, **extra):
        job = self.lab.create_job(self.pid, self.body | extra)["job"]
        self.lab.run_job(job["id"])
        return self.lab.public_job(job["id"])

    def captures(self, job, color=(230, 230, 230)):
        return {"draftId": job["draft"]["id"], "images": [{"view": view, "dataUrl": image_url(64, 48, color)} for view in ("2d", "3d")]}

    def finish(self, job):
        self.lab.workflow.review_images(job["id"], self.captures(job))
        self.lab.run_job(job["id"])
        return self.lab.public_job(job["id"])

    def input_body(self, job, **extra):
        context = self.lab.public_job(job["id"])["inputContext"]
        return {**context, "submissionId": uid(), "scaleMode": "calibrated", "calibration": {"p1": [0, 0], "p2": [100, 0], "lengthMm": 1000}, **extra}

    def test_default_api_forces_full_pipeline_and_preserves_real_identity(self):
        job = self.start(pipelineVersion=LEGACY_PIPELINE)
        self.assertEqual(job["executionMode"], "api")
        self.assertEqual(job["pipelineVersion"], PIPELINE_VERSION)
        self.assertEqual(job["model"], self.provider.model)
        self.assertEqual(job["providerSettings"], runtime_snapshot(self.provider))
        self.assertTrue(job["providerSettings"]["transportStream"])
        self.assertTrue(self.lab.store.job(job["id"])["payload"]["runtimeSnapshot"]["transportStream"])
        self.assertTrue(self.lab.store.workflow(job["id"])["settings"]["transportStream"])
        self.assertTrue(all(call["settings"]["transportStream"] for call in job["usage"]["calls"]))
        self.assertEqual(job["status"], "awaiting_review_images")
        self.assertEqual(len(self.provider.messages), 3)
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        final = self.finish(job)
        self.assertEqual(final["status"], "succeeded", final)
        generation = self.lab.store.scene(self.pid)["scene"]["metadata"]["generation"]
        self.assertEqual(generation["model"], "gpt-6.1-sol")
        self.assertEqual(generation["settings"], job["providerSettings"])
        self.assertTrue(generation["settings"]["transportStream"])
        self.assertEqual(generation["modelVisualReview"], final["visualReview"])
        self.assertEqual(len(final["usage"]["calls"]), 4)
        self.assertIsNone(final["usage"]["cost"])

    def test_explicit_handoff_under_api_default_never_enters_worker(self):
        job = self.lab.create_job(self.pid, self.body | {"executionMode": "codex_handoff", "pipelineVersion": LEGACY_PIPELINE})["job"]
        self.assertEqual(job["pipelineVersion"], "codex-handoff-v1")
        self.assertEqual(job["status"], "awaiting_codex")
        self.assertEqual(job["model"], "codex-current-session")
        self.assertIsNone(job["usage"])
        self.lab.run_job(job["id"])
        self.assertFalse(self.provider.messages)
        self.assertTrue(self.lab.pending.empty())

    def test_explicit_api_under_handoff_default_uses_api_provider(self):
        self.lab.provider = CodexHandoffProvider()
        self.lab.execution_mode = "codex_handoff"
        job = self.start(executionMode="api")
        self.assertEqual(job["model"], "gpt-6.1-sol")
        self.assertEqual(job["status"], "awaiting_review_images")
        health = self.lab.health()
        self.assertEqual(health["executionMode"], "codex_handoff")
        self.assertFalse(health["providerConfigured"])
        self.assertTrue(health["executionModes"]["api"]["available"])
        self.assertTrue(health["executionModes"]["codex_handoff"]["available"])

    def test_unavailable_api_and_invalid_mode_fail_before_creation(self):
        for field, code in (("configured", "api_not_configured"), ("supports_images", "api_image_support_unverified")):
            with self.subTest(field=field):
                setattr(self.provider, field, False)
                with self.assertRaises(LabError) as caught:
                    self.lab.create_job(self.pid, self.body | {"executionMode": "api"})
                self.assertEqual(caught.exception.code, code)
                setattr(self.provider, field, True)
        with self.assertRaises(LabError) as caught:
            self.lab.create_job(self.pid, self.body | {"executionMode": "gateway"})
        self.assertEqual(caught.exception.code, "invalid_execution_mode")
        self.assertFalse(self.provider.messages)
        self.assertIsNone(self.lab.projects()["projects"][0].get("latestJob"))

    def test_api_modify_is_rejected_instead_of_single_call_fallback(self):
        with self.assertRaises(LabError) as caught:
            self.lab.create_job(self.pid, {"action": "modify", "executionMode": "api", "prompt": "edit"})
        self.assertEqual(caught.exception.code, "api_generation_only")
        self.assertFalse(self.provider.messages)

    def test_geometry_and_visual_repair_share_existing_bounded_loop(self):
        corrected = copy.deepcopy(fixtures.STRUCTURE)
        corrected["furniture"] = copy.deepcopy(fixtures.FURNISH["furniture"])
        corrected["furniture"][0]["cx"] = 55
        self.provider.outputs = [fixtures.ANALYSIS, fixtures.STRUCTURE, fixtures.FURNISH, fixtures.FAIL, corrected, fixtures.PASS]
        first = self.start()
        second = self.finish(first)
        self.assertEqual(second["status"], "awaiting_review_images", second)
        self.assertNotEqual(first["draft"]["id"], second["draft"]["id"])
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        with self.assertRaises(LabError) as caught:
            self.lab.workflow.review_images(first["id"], self.captures(first))
        self.assertEqual(caught.exception.code, "stale_draft")
        final = self.finish(second)
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(final["budget"]["repairsUsed"], 1)
        self.assertEqual(final["budget"]["visualReviewsUsed"], 2)
        self.assertEqual(len(final["usage"]["calls"]), 6)

    def test_api_topology_gate_repairs_blocked_window_without_dropping_it(self):
        blocked = copy.deepcopy(fixtures.STRUCTURE)
        blocked["windows"] = [[20, 0, 40, 2]]
        corrected = copy.deepcopy(blocked)
        corrected["walls"] = [[0, 0, 20, 2, "e"], [40, 0, 100, 2, "e"]]
        corrected["furniture"] = copy.deepcopy(fixtures.FURNISH["furniture"])
        self.provider.outputs = [fixtures.ANALYSIS, blocked, fixtures.FURNISH, corrected, fixtures.PASS]
        waiting = self.start()
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        self.assertEqual(waiting["budget"]["repairsUsed"], 1)
        self.assertEqual([call["phase"] for call in waiting["usage"]["calls"]], ["analyzing", "structure", "furnishing", "geometry_repair"])
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        final = self.finish(waiting)
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(len(self.lab.store.scene(self.pid)["scene"]["windows"]), 1)

    def test_recorded_prompt_version_survives_waiting_checkpoint_and_export(self):
        job = self.lab.create_job(self.pid, self.body)["job"]
        with self.lab.store.transaction() as db:
            record = self.lab.store.job(job["id"], db)["record"]
            record["promptVersion"] = "codex-workflow-prompts-v3"
            db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job["id"]))
        self.lab.run_job(job["id"])
        waiting = self.lab.public_job(job["id"])
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        final = self.finish(waiting)
        self.assertEqual(final["status"], "succeeded", final)
        generation = self.lab.store.scene(self.pid)["scene"]["metadata"]["generation"]
        self.assertEqual(generation["promptVersion"], "codex-workflow-prompts-v3")
        self.assertTrue(all(call["promptVersion"] == "codex-workflow-prompts-v3" for call in final["usage"]["calls"]))

    def test_api_capture_rejects_header_only_and_truncated_images(self):
        job = self.start()
        for data in (fixtures.image_url(64, 48), image_url(64, 48)[:-20]):
            body = self.captures(job)
            body["images"][0]["dataUrl"] = data
            with self.assertRaises(LabError) as caught:
                self.lab.workflow.review_images(job["id"], body)
            self.assertEqual(caught.exception.code, "invalid_review_image")
        self.assertEqual(self.lab.public_job(job["id"])["status"], "awaiting_review_images")
        self.assertEqual(len(self.provider.messages), 3)

    def test_scale_input_resumes_without_repeating_analysis_and_is_idempotent(self):
        self.provider.outputs = [fixtures.UNKNOWN_ANALYSIS, {"scale": {"anchors": []}}, fixtures.STRUCTURE, fixtures.FURNISH, fixtures.PASS]
        job = self.start()
        self.assertEqual(job["status"], "awaiting_input", job)
        self.assertEqual(len(self.provider.messages), 2)
        body = self.input_body(job)
        queued = self.lab.workflow.input(job["id"], body)["job"]
        self.assertEqual(queued["inputContext"]["revision"], 1)
        self.assertEqual(queued["status"], "queued")
        self.assertTrue(self.lab.workflow.input(job["id"], body)["idempotent"])
        self.lab.run_job(job["id"])
        waiting = self.lab.public_job(job["id"])
        self.assertEqual(waiting["status"], "awaiting_review_images", waiting)
        final = self.finish(waiting)
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual([call["phase"] for call in final["usage"]["calls"]], ["analyzing", "scale_estimation", "structure", "furnishing", "visual_review"])

    def test_scale_input_cas_cancel_and_version_guards(self):
        self.provider.outputs = [fixtures.UNKNOWN_ANALYSIS, {"scale": {"anchors": []}}]
        job = self.start()
        with self.assertRaises(LabError) as caught:
            self.lab.workflow.input(job["id"], self.input_body(job, revision=9))
        self.assertEqual(caught.exception.code, "workflow_input_revision_conflict")
        with self.lab.store.transaction() as db:
            db.execute("UPDATE projects SET version=1 WHERE id=?", (self.pid,))
        with self.assertRaises(LabError) as caught:
            self.lab.workflow.input(job["id"], self.input_body(job))
        self.assertEqual(caught.exception.code, "version_conflict")
        with self.lab.store.transaction() as db:
            db.execute("UPDATE projects SET version=0 WHERE id=?", (self.pid,))
        self.lab.cancel(job["id"])
        with self.assertRaises(LabError):
            self.lab.workflow.input(job["id"], self.input_body(job))
        self.assertEqual(self.lab.public_job(job["id"])["status"], "cancelled")
        self.assertEqual(len(self.provider.messages), 2)

    def test_immediate_input_receipt_survives_worker_finally(self):
        self.provider.outputs = [fixtures.UNKNOWN_ANALYSIS, {"scale": {"anchors": []}}, fixtures.STRUCTURE, fixtures.FURNISH]
        original = self.lab.workflow._public
        receipts = []
        def publish(job_id, state, **fields):
            original(job_id, state, **fields)
            if fields.get("status") == "awaiting_input" and not receipts:
                job = self.lab.public_job(job_id)
                receipts.append(self.lab.workflow.input(job_id, self.input_body(job)))
        with mock.patch.object(self.lab.workflow, "_public", side_effect=publish):
            job = self.start()
        self.assertEqual(job["status"], "queued")
        state = self.lab.store.workflow(job["id"])
        self.assertEqual(state["checkpointStage"], "structure")
        self.assertEqual(state["inputRevision"], 1)
        self.assertEqual(len(state["inputReceipts"]), 1)
        self.lab.run_job(job["id"])
        self.assertEqual(self.lab.public_job(job["id"])["status"], "awaiting_review_images")

    def test_runtime_change_before_first_call_or_after_capture_never_uses_new_settings(self):
        job = self.lab.create_job(self.pid, self.body)["job"]
        self.provider.model = "changed-model"
        self.lab.run_job(job["id"])
        self.assertEqual(self.lab.public_job(job["id"])["error"]["code"], "api_runtime_changed")
        self.assertFalse(self.provider.messages)
        self.provider.model = "gpt-6.1-sol"
        job = self.start()
        self.provider.endpoint = "https://changed.invalid/responses"
        with self.assertRaises(LabError) as caught:
            self.lab.workflow.review_images(job["id"], self.captures(job))
        self.assertEqual(caught.exception.code, "api_runtime_changed")
        self.assertEqual(len(self.provider.messages), 3)
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)

    def test_transport_change_rejects_queued_and_waiting_jobs_without_replay(self):
        self.provider.stream = False
        queued = self.lab.create_job(self.pid, self.body)["job"]
        self.assertFalse(queued["providerSettings"]["transportStream"])
        self.provider.stream = True
        self.lab.run_job(queued["id"])
        stopped = self.lab.public_job(queued["id"])
        self.assertEqual(stopped["status"], "failed")
        self.assertEqual(stopped["error"]["code"], "api_runtime_changed")
        self.assertFalse(stopped["providerSettings"]["transportStream"])
        self.assertFalse(self.provider.messages)
        waiting = self.start()
        self.assertTrue(waiting["providerSettings"]["transportStream"])
        self.provider.stream = False
        with self.assertRaises(LabError) as caught:
            self.lab.workflow.review_images(waiting["id"], self.captures(waiting))
        self.assertEqual(caught.exception.code, "api_runtime_changed")
        self.assertTrue(self.lab.store.workflow(waiting["id"])["settings"]["transportStream"])
        self.assertEqual(len(self.provider.messages), 3)
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)

    def test_snapshot_checked_between_calls_and_source_hash_bound(self):
        def change_after_first(count):
            if count == 1:
                self.provider.max_output_tokens += 1
        self.provider.on_call = change_after_first
        job = self.start()
        self.assertEqual(job["status"], "failed")
        self.assertEqual(job["error"]["code"], "api_runtime_changed")
        self.assertEqual(len(self.provider.messages), 1)

    def test_source_hash_change_prevents_even_first_model_call(self):
        job = self.lab.create_job(self.pid, self.body)["job"]
        # A bound file may not be silently replaced between upload and execution.
        asset = self.lab.store.asset(self.asset["id"])
        path = self.lab.store.root / "assets" / asset["filename"]
        path.write_bytes(path.read_bytes() + b"changed")
        # The new checkpoint records the upload's original SHA, not a fresh hash.
        self.lab.run_job(job["id"])
        self.assertEqual(self.lab.public_job(job["id"])["error"]["code"], "source_changed")
        self.assertFalse(self.provider.messages)

    def test_upstream_response_identity_is_recorded_without_credentials(self):
        original = self.provider.complete
        def complete(messages):
            return original(messages) | {"responseModel": "gpt-6.1-sol", "responseId": "resp_synthetic", "requestId": "req_synthetic"}
        self.provider.complete = complete
        job = self.start()
        calls = job["usage"]["calls"]
        self.assertTrue(all(call["responseModel"] == "gpt-6.1-sol" and call["responseId"] == "resp_synthetic" and call["requestId"] == "req_synthetic" for call in calls))
        self.assertTrue(all(call["promptVersion"] == job["promptVersion"] for call in calls))

    def test_http_input_route_dispatches_api_cas_and_events_are_readable(self):
        self.provider.outputs = [fixtures.UNKNOWN_ANALYSIS, {"scale": {"anchors": []}}]
        job = self.start()
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        server.lab = self.lab
        server.allowed_origins = set()
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        opener = urllib.request.build_opener(urllib.request.ProxyHandler({}))
        base = f"http://127.0.0.1:{server.server_port}{PREFIX}"
        try:
            payload = json.dumps(self.input_body(job)).encode()
            request = urllib.request.Request(base + f"/jobs/{job['id']}/input", data=payload, headers={"Content-Type": "application/json"}, method="POST")
            response = json.load(opener.open(request, timeout=5))
            self.assertEqual(response["job"]["status"], "queued")
            self.assertEqual(response["job"]["inputContext"]["revision"], 1)
            events = json.load(opener.open(base + f"/jobs/{job['id']}/events?after=0", timeout=5))
            self.assertTrue(events["events"])
            self.assertEqual(len(self.provider.messages), 2)
        finally:
            server.shutdown()
            server.server_close()
            thread.join(timeout=2)

    def test_restart_queues_only_explicit_snapshotted_api_and_never_handoff_or_old_gateway(self):
        api = self.lab.create_job(self.pid, self.body)["job"]
        handoff = self.lab.create_job(self.pid, self.body | {"executionMode": "codex_handoff"})["job"]
        old_id = uid()
        with self.lab.store.transaction() as db:
            db.execute("INSERT INTO jobs VALUES(?,?,?,?,?,?,?)", (old_id, self.pid, dump({"action": "generate", "pipelineVersion": PIPELINE_VERSION, "assetId": self.asset["id"], "baseVersion": 0}), dump({"id": old_id, "status": "queued", "stage": "queued"}), None, "old", now()))
        self.lab.close()
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        ids = []
        while not self.lab.pending.empty():
            ids.append(self.lab.pending.get_nowait())
        self.assertEqual(ids, [api["id"]])
        self.lab.run_job(handoff["id"])
        self.lab.run_job(old_id)
        self.assertFalse(self.provider.messages)

    def test_waiting_capture_restart_uses_snapshot_and_never_replays_paid_calls(self):
        job = self.start()
        state = self.lab.store.workflow(job["id"])
        self.lab.close()
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        self.assertTrue(self.lab.pending.empty())
        self.assertEqual(self.lab.store.workflow(job["id"])["settings"], state["settings"])
        self.assertEqual(len(self.provider.messages), 3)
        final = self.finish(self.lab.public_job(job["id"]))
        self.assertEqual(final["status"], "succeeded", final)
        self.assertEqual(len(self.provider.messages), 4)

    def test_events_are_real_stage_records_and_public_data_has_no_credentials_or_paths(self):
        job = self.start()
        page = self.lab.job_events(job["id"])
        self.assertTrue(page["events"])
        self.assertTrue(any(event["stage"] == "analyzing" for event in page["events"]))
        public = dump({"health": self.lab.health(), "job": job, "events": page})
        self.assertNotIn(str(self.root), public)
        self.assertNotIn("example.invalid", public)
        self.assertNotIn("apiKey", public)
        self.assertFalse(page["terminal"])


if __name__ == "__main__":
    unittest.main()
