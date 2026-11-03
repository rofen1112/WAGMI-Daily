# GitHub Radar 2026-07-19

## 运行结论

- 状态：`success`。OSS Insight 全语言 24h 主趋势、Python/TypeScript 24h、周趋势和全部 GitHub 搜索源均成功。
- 最终候选池：原始 635、合并 490、合格 284、发布 86；`surging=0`、`hot=4`、`watch=82`，其中 P0 行业候选 68。
- AI 同步：最终落盘前已重新读取 `data/dev/ai-events-latest.json`；`asOf=2026-07-19`、`run.status=success`、`lastSuccess=2026-07-19T07:44:56+08:00`。今日为周日，不使用并行周报。
- 核验范围：全部 4 个 hot、全部 3 个精确 AI 强制候选、全部 45 个已跟踪项目，以及 5 个轮换 watch 候选。GitHub 连接器与 GitHub 官方 REST 数据交叉核验。
- 今日没有新项目晋级或等级变更。热度用于核验顺序，不以累计 Stars 单独判断质量。

## 趋势来源状态

| 来源 | 状态 | 返回量 |
| --- | --- | ---: |
| OSS Insight 24h all | success | 100 |
| OSS Insight 24h Python | success | 100 |
| OSS Insight 24h TypeScript | success | 100 |
| OSS Insight weekly all | success | 100 |
| GitHub AI active / new | success | 25 / 2 |
| GitHub LLM active | success | 25 |
| GitHub agent active | success | 25 |
| GitHub AEC design active | success | 25 |
| GitHub interior design active | success | 0 |
| GitHub design tools active | success | 1 |
| GitHub 3D active / 3DGS active | success | 25 / 25 |
| GitHub open model new | success | 3 |

## 热门阈值与判断

`surging` 需满足全语言 24h 前 5、24h 新增至少 50 Stars、本地快照增长至少 100，或 30 天内新仓且已有至少 500 Stars。`hot` 需满足全语言 24h 前 20、Python/TypeScript 前 5、24h 新增至少 15、本地快照增长至少 20、活跃搜索前列，或 AI 强制候选同时命中外部趋势。最多保留 12 个非 surging 项目。本轮 4 个 hot 均由趋势排名、跨来源命中、仓库新鲜度与维护质量共同入选。

## Surging 与 Hot 核验

本轮无 `surging`。

