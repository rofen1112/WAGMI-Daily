# ark.insight AI 每周大事件｜2026-09-28—2026-10-04

> 一句话周摘要：本周归档 29 条已入库核验记录，按真实事件日期组织；历史补录与来源限制保留在日报中。

> **运行状态：完整。** 上游日期与七日日报覆盖均通过检查。

## 本周观察（最多 3 条）

### 1. Agent 与业务执行的已核验信号

本周 15 条归档记录涉及 Agent。具体进展与限制见逐条原始来源，不以关键词计数推断统一的市场变化。

**建议动作**：用真实任务验收权限、人工审批、失败恢复、结果质量与单位成功任务成本。

### 2. 安全治理开始覆盖运行中事件，而不只覆盖发布前评测

本周 12 条归档记录涉及权限、安全或治理。该计数基于标题、摘要和标签，不代表事故数量或市场总体规模。

**建议动作**：建立 Agent 事故分级、证据保全、第三方通知、外部写入审批和可撤销机制。

### 3. 多模态与空间智能逐步连接实时交互和物理任务

本周 13 条归档记录涉及视频、3D、空间或具身方向，1 条命中垂直行业关键词。各条目按真实发布日期归档，历史更新和新发表分开理解。

**建议动作**：按真实环境复测延迟、空间推理、物理一致性、引用准确性与数据许可。

## 每日大事件

### 星期一｜2026-09-28

#### 1. 前沿论文：GenNVS 以解耦三维先验提升单图新视角合成

- **简要说明**：GenNVS 分别用 3DGS 建模前景和背景，经粗到细几何优化合成统一场景，再以有效区域掩码和几何感知变形共同约束视频扩散模型。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Product / Model Launch
- **重点对象**：GenNVS；3D Gaussian Splatting；视频扩散；新视角合成
- **为什么重要**：它为电商资产、室内概念图和内容创作中的单图转多视角提供显式几何支撑，并天然支持后续场景编辑。
- **下一步**：关注官方实现与跨类别评测，重点检查大视角变化、遮挡和反射下的结构幻觉，不能把目录中的相关方法仓库当作作者代码。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2609.34579)
- **GitHub / 工程候选**：无新增公开仓库

#### 2. 前沿论文：DIBR-GS 用伪视角监督增强遥感稀疏视图重建

