# ark.insight AI 每周大事件｜2026-08-17—2026-08-23

> 本周已完成补采复核，共收录 24 条经原始来源核验、且实际日期落在本周的事件。每日事件按实际日期归档，不以补采时间重标日期。

## 本周判断

### 1. Agent 产品的主战场从单次回答转向持久记忆、跨应用连接、合规审计、桌面上下文与长程维护。

Agent 产品的主战场从单次回答转向持久记忆、跨应用连接、合规审计、桌面上下文与长程维护。

**建议动作**：建立 Agent 验收表，统一测试权限、审计、长会话、失败恢复与人工接管。

### 2. 低延迟模型、区域算力与逐模型成本报表同时出现，企业采购开始以完整任务成本和治理能力而非单一榜单做决策。

低延迟模型、区域算力与逐模型成本报表同时出现，企业采购开始以完整任务成本和治理能力而非单一榜单做决策。

**建议动作**：统一记录任务成功率、p95 延迟、单位成功任务成本和企业数据边界。

### 3. 3DGS、世界模型与室内布局研究密集推进，目标明确从“看起来真实”转向可定位、可编辑、可执行和物理一致。

3DGS、世界模型与室内布局研究密集推进，目标明确从“看起来真实”转向可定位、可编辑、可执行和物理一致。

**建议动作**：按几何、尺度、可编辑性、物理一致性和真实场景泛化复测空间智能项目。

## 每日大事件

### 星期一｜2026-08-17

#### 1. Google Gemini API 停用 Imagen 4 三个正式模型端点

