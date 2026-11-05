"""Offline public-decision-memory regressions for the v5 API workflow.

All images, provider replies and SQLite state are generated inside this test.
Private configuration is replaced at its input boundary; workflow/engine logic
is real. No network, credentials or actual project data is used.
"""
import base64
import copy
import hashlib
import io
import json
from pathlib import Path
import sys
import tempfile
import unittest
from unittest import mock

from PIL import Image

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "ai-lab"))
from engine import scene as real_engine
from server.app import Lab
from server import workflow_prompts
from server.store import dump

V5 = "codex-workflow-prompts-v5"
LEGACY = ("codex-workflow-prompts-v3", "codex-workflow-prompts-v4")
MEMORY_VERSION = "bounded-model-ledger-v1"
MEMORY_SOURCE = "previous_model_findings_not_ground_truth"
WIDTH, HEIGHT = 120, 80
STRUCTURE = {
    "walls": [[0, 0, WIDTH, 2, "e"]], "windows": [], "doors": [], "slides": [],
    "rooms": [{"id": "room-alpha", "name": "Synthetic room", "mat": "wood",
               "poly": [[0, 0], [WIDTH, 0], [WIDTH, HEIGHT], [0, HEIGHT]]}],
    "furniture": [],
}
FURNISH = {"furniture": [{"id": "desk-alpha", "type": "desk", "name": "Synthetic desk",
                           "cx": 50, "cy": 40, "w": 20, "d": 12, "rot": 0}]}
ANALYSIS = {
    "summary": "合成图纸，仅用于离线工作流回归", "spaces": ["Synthetic room"],
    "notes": [], "observations": [{"feature": "desk", "evidence": "synthetic image", "confidence": "medium"}],
    "scale": {"anchors": []},
}
PASS = {"pass": True, "reason": "合成候选已完成本轮模型对照检查", "issues": [],
        "limitations": ["离线合成图片不证明任何真实楼图的还原质量"]}


def failed_review(marker="PUBLIC_PRIOR_REVIEW"):
    return {"pass": False, "reason": marker,
            "issues": [{"severity": "major", "path": "$.furniture[0].cx",
                        "description": "合成桌子需要向右移动", "suggestedChange": "仅调整该桌子的位置"}],
            "limitations": ["上一轮模型意见是待核实的观察，不是真值"]}


def candidate(x=50):
    result = copy.deepcopy(STRUCTURE)
    result["furniture"] = copy.deepcopy(FURNISH["furniture"])
    result["furniture"][0]["cx"] = x
    return result


def image_url(color=(242, 242, 242)):
    output = io.BytesIO()
    Image.new("RGB", (WIDTH, HEIGHT), color).save(output, format="PNG")
    return "data:image/png;base64," + base64.b64encode(output.getvalue()).decode("ascii")


class OfflineApiProvider:
    configured, supports_images = True, True
    execution_mode, provider_id, model = "api", "bananarouter", "offline-memory-model"
    endpoint, wire_mode = "https://example.invalid/v1/responses", "responses"
    reasoning_effort, timeout, max_output_tokens = "none", 90, 12000
    json_mode, stream = True, True

    def __init__(self, outputs):
        self.outputs = copy.deepcopy(outputs)
        self.messages = []

    def complete(self, messages):
        self.messages.append(copy.deepcopy(messages))
        if not self.outputs:
            raise AssertionError("Unexpected provider call: an offline budget/cycle regression")
        result = self.outputs.pop(0)
        return {"content": json.dumps(result, ensure_ascii=False),
                "usage": {"input_tokens": 7, "output_tokens": 11, "total_tokens": 18},
                # Private adapter fields must never become decision memory.
                "reasoning": "PRIVATE_PROVIDER_REASONING_SENTINEL",
                "rawResponse": "PRIVATE_RAW_RESPONSE_SENTINEL"}


