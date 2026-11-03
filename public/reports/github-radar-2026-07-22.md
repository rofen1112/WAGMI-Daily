# GitHub Radar 2026-07-22

- 运行状态：**success**
- 候选池：1444 条原始观测，291 个候选；4 个 surging、15 个 hot、272 个 watch。
- 跟踪清单：190 个项目；本轮新增 10 个精确仓库。
- AI 日报：已读取同日快照（2026-07-22，success）。

## 热门阈值

- surging：OSS Insight 全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- hot：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地快照增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势源。
- 累计 Stars 只作背景信息；最终判断同时考虑 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性与可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试次数 |
| --- | --- | ---: | ---: |
| ossinsight-24h-all | success | 100 | 1 |
| github-ai-new | success | 2 | 1 |
| github-open-model-new | success | 3 | 1 |
| ossinsight-weekly-all | success | 100 | 1 |
| ossinsight-24h-typescript | success | 59 | 1 |
| ossinsight-24h-python | success | 74 | 1 |
| github-simready-active | success | 34 | 1 |
| github-video-2026-new | success | 50 | 1 |
| github-agent-active | success | 50 | 1 |
| github-interior-design-active | success | 50 | 1 |
| github-video-3d-stage-active | success | 50 | 1 |
| github-aec-design-active | success | 50 | 1 |
| github-3d-active | success | 50 | 1 |
| github-video-intelligence-active | success | 50 | 1 |
| github-physical-ai-active | success | 50 | 2 |
| github-ai-active | success | 50 | 2 |
| github-video-editing-active | success | 50 | 2 |
| github-3d-generation-active | success | 50 | 2 |
| github-3dgs-active | success | 50 | 2 |
| github-robot-simulation-active | success | 50 | 2 |
| github-vla-robotics-active | success | 50 | 2 |

## Surging / Hot / AI 强制候选核验

