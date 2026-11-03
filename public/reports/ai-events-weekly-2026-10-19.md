# ark.insight AI 每周大事件｜2026-10-12—2026-10-18

> 一句话周摘要：本周 43 条有效事件显示：模型能力正与可持续执行的 Agent 工作流同步推进，安全、追踪和成本成为落地条件，空间智能已有可跟进资产但仍需几何与许可验证。

> **运行状态：周归档完成。** 上游 asOf=2026-10-19，执行日=2026-10-19，日报状态=success；七日日报齐全。本次完整性指本地输入范围内的有效事件归档，来源局限见文末。

## 本周观察

1. **模型发布与 Agent 工作流一同推进，验收要看完整任务**：Argon 全球开放同时覆盖后台任务、机器人和 ADK 优化；Meta、Reflection、NVIDIA 与 DeepSeek 带来不同部署选择。ADK 案例六项提案仅两项上线，说明跑通测试后仍需人工审核与真实兼容检查。 **下一步**：用同一代码库、文档与长链任务对照完成率、人工复核时间、显存和单位成功任务成本；分别核验开放权重、访问申请与许可。

2. **可观测性、跨步骤安全与计费成为 Agent 的基础条件**：Claude 的 OpenTelemetry、跨步骤滥用检测、独立评估访问和编码工具修复，与 DeepSeek 搜索按调用计费、Ramp 融资及 AI 支出管理形成相互关联的工程和商业信号；不能据单家研究推断全行业就业变化。 **下一步**：把权限轨迹、失败恢复、工具成本与人工验收合并记录；提前核算 11 月 1 日起公告指定 DeepSeek 检索调用路径的费用。

3. **空间智能出现可跟进资产，设计生产能力仍需逐项验证**：LongForcing、GreenWAM、DK-VLM、Anchor3DGS 与 EdenLive 更新覆盖长时世界滚动、机器人、空间推理和渲染。Earth AI、Pedra 和购物车提供选址、素材导入及选品参考；这些进展均不能直接证明精确 CAD、BIM 或可编辑室内设计已交付。 **下一步**：优先用灰盒房间和固定相机路径复测 EdenLive，用连续转向室内视频复测 DK-VLM；检查几何误差、闭环一致性、交互延迟和完整组件许可。

## 每日事件归档

日期沿用上游原始事件日；已知精确时刻另列北京时间。先读每天的 A 级标题，再展开简要说明与下一步。

### 星期一｜2026-10-12（3 条）

#### 1. OpenAI 在 Codex 桌面端测试下一条消息预测功能

