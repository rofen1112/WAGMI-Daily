"""No-network state-machine/API regression tests: python tests/ai-lab-server.test.py."""
import base64
import copy
import json
import struct
import sys
import tempfile
import threading
import unittest
from unittest import mock
import urllib.error
import urllib.request
from http.server import ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "ai-lab"))
from server.app import Handler, Lab, PREFIX, initial_state
from server.provider import ProviderError, SeedanceProvider
from server.response_json import NORMALIZATION_VERSION
from server.prompts import PROMPT_VERSION, generation_messages, repair_messages
from server.store import LabError

SCENE = {"id": "plan", "walls": [[0, 0, 1000, 100, "e"]], "doors": [], "windows": [], "polygonWalls": [], "columns": [], "steps": [], "rooms": [{"id": "r1", "name": "Office", "mat": "wood", "poly": [[0, 0], [1000, 0], [1000, 1000], [0, 1000]]}], "furniture": [{"id": "f1", "type": "desk", "name": "Desk", "cx": 500, "cy": 500, "w": 200, "d": 100, "rot": 0}], "customLegacyGeometry": {"keep": True}}


class Engine:
    def compile_pixel_scene(self, candidate, width, height, scale, project_id, title):
        return copy.deepcopy(SCENE), self.validate_scene(candidate)

    def validate_scene(self, scene):
        return {"errors": [] if isinstance(scene, dict) and "walls" in scene else [{"path": "walls", "message": "required"}], "warnings": [], "counts": {"walls": len(scene.get("walls", [])) if isinstance(scene, dict) else 0}}

    def validate_state(self, scene, state):
        valid = isinstance(state, dict) and set(state) == {"furniture", "rooms", "demolished", "measures"}
        return {"errors": [] if valid else [{"path": "state", "message": "invalid"}], "warnings": [], "counts": {}}

    def apply_scene_patch(self, scene, patch):
        result = copy.deepcopy(scene)
        for operation in patch["operations"]:
            collection = "furniture" if operation["op"] == "update_furniture" else "rooms"
            item = next(item for item in result[collection] if item["id"] == operation["id"])
            item.update(operation["changes"])
        return result


class Provider:
    configured = True
    supports_images = True
    def __init__(self):
        self.calls = 0
        self.entered = None
        self.release = None
        self.error = None
        self.first_invalid = False

    def complete(self, messages):
        self.calls += 1
        if self.entered:
            self.entered.set()
            self.release.wait(3)
        if self.error:
            raise self.error
        return {"content": "[]" if self.first_invalid and self.calls == 1 else json.dumps(SCENE), "usage": {"prompt_tokens": 10, "completion_tokens": 15}}


class LabTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.provider = Provider()
        self.lab = Lab(self.root, provider=self.provider, engine=Engine(), start_worker=False)
        self.pid = self.lab.create_project({"title": "Test"})["project"]["id"]
        png = b"\x89PNG\r\n\x1a\n" + b"\x00" * 8 + struct.pack(">II", 100, 100)
        self.asset = self.lab.upload({"name": "plan.png", "dataUrl": "data:image/png;base64," + base64.b64encode(png).decode()})["asset"]
        self.body = {"assetId": self.asset["id"], "mmPerPixel": 10, "prompt": "layout"}

    def tearDown(self):
        self.lab.close()
        self.temp.cleanup()

    def submit_run(self, body=None):
        job = self.lab.create_job(self.pid, body or self.body)["job"]
        self.lab.run_job(job["id"])
        return self.lab.store.job(job["id"])["record"]

    def test_idempotency_and_payload_conflict(self):
        first = self.lab.create_job(self.pid, self.body, "same")["job"]
        second = self.lab.create_job(self.pid, self.body, "same")["job"]
        self.assertEqual(first["id"], second["id"])
        with self.assertRaises(LabError) as error:
            self.lab.create_job(self.pid, self.body | {"prompt": "different"}, "same")
        self.assertEqual(error.exception.status, 409)
        self.lab.run_job(first["id"])
        self.lab.run_job(first["id"])
        self.assertEqual(self.provider.calls, 1)

    def test_cancel_while_provider_inflight_never_commits(self):
        self.provider.entered, self.provider.release = threading.Event(), threading.Event()
        job = self.lab.create_job(self.pid, self.body)["job"]
        thread = threading.Thread(target=self.lab.run_job, args=(job["id"],))
        thread.start()
        self.assertTrue(self.provider.entered.wait(2))
        self.lab.cancel(job["id"])
        self.provider.release.set()
        thread.join(3)
        self.assertFalse(thread.is_alive())
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        record = self.lab.store.job(job["id"])["record"]
        self.assertEqual(record["status"], "cancelled")
        self.assertEqual(record["usage"]["calls"][0]["usage"]["prompt_tokens"], 10)

    def test_complete_scene_state_persist_and_reload(self):
        record = self.submit_run()
        self.assertEqual(record["status"], "succeeded")
        original = self.lab.store.scene(self.pid)
        state = copy.deepcopy(original["state"])
        state["furniture"][0]["cx"] = 900
        self.assertEqual(self.lab.save_state(self.pid, {"baseVersion": 1, "state": state}), {"version": 2})
        reopened = Lab(self.root, provider=self.provider, engine=Engine(), start_worker=False)
        saved = reopened.store.scene(self.pid)
        self.assertEqual(saved["scene"], SCENE)
        self.assertEqual(saved["scene"]["customLegacyGeometry"], {"keep": True})
        self.assertEqual(saved["state"], state)
        self.assertEqual(saved["version"], 2)
        reopened.close()

    def test_optimistic_conflict_and_queued_job_conflict(self):
        self.submit_run()
        job = self.lab.create_job(self.pid, self.body | {"baseVersion": 1})["job"]
        self.lab.save_state(self.pid, {"baseVersion": 1, "state": initial_state(SCENE)})
        self.lab.run_job(job["id"])
        record = self.lab.store.job(job["id"])["record"]
        self.assertEqual(record["error"]["code"], "version_conflict")
        self.assertEqual(self.provider.calls, 1)
        with self.assertRaises(LabError) as error:
            self.lab.save_state(self.pid, {"baseVersion": 1, "state": initial_state(SCENE)})
        self.assertEqual(error.exception.status, 409)

    def test_missing_key_is_honest_error(self):
        self.lab.provider = SeedanceProvider({})
        record = self.submit_run()
        self.assertEqual(record["status"], "failed")
        self.assertEqual(record["error"]["code"], "api_key_missing")
        self.assertEqual(record["usage"], {"calls": [], "cost": None})
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)

    def test_failed_generation_input_and_source_recover_after_reopening(self):
        self.provider.configured = False
        self.provider._key = "provider-private-secret"
        calibration = {"p1": [0, 0], "p2": [100, 0], "lengthMm": 1000, "apiKey": "must-not-publish"}
        body = self.body | {"pipelineVersion": "codex-workflow-v1", "scaleMode": "calibrated", "calibration": calibration, "prompt": "保留原始房间和留白", "apiKey": "must-not-publish", "internalPath": str(self.root)}
        record = self.submit_run(body)
        self.assertEqual(record["status"], "failed", record)
        self.lab.close()
        self.lab = Lab(self.root, provider=self.provider, engine=Engine(), start_worker=False)
        recovered = self.lab.public_job(record["id"])
        self.assertEqual(recovered["sourceAsset"], self.asset)
        self.assertEqual(recovered["input"], {"scaleMode": "calibrated", "mmPerPixel": 10, "calibration": {"p1": [0, 0], "p2": [100, 0], "lengthMm": 1000}, "prompt": "保留原始房间和留白"})
        self.assertEqual(self.lab.projects()["projects"][0]["latestJob"], recovered)
        encoded = json.dumps(recovered)
        for private in ("provider-private-secret", "must-not-publish", "apiKey", "filename", str(self.root)):
            self.assertNotIn(private, encoded)
        self.assertEqual(self.provider.calls, 0)

    def test_historical_generation_recovery_is_read_only_and_http_consistent(self):
        job = self.lab.create_job(self.pid, self.body)["job"]
        with self.lab.store.transaction() as db:
            old = self.lab.store.job(job["id"], db)
            record, payload = old["record"], old["payload"]
            record.pop("input", None)
            record.pop("sourceAsset", None)
            record.update(status="failed", stage="failed")
            payload.update(apiKey="private-old-key", internalPath=str(self.root), provider={"apiKey": "private-old-key"})
            before = (json.dumps(payload), json.dumps(record))
            db.execute("UPDATE jobs SET payload=?,record=? WHERE id=?", (*before, job["id"]))
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        server.lab, server.allowed_origins = self.lab, {"http://127.0.0.1:5186"}
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{server.server_port}" + PREFIX
        try:
            recovered = json.load(urllib.request.urlopen(base + f"/jobs/{job['id']}"))["job"]
            latest = json.load(urllib.request.urlopen(base + "/projects"))["projects"][0]["latestJob"]
            self.assertEqual(recovered, latest)
            self.assertEqual(recovered["sourceAsset"], self.asset)
            self.assertEqual(recovered["input"], {"mmPerPixel": 10, "prompt": "layout"})
            self.assertNotIn("scaleMode", recovered["input"])
            for private in ("private-old-key", "apiKey", "internalPath", "filename", str(self.root)):
                self.assertNotIn(private, json.dumps(recovered))
        finally:
            server.shutdown()
            server.server_close()
            thread.join(2)
        with self.lab.store.transaction() as db:
            row = db.execute("SELECT payload,record FROM jobs WHERE id=?", (job["id"],)).fetchone()
            self.assertEqual((row["payload"], row["record"]), before)
        self.assertEqual(self.provider.calls, 0)

    def test_modify_job_does_not_expose_generation_inputs(self):
        self.submit_run()
        modify = self.lab.create_job(self.pid, {"action": "modify", "baseVersion": 1, "assetId": self.asset["id"], "mmPerPixel": 10, "prompt": "f1旋转到90度"})["job"]
        public = self.lab.public_job(modify["id"])
        self.assertNotIn("sourceAsset", public)
        self.assertNotIn("input", public)
        latest = self.lab.projects()["projects"][0]["latestJob"]
        self.assertEqual(latest["id"], modify["id"])
        self.assertNotIn("sourceAsset", latest)
        self.assertNotIn("input", latest)

    def test_unknown_image_capability_needs_input(self):
        self.provider.supports_images = False
        record = self.submit_run()
        self.assertEqual(record["status"], "needs_input")
        self.assertEqual(self.provider.calls, 0)

    def test_provider_exception_never_echoes_secret(self):
        self.provider.error = RuntimeError("secret-api-key-123 /private/path")
        record = self.submit_run()
        self.assertEqual(record["status"], "failed")
        self.assertNotIn("secret-api-key", json.dumps(record))
        self.assertNotIn("/private/path", json.dumps(record))

    def test_incomplete_response_keeps_actual_usage_without_retry_or_commit(self):
        usage = {"input_tokens": 324, "output_tokens": 12000, "total_tokens": 12324, "input_tokens_details": {"cached_tokens": 0}, "output_tokens_details": {"reasoning_tokens": 11900}}
        payload = {"status": "incomplete", "incomplete_details": {"reason": "max_output_tokens"}, "usage": usage, "output": [{"type": "message", "content": [{"type": "output_text", "text": "test-secret /private/raw-body"}]}]}
        self.lab.provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": "responses", "AI_LAB_GATEWAY_IMAGE_VERIFIED": "1"})
        with mock.patch("urllib.request.urlopen", return_value=WireTests.Response(payload)) as send:
            record = self.submit_run()
        self.assertEqual(send.call_count, 1)
        self.assertEqual(record["status"], "failed")
        self.assertEqual(record["error"]["code"], "provider_response_incomplete")
        call = record["usage"]["calls"][0]
        self.assertEqual(call["usage"], usage)
        self.assertEqual(call["response_status"], "incomplete")
        self.assertEqual(call["incomplete_reason"], "max_output_tokens")
        self.assertEqual(call["status"], "failed")
        self.assertIsNone(record["usage"]["cost"])
        self.assertEqual(self.lab.store.project(self.pid)["version"], 0)
        self.assertNotIn("test-secret", json.dumps(record))
        self.assertNotIn("/private/raw-body", json.dumps(record))

    def test_at_most_one_targeted_repair(self):
        self.provider.first_invalid = True
        record = self.submit_run()
        self.assertEqual(record["status"], "succeeded")
        self.assertEqual(self.provider.calls, 2)
        self.assertIsNone(record["usage"]["cost"])

    def test_modify_does_not_call_provider_and_unknown_needs_input(self):
        self.submit_run()
        record = self.submit_run({"action": "modify", "baseVersion": 1, "prompt": "把f1移动到1000,2000"})
        self.assertEqual(record["status"], "succeeded")
        self.assertEqual(record["source"], "modified")
        self.assertEqual(self.lab.store.scene(self.pid)["source"], "modified")
        self.assertEqual(self.lab.store.scene(self.pid)["scene"]["furniture"][0]["cx"], 1000)
        record = self.submit_run({"action": "modify", "baseVersion": 2, "prompt": "加一层楼"})
        self.assertEqual(record["status"], "needs_input")
        self.assertEqual(self.provider.calls, 2)

    def test_executed_local_modify_records_explicit_zero_model_calls(self):
        self.submit_run()
        self.provider.configured = False
        record = self.submit_run({"action": "modify", "baseVersion": 1, "prompt": "f1旋转到90度"})
        self.assertEqual(record["status"], "succeeded", record)
        self.assertEqual(record["usage"], {"calls": [], "cost": None})
        self.assertEqual(self.provider.calls, 1)  # The preceding generation only.
        reopened = Lab(self.root, provider=self.provider, engine=Engine(), start_worker=False)
        self.assertEqual(reopened.store.job(record["id"])["record"]["usage"], {"calls": [], "cost": None})
        reopened.close()

    def test_queued_cancel_before_run_and_legacy_unknown_usage_stay_null(self):
        queued = self.lab.create_job(self.pid, self.body)["job"]
        self.assertIsNone(queued["usage"])
        cancelled = self.lab.cancel(queued["id"])["job"]
        self.assertIsNone(cancelled["usage"])
        self.lab.run_job(queued["id"])
        self.assertIsNone(self.lab.store.job(queued["id"])["record"]["usage"])
        legacy = self.lab.create_job(self.pid, self.body)["job"]
        self.lab.store.update_job(legacy["id"], status="failed", stage="failed", usage=None)
        reopened = Lab(self.root, provider=self.provider, engine=Engine(), start_worker=False)
        self.assertIsNone(reopened.store.job(legacy["id"])["record"]["usage"])
        reopened.close()
        self.assertEqual(self.provider.calls, 0)

    def test_baseline_provenance_survives_repeated_chat_and_state_save(self):
        baseline = self.lab.store.root / "baselines" / "private-reference.json"
        baseline.write_text(json.dumps({"title": "Reference", "scene": SCENE}), encoding="utf-8")
        loaded = self.lab.load_baseline(self.pid, {"baselineId": "private-reference"})
        self.assertEqual(loaded["source"], "baseline_reference")
        self.assertEqual(self.lab.store.scene(self.pid)["source"], "baseline_reference")
        first = self.submit_run({"action": "modify", "baseVersion": 1, "prompt": "f1旋转到90度"})
        self.assertEqual(first["status"], "succeeded", first)
        self.assertEqual(first["source"], "baseline_reference_modified")
        self.assertEqual(self.lab.store.scene(self.pid)["source"], "baseline_reference_modified")
        second = self.submit_run({"action": "modify", "baseVersion": 2, "prompt": "r1改名为会议室"})
        self.assertEqual(second["status"], "succeeded", second)
        self.assertEqual(second["source"], "baseline_reference_modified")
        saved = self.lab.store.scene(self.pid)
        self.assertEqual(saved["source"], "baseline_reference_modified")
        self.lab.save_state(self.pid, {"baseVersion": 3, "state": saved["state"]})
        self.assertEqual(self.lab.store.scene(self.pid)["source"], "baseline_reference_modified")
        self.assertEqual(self.provider.calls, 0)

    def test_natural_language_modification_uses_bounded_model_patch(self):
        self.submit_run()
        def translate(messages):
            self.assertIn("millimetres", messages[0]["content"])
            self.assertIn("f1", messages[1]["content"])
            self.provider.calls += 1
            return {"content": json.dumps({"operations": [{"op": "update_furniture", "id": "f1", "changes": {"cx": 700}}]}), "usage": {"input_tokens": 20, "output_tokens": 15}}
        self.provider.complete = translate
        record = self.submit_run({"action": "modify", "baseVersion": 1, "prompt": "请把书桌向右挪200毫米"})
        self.assertEqual(record["status"], "succeeded", record)
        self.assertEqual(record["usage"]["calls"][0]["phase"], "model_patch")
        self.assertEqual(self.lab.store.scene(self.pid)["scene"]["furniture"][0]["cx"], 700)
        self.assertEqual(self.provider.calls, 2)

    def test_private_static_and_baseline_path_boundaries(self):
        (self.root / ".env.ai-lab.local").write_text("secret-key")
        for path in ("../.env.ai-lab.local", "vendor/../../.env.ai-lab.local", "vendor\\secret", "", "index.html"):
            with self.assertRaises(LabError):
                self.lab.static_file(path)
        with self.assertRaises(LabError):
            self.lab.load_baseline(self.pid, {"baselineId": "../../.env.ai-lab.local"})

    def test_http_unknown_origin_and_encoded_traversal_rejected(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), Handler)
        server.lab = self.lab
        server.allowed_origins = {"http://127.0.0.1:5186"}
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{server.server_port}"
        try:
            request = urllib.request.Request(base + PREFIX + "/health", headers={"Origin": "https://evil.example"})
            with self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(request)
            self.assertEqual(error.exception.code, 403)
            with self.assertRaises(urllib.error.HTTPError) as error:
                urllib.request.urlopen(base + "/viewer-assets/%2e%2e/.env.ai-lab.local")
            self.assertEqual(error.exception.code, 404)
            response = urllib.request.urlopen(base + PREFIX + "/health")
            payload = json.loads(response.read())
            self.assertEqual(payload["status"], "ok")
            self.assertNotIn(str(self.root), json.dumps(payload))
        finally:
            server.shutdown()
            server.server_close()
            thread.join(2)

    def test_real_engine_compiles_then_edits_current_editor_state(self):
        from engine import scene as real_engine
        self.lab._engine = real_engine
        candidate = {"walls": [[0, 0, 100, 2, "e"]], "windows": [], "doors": [], "slides": [], "rooms": [{"id": "r1", "name": "Office", "mat": "wood", "poly": [[0, 0], [100, 0], [100, 100], [0, 100]]}], "furniture": [{"id": "f1", "type": "desk", "cx": 50, "cy": 50, "w": 20, "d": 10, "rot": 0}]}
        self.provider.complete = lambda messages: {"content": json.dumps(candidate), "usage": None}
        record = self.submit_run()
        self.assertEqual(record["status"], "succeeded", record)
        saved = self.lab.store.scene(self.pid)
        self.assertEqual(saved["scene"]["walls"][0][2], 1000)
        self.assertEqual(saved["scene"]["furniture"][0]["cx"], 500)
        self.assertEqual(saved["state"], real_engine.default_state(saved["scene"]))
        state = saved["state"]
        state["furniture"][0]["cx"] = 600
        self.lab.save_state(self.pid, {"baseVersion": 1, "state": state})
        modified = self.submit_run({"action": "modify", "baseVersion": 2, "prompt": "f1旋转到90度"})
        self.assertEqual(modified["status"], "succeeded", modified)
        saved = self.lab.store.scene(self.pid)
        self.assertEqual(saved["scene"]["furniture"][0]["cx"], 600)
        self.assertEqual(saved["scene"]["furniture"][0]["rot"], 90)