| 仓库 | 队列 | Stars / Forks | 最近推送 | License | 入选原因 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | surging | 40,857 / 4,827 | 2026-07-21 | NOASSERTION | 行业优先：视频生成 / 自动剪辑；OSS Insight 24h 新增关注 1；24h 活跃分 204；本地快照新增 Stars 355 | **保留 B+**：实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。 |
| [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map) | surging | 14,706 / 1,525 | 2026-07-20 | Apache-2.0 | 行业优先：3D / 三维生成、最新开放模型；OSS Insight 24h 新增关注 1；24h 活跃分 204；本地快照新增 Stars 510 | **保留 A**：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。 |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 41,458 / 6,891 | 2026-06-25 | MIT | 行业优先：最新开放模型；OSS Insight 24h 新增关注 4；24h 活跃分 217；本地快照新增 Stars 5 | **不收录**：教程/课程型仓库，虽有趋势动量但不属于原创产品或研究实现。 |
| [hoainho/img2threejs](https://github.com/hoainho/img2threejs) | surging | 1,440 / 117 | 2026-07-20 | MIT | 行业优先：3D / 三维生成；本地快照新增 Stars 466；最近 2 天有推送；跨 3 个来源命中 | **保留 B+**：本轮高热候选，MIT 许可，包含原创代码、文档、可运行演示与贡献指南，符合 3D 与 AI 辅助设计方向。 |
| [huggingface/lerobot](https://github.com/huggingface/lerobot) | hot | 26,020 / 5,145 | 2026-07-20 | Apache-2.0 | 行业优先：WAIC 物理 AI、机器人学习 / 控制、最新开放模型；OSS Insight 24h 新增关注 1；24h 活跃分 71；本地快照新增 Stars 34 | **保留 A+**：Hugging Face 官方机器人生态底座，适合持续跟踪模型从研究代码走向真实设备部署。 |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | hot / AI 强制 | 11,172 / 776 | 2026-07-20 | OpenMDW-1.1 | 行业优先：3D / 三维生成、WAIC 物理 AI；本地快照新增 Stars 33；最近 2 天有推送；AI 日报/周报强制候选 | **保留 A+**：AI 强制候选；NVIDIA 官方世界模型仓库，近期提交和 issue/PR 协作活跃。 |
| [kairos-agi/kairos](https://github.com/kairos-agi/kairos) | hot | 2,141 / 426 | 2026-07-08 | Apache-2.0 | 行业优先：3D / 三维生成、WAIC 物理 AI；本地快照新增 Stars 56；跨 3 个来源命中 | **保留 A**：官方项目仓库，Apache-2.0 许可，具备原创论文、完整代码结构和明确维护证据。 |
| [ReconWorldLab/godot-gaussian-splatting](https://github.com/ReconWorldLab/godot-gaussian-splatting) | hot | 248 / 21 | 2026-07-16 | MIT | 行业优先：3DGS / Gaussian Splatting、3D / 三维生成；OSS Insight 24h 新增关注 1；24h 活跃分 205；最近 6 天有推送 | **新增 B+**：可运行 Godot 3DGS 插件；MIT 许可、安装说明、示例与 gdgs_2.1.0 release 均已核验。 |
| [HBAI-Ltd/Toonflow-app](https://github.com/HBAI-Ltd/Toonflow-app) | hot | 11,857 / 2,182 | 2026-07-09 | Custom-Apache-2.0-with-commercial-restrictions | 行业优先：视频生成 / 自动剪辑；OSS Insight 24h 新增关注 2；24h 活跃分 209；跨 3 个来源命中 | **新增 B+**：原创端到端视频创作应用且有 v1.1.8 release；LICENSE 含额外商业限制，已明确标记风险。 |
| [FreeCAD/FreeCAD](https://github.com/FreeCAD/FreeCAD) | hot | 32,272 / 5,782 | 2026-07-20 | LGPL-2.1 | 行业优先：建筑设计 / AEC、3D / 三维生成、AI 设计工具；本地快照新增 Stars 23；最近 2 天有推送；跨 3 个来源命中 | **保留 A+**：官方主仓库、持续维护且行业覆盖完整，是 CAD/AEC 基础项目。 |
| [Physical-Intelligence/openpi](https://github.com/Physical-Intelligence/openpi) | hot | 12,911 / 2,223 | 2026-06-16 | Apache-2.0 | 行业优先：WAIC 物理 AI、机器人学习 / 控制；本地快照新增 Stars 26；跨 3 个来源命中 | **保留 A+**：当前开放 VLA 体系的重要基线，模型、训练和部署链路对通用机器人研究具有高参考价值。 |
| [remotion-dev/remotion](https://github.com/remotion-dev/remotion) | hot | 53,852 / 3,914 | 未提供 | NOASSERTION | OSS Insight 24h 新增关注 1；24h 活跃分 32；本地快照新增 Stars 92；跨 3 个来源命中 | **保留 A**：成熟的程序化视频生产工具，可把 AI 生成的脚本、素材和结构稳定转成可重复渲染的成片。 |
| [KellerJordan/modded-nanogpt](https://github.com/KellerJordan/modded-nanogpt) | hot / AI 强制 | 5,558 / 846 | 2026-07-03 | MIT | 本地快照新增 Stars 37；AI 日报/周报强制候选；跨 3 个来源命中 | **保留 A**：同日 AI 日报强制候选，OpenAI 官方报告直接链接；MIT 许可、2,000 余次提交、完整 README 与可运行训练流程均已核验。 |
| [usestrix/strix](https://github.com/usestrix/strix) | hot | 42,442 / 4,380 | 2026-07-18 | Apache-2.0 | OSS Insight 24h 新增关注 1；24h 活跃分 202；最近 4 天有推送；跨 4 个来源命中 | **保留 A**：已跟踪项目，官方仓库元数据与维护状态已刷新。 |
| [open-pencil/open-pencil](https://github.com/open-pencil/open-pencil) | hot | 7,147 / 682 | 2026-07-21 | MIT | 本地快照新增 Stars 83；最近 1 天有推送；跨 2 个来源命中 | **保留 A**：官方原创实现、近期持续推送，符合 AI 设计工具方向。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 216,835 / 40,724 | 2026-07-19 | MIT | 最近 3 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **保留 A**：已跟踪项目，官方仓库元数据与维护状态已刷新。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 26 / 11 | 2026-07-13 | MIT | AI 日报/周报强制候选；跨 3 个来源命中 | **保留 B**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 138,118 / 22,164 | 2026-07-17 | NOASSERTION | 最近 5 天有推送；AI 日报/周报强制候选；跨 2 个来源命中 | **保留 A+**：已跟踪项目，官方仓库元数据与维护状态已刷新。 |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | watch / AI 强制 | 18,737 / 3,380 | 2026-07-19 | NOASSERTION | 最近 3 天有推送；AI 日报/周报强制候选；跨 2 个来源命中 | **保留 A+**：已跟踪项目，官方仓库元数据与维护状态已刷新。 |
| [CesiumGS/cesium-ai-integrations](https://github.com/CesiumGS/cesium-ai-integrations) | watch / AI 强制 | 83 / 11 | 2026-05-04 | Apache-2.0 | AI 日报/周报强制候选 | **新增 B+**：Cesium 官方 3D 地理空间 AI 集成库；Apache-2.0，含 MCP、Skills、Demo 和子项目安装说明。 |
| [elevenlabs/skills](https://github.com/elevenlabs/skills) | watch / AI 强制 | 386 / 53 | 2026-07-18 | MIT | AI 日报/周报强制候选 | **新增 B+**：ElevenLabs 官方可安装 Agent Skills，MIT 许可，包含 SDK 示例与触发/功能评测。 |
| [google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills) | watch / AI 强制 | 3,838 / 389 | 2026-07-21 | Apache-2.0 | AI 日报/周报强制候选 | **新增 B+**：Gemini 官方组织的可安装技能库；Apache-2.0，但 README 明确非正式支持产品。 |
| [google/tunix](https://github.com/google/tunix) | watch / AI 强制 | 2,380 / 321 | 2026-07-21 | Apache-2.0 | AI 日报/周报强制候选 | **新增 A**：Google 官方 JAX 后训练与 Agentic RL 库；Apache-2.0、完整测试文档并已发布 v0.1.7。 |
| [NVIDIA-Omniverse/omniverse-labs](https://github.com/NVIDIA-Omniverse/omniverse-labs) | watch / AI 强制 | 28 / 2 | 2026-07-20 | Apache-2.0 | AI 日报/周报强制候选 | **新增 B**：NVIDIA Omniverse 官方实验样例库；Apache-2.0，但明确不保证持续维护。 |
| `nvidia/Cosmos3-Edge` | watch / AI 强制 | 0 / 0 | 未提供 | NOASSERTION | AI 日报/周报强制候选 | **不收录**：GitHub 连接器与官方仓库 URL 均返回 404；这是模型资产命名，不猜测替代 GitHub 地址。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 100,394 / 15,024 | 2026-07-21 | Apache-2.0 | AI 日报/周报强制候选 | **新增 A+**：OpenAI 官方编码 Agent；Apache-2.0，完整安装构建、安全文档和 0.145.0 release。 |
| [PixarAnimationStudios/OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD) | watch / AI 强制 | 7,398 / 1,435 | 2026-07-20 | Tomorrow Open Source Technology License 1.0 | AI 日报/周报强制候选 | **新增 A+**：Pixar 官方 3D 场景基础设施；Version 26.08 已发布，主许可为 Tomorrow Open Source Technology License 1.0。 |

核验范围包括精确 owner/repo、官方关系、Stars/Forks、最近提交、release、issue/PR、README/Demo、license、归档/分叉状态和基础可用性。GitHub 连接器确认本表精确仓库均公开且未归档；官方 REST/仓库页用于补齐计数和内容证据。

## 已批准决策处理

- `ai-cad-workflows`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `alibaba-damo-rynnworld-teleop`：approved，优先核验；已有精确仓库或既有跟踪记录。
- `anthropics-claude-code`：approved，优先核验；已有精确仓库或既有跟踪记录。
- `copilot-cloud-agent`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `cosmos-coalition`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `genebench-v1`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `kinfey-multi-agents`：approved，优先核验；已有精确仓库或既有跟踪记录。
- `nous-hermes-agent`：approved，优先核验；已有精确仓库或既有跟踪记录。
- `openai-codex-security-plugin`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `openai-gpt-red-assets`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `openai-multi-agent-beta`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `programmatic-tool-calling`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `runway-agent-2`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `the-kotlin-benchmark`：approved，优先核验；未在本轮确认稳定精确 URL 时继续保留为待解析项，不猜测地址。
- `thinking-machines-tinker-cookbook`：approved，优先核验；已有精确仓库或既有跟踪记录。
- `xai-org-grok-build`：approved，优先核验；已有精确仓库或既有跟踪记录。

## 未解析 AI 候选

- ExploitGym benchmark code/data（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- AOUSD Core Specification 1.1 repository（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- Neurocad CAD integrations（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- GitHub Copilot cloud agent（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling sample project（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI multi-agent beta sample project（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI GPT-Red preprint / eval assets（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI Codex Security plugin（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- NVIDIA Synthetic Video Detector NIM（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- Qwen3.8-Max-Preview open weights（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- Multiverse GLM 5.1 and Qwen 3.6 27B uncensored weights（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI GPT-Red preprint / eval assets \| pending \| stable paper or repository URL not verified（ai-weekly-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI Codex Security plugin \| pending \| stable public repository URL not verified（ai-weekly-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保持待解析，不猜测 GitHub URL。
- nvidia/Cosmos3-Edge（ai-daily-forced）：GitHub connector and official repository URL returned 404; model asset is not a verified GitHub repository.

## Watch 轮换抽查与跟踪项目

- 全部既有跟踪项目已由行业清单同步流程刷新；API 受限时仅使用 GitHub 官方仓库页回退，不使用第三方镜像。
- watch 队列按行业优先级、最近推送和跨来源命中轮换抽查；列表型、镜像、无原创实现和低信息仓库不因累计 Stars 进入主清单。
- 本轮轮换抽查：`AgibotTech/genie_sim`、`huggingface/lerobot`、`Robbyant/lingbot-map` 均为公开、未归档的既有跟踪项目；`luohongk/Embodied-AI-Daily` 与 `Vincentqyw/cv-arxiv-daily` 为论文聚合/列表型仓库，保持 watch、不纳入主清单。
- 本轮新增：`hiyouga/LlamaFactory`、`HBAI-Ltd/Toonflow-app`、`ReconWorldLab/godot-gaussian-splatting`、`CesiumGS/cesium-ai-integrations`、`elevenlabs/skills`、`google-gemini/gemini-skills`、`google/tunix`、`NVIDIA-Omniverse/omniverse-labs`、`openai/codex`、`PixarAnimationStudios/OpenUSD`。

## 运行结论

OSS Insight 24 小时主趋势与全部外部趋势源成功，同日 AI 日报已进入最终候选池；本轮可标记为 success。

