# GitHub Radar 2026-10-28

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：1653 条原始观察，387 个候选，15 个 surging，21 个 hot。
- 核验范围：全部 15 个 surging、全部 21 个 hot、全部 24 个 AI 强制候选；正式跟踪项目按每日策略选择 45 项（刷新 45、复用 0），库存总数 262，未做全量刷新；另核验 5 个 watch 轮换样本。
- 核验覆盖：58/58 个强制仓库可访问；README 58，提交 58，Issue 58，PR 58，Releases 58。
- 核验模式：`official-github-pages-fallback`。
- AI 日报：2026-10-28 / success；最新已完成周报：2026-10-25T23:54:02.248Z / success。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-trending-weekly-all | success | 13 | 1 |  |
| github-trending-24h-all | success | 11 | 1 |  |
| github-trending-24h-typescript | success | 18 | 1 |  |
| github-trending-24h-python | success | 15 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| ossinsight-weekly-all | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-typescript | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 1 | 1 |  |
| ossinsight-24h-all | failed | 0 | 1 | The operation was aborted due to timeout |
| ossinsight-24h-python | failed | 0 | 1 | The operation was aborted due to timeout |
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
- 可选 OSS Insight 来源提示：ossinsight-24h-typescript / unavailable；This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories.。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-all / failed；The operation was aborted due to timeout。官方来源与必核证据通过时不阻断发布。
- 可选 OSS Insight 来源提示：ossinsight-24h-python / failed；The operation was aborted due to timeout。官方来源与必核证据通过时不阻断发布。

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | surging | 72,460 / 9,445 | 2026-10-24 | 已检查 Releases，无 tag | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。 |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 74,700 / 13,104 | 2026-10-23 | v2026.10.4 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。 |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | surging | 45,918 / 5,759 | 2026-10-18 | v1.6.15 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | surging | 91,357 / 10,100 | 2026-10-27 | v0.5.7 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [huggingface/lerobot](https://github.com/huggingface/lerobot) | surging | 28,526 / 5,958 | 2026-10-27 | v0.6.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Hugging Face 官方机器人生态底座，适合持续跟踪模型从研究代码走向真实设备部署。 |
| [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | surging | 18,317 / 1,953 | 2026-10-14 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 21,180 / 569 | 2026-10-27 | v1.1.19 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | surging | 65,697 / 5,715 | 2026-10-27 | v3.31.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 104,932 / 9,302 | 2026-10-25 | v1.6.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | surging | 20,145 / 1,124 | 2026-10-26 | v2.1.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | surging | 2,737 / 450 | 2026-10-27 | v3.0.8 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | surging | 60,703 / 11,851 | 2026-10-28 | v0.2.1 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [hi3d-official/Hi3Dv1.0](https://github.com/hi3d-official/Hi3Dv1.0) | surging | 546 / 46 | 2026-10-23 | v1.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | surging | 68,259 / 5,545 | 2026-10-27 | v4.0.539 | Remotion License (free/company tiers) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创 React 程序化视频工具，packages 包含核心、渲染、时间线与编辑组件。许可正文只对个人、至多3名员工的营利组织、非营利组织等提供免费使用，其他公司需核对公司许可；不是通用MIT。 |
| [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | surging | 36,877 / 5,960 | 2026-10-27 | v0.1.18 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当前 README、根目录、README 安装或使用说明及最近提交、Issue/PR 与发布入口已核验；Stars 不单独决定质量，未安装外部代码或复测性能。 |
| [jackwener/OpenCLI](https://github.com/jackwener/OpenCLI) | hot | 30,703 / 3,010 | 2026-10-26 | v2.0.2 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 119,312 / 13,266 | 2026-10-26 | 0.13.14 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25,843 / 1,786 | 2026-10-27 | stagehand-server-v3/v3.7.7 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 196,066 / 10,355 | 2026-10-27 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 32,537 / 2,697 | 2026-10-25 | chromium-v155.0.8059.39.2-pro | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [jo-inc/camofox-browser](https://github.com/jo-inc/camofox-browser) | hot | 12,013 / 1,214 | 2026-10-05 | v1.18.1 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [starVLA/starVLA](https://github.com/starVLA/starVLA) | hot | 3,870 / 515 | 2026-10-08 | starVLA-v1.6 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：提供可比较、可扩展的 VLA 工程底座，适合跟踪 PhysBrain、NeuroVLA 等新策略。 |
| [NVlabs/Sana](https://github.com/NVlabs/Sana) | hot | 9,671 / 776 | 2026-10-23 | streamrender-h3-examples-v1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26,276 / 1,737 | 2026-10-27 | v4.0.0-rc.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 90,050 / 9,308 | 2026-10-27 | v0.5 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 38,285 / 9,934 | 2026-10-28 | v0.5.22 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 86,409 / 8,991 | 2026-10-26 | v0.9.5 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 37,058 / 1,797 | 2026-10-28 | 1.0.2 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | hot | 23,287 / 2,223 | 2026-10-28 | v1.0.56 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。 |
| [Physical-Intelligence/openpi](https://github.com/Physical-Intelligence/openpi) | hot | 14,428 / 2,597 | 2026-08-24 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：当前开放 VLA 体系的重要基线，模型、训练和部署链路对通用机器人研究具有高参考价值。 |
| [browser-use/browser-harness](https://github.com/browser-use/browser-harness) | hot | 18,662 / 1,850 | 2026-10-25 | v0.1.13 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [3441293738/creatorhub](https://github.com/3441293738/creatorhub) | hot | 2,640 / 495 | 2026-10-27 | v0.2.5 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [feder-cr/invisible_dots](https://github.com/feder-cr/invisible_dots) | hot | 32,271 / 4,734 | 2026-10-15 | golden-d27023f0394d | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [hitcslj/3DGen4Robot](https://github.com/hitcslj/3DGen4Robot) | hot / AI 强制 | 65 / 1 | 2026-10-24 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | hot | 143,559 / 16,972 | 2026-10-28 | v0.43.0 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 257,742 / 56,518 | 2026-10-28 | v0.22.5 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [rxjfighting/SceneMosaic](https://github.com/rxjfighting/SceneMosaic) | watch / AI 强制 | 53 / 1 | 2026-09-03 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 131,268 / 20,736 | 2026-10-28 | rust-v0.165.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。 |
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | watch / AI 强制 | 263,648 / 31,891 | 2026-10-23 | dsh-v0.2.1-rc.3 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：DeepSeek 官方可组合Harness为开发预览，README明确破坏性变更；PR集合API404保留，当日官方Pulls200及独立is:pr空结果覆盖。未运行。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | NOASSERTION (README claims MIT; root LICENSE unverified) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：人工approved保留云原生多Agent示例；README声称MIT但根目录未核实LICENSE，Azure服务与密钥另配。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 153,602 / 26,058 | 2026-10-27 | v2.1.312 | Anthropic Commercial Terms | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：人工 approved 保留；当前 v2.1.312，官方分发、插件及示例可核验，商业 LICENSE 不表示完整核心开源。 |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI 强制 | 0 / 0 | 2026-10-09 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [openai/MultiLangBench](https://github.com/openai/MultiLangBench) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold) | watch / AI 强制 | 0 / 0 | 2026-10-15 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ku-autoai/MAGE](https://github.com/ku-autoai/MAGE) | watch / AI 强制 | 0 / 0 | 2026-10-16 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [MIT-SPARK/Language-As-A-Sensor](https://github.com/MIT-SPARK/Language-As-A-Sensor) | watch / AI 强制 | 0 / 0 | 2026-10-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild) | watch / AI 强制 | 0 / 0 | 2026-10-23 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [SashaDance/rgraph-eval](https://github.com/SashaDance/rgraph-eval) | watch / AI 强制 | 0 / 0 | 2026-09-16 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [shengchaochen82/PCF-Bench-Eval](https://github.com/shengchaochen82/PCF-Bench-Eval) | watch / AI 强制 | 0 / 0 | 2026-10-14 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Tinaliu0123/scenebloom](https://github.com/Tinaliu0123/scenebloom) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [zengkaiya/SteerVTE](https://github.com/zengkaiya/SteerVTE) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [deepseek-ai/DeepInfer](https://github.com/deepseek-ai/DeepInfer) | watch / AI 强制 | 0 / 0 | 2026-10-25 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [gaojh0333/PanoGraphGS](https://github.com/gaojh0333/PanoGraphGS) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [simonw/battledrones](https://github.com/simonw/battledrones) | watch / AI 强制 | 0 / 0 | 2026-10-24 | v14 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [XingChen-AGI/Xing4.0-29B-Intent](https://github.com/XingChen-AGI/Xing4.0-29B-Intent) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |

## 候选入选原因

- `calesthio/OpenMontage`：行业优先：视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 1575；跨 5 个来源命中。
- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；GitHub Trending 当日新增关注 424；本地快照新增 Stars 18；最近 5 天有推送。
- `HKUDS/DeepTutor`：行业优先：深度研究；GitHub Trending 当日新增关注 1598；本地快照新增 Stars 113；最近 1 天有推送。
- `debpalash/VoiceStudio`：行业优先：最新开放模型；GitHub Trending 当日新增关注 2621；本地快照新增 Stars 84；最近 1 天有推送。
- `huggingface/lerobot`：行业优先：WAIC 物理 AI、机器人学习 / 控制、最新开放模型；本地快照新增 Stars 122；最近 6 天有推送；跨 3 个来源命中。
- `Robbyant/lingbot-map`：行业优先：3D / 三维生成、最新开放模型；本地快照新增 Stars 140；跨 3 个来源命中。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 255；最近 1 天有推送；跨 2 个来源命中。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 104；最近 1 天有推送；跨 2 个来源命中。
- `Panniantong/Agent-Reach`：行业优先：网页采集与检索；GitHub Trending 当日新增关注 1632；本地快照新增 Stars 39；最近 3 天有推送。
- `citrolabs/ego-lite`：行业优先：浏览器执行；本地快照新增 Stars 350；最近 1 天有推送；跨 2 个来源命中。
- `PurpleDoubleD/locally-uncensored`：行业优先：视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 120；最近 1 天有推送。
- `bilawalsidhu/gods-eye-view`：行业优先：3D / 三维生成；本地快照新增 Stars 259；最近 1 天有推送。
- `hi3d-official/Hi3Dv1.0`：行业优先：3D / 三维生成、最新开放模型；本地快照新增 Stars 5；新仓库 12 天；最近 5 天有推送。
- `remotion-dev/remotion`：GitHub Trending 当日新增关注 387；最近 1 天有推送；跨 3 个来源命中。
- `HKUDS/Vibe-Trading`：本地快照新增 Stars 546；最近 7 天有推送；跨 3 个来源命中。
- `jackwener/OpenCLI`：行业优先：浏览器执行；最近 2 天有推送；跨 6 个来源命中。
- `browser-use/browser-use`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `firecrawl/firecrawl`：行业优先：网页采集与检索；最近 1 天有推送；跨 4 个来源命中。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 1；最近 1 天有推送；跨 3 个来源命中。
- `jo-inc/camofox-browser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 23；最近 5 天有推送；跨 3 个来源命中。
- `starVLA/starVLA`：行业优先：WAIC 物理 AI、机器人学习 / 控制；本地快照新增 Stars 20；跨 3 个来源命中。
- `NVlabs/Sana`：行业优先：3D / 三维生成、生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `unclecode/crawl4ai`：行业优先：网页采集与检索；最近 2 天有推送；跨 3 个来源命中。
- `lightpanda-io/browser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `Skyvern-AI/skyvern`：行业优先：浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `Physical-Intelligence/openpi`：行业优先：WAIC 物理 AI、机器人学习 / 控制；本地快照新增 Stars 75；跨 2 个来源命中。
- `browser-use/browser-harness`：行业优先：浏览器执行；本地快照新增 Stars 23；最近 3 天有推送；跨 2 个来源命中。
- `3441293738/creatorhub`：行业优先：网页采集与检索；本地快照新增 Stars 65；最近 1 天有推送。
- `feder-cr/invisible_dots`：行业优先：浏览器执行；本地快照新增 Stars 1；最近 3 天有推送；跨 2 个来源命中。
- `hitcslj/3DGen4Robot`：最近 4 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `Comfy-Org/ComfyUI`：最近 1 天有推送；跨 3 个来源命中。
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `rxjfighting/SceneMosaic`：行业优先：3D / 三维生成、物理一致 / SimReady、WAIC 物理 AI；AI 日报/周报强制候选；跨 4 个来源命中。
- `openai/codex`：最近 1 天有推送；AI 日报/周报强制候选；跨 4 个来源命中。
- `deepseek-ai/deepseek-harness`：最近 5 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `anthropics/claude-code`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `fyting/ArtifactWorld`：AI 日报/周报强制候选；跨 2 个来源命中。
- `openai/MultiLangBench`：AI 日报/周报强制候选；跨 2 个来源命中。
- `deepseek-ai/deepseek-recipe`：AI 日报/周报强制候选。
- `Fantasy-AMAP/TriFold`：AI 日报/周报强制候选。
- `ku-autoai/MAGE`：AI 日报/周报强制候选。
- `MIT-SPARK/Language-As-A-Sensor`：AI 日报/周报强制候选。
- `pengpeng-yu/CodecSplat`：AI 日报/周报强制候选。
- `RUCAIBox/Agentic-ImageGen-Wild`：AI 日报/周报强制候选。
- `SashaDance/rgraph-eval`：AI 日报/周报强制候选。
- `shengchaochen82/PCF-Bench-Eval`：AI 日报/周报强制候选。
- `Tinaliu0123/scenebloom`：AI 日报/周报强制候选。
- `VAST-AI-Research/EdenLive`：AI 日报/周报强制候选。
- `zengkaiya/SteerVTE`：AI 日报/周报强制候选。
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

- Axiom与Anthropic数学形式化主张待原始证据核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- 媒体提及额度变化、硬件与同声传译更新待精确首发核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
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

- [datawhalechina/every-embodied](https://github.com/datawhalechina/every-embodied)：可访问；行业优先：WAIC 物理 AI；最近 3 天有推送；跨 2 个来源命中。
- [Robbyant/lingbot-video](https://github.com/Robbyant/lingbot-video)：可访问；行业优先：WAIC 物理 AI、最新开放模型、视频生成模型、视频生成 / 自动剪辑；跨 3 个来源命中。
- [assafelovic/gpt-researcher](https://github.com/assafelovic/gpt-researcher)：可访问；行业优先：网页采集与检索、深度研究；跨 3 个来源命中。
- [Fysics-AI/Fysiverse-3D-SimReady](https://github.com/Fysics-AI/Fysiverse-3D-SimReady)：可访问；行业优先：3D / 三维生成、物理一致 / SimReady；跨 3 个来源命中。
- [nerfstudio-project/gsplat](https://github.com/nerfstudio-project/gsplat)：可访问；行业优先：3DGS / Gaussian Splatting；跨 3 个来源命中。

## 落盘边界

- 正式跟踪项目 262 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。

