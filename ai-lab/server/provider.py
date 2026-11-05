"""Runtime defaults to current-session handoff; legacy gateway is explicit test-only."""
import json
import math
import os
import urllib.error
import urllib.request
from pathlib import Path
from .response_json import JsonResponseError, normalization_report, normalize_json_objects, response_output_structure

MODEL = "deepseek-v4-1-flash-260910"
ENDPOINT = "https://etc.seedance-api.net/server/api/call"


class CodexHandoffProvider:
    """No automatic inference, credential probing, or network fallback."""
    model = "codex-current-session"
    execution_mode = "codex_handoff"
    configured = False
    supports_images = False
    wire_mode = "local_handoff"

    def complete(self, messages):
        raise ProviderError("codex_handoff_required", "此任务需由当前 Codex 聊天接力执行，网页不会自动调用模型。")


def create_default_provider(config=None):
    # Existing gateway credentials remain private and preserved, but cannot
    # select or activate the old provider during runtime construction.
    return CodexHandoffProvider()


class ProviderError(Exception):
    def __init__(self, code, message, *, usage=None, response_status=None, incomplete_reason=None, normalization=None, output_structure=None):
        self.code, self.message = code, message
        self.usage = normalize_usage(usage)
        self.response_status = response_status if response_status in ("completed", "incomplete", "in_progress", "queued", "failed", "cancelled") else None
        self.incomplete_reason = incomplete_reason if incomplete_reason in ("max_output_tokens", "content_filter", "max_tokens") else None
        self.normalization = normalization
        self.output_structure = output_structure
        super().__init__(message)


def read_private_config(root):
    """Read only the explicitly designated backend file, then explicit env keys."""
    values = {}
    path = Path(root) / ".env.ai-lab.local"
    if path.is_file():
        for line in path.read_text(encoding="utf-8-sig").splitlines():
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip().strip("\"'")
    for key in ("AI_LAB_API_KEY", "SEEDANCE_API_KEY", "API_KEY", "AI_LAB_GATEWAY_IMAGE_VERIFIED", "AI_LAB_MODEL_TIMEOUT", "AI_LAB_GATEWAY_WIRE_MODE", "AI_LAB_MAX_OUTPUT_TOKENS", "AI_LAB_REASONING_EFFORT", "AI_LAB_JSON_MODE", "AI_LAB_WORKFLOW_MAX_CALLS", "AI_LAB_WORKFLOW_MAX_REPAIRS", "AI_LAB_WORKFLOW_MAX_REVIEWS"):
        if key in os.environ:
            values[key] = os.environ[key]
    return values


def normalize_usage(value):
    if not isinstance(value, dict):
        return None
    # Preserve provided token accounting only; do not infer missing values/cost.
    allowed = ("prompt_tokens", "completion_tokens", "total_tokens", "input_tokens", "output_tokens", "prompt_cache_hit_tokens", "prompt_cache_miss_tokens", "reasoning_tokens")
    result = {k: v for k, v in value.items() if k in allowed and isinstance(v, (int, float)) and not isinstance(v, bool) and math.isfinite(v) and v >= 0}
    for group in ("prompt_tokens_details", "completion_tokens_details", "input_tokens_details", "output_tokens_details"):
        if isinstance(value.get(group), dict):
            details = {k: v for k, v in value[group].items() if k in ("cached_tokens", "reasoning_tokens") and isinstance(v, int) and not isinstance(v, bool) and v >= 0}
            if details:
                result[group] = details
    return result or None


def response_accounting(payload):
    """Extract data safe to carry on errors; never retain raw vendor text."""
    if not isinstance(payload, dict):
        return {}
    details = payload.get("incomplete_details")
    return {"usage": normalize_usage(payload.get("usage")), "response_status": payload.get("status"), "incomplete_reason": details.get("reason") if isinstance(details, dict) else None}


