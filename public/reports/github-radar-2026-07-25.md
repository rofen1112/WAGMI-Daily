# GitHub Radar 2026-07-25

- 运行状态：**success**
- 首次发现基线：304 个候选，5 个 surging，16 个 hot。
- 最终候选快照：1197 条原始观察，304 个候选，1 个 surging，7 个 hot。
- 跟踪清单：203 个项目；今日 AI 日报：2026-07-25 / success。
- 核验范围：首次发现全部 surging、前 12 个 hot、全部 24 个精确 AI 强制候选、全部跟踪项目，以及 5 个 watch 轮换样本。

## 热门阈值

- `surging`：OSS Insight 全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地快照增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势源。
- 累计 Stars 只作背景；最终判断综合 24 小时动量、本地增量、趋势排名、跨来源命中、仓库新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试次数 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-ai-new | success | 1 | 1 |  |
| github-open-model-new | success | 4 | 1 |  |
| ossinsight-24h-python | success | 100 | 1 |  |
| ossinsight-weekly-all | success | 100 | 1 |  |
| ossinsight-24h-all | success | 100 | 1 |  |
| ossinsight-24h-typescript | success | 90 | 1 |  |
| github-simready-active | success | 36 | 1 |  |
| github-video-editing-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-robot-simulation-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-video-2026-new | success | 50 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| github-video-3d-stage-active | failed | 0 | 2 | HTTP 403 |
| github-ai-active | failed | 0 | 2 | HTTP 403 |
| github-video-intelligence-active | failed | 0 | 2 | HTTP 403 |
| github-agent-active | failed | 0 | 2 | HTTP 403 |
| github-physical-ai-active | failed | 0 | 2 | HTTP 403 |
| github-vla-robotics-active | failed | 0 | 2 | HTTP 403 |
| github-3d-active | failed | 0 | 2 | HTTP 403 |

主趋势 `ossinsight-24h-all` 为 **success**；7 个辅助搜索源失败，已逐项记录，未改用全 GitHub 大仓库池扫描。

## 首次 Surging / 前 12 Hot 完整核验