class WireTests(unittest.TestCase):
    class Response:
        def __init__(self, payload): self.raw = json.dumps(payload).encode()
        def __enter__(self): return self
        def __exit__(self, *args): return False
        def read(self, limit): return self.raw[:limit]

    def test_verified_responses_wire_and_vendor_usage(self):
        usage = {"input_tokens": 35, "output_tokens": 14, "total_tokens": 49, "input_tokens_details": {"cached_tokens": 0}, "output_tokens_details": {"reasoning_tokens": 12}}
        payload = {"object": "response", "status": "completed", "output": [{"type": "message", "content": [{"type": "output_text", "text": "OK"}]}], "usage": usage}
        provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": "responses"})
        messages = [{"role": "user", "content": [{"type": "text", "text": "look"}, {"type": "image_url", "image_url": {"url": "data:image/png;base64,AA=="}}]}]
        with mock.patch("urllib.request.urlopen", return_value=self.Response(payload)) as send:
            result = provider.complete(messages)
        request = send.call_args.args[0]
        body = json.loads(request.data)
        self.assertEqual(request.full_url, "https://etc.seedance-api.net/server/api/call")
        self.assertNotIn("messages", body)
        self.assertEqual(body["input"][0]["content"][1]["type"], "input_image")
        self.assertFalse(body["stream"])
        self.assertNotIn("reasoning", body)
        self.assertNotIn("thinking", body)
        self.assertNotIn("text", body)
        self.assertEqual({key: result[key] for key in ("content", "usage")}, {"content": "OK", "usage": usage})
        self.assertFalse(result["normalization"]["applied"])
        self.assertEqual(result["normalization"]["reason"], "json_mode_disabled")

    def test_json_mode_explicit_responses_payload_and_disabled_default(self):
        payload = {"status": "completed", "output": [{"type": "message", "content": [{"type": "output_text", "text": '{"ok":true}'}]}], "usage": {"total_tokens": 20}}
        for mode in ("0", "1"):
            with self.subTest(mode=mode):
                provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": "responses", "AI_LAB_JSON_MODE": mode})
                with mock.patch("urllib.request.urlopen", return_value=self.Response(payload)) as send:
                    result = provider.complete([{ "role": "user", "content": 'Return JSON {"ok":true}'}])
                body = json.loads(send.call_args.args[0].data)
                if mode == "1":
                    self.assertEqual(body["text"], {"format": {"type": "json_object"}})
                else:
                    self.assertNotIn("text", body)
                self.assertEqual(provider.json_mode, mode == "1")
                self.assertEqual(json.loads(result["content"]), {"ok": True})
                self.assertEqual(send.call_count, 1)

    def test_invalid_json_mode_or_wrong_wire_rejected_before_network(self):
        for wire, mode in (("responses", "true"), ("responses", "2"), ("responses", ""), ("responses", True), ("responses", 1), ("messages", "1")):
            with self.subTest(wire=wire, mode=mode):
                provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": wire, "AI_LAB_JSON_MODE": mode})
                with mock.patch("urllib.request.urlopen") as send:
                    with self.assertRaises(ProviderError) as error:
                        provider.complete([{ "role": "user", "content": "test"}])
                self.assertEqual(error.exception.code, "provider_config_invalid")
                send.assert_not_called()

    def test_reasoning_effort_is_explicit_responses_only_opt_in(self):
        payload = {"status": "completed", "output": [{"type": "message", "content": [{"type": "output_text", "text": "OK"}]}], "usage": {"output_tokens_details": {"reasoning_tokens": 0}}}
        for effort in ("none", "low", "high", "max"):
            with self.subTest(effort=effort):
                provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": "responses", "AI_LAB_REASONING_EFFORT": effort})
                with mock.patch("urllib.request.urlopen", return_value=self.Response(payload)) as send:
                    result = provider.complete([{ "role": "user", "content": "test"}])
                body = json.loads(send.call_args.args[0].data)
                self.assertEqual(body["reasoning"], {"effort": effort})
                self.assertNotIn("thinking", body)
                self.assertEqual(send.call_count, 1)
                self.assertEqual(result["usage"]["output_tokens_details"]["reasoning_tokens"], 0)

    def test_invalid_or_wrong_wire_reasoning_config_never_calls_network(self):
        for wire, effort in (("responses", "ultra"), ("responses", "disabled"), ("messages", "none")):
            with self.subTest(wire=wire, effort=effort):
                provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": wire, "AI_LAB_REASONING_EFFORT": effort})
                with mock.patch("urllib.request.urlopen") as send:
                    with self.assertRaises(ProviderError) as error:
                        provider.complete([{ "role": "user", "content": "test"}])
                self.assertEqual(error.exception.code, "provider_config_invalid")
                send.assert_not_called()

    def test_http_200_vendor_error_is_not_success_or_secret_echo(self):
        provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": "responses"})
        with mock.patch("urllib.request.urlopen", return_value=self.Response({"error": {"code": "InvalidParameter", "message": "test-secret"}})):
            with self.assertRaises(ProviderError) as error:
                provider.complete([{ "role": "user", "content": "test"}])
        self.assertEqual(error.exception.code, "provider_rejected")
        self.assertNotIn("test-secret", str(error.exception))

    def test_incomplete_metadata_is_allowlisted(self):
        provider = SeedanceProvider({"AI_LAB_API_KEY": "test-secret", "AI_LAB_GATEWAY_WIRE_MODE": "responses"})
        payload = {"status": "incomplete", "incomplete_details": {"reason": "test-secret"}, "usage": {"input_tokens": 5, "output_tokens": 100, "total_tokens": 105, "vendor_key": "test-secret"}}
        with mock.patch("urllib.request.urlopen", return_value=self.Response(payload)):
            with self.assertRaises(ProviderError) as error:
                provider.complete([{ "role": "user", "content": "test"}])
        self.assertEqual(error.exception.usage, {"input_tokens": 5, "output_tokens": 100, "total_tokens": 105})
        self.assertEqual(error.exception.response_status, "incomplete")
        self.assertIsNone(error.exception.incomplete_reason)
        self.assertNotIn("test-secret", str(vars(error.exception)))


