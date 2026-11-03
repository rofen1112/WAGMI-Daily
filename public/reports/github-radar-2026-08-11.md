# GitHub Radar 2026-08-11

- 运行状态：**warning**（同日 AI 日报状态为 warning；11 个强制核验仓库不可访问或核验失败）
- 运行标识：`wagmi-github`；频道：`github`；计划：**每天 07:30**。
- 候选池：1774 条原始观察，435 个候选，0 个 surging，11 个 hot。
- 核验范围：全部 0 个 surging、前 11 个 hot、全部 114 个 AI 强制候选、全部 233 个已跟踪项目，以及 5 个 watch 轮换样本。
- 核验覆盖：111/122 个强制仓库可访问；README 107，提交 111，Issue 111，PR 111，Releases 111。
- AI 日报：2026-08-11 / warning；最新已完成周报：2026-08-10T07:56:32+08:00 / warning。

## 热门阈值

- `surging`：全语言 24 小时前 5、24 小时新增关注不少于 50、本地快照增长不少于 100，或 30 天内新仓库且累计 Stars 不少于 500。
- `hot`：全语言 24 小时前 20、Python/TypeScript 前 5、24 小时新增关注不少于 15、本地增长不少于 20、近期活跃搜索前 10，或 AI 强制候选同时命中外部趋势。
- 累计 Stars 仅作背景；结论综合 24 小时动量、本地增量、趋势排名、跨来源命中、新鲜度、原创性、许可、维护和可用性。

## 趋势来源状态

| 来源 | 状态 | 数量 | 尝试 | 错误 |
| --- | --- | ---: | ---: | --- |
| ossinsight-24h-python | success | 92 | 1 |  |
| ossinsight-24h-all | success | 100 | 1 |  |
| ossinsight-24h-typescript | success | 70 | 1 |  |
| ossinsight-weekly-all | success | 100 | 1 |  |
| github-ai-active | success | 50 | 1 |  |
| github-agent-active | success | 50 | 1 |  |
| github-ai-new | success | 1 | 1 |  |
| github-aec-design-active | success | 50 | 1 |  |
| github-interior-design-active | success | 50 | 1 |  |
| github-3d-active | success | 50 | 1 |  |
| github-3d-generation-active | success | 50 | 1 |  |
| github-3dgs-active | success | 50 | 1 |  |
| github-simready-active | success | 38 | 1 |  |
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

## 强制核验结论