| 分类 | 仓库 | 入选原因 | 官方核验结论 | 处理 |
| --- | --- | --- | --- | --- |
| hot | [usestrix/strix](https://github.com/usestrix/strix) | OSS Insight 24h +1、活跃分 203、跨 4 源 | 42,442 Stars / 4,380 forks；07-18 提交；`v1.1.0`；Apache-2.0；README、文档、官网、安装路径完整；非 fork/非归档 | 保持 `A`；安全自动化风险及 200 个 open issue/PR 继续观察 |
| hot + AI | [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | AI 强制、跨 4 源、07-19 持续提交 | 216,835 Stars / 40,724 forks；07-19 提交；`v2026.7.7.2`；MIT；README、官网与安装完整；非 fork/非归档 | 保持 `A`；极高 issue/PR 总量视为支持噪音与风险，不等同质量 |
| hot | [nitrocloudofficial/nitrostack](https://github.com/nitrocloudofficial/nitrostack) | OSS Insight 24h +10、活跃分 224、跨 3 源 | 1,171 Stars / 34 forks；07-18 提交；`1.0.1`；Apache-2.0；README/官网/安装可用；非 fork/非归档 | 保持 `B+`；年轻框架，社区与维护历史仍短 |
| hot | [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | 最近提交、跨 3 源 | 39,807 Stars / 3,299 forks；07-19 提交；`v3.1.0`；MIT；README、Demo 与安装完整；非 fork/非归档 | 保持 `A`；产品完成度较好 |

相对 07-18 官方快照，Strix 约 +189 Stars、Hermes Agent +385、PPT Master +124；NitroStack Stars -2 但 forks +9。Stars 变化仅作为动量信号，未单独触发等级调整。

## AI 强制候选与人工决策

| 候选 | 证据与核验 | 决策 |
| --- | --- | --- |
| [NousResearch/hermes-agent](https://github.com/NousResearch/hermes-agent) | 精确仓库，AI 强制且命中外部趋势；完整核验见上 | 已跟踪，保持 `A` |
| [xai-org/grok-build](https://github.com/xai-org/grok-build) | xAI 官方组织；18,737 Stars / 3,380 forks；07-19 提交；Apache-2.0；README 可用；无 release；非 fork/非归档 | 保持 `A+`；相对 07-18 +2,366 Stars，但仓库极新，长期维护未验证 |
| [kinfey/Multi-AI-Agents-Cloud-Native](https://github.com/kinfey/Multi-AI-Agents-Cloud-Native) | 26 Stars / 10 forks；07-13 提交；README 可用；无 license/release；非 fork/非归档 | 保留 verified 候选，不进入跟踪 |
| `ai-cad-workflows` | `candidate-decisions.json=approved`，已优先处理；仍无可确认的精确公开 owner/repo | 保留 approved 待解析，不猜 URL |
| [alibaba-damo-academy/RynnWorld-Teleop](https://github.com/alibaba-damo-academy/RynnWorld-Teleop) | 决策为 observe；Alibaba DAMO 官方组织；31 Stars / 2 forks；07-08 提交；README/样例数据可用；NOASSERTION；无 release | 按决策文件维持 observe，不晋级 |
| `cosmos-coalition` | 决策为 approved，但现有证据对应 Runway 生态计划而非可确认的精确仓库 | 保留 approved 待解析，不映射到其他同名仓库 |

其余 AI 名称 `GitHub Copilot cloud agent`、`OpenAI Programmatic Tool Calling` 示例、`OpenAI multi-agent beta` 示例、`Thinking Machines Tinker cookbook`、`OpenAI GPT-Red` 资产、`OpenAI Codex Security plugin` 仍无稳定精确 owner/repo，继续 pending，未猜测 URL。

## 已跟踪项目完整复核

- 45 个已跟踪项目均重新核验 owner/repo、公开可用性、归档/分叉状态、Stars/Forks、最近提交、license、README 与 issue/PR 信号；29 个 P0/行业核心仓库由官方 REST 同步刷新，其他项目由连接器与趋势候选元数据交叉确认。
- `github/copilot-sdk` 本地快照增长 +152，`penpot/penpot` +40，`anthropics/claude-code` +118；均有真实维护或产品信号，等级不变。
- `google-gemini/starter-applets` 仍为 archived，仅是 Google AI Studio 的相关官方代码，保持 `C` 与 `related_official`，不作为正常活跃项目推荐。
- `graphdeco-inria/gaussian-splatting`、`Stability-AI/stable-fast-3d`、`dcy0577/Text2BIM` 等较旧或放缓项目保留在行业基础/观察位，不因累计 Stars 被判为当日热门。
- 连接器读取 `openai/gpt-oss` 元数据时异常，但 GitHub 官方 REST、提交与 README 均成功：20,235 Stars / 2,120 forks、Apache-2.0、非 fork/非归档、最新 release `v0.0.9`，可用性正常。

## Watch 轮换抽查

| 仓库 | 核验结论 |
| --- | --- |
| [zju3dv/PointSplat](https://github.com/zju3dv/PointSplat) | 官方/原创研究仓库；Apache-2.0；README 可用；07-14 提交；继续 watch |
| [ai4ce/wanderland](https://github.com/ai4ce/wanderland) | 原创具身 AI / 3D 项目；Apache-2.0；README 可用；07-10 提交；继续 watch |
| [boschresearch/3dgeer](https://github.com/boschresearch/3dgeer) | Bosch Research 官方实现；AGPL-3.0；README 可用；07-02 提交；继续 watch |
| [harry7557558/spirulae-splat](https://github.com/harry7557558/spirulae-splat) | 原创 3DGS 工具；GPL-3.0；README 可用；07-18 提交；继续 watch |
| [youngju-na/GLINT](https://github.com/youngju-na/GLINT) | 论文官方实现；MIT；README 可用；07-18 提交；继续 watch |

## 数据说明

- `open_issues_count` 同时包含 open issues 与 open PRs；报告结合连接器的 issue/PR 搜索与最近提交判断活跃度，不把单独 PR 搜索无返回误报为没有 PR 活动。
- 报告只更新 `data/dev`、`reports` 与 `public/reports`；未修改 `data/main`，也未覆盖 `candidate-decisions.json`。

## 行业重点收录

本次将 67 个经过官方仓库、原创性和维护状态核验的项目纳入每日跟踪。热度只用于排序，不是收录门槛。

### 3D 重建

- [LingBot-Map](https://github.com/Robbyant/lingbot-map)：官方团队仓库，提供模型权重、推理代码、基准脚本和长视频示例，直接符合 3D 重建主线。
- [VGGT](https://github.com/facebookresearch/vggt)：Meta 官方研究仓库，包含原创实现和模型资源，行业适配度高。
- [MoGe](https://github.com/microsoft/MoGe)：Microsoft 官方研究实现，原创论文与代码关系明确。
- [Stable Fast 3D](https://github.com/Stability-AI/stable-fast-3d)：Stability AI 官方原创实现，具有清晰的图像到 3D 应用价值。
- [Nerfstudio](https://github.com/nerfstudio-project/nerfstudio)：成熟原创工具链，长期被 3D 重建研究与工程流程采用。
- [MapAnything](https://github.com/facebookresearch/map-anything)：Meta 官方研究仓库，Apache-2.0 许可、原创模型与完整任务范围明确，属于 LingBot-Map 同类核心底座。
- [FineRecon](https://github.com/apple/ml-finerecon)：Apple 官方机器学习研究仓库，论文与实现关系明确，适合补齐高精度室内重建路线。
- [WorldMirror](https://github.com/Tencent-Hunyuan/HunyuanWorld-Mirror)：腾讯混元官方 ICML 2026 项目，原创模型、代码和世界模型方向均清晰。
- [Neuralangelo](https://github.com/NVlabs/neuralangelo)：NVIDIA 官方 CVPR 2023 实现，原创性和高精度表面重建价值明确。
- [FLARE](https://github.com/ant-research/FLARE)：蚂蚁研究官方原创实现，属于前馈重建与快速场景建模的重点候选。
- [NeuralRecon](https://github.com/zju3dv/NeuralRecon)：CVPR 2021 Oral 论文作者官方代码，Apache-2.0 许可，作为实时单目重建基线仍有价值。
- [VGG-T3](https://github.com/nv-dvl/vgg-ttt)：NVIDIA Deep Vision Lab 官方论文代码，属于 LingBot-Map 同类前馈重建新路线。

### 3DGS

- [3D Gaussian Splatting](https://github.com/graphdeco-inria/gaussian-splatting)：论文作者官方原创实现，属于 3DGS 必收录的基础仓库。
- [gsplat](https://github.com/nerfstudio-project/gsplat)：Nerfstudio 团队维护的原创基础设施，近期仍持续更新。
- [SuperSplat](https://github.com/playcanvas/supersplat)：PlayCanvas 官方原创编辑器，产品完成度和近期维护状态均较好。
- [Spark](https://github.com/sparkjsdev/spark)：由 World Labs 团队推动的原创渲染项目，仓库活跃且使用路径清晰。
- [StreamSplat](https://github.com/DSL-Lab/StreamSplat)：论文作者官方实现，聚焦在线动态重建，和 LingBot-Map 的流式空间理解路线直接相关。
- [3DGRUT](https://github.com/nv-tlabs/3dgrut)：NVIDIA 研究团队官方原创实现，Apache-2.0 许可、近期维护活跃且直接服务 3DGS 工程。
- [FreeSplatter](https://github.com/TencentARC/FreeSplatter)：腾讯 ARC 官方 ICCV 2025 实现，原创论文与代码对应，直接补充无位姿 3DGS 重建路线。

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

### 3D 世界生成

- [Matrix-3D](https://github.com/SkyworkAI/Matrix-3D)：官方原创项目，MIT 许可，明确覆盖 3D 场景生成、重建、全景合成与世界模型。
- [EmbodiedGen](https://github.com/HorizonRobotics/EmbodiedGen)：企业官方原创项目，2026 年仍持续更新，覆盖生成式场景和具身仿真的关键交叉方向。
- [MesaTask](https://github.com/InternRobotics/MesaTask)：NeurIPS 2025 Spotlight 官方实现，MIT 许可，原创任务驱动场景生成路线明确。
- [HY-World 2.0](https://github.com/Tencent-Hunyuan/HY-World-2.0)：腾讯混元官方项目，2026 年发布并获得持续关注，完整覆盖本次扩充的三个核心方向。
- [HunyuanWorld Voyager](https://github.com/Tencent-Hunyuan/HunyuanWorld-Voyager)：腾讯混元官方原创项目，把可控世界生成与实时 3D 重建连接在同一工作流中。
- [PartCrafter](https://github.com/wgsxm/PartCrafter)：NeurIPS 2025 官方实现，MIT 许可，提供结构化而非单体式 3D 资产生成能力。
- [CraftsMan](https://github.com/HKUST-SAIL/CraftsMan3D)：HKUST SAIL 官方原创模型代码，方向清晰且具备可编辑几何价值。
- [Diffusion as Shader](https://github.com/IGL-HKUST/DiffusionAsShader)：SIGGRAPH 2025 官方项目，Apache-2.0 许可，提供 3D 控制与生成式视觉设计的新路线。
- [TripoSG](https://github.com/VAST-AI-Research/TripoSG)：Tripo 团队官方原创项目，MIT 许可、模型路线和图像到 3D 用途明确。

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

