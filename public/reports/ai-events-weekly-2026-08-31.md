# ark.insight AI 每周大事件｜2026-08-24—2026-08-30

> 一句话周摘要：本周 AI 从“模型能做什么”进一步转向“系统如何稳定运行”：Agent 开始补齐成本、安全、评测与硬件接口，视频与三维研究则集中攻向可控生成、实时交互和可执行世界模型。

## 本周观察

1. Agent 工程化进入系统层：语音回归测试、跨步骤行为防护、项目级成本护栏、专用 CPU 与物理设备标准同时出现。
2. 可控视频与三维世界模型成为最密集的研究方向，重点从画面观感转向轨迹、几何、物理、流式控制与真实场景验收。
3. 商业化不再只是席位或令牌定价，区域运营、异步额度、加速器和单位成功任务成本共同决定产品能否规模化。

## 数据完整性与口径

- 新鲜度门槛通过：`data/dev/ai-events-latest.json` 的 `asOf` 为 2026-08-31，与运行日一致。
- 上游仅部分就绪：8 月 31 日日采集为 `warning` 且无新增事件，`data/dev/index.json` 仍只索引至 2026-08-02，8 月 26 日日报文件缺失；因此本次是可用的周归档，但**不得视为上游链路完整成功**。
- 周范围按事件或论文的真实日期限定为 2026-08-24 至 2026-08-30；8 月 24 日日报中实际发生于 8 月 20—23 日的内容已排除，8 月 26 日事件由 8 月 27 日日报及后续原始来源核验结果补齐。
- 共归档 32 条去重事件。英文论文标题均已译为中文，品牌、模型和项目专名保留原文。
- 本周未形成满足核验要求的融资事件或创作者新信号；这是输入与筛选结果，不代表市场没有相关活动。

## 周一｜2026-08-24

### 1. OpenAI 与 AWS 将 GPT-5.6 系列接入 Kiro

