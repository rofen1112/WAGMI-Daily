# GitHub Radar 2026-10-29

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：初轮1641条原始观察；当前394个候选，保留原始发现记录并定向补入6个AI仓库，15个surging，20个hot。
- 核验范围：全部15个surging、20个hot及30个AI强制候选。原定时批次记录及其后定向刷新记录全部保留，当前库存267个。
- 核验覆盖：63/63个mandatory仓库可访问；README、提交、Issue、PR、Releases全部完整。
- 核验模式：GitHub连接器加保留的同日官方页面证据；所有真实失败记录留档。
- AI 日报：2026-10-29 / success；最新已完成周报：2026-10-25T23:54:02.248Z / success。
- 上游状态：`upstreamStale=false`。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-trending-24h-all | success | 14 | 1 |  |
| github-trending-24h-typescript | success | 14 | 1 |  |
| github-trending-24h-python | success | 10 | 1 |  |
| github-trending-weekly-all | success | 11 | 1 |  |
| ossinsight-weekly-all | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-python | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| ossinsight-24h-typescript | unavailable | 0 | 1 | This ranking is ordered by recent star/PR/issue event counts, and our capture of those events fell to roughly 0.3% of baseline, so the ordering would be noise. An empty result here means the metric cannot be computed, not that there are no matching repositories. |
| github-ai-active | success | 50 | 2 |  |
| ossinsight-24h-all | failed | 0 | 1 | The operation was aborted due to timeout |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 1 | 1 |  |
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
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | surging | 72729 / 9495 | 2026-10-28 | 已检查 Releases，无 tag | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。 |
| [HKUDS/DeepTutor](https://github.com/HKUDS/DeepTutor) | surging | 47987 / 5950 | 2026-10-28 | v1.7.0 | Apache-2.0; adapted third-party MIT notices retained (当日许可正文已留档；细分条款按原文) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 75326 / 13243 | 2026-10-23 | v2026.10.4 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [debpalash/VoiceStudio](https://github.com/debpalash/VoiceStudio) | surging | 93014 / 10284 | 2026-10-28 | v0.5.7 | AGPL-3.0; external model licenses separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [lexmount/moli](https://github.com/lexmount/moli) | surging | 21352 / 577 | 2026-10-29 | v1.1.19 | Apache-2.0 OR MIT; third-party notices separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | surging | 18418 / 1959 | 2026-10-14 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | surging | 20390 / 1142 | 2026-10-26 | v2.1.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [google-deepmind/mujoco](https://github.com/google-deepmind/mujoco) | surging | 15947 / 1895 | 2026-10-28 | 3.17.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Google DeepMind 官方基础设施，是机器人算法比较和可复现实验的长期核心基线。 |
| [deepopen-com/deepopen-3d-webs](https://github.com/deepopen-com/deepopen-3d-webs) | surging | 494 / 1 | 2026-10-27 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE); LucidDreamer/upstream terms separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：图像到3D场景工作台有真实webui/engine实现，依赖LucidDreamer/ZoeDepth；源码明确失败可回落图片演示，Demo成功不能证明真实3D生成。根许可未核实，原创增量与上游授权继续观察。 |
| [PurpleDoubleD/locally-uncensored](https://github.com/PurpleDoubleD/locally-uncensored) | surging | 2928 / 485 | 2026-10-28 | v3.0.8 | AGPL-3.0; external models/services separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [bilawalsidhu/gods-eye-view](https://github.com/bilawalsidhu/gods-eye-view) | surging | 60942 / 11904 | 2026-10-29 | v0.3.0 | MIT source; third-party data/assets separately licensed | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [Panniantong/Agent-Reach](https://github.com/Panniantong/Agent-Reach) | surging | 105634 / 9365 | 2026-10-25 | v1.6.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [hi3d-official/Hi3Dv1.0](https://github.com/hi3d-official/Hi3Dv1.0) | surging | 603 / 54 | 2026-10-23 | v1.0 | Hi3D Open License Agreement 1.0; upstream/model terms separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | surging | 37035 / 5974 | 2026-10-28 | v0.1.18 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：保留既有正式跟踪；当前 README、根目录、README 安装或使用说明及最近提交、Issue/PR 与发布入口已核验；Stars 不单独决定质量，未安装外部代码或复测性能。 |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | surging | 68601 / 5595 | 2026-10-28 | v4.0.539 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：成熟的程序化视频生产工具，可把 AI 生成的脚本、素材和结构稳定转成可重复渲染的成片。 |
| [jackwener/OpenCLI](https://github.com/jackwener/OpenCLI) | hot | 30726 / 3018 | 2026-10-26 | v2.0.2 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [browser-use/browser-use](https://github.com/browser-use/browser-use) | hot | 119395 / 13285 | 2026-10-26 | 0.13.14 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [browserbase/stagehand](https://github.com/browserbase/stagehand) | hot | 25854 / 1789 | 2026-10-28 | stagehand-server-v3/v3.7.7 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [firecrawl/firecrawl](https://github.com/firecrawl/firecrawl) | hot | 196412 / 10370 | 2026-10-28 | v2.11.0 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [CloakHQ/CloakBrowser](https://github.com/CloakHQ/CloakBrowser) | hot | 32566 / 2703 | 2026-10-25 | chromium-v155.0.8059.39.2-pro | MIT wrapper; browser binary terms separate (当日许可正文已留档；细分条款按原文) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill) | hot | 65791 / 5725 | 2026-10-28 | v3.31.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [Genesis-Embodied-AI/genesis-world](https://github.com/Genesis-Embodied-AI/genesis-world) | hot | 30136 / 2901 | 2026-10-28 | v1.4.5 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：新一代开放物理仿真平台，能够补充传统机器人模拟器在速度和生成式场景上的能力。 |
| [huggingface/lerobot](https://github.com/huggingface/lerobot) | hot | 28553 / 5962 | 2026-10-28 | v0.6.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Hugging Face 官方机器人生态底座，适合持续跟踪模型从研究代码走向真实设备部署。 |
| [Tencent-Hunyuan/HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo) | hot | 12683 / 1368 | 2026-10-08 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：腾讯官方高影响力开源视频模型，是自建视频生成能力和第三方工作流适配的核心基线。 |
| [NVlabs/Sana](https://github.com/NVlabs/Sana) | hot | 9700 / 781 | 2026-10-23 | streamrender-h3-examples-v1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [apify/crawlee](https://github.com/apify/crawlee) | hot | 26282 / 1737 | 2026-10-27 | v4.0.0-rc.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [D4Vinci/Scrapling](https://github.com/D4Vinci/Scrapling) | hot | 90209 / 9328 | 2026-10-28 | v0.5 | BSD-3-Clause | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 38324 / 9973 | 2026-10-29 | v0.5.22 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [unclecode/crawl4ai](https://github.com/unclecode/crawl4ai) | hot | 86465 / 9002 | 2026-10-26 | v0.9.5 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [lightpanda-io/browser](https://github.com/lightpanda-io/browser) | hot | 37102 / 1802 | 2026-10-29 | 1.0.2 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [Skyvern-AI/skyvern](https://github.com/Skyvern-AI/skyvern) | hot | 23295 / 2224 | 2026-10-29 | v1.0.56 | AGPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。 |
| [isaac-sim/IsaacLab](https://github.com/isaac-sim/IsaacLab) | hot | 8509 / 3988 | 2026-10-28 | v3.0.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：当前物理 AI 仿真和合成数据的重要工业底座，机器人研究与产品验证均应持续关注。 |
| [hitcslj/3DGen4Robot](https://github.com/hitcslj/3DGen4Robot) | hot / AI 强制 | 65 / 1 | 2026-10-24 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | hot | 143788 / 17019 | 2026-10-28 | v0.43.0 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 258070 / 56633 | 2026-10-29 | v0.22.5 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness) | watch / AI 强制 | 264772 / 32068 | 2026-10-27 | dsh-v0.2.2-alpha.2 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 28 / 11 | 2026-08-01 | 已检查 Releases，无 tag | NOASSERTION (README claims MIT; root LICENSE unverified) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 131440 / 20757 | 2026-10-29 | rust-v0.166.0-alpha.5.1 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 153742 / 26075 | 2026-10-27 | v2.1.312 | Anthropic Commercial Terms | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [2hiTee/VidEdit3D](https://github.com/2hiTee/VidEdit3D) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | Apache-2.0 planned original code; BSD-3-Clause adapted portions; external model terms | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：README明确Code will be released soon；根目录为README、素材和许可，不能因Apache正文存在而称实现已发布。保留3D编辑研究观察。 |
| [fyting/ArtifactWorld](https://github.com/fyting/ArtifactWorld) | watch / AI 强制 | 0 / 0 | 2026-10-09 | 已检查 Releases，无 tag | Apache-2.0 code; gated CC-BY-NC-4.0 model | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [openai/MultiLangBench](https://github.com/openai/MultiLangBench) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [001-Wang/PrecisionReach-GS](https://github.com/001-Wang/PrecisionReach-GS) | watch / AI 强制 | 0 / 0 | 2026-10-08 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE verified) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：实读COLMAP到机器人加权对齐，发布的是重建/数据生成子集；大数据、训练策略和机器人记录明确排除。根许可缺失，21/25等数值为作者论文结果，未复现。 |
| [deepseek-ai/deepseek-recipe](https://github.com/deepseek-ai/deepseek-recipe) | watch / AI 强制 | 0 / 0 | 2026-10-19 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [Fantasy-AMAP/TriFold](https://github.com/Fantasy-AMAP/TriFold) | watch / AI 强制 | 0 / 0 | 2026-10-15 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [huajian-zeng/flowhoi](https://github.com/huajian-zeng/flowhoi) | watch / AI 强制 | 0 / 0 | 2026-09-25 | 已检查 Releases，无 tag | CC-BY-NC-4.0 source; model/data/MANO/GRAB terms separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：实读sample_2stage两阶段抓取/操作推理。代码非商业许可，GRAB/MANO另需注册且不能重分发；仅Demo数据，训练、评测和预处理仍TODO。按原创机器人研究收录，不视为已发布完整训练或商用方案。 |
| [ku-autoai/MAGE](https://github.com/ku-autoai/MAGE) | watch / AI 强制 | 0 / 0 | 2026-10-16 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [pengpeng-yu/CodecSplat](https://github.com/pengpeng-yu/CodecSplat) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | MIT code and model card; upstream/data licenses separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：实读encoder_codecsplat中的特征熵编码、相机流与compress路径，场景bitstream导出当前限制batch=1。官方HF元数据列两份检查点且MIT、非门控；8卡48GB为训练配置，不是推理最低要求。未下载权重或复测压缩率/画质。 |
| [robbyant/lingbot-world-v2](https://github.com/robbyant/lingbot-world-v2) | watch / AI 强制 | 0 / 0 | 2026-09-10 | 已检查 Releases，无 tag | CC-BY-NC-SA-4.0 source; linked models separately checked | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Robbyant官方世界模型，实读generate.py的Wan模型配置与分布式推理。README的14B/1.3B示例分别8卡/4卡，60fps是作者系统说明，不能当单卡本地性能；源码非商业同方式共享。 |
| [RUCAIBox/Agentic-ImageGen-Wild](https://github.com/RUCAIBox/Agentic-ImageGen-Wild) | watch / AI 强制 | 0 / 0 | 2026-10-23 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [VAST-AI-Research/EdenLive](https://github.com/VAST-AI-Research/EdenLive) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | Apache-2.0 source; mixed model/component terms | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [XiaoBin2001/ParetoGS](https://github.com/XiaoBin2001/ParetoGS) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | MIT original contributions; inherited 3DGS/ImprovedGS restricted terms remain | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：实读ParetoGSRuntime：载入manifest、嵌套顺序、适配器及校准曲线，支持预算解码。原创MIT不覆盖继承3DGS研究用途限制；Ubuntu/4090为作者测试环境，Windows CUDA/训练明确未验证，未运行。 |
| [deepseek-ai/DeepInfer](https://github.com/deepseek-ai/DeepInfer) | watch / AI 强制 | 0 / 0 | 2026-10-25 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [gaojh0333/PanoGraphGS](https://github.com/gaojh0333/PanoGraphGS) | watch / AI 强制 | 0 / 0 | 2026-10-21 | 已检查 Releases，无 tag | NOASSERTION (no root LICENSE) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [simonw/battledrones](https://github.com/simonw/battledrones) | watch / AI 强制 | 0 / 0 | 2026-10-24 | v14 | Apache-2.0 source; external model and art terms separate (当日许可正文已留档；细分条款按原文) | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：延续 2026-10-28 审核结论；今日官方元数据、README、目录及维护入口复核完成。历史具体依据在 previousReview 保留，版本和性能以今日证据为准。 |
| [XingChen-AGI/Xing4.0-29B-Intent](https://github.com/XingChen-AGI/Xing4.0-29B-Intent) | watch / AI 强制 | 0 / 0 | 2026-10-27 | 已检查 Releases，无 tag | Apache-2.0 code/model card; dataset provenance separate | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：星辰官方意图/结构化抽取，实读同步异步SDK与chat/completions调用；HF列41权重分片、Apache2且非门控。29B总参数/4B激活分开，6000样本宏平均F1不是业务准确率；完整训练和评测未复现。 |

## 候选入选原因

- `calesthio/OpenMontage`：行业优先：视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 269；最近 1 天有推送；跨 5 个来源命中。
- `HKUDS/DeepTutor`：行业优先：深度研究；GitHub Trending 当日新增关注 2371；本地快照新增 Stars 73；最近 1 天有推送。
- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 614；最近 6 天有推送；跨 3 个来源命中。
- `debpalash/VoiceStudio`：行业优先：最新开放模型；GitHub Trending 当日新增关注 1793；本地快照新增 Stars 72；最近 1 天有推送。
- `lexmount/moli`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 161；最近 1 天有推送；跨 2 个来源命中。
- `Robbyant/lingbot-map`：行业优先：3D / 三维生成、最新开放模型；本地快照新增 Stars 101；跨 3 个来源命中。
- `citrolabs/ego-lite`：行业优先：浏览器执行；本地快照新增 Stars 237；最近 1 天有推送；跨 2 个来源命中。
- `google-deepmind/mujoco`：行业优先：WAIC 物理 AI、机器人仿真 / Sim2Real、机器人学习 / 控制；本地快照新增 Stars 120；最近 1 天有推送；跨 2 个来源命中。
- `deepopen-com/deepopen-3d-webs`：行业优先：3D / 三维生成、视频 3D 舞台 / 虚拟制作；本地快照新增 Stars 104；新仓库 3 天；最近 2 天有推送。
- `PurpleDoubleD/locally-uncensored`：行业优先：视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 185；最近 1 天有推送。
- `bilawalsidhu/gods-eye-view`：行业优先：3D / 三维生成；本地快照新增 Stars 230；最近 1 天有推送。
- `Panniantong/Agent-Reach`：行业优先：网页采集与检索；本地快照新增 Stars 670；最近 4 天有推送。
- `hi3d-official/Hi3Dv1.0`：行业优先：3D / 三维生成、最新开放模型；新仓库 13 天；最近 6 天有推送。
- `HKUDS/Vibe-Trading`：本地快照新增 Stars 158；最近 1 天有推送；跨 3 个来源命中。
- `remotion-dev/remotion`：本地快照新增 Stars 342；最近 1 天有推送；跨 2 个来源命中。
- `jackwener/OpenCLI`：行业优先：浏览器执行；最近 3 天有推送；跨 6 个来源命中。
- `browser-use/browser-use`：行业优先：网页采集与检索、浏览器执行；最近 2 天有推送；跨 4 个来源命中。
- `browserbase/stagehand`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 4 个来源命中。
- `firecrawl/firecrawl`：行业优先：网页采集与检索；最近 1 天有推送；跨 4 个来源命中。
- `CloakHQ/CloakBrowser`：行业优先：网页采集与检索、浏览器执行；本地快照新增 Stars 3；最近 2 天有推送；跨 3 个来源命中。
- `mvanhorn/last30days-skill`：行业优先：网页采集与检索、深度研究；本地快照新增 Stars 94；最近 1 天有推送；跨 2 个来源命中。
- `Genesis-Embodied-AI/genesis-world`：行业优先：WAIC 物理 AI、机器人仿真 / Sim2Real、机器人学习 / 控制；本地快照新增 Stars 33；最近 1 天有推送；跨 3 个来源命中。
- `huggingface/lerobot`：行业优先：WAIC 物理 AI、机器人学习 / 控制、最新开放模型；本地快照新增 Stars 27；最近 1 天有推送；跨 3 个来源命中。
- `Tencent-Hunyuan/HunyuanVideo`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 34；跨 3 个来源命中。
- `NVlabs/Sana`：行业优先：3D / 三维生成、生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `apify/crawlee`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `D4Vinci/Scrapling`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `unclecode/crawl4ai`：行业优先：网页采集与检索；最近 1 天有推送；跨 3 个来源命中。
- `lightpanda-io/browser`：行业优先：网页采集与检索、浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `Skyvern-AI/skyvern`：行业优先：浏览器执行；最近 1 天有推送；跨 3 个来源命中。
- `isaac-sim/IsaacLab`：行业优先：物理一致 / SimReady、WAIC 物理 AI、机器人仿真 / Sim2Real、机器人学习 / 控制；本地快照新增 Stars 89；最近 1 天有推送；跨 2 个来源命中。
- `hitcslj/3DGen4Robot`：最近 5 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `Comfy-Org/ComfyUI`：最近 1 天有推送；跨 3 个来源命中。
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `deepseek-ai/deepseek-harness`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `openai/codex`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `anthropics/claude-code`：最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `2hiTee/VidEdit3D`：AI 日报/周报强制候选；跨 2 个来源命中。
- `fyting/ArtifactWorld`：AI 日报/周报强制候选；跨 2 个来源命中。
- `openai/MultiLangBench`：AI 日报/周报强制候选；跨 2 个来源命中。
- `001-Wang/PrecisionReach-GS`：AI 日报/周报强制候选。
- `deepseek-ai/deepseek-recipe`：AI 日报/周报强制候选。
- `Fantasy-AMAP/TriFold`：AI 日报/周报强制候选。
- `huajian-zeng/flowhoi`：AI 日报/周报强制候选。
- `ku-autoai/MAGE`：AI 日报/周报强制候选。
- `pengpeng-yu/CodecSplat`：AI 日报/周报强制候选。
- `robbyant/lingbot-world-v2`：AI 日报/周报强制候选。
- `RUCAIBox/Agentic-ImageGen-Wild`：AI 日报/周报强制候选。
- `VAST-AI-Research/EdenLive`：AI 日报/周报强制候选。
- `XiaoBin2001/ParetoGS`：AI 日报/周报强制候选。
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

- 媒体提及新文档解析与扩散模型，官方首发时间和身份待核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- 媒体数学突破说法保留待核验（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
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

- [microsoft/World-R1](https://github.com/microsoft/World-R1)：可访问；行业优先：3D / 三维生成、视频生成模型、视频生成 / 自动剪辑；跨 2 个来源命中。
- [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3)：可访问；行业优先：最新开放模型；跨 2 个来源命中。
- [nepfaff/scenesmith](https://github.com/nepfaff/scenesmith)：可访问；行业优先：室内设计、3D / 三维生成；跨 2 个来源命中。
- [nerfstudio-project/nerfstudio](https://github.com/nerfstudio-project/nerfstudio)：可访问；行业优先：3DGS / Gaussian Splatting、3D / 三维生成；跨 2 个来源命中。
- [neu-vi/houseCrafter](https://github.com/neu-vi/houseCrafter)：可访问；行业优先：室内设计、3D / 三维生成；跨 2 个来源命中。

## 落盘边界

- 正式跟踪项目 262 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。


## 09:00 二次审计

最终趋势发现完成后重新核验全部必核与5个watch样本；保留当日既有源码、许可与原创性编辑证据，新增连接器元数据复核单独归档。本轮没有新增正式项目。

## 行业重点收录

保留 267 个正式项目记录，其中 265 个处于活跃跟踪，2 个已下架并保留历史信息。热度只用于排序，不是收录门槛。

### 文档智能 / 长文档解析

- [Unlimited OCR 2](https://github.com/baidu/Unlimited-OCR)：百度官方仓库的推理实现、文档批处理和后处理路径真实可读，部署方法与显存约束明确；长文档解析有实用价值，以B级收录并保留未复现与许可边界。

### 文档智能 / OCR质量判断

- [MiniCPM-OCR / Jev](https://github.com/OpenBMB/MiniCPM-OCR)：官方README、中文说明、Apache许可与实际SDK CLI/配置实现可核验；文档解析加区域级质量评分有明确复用价值，按作者实测边界以B级收录。

### Agent 工程 / GitHub 自动化

- [GitHub Agentic Workflows](https://github.com/github/gh-aw)：同日 AI 强制候选；官方关系、可安装实现、文档和活跃维护均已核验，综合质量达到 A。

### Agent 安全 / 插件

- [Claude Code 官方插件（security-guidance）](https://github.com/anthropics/claude-plugins-official)：Anthropic内部security-guidance插件有实际Python hooks、配置与测试，支持模式告警、diff复核及提交前Agent审阅；不把外部插件目录当作统一安全保证。

### Agent 评测 / 软件交付

- [ViBench](https://github.com/ViBench/vibench-public)：原创逐阶段软件交付基准，公开PRD、测试计划和Harbor运行器；能用于评估设计画布等产品任务，但9个保留应用未公开、自动grader有误差且复现有成本。

### Agent 工程 / 工作流与技能

- [MCode Stack](https://github.com/MiniMax-AI/mcode-stack)：官方团队把真实工作流制作成可安装Skills和插件，并提供manifest、版本与marketplace校验脚本，具有可复用工程价值；未冒称为MiniMax Code本体代码。

### 世界模型 / 物理 AI

- [NVIDIA Cosmos](https://github.com/NVIDIA/cosmos)：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。
- [Kairos](https://github.com/DAXIAORobotics/kairos)：官方项目仓库，Apache-2.0 许可，具备原创论文、完整代码结构和明确维护证据。

### Agent 工程 / 云原生

- [Multi AI Agents Cloud Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native)：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。

### 编码 Agent / 开发工具

- [OpenAI Codex](https://github.com/openai/codex)：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。

### 模型推理 / Agent 基础设施

- [SGLang](https://github.com/sgl-project/sglang)：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。

### 生成式设计 / 节点工作流

- [ComfyUI](https://github.com/Comfy-Org/ComfyUI)：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。

### Agent 数据基础设施 / 网页采集与检索

- [Firecrawl](https://github.com/firecrawl/firecrawl)：项目已形成 AI 网页数据基础设施的代表性产品形态，搜索、抓取、结构化与 Agent 接入链路完整，按 A+ 级正式跟踪。
- [Crawl4AI](https://github.com/unclecode/crawl4ai)：开源、自托管和 LLM 友好能力突出，是 Firecrawl 之外重要的技术路线，按 A 级正式跟踪。
- [Crawlee](https://github.com/apify/crawlee)：作为 Firecrawl 类产品下层的成熟抓取与浏览器执行基础，工程参考价值高，按 A 级跟踪。
- [Scrapling](https://github.com/D4Vinci/Scrapling)：在传统爬虫与 AI 数据采集之间形成清晰产品能力，且关注度和工程完整性突出，按 A 级跟踪。
- [Bright Data MCP](https://github.com/brightdata/brightdata-mcp)：代表商业网页数据平台通过 MCP 进入 Agent 基础设施的路线，按 B+ 级跟踪。
- [Ferret](https://github.com/MontFerret/ferret)：提供与 API 型、无代码型不同的声明式网页数据工程路线，按 B+ 级跟踪。
- [ScrapeGraphAI](https://github.com/ScrapeGraphAI/Scrapegraph-ai)：自然语言驱动结构化抽取与 Firecrawl 形成互补，具备明确的 Agent 数据入口价值，按 A 级跟踪。
- [Firecrawl MCP Server](https://github.com/firecrawl/firecrawl-mcp-server)：它是 Firecrawl 进入 Agent 工具生态的官方桥梁，直接命中本类目，按 A 级正式跟踪。
- [Maxun](https://github.com/getmaxun/maxun)：代表网页采集从开发库走向可视化产品的路线，适合观察产品化和企业应用，按 B+ 级跟踪。

### Agent 数据基础设施 / 浏览器执行

- [Browser Use](https://github.com/browser-use/browser-use)：是网页数据之外 Agent 执行链的代表项目，与 Firecrawl 的读取能力形成互补，按 A 级跟踪。
- [Stagehand](https://github.com/browserbase/stagehand)：把确定性浏览器控制与 Agent 语义操作结合，是 Firecrawl 关联生态的重要执行层，按 A 级跟踪。
- [Skyvern](https://github.com/Skyvern-AI/skyvern)：代表浏览器 Agent 从工具库走向业务工作流平台的路线，按 A 级正式跟踪。
- [Lightpanda](https://github.com/lightpanda-io/browser)：直接回应 AI 时代网页采集和浏览器 Agent 的基础设施成本问题，按 A 级跟踪。
- [OpenCLI](https://github.com/jackwener/OpenCLI)：将网页交互抽象为 Agent 可组合 CLI，是浏览器执行层近期高关注方向，按 A 级跟踪。
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)：MCP 已成为 Agent 接入浏览器的重要标准路径，官方实现具备强参考价值，按 A 级跟踪。
- [Agent Browser](https://github.com/vercel-labs/agent-browser)：结构化浏览器 CLI 是 Agent 执行层的新形态，热度与生态关联度较高，按 A 级跟踪。

### Agent 工程基础设施 / 可组合运行时

- [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness)：该项目由 AI 当日二次审计触发，直接命中编码智能体、可组合 Agent 运行时与沙箱基础设施方向；官方关系、原创实现、可运行性与行业影响均通过门槛，按 A 级正式跟踪。

### 3D 世界生成

- [SceneMosaic](https://github.com/rxjfighting/SceneMosaic)：直接连接室内空间生成、仿真数据和具身智能训练，是 3D 智能空间与物理 AI 的关键上游能力，按 A 级正式跟踪。
- [HunyuanWorld Voyager](https://github.com/Tencent-Hunyuan/HunyuanWorld-Voyager)：腾讯混元官方原创项目，把可控世界生成与实时 3D 重建连接在同一工作流中。
- [PartCrafter](https://github.com/wgsxm/PartCrafter)：NeurIPS 2025 官方实现，MIT 许可，提供结构化而非单体式 3D 资产生成能力。
- [Diffusion as Shader](https://github.com/IGL-HKUST/DiffusionAsShader)：SIGGRAPH 2025 官方项目，Apache-2.0 许可，提供 3D 控制与生成式视觉设计的新路线。
- [CraftsMan](https://github.com/HKUST-SAIL/CraftsMan3D)：HKUST SAIL 官方原创模型代码，方向清晰且具备可编辑几何价值。
- [TripoSG](https://github.com/VAST-AI-Research/TripoSG)：Tripo 团队官方原创项目，MIT 许可、模型路线和图像到 3D 用途明确。
- [Matrix-3D](https://github.com/SkyworkAI/Matrix-3D)：官方原创项目，MIT 许可，明确覆盖 3D 场景生成、重建、全景合成与世界模型。
- [EmbodiedGen](https://github.com/HorizonRobotics/EmbodiedGen)：企业官方原创项目，2026 年仍持续更新，覆盖生成式场景和具身仿真的关键交叉方向。
- [HY-World 2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0)：腾讯混元官方项目，2026 年发布并获得持续关注，完整覆盖本次扩充的三个核心方向。
- [MesaTask](https://github.com/InternRobotics/MesaTask)：NeurIPS 2025 Spotlight 官方实现，MIT 许可，原创任务驱动场景生成路线明确。
- [One2Scene](https://github.com/Wang-pengfei/One2Scene)：ICLR 2026 作者官方代码与模型已公开，是单图生成可探索 360 度 AI 世界的代表项目。
- [DiffSplat](https://github.com/chenguolin/DiffSplat)：ICLR 2025 作者官方实现与模型公开，补足单图 3DGS 生成和快速资产原型方向。

### 生成式图像 / 视频与世界模型

- [SANA](https://github.com/NVlabs/Sana)：NVIDIA 官方原创图像、视频和世界模型实现，公开推理代码与Apache-2.0明确，近期持续维护；直接符合设计素材、视频和空间模型方向。

### AI Agents

- [Hermes Agent](https://github.com/NousResearch/hermes-agent)：保留 2026-10-27 的判断；本日重新核对官方元数据、README、根目录与活动证据。历史限制：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。
- [Vibe Trading](https://github.com/HKUDS/Vibe-Trading)：保留既有正式跟踪；当前 README、根目录、README 安装或使用说明及最近提交、Issue/PR 与发布入口已核验；Stars 不单独决定质量，未安装外部代码或复测性能。

### AI Coding

- [Claude Code](https://github.com/anthropics/claude-code)：人工 approved 保留；当前 v2.1.312，官方分发、插件及示例可核验，商业 LICENSE 不表示完整核心开源。
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)：Existing approved project retained from the formal tracked inventory.
- [Grok Build](https://github.com/xai-org/grok-build)：Existing approved project retained from the formal tracked inventory.
- [Google Antigravity CLI](https://github.com/google-antigravity/antigravity-cli)：Existing approved project retained from the formal tracked inventory.

### WAIC 物理 AI / 机器人学习、控制与数据

- [InternManip](https://github.com/InternRobotics/InternManip)：上海 AI Lab 官方操作学习基础设施，可降低不同数据集和模型之间的工程割裂。
- [NavDP](https://github.com/InternRobotics/NavDP)：ICRA 2026 官方 Sim2Real 导航项目，直接体现用高效仿真数据驱动真实机器人决策。
- [RoboInter](https://github.com/InternRobotics/RoboInter)：上海 AI Lab ICLR 2026 官方完整套件，覆盖数据、推理、规划和执行，是物理 AI 核心项目。
- [InternNav](https://github.com/InternRobotics/InternNav)：上海 AI Lab 官方导航主线，连接空间理解、语言指令和真实机器人移动控制。
- [RoboSplat](https://github.com/InternRobotics/RoboSplat)：把 3DGS 与机器人策略训练直接结合，和平台现有 3D 重建主线具有高协同价值。
- [Unitree RL Gym](https://github.com/unitreerobotics/unitree_rl_gym)：国内人形机器人运动控制的重要官方基线，适合持续跟踪物理 AI 从策略到硬件的落地。
- [UltraDexGrasp](https://github.com/InternRobotics/UltraDexGrasp)：上海 AI Lab ICRA 2026 官方项目，命中制造和服务机器人最关键的灵巧操作能力。

### 模型训练 / Agent 工程

- [Tinker Cookbook](https://github.com/thinking-machines-lab/tinker-cookbook)：candidate-decisions 已批准；官方仓库、Apache-2.0 许可、持续提交、正式 release 和完整教程均已核验。

### 世界模型 / 机器人遥操作

- [RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop)：candidate-decisions 已批准；官方组织下的精确仓库已核验，含训练、推理、配置和示例代码。

### 3D 生成 / 设计工具

- [img2threejs](https://github.com/img2threejs/img2threejs)：2026-07-21 首次收录后持续进入 surging 队列，仓库已迁移到官方组织并发布 v1.5.0；Apache-2.0 许可、原创程序化 3D 流程、浏览器 Demo、近期提交和社区增长均已核验，继续正式跟踪。
- [Text-To-3D-Generation](https://github.com/Lidong1793/Text-To-3D-Generation)：仓库包含可运行的流程编排、参数消融、结果记录和网页演示，适合 3D AI 学习与产品原型；但它不是原创 Text-to-3D 模型，且许可证与几何质量边界尚未解决，因此作为设计工具观察收录。

### 3DGS / 三维工具

- [Godot Gaussian Splatting](https://github.com/ReconWorldLab/godot-gaussian-splatting)：进入 OSS Insight 24 小时前 20，且与 3DGS/设计工具主线高度一致；可运行性、许可和近期发行均已核验。

### 视频生成 / 自动剪辑

- [Toonflow](https://github.com/HBAI-Ltd/Toonflow-app)：命中 OSS Insight 24 小时趋势且产品实现完整；在明确记录非标准许可风险的前提下纳入持续跟踪。

### 开放模型 / 训练效率

- [Modded-NanoGPT](https://github.com/KellerJordan/modded-nanogpt)：同日 AI 日报强制候选，OpenAI 官方报告直接链接；MIT 许可、2,000 余次提交、完整 README 与可运行训练流程均已核验。

### 开放模型 / 模型训练

- [LLaMA Factory](https://github.com/hiyouga/LlamaFactory)：本地快照新增 Stars 25 且近期持续维护；成熟度、原创性、可安装性和开放模型方向价值均通过质量门槛。

### WAIC 物理 AI / 世界模型与空间智能

- [Genie Envisioner](https://github.com/AgibotTech/Genie-Envisioner-V1)：智元机器人官方具身世界模型主线，可与 Genie Sim、EVAC 和 EWMBench 形成完整观察链路。
- [EWMBench](https://github.com/AgibotTech/EWMBench)：世界模型进入机器人控制前必须有可比较的评测体系，该项目是智元官方关键基础设施。
- [Cosmos Predict 2.5](https://github.com/nvidia-cosmos/cosmos-predict2.5)：物理 AI 世界模型的核心开放平台，可服务机器人、自动驾驶和工业数字孪生的数据生成。
- [World-in-World](https://github.com/World-In-World/world-in-world)：ICLR 2026 Oral 官方项目，解决传统世界模型只看离线视频指标、忽略行动反馈的问题。
- [ARTDECO](https://github.com/InternRobotics/ARTDECO)：上海 AI Lab ICLR 2026 官方项目，直接补齐物理 AI 从视觉输入到结构化空间状态的环节。
- [JEPA World Models](https://github.com/facebookresearch/jepa-wms)：Meta 官方将世界模型落到机器人规划的研究代码，适合持续观察预测表征的实用边界。
- [AgiBot World Model Baseline](https://github.com/AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline)：智元机器人官方世界模型基线，直接反映物理 AI 从感知预测走向闭环行动的发展。
- [V-JEPA 2](https://github.com/facebookresearch/vjepa2)：Meta 官方世界模型研究主线，把大规模视频学习与真实机器人规划直接连接起来。

### Agent Skills / 音频生成

- [ElevenLabs Skills](https://github.com/elevenlabs/skills)：同日 AI 强制候选；官方、可安装、有测试且对多媒体 Agent 工作流有直接实用价值。

### 具身智能 / Agentic RL

- [RLinf](https://github.com/RLinf/RLinf)：P0 物理 AI 候选；原创实现、近期提交、README、安装文档和社区协作证据充分，综合质量达到 A。

### 3D / OpenUSD 实验

- [Omniverse Labs](https://github.com/NVIDIA-Omniverse/omniverse-labs)：同日 AI 强制候选；与 OpenUSD/3D 工具链高度相关，但因实验性质和较短历史定为 B。

### 模型后训练 / Agentic RL

- [Tunix](https://github.com/google/tunix)：同日 AI 强制候选；官方 Agentic RL 更新直接对应仓库，原创性、维护和可复现性证据充分。

### 设计系统 / AI 辅助设计

- [Astryx](https://github.com/meta/astryx)：P0 AI 设计工具候选；官方关系、原创实现、可安装性、Demo、release 和维护证据充分，综合质量达到 A。

### Agent Skills / Gemini 开发

- [Gemini Skills](https://github.com/google-gemini/gemini-skills)：同日 AI 强制候选；精确官方仓库、可安装性和维护证据均已核验，同时保留非正式支持风险。

### 生成模型 / 推理基础设施

- [Hugging Face Diffusers](https://github.com/huggingface/diffusers)：同日 AI 强制候选；精确官方仓库、原创实现、可安装性和活跃维护均已核验，综合质量达到 A+。

### 3D 场景描述 / 设计基础设施

- [OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD)：同日 AI 强制候选；官方 release 与精确仓库已核验，对 3D/AEC/设计互操作具有基础设施级价值。

### 生成模型 / 原生多模态理解与生成

- [SenseNova-U1](https://github.com/OpenSenseNova/SenseNova-U1)：统一多模态理解与生成、中文高密度信息图、图文交错内容和开放训练链路均具有直接产品价值，列为生成式模型 A+ 重点跟踪项目。

### 3D 地理空间 / Agent 工具

- [Cesium AI Integrations](https://github.com/CesiumGS/cesium-ai-integrations)：同日 AI 强制候选；官方关系明确，可运行集成与 3D/设计自动化方向高度相关。

### 模型推理 / GPU Kernels

- [Hugging Face Kernels](https://github.com/huggingface/kernels)：同日 AI 强制候选；官方关系、原创性、可用性和近期维护证据充分，综合质量达到 A。

### AI for Science / 科研 Agent

- [Microsoft Discovery](https://github.com/microsoft/discovery)：同日 AI 强制候选；Microsoft 官方关系、可安装应用、科研 Agent 目录、starter kits 和协作维护均已核验，综合质量达到 A。

### Agent 协议 / 兼容性测试

- [MCP Conformance](https://github.com/modelcontextprotocol/conformance)：同日 AI 强制候选；官方关系、协议价值、原创实现和维护证据充分，综合质量达到 A。

### 生成模型 / 模型压缩

- [Diffuse Compressor](https://github.com/rootonchair/diffuse-compressor)：同日 AI 强制候选；原创性和可用性证据充分，但生态与长期维护证据较短，定为 B+。

### 图像生成 / 开放模型

- [FLUX](https://github.com/black-forest-labs/flux)：同日 AI 强制候选；精确官方仓库可验证，但对 FLUX 3 权重开放状态保持审慎，不作超出证据的推断。

### 3D 重建

- [LingBot-Map](https://github.com/Robbyant/lingbot-map)：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。
- [FLARE](https://github.com/robbyant-research/FLARE)：蚂蚁研究官方原创实现，属于前馈重建与快速场景建模的重点候选。
- [Neuralangelo](https://github.com/NVlabs/neuralangelo)：NVIDIA 官方 CVPR 2023 实现，原创性和高精度表面重建价值明确。
- [NeuralRecon](https://github.com/zju3dv/NeuralRecon)：CVPR 2021 Oral 论文作者官方代码，Apache-2.0 许可，作为实时单目重建基线仍有价值。
- [VGG-T3](https://github.com/nv-dvl/vgg-ttt)：NVIDIA Deep Vision Lab 官方论文代码，属于 LingBot-Map 同类前馈重建新路线。
- [FineRecon](https://github.com/apple-aiml-research/ml-finerecon)：Apple 官方机器学习研究仓库，论文与实现关系明确，适合补齐高精度室内重建路线。
- [MapAnything](https://github.com/facebookresearch/map-anything)：Meta 官方研究仓库，Apache-2.0 许可、原创模型与完整任务范围明确，属于 LingBot-Map 同类核心底座。
- [WorldMirror](https://github.com/Tencent-Hunyuan/HunyuanWorld-Mirror)：腾讯混元官方 ICML 2026 项目，原创模型、代码和世界模型方向均清晰。
- [VGGT](https://github.com/facebookresearch/vggt)：Meta 官方研究仓库，包含原创实现和模型资源，行业适配度高。
- [Stable Fast 3D](https://github.com/Stability-AI/stable-fast-3d)：Stability AI 官方原创实现，具有清晰的图像到 3D 应用价值。
- [MoGe](https://github.com/microsoft/MoGe)：Microsoft 官方研究实现，原创论文与代码关系明确。
- [Nerfstudio](https://github.com/nerfstudio-project/nerfstudio)：成熟原创工具链，长期被 3D 重建研究与工程流程采用；高质量实景扫描优先验证 Splatfacto-big。

### 视频自动剪辑 / Agent

- [OpenMontage](https://github.com/calesthio/OpenMontage)：实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。
- [ViMax](https://github.com/HKUDS/ViMax)：香港大学团队官方开源视频生产智能体，适合作为自动编导和多 Agent 协作的观察样本。

### 视频自动剪辑 / 程序化制作

- [Remotion](https://github.com/remotion-dev/remotion)：成熟的程序化视频生产工具，可把 AI 生成的脚本、素材和结构稳定转成可重复渲染的成片。

### WAIC 物理 AI / VLA 与机器人基础模型

- [OpenPI](https://github.com/Physical-Intelligence/openpi)：当前开放 VLA 体系的重要基线，模型、训练和部署链路对通用机器人研究具有高参考价值。
- [LeRobot](https://github.com/huggingface/lerobot)：Hugging Face 官方机器人生态底座，适合持续跟踪模型从研究代码走向真实设备部署。
- [starVLA](https://github.com/starVLA/starVLA)：提供可比较、可扩展的 VLA 工程底座，适合跟踪 PhysBrain、NeuroVLA 等新策略。
- [InternVLA-A Series](https://github.com/InternRobotics/InternVLA-A-series)：上海 AI Lab 官方 VLA 主线项目，体现理解、生成和行动统一建模的发展趋势。
- [ACoT-VLA](https://github.com/AgibotTech/ACoT-VLA)：智元机器人官方 VLA 基线，直接覆盖物理 AI 的感知、认知、决策与执行闭环。
- [MolmoAct 2](https://github.com/allenai/molmoact2)：Ai2 官方开放物理 AI 模型，强调空间理解和动作生成，是多模态模型走向机器人执行的重要路线。
- [InternVLA-M1](https://github.com/InternRobotics/InternVLA-M1)：上海 AI Lab 官方通用操作策略，和 WAIC 空间智能、具身交互主题高度一致。
- [OpenVLA](https://github.com/openvla/openvla)：开放 VLA 领域的核心项目，可作为新模型、数据集和机器人策略的长期比较基线。
- [UniVLA](https://github.com/OpenDriveLab/UniVLA)：OpenDriveLab 官方通用机器人策略项目，代表用统一动作表示降低本体碎片化的关键方向。

### WAIC 物理 AI / 仿真、合成数据与 Sim2Real

- [Isaac Lab](https://github.com/isaac-sim/IsaacLab)：当前物理 AI 仿真和合成数据的重要工业底座，机器人研究与产品验证均应持续关注。
- [Cosmos Transfer 2.5](https://github.com/nvidia-cosmos/cosmos-transfer2.5)：NVIDIA 官方物理 AI 数据生成主线，直接服务 Sim2Real、机器人感知和世界仿真。
- [MolmoSpaces](https://github.com/allenai/molmospaces)：Ai2 官方 simulation-first 物理 AI 栈，覆盖场景、数据、训练和 Sim2Real 的完整链路。
- [MuJoCo](https://github.com/google-deepmind/mujoco)：Google DeepMind 官方基础设施，是机器人算法比较和可复现实验的长期核心基线。
- [Habitat Lab](https://github.com/facebookresearch/habitat-lab)：Meta 官方具身 AI 任务层基础设施，覆盖空间导航到移动操作的关键研究路径。
- [ManiSkill](https://github.com/mani-skill/ManiSkill)：操作学习领域的成熟开放平台，适合统一验证 VLA、模仿学习和强化学习策略。
- [Unitree MuJoCo](https://github.com/unitreerobotics/unitree_mujoco)：连接国内主流机器人硬件与开放物理仿真的官方项目，对 WAIC 人形机器人方向具有直接价值。
- [RoboTwin](https://github.com/RoboTwin-Platform/RoboTwin)：覆盖数字孪生、合成数据和双臂操作，是制造业物理 AI 需要长期关注的工程平台。
- [Genesis](https://github.com/Genesis-Embodied-AI/genesis-world)：新一代开放物理仿真平台，能够补充传统机器人模拟器在速度和生成式场景上的能力。
- [BEHAVIOR-1K / OmniGibson](https://github.com/StanfordVL/BEHAVIOR-1K)：Stanford 官方大规模交互式任务基准，适合检验机器人是否真正理解并改变物理环境。
- [RoboCasa](https://github.com/robocasa/robocasa)：把高质量室内场景生成与机器人操作结合，适合关注空间设计和具身任务的交叉方向。
- [Habitat Sim](https://github.com/facebookresearch/habitat-sim)：Meta 官方具身仿真底座，与 Habitat Lab 共同构成空间智能研究的核心平台。

### 视频生成 / 基础模型

- [HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo)：腾讯官方高影响力开源视频模型，是自建视频生成能力和第三方工作流适配的核心基线。

### 视频生成 / 音视频联合模型

- [Kandinsky 6.0](https://github.com/kandinskylab/kandinsky-6)：官方模型、许可、代码与集成说明可核验，符合视频模型主线，纳入正式持续跟踪。
- [Prism](https://github.com/Tencent-Hunyuan/Prism)：作者论文、腾讯混元官方代码和模型卡相互链接，原创研究方向明确；先进入观察库存，不宣称生产成熟。

### 视频自动剪辑 / 时间线

- [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO)：Academy Software Foundation 核心项目，是 AI 自动剪辑结果进入专业后期软件的可靠基础设施。

### 视频编辑 / 稀疏控制

- [NOVA](https://github.com/WeChatCV/NovaEdit)：微信视觉团队 CVPR 2026 官方仓库，代表低标注成本视频编辑的新方向。

### 视频编辑 / 区域控制

- [ReCo](https://github.com/HiDream-ai/ReCo)：ICML 2026 官方实现，模型、数据和编辑评测链路较完整，工程可验证性较强。

### 视频编辑 / 分层分解

- [EasyOmnimatte](https://github.com/GVCLab/EasyOmnimatte)：CVPR 2026 官方实现，提供从单层视频走向结构化可编辑素材的重要能力。

### 视频 3D 舞台 / 全景生成

- [OmniRoam](https://github.com/yuhengliu02/OmniRoam)：SIGGRAPH 2026 作者官方项目，直接覆盖全景视频、三维重建和沉浸式舞台内容。

### 视频 3D 舞台 / 重拍

- [Vista4D](https://github.com/Eyeline-Labs/Vista4D)：CVPR 2026 Highlight 官方代码、模型和数据已发布，直接对应视频 3D 舞台与虚拟摄影。

### 视频 3D 舞台 / 世界生成

- [WorldStereo](https://github.com/FuchengSu/WorldStereo)：腾讯混元与浙大团队 CVPR 2026 官方项目，代码和模型权重已发布，是视频生成与 3D 场景融合的核心路线。

### 视频 3D 舞台 / 几何一致生成

- [World-R1](https://github.com/microsoft/World-R1)：微软 ICML 2026 官方仓库，明确解决视频生成缺乏 3D 一致性和镜头控制的问题。

### 视频 3D 舞台 / 视差动画

- [DepthFlow](https://github.com/BrokenSource/DepthFlow)：工程化程度较高，可作为低成本图片转 3D 镜头、舞台背景和短视频动效工具。

### 视频 3D 舞台 / 虚拟摄影机

- [Stable Virtual Camera](https://github.com/Stability-AI/stable-virtual-camera)：Stability AI 官方开放项目，为产品化的虚拟摄影机、镜头预演和空间视频生成提供基线。

### 视频 3D 舞台 / 文生三维

- [VIST3A](https://github.com/gohyojun15/VIST3A)：ICLR 2026 Oral 作者官方实现，代表利用视频先验构建 3D 资产和舞台的新方法。

### 视频 3D 舞台 / 空间理解

- [VLM-3R](https://github.com/VITA-Group/VLM-3R)：CVPR 2026 官方实现，训练、评测和模型权重已开放，是视频空间理解连接多模态 Agent 的重要组件。

### WAICA 2026 / 视频理解

- [RoboFAC](https://github.com/MINT-SJTU/RoboFAC)：WAICA 2026 主会议录用，上海交大团队官方仓库提供完整的视频诊断与纠错实现。

### 3D 场景评测

- [SceneEval](https://github.com/3dlg-hcvc/SceneEval)：WACV 2026 Oral 作者官方代码，可作为物理场景生成质量核验和自动回归测试基础。

### 视频算法 / 跟踪

- [CoTracker](https://github.com/facebookresearch/co-tracker)：Meta 官方点跟踪基线，可直接支撑视频稳像、运动分析、3D 重建和虚拟摄影。

### 视频算法 / 动作识别

- [MMAction2](https://github.com/open-mmlab/mmaction2)：视频内容分类、片段检索和自动摘要的成熟工程底座，维护周期长且生态完整。

### 视频算法 / 表征学习

- [VideoMAE](https://github.com/MCG-NJU/VideoMAE)：视频基础表征的高影响力官方实现，适合作为自有行业视频模型训练基线。

### WAICA 2026 / 数据智能

- [AIDABench](https://github.com/MichaelYang-lyx/AIDABench)：WAICA 2026 主会议录用项目，论文标题、作者与官方仓库可相互核验。

### WAICA 2026 / Agent 训练

- [InternBootcamp](https://github.com/InternLM/InternBootcamp)：官方仓库明确标注 InternBootcamp 技术报告被 WAICA 2026 接收，并提供对应代码版本。

### 视频算法 / 多模态理解

- [VideoLLaMA 2](https://github.com/DAMO-NLP-SG/VideoLLaMA2)：阿里达摩院团队官方实现，覆盖视频内容理解向自然语言检索与摘要的关键链路。

### 视频生成 / 编辑模型

- [Bernini](https://github.com/bytedance/Bernini)：字节跳动 2026 官方开源项目，代码与权重完整，是生成和编辑统一化的重要新路线。

### 视频算法 / 基础模型

- [InternVideo](https://github.com/OpenGVLab/InternVideo)：上海人工智能实验室官方视频基础模型项目，适合长期跟踪开放模型与评测进展。
- [VideoChat-Flash](https://github.com/OpenGVLab/VideoChat-Flash)：OpenGVLab 官方仓库，原 InternVideo2 地址已重定向至该 canonical 项目，可持续跟踪长视频理解能力。

### 视频生成 / 多模态模型

- [Lance](https://github.com/bytedance/Lance)：字节跳动 2026 官方研究仓库，方向同时覆盖视频理解、生成和编辑，适合列为前沿跟踪。

### 视频算法 / 4D 轨迹

- [TraceAnything](https://github.com/ByteDance-Seed/TraceAnything)：字节跳动 Seed 官方 ICLR 2026 项目，是视频运动理解连接 4D 场景与虚拟制作的重要底层能力。

### 视频自动剪辑 / 内容生产

- [Vidi](https://github.com/bytedance/vidi)：字节跳动官方项目，直接命中“视频理解后自动剪辑”的完整工作流，而非单一视觉模型。

### 视频生成 / 长视频

- [Stable Video Infinity](https://github.com/vita-epfl/Stable-Video-Infinity)：EPFL 团队 ICLR 2026 Oral 官方实现，是长视频生成与连续舞台背景的重要研究方向。

### 视频算法 / 人体 4D

- [ActionMesh](https://github.com/facebookresearch/actionmesh)：Meta 官方视频到可动画网格项目，直接连接算法研究与 3D 角色舞台生产。

### 视频自动剪辑 / 指令编辑

- [Kiwi-Edit](https://github.com/showlab/Kiwi-Edit)：作者团队官方 2026 项目，代码、数据和编辑范式较完整，可用于自动视频修改能力评估。

### 视频生成 / 语义控制

- [Video-As-Prompt](https://github.com/bytedance/Video-As-Prompt)：字节跳动官方 ICLR 2026 项目，已提供低显存训练与推理路径，适合镜头运动和动效复用。

### AI 图像与视频生成工具

- [SD.Next](https://github.com/vladmandic/sdnext)：命中 AI 图像/视频生成与设计工具 P0 方向；原创性、可安装性、许可、成熟度和持续维护均通过质量门槛。

### 视频生成 / 轻量模型

- [HunyuanVideo 1.5](https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5)：腾讯混元官方 2026 迭代，能持续反映开放视频模型向更轻量部署发展的进度。

### 视频生成 / RGBA 合成

- [Wan-Alpha](https://github.com/WeChatCV/Wan-Alpha)：微信视觉团队 CVPR 2026 Highlight 官方实现，直接解决视频生成进入专业合成流程的关键格式问题。

### 视频编辑 / 实时控制

- [EditCtrl](https://github.com/yehonathanlitman/EditCtrl)：CVPR 2026 作者官方代码，适合跟踪视频编辑从离线生成走向交互式创作的进展。

### 视频编辑 / 评测基准

- [IVEBench](https://github.com/RyanChenYN/IVEBench)：ICLR 2026 官方基准，可用于统一比较不同视频编辑模型，避免仅凭演示视频判断质量。

### 3DGS

- [SuperSplat](https://github.com/playcanvas/supersplat)：PlayCanvas 官方原创编辑器，产品完成度和近期维护状态均较好。
- [Spark](https://github.com/sparkjsdev/spark)：由 World Labs 团队推动的原创渲染项目，仓库活跃且使用路径清晰。
- [FreeSplatter](https://github.com/TencentARC/FreeSplatter)：腾讯 ARC 官方 ICCV 2025 实现，原创论文与代码对应，直接补充无位姿 3DGS 重建路线。
- [StreamSplat](https://github.com/DSL-Lab/StreamSplat)：论文作者官方实现，聚焦在线动态重建，和 LingBot-Map 的流式空间理解路线直接相关。
- [3DGRUT](https://github.com/nv-tlabs/3dgrut)：NVIDIA 研究团队官方原创实现，Apache-2.0 许可、近期维护活跃且直接服务 3DGS 工程。
- [AnySplat](https://github.com/InternRobotics/AnySplat)：作者团队公开训练、推理、模型与 Gradio 演示，直接覆盖随手拍稀疏多图重建。
- [3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)：论文作者官方原创实现，属于 3DGS 必收录的基础仓库。
- [MVSplat](https://github.com/donydchen/mvsplat)：ECCV 2024 Oral 作者官方代码与预训练模型完整，被多项后续稀疏视图方法作为基础。
- [StructSplat](https://github.com/J-C-Zhao/StructSplat)：ECCV 2026 作者官方训练、评测代码与权重已公开，属于未标定稀疏视图的最新 SOTA 路线。
- [MVSplat360](https://github.com/donydchen/mvsplat360)：NeurIPS 2024 作者官方代码与模型公开，补足稀疏多图到 360 度场景合成路线。
- [DepthSplat](https://github.com/cvg/depthsplat)：CVPR 2025 作者官方代码、模型与多视图配置齐全，是多图产品原型和高质量重建的重要基线。
- [pixelSplat](https://github.com/dcharatan/pixelsplat)：CVPR 2024 Oral 与最佳论文候选作者代码，是后续 MVSplat、NoPoSplat 等方法的基础参照。
- [FastGS](https://github.com/fastgs/FastGS)：CVPR 2026 官方代码、模型和多任务分支已发布，适合评估高质量扫描的吞吐与成本。
- [VolSplat](https://github.com/ziplab/VolSplat)：ECCV 2026 作者官方训练、评测代码与模型已公开，是体素对齐前馈 3DGS 的最新路线。
- [NoPoSplat](https://github.com/cvg/NoPoSplat)：ICLR 2025 Oral 作者官方代码和多组预训练权重可用，是无位姿稀疏多图的关键基线。
- [ReSplat](https://github.com/cvg/resplat)：ECCV 2026 作者官方代码和模型已公开，提供比一次性前馈模型更可控的测试时质量提升路径。
- [SHARP](https://github.com/apple-aiml-research/ml-sharp)：Apple 官方论文代码、模型权重与命令行流程完整，是单图快速试验的首选基线。
- [AdaptSplat](https://github.com/xmw666/AdaptSplat)：解决前馈 3DGS 跨域迁移这一实际落地瓶颈，适合作为快速重建产品的模型适配层持续观察，按 B+ 级正式跟踪。
- [InstantHDR](https://github.com/Bugjudger/InstantHDR)：将 HDR 成像与前馈 3DGS 初始化直接结合，补足高光、暗部和曝光变化场景的实景重建能力，按 A 级正式跟踪。
- [gsplat](https://github.com/nerfstudio-project/gsplat)：Nerfstudio 团队维护的原创基础设施，近期仍持续更新；MCMC 是高质量实景扫描的重要实验路线。
- [Depth Anything 3](https://github.com/ByteDance-Seed/Depth-Anything-3)：ByteDance Seed 官方代码和模型齐全，输入形态与导出链路完整，适合作为产品原型的统一几何底座。

### 个人 AI 助手 / Agent 平台

- [OpenClaw](https://github.com/openclaw/openclaw)：同日 AI 强制候选；官方关系、原创实现、可安装性、持续发布和维护活跃度充分，综合质量达到 A。

### AI Security

- [Strix](https://github.com/usestrix/strix)：保留既有正式跟踪；当前 README、根目录、README 安装或使用说明及最近提交、Issue/PR 与发布入口已核验；Stars 不单独决定质量，未安装外部代码或复测性能。

### 物理一致 3D

- [SAM3D-Phys](https://github.com/CHNxindong/SAM3D-Phys_code)：项目页直链的作者官方仓库，研究主题高度匹配；作为代码发布观察项收录，不将其标记为已可用。
- [REST3D](https://github.com/ShirleyMaxx/REST3D)：论文作者官方仓库且已发布完整代码，直接覆盖场景图、支撑关系、碰撞修正与重力稳定这一前沿方向。
- [TelePhysics](https://github.com/xinzhang007/PhysOmni)：ACM MM 2026 作者官方代码，直接处理物体穿透、空间错位、碰撞响应和多材料动力学。

### 物理场景生成

- [SceneWeaver](https://github.com/Scene-Weaver/SceneWeaver)：NeurIPS 2025 官方实现，具备碰撞规避、边界约束和可交互室内场景输出能力。
- [PhyScene](https://github.com/PhyScene/PhyScene)：CVPR 2024 Highlight 官方完整实现，是物理约束室内场景生成的重要公开基线。

### 仿真就绪 3D

- [REACT3D](https://github.com/troyehuang/REACT3D)：ETH Zurich 与 Microsoft 作者官方 RA-L 2026 代码，直接解决静态重建无法物理交互的问题。
- [SceneCode](https://github.com/wangpuyi/SceneCode)：论文作者官方开源仓库，MIT 许可，连接了空间设计、程序化建模、可编辑资产和物理仿真。
- [SceneSmith](https://github.com/nepfaff/scenesmith)：MIT 与 Toyota Research Institute 的 ICML 2026 Spotlight 官方代码，MIT 许可且工程链条完整。
- [Lightwheel SimReady Assets](https://github.com/LightwheelAI/Lightwheel-simready-asset)：Lightwheel 官方资产库，定位清晰且直接补足 SimReady 数据与场景资产层。
- [Genie Sim](https://github.com/AgibotTech/genie_sim)：企业官方主仓库、近期持续维护且已有稳定关注度，是生成式仿真基础设施的重要样本。
- [SimArt](https://github.com/ByteDance-Seed/SimArt)：字节 Seed 官方 SIGGRAPH 2026 项目，Apache-2.0 许可，原创性和 SimReady 方向高度明确。
- [Fysiverse 3D SimReady](https://github.com/Fysics-AI/Fysiverse-3D-SimReady)（已下架：2026-09-08，保留历史记录）：只有 5 Stars 仍按 P0 审查。实读 SAM3D 调用、仿真入口和 assistance 实现，有分割/几何对齐/SAPIEN settling、场景导出和可选 3DGS 流程，批准。安装须另配模型和 Blender；场景图、补图及 Agent 仿真可依赖外部 API。不是完整自有模型/引擎开源，未复现。

### 3D 场景重建

- [Gen3DSR](https://github.com/AndreeaDogaru/Gen3DSR)：3DV 2025 作者官方实现，是 REST3D、PhyMix 等方法使用和比较的单图场景重建基础路线。
- [REPARO](https://github.com/VincentHancoder/REPARO)：论文作者官方实现，可作为从多对象视觉重建走向场景级物理修正的关键上游组件。

### 3DGS 物理仿真

- [PhySimGS](https://github.com/PhySimGS/PhySimGS)：官方项目页直链仓库，补充了 3DGS 从静态视觉表示走向对象级物理模拟的重要路线。

### 仿真标准与验证

- [SimReady Foundation](https://github.com/NVIDIA/simready-foundation)：NVIDIA 官方 Apache-2.0 项目，可作为判断 AI 生成资产是否真正达到 SimReady 的工程基准。

### 视频算法 / 分割

- [SAM 2](https://github.com/facebookresearch/sam2)：视频抠像、目标替换、特效跟踪和自动剪辑的通用基础组件，官方代码与权重生态成熟。

### 3DGS / 机器人地形重建

- [MoonGS / MoonBlender](https://github.com/InRobots/MoonBlender)：含 MoonGS 代码，README 克隆指令指向 xiaoc57/MoonGS，不能仅据 owner 推断原作者关系；根许可未核实，最近提交2025-10-09。

### 建筑 / AEC

- [Speckle](https://github.com/specklesystems/speckle-server)：Speckle 官方主仓库，属于建筑数据协作与自动化的核心基础设施。
- [FreeCAD](https://github.com/FreeCAD/FreeCAD)：官方主仓库、持续维护且行业覆盖完整，是 CAD/AEC 基础项目。
- [COMPAS](https://github.com/compas-dev/compas)：计算建筑领域的原创基础框架，近期仍在维护。
- [Hypar Elements](https://github.com/hypar-io/Elements)：Hypar 官方原创 BIM 库，活跃且定位清晰。
- [Text2BIM](https://github.com/dcy0577/Text2BIM)：论文对应的原创实现，方向高度匹配，即使热度较低也应纳入观察库。
- [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell)：长期维护的原创 IFC 基础设施，建筑与 BIM 方向必须收录。

### 设计工具

- [CADAM](https://github.com/Adam-CAD/CADAM)：原创开源产品，具备完整交互、导出和近期发布记录。
- [Penpot](https://github.com/penpot/penpot)：官方主仓库、长期维护、非复刻演示，具备真实团队使用价值。
- [OpenPencil](https://github.com/open-pencil/open-pencil)：官方原创实现、近期持续推送，符合 AI 设计工具方向。

### 开放模型

- [GPT-OSS](https://github.com/openai/gpt-oss)：模型发布方官方仓库，开放权重、代码和使用路径完整。
- [Qwen3](https://github.com/QwenLM/Qwen3)：官方主仓库，属于开放模型生态的核心长期跟踪对象。
- [Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T)：NVIDIA 官方模型仓库，2026 年持续发布新版本，适合作为空间智能前沿观察项。
- [Cube 3D](https://github.com/Roblox/cube)：Roblox 官方模型与代码仓库，2026 年继续发布 CubePart 更新。
- [WorldEngine](https://github.com/OpenDriveLab/WorldEngine)：OpenDriveLab 官方原创项目，2026 年创建并持续维护。
- [TRELLIS](https://github.com/microsoft/TRELLIS)：Microsoft 官方 CVPR 2025 Spotlight 项目，MIT 许可且工程生态成熟，是 3D 生成基础模型核心仓库。

### 室内与空间

- [Lightwheel Kitchen](https://github.com/LightwheelAI/Lightwheel_Kitchen)：官方原创室内仿真场景，直接连接厨房空间、可交互资产与机器人训练。
- [SpatialLM](https://github.com/manycore-research/SpatialLM)：官方论文代码与模型方向明确，直接服务室内空间理解和结构化建模。
- [HouseCrafter](https://github.com/neu-vi/houseCrafter)：ICCV 2025 Highlight 官方代码与预训练模型，原创性和场景价值明确。
- [InteriorGS](https://github.com/manycore-research/InteriorGS)：官方数据仓库，覆盖室内设计与 3DGS 的交叉重点方向。
- [RoomFormer](https://github.com/ywyue/RoomFormer)：CVPR 2023 官方原创实现，是户型重建方向的有效基础项目。
- [SpatialGen](https://github.com/manycore-research/SpatialGen)：3DV 2026 官方实现，原创训练代码与室内生成任务高度相关。
- [SceneScript](https://github.com/facebookresearch/scenescript)：Meta 官方研究代码，面向室内空间结构化表达，非第三方复刻。

### 模型推理 / 基础设施

- [vLLM](https://github.com/vllm-project/vllm)：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。

### 空间智能 / 智能体评测

- [Geospatial Reasoning Benchmarks](https://github.com/google-research/geospatial-reasoning-benchmarks)：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。

### AI 设计工具 / 无限画布

- [Infinite Canvas](https://github.com/basketikun/infinite-canvas)：原创多模态节点画布、web 与 canvas-agent 继续跟踪，MIT。实读 canvas-proxy/index.js，默认 loopback 但设置通配 CORS 并转发目标 URL；仓库已有对应问题报告。保留已有批准并记录部署关注项，未运行代理或复现利用。赞助商价格及模型供应商宣称不作为质量证据。

### Agent 数据基础设施 / 文档解析与转换

- [PDF Inspector](https://github.com/firecrawl/pdf-inspector)：它解决 AI 数据管线中 PDF 是否需要 OCR、如何保留阅读顺序和表格结构的关键前置问题，并与 Firecrawl 网页采集形成完整文档入口，按 A 级正式跟踪。

### Agent 工程基础设施 / 编码智能体

- [nac](https://github.com/arcee-ai/nac)：该项目直接命中开源编码智能体、长程工程执行与本地安全沙箱方向，且由 AI 大事件的一手来源触发，按 B+ 级正式跟踪。

### Agent Infrastructure

- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)：Existing approved project retained from the formal tracked inventory.
- [NitroStack](https://github.com/nitrocloudofficial/nitrostack)：Existing approved project retained from the formal tracked inventory.

### AI 3D

- [Meshy 3D Agent](https://github.com/meshy-dev/meshy-3d-agent)：Existing approved project retained from the formal tracked inventory.
- [TripoSR](https://github.com/VAST-AI-Research/TripoSR)：Existing approved project retained from the formal tracked inventory.

### World Models

- [RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D)：Existing approved project retained from the formal tracked inventory.
- [MIRA World Model](https://github.com/mira-wm/mira)：Existing approved project retained from the formal tracked inventory.

### AI Visualization

- [Flint Chart](https://github.com/microsoft/flint-chart)：Existing approved project retained from the formal tracked inventory.

### CAD / Agent Skills

- [CAD Skills](https://github.com/earthtojake/text-to-cad)：P0 CAD/设计自动化候选；精确仓库、原创性、可运行工作流、活跃维护和交付格式覆盖均已核验，综合质量达到 A。

### AI 安全 / 开发者工具

- [Codex Security](https://github.com/openai/codex-security)：candidate-decisions 已批准 openai-codex-security-plugin；精确官方仓库、可安装实现、当日发布与维护证据均已核验。

### AI Productivity

- [PPT Master](https://github.com/hugohe3/ppt-master)：保留既有正式跟踪；当日官方元数据、README、根目录、提交、Issue/PR 与发布入口已核验。

### Agent 数据语义 / 查询基础设施

- [Malloy](https://github.com/malloydata/malloy)：同日 AI 强制候选；官方关系、原创语义层实现、可安装性和持续维护证据充分，综合质量达到 A。

### AI SDK / Agent 工程

- [Google Gen AI JS SDK](https://github.com/googleapis/js-genai)：最新已完成周报强制候选；官方身份、可安装 SDK、持续维护与 Agent/多模态工程价值均通过质量门槛。

### AEC / 3D 建筑设计

- [Pascal Editor](https://github.com/pascalorg/editor)：命中 AEC/3D P0 方向；官方关系、原创实现、安装与演示入口、近期发布及维护活跃度均通过质量门槛。

### 物理 AI / 世界模型与智能空间

- [Gemini Robotics Samples](https://github.com/google-gemini/robotics-samples)：7 月 31 日 AI 日报强制候选；仓库直接对应 Gemini Robotics 2/ER 2 的物理 Agent、连续视频理解、任务编排和多机器人协作，符合 ark.insight 物理 AI 与智能空间最高优先方向。

### 视频生成 / 物理 AI

- [LingBot-Video](https://github.com/Robbyant/lingbot-video)：P0 具身视频模型，实读 runner 与 DMD 指引，MoE-DMD 模型元数据 HTTP200、权重分片列表可见，批准。8 步需完整模型和特定调度；文档记录约 140 GiB GPU 上约 82 GiB 峰值分配，不是最低显存规格。作者榜单与速度未复测，未下载权重。

### 浏览器 AI / 模型推理

- [Transformers.js](https://github.com/huggingface/transformers.js)：官方关系、原创浏览器推理实现、Apache-2.0 许可、可安装性、近期发布和持续协作均通过质量门槛。

### 端侧 AI / 模型推理

- [MNN](https://github.com/alibaba/MNN)：官方身份、成熟原创实现、Apache-2.0 许可、端侧多模态价值、近期发布与维护活跃度均通过质量门槛。

### 生成式设计 / 官方工作流

- [ComfyUI Workflow Templates](https://github.com/Comfy-Org/workflow_templates)：官方仓库直接承载 H3 Day-0 可复现制作流程，具备原创模板、可安装分发和持续维护证据，因此正式收录。

### 物理 AI / VLA 世界模型

- [ForeAct3D](https://github.com/anthonytao80-crypto/ForeAct3D)：论文明确引用该作者仓库，MIT 与原创研究可确认；复现资料尚需持续复核，作为高优先级研究观察。

### 室内重建 / SimReady 数字孪生

- [LiteReality-Agent](https://github.com/LiteReality/LiteReality-Agent)：官方项目、论文和可运行工具链相互对应，直接覆盖室内设计、真实扫描与仿真资产主线。

### 实时 Agent / WebRTC 基础设施

- [Pion WebRTC](https://github.com/pion/webrtc)：虽然不是 AI 模型仓库，但它是 GPT-Live/WARP 事件直接指向的成熟实时 Agent 传输基础设施，质量和维护证据充分，按 B 级跟踪。

### 具身智能 / 机器人操作系统

- [Robonix](https://github.com/syswonder/robonix)：命中物理 AI P0；具备原创实现、MulanPSL-2.0 许可、可运行安装与 Webots Demo、七类机器人部署和持续维护证据，按 B 级正式跟踪。

### 大模型训练 / MoE 系统内核

- [Mixture-of-Kittens](https://github.com/cursor/mixture-of-kittens)：官方关系、原创系统实现、明确许可、可安装性、公开基准与生产维护证据充分，符合新发布开放工程仓库优先方向，按 A 级正式跟踪。

### AI CAD / 生成式设计

- [Multi-Agent CAD](https://github.com/Pan-Chera/Multi-Agent-CAD)：直接命中 CAD、3D 生成和 AI 设计工具 P0；原创性、可运行性、许可、Demo 与近期维护证据通过质量门槛，按 B 级新项目正式跟踪。

### 开放模型 / 模型分发基础设施

- [Hugging Face Hub Python SDK](https://github.com/huggingface/huggingface_hub)：官方关系、原创基础设施实现、明确许可、可安装性与持续维护证据充分，按 A 级正式跟踪。

### 开放模型 / JavaScript SDK

- [Hugging Face JavaScript Libraries](https://github.com/huggingface/huggingface.js)：官方身份、原创 SDK 实现、明确许可、安装路径与维护活跃度通过质量门槛，按 A 级正式跟踪。

### 具身智能 / VLA 工具箱

- [Dexbotic](https://github.com/dexmal/dexbotic)：命中物理 AI 与机器人仿真 P0；原创工程实现、明确许可、完整安装路径、模型与硬件覆盖以及近期维护证据充分，按 B 级正式跟踪。

### 视频生成 / 实时视频编辑

- [JoyAI-Video-Edit](https://github.com/jd-opensource/JoyAI-Video-Edit)：命中视频生成、视频编辑和开放模型 P0；官方关系、原创实现、明确许可、可运行发布、Demo 与近期维护证据均通过质量门槛，按 A 级正式跟踪。

### 3DGS / 多传感器 SLAM

- [Gaussian-LIC2](https://github.com/APRIL-ZJU/Gaussian-LIC)：命中 3DGS、物理 AI 与机器人建图方向；官方关系、原创研究实现、明确许可、可复现路径和近期更新通过质量门槛，按 B 级正式跟踪。

### Agent 数据基础设施 / 深度研究

- [GPT Researcher](https://github.com/assafelovic/gpt-researcher)：实读 agent.py 的检索、上下文、写作和报告编排，有独立工作流而非资源清单，Apache-2.0，批准。模型和检索 API 另配；README 对客观/准确报告的描述未作为已验证保证。

### AI 计算基础设施 / GPU

- [AMD ROCm](https://github.com/ROCm/legacy-rocm-build)：本日官方API确认canonical owner/repo与archived=true；不是404下架，不删除历史，也不猜测或自动替换仓库。

### Agent 工程 / MCP

- [GitHub MCP Server](https://github.com/github/github-mcp-server)：同日 AI 强制候选；官方关系、协议实现、可部署性与维护活跃度均达到 A+。

### 医疗仿真 / 世界模型

- [Cosmos-H-Dreams](https://github.com/isaac-for-healthcare/Cosmos-H-Dreams)：同日 AI 强制候选；物理 AI 与医疗仿真价值明确、实现可运行，但官方关系和临床证据边界需持续提示，定为 B+。

### 开放模型 / 多模态 Agent

- [Kimi K3](https://github.com/MoonshotAI/Kimi-K3)：同日 AI 强制候选；官方关系、开放权重、技术新鲜度和行业影响显著，综合质量达到 A+。

### 世界模型 / 视频生成推理

- [FlashDreams](https://github.com/NVIDIA/flashdreams)：同日 AI 强制候选；官方实现、世界模型方向、可运行性与工程价值充分，综合质量达到 A。

### 生成模型 / 图像编辑 / ComfyUI

- [ComfyUI Krea2 Edit](https://github.com/lbouaraba/comfyui-krea2edit)：为 Krea 2 身份保持图像编辑提供可复现的原始运行实现，直接服务生成式设计和可控视觉内容生产，因此纳入正式跟踪。

### Agent 安全 / 端点可观测

- [Numbat](https://github.com/perplexityai/numbat)：最新已完成周报强制候选；官方关系、原创 Agent 安全实现、跨平台可安装性和近期维护证据均通过质量门槛。

### 生成模型 / 高效推理

- [Nunchaku](https://github.com/nunchux-ai/nunchaku)：同日 AI 强制候选；原创实现、可安装性、模型生成价值和维护活跃度均已核验，综合质量达到 A。

### AI Apps

- [Gemini Starter Applets](https://github.com/google-gemini/starter-applets)（已下架：2026-10-01，保留历史记录）：Existing approved project retained from the formal tracked inventory.


## 最终OCR原文强制候选补充

同日成功源复用的真实发现命令已执行，仅追加两个AI原文仓库，原265项目、392趋势与61项mandatory证据原样保留。未在本机安装模型或复现作者性能。

| 仓库 | 当前 Stars / Forks | 许可与边界 | 决定 |
| --- | --- | --- | --- |
| [OpenBMB/MiniCPM-OCR](https://github.com/OpenBMB/MiniCPM-OCR) | 310 / 21 | Apache-2.0（官方说明覆盖代码、文档和MiniCPM-OCR/Jev权重） | B级收录：官方README、中文说明、Apache许可与实际SDK CLI/配置实现可核验；文档解析加区域级质量评分有明确复用价值，按作者实测边界以B级收录。 |
| [baidu/Unlimited-OCR](https://github.com/baidu/Unlimited-OCR) | 29567 / 3152 | MIT（仓库代码）；模型权重另核模型卡 | B级收录：百度官方仓库的推理实现、文档批处理和后处理路径真实可读，部署方法与显存约束明确；长文档解析有实用价值，以B级收录并保留未复现与许可边界。 |
