"""Offline current-chat contract tests; synthetic data only, no model requests."""
import base64
import copy
import io
import json
from pathlib import Path
import struct
import sys
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from PIL import Image

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "ai-lab"))
from server.app import Lab, Handler
from server.events import event_page
from server.provider import ProviderError
from server.store import LabError, dump, uid


def image(width=100, height=100):
    output = io.BytesIO()
    Image.new("RGB", (width, height), (245, 245, 245)).save(output, format="PNG")
    return "data:image/png;base64," + base64.b64encode(output.getvalue()).decode()


PIXELS = {"rooms": [{"id": "r1", "name": "合成房间", "poly": [[10, 10], [90, 10], [90, 90], [10, 90]], "mat": "wood"}], "walls": [[5, 5, 95, 10, "e"]], "windows": [], "doors": [], "slides": [], "furniture": []}
ANALYSIS = {"summary": "合成单房间示意", "spaces": ["合成房间"], "notes": [], "scale": {"anchors": []}}
REVIEW = {"pass": True, "reason": "合成契约测试复核通过", "issues": [], "limitations": ["不代表真实户型质量验收"]}


class HandoffTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / ".env.ai-lab.local").write_text("AI_LAB_API_KEY=legacy-secret-must-not-activate\nAI_LAB_GATEWAY_IMAGE_VERIFIED=1", encoding="utf-8")
        self.lab = Lab(self.root, start_worker=False)
        self.pid = self.lab.create_project({"title": "Synthetic handoff"})["project"]["id"]
        self.asset = self.lab.upload({"name": "synthetic.png", "dataUrl": image()})["asset"]
        self.body = {"assetId": self.asset["id"], "scaleMode": "manual", "mmPerPixel": 10, "prompt": "保留合成布局", "baseVersion": 0}
        self.job = self.lab.create_job(self.pid, self.body, "once")["job"]
        self.jid = self.job["id"]

    def tearDown(self):
        self.lab.close()
        self.temp.cleanup()

    def body_for(self, **fields):
        context = self.lab.public_job(self.jid)["handoff"]
        return {"requestId": context["requestId"], "revision": context["revision"], "submissionId": uid(), **fields}

    def submit(self, kind, **fields):
        return self.lab.handoff.submit(self.jid, kind, self.body_for(**fields))["job"]

    def candidate(self):
        self.submit("analysis", analysis=ANALYSIS)
        pixels = copy.deepcopy(PIXELS)
        pixels["metadata"] = {"generation": {"model": "spoofed-specific-model"}}
        return self.submit("candidate", pixelScene=pixels)

    def captures(self, draft):
        return self.lab.handoff.review_images(self.jid, {"draftId": draft["draft"]["id"], "images": [{"view": view, "dataUrl": image(64, 48)} for view in ("2d", "3d")]})["job"]

    def test_default_runtime_ignores_gateway_key_and_never_enqueues_or_calls_it(self):
        health = self.lab.health()
        self.assertEqual(health["executionMode"], "codex_handoff")
        self.assertEqual(health["model"], "codex-current-session")
        self.assertFalse(health["providerConfigured"])
        self.assertTrue(health["capabilities"]["generation"])
        self.assertEqual(self.job["status"], "awaiting_codex")
        self.assertEqual(self.job["pipelineVersion"], "codex-handoff-v1")
        self.assertIsNone(self.job["usage"])
        self.assertEqual(self.job["usageAccounting"], "current_session_unreported")
        self.assertTrue(self.lab.pending.empty())
        self.assertEqual(self.lab.create_job(self.pid, self.body, "once")["job"]["id"], self.jid)
        with patch("urllib.request.urlopen", side_effect=AssertionError("No gateway fallback")):
            with self.assertRaises(ProviderError) as error:
                self.lab.provider.complete([])
        self.assertEqual(error.exception.code, "codex_handoff_required")
        self.assertNotIn("legacy-secret", dump(health))

    def test_complete_analysis_candidate_decoded_capture_contract_review_finalize(self):
        request = self.lab.handoff.request(self.jid)
        self.assertTrue(Path(request["sourceAsset"]["path"]).is_file())
        self.assertEqual(request["sourceHash"], self.lab.store.asset(self.asset["id"])["sha256"])
        draft = self.candidate()
        self.assertEqual(draft["status"], "awaiting_review_images")
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        rendered = self.lab.workflow.viewer(self.jid, draft["draft"]["id"])
        self.assertNotIn("__AI_LAB_SCENE_JSON__", rendered)
        waiting = self.captures(draft)
        self.assertEqual(waiting["status"], "awaiting_codex")
        self.assertEqual(waiting["handoff"]["phase"], "review")
        self.assertEqual(len(self.lab.handoff.request(self.jid)["captures"]), 2)
        self.assertTrue(self.lab.pending.empty())
        reviewed = self.submit("review", draftId=draft["draft"]["id"], review=REVIEW)
        self.assertEqual(reviewed["handoff"]["phase"], "finalize")
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        final_body = self.body_for(draftId=draft["draft"]["id"])
        final = self.lab.handoff.submit(self.jid, "finalize", final_body)["job"]
        self.assertEqual(final["status"], "succeeded")
        self.assertIsNone(final["usage"])
        scene = self.lab.store.scene(self.pid)
        self.assertEqual(scene["version"], 1)
        generation = scene["scene"]["metadata"]["generation"]
        self.assertEqual(generation["model"], "codex-current-session")
        self.assertEqual(generation["reviewAppliesTo"], "initial_generated_scene")
        self.assertEqual(generation["usageAccounting"], "current_session_unreported")
        replay = self.lab.handoff.submit(self.jid, "finalize", final_body)
        self.assertTrue(replay["idempotent"])
        self.assertEqual(self.lab.store.project(self.pid)["version"], 1)

    def test_scale_awaits_user_then_resumes_without_any_automatic_inference(self):
        body = {**self.body, "scaleMode": "auto"}; body.pop("mmPerPixel")
        self.jid = self.lab.create_job(self.pid, body)["job"]["id"]
        waiting = self.submit("analysis", analysis=ANALYSIS)
        self.assertEqual(waiting["status"], "awaiting_input")
        self.assertEqual(waiting["analysis"]["summary"], ANALYSIS["summary"])
        resumed = self.submit("input", scaleMode="calibrated", calibration={"p1": [10, 10], "p2": [90, 10], "lengthMm": 800})
        self.assertEqual(resumed["status"], "awaiting_codex")
        self.assertEqual(resumed["scaleProvenance"]["mmPerPixel"], 10)
        self.assertEqual(resumed["input"]["scaleMode"], "calibrated")
        self.assertTrue(self.lab.pending.empty())

    def test_strict_submission_cas_idempotency_and_unknown_paths_or_code(self):
        body = self.body_for(analysis=ANALYSIS)
        self.lab.handoff.submit(self.jid, "analysis", body)
        self.assertTrue(self.lab.handoff.submit(self.jid, "analysis", body)["idempotent"])
        with self.assertRaises(LabError) as error:
            self.lab.handoff.submit(self.jid, "analysis", {**body, "analysis": {"summary": "different"}})
        self.assertEqual(error.exception.code, "handoff_replay_conflict")
        with self.assertRaises(LabError) as error:
            self.lab.handoff.submit(self.jid, "candidate", {**body, "submissionId": uid(), "pixelScene": PIXELS})
        self.assertEqual(error.exception.code, "invalid_handoff_input")
        stale = {**self.body_for(pixelScene=PIXELS), "revision": 0}
        with self.assertRaises(LabError) as error:
            self.lab.handoff.submit(self.jid, "candidate", stale)
        self.assertEqual(error.exception.code, "handoff_revision_conflict")
        for field in ("path", "code", "command"):
            with self.assertRaises(LabError):
                self.lab.handoff.submit(self.jid, "candidate", self.body_for(pixelScene=PIXELS, **{field: "../unsafe"}))

    def test_invalid_editable_state_is_not_published_and_failed_candidate_is_private(self):
        self.submit("analysis", analysis=ANALYSIS)
        invalid = copy.deepcopy(PIXELS)
        invalid["furniture"] = [{"id": "f1", "type": "desk", "name": "desk", "cx": 50, "cy": 50, "w": 10, "d": 10, "height": 900}]
        result = self.submit("candidate", pixelScene=invalid)
        self.assertEqual(result["status"], "awaiting_codex")
        self.assertTrue(result["validation"]["errors"])
        self.assertNotIn("draft", result)
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        state = self.lab.store.workflow(self.jid)
        self.assertTrue(any(item["kind"] == "candidate_input" for item in state["artifacts"]))
        self.assertNotIn("artifacts", self.lab.public_job(self.jid))

    def test_cancelled_job_cannot_accept_captures_or_resurrect_through_replay(self):
        draft = self.candidate()
        self.lab.cancel(self.jid)
        with self.assertRaises(LabError) as error:
            self.captures(draft)
        self.assertEqual(error.exception.code, "handoff_job_stopped")
        with self.assertRaises(LabError):
            self.submit("review", draftId=draft["draft"]["id"], review=REVIEW)
        self.assertEqual(self.lab.public_job(self.jid)["status"], "cancelled")
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)

    def test_capture_requires_decodable_pixels_not_header_or_truncated_image(self):
        draft = self.candidate()
        header = b"\x89PNG\r\n\x1a\n" + b"\0" * 8 + struct.pack(">II", 64, 48)
        complete = base64.b64decode(image(64, 48).split(",")[1])
        for raw in (header, complete[:-10]):
            fake = "data:image/png;base64," + base64.b64encode(raw).decode()
            with self.assertRaises(LabError) as error:
                self.lab.handoff.review_images(self.jid, {"draftId": draft["draft"]["id"], "images": [{"view": view, "dataUrl": fake} for view in ("2d", "3d")]})
            self.assertEqual(error.exception.code, "invalid_review_image")
            self.assertEqual(self.lab.public_job(self.jid)["handoff"]["phase"], "captures")
        valid = self.lab.handoff.review_images(self.jid, {"draftId": draft["draft"]["id"], "images": [{"view": "2d", "dataUrl": image(64, 48)}, {"view": "3d", "dataUrl": image(1280, 960)}]})["job"]
        self.assertEqual(valid["handoff"]["phase"], "review")
        capture = next(item for item in self.lab.handoff.request(self.jid)["captures"] if item["view"] == "3d")
        self.assertEqual((capture["width"], capture["height"]), (1280, 960))

    def test_decoder_missing_is_explicit_not_silent_header_fallback(self):
        from server.handoff import verified_capture
        with patch.dict(sys.modules, {"PIL": None}):
            with self.assertRaises(LabError) as error:
                verified_capture(b"not-image", "image/png")
        self.assertEqual(error.exception.code, "capture_decoder_unavailable")

    def test_finalization_requires_review_of_current_captures_and_project_version(self):
        draft = self.candidate()
        with self.assertRaises(LabError) as error:
            self.submit("finalize", draftId=draft["draft"]["id"])
        self.assertEqual(error.exception.code, "review_required")
        self.captures(draft)
        self.submit("review", draftId=draft["draft"]["id"], review=REVIEW)
        with self.lab.store.transaction() as db:
            db.execute("UPDATE projects SET version=1 WHERE id=?", (self.pid,))
        with self.assertRaises(LabError) as error:
            self.submit("finalize", draftId=draft["draft"]["id"])
        self.assertEqual(error.exception.code, "version_conflict")
        with self.lab.store.transaction() as db:
            self.assertEqual(db.execute("SELECT count(*) FROM versions WHERE project_id=?", (self.pid,)).fetchone()[0], 0)

    def test_events_are_cursor_stable_sanitized_and_persist_across_restart(self):
        self.submit("analysis", analysis=ANALYSIS, publicMessage="已分析合成房间。 API_KEY=private-secret ak-synthetic-only-1234567890 G:/private/work/file.json")
        first = self.lab.job_events(self.jid, 0, 1)
        second = self.lab.job_events(self.jid, first["cursor"])
        self.assertTrue(first["hasMore"])
        combined = first["events"] + second["events"]
        self.assertEqual([event["id"] for event in combined], list(range(1, len(combined) + 1)))
        self.assertNotIn("private-secret", dump(combined)); self.assertNotIn("G:/private", dump(combined))
        self.assertNotIn("ak-synthetic-only", dump(combined))
        self.assertEqual(self.lab.public_job(self.jid)["events"], combined)
        self.lab.close(); self.lab = Lab(self.root, start_worker=False)
        self.assertEqual(self.lab.job_events(self.jid)["events"], combined)
        self.assertEqual(self.lab.public_job(self.jid)["handoff"]["phase"], "candidate")
        self.assertTrue(self.lab.pending.empty())
        self.assertEqual(self.lab.job_events(self.jid, second["cursor"])["events"], [])

    def test_source_path_boundary_rejects_database_path_traversal(self):
        with self.lab.store.transaction() as db:
            db.execute("UPDATE assets SET filename='../outside.png' WHERE id=?", (self.asset["id"],))
        with self.assertRaises(LabError) as error:
            self.lab.handoff.request(self.jid)
        self.assertEqual(error.exception.code, "handoff_asset_invalid")

    def test_loopback_bridge_rejects_browser_origin_but_public_events_remain_available(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        server.lab = self.lab
        server.allowed_origins = {"http://127.0.0.1:5186"}
        thread = threading.Thread(target=server.serve_forever, daemon=True); thread.start()
        base = f"http://127.0.0.1:{server.server_port}/api/ai-lab/v1/jobs/{self.jid}"
        try:
            with urllib.request.urlopen(base + "/handoff/request") as response:
                self.assertEqual(json.load(response)["jobId"], self.jid)
            request = urllib.request.Request(base + "/handoff/request", headers={"Origin": "http://127.0.0.1:5186"})
            with self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(request)
            self.assertEqual(error.exception.code, 403)
            with urllib.request.urlopen(base + "/events?after=0") as response:
                self.assertEqual(json.load(response)["cursor"], 1)
        finally:
            server.shutdown(); server.server_close(); thread.join(2)


if __name__ == "__main__":
    unittest.main()