| 仓库 | 首次队列 | Stars / Forks | 最近提交 | 最近 release | License | 核验结论 |
| --- | --- | ---: | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 43,162 / 7,215 | 2026-06-25 | 无稳定 release 记录 | MIT | **不收录**：课程与教程型资源集合，不是原创产品或研究实现；热度不能绕过原创性门槛。 |
| [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | surging | 28,797 / 3,776 | 2026-07-25 | 2026-07-14 | MIT | **观察**：原创 AI 网关，安装、README、release、issue/PR 与提交都很活跃；功能和营销范围极广，先观察稳定性与维护噪声。 |
| [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) | surging | 26,326 / 8,617 | 2026-07-23 | 2026-07-22 | MIT | **观察**：可安装的求职自动化应用，近期 release 与提交明确；与 WAGMI P0 设计、3D、AEC 方向关联较弱，保留观察。 |
| [citrolabs/ego-lite](https://github.com/citrolabs/ego-lite) | surging | 2,542 / 121 | 2026-07-24 | 2026-07-17 | MIT | **观察**：原创 Agent 浏览器，README、Demo、安装路径和本地数据说明完整；当前仅 macOS，基准主要由项目方提供，继续验证跨平台与长期维护。 |
| [Vincentwei1021/video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) | surging | 1,414 / 113 | 2026-07-24 | 2026-07-25 | Apache-2.0 | **观察**：命中视频生成与自动剪辑 P0，具备原创实现、Demo、安装和当日 release；先观察真实工作流可用性后再进入主清单。 |
| [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage) | hot | 41,983 / 5,000 | 未提供 | 无稳定 release 记录 | NOASSERTION | **收录/保留**：已跟踪的视频生成与自动剪辑项目；官方元数据、README、提交和协作活跃度已刷新。 |
| [hoainho/img2threejs](https://github.com/hoainho/img2threejs) | hot | 4,013 / 300 | 2026-07-20 | 无稳定 release 记录 | MIT | **收录/保留**：已跟踪的 3D 生成项目；方向匹配，仓库可用且近期仍有维护。 |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | hot | 11,233 / 788 | 2026-07-20 | 无稳定 release 记录 | OpenMDW-1.1 | **收录/保留**：NVIDIA 官方物理 AI 与世界模型仓库，同时是 AI 强制候选；继续保留 A+ 跟踪。 |
| [usestrix/strix](https://github.com/usestrix/strix) | hot | 42,442 / 4,380 | 2026-07-18 | 无稳定 release 记录 | NOASSERTION | **收录/保留**：已跟踪的原创 Agent 安全项目；跨来源命中且近期维护活跃。 |
| [iOfficeAI/OfficeCLI](https://github.com/iOfficeAI/OfficeCLI) | hot | 21,920 / 1,476 | 2026-07-24 | 2026-07-24 | Apache-2.0 | **观察**：Office 自动化 CLI，安装与许可清楚且近期 release 活跃；与核心 P0 方向关联有限，暂不收入主跟踪清单。 |
| [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | hot | 41,567 / 6,548 | 2026-07-23 | 2026-07-23 | MIT | **不收录**：主要是营销技能与资源集合，虽有热度和近期维护，但不满足原创产品或研究实现门槛。 |
| [nitrocloudofficial/nitrostack](https://github.com/nitrocloudofficial/nitrostack) | hot | 1,171 / 34 | 2026-07-18 | 无稳定 release 记录 | NOASSERTION | **收录/保留**：已跟踪的 Agent 开发栈；仓库可用、未归档，近期协作与提交证据充足。 |
| [lidge-jun/opencodex](https://github.com/lidge-jun/opencodex) | hot | 4,515 / 338 | 2026-07-24 | 2026-07-24 | MIT | **观察**：README、Demo、安装、release 与提交完整；需要进一步确认其相对上游编码 Agent 的原创差异与长期维护价值。 |
| [ifixai-ai/iFixAi](https://github.com/ifixai-ai/iFixAi) | hot | 2,210 / 219 | 2026-07-24 | 2026-07-24 | Apache-2.0 | **观察**：可安装的 AI 修复工具且当日维护活跃；README 对原创技术与验证方法说明仍偏弱，继续观察。 |
| [jgravelle/jcodemunch-mcp](https://github.com/jgravelle/jcodemunch-mcp) | hot | 2,147 / 313 | 2026-07-25 | 2026-07-25 | NOASSERTION | **观察**：代码索引 MCP 有原创实现与当日 release，安装说明完整；许可未能稳定识别，解决前不进入主清单。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot | 216,835 / 40,724 | 2026-07-19 | 无稳定 release 记录 | NOASSERTION | **收录/保留**：AI 强制候选且已跟踪；官方组织、原创实现、提交、release 与 issue/PR 活跃度继续满足收录条件。 |
| [HKUDS/nanobot](https://github.com/HKUDS/nanobot) | hot | 46,197 / 8,174 | 2026-07-24 | 2026-06-23 | MIT | **观察**：研究组织维护的轻量 Agent 框架，README 和安装完整且近期有提交；先评估与现有 Agent 跟踪项的差异化。 |

核验覆盖精确 owner/repo、官方关系、Stars/Forks、最近提交、release、issue/PR 活跃、README/Demo、license、归档/分叉状态和基础可用性。累计 Stars 没有单独决定收录。

## 最终刷新新增的 Surging / Hot

| 仓库 | 队列 | Stars / Forks | 最近活动 | License | 入选原因 | 核验结论 |
| --- | --- | ---: | --- | --- | --- | --- |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | hot | 39,807 / 3,299 | 2026-07-19 | NOASSERTION | 最近 6 天有推送；跨 2 个来源命中 | **收录/保留**：精确仓库已通过连接器和官方页面核验；保留在候选池继续观察。 |

## AI 日报/周报强制候选

| 仓库 | 队列 | Stars / Forks | 最近活动 | License | 入选原因 | 核验结论 |
| --- | --- | ---: | --- | --- | --- | --- |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | hot / AI 强制 | 11,233 / 788 | 2026-07-20 | OpenMDW-1.1 | 行业优先：3D / 三维生成、WAIC 物理 AI；最近 5 天有推送；AI 日报/周报强制候选；跨 4 个来源命中 | **收录/保留**：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。 |
| [NVIDIA-Omniverse/omniverse-labs](https://github.com/NVIDIA-Omniverse/omniverse-labs) | watch / AI 强制 | 35 / 3 | 2026-07-20 | Apache-2.0 | 行业优先：3D / 三维生成；最近 5 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；与 OpenUSD/3D 工具链高度相关，但因实验性质和较短历史定为 B。 |
| [PixarAnimationStudios/OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD) | watch / AI 强制 | 7,402 / 1,436 | 2026-07-20 | Tomorrow Open Source Technology License 1.0 | 行业优先：建筑设计 / AEC、3D / 三维生成；最近 5 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方 release 与精确仓库已核验，对 3D/AEC/设计互操作具有基础设施级价值。 |
| [ROCm/ROCm](https://github.com/ROCm/ROCm) | watch / AI 强制 | 6,715 / 584 | 2026-07-22 | MIT | 行业优先：WAIC 物理 AI；最近 3 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；AMD 官方基础设施、稳定公开仓库、活跃维护和模型训练实用性充分，综合质量达到 A+。 |
| [CesiumGS/cesium-ai-integrations](https://github.com/CesiumGS/cesium-ai-integrations) | watch / AI 强制 | 83 / 11 | 2026-05-04 | Apache-2.0 | 行业优先：3D / 三维生成、AI 设计工具；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系明确，可运行集成与 3D/设计自动化方向高度相关。 |
| [huggingface/diffusers](https://github.com/huggingface/diffusers) | watch / AI 强制 | 34,145 / 7,180 | 未提供 | Apache-2.0 | 行业优先：最新开放模型；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；精确官方仓库、原创实现、可安装性和活跃维护均已核验，综合质量达到 A+。 |
| [huggingface/kernels](https://github.com/huggingface/kernels) | watch / AI 强制 | 715 / 113 | 未提供 | Apache-2.0 | 行业优先：最新开放模型；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系、原创性、可用性和近期维护证据充分，综合质量达到 A。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 216,835 / 40,724 | 2026-07-19 | NOASSERTION | 最近 6 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：精确仓库已通过连接器和官方页面核验；保留在候选池继续观察。 |
| [elevenlabs/skills](https://github.com/elevenlabs/skills) | watch / AI 强制 | 392 / 56 | 2026-07-18 | MIT | 最近 7 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方、可安装、有测试且对多媒体 Agent 工作流有直接实用价值。 |
| [google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills) | watch / AI 强制 | 3,847 / 388 | 2026-07-21 | Apache-2.0 | 最近 4 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；精确官方仓库、可安装性和维护证据均已核验，同时保留非正式支持风险。 |
| [google/tunix](https://github.com/google/tunix) | watch / AI 强制 | 2,384 / 325 | 2026-07-21 | Apache-2.0 | 最近 4 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方 Agentic RL 更新直接对应仓库，原创性、维护和可复现性证据充分。 |
| [microsoft/discovery](https://github.com/microsoft/discovery) | watch / AI 强制 | 213 / 47 | 2026-07-22 | MIT | 最近 3 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；Microsoft 官方关系、可安装应用、科研 Agent 目录、starter kits 和协作维护均已核验，综合质量达到 A。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 101,245 / 15,169 | 2026-07-21 | Apache-2.0 | 最近 4 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [KellerJordan/modded-nanogpt](https://github.com/KellerJordan/modded-nanogpt) | watch / AI 强制 | 5,582 / 848 | 2026-07-03 | MIT | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 日报强制候选，OpenAI 官方报告直接链接；MIT 许可、2,000 余次提交、完整 README 与可运行训练流程均已核验。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 26 / 11 | 2026-07-13 | MIT | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [black-forest-labs/flux](https://github.com/black-forest-labs/flux) | watch / AI 强制 | 25,795 / 1,905 | 未提供 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；精确官方仓库可验证，但对 FLUX 3 权重开放状态保持审慎，不作超出证据的推断。 |
| [github/gh-aw](https://github.com/github/gh-aw) | watch / AI 强制 | 4,804 / 461 | 未提供 | MIT | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系、可安装实现、文档和活跃维护均已核验，综合质量达到 A。 |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | watch / AI 强制 | 31,685 / 4,638 | 未提供 | MIT | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系、协议实现、可部署性与维护活跃度均达到 A+。 |
| [modelcontextprotocol/conformance](https://github.com/modelcontextprotocol/conformance) | watch / AI 强制 | 84 / 64 | 未提供 | MIT | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系、协议价值、原创实现和维护证据充分，综合质量达到 A。 |
| [nunchaku-ai/nunchaku](https://github.com/nunchaku-ai/nunchaku) | watch / AI 强制 | 3,915 / 267 | 未提供 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；原创实现、可安装性、模型生成价值和维护活跃度均已核验，综合质量达到 A。 |
| [rootonchair/diffuse-compressor](https://github.com/rootonchair/diffuse-compressor) | watch / AI 强制 | 8 / 1 | 未提供 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；原创性和可用性证据充分，但生态与长期维护证据较短，定为 B+。 |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | watch / AI 强制 | 18,737 / 3,380 | 2026-07-19 | NOASSERTION | 最近 6 天有推送；AI 日报/周报强制候选；跨 2 个来源命中 | **收录/保留**：精确仓库已通过连接器和官方页面核验；保留在候选池继续观察。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | watch / AI 强制 | 138,118 / 22,164 | 2026-07-17 | NOASSERTION | AI 日报/周报强制候选；跨 2 个来源命中 | **收录/保留**：精确仓库已通过连接器和官方页面核验；保留在候选池继续观察。 |
| [nvidia/Cosmos3-Edge](https://github.com/nvidia/Cosmos3-Edge) | watch / AI 强制 | 0 / 0 | 未提供 | NOASSERTION | AI 日报/周报强制候选 | **观察**：精确仓库已通过连接器和官方页面核验；保留在候选池继续观察。 |

## candidate-decisions 处理

- `ai-cad-workflows`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `alibaba-damo-rynnworld-teleop`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `anthropics-claude-code`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `copilot-cloud-agent`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `cosmos-coalition`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `genebench-v1`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `kinfey-multi-agents`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `nous-hermes-agent`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `openai-codex-security-plugin`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `openai-gpt-red-assets`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `openai-multi-agent-beta`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `programmatic-tool-calling`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `runway-agent-2`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `the-kotlin-benchmark`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `thinking-machines-tinker-cookbook`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。
- `xai-org-grok-build`：**approved**。approved 优先核验，observe 保留证据，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未改写决策文件。

## 未解析 AI 候选

- Claude Opus 5 API/model assets（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- GitHub Copilot cloud agent（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI Programmatic Tool Calling sample project（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI multi-agent beta sample project（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- AI floor-plan / room-design CAD export（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI GPT-Red preprint / eval assets（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Multiverse GLM 5.1 and Qwen 3.6 27B uncensored weights（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- ExploitGym benchmark code/data（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- AOUSD Core Specification 1.1 repository（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Neurocad CAD integrations（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Claude Security plugin（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Cursor Router CLI/SDK integration（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Anthropic agent-memory SDK integrations（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- GitHub Copilot for Linear app integration（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI GPT-Red preprint / eval assets \| pending \| stable paper or repository URL not verified（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- nvidia/Cosmos3-Edge（ai-daily-forced）：GitHub 连接器返回 404；它仍按模型资产名保留，不猜测替代仓库 URL。

## Watch 轮换抽查

- `AgibotTech/genie_sim`：1,266 Stars，最近活动 2026-07-22，保留 A；行业优先：3D / 三维生成、WAIC 物理 AI；最近 3 天有推送；跨 4 个来源命中。
- `Robbyant/lingbot-map`：15,275 Stars，最近活动 2026-07-23，保留 A；行业优先：3D / 三维生成、最新开放模型；最近 2 天有推送；跨 4 个来源命中。
- `Fysics-AI/Fysiverse-3D-SimReady`：8 Stars，最近活动 2026-07-15，保留 B+；行业优先：3D / 三维生成、物理一致 / SimReady；新仓库 11 天；跨 3 个来源命中。
- `nerfstudio-project/gsplat`：5,444 Stars，最近活动 2026-07-20，保留 A；行业优先：3DGS / Gaussian Splatting；最近 5 天有推送；跨 3 个来源命中。
- `playcanvas/supersplat`：9,696 Stars，最近活动 2026-07-21，保留 A；行业优先：3DGS / Gaussian Splatting、3D / 三维生成；最近 4 天有推送；跨 3 个来源命中。

## 运行结论

OSS Insight 24 小时主趋势成功、外部来源并非全部失败、同日 AI 日报已就绪，因此状态为 success。辅助 GitHub 搜索源的 403 已明确披露，不影响主趋势完整性判定。

## 行业重点收录

本次将 186 个经过官方仓库、原创性和维护状态核验的项目纳入每日跟踪。热度只用于排序，不是收录门槛。

### 3D 生成 / 设计工具

- [Text-To-3D-Generation](https://github.com/YuliCao/Text-To-3D-Generation)：仓库包含可运行的流程编排、参数消融、结果记录和网页演示，适合 3D AI 学习与产品原型；但它不是原创 Text-to-3D 模型，且许可证与几何质量边界尚未解决，因此作为设计工具观察收录。
- [img2threejs](https://github.com/hoainho/img2threejs)：本轮高热候选，MIT 许可，包含原创代码、文档、可运行演示与贡献指南，符合 3D 与 AI 辅助设计方向。

### 3D 重建

- [LingBot-Map](https://github.com/Robbyant/lingbot-map)：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。
- [VGGT](https://github.com/facebookresearch/vggt)：Meta 官方研究仓库，包含原创实现和模型资源，行业适配度高。
- [MoGe](https://github.com/microsoft/MoGe)：Microsoft 官方研究实现，原创论文与代码关系明确。
- [Stable Fast 3D](https://github.com/Stability-AI/stable-fast-3d)：Stability AI 官方原创实现，具有清晰的图像到 3D 应用价值。
- [Nerfstudio](https://github.com/nerfstudio-project/nerfstudio)：成熟原创工具链，长期被 3D 重建研究与工程流程采用；高质量实景扫描优先验证 Splatfacto-big。
- [MapAnything](https://github.com/facebookresearch/map-anything)：Meta 官方研究仓库，Apache-2.0 许可、原创模型与完整任务范围明确，属于 LingBot-Map 同类核心底座。
- [FineRecon](https://github.com/apple/ml-finerecon)：Apple 官方机器学习研究仓库，论文与实现关系明确，适合补齐高精度室内重建路线。
- [WorldMirror](https://github.com/Tencent-Hunyuan/HunyuanWorld-Mirror)：腾讯混元官方 ICML 2026 项目，原创模型、代码和世界模型方向均清晰。
- [Neuralangelo](https://github.com/NVlabs/neuralangelo)：NVIDIA 官方 CVPR 2023 实现，原创性和高精度表面重建价值明确。
- [FLARE](https://github.com/ant-research/FLARE)：蚂蚁研究官方原创实现，属于前馈重建与快速场景建模的重点候选。
- [NeuralRecon](https://github.com/zju3dv/NeuralRecon)：CVPR 2021 Oral 论文作者官方代码，Apache-2.0 许可，作为实时单目重建基线仍有价值。
- [VGG-T3](https://github.com/nv-dvl/vgg-ttt)：NVIDIA Deep Vision Lab 官方论文代码，属于 LingBot-Map 同类前馈重建新路线。

### 3DGS

- [3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)：论文作者官方原创实现，属于 3DGS 必收录的基础仓库。
- [gsplat](https://github.com/nerfstudio-project/gsplat)：Nerfstudio 团队维护的原创基础设施，近期仍持续更新；MCMC 是高质量实景扫描的重要实验路线。
- [SHARP](https://github.com/apple/ml-sharp)：Apple 官方论文代码、模型权重与命令行流程完整，是单图快速试验的首选基线。
- [Depth Anything 3](https://github.com/ByteDance-Seed/Depth-Anything-3)：ByteDance Seed 官方代码和模型齐全，输入形态与导出链路完整，适合作为产品原型的统一几何底座。
- [AnySplat](https://github.com/InternRobotics/AnySplat)：作者团队公开训练、推理、模型与 Gradio 演示，直接覆盖随手拍稀疏多图重建。
- [StructSplat](https://github.com/J-C-Zhao/StructSplat)：ECCV 2026 作者官方训练、评测代码与权重已公开，属于未标定稀疏视图的最新 SOTA 路线。
- [MVSplat](https://github.com/donydchen/mvsplat)：ECCV 2024 Oral 作者官方代码与预训练模型完整，被多项后续稀疏视图方法作为基础。
- [MVSplat360](https://github.com/donydchen/mvsplat360)：NeurIPS 2024 作者官方代码与模型公开，补足稀疏多图到 360 度场景合成路线。
- [DepthSplat](https://github.com/cvg/depthsplat)：CVPR 2025 作者官方代码、模型与多视图配置齐全，是多图产品原型和高质量重建的重要基线。
- [NoPoSplat](https://github.com/cvg/NoPoSplat)：ICLR 2025 Oral 作者官方代码和多组预训练权重可用，是无位姿稀疏多图的关键基线。
- [pixelSplat](https://github.com/dcharatan/pixelsplat)：CVPR 2024 Oral 与最佳论文候选作者代码，是后续 MVSplat、NoPoSplat 等方法的基础参照。
- [VolSplat](https://github.com/ziplab/VolSplat)：ECCV 2026 作者官方训练、评测代码与模型已公开，是体素对齐前馈 3DGS 的最新路线。
- [FastGS](https://github.com/fastgs/FastGS)：CVPR 2026 官方代码、模型和多任务分支已发布，适合评估高质量扫描的吞吐与成本。
- [ReSplat](https://github.com/cvg/resplat)：ECCV 2026 作者官方代码和模型已公开，提供比一次性前馈模型更可控的测试时质量提升路径。
- [SuperSplat](https://github.com/playcanvas/supersplat)：PlayCanvas 官方原创编辑器，产品完成度和近期维护状态均较好。
- [Spark](https://github.com/sparkjsdev/spark)：由 World Labs 团队推动的原创渲染项目，仓库活跃且使用路径清晰。
- [StreamSplat](https://github.com/DSL-Lab/StreamSplat)：论文作者官方实现，聚焦在线动态重建，和 LingBot-Map 的流式空间理解路线直接相关。
- [3DGRUT](https://github.com/nv-tlabs/3dgrut)：NVIDIA 研究团队官方原创实现，Apache-2.0 许可、近期维护活跃且直接服务 3DGS 工程。
- [FreeSplatter](https://github.com/TencentARC/FreeSplatter)：腾讯 ARC 官方 ICCV 2025 实现，原创论文与代码对应，直接补充无位姿 3DGS 重建路线。

### 3D 世界生成

- [One2Scene](https://github.com/Wang-pengfei/One2Scene)：ICLR 2026 作者官方代码与模型已公开，是单图生成可探索 360 度 AI 世界的代表项目。
- [DiffSplat](https://github.com/chenguolin/DiffSplat)：ICLR 2025 作者官方实现与模型公开，补足单图 3DGS 生成和快速资产原型方向。
- [Matrix-3D](https://github.com/SkyworkAI/Matrix-3D)：官方原创项目，MIT 许可，明确覆盖 3D 场景生成、重建、全景合成与世界模型。
- [EmbodiedGen](https://github.com/HorizonRobotics/EmbodiedGen)：企业官方原创项目，2026 年仍持续更新，覆盖生成式场景和具身仿真的关键交叉方向。
- [MesaTask](https://github.com/InternRobotics/MesaTask)：NeurIPS 2025 Spotlight 官方实现，MIT 许可，原创任务驱动场景生成路线明确。
- [HY-World 2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0)：腾讯混元官方项目，2026 年发布并获得持续关注，完整覆盖本次扩充的三个核心方向。
- [HunyuanWorld Voyager](https://github.com/Tencent-Hunyuan/HunyuanWorld-Voyager)：腾讯混元官方原创项目，把可控世界生成与实时 3D 重建连接在同一工作流中。
- [PartCrafter](https://github.com/wgsxm/PartCrafter)：NeurIPS 2025 官方实现，MIT 许可，提供结构化而非单体式 3D 资产生成能力。
- [CraftsMan](https://github.com/HKUST-SAIL/CraftsMan3D)：HKUST SAIL 官方原创模型代码，方向清晰且具备可编辑几何价值。
- [Diffusion as Shader](https://github.com/IGL-HKUST/DiffusionAsShader)：SIGGRAPH 2025 官方项目，Apache-2.0 许可，提供 3D 控制与生成式视觉设计的新路线。
- [TripoSG](https://github.com/VAST-AI-Research/TripoSG)：Tripo 团队官方原创项目，MIT 许可、模型路线和图像到 3D 用途明确。

### 室内与空间

- [SpatialLM](https://github.com/manycore-research/SpatialLM)：官方论文代码与模型方向明确，直接服务室内空间理解和结构化建模。
- [SpatialGen](https://github.com/manycore-research/SpatialGen)：3DV 2026 官方实现，原创训练代码与室内生成任务高度相关。
- [InteriorGS](https://github.com/manycore-research/InteriorGS)：官方数据仓库，覆盖室内设计与 3DGS 的交叉重点方向。
- [HouseCrafter](https://github.com/neu-vi/houseCrafter)：ICCV 2025 Highlight 官方代码与预训练模型，原创性和场景价值明确。
- [RoomFormer](https://github.com/ywyue/RoomFormer)：CVPR 2023 官方原创实现，是户型重建方向的有效基础项目。
- [SceneScript](https://github.com/facebookresearch/scenescript)：Meta 官方研究代码，面向室内空间结构化表达，非第三方复刻。
- [Lightwheel Kitchen](https://github.com/LightwheelAI/Lightwheel_Kitchen)：官方原创室内仿真场景，直接连接厨房空间、可交互资产与机器人训练。

### 建筑 / AEC

- [Speckle](https://github.com/specklesystems/speckle-server)：Speckle 官方主仓库，属于建筑数据协作与自动化的核心基础设施。
- [IfcOpenShell](https://github.com/IfcOpenShell/IfcOpenShell)：长期维护的原创 IFC 基础设施，建筑与 BIM 方向必须收录。
- [FreeCAD](https://github.com/FreeCAD/FreeCAD)：官方主仓库、持续维护且行业覆盖完整，是 CAD/AEC 基础项目。
- [Text2BIM](https://github.com/dcy0577/Text2BIM)：论文对应的原创实现，方向高度匹配，即使热度较低也应纳入观察库。
- [COMPAS](https://github.com/compas-dev/compas)：计算建筑领域的原创基础框架，近期仍在维护。
- [Hypar Elements](https://github.com/hypar-io/Elements)：Hypar 官方原创 BIM 库，活跃且定位清晰。

### 设计工具

- [CADAM](https://github.com/Adam-CAD/CADAM)：原创开源产品，具备完整交互、导出和近期发布记录。
- [Penpot](https://github.com/penpot/penpot)：官方主仓库、长期维护、非复刻演示，具备真实团队使用价值。
- [OpenPencil](https://github.com/open-pencil/open-pencil)：官方原创实现、近期持续推送，符合 AI 设计工具方向。

### 开放模型

- [Cube 3D](https://github.com/Roblox/cube)：Roblox 官方模型与代码仓库，2026 年继续发布 CubePart 更新。
- [WorldEngine](https://github.com/OpenDriveLab/WorldEngine)：OpenDriveLab 官方原创项目，2026 年创建并持续维护。
- [GPT-OSS](https://github.com/openai/gpt-oss)：模型发布方官方仓库，开放权重、代码和使用路径完整。
- [Qwen3](https://github.com/QwenLM/Qwen3)：官方主仓库，属于开放模型生态的核心长期跟踪对象。
- [Isaac GR00T](https://github.com/NVIDIA/Isaac-GR00T)：NVIDIA 官方模型仓库，2026 年持续发布新版本，适合作为空间智能前沿观察项。
- [TRELLIS](https://github.com/microsoft/TRELLIS)：Microsoft 官方 CVPR 2025 Spotlight 项目，MIT 许可且工程生态成熟，是 3D 生成基础模型核心仓库。

### 仿真就绪 3D

- [Fysiverse 3D SimReady](https://github.com/Fysics-AI/Fysiverse-3D-SimReady)：用户指定方向，仓库提供 MIT 许可、实际推理代码、Gradio 工作流和独立对象场景输出，虽无热度仍具原创产品价值。
- [Lightwheel SimReady Assets](https://github.com/LightwheelAI/Lightwheel-simready-asset)：Lightwheel 官方资产库，定位清晰且直接补足 SimReady 数据与场景资产层。
- [Genie Sim](https://github.com/AgibotTech/genie_sim)：企业官方主仓库、近期持续维护且已有稳定关注度，是生成式仿真基础设施的重要样本。
- [SimArt](https://github.com/ByteDance-Seed/SimArt)：字节 Seed 官方 SIGGRAPH 2026 项目，Apache-2.0 许可，原创性和 SimReady 方向高度明确。
- [SceneSmith](https://github.com/nepfaff/scenesmith)：MIT 与 Toyota Research Institute 的 ICML 2026 Spotlight 官方代码，MIT 许可且工程链条完整。
- [SceneCode](https://github.com/wangpuyi/SceneCode)：论文作者官方开源仓库，MIT 许可，连接了空间设计、程序化建模、可编辑资产和物理仿真。
- [REACT3D](https://github.com/troyehuang/REACT3D)：ETH Zurich 与 Microsoft 作者官方 RA-L 2026 代码，直接解决静态重建无法物理交互的问题。

### 物理一致 3D

- [REST3D](https://github.com/ShirleyMaxx/REST3D)：论文作者官方仓库且已发布完整代码，直接覆盖场景图、支撑关系、碰撞修正与重力稳定这一前沿方向。
- [SAM3D-Phys](https://github.com/CHNxindong/SAM3D-Phys_code)：项目页直链的作者官方仓库，研究主题高度匹配；作为代码发布观察项收录，不将其标记为已可用。
- [TelePhysics](https://github.com/xinzhang007/TelePhysics)：ACM MM 2026 作者官方代码，直接处理物体穿透、空间错位、碰撞响应和多材料动力学。

### 3DGS 物理仿真

- [PhySimGS](https://github.com/PhySimGS/PhySimGS)：官方项目页直链仓库，补充了 3DGS 从静态视觉表示走向对象级物理模拟的重要路线。

### 物理场景生成

- [SceneWeaver](https://github.com/Scene-Weaver/SceneWeaver)：NeurIPS 2025 官方实现，具备碰撞规避、边界约束和可交互室内场景输出能力。
- [PhyScene](https://github.com/PhyScene/PhyScene)：CVPR 2024 Highlight 官方完整实现，是物理约束室内场景生成的重要公开基线。

### 仿真标准与验证

- [SimReady Foundation](https://github.com/NVIDIA/simready-foundation)：NVIDIA 官方 Apache-2.0 项目，可作为判断 AI 生成资产是否真正达到 SimReady 的工程基准。

### 3D 场景评测

- [SceneEval](https://github.com/3dlg-hcvc/SceneEval)：WACV 2026 Oral 作者官方代码，可作为物理场景生成质量核验和自动回归测试基础。

### 3D 场景重建

- [Gen3DSR](https://github.com/AndreeaDogaru/Gen3DSR)：3DV 2025 作者官方实现，是 REST3D、PhyMix 等方法使用和比较的单图场景重建基础路线。
- [REPARO](https://github.com/VincentHancoder/REPARO)：论文作者官方实现，可作为从多对象视觉重建走向场景级物理修正的关键上游组件。

### WAICA 2026 / 数据智能

- [AIDABench](https://github.com/MichaelYang-lyx/AIDABench)：WAICA 2026 主会议录用项目，论文标题、作者与官方仓库可相互核验。

### WAICA 2026 / Agent 训练

- [InternBootcamp](https://github.com/InternLM/InternBootcamp)：官方仓库明确标注 InternBootcamp 技术报告被 WAICA 2026 接收，并提供对应代码版本。

### WAICA 2026 / 视频理解

- [RoboFAC](https://github.com/MINT-SJTU/RoboFAC)：WAICA 2026 主会议录用，上海交大团队官方仓库提供完整的视频诊断与纠错实现。

### 视频算法 / 分割

- [SAM 2](https://github.com/facebookresearch/sam2)：视频抠像、目标替换、特效跟踪和自动剪辑的通用基础组件，官方代码与权重生态成熟。

### 视频算法 / 跟踪

- [CoTracker](https://github.com/facebookresearch/co-tracker)：Meta 官方点跟踪基线，可直接支撑视频稳像、运动分析、3D 重建和虚拟摄影。

### 视频算法 / 动作识别

- [MMAction2](https://github.com/open-mmlab/mmaction2)：视频内容分类、片段检索和自动摘要的成熟工程底座，维护周期长且生态完整。

### 视频算法 / 表征学习

- [VideoMAE](https://github.com/MCG-NJU/VideoMAE)：视频基础表征的高影响力官方实现，适合作为自有行业视频模型训练基线。

### 视频算法 / 基础模型

- [InternVideo](https://github.com/OpenGVLab/InternVideo)：上海人工智能实验室官方视频基础模型项目，适合长期跟踪开放模型与评测进展。
- [VideoChat-Flash](https://github.com/OpenGVLab/VideoChat-Flash)：OpenGVLab 官方仓库，原 InternVideo2 地址已重定向至该 canonical 项目，可持续跟踪长视频理解能力。

### 视频算法 / 多模态理解

- [VideoLLaMA 2](https://github.com/DAMO-NLP-SG/VideoLLaMA2)：阿里达摩院团队官方实现，覆盖视频内容理解向自然语言检索与摘要的关键链路。

### 视频算法 / 4D 轨迹

- [TraceAnything](https://github.com/ByteDance-Seed/TraceAnything)：字节跳动 Seed 官方 ICLR 2026 项目，是视频运动理解连接 4D 场景与虚拟制作的重要底层能力。

### 视频算法 / 人体 4D

- [ActionMesh](https://github.com/facebookresearch/actionmesh)：Meta 官方视频到可动画网格项目，直接连接算法研究与 3D 角色舞台生产。

### 视频生成 / 编辑模型

- [Bernini](https://github.com/bytedance/Bernini)：字节跳动 2026 官方开源项目，代码与权重完整，是生成和编辑统一化的重要新路线。

### 视频生成 / 多模态模型

- [Lance](https://github.com/bytedance/Lance)：字节跳动 2026 官方研究仓库，方向同时覆盖视频理解、生成和编辑，适合列为前沿跟踪。

### 视频自动剪辑 / 指令编辑

- [Kiwi-Edit](https://github.com/showlab/Kiwi-Edit)：作者团队官方 2026 项目，代码、数据和编辑范式较完整，可用于自动视频修改能力评估。

### 视频自动剪辑 / 内容生产

- [Vidi](https://github.com/bytedance/vidi)：字节跳动官方项目，直接命中“视频理解后自动剪辑”的完整工作流，而非单一视觉模型。

### 视频生成 / 语义控制

- [Video-As-Prompt](https://github.com/bytedance/Video-As-Prompt)：字节跳动官方 ICLR 2026 项目，已提供低显存训练与推理路径，适合镜头运动和动效复用。

### 视频生成 / 长视频

- [Stable Video Infinity](https://github.com/vita-epfl/Stable-Video-Infinity)：EPFL 团队 ICLR 2026 Oral 官方实现，是长视频生成与连续舞台背景的重要研究方向。

### 视频生成 / 基础模型

- [HunyuanVideo](https://github.com/Tencent-Hunyuan/HunyuanVideo)：腾讯官方高影响力开源视频模型，是自建视频生成能力和第三方工作流适配的核心基线。

### 视频生成 / 轻量模型

- [HunyuanVideo 1.5](https://github.com/Tencent-Hunyuan/HunyuanVideo-1.5)：腾讯混元官方 2026 迭代，能持续反映开放视频模型向更轻量部署发展的进度。

### 视频生成 / RGBA 合成

- [Wan-Alpha](https://github.com/WeChatCV/Wan-Alpha)：微信视觉团队 CVPR 2026 Highlight 官方实现，直接解决视频生成进入专业合成流程的关键格式问题。

### 视频自动剪辑 / Agent

- [ViMax](https://github.com/HKUDS/ViMax)：香港大学团队官方开源视频生产智能体，适合作为自动编导和多 Agent 协作的观察样本。
- [OpenMontage](https://github.com/calesthio/OpenMontage)：实现了可运行的端到端自动视频生产链路，可补充大型研究模型缺少编排层的问题。

### 视频自动剪辑 / 时间线

- [OpenTimelineIO](https://github.com/AcademySoftwareFoundation/OpenTimelineIO)：Academy Software Foundation 核心项目，是 AI 自动剪辑结果进入专业后期软件的可靠基础设施。

### 视频自动剪辑 / 程序化制作

- [Remotion](https://github.com/remotion-dev/remotion)：成熟的程序化视频生产工具，可把 AI 生成的脚本、素材和结构稳定转成可重复渲染的成片。

### 视频编辑 / 评测基准

- [IVEBench](https://github.com/RyanChenYN/IVEBench)：ICLR 2026 官方基准，可用于统一比较不同视频编辑模型，避免仅凭演示视频判断质量。

### 视频编辑 / 区域控制

- [ReCo](https://github.com/HiDream-ai/ReCo)：ICML 2026 官方实现，模型、数据和编辑评测链路较完整，工程可验证性较强。

### 视频编辑 / 稀疏控制

- [NOVA](https://github.com/WeChatCV/NovaEdit)：微信视觉团队 CVPR 2026 官方仓库，代表低标注成本视频编辑的新方向。

### 视频编辑 / 实时控制

- [EditCtrl](https://github.com/yehonathanlitman/EditCtrl)：CVPR 2026 作者官方代码，适合跟踪视频编辑从离线生成走向交互式创作的进展。

### 视频编辑 / 分层分解

- [EasyOmnimatte](https://github.com/GVCLab/EasyOmnimatte)：CVPR 2026 官方实现，提供从单层视频走向结构化可编辑素材的重要能力。

### 视频 3D 舞台 / 重拍

- [Vista4D](https://github.com/Eyeline-Labs/Vista4D)：CVPR 2026 Highlight 官方代码、模型和数据已发布，直接对应视频 3D 舞台与虚拟摄影。

### 视频 3D 舞台 / 世界生成

- [WorldStereo](https://github.com/FuchengSu/WorldStereo)：腾讯混元与浙大团队 CVPR 2026 官方项目，代码和模型权重已发布，是视频生成与 3D 场景融合的核心路线。

### 视频 3D 舞台 / 全景生成

- [OmniRoam](https://github.com/yuhengliu02/OmniRoam)：SIGGRAPH 2026 作者官方项目，直接覆盖全景视频、三维重建和沉浸式舞台内容。

### 视频 3D 舞台 / 虚拟摄影机

- [Stable Virtual Camera](https://github.com/Stability-AI/stable-virtual-camera)：Stability AI 官方开放项目，为产品化的虚拟摄影机、镜头预演和空间视频生成提供基线。

### 视频 3D 舞台 / 文生三维

- [VIST3A](https://github.com/gohyojun15/VIST3A)：ICLR 2026 Oral 作者官方实现，代表利用视频先验构建 3D 资产和舞台的新方法。

### 视频 3D 舞台 / 视差动画

- [DepthFlow](https://github.com/BrokenSource/DepthFlow)：工程化程度较高，可作为低成本图片转 3D 镜头、舞台背景和短视频动效工具。

### 视频 3D 舞台 / 几何一致生成

- [World-R1](https://github.com/microsoft/World-R1)：微软 ICML 2026 官方仓库，明确解决视频生成缺乏 3D 一致性和镜头控制的问题。

### 视频 3D 舞台 / 空间理解

- [VLM-3R](https://github.com/VITA-Group/VLM-3R)：CVPR 2026 官方实现，训练、评测和模型权重已开放，是视频空间理解连接多模态 Agent 的重要组件。

### WAIC 物理 AI / VLA 与机器人基础模型

- [ACoT-VLA](https://github.com/AgibotTech/ACoT-VLA)：智元机器人官方 VLA 基线，直接覆盖物理 AI 的感知、认知、决策与执行闭环。
- [OpenPI](https://github.com/Physical-Intelligence/openpi)：当前开放 VLA 体系的重要基线，模型、训练和部署链路对通用机器人研究具有高参考价值。
- [OpenVLA](https://github.com/openvla/openvla)：开放 VLA 领域的核心项目，可作为新模型、数据集和机器人策略的长期比较基线。
- [LeRobot](https://github.com/huggingface/lerobot)：Hugging Face 官方机器人生态底座，适合持续跟踪模型从研究代码走向真实设备部署。
- [MolmoAct 2](https://github.com/allenai/molmoact2)：Ai2 官方开放物理 AI 模型，强调空间理解和动作生成，是多模态模型走向机器人执行的重要路线。
- [UniVLA](https://github.com/OpenDriveLab/UniVLA)：OpenDriveLab 官方通用机器人策略项目，代表用统一动作表示降低本体碎片化的关键方向。
- [InternVLA-M1](https://github.com/InternRobotics/InternVLA-M1)：上海 AI Lab 官方通用操作策略，和 WAIC 空间智能、具身交互主题高度一致。
- [InternVLA-A Series](https://github.com/InternRobotics/InternVLA-A-series)：上海 AI Lab 官方 VLA 主线项目，体现理解、生成和行动统一建模的发展趋势。
- [starVLA](https://github.com/starVLA/starVLA)：提供可比较、可扩展的 VLA 工程底座，适合跟踪 PhysBrain、NeuroVLA 等新策略。

### WAIC 物理 AI / 世界模型与空间智能

- [AgiBot World Model Baseline](https://github.com/AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline)：智元机器人官方世界模型基线，直接反映物理 AI 从感知预测走向闭环行动的发展。
- [EWMBench](https://github.com/AgibotTech/EWMBench)：世界模型进入机器人控制前必须有可比较的评测体系，该项目是智元官方关键基础设施。
- [Genie Envisioner](https://github.com/AgibotTech/Genie-Envisioner)：智元机器人官方具身世界模型主线，可与 Genie Sim、EVAC 和 EWMBench 形成完整观察链路。
- [Cosmos Predict 2.5](https://github.com/nvidia-cosmos/cosmos-predict2.5)：物理 AI 世界模型的核心开放平台，可服务机器人、自动驾驶和工业数字孪生的数据生成。
- [V-JEPA 2](https://github.com/facebookresearch/vjepa2)：Meta 官方世界模型研究主线，把大规模视频学习与真实机器人规划直接连接起来。
- [JEPA World Models](https://github.com/facebookresearch/jepa-wms)：Meta 官方将世界模型落到机器人规划的研究代码，适合持续观察预测表征的实用边界。
- [World-in-World](https://github.com/World-In-World/world-in-world)：ICLR 2026 Oral 官方项目，解决传统世界模型只看离线视频指标、忽略行动反馈的问题。
- [ARTDECO](https://github.com/InternRobotics/ARTDECO)：上海 AI Lab ICLR 2026 官方项目，直接补齐物理 AI 从视觉输入到结构化空间状态的环节。

### WAIC 物理 AI / 仿真、合成数据与 Sim2Real

- [MolmoSpaces](https://github.com/allenai/molmospaces)：Ai2 官方 simulation-first 物理 AI 栈，覆盖场景、数据、训练和 Sim2Real 的完整链路。
- [Isaac Lab](https://github.com/isaac-sim/IsaacLab)：当前物理 AI 仿真和合成数据的重要工业底座，机器人研究与产品验证均应持续关注。
- [Cosmos Transfer 2.5](https://github.com/nvidia-cosmos/cosmos-transfer2.5)：NVIDIA 官方物理 AI 数据生成主线，直接服务 Sim2Real、机器人感知和世界仿真。
- [MuJoCo](https://github.com/google-deepmind/mujoco)：Google DeepMind 官方基础设施，是机器人算法比较和可复现实验的长期核心基线。
- [Genesis](https://github.com/Genesis-Embodied-AI/genesis-world)：新一代开放物理仿真平台，能够补充传统机器人模拟器在速度和生成式场景上的能力。
- [ManiSkill](https://github.com/mani-skill/ManiSkill)：操作学习领域的成熟开放平台，适合统一验证 VLA、模仿学习和强化学习策略。
- [Habitat Lab](https://github.com/facebookresearch/habitat-lab)：Meta 官方具身 AI 任务层基础设施，覆盖空间导航到移动操作的关键研究路径。
- [Habitat Sim](https://github.com/facebookresearch/habitat-sim)：Meta 官方具身仿真底座，与 Habitat Lab 共同构成空间智能研究的核心平台。
- [BEHAVIOR-1K / OmniGibson](https://github.com/StanfordVL/BEHAVIOR-1K)：Stanford 官方大规模交互式任务基准，适合检验机器人是否真正理解并改变物理环境。
- [RoboCasa](https://github.com/robocasa/robocasa)：把高质量室内场景生成与机器人操作结合，适合关注空间设计和具身任务的交叉方向。
- [RoboTwin](https://github.com/RoboTwin-Platform/RoboTwin)：覆盖数字孪生、合成数据和双臂操作，是制造业物理 AI 需要长期关注的工程平台。
- [Unitree MuJoCo](https://github.com/unitreerobotics/unitree_mujoco)：连接国内主流机器人硬件与开放物理仿真的官方项目，对 WAIC 人形机器人方向具有直接价值。

### WAIC 物理 AI / 机器人学习、控制与数据

- [RoboInter](https://github.com/InternRobotics/RoboInter)：上海 AI Lab ICLR 2026 官方完整套件，覆盖数据、推理、规划和执行，是物理 AI 核心项目。
- [InternManip](https://github.com/InternRobotics/InternManip)：上海 AI Lab 官方操作学习基础设施，可降低不同数据集和模型之间的工程割裂。
- [InternNav](https://github.com/InternRobotics/InternNav)：上海 AI Lab 官方导航主线，连接空间理解、语言指令和真实机器人移动控制。
- [NavDP](https://github.com/InternRobotics/NavDP)：ICRA 2026 官方 Sim2Real 导航项目，直接体现用高效仿真数据驱动真实机器人决策。
- [UltraDexGrasp](https://github.com/InternRobotics/UltraDexGrasp)：上海 AI Lab ICRA 2026 官方项目，命中制造和服务机器人最关键的灵巧操作能力。
- [RoboSplat](https://github.com/InternRobotics/RoboSplat)：把 3DGS 与机器人策略训练直接结合，和平台现有 3D 重建主线具有高协同价值。
- [Unitree RL Gym](https://github.com/unitreerobotics/unitree_rl_gym)：国内人形机器人运动控制的重要官方基线，适合持续跟踪物理 AI 从策略到硬件的落地。

### 世界模型 / 物理 AI

- [Kairos](https://github.com/kairos-agi/kairos)：官方项目仓库，Apache-2.0 许可，具备原创论文、完整代码结构和明确维护证据。
- [NVIDIA Cosmos](https://github.com/NVIDIA/cosmos)：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。

### 世界模型 / 机器人遥操作

- [RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop)：candidate-decisions 已批准；官方组织下的精确仓库已核验，含训练、推理、配置和示例代码。

### 模型训练 / Agent 工程

- [Tinker Cookbook](https://github.com/thinking-machines-lab/tinker-cookbook)：candidate-decisions 已批准；官方仓库、Apache-2.0 许可、持续提交、正式 release 和完整教程均已核验。

### Agent 工程 / 云原生

- [Multi AI Agents Cloud Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native)：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。

### 开放模型 / 训练效率

- [Modded-NanoGPT](https://github.com/KellerJordan/modded-nanogpt)：同日 AI 日报强制候选，OpenAI 官方报告直接链接；MIT 许可、2,000 余次提交、完整 README 与可运行训练流程均已核验。

### 开放模型 / 模型训练

- [LLaMA Factory](https://github.com/hiyouga/LlamaFactory)：本地快照新增 Stars 25 且近期持续维护；成熟度、原创性、可安装性和开放模型方向价值均通过质量门槛。

### 视频生成 / 自动剪辑

- [Toonflow](https://github.com/HBAI-Ltd/Toonflow-app)：命中 OSS Insight 24 小时趋势且产品实现完整；在明确记录非标准许可风险的前提下纳入持续跟踪。

### 3DGS / 三维工具

- [Godot Gaussian Splatting](https://github.com/ReconWorldLab/godot-gaussian-splatting)：进入 OSS Insight 24 小时前 20，且与 3DGS/设计工具主线高度一致；可运行性、许可和近期发行均已核验。

### 3D 地理空间 / Agent 工具

- [Cesium AI Integrations](https://github.com/CesiumGS/cesium-ai-integrations)：同日 AI 强制候选；官方关系明确，可运行集成与 3D/设计自动化方向高度相关。

### Agent Skills / 音频生成

- [ElevenLabs Skills](https://github.com/elevenlabs/skills)：同日 AI 强制候选；官方、可安装、有测试且对多媒体 Agent 工作流有直接实用价值。

### Agent Skills / Gemini 开发

- [Gemini Skills](https://github.com/google-gemini/gemini-skills)：同日 AI 强制候选；精确官方仓库、可安装性和维护证据均已核验，同时保留非正式支持风险。

### 模型后训练 / Agentic RL

- [Tunix](https://github.com/google/tunix)：同日 AI 强制候选；官方 Agentic RL 更新直接对应仓库，原创性、维护和可复现性证据充分。

### 3D / OpenUSD 实验

- [Omniverse Labs](https://github.com/NVIDIA-Omniverse/omniverse-labs)：同日 AI 强制候选；与 OpenUSD/3D 工具链高度相关，但因实验性质和较短历史定为 B。

### 编码 Agent / 开发工具

- [OpenAI Codex](https://github.com/openai/codex)：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。

### 设计系统 / AI 辅助设计

- [Astryx](https://github.com/facebook/astryx)：P0 AI 设计工具候选；官方关系、原创实现、可安装性、Demo、release 和维护证据充分，综合质量达到 A。

### CAD / Agent Skills

- [CAD Skills](https://github.com/earthtojake/text-to-cad)：P0 CAD/设计自动化候选；精确仓库、原创性、可运行工作流、活跃维护和交付格式覆盖均已核验，综合质量达到 A。

### 具身智能 / Agentic RL

- [RLinf](https://github.com/RLinf/RLinf)：P0 物理 AI 候选；原创实现、近期提交、README、安装文档和社区协作证据充分，综合质量达到 A。

### AI for Science / 科研 Agent

- [Microsoft Discovery](https://github.com/microsoft/discovery)：同日 AI 强制候选；Microsoft 官方关系、可安装应用、科研 Agent 目录、starter kits 和协作维护均已核验，综合质量达到 A。

### AI 计算基础设施 / GPU

- [AMD ROCm](https://github.com/ROCm/ROCm)：同日 AI 强制候选；AMD 官方基础设施、稳定公开仓库、活跃维护和模型训练实用性充分，综合质量达到 A+。

### 3D 场景描述 / 设计基础设施

- [OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD)：同日 AI 强制候选；官方 release 与精确仓库已核验，对 3D/AEC/设计互操作具有基础设施级价值。

### 生成模型 / 推理基础设施

- [Hugging Face Diffusers](https://github.com/huggingface/diffusers)：同日 AI 强制候选；精确官方仓库、原创实现、可安装性和活跃维护均已核验，综合质量达到 A+。

### 模型推理 / GPU Kernels

- [Hugging Face Kernels](https://github.com/huggingface/kernels)：同日 AI 强制候选；官方关系、原创性、可用性和近期维护证据充分，综合质量达到 A。

### 图像生成 / 开放模型

- [FLUX](https://github.com/black-forest-labs/flux)：同日 AI 强制候选；精确官方仓库可验证，但对 FLUX 3 权重开放状态保持审慎，不作超出证据的推断。

### Agent 工程 / GitHub 自动化

- [GitHub Agentic Workflows](https://github.com/github/gh-aw)：同日 AI 强制候选；官方关系、可安装实现、文档和活跃维护均已核验，综合质量达到 A。

### Agent 工程 / MCP

- [GitHub MCP Server](https://github.com/github/github-mcp-server)：同日 AI 强制候选；官方关系、协议实现、可部署性与维护活跃度均达到 A+。

### Agent 协议 / 兼容性测试

- [MCP Conformance](https://github.com/modelcontextprotocol/conformance)：同日 AI 强制候选；官方关系、协议价值、原创实现和维护证据充分，综合质量达到 A。

### 生成模型 / 高效推理

- [Nunchaku](https://github.com/nunchaku-ai/nunchaku)：同日 AI 强制候选；原创实现、可安装性、模型生成价值和维护活跃度均已核验，综合质量达到 A。

### 生成模型 / 模型压缩

- [Diffuse Compressor](https://github.com/rootonchair/diffuse-compressor)：同日 AI 强制候选；原创性和可用性证据充分，但生态与长期维护证据较短，定为 B+。

