# GitHub Radar 2026-08-01

- 运行状态：**warning**（09:00 二次审计）
- 候选池：1595 条原始观察，313 个候选，2 个 surging，11 个 hot。
- 核验范围：全部 2 个 surging、前 11 个 hot、全部 3 个精确 AI 强制候选、全部 213 个跟踪项目，以及 5 个 watch 轮换样本。
- 同日 AI 日报：2026-08-01 / success。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地快照增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势源。
- 累计 Stars 只作背景；最终判断综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可证、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试次数 | 错误 |
| --- | --- | ---: | ---: | --- |
| github-open-model-new | failed | 0 | 2 | HTTP 403 |
| ossinsight-24h-all | success | 100 | 1 |  |
| ossinsight-weekly-all | success | 100 | 1 |  |
| ossinsight-24h-python | success | 69 | 1 |  |
| github-video-2026-new | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-video-3d-stage-active | success | 50 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| github-vla-robotics-active | success | 50 | 1 |  |
| github-video-generation-active | success | 50 | 1 |  |
| github-video-editing-active | success | 50 | 1 |  |
| github-video-intelligence-active | success | 50 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| ossinsight-24h-typescript | success | 75 | 1 |  |
| github-ai-new | success | 0 | 2 |  |
| github-agent-active | success | 50 | 2 |  |
| github-simready-active | success | 35 | 2 |  |
| github-image-generation-active | success | 50 | 2 |  |
| github-physical-ai-active | success | 50 | 2 |  |
| github-robot-simulation-active | failed | 0 | 2 | HTTP 403 |
| github-3d-active | success | 50 | 2 |  |
| github-3dgs-active | success | 50 | 2 |  |

主趋势 `ossinsight-24h-all`：**success**。

## Surging、前 12 个 Hot 与 AI 强制候选核验