| 仓库 | 队列 | Stars / Forks | 最近提交 | Release | License | README / Demo | Issue / PR | 状态 | 结论 |
| --- | --- | ---: | --- | --- | --- | --- | --- | --- | --- |
| [rohitg00/ai-engineering-from-scratch](https://github.com/rohitg00/ai-engineering-from-scratch) | hot | 46,474 / 8,081 | 2026-08-09 | v2026.08 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：课程与教程集合；新增关注和文档提交不构成新的原创产品或研究实现证据。 |
| [vladmandic/sdnext](https://github.com/vladmandic/sdnext) | hot | 7,303 / 574 | 2026-08-07 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：命中 AI 图像/视频生成与设计工具 P0 方向；原创性、可安装性、许可、成熟度和持续维护均通过质量门槛。 |
| [wuyoscar/GPT-Image2-Skill](https://github.com/wuyoscar/GPT-Image2-Skill) | hot | 4,317 / 366 | 2026-08-10 | v0.2.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：提示词画廊、CLI 与 Agent Skill 可用，但主体偏提示词/API 工作流，原创技术深度继续观察。 |
| [sgl-project/sglang](https://github.com/sgl-project/sglang) | hot | 31,637 / 7,786 | 2026-08-10 | v0.5.17 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。 |
| [Anil-matcha/Open-Generative-AI](https://github.com/Anil-matcha/Open-Generative-AI) | hot | 26,024 / 4,588 | 2026-08-10 | v2.0.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：仍是第三方模型 API 聚合前端；没有足以重开既有拒绝判断的新原创证据。 |
| [KunAgent/Kun](https://github.com/KunAgent/Kun) | hot | 6,070 / 572 | 2026-08-07 | v0.2.37 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Comfy-Org/ComfyUI](https://github.com/Comfy-Org/ComfyUI) | hot / AI 强制 | 126,292 / 14,898 | 2026-08-10 | v0.31.0 | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。 |
| [FreedomIntelligence/Awesome-Economic-World-Models](https://github.com/FreedomIntelligence/Awesome-Economic-World-Models) | hot / AI 强制 | 48 / 2 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **拒绝**：仓库定位是论文与资源清单，缺少可运行原创实现，未通过质量门槛。 |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | hot / AI 强制 | 228,440 / 44,929 | 2026-08-10 | v2026.8.3 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Existing approved project retained from the formal tracked inventory. |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | hot | 44,423 / 3,634 | 2026-08-10 | v4.5.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Existing approved project retained from the formal tracked inventory. |
| [usestrix/strix](https://github.com/usestrix/strix) | hot | 50,792 / 5,421 | 2026-08-10 | v1.5.3 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：Existing approved project retained from the formal tracked inventory. |
| [APRIL-ZJU/Gaussian-LIC](https://github.com/APRIL-ZJU/Gaussian-LIC) | watch / AI 强制 | 594 / 55 | 2026-08-08 | 已检查 Releases，无 tag | GPL-3.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：命中 3DGS、物理 AI 与机器人建图方向；官方关系、原创研究实现、明确许可、可复现路径和近期更新通过质量门槛，按 B 级正式跟踪。 |
| [jd-opensource/JoyAI-Video-Edit](https://github.com/jd-opensource/JoyAI-Video-Edit) | watch / AI 强制 | 718 / 29 | 2026-08-07 | 已检查 Releases，无 tag | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：命中视频生成、视频编辑和开放模型 P0；官方关系、原创实现、明确许可、可运行发布、Demo 与近期维护证据均通过质量门槛，按 A 级正式跟踪。 |
| [huggingface/huggingface_hub](https://github.com/huggingface/huggingface_hub) | watch / AI 强制 | 3,792 / 1,131 | 2026-08-10 | v1.27.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：官方关系、原创基础设施实现、明确许可、可安装性与持续维护证据充分，按 A 级正式跟踪。 |
| [MoonshotAI/Kimi-K3](https://github.com/MoonshotAI/Kimi-K3) | watch / AI 强制 | 8,331 / 638 | 2026-08-06 | 已检查 Releases，无 tag | Kimi-K3-License | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：同日 AI 强制候选；官方关系、开放权重、技术新鲜度和行业影响显著，综合质量达到 A+。 |
| [huggingface/huggingface.js](https://github.com/huggingface/huggingface.js) | watch / AI 强制 | 2,487 / 828 | 2026-08-08 | hub-v2.15.0 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：官方身份、原创 SDK 实现、明确许可、安装路径与维护活跃度通过质量门槛，按 A 级正式跟踪。 |
| [yliu-cs/MMaDA-VLA](https://github.com/yliu-cs/MMaDA-VLA) | watch / AI 强制 | 0 / 0 | 2026-05-14 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：包含原创 VLA 训练、评测与 Demo，但缺少明确 LICENSE 且维护新鲜度不足，继续观察。 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | watch / AI 强制 | 27 / 11 | 2026-08-01 | 已检查 Releases，无 tag | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。 |
| [Comfy-Org/workflow_templates](https://github.com/Comfy-Org/workflow_templates) | watch / AI 强制 | 764 / 164 | 2026-08-10 | v0.11.37 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：官方仓库直接承载 H3 Day-0 可复现制作流程，具备原创模板、可安装分发和持续维护证据，因此正式收录。 |
| [cursor/mixture-of-kittens](https://github.com/cursor/mixture-of-kittens) | watch / AI 强制 | 501 / 53 | 2026-08-10 | v0.1.0 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：官方关系、原创系统实现、明确许可、可安装性、公开基准与生产维护证据充分，符合新发布开放工程仓库优先方向，按 A 级正式跟踪。 |
| [openai/codex](https://github.com/openai/codex) | watch / AI 强制 | 105,148 / 15,924 | 2026-08-10 | rust-v0.148.0-alpha.6 | Apache-2.0 | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。 |
| [pion/webrtc](https://github.com/pion/webrtc) | watch / AI 强制 | 16,709 / 1,874 | 2026-08-04 | v4.2.18 | MIT | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **收录**：虽然不是 AI 模型仓库，但它是 GPT-Live/WARP 事件直接指向的成熟实时 Agent 传输基础设施，质量和维护证据充分，按 B 级跟踪。 |
| [ziboshao/AgentPatch](https://github.com/ziboshao/AgentPatch) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [zylwithxy/HRDiT](https://github.com/zylwithxy/HRDiT) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [agentplugins/agent-plugins-spec](https://github.com/agentplugins/agent-plugins-spec) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：规范方向相关但仍早期，缺少明确 LICENSE 与持续发布证据，继续观察。 |
| [11isnotavailable/INTraJ](https://github.com/11isnotavailable/INTraJ) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [6somehow/DAC-SPADE](https://github.com/6somehow/DAC-SPADE) | watch / AI 强制 | 0 / 0 | 2026-05-26 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [AIVRC/DAC-Pose](https://github.com/AIVRC/DAC-Pose) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [AK-DREAM/EcoFrame](https://github.com/AK-DREAM/EcoFrame) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [AlayaLab/HelloWorld](https://github.com/AlayaLab/HelloWorld) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [alimama-tech/PyMAL](https://github.com/alimama-tech/PyMAL) | watch / AI 强制 | 0 / 0 | 2026-03-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Aoko955/Flash-VAED](https://github.com/Aoko955/Flash-VAED) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [bahumanyarg11/tta-explanation-stability-pipeline](https://github.com/bahumanyarg11/tta-explanation-stability-pipeline) | watch / AI 强制 | 0 / 0 | 2026-08-07 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [BITHLP/HomeSafeBench](https://github.com/BITHLP/HomeSafeBench) | watch / AI 强制 | 0 / 0 | 2026-08-04 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [bryanwong17/BEACON](https://github.com/bryanwong17/BEACON) | watch / AI 强制 | 0 / 0 | 2026-08-07 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [cau-hai-lab/PORTA](https://github.com/cau-hai-lab/PORTA) | watch / AI 强制 | 0 / 0 | 2026-08-07 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [chenjing-2024/agent-trajectory-attribution](https://github.com/chenjing-2024/agent-trajectory-attribution) | watch / AI 强制 | 0 / 0 | 2026-08-02 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ControlGenAI/MaterialFusion](https://github.com/ControlGenAI/MaterialFusion) | watch / AI 强制 | 0 / 0 | 2025-02-28 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [CPS-research-group/ink_bwts](https://github.com/CPS-research-group/ink_bwts) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [criticaldata/benchmaxxing](https://github.com/criticaldata/benchmaxxing) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [CryptoAILab/FakeI2V-Bench](https://github.com/CryptoAILab/FakeI2V-Bench) | watch / AI 强制 | 0 / 0 | 2026-05-26 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Daijing-ai/CIGT-Surv](https://github.com/Daijing-ai/CIGT-Surv) | watch / AI 强制 | 0 / 0 | 未核实 | 已检查 Releases，无 tag | NOASSERTION | 否 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [datamllab/A2E](https://github.com/datamllab/A2E) | watch / AI 强制 | 0 / 0 | 2026-08-09 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [dhruvashp/latent-denoising-for-lmms](https://github.com/dhruvashp/latent-denoising-for-lmms) | watch / AI 强制 | 0 / 0 | 2026-04-23 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [discoverse-dev/FGGS-LiDAR](https://github.com/discoverse-dev/FGGS-LiDAR) | watch / AI 强制 | 0 / 0 | 2026-08-04 | v1.0-data | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [elecreak/HiSC](https://github.com/elecreak/HiSC) | watch / AI 强制 | 0 / 0 | 2026-07-14 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [eth-medical-ai-lab/agent-gui](https://github.com/eth-medical-ai-lab/agent-gui) | watch / AI 强制 | 0 / 0 | 2026-08-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [gitrxh/ADRS-arxiv](https://github.com/gitrxh/ADRS-arxiv) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [H-EmbodVis/SimWAM](https://github.com/H-EmbodVis/SimWAM) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [HanZhi306/SkillTV-Bench](https://github.com/HanZhi306/SkillTV-Bench) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [HITlixian/TGRS_GSFF](https://github.com/HITlixian/TGRS_GSFF) | watch / AI 强制 | 0 / 0 | 未核实 | 已检查 Releases，无 tag | NOASSERTION | 否 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [HongjieZhou0329/RSVideo](https://github.com/HongjieZhou0329/RSVideo) | watch / AI 强制 | 0 / 0 | 2026-08-04 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [hustvl/DreamWAM](https://github.com/hustvl/DreamWAM) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [I2-Multimedia-Lab/MultiCompose](https://github.com/I2-Multimedia-Lab/MultiCompose) | watch / AI 强制 | 0 / 0 | 2026-08-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [IF-LAB-PKU/EchoCache](https://github.com/IF-LAB-PKU/EchoCache) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [IF-LAB-PKU/Token-Radius-Attention](https://github.com/IF-LAB-PKU/Token-Radius-Attention) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [jaykim9870/Not_All_Redundant_Tokens_Are_Alike](https://github.com/jaykim9870/Not_All_Redundant_Tokens_Are_Alike) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [JiamingChen1234/MAFIA](https://github.com/JiamingChen1234/MAFIA) | watch / AI 强制 | 0 / 0 | 2026-08-04 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [jianshuod/IPI-exposure-signal](https://github.com/jianshuod/IPI-exposure-signal) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [JiaqiZhang-Sengoku/LEADer](https://github.com/JiaqiZhang-Sengoku/LEADer) | watch / AI 强制 | 0 / 0 | 2026-07-11 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Jiyuan-Tan/CausalForge](https://github.com/Jiyuan-Tan/CausalForge) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [kandinskylab/kvae](https://github.com/kandinskylab/kvae) | watch / AI 强制 | 0 / 0 | 2026-08-07 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [kandinskylab/kvae-audio](https://github.com/kandinskylab/kvae-audio) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [KByrski/FlaRe](https://github.com/KByrski/FlaRe) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [KlingAIResearch/MetaView](https://github.com/KlingAIResearch/MetaView) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [MasoumehSharafi/EB-CaP](https://github.com/MasoumehSharafi/EB-CaP) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [mingti-org/phyai](https://github.com/mingti-org/phyai) | watch / AI 强制 | 0 / 0 | 2026-08-02 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [neuraloperator/sparse_ct](https://github.com/neuraloperator/sparse_ct) | watch / AI 强制 | 0 / 0 | 2026-07-15 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ninaa-git/survey_pc_registration_tta](https://github.com/ninaa-git/survey_pc_registration_tta) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [NoakLiu/FastCache-xDiT](https://github.com/NoakLiu/FastCache-xDiT) | watch / AI 强制 | 0 / 0 | 2026-08-02 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [OpenBMB/DeepThinkVLA](https://github.com/OpenBMB/DeepThinkVLA) | watch / AI 强制 | 0 / 0 | 2026-04-16 | 1.0.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [OpenNorve/CogniFold](https://github.com/OpenNorve/CogniFold) | watch / AI 强制 | 0 / 0 | 2026-07-28 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [QinyuanWu0710/ToCall_or_NotToCall](https://github.com/QinyuanWu0710/ToCall_or_NotToCall) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [qualixar/skillfortify](https://github.com/qualixar/skillfortify) | watch / AI 强制 | 0 / 0 | 2026-08-05 | v0.6.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [redai-infra/hybrid-routing-agent](https://github.com/redai-infra/hybrid-routing-agent) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [seokho-han/tasq](https://github.com/seokho-han/tasq) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [sespoir/ReGround](https://github.com/sespoir/ReGround) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Shannon4Science/PosterMELD](https://github.com/Shannon4Science/PosterMELD) | watch / AI 强制 | 0 / 0 | 2026-08-04 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ShanZard/CSGen](https://github.com/ShanZard/CSGen) | watch / AI 强制 | 0 / 0 | 2026-08-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [sorryhyun/anima_lora](https://github.com/sorryhyun/anima_lora) | watch / AI 强制 | 0 / 0 | 2026-08-09 | v1.15.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Sun-SYSU-24/VerMem](https://github.com/Sun-SYSU-24/VerMem) | watch / AI 强制 | 0 / 0 | 2026-08-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [SXDR/PanoMMOcc](https://github.com/SXDR/PanoMMOcc) | watch / AI 强制 | 0 / 0 | 2026-03-16 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [tahashieenavaz/aftab](https://github.com/tahashieenavaz/aftab) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Tanpig-X/ESO](https://github.com/Tanpig-X/ESO) | watch / AI 强制 | 0 / 0 | 2026-08-07 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [TeCSAR-UNCC/VQ-VAD](https://github.com/TeCSAR-UNCC/VQ-VAD) | watch / AI 强制 | 0 / 0 | 未核实 | 已检查 Releases，无 tag | NOASSERTION | 否 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [tomtommyyuan/spmind](https://github.com/tomtommyyuan/spmind) | watch / AI 强制 | 0 / 0 | 2026-07-13 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [TPssp/MemOPD](https://github.com/TPssp/MemOPD) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [ucam-eo/tessera](https://github.com/ucam-eo/tessera) | watch / AI 强制 | 0 / 0 | 2026-07-26 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [UCMP13753/Omega-QVLA](https://github.com/UCMP13753/Omega-QVLA) | watch / AI 强制 | 0 / 0 | 2026-06-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [UoM-HealthAI/CellWorld](https://github.com/UoM-HealthAI/CellWorld) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [vancyland/DataClaw0](https://github.com/vancyland/DataClaw0) | watch / AI 强制 | 0 / 0 | 2026-06-24 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [vis-nlp/DataReel](https://github.com/vis-nlp/DataReel) | watch / AI 强制 | 0 / 0 | 2026-05-29 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [webtoon/rec-fm-progressive-alignment](https://github.com/webtoon/rec-fm-progressive-alignment) | watch / AI 强制 | 0 / 0 | 2026-05-08 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Within-yao/EnvACE](https://github.com/Within-yao/EnvACE) | watch / AI 强制 | 0 / 0 | 2026-08-08 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [wuchengyu123/UniCon](https://github.com/wuchengyu123/UniCon) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [wyysteelhead/LiveEvalBench](https://github.com/wyysteelhead/LiveEvalBench) | watch / AI 强制 | 0 / 0 | 2026-08-04 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Wz1h1NG/AffectAgent](https://github.com/Wz1h1NG/AffectAgent) | watch / AI 强制 | 0 / 0 | 2026-04-14 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [xcltql666/OminTryOn](https://github.com/xcltql666/OminTryOn) | watch / AI 强制 | 0 / 0 | 2026-06-11 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [xfetus/fetal-ultrasound-edm2](https://github.com/xfetus/fetal-ultrasound-edm2) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [xiaobin-rong/unipase](https://github.com/xiaobin-rong/unipase) | watch / AI 强制 | 0 / 0 | 2026-08-08 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [xiaomi-research/spatio-lm](https://github.com/xiaomi-research/spatio-lm) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Xiaoyu-Tao/CastFSR](https://github.com/Xiaoyu-Tao/CastFSR) | watch / AI 强制 | 0 / 0 | 2026-08-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Yijia-Xiao/FinanceHarness](https://github.com/Yijia-Xiao/FinanceHarness) | watch / AI 强制 | 0 / 0 | 2026-08-04 | v0.1.0 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [yiy1x/OCSD](https://github.com/yiy1x/OCSD) | watch / AI 强制 | 0 / 0 | 2026-08-06 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [yizzz927/CAPE-T2V](https://github.com/yizzz927/CAPE-T2V) | watch / AI 强制 | 0 / 0 | 2026-08-03 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ysng123/EG-FM](https://github.com/ysng123/EG-FM) | watch / AI 强制 | 0 / 0 | 2026-08-07 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [YukeXing/3DGSI-Assessor](https://github.com/YukeXing/3DGSI-Assessor) | watch / AI 强制 | 0 / 0 | 2026-03-04 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [yuliangyan0807/molecular-glue-design](https://github.com/yuliangyan0807/molecular-glue-design) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Z-yiwei/rectify-then-diffuse](https://github.com/Z-yiwei/rectify-then-diffuse) | watch / AI 强制 | 0 / 0 | 2026-08-02 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [Zhong-Chenchen/DIVE](https://github.com/Zhong-Chenchen/DIVE) | watch / AI 强制 | 0 / 0 | 2026-08-05 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [ZMH-SDUST/PhysScene](https://github.com/ZMH-SDUST/PhysScene) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [zyoungszu/pami2026](https://github.com/zyoungszu/pami2026) | watch / AI 强制 | 0 / 0 | 未核实 | 已检查 Releases，无 tag | NOASSERTION | 否 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [zzzzj311-droid/Free-Lunch-SITN](https://github.com/zzzzj311-droid/Free-Lunch-SITN) | watch / AI 强制 | 0 / 0 | 2026-06-29 | 已检查 Releases，无 tag | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [blog/baseten](https://github.com/blog/baseten) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [blog/LiquidAI](https://github.com/blog/LiquidAI) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [Comfy-Org/MiniMax-H3](https://github.com/Comfy-Org/MiniMax-H3) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [figma/code-connect](https://github.com/figma/code-connect) | watch / AI 强制 | 0 / 0 | 2026-08-03 | v1.5.2 | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [fippo/warp-snap-sped](https://github.com/fippo/warp-snap-sped) | watch / AI 强制 | 0 / 0 | 2026-04-30 | 已检查 Releases，无 tag | NOASSERTION | 是 / 是 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |
| [LiquidAI/LFM2.5-2.6B](https://github.com/LiquidAI/LFM2.5-2.6B) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [MiniMaxAI/MiniMax-H3](https://github.com/MiniMaxAI/MiniMax-H3) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [mistralai/Shieldstral-1.0-3B](https://github.com/mistralai/Shieldstral-1.0-3B) | watch / AI 强制 | 0 / 0 | 未核实 | Release 核验失败 | NOASSERTION | 否 / 否 | 否 / 否 | 不可访问；未归档；非 Fork | **观察**：GitHub 官方仓库页返回 404；保留原始名称，不猜测替代 URL。 |
| [modelcontextprotocol/modelcontextprotocol](https://github.com/modelcontextprotocol/modelcontextprotocol) | watch / AI 强制 | 0 / 0 | 2026-08-10 | 2026-07-28 | NOASSERTION | 是 / 否 | 是 / 是 | 可访问；未归档；非 Fork | **观察**：仓库可访问且未归档；证据尚不足以自动进入正式库存，继续观察。 |

## 候选入选原因

- `rohitg00/ai-engineering-from-scratch`：行业优先：最新开放模型；最近 1 天有推送；跨 4 个来源命中。
- `vladmandic/sdnext`：行业优先：生成式图像模型、最新开放模型、视频生成模型、视频生成 / 自动剪辑；OSS Insight 24h 新增关注 1；24h 活跃分 52；最近 4 天有推送。
- `wuyoscar/GPT-Image2-Skill`：行业优先：生成式图像模型；本地快照新增 Stars 71；最近 1 天有推送；跨 2 个来源命中。
- `sgl-project/sglang`：行业优先：最新开放模型、视频生成模型、视频生成 / 自动剪辑；最近 4 天有推送；跨 3 个来源命中。
- `Anil-matcha/Open-Generative-AI`：行业优先：生成式图像模型、视频生成模型、视频生成 / 自动剪辑；本地快照新增 Stars 2；最近 1 天有推送；跨 2 个来源命中。
- `KunAgent/Kun`：行业优先：AI 设计工具；本地快照新增 Stars 36；最近 4 天有推送。
- `Comfy-Org/ComfyUI`：最近 6 天有推送；AI 日报/周报强制候选；跨 4 个来源命中。
- `FreedomIntelligence/Awesome-Economic-World-Models`：最近 1 天有推送；AI 日报/周报强制候选；跨 2 个来源命中。
- `NousResearch/hermes-agent`：最近 6 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `hugohe3/ppt-master`：最近 6 天有推送；跨 3 个来源命中。
- `usestrix/strix`：最近 6 天有推送；跨 2 个来源命中。
- `APRIL-ZJU/Gaussian-LIC`：行业优先：3DGS / Gaussian Splatting、3D / 三维生成、WAIC 物理 AI、机器人仿真 / Sim2Real；最近 5 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `jd-opensource/JoyAI-Video-Edit`：行业优先：视频生成模型、视频生成 / 自动剪辑；AI 日报/周报强制候选；跨 3 个来源命中。
- `huggingface/huggingface_hub`：行业优先：最新开放模型；最近 4 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `MoonshotAI/Kimi-K3`：行业优先：最新开放模型；AI 日报/周报强制候选；跨 3 个来源命中。
- `huggingface/huggingface.js`：行业优先：最新开放模型；AI 日报/周报强制候选；跨 3 个来源命中。
- `yliu-cs/MMaDA-VLA`：行业优先：WAIC 物理 AI；AI 日报/周报强制候选。
- `kinfey/Multi-AI-Agents-Cloud-Native`：AI 日报/周报强制候选；跨 3 个来源命中。
- `Comfy-Org/workflow_templates`：最近 4 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `cursor/mixture-of-kittens`：最近 6 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `openai/codex`：最近 6 天有推送；AI 日报/周报强制候选；跨 3 个来源命中。
- `pion/webrtc`：AI 日报/周报强制候选；跨 3 个来源命中。
- `ziboshao/AgentPatch`：AI 日报/周报强制候选；跨 2 个来源命中。
- `zylwithxy/HRDiT`：AI 日报/周报强制候选；跨 2 个来源命中。
- `agentplugins/agent-plugins-spec`：AI 日报/周报强制候选；跨 2 个来源命中。
- `11isnotavailable/INTraJ`：AI 日报/周报强制候选。
- `6somehow/DAC-SPADE`：AI 日报/周报强制候选。
- `AIVRC/DAC-Pose`：AI 日报/周报强制候选。
- `AK-DREAM/EcoFrame`：AI 日报/周报强制候选。
- `AlayaLab/HelloWorld`：AI 日报/周报强制候选。
- `alimama-tech/PyMAL`：AI 日报/周报强制候选。
- `Aoko955/Flash-VAED`：AI 日报/周报强制候选。
- `bahumanyarg11/tta-explanation-stability-pipeline`：AI 日报/周报强制候选。
- `BITHLP/HomeSafeBench`：AI 日报/周报强制候选。
- `bryanwong17/BEACON`：AI 日报/周报强制候选。
- `cau-hai-lab/PORTA`：AI 日报/周报强制候选。
- `chenjing-2024/agent-trajectory-attribution`：AI 日报/周报强制候选。
- `ControlGenAI/MaterialFusion`：AI 日报/周报强制候选。
- `CPS-research-group/ink_bwts`：AI 日报/周报强制候选。
- `criticaldata/benchmaxxing`：AI 日报/周报强制候选。
- `CryptoAILab/FakeI2V-Bench`：AI 日报/周报强制候选。
- `Daijing-ai/CIGT-Surv`：AI 日报/周报强制候选。
- `datamllab/A2E`：AI 日报/周报强制候选。
- `dhruvashp/latent-denoising-for-lmms`：AI 日报/周报强制候选。
- `discoverse-dev/FGGS-LiDAR`：AI 日报/周报强制候选。
- `elecreak/HiSC`：AI 日报/周报强制候选。
- `eth-medical-ai-lab/agent-gui`：AI 日报/周报强制候选。
- `gitrxh/ADRS-arxiv`：AI 日报/周报强制候选。
- `H-EmbodVis/SimWAM`：AI 日报/周报强制候选。
- `HanZhi306/SkillTV-Bench`：AI 日报/周报强制候选。
- `HITlixian/TGRS_GSFF`：AI 日报/周报强制候选。
- `HongjieZhou0329/RSVideo`：AI 日报/周报强制候选。
- `hustvl/DreamWAM`：AI 日报/周报强制候选。
- `I2-Multimedia-Lab/MultiCompose`：AI 日报/周报强制候选。
- `IF-LAB-PKU/EchoCache`：AI 日报/周报强制候选。
- `IF-LAB-PKU/Token-Radius-Attention`：AI 日报/周报强制候选。
- `jaykim9870/Not_All_Redundant_Tokens_Are_Alike`：AI 日报/周报强制候选。
- `JiamingChen1234/MAFIA`：AI 日报/周报强制候选。
- `jianshuod/IPI-exposure-signal`：AI 日报/周报强制候选。
- `JiaqiZhang-Sengoku/LEADer`：AI 日报/周报强制候选。
- `Jiyuan-Tan/CausalForge`：AI 日报/周报强制候选。
- `kandinskylab/kvae`：AI 日报/周报强制候选。
- `kandinskylab/kvae-audio`：AI 日报/周报强制候选。
- `KByrski/FlaRe`：AI 日报/周报强制候选。
- `KlingAIResearch/MetaView`：AI 日报/周报强制候选。
- `MasoumehSharafi/EB-CaP`：AI 日报/周报强制候选。
- `mingti-org/phyai`：AI 日报/周报强制候选。
- `neuraloperator/sparse_ct`：AI 日报/周报强制候选。
- `ninaa-git/survey_pc_registration_tta`：AI 日报/周报强制候选。
- `NoakLiu/FastCache-xDiT`：AI 日报/周报强制候选。
- `OpenBMB/DeepThinkVLA`：AI 日报/周报强制候选。
- `OpenNorve/CogniFold`：AI 日报/周报强制候选。
- `QinyuanWu0710/ToCall_or_NotToCall`：AI 日报/周报强制候选。
- `qualixar/skillfortify`：AI 日报/周报强制候选。
- `redai-infra/hybrid-routing-agent`：AI 日报/周报强制候选。
- `seokho-han/tasq`：AI 日报/周报强制候选。
- `sespoir/ReGround`：AI 日报/周报强制候选。
- `Shannon4Science/PosterMELD`：AI 日报/周报强制候选。
- `ShanZard/CSGen`：AI 日报/周报强制候选。
- `sorryhyun/anima_lora`：AI 日报/周报强制候选。
- `Sun-SYSU-24/VerMem`：AI 日报/周报强制候选。
- `SXDR/PanoMMOcc`：AI 日报/周报强制候选。
- `tahashieenavaz/aftab`：AI 日报/周报强制候选。
- `Tanpig-X/ESO`：AI 日报/周报强制候选。
- `TeCSAR-UNCC/VQ-VAD`：AI 日报/周报强制候选。
- `tomtommyyuan/spmind`：AI 日报/周报强制候选。
- `TPssp/MemOPD`：AI 日报/周报强制候选。
- `ucam-eo/tessera`：AI 日报/周报强制候选。
- `UCMP13753/Omega-QVLA`：AI 日报/周报强制候选。
- `UoM-HealthAI/CellWorld`：AI 日报/周报强制候选。
- `vancyland/DataClaw0`：AI 日报/周报强制候选。
- `vis-nlp/DataReel`：AI 日报/周报强制候选。
- `webtoon/rec-fm-progressive-alignment`：AI 日报/周报强制候选。
- `Within-yao/EnvACE`：AI 日报/周报强制候选。
- `wuchengyu123/UniCon`：AI 日报/周报强制候选。
- `wyysteelhead/LiveEvalBench`：AI 日报/周报强制候选。
- `Wz1h1NG/AffectAgent`：AI 日报/周报强制候选。
- `xcltql666/OminTryOn`：AI 日报/周报强制候选。
- `xfetus/fetal-ultrasound-edm2`：AI 日报/周报强制候选。
- `xiaobin-rong/unipase`：AI 日报/周报强制候选。
- `xiaomi-research/spatio-lm`：AI 日报/周报强制候选。
- `Xiaoyu-Tao/CastFSR`：AI 日报/周报强制候选。
- `Yijia-Xiao/FinanceHarness`：AI 日报/周报强制候选。
- `yiy1x/OCSD`：AI 日报/周报强制候选。
- `yizzz927/CAPE-T2V`：AI 日报/周报强制候选。
- `ysng123/EG-FM`：AI 日报/周报强制候选。
- `YukeXing/3DGSI-Assessor`：AI 日报/周报强制候选。
- `yuliangyan0807/molecular-glue-design`：AI 日报/周报强制候选。
- `Z-yiwei/rectify-then-diffuse`：AI 日报/周报强制候选。
- `Zhong-Chenchen/DIVE`：AI 日报/周报强制候选。
- `ZMH-SDUST/PhysScene`：AI 日报/周报强制候选。
- `zyoungszu/pami2026`：AI 日报/周报强制候选。
- `zzzzj311-droid/Free-Lunch-SITN`：AI 日报/周报强制候选。
- `blog/baseten`：AI 日报/周报强制候选。
- `blog/LiquidAI`：AI 日报/周报强制候选。
- `Comfy-Org/MiniMax-H3`：AI 日报/周报强制候选。
- `figma/code-connect`：AI 日报/周报强制候选。
- `fippo/warp-snap-sped`：AI 日报/周报强制候选。
- `LiquidAI/LFM2.5-2.6B`：AI 日报/周报强制候选。
- `MiniMaxAI/MiniMax-H3`：AI 日报/周报强制候选。
- `mistralai/Shieldstral-1.0-3B`：AI 日报/周报强制候选。
- `modelcontextprotocol/modelcontextprotocol`：AI 日报/周报强制候选。

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

- Claude Enterprise Inference Hooks protocol/schema \| pending \| URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Cursor Google Workspace plugin implementation \| pending \| URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- Multiverse CompactifAI optimization assets \| pending \| URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- SeedRealtime model/project assets \| pending \| URL 待核验（ai-weekly-forced）：保留待核验，不猜测 GitHub URL。
- GitHub Copilot cloud agent（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI Programmatic Tool Calling 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- OpenAI multi-agent beta 示例工程（ai-daily-forced）：保留待核验，不猜测 GitHub URL。
- AI floor-plan / room-design CAD export（ai-daily-forced）：保留待核验，不猜测 GitHub URL。

## Watch 轮换抽查

- [huggingface/lerobot](https://github.com/huggingface/lerobot)：可访问；行业优先：WAIC 物理 AI、机器人学习 / 控制、最新开放模型；跨 3 个来源命中。
- [playcanvas/supersplat](https://github.com/playcanvas/supersplat)：可访问；行业优先：3DGS / Gaussian Splatting、3D / 三维生成；最近 6 天有推送；跨 3 个来源命中。
- [nik-55/world-models](https://github.com/nik-55/world-models)：可访问；行业优先：WAIC 物理 AI；OSS Insight 24h 新增关注 1；24h 活跃分 204；跨 2 个来源命中。
- [bytedance/Lance](https://github.com/bytedance/Lance)：可访问；行业优先：视频算法 / 理解；跨 3 个来源命中。
- [FreeCAD/FreeCAD](https://github.com/FreeCAD/FreeCAD)：可访问；行业优先：建筑设计 / AEC、3D / 三维生成、AI 设计工具；最近 1 天有推送；跨 3 个来源命中。

## 落盘边界

- 正式跟踪项目 233 个；保留既有项目字段并完成本轮刷新。
- 仅更新 `data/dev`、本报告和 `public/reports`；未写入 `data/main`。

## 行业重点收录

本次将 233 个经过官方仓库、原创性和维护状态核验的项目纳入每日跟踪。热度只用于排序，不是收录门槛。

### Agent 工程 / 云原生

- [Multi AI Agents Cloud Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native)：candidate-decisions 已批准；精确仓库、MIT 许可、代码样例和部署结构已核验。

### 编码 Agent / 开发工具

- [OpenAI Codex](https://github.com/openai/codex)：同日 AI 强制候选；官方 release、原创实现、维护频率和开发者实用性均达到 A+。

### 开放模型 / 多模态 Agent

- [Kimi K3](https://github.com/MoonshotAI/Kimi-K3)：同日 AI 强制候选；官方关系、开放权重、技术新鲜度和行业影响显著，综合质量达到 A+。

### AI 图像与视频生成工具

- [SD.Next](https://github.com/vladmandic/sdnext)：命中 AI 图像/视频生成与设计工具 P0 方向；原创性、可安装性、许可、成熟度和持续维护均通过质量门槛。

### 模型推理 / Agent 基础设施

- [SGLang](https://github.com/sgl-project/sglang)：原创性、规模化可用性、开放模型 Day-0 支持、持续发布和活跃维护证据充分，正式纳入推理基础设施跟踪。

### 生成式设计 / 节点工作流

- [ComfyUI](https://github.com/Comfy-Org/ComfyUI)：MiniMax H3 Day-0 支持提供新的官方活跃证据；原创内容生产引擎、可用工作流与持续维护均达到 A 级。

### 生成式设计 / 官方工作流

- [ComfyUI Workflow Templates](https://github.com/Comfy-Org/workflow_templates)：官方仓库直接承载 H3 Day-0 可复现制作流程，具备原创模板、可安装分发和持续维护证据，因此正式收录。

### 实时 Agent / WebRTC 基础设施

- [Pion WebRTC](https://github.com/pion/webrtc)：虽然不是 AI 模型仓库，但它是 GPT-Live/WARP 事件直接指向的成熟实时 Agent 传输基础设施，质量和维护证据充分，按 B 级跟踪。

### 大模型训练 / MoE 系统内核

- [Mixture-of-Kittens](https://github.com/cursor/mixture-of-kittens)：官方关系、原创系统实现、明确许可、可安装性、公开基准与生产维护证据充分，符合新发布开放工程仓库优先方向，按 A 级正式跟踪。

### 开放模型 / 模型分发基础设施

- [Hugging Face Hub Python SDK](https://github.com/huggingface/huggingface_hub)：官方关系、原创基础设施实现、明确许可、可安装性与持续维护证据充分，按 A 级正式跟踪。

### 开放模型 / JavaScript SDK

- [Hugging Face JavaScript Libraries](https://github.com/huggingface/huggingface.js)：官方身份、原创 SDK 实现、明确许可、安装路径与维护活跃度通过质量门槛，按 A 级正式跟踪。

### 3DGS / 多传感器 SLAM

- [Gaussian-LIC2](https://github.com/APRIL-ZJU/Gaussian-LIC)：命中 3DGS、物理 AI 与机器人建图方向；官方关系、原创研究实现、明确许可、可复现路径和近期更新通过质量门槛，按 B 级正式跟踪。

### 视频生成 / 实时视频编辑

- [JoyAI-Video-Edit](https://github.com/jd-opensource/JoyAI-Video-Edit)：命中视频生成、视频编辑和开放模型 P0；官方关系、原创实现、明确许可、可运行发布、Demo 与近期维护证据均通过质量门槛，按 A 级正式跟踪。

### AI Agents

- [Hermes Agent](https://github.com/NousResearch/hermes-agent)：Existing approved project retained from the formal tracked inventory.
- [Vibe Trading](https://github.com/HKUDS/Vibe-Trading)：Existing approved project retained from the formal tracked inventory.

### AI Productivity

- [PPT Master](https://github.com/hugohe3/ppt-master)：Existing approved project retained from the formal tracked inventory.

### AI Security

- [Strix](https://github.com/usestrix/strix)：Existing approved project retained from the formal tracked inventory.

### 3D 生成 / 设计工具

- [Text-To-3D-Generation](https://github.com/YuliCao/Text-To-3D-Generation)：仓库包含可运行的流程编排、参数消融、结果记录和网页演示，适合 3D AI 学习与产品原型；但它不是原创 Text-to-3D 模型，且许可证与几何质量边界尚未解决，因此作为设计工具观察收录。
- [img2threejs](https://github.com/img2threejs/img2threejs)：2026-07-21 首次收录后持续进入 surging 队列，仓库已迁移到官方组织并发布 v1.5.0；Apache-2.0 许可、原创程序化 3D 流程、浏览器 Demo、近期提交和社区增长均已核验，继续正式跟踪。

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
- [Genie Envisioner](https://github.com/AgibotTech/Genie-Envisioner-V1)：智元机器人官方具身世界模型主线，可与 Genie Sim、EVAC 和 EWMBench 形成完整观察链路。

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

### 生成模型 / 原生多模态理解与生成

- [SenseNova-U1](https://github.com/OpenSenseNova/SenseNova-U1)：统一多模态理解与生成、中文高密度信息图、图文交错内容和开放训练链路均具有直接产品价值，列为生成式模型 A+ 重点跟踪项目。

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

### 个人 AI 助手 / Agent 平台

- [OpenClaw](https://github.com/openclaw/openclaw)：同日 AI 强制候选；官方关系、原创实现、可安装性、持续发布和维护活跃度充分，综合质量达到 A。

### 世界模型 / 视频生成推理

- [FlashDreams](https://github.com/NVIDIA/flashdreams)：同日 AI 强制候选；官方实现、世界模型方向、可运行性与工程价值充分，综合质量达到 A。

### 医疗仿真 / 世界模型

- [Cosmos-H-Dreams](https://github.com/isaac-for-healthcare/Cosmos-H-Dreams)：同日 AI 强制候选；物理 AI 与医疗仿真价值明确、实现可运行，但官方关系和临床证据边界需持续提示，定为 B+。

### 模型推理 / 基础设施

- [vLLM](https://github.com/vllm-project/vllm)：同日 AI 强制候选；基础设施影响力、原创实现、维护活跃度与可用性均达到 A+。

### 生成模型 / 图像编辑 / ComfyUI

- [ComfyUI Krea2 Edit](https://github.com/lbouaraba/comfyui-krea2edit)：为 Krea 2 身份保持图像编辑提供可复现的原始运行实现，直接服务生成式设计和可控视觉内容生产，因此纳入正式跟踪。

### Agent 数据语义 / 查询基础设施

- [Malloy](https://github.com/malloydata/malloy)：同日 AI 强制候选；官方关系、原创语义层实现、可安装性和持续维护证据充分，综合质量达到 A。

### AI 安全 / 开发者工具

- [Codex Security](https://github.com/openai/codex-security)：candidate-decisions 已批准 openai-codex-security-plugin；精确官方仓库、可安装实现、当日发布与维护证据均已核验。

### Agent 安全 / 端点可观测

- [Numbat](https://github.com/perplexityai/numbat)：最新已完成周报强制候选；官方关系、原创 Agent 安全实现、跨平台可安装性和近期维护证据均通过质量门槛。

### AI SDK / Agent 工程

- [Google Gen AI JS SDK](https://github.com/googleapis/js-genai)：最新已完成周报强制候选；官方身份、可安装 SDK、持续维护与 Agent/多模态工程价值均通过质量门槛。

### AEC / 3D 建筑设计

- [Pascal Editor](https://github.com/pascalorg/editor)：命中 AEC/3D P0 方向；官方关系、原创实现、安装与演示入口、近期发布及维护活跃度均通过质量门槛。

### 物理 AI / 世界模型与智能空间

- [Gemini Robotics Samples](https://github.com/google-gemini/robotics-samples)：7 月 31 日 AI 日报强制候选；仓库直接对应 Gemini Robotics 2/ER 2 的物理 Agent、连续视频理解、任务编排和多机器人协作，符合 ark.insight 物理 AI 与智能空间最高优先方向。

### 视频生成 / 物理 AI

- [LingBot-Video](https://github.com/Robbyant/lingbot-video)：连续观察后出现新的持续维护证据，且仓库具备原创模型、开放权重、可运行安装路径和物理 AI 视频生成价值，因此由 observe 转为正式跟踪。

### 浏览器 AI / 模型推理

- [Transformers.js](https://github.com/huggingface/transformers.js)：官方关系、原创浏览器推理实现、Apache-2.0 许可、可安装性、近期发布和持续协作均通过质量门槛。

### 端侧 AI / 模型推理

- [MNN](https://github.com/alibaba/MNN)：官方身份、成熟原创实现、Apache-2.0 许可、端侧多模态价值、近期发布与维护活跃度均通过质量门槛。

### 具身智能 / 机器人操作系统

- [Robonix](https://github.com/syswonder/robonix)：命中物理 AI P0；具备原创实现、MulanPSL-2.0 许可、可运行安装与 Webots Demo、七类机器人部署和持续维护证据，按 B 级正式跟踪。

### AI 设计工具 / 无限画布

- [Infinite Canvas](https://github.com/basketikun/infinite-canvas)：直接命中 AI 辅助设计工具 P0；原创性、可运行性、许可、Demo、Agent/MCP 集成与近期维护证据通过质量门槛，按 B 级早期项目正式跟踪。

### AI CAD / 生成式设计

- [Multi-Agent CAD](https://github.com/Pan-Chera/Multi-Agent-CAD)：直接命中 CAD、3D 生成和 AI 设计工具 P0；原创性、可运行性、许可、Demo 与近期维护证据通过质量门槛，按 B 级新项目正式跟踪。

### 具身智能 / VLA 工具箱

- [Dexbotic](https://github.com/dexmal/dexbotic)：命中物理 AI 与机器人仿真 P0；原创工程实现、明确许可、完整安装路径、模型与硬件覆盖以及近期维护证据充分，按 B 级正式跟踪。

### AI Coding

- [Grok Build](https://github.com/xai-org/grok-build)：Existing approved project retained from the formal tracked inventory.
- [Claude Code](https://github.com/anthropics/claude-code)：Existing approved project retained from the formal tracked inventory.
- [GitHub Copilot CLI](https://github.com/github/copilot-cli)：Existing approved project retained from the formal tracked inventory.
- [Google Antigravity CLI](https://github.com/google-antigravity/antigravity-cli)：Existing approved project retained from the formal tracked inventory.

### World Models

- [RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D)：Existing approved project retained from the formal tracked inventory.
- [MIRA World Model](https://github.com/mira-wm/mira)：Existing approved project retained from the formal tracked inventory.

### Agent Infrastructure

- [GitHub Copilot SDK](https://github.com/github/copilot-sdk)：Existing approved project retained from the formal tracked inventory.
- [NitroStack](https://github.com/nitrocloudofficial/nitrostack)：Existing approved project retained from the formal tracked inventory.

### AI Apps

- [Gemini Starter Applets](https://github.com/google-gemini/starter-applets)：Existing approved project retained from the formal tracked inventory.

### AI 3D

- [Meshy 3D Agent](https://github.com/meshy-dev/meshy-3d-agent)：Existing approved project retained from the formal tracked inventory.
- [TripoSR](https://github.com/VAST-AI-Research/TripoSR)：Existing approved project retained from the formal tracked inventory.

### AI Visualization

- [Flint Chart](https://github.com/microsoft/flint-chart)：Existing approved project retained from the formal tracked inventory.