- **简要说明**：OpenAI 为个人 ChatGPT Pro 用户开放 Composer predictions 测试版：Codex 回复后可按当前线程上下文建议下一条消息，用户按 Tab 接受后仍需自行审阅和发送。
- **优先级**：A
- **板块**：AI 编程；产品 / 模型；工作流 / 技巧 / 教程
- **重点对象**：OpenAI；Codex；Composer predictions
- **为什么重要**：这把智能体交互从“回答当前请求”推进到“预测下一步协作”，但也提高了错误意图补全和上下文隐私边界的重要性。
- **下一步**：在真实长线程中测试建议命中率、误导率与关闭开关，明确预测不会自动发送，也不会主动读取线程外记忆或连接应用。
- **来源链接**：[OpenAI 官方帮助文档](https://help.openai.com/en/articles/20001601-composer-predictions-in-codex)

#### 2. 微软发布 Maia 300 推理系统，计划 2027 年投入生产部署

- **简要说明**：微软官方公布第三代 Azure Maia 推理系统 Maia 300，面向长上下文、低延迟对话和多步智能体任务，预计每兆瓦令牌吞吐较主流 GPU 系统提高 40%，并于 2027 年开始生产部署。
- **优先级**：A
- **板块**：产品 / 模型；AI 基础设施
- **重点对象**：Microsoft；Azure Maia；Maia 300
- **为什么重要**：微软正在把自研芯片、机架网络和云服务协同设计成完整推理平台，推理效率与供应链自主性将直接影响 Azure、Copilot、GitHub 和 Foundry 的规模化成本。
- **下一步**：跟踪 Maia 300 的实际可用区域、模型兼容性与每令牌成本；在官方公开生产数据前，将 40% 和 7 倍指标视为厂商预期而非独立基准。
- **来源链接**：[微软官方博客](https://blogs.microsoft.com/blog/2026/10/12/microsoft-to-expand-azure-maia-system-to-multi-gigawatt-deployments/)

#### 3. Anthropic 披露反蒸馏防御，需关注推理上下文与接口兼容

- **简要说明**：Anthropic 在 10 月 12 日公告中称，推理访问控制、两阶段分类器与账户限制使其测得的推理数据提取量下降约 90% 至 99%。部分合法开发者需要适配 保留推理上下文（preserved thinking），被拦截请求的收费规则也有变化。
- **优先级**：B
- **板块**：安全 / 治理；AI Agent / 智能体
- **重点对象**：Anthropic；Claude
- **为什么重要**：智能体和多模型工作流需明确推理上下文的组织边界，供应商的防滥用策略可能影响调用兼容性与成本。上述效果来自供应商自身测量，并非独立性能保证。
- **下一步**：核对组织间推理传递、上下文编辑与错误处理；以自己的合法请求评估兼容性和成本，不把供应商测量外推为所有攻击场景。
- **来源链接**：[Anthropic 官方研究公告](https://www.anthropic.com/research/distillation-defenses)

### 星期二｜2026-10-13（9 条）

#### 1. Google 复盘 Argon 优化 ADK：六项提案经人工审核仅两项上线

- **简要说明**：Google 在 10 月 13 日工程复盘中介绍 Argon 对约 20.5 万行 ADK Python 代码执行十一小时优化：六项提案中两项经人工审核上线，长会话准备约快 40%，冷导入约快 21%。公开单元测试全部通过也曾遗漏内部兼容问题。
- **优先级**：A
- **板块**：AI 编程；AI Agent / 智能体；工作流 / 技巧 / 教程
- **重点对象**：Google；Gemini 4 Argon；ADK
- **为什么重要**：持续自主优化需要仓库规范、基准与真实兼容性检查共同约束；通过测试和提出补丁不等于可以直接合并部署。性能数字对应该工程案例。
- **下一步**：复核官方 ADK 改动与自己的会话复制、懒加载瓶颈，先保存基准再评估；保留人工代码审核和内部调用方兼容性检查。
- **来源链接**：[Google 开发者官方工程复盘](https://developers.googleblog.com/optimizing-a-200000-line-python-codebase-overnight-with-gemini-4-argon/)
- **工程候选**：google/adk-python（repo URL 待核验）

#### 2. Gemini 4 Argon 面向全球开放，API 上下文与定价同时落地

- **简要说明**：Google 将 Gemini 4 Argon 向开发者、企业和订阅用户全球开放，覆盖 Gemini API、Antigravity、Gemini 应用与搜索 AI Mode；API 提供 100 万统一输入输出令牌上限，首发价为每百万输入 2 美元、输出 10 美元。
- **优先级**：A
- **板块**：产品 / 模型；AI 编程；AI Agent / 智能体；市场 / 商业模式
- **重点对象**：Google；Google DeepMind；Gemini 4 Argon；Google Antigravity
- **为什么重要**：这把此前有限开放的前沿模型转成可采购、可集成的生产能力，并把长任务、智能体编码、科学与企业工作流纳入同一商业入口。
- **下一步**：用真实长链任务评测质量、延迟与续写协议；在 11 月 30 日首发价结束前测算缓存折扣和正式价格下的单位任务成本。
- **来源链接**：[Google 官方发布](https://blog.google/intl/en-mena/product-updates/explore-get-answers/gemini-4-argon-built-to-solve-your-hardest-problems/)
- **工程候选**：google/adk-python（repo URL 待核验）

#### 3. Gemini 4 Argon 进入机器人全流程，支持 从视频到仿真再到真实部署

- **简要说明**：Google 面向机器人开发公布 Argon 的物理推理工作流，覆盖多视角视频、3D 几何、接触力学、Real2Sim、控制代码与仿真验证，并通过 Interactions API 和 google-genai SDK 提供当日接入。
- **优先级**：A
- **板块**：AI 3D / 世界模型；AI Agent / 智能体；产品 / 模型
- **重点对象**：Google；Gemini 4 Argon；Google AI Studio；Google Antigravity
- **为什么重要**：通用前沿模型开始同时承担空间理解、仿真生成和机器人控制代码编排，可能缩短具身项目从视频示范到可验证策略的工程链路。
- **下一步**：在封闭仿真中复测真实设备规格、碰撞约束和闭环稳定性；把 87% ERQA 与七次连续投掷视为官方演示，等待独立复现。
- **来源链接**：[Google Developers 机器人官方说明](https://developers.googleblog.com/en/gemini-4-argon-for-robotics/)

#### 4. Google 公布 Argon 智能体安全栈与实时越权监控

- **简要说明**：Google 为 Gemini 4 Argon 披露分层安全方案：越狱与危险能力防护、尊重系统边界的智能体训练、对未授权绕行的实时监控，以及提示注入防御与外部红队测试。
- **优先级**：A
- **板块**：安全 / 治理；AI Agent / 智能体
- **重点对象**：Google；Google DeepMind；Gemini 4 Argon
- **为什么重要**：长时智能体进入真实系统后，安全重点从输出过滤扩展到轨迹级监控、工具边界和不可逆操作确认，可直接影响企业 Agent 的部署门槛。
- **下一步**：把权限失败后的绕行、外部网页提示注入和不可逆操作确认纳入内部 Agent 红队用例；独立复测厂商报告指标。
- **来源链接**：[Google 官方安全说明](https://blog.google/innovation-and-ai/technology/safety-security/gemini-4-model-safety-security/)

#### 5. Gemini 应用加入后台任务模式与 40 多个应用连接

- **简要说明**：Google 在 Gemini 应用中上线任务切换，允许 Argon 在用户离开电脑后继续执行工作，并接入 40 多个应用；macOS 版同时嵌入 Antigravity 智能体编程界面。
- **优先级**：A
- **板块**：AI Agent / 智能体；产品 / 模型；AI 编程；工作流 / 技巧 / 教程
- **重点对象**：Google；Gemini app；Gemini 4 Argon；Google Antigravity
- **为什么重要**：个人助理从对话入口向跨应用、异步执行和编程工作台合并，产品竞争开始取决于任务完成率、授权边界和生态连接，而不仅是模型问答质量。
- **下一步**：优先测试跨应用任务的确认、撤销、失败恢复和权限提示；记录每类任务的人工接管点与实际完成时间。
- **来源链接**：[Google Gemini 应用官方公告](https://blog.google/innovation-and-ai/products/gemini-app/gemini-4-argon-availability/)

#### 6. Higgsfield 展示超过十分钟的视频工作流，借助智能体调用三维工具

- **简要说明**：OpenAI 的 10 月 13 日客户案例引述 Higgsfield CEO：团队结合 GPT-6 Astra、创意智能体和外部三维建模工具，将教学视频工作流从约一分钟延伸到超过十分钟。语音到电影仍是后续路线，案例未提供独立质量评测。
- **优先级**：A
- **板块**：工作流 / 技巧 / 教程；AI Agent / 智能体；AI 3D / 世界模型
- **重点对象**：Higgsfield；OpenAI；GPT-6 Astra
- **为什么重要**：长视频的一致性可能依赖镜头规划、外部资产工具与多步制作流程，为空间和产品宣传内容提供可测试的工作流方向。
- **下一步**：以已有产品资产测试分镜、角色与场景一致性，记录人工修正、耗时和成本；将十分钟能力视为客户案例主张，不当作所有用户的交付保证。
- **来源链接**：[OpenAI 官方客户案例](https://openai.com/index/higgsfield-longer-videos-voice/)

#### 7. 前沿论文：GreenWAM：让同一机器人世界模型兼顾预测与动作策略

- **简要说明**：GreenWAM 用共享解剖动作坐标统一二十类机器人，联合训练视觉、动作条件和世界动作模式，再分离动作专家生成策略。官方项目展示基于 Cosmos 3 Edge 的训练与基准，并将真实人形策略蒸馏为单步控制。代码页明确提供四个基准检查点及评测代码。
- **优先级**：A
- **板块**：前沿论文 / 研究；产品 / 模型；AI 3D / 世界模型
- **重点对象**：GreenWAM
- **为什么重要**：为跨机器人仿真、动作条件空间预测和物理 AI 提供可跟踪的评测入口；对室内设计的价值是仿真研究参考，并非现成设计工具。
- **下一步**：从官方评测代码复核随机场景与动作坐标适配，关注跨平台零样本能力和真实环境闭环控制。 局限：摘要与官方项目页级阅读，未读全文；项目明确指出桌面高度等几何变化仍敏感、长滚动误差累积；真实评测只有一台人形机器人和一项装袋任务。
- **来源链接**：[arXiv 原始论文](https://arxiv.org/abs/2610.18774) · [作者代码](https://github.com/greenvla/GreenWAM)
- **工程候选**：greenvla/GreenWAM（仓库链接已核验）

#### 8. 前沿论文：LongForcing：用长时教师监督减少世界模型滚动漂移

- **简要说明**：LongForcing 针对短窗口蒸馏无法监督后续自回归状态的问题，以更长时域的双向教师监督学生自行滚动轨迹；保留学生架构和推理成本。摘要报告 VBench 质量分 85.52，第一人称消融中 60 秒动作分提高 23.9 点。24 小时生成只是定性压力测试，不代表全天物理可靠。
- **优先级**：A
- **板块**：前沿论文 / 研究；产品 / 模型；AI Agent / 智能体；AI 3D / 世界模型
- **重点对象**：LongForcing
- **为什么重要**：可为长视频制作、可探索空间与仿真降低时间漂移；对暗壳的长镜头空间展示有潜在价值，尚需真实资产测试。
- **下一步**：跟进作者代码、长时动作遵循和场景身份稳定性，以连续漫游和对象永久性测试评估工程价值。 局限：摘要与作者仓库级阅读，未读全文；24 小时结果没有量化可靠性保证。作者仓库目前仅有标题 README，未发现完整训练或推理实现。
- **来源链接**：[arXiv 原始论文](https://arxiv.org/abs/2610.18289) · [作者代码](https://github.com/Fantasy-AMAP/LongForcing)
- **工程候选**：Fantasy-AMAP/LongForcing（仓库链接已核验，实现待发布）

#### 9. Google Play 允许无开发者账号运行私有 AI 生成应用

- **简要说明**：Google Play 开始在部分市场支持用户用 Google AI Studio 生成 Android 应用，并以普通 Google 账号私密安装到自己的设备，无需开发者账号；后续将支持向亲友分享。
- **优先级**：B
- **板块**：AI 编程；产品 / 模型；市场 / 商业模式
- **重点对象**：Google；Google Play；Google AI Studio；Android
- **为什么重要**：AI 编程的交付链从生成代码延伸到受控安装与分发，降低个人工具的上机门槛，也把安全审核、隐私隔离和从个人应用升级到公开商店的路径前置。
- **下一步**：测试生成应用的签名、权限、更新和数据隔离流程；对面向客户的公开分发继续执行完整开发者审核与质量门槛。
- **来源链接**：[Google Play 官方公告](https://blog.google/products-and-platforms/platforms/google-play/google-play-updates-october-2026/)

### 星期三｜2026-10-14（10 条）

#### 1. Anthropic 加强跨步骤滥用检测，规划权威选举信息接入

- **简要说明**：Anthropic 于 10 月 14 日披露：红队发现模型能拒绝单次有害请求，却可能漏掉拆分为多个正常任务的恶意活动，因此新增多步骤检测分类器。官方投票信息接入计划于本月稍后推出，不能写成已经全面上线。
- **优先级**：A
- **板块**：安全 / 治理；AI Agent / 智能体
- **重点对象**：Anthropic；Claude
- **为什么重要**：多步骤智能体需要检查任务整体目的；单次工具请求正常并不能证明长链执行安全。
- **下一步**：在合法业务评测中加入跨步骤授权与审计，并区分已部署检测改进和计划中的信息接入。
- **来源链接**：[官方原始公告 / 发布说明](https://www.anthropic.com/news/2026-us-midterms)

#### 2. Claude API 开放 OpenTelemetry 测试版，贯通请求与智能体追踪

- **简要说明**：Claude 平台 10 月 14 日发布 OpenTelemetry 导出测试版，覆盖 Messages API 与 Managed Agents 会话；SDK 支持七种语言。官方功能文档区分 SDK 与服务端 span，默认仅导出元数据，完整内容需显式配置。
- **优先级**：A
- **板块**：AI Agent / 智能体；工作流 / 技巧 / 教程；AI 编程
- **重点对象**：Anthropic；Claude API；OpenTelemetry
- **为什么重要**：关联工具、模型、延迟和令牌成本，可支撑长链智能体故障分析和真实流量评测。
- **下一步**：先在测试环境导出元数据，核对工具追踪和令牌去重，再评估完整内容模式的数据保留设置。
- **来源链接**：[官方原始公告 / 发布说明](https://platform.claude.com/docs/en/release-notes/overview) · [官方功能文档](https://platform.claude.com/docs/en/manage-claude/opentelemetry)

#### 3. Earth AI 扩大地理空间智能体早期测试，开放两项基准开发集

- **简要说明**：Google Research 于 10 月 14 日发布地理空间推理技术报告及 GeoKTools、GeoExpertQueries 开发集，并扩大 Ask Google Earth 和 A2A 服务的实验性早期访问。系统结合专用模型、空间工具与预先规划，尚未向所有用户全面开放。
- **优先级**：A
- **板块**：AI Agent / 智能体；AI-CAD / 建筑工程
- **重点对象**：Google Research；Earth AI；Ask Google Earth
- **为什么重要**：选址、基础设施规划与环境分析需要可复核的空间计算；官方将复杂分析输出定位为专家审查的初稿。
- **下一步**：申请早期测试，以授权选址数据核对空间工具调用、规划步骤和结果可复现性；区分自动评分与最终答案正确性。
- **来源链接**：[官方原始公告](https://research.google/blog/putting-earth-ai-to-work-geospatial-agents-for-our-planets-biggest-challenges/)
- **工程候选**：google-research/geospatial-reasoning-benchmarks（repo URL 待核验）

#### 4. Google 公开 Deep Review 文档审查，提供每周两次免费额度

- **简要说明**：Google Research 于 10 月 14 日公开 Deep Review，将论文反馈扩展至复杂技术文档的逻辑、数学与事实核验。初始支持 PDF 和纯文本，每人每周两次免费审查，可连接 Gemini API 密钥提高用量；多文件输入仍待推出。
- **优先级**：A
- **板块**：AI Agent / 智能体；工作流 / 技巧 / 教程
- **重点对象**：Google Research；Deep Review；Antigravity
- **为什么重要**：分段、预算分配、并行核验与综合反馈可为研发文档建立可追溯的质量检查；最终判断仍由人工负责。
- **下一步**：用脱敏技术方案评估发现问题的准确率与引用覆盖；上传前核对一年存储政策，不把自动反馈当作正式同行评审。
- **来源链接**：[官方原始公告](https://research.google/blog/analyzing-technical-documents-with-deep-review/)

#### 5. Anthropic 开设新加坡办公室，与政府签署安全评估合作备忘录

- **简要说明**：Anthropic 于 10 月 14 日宣布其第五个亚太办公室在新加坡开业，并与政府签署合作备忘录，覆盖安全、模型评估和负责任采用。公告称 GovTech 已有超过 1,500 名工程及技术人员使用 Claude Code。
- **优先级**：B
- **板块**：市场 / 商业模式；安全 / 治理；AI 编程
- **重点对象**：Anthropic；GovTech Singapore；Claude Code
- **为什么重要**：本地服务、评测标准和受监管行业采用成为企业 AI 竞争要素；合作备忘录不代表新增模型或融资。
- **下一步**：跟踪区域推理、评测与事故响应要求，并用自己的交付指标核验代码工具价值。
- **来源链接**：[官方原始公告 / 发布说明](https://www.anthropic.com/news/singapore-office-opening)

#### 6. Claude Managed Agents 的定时部署扩展至 AWS 平台

- **简要说明**：Claude 平台 10 月 14 日发布说明确认 Managed Agents 定时部署现已支持 Claude Platform on AWS；功能文档提供创建、管理与运行说明。这是已有能力的平台扩展，不是首次推出全部定时功能。
- **优先级**：B
- **板块**：AI Agent / 智能体；市场 / 商业模式
- **重点对象**：Anthropic；Claude Managed Agents；AWS
- **为什么重要**：企业可在既有云环境使用周期智能体流程，可靠运行仍依赖预算、授权和会话检查。
- **下一步**：核对 AWS 区域、权限与账户可用性，用低频任务检查运行记录、失败恢复和费用。
- **来源链接**：[官方原始公告 / 发布说明](https://platform.claude.com/docs/en/release-notes/overview) · [官方功能文档](https://platform.claude.com/docs/en/managed-agents/scheduled-deployments)

#### 7. Google 与新加坡研究端侧反诈骗模型，分阶段接入应用

- **简要说明**：Google DeepMind 于 10 月 14 日介绍与 GovTech 微调的端侧 Gemma 模型：先用轻量分类器筛查，再分析多轮对话。部署将分阶段推进并要求用户同意；政府和 Google 不通过该部署读取对话，尚无面向所有用户的上线日期。
- **优先级**：B
- **板块**：产品 / 模型；安全 / 治理
- **重点对象**：Google DeepMind；GovTech Singapore；Gemma
- **为什么重要**：本地语境微调、两级推理与端侧隐私结合，为敏感数据场景提供研究参考。
- **下一步**：跟进误报、设备功耗和语言覆盖评测，将研究合作与具体应用可用性分开记录。
- **来源链接**：[官方原始公告 / 发布说明](https://deepmind.google/blog/on-device-ai-scam-detection-mddi/)

#### 8. Pedra 支持房源链接导入，缩短 AI 房产视频的素材准备

- **简要说明**：Pedra 在 10 月 14 日发布房源链接导入，可从多个欧洲平台及中介网站读取完整照片、价格、面积和房间等信息并用于视频。官方称耗时 1 至 3 分钟，免费方案每日 5 次、Pro 每日 100 次；这些数字尚未独立实测。
- **优先级**：B
- **板块**：室内设计 AI；工作流 / 技巧 / 教程；市场 / 商业模式
- **重点对象**：Pedra
- **为什么重要**：空间内容工具也通过素材接入改善工作效率，已有房源进入视频可减少重复上传与录入。
- **下一步**：用授权房源测试字段准确率、照片完整性和站点失败率；不把数据导入当成三维几何生成。
- **来源链接**：[官方原始公告 / 发布说明](https://pedra.ai/releases/import-property-from-listing-link)

#### 9. Salience Labs 完成 1.25 亿美元 B 轮融资，推进 AI 光互连量产

- **简要说明**：Salience Labs 于 10 月 14 日宣布完成 1.25 亿美元 B 轮融资，由 Bullhound Capital 领投，AMD Ventures、Intel Capital 等参与。资金用于光电路交换部署、扩大批量制造和硅谷业务；未来端口规模路线不代表已交付。
- **优先级**：B
- **板块**：融资 / 投资；市场 / 商业模式
- **重点对象**：Salience Labs；Bullhound Capital；AMD Ventures；Intel Capital
- **为什么重要**：光交换融资反映 AI 集群网络瓶颈的产业投入；金额和厂商预测不能证明具体推理成本已下降。
- **下一步**：跟踪量产、客户部署及系统级功耗证据，将技术路线与实际采购回报分开评估。
- **来源链接**：[官方原始公告 / 发布说明](https://www.saliencelabs.ai/salience-labs-125-million-series-b-funding/)

#### 10. Paper Instruments 发布 Ultramarine 工作模型研究，聚焦非可验证任务强化学习

- **简要说明**：Paper Instruments 于 10 月 14 日介绍基于 GLM-5.3 Flash 后训练的 Ultramarine 1 Flash，研究面向金融、法律、咨询和运营的合成任务与评分标准。官方报告六项知识工作基准平均提高 4.1 分、输出令牌减少 6.5%；这些是厂商评测，不能外推为通用成本收益。
- **优先级**：B
- **板块**：AI Agent / 智能体；产品 / 模型
- **重点对象**：Paper Instruments；Ultramarine 1 Flash；GLM-5.3 Flash
- **为什么重要**：复杂文档与业务智能体的评价依赖清晰、可检查的任务标准；开放基础模型不等于已核验发布模型权重。
- **下一步**：复核加权评分工具与自身文档样本；分别核验模型访问、许可和任务成本，不采用聚合摘要中的开源或六十倍泛化结论。
- **来源链接**：[官方原始公告](https://www.paperinstruments.com/blog/ultramarine)
- **工程候选**：paper-instruments/rubric（repo URL 待核验）

### 星期四｜2026-10-15（11 条）

#### 1. Anthropic 向 METR 独立评估团队提供近似员工级访问

- **简要说明**：Anthropic 10 月 15 日宣布，已为六名 METR 员工提供硬件、办公空间及接近内部风险评估团队的工具权限。METR 可发布风险评估，Anthropic 不能否决发布，但可要求删除预先定义的敏感信息；客户数据等类别不在通常共享范围内。
- **优先级**：A
- **板块**：安全 / 治理；市场 / 商业模式
- **重点对象**：Anthropic；METR
- **为什么重要**：前沿模型的可信评估正从外部接口测试扩展到内部过程审查。独立发表权与有限删改边界需要结合实际报告观察，不能把合作本身当作模型安全认证。
- **下一步**：跟踪 METR 的评估结果、删改披露与访问边界，将第三方审计能力加入企业模型采购标准。
- **来源链接**：[官方原始公告 / 作者原创页面](https://www.anthropic.com/news/an-update-on-independent-evaluators)
- **已知精确发布时间（北京时间）**：2026-10-16 01:20:00；归档日保留上游事件日 2026-10-15。

#### 2. Meta 发布 Muse Spark Open 多模态开放权重模型，访问需申请

- **简要说明**：Meta 的 Muse Spark Open 于 10 月 15 日发布。Hugging Face 原始集成文章记录其约 8160 亿总参数、每 Token 激活约 420 亿参数，接受文本、图像、音频和视频并输出文本。官方模型元数据列出 BF16 权重及自定义 Muse 许可，当前访问为人工审批；本次未下载权重或实测性能。
- **优先级**：A
- **板块**：产品 / 模型；AI Agent / 智能体；AI 编程
- **重点对象**：Meta；Muse Spark Open；Hugging Face
- **为什么重要**：面向编码和多模态 Agent 的开放权重选择扩大，但总体内存开销仍由全部专家权重决定，不能把激活参数规模等同于部署占用，也不能将自定义许可称为完全开源。
- **下一步**：先评估访问条件、显存与上下文成本；对官方许可列出的署名及 Model as a Service 收入门槛逐项审阅，再决定是否进入内部评测。跟踪 SGLang 等公开推理路径。
- **来源链接**：[官方发布方模型元数据与许可](https://huggingface.co/api/models/meta-models/Muse-Spark-Open-816B-A42B) · [Hugging Face 原始集成说明](https://huggingface.co/blog/meta-muse-spark-open)
- **工程候选**：sgl-project/sglang（repo URL 待核验）

#### 3. NVIDIA 发布 Nemotron 3.5 Super VL 与本地 Bolt 模型

- **简要说明**：NVIDIA 于 10 月 15 日发布 1200 亿参数 Nemotron 3.5 Super VL，以及面向 24GB 显存环境的 Bolt 74B-A9B。两者已可用；面向 4GB 环境的 Bolt E4B 计划 10 月 23 日提供。官方给出的性能领先结论依赖其基准条件，开放权重仍需逐项确认许可证。
- **优先级**：A
- **板块**：产品 / 模型；AI Agent / 智能体；AI 编程；AI-CAD / 建筑工程
- **重点对象**：NVIDIA；Nemotron 3.5；Dassault Systèmes
- **为什么重要**：企业文档 Agent 与本地运行出现更明确的模型分层，需比较工具调用、视觉文档理解、显存与端到端成本。公告提及达索系统用于工程设计和仿真，但不能据此认定新增 CAD 产品已交付。
- **下一步**：优先核对模型卡、授权、量化质量和同等显存下的任务成功率；跟踪官方公告明确提及的 ms-swift 适配。
- **来源链接**：[官方原始公告 / 作者原创页面](https://blogs.nvidia.com/blog/nemotron-3-5-super-vl/)
- **已知精确发布时间（北京时间）**：2026-10-15 23:00:24；归档日保留上游事件日 2026-10-15。
- **工程候选**：modelscope/ms-swift（repo URL 待核验）

#### 4. Ramp 融资 18.5 亿美元，将 AI 支出管理纳入财务平台

- **简要说明**：Ramp 10 月 15 日在公司新闻稿宣布完成 18.5 亿美元融资，Dragoneer 领投，估值 600 亿美元；公司称年化收入超过 20 亿美元，并列举 AI Token 支出管理、模型无关工作区和推理路由等近期产品。融资和收入均按公司披露口径记录。
- **优先级**：A
- **板块**：融资 / 投资；市场 / 商业模式；AI Agent / 智能体
- **重点对象**：Ramp；Dragoneer Investment Group
- **为什么重要**：企业 AI 的商业价值开始同时围绕完成工作与控制每美元、每令牌的成本，支出治理可成为模型之上的独立平台能力。年化收入不是全年已实现收入。
- **下一步**：评估按团队、模型和 API 密钥归集成本的可行性，并以真实账单测试路由节省；不直接套用新闻稿的最高节省比例。
- **来源链接**：[官方原始公告 / 作者原创页面](https://www.prnewswire.com/news-releases/ramp-reaches-60-billion-valuation-as-annualized-revenue-tops-2-billion-302909315.html)
- **已知精确发布时间（北京时间）**：2026-10-15 19:00:00；归档日保留上游事件日 2026-10-15。

#### 5. 前沿论文：Anchor3DGS：以紧凑三维锚点替代逐像素高斯预测

- **简要说明**：Anchor3DGS 在无需输入相机位姿的前馈重建中，按信息熵分配三维锚点，通过遮挡感知特征聚合和锚点交互生成局部高斯，再增强渲染图像。作者报告以少一个数量级的高斯取得有竞争力的新视角质量。
- **优先级**：A
- **板块**：前沿论文 / 研究；AI 3D / 世界模型
- **重点对象**：Anchor3DGS
- **为什么重要**：可为室内扫描预览及云端资产生成降低表示存储和传输负担，值得与稀疏视角重建方案对照。
- **下一步**：优先比较同等画质下的高斯数量、峰值显存和房间级几何误差；无明确官方仓库链接时保留代码待核验。 局限：摘要级；减少一个数量级是作者的基准结论，未核查各数据集误差、真实房间尺寸、透明物体与工程时延，也未复现。
- **来源链接**：[arXiv 原始论文](https://arxiv.org/abs/2610.21634)

#### 6. 前沿论文：DK-VLM：把三维几何作为位置融入空间推理注意力

- **简要说明**：DK-VLM 用双核注意力保留预训练语义位置编码，并让几何核利用估计三维点及相机位姿直接调制注意力，经门控融合。参考系组合监督训练模型在连续转向中更新判断；作者报告八十亿参数版本在多项空间基准取得较好成绩。
- **优先级**：A
- **板块**：前沿论文 / 研究；AI 3D / 世界模型；产品 / 模型
- **重点对象**：DK-VLM
- **为什么重要**：可评估室内视频问答、空间关系检索和导航助手在转身后的方位判断可靠性。
- **下一步**：用真实房间连续转向视频检验累积方位误差，并比较几何估计失真、门控行为和多步推理成本。 局限：摘要及项目页、仓库说明级；VSI-Bench 74.33 与 ReVSI-32 58.28 为作者结果。前端需要申请获取的 VGGT-Omega 权重，基座与适配器须分别准备；未运行推理或独立复测。
- **来源链接**：[arXiv 原始论文](https://arxiv.org/abs/2610.22356) · [作者代码](https://github.com/sumuru789/DK-VLM)
- **工程候选**：sumuru789/DK-VLM（仓库链接已核验）

#### 7. Google 介绍用圈选即搜识别可疑短信的操作流程

- **简要说明**：Google 10 月 15 日发布官方使用说明：在兼容 Android 设备中长按主页键或导航条打开 Circle to Search，圈选可疑短信后查看 AI Overview 的提示与建议。发现风险信号时可考虑删除短信并屏蔽号码，页面并未承诺识别所有诈骗。
- **优先级**：B
- **板块**：安全 / 治理；工作流 / 技巧 / 教程；产品 / 模型
- **重点对象**：Google；Circle to Search
- **为什么重要**：反诈能力正嵌入已有手机交互，但辅助判断仍需用户确认，不应把模型提示直接视为可信身份认证。
- **下一步**：测试中文短信、图片文字和误报样本，核对设备及地区可用性；对敏感内容评估权限与隐私提示。
- **来源链接**：[官方原始公告 / 作者原创页面](https://blog.google/innovation-and-ai/technology/safety-security/circle-to-search-android-text-message-scams/)
- **已知精确发布时间（北京时间）**：2026-10-16 01:30:00；归档日保留上游事件日 2026-10-15。

#### 8. Google 新闻 AI 试点扩展至逾 400 家出版物

- **简要说明**：Google 10 月 15 日称，其 News AI 试点已有全球超过 400 家出版物参加。公司通过许可计划向参与方付费，用增强内容开发深度文章概览及可定制音频简报，并提供署名与原文链接。
- **优先级**：B
- **板块**：市场 / 商业模式；产品 / 模型
- **重点对象**：Google；Google News
- **为什么重要**：AI 内容服务的竞争逐渐包含授权采购、出处展示与出版方关系；公告没有披露各家协议金额或收益分成。
- **下一步**：在资讯产品中保留可核查原文、授权范围与访问边界，分开评估内容许可成本和模型推理成本。
- **来源链接**：[官方原始公告 / 作者原创页面](https://blog.google/products-and-platforms/products/news/news-ai-pilot-update-publishers/)
- **已知精确发布时间（北京时间）**：2026-10-16 00:00:00；归档日保留上游事件日 2026-10-15。

#### 9. Google AI 搜索强化原文链接、官方网站入口与创作者来源

- **简要说明**：Google 10 月 15 日宣布调整 AI Mode 和 AI Overviews：让正文链接更频繁地出现在回答上方，将新闻轮播扩展到更多地区和语言，并强化相关报道入口。官方网站专区与可点击的创作者资料仍处于测试阶段，不能把所有改动都说成已全面上线。
- **优先级**：B
- **板块**：产品 / 模型；AI Agent / 智能体；工作流 / 技巧 / 教程
- **重点对象**：Google；AI Mode；AI Overviews
- **为什么重要**：AI 答案正在增加可追溯的原始页面与来源身份信息，对研究 Agent、内容分发和设计工具的证据展示具有直接参考价值。
- **下一步**：比较检索答案中的来源覆盖、任务入口准确性和原文点击路径；产品评估中将测试能力与已上线范围分开记录。
- **来源链接**：[Google 官方原始公告](https://blog.google/products-and-platforms/products/search/updates-ai-mode-overviews-explore-web/)
- **已知精确发布时间（北京时间）**：2026-10-16 00:00:00；归档日保留上游事件日 2026-10-15。

#### 10. Google 在美国推出跨商户 Universal Cart 购物车

- **简要说明**：Google 10 月 15 日宣布 Universal Cart 开始在美国的搜索与 Gemini 应用推出，支持跨商户保存商品、跟踪降价及补货、查找优惠和完成付款。官方明确将购物车定位为让用户组织购物并保留控制权的工具，不能等同于完全自主下单 Agent。
- **优先级**：B
- **板块**：市场 / 商业模式；产品 / 模型；室内设计 AI
- **重点对象**：Google；Gemini；Universal Cart
- **为什么重要**：AI 商业入口正连接发现、收藏、优惠和结算。对家居选品可借鉴跨商户清单，但库存、价格、授权和最终支付需要可见确认。
- **下一步**：跟踪美国上线范围与 UCP 商户支持，比较跨渠道商品标识、报价时效和支付确认流程，不假设中国地区可用。
- **来源链接**：[官方原始公告 / 作者原创页面](https://blog.google/products-and-platforms/products/shopping/universal-cart-launch/)
- **已知精确发布时间（北京时间）**：2026-10-15 21:00:00；归档日保留上游事件日 2026-10-15。

#### 11. Simon Willison 展示用 Claude Code 构建手机声学联机小游戏

- **简要说明**：Simon Willison 10 月 15 日发布 Chirp Pong 原创案例，描述用 Claude Code 与 Opus 5.5 Extra 生成静态网页小游戏，让两部手机通过麦克风接收的声音交换状态，并公开试玩入口。作者称实验可工作，本次未做双机实测，也未独立确认所有设备的可用性。
- **优先级**：B
- **板块**：作者 / 频道信号；AI 编程；工作流 / 技巧 / 教程
- **重点对象**：Simon Willison；Claude Code；Chirp Pong
- **为什么重要**：该实践展示将明确的交互目标、浏览器能力和可试玩产物组合成可审查的编码任务。单个演示不能证明普遍的一次生成成功率或生产可靠性。
- **下一步**：在取得麦克风权限后，用两台设备测试噪声、延迟和浏览器差异；未发现明确官方代码仓库 URL，保持待核验。
- **来源链接**：[官方原始公告 / 作者原创页面](https://simonwillison.net/2026/Oct/15/chirp-pong/)
- **已知精确发布时间（北京时间）**：2026-10-16 03:47:52；归档日保留上游事件日 2026-10-15。

### 星期五｜2026-10-16（7 条）

#### 1. Codex CLI 0.163.0 加入配置搜索与即时任务引导

- **简要说明**：官方稳定版 0.163.0 于 UTC 10 月 15 日 21:30 发布，即上海时间 10 月 16 日 05:30。该版新增 /config 设置搜索和即时生效提示，支持响应中发送后续消息引导任务，并在中断时停止活动 Code Mode 单元及嵌套工具调用；同时修复恢复会话的权限保留和代理网络检查。
- **优先级**：A
- **板块**：AI 编程；AI Agent / 智能体；工作流 / 技巧 / 教程；安全 / 治理
- **重点对象**：OpenAI；Codex CLI
- **为什么重要**：长任务的中断、续跑和设置可见性直接影响编码 Agent 的可控性；版本说明明确区分需重启的设置和即时变更。
- **下一步**：先在隔离项目验证中断、恢复审批、Windows 粘贴及后台命令退出；默认 Daybreak 仅适用于符合资格的账号，勿假设全量开放。
- **来源链接**：[官方原始公告 / 作者原创页面](https://github.com/openai/codex/releases/tag/rust-v0.163.0)
- **已知精确发布时间（北京时间）**：2026-10-16 05:30:38；归档日保留上游事件日 2026-10-16。
- **工程候选**：openai/codex（仓库链接已核验）

#### 2. Reflection 正式开放 Beam 权重，支持自托管编码与 Agent 工作流

- **简要说明**：Reflection 在 10 月 16 日官方公告中宣布发布 Beam 权重，模型采用约 501B 总参数、23B 激活参数的 MoE 架构，提供 BF16、FP8 与 NVFP4 格式。官方模型卡列出 Apache 2.0 许可、文本输入输出与百万 token 上下文；本次匿名元数据确认权重仓库公开且无申请门槛。此前模型介绍与本次权重开放分开记录，官方性能结果未做本地复测。
- **优先级**：A
- **板块**：产品 / 模型；AI 编程；AI Agent / 智能体
- **重点对象**：Reflection；Beam
- **为什么重要**：为编码、设计工具编排和长任务 Agent 增加可自托管的模型选择；大参数规模和长上下文带来的显存与推理成本仍需单独评估。
- **下一步**：先依据官方模型卡评估许可、部署硬件与工具调用协议，再以自有任务比较质量、延迟和成本；不把开放权重等同于训练数据或完整训练流程公开。
- **来源链接**：[Reflection 官方权重开放公告](https://reflection.ai/blog/beam-is-available) · [Reflection 官方模型卡与权重](https://huggingface.co/reflection/Beam-1.0-501B-A23B)
- **工程候选**：vllm-project/vllm（repo URL 待核验）；sgl-project/sglang（repo URL 待核验）

#### 3. Anthropic 就业研究：Agent 工时增长，人类注意力成为瓶颈

- **简要说明**：Anthropic 10 月 16 日公布内部就业研究：到八月，员工直接使用的交互式 Agent 工时约为员工工时的六倍，初级技术岗位招聘占比从 27% 降至 9%。研究以会话运行时间估计 Agent 工时、以每周四十小时估计人类工时；公司仍在扩张，不能将岗位占比下降说成技术岗位绝对裁撤，也不能把观测关联视为因果证明。
- **优先级**：A
- **板块**：AI Agent / 智能体；AI 编程；市场 / 商业模式
- **重点对象**：Anthropic；Claude
- **为什么重要**：AI 原生团队的成本与组织约束正在转向监督、验收和注意力分配；室内设计与研发团队可据此检验自己的 Agent 产出是否真正减轻人工复核负担。
- **下一步**：记录每项任务的 Agent 运行、人工验收、返工和结果质量，区分代码量、有效交付与业务价值；不要把单家 AI 实验室的招聘结构外推为全行业规律。
- **来源链接**：[官方原始公告与研究正文](https://www.anthropic.com/research/employment-at-anthropic)
- **已知精确发布时间（北京时间）**：2026-10-17 00:26:00；归档日保留上游事件日 2026-10-16。

#### 4. Claude Code 2.1.301 强化无人值守退出与权限决策观测

- **简要说明**：官方 2.1.301 于上海时间 10 月 16 日 03:22 发布，允许限制无人值守重试等待用量重置的时长，并在 OpenTelemetry 工具决策事件中补充分类结果、权限模式及可选规则分类。修复项包括退出时未询问就移除可能含未推送提交的工作树，以及搜索程序失败却被报告为无匹配。
- **优先级**：B
- **板块**：AI 编程；AI Agent / 智能体；安全 / 治理；工作流 / 技巧 / 教程
- **重点对象**：Anthropic；Claude Code
- **为什么重要**：无人值守编码需要区分用量等待、权限拒绝和工具故障，避免把空结果或遗漏步骤当成任务成功。
- **下一步**：升级前备份工作树，配置等待预算并检查可观测字段；对低上下文切换和搜索失败建立回归样例。
- **来源链接**：[官方原始公告 / 作者原创页面](https://github.com/anthropics/claude-code/releases/tag/v2.1.301)
- **已知精确发布时间（北京时间）**：2026-10-16 03:22:06；归档日保留上游事件日 2026-10-16。
- **工程候选**：anthropics/claude-code（仓库链接已核验）

#### 5. Claude 溯源 NIST 椭圆曲线种子，官方给出可复现代码

- **简要说明**：Anthropic 10 月 16 日称，内部研究模型在不到半小时内识别出 NIST 五条素数域曲线种子的生成方式：由 Unix 时间戳初始化的 lrand48 伪随机数生成器。官方文章给出参数和复现程序，同时说明 B-163 种子及部分基点仍未解释；这不是 ECDSA 被破解或出现新攻击。
- **优先级**：B
- **板块**：AI Agent / 智能体；安全 / 治理；AI 编程
- **重点对象**：Anthropic；Claude；NIST
- **为什么重要**：案例展示研究 Agent 如何提出可计算假设并通过完整数值匹配验证，适合作为证据驱动研究流程的参考。
- **下一步**：复核原文给出的重现程序和未解边界，将提出假设、验证输出与最终结论分别留痕；现有签名部署无需因此变更。
- **来源链接**：[官方原始公告与研究正文](https://www.anthropic.com/research/ecdsa-curve-origins)
- **已知精确发布时间（北京时间）**：2026-10-17 01:02:00；归档日保留上游事件日 2026-10-16。

#### 6. Claude Code 2.1.302 增加自动模式模型配置并修复工具边界

- **简要说明**：官方 Release 记录显示，Claude Code 2.1.302 于 UTC 10 月 16 日 20:53 发布，新增客户端自动模式分类器模型配置和闲时压缩开关，修复图像文件过大造成的读取风险、切换云提供商后的请求错误，以及部分 MCP 协议兼容和插件设置写入问题。配置项不改变服务端自动模式的模型。
- **优先级**：B
- **板块**：AI 编程；AI Agent / 智能体；安全 / 治理
- **重点对象**：Anthropic；Claude Code
- **为什么重要**：编码 Agent 的可控性与可观测性持续细化，模型路由、压缩和工具读取边界直接影响长期任务的稳定性。
- **下一步**：在测试项目核查自动模式分类器、压缩、MCP 和插件配置持久化；版本日志属于发布方陈述，本批次未安装或实测。
- **来源链接**：[官方原始公告与研究正文](https://github.com/anthropics/claude-code/releases/tag/v2.1.302)
- **已知精确发布时间（北京时间）**：2026-10-17 04:53:06；归档日保留上游事件日 2026-10-16。
- **工程候选**：anthropics/claude-code（仓库链接已核验）

#### 7. Google 分享 Gemini Notebook 的三类资料学习工作流

- **简要说明**：Google 10 月 16 日发布使用指南，介绍用六十秒短视频概览快速理解概念、用交互学习概览串联摘要与测验，以及通过简答、多选和填空练习查找知识缺口。正文称这些能力近期推出，本批次将其归为当日教程信号，不宣称所有功能于当天首次上线。
- **优先级**：B
- **板块**：工作流 / 技巧 / 教程；产品 / 模型
- **重点对象**：Google；Gemini Notebook
- **为什么重要**：资料驱动的摘要、提问和反馈闭环，可用于设计规范、产品手册与团队培训材料的学习方案验证。
- **下一步**：使用自有资料对比概览与原文的一致性，检查问答可追溯性和错误反馈；按实际账号可用范围验证，避免直接认定所有地区均已开放。
- **来源链接**：[官方原始公告与研究正文](https://blog.google/innovation-and-ai/products/gemini-notebook/three-tips-study-gemini-notebook/)
- **已知精确发布时间（北京时间）**：2026-10-17 00:00:00；归档日保留上游事件日 2026-10-16。

### 星期六｜2026-10-17（2 条）

#### 1. DeepSeek 更新 V4.1-Flash-1017，优化编程与三维项目生成

- **简要说明**：DeepSeek 10 月 17 日将网页、应用和 API 更新至 V4.1-Flash-1017，API 仍使用 deepseek-flash，模型调用方式和定价不变。官方表示通过自反馈强化学习提升完整项目开发，并针对 Harness、CodeBuddy 和 WorkBuddy 优化执行效率；模型卡标注 MIT，提供权重与推理说明。Terminal-Bench 4.0 从 31.2 升至 42.3、DeepSWE 从 74.2 升至 77.0 均为官方测试结果。
- **优先级**：A
- **板块**：产品 / 模型；AI 编程；AI Agent / 智能体；AI 3D / 世界模型
- **重点对象**：DeepSeek；DeepSeek Harness；CodeBuddy；WorkBuddy
- **为什么重要**：可用较小迁移成本评估同一模型后端在编程智能体和三维交互内容生成中的质量、费用及耗时变化；演示案例不代表可靠 CAD 或真实尺寸建模能力。
- **下一步**：将 DeepSeek Harness 升级到 0.2.1-rc.1 及以上，在固定代码库和室内三维演示任务上对照成功率、人工验收及成本。模型无 Jinja 聊天模板，应核对官方编码实现；不将自报跑分当作独立复测。
- **来源链接**：[DeepSeek 官方中文发布公告](https://api-docs.deepseek.com/zh-cn/news/news261017) · [官方变更日志与测试条件](https://api-docs.deepseek.com/updates/) · [官方权重模型卡](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/raw/main/README.md) · [官方权重发布提交时间](https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4.1-Flash-1017/commits/main)
- **工程候选**：deepseek-ai/deepseek-harness（repo URL 待核验）；deepseek-ai/deepseek-recipe（repo URL 待核验）

#### 2. DeepSeek 开放 Search 与 Fetch API，智能体检索按调用次数计费

- **简要说明**：DeepSeek 在同日发布公告中开放自研搜索的 Search 与 Fetch 接口，用于网页检索和正文抓取。中文公告价格为两个接口各 5 元每千次；通过 DeepSeek Harness、Claude Code 或 Codex 使用 DeepSeek API 的服务端工具调用目前未计费，将于北京时间 11 月 1 日零点开始计费。英文公告对应价格为各 0.75 美元每千次。
- **优先级**：A
- **板块**：AI Agent / 智能体；AI 编程；工作流 / 技巧 / 教程；市场 / 商业模式
- **重点对象**：DeepSeek；DeepSeek Search
- **为什么重要**：面向报告采集和持续任务的智能体可分别预算模型推理与外部检索费用，评估搜索质量、抓取完整性和引用可追溯性。免费期的说明针对公告指定调用路径，不宜外推到所有直连 API 场景。
- **下一步**：按官方文档小范围验证 POST /v1/tools/search 与 /v1/tools/fetch，记录正文覆盖、失败请求及有效证据成本，在指定免费期结束前设置预算；本次只核验公告和文档，未调用付费接口。
- **来源链接**：[DeepSeek 官方中文公告与计费时间](https://api-docs.deepseek.com/zh-cn/news/news261017) · [官方英文公告与美元报价](https://api-docs.deepseek.com/news/news261017) · [Search 与 Fetch 官方接口文档](https://api-docs.deepseek.com/guides/search)

### 星期日｜2026-10-18（1 条）

#### 1. EdenLive 更新 14B 权重与推理配置，实时世界渲染代码和模型可核验

- **简要说明**：VAST 官方模型库 10 月 18 日将 14B 权重更新为 SGF-v6 step_000400 EMA，官方代码同日对齐少步推理的控制条件、缩放方式、注意力后端与参考帧率。EdenLive 由上游引擎或编程智能体维护世界状态，模型沿参考视频生成精细画面；当前 README 给出 5B 在单张 RTX 5090、1280×704 下约 24.7 FPS 的自报吞吐量。代码和权重此前已有提交，因此这里记录当天更新，不把它们的首次创建或全部能力都重标为当天发布。
- **优先级**：A
- **板块**：AI 3D / 世界模型；AI Agent / 智能体；产品 / 模型
- **重点对象**：VAST；EdenLive；Project Eden
- **为什么重要**：可探索室内漫游、游戏灰盒视觉增强和具身数据扩增，把结构化状态控制与神经渲染分开评估；帧吞吐量不等于端到端延迟或几何精度，也不代表可编辑 CAD 资产。
- **下一步**：先用固定相机路径和灰盒房间测试遮挡、跨帧一致性及交互延迟。第一方代码为 Apache 2.0；模型包包含 DINOv3 等独立许可，工作台首帧所用 FLUX 组件限制非商业用途。未在本机执行推理，不将全部组件统称可商用。
- **来源链接**：[VAST 官方代码与完整许可说明](https://github.com/VAST-AI-Research/EdenLive) · [官方模型卡](https://huggingface.co/VAST-AI/EdenLive/raw/main/README.md) · [官方权重更新历史](https://huggingface.co/api/models/VAST-AI/EdenLive/commits/main) · [官方 14B 推理配置更新差异](https://github.com/VAST-AI-Research/EdenLive/commit/3209807a51af0d109e81b5e2a3a6b561540c917f)
- **已知精确发布时间（北京时间）**：2026-10-18 18:20:36；归档日保留上游事件日 2026-10-18。
- **工程候选**：VAST-AI-Research/EdenLive（仓库链接已核验）

## 辅助索引

### 事件类型（每条只计一种主类型）

| 类型 | 数量 |
|---|---:|
| 产品 / 接口更新 | 17 |
| 模型 / 系统发布 | 8 |
| 安全 / 治理 / 研究 | 7 |
| 教程 / 工程复盘 | 3 |
| 论文 / 研究 | 4 |
| 融资 / 投资 | 2 |
| 合作 / 生态 / 商业 | 1 |
| 作者实践 | 1 |

### 板块计数（多标签，不可加总为事件总数）

| 板块 | 数量 |
|---|---:|
| 融资 / 投资 | 2 |
| 产品 / 模型 | 21 |
| AI Agent / 智能体 | 27 |
| 安全 / 治理 | 11 |
| AI 编程 | 18 |
| AI-CAD / 建筑工程 | 2 |
| 室内设计 AI | 2 |
| AI 3D / 世界模型 | 8 |
| 工作流 / 技巧 / 教程 | 14 |
| 作者 / 频道信号 | 1 |
| 市场 / 商业模式 | 12 |
| 前沿论文 / 研究 | 4 |
| AI 基础设施 | 1 |

### 重复实体与重点对象

Google、Google Research、Google DeepMind 按同一机构组去重，每事件最多计一次；公司和旗下独立产品分别保留，不能直接相加。

- **Google / DeepMind / Google Research**：14 条（别名：Google、Google DeepMind、Google Research）
- **Anthropic**：10 条
- **Gemini 4 Argon**：5 条
- **Claude**：4 条
- **Claude Code**：4 条
- **Google Antigravity**：4 条（别名：Google Antigravity、Antigravity）
- **OpenAI**：3 条
- **DeepSeek**：2 条
- **Google AI Studio**：2 条
- **GovTech Singapore**：2 条

- 本周新增重点观察：EdenLive：重点观察，复测后决定是否持续跟踪；DK-VLM / GreenWAM / LongForcing：观察工程资产成熟度。
- 维持 Simon Willison 的 core 状态；没有足够证据支持降级其他作者。

### GitHub / 工程候选

共 17 个候选；6 个已有原始仓库链接，11 个待核验。仓库存在不代表代码完整或已经复现。

- **google/adk-python**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://developers.googleblog.com/optimizing-a-200000-line-python-codebase-overnight-with-gemini-4-argon/)、[来源 2](https://blog.google/intl/en-mena/product-updates/explore-get-answers/gemini-4-argon-built-to-solve-your-hardest-problems/)
- **greenvla/GreenWAM**：[已核验仓库或版本](https://github.com/greenvla/GreenWAM)。日报已核验原始代码或发布记录；未执行代码。 证据：[来源 1](https://arxiv.org/abs/2610.18774)、[来源 2](https://github.com/greenvla/GreenWAM)
- **Fantasy-AMAP/LongForcing**：[已核验仓库或版本](https://github.com/Fantasy-AMAP/LongForcing)。仓库身份已核验，但日报仅见标题 README，完整训练 / 推理实现待发布；不可按可运行项目验收。 证据：[来源 1](https://arxiv.org/abs/2610.18289)、[来源 2](https://github.com/Fantasy-AMAP/LongForcing)
- **google-research/geospatial-reasoning-benchmarks**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://research.google/blog/putting-earth-ai-to-work-geospatial-agents-for-our-planets-biggest-challenges/)
- **paper-instruments/rubric**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://www.paperinstruments.com/blog/ultramarine)
- **sgl-project/sglang**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://huggingface.co/api/models/meta-models/Muse-Spark-Open-816B-A42B)、[来源 2](https://huggingface.co/blog/meta-muse-spark-open)、[来源 3](https://reflection.ai/blog/beam-is-available)、[来源 4](https://huggingface.co/reflection/Beam-1.0-501B-A23B)
- **modelscope/ms-swift**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://blogs.nvidia.com/blog/nemotron-3-5-super-vl/)
- **sumuru789/DK-VLM**：[已核验仓库或版本](https://github.com/sumuru789/DK-VLM)。日报已核验原始代码或发布记录；未执行代码。 证据：[来源 1](https://arxiv.org/abs/2610.22356)、[来源 2](https://github.com/sumuru789/DK-VLM)
- **openai/codex**：[已核验仓库或版本](https://github.com/openai/codex/releases/tag/rust-v0.163.0)。日报已核验原始代码或发布记录；未执行代码。 证据：[来源 1](https://github.com/openai/codex/releases/tag/rust-v0.163.0)
- **vllm-project/vllm**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://reflection.ai/blog/beam-is-available)、[来源 2](https://huggingface.co/reflection/Beam-1.0-501B-A23B)
- **anthropics/claude-code**：[已核验仓库或版本](https://github.com/anthropics/claude-code/releases/tag/v2.1.302)。日报已核验原始代码或发布记录；未执行代码。 证据：[来源 1](https://github.com/anthropics/claude-code/releases/tag/v2.1.301)、[来源 2](https://github.com/anthropics/claude-code/releases/tag/v2.1.302)
- **deepseek-ai/deepseek-harness**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://api-docs.deepseek.com/zh-cn/news/news261017)、[来源 2](https://api-docs.deepseek.com/updates/)、[来源 3](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/raw/main/README.md)、[来源 4](https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4.1-Flash-1017/commits/main)
- **deepseek-ai/deepseek-recipe**：待核验（repo URL 未确认）。日报提及工程对象；repo URL 待核验，未由名称拼接网址。 证据：[来源 1](https://api-docs.deepseek.com/zh-cn/news/news261017)、[来源 2](https://api-docs.deepseek.com/updates/)、[来源 3](https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/raw/main/README.md)、[来源 4](https://huggingface.co/api/models/deepseek-ai/DeepSeek-V4.1-Flash-1017/commits/main)
- **VAST-AI-Research/EdenLive**：[已核验仓库或版本](https://github.com/VAST-AI-Research/EdenLive)。日报已核验原始代码或发布记录；未执行代码。 证据：[来源 1](https://github.com/VAST-AI-Research/EdenLive)、[来源 2](https://huggingface.co/VAST-AI/EdenLive/raw/main/README.md)、[来源 3](https://huggingface.co/api/models/VAST-AI/EdenLive/commits/main)、[来源 4](https://github.com/VAST-AI-Research/EdenLive/commit/3209807a51af0d109e81b5e2a3a6b561540c917f)
- **Anchor3DGS 代码**：待核验（repo URL 未确认）。论文可核验，未发现明确官方仓库；repo URL 待核验。 证据：[来源 1](https://arxiv.org/abs/2610.21634)
- **Chirp Pong 代码**：待核验（repo URL 未确认）。作者文章和试玩入口可核验，官方代码仓库未明确；repo URL 待核验。 证据：[来源 1](https://simonwillison.net/2026/Oct/15/chirp-pong/)
- **Claude SDK OpenTelemetry 集成**：待核验（repo URL 未确认）。SDK 功能已确认；七种语言的实现仓库未逐个核验，repo URL 待核验。 证据：[来源 1](https://platform.claude.com/docs/en/release-notes/overview)、[来源 2](https://platform.claude.com/docs/en/manage-claude/opentelemetry)

### 未入正式归档的候选

- **Claude SDK OpenTelemetry 集成**：SDK 功能已确认；实现仓库未逐个核验，不猜测 URL。 [候选来源](https://platform.claude.com/docs/en/manage-claude/opentelemetry)
- **Tripo 本周展出 H3.1 与分部件打印流程，具体展示日待核验**：可信媒体正文只明确本周参展，尚未核验展示发生在最近 24 小时；不把报道日期当作模型首发或展出日期。 [候选来源](https://www.voxelmatters.com/tripo-ai-exhibits-h3-1-and-segmentation-v2-3d-native-foundation-models-for-printing/)
- **中国 AI 出口管制提案报道待核验**：原始报道返回 HTTP 403 验证码页，未读取事实正文；未核验提案原文，不作为已出台政策发布。 [候选来源](https://www.bloomberg.com/news/articles/2026-10-16/china-proposes-export-controls-on-ai-models-chips-and-agents)
- **Sakana Agentic Scientist 的本窗口发布时点待核验**：官方项目正文可读，但只给出 2026 年 10 月，GitHub 无 Release 时间；论文此前已提交，不据聚合报道将开源时间标为今天。 [候选来源](https://pub.sakana.ai/agentic-scientist/)
- **微软与 Nscale 英国数据中心合作变动报道待核验**：本次未取得可读报道全文或官方确认，不采纳聚合结论。 [候选来源](https://www.bloomberg.com/news/articles/2026-10-18/microsoft-scraps-uk-data-center-deal-with-nscale-telegraph-says)

### 覆盖、日期与发布边界

- 按上游原始事件日从周一至周日归档，不按日报采集日重标。来源只有日精度时不伪造时刻；有精确时间的条目额外展示上海时间，跨日差异不改写上游日期。
- 日报正式条目及累计库为事件边界；复用其原始来源核验记录。本次联网抽查 DeepSeek、EdenLive 和 Simon Willison，未声称重新抓取全部来源或运行项目。
- 10 月 19 日日报仅补入原始事件日为 10 月 18 日的 EdenLive 更新；公共利益基金事件按上游上海时间 10 月 19 日排除。
- ArtifactWorld（4 月 14 日）、SceneMosaic（9 月 4 日）、MoonGS（10 月 5 日）、Naka-GS（4 月 13 日）、Demiurge（10 月 10 日）等旧论文不计为本周新事件。LongForcing 在多日日报出现，仅计一次。
- 共享官方页面不等于重复事件：DeepSeek 模型更新与检索接口开放、Claude 可观测性与 AWS 定时部署分别保留。
- AI-CAD/AEC 两条分别为 Earth AI 选址/基础设施参考和 NVIDIA 公告中的工程生态；室内设计两条为 Pedra 房源素材与购物车选品参考，不代表本周交付两个 CAD 或室内设计生成产品。
- 作者信号仅有 Simon Willison 原创实践；视频观察表最近更新于 10 月 8 日，YouTube 多频道抓取受限，不能推断视频作者无更新或虚构播放量。
- 机器之心公开文章列表受限；Autodesk 403、Room AI 404、RapidCanvas 404 和部分 YouTube 来源不可读。可选单源缺失保留局限，不否定已有多源核验的日报成功状态。
- 周报文件同步到 public/reports 仅表示本地静态文件就绪。上游主发布门禁另为 blocked（Skills 日期/状态与 GitHub 必需证据缺项）；本次未提升 main、部署或推送。

- 数据输入：[2026-10-12 日报](ai-events-2026-10-12.md)、[2026-10-13 日报](ai-events-2026-10-13.md)、[2026-10-14 日报](ai-events-2026-10-14.md)、[2026-10-15 日报](ai-events-2026-10-15.md)、[2026-10-16 日报](ai-events-2026-10-16.md)、[2026-10-17 日报](ai-events-2026-10-17.md)、[2026-10-18 日报](ai-events-2026-10-18.md)，并读取 [2026-10-19 日报](ai-events-2026-10-19.md) 作为周末补录；读取当天 latest、累计 dev 索引、来源配置、博主清单和采集框架。
- 完整性：43 条标题及每条七项必要字段均为中文或含中文说明；按 A/B 优先级排列，无仅凭聚合摘要入选的事件。
- 运行结论：上游当天门禁与七日日报覆盖通过，本地周归档成功；公共发布未执行。
