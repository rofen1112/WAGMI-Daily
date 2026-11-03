# GitHub Radar 2026-07-29

- 运行状态：**success**
- 候选池：1670 条原始观察，315 个候选，4 个 surging，9 个 hot。
- 核验范围：全部 4 个 surging、前 9 个 hot、全部 34 个精确 AI 强制候选、全部 211 个跟踪项目，以及 5 个 watch 轮换样本。
- 同日 AI 日报：2026-07-29 / success。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地快照增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势源。
- 累计 Stars 只作背景；最终判断综合 24 小时动量、本地增量、排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试次数 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-ai-new | success | 0 | 1 |  |
| github-open-model-new | success | 5 | 1 |  |
| ossinsight-24h-typescript | success | 90 | 1 |  |
| ossinsight-weekly-all | success | 100 | 1 |  |
| github-image-generation-active | success | 50 | 1 |  |
| github-vla-robotics-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| ossinsight-24h-python | success | 100 | 1 |  |
| ossinsight-24h-all | success | 100 | 1 |  |
| github-video-intelligence-active | success | 50 | 1 |  |
| github-physical-ai-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-agent-active | success | 50 | 2 |  |
| github-simready-active | success | 35 | 2 |  |
| github-ai-active | success | 50 | 2 |  |
| github-robot-simulation-active | success | 50 | 2 |  |
| github-video-3d-stage-active | success | 50 | 2 |  |
| github-video-generation-active | success | 50 | 2 |  |
| github-video-editing-active | success | 50 | 2 |  |
| github-interior-design-active | success | 50 | 2 |  |
| github-video-2026-new | success | 50 | 2 |  |

主趋势 `ossinsight-24h-all`：**success**。

