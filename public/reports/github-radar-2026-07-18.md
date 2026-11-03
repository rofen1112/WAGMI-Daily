# WAGMI GitHub Radar - 2026-07-18

运行时间：2026-07-18 07:45:28 +08:00  
运行状态：`success`

## 运行结论

- 严格从 `data/dev/github-trend-candidates.json` 的趋势候选池开始，没有回退为全 GitHub 大仓库逐个扫描。
- 最终候选池包含 `1 surging + 12 hot + 39 watch = 52` 个项目；本次完整核验全部 surging、全部 12 个 hot、全部可解析 AI 强制候选和全部 10 个已跟踪项目。
- OSS Insight 24 小时主趋势、各语言趋势、周趋势和 3 组 GitHub 官方搜索全部成功。
- 最终落盘前重新读取 `data/dev/ai-events-latest.json`：`asOf=2026-07-18`、`run.status=success`。今日 AI 日报没有新增 repo 候选，因此无需等待到 07:55。
- `candidate-decisions.json` 中 `ai-cad-workflows=approved` 已优先搜索；仍无可确认的精确公开 `owner/repo`，故保留 approved 待解析，不猜 URL。

## 趋势来源状态

| 来源 | 状态 | 返回量 | 用途 |
| --- | --- | ---: | --- |
| OSS Insight 24h all | success | 100 | 主 24 小时趋势与排名 |
| OSS Insight 24h Python | success | 100 | Python 趋势补充 |
| OSS Insight 24h TypeScript | success | 100 | TypeScript 趋势补充 |
| OSS Insight weekly all | success | 100 | 周期稳定性信号 |
| GitHub AI new search | success | 2 | 新 AI 仓库发现 |
| GitHub agent active search | success | 25 | Agent 活跃仓库 |
| GitHub LLM active search | success | 25 | LLM 活跃仓库 |
| GitHub AI active search | success | 25 | AI 活跃仓库 |

## 热门阈值与判定方法

- `surging`：全语言 24h 前 5、24h 新增 Stars 至少 50、本地快照增长至少 100，或仓库不足 30 天且已有至少 500 Stars。
- `hot`：全语言 24h 前 20、Python/TypeScript 24h 前 5、24h 新增 Stars 至少 15、本地快照增长至少 20、最近推送的 GitHub 搜索前 10，或 AI 强制候选同时命中外部趋势源。
- 最终结论同时考虑 24h 关注、快照差值、趋势排名、跨来源命中、最近 push/release、README/演示/安装、license、issue/PR 活跃、官方关系和可用性；累计 Stars 不单独决定热门或质量。
- GitHub REST 的 `open_issues_count` 同时包含 open issues 与 open PRs。连接器的近期活动搜索被 `NousResearch/hermes-agent` 的高流量结果占据，因此其余项目以最近 push、release 和 open issue/PR 总量交叉判断，不把缺少单独 PR 命中误报为不活跃。

## Surging 与 Hot 完整核验

