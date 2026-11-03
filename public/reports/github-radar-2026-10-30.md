# GitHub Radar 2026-10-30

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：407 条原始观察，393 个候选，14 个 surging，24 个 hot。
- 核验范围：全部 14 个 surging、全部 24 个 hot、全部 24 个 AI 强制候选；正式跟踪项目按每日策略选择 51 项（刷新 51、复用 0），库存总数 273，未做全量刷新；另核验 5 个 watch 轮换样本。
- 核验覆盖：59/59 个强制仓库可访问；README 59，提交 59，Issue 59，PR 59，Releases 59。
- 核验模式：`official-github-pages-fallback`。
- AI 日报：2026-10-30 / success；最新已完成周报：2026-10-25T23:54:02.248Z / success。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-trending-24h-python | success | 11 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| github-trending-weekly-all | success | 12 | 1 |  |
| github-trending-24h-typescript | success | 17 | 1 |  |
| github-trending-24h-all | success | 11 | 1 |  |
| ossinsight-24h-python | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-typescript | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-weekly-all | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 0 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| ossinsight-24h-all | failed | 0 | 1 | The operation was aborted due to timeout |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 50 | 2 |  |
| github-open-model-new | success | 3 | 1 |  |
| github-image-generation-active | success | 50 | 1 |  |
| github-video-intelligence-active | success | 50 | 1 |  |
| github-video-generation-active | success | 50 | 1 |  |
| github-video-editing-active | success | 50 | 2 |  |
| github-video-3d-stage-active | success | 50 | 1 |  |
| github-video-2026-new | success | 50 | 1 |  |
| github-web-data-active | success | 50 | 1 |  |
| github-browser-automation-active | success | 50 | 1 |  |
| github-deep-research-active | success | 50 | 2 |  |
| github-document-processing-active | success | 50 | 1 |  |
| github-physical-ai-active | success | 50 | 1 |  |
| github-vla-robotics-active | success | 50 | 1 |  |
| github-robot-simulation-active | success | 50 | 1 |  |

