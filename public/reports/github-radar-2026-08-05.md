# GitHub Radar 2026-08-05

- 运行状态：**success**
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：1659 条原始观察，328 个候选，2 个 surging，15 个 hot。
- 核验范围：全部 2 个 surging、前 12 个 hot、全部 14 个 AI 强制候选、全部 226 个正式跟踪项目，以及 5 个 watch 轮换样本。
- AI 日报：2026-08-05 / success；周报：2026-08-03T01:52:11.203Z / success。

## 热门阈值与判断

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照新增 Stars 不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地快照新增 Stars 不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；最终判断综合 24 小时动量、本地增量、趋势排名、跨来源命中、仓库新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| ossinsight-24h-all | success | 100 | 1 |  |
| ossinsight-weekly-all | success | 100 | 1 |  |
| ossinsight-24h-python | success | 100 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| ossinsight-24h-typescript | success | 58 | 1 |  |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 5 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 34 | 1 |  |
| github-open-model-new | success | 5 | 1 |  |
| github-image-generation-active | success | 50 | 1 |  |
| github-video-intelligence-active | success | 50 | 1 |  |
| github-video-generation-active | success | 50 | 1 |  |
| github-video-editing-active | success | 50 | 1 |  |
| github-video-3d-stage-active | success | 50 | 1 |  |
| github-video-2026-new | success | 50 | 1 |  |
| github-physical-ai-active | success | 50 | 1 |  |
| github-vla-robotics-active | success | 50 | 1 |  |
| github-robot-simulation-active | success | 50 | 1 |  |

主趋势 `ossinsight-24h-all`：**success**。

