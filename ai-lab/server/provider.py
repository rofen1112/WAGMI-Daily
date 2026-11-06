"""Explicit backend-only execution providers; old gateway is never a fallback."""
import json
import math
import os
import time
import urllib.error
import urllib.request
import urllib.parse
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
    config = config or {}
    mode = config.get('AI_LAB_EXECUTION_MODE', 'codex_handoff')
    if mode == 'codex_handoff':
        return CodexHandoffProvider()
    if mode == 'api':
        return create_api_provider(config)
    raise ProviderError('provider_config_invalid', 'AI_LAB_EXECUTION_MODE 仅支持 api 或 codex_handoff。')


def create_api_provider(config=None):
    return BananaRouterProvider(config or {})


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
    for key in ("AI_LAB_EXECUTION_MODE", "AI_LAB_API_BASE_URL", "AI_LAB_API_MODEL", "AI_LAB_API_REASONING_EFFORT", "AI_LAB_API_MAX_OUTPUT_TOKENS", "AI_LAB_API_TIMEOUT", "AI_LAB_API_IMAGE_VERIFIED", "AI_LAB_BANANAROUTER_KEY", "BANANAROUTER_API_KEY", "AI_LAB_API_KEY", "SEEDANCE_API_KEY", "API_KEY", "AI_LAB_GATEWAY_IMAGE_VERIFIED", "AI_LAB_MODEL_TIMEOUT", "AI_LAB_GATEWAY_WIRE_MODE", "AI_LAB_MAX_OUTPUT_TOKENS", "AI_LAB_REASONING_EFFORT", "AI_LAB_JSON_MODE", "AI_LAB_WORKFLOW_MAX_CALLS", "AI_LAB_WORKFLOW_MAX_REPAIRS", "AI_LAB_WORKFLOW_MAX_REVIEWS"):
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


class _NoCredentialRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        raise ProviderError('provider_redirect_rejected', '模型接口返回重定向，未转发认证信息。')


def _read_responses_stream(response, timeout):
    """Consume SSE privately. Only a completed terminal response can be data.

    Deltas and reasoning events never form a partial candidate or public log.
    Explicit output_item.done items may fill a terminal response's omitted output.
    """
    total=0
    deadline=time.monotonic()+timeout
    data=[]
    event_name=''
    final=None
    last_response=None
    known_usage=None
    items={}
    def stream_accounting(value=None):
        accounting=response_accounting(value if isinstance(value,dict) else last_response)
        if accounting.get('usage') is None and known_usage is not None:
            accounting['usage']=known_usage
        return accounting
    def consume(name,lines):
        nonlocal final,last_response,known_usage
        if not lines:return False
        value='\n'.join(lines)
        if value=='[DONE]':return True
        try:event=json.loads(value)
        except (ValueError,TypeError):
            raise ProviderError('provider_stream_invalid','流式响应事件不是有效JSON，未采用部分输出。',**stream_accounting()) from None
        if not isinstance(event,dict):
            raise ProviderError('provider_stream_invalid','流式响应事件格式无效。',**stream_accounting())
        kind=event.get('type') or name
        if name and event.get('type') and name!=event['type']:
            raise ProviderError('provider_stream_invalid','流式响应事件类型不一致。',**stream_accounting())
        if isinstance(event.get('response'),dict):last_response=event['response']
        reported=normalize_usage((event.get('response') or {}).get('usage')) if isinstance(event.get('response'),dict) else normalize_usage(event.get('usage'))
        if reported is not None:known_usage=reported
        if kind=='response.output_item.done':
            item=event.get('item')
            index=event.get('output_index')
            if isinstance(item,dict) and item.get('type')!='reasoning' and isinstance(index,int) and not isinstance(index,bool) and 0<=index<1000:
                if index in items and items[index]!=item:
                    raise ProviderError('provider_stream_conflict','流式响应包含互相矛盾的完整输出项。',**stream_accounting())
                items[index]=item
        elif kind=='response.completed':
            current=event.get('response')
            if not isinstance(current,dict):
                raise ProviderError('provider_stream_invalid','流式完成事件缺少完整响应。',**stream_accounting())
            if final is not None and current!=final:
                raise ProviderError('provider_stream_conflict','流式响应出现互相矛盾的完成事件。',**stream_accounting())
            final=current
        elif kind in ('response.failed','response.incomplete','error'):
            raise ProviderError('provider_response_incomplete','模型流式响应失败或未完成，未采用部分结果。',**stream_accounting(event.get('response') or event))
        return False
    while True:
        if time.monotonic()>deadline:
            raise ProviderError('provider_unavailable','模型流式响应超过总时间上限，未采用部分结果。',**stream_accounting())
        try:raw=response.readline(8*1024*1024+1)
        except Exception:
            raise ProviderError('provider_unavailable','模型流式响应中断，未采用部分结果。',**stream_accounting()) from None
        if not raw:
            if data:consume(event_name,data)
            break
        total+=len(raw)
        if len(raw)>8*1024*1024 or total>32*1024*1024:
            raise ProviderError('provider_response_too_large','模型流式响应超过上限。',**stream_accounting())
        try:line=raw.decode('utf-8').rstrip('\r\n')
        except UnicodeDecodeError:
            raise ProviderError('provider_stream_invalid','流式响应不是有效UTF-8。',**stream_accounting()) from None
        if not line:
            if consume(event_name,data):break
            data=[];event_name=''
        elif line.startswith('data:'):
            data.append(line[5:].lstrip(' '))
        elif line.startswith('event:'):
            event_name=line[6:].strip()
        # SSE comments, id and retry fields are not executable instructions.
    if final is None or final.get('status')!='completed':
        raise ProviderError('provider_response_incomplete','模型流式响应未收到完整完成事件，未采用部分输出。',**stream_accounting())
    if not final.get('output') and items:
        final={**final,'output':[items[k] for k in sorted(items)]}
    return final


