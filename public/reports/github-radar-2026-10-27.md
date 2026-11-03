# GitHub Radar 2026-10-27

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：1657 条原始观察，385 个候选，10 个 surging，21 个 hot。
- 核验范围：全部 10 个 surging、全部 21 个 hot、全部 22 个 AI 强制候选；正式跟踪项目按每日策略选择 46 项（刷新 25、复用 21），库存总数 262，未做全量刷新；另核验 5 个 watch 轮换样本。
- 核验覆盖：51/51 个强制仓库可访问；README 51，提交 51，Issue 51，PR 51，Releases 51。
- 核验模式：`official-github-pages-fallback`。
- AI 日报：2026-10-27 / success；最新已完成周报：2026-10-25T23:54:02.248Z / success。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-trending-weekly-all | success | 15 | 1 |  |
| github-trending-24h-all | success | 14 | 1 |  |
| github-trending-24h-python | success | 16 | 1 |  |
| github-trending-24h-typescript | success | 18 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| ossinsight-weekly-all | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-python | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-typescript | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 1 | 1 |  |
| ossinsight-24h-all | failed | 0 | 1 | The operation was aborted due to timeout |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 50 | 1 |  |
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
- 可选 OSS Insight 来源提示：ossinsight-weekly-all / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-python / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-typescript / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-all / failed；The operation was aborted due to timeout。官方来源与必核证据通过时不阻断发布。

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | surging | 89,269 / 9,848 | 2026-10-26 | v0.5.7 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 74,367 / 13,035 | 2026-10-23 | v2026.10.4 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | surging | 65,586 / 5,697 | 2026-10-27 | v3.30.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 103,602 / 9,188 | 2026-10-25 | v1.6.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 20,917 / 560 | 2026-10-26 | v1.1.19 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | surging | 19,779 / 1,098 | 2026-10-26 | v2.1.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [hi3d-official/Hi3Dv1.0](https://github.com/hi3d-official/Hi3Dv1.0) | surging | 463 / 39 | 2026-10-23 | v1.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | surging | 60,429 / 11,789 | 2026-10-26 | v0.2.1 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | surging | 43,882 / 5,544 | 2026-10-18 | v1.6.15 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [outcrawlai/scout](https://github.com/outcrawlai/scout) | surging | 940 / 32 | 2026-10-21 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [jackwener/OpenCLI](https://github.com/jackwener/OpenCLI) | hot | 30,674 / 3,005 | 2026-10-26 | v2.0.2 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：将网页交互抽象为 Agent 可组合 CLI，是浏览器执行层近期高关注方向，按 A 级跟踪。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 119,219 / 13,260 | 2026-10-26 | 0.13.14 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25,828 / 1,784 | 2026-10-26 | stagehand-server-v3/v3.7.7 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：把确定性浏览器控制与 Agent 语义操作结合，是 Firecrawl 关联生态的重要执行层，按 A 级跟踪。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 195,690 / 10,329 | 2026-10-26 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 32,517 / 2,696 | 2026-10-25 | chromium-v155.0.8059.39.1-pro | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | hot | 12,166 / 933 | 2026-10-21 | Cosmos3 | OpenMDW-1.1; linked components separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。 |
| [jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser) | hot | 11,986 / 1,209 | 2026-10-05 | v1.18.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [cporter202/API-mega-list](https://github.com/cporter202/API-mega-list) | hot | 8,221 / 1,599 | 2026-10-20 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [playcanvas/supersplat](https://github.com/playcanvas/supersplat) | hot | 10,472 / 1,197 | 2026-10-26 | v3.7.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：PlayCanvas 官方原创编辑器，产品完成度和近期维护状态均较好。 |
| [NVlabs/Sana](https://github.com/NVlabs/Sana) | hot | 9,662 / 778 | 2026-10-23 | streamrender-h3-examples-v1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：NVIDIA 官方原创图像、视频和世界模型实现，公开推理代码与Apache-2.0明确，近期持续维护；直接符合设计素材、视频和空间模型方向。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26,269 / 1,730 | 2026-10-25 | v4.0.0-rc.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 89,880 / 9,291 | 2026-10-26 | v0.5 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：在传统爬虫与 AI 数据采集之间形成清晰产品能力，且关注度和工程完整性突出，按 A 级跟踪。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 38,215 / 9,915 | 2026-10-27 | v0.5.22 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 86,325 / 8,977 | 2026-10-26 | v0.9.5 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：开源、自托管和 LLM 友好能力突出，是 Firecrawl 之外重要的技术路线，按 A 级正式跟踪。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 37,016 / 1,791 | 2026-10-26 | 1.0.2 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。 |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | hot | 23,281 / 2,221 | 2026-10-26 | v1.0.56 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。 |
| [browser-use/browser-harness](https://github.com/browser-use/browser-harness) | hot | 18,637 / 1,846 | 2026-10-25 | v0.1.13 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [sparkjsdev/spark](https://github.com/sparkjsdev/spark) | hot | 3,812 / 574 | 2026-10-20 | v2.4.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：由 World Labs 团队推动的原创渲染项目，仓库活跃且使用路径清晰。 |
| [hitcslj/3DGen4Robot](https://github.com/hitcslj/3DGen4Robot) | hot / AI 强制 | 65 / 1 | 2026-10-24 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | hot | 143,264 / 16,920 | 2026-10-27 | v0.42.1 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 257,403 / 56,401 | 2026-10-26 | v0.22.5 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [rxjfighting/SceneMosaic](https://github.com/rxjfighting/SceneMosaic) | watch / AI 强制 | 53 / 1 | 2026-09-03 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：直接连接室内空间生成、仿真数据和具身智能训练，是 3D 智能空间与物理 AI 的关键上游能力，按 A 级正式跟踪。 |
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | watch / AI 强制 | 262,548 / 31,737 | 2026-10-23 | dsh-v0.2.1-rc.3 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：该项目由 AI 当日二次审计触发，直接命中编码智能体、可组合 Agent 运行时与沙箱基础设施方向；官方关系、原创实现、可运行性与行业影响均通过门槛，按 A 级正式跟踪。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | NOASSERTION (README claims MIT; root LICENSE unverified) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 131,024 / 20,691 | 2026-10-27 | rust-v0.165.0-alpha.3 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 153,474 / 26,047 | 2026-10-26 | v2.1.311 | Anthropic Commercial Terms | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：人工 approved 保留；当前 v2.1.311，官方产品分发、插件及示例可核验，商业 LICENSE 不表示完整核心开源。 |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI 强制 | 0 / 0 | 2026-10-09 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [openai/MultiLangBench](https://github.com/openai/MultiLangBench) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold) | watch / AI 强制 | 0 / 0 | 2026-10-15 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ku-autoai/MAGE](https://github.com/ku-autoai/MAGE) | watch / AI 强制 | 0 / 0 | 2026-10-16 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [mchaewon/CompMVR](https://github.com/mchaewon/CompMVR) | watch / AI 强制 | 0 / 0 | 2026-10-26 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [openai/math](https://github.com/openai/math) | watch / AI 强制 | 0 / 0 | 2026-10-26 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat) | watch / AI 强制 | 0 / 0 | 2026-08-25 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ranrhuang/PixGR](https://github.com/ranrhuang/PixGR) | watch / AI 强制 | 0 / 0 | 2026-10-26 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild) | watch / AI 强制 | 0 / 0 | 2026-10-23 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [deepseek-ai/DeepInfer](https://github.com/deepseek-ai/DeepInfer) | watch / AI 强制 | 0 / 0 | 2026-10-25 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [gaojh0333/PanoGraphGS](https://github.com/gaojh0333/PanoGraphGS) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [simonw/battledrones](https://github.com/simonw/battledrones) | watch / AI 强制 | 0 / 0 | 2026-10-24 | v14 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [XingChen-AGI/Xing4.0-29B-Intent](https://github.com/XingChen-AGI/Xing4.0-29B-Intent) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |

## 候选入选原因

- `debpalash/VoiceStudio`：行业优先：最新开放模型；GitHub Trending 当日新增关注 2297；本地快照新增 Stars 48；最近 1 天有推送。
- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 533；最近 4 天有推送；跨 3 个来源命中。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；GitHub Trending 当日新增关注 152；最近 0 天有推送；跨 3 个来源命中。
- `Panniantong/Agent-Reach`：行业优先：网页采集与检索；GitHub Trending 当日新增关注 746；本地快照新增 Stars 35；最近 2 天有推送。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 231；最近 1 天有推送；跨 2 个来源命中。
- `citrolabs/ego-lite`：行业优先：浏览器执行；本地快照新增 Stars 280；最近 1 天有推送；跨 2 个来源命中。
- `hi3d-official/Hi3Dv1.0`：行业优先：3D / 三维生成、最新开放模型；本地快照新增 Stars 146；新仓库 11 天；最近 4 天有推送。
- `bilawalsidhu/gods-eye-view`：行业优先：3D / 三维生成；本地快照新增 Stars 348；最近 1 天有推送。
- `HKUDS/DeepTutor`：行业优先：深度研究；本地快照新增 Stars 1110；最近 1 天有推送。
- `outcrawlai/scout`：行业优先：浏览器执行；新仓库 14 天；最近 6 天有推送。
- `jackwener/OpenCLI`：行业优先：浏览器执行；最近 1 天有推送；跨 6 个来源命中。
- `browser-use/browser-use`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `firecrawl/firecrawl`：行业优先：网页采集与检索；最近 1 天有推送；跨 4 个来源命中。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 1；最近 2 天有推送；跨 3 个来源命中。
- `NVIDIA/cosmos`：行业优先：3D / 三维生成、WAIC 物理 AI；最近 6 天有推送；跨 3 个来源命中；本地快照新增 Stars 74。
- `jo-inc/camofox-browser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 30；最近 4 天有推送；跨 3 个来源命中。
- `cporter202/API-mega-list`：行业优先：网页采集与检索；本地快照新增 Stars 23；最近 7 天有推送；跨 3 个来源命中。
- `playcanvas/supersplat`：行业优先：3DGS / Gaussian Splatting、3D / 三维生成；最近 1 天有推送；跨 3 个来源命中；本地快照新增 Stars 39。
- `NVlabs/Sana`：行业优先：3D / 三维生成、生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 4 天有推送；跨 3 个来源命中。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `unclecode/crawl4ai`：行业优先：网页采集与检索；最近 1 天有推送；跨 3 个来源命中。
- `lightpanda-io/browser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `Skyvern-AI/skyvern`：行业优先：浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `browser-use/browser-harness`：行业优先：浏览器执行；本地快照新增 Stars 22；最近 2 天有推送；跨 2 个来源命中。
- `sparkjsdev/spark`：行业优先：3DGS / Gaussian Splatting；最近 7 天有推送；跨 2 个来源命中；本地快照新增 Stars 29。
- `hitcslj/3DGen4Robot`：最近 3 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `Comfy-Org/ComfyUI`：最近 1 天有推送；跨 4 个来源命中。
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `rxjfighting/SceneMosaic`：行业优先：3D / 三维生成、物理一致 / SimReady、WAIC 物理 AI；AI 日报/周报强制候选；跨 4 个来源命中。
- `deepseek-ai/deepseek-harness`：最近 4 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `openai/codex`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `anthropics/claude-code`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `fyting/ArtifactWorld`：AI 日报/周报强制候选；跨 2 个来源命中。
- `openai/MultiLangBench`：AI 日报/周报强制候选；跨 2 个来源命中。
- `deepseek-ai/deepseek-recipe`：AI 日报/周报强制候选。
- `Fantasy-AMAP/TriFold`：AI 日报/周报强制候选。
- `ku-autoai/MAGE`：AI 日报/周报强制候选。
- `mchaewon/CompMVR`：AI 日报/周报强制候选。
- `openai/math`：AI 日报/周报强制候选。
- `pengpeng-yu/CodecSplat`：AI 日报/周报强制候选。
- `ranrhuang/PixGR`：AI 日报/周报强制候选。
- `RUCAIBox/Agentic-ImageGen-Wild`：AI 日报/周报强制候选。
- `VAST-AI-Research/EdenLive`：AI 日报/周报强制候选。
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

- 媒体提及Claude人员变动、审稿研究与硬件发布待原始核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- Strawberry融资的首发日期与本次事件性质待核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
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
- GitHub Copilot cloud agent（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- Edit4D 官方代码（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- MiniMax M3.1 Flash 官方权重（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- Tenstorrent 官方软件栈（ai-daily-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots)：可访问；行业优先：浏览器执行；最近 2 天有推送；跨 2 个来源命中；超过每日热门复核上限，进入轮换观察。
- [lsdefine/GenericAgent](https://github.com/lsdefine/GenericAgent)：可访问；行业优先：浏览器执行；最近 5 天有推送；跨 2 个来源命中。
- [BrokenSource/DepthFlow](https://github.com/BrokenSource/DepthFlow)：可访问；行业优先：3D / 三维生成；最近 5 天有推送；跨 2 个来源命中。
- [compas-dev/compas](https://github.com/compas-dev/compas)：可访问；行业优先：建筑设计 / AEC；最近 2 天有推送；跨 2 个来源命中。
- [earthtojake/text-to-cad](https://github.com/earthtojake/text-to-cad)：可访问；行业优先：建筑设计 / AEC、AI 设计工具；最近 2 天有推送；跨 2 个来源命中。

## 落盘边界

- 正式跟踪项目 262 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。