class Harness:
    def __init__(self, case, outputs, limits=None):
        self.temp = tempfile.TemporaryDirectory(prefix="ai-lab-memory-")
        self.root = Path(self.temp.name)
        self.provider = OfflineApiProvider(outputs)
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)
        if limits:
            self.lab.workflow_limits = copy.deepcopy(limits)
        self.pid = self.lab.create_project({"title": "Synthetic memory regression"})["project"]["id"]
        self.asset = self.lab.upload({"name": "synthetic-memory.png", "dataUrl": image_url()})["asset"]
        case.addCleanup(self.close)

    def close(self):
        self.lab.close()
        self.temp.cleanup()

    def reopen(self):
        self.lab.close()
        self.lab = Lab(self.root, provider=self.provider, engine=real_engine, start_worker=False)

    def start(self, version=V5, pin=True):
        job = self.lab.create_job(self.pid, {"assetId": self.asset["id"], "executionMode": "api",
                                           "scaleMode": "manual", "mmPerPixel": 10,
                                           "prompt": "合成测试，不代表真实图纸还原"})["job"]
        if pin:
            # Only our temporary database is touched. Recorded legacy jobs must
            # remain on their original contract after the default advances.
            with self.lab.store.transaction() as db:
                record = self.lab.store.job(job["id"], db)["record"]
                record["promptVersion"] = version
                db.execute("UPDATE jobs SET record=? WHERE id=?", (dump(record), job["id"]))
        self.lab.run_job(job["id"])
        return self.lab.public_job(job["id"])

    def captures(self, job):
        return {"draftId": job["draft"]["id"],
                "images": [{"view": "2d", "dataUrl": image_url((230, 230, 230))},
                           {"view": "3d", "dataUrl": image_url((218, 218, 218))}]}

    def advance(self, job):
        self.lab.workflow.review_images(job["id"], self.captures(job))
        self.lab.run_job(job["id"])
        return self.lab.public_job(job["id"])

    def phase_messages(self, job, phase):
        calls = self.lab.public_job(job["id"])["usage"]["calls"]
        # Each harness starts with one job; the job-local test uses its own offset.
        return [self.provider.messages[index] for index, call in enumerate(calls) if call["phase"] == phase]


def memory_objects(messages, envelopes=False):
    result = []
    for message in messages:
        if message.get("role") != "user":
            continue
        content = message.get("content")
        texts = [content] if isinstance(content, str) else [part.get("text") for part in content or [] if isinstance(part, dict) and part.get("type") == "text"]
        for text in texts:
            if not isinstance(text, str):
                continue
            try:
                parsed = json.loads(text)
            except (ValueError, TypeError):
                continue
            if isinstance(parsed, dict) and "workflowMemory" in parsed:
                result.append(parsed if envelopes else parsed["workflowMemory"])
    return result