- **简要说明**：Google 按既定计划于 8 月 17 日关闭 `imagen-4.0-generate-001`、`imagen-4.0-ultra-generate-001` 与 `imagen-4.0-fast-generate-001`，官方建议迁移到 `gemini-3.1-flash-image`。这是此前公告在本次 24 小时窗口内正式生效的兼容性事件，并非当日新发布模型。
- **优先级**：A
- **板块**：AI Product / Model Launch；Workflow / Tutorial / Usage Tips；Interior Design AI
- **重点对象**：Google；Gemini API；Imagen 4；gemini-3.1-flash-image
- **为什么重要**：仍调用 Imagen 4 固定模型 ID 的图像生成、室内设计渲染和自动化内容管线可能直接失败；替代模型的画质、提示词遵循、延迟与成本也可能改变。
- **下一步**：立即盘点 Gemini API 中的 Imagen 4 模型 ID，先用回归样例比较迁移前后的构图、文字、人物一致性与费用，再切换生产流量。
- **来源链接**：[Gemini API 官方停用时间表](https://ai.google.dev/gemini-api/docs/deprecations) · [Gemini API 官方更新日志](https://ai.google.dev/gemini-api/docs/changelog)
- **GitHub / 工程候选**：无新增公开仓库

#### 2. Autodesk AEC 与制造数据模型 API 新计费方案正式生效

- **简要说明**：Autodesk Platform Services 按六月公告于 8 月 17 日开始对 AEC Data Model API 和 Manufacturing Data Model API 引入新计费：免费层继续保留有限用量，符合条件的 Autodesk 产品订阅包含月度额度，超额使用需采用 Flex 预付或按量付费。
- **优先级**：A
- **板块**：AI-CAD / AEC；Market / Business Model；AI Agent
- **重点对象**：Autodesk；Autodesk Platform Services；AEC Data Model API；Manufacturing Data Model API
- **为什么重要**：这些 API 是 BIM/AEC 数据抽取、自动检查、报表、数字孪生和 AI 辅助设计工作流的基础设施；计费与团队归属规则会直接改变规模化 Agent 和数据流水线的单位经济性。
- **下一步**：核对 APS 应用与产品订阅是否位于同一团队，按真实调用量测算免费额度、订阅包含量和超额费用，并为超限或权限错配设置告警。
- **来源链接**：[Autodesk APS 官方计费公告](https://aps.autodesk.com/blog/coming-august-data-model-apis-included-subscriptions-plus-flexible-ways-scale) · [Autodesk AEC Data Model API 官方说明](https://aps.autodesk.com/blog/files-data-unlocking-data-driven-aec-workflows-aec-data-model-apis)
- **GitHub / 工程候选**：无新增公开仓库

#### 3. ForgeWM：渐进因果训练的少步动作条件视频世界模型

- **简要说明**：ForgeWM 通过领域适配、教师强制因果训练、因果一致性蒸馏和在策略分布匹配，把双向动作条件视频生成器压缩为 1、2、4 步学生模型。它同时提供低延迟交互草稿与回放精修双路径，在 Minecraft 和手柄控制 FPS 轨迹上改善画质、动作方向与鼠标控制一致性。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Product / Model Launch
- **重点对象**：ForgeWM；Xinye Li；Jiang Bian
- **为什么重要**：为可交互游戏世界模型、实时仿真和动作条件视频生成提供可复现的低延迟训练与部署范式。局限是当前证据集中在游戏轨迹，训练资源门槛、长时稳定性和跨环境泛化仍需复测。
- **下一步**：复测一至四步模型的端到端延迟、长轨迹漂移与动作一致性，审计数据许可后再评估进入交互式世界模型管线。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.14022) · [作者项目页](https://asdfo123.github.io/ForgeWM) · [论文官方代码](https://github.com/asdfo123/ForgeWM)
- **GitHub / 工程候选**：`asdfo123/ForgeWM`

#### 4. Onto-EV-WM：用本体约束世界模型的故障诊断与闭环修复

- **简要说明**：该工作在 EV-WM 之上增加本体化诊断与验证门控修复接口，把未满足的任务谓词、可用纠正路径和修复后的验收结果显式记录，再由确定性规则选择修复路线。完整配置在 PointMaze 和 LIBERO 系列仿真中改善终态距离与修复成功率。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Agent
- **重点对象**：Onto-EV-WM；EV-WM；Kailin Wang
- **为什么重要**：为工业机器人和具身智能系统提供比黑盒重规划更可追踪的失败记录、纠正路由和验收接口。局限是结果来自特定仿真协议，未隔离本体层贡献，也未验证真实机器人恢复。
- **下一步**：补做真实机器人故障注入、消融实验、在线延迟与跨任务本体迁移评估；现有关联仓库不得视为作者官方代码。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.13901)
- **GitHub / 工程候选**：无新增公开仓库

#### 5. HumanForge：带多智能体伪造理由的人本深伪视频基准

- **简要说明**：HumanForge 汇集超过 1.8 万段音频驱动、姿态驱动、语义驱动和交互式合成人物视频，并用六个专职智能体组成的 Gen2Anno 流水线生成真伪、生成器归因与对比式伪造理由标注。基准显示现有检测器和视觉语言模型在跨生成器泛化、扰动鲁棒性与可解释推理上仍有明显缺口。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI Security / Governance；AI Product / Model Launch；AI Agent
- **重点对象**：HumanForge；Gen2Anno；Wenbo Xu
- **为什么重要**：可用于内容平台、广告审核、数字人和视频生成产品评估检测器是否能跨模型识别复杂交互型伪造。局限是数据与代码尚未实际公开，真实分发压缩和未知生成器表现仍待复现。
- **下一步**：等待数据与代码正式开放后核验许可证、真实视频覆盖度和基准可复现性；在此之前只保留 pending 工程候选，不猜仓库地址。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2607.08705)
- **GitHub / 工程候选**：无新增公开仓库

#### 6. PlayWorld：用 Agent 玩家评测世界模型的长时程目标能力