- **简要说明**：DIBR-GS 将单目深度与稀疏 SfM 对齐，并以深度图像渲染逐步生成伪视角，为仅有 3 个输入视角的遥感 3D Gaussian Splatting 增加跨视角几何和外观约束。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models
- **重点对象**：DIBR-GS；3D Gaussian Splatting；遥感重建；Depth Image-Based Rendering
- **为什么重要**：对卫星、无人机测绘和数字孪生中的少视角建模具有直接价值，可减少难以补拍区域的数据采集成本。
- **下一步**：复现前先核对论文链接与仓库 README 中 DIBR-GS/DIR-GS 的命名差异，并验证跨区域泛化、几何误差和大场景资源消耗。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2609.35612) · [论文显式代码仓库](https://github.com/kanehub/DIBR-GS)
- **GitHub / 工程候选**：`kanehub/DIBR-GS`

#### 3. NVIDIA 推出开放式 Agent 安全平台，把策略执行下沉到运行时与硬件

- **简要说明**：NVIDIA Open Agent Safety Platform 由开源 OpenShell 安全运行时和 Sentry 参考设计组成：OpenShell 在 Agent 编排层之外执行文件、网络、凭据与动作策略，Sentry 以 BlueField-4 DPU 的带外监控在毫秒级隔离越界 Agent；Anthropic、Salesforce、SAP 等已公布集成或协作。
- **优先级**：A
- **板块**：AI Security / Governance；AI Agent；AI Coding
- **重点对象**：NVIDIA；Open Agent Safety Platform；OpenShell；Sentry；Anthropic
- **为什么重要**：Agent 安全从提示词和应用层护栏向独立运行时、硬件信任域与可审计策略扩展，适合长时、高权限或实体机器人场景。
- **下一步**：用最小权限沙箱实测 OpenShell 的文件、网络和凭据隔离；将策略审批、审计日志、性能开销和跨平台支持纳入评估。
- **来源链接**：[NVIDIA 官方新闻稿](https://investor.nvidia.com/news/press-release-details/2026/NVIDIA-Launches-Open-Agent-Safety-Platform-to-Secure-Agents-From-Testing-to-Deployment/default.aspx) · [NVIDIA OpenShell 官方仓库](https://github.com/NVIDIA/OpenShell)
- **GitHub / 工程候选**：`NVIDIA/OpenShell`

#### 4. Codex CLI 0.158.0 增强 MCP 凭据、安全连接与透明图像编辑

- **简要说明**：OpenAI 官方 GitHub 于 9 月 28 日发布 Codex CLI 0.158.0，新增带预注册 OAuth 客户端密钥的 MCP 连接、exec-server WebSocket Bearer Token、透明背景图像生成/编辑与更灵活的终端复制粘贴，并修复多项沙箱问题。
- **优先级**：A
- **板块**：AI Coding；AI Agent；AI Security / Governance
- **重点对象**：OpenAI；Codex CLI；MCP；沙箱
- **为什么重要**：版本把 MCP 企业认证、远程执行链路和沙箱可靠性放到同一轮更新，直接影响 Codex 在受管网络、Windows 开发机和高权限自动化中的可部署性。
- **下一步**：在隔离环境回归 OAuth 密钥、WebSocket Token、Windows 路径策略、嵌套可写根与透明图像编辑后再推广。
- **来源链接**：[openai/codex 官方 0.158.0 发布页](https://github.com/openai/codex/releases/tag/rust-v0.158.0)
- **GitHub / 工程候选**：`openai/codex`

### 星期二｜2026-09-29

#### 1. 前沿论文：SplitMoE 为视频扩散打破均匀路由陷阱

- **简要说明**：SplitMoE 将视频生成的专家池拆分为语义专家与通用专家，用原型引导路由和拉推正则替代强制均匀负载，使长尾语义自然聚类，并在相同激活参数预算下改善收敛、路由连贯性和视频质量。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI Product / Model Launch；AI 3D / World Models
- **重点对象**：SplitMoE；视频扩散；Mixture of Experts
- **为什么重要**：它为大规模视频生成和视频世界模型提供更符合时空冗余与语义长尾的稀疏扩展方式，可能在不同比例增加单次激活计算的情况下提升容量。
- **下一步**：等待代码并核验吞吐、显存和长视频稳定性；特别测试专家负载偏斜是否在真实训练中造成热点、退化或难以扩展的通信成本。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2609.38140)
- **GitHub / 工程候选**：无新增公开仓库

#### 2. AMD 约 82 亿美元收购 World Labs，李飞飞将任首席科学家

- **简要说明**：AMD 于美国东部时间 9 月 28 日 16:05 宣布签署协议，以约 82 亿美元全股票交易收购 World Labs；交易预计 2026 年底前完成。完成后 World Labs 继续推进空间智能与世界模型研究，李飞飞将任 AMD 执行副总裁兼首席科学家。
- **优先级**：A
- **板块**：Financing / Investment；AI 3D / World Models；Market / Business Model
- **重点对象**：AMD；World Labs；李飞飞；空间智能；世界模型
- **为什么重要**：这是算力厂商直接并入世界模型研究团队的重大纵向整合，可能让空间智能、机器人仿真和交互式 3D 工作负载更早影响 AMD 的芯片、软件与系统路线。
- **下一步**：跟踪监管审批、团队独立性、World Labs 产品与研究开放策略，以及 AMD Instinct、ROCm 和空间模型训练/推理的联合路线。
- **来源链接**：[AMD 官方新闻稿（GlobeNewswire 托管）](https://www.globenewswire.com/news-release/2026/09/28/3370256/0/en/amd-to-acquire-world-labs-to-advance-the-future-of-ai-compute.html)
- **GitHub / 工程候选**：无新增公开仓库

#### 3. Claude Code 2.1.284 接入 Sonnet 5.5，并调整自动权限与安全边界

- **简要说明**：Anthropic 官方 GitHub 于 9 月 28 日 18:02 UTC 发布 Claude Code 2.1.284：加入 1M 上下文的 Claude Sonnet 5.5 并设为 API 默认 Sonnet，未配置权限模式时默认进入 auto mode，同时加强 MCP 重连、托管插件权限、网关认证、沙箱与 Windows 兼容性。
- **优先级**：A
- **板块**：AI Coding；AI Agent；AI Security / Governance
- **重点对象**：Anthropic；Claude Code；Claude Sonnet 5.5；MCP
- **为什么重要**：模型切换与默认权限策略同时变化，会直接影响团队成本、上下文策略、外部读取审批与企业网关行为。
- **下一步**：升级前固定现有 model 与 permissions.defaultMode，回归外部目录读取、MCP 认证、插件权限、网关身份提供商和 Windows 插件路径。
- **来源链接**：[anthropics/claude-code 官方 2.1.284 发布页](https://github.com/anthropics/claude-code/releases/tag/v2.1.284)
- **GitHub / 工程候选**：`anthropics/claude-code`

#### 4. OpenAI 发布 GPT-6.1 Sol，以更低成本逼近 Astra 复杂任务能力

- **简要说明**：OpenAI 于 9 月 29 日发布 GPT-6.1 Sol。官方模型文档给出 105 万上下文、12.8 万最大输出，并面向复杂编码、计算机使用和专业工作；API 短上下文标准价为每百万输入/输出 token 1/5 美元，长上下文标准价为 2/10 美元。
- **优先级**：A
- **板块**：AI Product / Model Launch；AI Coding；AI Agent；Market / Business Model
- **重点对象**：OpenAI；GPT-6.1 Sol；GPT-6 Astra；Codex；ChatGPT Work
- **为什么重要**：新模型把接近高端模型的 Agent 与编码能力下放到更低成本层，可能改变长时任务的模型路由、预算分配和默认模型选择。
- **下一步**：用真实代码库调查、跨应用任务和长上下文样本与 Astra、GPT-6 Sol 做质量—成本—延迟对照；上线前同步复核系统卡中的网络安全与生物化学风险分级。
- **来源链接**：[OpenAI GPT-6.1 Sol 官方模型文档](https://developers.openai.com/api/docs/models/gpt-6.1-sol) · [OpenAI GPT-6.1 Sol 系统卡增补](https://deploymentsafety.openai.com/gpt-6-1-sol/respecting-auto-review) · [OpenAI API 官方定价页](https://developers.openai.com/api/docs/pricing)
- **GitHub / 工程候选**：无新增公开仓库

#### 5. Codex CLI 0.159.0 增加可中断转向并强化 Windows 与沙箱边界

- **简要说明**：OpenAI 官方 GitHub 于 9 月 29 日 08:05 UTC 发布 Codex CLI 0.159.0。版本新增可选 instant_interrupt，使新输入可在模型响应或长时间 code-mode 调用中转向；同时改进原生 Mermaid、线程历史分页和终端复制，并修复 Windows 后台进程闪窗、显式文件系统拒绝项丢失及可写根下 .aws 目录保护。
- **优先级**：A
- **板块**：AI Coding；AI Agent；AI Security / Governance
- **重点对象**：OpenAI；Codex CLI；instant_interrupt；Windows 沙箱
- **为什么重要**：可中断执行改善长时 Agent 的人机协作，Windows 进程与文件系统修复则直接影响企业开发机上的稳定性和最小权限边界。
- **下一步**：在隔离仓库回归 turn steering、MCP 重连、Windows 子进程、批准命令的拒绝规则和 .aws 保护，再决定团队升级节奏。
- **来源链接**：[openai/codex 官方 0.159.0 发布页](https://github.com/openai/codex/releases/tag/rust-v0.159.0)
- **GitHub / 工程候选**：`openai/codex`

#### 6. Anthropic 启动新一轮 AI 公众访谈，并开放自愿公开完整记录

- **简要说明**：Anthropic 于 9 月 29 日启动“你希望从 AI 获得什么？”研究，面向账户满两周的 Claude 与 Claude Code Free、Pro、Max 用户，用 Anthropic Interviewer 进行约 15 分钟访谈。参与者可在完成后选择公开完整访谈及国家信息；官方同时明确提示再识别和永久传播风险。
- **优先级**：B
- **板块**：AI Security / Governance；YouTube / Creator Watch；Market / Business Model
- **重点对象**：Anthropic；Anthropic Interviewer；Claude；Claude Code
- **为什么重要**：这把产品研究、公众治理信号和可复核开放语料结合起来，也暴露了用户生成研究数据在知情同意、再识别和长期传播方面的治理难题。
- **下一步**：跟踪最终公开数据、样本偏差和政策影响；若借鉴该模式，必须把敏感信息提示、发布前复核、退出删除和再识别风险纳入产品设计。
- **来源链接**：[Anthropic 官方研究说明](https://www.anthropic.com/research/your-thoughts-on-ai)
- **GitHub / 工程候选**：无新增公开仓库

### 星期三｜2026-09-30

#### 1. Claude Code 2.1.285 扩展插件配置、供应商管控与安全修复

- **简要说明**：Anthropic 官方 GitHub 于 9 月 29 日 19:27 UTC（上海时间 9 月 30 日 03:27）发布 Claude Code 2.1.285。版本新增关闭 WebFetch 的环境变量、桌面端目录打开、插件配置命令、MCPB 安装期参数和 allowedProviders 管理策略，并修复 URL 密码脱敏、Artifact 越界发布、PowerShell 权限规则、凭据文件上传检查及大量云会话问题。
- **优先级**：A
- **板块**：AI Coding；AI Agent；AI Security / Governance
- **重点对象**：Anthropic；Claude Code；MCPB；allowedProviders；Artifact
- **为什么重要**：本版同时改变插件部署、模型供应商白名单和多处凭据/权限边界，企业环境的默认行为与安全回归面都显著扩大。
- **下一步**：升级前备份并审计托管设置，重点验证 allowedProviders、WebFetch 禁用、插件 MCP 配置、Artifact 目录权限、PowerShell deny/ask 规则和凭据文件过滤。
- **来源链接**：[anthropics/claude-code 官方 2.1.285 发布页](https://github.com/anthropics/claude-code/releases/tag/v2.1.285)
- **GitHub / 工程候选**：`anthropics/claude-code`

#### 2. Google 发布 Gemini 4 Argon，先向可信网络防御者分阶段开放

- **简要说明**：Google 于 9 月 30 日公布 Gemini 4 Argon，面向复杂长时程编码、法律金融知识工作和网络安全防御。官方给出 100 万 token 上下文与最高 100 万 token 输出，首阶段仅通过 Fairwind Program 向可信网络防御者开放；更广泛 API、企业和消费者可用性仍待后续开放。
- **优先级**：A
- **板块**：AI Product / Model Launch；AI Coding；AI Agent；AI Security / Governance
- **重点对象**：Google；Google DeepMind；Gemini 4 Argon；Fairwind Program
- **为什么重要**：Argon 把超长轨迹、软件工程和自动漏洞修复放在同一前沿模型中，同时采用受控分阶段发布，说明高能力 Agent 的产品竞争正与安全评估、沙箱隔离和推理监控同步推进。
- **下一步**：列入模型能力与治理观察清单；正式可用后重点评测长任务稳定性、代码迁移、间接提示注入和成本，不把宣布误写成已全面上线。
- **来源链接**：[Google 官方发布说明](https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/) · [Google DeepMind 官方模型页](https://deepmind.google/models/gemini/)
- **GitHub / 工程候选**：无新增公开仓库

#### 3. Google DeepMind 推出 SynthID Bio，为 AI 生成蛋白质嵌入可验证水印

- **简要说明**：Google DeepMind 于 9 月 30 日发布 SynthID Bio 概念验证，分别在蛋白质序列和预测三维结构中嵌入不可察觉水印。官方称水印蛋白质在三类靶标的湿实验中保持命中率、结合亲和力和序列多样性，并可把水印写入 AlphaFold 3 的部分扩散网络权重；方法论文、代码、体外数据和研究权重将开放。
- **优先级**：A
- **板块**：AI Security / Governance；AI Product / Model Launch；Frontier Paper / Research
- **重点对象**：Google DeepMind；SynthID Bio；AlphaFold 3；AlphaProteo；ProteinMPNN
- **为什么重要**：这是 AI 生物设计治理从外部元数据走向模型与生物对象内部溯源的重要尝试，可辅助 DNA 合成筛查和数据库完整性，但也引入鲁棒性、移除攻击和跨模型兼容问题。
- **下一步**：跟踪公开代码、权重和独立复现，重点评估恶意篡改、序列改造后的检出率、误报率和对真实生物功能的长期影响。
- **来源链接**：[Google DeepMind 官方研究发布](https://deepmind.google/blog/introducing-synthid-bio/)
- **GitHub / 工程候选**：无新增公开仓库

#### 4. FrameMorrow 用未来需求筛选长视频历史帧

- **简要说明**：FrameMorrow 用少量前瞻 token 预测后续信息需求，再从历史中选择显式帧，在五个基准和 11 个模型上报告长程一致性、画质与动作对齐改善。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI Product / Model Launch；AI Agent；AI 3D / World Models
- **重点对象**：未标注
- **为什么重要**：有望降低长视频和交互世界模型的历史上下文成本，同时保持角色、动作和场景的长程一致性。
- **下一步**：等待代码并测试前瞻预测错误时是否丢失叙事伏笔、角色状态或动作条件。
- **来源链接**：[arXiv](https://arxiv.org/abs/2609.38839)
- **GitHub / 工程候选**：无新增公开仓库

#### 5. Token-World 在 VLM token 空间模拟机器人未来

- **简要说明**：Token-World 不再预测未来 RGB 再重新编码，而是把 VLM 视觉特征压缩为面向策略的紧凑 token 状态，在该空间学习动作条件动力学，再映射回策略输入。实验显示它在长时滚动中保持更好的特征与动作一致性，且模拟延迟更低。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Product / Model Launch
- **重点对象**：未标注
- **为什么重要**：这种路线把世界模型从高成本像素生成转向决策相关表征，可降低机器人策略评估与规划的模拟开销。
- **下一步**：等待项目页开放代码和检查点后，复核跨 VLM 迁移、真实机器人闭环稳定性以及与像素世界模型的公平成本对比。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2610.00575) · [官方项目页](https://chuyaofu.github.io/Token-World/)
- **GitHub / 工程候选**：无新增公开仓库

#### 6. Anthropic 发布机器人工作暴露指数，区分技术可行性与经济替代

- **简要说明**：Anthropic 于 9 月 30 日发布机器人工作暴露指数，用 Claude 对美国职业任务中当前机器人可完成的程度进行带来源评估。研究估计机器人可在某些条件下覆盖约四分之三的体力任务、占 34% 工作时长，但按当前成本仅约 0.3% 的任务具备经济竞争力；结合 LLM 后约 80% 的工作时长存在某种技术暴露。
- **优先级**：B
- **板块**：AI 3D / World Models；AI Security / Governance；Market / Business Model
- **重点对象**：Anthropic；Claude；机器人工作暴露指数；劳动力自动化
- **为什么重要**：该研究把能做与值得自动化分开，提醒企业不要把能力演示直接等同于短期岗位替代，也为具身智能的行业优先级提供任务级视角。
- **下一步**：把暴露指数作为场景筛选而非裁员预测；结合本地工资、集成成本、安全法规和现场改造成本复算可行性，并审查 Claude 任务评级的偏差与来源覆盖。
- **来源链接**：[Anthropic 官方研究页](https://www.anthropic.com/research/what-work-can-robots-do)
- **GitHub / 工程候选**：无新增公开仓库

### 星期四｜2026-10-01

#### 1. Google 在 Gemini Live 上线无障碍视觉辅助 Guided Vision

- **简要说明**：Google 于 10 月 1 日正式推出 Gemini Live 的 Guided Vision，通过实时语音描述、连续追问和取景引导帮助盲人及低视力用户理解周边环境。功能覆盖支持 Gemini Live 的 Android 9 及以上设备，并与 Aira 及超过 1,000 名测试者共同建立安全护栏。
- **优先级**：A
- **板块**：AI Product / Model Launch；AI Security / Governance；Workflow / Tutorial / Usage Tips
- **重点对象**：Google；Gemini Live；Guided Vision；Aira
- **为什么重要**：这不是单次识图，而是把相机、连续对话和主动取景提示组合为实时辅助界面，显示多模态模型正进入高频、强情境的无障碍使用场景。
- **下一步**：关注真实设备的延迟、错误类型和地区可用性；产品设计中明确保留其非导航工具、非医疗设备且不能替代白杖等安全边界。
- **来源链接**：[Google 官方发布说明](https://blog.google/innovation-and-ai/products/gemini-app/guided-vision-gemini-live/)
- **GitHub / 工程候选**：无新增公开仓库

#### 2. ComfyUI 推出可在画布中规划并执行工作流的 Comfy Agent

- **简要说明**：ComfyUI 在 Comfy Cloud 上向所有用户开放 Comfy Agent 测试版，用户可用自然语言让代理规划、搭建、运行和迭代图像或视频工作流。它能理解画布、资产、节点和现有工作流，并支持最多 5 个并行对话；Desktop 版本计划数周后推出。
- **优先级**：A
- **板块**：AI Agent；AI Product / Model Launch；Workflow / Tutorial / Usage Tips
- **重点对象**：ComfyUI；Comfy Agent；Comfy Cloud
- **为什么重要**：创作 Agent 开始直接操作可检查的节点图，而不是只返回成品。这种人与 Agent 共用同一画布的形态，可能显著降低复杂生成工作流的搭建、调试和批量试验成本。
- **下一步**：用真实项目测试节点选择、失败恢复、模型成本和人工中途修改后的同步；避免把云端测试版误写成已在本地桌面版全面可用。
- **来源链接**：[ComfyUI 官方发布文章](https://blog.comfy.org/p/comfy-agent-the-first-agent-for-craft)
- **GitHub / 工程候选**：无新增公开仓库

#### 3. Claude Code 2.1.287 引入可改写深层行为的 Claude Mods

- **简要说明**：Anthropic 于 10 月 1 日发布 Claude Code 2.1.287，新增 Claude Mods，使插件能够修改更深层的运行行为；同时加入可选的“你应该知道”内置 Mod，由侧边 Agent 提醒用户或 Claude 可能忽略的问题。版本还增加 Agent 会话筛选和 MCP URL 提示支持，并修复多项远程、沙箱和权限问题。
- **优先级**：A
- **板块**：AI Coding；AI Agent；AI Security / Governance
- **重点对象**：Anthropic；Claude Code；Claude Mods
- **为什么重要**：Mods 把插件从增加命令和资源推进到影响 Agent 行为与界面，扩展能力更强，也意味着插件审查、权限边界和遥测策略需要同步升级。
- **下一步**：先在隔离环境审计 Mod 的事件监听、工具改写和 UI 权限，再决定是否进入团队默认配置；对内置侧边 Agent 的遥测前提保持明确提示。
- **来源链接**：[Claude Code 官方 v2.1.287 发布页](https://github.com/anthropics/claude-code/releases/tag/v2.1.287) · [Claude Code 官方 changelog](https://github.com/anthropics/claude-code/blob/main/CHANGELOG.md#21287)
- **GitHub / 工程候选**：`anthropics/claude-code`

#### 4. Anthropic 发布 Claude-shaped science 案例与开源科研工具 BootLoops

- **简要说明**：哈佛物理学家 Matthew D. Schwartz 在 Anthropic 官方研究文章中总结三个月内用 Claude 与 BootLoops 推进 18 个领域、36 份手稿的工作方式。BootLoops 1.0 把精确积分、递推证明、贝叶斯证据计算和误差认证等工具连同验收协议开源，强调模型适合承担可计算、可核验的技术工作，而科学价值仍需领域专家判断。
- **优先级**：A
- **板块**：AI Agent；Workflow / Tutorial / Usage Tips；Frontier Paper / Research
- **重点对象**：Anthropic；Matthew D. Schwartz；BootLoops；Claude
- **为什么重要**：它给出一种可复用的科研 Agent 工程模式：工具、验证门槛、独立复核和专家品味分离，避免把模型的自信结论直接当成科学发现。
- **下一步**：评估 BootLoops 的自测试、许可证和可复现示例；借鉴其“结果必须通过独立路线验证”的协议，但不要把案例规模或作者结论泛化为无人监督科研能力。
- **来源链接**：[Anthropic 官方研究文章](https://www.anthropic.com/research/claude-shaped-science) · [BootLoops 官方 GitHub 仓库](https://github.com/BootLoops-ai/bootloops)
- **GitHub / 工程候选**：`BootLoops-ai/bootloops`

#### 5. LiteReality-Agent 把室内扫描变成可仿真数字孪生

- **简要说明**：LiteReality-Agent 将室内重建改写为智能体编程任务：编码智能体调用测量、检索与验证工具，持续编辑并执行 Room.py，把 RGB-D 扫描恢复为带关节、碰撞体和物理属性的室内场景。其观察—编辑—验证闭环同时约束几何、外观、布局与仿真可用性。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI-CAD / AEC；AI Agent
- **重点对象**：未标注
- **为什么重要**：它直接连接室内扫描、数字孪生、机器人 real-to-sim 与 AI-CAD 工作流，可减少从现场采集到可交互仿真资产之间的大量人工建模。
- **下一步**：用真实室内扫描复核几何误差、人工修订时间与仿真迁移收益。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2610.01863) · [官方代码仓库](https://github.com/LiteReality/LiteReality-Agent)
- **GitHub / 工程候选**：`LiteReality/LiteReality-Agent`

### 星期五｜2026-10-02

#### 1. 苹果将因 AI Agent 风险收紧 macOS 完全磁盘访问

- **简要说明**：苹果表示将为 macOS“完全磁盘访问”增加更明确的用户授权控制，并指出自主 AI Agent 会放大这一高权限暴露文件、邮件、消息和浏览历史的风险。
- **优先级**：A
- **板块**：AI Product / Model Launch
- **重点对象**：未标注
- **为什么重要**：操作系统正在把 Agent 的广泛数据访问视为独立安全边界。
- **下一步**：盘点完全磁盘访问依赖，改用最小权限、按任务授权和可撤销审计。
- **来源链接**：[Apple Developer 官方公告](https://developer.apple.com/news/?id=p6zjojqw)
- **GitHub / 工程候选**：无新增公开仓库

#### 2. Meta 开源 Muse Gadgets SDK 并推出 Home Link 设备

- **简要说明**：Meta 开放 ESP32 固件与 Linux SDK，让开发者构建提醒屏、HDMI 棒和触屏设备，并推出连接电视、音箱、灯光和打印机的 Muse Home Link。
- **优先级**：A
- **板块**：AI Product / Model Launch
- **重点对象**：未标注
- **为什么重要**：常驻个人 Agent 正从电脑软件扩展到低成本实体终端和家庭设备。
- **下一步**：在隔离网络审计设备发现、认证、技能权限与升级机制。
- **来源链接**：[官方 GitHub](https://github.com/facebookincubator/muse-gadget-sdk) · [The Verge](https://www.theverge.com/tech/1004330/meta-muse-ai-gadgets-home-link)
- **GitHub / 工程候选**：`facebookincubator/muse-gadget-sdk`

#### 3. Epoch AI 测算未来硬件可支撑数千万至上亿并发 Agent

- **简要说明**：Epoch AI 估算 2025 至 2027 年出货的高带宽内存硬件全部部署后，可能支撑约 3,000 万至 1.7 亿个并发前沿模型 Agent，同时指出对应 API 等价支出可能极高。
- **优先级**：A
- **板块**：AI Product / Model Launch
- **重点对象**：未标注
- **为什么重要**：算力供给可能快于可付费需求增长，Agent 商业模式仍取决于真实工作负载价值。
- **下一步**：用每小时有效任务价值、利用率与单位成功成本建立自己的需求模型。
- **来源链接**：[Epoch AI 官方分析](https://epoch.ai/publications/estimating-the-agent-population)
- **GitHub / 工程候选**：无新增公开仓库

#### 4. OpenAI 发布 GPT-6 家族生产选型与长任务实践指南

- **简要说明**：OpenAI 将 Astra、GPT-6.1 Sol 与 Luna 分别定位于最高难度推理、复杂编程研究与规模化重复任务，并建议以提示词缓存、上下文压缩、推理强度和速度模式平衡效果、成本与延迟。
- **优先级**：A
- **板块**：AI Product / Model Launch
- **重点对象**：未标注
- **为什么重要**：模型选择开始转向按任务难度、成功成本和延迟分层，直接影响 Agent 路由、评测与预算设计。
- **下一步**：建立三类模型的同任务对照，记录成功率、端到端时长与每次成功成本。
- **来源链接**：[OpenAI 官方指南](https://openai.com/index/practical-guide-building-gpt-6/)
- **GitHub / 工程候选**：无新增公开仓库

### 星期六｜2026-10-03

#### 1. 前沿论文：ForeAct3D 用动作约束的未来三维世界模型训练 VLA

- **简要说明**：ForeAct3D 从策略表征解码当前与未来的语义三维场景，让未来状态显式依赖即将执行的动作，并以静态背景、实例刚性和腕部相机运动学约束预测。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI Agent
- **重点对象**：ForeAct3D；VLA；World Model
- **为什么重要**：它把世界模型从与动作脱节的视觉预测推进到策略条件化的三维状态监督，对机器人接触、放置和装配任务更直接。
- **下一步**：优先复现官方代码，并核查真实机器人增益能否跨平台、跨场景保持。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2610.04607) · [论文明确给出的官方代码](https://github.com/anthonytao80-crypto/ForeAct3D)
- **GitHub / 工程候选**：`anthonytao80-crypto/ForeAct3D`

#### 2. 前沿论文：可微分 3DGS-SPH 联通视觉重建、力学仿真与参数反演

- **简要说明**：论文先用多视图建立 3DGS 外观，再独立生成 SPH 力学支撑，并以可微拉格朗日传递把形变映射回高斯参数。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models；AI-CAD / AEC
- **重点对象**：3D Gaussian Splatting；SPH；Digital Twin
- **为什么重要**：这为数字孪生从“看起来像”走向“力学行为可解释、参数可识别”提供了统一链路。
- **下一步**：等待作者代码并验证真实材料、复杂接触和与有限元反演的成本对比。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2610.04336)
- **GitHub / 工程候选**：无新增公开仓库

#### 3. 前沿论文：LoCoSplat 用极简局部上下文实现实时前馈 3DGS

- **简要说明**：LoCoSplat 以细粗两级网格聚合局部点特征，再由仅 0.14M 参数的逐点 MLP 预测高斯属性，省去重型学习式三维网络。
- **优先级**：A
- **板块**：Frontier Paper / Research；AI 3D / World Models
- **重点对象**：LoCoSplat；3D Gaussian Splatting
- **为什么重要**：轻量局部建模可能把高质量前馈 3DGS 推进到实时采集、交互预览和显存受限设备。
- **下一步**：等待官方实现并在消费级 GPU、稀疏视图和复杂室内外场景复现。
- **来源链接**：[arXiv 官方论文页](https://arxiv.org/abs/2610.04351)
- **GitHub / 工程候选**：无新增公开仓库

### 星期日｜2026-10-04

#### 1. Prism 发布原生 2K 音视频联合生成研究与代码

- **简要说明**：Prism 研究用动态稀疏注意力进行高分辨率音视频联合训练，官方代码提供预览权重与训练流程。
- **优先级**：A
- **板块**：AI 3D / World Models；AI Product / Model Launch
- **重点对象**：Prism；Tencent Hunyuan
- **为什么重要**：对音画同步生成和高分辨率制作有直接研究价值。
- **下一步**：独立复测演示真实性、音画同步与训练成本；区分论文指标和可交付能力。
- **来源链接**：[arXiv 原始论文](https://arxiv.org/abs/2610.05416) · [腾讯混元官方代码](https://github.com/Tencent-Hunyuan/Prism)
- **GitHub / 工程候选**：`Tencent-Hunyuan/Prism`

## 辅助索引

### 板块计数（多标签）

| 板块 | 数量 |
|---|---:|
| Financing / Investment | 1 |
| AI Product / Model Launch | 14 |
| AI Agent | 13 |
| AI Security / Governance | 11 |
| AI Coding | 8 |
| AI-CAD / AEC | 2 |
| Interior Design AI | 0 |
| AI 3D / World Models | 12 |
| Workflow / Tutorial / Usage Tips | 3 |
| YouTube / Creator Watch | 1 |
| Market / Business Model | 4 |

### 重复重点对象

- Anthropic：7 条
- 3D Gaussian Splatting：4 条
- Claude Code：4 条
- Claude：3 条
- OpenAI：3 条
- 视频扩散：2 条
- Codex CLI：2 条
- Google：2 条
- Google DeepMind：2 条
- MCP：2 条
- 机器人工作暴露指数：1 条
- 空间智能：1 条
- 劳动力自动化：1 条
- 李飞飞：1 条
- 沙箱：1 条
- 世界模型：1 条
- 新视角合成：1 条
- 遥感重建：1 条
- Aira：1 条
- allowedProviders：1 条
- AlphaFold 3：1 条
- AlphaProteo：1 条
- AMD：1 条
- Anthropic Interviewer：1 条
- Artifact：1 条
- BootLoops：1 条
- ChatGPT Work：1 条
- Claude Mods：1 条
- Claude Sonnet 5.5：1 条
- Codex：1 条

### GitHub / 工程候选

- kanehub/DIBR-GS | verified | https://github.com/kanehub/DIBR-GS
- NVIDIA/OpenShell | verified | https://github.com/NVIDIA/OpenShell
- openai/codex | verified | https://github.com/openai/codex/releases/tag/rust-v0.159.0
- anthropics/claude-code | verified | https://github.com/anthropics/claude-code/releases/tag/v2.1.287
- BootLoops-ai/bootloops | verified | https://github.com/BootLoops-ai/bootloops
- LiteReality/LiteReality-Agent | verified | https://github.com/LiteReality/LiteReality-Agent
- facebookincubator/muse-gadget-sdk | verified | https://github.com/facebookincubator/muse-gadget-sdk
- anthonytao80-crypto/ForeAct3D | verified | https://github.com/anthonytao80-crypto/ForeAct3D
- Tencent-Hunyuan/Prism | verified | https://github.com/Tencent-Hunyuan/Prism

### 覆盖说明

- 上游新鲜度：`data/dev/ai-events-latest.json` 的 `asOf` 为 `2026-10-08`；本次执行日为 `2026-10-08`，因此通过当天门禁。
- 日报覆盖：已有 2026-09-28、2026-09-29、2026-09-30、2026-10-01、2026-10-02、2026-10-03、2026-10-04；缺失 无。
- 运行结论：完整成功。
- 聚合页面只用于发现；正式事件仍保留官方、作者原始或可信媒体链接。
- 统计仅覆盖累计库已有证据；缺失来源与历史时间点不可追溯字段不被伪装为零活动。