主趋势 `github-trending-24h-all`：**success**。
- 可选 OSS Insight 来源提示：ossinsight-24h-python / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-typescript / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-weekly-all / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-all / failed；The operation was aborted due to timeout。官方来源与必核证据通过时不阻断发布。

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 75,605 / 13,308 | 2026-10-29 | v2026.10.5 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。 |
| [CopilotKit/OpenBot](https://github.com/CopilotKit/OpenBot) | surging | 8,219 / 1,049 | 2026-10-30 | v0.2.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | surging | 50,355 / 6,201 | 2026-10-28 | v1.7.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [baidu/Unlimited-OCR](https://github.com/baidu/Unlimited-OCR) | surging / AI 强制 | 30,044 / 3,208 | 2026-10-29 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：百度官方仓库的推理实现、文档批处理和后处理路径真实可读，部署方法与显存约束明确；长文档解析有实用价值，以B级收录并保留未复现与许可边界。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 21,569 / 582 | 2026-10-31 | v1.1.20 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | surging | 3,033 / 497 | 2026-10-28 | v3.0.8 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | surging | 65,908 / 5,739 | 2026-10-28 | v3.31.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | surging | 20,704 / 1,163 | 2026-10-30 | v2.1.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | surging | 61,202 / 11,958 | 2026-10-30 | v0.3.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | surging | 94,451 / 10,452 | 2026-10-31 | v0.5.7 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 106,351 / 9,438 | 2026-10-25 | v1.6.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [deepopen-com/deepopen-3d-webs](https://github.com/deepopen-com/deepopen-3d-webs) | surging | 559 / 1 | 2026-10-27 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [hi3d-official/Hi3Dv1.0](https://github.com/hi3d-official/Hi3Dv1.0) | surging | 619 / 56 | 2026-10-23 | v1.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [outcrawlai/scout](https://github.com/outcrawlai/scout) | surging | 947 / 32 | 2026-10-21 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [jackwener/OpenCLI](https://github.com/jackwener/OpenCLI) | hot | 30,790 / 3,025 | 2026-10-26 | v2.0.2 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：将网页交互抽象为 Agent 可组合 CLI，是浏览器执行层近期高关注方向，按 A 级跟踪。 |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | hot | 73,723 / 9,662 | 2026-10-28 | 已检查 Releases，无 tag | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 119,633 / 13,319 | 2026-10-30 | 0.13.14 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25,886 / 1,798 | 2026-10-30 | stagehand-server-v3/v3.7.7 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：把确定性浏览器控制与 Agent 语义操作结合，是 Firecrawl 关联生态的重要执行层，按 A 级跟踪。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 197,262 / 10,418 | 2026-10-31 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 32,607 / 2,709 | 2026-10-31 | chromium-v155.0.8059.39.2-pro | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser) | hot | 12,058 / 1,221 | 2026-10-05 | v1.18.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [datawhalechina/every-embodied](https://github.com/datawhalechina/every-embodied) | hot | 4,296 / 416 | 2026-10-30 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [NVlabs/Sana](https://github.com/NVlabs/Sana) | hot | 9,723 / 785 | 2026-10-29 | streamrender-h3-examples-v1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：NVIDIA 官方原创图像、视频和世界模型实现，公开推理代码与Apache-2.0明确，近期持续维护；直接符合设计素材、视频和空间模型方向。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26,303 / 1,738 | 2026-10-31 | v4.0.0-rc.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 90,571 / 9,383 | 2026-10-29 | v0.5 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：在传统爬虫与 AI 数据采集之间形成清晰产品能力，且关注度和工程完整性突出，按 A 级跟踪。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 38,319 / 10,044 | 2026-10-31 | v0.5.22 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 86,634 / 9,014 | 2026-10-26 | v0.9.5 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：开源、自托管和 LLM 友好能力突出，是 Firecrawl 之外重要的技术路线，按 A 级正式跟踪。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 38,790 / 1,885 | 2026-10-31 | 1.0.2 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。 |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | hot | 23,318 / 2,231 | 2026-10-31 | v1.0.56 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。 |
| [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) | hot | 5,941 / 479 | 2026-09-30 | v0.2.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：提示词画廊、CLI 与 Agent Skill 可用，但主体偏提示词/API 工作流，原创技术深度继续观察。 |
| [browser-use/browser-harness](https://github.com/browser-use/browser-harness) | hot | 18,711 / 1,849 | 2026-10-25 | v0.1.13 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots) | hot | 32,302 / 4,736 | 2026-10-15 | golden-d27023f0394d | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | hot | 31,824 / 5,954 | 2026-10-29 | v2.0.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：仍是第三方模型 API 聚合前端；没有足以重开既有拒绝判断的新原创证据。 |
| [dgtlmoon/changedetection.io](https://github.com/dgtlmoon/changedetection.io) | hot | 35,385 / 2,186 | 2026-10-31 | 0.60.10 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [hitcslj/3DGen4Robot](https://github.com/hitcslj/3DGen4Robot) | hot / AI 强制 | 65 / 1 | 2026-10-24 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | hot | 144,274 / 17,142 | 2026-10-31 | v0.43.0 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 259,038 / 56,946 | 2026-10-31 | v0.22.5 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | hot | 71,532 / 5,579 | 2026-10-30 | v6.8.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | watch / AI 强制 | 267,099 / 32,396 | 2026-10-29 | dsh-v0.2.1-rc.5 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：该项目由 AI 当日二次审计触发，直接命中编码智能体、可组合 Agent 运行时与沙箱基础设施方向；官方关系、原创实现、可运行性与行业影响均通过门槛，按 A 级正式跟踪。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 132,362 / 20,906 | 2026-10-31 | rust-v0.166.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 154,021 / 26,095 | 2026-10-31 | v2.1.316 | Anthropic Commercial Terms | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：人工 approved 保留；当前 v2.1.312，官方分发、插件及示例可核验，商业 LICENSE 不表示完整核心开源。 |
| [openai/MultiLangBench](https://github.com/openai/MultiLangBench) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Factory-AI/droid-sdk-typescript](https://github.com/Factory-AI/droid-sdk-typescript) | watch / AI 强制 | 41 / 5 | 2026-10-20 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：实际package.json将本库标为@factory/droid-sdk-examples，依赖@factory/droid-sdk；examples与scripts提供官方原创集成和校验工程，按工程参考B级收录，不宣称SDK本体源码仓库。 |
| [Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold) | watch / AI 强制 | 0 / 0 | 2026-10-15 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [herdrdev/herdr-app](https://github.com/herdrdev/herdr-app) | watch / AI 强制 | 1,091 / 96 | 2026-10-31 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。 |
| [herdrdev/herdr-core](https://github.com/herdrdev/herdr-core) | watch / AI 强制 | 205 / 24 | 2026-10-30 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。 |
| [inclusionAI/Zooming-without-Zooming-v2](https://github.com/inclusionAI/Zooming-without-Zooming-v2) | watch / AI 强制 | 14 / 0 | 2026-10-28 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。 |
| [ku-autoai/MAGE](https://github.com/ku-autoai/MAGE) | watch / AI 强制 | 0 / 0 | 2026-10-16 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild) | watch / AI 强制 | 0 / 0 | 2026-10-23 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Tencent-Hunyuan/Hy-Nomas](https://github.com/Tencent-Hunyuan/Hy-Nomas) | watch / AI 强制 | 426 / 36 | 2026-10-30 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。 |
| [VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [X-EraAI/e05](https://github.com/X-EraAI/e05) | watch / AI 强制 | 14 / 0 | 2026-10-29 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：已核对官方关系、README、实际实现目录、安装/评测入口、许可及当前维护元数据；具有可用的原创研究或官方工程实现，不以热度作为收录前提。 |
| [deepseek-ai/DeepInfer](https://github.com/deepseek-ai/DeepInfer) | watch / AI 强制 | 0 / 0 | 2026-10-25 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [gaojh0333/PanoGraphGS](https://github.com/gaojh0333/PanoGraphGS) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [simonw/battledrones](https://github.com/simonw/battledrones) | watch / AI 强制 | 0 / 0 | 2026-10-24 | v14 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [XingChen-AGI/Xing4.0-29B-Intent](https://github.com/XingChen-AGI/Xing4.0-29B-Intent) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |

## 候选入选原因

- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；GitHub Trending 当日新增关注 443；最近 1 天有推送；跨 4 个来源命中。
- `CopilotKit/OpenBot`：行业优先：浏览器执行；GitHub Trending 当日新增关注 247；最近 1 天有推送；跨 3 个来源命中。
- `HKUDS/DeepTutor`：行业优先：深度研究；GitHub Trending 当日新增关注 1930；最近 1 天有推送；跨 3 个来源命中。
- `baidu/Unlimited-OCR`：行业优先：最新开放模型、文档解析与转换；GitHub Trending 当日新增关注 247；最近 1 天有推送；AI 日报/周报强制候选；本地快照新增 Stars 264。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 217；最近 0 天有推送；跨 2 个来源命中。
- `PurpleDoubleD/locally-uncensored`：行业优先：视频生成模型、视频生成 / 自动剪辑；GitHub Trending 当日新增关注 111；最近 1 天有推送；跨 2 个来源命中。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 117；最近 2 天有推送；跨 2 个来源命中。
- `citrolabs/ego-lite`：行业优先：浏览器执行；本地快照新增 Stars 314；最近 1 天有推送；跨 2 个来源命中。
- `bilawalsidhu/gods-eye-view`：行业优先：3D / 三维生成；本地快照新增 Stars 260；最近 1 天有推送。
- `debpalash/VoiceStudio`：行业优先：最新开放模型；本地快照新增 Stars 1437；最近 1 天有推送。
- `Panniantong/Agent-Reach`：行业优先：网页采集与检索；本地快照新增 Stars 717；最近 5 天有推送。
- `deepopen-com/deepopen-3d-webs`：行业优先：3D / 三维生成、视频 3D 舞台 / 虚拟制作；新仓库 4 天；最近 3 天有推送。
- `hi3d-official/Hi3Dv1.0`：行业优先：3D / 三维生成、最新开放模型；新仓库 14 天；最近 7 天有推送。
- `outcrawlai/scout`：行业优先：浏览器执行；新仓库 17 天。
- `jackwener/OpenCLI`：行业优先：浏览器执行；最近 4 天有推送；跨 6 个来源命中；本地快照新增 Stars 23。
- `calesthio/OpenMontage`：行业优先：视频生成模型、视频生成 / 自动剪辑；最近 2 天有推送；跨 5 个来源命中；本地快照新增 Stars 661。
- `browser-use/browser-use`：行业优先：网页采集与检索、浏览器执行；最近 0 天有推送；跨 4 个来源命中；本地快照新增 Stars 124。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 0 天有推送；跨 4 个来源命中；本地快照新增 Stars 22。
- `firecrawl/firecrawl`：行业优先：网页采集与检索；最近 0 天有推送；跨 4 个来源命中；本地快照新增 Stars 477。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `jo-inc/camofox-browser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 28；最近 7 天有推送；跨 3 个来源命中。
- `datawhalechina/every-embodied`：行业优先：WAIC 物理 AI；本地快照新增 Stars 28；最近 0 天有推送；跨 2 个来源命中。
- `NVlabs/Sana`：行业优先：3D / 三维生成、生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 5。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 7。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 239。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 0 天有推送；跨 3 个来源命中。
- `unclecode/crawl4ai`：行业优先：网页采集与检索；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 83。
- `lightpanda-io/browser`：行业优先：网页采集与检索、浏览器执行；最近 0 天有推送；跨 3 个来源命中；本地快照新增 Stars 1060。
- `Skyvern-AI/skyvern`：行业优先：浏览器执行；最近 0 天有推送；跨 3 个来源命中；本地快照新增 Stars 13。
- `wuyoscar/GPT-Image2-Skill`：行业优先：生成式图像模型；本地快照新增 Stars 26；跨 2 个来源命中。
- `browser-use/browser-harness`：行业优先：浏览器执行；本地快照新增 Stars 33；最近 5 天有推送；跨 2 个来源命中。
- `feder-cr/invisible_dots`：行业优先：浏览器执行；最近 5 天有推送；跨 2 个来源命中。
- `Anil-matcha/Open-Generative-AI`：行业优先：生成式图像模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送。
- `dgtlmoon/changedetection.io`：行业优先：网页采集与检索；最近 0 天有推送。
- `hitcslj/3DGen4Robot`：最近 6 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `Comfy-Org/ComfyUI`：最近 0 天有推送；跨 3 个来源命中；本地快照新增 Stars 261。
- `NousResearch/hermes-agent`：最近 0 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 488。
- `hugohe3/ppt-master`：最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 614。
- `deepseek-ai/deepseek-harness`：最近 0 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 1143。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `openai/codex`：最近 0 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 773。
- `anthropics/claude-code`：最近 0 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 143。
- `openai/MultiLangBench`：AI 日报/周报强制候选；跨 2 个来源命中。
- `deepseek-ai/deepseek-recipe`：AI 日报/周报强制候选。
- `Factory-AI/droid-sdk-typescript`：AI 日报/周报强制候选；本地快照新增 Stars 1。
- `Fantasy-AMAP/TriFold`：AI 日报/周报强制候选。
- `herdrdev/herdr-app`：AI 日报/周报强制候选；本地快照新增 Stars 877。
- `herdrdev/herdr-core`：AI 日报/周报强制候选；本地快照新增 Stars 129。
- `inclusionAI/Zooming-without-Zooming-v2`：AI 日报/周报强制候选；本地快照新增 Stars 1。
- `ku-autoai/MAGE`：AI 日报/周报强制候选。
- `pengpeng-yu/CodecSplat`：AI 日报/周报强制候选。
- `RUCAIBox/Agentic-ImageGen-Wild`：AI 日报/周报强制候选。
- `Tencent-Hunyuan/Hy-Nomas`：AI 日报/周报强制候选；本地快照新增 Stars 35。
- `VAST-AI-Research/EdenLive`：AI 日报/周报强制候选。
- `X-EraAI/e05`：AI 日报/周报强制候选；本地快照新增 Stars 6。
- `deepseek-ai/DeepInfer`：AI 日报/周报强制候选。
- `gaojh0333/PanoGraphGS`：AI 日报/周报强制候选。
- `simonw/battledrones`：AI 日报/周报强制候选。
- `XingChen-AGI/Xing4.0-29B-Intent`：AI 日报/周报强制候选。

## candidate-decisions 处理

- `ai-cad-workflows`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `alibaba-damo-rynnworld-teleop`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `anthropics-claude-code`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `copilot-cloud-agent`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `cosmos-coalition`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `genebench-v1`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `kinfey-multi-agents`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `nous-hermes-agent`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-codex-security-plugin`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-gpt-red-assets`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-multi-agent-beta`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `programmatic-tool-calling`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `runway-agent-2`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `the-kotlin-benchmark`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `thinking-machines-tinker-cookbook`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `xai-org-grok-build`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。

## 未解析 AI 候选

- deepseek-ai/deepseek-recipe \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- inclusionAI/Ming-3.0-tts \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- inclusionAI/Ming-3.0-audio-flash \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- inclusionAI/Ming-3.0-asr \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- nvidia/Cosmos \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- NVIDIA/kumo-engine \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- NVIDIA/auto-ontology \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- openai/php2shell-checker \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- jinlabneurogenomics/distributed_agent \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- NVIDIA-NeMo/Automodel \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- NVIDIA-NeMo/RL \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- menufactory43/panache \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- agentskills/agentskills \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- datasette/datasette-mcp \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- MoonshotAI/kimi-code \| pending \| repo URL 待核验 \| 日报提及工程对象；仓库 URL 待核验，未根据名称拼接地址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- MiniMax M3.1 Flash 权重 / 运行代码 \| pending \| repo URL 待核验 \| API 发布已核验；权重开放时间与仓库未确认，不把预告当已开源。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Tenstorrent 推理软件栈 \| pending \| repo URL 待核验 \| 融资公告涉及软件栈，但原始仓库 URL 待核验。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- NVIDIA FOX 工厂智能体蓝图 \| pending \| repo URL 待核验 \| 早期访问受申请审批；尚未确认稳定代码仓库 URL。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- NVIDIA cuDSS 示例 / 接口 \| pending \| repo URL 待核验 \| 工程库正式可用不等于开源；示例仓库及许可待核验。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Kimi K3.1 Pro 权重 / 三维与 CAD 运行资产 \| pending \| repo URL 待核验 \| 产品与 API 上线已核验；完整权重计划 11 月 4 日发布，仓库与许可待核验。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Quick Study 画笔工具代码 \| pending \| repo URL 待核验 \| 作者成品及生成会话可回查，独立仓库 URL 尚未确认。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Redmine Agent MCP / 插件代码 \| pending \| repo URL 待核验 \| 官方插件目录未给代码仓库；商业产品的 MCP 功能不代表已开源，URL 待核验。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [lsdefine/GenericAgent](https://github.com/lsdefine/GenericAgent)：可访问；行业优先：浏览器执行；最近 3 天有推送；跨 2 个来源命中。
- [AcademySoftwareFoundation/OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO)：可访问；行业优先：视频生成 / 自动剪辑；最近 5 天有推送；跨 2 个来源命中。
- [allenai/molmospaces](https://github.com/allenai/molmospaces)：可访问；行业优先：WAIC 物理 AI、机器人仿真 / Sim2Real、机器人学习 / 控制；最近 2 天有推送；跨 2 个来源命中。
- [compas-dev/compas](https://github.com/compas-dev/compas)：可访问；行业优先：建筑设计 / AEC；最近 5 天有推送；跨 2 个来源命中。
- [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)：可访问；行业优先：建筑设计 / AEC、AI 设计工具；最近 5 天有推送；跨 2 个来源命中；本地快照新增 Stars 1303。

## 落盘边界

- 正式跟踪项目 273 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。