- **简要说明**：PlayWorld 不再给所有世界模型固定动作序列，而是让多模态 Agent 玩家围绕同一目标闭环观察和行动。171 个场景从几何一致性、交互保真、视野外演化和洞察演化等维度比较九个模型，结果显示现有系统在长时空间一致性和持续状态演化上仍不可靠。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Agent
- **重点对象**：PlayWorld；Kaixin Ding；Kuaishou Technology
- **为什么重要**：为交互式游戏、仿真和机器人世界模型提供更贴近真实用户行为的验收框架，可用于供应商选型和回归测试。局限是 Agent 玩家与 VQA 评委本身会引入模型偏差，且部分数据资产有来源特定的再分发约束。
- **下一步**：先用公开代码复现少量场景，加入人类评委和多模型评委一致性检查，再决定是否纳入世界模型验收基准。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.13552) · [论文官方代码](https://github.com/kxding/PlayWorld)
- **GitHub / 工程候选**：`kxding/PlayWorld`

#### 7. HiCo-GS：融合层级上下文与几何一致性的八叉树 3D 高斯重建

- **简要说明**：HiCo-GS 针对城市级八叉树 3DGS 各层特征彼此隔离的问题，以父层—当前层—子层的双向上下文融合减少立面色漂和纹理过度平滑，再用深度—法线一致性与边缘感知平滑抑制漂浮伪影。论文还发布包含 8 座中国古塔的高密度图像数据集。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI-CAD / AEC
- **重点对象**：HiCo-GS；China-Pagoda；Wei Zhang
- **为什么重要**：适用于城市数字孪生、文保扫描和建筑外立面重建，尤其关注重复纹理与细密构件的质量。局限是质量收益仍需结合训练时间、显存、渲染速度与数据许可评估。
- **下一步**：用公开仓库在建筑外立面与弱纹理场景复测几何误差和资源开销，并核验 China-Pagoda 数据的许可范围。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.14136) · [论文官方代码](https://github.com/WZ-CS/HiCo-GS)
- **GitHub / 工程候选**：`WZ-CS/HiCo-GS`

#### 8. PhyAI：统一边缘实时推理与云端规模化采样的物理 AI 引擎

- **简要说明**：PhyAI 用统一运行时承载 VLA 与世界动作模型，把架构差异封装进适配器，同时共享图执行、内核、显存管理和并行服务。摘要报告相对多种官方实现获得 1.40 至 4.65 倍加速，并用控制时间 Roofline 区分推理瓶颈与环境瓶颈。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Agent
- **重点对象**：PhyAI；Physical AI；Mingti
- **为什么重要**：可减少机器人团队为评测、强化学习采样和部署维护多套推理代码的成本，并帮助判断优化 GPU 推理还是环境交互更划算。局限是部分专用运行时仍更快，真实性能高度依赖模型、硬件和批量。
- **下一步**：用官方仓库复测 Jetson 与数据中心 GPU 的端到端控制延迟、量化精度和新增 VLA 适配成本，再评估统一运行时迁移。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.03682) · [论文官方代码](https://github.com/mingti-org/phyai)
- **GitHub / 工程候选**：`mingti-org/phyai`

### 星期二｜2026-08-18

#### 1. OpenAI 按网络安全能力阈值调整前沿模型训练节奏

- **简要说明**：OpenAI 公布面向前沿网络安全能力的分级治理方案，并说明在强化监控、访问控制和安全评测期间暂停部分前沿强化学习训练。该动作把模型训练节奏直接绑定到能力评估与防护成熟度，而不是只在发布阶段追加限制。
- **优先级**：A
- **板块**：AI Security / Governance；AI Product / Model Launch；Market / Business Model
- **重点对象**：OpenAI；Frontier Models；Cybersecurity
- **为什么重要**：这为高风险能力的训练期治理提供了可操作先例，可能影响前沿模型发布时间、企业安全评测基线以及代理系统的红队与上线门禁。
- **下一步**：把网络安全能力评测、访问分级、监控覆盖率和暂停条件加入高权限 Agent 的发布清单，并跟踪 OpenAI 后续恢复训练所依据的安全证据。
- **来源链接**：[OpenAI 官方公告](https://openai.com/index/pacing-model-development-cyber-capabilities)
- **GitHub / 工程候选**：无新增公开仓库

#### 2. GaussianDWM++：以语言为锚的 3D 高斯驾驶世界模型

- **简要说明**：论文把开放词汇场景理解、语言落地推理、可控 4D 编辑和多模态生成统一到 3D 高斯表示中。其高斯 tokenizer 蒸馏 Qwen/SigLIP 视觉语言特征，再用几何感知适配器和 KL 对齐把密集高斯压缩为世界 token；摘要称在驾驶场景理解、视觉定位、规划推理与可控生成上达到领先结果。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Product / Model Launch
- **重点对象**：GaussianDWM++；Tianchen Deng；3D Gaussian Driving World Model
- **为什么重要**：为自动驾驶仿真、场景检索、语言驱动数据编辑和规划评测提供统一资产层。局限是结论仍需全文复核，代码与数据目前仅承诺未来发布，前代 GaussianDWM 仓库不能视为本论文代码。
- **下一步**：跟踪作者代码与数据真正上线，并优先复核编辑物理一致性、闭环规划指标、算力成本和动态对象长期一致性。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.16234)
- **GitHub / 工程候选**：无新增公开仓库

#### 3. SpotlessGS：面向机器人感知的动态光照可重光照 3D 高斯

- **简要说明**：SpotlessGS 针对机器人自带灯光造成的非均匀照明，把光照参数直接纳入 3DGS 联合优化，并以球谐函数建模低频环境光、以 MLP-BRDF 表达非朗伯反射。摘要报告其在合成和真实数据上减轻光照伪影、改善渲染质量，并对下游机器人感知有正向作用。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models
- **重点对象**：SpotlessGS；Liang Hong；Robotic Perception
- **为什么重要**：适合暗光巡检、仓储、地下空间与室内机器人建图，可减少机载补光对几何与识别的干扰。局限是公开摘要不足以确认真实数据规模、移动光源范围和下游增益。
- **下一步**：等待官方代码或项目页，并在强镜面、多灯、动态物体和跨设备场景中复测在线速度与感知收益。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.14713)
- **GitHub / 工程候选**：无新增公开仓库