| 仓库 | 队列 | Stars / Forks | 最近活动 | License | 核验结论 |
| --- | --- | ---: | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | surging | 45,330 / 7,732 | 2026-07-26 | MIT | **不收录**：主体为课程/教程集合；热度不能绕过原创实现与产品质量门槛。 |
| [Robbyant/lingbot-video](https://github.com/Robbyant/lingbot-video) | surging | 894 / 42 | 2026-07-31 | Apache-2.0 | **观察**：官方模型、代码、权重、文档和 Apache-2.0 许可证均可核验；首发后提交间隔较长，先观察持续维护。 |
| [NVIDIA/cosmos](https://github.com/NVIDIA/cosmos) | hot | 11,327 / 799 | 2026-07-29 | OpenMDW-1.1 | **收录/保留**：同日 AI 日报强制候选；NVIDIA 官方组织仓库，原创实现、README、活跃 issue/PR 与近期提交均已核验。 |
| [pascalorg/editor](https://github.com/pascalorg/editor) | hot | 0 / 0 | 未提供 | NOASSERTION | **观察**：仓库可访问、未归档且通过基础质量核验；继续观察维护、发布与行业价值后再决定正式收录。 |
| [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) | hot | 4,078 / 349 | 2026-07-20 | MIT | **观察**：仓库可访问、未归档且通过基础质量核验；继续观察维护、发布与行业价值后再决定正式收录。 |
| [huggingface/transformers.js](https://github.com/huggingface/transformers.js) | hot | 16,223 / 1,172 | 2026-07-31 | Apache-2.0 | **观察**：仓库可访问、未归档且通过基础质量核验；继续观察维护、发布与行业价值后再决定正式收录。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | hot | 25,288 / 4,439 | 2026-07-31 | MIT | **不收录**：主体为教程与示例集合，不作为原创产品或研究实现收录。 |
| [vladmandic/sdnext](https://github.com/vladmandic/sdnext) | hot | 7,195 / 565 | 2026-07-31 | Apache-2.0 | **观察**：仓库可访问、未归档且通过基础质量核验；继续观察维护、发布与行业价值后再决定正式收录。 |
| [alibaba/MNN](https://github.com/alibaba/MNN) | hot | 15,772 / 2,394 | 2026-07-31 | Apache-2.0 | **观察**：仓库可访问、未归档且通过基础质量核验；继续观察维护、发布与行业价值后再决定正式收录。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 31,019 / 7,558 | 2026-07-31 | Apache-2.0 | **观察**：仓库可访问、未归档且通过基础质量核验；继续观察维护、发布与行业价值后再决定正式收录。 |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | hot | 42,194 / 3,493 | 2026-07-31 | MIT | **收录/保留**：Existing approved project retained from the formal tracked inventory. |
| [usestrix/strix](https://github.com/usestrix/strix) | hot | 46,196 / 4,841 | 2026-07-31 | Apache-2.0 | **收录/保留**：Existing approved project retained from the formal tracked inventory. |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 223,403 / 43,002 | 2026-07-31 | MIT | **收录/保留**：Existing approved project retained from the formal tracked inventory. |
| [google-gemini/robotics-samples](https://github.com/google-gemini/robotics-samples) | watch / AI 强制 | 77 / 10 | 2026-07-30 | Apache-2.0 | **收录/保留**：7 月 31 日 AI 日报强制候选；仓库直接对应 Gemini Robotics 2/ER 2 的物理 Agent、连续视频理解、任务编排和多机器人协作，符合 ark.insight 物理 AI 与智能空间最高优先方向。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 27 / 11 | 2026-07-13 | MIT | **收录/保留**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |

核验覆盖精确 owner/repo、官方关系、Stars/Forks、最近提交、Tags/Releases、Issue/PR 活跃、README/Demo、许可证、归档/分叉状态和基础可用性。

## 候选入选原因

- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；本地快照新增 Stars 169；最近 6 天有推送；跨 4 个来源命中
- `Robbyant/lingbot-video`：行业优先：WAIC 物理 AI、视频生成模型、视频生成 / 自动剪辑；新仓库 24 天；最近 1 天有推送
- `NVIDIA/cosmos`：行业优先：3D / 三维生成、WAIC 物理 AI；最近 3 天有推送；跨 5 个来源命中
- `pascalorg/editor`：行业优先：3D / 三维生成；OSS Insight 24h 新增关注 2；24h 活跃分 208；跨 3 个来源命中
- `wuyoscar/GPT-Image2-Skill`：行业优先：生成式图像模型；本地快照新增 Stars 23；跨 2 个来源命中
- `huggingface/transformers.js`：行业优先：最新开放模型；最近 1 天有推送；跨 2 个来源命中
- `Anil-matcha/Open-Generative-AI`：行业优先：生成式图像模型、视频生成模型、视频生成 / 自动剪辑；最近 1 天有推送
- `vladmandic/sdnext`：行业优先：最新开放模型；最近 1 天有推送
- `alibaba/MNN`：行业优先：最新开放模型；最近 1 天有推送
- `sgl-project/sglang`：行业优先：最新开放模型；最近 1 天有推送
- `hugohe3/ppt-master`：OSS Insight 24h 新增关注 3；24h 活跃分 211；最近 1 天有推送；跨 5 个来源命中
- `usestrix/strix`：OSS Insight 24h 新增关注 2；24h 活跃分 206；最近 1 天有推送；跨 5 个来源命中
- `NousResearch/hermes-agent`：最近 1 天有推送；AI 日报/周报强制候选；跨 3 个来源命中
- `google-gemini/robotics-samples`：行业优先：WAIC 物理 AI、视频算法 / 理解；最近 2 天有推送；AI 日报/周报强制候选；跨 3 个来源命中
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中

## candidate-decisions 处理

- `ai-cad-workflows`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `alibaba-damo-rynnworld-teleop`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `anthropics-claude-code`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `copilot-cloud-agent`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `cosmos-coalition`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `genebench-v1`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `kinfey-multi-agents`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `nous-hermes-agent`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-codex-security-plugin`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-gpt-red-assets`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `openai-multi-agent-beta`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `programmatic-tool-calling`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `runway-agent-2`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `the-kotlin-benchmark`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `thinking-machines-tinker-cookbook`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。
- `xai-org-grok-build`：**approved**。approved 优先，observe 保留；rejected 仅在出现新的官方或显著活跃证据时重开。本轮未覆盖决策文件。

## 未解析 AI 候选

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
- GitHub Copilot cloud agent（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。
- AI floor-plan / room-design CAD export（ai-daily-forced）：未确认稳定精确 URL，继续保留，不猜测地址。

## Watch 轮换抽查

- `AgibotTech/genie_sim`：1,282 Stars；行业优先：3D / 三维生成、WAIC 物理 AI；最近 3 天有推送；跨 5 个来源命中。
- `calesthio/OpenMontage`：44,377 Stars；行业优先：视频生成模型、视频生成 / 自动剪辑；跨 5 个来源命中。
- `lbouaraba/comfyui-krea2edit`：384 Stars；行业优先：AI 设计工具、生成式图像模型；OSS Insight 24h 新增关注 1；24h 活跃分 204；最近 7 天有推送。
- `earthtojake/text-to-cad`：12,237 Stars；行业优先：建筑设计 / AEC、AI 设计工具；OSS Insight 24h 新增关注 1；24h 活跃分 204；最近 3 天有推送。
- `Robbyant/lingbot-map`：16,001 Stars；行业优先：3D / 三维生成、最新开放模型；跨 4 个来源命中。

## 跟踪项目刷新

- 全部 213 个正式跟踪项目已完成当日官方元数据刷新，未沿用旧缓存；正式跟踪 213 个仓库；本轮选择 213 项，其中刷新 213 项、复用 0 项当日缓存；17 项来自既有正式清单的兼容刷新；154 项通过 GitHub 官方页面核验。高热与 AI 强制项目优先，其余项目按最旧元数据轮换。

## 运行结论

OSS Insight 24 小时主趋势成功，同日 AI 日报已就绪，首次采集的 213 个跟踪项目元数据刷新完整。09:00 二次发现仍为 2 个 surging、11 个 hot、313 个候选，未产生新的正式收录；但 `github-robot-simulation-active` 与 `github-open-model-new` 均在两次尝试后返回 HTTP 403，因此本轮保留 warning，并阻断严格零警告发布。