class StrictJsonRepeatTests(unittest.TestCase):
    def setUp(self):
        fixture = Path(__file__).resolve().parent / "fixtures" / "ai-lab-response-repeat.json"
        self.fixture = json.loads(fixture.read_text(encoding="utf-8"))
        self.single = json.dumps(self.fixture["single"], ensure_ascii=False, separators=(",", ":"))

    def complete(self, parts, mode="1"):
        payload = {"status": "completed", "output": [{"type": "message", "content": [{"type": "output_text", "text": part}]} for part in parts], "usage": {"input_tokens": 3, "output_tokens": 5, "total_tokens": 8}}
        provider = SeedanceProvider({"AI_LAB_API_KEY": "test-private-key", "AI_LAB_GATEWAY_WIRE_MODE": "responses", "AI_LAB_JSON_MODE": mode})
        with mock.patch("urllib.request.urlopen", return_value=WireTests.Response(payload)):
            return provider.complete([{ "role": "user", "content": "Return one JSON object"}])

    def test_abstract_office_repeat_in_one_text_and_multiple_complete_blocks(self):
        for parts in ([self.single + self.fixture["separator"] + self.single], [self.single, self.single]):
            with self.subTest(parts=len(parts)):
                result = self.complete(parts)
                self.assertEqual(result["content"], self.single)
                self.assertEqual(json.loads(result["content"]), self.fixture["single"])
                report = result["normalization"]
                self.assertEqual(report["version"], NORMALIZATION_VERSION)
                self.assertTrue(report["applied"])
                self.assertEqual(report["count"], 2)
                self.assertEqual(report["equivalence"], "byte_identical")
                shape = result["outputStructure"]
                self.assertEqual(shape["outputItemCount"], len(parts))
                self.assertEqual(shape["outputTextPartCount"], len(parts))
                self.assertEqual(shape["items"][0]["parts"][0]["textLength"], len(parts[0]))
                self.assertEqual(len(shape["items"][0]["parts"][0]["textHash"]), 64)
                self.assertNotIn("示意办公平面", json.dumps(shape, ensure_ascii=False))
                self.assertNotIn("test-private-key", json.dumps(shape))

    def test_structural_equivalence_allows_key_order_whitespace_and_exact_numbers(self):
        first = '{ "nested":{"value":1},"flag":true }'
        second = '{"flag":true,"nested":{"value":1.0}}'
        result = self.complete([first, second])
        self.assertEqual(result["content"], first)
        self.assertEqual(result["normalization"]["equivalence"], "structurally_identical")
        self.assertEqual(result["normalization"]["count"], 2)

    def test_single_complete_object_preserves_original_text(self):
        original = " \n" + self.single + "\t "
        result = self.complete([original])
        self.assertEqual(result["content"], original)
        self.assertFalse(result["normalization"]["applied"])
        self.assertEqual(result["normalization"]["count"], 1)

    def test_different_objects_and_boolean_number_collisions_are_rejected(self):
        for parts in ([ '{"v":true}', '{"v":1}' ], [ '{"v":1}', '{"v":2}' ], [ '{"v":"1"}', '{"v":1}' ], [ '{"v":0.1}', '{"v":0.10000000000000001}' ], [ '{"v":[1,2]}', '{"v":[2,1]}' ]):
            with self.subTest(parts=parts):
                with self.assertRaises(ProviderError) as error:
                    self.complete(parts)
                self.assertEqual(error.exception.code, "provider_response_json_conflict")
                self.assertEqual(error.exception.usage["total_tokens"], 8)
                self.assertFalse(error.exception.normalization["applied"])
                self.assertEqual(error.exception.normalization["count"], 2)
                self.assertEqual(error.exception.output_structure["outputItemCount"], 2)
                self.assertNotIn("test-private-key", str(vars(error.exception)))

    def test_partial_blocks_extra_text_constants_and_duplicate_keys_are_rejected(self):
        midpoint = len(self.single) // 2
        cases = [[self.single[:midpoint], self.single[midpoint:]], ["prefix " + self.single], [self.single + " trailing"], [self.single, '{"next":'], ["[]"], ['{"v":NaN}'], ['{"v":Infinity}'], ['{"v":-Infinity}'], ['{"v":1,"v":2}'], ['{"v":1,"v":2}', '{"v":2}']]
        for parts in cases:
            with self.subTest(parts=parts):
                with self.assertRaises(ProviderError) as error:
                    self.complete(parts)
                self.assertEqual(error.exception.code, "provider_response_json_invalid")
                self.assertFalse(error.exception.normalization["applied"])
                self.assertEqual(error.exception.usage["total_tokens"], 8)
                self.assertEqual(error.exception.output_structure["outputTextPartCount"], len(parts))

    def test_json_mode_zero_keeps_legacy_text_and_block_concatenation_unchanged(self):
        for parts in (["legacy plain text"], [self.single, "\n" + self.single], [self.single[:20], self.single[20:]]):
            with self.subTest(parts=parts):
                result = self.complete(parts, mode="0")
                self.assertEqual(result["content"], "".join(parts))
                self.assertFalse(result["normalization"]["applied"])
                self.assertIsNone(result["normalization"]["count"])
                self.assertEqual(result["normalization"]["reason"], "json_mode_disabled")