## Surging 与前 12 个 Hot 完整核验

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release 核验 | License | 核验结论 |
| --- | --- | ---: | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 44,615 / 7,557 | 2026-07-26 | 已检查官方 Releases | MIT | **不收录**：主体为课程/教程集合；热度不能绕过原创实现门槛。 |
| [img2threejs/img2threejs](https://github.com/img2threejs/img2threejs) | surging | 7,709 / 589 | 2026-07-29 | 已检查官方 Releases | Apache-2.0 | **收录/保留**：2026-07-21 首次收录后持续进入 surging 队列，仓库已迁移到官方组织并发布 v1.5.0；Apache-2.0 许可、原创程序化 3D 流程、浏览器 Demo、近期提交和社区增长均已核验，继续正式跟踪。 |
| [Robbyant/lingbot-video](https://github.com/Robbyant/lingbot-video) | surging | 879 / 39 | 2026-07-10 | 已检查官方 Releases | Apache-2.0 | **观察**：仓库真实可用且通过当日基础核验，继续观察维护质量与行业价值。 |
| [andrewyng/openworker](https://github.com/andrewyng/openworker) | surging / AI 强制 | 0 / 0 | 未提供 | 已检查官方 Releases | NOASSERTION | **观察**：官方公开 Beta 且活动旺盛；既有工作区信任/RCE 风险证据仍需跟踪。 |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | hot / AI 强制 | 11,281 / 791 | 2026-07-29 | 已检查官方 Releases | NOASSERTION | **收录/保留**：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。 |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | hot | 16,214 / 1,169 | 2026-07-28 | 已检查官方 Releases | Apache-2.0 | **观察**：仓库真实可用且通过当日基础核验，继续观察维护质量与行业价值。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | hot | 25,079 / 4,387 | 2026-07-28 | 已检查官方 Releases | MIT | **不收录**：主体为教程与示例集合，不作为原创产品或研究实现收录。 |
| [vladmandic/sdnext](https://github.com/vladmandic/sdnext) | hot | 7,187 / 564 | 2026-07-28 | 已检查官方 Releases | Apache-2.0 | **观察**：仓库真实可用且通过当日基础核验，继续观察维护质量与行业价值。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 30,876 / 7,474 | 2026-07-29 | 已检查官方 Releases | Apache-2.0 | **观察**：仓库真实可用且通过当日基础核验，继续观察维护质量与行业价值。 |
| [pascalorg/editor](https://github.com/pascalorg/editor) | hot | 0 / 0 | 未提供 | 已检查官方 Releases | NOASSERTION | **观察**：仓库真实可用且通过当日基础核验，继续观察维护质量与行业价值。 |
| [alibaba/MNN](https://github.com/alibaba/MNN) | hot | 15,744 / 2,392 | 2026-07-28 | 已检查官方 Releases | Apache-2.0 | **观察**：仓库真实可用且通过当日基础核验，继续观察维护质量与行业价值。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | hot / AI 强制 | 27 / 11 | 2026-07-13 | 已检查官方 Releases | MIT | **收录/保留**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 221,975 / 42,499 | 2026-07-29 | 已检查官方 Releases | MIT | **收录/保留**：Existing approved project retained from the formal tracked inventory. |

核验覆盖精确 owner/repo、官方关系、Stars/Forks、最近提交、release、issue/PR 活跃、README/Demo、license、归档/分叉状态和基础可用性。

## AI 日报/周报强制候选

| 仓库 | Stars / Forks | 最近活动 | License | 入选原因 | 核验结论 |
| --- | ---: | --- | --- | --- | --- |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | 11,281 / 791 | 2026-07-29 | NOASSERTION | 行业优先：3D / 三维生成、WAIC 物理 AI；AI 日报/周报强制候选；跨 6 个来源命中；本地快照新增 Stars 17 | **收录/保留**：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。 |
| [isaac-for-healthcare/Cosmos-H-Dreams](https://github.com/isaac-for-healthcare/Cosmos-H-Dreams) | 15 / 2 | 2026-07-27 | NOASSERTION | 行业优先：WAIC 物理 AI；最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 7 | **收录/保留**：同日 AI 强制候选；物理 AI 与医疗仿真价值明确、实现可运行，但官方关系和临床证据边界需持续提示，定为 B+。 |
| [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) | 3,565 / 291 | 2026-07-28 | NOASSERTION | 行业优先：最新开放模型；最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 2436 | **收录/保留**：同日 AI 强制候选；官方关系、开放权重、技术新鲜度和行业影响显著，综合质量达到 A+。 |
| [NVIDIA/flashdreams](https://github.com/NVIDIA/flashdreams) | 427 / 42 | 2026-07-29 | NOASSERTION | 行业优先：3D / 三维生成、WAIC 物理 AI；最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 3 | **收录/保留**：同日 AI 强制候选；官方实现、世界模型方向、可运行性与工程价值充分，综合质量达到 A。 |
| [ROCm/ROCm](https://github.com/ROCm/ROCm) | 6,725 / 588 | 2026-07-28 | MIT | 行业优先：WAIC 物理 AI；最近 7 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 4 | **收录/保留**：同日 AI 强制候选；AMD 官方基础设施、稳定公开仓库、活跃维护和模型训练实用性充分，综合质量达到 A+。 |
| [NVIDIA-Omniverse/omniverse-labs](https://github.com/NVIDIA-Omniverse/omniverse-labs) | 37 / 4 | 2026-07-24 | NOASSERTION | 行业优先：3D / 三维生成；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 1 | **收录/保留**：同日 AI 强制候选；与 OpenUSD/3D 工具链高度相关，但因实验性质和较短历史定为 B。 |
| [PixarAnimationStudios/OpenUSD](https://github.com/PixarAnimationStudios/OpenUSD) | 7,406 / 1,439 | 2026-07-20 | NOASSERTION | 行业优先：建筑设计 / AEC、3D / 三维生成；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 3 | **收录/保留**：同日 AI 强制候选；官方 release 与精确仓库已核验，对 3D/AEC/设计互操作具有基础设施级价值。 |
| [black-forest-labs/flux](https://github.com/black-forest-labs/flux) | 25,819 / 1,905 | 2025-07-31 | Apache-2.0 | 行业优先：生成式图像模型；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 4 | **收录/保留**：同日 AI 强制候选；精确官方仓库可验证，但对 FLUX 3 权重开放状态保持审慎，不作超出证据的推断。 |
| [CesiumGS/cesium-ai-integrations](https://github.com/CesiumGS/cesium-ai-integrations) | 83 / 11 | 2026-05-04 | Apache-2.0 | 行业优先：3D / 三维生成、AI 设计工具；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系明确，可运行集成与 3D/设计自动化方向高度相关。 |
| [huggingface/diffusers](https://github.com/huggingface/diffusers) | 34,174 / 7,181 | 2026-07-29 | Apache-2.0 | 行业优先：最新开放模型；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 9 | **收录/保留**：同日 AI 强制候选；精确官方仓库、原创实现、可安装性和活跃维护均已核验，综合质量达到 A+。 |
| [huggingface/kernels](https://github.com/huggingface/kernels) | 715 / 115 | 2026-07-28 | Apache-2.0 | 行业优先：最新开放模型；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系、原创性、可用性和近期维护证据充分，综合质量达到 A。 |
| [andrewyng/openworker](https://github.com/andrewyng/openworker) | 0 / 0 | 未提供 | NOASSERTION | OSS Insight 24h 新增关注 5；24h 活跃分 221；AI 日报/周报强制候选；跨 4 个来源命中 | **观察**：官方公开 Beta 且活动旺盛；既有工作区信任/RCE 风险证据仍需跟踪。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | 27 / 11 | 2026-07-13 | MIT | OSS Insight 24h 新增关注 1；24h 活跃分 204；AI 日报/周报强制候选；跨 4 个来源命中；本地快照新增 Stars 1 | **收录/保留**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | 221,975 / 42,499 | 2026-07-29 | MIT | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 5525 | **收录/保留**：Existing approved project retained from the formal tracked inventory. |
| [malloydata/malloy](https://github.com/malloydata/malloy) | 2,500 / 132 | 2026-07-27 | MIT | 最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方关系、原创语义层实现、可安装性和持续维护证据充分，综合质量达到 A。 |
| [microsoft/discovery](https://github.com/microsoft/discovery) | 217 / 48 | 2026-07-27 | MIT | 最近 7 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 3 | **收录/保留**：同日 AI 强制候选；Microsoft 官方关系、可安装应用、科研 Agent 目录、starter kits 和协作维护均已核验，综合质量达到 A。 |
| [openclaw/openclaw](https://github.com/openclaw/openclaw) | 384,441 / 80,782 | 2026-07-29 | NOASSERTION | 最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 91 | **收录/保留**：同日 AI 强制候选；官方关系、原创实现、可安装性、持续发布和维护活跃度充分，综合质量达到 A。 |
| [vllm-project/vllm](https://github.com/vllm-project/vllm) | 87,512 / 19,999 | 2026-07-29 | Apache-2.0 | 最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 162 | **收录/保留**：同日 AI 强制候选；基础设施影响力、原创实现、维护活跃度与可用性均达到 A+。 |
| [elevenlabs/skills](https://github.com/elevenlabs/skills) | 395 / 55 | 2026-07-23 | MIT | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；官方、可安装、有测试且对多媒体 Agent 工作流有直接实用价值。 |
| [google-gemini/gemini-skills](https://github.com/google-gemini/gemini-skills) | 3,857 / 388 | 2026-07-24 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 3 | **收录/保留**：同日 AI 强制候选；精确官方仓库、可安装性和维护证据均已核验，同时保留非正式支持风险。 |
| [google/tunix](https://github.com/google/tunix) | 2,388 / 326 | 2026-07-29 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 1 | **收录/保留**：同日 AI 强制候选；官方 Agentic RL 更新直接对应仓库，原创性、维护和可复现性证据充分。 |
| [KellerJordan/modded-nanogpt](https://github.com/KellerJordan/modded-nanogpt) | 5,600 / 849 | 2026-07-28 | MIT | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 6 | **收录/保留**：同日 AI 日报强制候选，OpenAI 官方报告直接链接；MIT 许可、2,000 余次提交、完整 README 与可运行训练流程均已核验。 |
| [openai/codex](https://github.com/openai/codex) | 102,210 / 15,336 | 2026-07-29 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 331 | **收录/保留**：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [github/gh-aw](https://github.com/github/gh-aw) | 4,824 / 469 | 2026-07-29 | MIT | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 7 | **收录/保留**：同日 AI 强制候选；官方关系、可安装实现、文档和活跃维护均已核验，综合质量达到 A。 |
| [github/github-mcp-server](https://github.com/github/github-mcp-server) | 31,805 / 4,666 | 2026-07-28 | MIT | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 31 | **收录/保留**：同日 AI 强制候选；官方关系、协议实现、可部署性与维护活跃度均达到 A+。 |
| [modelcontextprotocol/conformance](https://github.com/modelcontextprotocol/conformance) | 88 / 64 | 2026-07-28 | NOASSERTION | AI 日报/周报强制候选；跨 3 个来源命中；本地快照新增 Stars 1 | **收录/保留**：同日 AI 强制候选；官方关系、协议价值、原创实现和维护证据充分，综合质量达到 A。 |
| [nunchaku-ai/nunchaku](https://github.com/nunchaku-ai/nunchaku) | 3,920 / 267 | 2026-03-07 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；原创实现、可安装性、模型生成价值和维护活跃度均已核验，综合质量达到 A。 |
| [rootonchair/diffuse-compressor](https://github.com/rootonchair/diffuse-compressor) | 8 / 1 | 2026-07-28 | Apache-2.0 | AI 日报/周报强制候选；跨 3 个来源命中 | **收录/保留**：同日 AI 强制候选；原创性和可用性证据充分，但生态与长期维护证据较短，定为 B+。 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 139,437 / 22,387 | 2026-07-25 | NOASSERTION | AI 日报/周报强制候选；跨 2 个来源命中；本地快照新增 Stars 1437 | **收录/保留**：Existing approved project retained from the formal tracked inventory. |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | 23,279 / 4,409 | 2026-07-28 | Apache-2.0 | AI 日报/周报强制候选；跨 2 个来源命中；本地快照新增 Stars 6908 | **收录/保留**：Existing approved project retained from the formal tracked inventory. |
| [googleapis/js-genai](https://github.com/googleapis/js-genai) | 0 / 0 | 未提供 | NOASSERTION | AI 日报/周报强制候选 | **观察**：仓库真实可用且通过当日基础核验，继续观察维护质量与行业价值。 |
| `Inferact/Kimi-K3-DSpark`（404，未生成链接） | 0 / 0 | 未提供 | NOASSERTION | AI 日报/周报强制候选 | **观察**：GitHub 连接器返回 404；按未解析资产名保留，不猜测替代仓库 URL。 |
| `nvidia/Cosmos-H-Dreams`（404，未生成链接） | 0 / 0 | 未提供 | NOASSERTION | AI 日报/周报强制候选 | **观察**：GitHub 连接器返回 404；按未解析资产名保留，不猜测替代仓库 URL。 |
| `nvidia/Cosmos3-Edge`（404，未生成链接） | 0 / 0 | 未提供 | NOASSERTION | AI 日报/周报强制候选 | **观察**：GitHub 连接器返回 404；按未解析资产名保留，不猜测替代仓库 URL。 |

## candidate-decisions 处理

- `ai-cad-workflows`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `alibaba-damo-rynnworld-teleop`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `anthropics-claude-code`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `copilot-cloud-agent`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `cosmos-coalition`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `genebench-v1`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `kinfey-multi-agents`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `nous-hermes-agent`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `openai-codex-security-plugin`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `openai-gpt-red-assets`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `openai-multi-agent-beta`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `programmatic-tool-calling`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `runway-agent-2`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `the-kotlin-benchmark`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `thinking-machines-tinker-cookbook`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `xai-org-grok-build`：**approved**。approved 优先，observe 保留，rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。

## 未解析 AI 候选

- cyvcf2（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- HI.SIM（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- hifiasm（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- MHCflurry（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- bayesm-rs（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- RustQC（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- HelixForge（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Credible CLI / Modeling MCP server / Cursor extension（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
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
- Claude Opus 5 API/model assets（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Induction Labs Photon-1 model/code assets（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- TRACE (arXiv:2606.11119) code（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Microsoft MAI-Cyber-1-Flash / MDASH assets（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Multiverse GLM 5.1 and Qwen 3.6 27B uncensored weights \| pending \| repo/model URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- ExploitGym benchmark code/data \| pending \| repo URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- AOUSD Core Specification 1.1 repository \| pending \| owner/repo 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Neurocad CAD integrations \| pending \| repo/SDK URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Claude Security plugin \| pending \| repo/plugin URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Cursor Router CLI/SDK integration \| pending \| repo URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Anthropic agent-memory SDK integrations \| pending \| stable repo mapping 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- GitHub Copilot for Linear app integration \| pending \| implementation repo URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Claude Opus 5 API/model assets \| pending \| repo/model URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- andrewyng/openworker \| verified \| https://github.com/andrewyng/openworker（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- Induction Labs Photon-1 model/code assets \| pending \| repo/model URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- TRACE (arXiv:2606.11119) code \| pending \| repo URL 待核验（ai-weekly-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- inferact/kimi-k3-dspark（ai-daily-forced）：GitHub 连接器返回 404；按未解析资产名保留，不猜测替代仓库 URL。
- nvidia/cosmos-h-dreams（ai-daily-forced）：GitHub 连接器返回 404；按未解析资产名保留，不猜测替代仓库 URL。
- nvidia/cosmos3-edge（ai-daily-forced）：GitHub 连接器返回 404；按未解析资产名保留，不猜测替代仓库 URL。

## Watch 轮换抽查

- `calesthio/OpenMontage`：42,709 Stars；行业优先：视频生成模型、视频生成 / 自动剪辑；OSS Insight 24h 新增关注 2；24h 活跃分 209；最近 5 天有推送。
- `HBAI-Ltd/Toonflow-app`：12,835 Stars；行业优先：视频生成模型、视频生成 / 自动剪辑；OSS Insight 24h 新增关注 2；24h 活跃分 206；跨 6 个来源命中。
- `Robbyant/lingbot-map`：15,786 Stars；行业优先：3D / 三维生成、最新开放模型；OSS Insight 24h 新增关注 1；24h 活跃分 204；最近 6 天有推送；本地快照新增 Stars 101。
- `AgibotTech/genie_sim`：1,276 Stars；行业优先：3D / 三维生成、WAIC 物理 AI；最近 7 天有推送；跨 5 个来源命中；本地快照新增 Stars 5。
- `Fysics-AI/Fysiverse-3D-SimReady`：10 Stars；行业优先：3D / 三维生成、物理一致 / SimReady；新仓库 15 天；跨 3 个来源命中；本地快照新增 Stars 1。

## 跟踪项目刷新

- 全部 30 个高热或 AI 强制项目已完成当日刷新；其余 74 个长尾项目保留正式跟踪并按最旧元数据轮换更新。

## 运行结论

OSS Insight 24 小时主趋势成功、外部来源有效、同日 AI 日报已就绪，且跟踪元数据刷新完整；本轮状态为 success。