#### 4. GaussMemory：面向长流程操作的任务驱动 3D 高斯场景记忆

- **简要说明**：GaussMemory 把 3D 空间记忆从被动记录改为任务驱动的主动选择：系统端到端学习哪些对象需要精细跟踪、更新多频繁、哪些背景可以丢弃，并让记忆写入与读取双向耦合。它以 3DGS 作为持续几何底座，摘要报告在 LIBERO 和 VLABench 多项长流程任务上超过 MemoryVLA 与 π0-FAST。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Agent
- **重点对象**：GaussMemory；Zhiqiang Hu；Long-Horizon Robotic Manipulation
- **为什么重要**：适用于跨房间、跨阶段的机器人操作，让有限显存优先保存可操作对象与关键状态。局限是动态遮挡、错误遗忘、长期漂移和记忆容量控制仍需全文与代码验证。
- **下一步**：跟踪官方实现，并重点测试开放世界中新对象加入、错误记忆回滚、多人环境和跨本体长期可靠性。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.14986)
- **GitHub / 工程候选**：无新增公开仓库

### 星期三｜2026-08-19

#### 1. OpenAI 为前沿模型推出零数据保留兼容的私密安全处理

- **简要说明**：OpenAI 发布 Private Safety Processing 预览：面向符合条件的零数据保留 API 客户，在不向 OpenAI 人员暴露提示词和响应正文的前提下，由自动化系统跨相关交互识别风险模式。客户可把内容保留在自有基础设施，也可选择由 OpenAI 保存但使用客户控制密钥加密的方案；OpenAI 仅接收窄化的风险信号。该能力正与早期客户测试，计划于 9 月开始推出并发布技术白皮书。
- **优先级**：A
- **板块**：AI Security / Governance；AI Product / Model Launch；AI Agent
- **重点对象**：OpenAI；Zero Data Retention；Private Safety Processing
- **为什么重要**：它尝试解决前沿模型安全监测与企业数据最小化之间的冲突，尤其适用于金融、医疗和企业 Agent 等敏感场景，但实际保证仍取决于后续白皮书、密钥管理边界和正式上线条款。
- **下一步**：企业 API 团队应提前梳理 ZDR 资格、客户自管密钥、告警调查与申诉流程，并在 9 月白皮书发布后复核威胁模型、数据流和合规边界。
- **来源链接**：[OpenAI 官方公告](https://openai.com/index/offering-zero-data-retention-for-frontier-models/) · 内部发现源 2026-08-20 每日 AI（发现源）
- **GitHub / 工程候选**：无新增公开仓库

#### 2. TrueFoundry 开源 TrueForge 通用 Agent 运行时框架

- **简要说明**：TrueFoundry 开源 TrueForge，一个厂商中立的 Agent harness。项目把模型调用、MCP 工具、Skills、沙箱、审批、上下文管理和会话状态纳入统一执行循环，并提供聊天界面、HTTP API、TypeScript SDK 与可嵌入 UI；支持本地 SQLite 和面向团队的 Postgres、Redis、Docker Compose 或 Helm 部署。
- **优先级**：B
- **板块**：AI Agent；AI Coding；Business Model
- **重点对象**：TrueFoundry；TrueForge
- **为什么重要**：Agent 基础设施竞争正从单次模型调用转向可持久化、可审计、可审批的运行时。TrueForge 以 MIT 许可证公开完整执行层，为自建 Agent 平台提供了一个可核验的实现候选；其成本基准仍需独立复现。
- **下一步**：先在隔离环境复现官方 benchmark，再检查默认无登录的本地模式、沙箱密钥边界、审批覆盖率和多租户隔离，避免直接暴露到公网。
- **来源链接**：[TrueForge 官方 GitHub 仓库](https://github.com/truefoundry/trueforge) · [TrueFoundry 官方发布帖](https://x.com/truefoundry/status/2090081376330715176) · 内部发现源 2026-08-20 每日 AI（发现源）
- **GitHub / 工程候选**：`truefoundry/trueforge`

### 星期四｜2026-08-20

#### 1. Claude Code 2.1.236 强化自动模式审查与跨会话协作

- **简要说明**：Anthropic 在 2026 年 8 月 19 日 20:01 UTC（上海时间 8 月 20 日 04:01）发布 Claude Code 2.1.236。新版为跨会话 SendMessage 增加一次性空闲通知，修复消息过载时误报已送达的问题，并让自动模式下的 Monitor 命令与 Bash 命令接受同类审查；同时堵住 macOS 沙箱通配符读取拒绝规则可被重命名绕过、以及 Git 状态可因 showUntrackedFiles=no 被误判为干净等边界。
- **优先级**：A
- **板块**：AI Coding；AI Agent；AI Security / Governance
- **重点对象**：Anthropic；Claude Code；Claude Code 2.1.236
- **为什么重要**：这次更新同时改善多会话 Agent 的交接可靠性与自动执行门禁，直接影响长任务编排、无人值守监控和敏感文件保护。
- **下一步**：升级前在测试仓库复核 SendMessage 限流、Monitor 审查和通配符 deny 规则，并把 showUntrackedFiles=no 场景加入自动模式安全回归。
- **来源链接**：[Claude Code 官方更新提交](https://github.com/anthropics/claude-code/commit/084ca20bcf90249ecfcc01efe5c899554c400a85) · [Claude Code 官方更新日志](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md) · [Claude Code 2.1.236 官方发布页](https://github.com/anthropics/claude-code/releases/tag/v2.1.236)
- **GitHub / 工程候选**：`anthropics/claude-code`

#### 2. QuARC-GS：面向动态 3D 高斯流媒体的量化锚点残差编码

- **简要说明**：QuARC-GS 用单个规范帧和逐帧压缩残差表示动态场景，并通过量化感知的锚点形变与变化门控增密减少无效更新。论文报告在保持重建质量与训练速度的同时，将逐帧存储最多压缩 11 倍。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models
- **重点对象**：QuARC-GS；Vu Trung Nghia Nguyen；Yuchen Wang
- **为什么重要**：动态 3DGS 若要进入长视频、远程巡检和自由视点直播，持续增长的存储与传输成本必须先被解决；该方法提供了接近工程部署问题的压缩路线。
- **下一步**：跟踪代码发布，并用室内巡检与人物运动长视频复测压缩率、重建速度、首帧时延和长期漂移。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.18285)
- **GitHub / 工程候选**：无新增公开仓库

#### 3. 2Xplat：解耦几何与外观的前馈式 3D 高斯重建

- **简要说明**：2Xplat 将无位姿前馈 3DGS 拆成两个专家：几何专家先预测相机位姿，外观专家再生成高斯。论文称不足 5,000 次训练迭代即可超过既有无位姿方法，并接近使用已知位姿的先进方法。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Product / Model Launch
- **重点对象**：2Xplat；Hwasik Jeong；Seungryong Lee
- **为什么重要**：模块化架构更利于分别替换相机估计与外观生成组件，也更适合产品原型中的故障定位和持续升级。
- **下一步**：代码公开后与 AnySplat、MVSplat 和传统 SfM 流程做同输入对比，重点记录位姿失败率和可替换性。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2603.21064)
- **GitHub / 工程候选**：无新增公开仓库

#### 4. CoMVS-GS：多视图立体与 3D 高斯协同的表面重建

- **简要说明**：CoMVS-GS 用稠密 MVS 点和法线初始化高斯，再让 PatchMatch 深度与高斯渲染深度、法线互相监督，最后通过 Delaunay 图割提取网格。论文称其在室外场景提升几何精度与网格紧凑度，同时保持较高渲染质量。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models
- **重点对象**：CoMVS-GS；Shihan Chen；Junjing Zhang
- **为什么重要**：它直接处理 3DGS 擅长渲染但网格几何不稳定的问题，对建筑扫描、数字孪生和可编辑资产生产更有实际价值。
- **下一步**：优先用遮挡严重的建筑立面与室内角落测试网格完整度、面数、薄结构保留和处理耗时。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.18413)
- **GitHub / 工程候选**：无新增公开仓库

