# API 与当前 Codex 接力执行

本次迁移保留同一条原图、尺度、结构、家具、数据校验、浏览器预览、图像复核和限定修复流程。API 模式使用 BananaRouter 的 `gpt-6.1-sol`；当前聊天模式仍由操作者显式接力，不会自动请求 API。更换界面或模型不表示还原质量已经达标，正式保存仍须通过数据和视觉复核门禁。

## 选择执行方式

后端私有配置 `AI_LAB_EXECUTION_MODE=api|codex_handoff` 选择默认执行方式。没有配置时保留 `codex_handoff`。API 的地址、模型、推理强度、输出预算、超时及图像验证配置由 `provider.py` 校验；本文件不保存 Key。旧网关 Key 不会启用 API，也不会被删除或迁移。

本机 `.env.ai-lab.local` 仅由后端读取，且被 Git 忽略。配置示例（占位符不是有效密钥）：

```dotenv
AI_LAB_EXECUTION_MODE=api
AI_LAB_BANANAROUTER_KEY=YOUR_PRIVATE_BANANAROUTER_KEY
AI_LAB_API_BASE_URL=https://api.bananarouter.com/v1
AI_LAB_API_MODEL=gpt-6.1-sol
AI_LAB_API_REASONING_EFFORT=max
AI_LAB_API_MAX_OUTPUT_TOKENS=65536
AI_LAB_API_TIMEOUT=900
AI_LAB_API_IMAGE_VERIFIED=0
AI_LAB_WORKFLOW_MAX_CALLS=12
AI_LAB_WORKFLOW_MAX_REPAIRS=4
AI_LAB_WORKFLOW_MAX_REVIEWS=4
```

先用明确的合成图核对目标模型、图片识别、JSON 与推理参数，再将 `AI_LAB_API_IMAGE_VERIFIED` 设为 `1` 并重启本机开发后端。这个探测不代表真实户型质量验收。`max` 是目标模型已文档化的 API 推理强度，不能把 Codex 界面的 `ultra` 直接当作 API 参数。输出预算包含模型推理与可见输出；不设置目标推理模型不需要的 `temperature`/`top_p`。本机只使用 Responses 接口，无旧 DeepSeek 回退、自动 HTTP 重试或模型替换。