class PromptContractTests(unittest.TestCase):
    def test_v2_uses_distinct_original_axis_limits_and_geometry_rules(self):
        messages = generation_messages({"width": 960, "height": 720}, "data:image/png;base64,AA==", 12.5, "保留客厅")
        system = messages[0]["content"]
        user = messages[1]["content"][0]["text"]
        self.assertEqual(PROMPT_VERSION, "pixel-scene-v2")
        self.assertIn("0 <= x <= 960; 0 <= y <= 720", user)
        self.assertIn("0 <= left < right <= 960", user)
        self.assertIn("0 <= top < bottom <= 720", user)
        self.assertIn("12.5 mm/pixel", user)
        self.assertIn("DO NOT apply scale", user)
        self.assertIn("Do not repeat the first vertex at the end", system)
        self.assertIn("identical adjacent vertices", system)
        self.assertIn("no zero-length edges", system)
        self.assertIn("Prefer omitting BOTH", system)
        self.assertIn("length MUST equal windows.length", system)
        self.assertIn("Never emit []", system)
        self.assertIn("omit outerBoundary entirely", system)
        self.assertIn("do not crop out a legitimate room", system)

    def test_repair_keeps_pixel_json_and_labels_compiled_mm_diagnostics(self):
        messages = generation_messages({"width": 960, "height": 720}, "data:image/png;base64,AA==", 12.5, "")
        original = copy.deepcopy(messages)
        raw = json.dumps({"rooms": [{"id": "r1", "poly": [[1, 1], [4, 1], [4, 4], [1, 1]]}]})
        validation = {"errors": [{"path": "$.rooms[0].poly", "message": "Room extends outside outer boundary by 4000.00 mm²."}]}
        repaired = repair_messages(messages, raw, validation)
        self.assertEqual(messages, original)
        self.assertEqual(repaired[:-2], original)
        self.assertEqual(repaired[-2], {"role": "assistant", "content": raw})
        instruction = repaired[-1]["content"]
        self.assertIn("COMPILED scene in millimetres (mm)", instruction)
        self.assertIn("square millimetres (mm²)", instruction)
        self.assertIn("never copy a reported mm value or mm² area into an x/y coordinate", instruction)
        self.assertIn("MUST still use ORIGINAL IMAGE PIXELS", instruction)
        self.assertIn("Remove repeated closing/adjacent polygon vertices", instruction)
        self.assertIn("never [] with non-empty windows", instruction)
        self.assertIn("do not crop/move valid rooms", instruction)
        self.assertIn("complete corrected JSON object, not a patch", instruction)
        self.assertIn(json.dumps(validation["errors"], ensure_ascii=False), instruction)


if __name__ == "__main__":
    unittest.main(verbosity=2)