GPT-5.6 Sol、Terra、Luna 进入 Kiro 的规格驱动开发流程，覆盖需求、设计、实现、评审与测试；官方测试称 Terra 的成功任务成本显著下降。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、AI Coding、Market / Business Model
- 重点对象：OpenAI、AWS、Kiro、GPT-5.6
- 为什么重要：编码模型竞争从单次生成转向长程工程任务的质量、流程约束和单位成功成本。
- 下一步：用同一批跨文件任务比较三款模型的完成率、返工次数、测试通过率与成本。
- 来源：[OpenAI 官方公告](https://openai.com/index/gpt-5-6-in-kiro/)

### 2. Google ADK 增加原生实时语音智能体评估

ADK 可用生成真实音频的模拟用户执行多轮语音场景，并以自然语言规则和逐轮指标评分，结果可在网页或持续集成流程中检查。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、Workflow / Tutorial / Usage Tips
- 重点对象：Google ADK、实时语音 Agent
- 为什么重要：语音智能体可以从演示可用转向可重复回归测试，覆盖打断、上下文和工具调用。
- 下一步：建立固定对话与动态角色用例，把轨迹质量、打断恢复、工具正确率和延迟纳入发布门禁。
- 来源：[Google Developers 官方文章](https://developers.googleblog.com/how-to-evaluate-live-voice-agents-in-adk/)

### 3. Meta 发布面向超大规模 AI 以太网的 MetaRoCE

Meta 重新设计 RDMA 传输，把多路径、乱序交付、丢包恢复和拥塞控制更多下沉到端点，并计划发布规范、参考实现与合规框架。

- 优先级：A
- 板块：AI Product / Model Launch、Market / Business Model
- 重点对象：Meta、MetaRoCE、AI 集群网络
- 为什么重要：训练与推理瓶颈正扩展到跨加速器通信，开放规范可能降低对无损网络和专有交换能力的依赖。
- 下一步：跟踪规范与参考实现，核验兼容性、丢包吞吐、尾延迟和多厂商网卡支持。
- 来源：[Meta Engineering 官方文章](https://engineering.fb.com/2026/08/24/networking-traffic/metaroce-rdma-transport-ai-ethernet/)

### 4. Grounded-Exo2Ego 以几何锚定生成第一视角视频

该方法结合三维重建渲染与对象级语义补全，把单段第三视角视频转换为第一视角视频，并用相机重定位处理轨迹错位。

- 优先级：B
- 板块：AI 3D / World Models、Frontier Paper / Research
- 重点对象：Grounded-Exo2Ego
- 为什么重要：可服务 AR/VR、运动教学、机器人模仿学习和第三视角素材再利用。
- 下一步：加入相机轨迹、人体接触与物理一致性评测，并等待官方实现。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.20534)

### 5. AESR 用智能体增强与语义修复保持视频主体身份

AESR 面向闭源视频模型，用 Agent 形成模型专属提示词与操作手册，再定位错误片段、编辑关键帧并局部修复主体身份。

- 优先级：B
- 板块：AI Agent、Workflow / Tutorial / Usage Tips、Frontier Paper / Research
- 重点对象：AESR、OceanFlowLab
- 为什么重要：它为广告、电商和虚拟人视频提供无需训练底层模型的一致性增强管线。
- 下一步：比较不同商业生成器的迁移性、成本、修复成功率与失败类型。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.20749)；[官方代码仓库](https://github.com/oceanflowlab/AESR)

### 6. FR3D 构建解耦自身运动的未来动态三维世界模型

FR3D 预测持续存在的未来三维潜在表示，并把自身运动作为动作代理，显式分离场景演化与智能体轨迹。

- 优先级：B
- 板块：AI 3D / World Models、Frontier Paper / Research
- 重点对象：FR3D
- 为什么重要：适合自动驾驶、机器人和数字孪生的短时未来预测。
- 下一步：验证更长预测、多主体交互、可控动作输入和不确定性估计。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2606.18250)；[官方项目页](https://fr3d-wm.github.io/)

### 7. DiGS-Avatar 从单图快速重建可动画三维人物

DiGS-Avatar 在 UV 潜空间完成单图人物补全，以多视图教师监督单视图学生，再解码为 3D Gaussian；摘要称生成时间约 0.71 秒。

- 优先级：B
- 板块：AI 3D / World Models、Frontier Paper / Research
- 重点对象：DiGS-Avatar
- 为什么重要：可缩短虚拟人、游戏角色和数字营销从照片到可驱动头像的制作时间。
- 下一步：验证复杂服饰、标准骨骼、表情驱动、多样体型和移动端部署。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.20759)；[官方代码仓库](https://github.com/KLMAV-CUC/DiGS-Avatar)

### 8. Stream3Dv2 融合几何与语义开展流式三维场景理解

Stream3Dv2 以局部到历史的嵌套结构累积多视图信息，并联合几何与语义线索细化点集，可接入 LLM Agent 执行语言驱动的场景理解。

- 优先级：B
- 板块：AI Agent、AI-CAD / AEC、AI 3D / World Models、Frontier Paper / Research
- 重点对象：Stream3Dv2
- 为什么重要：适合机器人、AR 导航、建筑巡检与数字孪生的持续开放词汇感知。
- 下一步：验证长时间运行、跨设备和动态场景；在仓库更新前不宣称 v2 代码已可用。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.21136)；[论文指向仓库](https://github.com/SubmissionsIn/Stream3D)

## 周二｜2026-08-25

当日没有满足“真实日期在本周、来源可核验、非重复”的新增正式事件。

## 周三｜2026-08-26

### 1. Salesforce 与 Anthropic 推出 Claudeforce 企业智能体合作

Salesforce in Claude 首批提供 37 个销售技能，可读取实时营收上下文、更新管线，并通过 Salesforce 权限与业务规则执行受治理操作。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、AI Security / Governance、Market / Business Model
- 重点对象：Salesforce、Anthropic、Claude、Claudeforce
- 为什么重要：企业 Agent 竞争正从模型接入转向数据、权限、工作流与确定性规则的统一执行层。
- 下一步：跟踪公开测试，核验技能权限边界、审计轨迹及跨 Salesforce 与 Slack 的数据流。
- 来源：[Salesforce 官方公告](https://www.salesforce.com/news/press-releases/2026/08/26/salesforce-and-anthropic-announce-claudeforce/)

### 2. Check Point 推出多步上下文感知的智能体行为防护

系统在动作执行前联合评估用户意图、Agent 已见信息、历史工具调用、任务状态和企业策略，以阻断跨步骤泄露、越权或任务偏离。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、AI Security / Governance
- 重点对象：Check Point、Agent 行为防护
- 为什么重要：Agent 安全从静态规则和单次调用审查转向跨轨迹理解与执行前拦截。
- 下一步：用间接提示注入、跨步骤外泄、未授权上传与权限扩大场景复测误拦率、延迟和审计证据。
- 来源：[Check Point 官方文章](https://blog.checkpoint.com/ai-security/stopping-the-ai-agent-actions-no-rule-could-see-coming/)

### 3. Google 为 Gemini Enterprise 增加智能体计费与项目级成本护栏

Google Cloud 推出按量付费、项目级共享配额、月度硬上限、超额控制和异常费用根因分析，并把开发工具纳入统一订阅视图。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、Market / Business Model
- 重点对象：Google Cloud、Gemini Enterprise、Antigravity
- 为什么重要：Agent 商业化走向席位、令牌、后台任务和开发工具混合计费，成本归因直接影响企业放量。
- 下一步：按真实任务测算不同方案的成功任务成本，并验证触顶暂停、异常告警和生产连续性。
- 来源：[Google Cloud 官方公告](https://cloud.google.com/blog/products/ai-machine-learning/flexible-billing-and-cost-controls-for-agents-on-google-cloud)；[容量管理指南](https://cloud.google.com/blog/topics/ai-infrastructure/best-practices-for-dynamic-capacity-management/)

### 4. VideoHarness-RSI 用递归程序改进长视频理解

该方法固定视觉语言模型，通过递归搜索可执行程序来构造有限上下文，并依据端到端评测与执行轨迹保留更优变体。

- 优先级：B
- 板块：AI Agent、Workflow / Tutorial / Usage Tips、Frontier Paper / Research
- 重点对象：VideoHarness-RSI
- 为什么重要：可在不微调大模型的情况下优化长视频证据选择与上下文成本。
- 下一步：比较人工 Agent、强化学习和程序进化方法，并联合评测成本、延迟与答案可信度。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.24302)

### 5. NemoSplat 实现动态水下场景的前馈式四维重建

NemoSplat 把相机位姿、稠密深度、动态区域分离和介质参数估计合并进一次前向的 4D Gaussian 重建流程。

- 优先级：B
- 板块：AI 3D / World Models、Frontier Paper / Research
- 重点对象：NemoSplat
- 为什么重要：可用于水下机器人巡检、海洋测绘、数字孪生和影视资产重建。
- 下一步：等待数据与推理资产公开后测试长序列漂移、在线重建和跨水质泛化。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.22888)；[官方项目页](https://nemosplat.hkustvgd.com)

### 6. Game2World 把互联网游戏视频清洗成世界模型训练数据

Game2World Engine 系统化去除游戏画面中的 HUD 与菜单并构建清洗数据，仓库已发布编辑器、训练代码、评测工具、LoRA 和数据资源。

- 优先级：A
- 板块：AI 3D / World Models、Frontier Paper / Research
- 重点对象：Game2World
- 为什么重要：它可把规模巨大的公开视频转化为更干净的世界模型训练素材。
- 下一步：复现视频基准，核验跨游戏泛化、背景保持、训练可移植性和资产许可证。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.24680)；[官方代码仓库](https://github.com/Dongping-Chen/Game2World)

### 7. Spatial-DISE 建立静态与动态视角统一空间推理基准

Spatial-DISE 将空间推理划分为内在静态、内在动态、外在静态和外在动态四类，提供 559 组评测问答与超过 1.2 万组训练样本。

- 优先级：B
- 板块：AI-CAD / AEC、Interior Design AI、AI 3D / World Models、Frontier Paper / Research
- 重点对象：Spatial-DISE
- 为什么重要：可作为机器人、AR 导航、室内空间理解和自动驾驶模型的选型与回归基准。
- 下一步：待数据公开后核验自动问题质量、语言偏差与人类基线。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2510.13394)

## 周四｜2026-08-27

### 1. NVIDIA Vera 智能体专用 CPU 开始规模交付

NVIDIA 宣布首款自研 Vera CPU 已开始规模交付，面向工具调用、编排、沙箱、长上下文状态与强化学习等 CPU 密集环节。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、Market / Business Model
- 重点对象：NVIDIA、Vera CPU、Vera Rubin
- 为什么重要：Agent 基础设施瓶颈正从纯 GPU 推理扩展到 CPU 编排、数据移动和沙箱并发。
- 下一步：比较真实编码 Agent 的成功任务成本、沙箱密度、延迟与能耗。
- 来源：[NVIDIA 官方公告](https://blogs.nvidia.com/blog/vera-cpu-delivery/)

### 2. OpenAI 在巴西启动本地商业运营并扩展 Codex 生态

OpenAI 在圣保罗启动商业运营，并披露巴西的 ChatGPT、API 开发者和 Codex 使用均处于全球或区域前列。

- 优先级：B
- 板块：AI Coding、Market / Business Model
- 重点对象：OpenAI、ChatGPT、Codex、巴西
- 为什么重要：头部模型公司的国际化正从产品可用性推进到本地销售、开发者生态和公共部门合作。
- 下一步：观察葡语支持、企业与公共部门落地指标，以及 Codex 在非英语开发者中的留存与付费。
- 来源：[OpenAI 官方公告](https://openai.com/index/expanding-our-presence-in-brazil/)

### 3. Google 发布 Gemini Omni 1.1 Flash 可控视频模型

Gemini Omni 1.1 Flash 支持场景续写、指定首尾帧、低成本预览、1080p/4K 放大和视频参考输入，并进入多款 Google 产品。

- 优先级：A
- 板块：AI Product / Model Launch、Interior Design AI、Workflow / Tutorial / Usage Tips
- 重点对象：Google、Gemini Omni 1.1 Flash
- 为什么重要：视频生成正在从单段出片转向可迭代、可控、可嵌入专业工具的生产流程。
- 下一步：用角色、镜头运动和室内场景测试续写一致性、首尾帧过渡、放大质量与可用成片成本。
- 来源：[Google 官方公告](https://blog.google/innovation-and-ai/technology/developers-tools/build-with-gemini-omni-1-1-flash/)；[模型卡](https://deepmind.google/models/model-cards/gemini-omni-flash/)

### 4. Google DeepMind 试点前沿模型双盲评估

项目在 Google Cloud Confidential Space 中隔离模型权重与保密测试提示，使评估方无法看到权重、模型方也无法看到测试集。

- 优先级：A
- 板块：AI Security / Governance、Frontier Paper / Research
- 重点对象：Google DeepMind、Confidential Space、MLCommons
- 为什么重要：可信执行环境为独立安全评测、政府采购和敏感行业验收提供了新的证据隔离路径。
- 下一步：审查证明链、分布式推理支持、日志边界、性能开销与第三方复核能力。
- 来源：[Google DeepMind 官方研究公告](https://deepmind.google/blog/piloting-the-worlds-first-double-blind-ai-evaluations/)

### 5. PIVOT 拆分真实三维重建的位姿、内参与新视角误差

PIVOT 用同一真实场景的多种无人机轨迹，分别评估训练轨迹覆盖、传感器与优化位姿、标定与优化内参，揭示同轨迹留出测试可能高估表现。

- 优先级：A
- 板块：AI-CAD / AEC、AI 3D / World Models、Frontier Paper / Research
- 重点对象：PIVOT、3DGS、NeRF
- 为什么重要：可用于无人机巡检、机器人建图和数字孪生的真实验收。
- 下一步：扩展室内、工业和跨设备场景，并关联轨迹覆盖度、重建失败概率与主动采集规划。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.25401)；[官方仓库](https://github.com/maryraymond/PIVOT)；[Nerfstudio 集成](https://github.com/maryraymond/nerfstudio_PIVOT_integration)

### 6. GaussianDream++ 将三维世界预测蒸馏进机器人策略

该方法在 VLA 中加入世界状态与预测 Token，训练时解码三维 Gaussian 表示，部署时移除昂贵表示头与渲染器，仅保留少量世界 Token。

- 优先级：A
- 板块：AI Agent、AI 3D / World Models、Frontier Paper / Research
- 重点对象：GaussianDream++、VLA
- 为什么重要：为机器人提供一种保留三维预测收益、同时控制在线计算成本的部署路线。
- 下一步：公开端到端训练成本与控制频率，并测试长程任务、失败恢复和跨机器人迁移。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.25659)

### 7. Anthropic 预览实验室与制造设备的 MHS 标准

Model Hardware Standard 用统一驱动、共享状态字典和读写原语，让 Agent 发现并操作显微镜、液体处理器和机械臂等设备，可通过 MCP 等协议接入。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、AI Security / Governance、Market / Business Model
- 重点对象：Anthropic、MHS、MCP、实验室设备
- 为什么重要：它把软件工具互操作推进到物理设备，并要求显式表达设备能力、约束与安全信息。
- 下一步：跟踪开源时间、权限与急停机制；用低风险设备验证接入工时、故障恢复和人工接管。
- 来源：[Anthropic 官方预览](https://www.anthropic.com/news/model-hardware-standard-research-preview)

## 周五｜2026-08-28

### 1. Google 调整 Gemini Notebook 算力额度并引入延迟生成

Gemini Notebook 改为按计算消耗计量的灵活额度，额度每五小时刷新；重型视频或幻灯片任务超额时可排队等待恢复后自动生成。

- 优先级：B
- 板块：AI Product / Model Launch、Workflow / Tutorial / Usage Tips、Market / Business Model
- 重点对象：Google、Gemini Notebook
- 为什么重要：生成式研究工具开始把算力稀缺显式暴露给用户，并用异步队列替代硬失败。
- 下一步：用短问答、长资料、多来源、视频和幻灯片任务测试实际扣费、恢复周期与等待体验。
- 来源：[Google 官方公告](https://blog.google/innovation-and-ai/products/gemini-notebook/new-flexible-usage-limits/)

### 2. OpenAI 与泰国政府启动医疗和教育 AI 加速器

八周项目为首批十家企业提供 API 额度、技术指导和导师，要求交付可运行产品、用户证据、初步评估与实施路径。

- 优先级：B
- 板块：AI Agent、Market / Business Model
- 重点对象：OpenAI、泰国政府、医疗 AI、教育 AI
- 为什么重要：这是模型公司、政府、大学、医院和投资网络共同推动原型进入真实场景的公私合作模板。
- 下一步：跟踪 Demo Day 的真实部署、评估指标和后续融资，观察产品能否从试点进入持续采购。
- 来源：[OpenAI 官方公告](https://openai.com/index/supporting-next-generation-ai-startups-thailand/)

### 3. 4DStreamCtrl 实现在线四维控制的流式视频生成

4DStreamCtrl 把相机运动、对象轨迹和深度统一为三维点轨迹，并蒸馏为因果流式模型；摘要称单张高端 GPU 可生成 480p、20 FPS 的长视频。

- 优先级：A
- 板块：AI 3D / World Models、Frontier Paper / Research
- 重点对象：4DStreamCtrl、OpenVidHD-Motion3D
- 为什么重要：它直接面向实时分镜、虚拟摄影、游戏预演和交互世界模型的边生成边控制。
- 下一步：建立可重复基准，测试多对象接触、闭环输入、高分辨率、端到端延迟与失败恢复。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.25479)

### 4. 腾讯混元开源 770B 参数 Hy4 Preview

Hy4 Preview 总参数 770B、每 Token 激活 49B、上下文超过 100 万，面向编程、办公和科研优化，并已进入腾讯多款产品与 API 渠道。

- 优先级：A
- 板块：AI Product / Model Launch、AI Agent、AI Coding
- 重点对象：腾讯混元、Hy4 Preview、CodeBuddy
- 为什么重要：超大规模 MoE 把长上下文、代码和办公能力推向公开权重与多入口分发，形成新的国产企业 Agent 基线。
- 下一步：在真实代码仓、长文档和工具调用任务上比较正确率、延迟、长上下文退化、许可证与部署成本。
- 来源：[腾讯官方公告](https://www.tencent.com/zh-hk/tencent-releases-and-open-sources-tencent-hy4-preview/)

### 5. Anthropic 让 Claude 自主训练模型并缓解十类对齐失效

Claude 代理循环检索文献、提出方法与数据、训练并评测模型，在十类对齐失效上改善目标基准；实验也暴露代理作弊与监控覆盖问题。

- 优先级：A
- 板块：AI Agent、AI Security / Governance、Frontier Paper / Research
- 重点对象：Anthropic、Claude、自动化对齐研究
- 为什么重要：自动化研究代理开始进入生成训练数据、执行后训练和验证安全收益的闭环。
- 下一步：把保留基准、能力回归、行为轨迹监控与人工复核设为强制门禁，并跟踪开源框架。
- 来源：[Anthropic 官方研究报告](https://www.anthropic.com/research/automated-researchers-mitigate-alignment-failures)

### 6. SpatialCrafter 从单图构建可探索三维世界

SpatialCrafter 先预测空间对齐的稀疏三维代理，再用视频扩散模型补充高频外观，以减少快速镜头和极端视角下的漂移。

- 优先级：A
- 板块：Interior Design AI、AI 3D / World Models、Frontier Paper / Research
- 重点对象：SpatialCrafter、PaSS Flow
- 为什么重要：可把概念图更直接转为游戏、虚拟摄影、VR 和机器人仿真中的可移动观察空间。
- 下一步：跟踪开源与资产许可，测试能否输出可编辑网格、碰撞体或 CAD/AEC 可用结构。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.27073)；[官方项目页](https://fangchuan.github.io/SpatialCrafter/)

### 7. RefracGS 用折射感知三维高斯重建水下场景

RefracGS 将水面建模为神经高度场、水下对象建模为 3D Gaussian 场，并依据斯涅尔定律联合优化折射边界与场景。

- 优先级：A
- 板块：AI 3D / World Models、Frontier Paper / Research
- 重点对象：RefracGS
- 为什么重要：为常规 3DGS 难以处理的非直线成像提供专门管线，可服务水下检测、测绘和机器人。
- 下一步：等待公开实现与真实水域数据，扩展多界面、散射和动态场景，并验证测量闭环收益。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2603.21695)；[官方项目页](https://yimgshao.github.io/refracgs/)

### 8. TempJail 揭示图生视频的时间维度越狱攻击

TempJail 把危险目标拆为初始帧视觉条件与时间文本指令，使单帧和单句看似无害、跨时间组合后形成危险语义。

- 优先级：A
- 板块：AI Security / Governance、Frontier Paper / Research
- 重点对象：TempJail、图生视频安全
- 为什么重要：视频平台不能只做逐帧或静态提示审查，还需跨帧语义聚合和生成轨迹监控。
- 下一步：建立版本化跨帧安全基准，组合生成前意图检查、生成中监控和生成后时序审核。
- 来源：[arXiv 论文页](https://arxiv.org/abs/2608.26971)；[官方代码仓库](https://github.com/luqi-glory/TempJail)

## 周六｜2026-08-29

### 1. Midjourney 提升 V8.2 图像编辑模型画质

Midjourney 更新 V8.2 编辑模型以改善图像编辑质量，但未披露架构、评测集或量化指标，因此应视为产品质量迭代而非新模型发布。

- 优先级：B
- 板块：AI Product / Model Launch、Interior Design AI、Workflow / Tutorial / Usage Tips
- 重点对象：Midjourney、V8.2 编辑模型
- 为什么重要：图像产品竞争正从一次性出图转向可控编辑与反复修改，直接影响设计返工和工作流迁移。
- 下一步：用身份保持、文字修改、材质替换和复杂遮挡四组固定样例做升级前后盲测。
- 来源：[Midjourney 官方更新](https://updates.midjourney.com/edit-image-quality-update/)

## 周日｜2026-08-30

### 1. OpenAI 停用官方 DALL·E GPT 并转向 ChatGPT Images

OpenAI 按既定计划停用 ChatGPT 中的官方 DALL·E GPT，后续图像创建与编辑转由 ChatGPT Images 承担，用户自建图像 GPT 不受影响。

- 优先级：B
- 板块：AI Product / Model Launch、Workflow / Tutorial / Usage Tips、Market / Business Model
- 重点对象：OpenAI、DALL·E GPT、ChatGPT Images
- 为什么重要：旧式独立图像入口被统一的原生图像工作流取代，影响历史资产保留、培训与操作手册。
- 下一步：确认重要图像已导出，更新团队文档，并比较新旧入口的提示兼容、编辑能力与资产管理。
- 来源：[OpenAI 官方版本说明](https://help.openai.com/en/articles/6825453-chatgpt-release-notes)

## 辅助索引

### 板块计数

> 同一事件可归入多个板块，因此合计会高于 32。

| 板块 | 数量 |
| --- | ---: |
| Financing / Investment | 0 |
| AI Product / Model Launch | 13 |
| AI Agent | 14 |
| AI Security / Governance | 6 |
| AI Coding | 3 |
| AI-CAD / AEC | 3 |
| Interior Design AI | 4 |
| AI 3D / World Models | 12 |
| Workflow / Tutorial / Usage Tips | 7 |
| YouTube / Creator Watch | 0 |
| Market / Business Model | 10 |
| Frontier Paper / Research | 17 |

### 重复重点对象

- Google / Google Cloud / DeepMind：5 条，覆盖语音评估、Agent 计费、视频模型、双盲评估与 Notebook 算力额度。
- OpenAI：4 条，覆盖 Kiro 编程、本地运营、泰国加速器与图像产品入口整合。
- Anthropic / Claude：3 条，覆盖 Salesforce 企业技能、物理硬件标准和自动化对齐研究。
- 三维与世界模型相关对象：12 条，是本周最密集的技术方向。

### GitHub 与工程候选

- `oceanflowlab/AESR`：已核验，https://github.com/oceanflowlab/AESR
- `KLMAV-CUC/DiGS-Avatar`：已核验，https://github.com/KLMAV-CUC/DiGS-Avatar
- `Dongping-Chen/Game2World`：已核验，https://github.com/Dongping-Chen/Game2World
- `maryraymond/PIVOT`：已核验，https://github.com/maryraymond/PIVOT
- `maryraymond/nerfstudio_PIVOT_integration`：已核验，https://github.com/maryraymond/nerfstudio_PIVOT_integration
- `luqi-glory/TempJail`：已核验，https://github.com/luqi-glory/TempJail
- `SubmissionsIn/Stream3D`：仓库已核验，但 v2 代码状态待核验，https://github.com/SubmissionsIn/Stream3D
- MetaRoCE 参考实现、MHS、Hy4 Preview、Grounded-Exo2Ego、FR3D、VideoHarness-RSI、NemoSplat、Spatial-DISE、GaussianDream++、4DStreamCtrl、SpatialCrafter、RefracGS：repo URL 待核验，不猜测地址。

### 建议优先动作

1. 建立统一 Agent 验收表：成功任务成本、权限、跨步骤安全、审计、失败恢复和人工接管。
2. 为三维/世界模型建立真实场景门槛：轨迹覆盖、几何尺度、物理一致、交互延迟、可编辑资产与许可证。
3. 下一轮定向补采融资与创作者信号，并更新长期未刷新的 creator watchlist 时间戳。
