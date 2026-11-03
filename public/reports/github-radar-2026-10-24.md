# GitHub Radar 2026-10-24

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：1639 条原始观察，381 个候选，9 个 surging，21 个 hot。
- 核验范围：全部 9 个 surging、全部 21 个 hot、全部 19 个 AI 强制候选；正式跟踪项目按每日策略选择 46 项（刷新 46、复用 0），库存总数 262，未做全量刷新；另核验 5 个 watch 轮换样本。
- 核验覆盖：48/48 个强制仓库可访问；README 48，提交 48，Issue 48，PR 48，Releases 48。
- 核验模式：`official-github-pages-fallback`。
- AI 日报：2026-10-24 / success；最新已完成周报：2026-10-18T23:57:37.509Z / success。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-trending-24h-all | success | 8 | 1 |  |
| github-trending-24h-python | success | 12 | 1 |  |
| github-trending-weekly-all | success | 15 | 1 |  |
| github-trending-24h-typescript | success | 17 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| ossinsight-24h-all | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-weekly-all | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-typescript | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 2 | 1 |  |
| ossinsight-24h-python | failed | 0 | 1 | The operation was aborted due to timeout |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 48 | 1 |  |
| github-open-model-new | success | 4 | 1 |  |
| github-image-generation-active | success | 50 | 1 |  |
| github-video-intelligence-active | success | 50 | 1 |  |
| github-video-generation-active | success | 50 | 1 |  |
| github-video-editing-active | success | 50 | 1 |  |
| github-video-3d-stage-active | success | 50 | 1 |  |
| github-video-2026-new | success | 50 | 1 |  |
| github-web-data-active | success | 50 | 1 |  |
| github-browser-automation-active | success | 50 | 1 |  |
| github-deep-research-active | success | 50 | 1 |  |
| github-document-processing-active | success | 50 | 1 |  |
| github-physical-ai-active | success | 50 | 1 |  |
| github-vla-robotics-active | success | 50 | 1 |  |
| github-robot-simulation-active | success | 50 | 1 |  |