class SeedanceProvider:
    model = MODEL

    def __init__(self, config):
        self._key = config.get("AI_LAB_API_KEY") or config.get("SEEDANCE_API_KEY") or config.get("API_KEY") or ""
        self.configured = bool(self._key)
        self.supports_images = config.get("AI_LAB_GATEWAY_IMAGE_VERIFIED") == "1"
        self.wire_mode = config.get("AI_LAB_GATEWAY_WIRE_MODE", "messages")
        # Explicit opt-in only. Upstream documents this knob; gateway passthrough
        # must still be established by the operator's bounded live test.
        self.reasoning_effort = config.get("AI_LAB_REASONING_EFFORT", "").strip()
        json_mode = config.get("AI_LAB_JSON_MODE", "0")
        self.json_mode = json_mode == "1"
        self._json_mode_valid = isinstance(json_mode, str) and json_mode in ("0", "1")
        try:
            self.max_output_tokens = max(1024, min(int(config.get("AI_LAB_MAX_OUTPUT_TOKENS", "12000")), 32000))
        except ValueError:
            self.max_output_tokens = 12000
        try:
            self.timeout = max(5, min(float(config.get("AI_LAB_MODEL_TIMEOUT", "90")), 180))
        except ValueError:
            self.timeout = 90

    def complete(self, messages):
        if not self.configured:
            raise ProviderError("api_key_missing", "请在后端私有配置中设置模型 Key。")
        if self.wire_mode not in ("messages", "responses"):
            raise ProviderError("provider_config_invalid", "模型网关协议配置无效。")
        if self.reasoning_effort and (self.wire_mode != "responses" or self.reasoning_effort not in ("none", "low", "high", "max")):
            raise ProviderError("provider_config_invalid", "思考强度仅支持 Responses 模式的 none、low、high、max。")
        if not self._json_mode_valid or (self.json_mode and self.wire_mode != "responses"):
            raise ProviderError("provider_config_invalid", "AI_LAB_JSON_MODE 仅支持0或1，开启1时必须使用Responses协议。")
        payload_body = {"apiKey": self._key, "model": self.model}
        if self.wire_mode == "responses":
            inputs = []
            for message in messages:
                content = message["content"]
                if isinstance(content, list):
                    content = [{"type": "input_text", "text": item["text"]} if item["type"] == "text" else {"type": "input_image", "image_url": item["image_url"]["url"]} for item in content]
                else:
                    content = [{"type": "input_text", "text": content}]
                inputs.append({"role": message["role"], "content": content})
            payload_body["input"] = inputs
            payload_body["max_output_tokens"] = self.max_output_tokens
            payload_body["stream"] = False
            if self.reasoning_effort:
                payload_body["reasoning"] = {"effort": self.reasoning_effort}
            if self.json_mode:
                payload_body["text"] = {"format": {"type": "json_object"}}
        else:
            payload_body["messages"] = messages
        body = json.dumps(payload_body, ensure_ascii=False).encode("utf-8")
        request = urllib.request.Request(ENDPOINT, data=body, headers={"Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(request, timeout=self.timeout) as response:
                raw = response.read(8 * 1024 * 1024 + 1)
            if len(raw) > 8 * 1024 * 1024:
                raise ProviderError("provider_response_too_large", "模型响应超过上限。")
            payload = json.loads(raw)
        except ProviderError:
            raise
        except urllib.error.HTTPError as exc:
            # Never expose vendor bodies, request objects, or their embedded key.
            raise ProviderError("provider_http_error", f"模型网关返回 HTTP {exc.code}。") from None
        except Exception:
            raise ProviderError("provider_unavailable", "模型网关请求失败或超时。") from None
        if isinstance(payload, dict) and payload.get("error"):
            raise ProviderError("provider_rejected", "模型网关拒绝请求；请核验该网关的实际协议与模型权限。", **response_accounting(payload))
        # Gateways sometimes wrap the OpenAI-compatible payload in data/result.
        for name in ("data", "result", "response"):
            if isinstance(payload, dict) and isinstance(payload.get(name), dict):
                if "choices" in payload[name]:
                    payload = payload[name]
                    break
                if "output" in payload[name] or "error" in payload[name]:
                    payload = payload[name]
                    break
        if isinstance(payload, dict) and payload.get("error"):
            raise ProviderError("provider_rejected", "模型网关拒绝请求；请核验该网关的实际协议与模型权限。", **response_accounting(payload))
        output_structure = response_output_structure(payload, self.wire_mode)
        if self.wire_mode == "responses" and isinstance(payload, dict) and payload.get("status") not in (None, "completed"):
            raise ProviderError("provider_response_incomplete", "模型响应尚未完成或因输出上限中断；未保存场景。", output_structure=output_structure, **response_accounting(payload))
        try:
            if self.wire_mode == "responses":
                text_parts = [part.get("text", "") for item in payload.get("output", []) if isinstance(item, dict) for part in item.get("content", []) if isinstance(part, dict) and part.get("type") == "output_text"]
                content = "".join(text_parts)
                if not content:
                    content = payload.get("output_text")
                    text_parts = [content]
            else:
                content = payload["choices"][0]["message"]["content"]
                text_parts = [content]
            if not isinstance(content, str):
                raise ValueError()
        except (KeyError, IndexError, TypeError, ValueError):
            raise ProviderError("provider_response_invalid", "模型网关响应缺少可解析的文本内容。", output_structure=output_structure, **response_accounting(payload)) from None
        normalization = normalization_report(text_parts=len(text_parts))
        if self.json_mode:
            try:
                content, normalization = normalize_json_objects(text_parts)
            except JsonResponseError as exc:
                code = "provider_response_json_conflict" if exc.report["reason"] == "conflicting_objects" else "provider_response_json_invalid"
                raise ProviderError(code, "JSON模式响应含冲突对象、残片或额外文字，未截取部分结果。", normalization=exc.report, output_structure=output_structure, **response_accounting(payload)) from None
        return {"content": content, "usage": normalize_usage(payload.get("usage")), "normalization": normalization, "outputStructure": output_structure}
