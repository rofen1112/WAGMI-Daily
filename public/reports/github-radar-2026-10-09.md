# GitHub Radar 2026-10-09

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：1624 条原始观察，372 个候选，7 个 surging，18 个 hot。
- 核验范围：全部 7 个 surging、前 12 个 hot、全部 15 个 AI 强制候选；正式跟踪项目按每日策略选择 45 项（刷新 27、复用 18），库存总数 260，未做全量刷新；另核验 5 个 watch 轮换样本。
- 核验覆盖：33/33 个强制仓库可访问；README 33，提交 33，Issue 33，PR 33，Releases 33。
- 核验模式：`official-github-pages-fallback`。
- AI 日报：2026-10-09 / success；最新已完成周报：2026-10-08T08:17:56.181Z / success。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-ai-active | success | 50 | 1 |  |
| github-trending-24h-all | success | 9 | 1 |  |
| github-trending-24h-python | success | 12 | 1 |  |
| github-trending-24h-typescript | success | 17 | 1 |  |
| github-trending-weekly-all | success | 11 | 1 |  |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 1 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 39 | 1 |  |
| github-open-model-new | success | 5 | 1 |  |
| github-image-generation-active | success | 50 | 1 |  |
| github-video-intelligence-active | success | 50 | 1 |  |
| github-video-generation-active | success | 50 | 1 |  |
| github-video-editing-active | success | 50 | 1 |  |
| github-video-3d-stage-active | success | 50 | 1 |  |
| github-video-2026-new | success | 50 | 1 |  |
| github-web-data-active | success | 50 | 1 |  |
| github-browser-automation-active | success | 50 | 2 |  |
| github-deep-research-active | success | 50 | 1 |  |
| github-document-processing-active | success | 50 | 1 |  |
| github-physical-ai-active | success | 50 | 1 |  |
| github-vla-robotics-active | success | 50 | 1 |  |
| github-robot-simulation-active | success | 50 | 1 |  |