参数依据：[BananaRouter OpenAI LLM 文档](https://bananarouter.com/docs/openai-llm)、[GPT-6.1 Sol 官方模型说明](https://developers.openai.com/api/docs/models/gpt-6.1-sol)。网关返回的模型标识会保存为审计字段，但不是对其内部路由的独立证明。

生产路径请求 `stream=true`，在后端私下消费 Responses SSE，避免复杂任务长期等候非流式响应。只收到 `response.completed` 且 status=completed 后，才采用完整 output；delta、reasoning 或孤立 output_item.done 均不能形成候选。拒绝截断、冲突、失败及超限事件；单行最大8MiB、整个流32MiB。失败仍保留已经明确返回的 usage，未知部分保持未知。客户端只显示真实阶段事件，不公开推理内容或逐 token 的候选 JSON。请求的 `transportStream` 纳入不可变快照，返回的 `responseTransport` 另存调用审计，不能用新传输配置静默续跑旧任务。

`GET /api/ai-lab/v1/health` 返回默认 `executionMode`，以及：

```json
{
  "executionModes": {
    "api": {"configured": true, "available": true, "model": "gpt-6.1-sol", "providerSettings": {}},
    "codex_handoff": {"configured": true, "available": true, "model": "codex-current-session", "providerSettings": {}}
  }
}
```

API 的 `available` 要求配置有效、Key 已设置、图像能力已验证。接力的 `available=true` 表示本地数据桥可用，不表示网页已经连接一个自动推理服务。顶层 `providerConfigured` 仍描述当前默认 provider；不要用它单独禁用接力入口。

创建任务可显式传入 `executionMode`：

```json
{
  "action": "generate",
  "executionMode": "api",
  "assetId": "32位原图资产ID",
  "baseVersion": 0,
  "scaleMode": "auto",
  "prompt": "按原图重建可见空间和家具"
}
```

新 API 生成强制使用 `codex-workflow-v1`，不能选择历史单次 JSON 流程；接力生成强制使用 `codex-handoff-v1`。未知执行方式、未配置或图像能力未验证的 API 会在创建任务前拒绝。API 模式不开放生成后单次模型修改。历史结果仍可读取，旧网关任务不会自动排队给新供应商。

## API 的实际工作流

1. 原图分析与尺度证据。程序计算标注或物件先验锚点的比例中位数；纯物件先验保持低置信，不升级为测量真值。无有效先验时最多进行一次独立尺度估算。
2. 结构和家具分别调用，再展开显式重复构件。坐标始终使用原图像素。
3. 编译场景、完整编辑状态及确定性拓扑检查。错误进入共享的有限修复预算；不代替模型移动坐标来通过检查。
4. 合法候选私有保存并发布 `draft`，任务进入 `awaiting_review_images`。此时正式项目版本未更新。
5. 网页实际 viewer 截取 2D 和 3D 后提交 `/jobs/:id/review-images`。后端使用 Pillow 完整验证并解码，拒绝只有文件头、截断、MIME 不符、动画、多帧、超过 4 MB 或任一轴超过 1280 的图片。2D 保持方案比例；3D 由 viewer 生成 1280×960。服务端无法单凭上传协议证明图片来自该 viewer；随后模型必须对照原图和两张截图。
6. 多模态复核出现 critical/major 会阻止保存并进入有限修复，再发布新 draft 和获取新截图。通过数据与视觉复核后才保存新项目版本。模型复核不等于独立人工质量验收。

调用、修复、复核限额在任务创建时固定，遵循现有有界预算配置。每个实际模型调用先持久记录 reservation，再发请求；没有自动 HTTP 重试、模型替换或部分 JSON 兜底。重启中断的调用标记失败，不能通过重启重放付费请求。等待截图或尺寸时不占用 worker。

## 补充尺寸并续接

新 API 任务无法确定尺度时进入可恢复的 `awaiting_input`，保留已完成分析、调用记录及候选检查点，不需要重复付费分析。公开 job 含：

```json
{"inputContext":{"requestId":"任务ID","revision":0}}
```

向现有 `POST /api/ai-lab/v1/jobs/:id/input` 提交：

```json
{
  "requestId": "任务ID",
  "revision": 0,
  "submissionId": "新的32位小写十六进制标识",
  "scaleMode": "calibrated",
  "calibration": {"p1": [100, 100], "p2": [580, 100], "lengthMm": 6000}
}
```

示例坐标仅说明合同，不是任何案例的实际尺寸。也支持 `scaleMode=manual` 与正数 `mmPerPixel`。补尺通过后从结构阶段继续，原分析不会重跑。相同 submissionId 和相同内容幂等；复用标识改变内容、旧 revision、已取消任务或项目版本变化均拒绝。比例依据仍无效时保留 `awaiting_input` 并推进修订，提交方应读取最新 context。接力任务继续使用其原有 `handoff` context；两类任务共用 URL，按持久化执行方式分派。旧历史 `needs_input` 不回填或自动重新执行。

## 配置、事件和账单审计

新任务提示合同 v5 增加跨轮公开决策记忆：最近4轮模型发现、针对哪些问题做过哪些数据修改、门窗/家具等实际几何变化摘要，以单独 user data 传回后续 repair/review。整个摘要不超过16KiB，不包含旧完整场景、原始模型输出、隐式推理、密钥或本机路径。历史发现只是待核验的主张，不是原图真值；后续若推翻旧结论必须重看原图并解释冲突，不能无依据地反复切换门型。

v5 同时对实质几何计算指纹：只改名称/警告文本不算修复；无几何改动或回到已经出现的几何候选会以 `workflow_repair_cycle` 停止，保留失败候选，不继续支付下一轮截图复核调用。它不替模型决定坐标，也不代表还原质量已经达标。v3/v4 任务按其原提示回放，不注入新记忆或新循环门禁。

2026-11-05 的真实对照使用 v4；v5 是根据该次循环问题补上的工程修复，仅已通过离线回归，尚未完成新的同图付费质量验收。具体结果见 [本次实测结论](ai-lab-api-evaluation-20261105.md)。

每个新任务固定 executionMode、providerId、目标 model、wireMode、reasoningEffort、jsonMode、输出预算、超时、传输方式及图像 detail。供应商 endpoint 只保存哈希，不公开 URL 或凭据。每次模型调用前比较任务快照与当前 API 实例；模型、地址或设置变化会拒绝续跑旧任务。默认执行方式切换不会把接力任务交给 API。

checkpoint 固定 promptVersion；已支持的历史版本调用其原 builder，未知版本明确失败，不拿新提示冒充旧版本。每次调用记录阶段、实际归一化 usage、时间、promptVersion、公共设置及供应商返回的安全 responseModel/responseId/requestId。输入、输出和失败候选保留于后端私有 artifact，公开事件只提供实际阶段和可见工作摘要，不输出隐式思维链、原始模型响应、工具命令或私有路径。

事件仍通过 `GET /jobs/:id/events?after=<cursor>` 读取；这是持久化阶段事件，不是虚构逐 token 流。取消后不再进入下一调用或提交正式版本；已发出的供应商请求可能仍计费。API usage 只采用供应商已返回字段，费用没有单价时为 null。接力执行标签为 `codex-current-session`，usage 保持 null，`usageAccounting=current_session_unreported`，不宣称零用量。

## 离线验证

在仓库根运行 `python -B tests/ai-lab-api-routing.test.py`，测试只使用合成图、临时 SQLite 和注入 provider，包含双模式路由、完整预览复核修复循环、API 补尺 CAS 与幂等、严格截图解码、取消、配置快照变化、原图哈希绑定和重启不重放。无网络模型调用，不读现网数据库。