## Surging、Hot 与 AI 强制候选核验

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | 可访问 / 归档 / Fork | 核验结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 45,928 / 7,909 | 2026-08-04 | v2026.07 | MIT | 是 / 否 / 否 | **拒绝**：课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。 |
| [Robbyant/lingbot-video](https://github.com/Robbyant/lingbot-video) | surging | 904 / 44 | 2026-07-31 | 无 GitHub tag；2026-07-09 发布代码与权重 | Apache-2.0 | 是 / 否 / 否 | **收录**：连续观察后出现新的持续维护证据，且仓库具备原创模型、开放权重、可运行安装路径和物理 AI 视频生成价值，因此由 observe 转为正式跟踪。 |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | hot | 11,374 / 806 | 2026-07-29 | Cosmos3 | OpenMDW-1.1 | 是 / 否 / 否 | **收录**：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。 |
| [pascalorg/editor](https://github.com/pascalorg/editor) | hot | 21,046 / 2,688 | 2026-08-03 | v0.9.1 | MIT | 是 / 否 / 否 | **收录**：命中 AEC/3D P0 方向；官方关系、原创实现、安装与演示入口、近期发布及维护活跃度均通过质量门槛。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 31,280 / 7,645 | 2026-08-04 | 已检查 Releases；无影响本次判断的新版本信号 | Apache-2.0 | 是 / 否 / 否 | **收录**：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。 |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | hot | 16,229 / 1,173 | 2026-07-31 | 4.2.0 | Apache-2.0 | 是 / 否 / 否 | **收录**：官方关系、原创浏览器推理实现、Apache-2.0 许可、可安装性、近期发布和持续协作均通过质量门槛。 |
| [syswonder/robonix](https://github.com/syswonder/robonix) | hot | 275 / 42 | 2026-08-04 | v0.1-rc1 | MulanPSL-2.0 | 是 / 否 / 否 | **收录**：命中物理 AI P0；具备原创实现、MulanPSL-2.0 许可、可运行安装与 Webots Demo、七类机器人部署和持续维护证据，按 B 级正式跟踪。 |
| [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) | hot / AI 强制 | 8,048 / 602 | 2026-07-28 | 无 GitHub tag | Kimi-K3-License | 是 / 否 / 否 | **收录**：同日 AI 强制候选；官方关系、开放权重、技术新鲜度和行业影响显著，综合质量达到 A+。 |
| [vladmandic/sdnext](https://github.com/vladmandic/sdnext) | hot | 7,199 / 565 | 2026-07-23 | 无 GitHub tag | Apache-2.0 | 是 / 否 / 否 | **收录**：命中 AI 图像/视频生成与设计工具 P0 方向；原创性、可安装性、许可、成熟度和持续维护均通过质量门槛。 |
| [alibaba/MNN](https://github.com/alibaba/MNN) | hot | 15,808 / 2,395 | 2026-08-04 | 已检查 Releases；无影响本次判断的新版本信号 | Apache-2.0 | 是 / 否 / 否 | **收录**：官方身份、成熟原创实现、Apache-2.0 许可、端侧多模态价值、近期发布与维护活跃度均通过质量门槛。 |
| [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) | hot | 4,151 / 356 | 2026-07-20 | v0.2.0 | MIT | 是 / 否 / 否 | **观察**：MIT、v0.2.0、CLI 与 Agent Skill 均可用，但主体仍偏提示词画廊与 API 工作流，原创技术深度继续观察。 |
| [datawhalechina/every-embodied](https://github.com/datawhalechina/every-embodied) | hot | 2,997 / 301 | 2026-08-01 | 无 GitHub tag | NOASSERTION | 是 / 否 / 否 | **观察**：高质量具身智能课程并含可运行复现 Demo，但主要定位仍为教育集合，暂不按原创框架或研究仓库正式收录。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | hot | 25,560 / 4,492 | 2026-08-04 | v2.0.0 | MIT | 是 / 否 / 否 | **拒绝**：本轮新增主要是 README 与商业白标推广；仍是第三方模型 API 聚合前端，没有足以重开拒绝决策的新原创证据。 |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | hot | 43,002 / 3,546 | 2026-07-31 | v4.3.0 | MIT | 是 / 否 / 否 | **收录**：既有正式收录项目；本轮重新核验后继续保留。 |
| [google-gemini/robotics-samples](https://github.com/google-gemini/robotics-samples) | watch / AI 强制 | 92 / 14 | 2026-07-30 | 无 GitHub tag | Apache-2.0 | 是 / 否 / 否 | **收录**：7 月 31 日 AI 日报强制候选；仓库直接对应 Gemini Robotics 2/ER 2 的物理 Agent、连续视频理解、任务编排和多机器人协作，符合 ark.insight 物理 AI 与智能空间最高优先方向。 |
| [NVIDIA/flashdreams](https://github.com/NVIDIA/flashdreams) | watch / AI 强制 | 443 / 41 | 2026-07-29 | 无 GitHub tag | Apache-2.0 | 是 / 否 / 否 | **收录**：同日 AI 强制候选；官方实现、世界模型方向、可运行性与工程价值充分，综合质量达到 A。 |
| [isaac-for-healthcare/Cosmos-H-Dreams](https://github.com/isaac-for-healthcare/Cosmos-H-Dreams) | watch / AI 强制 | 34 / 6 | 2026-07-27 | 无 GitHub tag | Apache-2.0 | 是 / 否 / 否 | **收录**：同日 AI 强制候选；物理 AI 与医疗仿真价值明确、实现可运行，但官方关系和临床证据边界需持续提示，定为 B+。 |
| [googleapis/js-genai](https://github.com/googleapis/js-genai) | watch / AI 强制 | 1,657 / 262 | 2026-08-03 | v2.15.0 | Apache-2.0 | 是 / 否 / 否 | **收录**：最新已完成周报强制候选；官方身份、可安装 SDK、持续维护与 Agent/多模态工程价值均通过质量门槛。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 225,479 / 43,797 | 2026-07-31 | v2026.8.3 | MIT | 是 / 否 / 否 | **收录**：既有正式收录项目；本轮重新核验后继续保留。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 27 / 11 | 2026-07-13 | 无 GitHub tag | MIT | 是 / 否 / 否 | **收录**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 103,917 / 15,691 | 2026-07-30 | rust-v0.146.0 | Apache-2.0 | 是 / 否 / 否 | **收录**：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [vllm-project/vllm](https://github.com/vllm-project/vllm) | watch / AI 强制 | 88,188 / 20,281 | 2026-07-29 | v0.26.0 | Apache-2.0 | 是 / 否 / 否 | **收录**：同日 AI 强制候选；基础设施影响力、原创实现、维护活跃度与可用性均达到 A+。 |
| [malloydata/malloy](https://github.com/malloydata/malloy) | watch / AI 强制 | 2,537 / 134 | 2026-07-27 | v0.0.427 | MIT | 是 / 否 / 否 | **收录**：同日 AI 强制候选；官方关系、原创语义层实现、可安装性和持续维护证据充分，综合质量达到 A。 |
| [perplexityai/numbat](https://github.com/perplexityai/numbat) | watch / AI 强制 | 684 / 68 | 2026-08-01 | v0.1.2 | Apache-2.0 | 是 / 否 / 否 | **收录**：最新已完成周报强制候选；官方关系、原创 Agent 安全实现、跨平台可安装性和近期维护证据均通过质量门槛。 |
| [cursor/mixture-of-kittens](https://github.com/cursor/mixture-of-kittens) | watch / AI 强制 | 161 / 11 | 2026-08-03 | 无 GitHub tag；初始公开发布 | Apache-2.0 | 是 / 否 / 否 | **收录**：官方关系、原创系统实现、明确许可、可安装性、公开基准与生产维护证据充分，符合新发布开放工程仓库优先方向，按 A 级正式跟踪。 |
| [Inferact/Kimi-K3-DSpark](https://github.com/Inferact/Kimi-K3-DSpark) | watch / AI 强制 | 0 / 0 | 未提供 | 已检查 Releases；无影响本次判断的新版本信号 | NOASSERTION | 404 / 否 / 否 | **观察**：GitHub 连接器返回 404；保留为未解析模型资产，不猜测替代 URL。 |
| [nvidia/Cosmos-H-Dreams](https://github.com/nvidia/Cosmos-H-Dreams) | watch / AI 强制 | 0 / 0 | 未提供 | 已检查 Releases；无影响本次判断的新版本信号 | NOASSERTION | 404 / 否 / 否 | **观察**：GitHub 连接器返回 404；已知同名 Hugging Face 模型资产，但不把模型页猜作 GitHub 仓库。 |

核验覆盖精确 owner/repo、官方关系、Stars/Forks、最近提交、Release、Issue/PR 活跃、README/Demo/安装入口、许可、归档/分叉状态和可用性。连接器用于身份、README、提交与协作核验；GitHub 官方仓库/API/Release 页面用于补充指标和版本证据。

## 候选入选原因

- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 178；最近 1 天有推送；跨 4 个来源命中。
- `Robbyant/lingbot-video`：行业优先：WAIC 物理 AI、最新开放模型、视频生成模型、视频生成 / 自动剪辑；新仓库 28 天；最近 5 天有推送；跨 3 个来源命中。
- `NVIDIA/cosmos`：行业优先：3D / 三维生成、WAIC 物理 AI；最近 7 天有推送；跨 5 个来源命中。
- `pascalorg/editor`：行业优先：建筑设计 / AEC、3D / 三维生成、AI 设计工具；OSS Insight 24h 新增关注 1；24h 活跃分 205；最近 1 天有推送。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；OSS Insight 24h 新增关注 2；24h 活跃分 74；最近 1 天有推送。
- `huggingface/transformers.js`：行业优先：最新开放模型；最近 5 天有推送；跨 4 个来源命中。
- `syswonder/robonix`：行业优先：WAIC 物理 AI、机器人仿真 / Sim2Real；OSS Insight 24h 新增关注 2；24h 活跃分 208；最近 1 天有推送。
- `MoonshotAI/Kimi-K3`：行业优先：最新开放模型；AI 日报/周报强制候选；跨 4 个来源命中。
- `vladmandic/sdnext`：行业优先：生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送；跨 3 个来源命中。
- `alibaba/MNN`：行业优先：3D / 三维生成、生成式图像模型、最新开放模型；最近 1 天有推送；跨 3 个来源命中。
- `wuyoscar/GPT-Image2-Skill`：行业优先：生成式图像模型；本地快照新增 Stars 20；跨 2 个来源命中。
- `datawhalechina/every-embodied`：行业优先：WAIC 物理 AI；本地快照新增 Stars 20；最近 4 天有推送。
- `Anil-matcha/Open-Generative-AI`：行业优先：生成式图像模型、视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 2；最近 1 天有推送。
- `hugohe3/ppt-master`：OSS Insight 24h 新增关注 1；24h 活跃分 204；最近 5 天有推送；跨 5 个来源命中。
- `google-gemini/robotics-samples`：行业优先：WAIC 物理 AI、视频算法 / 理解；最近 6 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `NVIDIA/flashdreams`：行业优先：3D / 三维生成、WAIC 物理 AI；最近 7 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `isaac-for-healthcare/Cosmos-H-Dreams`：行业优先：WAIC 物理 AI；AI 日报/周报强制候选；跨 3 个来源命中。
- `googleapis/js-genai`：行业优先：视频生成模型、视频生成 / 自动剪辑；AI 日报/周报强制候选；跨 3 个来源命中。
- `NousResearch/hermes-agent`：最近 5 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `openai/codex`：最近 6 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `vllm-project/vllm`：最近 7 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `malloydata/malloy`：AI 日报/周报强制候选；跨 3 个来源命中。
- `perplexityai/numbat`：AI 日报/周报强制候选；跨 3 个来源命中。
- `cursor/mixture-of-kittens`：AI 日报/周报强制候选。
- `Inferact/Kimi-K3-DSpark`：AI 日报/周报强制候选。
- `nvidia/Cosmos-H-Dreams`：AI 日报/周报强制候选。

## candidate-decisions 处理

- `ai-cad-workflows`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `alibaba-damo-rynnworld-teleop`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `anthropics-claude-code`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `copilot-cloud-agent`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `cosmos-coalition`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `genebench-v1`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `kinfey-multi-agents`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `nous-hermes-agent`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `openai-codex-security-plugin`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `openai-gpt-red-assets`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `openai-multi-agent-beta`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `programmatic-tool-calling`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `runway-agent-2`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `the-kotlin-benchmark`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `thinking-machines-tinker-cookbook`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。
- `xai-org-grok-build`：**approved**；approved 优先、observe 保留、rejected 仅在出现新的官方或显著活跃证据时重开；本轮未覆盖决策文件。

## 未解析 AI 候选

- mistralai/Shieldstral-1.0-3B (Hugging Face)（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- LiquidAI/LFM2.5-2.6B (Hugging Face)（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- Inferact/Kimi-K3-DSpark model asset \| pending \| repo/model URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Microsoft MAI-Cyber-1-Flash / MDASH assets \| pending \| repo/model URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- nvidia/Cosmos-H-Dreams model asset \| verified \| https://huggingface.co/nvidia/Cosmos-H-Dreams（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Credible CLI / Modeling MCP server / Cursor extension \| pending \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- cyvcf2 \| pending forced intake \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- HI.SIM \| pending forced intake \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- hifiasm \| pending forced intake \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- MHCflurry \| pending forced intake \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- bayesm-rs \| pending forced intake \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- RustQC \| pending forced intake \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- HelixForge \| pending forced intake \| repo URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- DeepSeek V4-Flash 0731 model/code assets \| pending \| repo/model URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Microsoft MAI-Cyber-1-Flash / MDASH assets \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- cyvcf2 \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- HI.SIM \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- hifiasm \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- MHCflurry \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- bayesm-rs \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- RustQC \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- HelixForge \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Credible CLI / Modeling MCP server / Cursor extension \| verified or pending review（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- GitHub Copilot cloud agent（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [calesthio/OpenMontage](https://github.com/calesthio/OpenMontage)：行业优先：视频生成模型、视频生成 / 自动剪辑；OSS Insight 24h 新增关注 1；24h 活跃分 204；跨 6 个来源命中。
- [RLinf/RLinf](https://github.com/RLinf/RLinf)：行业优先：WAIC 物理 AI；OSS Insight 24h 新增关注 1；24h 活跃分 204；最近 1 天有推送。
- [AgibotTech/genie_sim](https://github.com/AgibotTech/genie_sim)：行业优先：3D / 三维生成、WAIC 物理 AI；最近 1 天有推送；跨 5 个来源命中。
- [huggingface/lerobot](https://github.com/huggingface/lerobot)：行业优先：WAIC 物理 AI、机器人学习 / 控制、最新开放模型；OSS Insight 24h 新增关注 1；24h 活跃分 69；跨 4 个来源命中。
- [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map)：行业优先：3D / 三维生成、最新开放模型；跨 4 个来源命中。

## 正式库存刷新与结论

- 正式跟踪项目：226 个；本轮全量刷新原有 224 个项目，再核验并同步新增项目，未沿用昨日元数据。
- 新收录：`syswonder/robonix`（B）与 `cursor/mixture-of-kittens`（A）。
- 继续观察：`wuyoscar/GPT-Image2-Skill`、`datawhalechina/every-embodied`、`fippo/warp-snap-sped`；继续拒绝教程/商业薄封装热点。
- `candidate-decisions.json` 保持不变；仅更新行业 watchlist、`data/dev`、本报告和 `public/reports`，未写入 `data/main`。