24 小时主趋势：`ossinsight-24h-all` 上游因事件流数据质量不足为 **unavailable**；已使用官方 `github-trending-24h-all` 回退，状态 **success**，未伪造 OSS 活跃分数。

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 65,865 / 11,410 | 2026-10-08 | v2026.10.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。 |
| [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad) | surging | 18,466 / 1,833 | 2026-10-08 | v0.7.18 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：P0 CAD/设计自动化候选；精确仓库、原创性、可运行工作流、活跃维护和交付格式覆盖均已核验，综合质量达到 A。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 13,800 / 346 | 2026-10-08 | v1.1.15 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [feder-cr/invisible_playwright_mcp](https://github.com/feder-cr/invisible_playwright_mcp) | surging | 2,677 / 461 | 2026-10-08 | v0.70.13 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ItzCrazyKns/Vane](https://github.com/ItzCrazyKns/Vane) | surging | 37,157 / 4,125 | 2026-09-01 | v1.12.2 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 94,119 / 8,232 | 2026-10-07 | v1.5.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [CursorTouch/Windows-MCP](https://github.com/CursorTouch/Windows-MCP) | surging | 8,313 / 923 | 2026-10-08 | v0.8.7 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25,579 / 1,754 | 2026-10-08 | stagehand-server-v3/v3.7.6 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：把确定性浏览器控制与 Agent 语义操作结合，是 Firecrawl 关联生态的重要执行层，按 A 级跟踪。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 189,616 / 10,059 | 2026-10-08 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。 |
| [LiteReality/LiteReality-Agent](https://github.com/LiteReality/LiteReality-Agent) | hot / AI 强制 | 583 / 54 | 2026-10-03 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：官方项目、论文和可运行工具链相互对应，直接覆盖室内设计、真实扫描与仿真资产主线。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 31,976 / 2,654 | 2026-10-08 | chromium-v154.0.8037.57.1-pro | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26,076 / 1,695 | 2026-10-08 | v4.0.0-rc.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 86,372 / 8,858 | 2026-10-08 | v0.4.15 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：在传统爬虫与 AI 数据采集之间形成清晰产品能力，且关注度和工程完整性突出，按 A 级跟踪。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 36,891 / 9,382 | 2026-10-08 | v0.5.21 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | hot | 63,766 / 5,561 | 2026-10-08 | v3.27.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 117,318 / 12,982 | 2026-10-07 | 0.13.11 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 36,135 / 1,708 | 2026-10-08 | 1.0.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。 |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | hot | 23,159 / 2,190 | 2026-10-08 | v1.0.55 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。 |
| [feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots) | hot | 31,876 / 4,702 | 2026-10-08 | golden-b326f2a1d4fe | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [rxjfighting/SceneMosaic](https://github.com/rxjfighting/SceneMosaic) | watch / AI 强制 | 48 / 0 | 2026-09-03 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：直接连接室内空间生成、仿真数据和具身智能训练，是 3D 智能空间与物理 AI 的关键上游能力，按 A 级正式跟踪。 |
| [anthonytao80-crypto/ForeAct3D](https://github.com/anthonytao80-crypto/ForeAct3D) | watch / AI 强制 | 1 / 0 | 2026-10-02 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：论文明确引用该作者仓库，MIT 与原创研究可确认；复现资料尚需持续复核，作为高优先级研究观察。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 252,032 / 54,381 | 2026-10-08 | v0.21.6 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Existing approved project retained from the formal tracked inventory. |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 128,207 / 20,115 | 2026-10-08 | rust-v0.162.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [openclaw/openclaw](https://github.com/openclaw/openclaw) | watch / AI 强制 | 391,475 / 82,297 | 2026-10-08 | v2026.9.9 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：同日 AI 强制候选；官方关系、原创实现、可安装性、持续发布和维护活跃度充分，综合质量达到 A。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [Tencent-Hunyuan/Prism](https://github.com/Tencent-Hunyuan/Prism) | watch / AI 强制 | 79 / 7 | 2026-10-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：作者论文、腾讯混元官方代码和模型卡相互链接，原创研究方向明确；先进入观察库存，不宣称生产成熟。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 149,715 / 25,766 | 2026-10-08 | v2.1.295 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Existing approved project retained from the formal tracked inventory. |
| [deivse/ivd_splat](https://github.com/deivse/ivd_splat) | watch / AI 强制 | 0 / 0 | 2026-10-04 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI 强制 | 0 / 0 | 2026-10-08 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [BootLoops-ai/bootloops](https://github.com/BootLoops-ai/bootloops) | watch / AI 强制 | 0 / 0 | 2026-10-01 | v1.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [facebookincubator/muse-gadget-sdk](https://github.com/facebookincubator/muse-gadget-sdk) | watch / AI 强制 | 0 / 0 | 2026-10-08 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [kanehub/DIBR-GS](https://github.com/kanehub/DIBR-GS) | watch / AI 强制 | 0 / 0 | 2026-05-29 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [NVIDIA/OpenShell](https://github.com/NVIDIA/OpenShell) | watch / AI 强制 | 0 / 0 | 2026-10-08 | dev | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |

## 候选入选原因

- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 186；最近 1 天有推送；跨 3 个来源命中。
- `earthtojake/text-to-cad`：行业优先：建筑设计 / AEC、AI 设计工具；GitHub Trending 当日新增关注 162；最近 1 天有推送；跨 4 个来源命中；本地快照新增 Stars 138。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 782；最近 1 天有推送；跨 2 个来源命中。
- `feder-cr/invisible_playwright_mcp`：行业优先：网页采集与检索、浏览器执行；新仓库 10 天；最近 1 天有推送；跨 2 个来源命中。
- `ItzCrazyKns/Vane`：行业优先：网页采集与检索；GitHub Trending 当日新增关注 51；跨 2 个来源命中。
- `Panniantong/Agent-Reach`：行业优先：网页采集与检索；本地快照新增 Stars 481；最近 1 天有推送；跨 2 个来源命中。
- `CursorTouch/Windows-MCP`：行业优先：浏览器执行；GitHub Trending 当日新增关注 411。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中；本地快照新增 Stars 9。
- `firecrawl/firecrawl`：行业优先：网页采集与检索；最近 1 天有推送；跨 4 个来源命中。
- `LiteReality/LiteReality-Agent`：行业优先：室内设计、3D / 三维生成、物理一致 / SimReady、机器人仿真 / Sim2Real；最近 6 天有推送；AI 日报/周报强制候选；跨 4 个来源命中；本地快照新增 Stars 7。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 21。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 102。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 37。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 47；最近 1 天有推送；跨 2 个来源命中。
- `browser-use/browser-use`：行业优先：浏览器执行；最近 2 天有推送；跨 3 个来源命中。
- `lightpanda-io/browser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 22。
- `Skyvern-AI/skyvern`：行业优先：浏览器执行；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 4。
- `feder-cr/invisible_dots`：行业优先：浏览器执行；最近 1 天有推送；跨 2 个来源命中。
- `rxjfighting/SceneMosaic`：行业优先：3D / 三维生成、物理一致 / SimReady、WAIC 物理 AI；AI 日报/周报强制候选；跨 4 个来源命中；本地快照新增 Stars 3。
- `anthonytao80-crypto/ForeAct3D`：行业优先：WAIC 物理 AI、机器人学习 / 控制；最近 7 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `openai/codex`：最近 1 天有推送；AI 日报/周报强制候选；跨 4 个来源命中。
- `openclaw/openclaw`：最近 5 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 644。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `Tencent-Hunyuan/Prism`：最近 3 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 4。
- `anthropics/claude-code`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `deivse/ivd_splat`：AI 日报/周报强制候选；跨 2 个来源命中。
- `fyting/ArtifactWorld`：AI 日报/周报强制候选；跨 2 个来源命中。
- `BootLoops-ai/bootloops`：AI 日报/周报强制候选。
- `facebookincubator/muse-gadget-sdk`：AI 日报/周报强制候选。
- `kanehub/DIBR-GS`：AI 日报/周报强制候选。
- `NVIDIA/OpenShell`：AI 日报/周报强制候选。

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

- Vidu Q4 Preview（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- GitHub Copilot cloud agent（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai)：可访问；行业优先：网页采集与检索；跨 3 个来源命中。
- [datawhalechina/every-embodied](https://github.com/datawhalechina/every-embodied)：可访问；行业优先：WAIC 物理 AI；最近 1 天有推送；跨 2 个来源命中。
- [firecrawl/pdf-inspector](https://github.com/firecrawl/pdf-inspector)：可访问；行业优先：网页采集与检索、文档解析与转换；跨 3 个来源命中。
- [hiyouga/LlamaFactory](https://github.com/hiyouga/LlamaFactory)：可访问；行业优先：最新开放模型；跨 3 个来源命中。
- [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs)：可访问；行业优先：3D / 三维生成；跨 3 个来源命中。

## 落盘边界

- 正式跟踪项目 260 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。