class ApiMemoryTests(unittest.TestCase):
    def setUp(self):
        config = mock.patch("server.app.read_private_config", return_value={})
        config.start()
        self.addCleanup(config.stop)
        # A regression must fail locally rather than accidentally reaching a gateway.
        guard = mock.patch("socket.create_connection", side_effect=AssertionError("Network forbidden in memory tests"))
        guard.start()
        self.addCleanup(guard.stop)

    def memory(self, messages):
        objects = memory_objects(messages, envelopes=True)
        self.assertEqual(len(objects), 1, "v5 must have one separate public workflowMemory JSON message")
        self.assertEqual(objects[0]["type"], "PUBLIC_DECISION_MEMORY_V1")
        self.assertLessEqual(len(json.dumps(objects[0], ensure_ascii=False, separators=(",", ":")).encode("utf-8")), 16 * 1024)
        memory = objects[0]["workflowMemory"]
        self.assertEqual(memory["version"], MEMORY_VERSION)
        self.assertEqual(memory["source"], MEMORY_SOURCE)
        self.assertIsInstance(memory["previousModelReviews"], list)
        self.assertIsInstance(memory["repairAttempts"], list)
        self.assertLessEqual(len(memory["previousModelReviews"]), 4)
        self.assertLessEqual(len(memory["repairAttempts"]), 4)
        return memory

    def assert_waiting(self, job):
        self.assertEqual(job["status"], "awaiting_review_images", job)

    def assert_cycle_stop(self, h, job, calls, unused):
        self.assertEqual(job["status"], "failed", job)
        self.assertIn(job.get("error", {}).get("code"), ("workflow_repair_cycle", "repair_stalled"), job)
        self.assertEqual(h.lab.store.project(h.pid)["version"], 0)
        self.assertEqual(len(h.provider.messages), calls)
        self.assertEqual(len(h.provider.outputs), unused)
        self.assertFalse(job.get("reviewImagesRequired"))
        # A repeated run never resurrects a failed checkpoint or spends another call.
        h.lab.run_job(job["id"])
        self.assertEqual(len(h.provider.messages), calls)

    def test_new_v5_job_second_review_gets_public_history_after_restart(self):
        old = copy.deepcopy(STRUCTURE)
        old["metadata"] = {"oldSceneOnly": "OLD_SCENE_SNAPSHOT_SENTINEL"}
        old["warnings"] = ["OLD_WARNINGS_SENTINEL"]
        review = failed_review()
        review.update(reasoning="PRIVATE_REVIEW_REASONING_SENTINEL", apiKey="PRIVATE_REVIEW_SECRET_SENTINEL")
        h = Harness(self, [ANALYSIS, old, FURNISH, review, candidate(55), PASS])
        first = h.start(pin=False)
        self.assertEqual(first["promptVersion"], V5, "new jobs must explicitly record the new prompt contract")
        self.assert_waiting(first)
        second = h.advance(first)
        self.assert_waiting(second)
        self.assertNotEqual(first["draft"]["id"], second["draft"]["id"])
        self.assertEqual(h.lab.store.project(h.pid)["version"], 0)
        h.reopen()  # History must be persisted, not only a Python instance variable.
        final = h.advance(second)
        self.assertEqual(final["status"], "succeeded", final)
        reviews = h.phase_messages(final, "visual_review")
        self.assertEqual(len(reviews), 2)
        initial = self.memory(reviews[0])
        self.assertEqual(initial["previousModelReviews"], [])
        self.assertEqual(initial["repairAttempts"], [])
        later = self.memory(reviews[1])
        self.assertEqual(later["previousModelReviews"][-1]["review"]["reason"], review["reason"])
        attempt = later["repairAttempts"][-1]
        self.assertEqual(attempt["targetedReview"]["reason"], review["reason"])
        self.assertTrue(attempt["changed"])
        self.assertNotEqual(attempt["beforeFingerprint"], attempt["afterFingerprint"])
        delta = attempt["changeSummary"]
        self.assertIsInstance(delta["truncated"], bool)
        self.assertLessEqual(len(delta["objects"]), 6)
        furniture_changes = [item for item in delta["objects"] if item["collection"] == "furniture"]
        self.assertTrue(furniture_changes, "memory must describe the real targeted change, not only an opaque hash")
        self.assertTrue(any(item.get("match") == "stable_id" and item.get("id") == FURNISH["furniture"][0]["id"]
                            for item in furniture_changes))
        self.assertEqual(later["previousModelReviews"][-1]["draftId"], first["draft"]["id"])
        serialized = json.dumps(later, ensure_ascii=False)
        self.assertIn("$.furniture[0].cx", serialized)
        for forbidden in ("OLD_SCENE_SNAPSHOT_SENTINEL", "OLD_WARNINGS_SENTINEL", "PRIVATE_PROVIDER_REASONING_SENTINEL",
                          "PRIVATE_RAW_RESPONSE_SENTINEL", "PRIVATE_REVIEW_REASONING_SENTINEL", "PRIVATE_REVIEW_SECRET_SENTINEL"):
            self.assertNotIn(forbidden, serialized)
        self.assertNotIn("candidateIR", serialized)
        self.assertNotIn("editorState", serialized)
        self.assertNotIn("scene", later)
        self.assertEqual(sum(part.get("type") == "image_url" for part in reviews[1][1]["content"]), 3,
                         "memory must supplement, not replace, the current source and both real captures")
        repair_memory = self.memory(h.phase_messages(final, "visual_repair")[0])
        self.assertEqual(repair_memory["previousModelReviews"][-1]["review"]["reason"], review["reason"])
        self.assertEqual(h.lab.store.scene(h.pid)["scene"]["metadata"]["generation"]["promptVersion"], V5)

    def test_v5_public_memory_is_bounded_sanitized_and_keeps_critical_findings(self):
        review = failed_review("PUBLIC_REASON apiKey=sk-memory-test-abcdefghijklmnop C:/private/memory-config.txt " + "R" * 3500)
        review["issues"] = [{"severity": "minor", "path": "$.furniture[0]",
                             "description": "minor " + "描述" * 900, "suggestedChange": "建议" * 900}
                            for _ in range(20)]
        review["issues"].append({"severity": "critical", "path": "$.furniture[0].cx",
                                 "description": "PUBLIC_CRITICAL_SENTINEL token=private-value /tmp/private-capture.png",
                                 "suggestedChange": "限定更正 " + "建议" * 900,
                                 "reasoning": "PRIVATE_ITEM_REASONING_SENTINEL"})
        review["limitations"] = ["公开限制 " + "L" * 1800 for _ in range(20)]
        h = Harness(self, [ANALYSIS, STRUCTURE, FURNISH, review, candidate(55), PASS])
        second = h.advance(h.start())
        self.assert_waiting(second)
        final = h.advance(second)
        self.assertEqual(final["status"], "succeeded", final)
        memory = self.memory(h.phase_messages(final, "visual_review")[-1])
        summaries = [item["review"] for item in memory["previousModelReviews"]]
        summaries += [item["targetedReview"] for item in memory["repairAttempts"] if item.get("targetedReview")]
        self.assertTrue(summaries)
        for summary in summaries:
            self.assertLessEqual(len(summary["reason"]), 400)
            self.assertLessEqual(len(summary["issues"]), 6)
            self.assertLessEqual(len(summary["limitations"]), 8)
            self.assertTrue(any(item["severity"] == "critical" and "PUBLIC_CRITICAL_SENTINEL" in item["description"]
                                for item in summary["issues"]), "bounded history must not discard a later critical issue")
            self.assertLessEqual(set(summary), {"pass", "reason", "issues", "limitations"})
            for issue in summary["issues"]:
                self.assertLessEqual(set(issue), {"severity", "path", "description", "suggestedChange"})
                self.assertLessEqual(len(issue["path"]), 300)
                self.assertLessEqual(len(issue["description"]), 400)
                self.assertLessEqual(len(issue["suggestedChange"]), 400)
            for limitation in summary["limitations"]:
                self.assertLessEqual(len(limitation), 400)
        serialized = json.dumps(memory, ensure_ascii=False)
        for forbidden in ("sk-memory-test-abcdefghijklmnop", "C:/private/memory-config.txt", "private-value",
                          "/tmp/private-capture.png", "PRIVATE_ITEM_REASONING_SENTINEL"):
            self.assertNotIn(forbidden, serialized)

    def test_geometry_repair_delta_does_not_publish_invalid_secret_bearing_fields(self):
        invalid = copy.deepcopy(STRUCTURE)
        invalid["rooms"][0]["mat"] = "C:/private/memory-config.txt token=private-material-value"
        h = Harness(self, [ANALYSIS, invalid, FURNISH, candidate(), PASS])
        waiting = h.start()
        self.assert_waiting(waiting)
        self.assertEqual(waiting["budget"]["repairsUsed"], 1)
        final = h.advance(waiting)
        self.assertEqual(final["status"], "succeeded", final)
        memory = self.memory(h.phase_messages(final, "visual_review")[0])
        self.assertEqual(memory["previousModelReviews"], [])
        self.assertTrue(memory["repairAttempts"])
        self.assertIsNone(memory["repairAttempts"][-1]["targetedReview"])
        serialized = json.dumps(memory, ensure_ascii=False)
        self.assertNotIn("C:/private/memory-config.txt", serialized)
        self.assertNotIn("private-material-value", serialized)

    def test_v5_keeps_latest_four_rounds_without_claiming_they_are_truth(self):
        outputs = [ANALYSIS, STRUCTURE, FURNISH]
        for round_index in range(5):
            outputs.extend([failed_review(f"PUBLIC_ROUND_{round_index}"), candidate(55 + round_index * 5)])
        outputs.append(PASS)
        h = Harness(self, outputs, {"maxCalls": 14, "maxRepairs": 5, "maxVisualReviews": 6})
        job = h.start()
        for _ in range(6):
            self.assert_waiting(job)
            job = h.advance(job)
        self.assertEqual(job["status"], "succeeded", job)
        memory = self.memory(h.phase_messages(job, "visual_review")[-1])
        self.assertEqual(len(memory["previousModelReviews"]), 4)
        self.assertEqual(len(memory["repairAttempts"]), 4)
        self.assertEqual([item["review"]["reason"] for item in memory["previousModelReviews"]],
                         [f"PUBLIC_ROUND_{index}" for index in range(1, 5)])
        self.assertEqual([item["targetedReview"]["reason"] for item in memory["repairAttempts"]],
                         [f"PUBLIC_ROUND_{index}" for index in range(1, 5)])
        self.assertNotIn("PUBLIC_ROUND_0", json.dumps(memory))

    def test_display_only_repair_stops_before_another_capture_or_paid_review(self):
        renamed = candidate()
        renamed["rooms"][0]["name"] = "Renamed but unchanged geometry"
        renamed["furniture"][0]["name"] = "Another display name"
        renamed["warnings"] = ["Updated display-only uncertainty"]
        renamed["metadata"] = {"displayOnly": "not a geometric change"}
        h = Harness(self, [ANALYSIS, STRUCTURE, FURNISH, failed_review(), renamed, PASS])
        failed = h.advance(h.start())
        self.assert_cycle_stop(h, failed, calls=5, unused=1)
        self.assertEqual(len(h.phase_messages(failed, "visual_review")), 1)
        state = h.lab.store.workflow(failed["id"])
        self.assertIs(state["repairHistory"][-1]["changed"], False)

    def test_return_to_any_previously_valid_geometry_stops_before_third_review(self):
        returned = candidate()
        returned["warnings"] = ["A different label cannot make a previous geometry new"]
        h = Harness(self, [ANALYSIS, STRUCTURE, FURNISH, failed_review("FIRST_FINDING"), candidate(55),
                           failed_review("SECOND_FINDING"), returned, PASS],
                    {"maxCalls": 10, "maxRepairs": 3, "maxVisualReviews": 3})
        second = h.advance(h.start())
        self.assert_waiting(second)
        failed = h.advance(second)
        self.assert_cycle_stop(h, failed, calls=7, unused=1)
        self.assertEqual(len(h.phase_messages(failed, "visual_review")), 2)

    def test_geometry_type_rotation_and_material_changes_are_real_attempts(self):
        changes = {
            "position": lambda value: value["furniture"][0].update(cx=55),
            "rotation": lambda value: value["furniture"][0].update(rot=90),
            "type": lambda value: value["furniture"][0].update(type="table"),
            "material": lambda value: value["rooms"][0].update(mat="tile600"),
        }
        for name, change in changes.items():
            with self.subTest(change=name):
                changed = candidate()
                change(changed)
                h = Harness(self, [ANALYSIS, STRUCTURE, FURNISH, failed_review(), changed, PASS])
                second = h.advance(h.start())
                self.assert_waiting(second)
                final = h.advance(second)
                self.assertEqual(final["status"], "succeeded", final)
                attempt = self.memory(h.phase_messages(final, "visual_review")[-1])["repairAttempts"][-1]
                self.assertIs(attempt["changed"], True)
                self.assertNotEqual(attempt["beforeFingerprint"], attempt["afterFingerprint"])

    def test_opening_change_summary_records_counts_and_actual_portal_fields(self):
        architecture = copy.deepcopy(STRUCTURE)
        architecture["walls"] = [[0, 0, 30, 2, "e"], [70, 0, WIDTH, 2, "e"]]
        architecture["slides"] = [{"rect": [30, 0, 70, 2], "v": False}]
        repaired = copy.deepcopy(architecture)
        repaired["slides"] = []
        repaired["doors"] = [
            {"name": "Synthetic leaf A", "rect": [30, 0, 50, 2], "h": [30, 1], "len": 20, "c": [1, 0], "o": [0, 1]},
            {"name": "Synthetic leaf B", "rect": [50, 0, 70, 2], "h": [70, 1], "len": 20, "c": [-1, 0], "o": [0, 1]},
        ]
        repaired["furniture"] = copy.deepcopy(FURNISH["furniture"])
        review = failed_review("PUBLIC_OPENING_FINDING")
        review["issues"][0].update(path="$.slides[0]", description="合成开口类型需核对", suggestedChange="按合成原图更正开口表示")
        h = Harness(self, [ANALYSIS, architecture, FURNISH, review, repaired, PASS])
        second = h.advance(h.start())
        self.assert_waiting(second)
        final = h.advance(second)
        self.assertEqual(final["status"], "succeeded", final)
        attempt = self.memory(h.phase_messages(final, "visual_review")[-1])["repairAttempts"][-1]
        summary = attempt["changeSummary"]
        for collection in ("slides", "doors"):
            self.assertEqual(summary["counts"][collection], {"before": len(architecture[collection]), "after": len(repaired[collection])})
        portals = [item for item in summary["objects"] if item["collection"] in ("slides", "doors")]
        self.assertTrue(any(item["collection"] == "slides" and item.get("before", {}).get("rect") == architecture["slides"][0]["rect"]
                            and item.get("after") is None for item in portals))
        self.assertTrue(any(item["collection"] == "doors" and isinstance(item.get("after"), dict)
                            and all(key in item["after"] for key in ("rect", "h", "len", "c", "o")) for item in portals),
                        "next review must see which portal representation was actually attempted")
        for item in portals:
            self.assertIn(item["match"], ("stable_id", "index"))
            self.assertIn("path", item)

    def test_v5_memory_does_not_leak_between_jobs_in_same_database(self):
        renamed = candidate()
        renamed["warnings"] = ["same geometry"]
        h = Harness(self, [ANALYSIS, STRUCTURE, FURNISH, failed_review("OTHER_JOB_PUBLIC_FINDING"), renamed])
        stopped = h.advance(h.start())
        self.assert_cycle_stop(h, stopped, calls=5, unused=0)
        offset = len(h.provider.messages)
        h.provider.outputs = copy.deepcopy([ANALYSIS, STRUCTURE, FURNISH, PASS])
        new_job = h.start()
        final = h.advance(new_job)
        self.assertEqual(final["status"], "succeeded", final)
        memory = self.memory(h.provider.messages[offset + 3])
        self.assertEqual(memory["previousModelReviews"], [])
        self.assertEqual(memory["repairAttempts"], [])
        self.assertNotIn("OTHER_JOB_PUBLIC_FINDING", json.dumps(memory))

    def test_recorded_v3_v4_repair_and_review_prompts_remain_byte_exact(self):
        # Captured before adding v5. Full payload hashes pin old text, data,
        # inventory and image order, not only the version label or system text.
        expected = {
            (LEGACY[0], "visual_repair"): "86f0e7731dbdf837054c03addcaa47f20651366f5421c8472db205f86583ee26",
            (LEGACY[0], "visual_review"): "27b25fc52476a6454a685273a5d213f9b49a75fbb57f8804983500c5ea30dd1d",
            (LEGACY[1], "visual_repair"): "00601c469f242e3b7d912faaaaa23952c1d16e32ac1239d9bc22a776b652ff77",
            (LEGACY[1], "visual_review"): "aeeeab008bf02825702e92562604392aa5df24da260a6bbb78280807bcdb33a3",
        }
        asset = {"width": WIDTH, "height": HEIGHT}
        analysis = {"summary": "synthetic floorplan", "spaces": ["Synthetic room"], "notes": []}
        provenance = {"mode": "manual", "mmPerPixel": 10, "evidence": ["test input"], "confidence": "high", "assumptions": []}
        review = {"pass": False, "reason": "Synthetic desk is displaced", "issues": [{"severity": "major", "path": "$.furniture[0].cx",
                  "description": "Desk must move right", "suggestedChange": "Correct only desk center"}], "limitations": []}
        arguments = {
            "visual_repair": (asset, "source-url", candidate(), provenance, None, review, ["plan-url", "scene-url"]),
            "visual_review": (asset, "source-url", ["plan-url", "scene-url"], candidate(), analysis, provenance),
        }
        for (version, stage), digest in expected.items():
            with self.subTest(version=version, stage=stage):
                messages = workflow_prompts.messages_for_prompt_version(version, stage, *arguments[stage])
                serialized = json.dumps(messages, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
                self.assertEqual(hashlib.sha256(serialized.encode()).hexdigest(), digest)
                self.assertEqual(memory_objects(messages), [])

    def test_recorded_v3_v4_workflows_keep_their_original_loop_without_memory(self):
        for version in LEGACY:
            with self.subTest(version=version):
                renamed = candidate()
                renamed["warnings"] = ["legacy same-geometry response"]
                h = Harness(self, [ANALYSIS, STRUCTURE, FURNISH, failed_review(), renamed, PASS])
                first = h.start(version)
                self.assert_waiting(first)
                second = h.advance(first)
                self.assert_waiting(second)
                final = h.advance(second)
                self.assertEqual(final["status"], "succeeded", final)
                self.assertEqual(final["promptVersion"], version)
                self.assertEqual(len(h.provider.messages), 6)
                for messages in h.provider.messages:
                    self.assertEqual(memory_objects(messages), [], "old recorded jobs must not silently receive v5 memory")


if __name__ == "__main__":
    unittest.main(verbosity=2)