主趋势 `github-trending-24h-all`：**success**。
- 可选 OSS Insight 来源提示：ossinsight-24h-all / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-weekly-all / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-typescript / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-python / failed；The operation was aborted due to timeout。官方来源与必核证据通过时不阻断发布。

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | surging | 194679 / 10273 | 2026-10-23 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留原创网页读取与结构化数据基础设施；官方源码、安装、维护和发布可核验。AGPL-3.0覆盖代码，托管服务与自托管能力按各自文档配置，README覆盖率和延迟为作者测试，未复测。 |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 72809 / 12788 | 2026-10-23 | v2026.10.4 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：仍以542课教学路径、实验和项目挑战为主体；当日文档及实现维护已核实，但未发现足以重开原创产品/研究库存拒绝判断的新证据。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 20317 / 544 | 2026-10-23 | v1.1.19 | Apache-2.0 OR MIT; third-party notices separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：原创 Rust Agent 浏览器运行时，DOM、解析、布局、V8与多协议模块均可见；README明确不追求Chrome像素、Canvas/WebGL与媒体高保真，性能数据为作者测试。本日核实双许可正文，不能只沿用API单项Apache标识。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | surging | 19018 / 1055 | 2026-10-19 | v2.1.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：Agent与人共享浏览器、隔离Spaces及插件集成可核验；保留观察，产品集成代码不等同完整浏览器核心，速度和Token节约未复测。 |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | surging | 83337 / 9194 | 2026-10-24 | v0.5.7-beta.2 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：当日官方仓库、README、目录与维护证据已记录；尚未确认足以批准的新原创实现，继续观察。 |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | surging | 59364 / 11571 | 2026-10-24 | v0.2.1 | MIT source; third-party data/assets separately licensed | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：原创三维地理空间客户端与数据集成，源码MIT；当日LICENSE明确数据与模型不随源码授权：海缆数据CC-BY-NC-SA、部分灾害素材CC-BY-NC，实时地图/航空等另遵循提供方条款。README自称探索学习客户端，不能当作已加固生产服务。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 101342 / 8935 | 2026-10-23 | v1.6.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：当日官方仓库、README、目录与维护证据已记录；尚未确认足以批准的新原创实现，继续观察。 |
| [outcrawlai/scout](https://github.com/outcrawlai/scout) | surging | 942 / 31 | 2026-10-21 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：发布者声明自动镜像其官方源仓库，含浏览器Agent、SDK与本地/云浏览器路径；保留批准，原始实现不因镜像分发直接排除。Node22+，云端需要服务和模型密钥，反检测与任务成功率未复测。 |
| [vllm-project/vllm](https://github.com/vllm-project/vllm) | surging | 95248 / 23861 | 2026-10-24 | v0.32.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [jackwener/OpenCLI](https://github.com/jackwener/OpenCLI) | hot | 30593 / 2995 | 2026-10-23 | v2.0.2 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 118982 / 13215 | 2026-10-22 | 0.13.13 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25791 / 1778 | 2026-10-23 | stagehand-server-v3/v3.7.7 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 32443 / 2690 | 2026-10-23 | chromium-v155.0.8059.39.1-pro | MIT wrapper; browser binary terms separate (当日许可正文已留档；细分条款按原文) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：当日官方仓库、README、目录与维护证据已记录；尚未确认足以批准的新原创实现，继续观察。 |
| [cporter202/API-mega-list](https://github.com/cporter202/API-mega-list) | hot | 8151 / 1581 | 2026-10-20 | 已检查 Releases，无 tag | NOASSERTION (未核实根许可证) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：仍为API目录与赞助条目集合，累计Stars和当日活跃不能替代原创可运行产品或研究实现，维持拒绝。 |
| [jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser) | hot | 11878 / 1194 | 2026-10-05 | v1.18.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：基于Camoufox的Agent浏览器服务，安装与接口代码可见；继承第三方浏览器栈，独立扩展与集成价值保留跟踪，反检测效果未复测。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | hot | 65213 / 5657 | 2026-10-23 | v3.30.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：原创多来源近期研究Skill与检索编排，当前安装和发布可核验；质量依赖外部检索覆盖，热度、投票或交易信号不自动证明结论可靠，保留工程跟踪。 |
| [NVlabs/Sana](https://github.com/NVlabs/Sana) | hot | 9629 / 776 | 2026-10-23 | streamrender-h3-examples-v1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26237 / 1724 | 2026-10-23 | v4.0.0-rc.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 89348 / 9216 | 2026-10-22 | v0.5 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 37674 / 9838 | 2026-10-24 | v0.5.22 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 86114 / 8952 | 2026-10-20 | v0.9.5 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 36915 / 1786 | 2026-10-23 | 1.0.2 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。 |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | hot | 23255 / 2209 | 2026-10-24 | v1.0.56 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。 |
| [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) | hot | 5860 / 470 | 2026-09-30 | v0.2.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：提示词画廊、CLI 与 Agent Skill 可用，但主体偏提示词/API 工作流，原创技术深度继续观察。 |
| [amontlabs/lcu](https://github.com/amontlabs/lcu) | hot | 2179 / 141 | 2026-10-23 | v0.12.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [CopilotKit/OpenBot](https://github.com/CopilotKit/OpenBot) | hot | 7006 / 955 | 2026-10-24 | v0.2.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots) | hot | 32229 / 4731 | 2026-10-15 | golden-ce0e2cde6174 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | hot | 31352 / 5804 | 2026-10-22 | v2.0.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：仍是第三方模型 API 聚合前端；没有足以重开既有拒绝判断的新原创证据。 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | hot | 142345 / 16785 | 2026-10-24 | v0.42.1 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 256525 / 56074 | 2026-10-23 | v0.22.5 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [InRobots/MoonBlender](https://github.com/InRobots/MoonBlender) | watch / AI 强制 | 2 / 1 | 2025-10-09 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：核实存在MoonGS训练、评测、几何与COLMAP输入推理实现，不能沿用早期无代码或完全不相关的判断；当前README安装仍指向xiaoc57/MoonGS，根许可缺失，语义组件/启发式重采样仍TODO，Missing Modules问题开放且最近提交2025-10-09，保留观察。 |
| [rxjfighting/SceneMosaic](https://github.com/rxjfighting/SceneMosaic) | watch / AI 强制 | 52 / 0 | 2026-09-03 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创室内图像到可编辑仿真场景管线，保留批准；须单独获取SAM3/SAM3D等受限模型权限并配置Linux与显存环境，根MIT不能替代模型条款。本日只核验源码和指引，未复现场景。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 130653 / 20610 | 2026-10-23 | rust-v0.164.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | watch / AI 强制 | 259428 / 31326 | 2026-10-23 | dsh-v0.2.1-rc.3 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：DeepSeek官方可组合Agent Harness，源码、安装、插件与release可核验；仍为开发预览。Pulls集合API404真实保留，以当日官方Pulls页HTTP200补足字段；没有把API404视为仓库消失。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：遵循人工approved保留云原生多Agent示例；README声称MIT但当前根目录没有对应LICENSE，不能继续写为已核实MIT。代码示例与部署结构可访问，服务密钥和Azure环境另配。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 153170 / 26654 | 2026-10-23 | v2.1.310 | Anthropic Commercial Terms | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：遵循人工approved保留Anthropic官方产品分发、插件与示例；当前安装和release可核验，LICENSE为商业条款，不能把仓库存在解读为完整核心开源。 |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI 强制 | 0 / 0 | 2026-10-09 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创3DGS伪影修复，两阶段推理、benchmark预处理与配置已公开；README仍说明训练代码和训练数据后续发布。模型入口本日HTTP200，代码Apache-2.0，底模与资产另计，未复测性能。 |
| [VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | Apache-2.0 code; model/component terms separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：VAST官方实时生成渲染实现，离线推理与实时服务、模型入口可核验；项目/模型页面本日HTTP200，引用视频仍由上游引擎提供。RTX5090帧率为作者报告，FLUX/DINO等组件条款单独适用。 |
| [deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：DeepSeek官方Rust库及Python绑定，负责协议转换、prompt编码与响应解析，MIT；README明确推理、HTTP与工具执行由调用方提供，不是完整推理后端。 |
| [Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold) | watch / AI 强制 | 0 / 0 | 2026-10-15 | 已检查 Releases，无 tag | NOASSERTION (未核实根许可证) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：三维高斯潜变量研究名称可确认，根目录仍只有README，无实现、安装或根许可证，保持观察。 |
| [ku-autoai/MAGE](https://github.com/ku-autoai/MAGE) | watch / AI 强制 | 0 / 0 | 2026-10-16 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：原创手册增强GUI Agent，规划、轨迹、训练与评测目录可核验，MIT；论文链接仍待补，当前README配套匿名模型/数据入口实测HTTP403。保留观察，源码访问不等同配套资产可取得。 |
| [MoonshotAI/kimi-code](https://github.com/MoonshotAI/kimi-code) | watch / AI 强制 | 0 / 0 | 2026-10-23 | @moonshot-ai/kimi-code@2.3.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：MoonshotAI官方TypeScript编码Agent，agent-core-v2、ACP、SDK、OAuth、CLI与IDE工程均可核验；MIT，当日稳定发布2.3.1。README运行安装不要求Node，源码开发需Node24.15+与pnpm10.33；登录/模型服务另配，未运行任务。 |
| [openai/MultiLangBench](https://github.com/openai/MultiLangBench) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：OpenAI官方SQLite3.40.1多语言编码评估与测试转换实现，Apache-2.0；默认采用272个测试子集，全量约24k测试须另注明，未执行评测。 |
| [pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat) | watch / AI 强制 | 0 / 0 | 2026-08-25 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创前馈3DGS潜特征熵编码研究，源码、配置与模型入口可核验，MIT；本日模型页HTTP200，Python3.10/PyTorch2.9.1依赖按文档配置，维护时间按当日提交证据记录，未复测压缩结果。 |
| [RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild) | watch / AI 强制 | 0 / 0 | 2026-10-23 | 已检查 Releases，无 tag | NOASSERTION (未核实根许可证) | 是 / 是 | 是 / 是 | 可访问；未归档；Fork | **拒绝**：本日新增完整论文/benchmark介绍与arXiv链接，但元数据仍fork=true，根目录只有README和展示asset，无可执行实现或根许可；记录新官方文档证据，仍不足以批准原创可用产品。 |
| [Fantasy-AMAP/LongForcing](https://github.com/Fantasy-AMAP/LongForcing) | watch / AI 强制 | 0 / 0 | 2026-10-14 | 已检查 Releases，无 tag | NOASSERTION (未核实根许可证) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：根目录仍只有README，世界模型研究名称可确认，代码、模型、安装与根许可未发布，保持观察。 |
| [greenvla/GreenWAM](https://github.com/greenvla/GreenWAM) | watch / AI 强制 | 0 / 0 | 2026-10-14 | 已检查 Releases，无 tag | OpenMDW-1.1; third-party notices retained | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：原创机器人世界模型与策略研究，当前代码与checkpoint说明可核验，基于Cosmos3 Edge；根许可证OpenMDW-1.1，外部权重/依赖单独配置，榜单为作者报告，保留观察。 |
| [sumuru789/DK-VLM](https://github.com/sumuru789/DK-VLM) | watch / AI 强制 | 0 / 0 | 2026-10-16 | 已检查 Releases，无 tag | MIT original contributions; VGGT-Omega noncommercial portions | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创几何注意力研究，推理评测和LoRA/几何分支权重入口可见；本日模型页HTTP200，底模需独立获取。MIT仅覆盖原创贡献，派生自VGGT-Omega的部分保留非商业研究限制。 |

## 候选入选原因

- `firecrawl/firecrawl`：行业优先：网页采集与检索；GitHub Trending 当日新增关注 430；最近 1 天有推送；跨 5 个来源命中。
- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 316；最近 1 天有推送；跨 3 个来源命中。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 185；最近 1 天有推送；跨 2 个来源命中。
- `citrolabs/ego-lite`：行业优先：浏览器执行；本地快照新增 Stars 214；最近 1 天有推送；跨 2 个来源命中。
- `debpalash/VoiceStudio`：行业优先：最新开放模型；本地快照新增 Stars 1510；最近 1 天有推送；跨 2 个来源命中。
- `bilawalsidhu/gods-eye-view`：行业优先：3D / 三维生成；本地快照新增 Stars 235；最近 1 天有推送。
- `Panniantong/Agent-Reach`：行业优先：网页采集与检索；本地快照新增 Stars 305；最近 1 天有推送。
- `outcrawlai/scout`：行业优先：浏览器执行；新仓库 11 天；最近 3 天有推送。
- `vllm-project/vllm`：GitHub Trending 当日新增关注 108；最近 1 天有推送；跨 3 个来源命中。
- `jackwener/OpenCLI`：行业优先：浏览器执行；最近 1 天有推送；跨 6 个来源命中。
- `browser-use/browser-use`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `cporter202/API-mega-list`：行业优先：网页采集与检索；本地快照新增 Stars 40；最近 4 天有推送；跨 3 个来源命中。
- `jo-inc/camofox-browser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 23；最近 1 天有推送；跨 3 个来源命中。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 77；最近 1 天有推送；跨 2 个来源命中。
- `NVlabs/Sana`：行业优先：3D / 三维生成、生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 2 天有推送；跨 3 个来源命中。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `unclecode/crawl4ai`：行业优先：网页采集与检索；最近 2 天有推送；跨 3 个来源命中。
- `lightpanda-io/browser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `Skyvern-AI/skyvern`：行业优先：浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `wuyoscar/GPT-Image2-Skill`：行业优先：生成式图像模型；本地快照新增 Stars 22；跨 2 个来源命中。
- `amontlabs/lcu`：行业优先：浏览器执行；本地快照新增 Stars 83；最近 1 天有推送。
- `CopilotKit/OpenBot`：行业优先：浏览器执行；本地快照新增 Stars 63；最近 1 天有推送。
- `feder-cr/invisible_dots`：行业优先：浏览器执行；最近 3 天有推送；跨 2 个来源命中。
- `Anil-matcha/Open-Generative-AI`：行业优先：生成式图像模型、视频生成模型、视频生成 / 自动剪辑；最近 2 天有推送。
- `Comfy-Org/ComfyUI`：最近 1 天有推送；跨 4 个来源命中。
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `InRobots/MoonBlender`：行业优先：3DGS / Gaussian Splatting、3D / 三维生成、WAIC 物理 AI；AI 日报/周报强制候选；跨 4 个来源命中。
- `rxjfighting/SceneMosaic`：行业优先：3D / 三维生成、物理一致 / SimReady、WAIC 物理 AI；AI 日报/周报强制候选；跨 4 个来源命中。
- `openai/codex`：最近 1 天有推送；AI 日报/周报强制候选；跨 4 个来源命中。
- `deepseek-ai/deepseek-harness`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `anthropics/claude-code`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `fyting/ArtifactWorld`：AI 日报/周报强制候选；跨 2 个来源命中。
- `VAST-AI-Research/EdenLive`：AI 日报/周报强制候选；跨 2 个来源命中。
- `deepseek-ai/deepseek-recipe`：AI 日报/周报强制候选。
- `Fantasy-AMAP/TriFold`：AI 日报/周报强制候选。
- `ku-autoai/MAGE`：AI 日报/周报强制候选。
- `MoonshotAI/kimi-code`：AI 日报/周报强制候选。
- `openai/MultiLangBench`：AI 日报/周报强制候选。
- `pengpeng-yu/CodecSplat`：AI 日报/周报强制候选。
- `RUCAIBox/Agentic-ImageGen-Wild`：AI 日报/周报强制候选。
- `Fantasy-AMAP/LongForcing`：AI 日报/周报强制候选。
- `greenvla/GreenWAM`：AI 日报/周报强制候选。
- `sumuru789/DK-VLM`：AI 日报/周报强制候选。

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

- NVIDIA 哈萨克斯坦算力与投资公告日期冲突待核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- Kimi K3.1 Pro 权重与原始运行仓库待开放核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- google/adk-python \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- google-research/geospatial-reasoning-benchmarks \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- paper-instruments/rubric \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- sgl-project/sglang \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- modelscope/ms-swift \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- vllm-project/vllm \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- deepseek-ai/deepseek-harness \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- deepseek-ai/deepseek-recipe \| pending \| repo URL 待核验 \| 日报提及工程对象；repo URL 待核验，未由名称拼接网址。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Anchor3DGS 代码 \| pending \| repo URL 待核验 \| 论文可核验，未发现明确官方仓库；repo URL 待核验。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Chirp Pong 代码 \| pending \| repo URL 待核验 \| 作者文章和试玩入口可核验，官方代码仓库未明确；repo URL 待核验。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Claude SDK OpenTelemetry 集成 \| pending \| repo URL 待核验 \| SDK 功能已确认；七种语言的实现仓库未逐个核验，repo URL 待核验。（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- GitHub Copilot cloud agent（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- Edit4D 官方代码（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- MiniMax M3.1 Flash 官方权重（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- Tenstorrent 官方软件栈（ai-daily-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline](https://github.com/AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline)：可访问；行业优先：3D / 三维生成、WAIC 物理 AI、机器人学习 / 控制；跨 2 个来源命中。
- [AgibotTech/EWMBench](https://github.com/AgibotTech/EWMBench)：可访问；行业优先：3D / 三维生成、物理一致 / SimReady、WAIC 物理 AI、机器人学习 / 控制；跨 2 个来源命中。
- [AgibotTech/genie_sim](https://github.com/AgibotTech/genie_sim)：可访问；行业优先：3D / 三维生成、WAIC 物理 AI；跨 2 个来源命中。
- [alibaba-damo-academy/RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop)：可访问；行业优先：3D / 三维生成、WAIC 物理 AI、机器人学习 / 控制；跨 2 个来源命中。
- [AndreeaDogaru/Gen3DSR](https://github.com/AndreeaDogaru/Gen3DSR)：可访问；行业优先：室内设计、3D / 三维生成；跨 2 个来源命中。

## 落盘边界

- 正式跟踪项目 262 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。


## 发布批次补充核验

- 全部48个强制候选与5个watch通过当前官方页面核验；保留既有原创性、许可与收录审校。
- 8个旧延后热门候选已额外通过GitHub连接器核验精确元数据，并读取README正文；记录见wagmi-github-supplement-2026-10-24.json。未安装或运行远程项目。
- ROCm/ROCm已官方重定向至归档legacy-rocm-build，保留历史身份及README指向TheRock说明；已确认的生命周期变化不构成采集失败。
- 官方Trending及23项活跃搜索均成功，OSS Insight四项真实异常保留为可选来源提示。

## 09:00独立二次复核

- 趋势重算：381个候选，9个surging、24个hot；4个官方趋势和23项活跃搜索成功。
- 全部51个强制候选与5个轮换样本官方仓库、README、提交、Issue、PR、Release入口复核通过；元数据dry-run刷新46项、失败0。
- 保留原审校和262项正式库存；changedetection.io和Scrapy继续观察。PPT Master刷新当天官方元数据。
- Pascal README明确Next托管预览不属于开源Editor发布；Elements原文为C#建筑元素与几何库，未当作今日新模型。
- OSS Insight异常仍为可选提示；证据见audit-0900-2026-10-24-github-evidence.json及-repo-delta.json。