class BananaRouterProvider:
    """Responses transport only. Tools/validation/captures remain local stages.

    No SDK retries, model substitution, sampling knobs or hidden gateway fallback.
    Successful JSON still requires the independent scene and visual gates.
    """
    provider_id = 'bananarouter'
    execution_mode = 'api'
    wire_mode = 'responses'
    json_mode = True
    model = 'gpt-6.1-sol'
    stream = True

    def __init__(self, config):
        self._key = config.get('AI_LAB_BANANAROUTER_KEY') or config.get('BANANAROUTER_API_KEY') or ''
        self.configured = bool(self._key)
        self.supports_images = config.get('AI_LAB_API_IMAGE_VERIFIED') == '1'
        self.base_url = config.get('AI_LAB_API_BASE_URL', 'https://api.bananarouter.com/v1').rstrip('/')
        self.model = config.get('AI_LAB_API_MODEL', 'gpt-6.1-sol')
        self.reasoning_effort = config.get('AI_LAB_API_REASONING_EFFORT', 'max')
        self.image_detail = 'high'
        self._config_valid = self.base_url == 'https://api.bananarouter.com/v1' and self.model == 'gpt-6.1-sol' and self.reasoning_effort in ('low','medium','high','xhigh','max')
        try:
            raw_tokens = config.get('AI_LAB_API_MAX_OUTPUT_TOKENS', '65536')
            raw_timeout = config.get('AI_LAB_API_TIMEOUT', '900')
            self.max_output_tokens = int(raw_tokens)
            self.timeout = float(raw_timeout)
            self._config_valid = self._config_valid and not isinstance(raw_tokens, bool) and not isinstance(raw_timeout, bool) and 4096 <= self.max_output_tokens <= 128000 and math.isfinite(self.timeout) and 5 <= self.timeout <= 1800
        except (ValueError,TypeError,OverflowError):
            self.max_output_tokens, self.timeout, self._config_valid = 65536, 900, False
        self.endpoint = self.base_url + '/responses'

    def _body(self, messages):
        if not self._config_valid:
            raise ProviderError('provider_config_invalid', 'BananaRouter 模型、地址、推理强度或预算配置无效。')
        inputs=[]
        for message in messages:
            role=message.get('role')
            if role not in ('system','developer','user','assistant'):
                raise ProviderError('provider_input_invalid', '阶段消息角色无效。')
            content=message.get('content')
            parts=[]
            if isinstance(content,str):
                parts=[{'type':'input_text','text':content}]
            elif isinstance(content,list):
                for item in content:
                    if not isinstance(item,dict):
                        raise ProviderError('provider_input_invalid', '阶段内容格式无效。')
                    if item.get('type')=='text' and isinstance(item.get('text'),str):
                        parts.append({'type':'input_text','text':item['text']})
                    elif item.get('type')=='image_url' and role=='user' and isinstance(item.get('image_url'),dict):
                        url=item['image_url'].get('url')
                        if not isinstance(url,str) or not url.startswith(('data:image/png;base64,','data:image/jpeg;base64,','data:image/webp;base64,')):
                            raise ProviderError('provider_input_invalid', '仅发送任务已绑定的本地图片内容。')
                        parts.append({'type':'input_image','image_url':url,'detail':'high'})
                    else:
                        raise ProviderError('provider_input_invalid', '阶段内容类型不受支持。')
            else:
                raise ProviderError('provider_input_invalid', '阶段内容为空或格式无效。')
            inputs.append({'role':'developer' if role=='system' else role,'content':parts})
        return {'model':self.model,'input':inputs,'reasoning':{'effort':self.reasoning_effort},'max_output_tokens':self.max_output_tokens,'text':{'format':{'type':'json_object'}},'stream':self.stream,'store':False}

    def complete(self, messages):
        if not self.configured:
            raise ProviderError('api_key_missing', '请在后端私有配置中设置 BananaRouter Key。')
        body=self._body(messages)
        request=urllib.request.Request(self.endpoint,data=json.dumps(body,ensure_ascii=False,allow_nan=False).encode('utf-8'),headers={'Authorization':'Bearer '+self._key,'Content-Type':'application/json','Accept':'text/event-stream, application/json'},method='POST')
        try:
            with urllib.request.build_opener(_NoCredentialRedirect()).open(request,timeout=self.timeout) as response:
                request_id=response.headers.get('x-request-id') or response.headers.get('request-id')
                response_transport='sse' if 'text/event-stream' in response.headers.get('Content-Type','').lower() else 'json'
                if response_transport=='sse':
                    payload=_read_responses_stream(response,self.timeout)
                else:
                    raw=response.read(8*1024*1024+1)
                    if len(raw)>8*1024*1024:
                        raise ProviderError('provider_response_too_large','模型响应超过上限。')
                    payload=json.loads(raw)
        except ProviderError:
            raise
        except urllib.error.HTTPError as exc:
            code = {400:'provider_bad_request',401:'provider_auth_failed',403:'provider_access_denied',404:'provider_model_unavailable',429:'provider_rate_limited'}.get(exc.code,'provider_http_error')
            raise ProviderError(code,f'BananaRouter 返回 HTTP {exc.code}；本次未自动重试或切换模型。') from None
        except Exception:
            raise ProviderError('provider_unavailable','BananaRouter 请求失败或超时；本次未自动重放。') from None
        accounting=response_accounting(payload)
        structure=response_output_structure(payload,'responses')
        if not isinstance(payload,dict) or payload.get('error'):
            raise ProviderError('provider_rejected','模型接口拒绝请求。',**accounting)
        if payload.get('status') != 'completed':
            raise ProviderError('provider_response_incomplete','模型响应未完整完成，未采用部分结果。',output_structure=structure,**accounting)
        actual_model=payload.get('model')
        if not isinstance(actual_model,str) or not (actual_model==self.model or actual_model.startswith(self.model+'-')):
            raise ProviderError('provider_model_mismatch','网关返回的模型标识与指定模型不一致，未采用其结果。',output_structure=structure,**accounting)
        parts=[]
        for item in payload.get('output',[]):
            if not isinstance(item,dict): continue
            if item.get('type') in ('function_call','computer_call','web_search_call','file_search_call'):
                raise ProviderError('provider_unexpected_tool','本阶段需要数据输出，收到未授权工具请求。',**accounting)
            for part in item.get('content',[]) if isinstance(item.get('content'),list) else []:
                if not isinstance(part,dict): continue
                if part.get('type')=='refusal':
                    raise ProviderError('provider_refused','模型未提供本阶段结果。',**accounting)
                if part.get('type')=='output_text' and isinstance(part.get('text'),str): parts.append(part['text'])
        if not parts and isinstance(payload.get('output_text'),str): parts=[payload['output_text']]
        try:
            content,normalization=normalize_json_objects(parts)
        except JsonResponseError as exc:
            raise ProviderError('provider_response_json_invalid','模型没有返回唯一、完整的JSON对象；未截取或猜补内容。',normalization=exc.report,output_structure=structure,**accounting) from None
        # IDs and reported model aid audit, never raw provider bodies/headers.
        safe_id=lambda v: v[:160] if isinstance(v,str) and all(c.isalnum() or c in '_.:-' for c in v) else None
        return {'content':content,'usage':normalize_usage(payload.get('usage')),'normalization':normalization,'outputStructure':structure,'responseModel':actual_model,'responseId':safe_id(payload.get('id')),'requestId':safe_id(request_id),'responseTransport':response_transport}


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