#### 5. GS-VLA：用 3D 高斯视角规范化增强冻结 VLA 策略

- **简要说明**：GS-VLA 在冻结的视觉语言动作策略前增加一个约 400 万参数的 3D 高斯视角规范化模块，把部署相机变化转成局部新视角合成问题。论文显示，轻微相机位移可让 LIBERO 成功率最差从约 90% 降至 10%，而该模块无需重训策略即可恢复大量性能。
- **优先级**：B+
- **板块**：Frontier Paper / Research；AI 3D / World Models
- **重点对象**：GS-VLA；Yechan Park；HyunJin Kim
- **为什么重要**：机器人模型落地常被相机安装位置和本体差异拖累；用轻量视觉适配层保护昂贵的基础策略，具备明确的部署降本价值。
- **下一步**：在同一任务上逐级改变相机高度、俯仰和横向位移，比较成功率恢复、额外延迟与无需重训的边界。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.19066)
- **GitHub / 工程候选**：无新增公开仓库

#### 6. 第一视角视频视觉语言模型：从手物交互走向具身智能

- **简要说明**：这篇综述梳理第一视角视频中的任务、数据集、手物交互、长时序推理和多模态适配。作者指出，现有模型识别可见物体相对可靠，但对持续变化的交互、动作与用户意图仍明显不足。
- **优先级**：B+
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Product / Model Launch
- **重点对象**：第一视角视频视觉语言模型；Mohammad Zamani；Fatemeh Ziaeetabar
- **为什么重要**：第一视角视频是智能眼镜、机器人技能学习和人机协作的重要数据入口，综述提供了从感知能力走向长期行为理解的研究地图。
- **下一步**：把手物关系、长时序意图、隐私和跨域泛化设为第一视角项目的固定评测维度。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.18671)
- **GitHub / 工程候选**：`AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline`