| 分组 | 仓库 | 入选原因 | 官方核验与质量 | 结论 |
| --- | --- | --- | --- | --- |
| surging | [nitrocloudofficial/nitrostack](https://github.com/nitrocloudofficial/nitrostack) | 全语言 24h 第 3、24h 关注 10、跨 2 源 | 1,173★ / 25 forks；2026-07-14 push；`1.0.1`(07-13)；Apache-2.0；README 有安装、演示和命令；非 fork/非归档 | 新增跟踪 `B+`；趋势强但规模和社区深度仍早期 |
| hot | [HKUDS/Vibe-Trading](https://github.com/HKUDS/Vibe-Trading) | 24h 活跃分 229、跨 4 源、最近 push | 24,617★ / 4,075 forks；2026-07-17 push；`v0.1.11`；MIT；README/官网/安装完整；近期 issue 与 PR 均有更新 | 新增跟踪 `A`；动量与可用性同时过线 |
| hot | [usestrix/strix](https://github.com/usestrix/strix) | 24h 活跃分 224、跨多源、最近 push | 42,253★ / 4,359 forks；2026-07-17 push；`v1.1.0`；Apache-2.0；README/官网/安装完整；近期 PR 活跃 | 新增跟踪 `A`；安全工具价值高，200 个 open issue/PR 需持续观察 |
| hot | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | 24h 活跃分 209、快照仍增长、最近 push | 39,683★ / 3,292 forks；2026-07-17 push；`v3.1.0`；MIT；README、演示与安装完整；仅 4 个 open issue/PR | 新增跟踪 `A`；产品完成度较好 |
| hot | [jamiepine/voicebox](https://github.com/jamiepine/voicebox) | TypeScript 24h 前 5、跨 3 源 | 42,086★ / 5,086 forks；最后 push 07-13；release `v0.5.0` 停在 04-25；MIT；README/官网/安装完整 | 保持候选；热度存在但 release 新鲜度不足 |
| hot | [MadsLorentzen/ai-job-search](https://github.com/MadsLorentzen/ai-job-search) | TypeScript 24h 第 1、跨 3 源 | 23,518★ / 7,519 forks；2026-07-17 push；无 release；MIT；README 有安装/演示；仅 3 个 open issue/PR | 保持候选；个人仓库且 release 治理不足 |
| hot | [QuintinShaw/pi-dynamic-workflows](https://github.com/QuintinShaw/pi-dynamic-workflows) | 24h 活跃分 215、跨 2 源 | 238★ / 52 forks；2026-07-17 push 与 `v2.14.2`；MIT；README/演示/安装完整 | 保持观察；产品活跃但采用规模仍小 |
| hot + AI | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI 强制候选、跨 3 源、最近 push | 216,450★ / 40,560 forks；2026-07-17 push；`v2026.7.7.2`；MIT；README/官网/安装完整；issue/PR 极活跃 | 新增跟踪 `A`；真实活跃，但超高 issue/PR 噪音不能等同质量 |
| hot | [FB208/OpenBidKit_Yibiao](https://github.com/FB208/OpenBidKit_Yibiao) | 24h 活跃分 231、跨 2 源 | 1,749★ / 475 forks；2026-07-16 push/release；AGPL-3.0；README 有演示和运行命令 | 保持候选；垂直场景较窄且 AGPL 约束需评估 |
| hot | [microsoft/flint-chart](https://github.com/microsoft/flint-chart) | 24h 活跃分 220、跨 2 源 | Microsoft 官方；1,861★ / 92 forks；2026-07-17 push；`0.2.1`；MIT；README/演示/安装完整 | 新增跟踪 `B+`；官方关系和质量过线，仍属早期版本 |
| hot | [diegosouzapw/OmniRoute](https://github.com/diegosouzapw/OmniRoute) | 24h 活跃分 219、跨 2 源 | 18,375★ / 2,633 forks；2026-07-17 push；`v3.8.48`；MIT；README/官网/安装完整；352 open issue/PR | 保持候选；活跃但支持面和路由风险较高 |
| hot | [team-reflect/reflect-open](https://github.com/team-reflect/reflect-open) | 24h 活跃分 216、跨 2 源 | 1,270★ / 83 forks；2026-07-17 push；`v0.6.0`；MIT；README/安装完整 | 保持候选；仓库仅 39 天，需积累维护证据 |
| hot | [multica-ai/multica](https://github.com/multica-ai/multica) | 24h 活跃分 213、跨 2 源 | 40,917★ / 5,161 forks；2026-07-17 push/release；README/官网/安装完整；license 为 `NOASSERTION`；1,139 open issue/PR | 保持候选；license 与支持负载未过质量门 |

上述 13 个精确仓库均经 GitHub 连接器确认 owner/repo、公开可见、非 fork、非归档；官方 REST 数据用于 Stars/Forks、push、release、license 和 open issue/PR 总量复核。

## 已跟踪项目刷新

| 仓库 | Stars / Forks | 相比 07-17 | 活动与 release | 等级变化 |
| --- | ---: | ---: | --- | --- |
| [github/copilot-cli](https://github.com/github/copilot-cli) | 10,972 / 1,786 | +8★ / +7 forks | 07-17 push；`v1.0.71`(07-16) | `A+` 保持 |
| [github/copilot-sdk](https://github.com/github/copilot-sdk) | 9,788 / 1,328 | +152★ / +10 forks | 07-17 push；`rust/v1.0.7`(07-16) | `A+` 保持 |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | 16,371 / 3,009 | +4,336★ / +961 forks | 07-17 push；无 release；Apache-2.0；仓库仅 4 天 | `A → A+` |
| [google-antigravity/antigravity-cli](https://github.com/google-antigravity/antigravity-cli) | 1,630 / 127 | +20★ / +3 forks | 07-16 push/release `1.1.3` | `A+` 保持 |
| [anthropics/claude-code](https://github.com/anthropics/claude-code) | 138,118 / 22,164 | +118★ / +19 forks | 07-17 push/release `v2.1.212` | `A → A+` |
| [mira-wm/mira](https://github.com/mira-wm/mira) | 419 / 21 | +9★ | 07-12 push；`v1.0` | `B+` 保持 |
| [alibaba-damo-academy/RynnWorld-4D](https://github.com/alibaba-damo-academy/RynnWorld-4D) | 62 / 3 | +2★ | 07-16 push；无 release；license `NOASSERTION` | `B+` 保持 |
| [google-gemini/starter-applets](https://github.com/google-gemini/starter-applets) | 1,347 / 452 | +1★ | 07-03 最后 push；现已归档 | `B → C` |
| [meshy-dev/meshy-3d-agent](https://github.com/meshy-dev/meshy-3d-agent) | 50 / 8 | 持平 | 06-24 push/release `v0.4.0` | `B` 保持 |
| [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) | 6,735 / 864 | +1★ / +2 forks | 06-04 最后 push；无 release | `B` 保持 |

## AI 强制候选与决策文件

| 候选 | 决策/核验 | 结论 |
| --- | --- | --- |
| `NousResearch/hermes-agent` | 精确 repo；AI 强制 + 外部趋势命中 | 已完整核验并新增跟踪 `A` |
| `xai-org/grok-build` | 精确官方 repo；已跟踪 | 07-17 至今 +4,336★，升至 `A+` |
| `kinfey/Multi-AI-Agents-Cloud-Native` | 精确 repo；26★ / 10 forks；07-13 push；无 license/release | 保留 verified 候选，不升入跟踪 |
| `AI floor-plan / room-design CAD export` | 决策文件为 `approved`；连接器搜索无精确结果 | 保留 `approved` 待解析；不猜 URL |
| `GitHub Copilot cloud agent` | 搜索只命中教程/样例或第三方仓库 | 保留 pending；不是独立官方 repo |
| `OpenAI Programmatic Tool Calling sample project` | 命中第三方 demo，无 OpenAI 官方 owner | 保留 pending |
| `OpenAI multi-agent beta sample project` | 无 OpenAI 官方精确 repo | 保留 pending |
| `Thinking Machines Tinker cookbook` | 搜索结果均为个人镜像/第三方命名 | 保留 pending |
| `OpenAI GPT-Red preprint / eval assets` | 无 OpenAI 官方精确 repo | 保留 pending |

`candidate-decisions.json` 未被覆盖。当前没有 rejected 候选需要重开。

## Watch 轮换抽查

- [iOfficeAI/AionUi](https://github.com/iOfficeAI/AionUi)：30,328★，07-17 push/release，Apache-2.0，README 完整；因最终重跑后落入 watch，本次已抽查，继续观察。
- [Robbyant/lingbot-map](https://github.com/Robbyant/lingbot-map)：12,122★，最后 push 07-12，无 release；保持 watch。
- [artificial-intelligence-edge/lorentzian-classification](https://github.com/artificial-intelligence-edge/lorentzian-classification)：仅 47★，README 缺少明确安装/演示，保持 watch。
- [Significant-Gravitas/AutoGPT](https://github.com/Significant-Gravitas/AutoGPT)：07-17 push/release，但累计 Stars 不作为当日热门证据；license `NOASSERTION`，保持 watch。

## 风险与审计说明

- `google-gemini/starter-applets` 已归档，今日降级；它仍只是 Google AI Studio 的相关官方代码，不是完整产品仓库。
- `xai-org/grok-build` 动量极强，但仓库极新且没有 release，升至 `A+` 的依据是短期关注增量、官方关系和持续 push，不代表长期维护已经成熟。
- `NousResearch/hermes-agent` 的 issue/PR 数量异常巨大；本次以真实近期 PR、release、README/安装和官方组织关系交叉验证，仍将支持噪音列为主要风险。
- App 中 `github.com/example/...` 占位仓库继续排除，不参与推荐。

## 主要证据

- 候选与来源状态：`data/dev/github-trend-candidates.json`
- AI 当日输入：`data/dev/ai-events-latest.json`
- 人工决策：`data/dev/candidate-decisions.json`
- GitHub 连接器：精确 owner/repo、组织/用户关系、公开性、归档/分叉状态
- GitHub 官方 REST：`https://api.github.com/repos/{owner}/{repo}` 与 `/releases/latest`
- GitHub 官方 README：`https://raw.githubusercontent.com/{owner}/{repo}/{branch}/README.md`

## 行业重点收录

本次将 29 个经过官方仓库、原创性和维护状态核验的项目纳入每日跟踪。热度只用于排序，不是收录门槛。

### 3D 重建

- [LingBot-Map](https://github.com/Robbyant/lingbot-map)：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。
- [VGGT](https://github.com/facebookresearch/vggt)：Meta 官方研究仓库，包含原创实现和模型资源，行业适配度高。
- [MoGe](https://github.com/microsoft/MoGe)：Microsoft 官方研究实现，原创论文与代码关系明确。
- [Stable Fast 3D](https://github.com/Stability-AI/stable-fast-3d)：Stability AI 官方原创实现，具有清晰的图像到 3D 应用价值。
- [Nerfstudio](https://github.com/nerfstudio-project/nerfstudio)：成熟原创工具链，长期被 3D 重建研究与工程流程采用。

### 3DGS

- [3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)：论文作者官方原创实现，属于 3DGS 必收录的基础仓库。
- [gsplat](https://github.com/nerfstudio-project/gsplat)：Nerfstudio 团队维护的原创基础设施，近期仍持续更新。
- [SuperSplat](https://github.com/playcanvas/supersplat)：PlayCanvas 官方原创编辑器，产品完成度和近期维护状态均较好。
- [Spark](https://github.com/sparkjsdev/spark)：由 World Labs 团队推动的原创渲染项目，仓库活跃且使用路径清晰。

### 室内与空间

- [SpatialLM](https://github.com/manycore-research/SpatialLM)：官方论文代码与模型方向明确，直接服务室内空间理解和结构化建模。
- [SpatialGen](https://github.com/manycore-research/SpatialGen)：3DV 2026 官方实现，原创训练代码与室内生成任务高度相关。
- [InteriorGS](https://github.com/manycore-research/InteriorGS)：官方数据仓库，覆盖室内设计与 3DGS 的交叉重点方向。
- [HouseCrafter](https://github.com/neu-vi/houseCrafter)：ICCV 2025 Highlight 官方代码与预训练模型，原创性和场景价值明确。
- [RoomFormer](https://github.com/ywyue/RoomFormer)：CVPR 2023 官方原创实现，是户型重建方向的有效基础项目。
- [SceneScript](https://github.com/facebookresearch/scenescript)：Meta 官方研究代码，面向室内空间结构化表达，非第三方复刻。

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