#### 7. USR-Drive：联合去噪 3D 高斯与目标框的统一驾驶场景表示

- **简要说明**：USR-Drive 把稠密 3D 高斯和稀疏 3D 目标框编码为对齐的两路 token，由统一扩散 Transformer 联合去噪。几何为目标框提供度量证据，目标框反过来约束动态场景结构；论文称在 nuScenes 与 VKitti 的动态重建和 3D 检测上达到先进结果。
- **优先级**：B+
- **板块**：Frontier Paper / Research；AI 3D / World Models
- **重点对象**：USR-Drive；Li-Heng Chen；Haokai Pang
- **为什么重要**：统一表示减少重建与检测各自建模造成的信息割裂，为自动驾驶世界模型同时支持渲染、理解和规划提供基础。
- **下一步**：跟踪代码和模型开放情况，并对动态目标一致性、检测收益、渲染质量与推理成本做联合评估。
- **来源链接**：[arXiv 论文页](https://arxiv.org/abs/2608.19036)
- **GitHub / 工程候选**：无新增公开仓库

### 星期五｜2026-08-21

#### 1. OpenAI 将 GPT-5.6 Sol API 与积分价格阶段性下调超过 20%

- **简要说明**：OpenAI 官方宣布未来三个月下调 GPT-5.6 Sol 的 API 与积分价格，API 新价已经生效，ChatGPT Work 与 Codex 的信用额度方案将逐步推出。
- **优先级**：A
- **板块**：Market / Business Model；AI Product / Model Launch
- **重点对象**：OpenAI；GPT-5.6 Sol；Codex
- **为什么重要**：前沿模型的价格竞争正在从单纯降价转向“能力、额度与企业工作流”打包，直接影响智能体应用的单位任务成本。
- **下一步**：更新内部模型成本表，并用真实工作流比较降价前后的单任务成本、成功率与人工复核时间。
- **来源链接**：[OpenAI 官方账号](https://x.com/OpenAI/status/2090885187634905500) · [OpenAI Developers 官方账号](https://x.com/OpenAIDevs/status/2090888116014137718)
- **GitHub / 工程候选**：无新增公开仓库

#### 2. SGLang 引入 Weight Cache Daemon，减少大模型引擎重启时的权重加载成本

- **简要说明**：SGLang 的官方实现让独立守护进程把分片、量化后的模型权重常驻 GPU，并通过 CUDA IPC 向重启后的引擎共享，避免每次都从磁盘重新加载。
- **优先级**：A
- **板块**：AI Product / Model Launch；AI Coding
- **重点对象**：SGLang；Weight Cache Daemon；CUDA IPC
- **为什么重要**：模型服务恢复速度决定在线智能体的可用性；把权重生命周期与推理引擎解耦，是降低升级、故障和弹性扩缩容停顿的重要基础设施能力。
- **下一步**：在具备多卡环境时复测不同模型、量化方式和张量并行配置下的重启时延、显存占用与失败回退。
- **来源链接**：[SGLang 官方实现](https://github.com/sgl-project/sglang/blob/main/python/sglang/srt/weight_cache/daemon.py)
- **GitHub / 工程候选**：`sgl-project/sglang`

### 星期六｜2026-08-22

#### 1. Claude Security 基于 Claude Mythos 5 向企业客户开放代码扫描公测

- **简要说明**：Claude 官方账号宣布，Claude Security 扫描已经运行在 Claude Mythos 5 上，并面向 Claude Enterprise 客户开放公测，用户无需单独获得模型访问权限即可扫描代码库。
- **优先级**：A
- **板块**：AI Security / Governance；AI Coding
- **重点对象**：Anthropic；Claude Security；Claude Mythos 5
- **为什么重要**：前沿模型正被封装成可审计的企业安全工作流，竞争重点从模型能力延伸到权限、代码库接入、修复闭环与责任边界。
- **下一步**：把误报率、可解释证据、修复建议可执行性和敏感代码边界列为代码安全智能体的固定评测项。
- **来源链接**：[Claude 官方账号](https://x.com/claudeai/status/2090852314319880425) · [Boris Cherny 官方账号](https://x.com/bcherny/status/2091068805934105045)
- **GitHub / 工程候选**：无新增公开仓库

### 星期日｜2026-08-23

- **经补采核验，本日没有达到正式收录门槛的新事件。** 聚合候选仍保留在对应日报中，不把旧事件重标为当天事件。

## 辅助索引

### 板块计数（多标签）

| 板块 | 数量 |
|---|---:|
| Financing / Investment | 0 |
| AI Product / Model Launch | 10 |
| AI Agent | 9 |
| AI Security / Governance | 5 |
| AI Coding | 4 |
| AI-CAD / AEC | 2 |
| Interior Design AI | 1 |
| AI 3D / World Models | 14 |
| Workflow / Tutorial / Usage Tips | 1 |
| YouTube / Creator Watch | 0 |
| Market / Business Model | 3 |

### 重复重点对象

- OpenAI：3 条
- Anthropic：2 条
- 2Xplat：1 条
- 3D Gaussian Driving World Model：1 条
- 第一视角视频视觉语言模型：1 条
- AEC Data Model API：1 条
- Autodesk：1 条
- Autodesk Platform Services：1 条
- China-Pagoda：1 条
- Claude Code：1 条
- Claude Code 2.1.236：1 条
- Claude Mythos 5：1 条
- Claude Security：1 条
- Codex：1 条
- CoMVS-GS：1 条
- CUDA IPC：1 条
- Cybersecurity：1 条
- EV-WM：1 条
- Fatemeh Ziaeetabar：1 条
- ForgeWM：1 条
- Frontier Models：1 条
- GaussianDWM++：1 条
- GaussMemory：1 条
- Gemini API：1 条
- gemini-3.1-flash-image：1 条
- Gen2Anno：1 条
- Google：1 条
- GPT-5.6 Sol：1 条
- GS-VLA：1 条
- Haokai Pang：1 条

### GitHub / 工程候选

- ziboshao/AgentPatch | verified | https://github.com/ziboshao/AgentPatch
- andrewbxy/ERF-GS | verified | https://github.com/andrewbxy/ERF-GS
- nenhang/PhyEdit | verified | https://github.com/nenhang/PhyEdit
- arcee-ai/nac | verified | https://github.com/arcee-ai/nac
- DeepSeek Harness | pending | repo URL 待核验
- Faraday / Replica | pending | repo URL 待核验
- FlexSplat | pending | repo URL 待核验
- PhysX-CoT | pending | repo URL 待核验
- Seed2GS | pending | repo URL 待核验
- World Tokens | pending | repo URL 待核验
- asdfo123/ForgeWM | verified or pending review
- kxding/PlayWorld | verified or pending review
- WZ-CS/HiCo-GS | verified or pending review
- mingti-org/phyai | verified or pending review
- truefoundry/trueforge | verified or pending review
- anthropics/claude-code | verified or pending review
- AgibotTech/AgiBotWorldChallengeICRA2026-WorldModelBaseline | verified or pending review
- sgl-project/sglang | verified or pending review

### 覆盖说明

- 日报覆盖：2026-08-17、2026-08-18、2026-08-19、2026-08-20、2026-08-21、2026-08-22、2026-08-23。
- 8 月 2 日 GitHub 与 Skill 的历史热度快照无法在停机后精确重建，已另行生成停机补录报告，未伪造排名或安装量。
- 聚合页面只用于发现；正式事件仍保留官方、作者原始或可信媒体链接。

