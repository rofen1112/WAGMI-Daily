import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { inferSkillProfile } from './discover-skills-trends.mjs';
import './network-fetch.mjs';

const sourceHomepage = 'https://skills.sh/';
const trendingEndpoint = 'https://skills.sh/api/skills/trending/1';
const hotEndpoint = 'https://skills.sh/api/skills/hot/1';
const allTimeEndpoint = 'https://skills.sh/api/skills/all-time/{page}';
const officialPage = 'https://skills.sh/official';
const defaultTrendingLimit = 30;
const defaultPageSize = 200;
const defaultSourceExpansionLimit = 50;

const editorialOverrides = new Map([
  ['open.larksuite.com/lark-meeting', {
    category: '办公与协作',
    descriptionZh: 'Lark Meeting：当前仅能确认其名称与 skills.sh Hot 榜元数据；详情页返回 404，具体能力和适用范围暂无法确认。',
    useCases: ['持续核对 skills.sh 详情页是否恢复', '检查后续 Hot 榜与目录是否重新收录', '在取得公开说明后再评估具体用途'],
  }],
  ['open.feishu.cn/lark-meeting', {
    category: '办公与协作',
    descriptionZh: 'Lark Meeting：当前仅能确认其名称与 skills.sh 榜单元数据；详情页未提供可用说明，具体能力和适用范围暂无法确认。',
    useCases: ['持续核对 skills.sh 详情页是否恢复', '检查后续榜单与目录是否仍收录', '在取得公开说明后再评估具体用途'],
  }],
  ['nvidia/skills/codonfm-embed', {
    category: '生物信息与模型',
    descriptionZh: 'CodonFM Embed：校验编码序列 CSV，提取公开 CodonFM/Encodon 嵌入，并为下游属性建模选择检查点。',
    useCases: ['校验编码序列 CSV', '提取 CodonFM 或 Encodon 嵌入', '为下游属性建模选择检查点'],
  }],
  ['nvidia/skills/codonfm-finetune', {
    category: '生物信息与模型',
    descriptionZh: 'CodonFM Finetune：使用 LoRA、仅训练任务头或全量微调，在有标注的编码序列或变异数据上微调公开 CodonFM Encodon 检查点。',
    useCases: ['对编码序列数据做回归微调', '对编码变异数据做分类微调', '比较 LoRA、任务头与全量微调方案'],
  }],
  ['nvidia/skillspector/error-explainer', {
    category: '调试与错误诊断',
    descriptionZh: 'Error Explainer：解释用户提供的编译错误和运行时错误信息。',
    useCases: ['解读编译器错误', '说明运行时异常的含义', '帮助理解错误消息中的关键线索'],
  }],  ['bergside/awesome-design-skills/neobrutalism', {
    category: '品牌与设计',
    descriptionZh: 'Neobrutalism：以粗边框、高对比布局、鲜明点缀色和暖色表面构建现代新粗野主义视觉。',
    useCases: ['设计高对比的网页视觉', '为界面建立粗边框与强点色风格', '评估新粗野主义版式与色彩'],
  }],
  ['charlie947/answer-first/answer-first', {
    category: '沟通与表达',
    descriptionZh: 'Answer First：把行动或结论放在回答开头，持续保持简短、易扫读且以行动为导向的表达。',
    useCases: ['编写结论先行的简短回答', '把关键行动项放在长文开头', '为后续对话保持精简表达方式'],
  }],
  ['rivet-dev/skills/rivet-actors', {
    category: 'Agent 工作流',
    descriptionZh: 'Rivet Actors：把 Actor 作为 Agent 编排的基础原语。',
    useCases: ['了解基于 Actor 的 Agent 编排思路', '为 Agent 编排选择基础抽象', '根据公开页面评估 Rivet Actors 的适用性'],
  }],
  ['rivet-dev/skills/rivet-agentos', {
    category: 'Agent 基础设施',
    descriptionZh: 'Rivet Agentos：Rivet 将其定位为“每个 Agent 的一台计算机”，公开详情页暂未提供更具体的能力说明。',
    useCases: ['了解 Rivet agentOS 的公开产品定位', '查看来源页面核对具体能力', '在能力边界确认后再评估适用范围'],
  }],
  ['rivet-dev/skills/rivet-workflows', {
    category: 'Agent 工作流',
    descriptionZh: 'Rivet Workflows：组织可持久化、可重放的多步操作流程。',
    useCases: ['编排需要持久化的多步操作', '重放已记录的工作流', '评估可恢复的 Agent 任务编排'],
  }],
  ['rohitg00/agentmemory/lesson', {
    category: 'Agent 记忆与知识',
    descriptionZh: 'Lesson：把用户纠正或经验规则保存为带置信度的教训，并在类似任务前重新提示。',
    useCases: ['记录用户明确纠正的执行方式', '保存应始终或绝不采用的规则', '在类似工作前召回相关经验'],
  }],
  ['browser-use/video-use/video-use', {
    category: '动效与视频',
    descriptionZh: 'Video Use：通过对话完成视频转写、粗剪、去口癖与停顿、自动调色、字幕烧录和动效叠加，并在输出前检查每个剪辑点。',
    useCases: ['把口播、访谈或教程素材剪成完整成片', '自动去除口癖和无效停顿并统一调色', '生成字幕、动态图层并导出 final.mp4'],
  }],
  ['browser-use/browser-use/browser-use', {
    category: '浏览器自动化',
    descriptionZh: 'Browser Use：让 AI Agent 通过持久浏览器会话完成网页导航、点击、输入、内容提取、截图和多步骤在线任务。',
    useCases: ['自动执行跨页面网页流程', '在保持登录状态的会话中操作网站', '提取页面信息并保留操作截图'],
  }],
  ['vercel-labs/agent-browser/agent-browser', {
    category: '浏览器自动化',
    descriptionZh: 'Agent Browser：面向 AI Agent 的浏览器自动化命令行，支持页面操作、会话隔离、状态保存、追踪、性能检查和实时观察面板。',
    useCases: ['用命令驱动网页访问、点击和输入', '保存登录状态并复用隔离会话', '通过追踪、错误和实时面板检查自动化过程'],
  }],
  ['openclaw/openclaw/summarize', {
    category: '内容与知识处理', descriptionZh: 'Summarize：对 URL、文章、PDF、本地文件、YouTube 视频和播客执行摘要或转写。',
    useCases: ['汇总网页、文章或 PDF', '转写视频与播客内容', '整理本地文件和转写稿'],
  }],
  ['flutter/agent-plugins/flutter-architecting-apps', {
    category: '移动应用开发', descriptionZh: 'Flutter Architecting Apps：按 UI、逻辑与数据分层组织 Flutter 应用，用于新项目架构设计或可扩展性重构。',
    useCases: ['规划 Flutter 应用分层架构', '重构难以扩展的 Flutter 项目', '划分 UI、业务逻辑与数据职责'],
  }],
  ['flutter/agent-plugins/flutter-managing-state', {
    category: '移动应用开发', descriptionZh: 'Flutter Managing State：管理 Flutter 应用状态与临时 UI 状态，处理 Widget 间数据共享和复杂状态转换。',
    useCases: ['在 Widget 之间共享状态', '管理应用级与临时 UI 状态', '处理复杂界面状态转换'],
  }],
  ['flutter/agent-plugins/flutter-handling-concurrency', {
    category: '移动应用开发', descriptionZh: 'Flutter Handling Concurrency：把长耗时计算或大数据解析放入后台 isolate，避免阻塞 Flutter 界面。',
    useCases: ['在后台 isolate 执行长任务', '解析大型数据集而不阻塞 UI', '保持 Flutter 界面响应'],
  }],
  ['flutter/agent-plugins/flutter-interoperating-with-native-apis', {
    category: '移动应用开发', descriptionZh: 'Flutter Interoperating With Native Apis：让 Flutter 调用 Android、iOS 或 Web 的平台 API 和现有原生代码。',
    useCases: ['访问 Dart 未覆盖的设备能力', '调用 Android 或 iOS 原生代码', '为 Flutter 接入平台专用 API'],
  }],
  ['sickn33/agentic-awesome-skills/api-security-best-practices', {
    category: '安全与合规', descriptionZh: 'Api Security Best Practices：实现 API 身份认证、授权、输入验证、限流和常见漏洞防护模式。',
    useCases: ['审查 API 认证与授权', '配置输入验证和限流', '防范常见 API 漏洞'],
  }],
  ['callstack/agent-device/dogfood', {
    category: '测试与质量', descriptionZh: 'Dogfood：使用 agent-device 系统探索 iOS 或 Android 应用，发现缺陷、体验问题和其他异常。',
    useCases: ['对移动应用执行探索性测试', '发现 iOS 或 Android 缺陷', '整理移动端 UX 问题'],
  }],
  ['openclaw/openclaw/openai-whisper', {
    category: '音频与语音', descriptionZh: 'Openai Whisper：通过本地 Whisper CLI 执行语音转文字，不依赖 API 密钥。',
    useCases: ['在本地转写音频', '生成语音文本稿', '在无 API 密钥环境执行语音识别'],
  }],
  ['openclaw/openclaw/openai-whisper-api', {
    category: '音频与语音', descriptionZh: 'Openai Whisper Api：通过 OpenAI 音频转写 API 调用公开说明列出的转写与说话人分离模型。',
    useCases: ['通过 API 转写音频', '使用支持的模型生成文字稿', '处理需要说话人分离的转写'],
  }],
  ['sickn33/agentic-awesome-skills/prisma-expert', {
    category: '数据库与后端', descriptionZh: 'Prisma Expert：处理 Prisma ORM 模式设计、迁移、查询优化、关系建模和数据库操作。',
    useCases: ['设计 Prisma Schema 与关系', '执行数据库迁移', '优化 Prisma 查询'],
  }],
  ['sickn33/agentic-awesome-skills/game-development', {
    category: '游戏开发', descriptionZh: 'Game Development：按平台、2D/3D 维度和引擎适配度规划游戏项目，并在 Phaser、Godot、Unity 等方案间选择。',
    useCases: ['规划新游戏项目结构', '选择 2D 或 3D 游戏框架', '比较 Web、Godot 与 Unity 路线'],
  }],
  ['code-yeongyu/oh-my-openagent/github-issue-triage', {
    category: '代码审查与协作', descriptionZh: 'Github Issue Triage：把 GitHub Issue 分派为独立后台任务进行流式分析和分诊。',
    useCases: ['批量分诊 GitHub Issues', '独立分析每个 Issue', '生成实时 Issue 分析结果'],
  }],
  ['sickn33/agentic-awesome-skills/database-design', {
    category: '数据库与后端', descriptionZh: 'Database Design：指导数据库模式、索引、ORM 与 Serverless 数据库的设计决策。',
    useCases: ['设计数据库 Schema', '规划索引策略', '选择 ORM 或 Serverless 数据库'],
  }],
  ['sickn33/agentic-awesome-skills/backend-architect', {
    category: '后端与架构', descriptionZh: 'Backend Architect：设计可扩展 API、微服务和分布式后端系统。',
    useCases: ['设计后端服务架构', '规划微服务边界', '设计可扩展 API 与分布式系统'],
  }],
  ['launchdarkly/ai-tooling/launchdarkly-experiment-setup', {
    category: '实验与增长', descriptionZh: 'Launchdarkly Experiment Setup：在 LaunchDarkly 中配置指标、处理组与 Feature Flag，启动迭代并根据结果选择胜出方案。',
    useCases: ['创建 LaunchDarkly 实验', '配置指标与实验处理组', '比较迭代结果并选择胜出方案'],
  }],
  ['openclaw/openclaw/xurl', {
    category: '社交平台自动化', descriptionZh: 'Xurl：通过 X API 执行帖子、回复、读取搜索、私信、媒体上传、关注者和认证状态操作。',
    useCases: ['读取或搜索 X 帖子', '发布帖子、回复或私信', '上传媒体并检查认证状态'],
  }],
  ['openclaw/openclaw/sag', {
    category: '音频与语音', descriptionZh: 'Sag：通过 ElevenLabs 文本转语音提供类似 macOS say 的命令行体验。',
    useCases: ['把文本转换为语音', '从命令行调用 ElevenLabs TTS', '生成简短语音输出'],
  }],
  ['openclaw/openclaw/1password', {
    category: '身份与密钥管理', descriptionZh: '1password：设置并使用 1Password CLI 登录、连接桌面应用，以及读取或注入密钥。',
    useCases: ['配置 1Password CLI 登录', '连接 1Password 桌面应用', '为进程读取或注入密钥'],
  }],
  ['openclaw/openclaw/trello', {
    category: '办公与效率', descriptionZh: 'Trello：通过 Trello REST API 管理看板、列表和卡片。',
    useCases: ['创建和维护 Trello 看板', '管理列表与卡片', '自动化团队任务更新'],
  }],
  ['openclaw/openclaw/blogwatcher', {
    category: '信息监测', descriptionZh: 'Blogwatcher：通过命令行监测博客与 RSS/Atom Feed 的更新。',
    useCases: ['监测博客更新', '订阅 RSS 或 Atom Feed', '整理新增内容线索'],
  }],
  ['openclaw/openclaw/openhue', {
    category: '智能家居', descriptionZh: 'Openhue：通过 OpenHue CLI 控制 Philips Hue 灯光和场景。',
    useCases: ['控制 Philips Hue 灯光', '切换照明场景', '从命令行管理 Hue 设备'],
  }],  ['heygen-com/hyperframes/pr-to-video', {
    category: '动效与视频',
    descriptionZh: 'Pr To Video：根据 GitHub Pull Request 的差异、提交和文件内容，制作变更日志、功能展示、修复说明或重构讲解视频。',
    useCases: ['把 Pull Request 制作成代码变更讲解视频', '生成新功能或修复的可视化说明', '根据提交与文件差异制作重构演示'],
  }],
  ['remotion-dev/skills/remotion-best-practices', {
    category: '动效与视频',
    descriptionZh: 'Remotion Best Practices：作为 Remotion 系列 Skill 的入口，根据具体任务引导到相应的 Remotion 工作流。',
    useCases: ['定位适合当前任务的 Remotion Skill', '为 Remotion 视频开发选择专项工作流', '从统一入口浏览 Remotion 相关能力'],
  }],
  ['autonnel/autonnel-skills/self-hosted-funnel-launch', {
    category: '营销与增长',
    descriptionZh: 'Self Hosted Funnel Launch：部署自托管销售漏斗，并通过 MCP 配置落地页、结账、一键加售、支付、商品目录与转化跟踪。',
    useCases: ['在 Cloudflare Workers 或 Docker 部署销售漏斗', '搭建落地页、结账与购后加售流程', '让 Agent 通过 MCP 创建和编辑漏斗'],
  }],  ['microsoft/azure-skills/azure-upgrade', {
    category: '云平台与运维',
    descriptionZh: 'Azure Upgrade：评估并升级 Azure 工作负载的计划、层级或 SKU，也可现代化源代码中的 Azure SDK 依赖。',
    useCases: ['升级 Azure Functions 或 App Service 托管计划', '迁移 Azure Cache for Redis 到 Azure Managed Redis', '把旧版 Azure Java SDK 迁移到新版命名空间'],
  }],
  ['microsoft/azure-skills/airunway-aks-setup', {
    category: 'AI 与 Agent 工程',
    descriptionZh: 'Airunway Aks Setup：在 AKS 集群上设置 AI Runway，覆盖集群检查、控制器安装、GPU 评估、提供商配置与首次模型部署。',
    useCases: ['把 AI Runway 接入现有 AKS 集群', '评估 GPU 并配置模型服务提供商', '在 AKS 上首次部署 LLM 或 vLLM 模型'],
  }],
  ['microsoft/azure-skills/entra-agent-id', {
    category: '身份与访问管理',
    descriptionZh: 'Entra Agent Id：通过 Microsoft Graph 配置 Entra Agent Identity 蓝图、实例身份与 OAuth 2.0 令牌交换。',
    useCases: ['创建 Agent Identity Blueprint 与 BlueprintPrincipal', '配置 fmi_path、OBO 或跨租户令牌交换', '集成 Microsoft Entra AgentID sidecar 与工作负载身份联合'],
  }],  ['google/agents-cli/google-agents-cli-observability', {
    category: '\u53ef\u89c2\u6d4b\u6027',
    descriptionZh: 'Google Agents Cli Observability\uff1a\u4e3a Google ADK Agent \u914d\u7f6e Cloud Trace\u3001提示-响应日志、BigQuery Agent Analytics 与第三方可\u89c2\u6d4b\u96c6\u6210\u3002',
    useCases: ['\u4e3a ADK Agent \u914d\u7f6e\u8ffd\u8e2a\u4e0e\u65e5\u5fd7', '\u5206\u6790\u751f\u4ea7\u73af\u5883 Agent \u6d41\u91cf', '\u63a5\u5165 AgentOps\u3001Phoenix \u6216 MLflow'],
  }],
  ['google/agents-cli/google-agents-cli-publish', {
    category: 'Agent \u53d1\u5e03\u4e0e\u7ba1\u7406',
    descriptionZh: 'Google Agents Cli Publish\uff1a\u901a\u8fc7 agents-cli \u5c06 ADK Agent \u53d1\u5e03\u548c\u6ce8\u518c\u5230 Gemini Enterprise，\u5e76\u7ba1\u7406 Agent Registry \u4e2d\u7684\u5df2\u6ce8\u518c Agent\u3002',
    useCases: ['\u5c06 ADK Agent \u53d1\u5e03\u5230 Gemini Enterprise', '\u9009\u62e9 ADK \u6216 A2A \u6ce8\u518c\u6a21\u5f0f', '\u5217\u51fa\u3001\u66f4\u65b0\u6216\u5220\u9664 Agent Registry \u6761\u76ee'],
  }],
  ['google/agents-cli/google-agents-cli-adk-code', {
    category: 'Agent 开发',
    descriptionZh: 'Google Agents Cli Adk Code：提供 Google ADK 的 Agent 类型、工具定义、编排模式、回调、状态管理与 Python 代码参考。',
    useCases: ['用 Google ADK 编写 Agent 与工具', '实现回调和状态管理', '参考 ADK 编排模式与代码示例'],
  }],
  ['google/agents-cli/google-agents-cli-workflow', {
    category: 'Agent 开发',
    descriptionZh: 'Google Agents Cli Workflow：串联 Google ADK Agent 的脚手架、开发、评测、部署、发布与可观测生命周期，并提供代码保留和故障排查指引。',
    useCases: ['规划 ADK Agent 的完整开发流程', '在本地运行、调试和测试 Agent', '衔接评测、部署、发布与监控步骤'],
  }],
  ['google/agents-cli/google-agents-cli-scaffold', {
    category: 'Agent 开发',
    descriptionZh: 'Google Agents Cli Scaffold：通过 agents-cli 创建、增强或升级 Google ADK 项目，配置模板、部署目标和原型优先工作流。',
    useCases: ['创建新的 Google ADK Agent 项目', '为现有项目补充 CI/CD 或部署配置', '升级脚手架并选择项目模板'],
  }],
  ['google/agents-cli/google-agents-cli-deploy', {
    category: 'Agent 部署与运维',
    descriptionZh: 'Google Agents Cli Deploy：把 Google ADK Agent 部署到 Agent Runtime、Cloud Run 或 GKE，覆盖服务账号、密钥、Agent Gateway、回滚与故障排查。',
    useCases: ['将 ADK Agent 部署到 Cloud Run、GKE 或 Agent Runtime', '配置服务账号、密钥和 Agent Gateway', '排查部署问题并准备回滚'],
  }],
  ['juliusbrussee/caveman/caveman-optimize', {
    category: 'Agent 评测',
    descriptionZh: 'Caveman Optimize：把 Caveman 对仓库的只读观测转为由操作者选择的优化候选，并以成对的基线与候选评测比较效果。',
    useCases: ['检查 Caveman 优化报告中的观测', '为候选改动建立基线与对照评测', '在明确批准后评估优化方案'],
  }],
  ['heygen-com/hyperframes/slideshow', {
    category: '演示文稿',
    descriptionZh: 'Slideshow：创建带离散页面、逐步揭示、分支导航、热点和演讲者备注的 HyperFrames 可导航演示文稿。',
    useCases: ['制作演示文稿或路演 Deck', '设计分支与热点导航', '把现有页面转换为可导航幻灯片'],
  }],
  ['heygen-com/hyperframes/figma', {
    category: '动效与视频',
    descriptionZh: 'Figma：把 Figma 画面、品牌令牌、组件或动画导入 HyperFrames 并重建为视频运动状态。',
    useCases: ['将 Figma 设计导入视频合成', '复用品牌令牌和画面组件', '把设计帧重建为连续运动状态'],
  }],
  ['microsoft/playwright-cli/playwright-cli', {
    category: '浏览器自动化',
    descriptionZh: 'Playwright Cli：通过 Playwright 命令行自动操作浏览器、测试网页并检查真实页面状态。',
    useCases: ['执行网页端到端测试', '自动完成点击、输入和导航', '验证不同页面状态与渲染结果'],
  }],
  ['juliusbrussee/caveman/caveman-explore', {
    category: '代码导航',
    descriptionZh: 'Caveman Explore：以只读方式定位仓库中跨文件的代码与符号，返回精简的路径和行号证据。',
    useCases: ['冷启动时快速了解仓库结构', '定位分散在多个文件中的实现', '在直接搜索失败后收集路径与行号证据'],
  }],
  ['cloudflare/skills/agents-sdk', {
    category: 'AI 与 Agent 工程',
    descriptionZh: 'Agents Sdk：在 Cloudflare Workers 上构建有状态 AI Agent，覆盖状态管理、RPC、持久工作流、WebSocket、定时任务与可观测性。',
    useCases: ['构建有状态对话或实时 Agent 应用', '编排可恢复的持久工作流', '在 Workers 上实现 MCP 服务或定时 Agent 任务'],
  }],
  ['juliusbrussee/caveman/caveman-learn', {
    category: 'Agent 成本优化',
    descriptionZh: 'Caveman Learn：检查 Caveman 报告中排名靠前的令牌消耗点，并在逐项同意后精简配置或转存重复上下文。',
    useCases: ['分析 Agent 会话中的高令牌消耗点', '精简过重的 CLAUDE.md 配置', '将反复粘贴的上下文转存到 cavemem'],
  }],
  ['juliusbrussee/caveman/investigate-first', {
    category: '调试与诊断',
    descriptionZh: 'Investigate First：在修改代码前诊断原因不明、间歇性或性能回退问题，并按证据强弱排列假设。',
    useCases: ['调查原因不明的失败', '收集间歇性问题的复现证据', '在编辑前排序并验证根因假设'],
  }],
  ['mitsuhiko/gh-issue-sync/gh-issue-sync', {
    category: '代码审查与协作',
    descriptionZh: 'Gh Issue Sync：把 GitHub Issues 同步为本地 Markdown 文件，便于在编辑器或终端中分诊、搜索、编辑和创建 Issue。',
    useCases: ['在本地 Markdown 中分诊 GitHub Issues', '从编辑器或终端搜索与编辑 Issue', '离线整理后创建或同步 Issue'],
  }],
  ['jakubkrehel/skills/break', { category: '测试与质量', descriptionZh: 'Break：把单个组件的真实使用状态集中渲染到测试页面，并以可视化报告标出失效状态。', useCases: ['检查组件在不同状态下是否可用', '生成组件状态可视化报告', '定位响应式或边界状态的界面破损'] }],
  ['dotnet/skills/target-authoring', { category: '构建与工程', descriptionZh: 'Target Authoring：诊断和修复自定义 MSBuild Target 的依赖链、Inputs/Outputs、Returns 与 FileWrites 等编写问题。', useCases: ['修复跨文件的 MSBuild Target 链', '正确扩展 DependsOnTargets', '排查 Target 重复构建或陈旧输出'] }],
  ['dotnet/skills/use-js-interop', { category: 'Web 开发', descriptionZh: 'Use Js Interop：在 Blazor 组件中实现和审查 JavaScript 与 .NET 互操作，覆盖模块、引用生命周期、调用时机与异步释放。', useCases: ['从 Blazor 调用 JavaScript', '从 JavaScript 回调 .NET', '管理 IJSObjectReference 与 DotNetObjectReference'] }],
  ['tradermonty/claude-trading-skills/stockbee-momentum-burst-screener', { category: '金融分析', descriptionZh: 'Stockbee Momentum Burst Screener：按 4% 突破、区间与成交量扩张、前期收缩、收盘位置和风险距离筛选美股短线动量候选。', useCases: ['筛选 Stockbee 风格动量突破', '复核 3–5 日短线候选', '按成交量与风险距离过滤股票'] }],
  ['dotnet/skills/grade-tests', { category: '测试与质量', descriptionZh: 'Grade Tests：逐个评定指定测试方法，输出完整测试名、A–F 等级、分数区间和简短说明的 PR 表格。', useCases: ['评审 PR 中新增或修改的测试', '为指定测试方法逐项评分', '生成精简的测试质量反馈表'] }],
  ['qianwen-ai/qianwenai-deploy/qianwenai-deploy', { category: '部署与运维', descriptionZh: 'Qianwenai Deploy：将本地项目或 Git 仓库部署、更新到阿里云国内站，覆盖资源编排、部署前询价、探活和状态记录。', useCases: ['把全栈项目部署到阿里云国内站', '为 Git 仓库生成线上服务地址', '检查部署状态并更新线上版本'] }],
  ['planetscale/skills/planetscale-query-insights-and-tags', { category: '数据库与后端', descriptionZh: 'PlanetScale Query Insights And Tags：用 PlanetScale Insights 与 SQLCommenter 查询标签归因数据库负载、识别高风险查询并准备流量控制或模式建议。', useCases: ['按服务或请求归因数据库负载', '定位高风险 SQL 查询', '为 Traffic Control 或 Schema 调整准备证据'] }],
  ['unnoo/zsxq-skill/zsxq', { category: '社群与内容运营', descriptionZh: 'Zsxq：通过 zsxq-cli 管理知识星球的内容、评论、问答、成员、标签、定时任务与公开说明列出的支付场景。', useCases: ['发布、编辑和整理知识星球内容', '管理评论、问答、成员与标签', '生成运营复盘并处理定时任务'] }],
  ['dotnet/skills/find-untested-sources', { category: '测试与质量', descriptionZh: 'Find Untested Sources：依据仓库结构静态配对源文件与测试，找出缺少对应测试的模块并建议测试位置。', useCases: ['列出没有对应测试的源文件', '为新测试建议目录和文件位置', '静态审查多语言项目的测试配对'] }],
  ['alwaysmeticulous/skills/meticulous-fix', { category: '测试与质量', descriptionZh: 'Meticulous Fix：根据已审阅且被拒绝的 Meticulous 视觉差异及评论，实现对应界面修复。', useCases: ['处理被拒绝的视觉回归结果', '按评审评论修复界面差异', '复核 Meticulous 测试对应改动'] }],
  ['danangjoyoo/nerd/nerd-patrol', { category: '安全与合规', descriptionZh: 'Nerd Patrol：在已确认的代码、PR、模块、应用、端点、依赖或配置范围内检查漏洞、不安全行为与可利用性。', useCases: ['审查指定代码范围的安全问题', '检查依赖或配置的可利用风险', '评估端点与应用的不安全行为'] }],
  ['insforge/insta-skills/insta', { category: '云平台与运维', descriptionZh: 'Insta：通过 InstaCloud CLI 管理项目、数据库、存储、计算、部署、分支隔离环境、凭据绑定、监控和分支晋升。', useCases: ['部署 InstaCloud 管理的应用', '为分支或 Agent 创建隔离基础设施', '查看指标日志并把分支晋升到主环境'] }],
  ['mengto/skills/audit-verify-explain-grade-5', { category: '测试与质量', descriptionZh: 'Audit Verify Explain Grade 5：用具体证据审计工作和验证声明，并以非技术读者易懂的语言解释结果。', useCases: ['审查改动是否按声明工作', '用证据汇总测试结果', '把技术发现解释为浅白结论'] }],
  ['mengto/skills/author-game-levels', { category: '游戏开发', descriptionZh: 'Author Game Levels：创建或修改可读的平面 Three.js 游戏关卡，覆盖移动路线、碰撞、遭遇区、目标、光照与跨设备试玩。', useCases: ['设计 Three.js 关卡路线与地标', '配置碰撞、敌人区域和拾取物', '验证桌面与移动端关卡可玩性'] }],
  ['mengto/skills/write-like-meng-on-x', { category: '社交内容', descriptionZh: 'Write Like Meng On X：依据 Meng To 的已发布语料、个人与产品背景，起草、改写和查重 X 帖子、回复、线程与引用帖。', useCases: ['用 Meng To 的语气改写 X 帖子', '起草回复、线程或资源分享', '检查选题是否重复既有内容'] }],
  ['readdle/spark-cli-skills/spark-persona-meeting-manager', { category: '办公与协作', descriptionZh: 'Spark Persona Meeting Manager：在 Spark 中辅助会前准备、会议转写审阅、后续邮件草稿和日程安排。', useCases: ['整理会前资料', '审阅会议转写并提炼跟进项', '起草会后邮件和安排日程'] }],
  ['tigrisdata/skills/file-storage', { category: '存储与数据基础设施', descriptionZh: 'File Storage：使用 Tigris 文件存储上传、下载、删除和列举文件，生成预签名 URL，并配置 CLI 与多种 Web 框架 SDK。', useCases: ['在 Web 应用中接入 Tigris 文件存储', '管理文件和预签名上传链接', '配置 Tigris CLI 或 SDK'] }],
  ['tigrisdata/skills/tigris-object-operations', { category: '存储与数据基础设施', descriptionZh: 'Tigris Object Operations：管理 Tigris Storage 对象的上传、下载、删除、列举、元数据读取与预签名 URL。', useCases: ['上传和下载 Tigris 对象', '列举对象并读取元数据', '生成受限的预签名访问链接'] }],
  ['tigrisdata/skills/tigris-s3-migration', { category: '存储与数据基础设施', descriptionZh: 'Tigris S3 Migration：把 AWS S3、Google Cloud Storage 或 Azure Blob 迁移到 Tigris，覆盖影子桶、主动搬迁、批量复制和 SDK 端点切换。', useCases: ['从 S3、GCS 或 Azure Blob 迁移对象', '配置影子桶和主动搬迁', '规划零停机 SDK 端点切换'] }],
  ['tigrisdata/skills/tigris-sdk-guide', { category: '存储与数据基础设施', descriptionZh: 'Tigris Sdk Guide：按语言和场景选择 Tigris 原生 SDK、CLI 或兼容 S3 的 AWS SDK。', useCases: ['为项目选择 Tigris SDK', '判断何时使用 AWS S3 兼容接口', '比较 CLI 与不同语言客户端'] }],
  ['tigrisdata/skills/tigris-security-access-control', { category: '安全与合规', descriptionZh: 'Tigris Security Access Control：配置 Tigris 存储的 CORS、访问密钥轮换、桶策略、角色与预签名 URL 安全。', useCases: ['配置 Tigris 桶访问策略与角色', '轮换访问密钥并审查生命周期', '检查 CORS 和预签名 URL 安全'] }],
  ['dotnet/skills/migrate-xunit-to-mstest', { category: '测试与质量', descriptionZh: 'Migrate XUnit To MSTest：把 .NET 测试项目从 xUnit.net v2/v3 迁移到 MSTest v4，并保留现有 VSTest 或 MTP 运行器。', useCases: ['替换 xUnit 包和测试属性', '迁移断言、Fixture 与输出助手', '把并行、Trait 和 Skip 配置转换到 MSTest'] }],
  ['mengto/skills/build-isometric-arpg', { category: '游戏开发', descriptionZh: 'Build Isometric Arpg：使用 Three.js、React 或类似 Web 技术构建等距动作 RPG，覆盖游戏循环、镜头、移动、战斗、成长、存档和可玩切片。', useCases: ['搭建等距 ARPG 核心循环', '实现区域、战斗和成长系统', '制作可试玩的 Web 游戏垂直切片'] }],
  ['mengto/skills/build-threejs-enemy-systems', { category: '游戏开发', descriptionZh: 'Build Threejs Enemy Systems：为 Three.js 动作游戏构建数据驱动的敌人原型与招式系统，规范模型、Rig、时序、命中契约和运行时状态。', useCases: ['设计可复用的敌人数据结构', '配置招式时序与命中判定', '建立占位回退和确定性测试夹具'] }],
  ['mengto/skills/globe-gl', { category: '数据可视化', descriptionZh: 'Globe Gl：用 Globe.GL、WebGL 与 Three.js 构建三维地球数据可视化，支持点、弧线、多边形、标签及 HTML/React 集成。', useCases: ['创建三维地球可视化', '展示点、弧线和区域数据层', '在 HTML 或 React 中集成 Globe.GL'] }],
  ['publora/skills/linkedin-analytics', { category: '营销与增长', descriptionZh: 'Linkedin Analytics：通过 Publora MCP 分析 LinkedIn 表现、跟踪互动指标并管理回复与评论。', useCases: ['分析 LinkedIn 内容表现', '跟踪互动与参与指标', '管理帖子反应和评论'] }],
  ['readdle/spark-cli-skills/spark-persona-sales-rep', { category: '销售与客户管理', descriptionZh: 'Spark Persona Sales Rep：在 Spark 中辅助客户关系跟踪、销售管道复盘、跟进节奏和交易背景整理。', useCases: ['跟踪客户关系与交易背景', '复盘销售管道', '安排客户跟进节奏'] }],
  ['readdle/spark-cli-skills/spark-recipe-shared-inbox-status', { category: '办公与协作', descriptionZh: 'Spark Recipe Shared Inbox Status：检查共享收件箱中未完成、已完成、未分配事项及成员分配情况。', useCases: ['查看共享收件箱健康状态', '找出未分配的工作项', '汇总成员任务分配'] }],
  ['readdle/spark-cli-skills/spark-recipe-team-workload', { category: '办公与协作', descriptionZh: 'Spark Recipe Team Workload：审计团队任务分配，汇总成员负载、委派事项、未分配工作和负载失衡。', useCases: ['比较团队成员工作量', '识别未分配或过载事项', '复核委派任务分布'] }],
  ['max-sixty/worktrunk/wt-switch-create', {
    category: '\u5f00\u53d1\u5de5\u5177',
    descriptionZh: 'Wt Switch Create\uff1a\u4f7f\u7528 Worktrunk \u521b\u5efa Git \u5206\u652f\u4e0e worktree\uff0c\u5e76\u5207\u6362\u5230\u65b0\u5de5\u4f5c\u76ee\u5f55\uff0c\u7528\u4e8e\u9694\u79bb\u5e76\u884c\u5f00\u53d1\u4efb\u52a1\u3002',
    useCases: ['\u4e3a\u65b0\u529f\u80fd\u521b\u5efa\u72ec\u7acb\u5206\u652f\u4e0e worktree', '\u4e3a\u5e76\u884c Agent \u4efb\u52a1\u5206\u914d\u9694\u79bb\u5de5\u4f5c\u76ee\u5f55', '\u521b\u5efa worktree \u540e\u76f4\u63a5\u5207\u6362\u5f00\u59cb\u5f00\u53d1'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/input-systems', {
    category: '\u6e38\u620f\u5f00\u53d1',
    descriptionZh: 'Input Systems\uff1a\u8bbe\u8ba1\u8de8\u5f15\u64ce\u7684\u6e38\u620f\u8f93\u5165\u67b6\u6784\uff0c\u8986\u76d6\u52a8\u4f5c\u6620\u5c04\u3001\u6309\u952e\u91cd\u7ed1\u5b9a\u3001\u591a\u8bbe\u5907\u8f93\u5165\u4e0e\u8f93\u5165\u7f13\u51b2\u3002',
    useCases: ['\u5efa\u7acb\u952e\u76d8\u3001\u624b\u67c4\u7b49\u591a\u8bbe\u5907\u8f93\u5165\u6620\u5c04', '\u5b9e\u73b0\u73a9\u5bb6\u81ea\u5b9a\u4e49\u6309\u952e\u91cd\u7ed1\u5b9a', '\u4e3a\u52a8\u4f5c\u4e0e\u683c\u6597\u6e38\u620f\u8bbe\u8ba1\u8f93\u5165\u7f13\u51b2'],
  }],
  ['heygen-com/hyperframes/music-to-video', {
    category: '\u52a8\u6548\u4e0e\u89c6\u9891',
    descriptionZh: 'Music To Video\uff1a\u5c06\u97f3\u9891\u3001\u89c6\u9891\u4e2d\u7684\u97f3\u8f68\u6216\u6839\u636e\u60c5\u7eea\u751f\u6210\u7684\u97f3\u4e50\uff0c\u5236\u4f5c\u6210\u6309\u8282\u62cd\u526a\u8f91\u7684\u6b4c\u8bcd\u89c6\u9891\u3001\u5e7b\u706f\u7247\u6216\u52a8\u6001\u5ba3\u4f20\u7247\u3002',
    useCases: ['\u5236\u4f5c\u8282\u62cd\u540c\u6b65\u7684\u6b4c\u8bcd\u89c6\u9891', '\u5c06\u7528\u6237\u7d20\u6750\u6309\u97f3\u4e50\u8282\u62cd\u526a\u8f91', '\u5728\u65e0\u73b0\u6210\u89c6\u89c9\u7d20\u6750\u65f6\u751f\u6210\u5b8c\u6574\u97f3\u4e50\u89c6\u9891'],
  }],
  ['antibrow/anti-detect-browser-skills/multi-account-isolation', {
    category: '\u6d4f\u89c8\u5668\u81ea\u52a8\u5316',
    descriptionZh: 'Multi Account Isolation\uff1a\u68c0\u67e5\u591a\u4e2a\u6d4f\u89c8\u5668\u914d\u7f6e\u6587\u4ef6\u4e4b\u95f4\u7684\u65f6\u533a\u3001WebRTC\u3001Canvas/WebGL\u6307\u7eb9\u3001Cookie \u548c\u5730\u5740\u9694\u79bb\u60c5\u51b5\u3002',
    useCases: ['\u6838\u5bf9\u65f6\u533a\u4e0e\u4ee3\u7406\u51fa\u53e3 IP', '\u68c0\u67e5 WebRTC \u6cc4\u6f0f\u548c\u6307\u7eb9\u7a33\u5b9a\u6027', '\u5ba1\u8ba1\u81ea\u6709\u8d26\u53f7\u6216\u6d4b\u8bd5\u8eab\u4efd\u7684\u914d\u7f6e\u9694\u79bb'],
  }],
  ['antibrow/anti-detect-browser-skills/anti-detect-browser', {
    category: '\u6d4f\u89c8\u5668\u81ea\u52a8\u5316',
    descriptionZh: 'Anti Detect Browser\uff1a\u901a\u8fc7 Playwright API \u9a71\u52a8\u5e94\u7528\u8bbe\u5907\u6307\u7eb9\u3001\u6301\u4e45\u5316\u9694\u79bb\u914d\u7f6e\u6587\u4ef6\u548c\u72ec\u7acb\u4ee3\u7406\u7684 Chromium \u6d4f\u89c8\u5668\u3002',
    useCases: ['\u4fdd\u6301\u81ea\u52a8\u5316\u4f1a\u8bdd\u7684\u767b\u5f55\u72b6\u6001', '\u9694\u79bb\u591a\u4e2a\u81ea\u6709\u8d26\u53f7\u6216\u6d4b\u8bd5\u8eab\u4efd', '\u5728\u4e0d\u540c\u5730\u533a\u68c0\u67e5\u5e7f\u544a\u6216\u4ef7\u683c\u5c55\u793a'],
  }],
  ['antibrow/anti-detect-browser-skills/browser-mcp-agent', {
    category: '\u6d4f\u89c8\u5668\u81ea\u52a8\u5316',
    descriptionZh: 'Browser Mcp Agent\uff1a\u901a\u8fc7 MCP \u5de5\u5177\u8c03\u7528\u5411 Agent \u63d0\u4f9b\u6301\u4e45\u5316\u6d4f\u89c8\u5668\uff0c\u652f\u6301\u5bfc\u822a\u3001\u70b9\u51fb\u3001\u8f93\u5165\u3001\u622a\u56fe\u3001\u6587\u672c\u63d0\u53d6\u548c JavaScript \u6267\u884c\u3002',
    useCases: ['\u8ba9 Agent \u64cd\u4f5c\u7f51\u7ad9\u4e0e\u8868\u5355', '\u5728\u591a\u6b21\u4efb\u52a1\u4e4b\u95f4\u4fdd\u6301\u767b\u5f55\u4f1a\u8bdd', '\u63d0\u53d6\u9875\u9762\u6587\u672c\u6216\u8fdb\u884c\u622a\u56fe\u68c0\u67e5'],
  }],
  ['vercel-labs/agent-skills/vercel-composition-patterns', {
    category: '\u8bbe\u8ba1\u4e0e\u524d\u7aef',
    descriptionZh: 'Vercel Composition Patterns\uff1a\u6574\u7406\u53ef\u6269\u5c55\u7684 React \u7ec4\u5408\u6a21\u5f0f\uff0c\u7528\u4e8e\u91cd\u6784\u5e03\u5c14\u5c5e\u6027\u8fc7\u591a\u7684\u7ec4\u4ef6\u3001\u8bbe\u8ba1\u7ec4\u4ef6\u5e93 API \u548c\u590d\u7528\u7ec4\u4ef6\u67b6\u6784\u3002',
    useCases: ['\u91cd\u6784\u5e03\u5c14\u5c5e\u6027\u8fc7\u591a\u7684 React \u7ec4\u4ef6', '\u8bbe\u8ba1\u590d\u5408\u7ec4\u4ef6\u6216 render props API', '\u4f7f\u7528 Context Provider \u7ec4\u7ec7\u53ef\u590d\u7528\u7ec4\u4ef6'],
  }],
  ['higgsfield-ai/skills/higgsfield-brandkit', {
    category: '\u54c1\u724c\u4e0e\u8bbe\u8ba1',
    descriptionZh: 'Higgsfield Brandkit\uff1a\u901a\u8fc7 Higgsfield CLI \u4e0e\u672c\u5730\u5de5\u5177\u521b\u5efa\u548c\u6269\u5c55\u54c1\u724c\u89c6\u89c9\u7cfb\u7edf\uff0c\u8986\u76d6\u8272\u677f\u3001SVG \u6807\u5fd7\u3001\u6392\u7248\u3001\u6837\u673a\u548c\u54c1\u724c\u624b\u518c\u3002',
    useCases: ['\u521b\u5efa\u54c1\u724c\u89c6\u89c9\u8bc6\u522b\u4e0e\u6807\u5fd7', '\u751f\u6210\u5305\u88c5\u3001\u6807\u724c\u548c\u793e\u4ea4\u7d20\u6750', '\u5bfc\u51fa\u53ef\u7f16\u8f91\u7684 PPTX/PDF \u54c1\u724c\u624b\u518c'],
  }],
  ['higgsfield-ai/skills/higgsfield-youtube-thumbnail', {
    category: '\u56fe\u50cf\u4e0e\u591a\u5a92\u4f53',
    descriptionZh: 'Higgsfield Youtube Thumbnail\uff1a\u901a\u8fc7 Higgsfield CLI \u521b\u5efa YouTube \u7f29\u7565\u56fe\u548c\u7ad6\u5c4f\u89c6\u9891\u5c01\u9762\uff0c\u53ef\u4fdd\u7559\u53c2\u8003\u4eba\u7269\u8eab\u4efd\u3001\u52a0\u5165\u6807\u5fd7\u5e76\u751f\u6210\u53ef\u63a7\u53d8\u4f53\u3002',
    useCases: ['\u5236\u4f5c YouTube \u89c6\u9891\u7f29\u7565\u56fe', '\u751f\u6210 Shorts \u6216 Instagram \u7ad6\u5c4f\u5c01\u9762', '\u5728\u5c01\u9762\u4e2d\u4fdd\u7559\u4eba\u7269\u8eab\u4efd\u548c\u54c1\u724c\u6807\u5fd7'],
  }],
  ['heygen-com/hyperframes/talking-head-recut', {
    category: '\u52a8\u6548\u4e0e\u89c6\u9891',
    descriptionZh: 'Talking Head Recut\uff1a\u6839\u636e\u8f6c\u5199\u65f6\u5e8f\uff0c\u4e3a\u73b0\u6709\u53e3\u64ad\u3001\u8bbf\u8c08\u6216\u64ad\u5ba2\u89c6\u9891\u53e0\u52a0\u52a8\u6001\u6807\u9898\u3001\u5b57\u5e55\u6761\u3001\u6570\u636e\u5361\u3001\u5f15\u8bed\u548c\u753b\u4e2d\u753b\u3002',
    useCases: ['\u4e3a\u53e3\u64ad\u89c6\u9891\u6dfb\u52a0\u5b57\u5e55\u6761\u548c\u52a8\u6001\u6807\u9898', '\u6309\u8f6c\u5199\u5185\u5bb9\u540c\u6b65\u6570\u636e\u6216\u5f15\u8bed\u5361\u7247', '\u5c06\u957f\u89c6\u9891\u9002\u914d 16:9\u30019:16 \u6216 4:5 \u753b\u5e03'],
  }],
  ['google/agents-cli/google-agents-cli-eval', {
    category: 'Agent 评测',
    descriptionZh: 'Google Agents Cli Eval：评测 Google ADK Agent，覆盖评测数据集、指标、LLM-as-judge 评分、结果比较与失败原因分析。',
    useCases: ['为 ADK Agent 编写评测数据集', '比较评测结果并分析失败原因', '依据评测指标优化 Agent'],
  }],
  ['2dmurali/review-loop-skill/review-loop', {
    category: 'Agent 工作流',
    descriptionZh: 'Review Loop：让执行者与批评子 Agent 迭代评分和修改，直到达到设定的质量门槛。',
    useCases: ['迭代完善功能实现', '审查并改进规格或代码', '在质量优先任务中设置通过门槛'],
  }],
  ['stablyai/orca/computer-use', {
    category: '桌面自动化',
    descriptionZh: 'Computer Use：通过 Orca CLI、无障碍树和截图检查并操作本地桌面应用窗口。',
    useCases: ['读取桌面应用的可见界面状态', '点击、输入、滚动或拖动应用控件', '操作浏览器窗口、WebView 或 Orca 界面'],
  }],
  ['magentosh/skills/web-search', {
    category: '网页搜索与研究',
    descriptionZh: 'Web Search：通过 inference.sh CLI 调用 Tavily 与 Exa 的网页搜索、内容提取和直接回答能力。',
    useCases: ['执行网页搜索与事实核查', '提取公开网页内容', '为研究或 RAG 流程收集资料'],
  }],
  ['magentosh/skills/remotion-render', {
    category: '动效与视频',
    descriptionZh: 'Remotion Render：通过 inference.sh 将 React/Remotion TSX 组件渲染为可配置分辨率、帧率、时长和编码的 MP4。',
    useCases: ['把 Remotion 组件代码渲染为视频', '制作数据驱动或程序化动画', '配置视频分辨率、帧率和编码'],
  }],
  ['dietrichgebert/ponytail/ponytail', {
    category: '开发与工程',
    descriptionZh: 'Ponytail：在编码、重构和审查中优先选择能完成任务的最小方案，减少不必要的依赖、样板和过度设计。',
    useCases: ['为编码任务选择最简单可行方案', '重构过度复杂或样板过多的实现', '评估是否应引入新依赖或自定义代码'],
  }],
  ['better-auth/skills/better-auth-best-practices', {
    category: '身份与访问管理',
    descriptionZh: 'Better Auth Best Practices：配置 Better Auth 服务端与客户端、数据库适配器、会话、插件和环境变量。',
    useCases: ['为 TypeScript 应用配置 Better Auth', '接入邮箱密码或 OAuth 登录', '管理会话、插件与数据库适配器'],
  }],
  ['mattpocock/skills/writing-for-agents', {
    category: 'Agent 工作流',
    descriptionZh: 'Writing For Agents：编写或编辑供 Agent 使用的文档，包括 Skill、AGENTS.md 与 CLAUDE.md。',
    useCases: ['编写 Agent Skill 说明', '维护 AGENTS.md 规则', '编辑 CLAUDE.md 工作指引'],
  }],
  ['mattpocock/skills/wait-what', {
    category: '沟通与表达',
    descriptionZh: 'Wait What：当上一条表达未被理解时，重新组织并再次说明同一信息。',
    useCases: ['重述未被理解的说明', '调整表达角度与措辞', '为同一观点提供更清晰版本'],
  }],
  ['emilkowalski/skills/animate', {
    category: '设计与前端',
    descriptionZh: 'Animate：从动效目的、工具、属性、曲线、时长、中断与退出方式出发设计并实现界面动画。',
    useCases: ['为组件添加界面动效', '实现页面或状态转场', '选择动画曲线、时长与中断行为'],
  }],
  ['autonnel/autonnel-skills/sales-funnel-blueprint', {
    category: '营销与增长',
    descriptionZh: 'Sales Funnel Blueprint：把产品报价整理为逐页销售漏斗规格，包含价格阶梯、文案大纲与各阶段指标。',
    useCases: ['规划销售或营销漏斗页面', '设计引流品、Webinar 或 VSL 流程', '定义漏斗各阶段目标指标'],
  }],
  ['autonnel/autonnel-skills/server-side-conversion-tracking', {
    category: '营销与增长',
    descriptionZh: 'Server Side Conversion Tracking：为 Facebook、TikTok、Google 与 Bing 配置服务端转化上报，减少广告拦截与 Cookie 丢失造成的漏报。',
    useCases: ['接入服务端转化 API', '传递广告点击标识', '核对平台转化与真实订单差异'],
  }],
  ['autonnel/autonnel-skills/landing-page-conversion-audit', {
    category: '营销与增长',
    descriptionZh: 'Landing Page Conversion Audit：审查落地页、销售页或结账页的转化流失点，并按预期收入影响排列修复项。',
    useCases: ['审查落地页转化问题', '定位结账流程流失点', '按收入影响排序 CRO 修复项'],
  }],
  ['liarjsdev/liarjs-skills/browser-fingerprint-audit', {
    category: '浏览器安全',
    descriptionZh: 'Browser Fingerprint Audit：使用 liarjs 检查浏览器 Canvas、WebGL、WebGPU、音频、字体、WebRTC 与时区指纹的一致性。',
    useCases: ['检查浏览器指纹内部一致性', '比较模拟配置与真实浏览器', '评估 Canvas 或 WebGL 指纹稳定性'],
  }],
  ['liarjsdev/liarjs-skills/fingerprint-ci-gate', {
    category: '测试与质量',
    descriptionZh: 'Fingerprint CI Gate：保存 liarjs 指纹基线并在 CI 中比较后续扫描，当一致性分数低于阈值时阻断构建。',
    useCases: ['在 CI 中检查指纹回归', '比较不同提交的指纹评分', '为 Chromium 或抓取环境设置质量门槛'],
  }],
  ['autonnel/autonnel-skills/funnel-platform-picker', {
    category: '营销与增长',
    descriptionZh: 'Funnel Platform Picker：比较销售漏斗与落地页平台的总成本、锁定风险和自托管取舍。',
    useCases: ['选择销售漏斗平台', '比较商业工具与自托管方案', '评估迁移成本与供应商锁定'],
  }],
  ['liarjsdev/liarjs-skills/playwright-stealth-verify', {
    category: '浏览器安全',
    descriptionZh: 'Playwright Stealth Verify：用 liarjs 检查 Playwright、Puppeteer、Selenium 或 CDP 浏览器的指纹一致性与自动化暴露信号。',
    useCases: ['衡量自动化浏览器指纹质量', '检查 webdriver 与 HeadlessChrome 信号', '在测试中断言指纹一致性'],
  }],
  ['liarjsdev/liarjs-skills/fingerprint-failure-triage', {
    category: '浏览器安全',
    descriptionZh: 'Fingerprint Failure Triage：解读 liarjs 指纹报告，把失败项归因到启动配置、页面修改层、网络路径或机器镜像。',
    useCases: ['解释低分指纹扫描', '定位指纹失败信号来源', '区分无头或数据中心环境固有限制'],
  }],
  ['autonnel/autonnel-skills/post-purchase-upsell-flow', {
    category: '电商与增长',
    descriptionZh: 'Post Purchase Upsell Flow：设计一键购后加售与降售流程，在不影响主结账转化的前提下提高客单价。',
    useCases: ['设计购后加售或交叉销售', '构建一键 upsell/downsell 流程', '优化感谢页收入贡献'],
  }],
  ['google/skills/gke-cluster-autoscaler', {
    category: '云平台与运维',
    descriptionZh: 'Gke Cluster Autoscaler：启用、优化并排查 GKE 集群与节点池自动扩缩容，包括容量缓冲和区域资源不足问题。',
    useCases: ['配置 GKE 节点自动扩缩容', '排查节点无法扩容或缩容', '处理区域容量不足与缓冲策略'],
  }],
  ['google/skills/data-manager-api-event-ingestion', {
    category: '营销数据集成',
    descriptionZh: 'Data Manager Api Event Ingestion：通过 Google Data Manager API /v1/events/ingest 接口上传离线转化、线索增强转化及 Web 或 App 事件。',
    useCases: ['上传离线与点击转化', '接入线索增强转化', '摄取 Google Analytics Web 或 App 事件'],
  }],
  ['google/skills/data-manager-api-audience-ingestion', {
    category: '营销数据集成',
    descriptionZh: 'Data Manager Api Audience Ingestion：通过 Google Data Manager API 添加、移除、清空或替换 Customer Match 等受支持受众成员。',
    useCases: ['上传 Customer Match 受众', '移除指定受众成员', '清空或替换完整受众'],
  }],
  ['anthropics/defending-code-reference-harness/threat-model', {
    category: '安全与合规',
    descriptionZh: 'Threat Model：通过访谈、代码与历史漏洞材料或两者结合，为目标代码库建立结构化威胁模型。',
    useCases: ['梳理代码库攻击面', '从代码与历史漏洞引导威胁模型', '结合应用负责人访谈补充风险'],
  }],
  ['anthropics/defending-code-reference-harness/vuln-scan', {
    category: '安全与合规',
    descriptionZh: 'Vuln Scan：对目标目录执行只读静态漏洞审查，按关注领域汇总为结构化发现文件。',
    useCases: ['静态审查源代码安全问题', '按威胁模型聚焦漏洞扫描', '生成待分诊的漏洞发现清单'],
  }],
  ['google/skills/data-manager-api-setup', {
    category: '开发与工程',
    descriptionZh: 'Data Manager Api Setup：设置 Google Data Manager API 客户端库、本地环境、身份验证与访问权限。',
    useCases: ['安装 Data Manager API 客户端库', '配置本地身份验证', '准备 API 访问环境'],
  }],
  ['anthropics/defending-code-reference-harness/triage', {
    category: '安全与合规',
    descriptionZh: 'Triage：验证批量安全发现、合并重复项、按可利用性重排，并为需要处理的事项标记负责人。',
    useCases: ['验证扫描器安全发现', '合并重复漏洞并重排优先级', '整理需要工程处理的安全积压'],
  }],
  ['anthropics/defending-code-reference-harness/patch', {
    category: '安全与合规',
    descriptionZh: 'Patch：根据已验证或已分诊的安全发现生成候选修复和供人工审查的惰性差异文件。',
    useCases: ['为已验证漏洞生成候选修复', '让独立审查者复核补丁', '输出供人工审核的安全修复差异'],
  }],
  ['anthropics/defending-code-reference-harness/quickstart', {
    category: '文档与知识',
    descriptionZh: 'Quickstart：从该仓库自身文档与源码回答入门问题、标注查阅位置，并引导用户执行下一步。',
    useCases: ['了解仓库的首次运行流程', '查询仓库功能与使用方式', '从本仓库资料定位下一步命令'],
  }],
  ['google/skills/google-mobile-ads-get-started', {
    category: '移动广告开发',
    descriptionZh: 'Google Mobile Ads Get Started：在 Android、iOS 或 Unity 应用中集成和配置 Google Mobile Ads SDK、AdMob 或 Ad Manager。',
    useCases: ['在移动应用中接入 GMA SDK', '配置 AdMob 或 Ad Manager', '迁移到 GMA Next-Gen SDK'],
  }],
  ['google/skills/ima-sdk-basics', {
    category: '移动广告开发',
    descriptionZh: 'Ima Sdk Basics：使用 Google IMA SDK 与 VAST 或 VMAP，在网站、应用和电视端实施客户端视频广告插入。',
    useCases: ['在客户端请求视频广告', '接入 VAST 或 VMAP 广告源', '为网站、应用或电视端配置 IMA SDK'],
  }],
  ['google/skills/google-mobile-ads-banner', {
    category: '移动广告开发',
    descriptionZh: 'Google Mobile Ads Banner：在 Android 与 iOS 应用中实现、集成和配置 Google Mobile Ads 横幅广告。',
    useCases: ['在 Android 应用接入横幅广告', '在 iOS 应用接入横幅广告', '配置 GMA banner 展示'],
  }],
  ['google/skills/cloud-logging-query-generation', {
    category: '可观测性',
    descriptionZh: 'Cloud Logging Query Generation：把自然语言需求转换为 Google Cloud Logging 的 Logging Query Language 查询。',
    useCases: ['生成 Cloud Logging 查询', '按 Google Cloud 服务筛选日志', '为故障排查构造 LQL 条件'],
  }],
  ['google/skills/google-mobile-ads-interstitial', {
    category: '移动广告开发',
    descriptionZh: 'Google Mobile Ads Interstitial：在 Android 与 iOS 应用中实现、集成和配置 Google Mobile Ads 插屏广告。',
    useCases: ['在 Android 应用接入插屏广告', '在 iOS 应用接入插屏广告', '配置普通 interstitial 展示'],
  }],
  ['github/awesome-copilot/build-evidence-map', {
    category: '研究与决策',
    descriptionZh: 'Build Evidence Map：为存在争议的技术选择或重要决策建立可审计证据图，保留支持、反对、限定与缺失证据的精确来源位置。',
    useCases: ['审查有争议的技术选择', '为提案建立证据映射', '保留相互矛盾及缺失证据'],
  }],
  ['github/awesome-copilot/verify-agent-action', {
    category: '安全与合规',
    descriptionZh: 'Verify Agent Action：在执行前审查高影响 Agent 操作或人工审批包，核对动作参数、证据、时效与审批范围，但不执行或授权动作。',
    useCases: ['审查高影响工具或命令操作', '核对审批是否匹配具体动作', '识别伪造、重放或过期证据'],
  }],
  ['firecrawl/anydoc/convert-documents-to-markdown', {
    category: '文档转换',
    descriptionZh: 'Convert Documents To Markdown：把 Word、PowerPoint、Excel、OpenDocument、RTF、EPUB、CSV 与 PDF 转换为 GitHub 风格 Markdown。',
    useCases: ['将办公文档转为 Markdown', '提取演示文稿或表格内容', '把 PDF 或电子书转换为可读文本'],
  }],
  ['microsoft/azure-skills/azure-reliability', {
    category: '云平台与运维',
    descriptionZh: 'Azure Reliability：评估并改善 Azure Functions 与 App Service 应用的可靠性，检查可用区冗余、ZRS 存储、健康探针和多区域故障转移。',
    useCases: ['评估 Azure PaaS 应用的可靠性', '检查区域冗余与健康探针配置', '规划多区域故障转移与分阶段整改'],
  }],
  ['microsoft/azure-skills/python-appservice-deploy', {
    category: '云平台与运维',
    descriptionZh: 'Python Appservice Deploy：将 Flask、Django 或 FastAPI 应用部署到 Azure App Service Linux。',
    useCases: ['把 Flask 应用部署到 App Service', '发布 Django 或 FastAPI 服务', '核对 Python App Service 部署配置'],
  }],
  ['cloudflare/skills/cloudflare', {
    category: '云平台与运维',
    descriptionZh: 'Cloudflare：覆盖 Workers、Pages、KV、D1、R2、Workers AI、网络、安全与基础设施即代码等 Cloudflare 平台开发任务。',
    useCases: ['开发 Cloudflare Workers 或 Pages 应用', '使用 KV、D1 或 R2 等存储服务', '配置 Cloudflare 网络、安全或基础设施资源'],
  }],
  ['cloudflare/skills/wrangler', {
    category: '云平台与运维',
    descriptionZh: 'Wrangler：使用 Cloudflare Workers CLI 开发、部署和管理 Workers 及其存储、AI、队列、工作流和密钥等资源。',
    useCases: ['本地开发和部署 Cloudflare Workers', '管理 KV、R2、D1 或 Vectorize', '配置队列、工作流和密钥资源'],
  }],
  ['cloudflare/skills/workers-best-practices', {
    category: '开发与工程',
    descriptionZh: 'Workers Best Practices：按生产最佳实践编写或审查 Cloudflare Workers 代码与 wrangler.jsonc 配置。',
    useCases: ['编写新的 Cloudflare Worker', '审查流式响应、全局状态和异步任务问题', '检查绑定、密钥与可观测性配置'],
  }],
  ['cloudflare/skills/cloudflare-email-service', {
    category: '通信与消息',
    descriptionZh: 'Cloudflare Email Service：通过 Email Sending 与 Email Routing 收发事务邮件，并支持 Workers 绑定或 REST API 集成。',
    useCases: ['在 Workers 或服务端应用发送事务邮件', '配置 Cloudflare Email Routing', '检查 SPF、DKIM 与 DMARC 投递配置'],
  }],
  ['cloudflare/skills/web-perf', {
    category: '性能与可观测性',
    descriptionZh: 'Web Perf：使用 Chrome DevTools MCP 分析 Core Web Vitals、渲染阻塞、网络依赖、布局偏移、缓存与可访问性问题。',
    useCases: ['审计网页 Core Web Vitals', '定位渲染阻塞和网络依赖链', '优化页面加载速度与 Lighthouse 指标'],
  }],
  ['cloudflare/skills/durable-objects', {
    category: '云平台与运维',
    descriptionZh: 'Durable Objects：创建和审查 Cloudflare Durable Objects，覆盖有状态协调、RPC、SQLite、闹钟、WebSocket 与测试。',
    useCases: ['构建聊天室、多人游戏或预订系统的有状态协调', '实现 RPC、SQLite 存储或闹钟', '配置 WebSocket 并使用 Vitest 测试 Durable Objects'],
  }],  ['aws/agent-toolkit-for-aws/transitgateway', {
    category: '云平台与运维',
    descriptionZh: 'Transitgateway：配置 AWS Transit Gateway 的 VPC 连接、路由分段、集中出口与检查、跨区域对等和本地网络接入。',
    useCases: ['通过中心路由器连接多个 VPC', '用路由表隔离环境和集中检查流量', '连接本地网络或跨区域 Transit Gateway'],
  }],
  ['aws/agent-toolkit-for-aws/directconnect', {
    category: '云平台与运维',
    descriptionZh: 'Directconnect：配置 AWS Direct Connect 连接、虚拟接口、BGP、Direct Connect Gateway、加密与故障转移。',
    useCases: ['建立数据中心到 AWS 的专线连接', '配置私有、公共或 Transit 虚拟接口', '增强 Direct Connect 加密与容灾'],
  }],
  ['aws/agent-toolkit-for-aws/shieldadvanced', {
    category: '安全与合规',
    descriptionZh: 'Shieldadvanced：配置 AWS Shield Advanced 的 DDoS 防护、应用层自动缓解、健康检测、SRT 支持与保护组。',
    useCases: ['保护面向互联网的 AWS 资源免受 DDoS 攻击', '配置 Route 53 健康检测与主动支持', '审查 DDoS 事件和成本保护申请'],
  }],
  ['aws/agent-toolkit-for-aws/aws-resilience-lifecycle', {
    category: '云平台与运维',
    descriptionZh: 'Aws Resilience Lifecycle：结合 AWS Resilience Hub、Fault Injection Service 与 Application Recovery Controller 管理定义、测试和运行阶段的韧性生命周期。',
    useCases: ['制定端到端 AWS 韧性策略', '把故障模式评估连接到实验验证', '建立恢复控制与持续运营流程'],
  }],
  ['google/skills/google-cloud-global-frontend-configuration', {
    category: '云平台与运维',
    descriptionZh: 'Google Cloud Global Frontend Configuration：设计和部署带 Cloud CDN、Cloud Armor 与 Service Extensions 的 Google Cloud 全球外部应用负载均衡器。',
    useCases: ['规划全球外部应用负载均衡', '生成 Terraform 或 gcloud 部署配置', '检查并修正已部署资源的配置漂移'],
  }],
  ['google/skills/cloud-monitoring-metric-selection', {
    category: '性能与可观测性',
    descriptionZh: 'Cloud Monitoring Metric Selection：检索并识别 Google Cloud 服务或资源的 Cloud Monitoring 指标描述符、类型和取值结构。',
    useCases: ['查找 GCP 服务可用监控指标', '核对指标类型与描述符', '为监控查询选择合适指标'],
  }],
  ['dotnet/skills/dotnet-webapi', {
    category: '开发与工程',
    descriptionZh: 'Dotnet Webapi：创建或修改 ASP.NET Core Web API 端点，并处理 HTTP 语义、OpenAPI 元数据与全局错误响应。',
    useCases: ['添加 Controller 或 Minimal API 端点', '配置 OpenAPI 或 Swagger', '建立全局错误处理中间件'],
  }],
  ['dotnet/skills/migrate-dotnet9-to-dotnet10', {
    category: '开发与工程',
    descriptionZh: 'Migrate Dotnet9 To Dotnet10：把 .NET 9 项目迁移到 .NET 10，并处理运行时、C# 14、ASP.NET Core、EF Core、SDK 与容器相关破坏性变化。',
    useCases: ['升级目标框架到 net10.0', '修复 .NET 10 升级后的构建错误', '更新 CI、Dockerfile 与依赖配置'],
  }],
  ['dotnet/skills/migrate-dotnet10-to-dotnet11', {
    category: '开发与工程',
    descriptionZh: 'Migrate Dotnet10 To Dotnet11：把 .NET 10 项目迁移到预览阶段的 .NET 11，并处理运行时、C# 15、EF Core 与部署环境变化。',
    useCases: ['升级目标框架到 net11.0', '修复 .NET 11 预览版破坏性变化', '更新 CI、Dockerfile 与硬件要求'],
  }],
  ['dotnet/skills/build-perf-diagnostics', {
    category: '性能与可观测性',
    descriptionZh: 'Build Perf Diagnostics：分析 MSBuild 二进制日志，定位目标、任务、分析器、复制操作和并行利用率等构建性能瓶颈。',
    useCases: ['分析 MSBuild 构建耗时', '定位 Roslyn 分析器或目标性能问题', '检查节点利用率和重复复制任务'],
  }],
  ['dotnet/skills/binlog-failure-analysis', {
    category: '开发与工程',
    descriptionZh: 'Binlog Failure Analysis：分析现有 MSBuild 二进制日志，诊断控制台输出难以解释的构建失败、级联错误和目标执行顺序。',
    useCases: ['诊断多项目 MSBuild 构建失败', '追踪 Target 执行顺序', '从 binlog 定位不明确的构建错误'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/roguelike', {
    category: '游戏开发',
    descriptionZh: 'Roguelike：构建包含回合制网格移动、程序化地牢、永久死亡、视野和战利品表的 Roguelike 或 Roguelite。',
    useCases: ['制作回合制网格地牢游戏', '生成程序化关卡与战利品', '实现视野和永久死亡机制'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/prototype-fast', {
    category: '游戏开发',
    descriptionZh: 'Prototype Fast：通过限时灰盒原型快速验证单一游戏机制是否有趣，并设置明确的保留或放弃标准。',
    useCases: ['快速验证游戏核心机制', '制作灰盒或垂直切片', '用明确标准决定原型去留'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/godot-shaders', {
    category: '游戏开发',
    descriptionZh: 'Godot Shaders：使用 Godot 4.x 着色语言编写 2D canvas_item 与 3D spatial Shader，包括动画、屏幕读取和旧版迁移。',
    useCases: ['编写 Godot 2D 或 3D 视觉效果', '使用 TIME 与 UV 制作 Shader 动画', '把 Godot 3.x Shader 迁移到 4.x'],
  }],
  ['tradermonty/claude-trading-skills/kanchi-dividend-sop', {
    category: '金融与市场数据',
    descriptionZh: 'Kanchi Dividend Sop：把股息投资方法整理为可重复的美股筛选、深度分析、入场规划与持仓监控流程。',
    useCases: ['筛选股息增长型美股', '评估分红质量与估值', '制定回撤限价和持仓复查计划'],
  }],
  ['tradermonty/claude-trading-skills/kanchi-dividend-review-monitor', {
    category: '金融与市场数据',
    descriptionZh: 'Kanchi Dividend Review Monitor：按强制复查触发条件监控股息组合，把异常分为 OK、WARN 或 REVIEW，但不自动卖出。',
    useCases: ['监控减配与股息安全性', '检查公司治理和异常事件', '生成需要人工判断的 REVIEW 队列'],
  }],
  ['tradermonty/claude-trading-skills/trade-hypothesis-ideator', {
    category: '金融与市场数据',
    descriptionZh: 'Trade Hypothesis Ideator：从市场数据、交易日志和笔记生成可证伪的交易策略假设，并定义实验与终止标准。',
    useCases: ['提出可测试的交易假设', '为策略设计实验与否决条件', '将假设按证据和优先级排序'],
  }],
  ['tradermonty/claude-trading-skills/edge-pipeline-orchestrator', {
    category: '金融与市场数据',
    descriptionZh: 'Edge Pipeline Orchestrator：编排从候选信号发现、策略设计、审查修改到导出的完整交易优势研究流程。',
    useCases: ['协调多阶段交易研究', '串联候选检测与策略设计', '组织审查、修订和结果导出'],
  }],
  ['tradermonty/claude-trading-skills/signal-postmortem', {
    category: '金融与市场数据',
    descriptionZh: 'Signal Postmortem：记录和分析交易信号结果，跟踪误报、遗漏机会和市场状态错配，并反馈模型权重与改进清单。',
    useCases: ['复盘交易信号表现', '记录误报和遗漏机会', '根据结果调整信号权重'],
  }],
  ['stripe/ai/stripe-apps', {
    category: '支付与商业',
    descriptionZh: 'Stripe Apps：构建、修改和审查 Stripe App，覆盖 Dashboard UI 扩展、认证、清单、Webhook、Secret Store 与市场发布。',
    useCases: ['开发 Stripe Dashboard UI 扩展', '配置 stripe-app.yaml 权限与 CSP', '接入认证、Webhook 和市场发布流程'],
  }],
  ['insforge/insforge-skills/insforge', {
    category: '后端与数据库',
    descriptionZh: 'Insforge：使用 InsForge SDK 编写数据库、认证、存储、函数、实时、邮件、支付与 AI 等应用集成功能。',
    useCases: ['实现数据库 CRUD 与认证', '接入存储、实时或服务端函数', '集成邮件、支付或 OpenRouter AI'],
  }],
  ['insforge/insforge-skills/insforge-cli', {
    category: '云平台与运维',
    descriptionZh: 'Insforge Cli：通过 InsForge CLI 管理项目、SQL 迁移、RLS、函数、存储、备份、部署、密钥、日志与后端集成。',
    useCases: ['管理 InsForge 项目与数据库迁移', '配置 RLS、函数、存储和密钥', '执行部署、诊断与备份恢复'],
  }],
  ['insforge/insforge-skills/insforge-debug', {
    category: '测试与质量',
    descriptionZh: 'Insforge Debug：诊断 InsForge 项目的 SDK、HTTP、网关、函数、认证、RLS、实时、查询性能和部署问题，并支持上线前审计。',
    useCases: ['排查 InsForge API 与认证错误', '诊断 RLS、实时或函数故障', '执行安全、性能和上线准备审计'],
  }],
  ['insforge/insforge-skills/insforge-integrations', {
    category: '身份与支付集成',
    descriptionZh: 'Insforge Integrations：把外部身份提供商接入 InsForge 的 JWT RLS，或配置 OKX x402 链上按次付费。',
    useCases: ['接入 Clerk、Auth0 或 WorkOS 身份认证', '为外部 JWT 配置 RLS', '集成 OKX x402 按次付费'],
  }],
  ['jane-o-o-o-o/agent-pulse-skill/agent-pulse', {
    category: '性能与可观测性',
    descriptionZh: 'Agent Pulse：分析本地多种 AI 编码 Agent 日志中的会话、Token、工具调用、模型用量、成本、预算与健康状态。',
    useCases: ['汇总本地 Agent 会话与模型用量', '估算 Token 成本和预算趋势', '检查日志、API、指标导出与 MCP 集成'],
  }],
  ['nomadamas/k-skill/naming-house', {
    category: '生活与文化',
    descriptionZh: 'Naming House：根据出生日期时间、姓氏和候选名，参考四柱五行与姓名学评分推荐合适的韩文名字。',
    useCases: ['根据出生信息推荐韩文名字', '比较候选名字的五行与姓名学评分', '结合姓氏筛选名字方案'],
  }],
  ['juliusbrussee/caveman/caveman-review', {
    category: '代码审查',
    descriptionZh: 'Caveman Review：把代码审查意见压缩为包含位置、问题和修复方式的单行可执行评论。',
    useCases: ['审查 Pull Request 或代码差异', '减少评审评论中的冗余信息', '输出简短明确的修改建议'],
  }],
  ['actionbook/rust-skills/core-dynamic-skills', {
    category: 'Skill 管理',
    descriptionZh: 'Core Dynamic Skills：为 Rust crate Skill 的同步、清理与更新命令提供内部动态管理支持。',
    useCases: ['同步 Rust crate Skills', '清理动态生成的 crate Skills', '更新指定 crate Skill'],
  }],
  ['prime-skills/runcomfy-agent-skills/codex-pet', {
    category: '图像与多媒体',
    descriptionZh: 'Codex Pet：从单张参考图生成 Codex Pet 所需的 spritesheet.webp 与 pet.json，包括九种动画状态。',
    useCases: ['把角色参考图制作成 Codex Pet', '生成兼容的精灵图与配置文件', '制作待机、奔跑、挥手等动画状态'],
  }],
  ['prime-skills/runcomfy-agent-skills/controlnet-pose', {
    category: '图像与多媒体',
    descriptionZh: 'Controlnet Pose：按姿态、骨骼、运动、深度或边缘参考控制图像与视频生成，并根据静帧或视频选择公开模型路线。',
    useCases: ['按 OpenPose 或 DWPose 参考生成图像', '把参考视频运动迁移到目标角色', '使用深度或 Canny 图控制视觉生成'],
  }],
  ['prime-skills/runcomfy-agent-skills/elevenlabs-music-generation', {
    category: '音频与音乐',
    descriptionZh: 'Elevenlabs Music Generation：使用 ElevenLabs Music 根据风格说明与结构化歌词生成完整歌曲或纯音乐。',
    useCases: ['生成歌曲或伴奏', '制作广告短曲、播客片头或游戏循环音乐', '按段落组织主歌、副歌与桥段'],
  }],
  ['prime-skills/runcomfy-agent-skills/image-inpainting', {
    category: '图像与多媒体',
    descriptionZh: 'Image Inpainting：通过蒙版或文字区域说明执行图像局部重绘、对象移除、区域替换与瑕疵清理。',
    useCases: ['移除图片中的对象或水印', '按蒙版替换局部区域', '修复瑕疵或填补缺失画面'],
  }],
  ['prime-skills/runcomfy-agent-skills/lipsync', {
    category: '图像与多媒体',
    descriptionZh: 'Lipsync：把人像或现有视频中的面部口型与指定音轨同步，并按输入类型选择相应公开模型。',
    useCases: ['让人像按音频生成说话视频', '为现有视频替换并同步配音', '从脚本生成并同步角色口型'],
  }],
  ['prime-skills/runcomfy-agent-skills/video-inpainting', {
    category: '图像与多媒体',
    descriptionZh: 'Video Inpainting：跨视频帧执行区域编辑，用于移除对象、水印或线缆，以及替换需保持运动一致的区域。',
    useCases: ['移除视频中的持续对象或水印', '跨帧清理画面区域', '替换区域并保持动作连续'],
  }],
  ['prime-skills/runcomfy-agent-skills/wan-2-7', {
    category: '图像与多媒体',
    descriptionZh: 'Wan 2 7：使用 Wan 2.7 生成文字视频，并支持多参考条件、音频驱动口型、分辨率与画幅配置。',
    useCases: ['根据文字生成视频', '使用参考素材控制视频生成', '配置音频、时长、分辨率与画幅'],
  }],
  ['skills-101/superpowers/web-search', {
    category: '搜索与研究', descriptionZh: 'Web Search：通过 inference.sh 调用 Tavily 与 Exa 的搜索、内容提取和直接回答能力。',
    useCases: ['执行网页搜索', '提取公开网页内容', '为研究任务收集来源资料'],
  }],
  ['skills-101/superpowers/remotion-render', {
    category: '图像与多媒体', descriptionZh: 'Remotion Render：把 React 与 Remotion 的 TSX 组件渲染为可配置分辨率、帧率、时长和编码的 MP4。',
    useCases: ['将 Remotion 组件渲染为视频', '制作程序化动画', '配置视频分辨率、帧率与编码'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/godot-animation', {
    category: '游戏开发', descriptionZh: 'Godot Animation：使用 Godot 4.7 的 AnimationPlayer、AnimationTree 或 Tween 制作关键帧、状态机和程序动画。',
    useCases: ['制作关键帧动画', '搭建角色动画状态机', '用 Tween 实现程序化过渡'],
  }],
  ['google/skills/gke-workload-scaling', {
    category: '云平台与运维', descriptionZh: 'Gke Workload Scaling：使用 HPA 与 VPA 管理 GKE 工作负载扩缩，并应用资源请求与自动扩缩最佳实践。',
    useCases: ['配置水平 Pod 自动扩缩', '配置垂直 Pod 自动扩缩', '优化 GKE 工作负载资源请求'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/godot-ui-control', {
    category: '游戏开发', descriptionZh: 'Godot Ui Control：使用 Godot 4.7 Control、Container 与 Theme 资源构建响应式游戏界面。',
    useCases: ['搭建 Godot 游戏菜单', '用容器组织响应式布局', '配置 Theme 与输入焦点'],
  }],
  ['aws/agent-toolkit-for-aws/migrating-to-amazon-redshift', {
    category: '数据平台', descriptionZh: 'Migrating To Amazon Redshift：指导数据仓库迁移到 Amazon Redshift，覆盖发现、模式与 SQL 转换、数据迁移、验证和性能比较。',
    useCases: ['评估现有数据仓库迁移', '转换模式、SQL 与存储过程', '验证迁移数据和查询性能'],
  }],
  ['tradermonty/claude-trading-skills/edge-signal-aggregator', {
    category: '交易研究', descriptionZh: 'Edge Signal Aggregator：汇总多个交易优势发现流程的信号，并按确信度排序形成优先级看板。',
    useCases: ['聚合多来源交易信号', '按确信度排序候选', '形成优先研究清单'],
  }],
  ['tradermonty/claude-trading-skills/exposure-coach', {
    category: '交易研究', descriptionZh: 'Exposure Coach：综合市场状态生成一页式仓位姿态摘要，给出净敞口上限、风格偏向、市场广度与新开仓建议。',
    useCases: ['制定净敞口上限', '判断成长与价值风格偏向', '评估新开仓或现金优先'],
  }],
  ['dotnet/skills/build-parallelism', {
    category: '开发与工程', descriptionZh: 'Build Parallelism：诊断 MSBuild 多项目构建并行度不足，并定位未充分利用 CPU 的目标与项目依赖。',
    useCases: ['诊断多项目构建过慢', '检查 MSBuild 并行配置', '定位限制并行度的依赖关系'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/platformer', {
    category: '游戏开发', descriptionZh: 'Platformer：构建含土狼时间、跳跃缓冲、可变跳跃高度、瓦片关卡与危险物的 2D 平台游戏。',
    useCases: ['实现平台角色移动与跳跃', '搭建瓦片关卡', '配置危险物与检查点'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/godot-physics', {
    category: '游戏开发', descriptionZh: 'Godot Physics：使用 Godot 4.7 的 2D/3D 物理体、碰撞层与遮罩、接触信号和射线检测。',
    useCases: ['配置角色与刚体碰撞', '设置碰撞层和遮罩', '实现区域检测与射线查询'],
  }],
  ['actionbook/rust-skills/core-fix-skill-docs', {
    category: '文档与知识', descriptionZh: 'Core Fix Skill Docs：检查并修复生成的 Rust Skill 文档引用，仅用于明确触发的内部文档维护。',
    useCases: ['检查 Rust Skill 文档引用', '修复生成文档中的失效链接', '维护内部 Skill 文档一致性'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/puzzle', {
    category: '游戏开发', descriptionZh: 'Puzzle：构建基于网格或棋盘状态的解谜游戏，覆盖移动输入、规则结算、计分与撤销。',
    useCases: ['制作三消或推箱子玩法', '实现棋盘规则结算', '加入计分和撤销机制'],
  }],
  ['aws/agent-toolkit-for-aws/resilience-program-design', {
    category: '云平台与运维', descriptionZh: 'Resilience Program Design：为组织、团队或产品组合设计分层韧性计划，统一可用性、RTO 与 RPO 目标和治理方式。',
    useCases: ['建立分层韧性策略', '统一可用性与恢复目标', '规划组织级韧性治理'],
  }],
  ['gamedev-skills/awesome-gamedev-agent-skills/visual-novel', {
    category: '游戏开发', descriptionZh: 'Visual Novel：构建含分支剧本、角色与背景、选项、存档、回看及跳过功能的视觉小说。',
    useCases: ['实现分支叙事', '制作角色与背景演出', '加入存档、回看和自动播放'],
  }],
  ['juliusbrussee/caveman/caveman-commit', {
    category: '开发与工程', descriptionZh: 'Caveman Commit：生成压缩且保留意图与理由的 Conventional Commits 提交信息。',
    useCases: ['生成简洁提交标题', '按需保留变更理由', '统一 Conventional Commits 格式'],
  }],
  ['juliusbrussee/caveman/caveman-help', {
    category: 'Agent 工作流', descriptionZh: 'Caveman Help：展示 Caveman 模式、Skill 与命令的快速参考卡。',
    useCases: ['查看 Caveman 可用命令', '查找模式与 Skill 用法', '快速回顾触发方式'],
  }],
  ['prime-skills/runcomfy-agent-skills/ace-step', {
    category: '音频与音乐', descriptionZh: 'Ace Step：通过 RunComfy 使用 ACE Step 生成、局部续写和扩展音乐，并按标签控制风格与编曲。',
    useCases: ['按标签生成音乐', '局部重绘音乐片段', '扩展现有音乐'],
  }],
  ['prime-skills/runcomfy-agent-skills/ai-music', {
    category: '音频与音乐', descriptionZh: 'Ai Music：通过 RunComfy 在公开说明列出的音乐模型间路由，生成含人声或纯音乐的音轨。',
    useCases: ['生成带人声歌曲', '制作纯音乐配乐', '按需求选择音乐模型'],
  }],
  ['prime-skills/runcomfy-agent-skills/face-swap', {
    category: '图像与多媒体', descriptionZh: 'Face Swap：通过 RunComfy 在图像或视频中替换人物面部或角色身份，并按输入类型选择模型。',
    useCases: ['替换静态图人物面部', '在视频中保持角色身份', '按素材类型选择换脸模型'],
  }],
  ['prime-skills/runcomfy-agent-skills/flux-kontext', {
    category: '图像与多媒体', descriptionZh: 'Flux Kontext：通过 RunComfy 使用 FLUX.1 Kontext Pro 对图像进行局部和指令式编辑。',
    useCases: ['按文字指令编辑图像', '局部替换画面内容', '保持未编辑区域一致'],
  }],
  ['prime-skills/runcomfy-agent-skills/gpt-image-2', {
    category: '图像与多媒体', descriptionZh: 'Gpt Image 2：通过 RunComfy 使用 GPT Image 2 生成和编辑图像，侧重文字、标志与多语言排版。',
    useCases: ['生成含文字的图片', '制作标志与版式素材', '按指令编辑现有图像'],
  }],
  ['prime-skills/runcomfy-agent-skills/gpt-image-edit', {
    category: '图像与多媒体', descriptionZh: 'Gpt Image Edit：通过 RunComfy 调用 GPT Image 2 编辑端点，按指令修改现有图像。',
    useCases: ['局部修改现有图片', '替换背景或对象', '调整图像中的文字与版式'],
  }],
  ['prime-skills/runcomfy-agent-skills/happyhorse-1-0', {
    category: '图像与多媒体', descriptionZh: 'Happyhorse 1 0：通过 RunComfy 使用 HappyHorse 1.0 生成原生 1080p、带同步音频的文生视频。',
    useCases: ['生成短视频', '制作带同步音频的视频', '按提示控制镜头与内容'],
  }],
  ['prime-skills/runcomfy-agent-skills/image-edit', {
    category: '图像与多媒体', descriptionZh: 'Image Edit：根据编辑意图在 RunComfy 图像模型目录中选择合适端点并修改现有图片。',
    useCases: ['按意图选择图像编辑模型', '修改主体或背景', '处理多图输入编辑'],
  }],
  ['prime-skills/runcomfy-agent-skills/kling-3-0', {
    category: '图像与多媒体', descriptionZh: 'Kling 3 0：通过 RunComfy 使用 Kling 3.0 生成多镜头、原生同步音频的视频。',
    useCases: ['生成多镜头视频', '制作带同步音频的内容', '保持镜头间主体一致'],
  }],
  ['prime-skills/runcomfy-agent-skills/nano-banana-edit', {
    category: '图像与多媒体', descriptionZh: 'Nano Banana Edit：通过 RunComfy 使用 Nano Banana 2 编辑图像，支持主体身份保持、背景替换与局部修改。',
    useCases: ['保持主体身份进行编辑', '替换图片背景', '局部修改画面元素'],
  }],
  ['prime-skills/runcomfy-agent-skills/relight', {
    category: '图像与多媒体', descriptionZh: 'Relight：通过 RunComfy 改变静态图的光照方向、色温和氛围。',
    useCases: ['调整人像或商品光照', '改变画面色温', '重塑光线方向与氛围'],
  }],
  ['prime-skills/runcomfy-agent-skills/runcomfy-cli', {
    category: 'AI 模型与多媒体', descriptionZh: 'Runcomfy Cli：通过统一命令行调用 RunComfy 的图像、视频、音频及相关模型端点。',
    useCases: ['从命令行调用模型', '提交并跟踪生成任务', '统一管理不同媒体端点'],
  }],
  ['prime-skills/runcomfy-agent-skills/seedance-v2', {
    category: '图像与多媒体', descriptionZh: 'Seedance V2：通过 RunComfy 使用 Seedance 2.0 Pro 生成可接收多种参考素材的电影感短视频。',
    useCases: ['生成电影感短视频', '使用图像、视频或音频参考', '控制多镜头叙事'],
  }],
  ['prime-skills/runcomfy-agent-skills/video-edit', {
    category: '图像与多媒体', descriptionZh: 'Video Edit：根据编辑意图在 RunComfy 视频模型目录中选择端点并修改现有视频。',
    useCases: ['按意图选择视频编辑模型', '修改视频主体或环境', '重绘或风格化现有片段'],
  }],
  ['prime-skills/runcomfy-agent-skills/video-extend', {
    category: '图像与多媒体', descriptionZh: 'Video Extend：通过 RunComfy 延长或续写现有视频片段。',
    useCases: ['延长现有视频', '续写片段动作', '保持续写镜头连续性'],
  }],
  ['prime-skills/runcomfy-agent-skills/video-outpainting', {
    category: '图像与多媒体', descriptionZh: 'Video Outpainting：通过 RunComfy 扩展视频画布并补全画外环境，用于横竖屏比例转换。',
    useCases: ['扩展视频画面边界', '将竖屏转换为横屏', '补全画外背景环境'],
  }],
  ['juliusbrussee/caveman/verify-and-stop', {
    category: '测试与质量', descriptionZh: 'Verify And Stop：只验证现有工作是否满足验收条件，通过聚焦的质量门禁提供完成证据，不扩大任务范围。',
    useCases: ['执行仅验证任务', '检查实现是否满足验收条件', '运行与任务直接相关的最终质量门禁'],
  }],
  ['juliusbrussee/caveman/surgical-patch', {
    category: '开发与工程', descriptionZh: 'Surgical Patch：在最窄且负有责任的代码层修复缺陷或小型行为变化，并保留周边行为与回归证据。',
    useCases: ['修复范围明确的缺陷', '为小型行为变化补充回归证明', '避免修改无关代码路径'],
  }],
  ['juliusbrussee/caveman/caveman-evidence-review', {
    category: '性能与可观测性', descriptionZh: 'Caveman Evidence Review：只读审查 Caveman Cloud 中的成本、工作流、追踪、延迟、错误、压缩、路由与已验证节省证据。',
    useCases: ['分析 LLM 成本流向', '检查工作流延迟与错误', '审查追踪和实验节省证据'],
  }],
  ['juliusbrussee/caveman/caveman-discover', {
    category: 'AI 与 Agent 工程', descriptionZh: 'Caveman Discover：发现代码库中的 LLM 工作流并为其标注业务名称，使 Caveman Cloud 能按真实用途归集成本。',
    useCases: ['发现仓库中的 LLM 调用工作流', '为支持回复或定时摘要等流程命名', '按工作流拆分 LLM 成本'],
  }],
  ['juliusbrussee/caveman/lean-build', {
    category: '开发与工程', descriptionZh: 'Lean Build：面向容易过度建设的新功能、产品切片或集成，优先复用仓库能力、严格控制范围并设置停止条件。',
    useCases: ['实现范围明确的新功能', '控制产品切片或集成的过度设计风险', '依据停止条件结束构建'],
  }],
  ['juliusbrussee/caveman/caveman-manage', {
    category: 'AI 与 Agent 工程', descriptionZh: 'Caveman Manage：检查 Caveman Cloud 由评测门禁约束的实验生命周期，在证据和服务端状态门禁完备前阻止危险变更。',
    useCases: ['审查实验当前状态与证据', '判断实验能否批准、晋升或回滚', '阻止缺少权威门禁的生命周期变更'],
  }],
  ['juliusbrussee/caveman/migration', {
    category: '开发与工程', descriptionZh: 'Migration：实施可回滚且保持兼容的模式、数据、API、协议、配置或依赖迁移，并验证旧行为得到保留。',
    useCases: ['规划数据库或模式迁移', '迁移 API、配置或依赖', '验证兼容性并准备回滚路径'],
  }],
  ['juliusbrussee/caveman/caveman-setup', {
    category: '性能与可观测性', descriptionZh: 'Caveman Setup：把当前代码库的 LLM 请求接入 Caveman Cloud 网关，在不改变行为的前提下记录成本、Token 与延迟。',
    useCases: ['为应用接入 LLM 成本观测', '记录请求 Token 与延迟', '通过指定网关和 API 密钥配置 Caveman'],
  }],
  ['jeremylongshore/tons-of-skills-marketplace/backtesting-trading-strategies', {
    category: '金融与市场数据', descriptionZh: 'Backtesting Trading Strategies：用历史数据回测加密资产或传统市场策略，计算 Sharpe、Sortino、最大回撤并比较参数。',
    useCases: ['回测交易策略', '比较信号或策略表现', '优化参数并查看权益曲线'],
  }],
  ['solana-mobile/solana-mobile-skills/seeker-genesis-token', {
    category: '区块链开发', descriptionZh: 'Seeker Genesis Token：结合 Sign-in-with-Solana 与服务端代币校验，验证 Seeker 设备是否持有 SGT。',
    useCases: ['验证 Seeker 设备所有权', '为持有者开放内容或奖励', '实现每台设备一次领取与反女巫检查'],
  }],
  ['solana-mobile/solana-mobile-skills/seeker-domains', {
    category: '区块链开发', descriptionZh: 'Seeker Domains：在 Solana 移动应用中解析和显示 .skr 域名，支持域名到钱包地址及反向查询。',
    useCases: ['在个人资料中显示 .skr 名称', '把 .skr 域名解析为钱包地址', '从钱包地址反查域名'],
  }],
  ['solana-mobile/solana-mobile-skills/integration-privy', {
    category: '身份与访问管理', descriptionZh: 'Integration Privy：在基于 Mobile Wallet Adapter 的 Solana Expo Android 应用中接入 Privy 与 Sign-In-With-Solana。',
    useCases: ['为 Solana Expo 应用接入 Privy 登录', '把钱包关联到现有 Privy 账户', '排查 Privy 与 MWA 集成'],
  }],
  ['riekelt/multi-agent-review/multi-agent-review', {
    category: 'Agent 评测', descriptionZh: 'Multi Agent Review：在执行前让多层级、多主题评审者审查规格或计划，并以阻塞项、警告和观察结果决定是否放行。',
    useCases: ['在编码前审查产品规格', '检查执行计划是否就绪', '对评审分歧引入更高推理层裁决'],
  }],
  ['riekelt/technical-writer/writing-changelogs', {
    category: '文档与知识', descriptionZh: 'Writing Changelogs：在工作交付后编写变更日志、发布说明或已上线内容摘要，并保持表述可核验。',
    useCases: ['撰写版本变更日志', '整理发布说明', '总结本次实际交付内容'],
  }],
  ['riekelt/technical-writer/writing-issues', {
    category: '项目与协作', descriptionZh: 'Writing Issues：把讨论、评审发现或计划整理为可独立理解的 Epic、Story、Task、Bug、Spike 与验收条件。',
    useCases: ['编写缺陷或任务工单', '把计划拆分为可执行 Issue', '补充清晰的验收条件'],
  }],
  ['riekelt/technical-writer/recording-decisions', {
    category: '文档与知识', descriptionZh: 'Recording Decisions：用 ADR 或决策日志记录方案选择、拒绝与替代关系，避免关键理由只留在对话中。',
    useCases: ['编写架构决策记录', '记录方案选择与拒绝理由', '更新被新决定替代的历史决策'],
  }],
  ['riekelt/principal-engineer/principal-engineering', {
    category: '开发与工程', descriptionZh: 'Principal Engineering：为高代价的实现、调试、重构、配置、运维与调查工作建立证据优先、安全约束和变更前检查点。',
    useCases: ['开展非平凡工程变更', '调查系统异常原因', '在修改代码、数据或基础设施前建立证据'],
  }],
  ['riekelt/principal-engineer/testing-changes', {
    category: '测试与质量', descriptionZh: 'Testing Changes：根据功能、缺陷修复或重构的行为变化决定所需测试，并检查断言是否能区分正确与错误实现。',
    useCases: ['为行为变化选择测试范围', '为缺陷补充回归测试', '审查代码差异中的测试充分性'],
  }],
  ['riekelt/principal-engineer/keeping-one-source-of-truth', {
    category: '开发与工程', descriptionZh: 'Keeping One Source Of Truth：在数据、配置、状态、常量或缓存可能重复时，坚持一项事实一个权威来源并优先派生。',
    useCases: ['消除重复配置或状态', '解决两个来源的数据冲突', '判断应派生还是重复存储字段'],
  }],
  ['riekelt/principal-engineer/verifying-before-done', {
    category: '测试与质量', descriptionZh: 'Verifying Before Done：在宣称完成、修复或发布前从实际使用表面驱动变更、运行验证命令并如实报告门禁结果。',
    useCases: ['在完成声明前运行验证', '检查绿色测试是否覆盖真实行为', '如实说明未通过的质量门禁'],
  }],
  ['riekelt/principal-engineer/scoping-changes', {
    category: '项目与协作', descriptionZh: 'Scoping Changes：当修复范围漂移、计划被静默缩减或出现顺手修改时，依据触发原因确定规模并拆分任务。',
    useCases: ['控制修复范围膨胀', '识别低于承诺的缩减', '把大型变化拆成可完成步骤'],
  }],
  ['riekelt/principal-engineer/operating-safely', {
    category: '安全与合规', descriptionZh: 'Operating Safely：在删除、覆盖、重启、终止进程、处理密钥或并发修改共享状态前应用破坏性操作与密钥安全检查。',
    useCases: ['执行不可逆操作前检查目标', '处理共享配置与并发会话', '避免在日志和命令中泄露密钥'],
  }],
  ['riekelt/principal-engineer/handling-failures', {
    category: '开发与工程', descriptionZh: 'Handling Failures：审查异常路径、catch、回退、默认值和重试，防止错误被静默吞掉或降级未被观察。',
    useCases: ['设计显式错误处理', '审查回退与重试逻辑', '避免 null 默认值掩盖故障'],
  }],
  ['riekelt/principal-engineer/grounding-before-coding', {
    category: '开发与工程', descriptionZh: 'Grounding Before Coding：在非平凡修改或故障调查前先映射真实代码与数据、引用证据并确认仓库约定。',
    useCases: ['在陌生代码库中开始变更', '调查间歇性故障', '用代码和数据证据验证实现假设'],
  }],
  ['riekelt/principal-engineer/writing-unit-tests', {
    category: '测试与质量', descriptionZh: 'Writing Unit Tests：按行为组织单元测试，要求一项行为一个测试、确定性设置，并只在不拥有的边界使用 Mock。',
    useCases: ['编写或重构单元测试', '修复不稳定测试', '减少对自有实现细节的 Mock'],
  }],
  ['riekelt/principal-engineer/guarding-architecture', {
    category: '后端与架构', descriptionZh: 'Guarding Architecture：把模块边界、依赖方向和关键路径原则写成有名称、理由及执行手段的结构约束。',
    useCases: ['审查跨模块依赖', '防止临时导入破坏边界', '编写或更新架构原则'],
  }],
  ['dontbesilent2025/dbskill/dbs-jtbd', {
    category: '产品与用户研究', descriptionZh: 'Dbs Jtbd：用 Jobs to Be Done 识别具体情境中的用户进展、方案切换力量与可观察选择标准。',
    useCases: ['澄清用户真正要完成的任务', '分析用户为何切换方案', '用 JTBD 改写产品或 AI 提示词'],
  }],
  ['jeremylongshore/tons-of-skills-marketplace/svg-icon-generator', {
    category: '设计与前端', descriptionZh: 'Svg Icon Generator：根据公开说明生成 SVG 图标相关内容，适用于视觉内容工作中的图标制作。',
    useCases: ['制作 SVG 图标', '生成可缩放界面图形', '为视觉内容准备矢量素材'],
  }],
  ['open-mercato/skills/om-auto-create-pr', {
    category: '开发与工程', descriptionZh: 'Om Auto Create Pr：将自主任务拆成进度计划，在独立 worktree 分阶段实现、验证并提交为 Pull Request，支持长任务续接。',
    useCases: ['把端到端任务交付为 Pull Request', '按阶段实施并运行验证门禁', '续接较长的自动化开发计划'],
  }],
  ['cursor/plugins/maintain-verification-skill', {
    category: '测试与质量', descriptionZh: 'Maintain Verification Skill：定期核对项目验证 Skill 与功能地图，通过源码检查和一次真实会话修正已证实的问题。',
    useCases: ['审计项目验证 Skill', '核对功能地图与当前实现', '为已证实的验证偏差准备修正'],
  }],
  ['dotnet/skills/property-patterns', {
    category: '开发与工程', descriptionZh: 'Property Patterns：处理 MSBuild 属性的条件默认值、组合、路径规范化、TFM 判断与求值顺序。',
    useCases: ['修复 .props 或 .csproj 属性覆盖问题', '处理路径与尾斜杠规范化', '诊断 MSBuild 属性求值顺序'],
  }],
  ['google/skills/developer-device-platform-basics', {
    category: '移动应用开发', descriptionZh: 'Developer Device Platform Basics：管理 Developer Device Platform 上的远程 Android 设备预留、连接隧道、会话状态与租期。',
    useCases: ['预留远程 Android 设备', '建立设备连接隧道', '检查、延长或取消设备租期'],
  }],
  ['jeremylongshore/tons-of-skills-marketplace/mindmap-generator', {
    category: '内容与知识处理', descriptionZh: 'Mindmap Generator：根据公开说明生成思维导图相关内容，用于把主题、概念和层级关系整理为视觉结构。',
    useCases: ['生成主题思维导图', '整理概念层级', '把讨论内容转为可视化结构'],
  }],
  ['dotnet/skills/create-blazor-project', {
    category: '设计与前端', descriptionZh: 'Create Blazor Project：创建新的 ASP.NET Core Blazor Web 应用，并选择 Static SSR、Interactive Server、WebAssembly 或 Auto 渲染模式。',
    useCases: ['初始化 Blazor Web 项目', '选择合适的 Blazor 渲染模式', '搭建新站点的基础工程结构'],
  }],
  ['planetscale/skills/planetscale-best-practices-matrix', {
    category: '数据库与后端', descriptionZh: 'Planetscale Best Practices Matrix：用精简功能矩阵判断不同数据库引擎适用的 PlanetScale 安全、可观测性与自动化建议。',
    useCases: ['按数据库引擎筛选最佳实践', '比较安全与可观测性建议', '规划 PlanetScale 自动化能力'],
  }],
  ['codexthemes/skills/codex-theme-switcher', {
    category: '开发工具', descriptionZh: 'Codex Theme Switcher：从本地 codexthemes 库应用、切换或恢复 Codex 桌面主题，并报告当前主题状态。',
    useCases: ['切换已安装的 Codex 主题', '恢复 Codex 原生外观', '检查当前主题与应用状态'],
  }],
  ['cursor/plugins/teach', {
    category: '文档与知识', descriptionZh: 'Teach：把一段工作背后的做法与原因整合成清晰讲解，帮助读者真正理解变更或子系统。',
    useCases: ['讲解代码变更', '帮助理解一个子系统', '把实现方式与设计原因结合说明'],
  }],
  ['bergside/awesome-design-skills/enterprise', {
    category: '设计与前端', descriptionZh: 'Enterprise：提供深色云平台视觉方向，使用模块化网格、玻璃质感面板和明确的数据层级设计生产力仪表盘。',
    useCases: ['设计深色企业仪表盘', '建立模块化数据网格', '强化云平台界面的信息层级'],
  }],
  ['planetscale/skills/planetscale-postgres-safety-review', {
    category: '数据库与后端', descriptionZh: 'Planetscale Postgres Safety Review：审查 PlanetScale Postgres 的流量控制、查询标签、角色、备份恢复、私网连接与安全 Agent 操作。',
    useCases: ['审查 Postgres 备份与 PITR', '检查角色、pg_strict 与查询标签', '评估私网连接和 Agent 操作安全'],
  }],
  ['planetscale/skills/planetscale-mcp-agent-operating-model', {
    category: 'AI 与 Agent 工程', descriptionZh: 'Planetscale Mcp Agent Operating Model：配置 Agent 使用 PlanetScale MCP、Insights 与模式建议时的安全行为，避免自主修改生产环境。',
    useCases: ['制定 PlanetScale MCP 操作边界', '安全使用 Insights 与模式建议', '防止 Agent 自主变更生产数据库'],
  }],
  ['momentic-ai/skills/mo-qa', {
    category: '测试与质量', descriptionZh: 'Mo Qa：通过 Momentic mo CLI 启动、继续、停止或回应云端自主 QA 会话，并在本地与托管沙箱间传递文件。',
    useCases: ['启动或继续 Momentic QA 会话', '读取并回应 Mo 的状态与输出', '在本地和托管沙箱间移动测试文件'],
  }],
  ['claude-dev-suite/claude-dev-suite/typescript-quality', {
    category: '开发与工程', descriptionZh: 'Typescript Quality：使用 ESLint、Biome 与 TypeScript 严格模式改善 JavaScript/TypeScript 的格式、类型安全和代码质量。',
    useCases: ['配置 ESLint 或 Biome', '启用 TypeScript 严格模式', '审查类型安全与格式规则'],
  }],
  ['forcedotcom/sf-skills/platform-datamask-run', {
    category: '安全与合规', descriptionZh: 'Platform Datamask Run：在 Salesforce 沙箱中配置 PII 脱敏策略、运行和监控 Data Mask 作业，并可中止执行中的任务。',
    useCases: ['配置 Salesforce 沙箱 PII 脱敏', '运行并监控 Data Mask 作业', '报告已脱敏记录或中止任务'],
  }],
  ['forcedotcom/sf-skills/service-itsm-teams-itservice-configure', {
    category: '办公与效率', descriptionZh: 'Service Itsm Teams Itservice Configure：完成 Microsoft Teams Employee Service 的 Salesforce IT Service 设置，包括启用应用、用户权限与 Digital Experience Site。',
    useCases: ['为 Teams 启用 Salesforce IT Service', '分配员工访问权限集', '选择 Digital Experience Site 并检查安装'],
  }],
  ['infisical/ai-skills/infisical-pam', {
    category: '身份与访问管理', descriptionZh: 'Infisical Pam：通过凭证代理、会话记录、即时审批与轮换，为人员和 AI Agent 提供数据库、服务器、Kubernetes 与云账户的特权访问。',
    useCases: ['提供不暴露凭证的基础设施访问', '配置即时访问申请与审批', '记录审计会话并轮换账户凭证'],
  }],
  ['odrobnik/tesla-fleet-api-skill/tesla-fleet-api', {
    category: 'API 与集成', descriptionZh: 'Tesla Fleet Api：接入 Tesla 官方 Fleet API 读取车辆或能源设备数据，并通过官方签名命令流程执行远程控制。',
    useCases: ['读取 Tesla 车辆与能源设备数据', '实现空调预热、唤醒或充电控制', '配置 OAuth、域名公钥与签名命令代理'],
  }],
  ['promovaweb/specsfy/specsfy-aux-rules', {
    category: '开发与工程', descriptionZh: 'Specsfy Aux Rules：发现、整理并记录可持久化的项目规则到 .specsfy/RULES.md，同时保留既有规则且不凭空添加偏好。',
    useCases: ['把反复出现的约定记录为项目规则', '审查规则冲突与重复', '响应上下文监控提出的规则复查'],
  }],
  ['waybarrios/opencode-power-pack/security-review', {
    category: '安全与合规', descriptionZh: 'Security Review：聚焦审查待提交 Git 变更，识别具有真实利用可能性的高置信度安全漏洞，而非执行通用代码评审。',
    useCases: ['在合并前审查安全风险', '检查当前差异中的可利用漏洞', '执行聚焦的变更安全审计'],
  }],
  ['shadcn-ui/ui/migrate-radix-to-base', {
    category: '设计与前端', descriptionZh: 'Migrate Radix To Base：把 React 或 shadcn 项目中的 Radix UI primitives 迁移到 Base UI。',
    useCases: ['迁移 Radix UI 组件', '替换 shadcn 项目的基础组件库', '调整迁移后的 React 组件 API'],  }],]);

const dailySourceAwareOverrides = [
  ['tradermonty/claude-trading-skills/weekly-performance-digest', '金融分析', 'Weekly Performance Digest：汇总交易策略的每周绩效、收益与风险指标，形成周度复盘。', ['整理每周交易绩效', '比较收益与风险变化', '生成策略周报']],
  ['trailofbits/skills/rust-review', '代码审查', 'Rust Review：对 Rust 代码执行聚焦式审查，检查实现风险、错误处理与可维护性。', ['审查 Rust Pull Request', '检查错误处理与边界条件', '评估 Rust 实现的可维护性']],
  ['vaibhav0806/maximem_synap_sdk/synap', '能力待核对', 'Synap：skills.sh 目录当前只能确认 Skill 名称与来源仓库，具体 SDK 能力和适用范围暂无法从排行元数据确认。', ['核对 skills.sh 详情页公开说明', '查看来源 GitHub 仓库的维护信息', '在能力说明补齐后再评估用途']],
  ['bergside/awesome-design-skills/claymorphism', '品牌与设计', 'Claymorphism：以柔和圆角、双层阴影和粘土般立体质感构建 Claymorphism 界面视觉。', ['设计粘土质感卡片与按钮', '为界面建立柔和立体层次', '评估 Claymorphism 风格一致性']],
  ['nomadamas/k-skill/korean-heritage-search', '文化与知识检索', 'Korean Heritage Search：检索并整理韩国文化遗产相关的公开资料与条目。', ['查找韩国文化遗产条目', '整理遗产背景与分类信息', '为文化研究收集公开线索']],
  ['google/skills/cloud-monitoring-list-time-series-request', '性能与可观测性', 'Cloud Monitoring List Time Series Request：组织 Google Cloud Monitoring 时序列表查询的请求参数与过滤条件。', ['查询 Cloud Monitoring 时序指标', '编写资源与指标过滤条件', '核对查询时间范围与对齐参数']],
  ['google/skills/gke-ai-troubleshooting-tpu-dynamic-slices-monitoring', 'GKE 与 AI 基础设施', 'Gke Ai Troubleshooting Tpu Dynamic Slices Monitoring：监控 GKE AI 工作负载的 TPU Dynamic Slices，用于定位切片与调度异常。', ['检查 TPU Dynamic Slices 状态', '定位 GKE AI 调度异常', '整理 TPU 切片监控证据']],
  ['google/skills/gke-ai-troubleshooting-tpu-metrics-monitoring', 'GKE 与 AI 基础设施', 'Gke Ai Troubleshooting Tpu Metrics Monitoring：通过 TPU 监控指标诊断 GKE AI 工作负载的运行与资源问题。', ['检查 TPU 利用率与运行指标', '诊断 GKE AI 训练异常', '为 TPU 故障排查收集指标证据']],
  ['google/skills/google-cloud-storage-fuse', '云存储', 'Google Cloud Storage Fuse：将 Cloud Storage 存储桶作为文件系统挂载，并处理配置、访问与排障。', ['挂载 Cloud Storage 存储桶', '配置文件系统访问', '排查挂载与性能问题']],
  ['google/skills/iam-helper-for-privileged-access-management', '身份与访问管理', 'Iam Helper For Privileged Access Management：辅助配置 Google Cloud Privileged Access Manager 的特权访问资格、申请与审批。', ['配置临时特权访问资格', '组织访问申请与审批', '检查 PAM 配置的 IAM 角色']],
  ['google/skills/managed-airflow-dag-troubleshooting', '数据工程', 'Managed Airflow Dag Troubleshooting：诊断托管 Airflow 环境中 DAG 的解析、调度与任务执行失败。', ['排查 DAG 解析错误', '分析任务调度与执行日志', '定位托管 Airflow 环境异常']],
  ['mengto/skills/add-mouse-driven-orbit', '三维与交互', 'Add Mouse Driven Orbit：为 3D 场景添加鼠标驱动的环绕查看与视角控制。', ['为 3D 展示添加鼠标环绕', '调整摄像机旋转与阻尼', '制作可交互的产品或场景展示']],
  ['mengto/skills/blue-laser-clean-glass-layout', '设计与前端', 'Blue Laser Clean Glass Layout：构建蓝色激光点缀、清透玻璃材质与简洁网格结合的页面布局。', ['设计玻璃质感科技落地页', '配置蓝色激光视觉点缀', '统一网格、透明度与层次']],
  ['mengto/skills/build-interactive-particle-trail', '动效与三维', 'Build Interactive Particle Trail：实现跟随指针或交互路径运动的粒子尾迹效果。', ['制作鼠标跟随粒子', '调整尾迹寿命与扩散', '为落地页添加交互视觉反馈']],
  ['mengto/skills/build-wireframe-scan-reveal', '动效与三维', 'Build Wireframe Scan Reveal：通过扫描线在实体与线框状态之间逐步揭示 3D 对象。', ['制作 3D 线框扫描揭示', '设计实体与线框过渡', '为产品展示添加技术扫描效果']],
  ['mengto/skills/corner-lasers', '动效与前端', 'Corner Lasers：为卡片或容器四角添加激光式边角光效与交互强调。', ['为卡片添加角部光效', '强调悬停或选中状态', '统一科技感容器边角']],
  ['mengto/skills/framed-grid-layout', '设计与前端', 'Framed Grid Layout：以明确边框和网格分区组织页面内容与视觉层级。', ['设计边框分区落地页', '组织规则的响应式网格', '统一内容模块的对齐与间距']],
  ['mengto/skills/nested-container-frames', '设计与前端', 'Nested Container Frames：用嵌套容器与多层边框构建界面深度和模块层级。', ['设计多层嵌套卡片', '强化页面容器的层级', '调整边框、留白与背景对比']],
  ['mengto/skills/webgl-landing-steering', 'WebGL 与交互', 'Webgl Landing Steering：为 WebGL 落地页添加指针或输入驱动的方向控制与场景反馈。', ['制作 WebGL 首屏交互', '用指针控制场景方向', '调整输入映射与运动阻尼']],
  ['effect-ts/skills/effect-v3-to-v4', 'TypeScript 迁移', 'Effect V3 To V4：将 TypeScript 项目从 Effect v3 API 迁移到 Effect v4，并调整类型与组合方式。', ['盘点 Effect v3 API 使用', '迁移到 Effect v4 对应 API', '修复迁移后的类型与测试']],
  ['gil-1/skills/codex-pr-review', '代码审查', 'Codex Pr Review：使用 Codex 审查 Pull Request 差异，整理具有位置和修复方向的评审意见。', ['审查 Pull Request 差异', '定位正确性与回归风险', '输出可执行的行级修改建议']],
  ['kunchenguid/quota-axi/quota-axi', '能力待核对', 'Quota Axi：skills.sh 目录当前只能确认 Skill 名称与来源仓库，具体配额或 AXI 相关能力暂无法从排行元数据确认。', ['核对 skills.sh 详情页公开说明', '查看来源 GitHub 仓库的维护信息', '在能力边界确认后再评估用途']],
  ['richlander/dotnet-inspect/dotnet-inspect-performance', '.NET 性能分析', 'Dotnet Inspect Performance：检查 .NET 应用的运行时性能信号，辅助定位 CPU、内存或延迟瓶颈。', ['检查 .NET 应用性能', '定位 CPU 与内存瓶颈', '整理性能诊断证据']],
  ['tradermonty/claude-trading-skills/mt5-robot-tester', '交易策略测试', 'Mt5 Robot Tester：对 MetaTrader 5 交易机器人执行回测与结果检查，评估策略绩效和风险。', ['回测 MT5 Expert Advisor', '比较策略参数与绩效', '检查回撤、交易次数与稳定性']],
  ['heygen-com/hyperframes/embedded-captions', '动效与视频', 'Embedded Captions：为单主体口播视频添加逐字、电影感或特效字幕，并按视觉风格选择字幕轨道。', ['为口播视频添加原文字幕', '制作主体前后分层的电影感字幕', '按指定视觉风格生成特效字幕']],
  ['101-skills/superpowers/web-search', '搜索与信息检索', 'Web Search：通过公开说明列出的 Tavily 与 Exa 服务执行网页搜索、内容提取、直接问答与研究检索。', ['搜索网页并提取正文', '为研究或事实核查收集资料', '为 RAG 流程准备检索内容']],
  ['auth0/agent-skills/auth0', '身份与访问管理', 'Auth0：配置或排查应用登录、会话、令牌、MFA、SSO、组织、RBAC 与 API 保护。', ['接入或修复 Auth0 登录流程', '保护 API 与应用路由', '配置 MFA、SSO 或组织权限']],
  ['bergside/awesome-design-skills/artistic', '品牌与设计', 'Artistic：以高对比、表现性排版和大胆配色构建具有艺术感的界面视觉。', ['设计高对比创意界面', '组合表现性字体与大胆配色', '建立艺术化视觉方向']],
  ['bergside/awesome-design-skills/cosmic', '品牌与设计', 'Cosmic：以深色主题、霓虹点缀和空间感元素构建未来科幻界面。', ['设计深色科幻界面', '配置霓虹色视觉强调', '营造沉浸式空间层次']],
  ['bergside/awesome-design-skills/doodle', '品牌与设计', 'Doodle：以手绘涂鸦、手写字体和不规则线条构建轻松活泼的视觉风格。', ['设计手绘风页面或组件', '搭配涂鸦与手写字体', '统一不规则线条风格']],
  ['blacktop/dotfiles/ratatui-tui', 'Rust 与终端界面', 'Ratatui Tui：按公开说明中的 Ratatui API 与 Elm 架构实践构建 Rust 终端界面。', ['创建 Ratatui 终端应用', '实现组件布局与键盘导航', '处理异步事件、状态和终端图像']],
  ['callstack/agent-device/ios-simulator', '移动应用测试', 'Ios Simulator：通过 agent-device 在 iOS Simulator 中启动、操作和调试原生或跨平台移动应用。', ['在模拟器中验证 iOS 应用', '执行点击、输入与滚动流程', '收集截图和失败复现证据']],
  ['charlie947/social-media-skills/hook-generator', '社交内容运营', 'Hook Generator：为 LinkedIn 主题生成六组两行式开场钩子，并按公开说明控制长度、对比与数字表达。', ['为 LinkedIn 帖子生成开场句', '制作多组钩子文案变体', '用对比和指标强化首屏吸引力']],
  ['dotnet/skills/authoring-github-workflows', 'CI/CD 与自动化', 'Authoring Github Workflows：编写和审查 GitHub Actions 工作流 YAML，重点检查表达式引用、结构解析与 actionlint 结果。', ['编写 GitHub Actions 工作流', '诊断无任务启动的 YAML 错误', '用 actionlint 检查工作流结构']],
  ['dreambigou/eli5/eli5', '沟通与表达', 'Eli5：按指定受众的理解水平解释主题、代码、概念或错误。', ['向非技术受众解释复杂概念', '按年龄或角色调整说明深度', '把代码与错误拆解为易懂步骤']],
  ['eachlabs/skills/3d-model-generation', '三维与生成', '3d Model Generation：通过 each::sense 根据文字或图像生成带 PBR 纹理的三维资产。', ['从文字生成三维模型', '把参考图转换为三维资产', '制作游戏、产品或建筑模型']],
  ['every-app/open-seo/local-seo', '搜索优化', 'Local Seo：审查 Google Business Profile，对比本地竞争者并绘制地点周边的 Maps 可见性。', ['审查 Google 商家资料', '比较本地竞争者表现', '分析地图搜索可见性']],
  ['fetcher-sh/fetcher-skills/fetcher', 'API 与数据采集', 'Fetcher：配置 fetcher.sh 的 API 密钥、额度或 x402 支付，并解释其多平台网页数据接口响应。', ['配置 fetcher.sh API 与 MCP', '管理额度、密钥和 USDC 支付', '排查统一响应与错误码']],
  ['fetcher-sh/fetcher-skills/x-scraper', '社交内容研究', 'X Scraper：通过 fetcher.sh 搜索 X 帖子、账号、互动和列表数据，支持按调用付费或预付额度。', ['按关键词和操作符搜索 X 帖子', '提取账号帖子与互动数据', '读取单条帖子、回复或列表']],
  ['fission-ai/openspec/openspec-new-change', '需求与规格管理', 'Openspec New Change：使用实验性制品工作流，以分步方式创建新的功能、修复或修改规格。', ['创建 OpenSpec 变更', '组织功能或修复的分步制品', '为实现前准备结构化规格']],
  ['fission-ai/openspec/openspec-verify-change', '测试与质量', 'Openspec Verify Change：核对实现与变更制品是否完整、一致且可归档。', ['验证实现是否覆盖变更规格', '检查制品与代码的一致性', '在归档前确认变更完整']],
  ['flutter/agent-plugins/dart-write-documentation', '开发文档', 'Dart Write Documentation：按 Effective Dart 规则编写 Dart API 文档与三斜线注释。', ['为 Dart 声明编写文档注释', '统一库、类和方法的 API 说明', '检查 Effective Dart 文档格式']],
  ['gmgnai/gmgn-skills/gmgn-contract-dd', '区块链与链上数据', 'Gmgn Contract Dd：根据代币合约安全、持仓结构与价格行为计算尽调评分，并列出每项扣分依据。', ['评估单个代币合约风险', '检查持仓结构与价格信号', '生成带字段依据的尽调评分']],
  ['gmgnai/gmgn-skills/gmgn-kline-pattern', '区块链与链上数据', 'Gmgn Kline Pattern：从代币 K 线识别趋势通道、突破、反弹、派发、筑底或震荡等价格形态并评分。', ['识别代币 K 线形态', '计算价格行为评分', '整理趋势与震荡证据']],
  ['google/skills/ima-sdk-client-side', '广告技术', 'Ima Sdk Client Side：使用 Google IMA SDK 和 VAST 或 VMAP 为网站、应用或电视端接入客户端视频广告。', ['接入客户端视频广告', '处理 VAST 或 VMAP 广告请求', '区分客户端插入与 DAI、SSAI 场景']],
  ['greptileai/skills/check-pr', '代码审查与协作', 'Check Pr：检查 GitHub、GitLab 或 Perforce 变更中的未解决评论、失败状态检查与不完整描述。', ['检查 PR 或 MR 的未解决评论', '等待并汇总状态检查结果', '识别需要处理的评审问题']],
  ['greptileai/skills/greploop', '代码审查与协作', 'Greploop：循环触发 Greptile 审查并处理可执行评论，直到变更达到公开说明中的完成条件。', ['持续改进 PR、MR 或 shelved changelist', '修复 Greptile 可执行评论', '复查评分与未解决问题']],
  ['inertiaui/modal/inertia-modal-development', '设计与前端', 'Inertia Modal Development：为 React 或 Vue 的 Inertia 应用构建路由模态框和侧滑面板，覆盖预取、嵌套与无头模式。', ['创建路由驱动的模态框', '实现嵌套或本地模态框', '配置预取、事件和无头交互']],
  ['k-dense-ai/scientific-agent-skills/exa-search', '学术与技术检索', 'Exa Search：使用 Exa 搜索科学与技术网页，并批量提取文章或学术 PDF 内容。', ['搜索技术或学术资料', '按论文类别和学术域筛选', '批量提取网页与 PDF']],
  ['limrun-inc/skills/limrun-android-emulator', '移动应用测试', 'Limrun Android Emulator：在 Limrun 云端 Android 模拟器中安装、启动和操作应用，并采集 UI、日志、截图与录像。', ['在云模拟器中安装和测试 APK', '执行点击、输入与网络条件测试', '读取 logcat、截图和崩溃报告']],
  ['locaweb/cofounder/cofounder-app-deploy', '云平台与运维', 'Cofounder App Deploy：在 Locaweb Cloud 配置预览或生产部署、域名、数据库、密钥、扩缩容与故障恢复。', ['部署应用到 Locaweb Cloud', '配置环境、域名和数据库迁移', '检查日志、扩缩容与灾难恢复']],
  ['locaweb/cofounder/cofounder-computer-setup', '开发环境', 'Cofounder Computer Setup：配置 mise、Podman、GitHub CLI、Node 和 Go 等项目开发前置工具。', ['搭建本地开发环境', '安装并配置项目依赖工具', '检查开发前置条件']],
  ['locaweb/cofounder/cofounder-frontend-design', '设计与前端', 'Cofounder Frontend Design：创建高完成度的网页组件、页面与应用界面，并避免模板化视觉。', ['设计生产级前端页面', '美化 React 或 HTML/CSS 界面', '提升布局、排版与视觉辨识度']],
  ['locaweb/cofounder/cofounder-playbook', 'Agent 工作流', 'Cofounder Playbook：记录 cofounder 项目的会话启动、开发、部署与能力路由约定。', ['了解 cofounder 项目工作流', '核对开发与部署约定', '查找项目能力路由说明']],
  ['locaweb/cofounder/cofounder-pre-flight-check', '开发环境', 'Cofounder Pre Flight Check：在项目初始化前检查工作目录、开发工具、Git 状态与远程仓库配置。', ['检查本地环境是否就绪', '验证 Git 与远程配置', '在项目初始化前执行预检']],
  ['locaweb/cofounder/cofounder-repo-setup', '代码仓库管理', 'Cofounder Repo Setup：初始化本地 Git 仓库、创建 GitHub 远程并完成首次推送。', ['初始化本地代码仓库', '创建并连接 GitHub 远程', '检查认证并推送初始提交']],
  ['locaweb/cofounder/cofounder-ssh-key-rotation', '身份与访问管理', 'Cofounder Ssh Key Rotation：轮换或重建用于已部署虚拟机访问的 SSH 密钥，并处理本地密钥缺失。', ['轮换部署环境 SSH 密钥', '恢复丢失密钥后的访问', '排查 SSH 权限拒绝问题']],
  ['locaweb/cofounder/cofounder-tech-stack', '全栈开发', 'Cofounder Tech Stack：按 Go、React、Postgres 与 Podman 技术栈组织本地全栈开发、迁移和测试循环。', ['搭建 Go 与 React 应用结构', '运行本地数据库与迁移', '执行写码、测试和迭代循环']],
  ['locaweb/cofounder/cofounder-testing', '测试与质量', 'Cofounder Testing：为 Go 后端和 React 前端建立单元、集成与组件测试，并与应用代码同步维护。', ['编写 Go 后端测试', '使用 Vitest 测试 React 组件', '为处理器和交互组件补齐回归测试']],
  ['nanako0129/sepia/sepia', '写作与编辑', 'Sepia：识别并修复小说或专业文本中的机器化表达，支持诊断、轻量改写、重写和新写作。', ['检查文本中的 AI 写作痕迹', '轻量改写或完整重写内容', '撰写发布说明、评论或技术文章']],
  ['nanako0129/sepia/sepia-recreate', '写作与编辑', 'Sepia Recreate：按 Sepia 的完整重写流程重新创作现有文本。', ['完整重写现有内容', '重构文本叙事与表达', '降低成稿的机器化语感']],
  ['nanako0129/sepia/sepia-refactor', '写作与编辑', 'Sepia Refactor：按 Sepia 的轻量方式就地修改文本，尽量保留原结构与内容。', ['小幅润色现有文本', '保留结构并修复表达', '减少机器化措辞']],
  ['nanako0129/sepia/sepia-review', '写作与编辑', 'Sepia Review：诊断文本中的 AI 写作痕迹与结构问题，但不直接编辑内容。', ['审查文本机器化特征', '定位叙事与措辞问题', '输出不改稿的诊断意见']],
  ['nanako0129/sepia/sepia-write', '写作与编辑', 'Sepia Write：按 Sepia 的写作规则从零创建新的小说或专业文本。', ['创作新的专业文本', '撰写自然表达的故事内容', '按指定文体生成初稿']],
  ['nomadamas/k-skill/bok-ecos-stats', '经济与市场数据', 'Bok Ecos Stats：通过韩国银行 ECOS Open API 查询基准利率、汇率、CPI、货币量与核心经济指标。', ['查询韩国基准利率与汇率', '获取 CPI、M2 和国债利率', '整理央行宏观经济时间序列']],
  ['nomadamas/k-skill/housing-official-price', '房地产数据', 'Housing Official Price：通过韩国 realtyprice.kr 公共数据查询公寓与独立住宅的官方价格及历史。', ['查询韩国公寓官方价格', '查看独立住宅价格历史', '区分官方房价与土地、成交数据']],
  ['nottelabs/notte-skills/migrate-to-notte', '浏览器自动化', 'Migrate To Notte：比较浏览器自动化供应商成本，并将现有会话、工作流或基础设施迁移到 Notte。', ['比较浏览器平台成本与并发模型', '盘点现有自动化使用情况', '设计可回滚的 Notte 迁移']],
  ['nottelabs/notte-skills/notte-browser', '浏览器自动化', 'Notte Browser：通过命令行启动和控制 Notte 云浏览器会话，支持交互、抓取、回放、身份资料与工作流部署。', ['启动并操作远程浏览器', '抓取网页并管理会话资料', '录制回放或部署浏览器工作流']],
  ['nottelabs/notte-skills/notte-functions-build', '浏览器自动化', 'Notte Functions Build：探索网站的数据路径，并将稳定抓取流程部署为可参数化、可调度的 Notte Function。', ['把网页抓取转成可调用接口', '构建可复用的浏览器自动化', '部署定时或批量执行的 Function']],
  ['nottelabs/notte-skills/notte-functions-doctor', '浏览器自动化', 'Notte Functions Doctor：诊断网站变化导致的 Notte Function 失败或空结果，隔离验证后再修复部署。', ['诊断失效的抓取 Function', '重新探索变化后的网页路径', '验证并发布修复版本']],
  ['owasp/secure-agent-playbook/web-security-review', '安全与合规', 'Web Security Review：依据 OWASP Top 10（2021）审查 Web 应用、服务端代码与框架风险。', ['审查注入、认证与 XSS 风险', '检查 Web 应用服务端实现', '按 OWASP Top 10 整理问题']],
  ['owl-listener/designer-skills/design-debt-audit', '设计系统', 'Design Debt Audit：盘点并排序产品中长期积累的设计不一致问题。', ['建立设计债务清单', '按影响排序界面不一致', '区分设计债、令牌覆盖与无障碍问题']],
  ['owl-listener/designer-skills/law-of-common-region', '设计与前端', 'Law Of Common Region：通过共享容器、背景或边框对界面元素建立视觉分组。', ['用容器强化元素分组', '在紧凑布局中保持关系表达', '选择背景或边框作为共同区域']],
  ['owl-listener/designer-skills/onboarding-design', '产品体验', 'Onboarding Design：设计首次使用体验中的激活路径、渐进披露与首次价值达成。', ['规划新用户首次会话', '缩短达到首次价值的时间', '设计渐进式引导内容']],
  ['qianwen-ai/qianwen-ai/qianwen-payment', '支付与账户', 'Qianwen Payment：查看千问账户余额并提供充值入口，不处理用量或账单查询。', ['查询账户资金余额', '进入充值或加款流程', '区分支付中心与用量账单']],
  ['runpod/runpod-plugins-official/runpod-templates', '云计算与 GPU', 'Runpod Templates：选择和排查 Runpod 官方 Pod 模板，核对镜像内容、端口、路径、版本与首次启动缺项。', ['选择 ComfyUI 或 PyTorch 模板', '固定模板版本与检查端口路径', '排查模板启动和模型缺失问题']],
  ['seflless/deepwiki/deepwiki', '开发文档', 'Deepwiki：通过 DeepWiki 查询公开 GitHub 仓库的文档与代码库说明。', ['理解公开库或框架的用法', '查询依赖项目文档', '从仓库知识页核对实现信息']],
  ['spatie/freek.dev/pest-testing', '测试与质量', 'Pest Testing：使用 Pest 4 为 PHP 应用编写单元、功能、Livewire 与浏览器测试，并处理数据集和模拟。', ['编写 Pest 单元与功能测试', '测试 Livewire 和浏览器流程', '排查断言、覆盖率与失败用例']],
  ['thedotmack/claude-mem/version-bump', '发布与版本管理', 'Version Bump：为 Claude Code 插件执行语义化版本更新、构建验证、Git 标签、GitHub Release 与变更日志流程。', ['更新插件版本与清单', '验证构建并生成变更日志', '创建 Git 标签和 GitHub Release']],
  ['tradermonty/claude-trading-skills/pre-trade-discipline-gate', '交易风险管理', 'Pre Trade Discipline Gate：在手工下单前检查计划、仓位、报复交易、市场状态与熔断条件，并记录决策。', ['执行交易前纪律检查', '阻止无计划或超仓订单', '记录交易决策供后续复盘']],
  ['ulpi-io/skills/laravel-filament', 'Laravel 开发', 'Laravel Filament：按 Filament v5 的命名空间与约定构建管理面板资源、表单、表格、操作和测试。', ['开发 Filament v5 管理面板', '创建资源、表单与关系管理器', '避免使用已弃用的 v3 API']],
  ['wondelai/skills/create-app', '产品与应用开发', 'Create App：从应用想法验证到可持续交付的首个版本，分阶段组织产品、架构、实验和实施计划。', ['验证应用想法与 MVP', '规划可维护的应用架构', '记录产品、实验与实施决策']],
  ['wondelai/skills/grow-business', '商业增长', 'Grow Business：把已有收入业务整理为可预测的营销、销售、口碑与指标增长系统。', ['建立可重复的营销销售流程', '设计口碑与推荐增长机制', '记录增长计划、报价与指标']],
  ['xingkongliang/skills-manager/manage-skills', 'Skill 管理', 'Manage Skills：通过 skills-manager-cli 管理共享 Skill 库、来源、标签、预设与跨 Agent 部署状态。', ['查询和整理共享 Skill 库', '管理标签、预设与更新', '部署或撤回指定 Agent 的 Skill']],
  ['ysm-dev/skills/web-search', '搜索与信息检索', 'Web Search：通过 duckduckgo-cli 从命令行搜索近期网页信息，用于新闻、事实核查与文档查询。', ['查询近期事件与新闻', '核对可能变化的事实', '搜索技术文档和研究资料']],
];

const septemberSecondSourceAwareOverrides = [
  ['fission-ai/openspec/openspec-continue-change', '规格驱动开发', 'OpenSpec Continue Change：继续一个 OpenSpec 变更，并按当前进度创建下一份规格工件。', ['继续已有 OpenSpec 变更', '生成下一份规格工件', '推进分阶段的变更流程']],
  ['dontbesilent2025/dbskill/dbs-skill-maker', 'Skill 管理', 'Dbs Skill Maker：分析重复需求并制作可安装、可分级验证的单个 Skill；只有明确要求时才准备发布。', ['把重复问题沉淀为 Skill', '检查和测试候选 Skill', '在明确授权后准备发布']],
  ['fission-ai/openspec/openspec-onboard', '规格驱动开发', 'OpenSpec Onboard：通过带讲解的完整工作流，引导用户在真实代码库中完成一次 OpenSpec 上手周期。', ['初次上手 OpenSpec', '演练完整规格变更周期', '在代码库中学习工件流转']],
  ['wondelai/skills/improve-business', '商业运营', 'Improve Business：分阶段诊断停滞业务，建立运营节奏、价值定价和可续接的改进计划。', ['诊断业务增长停滞', '建立运营与指标节奏', '整理业务改进计划']],
  ['owl-listener/designer-skills/von-restorff-effect', '设计与前端', 'Von Restorff Effect：利用视觉差异让一个关键元素从相邻元素中突出并更容易被记住。', ['突出单一关键操作', '设计差异化视觉重点', '检查界面强调是否明确']],
  ['owl-listener/designer-skills/fitts-law', '设计与前端', 'Fitts Law：依据目标尺寸与距离设计控件的位置和可点击范围，尤其适用于触控界面。', ['调整触控目标尺寸', '优化高频控件位置', '检查控件获取成本']],
  ['wondelai/skills/grow-app', '产品增长', 'Grow App：围绕激活、留存、习惯循环和统一指标，组织应用增长诊断与分阶段改进。', ['诊断注册后的用户流失', '优化激活与留存路径', '建立产品增长计划']],
  ['cursor/plugins/continual-learning', 'Agent 工作流', 'Continual Learning：编排会话记录提炼与 AGENTS.md 更新，使已确认的经验进入后续 Agent 上下文。', ['从会话记录提炼经验', '更新 Agent 项目记忆', '维护持续学习工作流']],
  ['dotnet/skills/setup-local-sdk', '.NET 开发', 'Setup Local Sdk：在不修改系统级安装的前提下，本地安装或固定特定版本的 .NET SDK 与工作负载。', ['安全试用 .NET 预览版', '固定项目 SDK 版本', '准备可复现的本地或 CI 环境']],
  ['fission-ai/openspec/openspec-ff-change', '规格驱动开发', 'OpenSpec Ff Change：快速创建实现变更所需的全部 OpenSpec 工件。', ['快速补齐变更工件', '为实现阶段准备规格材料', '推进 OpenSpec 变更']],
  ['wordpress/agent-skills/wp-patterns', 'WordPress 开发', 'Wp Patterns：创建、更新和审查 WordPress 区块样板、模板部件、Query Loop 布局及其注册与可访问性。', ['制作 WordPress 区块样板', '审查样板注册与区块标记', '改进模板布局和可访问性']],
  ['open-mercato/skills/om-approve-merge-pr', '代码审查与协作', 'Om Approve Merge Pr：按 PR 编号检查质量门禁，满足条件时提交批准并 squash 合并；阻塞时拒绝或转入修复。', ['核对 PR 合并门禁', '批准并 squash 合并 PR', '将可修复阻塞项转入修复流程']],
  ['owl-listener/designer-skills/millers-law', '设计与前端', 'Millers Law：把信息分成约四项一组的区块，以降低工作记忆负担。', ['重组表单字段', '整理菜单和步骤', '检查信息分组密度']],
  ['fission-ai/openspec/openspec-bulk-archive-change', '规格驱动开发', 'OpenSpec Bulk Archive Change：一次归档多个已完成的 OpenSpec 变更。', ['批量归档完成的变更', '清理并行变更记录', '维护 OpenSpec 变更目录']],
  ['tencentmusic/qqmusic-skills/qqmusic', '音乐与音频', 'Qqmusic：搜索 QQ 音乐的歌曲、专辑、歌单、MV 与歌手，并提供推荐、榜单、AI 歌单和听歌报告。', ['搜索歌曲、专辑或歌单', '查看音乐榜单与推荐', '生成歌单或听歌报告']],
  ['arnabbagxd/brand-building-skills/personal-brand', '品牌与营销', 'Personal Brand：为创始人、管理者、创作者和顾问制定个人品牌定位、可信度与受众增长策略。', ['明确个人品牌定位', '规划思想领导力内容', '建立 LinkedIn 或创作者影响力']],
  ['github/awesome-copilot/resx-source-generator-migration', '.NET 开发', 'Resx Source Generator Migration：把依赖已签入 .designer.cs 的 .resx 项目迁移到源生成器方案。', ['迁移 .resx 代码生成方式', '移除已签入的 designer 文件依赖', '更新 .NET 资源构建流程']],
  ['github/awesome-copilot/roslyn-analyzers', '.NET 开发', 'Roslyn Analyzers：构建、审查、调试、测试和打包 Roslyn 诊断分析器、代码修复器与增量源生成器。', ['开发 DiagnosticAnalyzer', '测试 CodeFixProvider 或源生成器', '打包 Roslyn 分析器 NuGet']],
  ['wshobson/agents/superself', 'Agent 工作流', 'Superself：在采用 Superself 保存项目状态时读取会话上下文、关联工作单元，并用证据记录进展和确认决策。', ['恢复 Superself 项目上下文', '把工作关联到工作单元', '记录可续接的进展与决策']],
  ['wshobson/agents/grounded-vault', '上下文与知识管理', 'Grounded Vault：维护带逐项来源和 Git 指纹的 Markdown 知识库，使数字与引文可追溯并可检测漂移。', ['建立可追溯的 Markdown 知识库', '为事实关联不可变来源', '检测知识页与代码之间的漂移']],
  ['dontbesilent2025/dbskill/dbs-video-extract', '视频与转写', 'Dbs Video Extract：解析抖音、小红书等短视频链接，查询作品或账号数据并提取语音文字稿，按作者和标题归档。', ['提取短视频文字稿', '查询作品与账号数据', '按作者和标题归档 Markdown']],
  ['dynatrace/dynatrace-for-ai/dt-obs-genai', '可观测性', 'Dt Obs Genai：分析 Dynatrace 中生成式 AI 与 LLM 应用的 Token 成本、延迟、错误、Agent 循环、护栏和评估数据。', ['分析模型 Token 成本与缓存', '排查 Agent 或工具循环失败', '检查延迟、错误与评估结果']],
  ['dynatrace/dynatrace-for-ai/dt-obs-log-semantic-mapping', '可观测性', 'Dt Obs Log Semantic Mapping：依据厂商原始审计日志或已摄取事件，建议并验证 Dynatrace 语义字典映射。', ['映射厂商审计日志字段', '检查必需语义字段', '验证 OpenPipeline 提取规则']],
  ['dynatrace/dynatrace-for-ai/dt-obs-network-devices', '网络可观测性', 'Dt Obs Network Devices：分析 Dynatrace 中通过 SNMP 监控的交换机、路由器、防火墙和负载均衡器的拓扑、指标与日志。', ['盘点网络设备与接口', '定位接口下线或饱和', '分析 SNMP trap 与 syslog']],
  ['dynatrace/dynatrace-for-ai/dt-obs-network-flows', '网络可观测性', 'Dt Obs Network Flows：分析 Dynatrace 中的主机、进程、Pod、NetFlow/IPFIX/sFlow 与云流日志通信。', ['查找网络流量 Top Talker', '映射实体通信依赖', '排查重置、超时与重传']],
  ['dynatrace/dynatrace-for-ai/dt-platform-costs', '云成本分析', 'Dt Platform Costs：用 DQL 查询 Dynatrace 租户的实际计费与用量数据，分析消费、成本驱动、分摊与趋势。', ['分析 DPS 消费与成本排名', '执行成本分摊或回溯', '定位工作流与实体成本驱动']],
  ['dynatrace/dynatrace-for-ai/dt-sec-contextualization', '安全与合规', 'Dt Sec Contextualization：把安全信号、IoC 匹配和 Smartscape 节点解析到运行时实体，并关联跨层级发现。', ['把容器镜像映射到工作负载', '关联 Pod、节点与安全发现', '为 IoC 匹配补充实体上下文']],
  ['dynatrace/dynatrace-for-ai/dt-sec-ioc-hunting', '安全与合规', 'Dt Sec Ioc Hunting：从报告、公告、文本或 STIX 提取 IoC，在 Dynatrace 日志与 span 中检索并生成威胁暴露评分。', ['提取并规范化 IoC', '在日志与链路中检索指标', '生成威胁暴露报告']],
  ['dynatrace/dynatrace-for-ai/dt-sec-semantic-mapping', '安全与合规', 'Dt Sec Semantic Mapping：依据厂商 API 样本或实时事件，建议并验证新安全集成的 Dynatrace 语义字典映射。', ['映射安全厂商事件字段', '检查命名空间与必需字段', '验证租户中的实时映射']],
  ['lilmgenius/paperthin/aim', '需求澄清', 'Aim：当用户只提供材料或需求过薄时，先读取上下文并提出对其真实目标的可确认判断。', ['从文件或仓库推断任务目标', '识别需求与材料之间的缺口', '在执行前形成目标提案']],
  ['lilmgenius/paperthin/autobahn', '安全与范围控制', 'Autobahn：在风险相邻任务开始前划出护栏外内容与安全替代方案，再让隔离的执行上下文处理安全剩余范围。', ['识别隐私、抓取或安全边界', '把风险内容移出执行范围', '以隔离上下文处理安全任务']],
  ['lilmgenius/paperthin/catchup', '项目管理', 'Catchup：只读重建项目的当前状态，说明需要用户处理的事项、近期变化和新术语。', ['帮助久未参与者恢复上下文', '汇总项目近期变化', '解释当前阻塞与术语']],
  ['lilmgenius/paperthin/debloat', '写作与编辑', 'Debloat：压缩冗长、重复和过度限定的文本，在保留含义的同时恢复信息密度。', ['精简冗长文档', '去除相邻重复表达', '压缩修补痕迹明显的段落']],
  ['lilmgenius/paperthin/dedash', '写作与编辑', 'Dedash：逐处审查并移除用户范围内的破折号，改用符合语境的标点或措辞。', ['清理文档中的破折号', '按语境改写标点', '统一用户文稿风格']],
  ['lilmgenius/paperthin/detool', '写作与编辑', 'Detool：把耐久文档中的偶然工具、厂商、模型、路径和配额名称替换为其机制含义，同时保留必要出处。', ['降低文档对具体工具的耦合', '让长期文档更可迁移', '保留运行手册中的必要专名']],
  ['lilmgenius/paperthin/factchk', '事实核查', 'Factchk：在交付前用外部来源双向核验现实性主张，修正明确错误并标出需要判断的内容。', ['核验事实性文案', '检查新颖或不可能等主张', '修正有来源证据的错误']],
  ['lilmgenius/paperthin/feynman', '决策评审', 'Feynman：在做出决定后从怀疑者视角追问依据，检验能否用自己的话解释并暴露理解缺口。', ['检验刚做出的选型', '解释决策的关键依据', '发现尚未理解的环节']],
  ['lilmgenius/paperthin/hate', '决策评审', 'Hate：在投入较大工作前攻击计划、设计或论点，找出一个承重反对意见和最低成本验证实验。', ['压力测试产品计划', '审查设计或论点弱点', '设计低成本失败实验']],
  ['lilmgenius/paperthin/macrothink', '决策评审', 'Macrothink：对当前方向进行只读的多视角检查，优先报告不同判断，识别会话中的隧道视野。', ['检查项目方向是否过窄', '比较多个独立判断', '在决策前发现遗漏视角']],
  ['lilmgenius/paperthin/mandela', '数据与评估', 'Mandela：审计评估、指标、实验或基准是否发生真值泄漏，并为命中的泄漏模式提出独立性修复。', ['审计模型评估泄漏', '检查实验与评分独立性', '修复自我确认的测量方案']],
  ['lilmgenius/paperthin/modelchk', '模型选型', 'Modelchk：在执行前估算任务所需的最低充分模型能力层级和推理强度。', ['选择合适的模型档位', '控制任务成本与能力匹配', '识别推理资源不足或过度']],
  ['lilmgenius/paperthin/nba', '项目管理', 'Nba：读取当前周期状态并给出单一的最高杠杆下一步行动，而不是列出选择菜单。', ['确定项目下一步行动', '在多条工作线间重新聚焦', '恢复迭代周期的主线']],
  ['lilmgenius/paperthin/prism', '质量评审', 'Prism：用二至五个独立失败模式审查同一工件，汇总共识、分歧与一个可解决分歧的问题。', ['多视角审查计划或文件', '比较正确性与安全等失败模式', '提炼评审分歧的关键问题']],
  ['lilmgenius/paperthin/re0', '写作与维护', 'Re0：把已有工件刷新为当前最佳的精简版本，并同步处理附近可能漂移的相关内容。', ['清理迭代后的文档或文件', '同步相邻工件的变更', '去重并更新现有成果']],
  ['lilmgenius/paperthin/re0-git', '版本控制', 'Re0 Git：把已完成提交的信息重写为清晰、可交接且能独立说明变更的 Git 日志。', ['改写提交信息', '提升 Git 日志可读性', '准备完成提交的交接说明']],
  ['lilmgenius/paperthin/re0-loop', 'Agent 工作流', 'Re0 Loop：反复运行构建、质量检查、复盘和重做周期，以通过质量门禁和沉淀可复用成果衡量进展。', ['运行长期 Agent 项目迭代', '在周期中复盘并重做', '用质量门禁衡量进展']],
  ['lilmgenius/paperthin/re0-memo', '复盘与知识管理', 'Re0 Memo：把完成、失败或不理想的工作周期转化为可迁移的经验、反模式、质量门禁和下轮词汇。', ['复盘完成或失败的迭代', '提炼反模式与质量门禁', '为下一周期保存经验']],
  ['lilmgenius/paperthin/re0-merge', '代码审查与协作', 'Re0 Merge：按项目主张审查并落地外部贡献，保留作者署名，补全内容后再批准、致谢与说明。', ['审查外部 Pull Request', '补全并落地贡献内容', '保留贡献者署名与说明']],
  ['lilmgenius/paperthin/re0-plan', '项目管理', 'Re0 Plan：在 paperthin 迭代开始前创建并立即填充案例目录，为后续循环准备真实上下文。', ['开启新的 paperthin 周期', '准备迭代案例材料', '为构建循环建立上下文']],
  ['lilmgenius/paperthin/re0-release', '发布与版本管理', 'Re0 Release：按仓库发布清单推进待发布变更，经确认后打标签并发布。', ['执行发布前检查', '确认待发布变更', '创建标签并发布版本']],
  ['lilmgenius/paperthin/re0-upgrade', 'Skill 管理', 'Re0 Upgrade：展示并确认变更后，使已安装的 paperthin Skill 与当前完整目录一致，包括退役、补充和刷新。', ['核对 paperthin Skill 目录', '补充缺失或更新已有 Skill', '退役已重命名的 Skill']],
  ['lilmgenius/paperthin/re0-work', '项目重构', 'Re0 Work：从 v0 重启项目或工件，只保留已验证的经验、契约、门禁、词汇和真实表面测试。', ['重启基础方向错误的项目', '保留已验证经验重新实现', '避免继承偶然架构']],
  ['lilmgenius/paperthin/readchk', '需求澄清', 'Readchk：在投入非平凡工作前核对模型对长、成组、高风险或指代含糊请求的理解，仅暴露仍然存在的分叉。', ['核对复杂用户指令', '消解上下文中的含糊指代', '在执行前发现范围分叉']],
  ['lilmgenius/paperthin/reorder', '信息架构', 'Reorder：按一个明确原则重新排列列表、表格、目录、章节或枚举，只移动项目，不改写、增加或删除。', ['整理顺序混乱的列表', '重排章节或目录', '按单一原则组织项目']],
  ['lilmgenius/paperthin/shower', '质量评审', 'Shower：让无上下文的独立审查者冷读当前工件，诊断其能否在脱离会话时自明，不直接修改内容。', ['交接前执行冷读检查', '诊断长会话造成的理解偏差', '验证文档能否独立阅读']],
  ['lilmgenius/paperthin/sip', '质量评审', 'Sip：创建或修改工件、Skill 后，用已有 Skill 对成果进行自测，再进入完成、提交或交接。', ['修改后执行递归自测', '交付前品鉴工件质量', '验证新建或更新的 Skill']],
  ['lilmgenius/paperthin/ssotize', '上下文与知识管理', 'Ssotize：只读审计同一事实的分散位置，经批准后合并为一个权威来源，并用引用替换重复内容。', ['查找事实重复与不一致', '规划单一事实来源', '经批准后合并并替换引用']],
  ['treeseed-ai/skill/treeseed', '项目与治理', 'Treeseed：通过当前 MCP 能力操作 TreeSeed 控制平面的项目、知识、治理和执行记录，不据此运行 Agent 或修改仓库。', ['查询或维护 TreeSeed 项目记录', '处理治理与知识对象', '在受控项目对话中协作']],
  ['addyosmani/agent-skills/constraint-driven-development', '测试与质量', 'Constraint Driven Development：把项目质量门槛写入 CONSTRAINTS.md，并监控抑制检查、删除测试、降低阈值等弱化行为。', ['定义覆盖率或性能质量门槛', '监控测试与断言被削弱', '阻止 Agent 为通过检查而降低标准']],
  ['gmgnai/gmgn-skills/gmgn-wallet-analysis', '区块链与链上数据', 'Gmgn Wallet Analysis：以记录真实性、近期优势、成交可行性和止损纪律四道门槛分析钱包，并汇总当前持仓、买入与跟单窗口。', ['分析链上钱包交易风格', '判断钱包近期表现能否跟随', '评估跟单成交与仓位上限']],
  ['promovaweb/specsfy/specsfy-01-inbox', '规格驱动开发', 'Specsfy 01 Inbox：把用户提供的想法、需求或自由文本完整保存为 specs/inbox/ 下的时间戳文件，不继续创建 backlog、规格或代码。', ['快速捕获产品想法', '保存待后续处理的需求', '建立 Specsfy Inbox 记录']],
  ['promovaweb/specsfy/specsfy-02-backlog', '规格驱动开发', 'Specsfy 02 Backlog：把 Inbox 捕获、机会或问题整理为可进入规格阶段的 backlog，检查重复并形成可测试 Brief。', ['把 Inbox 条目转成 backlog', '检查重复需求与参考资料', '通过访谈补齐可测试 Brief']],
  ['promovaweb/specsfy/specsfy-03-specify', '规格驱动开发', 'Specsfy 03 Specify：把已细化的 backlog 推进为 specs/draft/ 中的 spec.md，并建立初始规范来源。', ['从 backlog 创建 Draft 规格', '补齐 Specsfy 规格结构', '建立变更的规范源']],
  ['promovaweb/specsfy/specsfy-04-validate', '规格驱动开发', 'Specsfy 04 Validate：审查 spec.md 是否符合 Specsfy/2.0 严格格式并可进入规划，将门禁结果写回同一文件。', ['验证 Specsfy 规格格式', '检查 Definition Gate', '在规划前审计 spec.md']],
  ['promovaweb/specsfy/specsfy-05-tasks', '规格驱动开发', 'Specsfy 05 Tasks：在 spec.md 的任务区拆分垂直切片、排列依赖并准备执行，不创建额外 tasks.md 或直接写代码。', ['把规格拆分为任务', '排序依赖和垂直切片', '更新 spec.md 内的任务清单']],
  ['promovaweb/specsfy/specsfy-06-tdd-bdd', '测试与质量', 'Specsfy 06 Tdd Bdd：依据 spec.md 的 Gherkin 设计测试与追踪关系，并运行 RED-GREEN-REFACTOR 周期。', ['从规格生成 TDD 或 BDD 测试', '维护规格到测试的追踪', '运行红绿重构循环']],
  ['promovaweb/specsfy/specsfy-07-implement', '规格驱动开发', 'Specsfy 07 Implement：执行 spec.md 任务区中的生产任务，创建规范定义的代码并推进下一项可执行工作。', ['实现规格中的生产任务', '继续下一项就绪任务', '完成并交付 Specsfy 功能']],
  ['promovaweb/specsfy/specsfy-aux-database', '数据建模', 'Specsfy Aux Database：维护 .specsfy/DATABASE.md 中的数据库、schema、表、字段、关系与 migration 清单，并保留人工说明。', ['同步持久化结构文档', '审计数据模型与代码一致性', '记录表、索引和关系变化']],
  ['promovaweb/specsfy/specsfy-aux-stack', '开发文档', 'Specsfy Aux Stack：监控 manifests 与结构文件，增量维护 .specsfy/STACK.md 中的语言、框架、运行时、测试和持久化栈。', ['更新项目技术栈文档', '记录框架或结构依赖变化', '补齐 .specsfy/STACK.md']],
  ['promovaweb/specsfy/specsfy-data-discovery', '数据建模', 'Specsfy Data Discovery：用日常语言访谈产品需要保存的信息，建议合适结构，并把确认答案记录到 .specsfy/DATABASE.md。', ['发现产品数据需求', '讨论合适的数据结构', '记录确认的数据模型']],
  ['promovaweb/specsfy/specsfy-documentator', '开发文档', 'Specsfy Documentator：构建 docs/ 技术文档，并维护 .specsfy/PACKAGES.md 中的 npm 与 Composer 包清单。', ['为系统补充技术文档', '记录 npm 或 Composer 依赖', '在实现后同步文档']],
  ['promovaweb/specsfy/specsfy-interviewer', '需求澄清', 'Specsfy Interviewer：通过对话补齐不同阶段规格的缺口、重新估算工作量，并在下一次状态转换前记录确认答案。', ['访谈补齐 Draft 规格缺口', '重新校准实现工作量', '为规格状态转换准备确认信息']],
  ['promovaweb/specsfy/specsfy-milestone-governor', '项目管理', 'Specsfy Milestone Governor：从规格与 backlog 投影里程碑状态，识别缺失关联并只更新派生区块，不替用户编造产品目标。', ['汇总里程碑状态', '识别规格与里程碑缺失关联', '更新派生的里程碑区块']],
  ['promovaweb/specsfy/specsfy-monorepo-documentator', '开发文档', 'Specsfy Monorepo Documentator：仅在 Specsfy 官方 monorepo 中维护项目自身文档、跨域变更与用户指南。', ['维护 Specsfy 官方仓库文档', '同步跨模块文档变化', '更新开发或用户指南']],
  ['promovaweb/specsfy/specsfy-mvp-milestone-interviewer', '需求澄清', 'Specsfy Mvp Milestone Interviewer：把 MVP 开发需求导入 1.0 里程碑、backlog 与 Draft 规格，并保留业务上下文来源。', ['访谈 MVP 初始需求', '建立 1.0 里程碑与 backlog', '生成 Draft 规格入口']],
  ['promovaweb/specsfy/specsfy-progress', '项目管理', 'Specsfy Progress：只读汇总 Specsfy 仓库全部规格、门禁、任务与清单的进度、阻塞和下一项工作。', ['查看所有规格进度', '汇总完成比例与阻塞', '确定下一项仓库工作']],
  ['promovaweb/specsfy/specsfy-setup', '规格驱动开发', 'Specsfy Setup：准备并监控项目上下文，包括项目章程以及从 GitHub Spec Kit 保留的规格。', ['初始化 Specsfy 项目上下文', '维护项目章程', '保留并接入既有规格']],
];

const septemberThirdSourceAwareOverrides = [
  ['axelfreeman/marketing-mindset/marketing-mindset', '营销与增长', 'Marketing Mindset：提供面向营销、增长和获客任务的决策视角，适用于定位、发布、广告、落地页、外联和文案判断，而非单一战术模板。', ['评估 B2B 或 SaaS 产品定位', '规划首批客户获取与冷启动外联', '审查广告、落地页或发布决策']],
  ['senclaw-cdn.italent.cn/beisen-shared', '人力资源（待核对）', 'Beisen Shared：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体共享能力与适用范围无法确认。', ['持续核对 skills.sh 详情页是否补充说明', '确认其与其他 Beisen Skill 的依赖关系', '在取得公开说明后再评估用途']],
  ['senclaw-cdn.italent.cn/beisen-employee-profile', '人力资源（待核对）', 'Beisen Employee Profile：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体员工档案能力与适用范围无法确认。', ['核对来源页的员工档案说明', '确认支持的数据字段与操作范围', '在公开信息充分后再评估用途']],
  ['senclaw-cdn.italent.cn/beisen-organization', '人力资源（待核对）', 'Beisen Organization：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体组织管理能力与适用范围无法确认。', ['核对来源页的组织数据说明', '确认支持的对象与操作范围', '在公开信息充分后再评估用途']],
  ['senclaw-cdn.italent.cn/beisen-attendance-leave', '人力资源（待核对）', 'Beisen Attendance Leave：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体考勤请假能力与适用范围无法确认。', ['核对来源页的考勤请假说明', '确认支持的流程与数据范围', '在公开信息充分后再评估用途']],
  ['senclaw-cdn.italent.cn/beisen-approval', '人力资源（待核对）', 'Beisen Approval：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体审批能力与适用范围无法确认。', ['核对来源页的审批说明', '确认支持的流程与权限范围', '在公开信息充分后再评估用途']],
  ['senclaw-cdn.italent.cn/beisen-service-portal', '人力资源（待核对）', 'Beisen Service Portal：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体服务门户能力与适用范围无法确认。', ['核对来源页的服务门户说明', '确认支持的入口与服务范围', '在公开信息充分后再评估用途']],
  ['senclaw-cdn.italent.cn/beisen-knowledge', '人力资源（待核对）', 'Beisen Knowledge：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体知识管理能力与适用范围无法确认。', ['核对来源页的知识管理说明', '确认支持的内容与检索范围', '在公开信息充分后再评估用途']],
  ['owl-listener/designer-skills/doherty-threshold', '设计与前端', 'Doherty Threshold：以系统响应低于约 400 毫秒为交互性能目标，用于诊断感知延迟或设定响应预算。', ['设定界面响应性能预算', '诊断交互中的感知迟缓', '规划不可避免等待时的加载状态']],
  ['bergside/awesome-design-skills/spacious', '设计与前端', 'Spacious：使用充足留白、一致内边距和网格布局，构建清晰、易读且有呼吸感的界面。', ['设计宽松的内容布局', '统一页面间距与网格', '改善高密度界面的可读性']],
  ['bergside/awesome-design-skills/cafe', '设计与前端', 'Cafe：以暖色调、柔和字体和简洁布局营造舒适的咖啡馆式界面氛围。', ['设计咖啡或生活方式品牌页面', '建立温暖放松的视觉语言', '选择柔和排版与配色']],
  ['bergside/awesome-design-skills/fantasy', '设计与前端', 'Fantasy：使用游戏感主题、浓郁配色和沉浸式视觉元素构建奇幻风格界面。', ['设计奇幻游戏或娱乐页面', '建立沉浸式主题视觉', '规划高表现力配色与装饰元素']],
  ['bergside/awesome-design-skills/neon', '设计与前端', 'Neon：使用电光霓虹效果和高对比配色构建醒目、强烈的界面视觉。', ['设计夜间或赛博风格界面', '突出关键操作与标题', '建立高对比霓虹配色']],
  ['bergside/awesome-design-skills/skeumorphism', '设计与前端', 'Skeumorphism：通过纹理表面、立体效果和现实物体隐喻，让数字界面呈现熟悉的物理质感。', ['设计拟物化控件与面板', '用现实隐喻提升可理解性', '构建带纹理和立体感的界面']],
  ['corp-prod-skill-registry.ea.com/snowflake', '数据平台（待核对）', 'Snowflake：当前只能确认其名称与 skills.sh 目录元数据；公开详情未提供可审校说明，具体 Snowflake 能力、连接方式与适用范围无法确认。', ['核对来源页的 Snowflake 公开说明', '确认支持的数据操作与连接范围', '在公开信息充分后再评估用途']],
  ['samuelgursky/davinci-resolve-mcp/resolve-color', '视频后期', 'Resolve Color：在 DaVinci Resolve MCP 工作流中完成调色、校正、镜头匹配、风格开发及 LUT、CDL、DRX 等等级处理。', ['为 DaVinci Resolve 素材调色', '匹配不同镜头的色彩表现', '应用或调整 LUT、CDL 与 DRX 等级']],
  ['samuelgursky/davinci-resolve-mcp/resolve-rough-cut', '视频后期', 'Resolve Rough Cut：把幕后、Vlog 或产品拍摄素材整理为 Reels、TikTok、Shorts 等短视频的初剪时间线。', ['从素材文件夹组装短视频初剪', '查找镜头并建立无空隙时间线', '为竖屏社交视频准备剪辑结构']],
  ['transilienceai/communitytools/attack-path-stitcher', '安全与合规', 'Attack Path Stitcher：把已确认的单资产安全发现连接成跨组织的多跳攻击路径，并以资产和漏洞证据构建关系图。', ['关联分散的安全发现', '构建跨资产攻击路径图', '追踪每个利用跳转的证据来源']],
  ['w31r4/officekit/artifact-template-silver-atelier', '演示与文档设计', 'Artifact Template Silver Atelier：公开说明仅确认它是一种 Silver Atelier 演示文稿风格；具体版式、字体和配色规则以来源页为准。', ['核对 Silver Atelier 风格说明', '评估其是否适合目标演示文稿', '在规则明确后应用演示模板']],
  ['w31r4/officekit/presentation-editorial-trim', '演示与文档编辑', 'Presentation Editorial Trim：在不改变事实和幻灯片范围的前提下，精简演示标题、正文、标签、来源与演讲者备注。', ['压缩 PPT 或 PPTX 页面文案', '移除幻灯片中的模板化措辞', '统一标题、标签和备注的受众表达']],
  ['promovaweb/specsfy/specsfy-specialist-gitflow', '版本控制', 'Specsfy Specialist Gitflow：在项目明确采用 Gitflow 时，应用或审查 main、develop、feature、release、hotfix、support 分支模型、命名、合并政策和发布顺序。', ['审查既有 Gitflow 分支约定', '命名并推进 feature、release 或 hotfix', '核对 Gitflow 合并与关闭顺序']],
];

const septemberFourthSourceAwareOverrides = [
  ['google/skills/application-design-center-design-deploy', '云平台与运维', 'Application Design Center Design Deploy：在 Google Cloud Application Design Center 中设计、校验和部署基于 Terraform 的 GCP 基础设施。', ['设计 GCP Terraform 基础设施', '校验 HCL 并执行最佳实践扫描', '导入、部署并排查 ADC 模板']],
  ['forcedotcom/sf-skills/platform-trial-org-create', 'Salesforce 平台', 'Platform Trial Org Create：基于已认证的 Salesforce 主机组织创建 Trial、Developer 或 Trialforce 组织，并查询注册状态。', ['创建 Salesforce 试用或开发组织', '从 Trialforce 模板预配组织', '检查试用组织注册状态']],
  ['forcedotcom/sf-skills/service-agentforce-channel-configure', '客服与渠道集成', 'Service Agentforce Channel Configure：把现有 Agentforce Agent 接入消息、语音或邮件渠道，配置入站路由、回退队列与可选升级路径。', ['为 Agentforce Agent 添加渠道', '配置语音或邮件入站路由', '设置回退队列和升级流程']],
  ['fission-ai/openspec/release-openspec', '发布与版本管理', 'Release Openspec：审计 OpenSpec 已合并工作与 changeset 覆盖，准备版本 PR，发布 beta 或稳定版并核验发布结果。', ['检查发布前 changeset 覆盖', '准备或继续版本包 PR', '发布并核对 GitHub Release 说明']],
  ['planetscale/skills/planetscale-pscale-cli-automation', '数据库与自动化', 'Planetscale Pscale Cli Automation：指导自动化 Agent 以 JSON 输出、认证检查和按命令确认方式安全驱动 PlanetScale pscale CLI。', ['检查 pscale 认证状态', '以结构化 JSON 运行 CLI', '在自动化中执行 PlanetScale SQL']],
  ['bergside/awesome-design-skills/retro', '设计与前端', 'Retro：使用复古字体、高对比怀旧配色和年代感视觉元素构建回溯式界面风格。', ['设计复古主题页面', '搭配怀旧字体与配色', '统一年代感装饰元素']],
  ['arnabbagxd/brand-building-skills/brand-voice', '品牌与内容策略', 'Brand Voice：定义品牌语气、写作风格、常用词汇和信息表达规则，形成可供内容团队复用的语言身份。', ['制定品牌语气指南', '统一文案词汇与写作风格', '为内容团队建立语言规范']],
  ['expo/skills/eas-update', '移动应用发布', 'Eas Update：配置并使用 expo-updates 与 EAS CLI 发布 JavaScript 和资源的 OTA 更新，管理渠道、分支及运行时版本。', ['配置 Expo OTA 更新', '向预览或生产渠道发布更新', '排查已安装应用未收到更新']],
  ['github/awesome-copilot/speak-summary', '音频与语音', 'Speak Summary：把文本、Markdown 或摘要先改写为适合聆听的口语稿，再用本地 CPU 神经语音合成为 MP3。', ['把书面摘要转成语音', '生成通勤可听的 MP3', '将 Markdown 改写为口语内容']],
  ['ag-grid/skills/ag-update', '依赖与版本管理', 'Ag Update：把 AG Grid、AG Charts 和 AG Studio 依赖升级到较新版本。', ['升级 AG Grid 依赖', '同步 AG Charts 与 AG Studio 版本', '检查升级后的兼容性']],
  ['apidojo-io/apidojo-skills/analyzing-twitter-sentiment-for-topic', '社交媒体研究', 'Analyzing Twitter Sentiment For Topic：使用 apidojo 的公开 X/Twitter 抓取数据分析主题、品牌或事件的情绪倾向。', ['分析话题在 X 上的舆情', '比较品牌或竞品情绪倾向', '整理事件相关帖子的情绪分布']],
  ['apidojo-io/apidojo-skills/finding-food-bloggers-and-creators', '创作者营销', 'Finding Food Bloggers And Creators：通过 Instagram、TikTok 和 YouTube 公开数据寻找餐饮、食谱与烹饪内容创作者。', ['寻找餐饮品牌合作博主', '筛选特定菜系的食谱创作者', '建立美食达人外联名单']],
  ['appwrite/skills/appwrite-dart', '移动与后端开发', 'Appwrite Dart：在 Flutter 或服务端 Dart 应用中使用 Appwrite SDK，覆盖认证、数据库、文件、实时订阅与管理操作。', ['为 Flutter 应用接入 Appwrite', '实现认证、查询和文件上传', '使用实时订阅或服务端管理 API']],
  ['arnabbagxd/brand-building-skills/aso', '应用商店增长', 'Aso：优化 App Store 与 Google Play 的关键词、标题、截图、预览视频、评分评论和 A/B 测试。', ['制定应用商店关键词策略', '优化商店标题与视觉素材', '规划评分管理和页面实验']],
  ['arnabbagxd/brand-building-skills/b2b-brand-marketing', '品牌与营销', 'B2b Brand Marketing：为 B2B 企业规划品牌营销，覆盖思想领导力、ABM 品牌层、信任信号和长销售周期触点。', ['建立 B2B 品牌营销策略', '规划思想领导力与 LinkedIn 内容', '强化企业采购所需信任信号']],
  ['arnabbagxd/brand-building-skills/brand-architecture', '品牌战略', 'Brand Architecture：定义母品牌、子品牌与产品线之间的层级和命名关系，选择品牌家族或多品牌架构。', ['梳理多品牌关系', '设计子品牌与产品命名体系', '评估品牌延伸归属']],
  ['arnabbagxd/brand-building-skills/brand-audit', '品牌战略', 'Brand Audit：审计现有品牌的身份、信息、语气、定位和市场认知，识别一致性与健康度差距。', ['开展品牌健康检查', '审查视觉与信息一致性', '形成品牌差距与改进清单']],
  ['arnabbagxd/brand-building-skills/brand-context', '品牌战略', 'Brand Context：记录品牌身份、受众、定位、价值观和语气等基础上下文，供后续品牌工作复用。', ['创建品牌基础档案', '更新受众与定位信息', '为其他品牌流程提供统一上下文']],
  ['arnabbagxd/brand-building-skills/brand-guidelines', '品牌与设计', 'Brand Guidelines：编写涵盖标志、色彩、字体、语气、信息与应用规则的完整品牌规范文档。', ['制作品牌标准手册', '统一标志、色彩和字体规则', '为设计与内容团队提供应用指南']],
  ['arnabbagxd/brand-building-skills/brand-launch', '品牌与营销', 'Brand Launch：规划新品牌或品牌焕新的内部发布、公开亮相与分阶段推广。', ['制定品牌发布计划', '安排内部到外部的推广节奏', '准备品牌亮相与公告动作']],
  ['arnabbagxd/brand-building-skills/brand-manifesto', '品牌与内容策略', 'Brand Manifesto：撰写以信念为核心的品牌宣言，说明品牌坚持、反对和希望改变的事。', ['撰写品牌信念宣言', '凝聚团队对品牌使命的理解', '形成面向内外部的价值表达']],
  ['arnabbagxd/brand-building-skills/brand-measurement', '品牌分析', 'Brand Measurement：定义品牌认知、感知、健康度与资产价值的 KPI 和持续跟踪体系。', ['建立品牌健康指标', '设计品牌认知跟踪方案', '评估品牌投入与长期表现']],
  ['arnabbagxd/brand-building-skills/brand-messaging', '品牌与内容策略', 'Brand Messaging：构建标语、价值主张、关键信息和证明点组成的品牌信息层级。', ['制定品牌信息框架', '为不同受众编写价值主张', '统一标语、要点与证明材料']],
  ['arnabbagxd/brand-building-skills/brand-packaging', '包装与品牌设计', 'Brand Packaging：编写包装设计 Brief，明确结构、视觉方向、信息层级、材料和开箱体验。', ['准备包装设计简报', '规划标签与信息层级', '设计材料和开箱体验方向']],
  ['arnabbagxd/brand-building-skills/brand-partnerships', '品牌与营销', 'Brand Partnerships：规划联名、品牌合作、授权和联合营销，评估伙伴契合度与合作结构。', ['筛选品牌合作伙伴', '设计联名或联合营销方案', '评估授权合作与品牌契合度']],
  ['arnabbagxd/brand-building-skills/brand-story', '品牌与内容策略', 'Brand Story：创作品牌起源、创始人叙事和存在理由，用于 About 页面及品牌沟通。', ['撰写品牌起源故事', '整理创始人叙事', '重写 About Us 品牌内容']],
  ['arnabbagxd/brand-building-skills/brand-strategy', '品牌战略', 'Brand Strategy：通过结构化访谈收集客户信息，并形成定位、受众、价值与表达方向完整的品牌策略报告。', ['开展品牌策略访谈', '为客户制定品牌定位', '输出完整品牌策略报告']],
  ['arnabbagxd/brand-building-skills/competitor-branding', '市场与竞争研究', 'Competitor Branding：分析竞品的视觉身份、信息、定位、语气和风格，寻找品牌差异化机会。', ['审计竞品品牌表现', '比较竞品定位与信息', '识别市场表达空缺']],
  ['arnabbagxd/brand-building-skills/d2c-marketing', '电商与增长', 'D2c Marketing：为直接面向消费者的品牌规划获客、留存、邮件流程、社会证明、订阅和复购机制。', ['制定 DTC 获客策略', '设计留存与复购流程', '优化订阅和社会证明机制']],
  ['arnabbagxd/brand-building-skills/email-marketing', '营销与增长', 'Email Marketing：规划邮件名单增长、送达率、细分、Newsletter、活动、A/B 测试和邮件设计。', ['建立邮件营销渠道', '设计细分与自动化邮件流程', '优化送达率和互动指标']],
  ['arnabbagxd/brand-building-skills/google-ads', '广告投放', 'Google Ads：规划和优化搜索、购物、Performance Max、展示及 YouTube 广告，覆盖关键词、出价、追踪与 ROAS。', ['搭建 Google Ads 活动', '优化关键词、出价和质量得分', '配置转化追踪并改善 ROAS']],
  ['arnabbagxd/brand-building-skills/meta-ads', '广告投放', 'Meta Ads：规划和优化 Facebook 与 Instagram 广告，覆盖活动结构、受众、素材、Pixel、重定向、预算和 ROAS。', ['搭建 Meta 广告活动', '配置核心、自定义与类似受众', '优化素材、预算和重定向']],
  ['arnabbagxd/brand-building-skills/rebranding', '品牌战略', 'Rebranding：从现状诊断、新品牌定义到落地发布，规划完整的品牌转型或焕新。', ['诊断品牌过时与错位问题', '制定品牌焕新方向', '规划新品牌分阶段落地']],
  ['arnabbagxd/brand-building-skills/target-audience', '用户与市场研究', 'Target Audience：通过画像、心理特征和理想客户档案定义品牌目标受众。', ['建立客户画像与 ICP', '研究受众需求和心理特征', '明确品牌应优先触达的人群']],
  ['arnabbagxd/brand-building-skills/ugc-strategy', '内容与创作者营销', 'Ugc Strategy：规划用户生成内容的征集、创作者 Brief、社交活动、授权管理和广告复用。', ['制定 UGC 获取策略', '编写创作者内容简报', '管理授权并复用客户内容']],
  ['arnabbagxd/brand-building-skills/whatsapp-marketing', '营销与客户沟通', 'Whatsapp Marketing：规划 WhatsApp Business、广播活动、自动流程、客服、滴灌序列和对话式营销。', ['搭建 WhatsApp Business 营销', '设计广播和自动化滴灌流程', '整合客服与营销沟通']],
  ['coldteadotai/pr-lens/pr-lens', '架构可视化', 'Pr Lens：把代码变更或系统结构绘制为动画架构图或数据流图，并可附加到 Pull Request。', ['可视化 Pull Request 变更', '绘制系统架构或数据流', '用动画图解释代码结构']],
  ['fission-ai/openspec/draft-openspec-docs', '文档协作', 'Draft Openspec Docs：在目标页面内建立目的、结构和分步草稿计划，与用户逐步确认后撰写并清理临时计划。', ['从零规划 OpenSpec 文档页面', '与用户分节迭代草稿', '按确认步骤完成页面内容']],
  ['fission-ai/openspec/verify-openspec-docs', '文档验证', 'Verify Openspec Docs：以新上下文重新运行命令并对照源码，事实核查 OpenSpec 文档中的页面、段落或变更声明。', ['核验文档命令是否可运行', '对照源码检查技术声明', '事实审查已修改的文档内容']],
  ['fission-ai/openspec/write-openspec-docs', '文档与知识', 'Write Openspec Docs：按 OpenSpec 的行动优先、无冗余前言和易扫描风格撰写或修订文档页面。', ['编写 OpenSpec 用户文档', '按项目文风修订页面', '改善文档结构与可扫描性']],
  ['google/skills/cloud-databases-onboarding', '云数据库', 'Cloud Databases Onboarding：通过需求访谈和推荐矩阵选择合适的 Google Cloud 数据库，并辅助创建新数据库。', ['梳理云数据库需求', '比较并推荐 Google Cloud 数据库', '创建新的云数据库实例']],
  ['google/skills/cloud-monitoring-promql-query', '性能与可观测性', 'Cloud Monitoring Promql Query：根据 Cloud Monitoring 指标描述符和资源参数生成有效的 PromQL 查询与聚合表达式。', ['生成 Cloud Monitoring PromQL', '组织指标与资源过滤条件', '编写 PromQL 聚合查询']],
  ['google/skills/developing-genkit-go', 'AI 应用开发', 'Developing Genkit Go：使用 Go 与 Genkit 构建 AI 功能、Agent、Flow 和工具，覆盖生成、流式输出、工具调用与模型提供商。', ['用 Go 开发 Genkit 应用', '构建 Agent、Flow 与工具', '实现流式生成和模型调用']],
  ['google/skills/developing-genkit-js', 'AI 应用开发', 'Developing Genkit Js：使用 JavaScript 或 TypeScript 与 Genkit 构建 AI 功能、Agent、Flow 和工具，并排查类型或 API 问题。', ['用 Node.js 开发 Genkit 应用', '构建 Agent、Flow 与工具', '排查验证、类型和 API 错误']],
  ['google/skills/gke-custom-golden-image-discovery', 'GKE 与基础设施', 'Gke Custom Golden Image Discovery：根据 GKE 版本、操作系统、架构、加速器、gVisor 和 cgroups 等条件查找自定义节点的黄金基础镜像。', ['为 GKE 自定义节点选择基础镜像', '把集群参数映射到镜像名称', '查询 GKE 基础镜像映射']],
  ['google/skills/google-cloud-scc-query', '安全与合规', 'Google Cloud Scc Query：从 Google Cloud Security Command Center 查询活动安全发现、外部暴露、漏洞、威胁和敏感数据风险。', ['检索 SCC 安全发现详情', '核对发现类型与影响范围', '为安全分诊收集暴露和威胁证据']],
  ['software-mansion/argent/argent-ios-device-interact', '移动设备自动化', 'Argent Ios Device Interact：通过 argent 驱动已连接的实体 iPhone，仅适用于物理设备而非模拟器。', ['操作实体 iPhone', '在真机上执行交互流程', '为真机测试选择正确设备路径']],
  ['software-mansion/argent/argent-ios-device-setup', '移动开发环境', 'Argent Ios Device Setup：为 argent 配置通过线缆连接的实体 iPhone，处理真机接入前置条件。', ['设置有线连接的 iPhone', '准备 argent 真机环境', '排查信任、线缆或签名前置问题']],
];

const septemberFifthSourceAwareOverrides = [
  ['heygen-com/hyperframes/product-launch-video', '动效与视频', 'Product Launch Video：将产品或营销网址、已有脚本或 Brief 制作成 SaaS 宣传、功能发布、产品演示或公司上线视频。', ['为 SaaS 新功能制作发布视频', '将产品页面整理为宣传或演示视频', '根据脚本或 Brief 制作产品亮相内容']],
  ['heygen-com/hyperframes/motion-graphics', '动效与视频', 'Motion Graphics：制作以动效传达信息的短片，覆盖动态字体、数字与图表动画、品牌片头、字幕条、地图及网页 UI 动画。', ['制作动态字体或数据图表短片', '生成品牌片头和社交媒体叠加层', '制作地图或网页交互演示动画']],
  ['heygen-com/hyperframes/faceless-explainer', '动效与视频', 'Faceless Explainer：将文章、笔记、主题或 Brief 转成无出镜人物的解释视频，为每个场景组织字体、抽象图形、图解与数据可视化。', ['把文章或笔记制作成解释视频', '以图解和动态字体讲解概念', '制作无真人出镜的教程或清单视频']],
  ['affaan-m/ecc/ito-training', 'AI 训练与基础设施', 'Ito Training：检查已完成的 Itô GPU 计算预订是否可用于机器学习训练，并在后端可用且用户明确确认时交接训练 manifest；它不自带训练栈。', ['检查 GPU 预订的训练可用性', '为预训练、微调或强化学习准备 manifest', '在明确确认后交接训练任务']],
  ['amelnagdy/delegate-skills/copilot-delegate', 'Agent 与代码协作', 'Copilot Delegate：将编码任务交给 GitHub Copilot CLI 在后台实现，再由当前执行者审查差异并落地结果。', ['把明确的编码任务委托给 Copilot CLI', '审查 Copilot 生成的代码差异', '排队执行多个委托开发任务']],
  ['apidojo-io/apidojo-skills/finding-ecommerce-brands-for-outreach', '销售与客户开发', 'Finding Ecommerce Brands For Outreach：使用 apidojo 的公开 Instagram 与 TikTok 数据发现电商和 DTC 品牌，整理账号、粉丝、品类与互动信号。', ['建立电商品牌外联名单', '筛选特定品类的 DTC 或 Shopify 品牌', '为批发、SaaS 或合作团队寻找潜在客户']],
  ['appllama/appllama-skills/appllama-app-design-skill', '移动应用设计与开发', 'Appllama App Design Skill：设计和实现具有原生体验的 Expo/React Native 移动界面，覆盖导航语义、深色模式、动效与模拟器验证。', ['设计入门、付费墙或设置页面', '实现 Expo/React Native 移动界面', '检查导航、排版、动效和深色模式']],
  ['bergside/awesome-design-skills/expressive', '品牌与界面设计', 'Expressive：以鲜明色彩、活泼图形和动态布局构建有个性的视觉风格，同时保持信息结构。', ['为品牌或产品界面建立表现力风格', '搭配大胆配色与活泼图形', '在创意布局中保持内容层级']],
  ['bergside/awesome-design-skills/vibrant', '品牌与界面设计', 'Vibrant：以高活力配色、活泼字体、暖色点缀和动态视觉节奏构建鲜活的设计风格。', ['设计色彩鲜明的品牌或界面', '搭配活泼字体与暖色强调色', '统一页面的动态视觉节奏']],
  ['dart-lang/skills/dart-use-doc-examples', 'Dart 与开发文档', 'Dart Use Doc Examples：通过 Dartdoc 的 {@example} 指令引入外部代码示例，并使用 #hide、#region 与 #endregion 筛选示例文件。', ['在 Dartdoc 中引用外部代码示例', '隐藏示例文件的非展示区域', '用 region 标记选择文档片段']],
  ['designed-by-ai/skills/design-mobile-apps', '移动应用设计', 'Design Mobile Apps：使用 Sleek 项目设计移动应用与 UI 屏幕，或将 Sleek 设计落地为 HTML、React Native 或 SwiftUI 代码。', ['设计移动应用页面和流程', '处理 Sleek 设计项目', '将移动设计实现为 React Native 或 SwiftUI']],
  ['dotnet/skills/template-smart-defaults', '.NET 开发', 'Template Smart Defaults：在使用 dotnet new 创建 .NET 项目时补全跨参数默认规则，但不覆盖用户已明确设置的值。', ['为 Native AOT 选择相容目标框架', '协调认证与 HTTPS 默认值', '识别 controllers 与 minimal API 等互斥参数']],
  ['dynatrace/dynatrace-for-ai/dt-js-runtime', '可观测开发', 'Dt Js Runtime：说明 Dynatrace 服务端 JavaScript 运行时的函数契约、限制、Web API、Node.js 模块、凭据保管库 fetch 与 SDK 目录。', ['开发 Dynatrace 服务端 JavaScript 函数', '核对运行时限制和支持模块', '使用凭据保管库发起 fetch 请求']],
  ['fetcher-sh/fetcher-skills/google-news', '新闻搜索与监测', 'Google News：通过 fetcher.sh 提供的接口搜索 Google News 关键词、读取分区头条并解析新闻跳转链接，不直接抓取 RSS。', ['按关键词与语言地区搜索新闻', '监测头条和媒体提及', '将 Google News 跳转地址解析为原文链接']],
  ['fetcher-sh/fetcher-skills/reddit-api', '社区数据与研究', 'Reddit Api：通过 fetcher.sh 提供的接口搜索 Reddit 帖子、社区和用户，读取帖子评论树、社区 feed 与用户活动数据。', ['搜索 Reddit 帖子和社区', '读取帖子及其评论结构', '为舆情或关键词监测收集数据']],
  ['fetcher-sh/fetcher-skills/youtube-api', '视频数据与研究', 'Youtube Api：通过 fetcher.sh 提供的接口搜索 YouTube 视频、频道与播放列表，读取视频详情、评论、趋势及频道内容。', ['按时间、时长和排序搜索 YouTube 视频', '读取频道、播放列表和评论数据', '监测指定地区的热门视频']],
  ['forcedotcom/sf-skills/service-itsm-incident-mgmt-configure', 'Salesforce ITSM 管理', 'Service Itsm Incident Mgmt Configure：读取并切换 Salesforce ITSM 组织级 Incident Management 总开关，变更前需读取当前状态并获得用户明确确认。', ['查看 Incident Management 组织设置', '启用或停用 Salesforce ITSM 事故管理', '以幂等方式核对总开关状态']],
  ['iart-ai/web-animation-skills/glassmorphism', '界面设计与动效', 'Glassmorphism：为网页界面实现半透明磨砂玻璃面板、边缘高光、SVG 折射与悬停或滚动动效，并提供减少透明度的可访问回退。', ['制作磨砂导航、卡片或对话框', '为玻璃面板添加悬停和入场动效', '为减少透明度偏好提供回退样式']],
  ['open-mercato/skills/om-auto-fix-pr', 'Pull Request 与 CI', 'Om Auto Fix Pr：把指定的开放 Pull Request 推进到可合并状态，循环执行评审修复、CI 稳定和 UI 验证，但不自行合并。', ['将指定 PR 整理到可合并状态', '循环修复评审与 CI 问题', '为 PR 补充 UI 验证证据并交接审批']],
  ['qu-skills/superpowers/remotion-render', '动效与视频', 'Remotion Render：通过 inference.sh 将 React/Remotion TSX 组件代码渲染为 MP4，可配置分辨率、帧率、时长和编码。', ['把 Remotion TSX 组件渲染为视频', '制作数据驱动或程序化动画', '配置视频分辨率、帧率和编码']],
  ['skills-shell/superpowers/agent-browser', '浏览器自动化', 'Agent Browser：通过 inference.sh 驱动浏览器导航、按元素引用交互、截图和录屏，支持数据提取、表单、拖放与文件上传。', ['导航网页并点击或输入', '抓取数据并完成表单', '截图、录屏或测试网页交互']],
  ['sultanalsafran/agent-skills/arabic-presentations', '演示与多语排版', 'Arabic Presentations：创建、编辑、修复和验证以阿拉伯语为主或阿英双语的可编辑 PPTX，处理 RTL 段落、混排、项目符号与语言元数据。', ['制作阿拉伯语或阿英双语 PPTX', '修复 RTL 与阿拉伯语数字混排', '验证 PowerPoint 中的阿拉伯语渲染']],
  ['volcengine/mediakit-cli/byted-mediakit-audio', '音频处理', 'Byted Mediakit Audio：处理音频或视频音轨的语音边界、媒资探测、转码封装与人声、背景声分离。', ['探测音频媒资与语音边界', '转码音频并调整封装', '分离人声与背景声']],
  ['volcengine/mediakit-cli/byted-mediakit-editing', '音视频剪辑', 'Byted Mediakit Editing：对音频、视频和图片素材进行裁剪、拼接、变速、滤镜、转场、字幕压制、混音与多画面合成。', ['裁剪拼接并调整素材速度', '添加滤镜、转场、字幕与叠加层', '混合音轨并编排多画面成片']],
  ['volcengine/mediakit-cli/byted-mediakit-image', '图像处理', 'Byted Mediakit Image：处理单张或批量图片的尺寸、体积、裁剪旋转、颜色清晰度、模糊打码、水印、背景移除与 OCR。', ['批量缩放、压缩和裁剪图片', '调整色彩、清晰度或隐私区域', '移除背景并执行 OCR 或智能裁剪']],
  ['volcengine/mediakit-cli/byted-mediakit-shared', '媒体处理编排', 'Byted Mediakit Shared：作为 MediaKit 的统一入口，根据用户的音频、剪辑、图像或视频目标选择相应专项流程，不承担具体参数说明。', ['为音视频或图像任务选择专项流程', '在目标已明确但路径不确定时导航', '区分剪辑、图像、音频与视频处理边界']],
  ['volcengine/mediakit-cli/byted-mediakit-video', '视频理解与处理', 'Byted Mediakit Video：处理视频媒资探测、理解与画质治理，覆盖抽帧、语音转字幕、字幕提取或擦除、高光分析、转码封装与隐私处理。', ['提取字幕并生成语音转写', '分析高光、场景和剧情结构', '执行视频转码、画质治理或隐私处理']],
  ['wechatpay-apiv3/wechatpay-skills/wechatpay-payment-integration', '支付与商户集成', 'Wechatpay Payment Integration：作为微信支付接入的统一入口，辅助产品选型、查找官方示例、审查接入质量并排查 APIv2/APIv3、签名、证书、回调与交易问题。', ['为小程序、APP、H5 或 Native 选择支付产品', '查找微信支付官方示例并审查接入', '排查签名、证书、回调、错误码和查单问题']],
];

const septemberSixthSourceAwareOverrides = [
  ['genmedia-labs/skills/wan-3-0-prime-reference-to-video', '视频生成', 'Wan 3 0 Prime Reference To Video：依据图像、视频与音频参考素材生成带同步音轨的视频，并约束人物、商品与场景的一致性。', ['用多种参考素材生成一致角色视频', '制作带同步音轨的商品或场景短片', '在不同 Wan 视频路径间选择合适方案']],
  ['genmedia-labs/skills/seedance-2-5-reference-to-video', '视频生成', 'Seedance 2 5 Reference To Video：依据多张图片、视频片段与音频参考生成 1080p 视频，保持身份和风格一致并可生成同步音频。', ['用多参考素材生成一致角色视频', '制作风格锁定的 1080p 短片', '先生成草稿再完成交付版本']],
  ['genmedia-labs/skills/seedance-2-5-image-to-video', '视频生成', 'Seedance 2 5 Image To Video：将单张静态图片生成 4–30 秒视频，可选同步音频，输出画幅沿用输入图片。', ['把静态图片制作成短视频', '为图片动画添加同步音频', '在不同 Seedance 视频模式间选型']],
  ['apidojo-io/social-media-skills/instagram-scraper', '社交数据采集', 'Instagram Scraper：采集 Instagram 帖子、Reels、账号、话题、地点、评论及用户关系数据。', ['采集 Instagram 帖子与 Reels', '查询账号、话题和地点内容', '整理评论与关注者数据']],
  ['apidojo-io/social-media-skills/tiktok-scraper', '社交数据采集', 'Tiktok Scraper：采集 TikTok 视频、账号、话题、音乐、评论和地点相关帖子。', ['采集 TikTok 视频与账号资料', '查询话题、音乐和地点内容', '整理帖子评论数据']],
  ['apidojo-io/social-media-skills/x-scraper', '社交数据采集', 'X Scraper：按查询、账号、话题、关键词、会话、日期范围或列表采集 X/Twitter 帖子。', ['按关键词和日期搜索帖子', '采集账号或列表内容', '整理会话线程与话题数据']],
  ['101-skills/superpowers/python-executor', '代码执行与数据处理', 'Python Executor：在公开说明所述的沙箱环境中执行 Python，用于数据处理、网页采集、媒体处理、PDF、3D 与自动化脚本。', ['运行 Python 数据分析与可视化', '执行网页采集和自动化脚本', '处理图片、视频、PDF 或 3D 数据']],
  ['appllama/appllama-skills/appllama-usage', '移动应用研究', 'Appllama Usage：通过 Appllama MCP 研究真实移动应用的页面、流程和界面元素，并将观察结果用于移动产品设计与实现。', ['研究移动应用的入门和付费流程', '检索真实应用页面与界面元素', '依据竞品模式改进移动页面']],
  ['caffeinelabs/skills/connector-twilio', '消息与通信集成', 'Connector Twilio：在 Caffeine canister 中通过公开说明指定的客户端接入 Twilio SMS/MMS，并提示计费、注册和重复发送风险。', ['为应用接入 Twilio 短信或彩信', '配置消息服务与认证凭据', '审查计费、注册和重复发送风险']],
  ['ghaida/intent/wireframe', '产品与界面设计', 'Wireframe：在视觉定稿前梳理屏幕结构、真实标签、信息层级与交互流，产出低保真线框或可点击原型。', ['探索页面结构备选方案', '制作灰度线框与真实信息层级', '用可点击原型验证屏幕流程']],
  ['tradermonty/claude-trading-skills/cot-contrarian-detector', '金融分析', 'Cot Contrarian Detector：分析 CFTC 期货持仓报告，以多周期 COT 指数识别投机者拥挤多头或空头，但不单独生成交易信号。', ['筛查期货市场拥挤持仓', '比较长期与短期 COT 极值', '为逆向交易研究准备候选']],
  ['tradermonty/claude-trading-skills/futures-position-sizer', '金融风控', 'Futures Position Sizer：依据方向、入场价、止损价和合约规格计算期货合约数量与风险敞口。', ['计算期货仓位合约数', '按止损距离约束单笔风险', '核对乘数、最小跳动和点值']],
  ['cli/cli/gh', '开发与工程', 'Gh：整理 Agent 调用 GitHub CLI 的结构化输出、分页、仓库定位、搜索与 API 回退模式。', ['以结构化格式调用 GitHub CLI', '处理列表和搜索分页', '在普通命令不足时调用 gh api']],
  ['sentimony/skills/scope-triage', '产品与技术规划', 'Scope Triage：在新功能、产品行为、架构变更或成功标准不清时识别需要先完成的设计决策，并区分可直接实施的机械改动。', ['判断需求是否需要先做设计决策', '澄清新功能与架构变更边界', '区分探索任务和直接实施任务']],
  ['sentimony/skills/plan-crafting', '产品与技术规划', 'Plan Crafting：将已确认的设计或稳定需求整理为可执行的多步骤实施计划。', ['拆解已定需求的实施步骤', '记录依赖、验证与交付顺序', '为代码修改准备执行计划']],
  ['cloudflare/skills/nextjs-on-cloudflare', '云平台与 Web 开发', 'Nextjs On Cloudflare：使用 vinext 在 Cloudflare Workers 上新建、迁移和部署 Next.js 应用，并辅助比较 vinext 与 OpenNext。', ['在 Workers 上启动 Next.js 项目', '把现有 Next.js 应用迁移到 Cloudflare', '比较并配置 vinext 或 OpenNext']],
  ['101-skills/superpowers/happyhorse', '视频生成', 'Happyhorse：通过公开说明中的 HappyHorse 模型生成和编辑视频，覆盖文生视频、图生视频、参考生成与自然语言编辑。', ['根据文字或图片生成视频', '参考既有素材保持角色一致', '用自然语言编辑已有视频']],
  ['apidojo-io/apidojo-skills/building-twitter-prospect-lists', '销售与客户开发', 'Building Twitter Prospect Lists：依据 X/Twitter 账号资料和帖子筛选符合职位、行业或话题条件的 B2B 潜在客户。', ['寻找创始人或行业决策者', '按 ICP 条件筛选 X 账号', '导出含资料与近期帖子的线索名单']],
  ['apidojo-io/apidojo-skills/finding-content-gaps-from-google-serp', 'SEO 与内容研究', 'Finding Content Gaps From Google Serp：分析 Google 搜索结果覆盖质量，识别竞品已排名但内容薄弱或尚未充分回答的主题。', ['发现关键词内容缺口', '评估搜索结果覆盖质量', '为 SEO 内容投资排序']],
  ['apidojo-io/apidojo-skills/finding-industry-event-coverage-google', '新闻与行业研究', 'Finding Industry Event Coverage Google：通过 Google 搜索收集行业会议、展会或峰会的报道、公告、回顾与演讲摘要。', ['追踪行业活动媒体报道', '汇总会议公告和回顾', '查找演讲者观点与议程摘要']],
  ['apidojo-io/apidojo-skills/finding-trending-twitter-topics-for-content', '社交内容研究', 'Finding Trending Twitter Topics For Content：从 X/Twitter 帖子与互动信号中识别适合内容策划的上升话题。', ['发现行业热门话题', '比较话题互动与传播信号', '为社交内容日历寻找选题']],
  ['apidojo-io/apidojo-skills/monitoring-tiktok-mentions-of-brand', '品牌监测', 'Monitoring Tiktok Mentions Of Brand：监测 TikTok 中的品牌、产品或关键词提及，并整理视频与互动信号。', ['追踪 TikTok 品牌提及', '发现产品相关用户内容', '汇总提及视频与互动表现']],
  ['apidojo-io/apidojo-skills/scraping-instagram-users-by-keyword', '社交数据采集', 'Scraping Instagram Users By Keyword：按关键词查找 Instagram 用户，并整理账号资料与受众规模等公开字段。', ['按行业或兴趣关键词寻找账号', '建立创作者或潜客名单', '导出账号资料和粉丝规模']],
  ['apidojo-io/apidojo-skills/tracking-product-launch-buzz-on-twitter', '品牌监测', 'Tracking Product Launch Buzz On Twitter：追踪 X/Twitter 上围绕产品发布的帖子、讨论与互动变化。', ['监测新品发布讨论', '收集相关帖子和账号', '汇总发布期热度与反馈']],
  ['bmad-code-org/bmad-method/bmad-brainstorming', '创意与规划', 'Bmad Brainstorming：使用结构化创意方法开展互动式头脑风暴，扩展、归类并收敛想法。', ['为产品或内容主题发散创意', '切换不同方法突破思路', '将想法归类并形成候选方向']],
  ['cline/skills/use-railway', '部署与运维', 'Use Railway：在 Railway 上创建、配置、部署和排查应用服务、数据库、域名与环境变量。', ['部署应用到 Railway', '配置服务、数据库和域名', '排查构建或运行故障']],
  ['getsentry/sentry-for-ai/sentry-fix-stack-traces', '可观测性', 'Sentry Fix Stack Traces：通过上传 JavaScript Source Map 或各平台调试符号，使 Sentry 中的压缩、混淆或原生堆栈恢复可读。', ['修复 JavaScript 压缩堆栈', '上传移动或原生调试符号', '恢复原始文件名、方法名与行号']],
  ['heygen-com/liveavatar-agent-skills/liveavatar-debug', '数字人与音视频', 'Liveavatar Debug：排查 LiveAvatar 集成中的会话启动、静音、音频异常、事件缺失和 API 错误。', ['诊断数字人会话启动失败', '排查无声或音频失真', '检查事件接收与 API 错误']],
  ['heygen-com/liveavatar-agent-skills/liveavatar-demo', '数字人与音视频', 'Liveavatar Demo：从公开示例中搭建可运行的 LiveAvatar 演示，并标出账号开通和人工配置环节。', ['试用 LiveAvatar 参考演示', '搭建销售或线索筛选数字人', '验证 LiveKit 与 LiveAvatar 联动']],
  ['heygen-com/liveavatar-agent-skills/liveavatar-feedback', '开发者反馈', 'Liveavatar Feedback：在 LiveAvatar 集成完成、遇阻或发现问题时整理开发者反馈、错误与改进建议。', ['提交 LiveAvatar 集成反馈', '报告故障或产品问题', '汇总反复失败的集成步骤']],
  ['heygen-com/liveavatar-agent-skills/liveavatar-integrate', '数字人与音视频', 'Liveavatar Integrate：评估现有技术栈并选择 Embed、FULL 或 LITE 路径，完成实时互动数字人的端到端集成。', ['为网站或应用添加实时数字人', '连接数字人与现有 AI 流程', '从旧版互动数字人方案迁移']],
  ['jssblck/agents/code-craft', '开发与工程', 'Code Craft：遵循现有项目约定编写、审查或重构代码，强调清晰边界、实用类型与适量抽象。', ['实现范围明确的代码改动', '审查代码结构与类型设计', '重构过度抽象或边界不清的模块']],
  ['jssblck/agents/project-bootstrap', '开发与工程', 'Project Bootstrap：为明确要求初始化的仓库应用项目基础设施、工具链与完整模板。', ['初始化新代码仓库', '应用团队仓库工具默认值', '搭建完整项目基础设施模板']],
  ['magentosh/superpowers/gpt-image', '图像生成与编辑', 'Gpt Image：通过公开说明中的 GPT-Image 模型生成和编辑图片，覆盖文生图、局部重绘、蒙版编辑和多图参考。', ['根据文字生成图片', '编辑已有图片或局部区域', '使用蒙版和多图参考生成视觉素材']],
  ['mempalace/mempalace/mempalace', 'Agent 记忆与协作', 'Mempalace：安装、配置和运行 MemPalace 的私有记忆宫殿、共享中心或客户端连接。', ['设置本地个人记忆库', '连接或维护共享记忆中心', '检查房间、抽屉和日志流状态']],
  ['mempalace/mempalace/mempalace-recall', 'Agent 记忆与协作', 'Mempalace Recall：在回答过去工作、人物、项目或决策前检索 MemPalace 中已保存的记录。', ['回顾历史决策与讨论', '查找人物或项目背景', '在回答前检索既有记忆']],
  ['mempalace/mempalace/mempalace-task', 'Agent 任务协作', 'Mempalace Task：通过 MemPalace 日志流创建、交接、领取、执行和关闭 Agent 任务。', ['创建可交接的 Agent 任务', '领取并跟踪日志流任务', '关闭任务并记录执行结果']],
  ['miqdadbadjuber/anti-slop/antislop-human', '可访问性与界面质量', 'Antislop Human：从真实用户可用性出发检查对比度、键盘操作、焦点与交互状态，并提供对比度检查。', ['检查界面色彩对比度', '审查键盘和焦点可达性', '补齐加载、错误与交互状态']],
  ['skills-shell/superpowers/happyhorse', '视频生成', 'Happyhorse：通过公开说明中的 HappyHorse 模型生成和编辑视频，覆盖文生视频、图生视频、参考生成与自然语言编辑。', ['根据文字或图片生成视频', '参考既有素材保持角色一致', '用自然语言编辑已有视频']],
  ['social-media-skills/skills/brand-profile', '品牌与社交内容', 'Brand Profile：建立可复用的品牌档案，记录业务定位、受众、语气和内容边界，为后续社交内容提供统一上下文。', ['为新品牌建立内容档案', '定义受众、品牌语气与表达边界', '为后续社交内容统一上下文']],
  ['social-media-skills/skills/educational-content-and-how-to', '社交内容策划', 'Educational Content And How To：围绕一个主题设计完整、准确且适配渠道的教程、步骤说明、解释或辟谣内容。', ['策划教程和分步说明内容', '制作解释型或辟谣型社交帖子', '将教学主题路由到合适内容格式']],
  ['social-media-skills/skills/hook-writer', '社交内容写作', 'Hook Writer：为帖子首行、视频开场、轮播封面、线程开头、标题或邮件主题撰写真正匹配后续内容的吸引点。', ['撰写社交帖开场句', '设计短视频前三秒钩子', '为轮播、线程或标题生成开场变体']],
  ['social-media-skills/skills/short-form-video-script', '短视频脚本', 'Short Form Video Script：为 Reels、TikTok 与 Shorts 编写口播、画面文字、节拍、镜头方向、钩子变体和行动号召。', ['编写竖屏短视频脚本', '优化开场、节奏和完播率', '组织口播、字幕与镜头提示']],
  ['social-media-skills/skills/storytelling-and-narrative', '社交内容写作', 'Storytelling And Narrative：以冲突、转变与解决结构组织品牌、创始人或客户故事，并适配不同社交内容格式。', ['组织品牌或创始人故事', '把平淡素材改写为叙事内容', '为多种内容格式设计故事弧']],
  ['social-media-skills/skills/voice-builder', '品牌与社交内容', 'Voice Builder：分析真实写作样本，建立可复用的个人或品牌声音指南，减少后续内容的通用 AI 腔。', ['从既有文章或帖子提炼语气', '建立可复用品牌声音指南', '为代笔和多渠道内容统一文风']],
  ['spatie/guidelines-skills/spatie-laravel-php', 'PHP 与 Laravel 开发', 'Spatie Laravel Php：在创建、修改、审查或重构 Laravel、PHP 与 Blade 代码时应用 Spatie 编码规范和 PSR-12。', ['按规范编写 Laravel 控制器和模型', '审查路由、验证、迁移与测试', '格式化 PHP 与 Blade 代码']],
  ['specture-system/specture/specture', '规格驱动开发', 'Specture：按 Specture 体系创建、实施、验证或迁移规格文档与 Agent 执行计划。', ['创建规格驱动的开发文档', '依据规格实施与验证改动', '迁移既有规格和执行计划']],
  ['199-biotechnologies/motion-dev-animations-skill/motion-dev-animations', '界面动效', 'Motion Dev Animations：使用 Motion.dev 为 React、Next.js、Svelte 与 Astro 界面实现滚动、手势、弹簧、过渡和布局动画。', ['实现滚动与视差效果', '添加拖拽、悬停和弹簧交互', '制作页面过渡与布局动画']],
  ['21st-dev/skill/21st-ai', '设计与前端', '21st Ai：通过 21st CLI 从提示生成多个界面方案，在浏览器预览迭代后将选定代码拉取到项目。', ['从提示草拟界面方案', '预览并修改多个 UI 变体', '将选定组件代码加入项目']],
  ['21st-dev/skill/21st-cli-use', '前端组件工具', '21st Cli Use：通过 21st CLI 搜索和查看 React、shadcn 组件、主题与模板，并将所选代码引入项目。', ['搜索组件、主题和模板', '查看组件源码或主题 CSS', '将选定项目拉取到代码库']],
  ['21st-dev/skill/21st-design-sync', '设计系统', '21st Design Sync：读取项目中的 shadcn 与 Tailwind 颜色令牌，将当前设计发布为可分享的 21st.dev 主题。', ['提取项目设计令牌', '将现有主题同步到 21st.dev', '分享可复用的社区主题']],
  ['21st-dev/skill/21st-ui-build', '设计与前端', '21st Ui Build：基于现有设计上下文和组件实现或显著改造生产界面，覆盖响应式布局与视觉打磨。', ['实现生产级页面或组件', '按现有设计系统改造界面', '完善响应式和视觉细节']],
  ['21st-dev/skill/21st-ui-explore', '产品与界面设计', '21st Ui Explore：依据现有设计系统探索并比较多个差异明确的界面方向，用于概念选择和视觉试验。', ['生成多个界面设计方向', '比较布局、风格与交互方案', '在实现前收敛视觉选择']],
  ['21st-dev/skill/21st-ui-review', '界面质量', '21st Ui Review：按设计上下文、可访问性、响应式行为和交互质量审查现有界面，并定位高置信度缺陷。', ['执行界面设计 QA', '检查可访问性与响应式表现', '发现一致性和交互问题']],
  ['alterlab-ieu/alterlab_gameforge/game-designer', '游戏设计', 'Game Designer：设计游戏核心循环、机制、平衡、成长、奖励、上手流程和系统规则，并整理 GDD。', ['设计核心循环和玩法机制', '平衡成长与奖励系统', '撰写或修订游戏设计文档']],
  ['alterlab-ieu/alterlab_gameforge/game-economy-designer', '游戏经济设计', 'Game Economy Designer：设计虚拟货币、来源与消耗、免费游玩变现、战令及资源流，并分析通胀风险。', ['设计双货币和资源循环', '平衡产出、消耗与通胀', '规划战令或免费游玩经济']],
  ['apidojo-io/apidojo-skills/discovering-pre-launch-startups-on-twitter', '市场与创业研究', 'Discovering Pre Launch Startups On Twitter：从 X/Twitter 公开帖子发现隐身开发、内测、候补名单或尚未正式发布的早期产品与团队。', ['发现预发布创业项目', '寻找公开构建的早期创始人', '整理内测和候补名单信号']],
  ['apidojo-io/apidojo-skills/finding-speaking-opportunities-on-twitter', '公关与活动拓展', 'Finding Speaking Opportunities On Twitter：从 X/Twitter 查找征集演讲者的会议、播客与峰会，并整理主办方联系人。', ['查找行业演讲机会', '发现公开征集讲者的活动', '整理主办方与联系线索']],
  ['arcturus91/claude-flutter-skill/flutter', '移动应用开发', 'Flutter：开发、调试和审查 Flutter/Dart 移动应用，覆盖布局、状态、导航、网络、Firebase、地图、支付、测试与发布。', ['实现 Flutter 页面与状态管理', '接入网络、Firebase 或地图能力', '测试、优化并构建移动应用']],
  ['assistant-ui/skills/generative-ui', '生成式界面', 'Generative Ui：使用 assistant-ui 的组件词汇与展示工具，让模型在运行时组合界面而非为每个工具固定手写组件。', ['建立模型驱动的组件词汇', '用结构化数据动态组合界面', '配置 assistant-ui 展示工具']],
  ['athevon/genjutsu/css-native', 'CSS 与界面动效', 'Css Native：使用现代原生 CSS 实现零依赖的滚动动画、View Transitions、@starting-style 与视觉效果。', ['实现滚动驱动动画', '配置页面 View Transitions', '用原生 CSS 制作入场效果']],
  ['bmad-code-org/bmad-method/bmad', 'Agent 工作流', 'Bmad：分析当前状态与问题，回答 BMad 使用问题或推荐下一项适合的 BMad 工作流。', ['查询 BMad 使用方式', '判断下一步应采用的工作流', '检查 BMad 安装或配置状态']],
  ['bmad-code-org/bmad-method/bmad-advanced-elicitation', '推理与评审', 'Bmad Advanced Elicitation：使用苏格拉底式提问、第一性原理、预演失败等方法重新审视并强化近期输出。', ['深入批评已有方案', '用第一性原理重新推导', '通过预演失败发现薄弱点']],
  ['bmad-code-org/bmad-method/bmad-agent-architect', '软件架构', 'Bmad Agent Architect：以系统架构师角色负责技术设计、架构决策和跨模块一致性。', ['讨论系统架构方案', '记录关键技术决策', '协调模块边界与依赖']],
  ['bmad-code-org/bmad-method/bmad-agent-dev', '开发与工程', 'Bmad Agent Dev：以高级软件工程师角色实施故事和代码改动，并完成相应验证。', ['实现功能故事', '修复缺陷并修改代码', '验证工程改动结果']],
  ['bmad-code-org/bmad-method/bmad-agent-pm', '产品管理', 'Bmad Agent Pm：以产品经理角色开展需求发现并创建或完善产品需求文档。', ['梳理产品需求', '创建或修订 PRD', '澄清范围和验收标准']],
  ['bmad-code-org/bmad-method/bmad-agent-ux-designer', '用户体验设计', 'Bmad Agent Ux Designer：以 UX 与界面设计角色规划体验、交互和视觉方向。', ['设计用户流程与交互', '规划界面视觉方向', '审查产品体验问题']],
  ['bmad-code-org/bmad-method/bmad-architecture', '软件架构', 'Bmad Architecture：从规格、想法或现有代码库创建、更新或验证简洁的架构决策文档。', ['创建技术架构文档', '验证架构决策完整性', '统一独立模块的实现约束']],
  ['bmad-code-org/bmad-method/bmad-build', '开发与工程', 'Bmad Build：将功能、故事或缺陷修复转化为经过审查和验证的工作代码。', ['实现有明确范围的功能', '修复并验证软件缺陷', '对实现结果进行审查']],
  ['bmad-code-org/bmad-method/bmad-build-auto', '开发自动化', 'Bmad Build Auto：执行一次无人值守的开发循环迭代，用于明确调用的自动构建流程。', ['运行单轮自动开发迭代', '推进已定义的实现任务', '记录自动迭代结果']],
  ['bmad-code-org/bmad-method/bmad-code-review', '代码审查', 'Bmad Code Review：组织多个独立审查视角检查代码变更，再汇总、分诊并呈现发现。', ['并行审查代码变更', '合并和去重审查意见', '按优先级呈现代码问题']],
  ['bmad-code-org/bmad-method/bmad-deep-recon', '深度研究', 'Bmad Deep Recon：为决策准备研究提示、将现有研究报告压缩为带引用摘要，或执行多路网页研究。', ['起草可复用研究提示', '摘要已有研究报告', '开展市场、技术或竞品研究']],
  ['bmad-code-org/bmad-method/bmad-forge-idea', '创意与决策', 'Bmad Forge Idea：通过多角色追问压力测试尚未成形的想法，直到形成可行动方向或明确放弃理由。', ['压力测试产品想法', '从不同角色发现弱点', '将成熟想法整理为简短 Brief']],
  ['bmad-code-org/bmad-method/bmad-party-mode', '多角色讨论', 'Bmad Party Mode：组织已配置 BMad Agent 或自定义角色开展圆桌讨论，并支持定义讨论角色组合。', ['组织多角色圆桌讨论', '比较不同专业视角', '创建自定义讨论角色组']],
  ['bmad-code-org/bmad-method/bmad-prd', '产品管理', 'Bmad Prd：创建、更新或验证产品需求文档，明确目标、范围、需求与验收。', ['创建产品需求文档', '更新既有 PRD', '验证需求完整性和一致性']],
  ['bmad-code-org/bmad-method/bmad-prfaq', '产品战略', 'Bmad Prfaq：采用 Working Backwards 方法先写成品新闻稿，再回答客户与利益相关者问题，形成完整 PRFAQ。', ['用倒推法检验产品概念', '撰写产品新闻稿草案', '回答客户和利益相关者难题']],
  ['bmad-code-org/bmad-method/bmad-product-brief', '产品规划', 'Bmad Product Brief：创建、更新或验证简洁的产品 Brief，为后续需求与设计工作提供统一起点。', ['创建产品 Brief', '更新产品背景与目标', '验证范围和关键假设']],
  ['bmad-code-org/bmad-method/bmad-project-context', 'Agent 工程规范', 'Bmad Project Context：为仓库建立、采用、刷新或审计 Agent 指令，并记录重复出现的执行陷阱。', ['创建仓库 Agent 上下文', '审计和刷新 AGENTS.md', '沉淀 Agent 常见错误']],
  ['bmad-code-org/bmad-method/bmad-retrospective', '项目复盘', 'Bmad Retrospective：依据规格、故事、差异、提交和进度证据复盘已完成 Epic，形成行动项与验收结论。', ['复盘已完成的 Epic', '从交付证据提炼经验', '生成行动项和验收决策']],
  ['bmad-code-org/bmad-method/bmad-spec', '规格驱动开发', 'Bmad Spec：将想法、Brief、PRD、转写或混合笔记压缩为简洁规格，并可更新、验证或拆分故事。', ['从零散输入创建规格', '更新或验证现有规格', '将规格拆分为实现故事']],
  ['bmad-code-org/bmad-method/bmad-sprint-planning', '敏捷与项目管理', 'Bmad Sprint Planning：检查规划是否足以实施，生成、汇总、验证或修复 Sprint 状态文件。', ['检查实施准备度', '生成 Sprint 计划和状态', '验证或修复进度跟踪文件']],
  ['bmad-code-org/bmad-method/bmad-ux', '用户体验设计', 'Bmad Ux：通过 DESIGN.md 与 EXPERIENCE.md 记录产品视觉与行为体验要求。', ['定义产品视觉方向', '记录交互和行为体验', '创建 UX 规格文档']],
  ['bmad-code-org/bmad-method/bmad-walkthrough', '交付与评审', 'Bmad Walkthrough：引导人工审查代码改动，说明改动目的、重点检查区域和测试方式。', ['讲解变更目的和范围', '标出人工复核重点', '提供可执行的测试步骤']],
  ['caoxg/claude-skill-aesthetic-foundations/aesthetic-foundations', '视觉与审美设计', 'Aesthetic Foundations：将绘画、摄影、平面设计与东方视觉传统中的构图、重量、引导线等原则用于界面设计与审查。', ['审查页面构图与视觉重量', '改进排版、色彩和间距', '为设计决策补充审美依据']],
  ['cline/skills/data-analyst', '数据分析', 'Data Analyst：面向 ClickHouse 数据开展交互式指标、趋势、漏斗、分布和导出分析。', ['查询内部业务指标', '分析漏斗、趋势和分布', '生成临时 SQL、图表或数据导出']],
  ['cline/skills/endor-setup', '安全与开发工具', 'Endor Setup：安装和配置 endorctl，运行依赖漏洞扫描，并排查命令缺失、认证、租户与权限错误。', ['配置 Endor Labs 命令行', '运行依赖安全扫描', '排查认证和命名空间问题']],
  ['daffy0208/ai-dev-standards/design-system-architect', '设计系统', 'Design System Architect：规划可扩展组件库、设计令牌、Storybook、主题和设计系统治理。', ['建立组件库与原子层级', '定义颜色、排版和间距令牌', '规划主题与设计系统治理']],
  ['davepoon/buildwithclaude/brand-guidelines', '品牌设计', 'Brand Guidelines：将公开说明中的 Anthropic 品牌色彩与排版规范应用到适合的视觉交付物。', ['为视觉材料应用品牌配色', '统一字体和排版层级', '检查品牌样式一致性']],
  ['davila7/claude-code-templates/claude-code-guide', 'Agent 使用指南', 'Claude Code Guide：汇总 Claude Code 的配置模板、提示策略、调试方法与使用实践。', ['配置 Claude Code 工作环境', '改进任务提示和协作方式', '排查 Claude Code 使用问题']],
  ['exa-labs/agent-skills/company-research', '公司与市场研究', 'Company Research：使用 Exa 收集公司资料、竞品、新闻、财务与职业网络信息，并建立公司清单。', ['研究目标公司和竞品', '收集新闻与财务背景', '建立市场或公司名单']],
  ['exa-labs/agent-skills/exa-search', '网页搜索与研究', 'Exa Search：通过 Exa 搜索接口执行语义网页检索，支持域名、类别与时效过滤及内容提取。', ['执行语义网页搜索', '按域名或类别筛选结果', '提取正文、高亮或结构化结果']],
  ['exa-labs/agent-skills/lead-generation', '销售与客户开发', 'Lead Generation：依据理想客户画像查找公司，以新闻和业务信号丰富、评分并输出潜客清单。', ['按 ICP 生成潜客名单', '用新闻和信号丰富公司资料', '为外呼团队输出评分列表']],
  ['guia-matthieu/clawfu-skills/conversion-copywriting', '转化文案', 'Conversion Copywriting：采用客户原声研究方法撰写并测试落地页、邮件与销售页转化文案。', ['研究客户原声与购买动机', '撰写落地页和销售页文案', '设计可衡量的文案测试']],
  ['hashicorp/agent-skills/provider-configuration', 'Terraform 开发', 'Provider Configuration：使用 Terraform Plugin Framework 实现 Provider 配置、认证链、敏感字段、未知值保护和密钥脱敏。', ['定义 Provider 凭据 Schema', '实现多级认证回退链', '处理敏感信息与配置期错误']],
  ['hashicorp/agent-skills/terraform-policy', '基础设施策略', 'Terraform Policy：编写、测试或转换 Terraform Policy 文件，包括 .policy.hcl、.policytest.hcl 与 Sentinel 迁移。', ['编写 Terraform Policy', '创建策略测试文件', '将 Sentinel 转换为 tfpolicy']],
  ['hyperfx-ai/marketing-skills/openai-ads', '广告投放', 'Openai Ads：通过公开说明所述的 Hyper MCP 规划和管理 ChatGPT 广告活动、定向、素材、受众、转化与洞察。', ['规划 ChatGPT 广告活动', '管理广告组、素材与受众', '配置转化跟踪并分析表现']],
  ['joelhooks/effectts-skills/effect-ts', 'TypeScript 开发', 'Effect Ts：按 Effect v4 实践编写、审查和重构 TypeScript 服务、依赖层、错误、数据模型、测试与 HTTP 客户端。', ['设计 Effect 服务与依赖注入', '建模错误和 Schema 类型', '编写测试与 HTTP 客户端']],
  ['kardi34/trade-karne/trade-karne', '交易复盘与风控', 'Trade Karne：依据资金曲线和交易日志计算风险调整指标、周度评分、闲置资金惩罚与确定性复盘标签。', ['评估周度交易质量', '计算 Sharpe、Sortino 等指标', '识别流程问题与闲置资金']],
  ['mem0ai/mem0/mem0-cli', 'Agent 记忆工具', 'Mem0 Cli：通过 Mem0 命令行初始化配置并新增、搜索、列举、读取或导入记忆。', ['初始化 Mem0 命令行', '新增和检索 Agent 记忆', '列举、读取或导入记忆数据']],
  ['mikubaka88/ccfa-skills/ccf-experiment-designer', '实验设计', 'Ccf Experiment Designer：定义数据集、基线、指标、消融、鲁棒性测试、图表证据和结果表结构。', ['规划模型对比实验', '设计消融和鲁棒性测试', '定义结果表与图表证据']],
  ['niaka3dayo/agent-skills-vrc-udon/unity-vrc-udon-sharp', 'VRChat 与游戏开发', 'Unity Vrc Udon Sharp：编写、审查、调试和迁移 VRChat SDK 3.10.5 的 UdonSharp C# 与 UdonBehaviour 代码。', ['实现 UdonSharp 交互脚本', '审查网络调用与权限', '迁移和调试 VRChat 行为代码']],
  ['niaka3dayo/agent-skills-vrc-udon/unity-vrc-world-sdk-3', 'VRChat 与游戏开发', 'Unity Vrc World Sdk 3：配置 VRChat 世界场景、SDK 组件、光照、性能、验证和上传流程。', ['配置 VRChat 世界场景', '优化 Quest 与 Android 性能', '处理 Build Panel 警告并上传']],
  ['nousresearch/hermes-agent/architecture-diagram', '架构可视化', 'Architecture Diagram：以深色主题 HTML/SVG 绘制软件架构、云与基础设施图。', ['绘制系统架构图', '制作云资源拓扑', '输出可编辑 HTML/SVG 图示']],
  ['nutlope/variate/variate', '设计探索', 'Variate：在本地网页中展示同一项目文件的真实设计变体，支持键盘切换并持续收集选择反馈。', ['制作可比较的页面变体', '用本地预览切换设计方向', '依据用户反馈继续迭代']],
  ['openclaudia/openclaudia-skills/demand-gen', '营销与增长', 'Demand Gen：规划需求生成策略、多渠道活动、漏斗、线索阶段和归因，服务销售管道增长。', ['制定多渠道获客策略', '设计 MQL 到 SQL 漏斗', '规划活动归因与销售管道']],
  ['osmontero/opencode-skills/reviewing-interface-quality', '界面质量', 'Reviewing Interface Quality：审查现有界面的层级、完整度、一致性与产品质感，定位看似能用但尚未完成的问题。', ['审查界面是否显得通用或粗糙', '定位层级与一致性问题', '在前端交付前执行质量门禁']],
  ['pepabo/pepabo-marketplace/suzuri-api', '电商平台开发', 'Suzuri Api：使用 SUZURI REST API 创建、搜索和展示商品，并开发与 SUZURI 联动的应用或服务。', ['通过 API 创建 SUZURI 商品', '搜索并展示商品数据', '开发 SUZURI 集成服务']],
  ['qu-skills/superpowers/landing-page-design', '落地页设计', 'Landing Page Design：围绕首屏结构、社会证明、移动布局和 CTA 心理设计及优化落地页转化。', ['设计 SaaS 或产品落地页', '优化首屏、证明与行动号召', '检查移动端转化路径']],
  ['qwencloud/qwencloud-deploy/qwencloud-deploy', '部署与运维', 'Qwencloud Deploy：将本地项目或 Git 仓库部署、发布和更新到阿里云国际站，并处理资源编排、询价、探活与状态记录。', ['部署全栈项目到阿里云国际站', '在部署前确认资源价格', '更新服务并检查健康状态']],
  ['rhavekost/author-toolkit/avoid-ai-writing', '写作与编辑', 'Avoid Ai Writing：检测或改写内容中的模板化 AI 写作痕迹，使表达更自然具体。', ['审计文章中的 AI 腔', '只标记可疑写作模式', '改写模板化或空泛表达']],
  ['s0xdk/refactoring-ui-skill/refactoring-ui', '界面设计', 'Refactoring Ui：使用受约束的间距、字号、色彩和阴影尺度，以及视觉层级与光照原则设计和改进界面。', ['建立一致的 UI 尺度', '优化排版、颜色和阴影', '用视觉重量改善层级']],
  ['sanity-io/context/create-agent-with-sanity-context', 'AI 应用与内容平台', 'Create Agent With Sanity Context：让 AI Agent 通过 Sanity Context 结构化访问内容，覆盖 Studio 配置、Agent 实现和客户端工具。', ['构建基于 Sanity 内容的聊天助手', '为 Agent 接入结构化内容上下文', '配置 Studio 与客户端工具']],
  ['sanity-io/context/dial-your-context', 'AI 应用与内容平台', 'Dial Your Context：通过交互式会话编写 Sanity Context MCP 的 Instructions，改进内容过滤与 Agent 回答。', ['配置 Sanity 上下文说明', '调整内容过滤和响应范围', '诊断 Agent 对 Schema 的误解']],
  ['shopify/shopify-ai-toolkit/shopify-app-pricing', 'Shopify 应用开发', 'Shopify App Pricing：为公开 Shopify 应用设计付费层级、订阅周期、用量定价和免费试用，并区分商家商品订阅。', ['设计 Shopify 应用收费方案', '实现月付、年付或用量计费', '区分 App Pricing 与商品订阅']],
  ['siril9/presentation-skill/presentation-skill', '演示文稿', 'Presentation Skill：从提示、结构化数据或本地资料创建、编辑、重设计、渲染并验证可编辑 PPTX。', ['制作专业可编辑演示文稿', '重设计或修复现有 PPTX', '渲染并检查版式质量']],
  ['skills-shell/superpowers/app-store-screenshots', '应用商店素材', 'App Store Screenshots：按 App Store 与 Google Play 尺寸、画廊顺序、设备样机和预览视频规范制作商店截图。', ['制作 iOS 应用商店截图', '制作 Google Play 商店素材', '规划画廊顺序与设备样机']],
  ['streakyc/googleworkspacecli/gws-gmail-reply-all', '邮件与办公协作', 'Gws Gmail Reply All：通过 Google Workspace CLI 在线程中向邮件全部参与者回复。', ['回复 Gmail 会话全部参与者', '保持邮件线程关系', '通过命令行处理团队邮件']],
  ['streakyc/googleworkspacecli/gws-gmail-send', '邮件与办公协作', 'Gws Gmail Send：通过 Google Workspace CLI 发送 Gmail 邮件。', ['从命令行发送邮件', '编写并投递 Gmail 消息', '在自动化流程中发送通知']],
  ['streakyc/googleworkspacecli/gws-shared', 'Google Workspace 工具', 'Gws Shared：提供 Google Workspace CLI 的认证、全局参数和结构化输出通用模式。', ['配置 Google Workspace CLI 认证', '统一全局命令参数', '处理结构化命令输出']],
  ['vast-ai/vast-cli/vastai', 'AI 计算与基础设施', 'Vastai：通过 Vast.ai CLI 管理 GPU 实例、存储卷、Serverless 端点和账户计费。', ['创建和管理 GPU 实例', '管理存储卷与 Serverless 端点', '查看资源费用和账户状态']],
  ['vlln/plugin-registry/make-dsh-plugin', '插件开发', 'Make Dsh Plugin：为 DeepSeek Harness 选择并搭建 Skill 包、MCP Server、Node 工具、浏览器 UI 或组合插件形态。', ['选择 DeepSeek Harness 插件形态', '搭建 bundle 或 Cordis 插件包', '配置清单、客户端和验证流程']],
  ['wu529778790/shenzjd-skills/docker-build-deploy', '容器与持续交付', 'Docker Build Deploy：将 Node.js 应用容器化，并配置 GitHub Actions 构建、推送 GHCR 后通过 SSH 部署。', ['编写多阶段非 root Dockerfile', '配置 GHCR 构建与缓存', '通过 GitHub Actions SSH 部署']],
  ['wu529778790/shenzjd-skills/github-figure-bed', '图像托管与内容工具', 'Github Figure Bed：将图片上传到指定 GitHub 仓库作为图床，并生成 CDN、镜像或原始地址及 Markdown 链接。', ['上传图片到 GitHub 图床', '生成 Markdown 与 CDN 链接', '同步图床仓库配置']],
  ['yigitkonur/skills-by-yigitkonur/run-github-scout', '开源项目研究', 'Run Github Scout：基于 GitHub 仓库证据发现、筛选和比较开源项目候选。', ['发现符合条件的 GitHub 仓库', '按仓库证据筛选候选', '比较多个开源项目']],
  ['yuvrajangadsingh/brandmd/brandmd', '品牌与设计系统', 'Brandmd：从网站提取颜色、排版、组件和视觉规则，整理为 DESIGN.md 供新项目或重建界面使用。', ['提取网站设计系统', '生成可复用 DESIGN.md', '让新界面匹配现有品牌']],
];

const septemberEighthSourceAwareOverrides = [
  ['qu-skills/superpowers/web-search', '搜索与信息检索', 'Web Search：通过 inference.sh CLI 调用 Tavily 与 Exa 的网页搜索、内容提取和直接问答能力。', ['搜索网页并提取正文', '为事实核查收集资料', '为 RAG 流程准备检索内容']],
  ['larashero3-dotcom/lieflat-charts/lieflat-charts', '数据可视化', 'Lieflat Charts：从 Lupi、Basics、Glance、Maps 与 Interactive 的真实实现生成 HTML 图表，或用中英文整页模板生成可发布报告。', ['从结构化数据生成 HTML 图表', '选择语义匹配的内置配色', '用整页模板制作中英文报告']],
  ['anthropics/claude-plugins-official/claude-security', '安全与合规', 'Claude Security：在全库、指定范围、分支差异、Pull Request 或单个提交上执行安全扫描，并可将发现整理为待人工选择的补丁。', ['扫描全库或指定目录的安全问题', '审查分支、PR 或提交差异', '将安全发现转为待审核的定向补丁']],
  ['zhaoxuya520/reverse-skill/reverse-engineering', '逆向工程', 'Reverse Engineering：分析编译、混淆、加壳或虚拟化目标的工作原理，覆盖二进制、APK、WASM、固件、自定义虚拟机与反调试逻辑。', ['理解二进制或固件的执行流程', '分析 APK、WASM 或自定义字节码', '定位加壳、虚拟化与反分析逻辑']],
  ['calesthio/generative-media-skills/still-image-retouching-finishing', '图像后期', 'Still Image Retouching Finishing：执行供应商无关的静态图像后期，覆盖 RAW 导入、非破坏性调色、遮罩修复、合成、锐化、输出与 QA。', ['对 RAW 或渲染图做曝光与色彩调整', '使用遮罩、修复与合成完成摄影后期', '为印刷、Web 或归档执行打样、导出与质检']],
  ['cyrusagents/cyrus/cyrus-setup', 'Agent 平台配置', 'Cyrus Setup：完成 Cyrus 端到端初始化，包括前置条件、认证、Linear/GitHub/Slack 集成、仓库添加与后台 Agent 启动。', ['首次配置 Cyrus', '连接 Linear、GitHub 与 Slack', '添加仓库并启动后台 Agent']],
  ['cyrusagents/cyrus/cyrus-setup-claude-auth', '身份与密钥管理', 'Cyrus Setup Claude Auth：为 Cyrus 配置 Claude Code 认证，支持 API 密钥、OAuth 令牌或第三方提供商。', ['配置 Claude API 密钥', '设置 OAuth 令牌', '选择第三方认证提供商']],
  ['cyrusagents/cyrus/cyrus-setup-endpoint', 'API 与集成', 'Cyrus Setup Endpoint：通过 ngrok、Cloudflare Tunnel 或自定义 URL 配置 Cyrus 的公开 Webhook 端点。', ['为 Cyrus 暴露公开 Webhook', '配置 ngrok 或 Cloudflare Tunnel', '使用自定义公开 URL']],
  ['cyrusagents/cyrus/cyrus-setup-github', '代码审查与协作', 'Cyrus Setup Github：为 Cyrus 配置 GitHub CLI 登录与 Git 身份，并可设置 Webhook 以支持 PR @mention 响应。', ['配置 gh CLI 与 Git 身份', '让 Cyrus 创建和处理 Pull Request', '设置 PR 评论 Webhook']],
  ['cyrusagents/cyrus/cyrus-setup-gitlab', '代码审查与协作', 'Cyrus Setup Gitlab：为 Cyrus 配置 GitLab glab CLI 认证与 Git 身份，用于创建 Merge Request。', ['配置 glab CLI 登录', '设置 GitLab Git 身份', '为 Cyrus 启用 Merge Request 创建']],
  ['cyrusagents/cyrus/cyrus-setup-launch', 'Agent 平台配置', 'Cyrus Setup Launch：输出 Cyrus 初始化配置摘要，并在用户选择后启动 Agent。', ['复核 Cyrus 配置摘要', '确认集成与仓库设置', '在准备完成后启动 Agent']],
  ['cyrusagents/cyrus/cyrus-setup-linear', '项目与协作', 'Cyrus Setup Linear：创建 Linear OAuth 应用并将 Cyrus 接入 Linear，支持浏览器自动化或手动引导配置。', ['创建 Linear OAuth 应用', '配置 Cyrus 的 Linear 集成', '选择自动或手动配置流程']],
  ['cyrusagents/cyrus/cyrus-setup-prerequisites', '开发环境', 'Cyrus Setup Prerequisites：检查 Cyrus 所需的 Node.js、jq、GitHub CLI 与 cyrus-ai npm 包前置条件。', ['检查 Cyrus 开发环境', '核对 Node.js、jq 与 gh CLI', '准备 cyrus-ai npm 包']],
  ['cyrusagents/cyrus/cyrus-setup-repository', '代码审查与协作', 'Cyrus Setup Repository：把一个或多个 Git 仓库加入 Cyrus 配置，使其能处理这些仓库的 Issue。', ['向 Cyrus 添加 Git 仓库', '配置多仓库处理范围', '让 Agent 接收指定仓库 Issue']],
  ['cyrusagents/cyrus/cyrus-setup-slack', '办公与协作', 'Cyrus Setup Slack：通过应用清单创建 Slack 应用，并引导保存 Cyrus 集成所需凭据。', ['从 manifest 创建 Slack 应用', '将 Slack 接入 Cyrus', '配置并保存集成凭据']],
  ['cyrusagents/cyrus/debug', '调试与质量', 'Debug：先用失败测试复现问题，完成根因分析后实施最小修复。', ['用失败测试复现缺陷', '分析问题根因', '实施并验证最小修复']],
  ['cyrusagents/cyrus/f1-test-drive', '系统测试', 'F1 Test Drive：编排端到端测试，验证 Cyrus 在 Issue Tracker、EdgeWorker 与活动渲染之间的完整链路。', ['验证 Cyrus 端到端流程', '测试 Issue Tracker 与 EdgeWorker 协作', '检查活动渲染结果']],
  ['cyrusagents/cyrus/google', '搜索与信息检索', 'Google：搜索当前网页信息，用于查找资料、核实时效性事实或研究主题。', ['查找当前网页信息', '核实可能变化的事实', '为研究主题收集来源']],
  ['cyrusagents/cyrus/implementation', '开发与工程', 'Implementation：按仓库现有模式实现用户请求的变更，编写可上线代码并运行测试验证。', ['实现功能或缺陷修复', '遵循现有代码模式', '运行测试验证产品行为']],
  ['cyrusagents/cyrus/investigate', '代码库研究', 'Investigate：搜索并阅读代码库中的相关文件，收集上下文后对实现问题给出明确答复。', ['定位与问题相关的源码', '梳理模块与数据流', '用代码证据回答实现问题']],
  ['cyrusagents/cyrus/release', '发布与持续交付', 'Release：准备、验证并发布 Cyrus CLI 协调版本，完成 cyrus-ai 包与 CLI 发布流程。', ['准备 Cyrus CLI 发布', '验证协调版本', '发布 cyrus-ai npm 包']],
  ['cyrusagents/cyrus/release-core-test', '发布与持续交付', 'Release Core Test：将横跨 CYPACK 与 CYHOST 的 cyrus-core 改动发布为 test 标签的预发布版本，供托管 GUI 验证且不影响 latest。', ['验证跨 CYPACK 与 CYHOST 的变更', '发布 cyrus-core 测试预版', '让托管 GUI 安装 test 版依赖']],
  ['cyrusagents/cyrus/summarize', '项目与协作', 'Summarize：将最终结果格式化为 Linear 会话摘要，仅生成内容而不自行发送。', ['整理 Linear 任务最终摘要', '格式化完成状态与证据', '为 Agent 会话准备收尾消息']],
  ['cyrusagents/cyrus/verify-and-ship', '发布与持续交付', 'Verify And Ship：运行测试、Lint 与类型检查，修复失败、更新变更日志，并创建或更新 Pull/Merge Request。', ['在交付前运行全部质量检查', '修复门禁失败并更新变更日志', '创建或更新 PR/MR']],
  ['fetcher-sh/fetcher-skills/app-store', '应用商店数据', 'App Store：通过 fetcher.sh 搜索各国 iOS 应用、读取应用与开发者详情、评论、相似应用与 App Bundle 数据。', ['按关键词和国家搜索 iOS 应用', '读取评论、详情与相似应用', '研究 ASO、竞品与本地化店面']],
  ['mengto/skills/stitched-full-page-capture', '网页截图与视觉验证', 'Stitched Full Page Capture：对惰性加载、滚动动画、Framer、WebGL/canvas 或揭示效果密集的网页捕获或修复可靠全页截图。', ['捕获惰性加载网页的完整截图', '修复空白、稀疏或与实际滚动不符的长图', '从可信全页图派生分区证据图']],
  ['prathamdby/skills/box', 'Git 与仓库管理', 'Box：从真实本地源路径克隆、更新、列出或搜索外部 Git 仓库。', ['克隆外部 Git 仓库', '更新现有外部仓库', '列出或搜索本地仓库来源']],
  ['prathamdby/skills/commit', 'Git 与仓库管理', 'Commit：仅根据实际待提交差异生成提交信息，并保存范围明确的 Git 变更。', ['审查待提交差异', '从差异提炼提交信息', '保存范围清晰的 Git 变更']],
  ['prathamdby/skills/cursor-agent', 'AI 开发工具', 'Cursor Agent：启动和使用 cursor-agent CLI，覆盖首次安装、交互或单次任务、持久会话、worktree、MCP、插件与 Bedrock 模式。', ['首次配置 cursor-agent CLI', '运行交互式或单次 Agent 任务', '使用 worktree、MCP 或 Bedrock 模式']],
  ['prathamdby/skills/deslop', '代码质量', 'Deslop：在不改变行为的前提下，从 Git 差异中移除 AI 生成的冗余、无必要防御、外来模式和可避免复杂度。', ['精简 AI 生成代码差异', '移除无必要的防御与样板', '在保持行为不变时降低复杂度']],
  ['prathamdby/skills/fix-pr', '代码审查与协作', 'Fix Pr：完整处理 Pull Request 评审反馈，包括嵌套讨论、CI 失败、无效建议、新增意见、修复与回复。', ['收集 PR 全部未解决评论', '处理 CI 失败与可执行建议', '回复讨论并确认无新问题']],
  ['prathamdby/skills/gh', 'GitHub 协作', 'Gh：检查 Pull Request、阅读评审线程、诊断失败 CI、回复讨论，并组织非平凡 gh CLI 命令。', ['检查 Pull Request 和评审线程', '诊断 GitHub Actions 失败', '发布评论或复杂 gh 查询']],
  ['prathamdby/skills/make-pr', '代码审查与协作', 'Make Pr：将已提交的分支变更发布为新 Pull Request，或更新当前分支已有的 Pull Request。', ['从当前分支创建 Pull Request', '更新已有 PR 内容', '核对已提交差异后发布']],
  ['prathamdby/skills/orchestrate', '多 Agent 编排', 'Orchestrate：将用户明确调用的任务拆分给成本更低的子 Agent，由主 Agent 持续负责范围和验证。', ['拆分可并行的用户任务', '向子 Agent 分派边界清晰的工作', '由主 Agent 汇总并验证结果']],
  ['prathamdby/skills/peer-review', '方案评审', 'Peer Review：在实施前评审工程计划、设计方案或拟议变更，判断其是否已具备开工条件。', ['评审实施计划', '检查设计或变更的遗漏', '在开发前判断方案是否就绪']],
  ['prathamdby/skills/recon', '代码库研究', 'Recon：映射当前代码库、刷新旧有仓库地图，或在仓库变化后重新建立实现上下文。', ['建立代码库文件与模块地图', '刷新过时的仓库调查', '在重大变化后重新定位']],
  ['prathamdby/skills/verify', '验证与质量', 'Verify：运行多次候选尝试并进行精细比较，或核实声称已成功但缺少真实运行证据的任务。', ['比较多次尝试的细微差异', '检查无实跑证据的完成声明', '确认实时尝试是否卡住']],
  ['apidojo-io/apidojo-skills/finding-hospitality-brands-on-instagram', '销售线索与社交研究', 'Finding Hospitality Brands On Instagram：通过 Apify 上的 apidojo Instagram Scraper 发现酒店、度假村、旅行品牌与旅游业务账号。', ['为酒店 SaaS 销售发现潜在客户', '收集旅游与度假品牌 Instagram 账号', '整理粉丝、简介与帖子互动数据']],
  ['kunchenguid/kun/kun', '能力待核对', 'Kun：公开说明仅表示可调用 Kun 处理问题，未给出可核验的具体能力与适用边界。', ['核对 skills.sh 详情页后续说明', '查看来源 GitHub 仓库中的公开文档', '在能力边界明确后再评估用途']],
  ['miqdadbadjuber/anti-slop/antislop-copywriting', '文案与编辑', 'Antislop Copywriting：编写或编辑标题、正文、语调与行动号召，并识别需要消减的 AI 式写作痕迹。', ['编写和打磨营销标题', '统一文案语调与 CTA', '编辑过度模板化的 AI 文本']],
  ['miqdadbadjuber/anti-slop/antislop-ui', '设计与前端', 'Antislop Ui：在构建或编辑界面时约束色彩、布局、组件与动效，用于减少模板化视觉。', ['审查界面色彩与布局', '调整组件和交互动效', '改善缺乏辨识度的 UI']],
  ['stripe/link-cli/link-cli', '支付与金融工具', 'Link Cli：安装并认证 Link CLI，为 Agent 支付、金融洞察或两者共用配置访问。', ['首次安装 Link CLI', '连接或登录 Link', '为支付与金融数据功能配置访问']],
  ['emilkowalski/skills/ask-sonner', 'React 界面开发', 'Ask Sonner：在 React 应用中配置 Sonner Toast，处理异步、加载、更新、关闭、持久化、主题、定位与多 Toaster 问题。', ['在 React 中接入 Sonner Toaster', '实现 Promise 与加载 Toast', '排查重复、样式、遮挡与暗色模式异常']],
  ['emilkowalski/skills/animate-expo', 'React Native 动效', 'Animate Expo：使用 Reanimated、Gesture Handler、Expo Router 与 expo-haptics 实现 React Native/Expo 动画、手势、Sheet、转场和震动反馈。', ['为 Expo 应用实现流畅动画', '构建手势、Sheet 与页面转场', '修复真机上的动效卡顿']],
  ['emilkowalski/skills/write-swift', 'Swift 开发', 'Write Swift：编写、审查或迁移现代 Swift，覆盖值类型建模、Swift 6 并发安全、协议与泛型、API 设计、ARC、性能与 Swift Testing。', ['编写或审查现代 Swift 代码', '修复数据竞争、挂起与保留环', '迁移 Swift 6 并发模式并优化性能']],
  ['101-skills/superpowers/agent-browser', '浏览器自动化', 'Agent Browser：通过 inference.sh 导航和操作网页，支持元素引用、点击、输入、拖放、文件上传、截图、录像与 JavaScript 执行。', ['自动导航并填写网页表单', '提取页面数据或执行浏览器测试', '捕获截图与操作录像']],
  ['apidojo-io/apidojo-skills/discovering-viral-tiktok-content-trends', 'TikTok 内容研究', 'Discovering Viral Tiktok Content Trends：通过 Apify 上的 apidojo TikTok Scraper 发现细分领域的热门标签、视频格式、开场钩子与互动模式。', ['研究 TikTok 细分领域趋势', '分析热门视频格式与钩子', '整理标签、播放与互动指标']],
  ['apidojo-io/apidojo-skills/tracking-competitor-social-media-growth', '竞品与社交研究', 'Tracking Competitor Social Media Growth：使用 apidojo 抓取器跟踪并比较竞争对手在 Twitter、TikTok 与 Instagram 的粉丝增长和互动表现。', ['跟踪竞品粉丝量变化', '跨平台比较社交增长', '生成竞品互动基准']],
  ['arjun988/blender-skills/analog-found-footage-horror', 'Blender 视觉风格', 'Analog Found Footage Horror：在 Blender 镜头中构建模拟、VHS、CRT 和伪纪录片式恐怖美学，包括摄影机缺陷与纪实构图。', ['制作 VHS/CRT 恐怖镜头', '添加模拟摄影缺陷', '设计伪纪录片构图']],
  ['arjun988/blender-skills/archviz', 'Blender 建筑可视化', 'Archviz：在 Blender 中按真实尺度、摄影机构图和 PBR 材质制作室内外建筑可视化静帧或动画。', ['搭建室内外建筑场景', '配置真实尺度与 PBR 材质', '交付建筑静帧或动画']],
  ['arjun988/blender-skills/prop-artist', 'Blender 道具建模', 'Prop Artist：在 Blender 中建模家具、工具、家居物件、kitbash 部件和易读的游戏道具。', ['建模生活化道具', '制作游戏主道具', '构建可复用 kitbash 部件']],
  ['arjun988/blender-skills/sculpting', 'Blender 雕刻', 'Sculpting：使用 Blender Dyntopo、多级细分、笔刷与 Alpha 工作流雕刻有机或硬表面细节。', ['雕刻高频表面细节', '制作褶皱、损伤与有机形态', '在重拓扑前完成高模']],
  ['bergside/awesome-design-skills/basic', '编辑设计', 'Basic：用编辑网格与表现性排版构建书籍、杂志和报告式的印刷视觉语言。', ['设计杂志或报告页面', '建立编辑网格', '用排版形成视觉层级']],
  ['bergside/awesome-design-skills/codex', '极简界面设计', 'Codex：构建纯边到边、几乎无色的极简界面，以排版承担主要层级，并仅用黑色表达填充、分隔与卡片表面。', ['设计极简单色界面', '以排版建立信息层级', '统一黑色填充与分隔规则']],
  ['bergside/awesome-design-skills/fiction', '品牌与界面风格', 'Fiction：用暖奶油背景、粗体展示字、高饱和色块、粗黑轮廓与大圆角构建童书插画感界面。', ['设计活泼的卡通界面', '组合饱和色块与粗轮廓', '使用大圆角与展示字体']],
  ['bergside/awesome-design-skills/riso', '品牌与印刷风格', 'Riso：在统一暖白纸面上使用两色 Risograph 印刷语言，构建活泼而有颗粒感的界面。', ['设计两色孔版印刷视觉', '统一暖白纸面背景', '添加印刷错位与颗粒质感']],
  ['bergside/awesome-design-skills/roku', '仪表盘设计', 'Roku：构建紫色主题的应用仪表盘，使用顶栏导航、卡片布局与面向开发者的工作流。', ['设计紫色主题仪表盘', '组织顶栏导航与卡片', '展示开发者工作流']],
  ['bergside/awesome-design-skills/stitch', '企业产品设计', 'Stitch：为数据驱动工作流构建清晰、高对比的企业界面，强调直观拖放与结构化布局。', ['设计企业数据工作台', '构建拖放操作流程', '统一高对比结构化布局']],
  ['bergside/awesome-design-skills/terracotta', '编辑界面设计', 'Terracotta：用暖奶油表面、墨棕色衬线标题与单一陶土点缀色构建日晒陶质编辑界面。', ['设计暖色编辑页面', '组合衬线标题与陶土点缀', '统一奶油表面与墨棕文字']],
  ['bobmatnyc/claude-mpm-skills/anthropic', 'Claude API 开发', 'Anthropic：使用 Anthropic 官方 SDK 接入 Claude 对话、流式输出、函数调用与视觉能力。', ['集成 Claude 对话 API', '实现流式输出与工具调用', '处理图像理解请求']],
  ['bobmatnyc/claude-mpm-skills/code-quality-scoring', '代码质量治理', 'Code Quality Scoring：以厂商中立框架量化软件健康、技术债、云就绪度与开源风险，并向业务利益相关者沟通。', ['为应用或产品组合评分', '估算技术债与云就绪度', '生成业务可读的质量摘要']],
  ['bobmatnyc/claude-mpm-skills/dependency-audit', '依赖治理', 'Dependency Audit：审计并清理项目依赖，用于例行维护、安全更新与移除未使用软件包。', ['盘点直接与间接依赖', '规划安全版本更新', '识别并移除未使用依赖']],
  ['bobmatnyc/claude-mpm-skills/flexlayout-react', 'React 界面开发', 'Flexlayout React：使用 FlexLayout for React 构建带拖放、标签页、分隔器与复杂窗口管理的停靠布局。', ['实现可拖放停靠面板', '组织标签页与分栏', '管理复杂多窗口布局']],
  ['bobmatnyc/claude-mpm-skills/internal-comms', '内部沟通', 'Internal Comms：用进展、计划、问题（3P）框架编写面向管理层与利益相关者的简洁团队更新。', ['编写团队周报', '向管理层汇报进展与阻塞', '用 3P 结构统一项目更新']],
  ['bobmatnyc/claude-mpm-skills/kubernetes', 'Kubernetes 运维', 'Kubernetes：以 Kubernetes 运维手册部署服务，覆盖核心对象、探针、资源规划、安全滚动与 kubectl 快速调试。', ['部署 Kubernetes 工作负载', '配置探针与资源请求', '执行安全滚动与 kubectl 排障']],
  ['bobmatnyc/claude-mpm-skills/screenshot', '界面视觉验证', 'Screenshot：通过截图验证 UI 变更，加速代码评审并捕捉可见回归。', ['为 UI 变更采集截图', '比较修改前后的视觉结果', '在评审前发现布局回归']],
  ['bobmatnyc/claude-mpm-skills/vb6-legacy', 'VB6 现代化', 'Vb6 Legacy：处理经典 Visual Basic 6 模式、COM 互操与遗留系统迁移策略。', ['维护 VB6 应用', '处理 COM 互操', '规划 VB6 系统迁移']],
  ['charlie947/social-media-skills/post-formatter', 'LinkedIn 内容', 'Post Formatter：用 PAS、AIDA、BAB、STAR 或 SLAY 框架把主题转为 200–250 词、移动端友好的 LinkedIn 帖子。', ['把主题格式化为 LinkedIn 帖子', '套用 PAS 或 AIDA 等框架', '控制篇幅、行数与移动端留白']],
  ['code-with-beto/skills/ship', 'React Native 开发', 'Ship：使用 @codewithbeto/ship CLI 从 Code with Beto 或 Platano 模板以非交互标志模式搭建可上线 React Native 应用。', ['创建 React Native 新应用', '从 Platano 模板搭建项目', '用非交互 CLI 参数固化初始化']],
  ['diegosouzapw/omniroute/omni-mcp', 'MCP 与 Agent 基础设施', 'Omni Mcp：连接 OmniRoute MCP Server，通过 SSE、stdio 或 HTTP 调用路由、缓存、压缩、记忆、Skill、提供商与审计工具。', ['选择 OmniRoute MCP 传输方式', '调用路由、缓存与记忆工具', '核对工具权限范围']],
  ['diegosouzapw/omniroute/omni-resilience', '可靠性与可观测性', 'Omni Resilience：监控提供商健康、断路器状态、p50/p95/p99 延迟、预算告警、连接冷却与模型锁定。', ['监控模型提供商健康', '检查断路器与延迟分位数', '查看预算告警与模型锁定']],
  ['docs.clickmax.io/clickmax-vturb', '能力待核对', 'Clickmax Vturb：skills.sh 目录未提供可审校的公开说明，目前无法确认具体能力和适用范围。', ['核对 skills.sh 详情页公开说明', '确认来源页面的维护信息', '在能力说明补齐后再评估用途']],
  ['joeseesun/qiaomu-wx-video/qiaomu-wx-video', '视频处理', 'Qiaomu Wx Video：在用户提供微信视频号分享链接时，解析并下载视频或生成的直播回放，并保护登录态与网络设置。', ['解析微信视频号分享链接', '保存视频或直播回放', '在运行后恢复代理与网络设置']],
  ['juliusbrussee/cavekit/deepen', '软件设计', 'Deepen：识别规格涉及的浅模块，研究更深的模块设计，并提出在行为不变前提下缩小接口、隐藏决策的重构方案。', ['发现缺少抽象深度的模块', '设计更小的稳定接口', '在测试保持通过时提出重构']],
  ['modelcontextprotocol/ext-apps/convert-web-app', 'MCP App 开发', 'Convert Web App：在保留现有 Web 应用独立运行能力的同时，添加 MCP App 的服务端工具与资源注册。', ['将 SPA 转为 Web+MCP App 混合应用', '为现有网页添加 MCP App 支持', '替换 iframe 嵌入并保留单机运行']],
  ['petekp/claude-code-setup/claude-code-audit', 'AI 开发工作流', 'Claude Code Audit：取样近期 Claude Code 会话，提取定量信号与使用模式，形成优先级明确的工作流改进报告与待实施配置。', ['分析 Claude Code 会话习惯', '定量发现浪费时间的模式', '起草 Skill、规则或 Hook 改进']],
  ['petrkindlmann/qa-skills/api-testing', 'API 测试', 'Api Testing：使用 Playwright APIRequestContext、Supertest 或 HTTP 客户端测试 REST/GraphQL API，覆盖 Schema、认证、CRUD、错误、分页与性能断言。', ['编写 REST 或 GraphQL API 测试', '验证 Schema、认证与 CRUD 周期', '检查错误、分页与性能']],
  ['petrkindlmann/qa-skills/qa-dashboard', '质量仪表盘', 'Qa Dashboard：使用 Allure Report、Grafana 或 ReportPortal 构建测试执行、趋势、不稳定性、发布门禁与告警仪表盘。', ['展示测试执行结果', '监控趋势与不稳定用例', '建立发布就绪门禁和告警']],
  ['petrkindlmann/qa-skills/release-readiness', '发布质量', 'Release Readiness：基于证据做发布 go/no-go 决策，覆盖检查清单、冒烟测试、分阶段验证、回滚条件与发布后核对。', ['评估版本是否可发布', '设计冒烟与分阶段验证', '定义回滚条件与发布后检查']],
  ['petrkindlmann/qa-skills/test-case-management', '测试用例管理', 'Test Case Management：在 TestRail、Xray、Zephyr Scale 或 Qase 中编写和维护手工/混合测试用例、套件、批量导入与需求追溯。', ['编写可执行的手工测试用例', '组织套件并批量导入', '检查需求追溯与自动化候选']],
  ['petrkindlmann/qa-skills/test-reliability', '测试稳定性', 'Test Reliability：以多属性选择器、环境诊断、Flake 分类、隔离管理与置信度修复提高单个测试的运行时可靠性。', ['诊断不稳定测试', '在运行时修复失效定位器', '管理隔离与可观测修复证据']],
  ['postplusai/postplus-skills/video-batch-runner', 'AI 视频生成', 'Video Batch Runner：根据简报、脚本、提示、图像、音频或参考视频，通过 PostPlus 批量生成文生视频、图生视频、首尾帧、数字人或动作迁移内容。', ['批量提交 AI 视频任务', '按输入类型选择 PostPlus 端点', '等待、恢复并质检生成结果']],
  ['sandeco/reversa/reversa-agents-help', 'Agent 帮助与导航', 'Reversa Agents Help：用类比解释 Reversa 中各 Agent 的职责与适用时机。', ['了解 Reversa Agent 分工', '选择适合当前任务的 Agent', '向新用户解释 Agent 工作流']],
  ['sandeco/reversa/reversa-pricing-size', '项目估算', 'Reversa Pricing Size：读取当前功能的需求、疑问、计划与任务，按任务数与风险调整生成确定性 T-shirt Size 结果。', ['估算功能结构规模', '根据任务和风险计算 T-shirt Size', '生成 size.json 与 size.md']],
  ['sandeco/reversa/reversa-reconstructor', '软件重建', 'Reversa Reconstructor：从 Reversa 规格生成自底向上的重建计划，并按需求逐个执行任务以重新实现软件。', ['从已生成规格重建软件', '生成自底向上的实施计划', '一次执行一个重建任务']],
  ['tursodatabase/agent-skills/turso-db', '数据库与后端', 'Turso Db：使用 Rust 实现的进程内 SQLite 兼容 Turso 数据库，覆盖多平台 SDK、向量/全文搜索、CDC、MVCC、加密与远程同步。', ['在 Node.js、浏览器或移动端嵌入 Turso', '实现向量或全文搜索', '配置加密、CDC 与远程同步']],
];

const marketingSourceAwareOverrides = [
  ['audience-segment-builder', '构建营销受众细分，整理条件、排除规则与覆盖范围。', ['定义目标受众细分', '整理包含与排除条件', '为活动准备受众方案']],
  ['brief-generator', '生成营销活动或内容制作所需的结构化 Brief。', ['编写活动 Brief', '明确受众、信息与交付物', '统一创意与渠道需求']],
  ['budget-optimizer', '根据活动表现与约束调整营销预算分配建议。', ['比较渠道投放效率', '调整活动预算分配', '评估预算变更的影响']],
  ['budget-pacing-monitor', '监控营销预算的消耗节奏，识别过快、过慢或偏离计划的投放。', ['检查日度与周度预算消耗', '识别投放节奏异常', '生成预算调整提醒']],
  ['conversion-signal-qa', '检查转化事件、字段与归因信号的完整性和一致性。', ['核对转化事件上报', '检查字段与标识缺失', '诊断归因信号异常']],
  ['creator-registry', '建立创作者合作名录，记录资料、能力标签与合作状态。', ['整理创作者候选名单', '记录内容类型与受众标签', '跟踪联系与合作状态']],
  ['fatigue-frequency-manager', '监控广告频次与创意疲劳信号，辅助安排轮换或降频。', ['检查受众曝光频次', '识别创意疲劳趋势', '制定素材轮换建议']],
  ['geo-content-optimizer', '根据地区、语言与本地搜索语境优化营销内容。', ['适配不同地区的文案', '调整本地化关键词', '检查地域信息一致性']],
  ['landing-optimizer', '审查落地页的信息层级、转化路径与行动号召。', ['优化落地页信息结构', '检查 CTA 与转化路径', '整理页面实验候选']],
  ['launch-feedback-synthesizer', '汇总产品或活动上线后的用户反馈，提取主题与优先级。', ['合并多渠道上线反馈', '归纳重复问题与主题', '为后续迭代排序']],
  ['launch-monitor', '监控产品或活动上线后的核心信号与异常。', ['跟踪上线后关键指标', '识别转化或流量异常', '整理上线期间告警']],
  ['narrative-drift-monitor', '监控品牌或活动叙事是否偏离已定义的主张与语调。', ['检查跨渠道文案一致性', '识别主张与语调偏移', '整理需要校正的内容']],
  ['offer-claims-registry', '建立产品卖点与宣称登记表，记录证据、适用范围与审核状态。', ['统一产品卖点表述', '关联宣称与支持证据', '跟踪文案审核状态']],
  ['page-play-builder', '将页面优化思路组织为可执行的内容、布局与转化实验方案。', ['编写页面优化 Playbook', '组织文案与布局改动', '生成可验证的页面实验']],
  ['performance-analyzer', '分析营销活动的表现指标，定位贡献因素与下滑原因。', ['分析活动绩效变化', '比较渠道与受众贡献', '整理表现驱动因素']],
  ['performance-monitor', '持续跟踪营销表现指标与目标偏差，生成异常提醒。', ['监控活动核心指标', '检查目标与实际偏差', '识别需要复盘的异常']],
  ['proof-point-packager', '将数据、客户案例与事实依据整理为可复用的营销证据包。', ['整理产品主张证据', '打包客户案例与数据', '为销售与内容准备证明点']],
  ['report-generator', '将营销指标、活动进展与结论组织为结构化报告。', ['生成活动绩效报告', '汇总指标与主要变化', '整理结论与下一步行动']],
  ['serp-markup-builder', 'SERP 标记构建器：为搜索结果展示准备结构化数据与页面标记。', ['生成页面结构化数据', '核对 Schema 字段与页面内容', '优化搜索结果展示准备']],
  ['technical-seo-checker', '检查网站的抓取、索引、元数据与技术 SEO 配置。', ['检查 robots、sitemap 与 canonical', '识别页面索引问题', '整理技术 SEO 修复项']],
];

dailySourceAwareOverrides.forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
septemberSecondSourceAwareOverrides.forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
septemberThirdSourceAwareOverrides.forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
septemberFourthSourceAwareOverrides.forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
septemberFifthSourceAwareOverrides.forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
septemberSixthSourceAwareOverrides.forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
septemberEighthSourceAwareOverrides.forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
[
  ['stark-ai-de/agent-skills/codex-memory-curator', 'Agent 记忆与知识', 'Codex Memory Curator：审计并安全整理 Codex 记忆，识别过时结论、跨仓库信息串扰、敏感条目与记忆配置问题。', ['审查 Codex 记忆中的过时内容', '排查跨仓库信息串扰与敏感条目', '整理记忆配置而非普通仓库文档']],
  ['stark-ai-de/agent-skills/codegraph-ast-grep', '代码检索与分析', 'Codegraph Ast Grep：设置、升级或诊断 CodeGraph 与 ast-grep，为编码 Agent 提供语义仓库范围和结构化语法证据。', ['配置 CodeGraph 与 ast-grep', '迁移索引或工具版本', '诊断 MCP 重连与只读环境']],
  ['stark-ai-de/agent-skills/animated-readme-logo', '品牌与视觉资产', 'Animated Readme Logo：创建、转换、动画化或审计 GitHub README 标志，并核对 SVG、PNG 与 GIF 交付。', ['制作 README 动态标志', '转换 SVG、PNG 或 GIF 资产', '审查仓库品牌素材交付']],
  ['stark-ai-de/agent-skills/cursor-spec-interviewer', '需求与规格', 'Cursor Spec Interviewer：把模糊编码需求访谈为经过来源核对、ADR 判断与交付约定的 Cursor Agent 实施规格。', ['澄清模糊编码需求', '形成 Cursor 实施计划与规格', '确认 ADR 与交付边界']],
  ['stark-ai-de/agent-skills/codex-spec-interviewer', '需求与规格', 'Codex Spec Interviewer：把模糊编码需求访谈为经过来源核对、ADR 判断与交付约定的 Codex 实施规格。', ['澄清模糊编码需求', '形成 Codex 实施计划与规格', '确认 ADR 与交付边界']],
  ['stark-ai-de/agent-skills/cursor-memory-curator', 'Agent 记忆与知识', 'Cursor Memory Curator：审计并安全整理 Cursor 规则和已提供的 memory-bank 上下文，定位过时、冲突、敏感或放置错误的指令。', ['审查 Cursor 规则与记忆库', '识别冲突或敏感上下文', '整理指令的归属位置']],
  ['stark-ai-de/agent-skills/drawio-diagrams', '图表与可视化', 'Drawio Diagrams：创建、编辑、审查或导出可继续编辑的 draw.io 架构图、流程图、时序图与网络图。', ['制作可编辑技术图表', '审查 draw.io 图形结构', '导出架构、流程或时序图']],
  ['stark-ai-de/agent-skills/architecture-compass', '软件架构', 'Architecture Compass：建立 ADR 治理，审计架构漂移，并规划或执行受 ADR 约束的有限范围重构。', ['建立和审查 ADR 规则', '定位实现与架构决策的漂移', '规划边界明确的架构重构']],
  ['stark-ai-de/agent-skills/jev-capability-advisor', 'Agent 能力编排', 'Jev Capability Advisor：使用 TypeSafe Jev 推荐可用 Skill 或 MCP 工具，检查候选能力并明确选择下一项。', ['为任务筛选 Skill 或 MCP 工具', '检查候选能力与适用范围', '形成可复用的宿主集成选择']],
  ['stark-ai-de/agent-skills/claude-memory-curator', 'Agent 记忆与知识', 'Claude Memory Curator：审计并安全整理 Claude Code 指令、规则、自动记忆和记忆设置，定位过时或放置错误的上下文。', ['审查 Claude Code 规则与记忆', '清理过时或错位的上下文', '核对自动记忆设置']],
  ['stark-ai-de/agent-skills/claude-spec-interviewer', '需求与规格', 'Claude Spec Interviewer：把模糊编码需求访谈为经过来源核对、ADR 判断与交付约定的 Claude Code 实施规格。', ['澄清模糊编码需求', '形成 Claude Code 实施规格', '确认 ADR 与交付边界']],
  ['vercel/eve/technical-writing', '技术文档', 'Technical Writing：为 eve 仓库编写、编辑、审查或审计面向用户的文档，并用源码、测试、CLI 帮助和公开版本核对事实。', ['编写或修改 eve 文档', '根据支持反馈改善说明', '核对文档与当前 API 或 CLI 行为']],
  ['alchemyplatform/skills/alchemy-api', '区块链开发', 'Alchemy Api：使用标准 API Key 把 Alchemy 的 EVM、Token、NFT、转账、价格、模拟、Webhook 与多链接口接入应用代码。', ['为后端或 dApp 接入 Alchemy API', '查询 Token、NFT 或转账数据', '配置模拟、Webhook 与多链 RPC']],
  ['iart-ai/motion-design-skills/animation-principles', '动效设计', 'Animation Principles：用时长、缓动、超调、弹性、错峰和节拍等原则改善僵硬、漂浮或机械的动画运动。', ['选择动画时长与缓动曲线', '修复僵硬或漂浮的运动', '设计错峰、弹性与节拍同步']],
  ['iart-ai/motion-design-skills/logo-animation', '品牌动效', 'Logo Animation：为标志制作片头、品牌揭示、启动动画、循环加载或 SVG 描边与形变，覆盖 Web、视频和应用交付。', ['制作品牌 Logo 片头', '设计启动页或循环加载动画', '交付 SVG、Lottie 或视频动效']],
  ['iart-ai/motion-design-skills/beat-sync-editing', '视频剪辑', 'Beat Sync Editing：按音乐节拍规划剪辑节奏、转场、变速和镜头序列，并可映射到 NLE 或 Remotion/AE 时间线。', ['按 BPM 对齐镜头切点', '设计 J-cut、L-cut 与匹配剪辑', '规划变速和代码视频时间线']],
  ['iart-ai/motion-design-skills/color-motion', '色彩与视频调色', 'Color Motion：为动效建立色板和渐变，使用感知色彩空间插值，并处理视频调色、Gamma 与 Rec.709/sRGB 色彩管理。', ['建立动效色板与渐变', '修复灰脏或不平滑的色彩过渡', '处理预览与成片色偏']],
  ['adamzhang1987/kingdee-k3cloud-skill/kingdee-k3cloud', 'ERP 与企业管理', 'Kingdee K3cloud：操作金蝶云星空 ERP 的销售、采购、库存、物料、客户、供应商与单据流程，并辅助排查 API 字段问题。', ['查询销售采购与库存数据', '创建、提交或审核 ERP 单据', '生成经营日报并排查接口错误']],
  ['alpacalabsllc/skills-for-architects/nyc-bsa', '建筑与城市规划', 'Nyc Bsa：查询纽约市 BSA 的 zoning variance、special permit 与 appeal，核对对依法可建规划控制的调整。', ['查询纽约市分区豁免', '核对特殊许可与上诉', '研究项目适用的 zoning relief']],
  ['alpacalabsllc/skills-for-architects/nyc-dob-violations', '建筑合规', 'Nyc Dob Violations：查询纽约市建筑的 DOB 与 ECB 违规记录，包括开放或已解决状态、等级和罚款信息。', ['检查建筑违规和停工令', '核对未结 ECB 罚款', '汇总 DOB/ECB 违规状态']],
  ['alpacalabsllc/skills-for-architects/product-research', '建筑产品研究', 'Product Research：依据设计 Brief 查找和比较 FF&E 候选，整理带来源的采购事实，并可保存到 CSV 资料库。', ['研究家具、灯具和设备候选', '比较采购规格与来源', '建立 FF&E CSV 资料库']],
  ['alpacalabsllc/skills-for-architects/slide-deck-generator', '演示与文档', 'Slide Deck Generator：从主题、提纲、报告或数据生成可独立运行的 HTML 幻灯片，不用于编辑 PowerPoint 文件。', ['把报告转成 HTML 演示', '从提纲生成幻灯片', '制作自包含网页 Deck']],
  ['alterlab-ieu/alterlab_gameforge/game-playtest', '游戏用户研究', 'Game Playtest：规划、执行和分析带行为观察的结构化游戏试玩，覆盖测试协议、观察者指南和数据综合。', ['设计游戏试玩协议', '组织玩家行为观察', '汇总试玩反馈与发现']],
  ['blockmatic/basilic-skills/workflow', '能力待核对', 'Workflow：公开说明仅表明其打包 Basilic `/w-*` Playbook 并落到 workflow 目录，具体流程内容与适用范围尚未说明。', ['核对 Basilic Playbook 的公开说明', '确认包含的工作流和入口', '在能力边界明确后再评估用途']],
  ['fabricioctelles/skills/okf-open-knowledge-format', '知识管理', 'Okf Open Knowledge Format：创建、校验和补充由 Markdown 与 YAML frontmatter 组成的 OKF 知识包，使组织知识可被 Agent 读取和交换。', ['创建 OKF 知识包', '校验目录与 frontmatter', '把现有 Markdown 转换为 OKF']],
  ['fayazara/macos-app-skills/macos-auto-update', 'macOS 开发', 'Macos Auto Update：为原生 macOS 应用集成 Sparkle 自动更新，配置 SPM、UpdaterManager、Info.plist、签名和 appcast。', ['接入 Sparkle 自动更新', '添加检查更新入口', '配置签名与 appcast 源']],
  ['fayazara/macos-app-skills/macos-build', 'macOS 开发', 'Macos Build：使用 xcodebuild 在命令行构建原生 macOS 应用，验证编译并定位或修复构建错误。', ['构建 macOS 项目', '验证代码是否可编译', '诊断 xcodebuild 失败']],
  ['fayazara/macos-app-skills/macos-patterns', 'macOS 开发', 'Macos Patterns：讲解原生 macOS 的窗口层级、菜单栏、快捷键、文件选择、剪贴板、拖放、截屏、激活策略与登录启动模式。', ['设计菜单栏或浮动面板应用', '处理焦点、激活与窗口层级', '接入文件、剪贴板和系统能力']],
  ['frappe/skills/fix-issue', '软件缺陷修复', 'Fix Issue：从 GitHub Issue、Issue URL 或 Markdown 报告中提取可验证问题，复现并修复缺陷，同时隔离报告中的噪声与猜测。', ['根据 GitHub Issue 修复缺陷', '复现报告中的问题', '从问题描述中分离可验证事实']],
  ['kmalakoff/sensemaking/sense-bases', '知识库与查询', 'Sense Bases：把 Obsidian Bases 的 `.base` 文件、视图、筛选和公式转换为返回等价行集的 sense SQL。', ['转换 Obsidian Bases 文件', '复现 Bases 视图和筛选', '让 Markdown 树中的 Base 可查询']],
  ['lingui/skills/swc-plugin-compatibility', '国际化与构建工具', 'Swc Plugin Compatibility：诊断并修复 Lingui SWC 插件在 Next.js、Vite、Rspack 等运行时中的版本不兼容和宏转换失败。', ['排查 Lingui SWC Wasm 错误', '修复插件与宿主版本兼容', '诊断宏未转换问题']],
  ['mrwogu/logstrip/promptscript', '提示词工程', 'Promptscript：读取、编写和排查 PromptScript `.prs` 文件，处理语法块、继承、组合、配置与多种 AI 编码工具的编译目标。', ['编写或修改 PromptScript', '修复 `.prs` 编译错误', '迁移多工具 AI 指令配置']],
  ['nansen-ai/nansen-cli/nansen-smart-money-tracker', '链上数据分析', 'Nansen Smart Money Tracker：跟踪聪明钱地址的净流入、交易、持仓和永续合约活动，观察大额钱包买卖方向。', ['查看聪明钱净流入', '跟踪鲸鱼交易与持仓', '分析永续合约活动']],
  ['open-mercato/skills/om-pr-autopilot', '代码审查与协作', 'Om Pr Autopilot：诊断开放 PR 的计划、评审、讨论、CI、冲突和 QA 证据状态，再按需串联对应处理流程并发布报告。', ['检查 PR 尚未完成的工作', '处理评审、CI 与合并冲突', '判断 PR 是否可合并']],
  ['open-mercato/skills/om-ux-setup', '设计系统治理', 'Om Ux Setup：从仓库提取设计令牌、组件注册表、页面原型和约定，写入 `.uxproof/` 作为 UX 审查基线。', ['建立仓库 UX 设计契约', '整理组件和令牌基线', '在设计系统变化后刷新审查上下文']],
  ['owl-listener/designer-skills/parallel-concepts', '产品概念设计', 'Parallel Concepts：围绕同一问题并行构建多个在用户行为与解决方式上真正不同的方案，避免过早沿单一路径细化。', ['探索多个产品概念', '比较不同用户流程方案', '在细化前扩大解空间']],
  ['pproenca/dot-skills/nextjs', 'Next.js 开发', 'Nextjs：提供 Next.js 16 App Router 的性能、缓存、服务端组件、Server Actions、路由与代码库审查实践。', ['开发 Next.js 16 App Router', '配置缓存与服务端组件', '审查和重构 Next.js 代码库']],
  ['pproenca/dot-skills/playwright', 'Web 自动化测试', 'Playwright：为 Next.js 应用提供 Playwright E2E 测试实践，覆盖选择器、认证状态、API 模拟、水合、并行 CI 与不稳定测试诊断。', ['编写 Next.js E2E 测试', '排查 Playwright 不稳定用例', '配置认证、Mock 与并行 CI']],
  ['probabl-ai/skills/explore-ml-data', '机器学习数据分析', 'Explore Ml Data：在建模前完成表格数据理解，检查重复、目标、双变量关系和泄漏，并生成可复跑脚本、事实文件与分析报告。', ['开展机器学习数据 EDA', '检查目标泄漏与重复数据', '生成可复现的数据理解报告']],
  ['probabl-ai/skills/triage-ml-task', '机器学习工作流', 'Triage Ml Task：列出可用的机器学习入口 Skill，并在请求含糊、阶段完成或工作区刚打开时选择下一步。', ['为模糊 ML 请求选择入口', '在阶段完成后决定下一步', '查看已安装的 ML Skill']],
  ['ravnhq/ai-toolkit/agent-pr-creator', 'GitHub 协作', 'Agent Pr Creator：分析 Git 差异和提交历史，填充仓库 PR 模板并通过 gh CLI 创建 Pull Request。', ['根据差异撰写 PR 描述', '填写 Pull Request 模板', '使用 gh 创建 PR']],
  ['social-media-skills/skills/ai-music-and-sound', '社交媒体音频', 'Ai Music And Sound：为 Reels、TikTok、Shorts 等社交视频规划原创或授权音乐与音效，并提示授权、Content ID 和披露边界。', ['为短视频设计音乐与音效', '选择可授权的音频来源', '整理 Content ID 与商用许可注意事项']],
  ['social-media-skills/skills/ai-video', 'AI 视频生成', 'Ai Video：根据社交视频需求选择生成式场景、数字人、配音或剪辑工具，并输出可跨工具使用的视频 Brief。', ['为 AI 视频选择合适工具', '编写文生视频或数字人 Brief', '把长视频规划为短视频素材']],
  ['social-media-skills/skills/analytics-and-reporting', '社交媒体分析', 'Analytics And Reporting：读取原生平台与 GA4/UTM 数据，按目标分析保存、分享、观看留存、触达互动率、增长、点击与转化，并提出后续行动。', ['制作社交媒体绩效报告', '识别有效内容和下滑信号', '把平台数据转成优化行动']],
  ['social-media-skills/skills/creator-monetization', '创作者商业化', 'Creator Monetization：为创作者规划会员、产品、品牌合作和平台分成的多元收入组合，并设计 Offer、Media Kit 与推广内容。', ['规划创作者收入组合', '设计会员或数字产品 Offer', '准备品牌合作 Media Kit']],
  ['social-media-skills/skills/cross-platform-repurposing', '社交内容运营', 'Cross Platform Repurposing：提取一份内容的核心观点，再按各平台的钩子、格式、长度、机制与 CTA 重制为原生版本。', ['把博客或视频拆成多平台帖子', '为不同平台重写钩子和格式', '规划一稿多用的内容队列']],
  ['social-media-skills/skills/experimentation-and-ab-testing', '社交媒体实验', 'Experimentation And Ab Testing：为社交内容设计单变量、有控制条件和预设决策规则的顺序实验，并用原生分析结果复盘。', ['测试钩子、标题或发布时间', '制定发布前决策规则', '用多次重复区分信号与噪声']],
  ['social-media-skills/skills/instagram-seo', 'Instagram 运营', 'Instagram Seo：为 Instagram 帖子、Reel 和账号字段研究关键词簇，优化搜索优先文案、画面文字、口播关键词与替代文本。', ['优化 Instagram 搜索文案', '规划关键词簇和画面文字', '检查标题、口播与视觉一致性']],
  ['social-media-skills/skills/lead-magnets-and-funnels', '营销漏斗', 'Lead Magnets And Funnels：设计从社交流量到订阅、线索和客户的 Lead Magnet、承接路径、培育流程与推广内容。', ['设计模板、测验等引流品', '规划社交到落地页漏斗', '编写培育与推广内容']],
  ['social-media-skills/skills/reply-and-comment-writer', '社群互动', 'Reply And Comment Writer：按品牌语气起草评论回复、主动评论和私信响应，处理赞扬、批评、喷子与垃圾信息，由人工审核发布。', ['回复帖子评论和私信', '撰写主动互动评论', '处理批评与垃圾信息']],
  ['thebushidocollective/han/atomic-design-atoms', '设计系统', 'Atomic Design Atoms：创建按钮、输入框、标签和图标等原子级 UI 组件，作为设计系统最小构件。', ['构建设计系统基础组件', '统一按钮、输入与标签', '定义可组合的原子组件']],
  ['thebushidocollective/han/atomic-design-molecules', '设计系统', 'Atomic Design Molecules：把原子组件组合为表单字段、搜索框和卡片标题等具备单一功能的分子组件。', ['组合表单字段', '构建搜索框与卡片标题', '沉淀可复用分子组件']],
  ['thebushidocollective/han/atomic-design-templates', '设计系统', 'Atomic Design Templates：使用 organisms、molecules 和 atoms 组织不含真实内容的页面骨架与布局模板。', ['搭建页面结构模板', '组合设计系统各层组件', '验证页面布局骨架']],
  ['yeachan-heo/oh-my-claudecode/architecture-survey', '软件架构', 'Architecture Survey：定期遍历模块图，找出浅模块、假设性边界和逻辑归属错误，并按优先级交给后续处理者。', ['扫描架构深化候选', '识别浅模块和错误边界', '生成架构调查优先级']],
  ['yeachan-heo/oh-my-claudecode/diagram', '技术图表', 'Diagram：在控制流、调用深度、模块归属或变更结构需要可视化时，选择伪代码、调用树、文件树、Mermaid 或 diff 中最小够用的形式。', ['解释复杂控制流', '展示模块或文件层级', '用 Mermaid 或 diff 表达变更']],
  ['yeachan-heo/oh-my-claudecode/drydock', '开发环境治理', 'Drydock：在仓库中建立由上下文、规则、工具和标准组成的共享工作环境，并覆盖 CLAUDE.md、Skill、设计系统、MCP/CLI 与共享上下文。', ['初始化仓库 Agent 工作环境', '统一规则、工具和设计语言', '检查共享环境漂移']],
  ['yeachan-heo/oh-my-claudecode/omc-review', '质量评审', 'Omc Review：在交付前评估已完成工作中的缺陷、风险和可简化之处。', ['审查已完成实现', '识别交付风险和缺陷', '寻找可安全简化的部分']],
  ['yeachan-heo/oh-my-claudecode/omc-setup', 'AI 开发工具', 'Omc Setup：按规范流程安装或刷新 oh-my-claudecode 的插件、npm 与本地开发配置。', ['初始化 oh-my-claudecode', '刷新插件或 npm 配置', '配置本地开发模式']],
  ['yeachan-heo/oh-my-claudecode/remember', 'Agent 记忆与知识', 'Remember：审查可复用项目知识，并判断应写入项目记忆、临时 notepad 还是持久文档。', ['整理可复用项目知识', '区分临时与持久信息', '选择记忆或文档落点']],
  ['yeachan-heo/oh-my-claudecode/ultragoal', '目标与任务管理', 'Ultragoal：在 `.omc/ultragoal` 中持久保存多目标计划和账本，并为当前会话输出 Claude `/goal` 交接文本。', ['管理多个持久目标', '维护计划与进度账本', '生成会话目标交接文本']],
  ['yoanbernabeu/supabase-pentest-skills/supabase-extract-service-key', '安全与合规', 'Supabase Extract Service Key：检查客户端代码是否泄漏 Supabase `service_role` 密钥。', ['扫描前端中的 service_role 密钥', '审查 Supabase 客户端配置', '定位密钥泄漏风险']],
].forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));
marketingSourceAwareOverrides.forEach(([skillId, description, useCases]) => {
  const name = readableName(skillId);
  editorialOverrides.set(`aaron-he-zhu/aaron-marketing-skills/${skillId}`, {
    category: '营销与增长', descriptionZh: `${name}：${description}`, useCases,
  });
});

[
  ['mbfinotti/sales-skills/sales-market-sizing', '市场研究与销售规划', 'Sales Market Sizing：使用自上而下、自下而上、价值理论与多方法交叉验证估算 TAM、SAM 和 SOM，并设置基于销售产能的 SOM 上限与更新节奏。', ['为销售容量和区域规划估算市场规模', '用命名账户或人口数据交叉验证 TAM、SAM、SOM', '为年度配额规划建立可复核的市场规模基线']],
  ['mbfinotti/sales-skills/deal-value-calc', '销售与商业分析', 'Deal Value Calc：为单笔交易建立保守优先的 ROI 与商业案例，列出价值驱动、完整投入、回收期和三种情景，并标注每项假设的来源。', ['为一笔 B2B 或高客单价交易计算 ROI', '准备可供内部转发的一页商业案例', '区分买方提供、基准参考和销售假设的数据']],
  ['uniformdev/agent-skills/uniform-forms', 'Web 开发与表单', 'Uniform Forms：在 Uniform 项目中添加联系、注册、订阅、线索收集或调查表单，并创建表单字段组件定义或通用提交端点。', ['为 Uniform 页面添加业务表单', '定义可复用的表单字段组件', '实现通用表单提交接口']],
  ['proseify.xyz/anti-prose-slop', '能力待核对', 'Anti Prose Slop：当前只确认到名称与榜单元数据，skills.sh 未提供可审校的公开说明，具体写作规则、输入输出和适用范围暂无法确认。', ['持续核对 skills.sh 详情页公开说明', '确认其写作规则与适用文本类型', '在能力边界明确后再评估使用']],
].forEach(([id, category, descriptionZh, useCases]) => editorialOverrides.set(id, { category, descriptionZh, useCases }));

function applyEditorialOverride(skill) {
  const override = editorialOverrides.get(skill.id.toLowerCase());
  if (override) Object.assign(skill, override);
  return skill;
}

const sourceAwareProfiles = new Map([
  ['wind-alice/alicemarket/wind-mcp-skill', ['金融与市场数据', 'Wind Mcp Skill：提供面向 AI Agent 的结构化金融市场数据入口，覆盖股票、基金、指数、债券、宏观、行业、企业、量化指标与衍生品等公开说明列出的查询和分析场景。', ['查询和筛选 A 股、港股或美股标的', '分析行情、财务、估值、股东与公司事件', '检索基金、债券、宏观、行业或衍生品数据']]],
  ['juliusbrussee/caveman/safe-refactor', ['代码重构与质量', 'Safe Refactor：在保持现有行为的前提下重构代码，用验证步骤包围提取、合并、职责迁移或清理等结构性改动。', ['提取或合并重复代码', '迁移模块职责并保持兼容行为', '在重构前后运行聚焦验证']]],
  ['mikubaka88/ccfa-skills/ccf-rebuttal-writer', ['学术写作与研究', 'Ccf Rebuttal Writer：撰写 CCF 审稿意见回复、作者答复、修订台账、回复信和保守的重投计划，并要求承诺基于可行修改与现有证据。', ['逐条回复审稿意见', '维护论文修订台账', '规划保守且有证据的重投方案']]],
  ['anthropics/claude-plugins-community/tres-upload-tx-header-validation', ['数据导入与校验', 'Tres Upload Tx Header Validation：校验 TRES Finance 批量交易 CSV 的表头命名，专门处理缺少必填列等上传失败，不覆盖行值或上传流程。', ['修复 TRES 交易 CSV 表头', '检查缺失的必填列名', '验证批量交易上传模板']]],
  ['calesthio/generative-media-skills/cinematic-shot-direction', ['影视制作与镜头设计', 'Cinematic Shot Direction：把故事意图转成景别、镜头、透视、机位、运动、调度、轴线、光线与连续性要求，并诊断镜头无法顺畅剪接的原因。', ['为 AI 视频规划镜头覆盖', '编写可执行的镜头规格', '排查生成或实拍镜头的连续性问题']]],
  ['code.deepline.com/deepline-scoring', ['能力待核对', 'Deepline Scoring：当前只确认到名称与榜单元数据，公开说明不足以判断评分对象、指标、数据源或输出格式。', ['持续核对 skills.sh 详情页说明', '确认评分对象与指标定义', '在能力边界明确后再评估使用']]],
  ['moda-design/moda/moda-social-ads', ['广告创意与设计', 'Moda Social Ads：制作平台原生静态广告和多尺寸 IAB 展示横幅，并让同一信息随一组尺寸共同导出。', ['制作社交平台静态广告', '生成多尺寸 IAB 横幅套件', '保持跨尺寸广告信息一致']]],
  ['patrickserrano/skills/macos-spm-app-packaging', ['macOS 开发', 'Macos Spm App Packaging：在没有 Xcode 工程的情况下搭建、构建和打包基于 SwiftPM 的 macOS 应用，覆盖资源、.app 组装、签名与公证。', ['创建 SwiftPM macOS 应用结构', '自定义组装 .app Bundle', '配置 Xcode 外的签名与公证']]],
  ['patrickserrano/skills/view-refactor', ['SwiftUI 开发', 'View Refactor：重构 SwiftUI View 文件，统一结构、依赖注入和 Observation 用法，并安全处理 View Model 的初始化与传递。', ['整理 SwiftUI View 布局结构', '规范依赖和 View Model 注入', '迁移或修正 Observation 用法']]],
  ['sickn33/agentic-awesome-skills/distributed-tracing', ['可观测性', 'Distributed Tracing：使用 Jaeger 与 Tempo 实现分布式追踪，观察请求在多个微服务之间的流转。', ['为微服务接入分布式追踪', '查看跨服务请求链路', '用 Jaeger 或 Tempo 定位链路问题']]],
  ['smithery.ai/planning-with-files', ['能力待核对', 'Planning With Files：当前只确认到名称与榜单元数据，公开说明不足以判断所使用的文件结构、规划流程或适用范围。', ['持续核对 skills.sh 详情页说明', '确认规划文件与工作流约定', '在能力边界明确后再评估使用']]],
  ['transilienceai/communitytools/cve-risk-score', ['安全与漏洞管理', 'Cve Risk Score：从 NVD 获取 CVE 的 CVSS 分数、严重级别、CWE 和描述，并在提及 CVE 编号时展示风险信息。', ['查询 CVE 风险分数与严重级别', '核对漏洞对应的 CWE', '为漏洞分诊补充 NVD 描述']]],
  ['transilienceai/communitytools/hackthebox', ['安全学习与演练', 'Hackthebox：面向 Hack The Box 平台的挑战、靶机与夺旗竞赛操作和自动化。', ['辅助处理 Hack The Box 挑战', '管理靶机演练步骤', '支持授权的夺旗竞赛任务']]],
  ['transilienceai/communitytools/skill-update', ['Skill 开发与维护', 'Skill Update：创建、更新和管理 Skill 目录结构，检查最佳实践并限制文档行数。', ['创建 Skill 目录结构', '更新或改进现有 Skill', '校验 Skill 规范与篇幅限制']]],
  ['valorvie/ai-dev-skills/custom-agent-router', ['Agent 编排与治理', 'Custom Agent Router：根据目标、范围、授权、复杂度和风险，在主 Agent、单一工作代理与有限并行之间选择执行及审查方式。', ['为复杂 Agent 任务选择协作模式', '按风险决定能力与审查强度', '在缺少配置时引导建立、预览或跳过']]],
  ['valorvie/ai-dev-skills/custom-skills-doc-writer', ['技术文档', 'Custom Skills Doc Writer：按读者任务和可验证主线编写或重构技术文档，并处理路径、文件名、frontmatter、索引和文档生命周期。', ['编写计划、调查或分析文档', '维护指南、手册与参考资料', '整理 docs 目录和主题索引']]],
  ['valorvie/ai-dev-skills/custom-skills-notify', ['通知与协作', 'Custom Skills Notify：向 Telegram 或 Discord 发送通知，支持手动发送、初始化配置、连接测试和长任务 Hook 通知。', ['手动发送 Telegram 或 Discord 通知', '初始化并测试通知连接', '为长时间任务配置完成提醒']]],
  ['zhinkgit/embeddedskills/gcc', ['嵌入式开发', 'Gcc：使用 CMake、Ninja 与 arm-none-eabi-gcc 扫描、配置、编译、重建和清理嵌入式工程，并分析 ELF 大小。', ['构建 CMake 嵌入式 GCC 工程', '列出和运行 CMake Preset', '分析固件 ELF 大小']]],
  ['zhinkgit/embeddedskills/net', ['网络调试', 'Net：发现网络接口、抓包并分析 pcap/pcapng，执行连通性测试、端口扫描和流量统计，支持常见工业网络协议调试。', ['使用 Wireshark 或 tshark 抓包', '分析 pcap 并排查连通性', '扫描端口和统计网络流量']]],
  ['latent-spaces/brag/brag', ['视频与产品发布', 'Brag：直接读取当前项目代码，并通过 Hyperframes 把项目网站转成简短、精致、可分享的发布视频。', ['为新项目制作发布短片', '把网站代码转成产品展示视频', '生成可用于社交分享的项目介绍']]],
  ['mattpocock/skills/pr', ['代码审查与协作', 'Pr：根据当前分支的实际变更编写 Pull Request 正文。', ['起草 Pull Request 描述', '把分支变更整理为评审摘要', '补充测试结果与审查提示']]],
  ['fetcher-sh/fetcher-skills/yelp', ['本地商业数据检索', 'Yelp：通过 fetcher.sh 查询本地商家、商家详情和评论，无需申请 Yelp Fusion API 应用。', ['按地点和评分搜索餐厅或服务商', '根据 Yelp 链接或 ID 查询商家详情', '收集评论用于口碑或竞品研究']]],
  ['gamedev-skills/awesome-gamedev-agent-skills/ai-behavior-trees-utility-ai', ['游戏 AI 开发', 'Ai Behavior Trees Utility Ai：实现可复用的行为树与 Utility AI 决策系统，并支持两者组合驱动 NPC。', ['构建带黑板和组合节点的行为树', '用响应曲线实现 Utility AI 评分', '为敌人或 NPC 调优复杂决策']]],
  ['open-mercato/skills/om-auto-write-spec', ['产品规格与开发协作', 'Om Auto Write Spec：把 Brief 或功能请求自主整理为规格，并提交包含证据、标签和衔接标记的 Pull Request。', ['把功能请求编写成可实施规格', '为规格 PR 附加 UI 草图或现状截图', '生成可衔接自动实现流程的规格标记']]],
  ['sentimony/skills/commit-all', ['版本控制', 'Commit All：在用户明确调用时，把当前工作区的全部变更整理为当前分支上的单个提交，不执行推送。', ['把工作区变更合并为一次提交', '在当前分支创建本地提交', '提交前确认不会自动推送远端']]],
  ['microsoft/azure-skills/foundry-iq', ['知识库与检索', 'Foundry Iq：创建、诊断或复用 Microsoft Foundry IQ 知识库，使本地或 Blob 文档可检索并向 Agent 返回带引用的结果。', ['把本地或 Blob 文档接入知识库', '诊断知识库连接器与多来源配置', '让 Agent 从现有知识库检索带引用答案']]],
  ['neondatabase/agent-skills/neon-auth', ['身份与访问管理', 'Neon Auth：为新应用接入 Neon 托管的 Better Auth，覆盖注册、登录、密码重置、OTP、OAuth、Passkey、MFA 和组织。', ['为新应用添加注册与登录', '配置邮件或手机 OTP、OAuth 与 Passkey', '在 Neon Auth 与现有身份提供商之间选择方案']]],
  ['apidojo-io/apidojo-skills/finding-fitness-brands-on-tiktok', ['社交媒体商业研究', 'Finding Fitness Brands On Tiktok：通过 Apify 上的 TikTok Scraper 发现健身房、工作室、教练和健康品牌，并返回账号与互动指标。', ['建立健身品牌 B2B 外联名单', '按话题标签发现工作室或教练', '比较品牌粉丝量与内容互动表现']]],
  ['nomadamas/k-skill/sharenuri-facility-search', ['韩国公共设施检索', 'Sharenuri Facility Search：只读搜索韩国共享平台上的会议室、体育设施、住宿、教育和物品等公共开放资源，并返回费用、容量与官方预约路径。', ['查找韩国可预约的公共设施', '比较费用、容量和预约方式', '获取设施联系方式与官方预约入口']]],
  ['obra/superpowers-developing-for-claude-code/working-with-claude-code', ['Claude Code 开发指南', 'Working With Claude Code：提供 Claude Code CLI、插件、Hook、MCP Server、Skill 与配置相关的官方文档指引。', ['查询 Claude Code 功能与配置', '开发或排查 Hook、MCP 与 Skill', '查找 Claude Code 官方用法依据']]],
  ['felipepg22/fpgskills/fpg-agents-md-writer', ['Agent 指令治理', 'Fpg Agents Md Writer：基于仓库证据研究、审计和维护 AGENTS.md 及配套指南，并约束篇幅、保留既有规则和写入审批。', ['创建或更新仓库 AGENTS.md', '审计 Agent 指令是否有代码依据', '重组任务路由与配套规范']]],
  ['obra/superpowers-developing-for-claude-code/developing-claude-code-plugins', ['Claude Code 插件开发', 'Developing Claude Code Plugins：提供创建、修改、测试、发布和维护 Claude Code 插件的完整生命周期流程与示例。', ['创建 Claude Code 插件', '测试和调试插件行为', '准备插件发布与后续维护']]],
  ['apidojo-io/apidojo-skills/scraping-youtube-comments', ['社交媒体数据采集', 'Scraping Youtube Comments：通过 Apify 上的 YouTube Scraper 抓取视频评论、回复数、点赞数、时间戳和评论者信息。', ['导出指定 YouTube 视频评论', '收集观众反馈做情感研究', '比较评论热度与回复情况']]],
  ['felipepg22/fpgskills/performance-testing', ['性能测试', 'Performance Testing：使用 k6 规划、生成、执行和分析 REST、HTTP 或 gRPC 的负载、压力、突发与浸泡测试。', ['为 API 或用户旅程编写 k6 测试', '分析延迟、吞吐量与扩展性', '对获批的非生产环境执行性能测试']]],
  ['felipepg22/fpgskills/implementation-spec-writer', ['产品规格与开发协作', 'Implementation Spec Writer：从对话、文档、源码或仓库证据创建或更新一份自包含、可由 Agent 执行的 Markdown 实施规格。', ['把讨论整理为实施规格', '根据仓库证据更新技术方案', '为 Agent 准备自包含的开发说明']]],
  ['gil-1/skills/codebase-cleanup-audit', ['代码库维护', 'Codebase Cleanup Audit：在清理前审计代码库中的遗留、未使用、重复、陈旧或过度复杂内容，并给出可删除或简化的证据。', ['查找未使用或遗留代码', '识别重复文件与混乱命名', '整理代码库清理候选和影响范围']]],
  ['felipepg22/fpgskills/bdd-plan', ['测试与实施规划', 'Bdd Plan：为功能或缺陷修复编写行为驱动的 Markdown 实施计划，把场景关联到任务和实现后验证。', ['为功能编写 Given-When-Then 场景', '把行为场景映射到实施任务', '规划实现后的代码验证']]],
  ['arize-ai/arize-skills/arize-phoenix-migration', ['可观测性数据迁移', 'Arize Phoenix Migration：把 Phoenix 项目的历史 Trace 迁移到 Arize AX，保留原始 ID 与时间戳并验证导入的 Span。', ['迁移 Phoenix 历史 Trace', '保留 Trace ID 和时间戳', '核验 Arize AX 中导入的 Span']]],
  ['securityskills/skills/secure-code-review', ['安全代码审查', 'Secure Code Review：围绕信任边界、输入路径、认证流程和漏洞类别对 Pull Request 或代码库进行安全审查。', ['绘制应用信任边界', '审计输入处理与认证流程', '按漏洞类别检查高风险代码']]],
  ['bankai-skills/superpowers/web-search', ['搜索与信息检索', 'Web Search：通过 inference.sh CLI 调用 Tavily 与 Exa，执行网页搜索、内容提取、直接问答和研究任务。', ['检索并提取网页内容', '为 RAG 流程收集资料', '开展事实核对与内容聚合']]],
  ['typesafe-ai/skills/typesafe-ai', ['AI 应用开发', 'Typesafe Ai：把自然语言和应用状态转换为带类型的判断与概率，供代码组合成路由、排序、提取或验证逻辑。', ['将 LLM 判断接入类型化代码', '构建路由、排序与提取功能', '把提示词解析步骤改造成结构化决策']]],
  ['tt-a1i/archify/archify-review', ['工程维护决策', 'Archify Review：从价值、成本与影响角度审查 Archify Issue、PR 或代码，为维护决策提供证据。', ['分流和评估工程 Issue', '审查变更的成本与影响', '支持代码质量和维护优先级决策']]],
  ['dontbesilent2025/dbskill/dbs-theory-grounding', ['研究与理论核验', 'Dbs Theory Grounding：先判断经验命题是否成立，再匹配并核实可信理论，用理论重释案例并标明适用边界。', ['为 PPT 或课程补充理论来源', '判断经验观点能否上升为理论', '检查案例是否错误套用名人或理论']]],
  ['open-mercato/skills/om-spec-writing', ['产品规格与架构评审', 'Om Spec Writing：以骨架优先和开放问题门禁撰写或审查功能规格，并补充市场研究、分阶段实施拆解和分级架构意见。', ['起草 Staff Engineer 级功能规格', '审查规格中的开放问题与架构风险', '把实施工作拆成阶段和步骤']]],
  ['apidojo-io/apidojo-skills/scraping-tweets-from-account', ['社交媒体数据采集', 'Scraping Tweets From Account：通过 Apify 上的 apidojo Tweet scraper 抓取指定 X/Twitter 账号的推文、回复、媒体与互动数据。', ['导出指定账号的推文历史', '收集账号时间线与媒体链接', '为研究或竞品分析整理互动数据']]],
  ['celigo/ai/managing-api-tokens', ['API 凭据与访问控制', 'Managing Api Tokens：管理 Celigo API Token 与个人访问令牌，覆盖权限范围、轮换、撤销、删除和密钥保密边界。', ['创建或轮换 Celigo API Token', '按最小权限配置访问范围', '区分平台令牌与连接 OAuth Token']]],
  ['celigo/ai/managing-integrations', ['集成生命周期管理', 'Managing Integrations：组织 Celigo Integration 及其 Flow、API、Tool、连接和脚本，并处理克隆、资源移动与跨环境版本生命周期。', ['创建和组织 Celigo Integration', '克隆集成并重新映射连接', '管理跨环境快照、拉取与回滚']]],
  ['celigo/ai/managing-on-premise-agents', ['私有网络连接', 'Managing On Premise Agents：配置 Celigo 本地代理，通过仅出站隧道连接防火墙后的数据库、文件共享或内部应用。', ['连接防火墙后的私有系统', '安装、配对或轮换本地代理令牌', '排查代理离线导致的 Flow 失败']]],
  ['celigo/ai/managing-stacks', ['自托管集成运行时', 'Managing Stacks：配置 Celigo Stack，把脚本 Hook 或连接器 Wrapper 指向自托管 Server 或 AWS Lambda 运行时。', ['选择 Server 或 Lambda Stack', '创建和更新 Celigo Stack', '把 Hook 或 Wrapper 关联到运行时']]],
  ['celigo/ai/using-marketplace-templates', ['集成模板与市场', 'Using Marketplace Templates：从 Celigo Marketplace 选择并复用 Template 或 Integration App，处理连接映射、依赖和单元素复制。', ['安装 Celigo Template 或 Integration App', '从蓝图复制 Flow、Export 或 Import', '在复用方案时映射连接与依赖']]],
  ['deepdotspace/deepspace-skill/deepspace', ['实时协作应用开发', 'Deepspace：使用 DeepSpace SDK 与 Cloudflare Workers 构建实时协作应用，覆盖同步、在线状态、协同编辑、权限、消息和部署。', ['构建实时多人协作应用', '实现在线状态与协同编辑', '部署或迁移 DeepSpace 项目文档']]],
  ['tiangong-ai/agent-skills/email-smtp-send', ['邮件与办公自动化', 'Email Smtp Send：通过 SMTP 发送邮件与可选本地附件，并可用 IMAP APPEND 将邮件同步到已发送邮箱。', ['发送带附件的 SMTP 邮件', '检查 SMTP 连接与投递', '把已发送邮件同步到 IMAP Sent 邮箱']]],
  ['fetcher-sh/fetcher-skills/google-search', ['搜索与信息检索', 'Google Search：通过 fetcher.sh 以结构化 JSON 返回 Google 搜索结果，支持搜索运算符、分页、语言和国家或地区范围。', ['以 API 方式获取 Google 搜索结果', '使用 site、filetype 或精确短语检索', '开展排名跟踪、竞品研究与结果监控']]],
  ['celigo/ai/building-mcp-servers', ['MCP 与集成开发', 'Building Mcp Servers：构建 Celigo MCP Server 资源，把工具和 builder-mode API 作为端点提供给外部 Agent 与 MCP 客户端。', ['创建 Celigo MCP Server 资源', '把工具或 API 连接到 MCP 端点', '配置工具注解与覆盖项']]],
  ['celigo/ai/writing-handlebars', ['集成与数据转换', 'Writing Handlebars：为 Celigo 集成编写 Handlebars 表达式，在映射、HTTP 正文、SQL、URI 和过滤器中生成动态值。', ['编写条件或格式化字段表达式', '在 HTTP、SQL 或 URI 中插入动态值', '为 Celigo 资源配置计算字段']]],
  ['celigo/ai/building-flows', ['集成与数据管道', 'Building Flows：构建或调试 Celigo Flow，按计划或事件在来源与目标系统之间传输数据，并处理链路、错误和模板。', ['创建定时或事件触发的数据流', '串联 Celigo 集成步骤', '配置错误处理与抽象实例模板']]],
  ['celigo/ai/managing-users', ['身份与访问管理', 'Managing Users：管理 Celigo 账户用户的邀请、权限、访问级别、MFA/SSO 与停用流程。', ['邀请或停用 Celigo 用户', '调整管理员、管理或监控权限', '审计访问并配置 MFA 或 SSO']]],
  ['celigo/ai/configuring-exports', ['集成与数据管道', 'Configuring Exports：配置 Celigo Export 数据源步骤，选择适配器并设置增量同步、Webhook、文件传输或查询。', ['创建或修改 Celigo Export', '配置增量同步与 Webhook', '选择适配器并设置文件传输或查询']]],
  ['celigo/ai/configuring-filters', ['集成与数据转换', 'Configuring Filters：为 Celigo Export、Import 和 Flow 分支配置过滤规则，控制记录继续处理或路由到哪个分支。', ['为数据流添加记录过滤条件', '配置分支路由规则', '选择表达式或脚本过滤方式']]],
  ['celigo/ai/configuring-imports', ['集成与数据管道', 'Configuring Imports：配置 Celigo Import 目标步骤，把记录写入外部系统，并设置字段映射、查找、Upsert 或文件导入。', ['创建或修改 Celigo Import', '配置字段映射与查找', '设置 Upsert、AI Agent 或文件导入']]],
  ['celigo/ai/getting-started', ['集成平台指南', 'Getting Started：介绍 Celigo 集成的核心概念、构建顺序、账户发现、沙箱意识及不同任务应使用的 Skill。', ['了解 Celigo 集成基本结构', '规划资源构建顺序', '为不明确的 Celigo 任务选择对应流程']]],
  ['celigo/ai/building-apis', ['API 与集成开发', 'Building Apis：构建 Celigo 自定义 HTTP API，让外部系统通过集成同步查询、写入或代理经过认证的请求。', ['创建 Celigo 自定义 API', '代理需要认证的外部请求', '暴露结构化查询或写入接口']]],
  ['celigo/ai/writing-mappings', ['集成与数据转换', 'Writing Mappings：为 Celigo 集成编写字段映射和转换，覆盖 Mapper 2.0、Transformation 2.0、Lookup 与响应映射。', ['配置导入字段映射', '转换导出记录结构', '编写查找与响应映射']]],
  ['celigo/ai/configuring-ai-agents', ['AI 集成与护栏', 'Configuring Ai Agents：配置 Celigo 的 LLM Agent 与 Guardrail 导入步骤，用于分类、提取、验证或生成 Flow 中的数据。', ['配置 OpenAI 或 Gemini Agent Import', '定义提示词与结构化输出', '设置 PII、内容审核或 BYOK 护栏']]],
  ['celigo/ai/troubleshooting-flows', ['集成运维与排障', 'Troubleshooting Flows：诊断 Celigo Flow 的完全失败、部分错误、卡住任务、空运行和性能问题。', ['排查失败或卡住的 Celigo Flow', '分析空结果与部分错误', '定位 Flow 性能瓶颈']]],
  ['celigo/ai/writing-sql', ['SQL 与数据集成', 'Writing Sql：为 Celigo RDBMS Export 和 Import 编写 SQL，覆盖查询、写入、Upsert、Merge、增量与批量操作。', ['编写 Celigo 数据库导出查询', '配置增量或一次性同步 SQL', '排查跨数据库 SQL 错误']]],
  ['celigo/ai/configuring-guardrails', ['AI 安全与合规', 'Configuring Guardrails：配置 Celigo Guardrail 资源，对集成数据执行 PII 检测、内容审核或基于 AI 的评估规则。', ['为 Flow 配置 PII 检测', '设置内容审核规则', '定义 AI 数据质量或合规评估']]],
  ['celigo/ai/configuring-connections', ['连接与凭据管理', 'Configuring Connections：配置 Celigo Connection 与 iClient，选择认证方式、设置 OAuth、管理共享凭据并排查连接问题。', ['创建或修改 Celigo 连接', '配置 OAuth 与认证方式', '管理 iClient 并排查连接失败']]],
  ['celigo/ai/building-tools', ['集成工具开发', 'Building Tools：构建 Celigo Tool 资源，把查找、导入、转换和分支封装成具有输入输出契约的可复用组件。', ['创建可复用 Celigo Tool', '组合查找、导入与转换步骤', '为 Flow、API、Agent 或 MCP Server 提供工具']]],
  ['celigo/ai/configuring-lookup-caches', ['缓存与数据集成', 'Configuring Lookup Caches：配置 Celigo 内存键值 Lookup Cache，用于快速查找、去重、交叉引用解析和 Flow 状态跟踪。', ['创建和加载 Lookup Cache', '在 Import Lookup 中引用缓存', '管理缓存生命周期与去重状态']]],
  ['planetscale/skills/planetscale-vitess-safety-review', ['数据库安全审查', 'Planetscale Vitess Safety Review：审查 PlanetScale Vitess 数据库的迁移、Deploy Request、Schema 建议、Insights、Webhook 与运维安全性。', ['审查 Vitess Schema 迁移风险', '检查 PlanetScale Deploy Request', '核对 Insights、Webhook 与运维安全项']]],
  ['apidojo-io/apidojo-skills/monitoring-trending-topics-twitter-by-niche', ['社交媒体趋势研究', 'Monitoring Trending Topics Twitter By Niche：通过 apidojo Twitter Search 抓取器监控特定细分领域的热门话题、讨论增速、互动信号与主要发声者。', ['跟踪细分行业的 X/Twitter 热门话题', '识别新兴讨论与实时舆情', '比较推文增速、互动和关键账号']]],
  ['firecrawl/cli/firecrawl-alexandria', ['工具发现与结构化检索', 'Firecrawl Alexandria：在用户明确要求时使用 Firecrawl Alexandria beta 发现工具或执行提供商支持的搜索与结构化第三方数据查询。', ['发现 Alexandria 可用工具', '执行提供商支持的结构化搜索', '在已有 Firecrawl 授权下查询第三方数据']]],
  ['brycehamrick/firecrawl-axi/firecrawl-axi', ['网页采集与研究自动化', 'Firecrawl Axi：通过 firecrawl-axi 处理网页抓取、搜索、站点爬取、本地文档解析、异步研究和变更监控。', ['抓取网页或爬取站点', '运行异步研究与索引搜索', '解析本地文档并管理页面变更监控']]],
  ['cursor/plugins/principle-attack-the-premise', ['调试与问题求解', 'Principle Attack The Premise：当共享同一前提的多个修复连续失败时，先盘点失衡的参与者，再质疑该前提而非重复相同方向。', ['处理多个修复连续失败的问题', '识别共同但可能错误的前提', '在下一次修改前重新建立问题模型']]],
  ['cursor/plugins/principle-test-behavior-not-implementation', ['测试与质量', 'Principle Test Behavior Not Implementation：要求测试按真实用户调用方式验证可观察结果，并以明确预期值避免只断言实现细节。', ['编写面向行为的测试', '重写无法捕获空实现的断言', '删除不提供行为保证的测试']]],
  ['flutter/agent-plugins/dart-use-path-package', ['Dart 与 Flutter 开发', 'Dart Use Path Package：使用 package:path 与 package:file 跨平台处理路径拼接、分段、扩展名和上下文转换。', ['替换手写的路径字符串操作', '跨平台拼接和拆分文件路径', '提取扩展名并转换路径上下文']]],
  ['madslorentzen/ai-job-search/job-application-assistant', ['求职与职业发展', 'Job Application Assistant：协助评估职位描述、定制简历、撰写求职信并准备面试。', ['分析职位匹配度', '针对岗位调整简历和求职信', '准备面试问题与回答']]],
  ['nilbuild/page-mascot/page-mascot', ['交互式前端与角色动画', 'Page Mascot：为网页加入跟随光标并响应点击的 Q 版角色，使用现有或新绘制角色生成对齐的精灵图并接入 React。', ['在网页中加入光标跟随吉祥物', '从现有角色或用户照片制作角色', '生成并验证不会跳动的动画精灵图']]],
  ['nomadamas/k-skill/bccard-eatpl-search', ['本地生活与餐饮检索', 'Bccard Eatpl Search：按韩国地区、车站或社区查找餐厅、咖啡馆和聚餐地点，并依据近期支付销售数据排序。', ['查找韩国附近餐厅或咖啡馆', '按地区或车站筛选就餐地点', '依据近期消费数据比较热门商家']]],
  ['nomadamas/k-skill/railway-timetable', ['交通与行程查询', 'Railway Timetable：只读查询韩国 Korail 综合铁路时刻表，覆盖 KTX 系列列车，不提供预订、支付、取消或占座。', ['查询韩国 KTX 系列时刻', '比较列车出发与到达时间', '在订票前只读规划铁路行程']]],
  ['nomadamas/k-skill/religious-facility-search', ['本地设施检索', 'Religious Facility Search：通过 Kakao Local API 按韩国社区、车站或地标查询教堂、天主教堂与寺庙，并按距离返回地址、电话和地图链接。', ['查找韩国附近宗教设施', '按地点和距离整理结果', '获取地址、电话与 Kakao 地图链接']]],
  ['raintree-technology/hig-doctor/hig-foundations', ['Apple 界面设计', 'Hig Foundations：依据 Apple Human Interface Guidelines 处理颜色、排版、SF Symbols、深色模式、无障碍、布局、动效、隐私和 RTL 等设计基础。', ['审查 Apple 平台颜色与排版', '检查深色模式和 Dynamic Type', '核对无障碍、图标与布局规范']]],
  ['vercel/eve/gh-pr-description', ['代码审查与协作', 'Gh Pr Description：为 eve 仓库起草或审查 GitHub Pull Request 描述，并把分支变更整理成便于评审的摘要。', ['起草 eve 仓库 PR 描述', '根据分支变更生成评审摘要', '检查 PR 描述是否覆盖关键修改']]],
  ['everyinc/compound-engineering-plugin/ce-pov', ['决策与分析', 'Ce Pov：依据项目证据与约束评估给定主题，输出有依据的立场、权衡与成立条件，并可汇总其他模型的意见。', ['评估外部方案是否适合采用', '对文档或方法形成整体判断', '汇总多模型意见并说明分歧与条件']]],
  ['islambaraka90/fintech-algorithms-library/fintech-algorithms', ['金融与市场数据', 'Fintech Algorithms：通过公开说明所述的 TypeScript 算法库计算市场数据、技术指标、风险度量、交易执行、时间序列与链上分析。', ['计算收益、波动率、回撤和风险指标', '分析技术指标与图表形态', '清洗市场数据并验证量化模型']]],
  ['nomadamas/k-skill/hankookilbo-news', ['新闻与信息检索', 'Hankookilbo News：通过韩国日报公开远程 MCP 查询编辑头条、热门与最新文章、分区推荐、主题搜索和今日运势，并返回标题、发布时间与原文链接。', ['查询韩国日报头条和最新文章', '按主题或分区检索新闻', '整理文章标题、发布时间与原文链接']]],
  ['storage.googleapis.com/streak-draft-created', ['能力待核对', 'Streak Draft Created：skills.sh 当前没有可审校的公开说明；仅凭名称无法确认其与 Streak 草稿创建事件有关的输入、输出或适用范围。', ['核对 skills.sh 后续公开说明', '确认来源方与数据边界', '在能力明确后再评估使用场景']]],
  ['teng-lin/weread-omni/weread', ['阅读与知识管理', 'Weread：通过公开说明所述的 weread-omni JSON CLI 搜索微信读书内容、管理书架与公众号订阅，并读写划线、笔记和评论。', ['搜索书籍、文章与阅读数据', '管理书架和公众号订阅', '读写划线、笔记与评论']]],
  ['gmgnai/gmgn-skills/gmgn-token-buy', ['区块链与链上数据', 'Gmgn Token Buy：把代币名称或符号解析为对应合约，并结合金额、滑点、Gas 与仓位参数准备买入订单；公开说明要求另行调用合约尽调流程。', ['解析代币名称或符号对应的合约', '根据金额、滑点与仓位参数准备订单', '在买入前衔接公开说明指定的合约尽调']]],
  ['jihe520/mathmodelagent/mathmodel-figure-templates', ['数据可视化', 'Mathmodel Figure Templates：在 MathModel LaTeX 沙箱中复用科学绘图模板，覆盖 SHAP、ROC、泰勒图、相关矩阵和 Nature 和弦图等公开列出的图形。', ['复用内置科研绘图模板', '生成公开说明列出的统计与相关性图形', '在 LaTeX 沙箱中整理论文图表']]],
  ['earthtojake/text-to-cad/dfam-check', ['3D 与制造', 'Dfam Check：按 FDM、SLS、SLA/DLP、金属 PBF 与 MJF 的增材制造规则检查网格模型，并报告可打印性、壁厚、悬垂和支撑问题。', ['检查 STL、OBJ、PLY 或 3MF 的可打印性', '分析壁厚、悬垂与支撑需求', '比较构建方向并准备 DfAM 改进建议']]],
  ['bmad-code-org/bmad-method/bmad-agent-analyst', ['商业分析', 'Bmad Agent Analyst：面向市场研究、竞争分析和需求梳理的业务分析角色。', ['开展市场与竞争研究', '梳理业务需求', '在明确请求业务分析角色时提供支持']]],
  ['apidojo-io/apidojo-skills/extracting-youtube-comments-for-research', ['用户研究', 'Extracting Youtube Comments For Research：通过公开说明指定的 YouTube 抓取器提取评论、点赞、回复数、用户名与时间戳，并用于受众反馈研究。', ['提取视频或频道评论', '分析观众情绪与常见问题', '整理内容和产品团队所需的受众洞察']]],
  ['aws/agent-toolkit-for-aws/amazon-workspaces-agent-access', ['云桌面自动化', 'Amazon Workspaces Agent Access：把 AI Agent 连接到 Amazon WorkSpaces Applications（AppStream 2.0）远程 Windows 应用，并指导会话连接、桌面操作与故障排查。', ['配置 Agent Access MCP 连接', '自动操作远程 Windows 应用', '排查连接、签名区域与会话生命周期问题']]],
  ['aws/agent-toolkit-for-aws/managing-amazon-kinesis-data-streams', ['云平台与数据流', 'Managing Amazon Kinesis Data Streams：管理 Kinesis Data Streams，并配置从数据流到 S3 或 S3 Tables 中 Iceberg 表的托管交付。', ['配置 KDS 数据流与交付通道', '把流数据交付到 S3 或 Iceberg 表', '设置 IAM、监控、告警与死信队列']]],
  ['dotnet/skills/migrate-nunit-to-mstest', ['测试与质量', 'Migrate Nunit To Mstest：将 .NET 测试从 NUnit 3/4 迁移到 MSTest v4，同时保留 VSTest 或 Microsoft Testing Platform 运行方式。', ['替换 NUnit 包与测试属性', '迁移断言、Fixture 和并行配置', '检查已迁移项目并报告无需改动的情况']]],
  ['google/mantis/mantis-calibrate', ['安全与合规', 'Mantis Calibrate：根据已处理的安全发现、经验证据与架构影响计算最终风险分数，并写回发现文件。', ['为已确认发现计算风险分数', '结合证据与架构影响校准等级', '为安全审查流水线补充最终评分']]],
  ['google/mantis/mantis-dedupe', ['安全与合规', 'Mantis Dedupe：合并原始安全发现中的重复报告，为后续审查保留去重后的问题集合。', ['合并重复安全发现', '整理研究阶段生成的原始报告', '为后续安全审查准备去重结果']]],
  ['google/mantis/mantis-history', ['安全与合规', 'Mantis History：分析版本控制历史中的既往漏洞、修复和重复模式，生成供后续安全研究使用的历史知识数据。', ['提取历史漏洞与安全修复', '归纳代码库中的漏洞模式', '为后续安全研究建立历史知识库']]],
  ['google/mantis/mantis-meta-agent', ['安全与合规', 'Mantis Meta Agent：作为长期安全审查活动的常驻监督者，启动并监控自动化审查流程。', ['启动持续安全审查活动', '监控多阶段审查进度', '协调长期运行的安全检查流程']]],
  ['google/mantis/mantis-structural-index', ['代码理解与索引', 'Mantis Structural Index：从代码库建立按内容寻址的语义单元索引，为安全研究提供结构和交叉引用上下文。', ['索引代码库的语义单元', '建立结构化交叉引用', '为后续安全研究补充代码上下文']]],
  ['google/mantis/mantis-threat-model', ['安全与合规', 'Mantis Threat Model：根据知识库中的架构和实体定义，整理信任边界、攻击面与攻击者画像，形成持续更新的威胁模型。', ['识别信任边界与攻击面', '整理攻击者画像', '维护安全知识库中的威胁模型']]],
  ['tradermonty/claude-trading-skills/manifoldbt-backtester', ['量化研究', 'Manifoldbt Backtester：使用 manifoldbt Rust 引擎对 OHLCV 数据执行声明式策略回测，并输出胜率、平均盈亏与最大回撤等指标。', ['用真实 OHLCV 数据运行策略回测', '生成成交与往返交易记录', '计算胜率、平均盈亏和最大回撤']]],
  ['tradermonty/claude-trading-skills/us-undervalued-growth-screener', ['金融与市场数据', 'Us Undervalued Growth Screener：筛选纽交所、纳斯达克与 NYSE American 的价值成长型股票，并核对估值、盈利预测、稀释、行业周期与候选覆盖。', ['筛选美国价值成长型股票', '比较远期估值与盈利预测', '核对稀释、行业周期与候选池覆盖']]],
  ['reason-machines/security-skills/anthropic-cybersecurity-skills', ['安全与合规', 'Anthropic Cybersecurity Skills：提供映射到 MITRE ATT&CK、NIST CSF、ATLAS、D3FEND 与 NIST AI RMF 的结构化网络安全 Skill 集。', ['按安全框架查找操作流程', '为 AI 驱动安全运营选择对应 Skill', '核对检测、防护与风险管理框架映射']]],
  ['reason-machines/security-skills/pentest-ai-agents', ['渗透测试与安全研究', 'Pentest Ai Agents：为进攻性安全研究组织 Claude Code 子 Agent，覆盖渗透测试规划、侦察分析、漏洞研究、检测工程与报告。', ['规划授权渗透测试', '分析侦察与漏洞研究结果', '整理检测工程与安全报告']]],
  ['reason-machines/security-skills/pentest-agents-bug-bounty-framework', ['渗透测试与安全研究', 'Pentest Agents Bug Bounty Framework：提供由 50 个 Agent、循环式狩猎、漏洞利用链、平台 MCP 集成与报告检索组成的自主漏洞赏金框架。', ['组织授权漏洞赏金研究', '串联侦察与漏洞利用链', '检索并整理漏洞报告']]],
  ['qu-skills/superpowers/seedance', ['视频生成', 'Seedance：通过 inference.sh CLI 调用 Seedance 2.0，支持文生视频、图生视频、参考视频、同步音频及公开说明所列的 Pro、Fast 与 Studio 变体。', ['生成 4–15 秒带声音视频', '使用图片或视频作为生成参考', '制作社交、产品展示或音乐视频']]],
  ['reason-machines/security-skills/openosint-ai-osint-framework', ['OSINT 与调查', 'Openosint Ai Osint Framework：通过交互式 REPL、MCP Server 与 CLI 调用 11 种工具，调查邮箱、用户名、域名、IP 与电话号码。', ['开展公开来源身份线索调查', '关联邮箱、用户名与域名信息', '通过 CLI 或 MCP 组织 OSINT 查询']]],
  ['qu-skills/superpowers/happyhorse', ['视频生成与编辑', 'Happyhorse：通过 inference.sh CLI 调用 HappyHorse 1.0 的文生视频、图生视频、参考生成与自然语言视频编辑模型，并支持角色保持。', ['根据文字或图片生成视频', '按参考素材保持角色一致', '用自然语言编辑现有视频']]],
  ['dceoy/speckit-agent-skills/speckit-specify', ['产品规格与需求', 'Speckit Specify：根据自然语言功能描述创建或更新功能规格。', ['把功能想法整理为规格', '更新已有功能规格', '为后续实现明确需求边界']]],
  ['grafana/skills/synthetic-monitoring-checks', ['可观测性与合成监控', 'Synthetic Monitoring Checks：编写 Grafana Cloud Synthetic Monitoring 检查，覆盖 HTTP、Ping、DNS、TCP、MultiHTTP、k6 脚本与浏览器检查，并验证 probe_success。', ['监控登录、结账或注册流程', '把 k6 脚本或 OpenAPI 规格转为合成检查', '验证多地区站点可用性并准备回滚']]],
  ['open-mercato/skills/om-setup-agent-pipeline', ['Agent 工程配置', 'Om Setup Agent Pipeline：检查仓库分支、验证脚本与标签后生成共享 Agent 流水线配置、跟踪描述符及缺失的项目流程文档。', ['初始化仓库 Agent 流水线', '统一验证脚本与标签配置', '生成缺失的 SDLC 与代码审查文档']]],
  ['open-mercato/skills/om-prepare-test-env', ['测试环境工程', 'Om Prepare Test Env：把仓库发现结果整理为跨平台启动脚本，配置浏览器提供方并生成供 UI 与集成测试复用的测试环境描述符。', ['准备可复用本地测试环境', '生成跨平台测试启动脚本', '为 UI 与集成测试配置浏览器环境']]],
  ['open-mercato/skills/om-root-cause', ['缺陷诊断', 'Om Root Cause：只读分析跟踪系统中的缺陷，定位问题代码与最小修改面，并输出文件清单和建议修复方法。', ['调查缺陷根因', '定位需要修改的文件', '为后续实现提供最小修复范围']]],
  ['affaan-m/ecc/nasiko-control-plane', ['CLI 与生命周期管理', 'Nasiko Control Plane：通过实验性 Nasiko CLI 生命周期桥处理固定版本安装、只读状态查询与需明确同意的卸载，并约束遥测和密钥边界。', ['查询 Nasiko 状态', '按固定版本管理生命周期', '在明确同意后执行限定卸载']]],
  ['halt-catch-fire/superpowers/p-image', ['图像生成与编辑', 'P Image：通过 inference.sh CLI 调用 Pruna P-Image、LoRA 与编辑变体，支持文生图、图像编辑和多图合成。', ['根据文字生成图片', '使用 LoRA 风格或多图参考', '编辑并合成现有图像']]],
  ['halt-catch-fire/superpowers/p-video', ['视频生成', 'P Video：通过 inference.sh CLI 调用 Pruna P-Video 与 WAN 模型，支持文生视频、图生视频、音频和 720p/1080p 输出。', ['根据文字或图片生成视频', '生成带音频的视频', '选择公开说明所列的 P-Video 或 WAN 模型']]],
  ['emilkowalski/skills/mobile-native', ['移动 Web 体验', 'Mobile Native：通过 CSS、Meta 标签与真机验证修复移动 Web 的触摸、视口、安全区、输入缩放、滚动和状态栏问题，使网页更接近原生体验。', ['优化 PWA 与移动网页体验', '修复 100vh、安全区和输入缩放问题', '检查触摸、轮播与下拉刷新行为']]],
  ['stripe/ai/stripe-pay', ['支付与资金转移', 'Stripe Pay：向另一家 Stripe 商户或 Stripe Profile 账号转移资金，并在收款方不明确时通过 Stripe Directory 查找或核验。', ['向 Stripe 商户付款', '按 Profile handle 或网络 ID 转账', '付款前查找并核验收款方']]],
  ['microsoft/azure-skills/azure-local', ['云平台与混合基础设施', 'Azure Local：规划、部署、运维和排查 Azure Local（原 Azure Stack HCI），覆盖容量前提、Arc 注册、生命周期更新、虚机、AKS、存储、网络和故障分诊。', ['规划或部署 Azure Local', '管理 Arc VM 与 AKS 工作负载', '排查更新、网络与离线站点问题']]],
  ['microsoft/azure-skills/azure-local-multi-rack', ['云平台与数据中心基础设施', 'Azure Local Multi Rack：规划、部署和运维由 Network Fabric Controller、Cluster Manager、SAN 与托管网络构成的 Azure Local 多机架规模环境。', ['设计 Azure Local 多机架部署', '管理 NetworkCloud 与 NetworkFabric 控制面', '排查计算、汇聚与隔离域配置']]],
  ['andeveling/nojau-po/agent-config', ['Agent 配置与治理', 'Agent Config：为 Dani 商业租户配置编排器、四个子 Agent、会话标签与条款门禁，并通过租户校验、目标确认和写入护栏约束变更。', ['配置 Dani Agent 面板', '设置会话标签与条款门禁', '通过租户与目标校验后写入配置']]],
  ['andeveling/nojau-po/conversation-tags', ['会话分类与配置', 'Conversation Tags：为 Dani 商业租户配置会话标签，逐项定义标签并在租户和客户目标确认后通过护栏写入与回读验证。', ['创建租户会话标签', '按客户目标配置标签', '写入后回读验证配置']]],
  ['apidojo-io/apidojo-skills/finding-podcast-hosts-for-outreach', ['公关与媒体拓展', 'Finding Podcast Hosts For Outreach：通过 Apify 上的 apidojo Twitter 抓取器寻找适合嘉宾邀约的播客主持人，并返回账号、节目、主题、粉丝与受众规模信号。', ['构建播客嘉宾邀约名单', '按行业或主题寻找主持人', '比较账号影响力与受众信号']]],
  ['bankai-skills/superpowers/python-executor', ['代码执行与数据处理', 'Python Executor：在 inference.sh 沙箱中执行 Python，用于数据分析、网页采集、图像视频处理、PDF、3D 与自动化脚本。', ['运行 Python 数据分析与可视化', '执行网页采集和自动化脚本', '处理图片、视频、PDF 或 3D 数据']]],
  ['cline/skills/knowledge-catalog-discovery', ['数据目录与治理', 'Knowledge Catalog Discovery：搜索 Knowledge Catalog 条目、查询指定元数据并浏览 aspect 类型，以理解数据平台资产。', ['发现数据平台资产', '查询目录条目元数据', '浏览 aspect 类型与资产结构']]],
  ['elastic/agent-skills/cloud-onboarding', ['云平台身份与访问', 'Cloud Onboarding：配置 Elastic CLI 云端上下文和 API Key、默认区域、组织用户与 Serverless 项目角色，并创建或撤销 Cloud API Key。', ['初始化 Elastic Cloud 认证', '邀请用户并分配项目角色', '审计或轮换 Cloud API Key']]],
  ['elastic/agent-skills/cloud-provisioning', ['云平台与运维', 'Cloud Provisioning：创建和运维 Elastic Cloud Serverless 项目及 Hosted 部署，并管理 IP、AWS PrivateLink 等网络流量过滤。', ['创建或更新 Elastic Cloud 项目', '管理 Hosted 部署生命周期', '配置网络访问限制']]],
  ['elastic/agent-skills/elasticsearch-anomaly-detection', ['异常检测与机器学习', 'Elasticsearch Anomaly Detection：通过 API 创建和管理 Elastic ML 异常检测任务及 datafeed，并控制其打开、启动与停止。', ['配置异常检测任务', '设置索引或数据流的 datafeed', '启动、停止或检查检测任务']]],
  ['elastic/agent-skills/elasticsearch-anomaly-detection-explainer', ['异常检测与可解释性', 'Elasticsearch Anomaly Detection Explainer：解释 Elasticsearch ML 异常分数、模型学习方式与结果含义，并排查反常评分。', ['解释异常分数高低', '理解模型学习与结果字段', '排查不符合预期的异常评分']]],
  ['elastic/agent-skills/elasticsearch-cluster-health', ['搜索平台运维', 'Elasticsearch Cluster Health：以只读方式诊断非绿色 Elasticsearch 集群，区分主分片与副本影响、分配决策和数据丢失风险，并给出最可能原因。', ['诊断黄色或红色集群', '分析未分配分片与 allocation decider', '在修复前评估数据丢失风险']]],
  ['elastic/agent-skills/elasticsearch-index-design', ['搜索索引设计', 'Elasticsearch Index Design：按查询、过滤、排序与聚合访问模式设计或审查字段映射、multi-field、doc_values、分片和映射膨胀风险。', ['设计新索引映射', '修复错误字段类型', '优化存储与查询访问模式']]],
  ['elastic/agent-skills/elasticsearch-ingest', ['数据导入与索引', 'Elasticsearch Ingest：使用 Bulk API 和显式映射把 CSV 或 JSON 文件导入 Elasticsearch，并验证文档数量与映射。', ['批量导入 CSV 或 JSON', '转换为 NDJSON Bulk 格式', '核对导入后的数量与字段映射']]],
  ['elastic/agent-skills/elasticsearch-query-optimization', ['搜索性能优化', 'Elasticsearch Query Optimization：基于 Search Profile 诊断慢 Query DSL，将非评分条件移入 filter、处理前导通配符并复测性能。', ['分析慢查询 Profile', '优化评分与过滤上下文', '复测并量化查询改进']]],
  ['elastic/agent-skills/elasticsearch-reindex', ['数据迁移与索引', 'Elasticsearch Reindex：指导本地或远程索引重建，配置 slicing、throttling 与 Task API，用于复制、迁移、映射变更或转换数据。', ['迁移或复制 Elasticsearch 索引', '在重建时变更映射或数据', '控制切片、限速与后台任务']]],
  ['elastic/agent-skills/elasticsearch-search-relevance', ['搜索相关性', 'Elasticsearch Search Relevance：通过查询规则置顶结果，并依据索引映射调整 multi_match、字段权重与全文匹配。', ['改善内容或商品搜索排序', '为特定查询置顶文档', '调整字段权重并验证相关性']]],
  ['elastic/agent-skills/kibana-workflows', ['工作流自动化', 'Kibana Workflows：编写、验证、测试、运行和检查 Elastic Workflow YAML，并把自然语言需求转为 Kibana 工作流。', ['创建 Kibana Workflow YAML', '修复触发器与步骤配置', '运行并检查真实工作流']]],
  ['elastic/agent-skills/observability-onboarding', ['可观测性接入', 'Observability Onboarding：使用 Elastic Distribution of OpenTelemetry 为应用接入链路、指标和日志，处理经典 APM Agent 迁移并用 ES|QL 验证数据到达。', ['为服务接入 Elastic Observability', '从经典 APM Agent 迁移到 EDOT', '验证 traces、metrics 与 logs']]],
  ['elastic/agent-skills/observability-service-reliability', ['SRE 与可靠性', 'Observability Service Reliability：在 Elastic Observability 中设计 SLI、SLO、错误预算和燃尽率告警，并判断何时改用阈值、异常检测或合成监控。', ['定义或审查服务 SLO', '配置错误预算与燃尽率告警', '降低告警噪声并选择监控手段']]],
  ['elastic/agent-skills/observability-sre-triage', ['SRE 与故障分诊', 'Observability Sre Triage：结合 SLO、告警、ML 异常、吞吐、延迟、错误、依赖、基础设施和日志端到端分诊服务异常。', ['判断服务是否健康', '定位延迟、错误与依赖问题', '生成信号背后的 ES|QL 查询']]],
  ['fabricioveronez/harness-publico/escrever-prd', ['产品需求文档', 'Escrever Prd：以 draft-first 方式创建或编辑自包含 PRD，标注推断假设，并在输入覆盖多个功能时建议拆分。', ['起草或修改产品需求文档', '定义功能行为、规则与范围', '评估 PRD 拆分和粒度']]],
  ['fabricioveronez/harness-publico/escrever-trd', ['技术架构文档', 'Escrever Trd：创建和维护 docs/trd.md 中的技术栈、架构、非功能需求、依赖与项目标准，也可记录 ADR 并更新全局决策。', ['建立或更新技术需求文档', '记录架构决策 ADR', '维护技术栈与项目标准']]],
  ['guia-matthieu/clawfu-skills/whisper-transcription', ['音频转写', 'Whisper Transcription：使用 OpenAI Whisper 把音频或视频转为文本，用于字幕、访谈摘录、内容复用与可搜索归档。', ['转写播客或访谈', '为视频制作字幕', '把音视频内容整理为文章或归档']]],
  ['hypit-ai/hypit/hypit', ['视频制作与项目管理', 'Hypit：根据参考素材或简报制作、调整和修订视频，覆盖 SVML、SVS、SVRun、项目组件及运行时或凭据配置。', ['根据简报制作视频', '维护 Hypit 项目组件', '编写或调整 SVML、SVS 与 SVRun']]],
  ['mitsuhiko/agent-stuff/commit', ['版本控制', 'Commit：要求在创建 Git 提交前先读取其公开提交规范。', ['提交前核对提交规范', '准备符合仓库约定的 Git 提交']]],
  ['mitsuhiko/agent-stuff/summarize', ['内容提取与摘要', 'Summarize：通过 markitdown 将 URL、PDF、DOCX、HTML 等内容转换为 Markdown，并可选择生成摘要。', ['把网页或本地文件转为 Markdown', '提取 PDF、DOCX 或 HTML 内容', '对转换结果生成摘要']]],
  ['reticlehq/reticle/agentic-tdd', ['端到端测试与 TDD', 'Agentic Tdd：针对单元测试无法覆盖的可观察行为，在真实运行应用上先声明预期并验证失败，再实现并验证通过。', ['为 UI 或全栈功能执行红绿循环', '用真实应用验证行为后果', '减少只依赖 Mock 的测试盲区']]],
  ['reticlehq/reticle/audit-my-app', ['产品质量审计', 'Audit My App：遍历运行中的 Web 应用控件，报告失效按钮、控制台错误、失败请求以及 API 与页面不一致。', ['发布前执行应用烟雾检查', '审计陌生或大规模合并后的应用', '发现死控件与前后端状态不一致']]],
  ['reticlehq/reticle/debug-broken-ui', ['前端故障诊断', 'Debug Broken Ui：联合读取点击、网络请求、状态仓库与控制台，定位运行中 Web 界面故障对应的源文件与行号。', ['诊断按钮、表单或弹窗失效', '排查空白、陈旧或无法加载的页面', '定位前端故障代码位置']]],
  ['reticlehq/reticle/design-system-compliance', ['设计系统审查', 'Design System Compliance：对照项目设计令牌检查运行界面的计算样式，发现硬编码色值、越界配色、不可用控件和未运行的动画。', ['检查界面是否使用设计令牌', '发现硬编码颜色与可用性问题', '验证组件样式和动画状态']]],
  ['reticlehq/reticle/drive-desktop-app', ['桌面应用测试', 'Drive Desktop App：从应用内部驱动并验证 Electron 或 Tauri 桌面应用，包括浏览器工具无法看到的主进程与 Rust IPC 调用。', ['测试桌面应用真实流程', '验证 Electron 或 Tauri IPC', '在 CI 中执行无头桌面 UI 检查']]],
  ['reticlehq/reticle/false-green-tests', ['测试有效性审查', 'False Green Tests：调查测试全绿但应用失效的问题，识别无效断言、过度 Mock、未连接处理器和未覆盖的真实行为。', ['验证绿灯测试是否真正保护功能', '发现永不失败的断言', '检查 Mock 与真实 API 的偏差']]],
  ['reticlehq/reticle/fix-what-i-pointed-at', ['界面反馈修复', 'Fix What I Pointed At：读取用户在运行界面中标注的元素、备注及源码位置，接续处理被指认的具体缺陷。', ['处理设计师或 PM 的界面标注', '定位“这里有问题”的具体元素', '按来源文件和行号修复反馈']]],
  ['reticlehq/reticle/install-and-verify', ['前端集成验证', 'Install And Verify：接入 Reticle 并从 DOM、网络、路由、控制台与框架状态验证 Web 应用变更是否真实生效。', ['安装和配置 Reticle', '验证用户可见变更', '定位通过测试但界面仍失败的问题']]],
  ['reticlehq/reticle/replay-user-flows', ['回归测试自动化', 'Replay User Flows：把刚执行的用户旅程保存为不依赖模型、无需编写测试代码的确定性回归检查。', ['将手动用户流程固化为回归检查', '在重构后重放既有旅程', '减少重复人工验证']]],
  ['reticlehq/reticle/reticle', ['前端集成验证', 'Reticle：安装并检测运行中的 Web 应用，从 DOM、网络、路由、控制台和框架状态驱动真实流程并返回带源码位置的结论。', ['为 Web 应用接入 Reticle', '端到端验证真实用户流程', '根据运行证据定位待修代码']]],
  ['reticlehq/reticle/test-error-states', ['异常状态测试', 'Test Error States：强制制造失败 API、空列表、慢请求、超时、过期会话和自动消失提示等状态，验证界面错误处理。', ['测试加载、空状态与错误状态', '验证超时、重试和计时器行为', '检查慢网络或过期会话体验']]],
  ['reticlehq/reticle/verify-ui-change', ['界面变更验证', 'Verify Ui Change：在真实运行页面中验证组件、表单、路由或 API 调整，返回请求、状态变化及待修源码位置。', ['验证 UI 修改是否实际生效', '检查表单、路由和 API 交互', '给出通过或失败的运行证据']]],
  ['reticlehq/reticle/verify-unattended', ['无人值守端到端验证', 'Verify Unattended：在 CI、目标模式或自主 Agent 中无人值守地安装、检测并端到端验证 Web 应用。', ['在 CI 中执行 Web 应用验证', '为自主任务配置无人值守检查', '在无需人工重启或打开浏览器时验证流程']]],
  ['sandai-org/vidmuse-skills/vidmuse', ['视频与多媒体项目', 'Vidmuse：处理 VidMuse 项目、账号、订阅额度、多媒体模型、生成或上传资产、风格与语音库、参数、线程、消息及长期记忆。', ['管理 VidMuse 项目与资产', '配置视频、音频、图像或文本模型', '检查额度、参数、线程与记忆']]],
  ['spencerpauly/awesome-cursor-skills/accessibility-auditing', ['无障碍审计', 'Accessibility Auditing：使用 Cursor 浏览器 ARIA 快照检查缺失标签、错误 Tab 顺序、对比度和 ARIA 误用。', ['审计网页无障碍问题', '检查键盘顺序与语义标签', '发现对比度和 ARIA 使用错误']]],
  ['spencerpauly/awesome-cursor-skills/adding-api-docs', ['API 文档', 'Adding Api Docs：为 API 生成 OpenAPI 或 Swagger 文档，包括端点模式、请求响应类型和交互式文档界面。', ['为现有 API 补充 OpenAPI', '记录请求与响应结构', '生成可交互 API 文档']]],
  ['spencerpauly/awesome-cursor-skills/adding-error-tracking', ['可观测性与错误追踪', 'Adding Error Tracking：为 Web 应用接入 Sentry 错误追踪、性能监控与 Source Map。', ['接入 Sentry 错误上报', '启用前端性能监控', '上传 Source Map 便于定位错误']]],
  ['spencerpauly/awesome-cursor-skills/adding-stripe', ['支付集成', 'Adding Stripe：为 Web 应用集成 Stripe Checkout、Webhook 与客户门户。', ['创建 Stripe Checkout 会话', '处理支付 Webhook', '接入客户自助门户']]],
  ['spencerpauly/awesome-cursor-skills/architecture-decision-records', ['架构决策记录', 'Architecture Decision Records：用 ADR 记录技术决策背景、备选方案与选择理由。', ['创建架构决策记录', '比较候选技术方案', '保留决策依据供后续维护']]],
  ['spencerpauly/awesome-cursor-skills/babysitting-pr', ['Pull Request 运维', 'Babysitting Pr：持续监控 Pull Request 的 CI 失败、评审评论和合并冲突，并处理问题以保持可合并状态。', ['跟踪 PR CI 状态', '处理评审评论', '解决合并冲突并保持 PR 可合并']]],
  ['spencerpauly/awesome-cursor-skills/best-of-n-solving', ['多方案问题求解', 'Best Of N Solving：在隔离 Git worktree 中并行尝试多种方案，并从复杂重构、疑难缺陷或架构候选中选出最佳实现。', ['比较多个复杂问题解法', '并行验证重构或架构方案', '从隔离实现中选择最佳结果']]],
  ['spencerpauly/awesome-cursor-skills/codebase-onboarding', ['代码库理解', 'Codebase Onboarding：并行调查代码架构、数据模型、认证、API 与部署方式，并汇总为入门文档。', ['快速理解陌生代码库', '并行梳理关键子系统', '生成工程入门文档']]],
  ['spencerpauly/awesome-cursor-skills/creating-pr', ['Pull Request 协作', 'Creating Pr：创建带清晰标题、结构化说明、关联 Issue 与合适评审者的可审查 Pull Request。', ['起草 Pull Request 标题与说明', '关联 Issue 和评审者', '检查 PR 是否便于审查']]],
  ['spencerpauly/awesome-cursor-skills/detecting-port-conflicts', ['本地开发排障', 'Detecting Port Conflicts：识别 EADDRINUSE 与端口冲突，查明占用进程并在明确范围内终止或建议替代端口。', ['诊断开发服务器端口占用', '定位端口对应进程', '选择释放端口或更换端口']]],
  ['spencerpauly/awesome-cursor-skills/finding-dev-server-url', ['本地开发环境', 'Finding Dev Server Url：扫描运行中的终端，发现 localhost 开发服务器 URL，并可选择在 Cursor 内置浏览器中打开。', ['查找本地开发服务地址', '汇总正在监听的 localhost 端口', '在内置浏览器打开应用']]],
  ['spencerpauly/awesome-cursor-skills/incident-response', ['事故响应', 'Incident Response：组织生产事故的分诊、缓解、沟通与复盘。', ['分诊生产事故', '制定缓解与沟通动作', '编写事故复盘']]],
  ['spencerpauly/awesome-cursor-skills/network-request-auditing', ['网络请求审计', 'Network Request Auditing：在浏览器交互后审计 fetch 与 XHR 的失败、延迟、重复调用和可疑载荷。', ['审计 API 密集页面请求', '发现失败或重复网络调用', '检查慢请求与异常载荷']]],
  ['spencerpauly/awesome-cursor-skills/parallel-ci-triage', ['CI 故障分诊', 'Parallel Ci Triage：获取失败的 GitHub Actions 日志，并将相互独立的失败任务分派到不同 Agent 并行修复。', ['分析多任务 CI 失败', '并行修复独立 Job', '汇总并验证各项 CI 修复']]],
  ['spencerpauly/awesome-cursor-skills/parallel-exploring', ['代码库理解', 'Parallel Exploring：让多个探索 Agent 并行调查大型代码库的不同区域，并汇总架构或跨模块问题。', ['并行理解大型代码库', '调查跨模块关注点', '汇总不同区域的工程发现']]],
  ['spencerpauly/awesome-cursor-skills/react-native-patterns', ['移动应用开发', 'React Native Patterns：使用 React Native 与 Expo 构建移动应用，覆盖导航、平台特定代码、性能与原生模块。', ['搭建 React Native 或 Expo 应用', '实现跨平台导航与平台分支', '优化性能并接入原生模块']]],
  ['spencerpauly/awesome-cursor-skills/reviewing-code', ['代码审查', 'Reviewing Code：围绕正确性、可维护性、性能和最佳实践执行全面代码审查。', ['审查代码正确性', '发现维护性与性能问题', '整理可执行评审意见']]],
  ['spencerpauly/awesome-cursor-skills/suggesting-cursor-hooks', ['开发流程自动化', 'Suggesting Cursor Hooks：当 lint、测试或类型检查被反复手动请求时，建议用 Cursor Hook 自动运行。', ['识别重复质量检查', '设计自动化 Cursor Hook', '减少手动 lint、测试与类型检查']]],
  ['spencerpauly/awesome-cursor-skills/verifying-in-browser', ['浏览器验证', 'Verifying In Browser：在代码变更后启动开发服务器并用 Cursor 内置浏览器检查渲染、控制台错误和网络健康。', ['验证 UI 或 API 变更', '检查真实页面渲染', '审计控制台与网络错误']]],
  ['spencerpauly/awesome-cursor-skills/visual-qa-testing', ['视觉质量检查', 'Visual Qa Testing：在 Cursor 内置浏览器中检查 Web 应用视觉表现，并结合截图、控制台与网络请求完成 QA。', ['对 UI 改动执行视觉 QA', '拍摄并比较页面截图', '检查控制台与网络异常']]],
  ['spencerpauly/awesome-cursor-skills/writing-commit-messages', ['版本控制', 'Writing Commit Messages：按 Conventional Commits 编写带类型、范围和正文的清晰提交信息。', ['生成规范提交标题', '为变更选择类型与范围', '在正文说明必要背景']]],
  ['spencerpauly/awesome-cursor-skills/writing-tests', ['测试工程', 'Writing Tests：分析现有代码与测试框架，为未覆盖路径编写包含 Mock、边界条件和明确断言的单元及集成测试。', ['为指定模块添加测试', '提高关键路径覆盖率', '补充边界条件与有效断言']]],
  ['twilio/ai/twilio-sendgrid-account-setup', ['邮件基础设施', 'Twilio Sendgrid Account Setup：配置 SendGrid API Key、域名 DKIM/SPF 认证、Single Sender 验证与 SDK，为后续邮件发送流程准备账号。', ['创建 SendGrid API Key', '配置 DKIM 与 SPF 域名认证', '设置测试用 Single Sender']]],
  ['twilio/ai/twilio-sendgrid-email-send', ['邮件发送', 'Twilio Sendgrid Email Send：通过 SendGrid v3 Mail Send API 发送事务或批量邮件，支持动态模板、个性化、定时与取消、附件和沙箱模式。', ['发送事务邮件或批量邮件', '使用动态模板与个性化收件人', '安排、取消或沙箱测试邮件']]],
  ['twilio/ai/twilio-sendgrid-email-settings', ['邮件模板与追踪', 'Twilio Sendgrid Email Settings：配置 SendGrid Handlebars 动态模板、打开与点击追踪、退订、品牌链接及 HTML、纯文本和 AMP 内容。', ['创建或修改动态邮件模板', '配置打开、点击与退订追踪', '设置品牌链接和多种内容类型']]],
  ['bankai-skills/superpowers/agent-browser', ['浏览器自动化', 'Agent Browser：通过 inference.sh 为 Agent 提供网页导航、元素引用交互、截图、录像、表单填写、拖放、上传、数据提取与 JavaScript 执行。', ['自动导航并操作网页', '抓取数据或填写表单', '记录截图、视频与浏览器测试证据']]],
  ['cline/skills/session-report', ['Agent 使用分析', 'Session Report：从 Claude Code 项目会话转录中生成可探索 HTML 报告，分析 Token、缓存、子 Agent、Skill 与高成本提示词。', ['分析 Claude Code 会话用量', '查看缓存与子 Agent 使用', '定位高成本提示词并生成 HTML 报告']]],
  ['dceoy/speckit-agent-skills/claude-command-converter', ['Skill 迁移与标准化', 'Claude Command Converter：把 .claude/commands 中的 Claude Code 命令转换为标准 Agent Skill，便于跨 AI 运行时迁移和统一命令定义。', ['将 Slash Command 迁移为 Agent Skill', '从现有命令生成 SKILL.md', '统一不同 AI 运行时的命令定义']]],
  ['dceoy/speckit-agent-skills/speckit-analyze', ['规格一致性审查', 'Speckit Analyze：在任务生成后，以非破坏方式检查 spec.md、plan.md 与 tasks.md 的一致性和质量。', ['检查规格、计划与任务是否一致', '发现任务生成后的缺口', '在实施前审查文档质量']]],
  ['dceoy/speckit-agent-skills/speckit-clarify', ['需求澄清', 'Speckit Clarify：识别当前功能规格中定义不足的部分，提出最多五个聚焦问题并把答案写回规格。', ['发现规格中的模糊点', '提出少量高价值澄清问题', '将确认结果更新到功能规格']]],
  ['dceoy/speckit-agent-skills/speckit-constitution', ['项目原则与治理', 'Speckit Constitution：根据交互式回答或已有原则创建、更新项目宪章。', ['建立项目工程原则', '更新团队约束与治理规则', '把已确认原则写入项目宪章']]],
  ['dceoy/speckit-agent-skills/speckit-converge', ['规格驱动开发', 'Speckit Converge：对照功能规格、计划与任务评估当前代码库，并把尚未实现的工作追加到 tasks.md。', ['检查实现是否覆盖功能规格', '识别剩余未构建工作', '补充 tasks.md 供后续完成']]],
  ['dceoy/speckit-agent-skills/speckit-implement', ['规格驱动开发', 'Speckit Implement：按 tasks.md 中定义的全部任务执行实现计划。', ['依据任务清单实施功能', '逐项处理计划中的开发任务', '跟踪规格驱动实现进度']]],
  ['android/skills/agp-9-upgrade', ['Android 构建与迁移', 'Agp 9 Upgrade：将 Android 项目升级或迁移到 Android Gradle Plugin 9，不适用于 Kotlin Multiplatform 项目。', ['升级 Android Gradle Plugin 到 9', '处理 Android 构建迁移问题', '确认项目不属于 KMP 范围']]],
  ['anthropics/knowledge-work-plugins/customer-health', ['客户成功与续约', 'Customer Health：评估客户关系强度、参与趋势、风险信号与已交付价值，并准备可用于 QBR 的议程。', ['检查客户账户健康度', '准备季度业务回顾', '识别客户流失风险与价值证据']]],
  ['anthropics/knowledge-work-plugins/deal-signals', ['销售管道监测', 'Deal Signals：监测交易沉寂、预计成交日期临近、Champion 变化、续约窗口和竞品提及，并汇总为可行动提醒。', ['发现停滞或延期交易', '跟踪客户联系人和竞品信号', '生成每日交易风险摘要']]],
  ['anthropics/knowledge-work-plugins/proposal-builder', ['提案与报价', 'Proposal Builder：把访谈记录、照片、RFP、图纸或笔记整理为带品牌、价格的提案、报价、估算或 SOW，并可衔接签署和定金开票。', ['根据现场资料生成报价', '响应 RFP 或编写 SOW', '基于模板和历史价格制作 DOCX/PDF 提案']]],
  ['anthropics/knowledge-work-plugins/renewal-radar', ['客户成功与续约', 'Renewal Radar：整理即将到期的续约时间、风险和提价空间，并维护对应的续约机会记录。', ['查看即将到期的续约', '评估账户续约风险', '准备续约沟通和上调方案']]],
  ['anthropics/knowledge-work-plugins/team-pipeline', ['销售管道管理', 'Team Pipeline：按销售代表和阶段汇总团队管道，标记高风险交易并识别辅导机会。', ['查看团队销售管道', '准备预测与管道评审', '发现需要辅导的销售机会']]],
  ['crontap/skills/crontap-uptime-monitor', ['可用性监控', 'Crontap Uptime Monitor：创建和运维 Crontap HTTP 可用性监控，调整失败阈值、部署期间暂停检查并查看探测证据。', ['为 HTTP 端点配置在线监控', '设置宕机与恢复提醒', '在部署期间暂停并复查探测结果']]],
  ['evilmartians/agent-skills/good-readme', ['开源项目文档', 'Good Readme：为开源库、框架或工具创建、重写、审查和润色 README 与入门说明，不用于内部文档或 API 参考。', ['编写开源项目 README', '改善项目介绍与快速开始', '审查文档对潜在用户的清晰度']]],
  ['google/skills/dpop-adoption', ['OAuth 与身份安全', 'Dpop Adoption：在 WebCrypto、Node.js ES6 或浏览器运行时实现和排查 OAuth 2.0 DPoP 刷新令牌发送方约束，包括 P-256 密钥、Proof JWT 与 nonce 重试。', ['为 Google OAuth 接入 DPoP', '生成授权码交换和刷新用 Proof JWT', '排查 use_dpop_nonce 重试流程']]],
  ['google/skills/google-cloud-filestore-auditing', ['云存储安全与可靠性', 'Google Cloud Filestore Auditing：跨项目审计 Filestore 的备份新鲜度、NFS 导出权限、ROOT_SQUASH 与物理区域隔离或分离状态。', ['检查 Filestore 灾备准备度', '审计 NFS 暴露与访问权限', '验证区域故障域合规']]],
  ['google/skills/iam-helper-for-policy-management', ['身份与访问管理', 'Iam Helper For Policy Management：创建、修改、列出和删除 Resource Manager 或单项资源上的 IAM Allow v1 与 Deny v2 策略。', ['管理组织、文件夹和项目 IAM 策略', '维护资源级 Allow 或 Deny 规则', '列出并更新访问控制配置']]],
  ['liatrio-labs/spec-driven-workflow/sdd', ['规格驱动开发', 'Sdd：在用户明确调用时执行 Liatrio Spec-Driven Development 工作流；公开说明明确不应自动触发。', ['在明确请求时启动 SDD 流程', '按规格驱动方式推进开发', '遵守仅显式调用的适用边界']]],
  ['lightrun-platform/lightrun-ai/lightrun-error-remediation-automation', ['运行时诊断与修复', 'Lightrun Error Remediation Automation：使用 Lightrun MCP 工具执行带预检、恢复续接和证据优先诊断的确定性运行时调查，并优先以 PR 提交修复建议。', ['调查生产运行时错误', '按证据定位根因', '准备可审查的修复提案']]],
  ['metabase/agent-skills/rde', ['能力待核对', 'Rde：skills.sh 公开说明仅表示它是可安装的 AI Agent Skill，未提供可审校的具体能力和适用边界。', ['核对 skills.sh 后续公开说明', '确认来源仓库中的 RDE 含义', '在能力明确后再评估用途']]],
  ['microsoft/power-platform-skills/add-ai-webapi', ['Power Platform 与生成式 AI', 'Add Ai Webapi：在 Power Pages SPA 中集成预览版搜索摘要与数据摘要 API，为 Dataverse 记录或列表生成摘要和关键洞察。', ['为 Power Pages 记录页添加 AI 摘要', '生成列表或搜索结果概览', '配置服务代码与 AI 站点设置']]],
  ['microsoft/power-platform-skills/add-pen-input', ['Power Apps 原生输入', 'Add Pen Input：供 add-native 工作流调用，在 Power Apps 中通过原生 Pen Input 组件实现笔迹、签名、绘图和手写采集。', ['在 Power Apps 中采集签名', '实现笔迹或绘图输入', '为原生输入工作流接入 Pen Input']]],
  ['microsoft/power-platform-skills/debug-extension', ['Power Platform 扩展调试', 'Debug Extension：诊断已构建第三方 .ppmplugin 控件的崩溃、无响应、PCF 错误或异常行为，并从清单、移动模块、PCF 分发与构建配置中定位证据。', ['排查 .ppmplugin 控件故障', '定位 Android、iOS 或 PCF 契约问题', '经确认后实施最小修复并复验清单']]],
  ['microsoft/skills-for-fabric/e2e-fabric-cost-estimation', ['云成本与容量规划', 'E2e Fabric Cost Estimation：在迁移前分析 Spark、SQL、Power BI 与 Real-Time 工作负载，建议 Fabric 容量 SKU 并比较预留、按需和自动扩缩计费。', ['估算 Fabric 迁移前容量成本', '为混合工作负载选择 SKU', '比较不同容量计费方式']]],
  ['microsoft/skills-for-fabric/onelake-catalog-govern-cli', ['数据目录治理', 'Onelake Catalog Govern Cli：通过 Fabric Admin、Core 与 Power BI REST API 审计和受控修复 OneLake 目录的域、工作区、容量、标签、描述、刷新与项目身份。', ['审计 OneLake 目录健康度', '治理域和工作区归属', '受控修复标签、描述与刷新问题']]],
  ['microsoft/vscode/chat-pet-sprite-creation', ['像素动画与宠物素材', 'Chat Pet Sprite Creation：创建或修改 VS Code Chat Pet 的精灵图、状态动画、眼睛处理、Stable/Insiders 变体与状态转场。', ['制作 Chat Pet 精灵图', '编辑宠物状态动画', '维护 Stable 与 Insiders 视觉变体']]],
  ['microsoft/vscode/customizations-in-the-agent-host', ['Agent 宿主与扩展架构', 'Customizations In The Agent Host：处理 VS Code Agent Host 中插件、MCP Server、Agent、Skill 与指令的发现、发布、启停状态及 Provider SDK 交接问题。', ['调试自定义能力发现与启停', '修复 UI 与实际启用状态不一致', '排查禁用插件或 MCP 仍进入模型的问题']]],
  ['microsoft/vscode/ux-css-layout', ['VS Code 界面开发', 'Ux Css Layout：应用 VS Code 的 CSS 约定、文件组织、类命名、标准尺寸、SplitView/Grid、滚动区域、响应式布局与文本省略模式。', ['编写 VS Code CSS 与布局', '修复文本截断和滚动问题', '实现 SplitView 或 Grid 响应式结构']]],
  ['microsoft/vscode/ux-theming', ['VS Code 主题与无障碍', 'Ux Theming：使用 VS Code 主题颜色令牌、Widget 样式、焦点指示和高对比主题支持来设计界面。', ['注册并使用主题颜色', '统一 Widget 主题样式', '检查焦点和高对比兼容性']]],
  ['mtgvim/tiger-kit/tk-domain', ['领域术语与决策记录', 'Tk Domain：建立或更新仓库专有术语，并用精简 ADR 记录难以回退、反直觉且存在真实权衡的决策，不用于一般实现说明。', ['维护项目领域词汇', '记录高代价架构决策', '在决策缺乏上下文时补充精简 ADR']]],
  ['mulesoft/mulesoft-dx/build-mule-integration', ['MuleSoft 集成开发', 'Build Mule Integration：为 Mule Flow、Sub-flow、组件、错误处理、DataWeave、连接器和路由器等创建或修改工作提供专用流程。', ['创建或修改 Mule 集成流程', '调整 DataWeave 与连接器', '修复路由、重试或错误处理']]],
  ['mulesoft/mulesoft-dx/execute-mule-run-config', ['MuleSoft 运行与调试', 'Execute Mule Run Config：按公开说明在明确要求时运行、启动或调试 Mule 应用或项目。', ['运行指定 Mule 项目', '启动全部 Mule 应用', '以调试模式执行 Mule 项目']]],
  ['obra/clank/commenting-intent', ['代码规范与可维护性', 'Commenting Intent：要求代码注释解释存在原因和非显而易见的决策，而不是复述代码机制。', ['审查注释是否说明意图', '为关键权衡补充原因', '删除只重复代码行为的注释']]],
  ['obra/clank/validating-inputs', ['输入验证与安全', 'Validating Inputs：检查所有外部输入的有效性，拒绝无效数据进入后续处理。', ['为 API 或表单增加输入验证', '在边界处拒绝无效数据', '审查外部输入处理链路']]],
  ['obra/superpowers-lab/windows-vm', ['虚拟化与测试环境', 'Windows Vm：创建、管理或连接运行于 Docker 且支持 SSH 的无头 Windows 11 虚拟机。', ['启动或停止 Windows 测试 VM', '通过 SSH 连接无头虚拟机', '为 Windows 场景准备隔离环境']]],
  ['obra/superpowers-skills/collision-zone-thinking', ['创意问题求解', 'Collision Zone Thinking：强制把不相关概念并置，以发现新的联系和涌现属性。', ['为问题探索反常类比', '从跨领域组合产生创意', '突破单一路径的方案思考']]],
  ['obra/superpowers-skills/requesting-code-review', ['代码审查协作', 'Requesting Code Review：把实现按计划或需求交给代码审查 Agent 复核后再继续。', ['在实施完成后请求代码审查', '核对结果是否符合计划', '根据评审意见决定后续动作']]],
  ['obra/superpowers-skills/verification-before-completion', ['验证与质量门禁', 'Verification Before Completion：在宣称完成前运行验证命令并检查实际输出。', ['交付前运行测试或检查', '确认命令结果支持完成结论', '避免未经验证的成功声明']]],
  ['onewave-ai/claude-skills/font-pairing-suggester', ['字体与排版设计', 'Font Pairing Suggester：按使用场景推荐字体组合，提供高级字体的 Google Fonts 替代方案和层级示例。', ['为品牌或界面选择字体搭配', '寻找可用的 Google Fonts 替代', '建立标题与正文字体层级']]],
  ['pbakaus/agent-reviews/resolve-reviews', ['Pull Request 评审协作', 'Resolve Reviews：处理当前 PR 中未回复的人类与机器人评论，修复有效问题、说明误报并逐条回复结果。', ['汇总未解决 PR 评论', '修复真实评审问题', '解释误报并回复每条评论']]],
  ['remotion-dev/remotion/add-bug', ['Remotion 维护', 'Add Bug：按受影响的 Remotion 版本把新缺陷记录加入 packages/bugs/api 对应版本文件。', ['登记 Remotion 已知缺陷', '标注受影响版本', '维护 Bugs API 数据']]],
  ['remotion-dev/remotion/convert', ['Remotion 开发工具', 'Convert：启动本地 @remotion/convert 应用并在 Codex 浏览器中打开，用于检查 Convert 包界面。', ['本地启动 convert.remotion.dev', '打开并检查 Convert UI', '调试 @remotion/convert 包']]],
  ['remotion-dev/remotion/studio', ['Remotion 开发工具', 'Studio：从 packages/example 启动 Remotion Studio 并在 Codex 浏览器中打开。', ['启动示例 Remotion Studio', '本地预览 Studio 界面', '为 Remotion 开发准备 UI']]],
  ['rohitg00/pro-workflow/cost-tracker', ['Agent 成本与预算', 'Cost Tracker：跟踪会话成本、设置预算提醒并分析 Token 支出优化机会。', ['查看会话中途成本', '设置预算阈值提醒', '分析和优化 Token 消耗']]],
  ['rohitg00/pro-workflow/skill-optimizer', ['Skill 评测与优化', 'Skill Optimizer：将累积的纠正规则作为训练轨迹，为 SKILL.md 提出有限补丁，并用历史纠正构建的留出验证集筛选确有改进的候选。', ['用历史纠正优化 Skill', '比较候选补丁的验证得分', '仅发布通过留出评测的改进']]],
  ['sakohovaguimian/skillet/ios-conversational-planning-grill-me', ['iOS 规划与决策', 'Ios Conversational Planning Grill Me：在明确请求时结合平台与仓库约束，通过对话式追问制定 iOS 变更实施计划。', ['规划 iOS 功能或架构调整', '通过决策访谈澄清约束', '生成可实施的 iOS 计划']]],
  ['sakohovaguimian/skillet/swift-sako-semantic-linter', ['Swift 语义审查', 'Swift Sako Semantic Linter：在明确审查请求或授权工作流中，根据本地 Sako、Rune 与 Grimoire 约定审查指定 Swift 变更。', ['执行 Swift 语义规范审查', '检查本地框架约定', '在审查模式下仅报告问题不修改']]],
  ['sakohovaguimian/skillet/ubiquitous-components', ['UI 组件目录', 'Ubiquitous Components：按来源证据生成或刷新 Rune 与应用 UI 组件目录，并在授权时共享发布。', ['创建共享 UI 组件目录', '刷新 Rune 和应用组件索引', '在授权后发布目录']]],
  ['travisjneuman/.claude/ui-animation', ['界面动效', 'Ui Animation：为 Web 或移动界面设计微交互、页面转场、加载状态和其他 UI 动画。', ['设计按钮与控件微交互', '制作页面与状态转场', '建立加载和反馈动画']]],
  ['vercel-labs/json-render/tanstack-start', ['TanStack Start 与 JSON UI', 'Tanstack Start：使用 @json-render/tanstack-start 构建 JSON 定义的 TanStack Start 应用，覆盖路由规格、Splat、SSR Loader、Head 元数据、布局和客户端导航。', ['构建 JSON 驱动的 Start 路由', '配置 SSR 数据加载和 Head', '实现布局与客户端导航']]],
  ['vishalsachdev/claude-skills/microsim-p5', ['交互式教育可视化', 'Microsim P5：用 p5.js 创建带绘图区与交互控件的教育 MicroSim，并生成 docs/sims 目录结构、iframe 页面和 Dublin Core 元数据。', ['制作交互式教学模拟', '用 p5.js 构建绘图与控件区域', '生成可嵌入文档的 MicroSim']]],
  ['volcengine/volcengine-skills/volcengine-db-supabase', ['数据库与 BaaS 运维', 'Volcengine Db Supabase：管理火山引擎运营的 Supabase 版 AIDAP，包括工作区、分支、算力、SQL、模式、认证、实时、函数、存储、Pages、密钥和连接信息。', ['管理火山引擎 AIDAP 资源', '执行 SQL 与模式变更', '配置认证、存储、函数和静态站点']]],
  ['volcengine/volcengine-skills/volcengine-feedback', ['产品反馈与协作', 'Volcengine Feedback：帮助起草并在授权后向 volcengine-skills 提交 Skill 问题、缺失能力、云场景或成功 Agent 工作流反馈。', ['整理火山引擎 Skill 反馈', '记录缺失能力或成功案例', '经授权后提交公开反馈']]],
  ['volcengine/volcengine-skills/volcengine-knowledge-search', ['云产品文档检索', 'Volcengine Knowledge Search：使用 ve docs search 和 fetch 检索火山引擎官方文档全文，回答产品概念、用法、计费、部署、最佳实践和条款问题。', ['搜索火山引擎官方文档', '读取指定文档链接正文', '核对产品用法、计费与部署说明']]],
  ['uizze.sh/ui-taste', ['设计与前端', 'Ui Taste：skills.sh 当前未提供可审校的公开说明；具体设计方法、输入输出与适用范围暂无法确认。', ['持续核对 skills.sh 详情页是否补充说明', '确认具体设计方法与适用界面类型', '在取得公开说明后再评估用途']]],
  ['okou-ai/vm0-skills/hackernews', ['资讯与社区数据', 'Hackernews：通过 Hacker News API 查询新闻故事与评论，面向 Hacker News、HN、Y Combinator 或科技新闻相关请求。', ['查询 Hacker News 热门故事', '读取指定故事的评论讨论', '整理科技新闻与社区观点']]],
  ['mastra-ai/skills/mastra-factory', ['Agent 平台运维', 'Mastra Factory：通过 mastra api factory 查看和管理 Factory 的状态、队列、项目、工作项、指标、健康度、决策与主管会话。', ['汇总 Factory 状态与任务队列', '检查项目、工作项和健康指标', '在用户授权下操作托管或自托管 Factory']]],
  ['open-mercato/skills/om-brainstorm', ['产品规划与决策', 'Om Brainstorm：在产出规格或工单前通过逐项开放问题探索方案，也考虑不构建的选择，最终形成路由决策与后续交接简报。', ['判断一个想法是否值得实现', '比较多个方案与不构建选项', '为规格编写或工单准备交接简报']]],
  ['open-mercato/skills/om-create-skill', ['Skill 开发与维护', 'Om Create Skill：根据简报创建新的 OM Skill，或把过大的 SKILL.md 保守拆分为分层 references，并通过 lint 与完整性门禁。', ['根据简报创建 OM Skill', '把大型 Skill 拆分为分层参考文件', '按 OM 约定检查 lint 与完整性']]],
  ['open-mercato/skills/om-followup-issue-from-pr', ['代码审查与协作', 'Om Followup Issue From Pr：从 Pull Request 或评论链接提取可执行事项并创建后续 Issue；若 PR 新增设计文档，则补建缺失的实现跟踪 Issue。', ['把 PR 评论转为后续 Issue', '为设计文档创建实现跟踪项', '将 Issue 指派给提及用户或 PR 作者']]],
  ['open-mercato/skills/om-merge-buddy', ['代码审查与协作', 'Om Merge Buddy：扫描开放 Pull Request，依据标签、评审、CI 与可合并状态判断当前可合并项和接近完成但仍受阻的项。', ['列出当前可合并的 PR', '识别被评审或 CI 阻塞的 PR', '汇总接近合并的变更']]],
  ['open-mercato/skills/om-close-fixed-issues', ['项目与协作', 'Om Close Fixed Issues：依据 fixes、closes、resolves 或 closingIssuesReferences 关闭已由合并 PR 明确修复的 Issue，并对未合并或非主分支合并情况留下说明。', ['清理已由合并 PR 修复的 Issue', '为未合并 PR 关联的 Issue 留言', '执行发布前的 Issue 收尾']]],
  ['checklist-design/skills/checklist-design', ['设计评审', 'Checklist Design：依据 Checklist Design 的公开检查清单逐项审计界面，或从层级、布局、排版、色彩、可访问性、交互与完成度给出快速设计批评。', ['审查网页或移动应用截图', '按指定清单检查界面完整性', '评估可访问性、布局与交互质量']]],
  ['nomadamas/k-skill/multi-asset-morning-briefing', ['金融与市场数据', 'Multi Asset Morning Briefing：联结全球股票、利率、外汇、商品、波动率及其对韩国市场的传导，生成带证据链接的七段式多资产晨报。', ['生成隔夜多资产市场晨报', '复核现有 Morning Call 内容', '分析全球市场对韩国市场的传导']]],
  ['qianwen-ai/apsara-conference-2026/yunqi-agent-attendance', ['会议与活动', 'Yunqi Agent Attendance：管理云栖大会会议订阅，并在会前、会中和会后提供直播引导、摘要领取、追问与总结。', ['创建或取消会议订阅', '查询订阅列表与统计', '领取、追问和总结会后摘要']]],
  ['qianwen-ai/apsara-conference-2026/yunqi-agent-discovery', ['会议与活动', 'Yunqi Agent Discovery：查询云栖大会议程、展览与参会指南，推荐或比较会议和展商，并辅助规划参会路线。', ['查询大会议程和展览信息', '比较会议、展商或展台', '规划交通、住宿、餐饮与参会路线']]],
  ['vercel-labs/konsistent/konsistent-config', ['TypeScript 工程规范', 'Konsistent Config：创建或修改 konsistent.json，为 TypeScript 代码库约束目录结构、文件命名、导入导出、必需文件与缩略词大小写映射。', ['配置 TypeScript 结构一致性规则', '排查 konsistent 违规报告', '维护命名与缩略词大小写映射']]],
  ['xcrrr/claude-skills/dataset-curator', ['数据集设计与治理', 'Dataset Curator：为模型训练与评测设计、清洗、去重和记录数据集，覆盖模式、类别不平衡与训练验证测试划分。', ['设计训练或评测数据集模式', '清洗和去重样本', '处理类别平衡与数据划分']]],
  ['xcrrr/claude-skills/debugger', ['调试与根因分析', 'Debugger：跟踪代码缺陷、解释错误信息并诊断异常行为，不用于正常代码审查或新功能设计。', ['定位代码报错根因', '分析崩溃或异常行为', '提出并验证调试假设']]],
  ['xcrrr/claude-skills/eval-designer', ['LLM 评测设计', 'Eval Designer：设计衡量 LLM 质量、安全、准确性或对齐度的测试集、人工评审量表、自动评测与指标。', ['建立 LLM 评测框架', '设计人工或自动评测', '定义质量、安全和准确性指标']]],
  ['xcrrr/claude-skills/market-researcher', ['市场研究', 'Market Researcher：开展市场规模、竞品、客户调查与受众细分，并把证据综合为市场洞察。', ['估算 TAM、SAM 与 SOM', '分析竞争格局', '设计客户调查和受众分群']]],
  ['xcrrr/claude-skills/prompt-engineer', ['提示词工程', 'Prompt Engineer：设计、迭代和优化 LLM 提示词，覆盖零样本、少样本、角色提示、结构化输出与提示链。', ['优化任务提示词', '设计少样本与结构化输出', '组织多步骤提示链']]],
  ['okou-ai/okou-skills/hackernews', ['资讯与社区数据', 'Hackernews：通过 Hacker News API 查询故事与评论，适用于 Hacker News、HN、Y Combinator 或科技新闻相关请求。', ['查询 Hacker News 热门故事', '读取指定故事的评论', '整理科技新闻与社区讨论']]],
  ['caffeinelabs/skills/connector-x', ['社交平台集成', 'Connector X：指导 Caffeine Canister 通过 x-client、X API v2 与 OAuth 2.0 PKCE 代表用户发帖，避免直接手写不安全的 HTTP 调用。', ['为 Caffeine 应用接入 X 发帖', '配置每用户 OAuth 2.0 PKCE', '检查 Canister 的 X API 调用方式']]],
  ['cypress-io/ai-toolkit/cypress-tap', ['测试与质量', 'Cypress Tap：驱动正在运行的 Cypress open 会话重跑测试、读取结果与命令日志，并检查或回退被测应用的 DOM、无障碍树、样式和快照。', ['调试 Cypress E2E 或组件测试', '发现选择器并检查失败日志', '在无 GUI 操作下验证测试行为']]],
  ['google/skills/gke-node-notready', ['云原生故障排查', 'Gke Node Notready：检查节点条件、事件、kubelet/containerd 日志与指标，诊断 GKE 节点 NotReady 或 Unknown，并提出安全修复建议。', ['排查 GKE 节点 NotReady', '分析 kubelet 与 containerd 日志', '处理节点健康导致的 Pod 驱逐或 Pending']]],
  ['egonex-ai/understand-anything/understand-figma', ['设计资产分析', 'Understand Figma：通过 Figma REST API 分析文件，并生成包含页面、画面、组件、实例和设计令牌的交互式设计知识图谱。', ['梳理 Figma 文件结构', '盘点组件、实例与设计令牌', '生成设计知识图谱仪表盘']]],
  ['iart-ai/web-animation-skills/micro-interaction', ['界面动效', 'Micro Interaction：使用 Framer Motion 与现代 CSS 为悬停、按压、开关、Toast、抽屉、列表重排和共享元素转场制作界面反馈动效。', ['制作按钮与开关反馈', '实现 Toast、抽屉或模态转场', '为列表增删和重排添加动画']]],
  ['open-mercato/skills/om-review-prs', ['代码审查与协作', 'Om Review Prs：按最新优先顺序审查尚未评审的开放 Pull Request，并遵守进行中任务的认领锁。', ['批量审查未评审 PR', '按新旧顺序处理开放变更', '避免与已认领审查任务冲突']]],
  ['coralogix/cx-cli/cx-infra', ['基础设施可观测性', 'Cx Infra：通过 Coralogix cx infra CLI 发现资源类型、列出受监控基础设施，并查询单项资源的健康历史和原始数据。', ['盘点 Coralogix 监控资源', '查询资源健康变化', '按服务或环境筛选基础设施']]],
  ['owl-listener/designer-skills/critique-color', ['色彩与可访问性', 'Critique Color：审查单个已渲染界面的对比度、调色板一致性与颜色语义；不替代产品级 WCAG 审计或色彩系统设计。', ['检查界面颜色对比度', '评估调色板是否协调', '审查状态颜色的语义一致性']]],
  ['k-dense-ai/scientific-agent-skills/bids', ['科研数据管理', 'Bids：组织、查询、校验和转换 Brain Imaging Data Structure 数据，覆盖 MRI、EEG、MEG、PET 等神经科学与生物医学模态。', ['把 DICOM 转换为 BIDS', '校验 BIDS 数据集合规性', '编写元数据 sidecar 与衍生数据']]],
  ['halt-catch-fire/mutiny/agent-browser', ['浏览器自动化', 'Agent Browser：通过 inference.sh 完成网页导航、元素引用交互、截图录像、表单填写、拖放、上传、数据提取和 JavaScript 执行。', ['自动浏览并操作网页', '抓取数据或填写表单', '记录截图、视频与测试证据']]],
  ['halt-catch-fire/mutiny/web-search', ['网页搜索与研究', 'Web Search：通过 inference.sh 调用 Tavily 与 Exa 完成网页搜索、内容提取和直接问答，用于研究、事实核对与 RAG。', ['执行 AI 网页搜索', '提取网页正文与答案', '为研究或 RAG 汇总来源']]],
  ['apidojo-io/apidojo-skills/extracting-tiktok-comments-for-research', ['社交舆情研究', 'Extracting Tiktok Comments For Research：通过 Apify 上的 apidojo TikTok Comments 抓取器提取视频或创作者评论，并整理文本、点赞、回复和时间戳用于研究。', ['采集 TikTok 评论数据集', '分析受众情绪和反馈', '查找热门评论与社区关注点']]],
  ['aws/agent-toolkit-for-aws/aws-well-architected-review', ['云架构评审', 'Aws Well Architected Review：依据 AWS Well-Architected Framework 审查代码、IaC 与配置，生成带最佳实践编号证据和优先整改建议的跨支柱评估。', ['执行完整或快速 WA 评审', '按支柱或 Lens 评估工作负载', '生成成熟度评分与整改清单']]],
  ['docs.stripe.com/metronome', ['能力待核对', 'Metronome：skills.sh 当前未提供可审校的公开说明；具体能力、输入输出与适用范围暂无法确认。', ['持续核对 skills.sh 公开说明', '确认来源页面所指的 Metronome 能力', '在能力明确后再评估用途']]],
  ['docs.stripe.com/stripe-pay', ['能力待核对', 'Stripe Pay：skills.sh 当前未提供可审校的公开说明；具体支付能力、输入输出与适用范围暂无法确认。', ['持续核对 skills.sh 公开说明', '确认来源页面所指的支付能力', '在能力明确后再评估用途']]],
  ['google/skills/bigquery-observability', ['数据仓库可观测性', 'Bigquery Observability：为 BigQuery 遥测检索提供工具选择与高效查询方法，覆盖 INFORMATION_SCHEMA、Cloud Monitoring 和 REST API。', ['查询 BigQuery 作业与槽位遥测', '分析并发、排队与容量利用率', '审计计算和存储计费用量']]],
  ['google/skills/bigquery-slot-cost-optimizer', ['数据仓库成本优化', 'Bigquery Slot Cost Optimizer：使用 INFORMATION_SCHEMA 分析 BigQuery 槽位消耗、查询成本和执行瓶颈。', ['诊断槽位饥饿与慢查询', '定位高额按需查询成本', '发现未分区扫描和连接性能问题']]],
  ['iuliandita/skills/databases', ['数据库工程', 'Databases：设计模式、调优查询、实施迁移并管理 PostgreSQL、MySQL/MariaDB、MongoDB、MSSQL、Redis 与 Valkey。', ['设计关系型或文档数据库模式', '优化查询和索引', '规划数据库迁移与运维']]],
  ['mbfinotti/sales-skills/cold-email-deliverability', ['邮件送达与合规', 'Cold Email Deliverability：审查冷邮件正文与发送配置中的 SPF、DKIM、DMARC、发件信誉、退信风险、退订机制和区域合规，不用于规避垃圾邮件过滤。', ['诊断邮件未进入收件箱', '检查域名认证与发件信誉', '审查冷邮件送达和合规风险']]],
  ['mbfinotti/sales-skills/cold-email-subject-line-tester', ['销售邮件优化', 'Cold Email Subject Line Tester：生成、评分并拆分测试邮件主题行，提供角度差异化变体、量化评分卡和带样本量及决策指标的测试计划。', ['优化冷邮件主题行', '设计邮件主题 A/B 测试', '检查主题行垃圾词风险']]],
  ['mbfinotti/sales-skills/negotiation-concession-planner', ['销售谈判', 'Negotiation Concession Planner：为定价或合同谈判建立让步计划，衡量各杠杆成本与客户价值，并为每次让步绑定对等交换、审批级别和 BATNA 退出线。', ['规划折扣与合同让步', '设计 give-get 交换条件', '确定审批层级和谈判底线']]],
  ['mbfinotti/sales-skills/sales-meeting-recap', ['销售协作', 'Sales Meeting Recap：把销售通话笔记整理为复盘邮件与共同执行计划，为每项行动标明负责人、日期和交付物，并避免虚构客户承诺。', ['撰写销售会议跟进邮件', '整理带负责人和日期的下一步', '建立共同成交行动计划']]],
  ['mbfinotti/sales-skills/sales-objection-handling', ['销售谈判', 'Sales Objection Handling：诊断销售异议背后的真实约束，编写可口述的回应脚本，并在价格、时机、竞品、权限或信任障碍不可解时明确停止推进。', ['回应价格或预算异议', '处理竞品、时机和信任阻力', '判断异议可解决还是交易应终止']]],
  ['superfuture/design-review/design-review', ['设计评审', 'Design Review：对 URL、截图或组件文件执行按优先级排序的 UI 评审，覆盖层级、排版、间距、色彩、动效、状态、响应式、可访问性和品牌一致性。', ['审查页面或组件设计质量', '识别上线前的阻塞与打磨项', '为每项问题给出具体修复建议']]],
  ['unity-technologies/skills/physics-3d-collision', ['Unity 物理调试', 'Physics 3d Collision：诊断基于 MonoBehaviour 的 Unity 3D PhysX 碰撞、触发器、射线、刚体和 MeshCollider 问题。', ['排查碰撞或触发事件不触发', '诊断物体穿透与射线漏检', '检查刚体、力和 MeshCollider 规则']]],
  ['unity-technologies/skills/tilemap-ruletile-createfromsegment', ['Unity 2D 开发', 'Tilemap Ruletile Createfromsegment：根据现有地形或边缘精灵及 3×3 邻域模式生成 Unity RuleTile TilingRules，并按规则具体程度排序。', ['从精灵分析创建 RuleTile', '把 3×3 文本模式转换为邻域规则', '配置自动拼接的 Tilemap 地形']]],
  ['uizze.sh/ios-design', ['能力待核对', 'Ios Design：skills.sh 当前未提供可审校的公开说明；具体 iOS 设计方法、输入输出与适用范围暂无法确认。', ['持续核对 skills.sh 公开说明', '确认其覆盖的 iOS 设计任务', '在能力明确后再评估用途']]],
  ['getsentry/mobilebuildmcp/xcodebuildmcp', ['Apple 平台开发', 'Xcodebuildmcp：通过 XcodeBuildMCP 支持 iOS、macOS、watchOS、tvOS 与 visionOS 项目的构建、测试、运行、调试、日志和 UI 自动化。', ['构建和测试 Apple 平台项目', '运行调试并查看日志', '执行应用 UI 自动化']]],
  ['rohitg00/ai-engineering-from-scratch/learn-mcp', ['MCP 学习与工程', 'Learn Mcp：以逐课互动方式教授 MCP 客户端、服务器、传输、网关、注册表、安全、调试与一致性验证，并记录学习证据。', ['学习构建 MCP 客户端或服务器', '练习 MCP 安全与调试', '记录协议交互和验证证据']]],
  ['rohitg00/ai-engineering-from-scratch/learn-agent-skills', ['Skill 学习与工程', 'Learn Agent Skills：以逐课互动方式教授 Agent Skill 的创建、发现、调用、安全、评测、打包与移植，并记录学习证据。', ['学习创建和打包 Agent Skill', '练习 Skill 安全与评测', '记录学习过程与验证证据']]],
  ['microsoft/azure-skills/discover-azure-skills', ['Azure Skill 发现', 'Discover Azure Skills：按 Azure 或 Microsoft 云任务匹配技能目录元数据并推荐相关 Agent Skill；公开说明同时限定仅在现有 Skill 或工具无法覆盖时使用。', ['按 Azure 任务检索相关 Skill', '比较目录元数据与适用范围', '确认现有能力无法覆盖的缺口']]],
  ['nvidia/skills/nvmolkit-usage', ['计算化学开发', 'Nvmolkit Usage：用于编写或调试 nvMolKit Python 代码，覆盖 GPU 加速的 RDKit 指纹、相似性、构象、聚类与分子搜索。', ['实现 GPU 分子指纹计算', '调试相似性与构象流程', '执行分子聚类和搜索']]],
  ['nvidia/model-optimizer/speculative-decoding', ['能力待核对', 'Speculative Decoding：公开说明仅表明其与推测解码相关，未提供可审校的具体流程、输入输出或支持范围。', ['持续核对来源公开说明', '确认支持的模型与优化流程', '在能力明确后再评估用途']]],
  ['nvidia/skills/msa-structure-prediction-pipeline', ['蛋白质结构预测', 'Msa Structure Prediction Pipeline：串联 NVIDIA BioNeMo MSA-Search 与 OpenFold3，以 MSA 进化信息完成蛋白质结构预测；公开说明提示托管 API 会传输序列与比对数据。', ['检索蛋白质 MSA 比对', '执行 MSA 辅助结构预测', '为敏感序列评估本地 NIM 部署']]],
  ['nvidia/skills/openfold2-nim', ['蛋白质结构预测', 'Openfold2 Nim：使用 NVIDIA BioNeMo OpenFold2 NIM 进行单体蛋白质序列到结构预测，支持 A3M MSA、mmCIF 模板、托管 API 或本地容器部署。', ['预测单体蛋白质结构', '结合 A3M 与模板输入', '选择托管 API 或本地部署']]],
  ['nvidia/warp/warp-changelog-audit', ['发布工程', 'Warp Changelog Audit：审计和恢复 Warp changelog 片段、完成发布变更日志，并把已打标签版本同步回主分支。', ['审计 Warp 变更片段', '完成发布变更日志', '同步标签发布到主分支']]],
  ['nvidia/warp/warp-release-audit', ['发布工程', 'Warp Release Audit：依据 Towncrier 片段与发布历史生成 Warp 预发布或候选版本审计报告。', ['审计预发布变更内容', '生成候选版本报告', '核对 Towncrier 片段与历史']]],
  ['nvidia/warp/warp-release-notes', ['发布工程', 'Warp Release Notes：依据 Towncrier 片段或最终标签变更日志，为 Warp 功能或修复版本起草 GitHub Release Notes。', ['起草 Warp GitHub 发布说明', '汇总功能与修复片段', '从最终 changelog 生成版本摘要']]],
  ['apidojo-io/apidojo-skills/finding-healthcare-practices-via-google-search', ['医疗机构线索研究', 'Finding Healthcare Practices Via Google Search：通过 Apify 上的 apidojo Google Search Scraper 查找指定地区的诊所、牙科、医生、医院等机构，并返回名称、网站与搜索摘要。', ['按城市查找医疗机构', '建立医疗行业外联名单', '整理机构网站和搜索摘要']]],
  ['arjun988/blender-skills/scene-assembly', ['Blender 场景制作', 'Scene Assembly：通过 MCP 组织 Blender 大型场景的集合、链接、覆盖、流式加载结构与布景装配。', ['组织大型 Blender 场景', '管理集合、链接与覆盖', '搭建便于流式加载的布景']]],
  ['buildbuddy-io/buildbuddy/remote-run-curl', ['Bazel 远程执行', 'Remote Run Curl：在 BuildBuddy 远程 Runner 中执行 bazel build、bazel test 或 bazel run。', ['远程执行 Bazel 构建', '远程运行 Bazel 测试', '在 Runner 中启动 Bazel 目标']]],
  ['buildbuddy-io/buildbuddy/view-build-logs', ['Bazel 构建诊断', 'View Build Logs：按 BuildBuddy invocation ID 或 URL 获取调用日志，用于检查和调试 Bazel 构建。', ['读取指定 BuildBuddy 调用日志', '诊断 Bazel 构建失败', '按 invocation URL 核对执行记录']]],
  ['cline/skills/ui5-typescript-conversion', ['UI5 与 TypeScript', 'Ui5 Typescript Conversion：将 SAPUI5 或 OpenUI5 项目转换为 TypeScript。', ['迁移 UI5 JavaScript 项目', '为 UI5 代码引入 TypeScript', '规划 OpenUI5 类型化改造']]],
  ['eachlabs/skills/real-estate-photo-generation', ['能力待核对', 'Real Estate Photo Generation：公开说明仅表明其与房地产照片生成相关，未提供可审校的生成流程、输入要求或质量边界。', ['持续核对来源公开说明', '确认支持的房地产图像任务', '在输入输出明确后再评估用途']]],
  ['getcargohq/cargo-skills/cargo-project', ['Cargo 工作区即代码', 'Cargo Project：以 TypeScript 声明 Cargo 工作区中的连接器、模型、Play、工具、Agent、MCP、分群与应用，并通过 cargo-ai project 完成初始化、计划和部署。', ['把 Cargo 工作区纳入版本控制', '规划和部署工作区配置', '在 CI 中复现多环境工作区']]],
  ['heygen-com/hyperframes-community-skills/day-in-my-life', ['程序化视频', 'Day In My Life：从本地 Claude Code 历史提取经隐私筛选的真实会话素材，制作 60–75 秒手绘墨线 Agent 日常影片并配合时间轴作曲。', ['把典型 Agent 会话制作成短片', '从真实消息组织章节与旁白', '渲染手绘动画并执行质量检查']]],
  ['heygen-com/hyperframes-community-skills/duo', ['程序化视频', 'Duo：把两个 HTML 屏幕合成到固定的折叠手机双屏照片模板中，用于制作应用对比、前后对比或双屏竞速视频。', ['制作两个应用的双屏对比', '生成前后变化短视频', '把 HTML 内容放入固定屏幕槽位']]],
  ['heygen-com/hyperframes-community-skills/p5-paint-animation', ['程序化动画', 'P5 Paint Animation：用 p5.js 把文字、照片或视频转为手写、笔触重绘和逐帧绘画动画，不依赖图像生成模型。', ['制作手写文字写入动画', '把照片重绘为笔触动画', '逐帧处理短视频或 Live Photo']]],
  ['heygen-com/hyperframes-community-skills/prod-by-claude', ['程序化音乐视频', 'Prod By Claude：为 Strudel 实时代码音乐制作 HyperFrames 视频，让代码 Token 随音符点亮，并覆盖离线录音、方形视频编排与片头片尾。', ['制作 Strudel 实时代码音乐视频', '让代码高亮与音符同步', '渲染 1080×1080 音乐短片']]],
  ['heygen-com/hyperframes-community-skills/session-story', ['程序化视频', 'Session Story：用用户真实会话消息制作水彩动画短片，以纸飞机、卡通锤和蝴蝶呈现请求、纠正与表扬，并配制原创管弦乐。', ['把一次典型会话改编成动画', '用真实消息组织故事节奏', '制作水彩画面与同步配乐']]],
  ['heygen-com/hyperframes-community-skills/vox-explainer', ['解释型视频', 'Vox Explainer：基于隐而易见的主题或用户提供的资料，制作 60–90 秒拼贴式 HyperFrames 解释视频，覆盖研究、脚本、静态设计确认、配音、动效与质量门禁。', ['把文档或链接改编成解释视频', '制作历史或现象型短片', '协调脚本、配音与连续动效']]],
  ['heygen-com/hyperframes-community-skills/x-posting-license', ['社交媒体视频', 'X Posting License：把 X 账号资料填入固定的“发帖执照”卡片模板，生成包含计数动画、3D 翻转、签名与退场动作的 10.3 秒视频。', ['为 X 账号制作执照卡短片', '展示粉丝、关注与发帖计数', '渲染固定模板的社交视频']]],
  ['okooo5km/jev/jev', ['文本分类与路由', 'Jev：通过 jev CLI 对文本或 JSON 返回低成本的类型化判断，包括是非概率、标签选择或序数评分，适合批量分类、筛选、路由和预过滤。', ['批量分类邮件、反馈或日志', '为流水线提供概率或标签', '在昂贵模型前执行低成本预筛']]],
  ['stahura/domo-ai-vibe-rules/ai-service-layer', ['Domo AI 开发', 'Ai Service Layer：为 Domo Toolkit 的 AIClient 提供生成、Text-to-SQL 与响应解析模式。', ['在 Domo 应用中调用 AIClient', '实现 Text-to-SQL', '解析和校验 AI 响应']]],
  ['stahura/domo-ai-vibe-rules/app-studio-build', ['Domo 应用开发', 'App Studio Build：通过 community-domo-cli 编排 Domo App Studio 应用创建、页面、主题、指标、图表、筛选、布局与导航。', ['构建 Domo App Studio 应用', '配置 KPI、图表与筛选卡', '组装页面布局和导航']]],
  ['stahura/domo-ai-vibe-rules/appdb', ['Domo AppDB', 'Appdb：使用 Domo Toolkit 处理 AppDB 文档增删改查、查询操作符与集合接线。', ['读写 AppDB 文档', '构建 AppDB 查询', '把集合接入 Domo 应用']]],
  ['stahura/domo-ai-vibe-rules/appdb-collection-create', ['Domo AppDB', 'Appdb Collection Create：通过 CLI 创建 AppDB 集合及其所需数据存储，并返回集合标识供 manifest 与后续写入使用。', ['初始化 AppDB 存储', '创建集合并取得标识', '为 manifest 和文档写入接线']]],
  ['stahura/domo-ai-vibe-rules/basic-custom-app-build', ['Domo 应用开发', 'Basic Custom App Build：从零构建或接管 Domo 自定义应用，编排 manifest、数据、UI 与发布阶段并按平台实践规范化项目。', ['新建 Domo 自定义应用', '接管并规范化现有应用', '跟踪数据、界面与发布进度']]],
  ['stahura/domo-ai-vibe-rules/basic-custom-app-build-w-video', ['Domo 应用与演示视频', 'Basic Custom App Build W Video：构建带 Remotion 兼容样式和示例数据的 Domo 应用，并生成 10–15 秒演示视频。', ['构建 Domo 自定义应用', '生成应用示例数据', '自动制作短时长演示视频']]],
  ['stahura/domo-ai-vibe-rules/beast-mode-creation', ['Domo 数据建模', 'Beast Mode Creation：创建并验证 Domo Beast Mode 计算字段，覆盖 MySQL 风格公式、API 校验以及卡片与数据集作用域。', ['编写 Beast Mode 公式', '校验计算字段', '区分卡片与数据集作用域']]],
  ['stahura/domo-ai-vibe-rules/card-creation', ['Domo 可视化', 'Card Creation：通过 community-domo-cli 管理 Domo KPI 卡片，覆盖请求结构、列映射、Beast Mode、图表类型与常见问题。', ['创建或更新 KPI 卡片', '配置列映射和图表类型', '把 Beast Mode 接入卡片']]],
  ['stahura/domo-ai-vibe-rules/code-engine', ['Domo Code Engine', 'Code Engine：从 Domo 应用通过 domo.post 调用 Code Engine 函数，并遵守 packagesMapping 输入输出契约。', ['从应用调用 Code Engine', '配置 packagesMapping', '校验函数输入输出契约']]],
  ['stahura/domo-ai-vibe-rules/code-engine-create', ['Domo Code Engine', 'Code Engine Create：通过 CLI 创建 Domo Code Engine 包或版本，映射函数参数类型，并指导 manifest packagesMapping 后续接线。', ['创建 Code Engine 包', '映射函数参数数据类型', '更新 manifest 包映射']]],
  ['stahura/domo-ai-vibe-rules/code-engine-update', ['Domo Code Engine', 'Code Engine Update：通过 CLI 的版本化生命周期更新 Code Engine 包，检查兼容性与数据类型契约，并同步 manifest 映射漂移。', ['更新 Code Engine 包版本', '检查接口兼容性', '同步 manifest 映射']]],
  ['stahura/domo-ai-vibe-rules/community-cli-howto', ['Domo CLI', 'Community Cli Howto：说明本仓库 community-domo-cli 的安装、认证、端点测试与故障排查。', ['配置 community-domo-cli', '验证认证和端点', '排查 CLI 使用问题']]],
  ['stahura/domo-ai-vibe-rules/connector-dev', ['Domo 连接器开发', 'Connector Dev：指导在 Domo Connector Dev Studio 中编写自定义连接器 JavaScript，覆盖认证、分页、回写、列一致性与说明文档。', ['开发 Domo 自定义连接器', '实现认证和 API 分页', '检查回写与列结构一致性']]],
  ['stahura/domo-ai-vibe-rules/da-cli', ['Domo CLI', 'Da Cli：提供 DA CLI 的脚手架、代码生成与 manifest 实例高级用法。', ['用 DA CLI 生成脚手架', '生成 Domo 应用资源', '管理 manifest 实例']]],
  ['stahura/domo-ai-vibe-rules/data-api', ['Domo 数据访问', 'Data Api：作为 Domo 数据访问入口，将具体查询工作路由到 dataset-query。', ['选择 Domo 数据访问路径', '把查询任务交给 dataset-query', '统一数据访问入口']]],
  ['stahura/domo-ai-vibe-rules/data-upload-java-cli', ['Domo 数据上传', 'Data Upload Java Cli：使用 domoutil.jar 将 CSV 上传到 Domo，支持模式推导和分块上传，作为 JSON connector 不适用时的替代。', ['上传 CSV 到 Domo', '推导数据集模式', '执行大文件分块上传']]],
  ['stahura/domo-ai-vibe-rules/dataset-query', ['能力待核对', 'Dataset Query：公开说明仅给出名称，未提供可审校的 Domo 数据集查询流程、输入输出或支持范围。', ['持续核对来源公开说明', '确认支持的查询方式与返回结构', '在能力明确后再评估用途']]],
  ['stahura/domo-ai-vibe-rules/domo-app-theme', ['Domo 界面设计', 'Domo App Theme：为 Domo 自定义应用提供专业仪表盘主题，包含 CSS 变量、布局、排版、OKLCH 色板、阴影、圆角与微交互。', ['统一 Domo 应用主题', '配置仪表盘色彩与排版', '优化阴影、圆角和微交互']]],
  ['stahura/domo-ai-vibe-rules/domo-data-generator', ['Domo 测试数据', 'Domo Data Generator：生成并上传 Domo 演示或测试数据，支持滚动日期、实体池、连接器图标、目录管理与新增数据集定义。', ['生成 Domo 示例数据集', '上传测试数据到 Domo', '维护数据生成目录和定义']]],
  ['stahura/domo-ai-vibe-rules/domo-js', ['Domo 前端开发', 'Domo Js：使用 ryuu.js（domo.js）API 处理环境、事件、导航和数据调用。', ['读取 Domo 应用环境', '处理应用事件与导航', '从前端调用 Domo 数据']]],
  ['stahura/domo-ai-vibe-rules/edit-embed', ['Domo 嵌入式编辑', 'Edit Embed：配置 Domo 嵌入式编辑体验，覆盖 Identity Broker、JWT、角色权限、实例映射与编辑 URL，让外部用户创建、编辑、保存和共享内容。', ['为外部用户开放嵌入式编辑', '配置 JWT 与角色访问', '生成和映射编辑 URL']]],
  ['stahura/domo-ai-vibe-rules/embed-portal', ['Domo 客户门户', 'Embed Portal：构建带登录、用户管理、数据隔离和 Domo Embed 的外部客户门户，用于品牌化或多租户分析访问。', ['为客户提供仪表盘登录', '实现按用户数据隔离', '构建白标 Domo 分析门户']]],
  ['stahura/domo-ai-vibe-rules/fileset-api', ['Domo 文件服务', 'Fileset Api：在 Domo 自定义应用中通过 /api/files/v1/ 实现 FileSet 上传、下载、搜索、管理与 AI 文档查询。', ['构建文件上传和下载', '列出与管理 FileSet 内容', '实现文档问答或文件浏览器']]],
  ['stahura/domo-ai-vibe-rules/fileset-cli', ['Domo 文件服务', 'Fileset Cli：通过 community-domo-cli 创建、发现、浏览、上传、下载和查询 Domo FileSet。', ['从 CLI 管理 FileSet', '上传或拉取二进制文件', '对文件内容执行 AI 查询']]],
  ['stahura/domo-ai-vibe-rules/jsapi-filters', ['Domo 嵌入式分析', 'Jsapi Filters：从宿主页通过 JS API MessagePort 对嵌入式 Domo 仪表盘或卡片应用运行时筛选，并处理钻取、监听、尺寸和 App Studio 数据。', ['从宿主页动态筛选嵌入内容', '监听筛选和钻取事件', '调整 iframe 与 App Studio 数据']]],
  ['stahura/domo-ai-vibe-rules/json-no-code-connector', ['Domo 数据连接', 'Json No Code Connector：通过 Domo Product API 管理 JSON 无代码连接器的账户、数据流与执行，把 REST/JSON API 数据接入 Domo。', ['配置 JSON 无代码连接器', '管理账户与数据流', '运行 REST 数据摄取任务']]],
  ['stahura/domo-ai-vibe-rules/magic-etl', ['Domo 数据工程', 'Magic Etl：通过 API 与 CLI 创建、更新和执行 Magic ETL 数据流，覆盖 DAG 定义、输入转换输出、连接与运行生命周期。', ['创建 Magic ETL 数据流', '配置转换、连接与输出节点', '执行并跟踪数据流运行']]],
  ['stahura/domo-ai-vibe-rules/magic-etl-cli', ['Domo 数据工程', 'Magic Etl Cli：通过 community-domo-cli 端到端列出、读取、创建、更新、运行和检查 Magic ETL 数据流。', ['从 CLI 管理 Magic ETL', '编辑 JSON DAG 与转换', '查看数据流执行状态']]],
  ['stahura/domo-ai-vibe-rules/manifest', ['Domo 应用配置', 'Manifest：配置 Domo manifest 中的数据集、工作流、集合和 Code Engine packagesMapping 映射。', ['配置数据集与工作流映射', '接线 AppDB 集合', '维护 Code Engine 包契约']]],
  ['stahura/domo-ai-vibe-rules/migrate-lovable', ['Domo 应用迁移', 'Migrate Lovable：把依赖 SSR 的 Lovable 或 v0 应用转换为仅客户端运行的 Domo 应用。', ['迁移 Lovable 应用到 Domo', '移除 SSR 依赖', '适配 Domo 客户端运行环境']]],
  ['stahura/domo-ai-vibe-rules/performance', ['Domo 性能优化', 'Performance：为 Domo 查询形状、聚合策略与载荷最小化提供性能规则。', ['优化查询形状', '选择高效聚合策略', '减少接口返回载荷']]],
  ['stahura/domo-ai-vibe-rules/programmatic-filters', ['Domo 数据权限', 'Programmatic Filters：在生成嵌入 Token 时通过服务端筛选与数据集重定向控制不同用户、角色或租户可见的数据。', ['实现按查看者的数据限制', '配置 SQL 与标准筛选', '为多租户映射不同数据集']]],
  ['stahura/domo-ai-vibe-rules/publish', ['Domo 应用发布', 'Publish：使用 dist 工作流构建和发布 Domo 应用，并处理首次发布时的应用 ID。', ['构建 Domo 应用发布包', '执行首次发布', '处理发布 ID 与后续更新']]],
  ['stahura/domo-ai-vibe-rules/sql-query', ['Domo SQL 查询', 'Sql Query：使用 SqlClient 对已映射的数据集别名执行原始 SQL，并安全解析列式响应。', ['查询映射的数据集', '执行原始 SQL', '解析列式 SQL 返回']]],
  ['stahura/domo-ai-vibe-rules/toolkit', ['Domo Toolkit', 'Toolkit：说明 Domo Toolkit 中 AIClient、AppDBClient、WorkflowClient 与 CodeEngineClient 的使用。', ['选择和配置 Toolkit 客户端', '访问 AI 与 AppDB 能力', '调用工作流和 Code Engine']]],
  ['stahura/domo-ai-vibe-rules/variable-creation', ['Domo 可视化', 'Variable Creation：创建和管理 Domo 卡片变量，覆盖下拉、滑块、药丸控件、函数模板、控件注册与保存流程。', ['创建卡片筛选变量', '配置下拉与滑块控件', '注册控件并保存卡片']]],
  ['stahura/domo-ai-vibe-rules/workspaces', ['Domo 工作区管理', 'Workspaces：通过公开说明所述的 Domo Workspace REST API，用 curl 与开发者 Token 添加、移除、列出和搜索工作区内容。', ['列出和搜索 Workspace 内容', '添加或移除工作区项目', '用 API 管理 Workspace']]],
  ['uxuiprinciples/agent-skills/uxui-evaluator', ['UX/UI 评审', 'Uxui Evaluator：依据 195 条研究支持的 UX/UI 原则评估界面描述，输出含严重程度、修复建议与业务影响的结构化问题。', ['审查界面描述的 UX/UI 风险', '按严重程度整理问题', '生成修复建议与业务影响说明']]],
  ['mbfinotti/revops-skills/sales-pipeline-hygiene', ['销售管道管理', 'Sales Pipeline Hygiene：按细分市场的阶段中位数审计停滞交易、反复推迟的成交日期、缺失字段和未记录触达，输出异常处置与整改计划。', ['在 QBR 前清理销售管道', '识别停滞或反复延期的交易', '生成逐笔异常处置和整改清单']]],
  ['mbfinotti/revops-skills/revops-kickoff', ['Revenue Operations', 'Revops Kickoff：在 RevOps 或 Sales Ops 项目开始与周期复盘时，把任务路由到一个匹配 Skill，并建立或恢复共享的版本化上下文。', ['启动新的 RevOps 项目', '为运营任务选择匹配 Skill', '恢复长期项目的共享上下文']]],
  ['mbfinotti/revops-skills/sales-forecast-diagnostic', ['销售预测', 'Sales Forecast Diagnostic：诊断销售预测失真的数据、行为和真实需求原因，覆盖阶段虚高、sandbagging、成交日期批量后移、僵尸商机和经理覆盖。', ['解释销售预测失准原因', '区分数据质量与销售行为问题', '制定预测可信度整改方案']]],
  ['mbfinotti/revops-skills/revops-hiring', ['招聘与人才', 'Revops Hiring：为 RevOps 或 Sales Ops 岗位生成职级与类型决策、结果记分卡、面试题库、工作样例评分表和 30-60-90 天上手计划。', ['设计 RevOps 招聘流程', '编写面试题与评分锚点', '制定新员工 30-60-90 天计划']]],
  ['mbfinotti/revops-skills/revenue-kpi-framework', ['Revenue Operations', 'Revenue Kpi Framework：设计从董事会到一线岗位的收入 KPI 体系，以可核对的指标树连接公式、责任人、护栏指标、公司阶段与商业模式。', ['建立收入 KPI 指标树', '明确各层级指标负责人', '为核心指标配置护栏指标']]],
  ['mbfinotti/revops-skills/revops-career', ['职业发展', 'Revops Career：从候选人视角评估 RevOps 或 Sales Ops 职业层级、能力差距与隐性工作证据，并准备常见面试练习和薪酬主张。', ['规划 RevOps 职业路径', '准备 RevOps 面试练习', '整理可证明运营影响的证据']]],
  ['mbfinotti/revops-skills/crm-data-governance', ['CRM 数据治理', 'Crm Data Governance：建立 CRM 字段字典、字段责任人、权威系统、写入优先级、冲突规则、数据新鲜度 SLA 与字段生命周期。', ['治理 CRM 自定义字段', '明确逐字段系统记录源', '处理跨系统字段冲突和过期数据']]],
  ['mbfinotti/revops-skills/revenue-leakage', ['收入漏损分析', 'Revenue Leakage：追踪单一漏斗中未记录步骤、未跟进线索、人工交接、流程停滞、计费或续约遗漏，并以可追回收入而非毛额估算损失。', ['定位漏斗中的收入流失点', '区分真实漏损与正常淘汰', '估算可追回收入并安排修复']]],
  ['mbfinotti/revops-skills/revenue-funnel', ['收入漏斗设计', 'Revenue Funnel：从零设计收入漏斗的阶段、分析单位、规划或预测用途、队列转化假设，以及营销、销售和客户成功之间的责任交接。', ['设计 B2B 或高考虑度 B2C 漏斗', '定义阶段与转化假设', '明确营销到销售的交接']]],
  ['mbfinotti/revops-skills/pipeline-stage-definition-audit', ['销售管道管理', 'Pipeline Stage Definition Audit：用可由买方行为验证的里程碑审计现有销售阶段，并结合阶段停留、转化衰减、跳阶段和成交日期推迟指标识别问题。', ['审计销售阶段退出标准', '识别以销售动作命名的虚假阶段', '分析阶段停滞和转化衰减']]],
  ['mbfinotti/revops-skills/revops-radar', ['行业情报', 'Revops Radar：建立经过活跃性核验、受时间预算约束的 RevOps 信息源清单，覆盖播客、通讯、社区、活动和从业者，并设计周期刷新流程。', ['筛选 RevOps 播客和通讯', '规划社区与行业活动关注清单', '定期复核信息源活跃性']]],
  ['mbfinotti/revops-skills/revenue-data-governance-strategy', ['收入数据治理', 'Revenue Data Governance Strategy：制定组织级收入数据政策，为账户、联系人、商机、订阅、使用事件和收入指标指定权威系统、数据契约与争议仲裁责任。', ['解决跨部门收入数字不一致', '为对象类型指定权威系统', '建立收入数据契约与治理责任']]],
  ['mbfinotti/revops-skills/customer-churn-signals', ['客户流失分析', 'Customer Churn Signals：从账户活动、产品使用和支持数据中定义、验证并排序流失先导信号，记录阈值、窗口、基线、提升度、提前量和覆盖率。', ['发现客户流失先导指标', '建立流失信号登记表', '验证信号相对基准流失率的提升']]],
  ['mbfinotti/revops-skills/customer-health-score', ['客户健康度', 'Customer Health Score：把产品使用和互动信号组合为带权重、归一化、衰减与分层的账户健康分，并用真实流失结果回测和校准。', ['设计客户健康评分', '识别流失风险与扩张机会', '用历史流失结果校准分数']]],
  ['mbfinotti/revops-skills/lead-routing', ['线索分配', 'Lead Routing：设计入站线索分配的规则优先级、线索到账户匹配、区域与命名账户规则、轮询方式、兜底队列、SLA 升级及安全发布。', ['设计线索分配规则', '配置轮询与容量路由', '处理未分配线索和 SLA 超时']]],
  ['mbfinotti/revops-skills/sales-to-cs-handoff', ['客户交接', 'Sales To Cs Handoff：设计成交后从销售到客户成功的数据包、触发条件、时间 SLA、启动会议及 CS 接受或退回步骤。', ['规范 closed-won 后的客户交接', '定义销售交接数据包', '设置 CS 接受和退回机制']]],
  ['mbfinotti/revops-skills/lead-scoring', ['线索评分', 'Lead Scoring：设计、验证和重校线索评分模型，覆盖匹配度、互动、负分与排除、衰减、MQL/PQL 阈值、分层及成交结果回测。', ['设计 MQL 或 PQL 评分', '诊断失效的线索评分模型', '用成交结果回测评分阈值']]],
  ['mbfinotti/revops-skills/revops-stack-rationalization', ['GTM 技术栈治理', 'Revops Stack Rationalization：按收入工作流审查完整 RevOps/GTM 工具栈，识别功能重叠并逐项决定保留、合并、替换或削减。', ['盘点销售与营销工具栈', '识别 SaaS 重复和成本浪费', '制定续约驱动的整合计划']]],
  ['mbfinotti/revops-skills/revenue-reporting', ['收入报告', 'Revenue Reporting：定义高管或董事会收入报告的稳定指标骨架、锁定口径和围绕计划与实际差异的结论先行叙事。', ['设计董事会收入报告', '锁定收入指标定义', '解释计划与实际差异']]],
  ['mbfinotti/revops-skills/deal-desk-approval', ['交易审批', 'Deal Desk Approval：为非标准 B2B SaaS 交易设计分级折扣审批、授权矩阵与例外处理，覆盖价格、付款条款、服务、法律和产品承诺。', ['设计 deal desk 审批链', '设置折扣与条款授权级别', '处理非标准交易例外']]],
  ['mirage-hq/tesseract/tesseract-video', ['视频编辑', 'Tesseract Video：在本地用 Tesseract 将现有素材剪辑为成片，保留对白、设计声音与混音，并按需要加入原生动效场景或叠加层。', ['剪辑现有视频素材', '混合对白、音乐与音效', '加入动效场景和图形叠加']]],
  ['mirage-hq/tesseract/tesseract-motion', ['动态图形', 'Tesseract Motion：在本地 Tesseract 中创建可编辑的全屏动画、动态排版、图解、下三分之一字幕和视频叠加层。', ['制作可编辑动态图形', '创建动态排版和图解', '为视频设计字幕条与叠加层']]],
  ['code.deepline.com/deepline-research', ['能力待核对', 'Deepline Research：skills.sh 当前未提供可审校的公开说明，无法确认其研究范围、资料来源、输入输出或适用边界。', ['持续核对 skills.sh 公开说明', '确认研究范围与来源要求', '在能力边界明确后再评估用途']]],
  ['cline/skills/exa-search', ['网页搜索与研究', 'Exa Search：使用 Exa 进行多轮深度检索，适用于线索生成、文献综述、竞品分析和需要超越单次搜索的研究问题。', ['执行多轮深度网页研究', '开展文献或竞品检索', '为线索生成收集公开资料']]],
  ['backnotprop/pstack/architect', ['软件架构', 'Architect：在实现前先草拟类型、函数签名和模块结构，并在编码过程中持续校正非平凡改动的架构方向。', ['为复杂功能设计模块结构', '在编码前确定类型与接口', '在实现过程中复核架构']]],
  ['backnotprop/pstack/automate-me', ['个人工作流自动化', 'Automate Me：把用户的偏好或工作方式整理为个人 mode Skill，并支持创建、更新或刷新这些可复用规则。', ['把个人偏好沉淀为 Skill', '更新现有 mode Skill', '让 Agent 复用用户工作方式']]],
  ['backnotprop/pstack/create-verification-skill', ['验证工程', 'Create Verification Skill：为当前项目生成本地验证 Skill，以真实用户操作方式驱动应用，并适配项目所用语言、框架或平台。', ['为仓库建立验证流程', '生成面向用户路径的控制 Skill', '统一项目变更的验收方法']]],
  ['backnotprop/pstack/figure-it-out', ['复杂任务规划', 'Figure It Out：在没有更窄流程可用时，为大型迁移或多阶段工作设计可审计方案，运行假设循环并记录决策证据。', ['规划大型迁移', '拆解多阶段复杂任务', '建立可复核的决策与证据记录']]],
  ['backnotprop/pstack/no-comments', ['代码审查与重构', 'No Comments：调用公开说明中的 Comment Sicko 审查注释，修复被接受的问题，并为声称存在的约束提出可执行编码方式。', ['审查代码注释质量', '修复已接受的注释问题', '把文字约束转成结构化检查']]],
  ['backnotprop/pstack/principle-encode-lessons-in-structure', ['工程规范', 'Principle Encode Lessons In Structure：当同一指令或纠正反复出现时，把规则编码为 lint、元数据标记、运行时检查或脚本。', ['把重复纠正固化为 lint', '用运行时检查代替重复说明', '将团队经验编码进工程结构']]],
  ['backnotprop/pstack/principle-exhaust-the-design-space', ['设计探索', 'Principle Exhaust The Design Space：面对无先例的界面交互或架构决策时，先制作两到三个竞争原型并并排比较，再作选择。', ['探索新的界面交互', '比较多个架构方案', '用原型降低过早定案风险']]],
  ['backnotprop/pstack/principle-guard-the-context-window', ['Agent 上下文管理', 'Principle Guard The Context Window：在大输出、长文件、重复读取或扇出规划占满上下文时，把批量工作路由到子 Agent，并在主线程保留摘要。', ['控制长任务的上下文占用', '将批量分析分派给子 Agent', '在主线程维护精炼摘要']]],
  ['backnotprop/pstack/principle-migrate-callers-then-delete-legacy-apis', ['API 重构', 'Principle Migrate Callers Then Delete Legacy Apis：引入新内部 API 时，同批迁移调用方并删除旧 API，避免长期保留兼容层。', ['迁移内部 API 调用方', '删除遗留接口', '避免一次性兼容层长期存在']]],
  ['backnotprop/pstack/principle-outcome-oriented-execution', ['软件迁移', 'Principle Outcome Oriented Execution：在分阶段重写或迁移中持续收敛到目标架构，避免为平滑中间状态加入一次性兼容代码。', ['执行计划内重写', '推进分阶段架构迁移', '减少临时兼容实现']]],
  ['backnotprop/pstack/principle-redesign-from-first-principles', ['系统设计', 'Principle Redesign From First Principles：把新需求视为从第一天就存在的基础假设重新设计系统，而不是在现有结构上附加补丁。', ['将新需求融入核心设计', '重构被补丁累积拖累的结构', '从基础假设重新审视方案']]],
  ['backnotprop/pstack/recall', ['工作上下文恢复', 'Recall：从聊天历史、当前状态和共享记录中重建近期工作上下文，并交付紧凑的当前状态简报。', ['恢复中断任务的上下文', '回顾近期项目进展', '生成继续工作所需的状态摘要']]],
  ['backnotprop/pstack/reflect', ['工作复盘', 'Reflect：让三个并行审查子 Agent 复盘当前对话，提炼学习点，并把每项结论路由为现有 Skill 的具体编辑。', ['复盘当前任务过程', '从对话提炼可复用经验', '将经验落实为 Skill 修改']]],
  ['backnotprop/pstack/setup-pstack', ['Agent 配置', 'Setup Pstack：检测可用模型，并按角色与推理预算配置 pstack，写入覆盖默认值的常驻规则。', ['为 pstack 角色选择模型', '配置推理预算', '更新 pstack 模型规则']]],
  ['backnotprop/pstack/show-me-your-work', ['决策审计', 'Show Me Your Work：为长期或无人值守工作维护逐项 TSV 决策记录，包含决策、理由、证据和结果，并可按评审需要提交。', ['记录多阶段任务决策', '为自主执行保留审计轨迹', '向评审者提供可复核证据']]],
  ['google/skills/google-cloud-filestore-nfs-browser', ['Google Cloud 存储', 'Google Cloud Filestore Nfs Browser：无需本地 NFS 客户端或 root 权限，检查、搜索和读取 Google Cloud Filestore 文件及 POSIX 元数据。', ['浏览 Filestore NFS 共享', '搜索并读取远程日志', '检查文件属性和 POSIX 元数据']]],
  ['google/skills/secops-triage', ['安全运营', 'Secops Triage：指导 Google SecOps 安全告警分诊，判断误报与真实事件、评估实体风险、调整优先级并关闭或升级案例。', ['分诊 Google SecOps 告警', '判断误报和真实风险', '调整严重度并升级安全案例']]],
  ['h4ckf0r0day/obscura/obscura', ['浏览器自动化', 'Obscura：操作和验证 JavaScript 页面加载、隐身浏览、反指纹、跟踪器阻断、截图对比、CDP 自动化、录屏、PDF 导出与网页提取。', ['诊断网页渲染和资源故障', '运行 Puppeteer 或 Playwright CDP 自动化', '验证隐身浏览与反指纹表现']]],
  ['ikatkov/agent-skills/record-web-journey', ['浏览器测试证据', 'Record Web Journey：在浏览器主机记录 WebM 视频、每次点击或页面加载后的带标记截图，以及 steps.md 操作日志。', ['录制用户操作流程', '生成逐步截图和点击证据', '为网页演示保留视频与日志']]],
  ['kajisho5/ffmpeg-skill/ffmpeg-skill', ['视频与音频编辑', 'Ffmpeg Skill：用本地 FFmpeg 按自然语言剪切、拼接、重构画幅、调速、加字幕与叠加层、同步音频、标准化响度、调色和导出平台版本。', ['剪辑并转码视频或音频', '制作字幕、标题和平台版式', '处理音频同步、响度与背景音乐']]],
  ['martindelophy/ai-video-editor/edit-timeline-studio', ['视频编辑', 'Edit Timeline Studio：分析视频、图像、语音、运动、产品和网页，并调用本地视觉与音频模型自动剪辑、修复、标注和导出可编辑 Timeline Studio 项目。', ['自动分析和剪辑多媒体素材', '制作可编辑 Timeline Studio 时间线', '执行跟踪、抠像、重构与质量验证']]],
  ['qwencloud/qwencloud-ai/qwencloud-payment', ['云服务计费', 'Qwencloud Payment：管理 QwenCloud 支付方式、绑卡、消费限额和支付状态；不覆盖账单历史、用量或订阅查询。', ['绑定或管理支付卡', '设置消费限额', '检查支付方式状态']]],
  ['qwencloud/qwencloud-deploy/qwencloud-observe', ['云应用可观测性', 'Qwencloud Observe：读取本地部署状态并通过只读云 API 汇总阿里云国际站应用的可用性、ECS/RDS 性能、资源状态和美元成本。', ['检查已部署应用健康度', '分析 ECS 或 RDS 性能', '估算应用月度云成本']]],
  ['qwencloud/qwencloud-deploy/qwencloud-operate', ['云应用运维', 'Qwencloud Operate：诊断 qwencloud-deploy 应用不可用、502、数据库连接或性能问题，并仅在明确确认后逐项执行启动、重启或 Nginx reload。', ['诊断云应用不可用或缓慢', '检查 ECS、RDS 和服务状态', '经确认执行安全恢复并验证']]],
  ['samber/dev-event-organizer-skills/cross-event-promotion', ['技术活动营销', 'Cross Event Promotion：为不同主办方的技术活动设计互推合作，覆盖日历、通讯、社交、票务折扣、讲者资源和会议周共址，并衡量双方交付。', ['安排技术活动互推', '设计票码或内容交换', '评估活动合作方与推广效果']]],
  ['samber/dev-event-organizer-skills/dev-event-hiring', ['活动招聘', 'Dev Event Hiring：为技术活动制作人、经理、协调员或社区经理岗位设计记分卡、职位说明、面试流程、付费小型审计样例和薪酬依据。', ['招聘技术活动运营人员', '设计活动岗位面试流程', '编写工作样例与评分标准']]],
  ['samber/dev-event-organizer-skills/tech-podcast-youtube-channel', ['技术内容运营', 'Tech Podcast Youtube Channel：运营活动主办方的常设播客或视频频道，规划淡季节奏、负责人、嘉宾来源、活动周期联动和停更交接。', ['评估是否运营技术播客', '规划跨届内容节奏与嘉宾', '制定频道交接或关闭方案']]],
  ['xtemos/woodmart-skill/woodmart-mcp', ['WordPress 与电商网站', 'Woodmart Mcp：通过 wood MCP 能力查找或创建内容、编辑 Gutenberg 区块、修改 WoodMart 主题设置和页眉 Logo，并创建或分配布局。', ['编辑 WoodMart 网站内容', '修改 Gutenberg 区块和主题设置', '创建或分配 WoodMart 布局']]],
  ['waynesutton/builder-skills/convex', ['Convex 开发', 'Convex：作为 Convex 开发入口，按任务路由到函数、实时数据、Agent 等专项流程。', ['为 Convex 任务选择对应专项流程', '规划 Convex 应用的开发路径', '在函数、实时数据与 Agent 能力间路由']]],
  ['waynesutton/builder-skills/convex-best-practices', ['Convex 开发', 'Convex Best Practices：总结生产级 Convex 应用的函数组织、查询、校验、TypeScript 与错误处理规范。', ['审查 Convex 项目结构与函数组织', '规范查询、校验和 TypeScript 用法', '检查生产级错误处理']]],
  ['waynesutton/builder-skills/convex-functions', ['Convex 开发', 'Convex Functions：编写 Convex query、mutation、action 与内部函数，包含参数和返回校验、ctx 使用及运行时边界。', ['新增或修改 Convex 导出函数', '在 query、mutation 与 action 间选型', '检查参数校验和错误处理']]],
  ['waynesutton/builder-skills/convex-schema-validator', ['Convex 数据建模', 'Convex Schema Validator：设计 convex/schema.ts 的表、校验器、索引和关系，并在数据演进时保持模式一致。', ['创建或修改 Convex 表结构', '设计索引与数据关系', '排查部署时的 validator 错误']]],
  ['waynesutton/builder-skills/convex-realtime', ['Convex 开发', 'Convex Realtime：构建反应式 Convex 应用，覆盖订阅、乐观更新、缓存行为和基于游标的分页查询。', ['管理 Convex 实时订阅', '实现乐观更新与缓存协同', '构建游标分页加载']]],
  ['waynesutton/builder-skills/convex-cron-jobs', ['后台任务', 'Convex Cron Jobs：为 Convex 后台任务设计间隔和 Cron 调度、运行监控、重试与长时任务策略。', ['配置 Convex 定时任务', '监控后台作业并设计重试', '规划长时运行任务']]],
  ['waynesutton/builder-skills/convex-http-actions', ['API 与 Webhook', 'Convex Http Actions：实现 Convex 外部 API 与 Webhook，覆盖路由、请求响应、身份验证、CORS 和签名校验。', ['在 Convex 中创建 HTTP 端点', '接收并验证 Webhook', '配置身份验证与 CORS']]],
  ['waynesutton/builder-skills/convex-security-check', ['安全与合规', 'Convex Security Check：按清单快速检查 Convex 认证、函数暴露、参数校验、行级权限和环境变量处理。', ['快速审计 Convex 应用安全性', '检查函数暴露与输入校验', '复核行级访问控制和密钥处理']]],
  ['waynesutton/builder-skills/convex-file-storage', ['文件存储', 'Convex File Storage：处理文件上传、URL 提供、Action 产物保存、删除及系统表元数据访问。', ['设计 Convex 文件上传流程', '提供文件 URL 并读取元数据', '存储或删除 Action 生成的文件']]],
  ['waynesutton/builder-skills/convex-migrations', ['数据库迁移', 'Convex Migrations：规划 Convex 模式演进，包括新字段、数据回填、废弃字段移除、索引迁移和零停机策略。', ['为 Convex 表新增字段并回填', '迁移索引或移除废弃字段', '设计零停机数据迁移']]],
  ['waynesutton/builder-skills/convex-security-audit', ['安全与合规', 'Convex Security Audit：深入审查 Convex 授权逻辑、数据访问边界、Action 隔离、限流和敏感操作保护。', ['审查 Convex 授权与数据边界', '检查 Action 隔离和限流', '复核敏感操作的保护措施']]],
  ['bmad-code-org/bmad-method/bmod-core-tools', ['Skill 元数据', 'Bmod Core Tools：skills.sh 公开说明仅将其标记为 bmod 必需元数据，未提供可审校的功能说明。', ['核对 bmod 元数据的目录归属', '等待可审校的公开功能说明', '避免根据名称推断未说明能力']]],
  ['bmad-code-org/bmad-method/bmod-method', ['Skill 元数据', 'Bmod Method：skills.sh 公开说明仅将其标记为 bmod 必需元数据，未提供可审校的功能说明。', ['核对 bmod 元数据的目录归属', '等待可审校的公开功能说明', '避免根据名称推断未说明能力']]],
  ['waynesutton/builder-skills/convex-agents', ['Agent 开发', 'Convex Agents：使用 Convex Agent 组件构建 AI Agent，覆盖线程、工具集成、流式响应、RAG 和工作流编排。', ['构建基于 Convex 的 AI Agent', '管理对话线程与流式响应', '集成工具、RAG 与工作流']]],
  ['waynesutton/builder-skills/avoid-feature-creep', ['需求与范围管理', 'Avoid Feature Creep：识别超出请求的功能、重构和顺手修改，把它们移入建议清单而不是当前差异。', ['防止小型改动扩大范围', '检查 PRD 是否偏离问题定义', '将额外想法移入后续建议清单']]],
  ['mbfinotti/partnerships-skills/partner-tiering', ['伙伴运营', 'Partner Tiering：设计或重构 B2B 合作伙伴计划的分级条件、权益组合、升降级规则、复审节奏与存量迁移。', ['设计注册到高级伙伴的分层', '定义各层资格、权益与升降级', '迁移现有伙伴并安排定期复审']]],
  ['honojs/skills/hono', ['Web 开发', 'Hono：支持 Hono Web 应用的 API、路由、中间件、JSX、校验、测试和流式响应开发。', ['构建 Hono API 与路由', '配置中间件和输入校验', '测试 Hono 应用或实现流式响应']]],
  ['apidojo-io/apidojo-skills/finding-brand-ambassador-candidates', ['网红与品牌营销', 'Finding Brand Ambassador Candidates：利用公开说明列出的 Instagram 与 TikTok 采集器，按品牌提及、互动和亲和信号发现品牌大使候选人。', ['寻找已自发提及品牌的创作者', '筛选有真实品牌亲和的微网红', '构建品牌大使候选管道']]],
  ['apidojo-io/apidojo-skills/finding-tiktok-creators-by-location', ['网红与品牌营销', 'Finding Tiktok Creators By Location：利用公开说明列出的 TikTok Location Scraper，按城市或地理位置发现创作者与内容。', ['按城市寻找 TikTok 创作者', '筛选特定区域的微网红', '为本地化营销整理创作者数据']]],
  ['astrale-os/cli/astrale-domain', ['领域模型与工作流', 'Astrale Domain：创建、修改、测试、迁移或调试 Astrale Domain 的 Schema、Policy、Action/Workflow、集成、View 与 Dataset。', ['新建 Astrale Domain', '修改模式、策略或工作流', '迁移、测试或调试 Domain 部署']]],
  ['hetpatel-11/adobe_premiere_pro_mcp/premiere-pro-mcp', ['视频编辑自动化', 'Premiere Pro Mcp：安装、验证、排障并操作 Adobe Premiere Pro MCP，覆盖媒体导入、序列、时间线、效果和连接问题。', ['配置 Agent 与 Premiere 的 MCP 连接', '导入媒体并构建剪辑时间线', '排查 Premiere MCP 桥接问题']]],
  ['hosmelq/skills/laravel-project-patterns', ['Laravel 开发', 'Laravel Project Patterns：提供 Laravel Model、Enum、Action、FormRequest、Controller、Resource、Policy、Job、Listener 与 Middleware 的实现和 Pest 测试范例。', ['按项目模式实现 Laravel 功能', '为控制器、模型或任务编写 Pest 测试', '统一 Laravel 项目的实现风格']]],
  ['hubspot/agent-cli-skills/conversation-history-brief', ['CRM 与客户沟通', 'Conversation History Brief：拉取 HubSpot CRM 联系人在各收件箱的会话与消息，组装包含渠道、状态、最后活动和摘要的账户简报。', ['汇总 CRM 联系人的跨渠道对话', '生成客户账户简报', '检查会话状态与最后活动']]],
  ['hubspot/agent-cli-skills/conversation-inbox-triage', ['客服与收件箱运营', 'Conversation Inbox Triage：审计和分流 HubSpot 会话收件箱，查找未处理、未分配或长期停滞线程，并分配、归档与汇总。', ['盘点未处理和未分配对话', '把会话分配给团队成员', '批量归档已解决线程并生成状态摘要']]],
  ['hubspot/agent-cli-skills/visitor-identification', ['身份与访客识别', 'Visitor Identification：为已知邮箱的网站访客生成 HubSpot Conversations 访客识别令牌，并说明所需权限、账户版本与前端 SDK 用法。', ['为已知访客生成 HubSpot 识别令牌', '核对账户版本和 API 权限', '在前端集成 Conversations SDK 访客识别']]],
  ['paulklayvc/skills/investor-warm-intros', ['融资与投资人关系', 'Investor Warm Intros：分析目标基金与创始人匹配度，选择组合公司创始人、主题内容、帮助被投企业或顾问引荐路径，并起草实际消息。', ['为融资筛选匹配的 VC 与天使投资人', '规划投资人暖引荐路径', '起草引荐请求、建议咨询或主题内容']]],
  ['pinguapps/skills/implement-task-linear', ['开发与项目协作', 'Implement Task Linear：在当前仓库端到端实现一个 Linear Issue，并在可用时结合其来源规格、计划、领域上下文与 ADR。', ['根据 Linear Issue 实现仓库改动', '结合规格与 ADR 执行任务', '交付并验证单个 Issue 的完整结果']]],
  ['pinguapps/skills/test-changes', ['测试与验证', 'Test Changes：解释如何手动检查和测试当前对话刚完成的改动，需要命令时使用 PowerShell。', ['为已完成改动编写手动测试步骤', '使用 PowerShell 给出验证命令', '说明应检查的用户可见结果']]],
  ['pinguapps/skills/to-linear', ['项目管理', 'To Linear：把计划、规格、关联 Issue 或当前对话拆分为经确认的 Linear 里程碑和可追踪工单，配置依赖、Backlog 状态与聚焦标签。', ['把方案拆分成 Linear 里程碑', '创建可追踪的 tracer-bullet 工单', '设置任务依赖、状态和标签']]],
  ['renezander030/capcut-cli/capcut-edit', ['视频编辑', 'Capcut Edit：读写 CapCut/剪映项目的字幕、时序、速度、音量、模板和动画，并可将长视频切成短片。', ['修改剪映草稿的字幕与时序', '调整速度、音量、模板和动画', '把长视频剪辑为短视频']]],
  ['wshobson/agents/connectivity-triage', ['网络诊断', 'Connectivity Triage：使用内置非破坏性工具排查 macOS 实时连接故障，隔离本地网、DNS、上游路径与远端服务或应用问题。', ['排查 API 或 MCP 超时与断连', '诊断 DNS 解析不一致', '定位视频通话中的丢包或延迟故障域']]],
  ['iart-ai/motion-design-skills/motion-background', ['动态背景设计', 'Motion Background：设计 CSS 网格渐变、Three.js 着色器渐变或 Canvas 粒子星座等循环动态背景，并兼顾 reduced-motion 与性能。', ['制作网页 Hero 动态背景', '实现渐变、极光或粒子背景', '为动画背景补充降级与性能策略']]],
  ['iart-ai/motion-design-skills/after-effects', ['After Effects', 'After Effects：覆盖 AE 表达式与绑定、MOGRT、透明通道和编码导出、性能排障、素材重连、项目整理及 ExtendScript 自动化。', ['编写 AE 表达式和控件绑定', '选择导出编码并处理透明背景', '排查预览卡顿或整理工程素材']]],
  ['open-mercato/skills/om-pipeline-retro', ['流水线复盘', 'Om Pipeline Retro：只读分类已完成的流水线运行，识别单次通过、恢复、循环检查点或原因缺失，并按返工耗时排序。', ['复盘流水线为何变慢', '统计二次处理的时间成本', '把主要返工原因交给后续问题准备流程']]],
  ['emilkowalski/skills/break-ui', ['界面压力测试', 'Break Ui：用超长文本、缺失字段、极端数值、非拉丁文字和表情等最坏数据压力测试界面，并记录破坏点及对应修复。', ['测试组件的极端数据表现', '发现文本溢出和空状态问题', '整理界面边界问题与修复建议']]],
  ['nvidia/elements/agent-dependencies', ['依赖维护', 'Agent Dependencies：在 NVIDIA Elements 单体仓库中执行一次保守的依赖或工具链升级，并在验证后准备聚焦的拉取请求。', ['检查过期依赖与工具版本', '更新第一方 GitHub Actions', '验证单项依赖升级的影响']]],
  ['nvidia/elements/agent-starters', ['脚手架验证', 'Agent Starters：从干净的使用者环境验证稳定版 NVIDIA Elements CLI 支持的全部 starter，调查失败并至多准备一个聚焦修复。', ['定期验证 Elements starter', '排查 starter 可用性失败', '为单一故障准备修复与验证']]],
  ['nvidia/elements/authoring-benchmarks', ['浏览器性能基准', 'Authoring Benchmarks：为 Elements 组件和工具设计、运行与解释浏览器性能基准，覆盖 Vitest bench 指标和性能回退调查。', ['编写或更新浏览器 benchmark', '比较吞吐量、均值和 p99', '调查运行时代码性能回退']]],
  ['nvidia/elements/guidance-webgpu-performance', ['WebGPU 性能', 'Guidance Webgpu Performance：诊断 WebGPU 界面的帧节奏、绘制提交、缓冲上传、着色器及渲染关键路径上的 JavaScript 性能。', ['定位 WebGPU 卡顿与渲染回退', '分析 CPU 与 GPU 瓶颈', '设计资源和时序诊断测试']]],
  ['nvidia/elements/summarize-video-releases', ['发布视频制作', 'Summarize Video Releases：用真实 NVIDIA Elements 组件制作 24–36 秒月度 What’s New 营销视频，并把功能快照加入发布文章。', ['制作月度发布回顾视频', '生成更新日志短片或社交视频', '为发布文章插入功能快照']]],
  ['nvidia/model-optimizer/run-agentx', ['AI 服务基准', 'Run Agentx：使用 SemiAnalysis harness 运行 AgentX 智能体服务基准，覆盖环境准备、数据集下载、并发扫描及延迟与吞吐比较。', ['准备 AgentX 基准环境', '运行并发度扫描', '比较推理服务延迟和吞吐']]],
  ['nvidia/skills/g-assist-mcp-skill', ['GPU 与显示设置', 'G Assist Mcp Skill：检查或更改本机 NVIDIA 显示器与 GPU 设置，包括分辨率、刷新率、V-Sync、G-SYNC、亮度、色彩和性能选项。', ['检查 NVIDIA 显示配置', '调整刷新率或同步选项', '查看和修改 GPU 性能设置']]],
  ['nvidia/skills/paidf-cosmos-predict', ['视频生成', 'Paidf Cosmos Predict：为 DEFT 媒体样本准备并运行 PAIDF Cosmos Predict 视频生成；公开说明未给出更多输入、模型或输出细节。', ['准备 DEFT 媒体样本', '运行 Cosmos Predict 视频生成', '核对生成流程的输入输出边界']]],
  ['affaan-m/ecc/rails-patterns', ['Ruby on Rails 开发', 'Rails Patterns：提供 Rails 7.1+ 与 8.x 应用模式，覆盖瘦控制器、服务与表单对象、ActiveRecord、后台任务、ViewComponent、Hotwire 和 Rails 8 Solid 栈。', ['构建或审查 Rails 应用', '组织控制器、模型与服务对象', '实现后台任务和 Hotwire 界面']]],
  ['denoland/skills/deno', ['Deno 开发', 'Deno：覆盖 Deno 项目的依赖、npm 与 JSR 包、权限、配置与工作区，以及 fmt、lint、test、check、bench、compile 和发布工具链。', ['编写和调试 Deno 项目', '配置依赖、权限与工作区', '运行 Deno 内置检查和发布流程']]],
  ['figma/mcp-server-guide/figma-shaders', ['Figma 着色器', 'Figma Shaders：为在 Figma 中创建或修改 shader effect、shader fill、自定义效果和程序化着色器提供专项流程。', ['创建 Figma 着色器效果', '修改 shader fill 或自定义填充', '迭代程序化视觉效果']]],
  ['namespacelabs/agent-skills/devboxes', ['远程开发环境', 'Devboxes：使用 devbox 或 boxctl 创建、运行、共享和销毁 Namespace 隔离环境，支持远程构建测试、临时 Docker 主机及无人值守任务。', ['创建隔离 Linux 或 macOS 环境', '把构建测试迁移到远程 devbox', '共享临时环境或保持长任务运行']]],
  ['remotion-dev/remotion/experts', ['Remotion 项目维护', 'Experts：维护 Remotion experts 目录及生成资产，覆盖专家增删改、头像、专家卡渲染和首页动画再生成。', ['更新 Remotion 专家资料', '渲染专家卡片', '重新生成 Chrome 与 Safari 首页动画']]],
  ['remotion-dev/remotion/react-scan', ['React 性能分析', 'React Scan：通过仅开发环境 WebMCP 工具采集和分析 Remotion Studio 的 React 渲染剖析，定位多余重渲染与慢提交。', ['诊断 Remotion Studio 重渲染', '分析慢提交和帧响应组件树', '比较优化前后的 React 渲染性能']]],
  ['remotion-dev/remotion/studio-css-reset', ['Remotion 界面样式', 'Studio Css Reset：在 Remotion Studio 的 `.css-reset` 容器内编写不依赖继承重置属性的界面样式。', ['为 Studio 隔离容器编写 CSS', '避免依赖外层 reset 继承', '审查 `.css-reset` 内的样式行为']]],
  ['remotion-dev/remotion/studio-mode', ['Remotion Studio', 'Studio Mode：说明 Remotion Studio 各模式的能力与限制，用于实现或审查交互式、分离式、已部署和浏览器 Studio 中的操作、权限及可用性。', ['判断不同 Studio 模式的功能边界', '审查操作权限与可用性', '实现跨模式一致的 Studio 界面']]],
  ['tabooharmony/roblox-brain/roblox-analytics', ['Roblox 数据分析', 'Roblox Analytics：使用 AnalyticsService 跟踪玩家行为、经济事件和漏斗，并处理事件分类、速率限制与批处理。', ['设计玩家行为事件体系', '跟踪游戏经济和转化漏斗', '处理 AnalyticsService 限流与批量上报']]],
  ['tabooharmony/roblox-brain/roblox-audio', ['Roblox 音频', 'Roblox Audio：实现 Roblox 音频播放、空间声音、音乐、音效、SoundGroup 与动态音频效果。', ['实现空间音频与音乐播放', '组织 SoundGroup', '添加动态音频效果']]],
  ['tabooharmony/roblox-brain/roblox-camera', ['Roblox 相机', 'Roblox Camera：编写 Roblox 相机行为、CFrame 定位、屏幕射线、第一或第三人称视角及过场动画。', ['实现第一或第三人称相机', '制作过场镜头', '用屏幕射线处理相机交互']]],
  ['tabooharmony/roblox-brain/roblox-cloud', ['Roblox 云服务', 'Roblox Cloud：处理 Roblox Open Cloud API、API 密钥、OAuth 2.0、Webhook、权限范围、令牌生命周期和体验内 HttpService 调用。', ['接入 Roblox Open Cloud API', '配置 OAuth、密钥与权限范围', '实现 Webhook 或 HttpService 调用']]],
  ['tabooharmony/roblox-brain/roblox-collaboration-mode', ['Roblox 协作规范', 'Roblox Collaboration Mode：为 Roblox 任务设定主动程度、警告与行动边界，以及需要用户决策的事项；不代表对远程指令的执行授权。', ['明确 Roblox 任务协作边界', '区分可直接处理与需确认事项', '统一任务中的主动性级别']]],
  ['tabooharmony/roblox-brain/roblox-data', ['Roblox 数据持久化', 'Roblox Data：实现玩家数据持久化，覆盖 DataStore、会话所有权、模式、迁移及保存和加载流程。', ['设计玩家存档模式', '处理 DataStore 会话所有权', '实现数据迁移与读写流程']]],
  ['tabooharmony/roblox-brain/roblox-game-design', ['Roblox 游戏设计', 'Roblox Game Design：设计 Roblox 核心循环、新手引导、关卡、经济、留存阶段、反馈表现、玩家类型平衡与减负机制。', ['设计核心玩法和新手引导', '规划经济与留存阶段', '检查重复劳动和玩家类型平衡']]],
  ['tabooharmony/roblox-brain/roblox-gui', ['Roblox 界面', 'Roblox Gui：构建 Roblox 菜单、HUD、商店、通知、对话框及跨平台响应式界面。', ['制作游戏 HUD 与菜单', '实现商店和通知界面', '适配桌面、手柄与触屏布局']]],
  ['tabooharmony/roblox-brain/roblox-input', ['Roblox 输入', 'Roblox Input：处理 Roblox 键盘、鼠标、手柄、触摸、运动输入及跨平台动作绑定。', ['实现多设备输入', '配置跨平台动作绑定', '处理触摸或运动控制']]],
  ['tabooharmony/roblox-brain/roblox-localization', ['Roblox 本地化', 'Roblox Localization：实现多语言、翻译表、自动翻译、地区化内容和区域检测。', ['建立 Roblox 翻译表', '配置自动翻译', '按语言或地区调整内容']]],
  ['tabooharmony/roblox-brain/roblox-luau-core', ['Luau 开发', 'Roblox Luau Core：说明 Luau 语言语义、表、控制流、字符串模式、作用域、闭包及跨语言转换问题。', ['编写基础 Luau 代码', '排查作用域和闭包问题', '处理跨语言语义差异']]],
  ['tabooharmony/roblox-brain/roblox-luau-patterns', ['Luau 工程模式', 'Roblox Luau Patterns：覆盖 Roblox 模块边界、对象生命周期、信号、任务调度、可失败调用和资源清理模式。', ['设计 Luau 模块边界', '管理对象生命周期与信号', '实现调度、错误处理和清理']]],
  ['tabooharmony/roblox-brain/roblox-luau-types', ['Luau 类型系统', 'Roblox Luau Types：覆盖 Luau 注解、泛型、联合类型、类型收窄、严格模式、密封表、模块类型导出、类型化元表和新求解器特性。', ['为 Luau 代码补充类型', '设计泛型与联合类型', '排查严格模式或类型求解问题']]],
  ['tabooharmony/roblox-brain/roblox-player-psychology', ['游戏玩家心理', 'Roblox Player Psychology：设计首分钟体验、奖励节奏、连续奖励、定价、随机与保底以及社区循环等玩家行为机制。', ['优化游戏首分钟体验', '设计奖励、连续签到或保底机制', '评估定价和社区循环']]],
  ['tabooharmony/roblox-brain/roblox-publish-checklist', ['Roblox 发布验证', 'Roblox Publish Checklist：在发布或更新 Roblox 体验前，对实际改动涉及的表面执行基于证据的发布门禁。', ['发布前检查 Roblox 体验', '按改动范围选择验证项', '记录发布门禁证据']]],
  ['tabooharmony/roblox-brain/roblox-tooling', ['Roblox 工程工具', 'Roblox Tooling：配置 Rojo、Wally、Selene、StyLua、Lune、Aftman、luau-lsp 与 CI/CD 等 Roblox 工具链。', ['配置 Roblox 项目工具链', '设置格式化、静态检查和语言服务', '搭建 Roblox CI/CD']]],
  ['kie.ai/kie-models', ['能力待核对', 'Kie Models：skills.sh 当前未提供可审校的公开说明；具体模型、任务范围、输入输出与服务边界暂无法确认。', ['持续核对 skills.sh 公开说明', '确认其支持的模型与任务类型', '在能力明确后再评估用途']]],
  ['zhaoxuya520/reverse-skill/pentest-tools', ['安全测试', 'Pentest Tools：通过公开说明列出的 pentestMCP 或 mcp-security-hub 暴露信息收集、端口与漏洞扫描、Web 测试、目录枚举和密码审计等安全工具。', ['在已授权范围内执行渗透测试', '编排端口、漏洞与 Web 安全扫描', '汇总安全工具的检查结果']]],
  ['anthropics/knowledge-work-plugins/hiring-screener', ['招聘运营', 'Hiring Screener：按职位明确评分标准筛选候选申请、形成排序短名单、起草候选人回复，并为入选者安排面试与入职清单。', ['按职位评分标准筛选简历', '为候选人起草录用或拒绝回复', '安排面试并准备入职交接']]],
  ['anthropics/knowledge-work-plugins/payroll-prep', ['薪资运营', 'Payroll Prep：从 Gusto、QuickBooks Payroll 或上传表格汇总工时、加班与休假，标记漏打卡、工时激增和人员变动等异常，并在人工逐项批准前暂存薪资运行。', ['汇总员工常规、加班与休假工时', '检查漏打卡、费率变化和异常工时', '为负责人准备逐项审批的薪资批次']]],
  ['chrisbanes/skills/android-benchmark-comparison', ['Android 性能基准', 'Android Benchmark Comparison：比较物理 Android 基准配置与测量结果，用于解释排名不一致或从实测数据中选择默认配置。', ['比较 Android 设备或配置基准', '调查性能排名不一致', '依据测量结果选择默认配置']]],
  ['chrisbanes/skills/compose-component-design', ['Jetpack Compose 设计', 'Compose Component Design：设计或审查可复用 Jetpack Compose 组件 API，覆盖 Modifier、根布局、调用方内容、可选内容和布尔形态参数。', ['设计可复用 Compose 组件 API', '审查 Modifier 与根布局位置', '规范可选内容和状态参数']]],
  ['chrisbanes/skills/compose-state-and-effects', ['Jetpack Compose 状态管理', 'Compose State And Effects：编写或审查 Jetpack Compose 状态所有权、状态提升、状态持有者、Effect、Flow 收集和一次性界面事件。', ['设计 Compose 状态所有权与提升', '审查 LaunchedEffect 等副作用', '处理 Flow、导航和 Snackbar 事件']]],
  ['chrisbanes/skills/deliver-spec', ['规格交付', 'Deliver Spec：把已批准的 GitHub 或本地规格实现为经过评审的拉取请求，或执行项目控制器委派的单个实现工单。', ['交付已批准的实现规格', '完成一个已认领的项目工单', '准备带验证证据的评审差异']]],
  ['chrisbanes/skills/gradle-run', ['Gradle 构建诊断', 'Gradle Run：规划或诊断 Gradle 与 Wrapper 的构建、测试、检查、Lint、警告和失败，并记录重复故障特征。', ['运行或规划 Gradle 构建检查', '诊断测试、Lint 与构建失败', '识别重复失败指纹']]],
  ['chrisbanes/skills/grounded-writing', ['技术写作', 'Grounded Writing：起草或审查将公开发布或发送的开发者文档、技术报告、评审评论与回复，并依据用户提供的草稿和证据控制表述。', ['撰写开发者文档和技术报告', '审查对外发布的技术文字', '编辑评审评论与回复']]],
  ['chrisbanes/skills/kotlin-api-design', ['Kotlin API 设计', 'Kotlin Api Design：设计或审查 Kotlin 函数归属、成员与扩展函数、工厂、值类、数据类、KMP expect/actual 和平台服务边界。', ['设计 Kotlin 公共 API', '选择成员函数、扩展函数或工厂', '审查 KMP 平台边界和领域类型']]],
  ['chrisbanes/skills/kotlin-concurrency-and-flow', ['Kotlin 并发', 'Kotlin Concurrency And Flow：审查 Kotlin 协程作用域、取消语义、线程或执行器使用，以及 StateFlow、SharedFlow、Channel 和一次性事件。', ['设计协程作用域与取消行为', '审查 Flow 状态和共享策略', '处理 Channel 与一次性事件']]],
  ['chrisbanes/skills/kotlin-control-flow', ['Kotlin 开发', 'Kotlin Control Flow：编写或审查 Kotlin when、守卫条件、密封类型穷尽性、智能转换、可空分支和提前返回。', ['简化 Kotlin 条件分支', '利用密封类型做穷尽检查', '审查可空处理和提前返回']]],
  ['chrisbanes/skills/release-kotlin-library', ['Kotlin 发布工程', 'Release Kotlin Library：准备或检查 Kotlin 库发布，核对发布插件前置条件、变更日志、API 快照和制品发布状态。', ['检查 Kotlin 库发布就绪度', '协调变更日志与 API 快照', '验证 Maven 发布配置和结果']]],
  ['chrisbanes/skills/run-github-project', ['GitHub 项目管理', 'Run Github Project：设置、审查或运行仓库的 GitHub Projects 工作流，覆盖待办分诊、任务认领、角色标记、Epic、检查点和下一工单执行。', ['配置或审查 GitHub Projects 流程', '分诊 Todo 并管理任务认领', '跟踪 Epic、检查点和后续工单']]],
  ['chrisbanes/skills/to-plan', ['实现规划', 'To Plan：把一个就绪 GitHub Issue 或对话任务整理为实现计划，并吸收已批准计划的修订链或新的集成决策。', ['为单个 Issue 编写实现计划', '把对话任务转为可执行步骤', '合并已批准的计划修订']]],
  ['chrisbanes/skills/using-chrisbanes-skills', ['Kotlin 与 Compose 路由', 'Using Chrisbanes Skills：为 Kotlin、Jetpack Compose 和物理 Android 基准任务选择合适的专项流程，尤其处理多个关注点重叠的情况。', ['为 Kotlin 任务选择专项流程', '路由 Compose 设计与状态问题', '为 Android 基准证据匹配决策流程']]],
  ['coldteadotai/pr-lens/eli5', ['代码讲解', 'Eli5：把代码库、目录、功能、命令或拉取请求制作成面向初学者的 PR Lens 画布，并按步骤构建易懂的代码导览。', ['向新成员解释代码库结构', '用画布讲解功能或拉取请求', '为非工程受众制作代码导览']]],
  ['composio-community/awesome-claude-plugins/developer-growth-analysis', ['开发者成长分析', 'Developer Growth Analysis：分析近期 Claude Code 对话中的编码模式与能力缺口，从 Hacker News 整理相关学习资源，并生成发送到 Slack 私信的个性化成长报告。', ['复盘个人编码习惯与薄弱项', '整理针对性的学习资源', '生成开发者成长报告']]],
  ['composio-community/awesome-claude-plugins/perf-analyzer', ['性能分析', 'Perf Analyzer：把已有性能发现综合为有证据支持的建议和工程决策。', ['汇总性能测试与剖析结果', '形成性能优化建议', '记录有证据支持的取舍决策']]],
  ['composio-community/awesome-claude-plugins/perf-baseline-manager', ['性能基线', 'Perf Baseline Manager：管理和归并性能基线结果，比较不同版本，并确保每个版本只保留一份基线 JSON。', ['建立和维护版本性能基线', '比较不同版本的基准结果', '归并重复的基线数据']]],
  ['composio-community/awesome-claude-plugins/perf-benchmarker', ['性能基准', 'Perf Benchmarker：顺序运行性能基准、建立基线并验证回退，公开说明要求常规运行至少 60 秒且不并行执行基准。', ['运行可重复的性能基准', '建立性能基线', '验证性能回退是否成立']]],
  ['composio-community/awesome-claude-plugins/perf-code-paths', ['性能分析', 'Perf Code Paths：在性能剖析前梳理入口点、调用路径和可能的热点文件。', ['定位性能关键入口', '绘制可能的热点代码路径', '为后续剖析缩小范围']]],
  ['composio-community/awesome-claude-plugins/perf-theory-gatherer', ['性能分析', 'Perf Theory Gatherer：结合 Git 历史与代码证据提出可验证的性能假设。', ['从版本历史寻找性能线索', '提出可验证的瓶颈假设', '用代码证据支持性能调查']]],
  ['composio-community/awesome-claude-plugins/theme-factory', ['主题与视觉系统', 'Theme Factory：为幻灯片、文档、报告和 HTML 页面应用预设颜色与字体主题，或按需生成新的主题。', ['为演示或报告套用视觉主题', '统一文档和网页的颜色字体', '生成新的配色与排版主题']]],
  ['dotnet/skills/code-testing', ['测试工程', 'Code Testing：为现有代码新增、修复或强化 xUnit、MSTest、NUnit、pytest、Vitest/Jest、Go 等测试，覆盖回归、易失败用例和基于覆盖率的补充。', ['为现有代码编写回归测试', '修复不稳定或失效的测试', '依据覆盖缺口补充测试用例']]],
  ['dotnet/skills/csharp-expert', ['C# 与 .NET 路由', 'Csharp Expert：把 C# 与 .NET 请求路由到适合的已安装专项流程，覆盖 ASP.NET Core、Blazor、MAUI、WinForms、EF Core、测试迁移和运行时性能等领域。', ['为 C# 任务选择专项流程', '判断需要安装的 .NET Skill', '在无更窄流程时处理 C# 语义问题']]],
  ['dotnet/skills/use-igniteui-blazor', ['Blazor 组件集成', 'Use Igniteui Blazor：在 Blazor Server、WASM、Hybrid 或分离式应用中安装、配置和审查 Ignite UI for Blazor Lite 组件与样式。', ['接入 Ignite UI Blazor Lite', '配置服务注册、命名空间和主题样式', '检查不同 Blazor 主机模式的组件设置']]],
  ['dotnet/skills/winforms-expert', ['Windows Forms 开发', 'Winforms Expert：创建、修改、调试或审查带明确 WinForms 标记的 Windows Forms 应用、设计器文件、布局、数据绑定和自定义控件。', ['开发或调试 WinForms 界面', '处理设计器、布局与数据绑定', '实现自定义控件和跨线程更新']]],
  ['nomadamas/k-skill/company-analysis', ['公司与财务分析', 'Company Analysis：对照上市公司公开披露与业绩说明，分析三大财务报表变化、业务竞争格局、关键日程和查询时点股价，并输出韩文六部分分析。', ['复盘上市公司业绩发布', '核对财务数据与业务变化', '整理公司竞争格局和关键日程']]],
  ['nomadamas/k-skill/korean-bond-search', ['韩国债券研究', 'Korean Bond Search：按标准债券字段，以名称、发行人或 ISIN 检索和比较韩国债券的发行条件、余额、CALL/PUT 及 CB、EB、BW 信息，并附来源。', ['按发行人或 ISIN 查找韩国债券', '比较债券发行条件和余额', '核对嵌入期权与可转债结构']]],
  ['nomadamas/k-skill/market-event-impact', ['市场事件分析', 'Market Event Impact：基于官方资料、当时报道与经验证价格，整理定期发布或突发事件的关键变化、市场解读、跨资产传导和相似案例。', ['分析指定市场事件的影响', '梳理跨资产传导路径', '对照历史案例与后续催化剂']]],
  ['parallel-web/parallel-agent-skills/choose-your-parallel-api', ['Web 数据 API 选型', 'Choose Your Parallel Api：根据成本、延迟和答案质量，在 Parallel Search、Extract、Responses 与 Task API 之间选择合适接口及搜索模式和推理配置。', ['为应用选择实时 Web 数据接口', '为引用答案或深度研究配置 API', '排查 Web 集成的延迟、成本或召回问题']]],
  ['wyattblue/auto-editor/auto-editor-transcribe', ['转录与内容剪辑', 'Auto Editor Transcribe：使用 auto-editor 的 Whisper 子命令把媒体文件或麦克风语音转为文本与字幕，并按单词或正则匹配保留或删除视频片段。', ['转录音视频并生成字幕', '进行实时语音转录', '按口述内容剪切视频片段']]],
  ["uizze/uizze/image-to-ui", ["界面复刻", "Image To Ui：把图片、截图或设计稿按参考画面一比一实现为界面，并通过渲染对比修正可见差异。", ["从截图复刻网页或应用界面","按参考稿实现视觉细节","渲染对比并修正界面偏差"]]],
  ["caffeinelabs/skills/writing-motoko", ["Motoko 开发", "Writing Motoko：提供 Motoko 语言、后端架构模式和 mops 依赖工具参考，用于编写或修改 .mo 文件。", ["编写 Motoko 后端代码","选择 Motoko 架构模式","管理 mops 项目依赖"]]],
  ["caffeinelabs/skills/migrating-motoko-actors", ["Motoko 数据迁移", "Migrating Motoko Actors：使用增强迁移链处理 Motoko Actor 升级、持久化状态模式演进和 canister 迁移。", ["升级 Motoko canister","变更 Actor 状态结构","编写和维护迁移链"]]],
  ["caffeinelabs/skills/troubleshooting-motoko-migrations", ["Motoko 数据迁移", "Troubleshooting Motoko Migrations：深入排查 Motoko 迁移链的升级兼容错误、迁移文件问题和旧持久化项目转换故障。", ["诊断升级兼容错误","修复无法编写或运行的迁移","处理旧持久化项目或移除迁移链"]]],
  ["microsoft/azure-skills/aks-gpu-inference", ["AKS 与 GPU 运维", "Aks Gpu Inference：以只读证据诊断 AKS GPU 与 KAITO 的运行期故障，包括 GPU 调度、显存、模型加载和自动扩缩问题。", ["排查 GPU Pod Pending","诊断模型加载 OOM 或显存问题","检查 KAITO 与 GPU 自动扩缩状态"]]],
  ["microsoft/azure-skills/aks-known-issues", ["AKS 故障诊断", "Aks Known Issues：仅在错误签名及限定条件完整匹配时，查找已记录的 AKS 容量、节点镜像、临时磁盘和 VM 扩展故障修复。", ["匹配完整 AKS 已知错误签名","查找节点镜像或容量故障修复","核对 VM 扩展嵌套错误条件"]]],
  ["microsoft/azure-skills/aks-network-capture", ["AKS 网络诊断", "Aks Network Capture：在只读诊断后，从 AKS 节点和 Azure 网络配置采集有界数据包证据，用于定位链路丢包位置。", ["在 AKS 节点采集 pcap","用 tcpdump 获取网络证据","定位数据包在哪一段丢失"]]],
  ["microsoft/azure-skills/aks-troubleshooting", ["AKS 故障诊断", "Aks Troubleshooting：以只读证据调查 AKS 实时故障，覆盖 Pod、节点、DNS、入口、网络策略、SNAT、配额、升级和区域中断。", ["排查 Pod 崩溃或 Pending","诊断节点、DNS 与入口故障","调查配额、扩缩和升级阻塞"]]],
  ["microsoft/azure-skills/azure-search-nav", ["Azure 门户导航", "Azure Search Nav：通过公开说明中的语义搜索 API，为受支持的容器、Kubernetes 和计算资源构造 Azure 门户深层链接。", ["查找 Azure 门户中的操作入口","按资源与查询定位具体 Blade","生成资源页面的深层链接"]]],
  ["charlie947/motion-graphics-skills/animated-chart", ["数据动效", "Animated Chart：用代码制作循环动画图表，在不改变数据值的前提下实现柱线转换、数字递增和前后对比。", ["制作社交媒体动画图表","为统计数字添加递增动效","把静态结果转成循环数据动画"]]],
  ["charlie947/motion-graphics-skills/apple-launch-film", ["产品发布视频", "Apple Launch Film：用代码制作 Apple 风格的 Mac 产品发布短片，组合菜单栏、刘海组件、渐变壁纸和逐幕短文案。", ["制作 Apple 风格产品发布片","编排原生 Mac 界面动效","生成无需录屏的发布视频"]]],
  ["charlie947/motion-graphics-skills/launch-video", ["产品发布视频", "Launch Video：用真实产品画面、缓慢镜头、输入演示、证明节点和行动号召制作 30–45 秒产品发布视频。", ["制作 SaaS 产品发布片","为课程或服务生成宣传预告","编排产品画面与 CTA"]]],
  ["charlie947/motion-graphics-skills/milestone-reveal", ["社交媒体动效", "Milestone Reveal：用粒子汇聚、数字揭示、下划线和标签制作 12 秒循环里程碑短片。", ["庆祝关注者或订阅者里程碑","展示收入或客户数量","制作社交平台数字揭示动画"]]],
  ["charlie947/motion-graphics-skills/model-showdown", ["AI 模型比较视频", "Model Showdown：以同一动效简报比较三个 AI 模型的首次输出，并生成带模型名称与标识的横版和竖版对比视频。", ["制作多模型同提示对比","生成并排或竖排比较视频","公平展示各模型首次输出"]]],
  ["charlie947/motion-graphics-skills/newsletter-promo", ["内容营销视频", "Newsletter Promo：把一期通讯转成 12–20 秒宣传短片，组合提问钩子、三帧内容证据和阅读订阅入口。", ["为 Newsletter 制作预告片","推广 Substack 或单期内容","生成 LinkedIn、Instagram 或 X 宣传视频"]]],
  ["charlie947/motion-graphics-skills/reel-export", ["视频导出", "Reel Export：把横版或方形动效转为可上传的 1080×1920 Reel 或 TikTok，并检查安全区、H.264、色彩范围和音轨。", ["把横版视频转成 9:16","导出 Instagram Reel 或 TikTok","用 ffprobe 检查上传兼容性"]]],
  ["charlie947/motion-graphics-skills/title-sequence-3d", ["3D 标题动效", "Title Sequence 3d：使用 Three.js 和代码制作 8–15 秒电影感 3D 标题序列，包含镜头运动、灯光场景和标题落版。", ["制作电影感视频开场","生成 3D 品牌标题序列","为短视频或通讯制作视觉钩子"]]],
  ["clhbid/agent-context/afk-loop", ["Agent 协作流程", "Afk Loop：规范团队如何在 Copilot 与 Claude Code 间分配离线任务、编写完整简报、审查返回的 PR 并处理失败运行。", ["选择适合的离线 Agent","编写可独立执行的任务简报","审查 PR 并处理失败运行"]]],
  ["clhbid/agent-context/cycle-review", ["项目复盘", "Cycle Review：完成 CLHbid Delivery 看板的周期复盘往返流程，包括发布会议记录、回写周期和状态以及调整周期成员。", ["发布周期复盘会议记录","把反馈回写到周期和状态","调整工作项的周期归属"]]],
  ["clhbid/agent-context/email-to-issue", ["邮件与 Issue 协作", "Email To Issue：把已标记或按主题指定的 Outlook 邮件线程整理为 GitHub Issue 或评论。", ["把客户邮件转成 GitHub Issue","把后续邮件追加为 Issue 评论","批量处理已标记 Outlook 线程"]]],
  ["clhbid/agent-context/house-rules", ["仓库开发规范", "House Rules：提供 clhbid 仓库在编写、测试和审查代码时遵循的项目规则。", ["按仓库约定编写代码","依据项目规则执行测试","按统一标准审查变更"]]],
  ["clhbid/agent-context/writing-lean", ["技术写作", "Writing Lean：以简洁流畅的方式编写或编辑代码、注释、文档、PR、Issue、评审和提交信息。", ["精简代码与注释表达","编辑 PR 或 Issue 文案","统一评审和提交信息风格"]]],
  ["gatewai-dev/framefields/framefields", ["程序化视频", "Framefields：在新建或已有 Node.js 项目中初始化 framefields，搭建组合与渲染脚本并生成首个 MP4。", ["初始化 framefields 视频项目","为 Node.js 项目接入 framefields","搭建首个组合和渲染流程"]]],
  ["gatewai-dev/framefields/framefields-compose", ["程序化视频", "Framefields Compose：使用 framefields WebGPU SDK 设计和动画化场景、布局树、动态文字、镜头、矢量图形与音频同步动效。", ["编排 WebGPU 视频场景","制作动态文字和镜头运动","实现音频同步的程序化动效"]]],
  ["goldsky-io/goldsky-agent/feeds", ["区块链数据", "Feeds：查询 Goldsky Feeds REST API 中单个钱包的余额、估值和转账，并支持公开说明列出的 Polymarket 数据与区块头查询。", ["查询钱包持仓与组合价值","检查转账和入账记录","读取 Polymarket 数据或区块头"]]],
  ["hueyexe/frontend-agent-skills/design-systems-frontend-architecture", ["设计系统工程", "Design Systems Frontend Architecture：构建可复用前端系统，覆盖设计令牌、组件契约、响应式布局、CSS 策略和治理文档。", ["设计前端组件契约","建立令牌与响应式布局体系","制定 CSS 策略和设计系统治理"]]],
  ["hueyexe/frontend-agent-skills/ui-visual-composition", ["界面视觉设计", "Ui Visual Composition：创建、评审和优化界面视觉，重点处理层级、间距、排版、色彩、深度、图像和视觉状态。", ["设计或精修应用界面","审查视觉层级与排版","统一颜色、间距和状态表现"]]],
  ["kelvicthrust/agent-sync-config/agent-sync-config", ["Agent 配置管理", "Agent Sync Config：在 Codex 与 Claude Code 之间设置、检查和同步本地指令、Skill、精选上下文与 MCP 配置。", ["初始化共享 Agent 配置","排查配置漂移","在切换客户端时同步上下文与 MCP"]]],
  ["kotlin/kotlin-agent-skills/kotlin-tooling-kotlin-toolchain", ["Kotlin 工具链", "Kotlin Tooling Kotlin Toolchain：使用 JetBrains Kotlin Toolchain 构建、运行、测试、打包、检查和配置 Kotlin/Java 项目。", ["初始化 Kotlin Toolchain 项目","构建测试或打包 Kotlin 项目","配置 project.yaml 或 module.yaml"]]],
  ["kotlin/kotlin-agent-skills/kotlin-tooling-kotlin-toolchain-plugin-authoring", ["Kotlin 构建插件", "Kotlin Tooling Kotlin Toolchain Plugin Authoring：编写本地 Toolchain 插件，以代码生成、构建期处理、自定义验证或打包扩展声明式构建。", ["编写 Kotlin Toolchain 本地插件","实现代码生成或构建处理","添加自定义验证与打包任务"]]],
  ["kotlin/kotlin-agent-skills/kotlin-tooling-native-build-performance", ["Kotlin Native 性能", "Kotlin Tooling Native Build Performance：诊断并改善面向 iOS 的 Kotlin Multiplatform Native 编译、链接和 CI 冷构建性能。", ["排查 iOS 或共享框架构建缓慢","优化 Kotlin Native 链接任务","制定本地与 CI 构建性能方案"]]],
  ["morluto/rea/rea-tool-design", ["调查工具设计", "Rea Tool Design：设计或修改 REA 调查工具、CLI/MCP 契约、提供方能力和 Evidence 语义。", ["设计 REA 调查工具","定义 CLI 或 MCP 契约","调整证据语义与提供方能力"]]],
  ["oil-oil/oil-ui/oil-ui", ["界面设计与评审", "Oil Ui：为网站、应用、仪表盘和组件探索设计方向、并排比较风格，并根据真实截图优化视觉层级。", ["设计新界面或组件","比较多个视觉方向","按真实截图精修和评审界面"]]],
  ["roble3/cc-blender-skill/blender-animation", ["Blender 动画", "Blender Animation：为 Blender 对象、相机、灯光和属性添加关键帧、曲线缓动、形态键、驱动器与 NLA 动作。", ["制作对象和相机关键帧动画","配置形态键与口型","用驱动器和 NLA 复用动画"]]],
  ["roble3/cc-blender-skill/blender-cameras", ["Blender 相机", "Blender Cameras：以电影化意图设置 Blender 相机的焦距、景深、构图、轨迹和跟踪约束。", ["设置镜头焦距与景深","规划英雄镜头或特写构图","制作环绕、推进和跟踪相机"]]],
  ["roble3/cc-blender-skill/contour-to-mesh", ["Blender 建模", "Contour To Mesh：从提取的二维轮廓或遮罩直接构建 Blender 网格表面，使剪影在增加深度前贴合正面模板。", ["从轮廓构建精确网格","重建吉祥物或 Logo 剪影","制作浅浮雕或填充线框形体"]]],
  ["roble3/cc-blender-skill/landmark-fit-repair", ["Blender 模型校准", "Landmark Fit Repair：用命名特征点验证和修复锁定来源的 Blender 模型，在包围盒或 IoU 不足时校准关键部位。", ["按特征点校准 Blender 模型","修复多视角关键部位偏差","补充超越包围盒的拟合验证"]]],
  ["roble3/cc-blender-skill/multiview-fit-loop", ["Blender 模型校准", "Multiview Fit Loop：以比较、调整、再比较的闭环，让 Blender 模型同时贴合正面、侧面、背面和顶视模板。", ["执行多视图模型拟合","比较轮廓、中心与边缘指标","迭代调整直到各视图通过"]]],
  ["roble3/cc-blender-skill/orthographic-registration", ["Blender 模型校准", "Orthographic Registration：把正面、侧面、背面和顶视参考图注册到统一 Blender 坐标约定。", ["对齐多张正交参考图","建立共享坐标与尺度","为轮廓模型增加深度前做注册"]]],
  ["roble3/cc-blender-skill/reference-look-calibration", ["Blender 视觉校准", "Reference Look Calibration：按可测颜色、亮度、饱和度、包围盒和遮罩统计校准 Blender 材质、灯光、相机裁切、辉光和色彩管理。", ["匹配参考图的材质与灯光","校准颜色、亮度和辉光","修正相机裁切与剪影范围"]]],
  ["roble3/cc-blender-skill/texture-driven-mesh-fitting", ["Blender 网格与纹理", "Texture Driven Mesh Fitting：重塑网格边界以一比一贴合纹理图集或贴花轮廓，再完成 UV 和材质工作。", ["让网格匹配纹理区域","修复贴图因几何不符产生的偏差","在 UV 前校准模型边界"]]],
  ["roble3/cc-blender-skill/texture-state-animation", ["Blender 纹理动画", "Texture State Animation：设计和验证 Blender 多纹理状态之间的过渡，避免整图淡化、纹理跳变、错位变形和目标引擎不兼容。", ["制作角色或 Logo 纹理状态切换","修复纹理跳变和错位","验证目标引擎兼容的纹理动画"]]],
  ["roble3/cc-blender-skill/wireframe-to-3d", ["图像转 3D", "Wireframe To 3d：把二维正交线框或技术图转换为 Blender 三维模型，并导出 glTF 或 GLB。", ["从正侧背视图重建 3D 模型","把技术线稿转换为网格","导出可交付的 glTF 或 GLB"]]],
  ["securityskills/skills/stride-threat-modeling", ["威胁建模", "Stride Threat Modeling：主持基于 STRIDE 的威胁建模工作坊，绘制系统、逐元素枚举和排序威胁，并把缓解措施写入待办。", ["在设计评审中建立威胁模型","按 STRIDE 枚举系统威胁","排序风险并制定缓解任务"]]],
  ["tabooharmony/roblox-brain/roblox-animation-vfx", ["Roblox 动画与特效", "Roblox Animation Vfx：实现 Roblox 角色动画、粒子、光束、拖尾、Tween、相机震动和其他视觉特效。", ["制作 Roblox 角色动画","添加粒子、光束与拖尾","实现 Tween 和相机震动"]]],
  ["tabooharmony/roblox-brain/roblox-building", ["Roblox 场景构建", "Roblox Building：使用 MCP 或独立 Luau 构建 Roblox 几何体、地图、道具和生成资产。", ["构建 Roblox 地图与几何体","制作游戏道具和场景资产","用 Luau 或 MCP 生成内容"]]],
  ["tabooharmony/roblox-brain/roblox-performance", ["Roblox 性能", "Roblox Performance：分析 Roblox 的 FPS、内存、网络、移动端和热点路径性能问题。", ["定位 FPS 下降和热点路径","诊断内存或网络性能","优化移动端 Roblox 体验"]]],
  ["tabooharmony/roblox-brain/roblox-studio-mcp", ["Roblox Studio 自动化", "Roblox Studio Mcp：通过内置 MCP 操作 Roblox Studio 中的脚本、场景、生成资产、输入和运行测试。", ["通过 MCP 编辑 Roblox 脚本和场景","生成或调整 Studio 资产","自动执行输入与 Playtest"]]],
  ["backnotprop/pstack/correct", ["Agent ��������", "Correct���Ӳ����߾���������ʵ�����������ظ�ʧ��ģʽ������ͨ���ܹ������͡����޸���ʾ�� lint ��ع����ʹͬ������޷��ٴη����������ĵ���Ϊ����ֶΡ�", ["�� Agent ���ظ��������̻�Ϊ����","Ϊ��ʷ�����������͡�lint ��ع����","��֤��������ܲ�����ʵ������"]]],
  ["tabooharmony/roblox-brain/roblox-lighting", ["Roblox �������Χ", "Roblox Lighting������ Roblox �����Ĺ��ա�Atmosphere����ҹѭ�������Ч����", ["���� Roblox �����������Χ","ʵ����ҹѭ��","���ú����Ӿ�Ч��"]]],
  ["leonxlnx/taste-skill/design-taste-frontend-v2-experimental", ["ǰ����ƹ淶", "Design Taste Frontend V2 Experimental������ taste-skill ���ڵ��ļ�����ť�����汾��ǰ����ƹ����������������Ϊ�����ҳ����Ʒ����������ȵĽ�������ơ�", ["ά�������ɰ���Ϊ��ǰ����Ŀ","����ģ�廯����������ҳ����Ʒ��","�������ǰִ�н��������Ԥ��"]]],
  ["apidojo-io/apidojo-skills/scraping-youtube-playlist", ["YouTube ���ݲɼ�", "Scraping Youtube Playlist��ͨ�� Apify �ϵ� apidojo YouTube Playlist Scraper ��ȡ�����б��е���Ƶ���⡢���ӡ��ۿ����������ʱ����Ƶ����˵����Ԫ���ݡ�", ["���� YouTube �����б���Ƶ�嵥","�ɼ������б���Ƶͳ����Ƶ����Ϣ","�����γ̻��չ��Ƶ����"]]],
  ["diip3sh/feel/feel", ["����������Ч", "Feel�����������նȡ����ᡢĦ���������ͱ߽������ģ��ʵ�ֿɵ��ĵ��ɡ���ק�����������ƽ����������������������� Web ��ԭ����Ч��ܡ�", ["ʵ�־��������еĿ��ء�����򻬿�","���Ե��ɡ���ק�������ָ�","��ͳһ�������������� Web��SwiftUI �� Compose"]]],
  ["ilyautov/humanizer-ru/humanizer-ru", ["���ı༭��У��", "Humanizer Ru��У�Ժ���ɫ����������ı���ȥ����������������Ե� AI ǻ��ͬʱ������ʵ������������������֧�ֱ༭��ֻ��ƺ͵��������޶���", ["��ɫ���ж����ı�","��ƶ����е������� AI ǻ","��ѧ�������ɡ�С˵��������ü���ķ�"]]],
  ["livekit/agent-skills/reading-livekit-docs", ["LiveKit �ĵ�����", "Reading Livekit Docs���ӵ�ǰ LiveKit �ĵ����Ǽ����к˶� API ǩ����CLI ���������á�ģ�����ṩ��֧�֡�SDK ����ͼ۸����ʵ��", ["�˶� LiveKit API �� CLI ����","��ѯģ�ͻ��ṩ��֧�����","�ڱ�д LiveKit ����ǰ���ҵ�ǰ�ĵ�ʾ��"]]],
  ["rohitg00/ai-engineering-from-scratch/course-style", ["�γ��Ӿ���д���淶", "Course Style��Ϊ AI Engineering from Scratch ҳ�桢ͼ�����ֲ��ṩ����ɫ���ơ����塢FIG ��ǩ����Ƭ���֡�����Ӣ����ϰ��ͼ��ٶ�Ч�淶��", ["ͳһ�γ�ҳ���ͼ���Ӿ�����","��� FIG ��ǩ�뿨Ƭ����","�����ϰ��ͼ�������Ӣ��淶��У����"]]],
  ["rohitg00/ai-engineering-from-scratch/motion-figure", ["����ʽ��ѧͼ��", "Motion Figure�������ɶ�������Ӧ���߲����Ľ�ѧͼ�������� SMIL �뻬���������������۵Ļ���ͼ���Լ��γ���ɫ�����򶶶�ͼ����", ["Ϊ�γ̼��붯��ͼ�뻬��","����������ʵϵͳ�����Ľ�������ͼ","���ɷ��Ͽγ���ɫ�Ķ���ͼ��"]]],
  ["vercel/next.js/next-bundle-optimizer", ["Next.js �����Ż�", "Next Bundle Optimizer����Ʋ����� Next.js ҳ���״μ���ʱ��������������������ͻ��˰���������������ظ��Ϳ��ӳٵ���������صĹ��ܡ�", ["�Ų� Next.js ·����������","�����ͻ��˳�ʼ�����","�Ƴ��ظ��������ӳٷǹؼ�����"]]],
  ["wondelai/skills/technical-documentation", ["�����ĵ�", "Technical Documentation������ Google �������ĵ�����뼼��д���γ���ơ���д�͸Ľ� README������ָ�ϡ��̡̳�API �ο���docstring��CLI �����������־��Ǩ��ָ�ϡ�", ["��д����� README ������ָ��","�Ľ� API �ο�������ʾ���Ͳ�������","ͳһ�ĵ����������������ϰ�����"]]],
]);

sourceAwareProfiles.forEach(([category, descriptionZh, useCases], id) => {
  editorialOverrides.set(id, { category, descriptionZh, useCases });
});

const windEnglishProfiles = new Map([
  ['backtest-expert', ['系统化回测策略并检查参数稳健性、滑点、偏差和过拟合风险。', ['设计或复核交易策略回测', '测试参数稳健性与滑点影响', '识别回测偏差和过拟合风险']]],
  ['market-environment-analysis', ['分析全球股票、外汇、商品与经济指标，判断风险偏好、行业环境和技术信号。', ['汇总全球市场环境', '判断风险偏好与行业表现', '解读宏观和技术指标']]],
  ['earnings-analysis', ['生成季度业绩更新研究报告，分析超预期或不及预期项目、关键指标、预测调整与投资逻辑变化。', ['复盘季度财报结果', '分析关键指标与预期差', '更新盈利预测和投资观点']]],
  ['dcf-model', ['基于公开财务资料构建现金流预测、WACC、敏感性分析与情景分析的 DCF 估值模型。', ['构建股票 DCF 估值模型', '计算 WACC 与现金流预测', '执行敏感性和情景分析']]],
  ['position-sizer', ['根据单笔风险、止损距离、ATR、Kelly 准则或组合风险预算计算股票仓位。', ['计算股票买入数量', '按止损和风险预算确定仓位', '比较 ATR 与 Kelly 仓位方法']]],
  ['theme-detector', ['识别并分析市场热门主题、行业轮动及主题强弱变化。', ['识别当前热门市场主题', '比较行业轮动方向', '跟踪主题升温或降温']]],
  ['buffett', ['以能力圈、护城河、管理层、资本配置、内在价值和安全边际框架分析公司与投资决策。', ['分析公司护城河与管理层', '评估资本配置和内在价值', '用安全边际框架审视投资决策']]],
]);

function sourceAwareEditorial(skill) {
  const exact = sourceAwareProfiles.get(skill.id.toLowerCase());
  if (exact) {
    const [category, descriptionZh, useCases] = exact;
    Object.assign(skill, { category, descriptionZh, useCases });
    return skill;
  }
  if (skill.source?.toLowerCase() !== 'wind-alice/alicemarket') return skill;
  const name = readableName(skill.name ?? skill.skillId);
  const slug = String(skill.skillId ?? '').toLowerCase();
  const english = windEnglishProfiles.get(slug);
  if (english) {
    Object.assign(skill, {
      category: '金融与市场数据',
      descriptionZh: `${name}：${english[0]}`,
      useCases: english[1],
    });
    return skill;
  }
  const raw = cleanText(skill.rawDescription, 1000);
  if (!raw) {
    Object.assign(skill, {
      category: '金融与市场数据',
      descriptionZh: `${name}：skills.sh 当前未提供可审校的公开说明；名称指向市场状态判断，具体指标、数据源与判档规则尚无法确认。`,
      useCases: ['核对市场状态判档的数据来源', '确认指标与判定规则', '在说明充分后再用于市场分析'],
    });
    return skill;
  }
  const firstSentence = raw.split(/[。！？]/)[0].replace(/^这是/, '').trim();
  const useClause = raw.match(/适用于([^。；]+)/)?.[1] ?? raw.match(/用于([^。；]+)/)?.[1] ?? '';
  const extractedCases = useClause.split(/[、，,/]/).map((item) => item.trim()).filter((item) => item.length >= 4).slice(0, 3);
  while (extractedCases.length < 2) extractedCases.push(extractedCases.length ? '核对公开说明中的适用范围与限制' : '核对公开说明中的金融数据与分析口径');
  Object.assign(skill, {
    category: '金融与市场数据',
    descriptionZh: `${name}：${firstSentence.replace(/^用于/, '')}。`,
    useCases: extractedCases,
  });
  return skill;
}

function shanghaiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dateMinus(date, days) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() - days);
  return value.toISOString().slice(0, 10);
}

async function readOptionalJson(path) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

function cleanText(value, limit = 1400) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function skillIdOf(row) {
  const source = cleanText(row.source ?? row.repo, 180);
  const skillId = cleanText(row.skillId ?? row.slug ?? row.name, 180);
  return `${source}/${skillId}`;
}

function normalizedSkillSlug(value) {
  return cleanText(value, 180).replace(/\s+/g, '-');
}

function skillUrl(row) {
  const source = cleanText(row.source ?? row.repo, 180);
  const skillId = cleanText(row.skillId ?? row.slug ?? row.name, 180);
  const route = !source.includes('/') && source.includes('.') ? 'site/' : '';
  return `https://skills.sh/${route}${source.split('/').map(encodeURIComponent).join('/')}/${encodeURIComponent(skillId)}`;
}

function githubUrl(source) {
  return source.includes('/') ? `https://github.com/${source}` : null;
}

function readableName(value) {
  return cleanText(value, 100).replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

async function fetchText(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'User-Agent': 'WAGMI-Daily-Skills-Catalog/1.0', ...options.headers },
      });
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        const error = new Error(`${url} returned HTTP ${response.status}`);
        if (!retryable || attempt === 3) throw error;
        const retryAfter = Number(response.headers.get('retry-after')) || attempt + 1;
        await new Promise((resolveDelay) => setTimeout(resolveDelay, retryAfter * 1000));
        continue;
      }
      return await response.text();
    } catch (error) {
      lastError = error;
      if (attempt < 3) await new Promise((resolveDelay) => setTimeout(resolveDelay, 700 * (attempt + 1)));
    }
  }
  throw lastError;
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url, { headers: { Accept: 'application/json' } }));
}

async function mapLimit(values, limit, task) {
  const results = new Array(values.length);
  let cursor = 0;
  async function worker() {
    while (cursor < values.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await task(values[index], index);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, values.length) }, () => worker()));
  return results;
}

export function parseOfficialOwners(html) {
  const marker = '\\"data\\":{\\"owners\\":';
  const endMarker = '],\\"totalOwners\\":';
  const start = html.indexOf(marker);
  const end = html.indexOf(endMarker, start);
  if (start < 0 || end < 0) throw new Error('skills.sh official page data was not found');
  const escaped = html.slice(start + marker.length, end + 1);
  return JSON.parse(JSON.parse(`"${escaped}"`));
}

export function flattenOfficialOwners(owners) {
  return owners.flatMap((owner) => (owner.repos ?? []).flatMap((repo) => (repo.skills ?? []).map((skill) => {
    const skillId = normalizedSkillSlug(skill.name);
    return {
      id: `${repo.repo}/${skillId}`,
      owner: owner.owner,
      source: repo.repo,
      skillId,
      name: skill.name,
      installs: Number(skill.installs) || 0,
      totalInstalls: Number(skill.installs) || 0,
      isOfficial: true,
    };
  })));
}

function stripHtml(value) {
  return cleanText(String(value ?? '').replace(/<[^>]+>/g, ' '));
}

function compactInstallCount(value) {
  const match = cleanText(value, 40).replaceAll(',', '').match(/^([0-9]+(?:\.[0-9]+)?)\s*([KMB])?$/i);
  if (!match) return 0;
  const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[match[2]?.toUpperCase()] ?? 1;
  return Math.round(Number(match[1]) * multiplier);
}

export function parseRepositorySkills(html, source) {
  const sourcePath = source.split('/').map(encodeURIComponent).join('/');
  const prefix = `/${sourcePath}/`;
  const rows = [];
  for (const match of html.matchAll(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = match[1];
    if (!href.startsWith(prefix)) continue;
    const skillId = decodeURIComponent(href.slice(prefix.length).split(/[?#]/)[0]);
    if (!skillId || skillId.includes('/')) continue;
    const name = stripHtml(match[2].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i)?.[1] ?? skillId);
    const installs = compactInstallCount(match[2].match(/<span\b[^>]*>([0-9][0-9.,]*\s*[KMB]?)<\/span>/i)?.[1] ?? '0');
    rows.push({ id: `${source}/${skillId}`, source, skillId, name: name || skillId, installs, totalInstalls: installs });
  }
  return [...new Map(rows.map((row) => [row.id.toLowerCase(), row])).values()];
}

async function fetchSourceExpansions(allTimeRows, limit = defaultSourceExpansionLimit) {
  const sources = new Map();
  allTimeRows.forEach((row, index) => {
    const source = cleanText(row.source, 180);
    if (!source.includes('/')) return;
    const current = sources.get(source) ?? { source, count: 0, bestRank: index + 1 };
    current.count += 1;
    current.bestRank = Math.min(current.bestRank, index + 1);
    sources.set(source, current);
  });
  const selected = [...sources.values()]
    .filter((item) => item.count >= 2)
    .sort((left, right) => left.bestRank - right.bestRank)
    .slice(0, limit);
  let failures = 0;
  const groups = await mapLimit(selected, 5, async ({ source }) => {
    try {
      return parseRepositorySkills(await fetchText(`https://skills.sh/${source}`), source);
    } catch {
      failures += 1;
      return [];
    }
  });
  return { rows: groups.flat(), sources: selected.length, failures };
}

async function fetchAllTimeCatalog({ maxPages = Number.POSITIVE_INFINITY } = {}) {
  const first = await fetchJson(allTimeEndpoint.replace('{page}', '0'));
  const totalPages = Math.min(Math.ceil((Number(first.total) || first.skills.length) / defaultPageSize), maxPages);
  const pageNumbers = Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => index + 1);
  const remaining = await mapLimit(pageNumbers, 4, async (page) => fetchJson(allTimeEndpoint.replace('{page}', String(page))));
  const payloads = [first, ...remaining];
  if (payloads.some(page => !Array.isArray(page.skills))) throw new Error('Skill catalog page did not return a skills array');
  const rows = payloads.flatMap(page => page.skills);
  if (totalPages >= Math.ceil(Number(first.total) / defaultPageSize)
    && (rows.length !== Number(first.total) || new Set(rows.map(row => row.source + '/' + row.skillId)).size !== Number(first.total))) {
    throw new Error('Skill catalog pagination is incomplete or contains duplicate identities');
  }
  return { rows, sourceTotal: Number(first.total) || 0, pages: payloads.length };
}

function catalogRow(row, officialLookup, hotLookup, allTimeRank, generatedAt) {
  const source = cleanText(row.source, 180);
  const skillId = cleanText(row.skillId ?? row.slug ?? row.name, 180);
  const exactId = `${source}/${skillId}`;
  const official = officialLookup.get(exactId) ?? officialLookup.get(exactId.toLowerCase());
  const hot = hotLookup.get(exactId.toLowerCase());
  const inferredProfile = inferSkillProfile({ name: row.name ?? skillId, description: '' });
  const profile = editorialOverrides.get(exactId.toLowerCase()) ?? (official ? {
    category: inferredProfile.category,
    descriptionZh: `${readableName(row.name ?? skillId)}：收录于 skills.sh 企业官方目录；目录未提供详细说明时，具体能力与适用范围以来源页面公开信息为准。`,
    useCases: ['核对 skills.sh 详情页的公开说明', '查看来源 GitHub 仓库确认维护方与更新', '根据当前任务评估适用范围'],
  } : inferredProfile);
  return {
    id: exactId,
    name: cleanText(row.name ?? skillId, 180),
    source,
    skillId,
    sourceType: row.sourceType || (source.includes('/') ? 'github' : 'well-known'),
    url: skillUrl({ source, skillId }),
    installUrl: row.installUrl || githubUrl(source),
    totalInstalls: Number(row.totalInstalls ?? row.installs) || 0,
    weeklyInstalls: Array.isArray(row.weeklyInstalls) ? row.weeklyInstalls.map((value) => Number(value) || 0) : [],
    allTimeRank: allTimeRank || null,
    isOfficial: Boolean(official),
    officialOwner: official?.owner ?? null,
    ...(hot ? {
      hourInstalls: Number(hot.installs) || 0,
      installsYesterday: Number(hot.installsYesterday) || 0,
      change: Number(hot.change) || 0,
      hotRank: hot.hotRank,
    } : {}),
    descriptionZh: profile.descriptionZh,
    useCases: profile.useCases,
    category: profile.category,
    capturedAt: generatedAt,
  };
}

export function buildCatalog({ allTimeRows, officialRows, expandedRows = [], trendingRows = [], hotRows = [], officialOwnerCount, generatedAt = new Date().toISOString(), asOf = shanghaiDate(), sourceTotal = allTimeRows.length, pages = 1, previousIds = new Set(), expansionSources = 0, expansionFailures = 0 }) {
  const officialLookup = new Map();
  officialRows.forEach((row) => {
    officialLookup.set(row.id, row);
    officialLookup.set(row.id.toLowerCase(), row);
  });
  const hotLookup = new Map(hotRows.map((row, index) => [skillIdOf(row).toLowerCase(), { ...row, hotRank: index + 1 }]));
  const rows = new Map();
  allTimeRows.forEach((row, index) => {
    const value = catalogRow(row, officialLookup, hotLookup, index + 1, generatedAt);
    rows.set(value.id, value);
  });
  const knownIds = new Set([...rows.keys()].map((id) => id.toLowerCase()));
  officialRows.forEach((row) => {
    if (!knownIds.has(row.id.toLowerCase())) {
      rows.set(row.id, catalogRow(row, officialLookup, hotLookup, null, generatedAt));
      knownIds.add(row.id.toLowerCase());
    }
  });
  expandedRows.forEach((row) => {
    const existing = rows.get(row.id) ?? [...rows.values()].find((skill) => skill.id.toLowerCase() === row.id.toLowerCase());
    if (existing) {
      knownIds.add(existing.id.toLowerCase());
      return;
    }
    const value = catalogRow(row, officialLookup, hotLookup, existing?.allTimeRank ?? null, generatedAt);
    rows.set(value.id, value);
    knownIds.add(value.id.toLowerCase());
  });
  hotRows.forEach((row) => {
    const id = skillIdOf(row);
    if (!knownIds.has(id.toLowerCase())) {
      const value = catalogRow({ ...row, totalInstalls: 0 }, officialLookup, hotLookup, null, generatedAt);
      rows.set(value.id, value);
      knownIds.add(value.id.toLowerCase());
    }
  });
  trendingRows.forEach((row) => {
    const id = skillIdOf(row);
    if (!knownIds.has(id.toLowerCase())) {
      const value = catalogRow({ ...row, totalInstalls: 0 }, officialLookup, hotLookup, null, generatedAt);
      rows.set(value.id, value);
      knownIds.add(value.id.toLowerCase());
    }
  });
  const skills = [...rows.values()].sort((left, right) => (left.allTimeRank ?? Number.MAX_SAFE_INTEGER) - (right.allTimeRank ?? Number.MAX_SAFE_INTEGER) || right.totalInstalls - left.totalInstalls);
  const owners = new Set(skills.filter((skill) => skill.isOfficial).map((skill) => skill.officialOwner).filter(Boolean));
  return {
    schemaVersion: '1.0.0', generatedAt, asOf, source: sourceHomepage,
    sourceStatus: { allTimeEndpoint, hotEndpoint, officialPage, sourceTotal, pages, expansionSources, expansionFailures },
    stats: {
      totalSkills: skills.length,
      officialSkills: skills.filter((skill) => skill.isOfficial).length,
      officialOwners: officialOwnerCount ?? owners.size,
      sourceOfficialRows: officialRows.length,
      newSkills: skills.filter((skill) => !previousIds.has(skill.id)).length,
    },
    skills,
  };
}

async function enrichTrendingRow(row) {
  const url = skillUrl(row);
  try {
    const html = await fetchText(url);
    const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
    for (const match of scripts) {
      try {
        const value = JSON.parse(match[1]);
        if (value?.['@type'] === 'SoftwareApplication') {
          return {
            url,
            description: cleanText(value.description),
            totalInstalls: Number(value.interactionStatistic?.userInteractionCount) || null,
            metadataStatus: 'success',
          };
        }
      } catch {
        // Continue to local Chinese fallback metadata.
      }
    }
  } catch {
    // Continue to local Chinese fallback metadata.
  }
  return { url, description: '', totalInstalls: null, metadataStatus: 'fallback' };
}

export function compareSkillTrend(current, previous = null) {
  const currentInstalls = Number(current.trendInstalls ?? current.heatInstalls) || 0;
  const previousInstalls = previous == null ? null : Number(previous.trendInstalls ?? previous.heatInstalls) || 0;
  const previousRank = Number.isFinite(Number(previous?.rank)) ? Number(previous.rank) : null;
  const currentHotRank = Number.isFinite(Number(current.hotRank)) ? Number(current.hotRank) : null;
  const previousHotRank = Number.isFinite(Number(previous?.hotRank)) ? Number(previous.hotRank) : null;
  const trendInstallChange = previousInstalls == null ? null : currentInstalls - previousInstalls;
  const rankChange = previousRank == null ? null : previousRank - Number(current.rank);
  let trendStatus = 'new';
  if (previous) trendStatus = trendInstallChange > 0 ? 'up' : trendInstallChange < 0 ? 'down' : 'flat';
  let hotStatus = 'not_hot';
  if (currentHotRank != null && previousHotRank == null) hotStatus = 'entered';
  else if (currentHotRank == null && previousHotRank != null) hotStatus = 'exited';
  else if (currentHotRank != null && previousHotRank != null) {
    hotStatus = currentHotRank < previousHotRank ? 'up' : currentHotRank > previousHotRank ? 'down' : 'flat';
  }
  return {
    previousTrendInstalls: previousInstalls,
    trendInstallChange,
    previousRank,
    rankChange,
    trendStatus,
    previousHotRank,
    hotRankChange: currentHotRank == null || previousHotRank == null ? null : previousHotRank - currentHotRank,
    hotStatus,
  };
}

export function buildTrendingSnapshot({ rows, hotRows = [], metadata, catalog, previousSnapshot = null, generatedAt = new Date().toISOString(), asOf = shanghaiDate(), limit = defaultTrendingLimit }) {
  const reportId = `skills-${asOf}`;
  const catalogLookup = new Map(catalog.skills.map((skill) => [skill.id, skill]));
  const hotLookup = new Map(hotRows.map((row, index) => [skillIdOf(row).toLowerCase(), { ...row, hotRank: index + 1 }]));
  const previousLookup = new Map((previousSnapshot?.skills ?? []).map((skill) => [skill.id.toLowerCase(), skill]));
  const skills = rows.slice(0, limit).map((row, index) => {
    const id = skillIdOf(row);
    const hot = hotLookup.get(id.toLowerCase());
    const base = catalogLookup.get(id) ?? catalogRow(row, new Map(), hotLookup, null, generatedAt);
    const detail = metadata[index] ?? { url: base.url, description: '', totalInstalls: null, metadataStatus: 'fallback' };
    const profile = inferSkillProfile({ name: row.name ?? row.skillId, description: detail.description });
    const current = sourceAwareEditorial(applyEditorialOverride({
      ...base,
      id,
      date: asOf,
      rank: index + 1,
      url: detail.url,
      trendInstalls: Number(row.installs) || 0,
      heatInstalls: Number(row.installs) || 0,
      ...(hot ? {
        hourInstalls: Number(hot.installs) || 0,
        installsYesterday: Number(hot.installsYesterday) || 0,
        change: Number(hot.change) || 0,
        hotRank: hot.hotRank,
      } : {}),
      totalInstalls: detail.totalInstalls ?? base.totalInstalls,
      rawDescription: detail.description,
      descriptionZh: profile.descriptionZh,
      useCases: profile.useCases,
      category: profile.category,
      metadataStatus: detail.metadataStatus,
      capturedAt: generatedAt,
      sourceReportId: reportId,
    }));
    return {
      ...current,
      ...compareSkillTrend(current, previousLookup.get(id.toLowerCase())),
      comparisonDate: previousSnapshot?.asOf ?? null,
    };
  });
  const failures = skills.filter((skill) => skill.metadataStatus !== 'success').length;
  const requiredSourceFailures = [
    rows.length ? null : 'Trending',
    hotRows.length ? null : 'Hot',
    catalog.sourceStatus.sourceTotal > 0 && catalog.sourceStatus.pages > 0 ? null : 'All-time',
    catalog.stats.officialSkills > 0 && catalog.stats.officialOwners > 0 ? null : 'Official',
  ].filter(Boolean);
  const detailStatus = failures > Math.ceil(skills.length / 4) ? 'warning' : 'success';
  const status = requiredSourceFailures.length || detailStatus === 'warning' ? 'warning' : 'success';
  const comparable = skills.filter((skill) => skill.previousTrendInstalls != null);
  const comparison = {
    date: previousSnapshot?.asOf ?? null,
    comparableSkills: comparable.length,
    newEntries: skills.filter((skill) => skill.trendStatus === 'new').length,
    rising: skills.filter((skill) => skill.trendStatus === 'up').length,
    falling: skills.filter((skill) => skill.trendStatus === 'down').length,
    flat: skills.filter((skill) => skill.trendStatus === 'flat').length,
    hotEntered: skills.filter((skill) => skill.hotStatus === 'entered').length,
    hotExited: skills.filter((skill) => skill.hotStatus === 'exited').length,
  };
  return {
    schemaVersion: '1.0.0', generatedAt, asOf, view: 'trending', source: sourceHomepage,
    sourceStatus: [
      { id: 'skills-sh-trending', url: trendingEndpoint, mode: 'public_fallback', status: rows.length ? 'success' : 'failed', count: rows.length },
      { id: 'skills-sh-hot', url: hotEndpoint, mode: 'public_fallback', status: hotRows.length ? 'success' : 'failed', count: hotRows.length },
      { id: 'skills-sh-catalog', url: allTimeEndpoint, status: catalog.sourceStatus.sourceTotal > 0 && catalog.sourceStatus.pages > 0 ? 'success' : 'failed', count: catalog.sourceStatus.sourceTotal, pages: catalog.sourceStatus.pages, accumulatedCount: catalog.stats.totalSkills },
      { id: 'skills-sh-official', url: officialPage, status: catalog.stats.officialSkills > 0 && catalog.stats.officialOwners > 0 ? 'success' : 'failed', count: catalog.stats.officialSkills, owners: catalog.stats.officialOwners },
      { id: 'skills-sh-detail', url: 'https://skills.sh/{source}/{skillId}', status: detailStatus, count: skills.length - failures, failed: failures },
    ],
    comparison,
    catalog: { ...catalog.stats, path: '/data/main/skills-catalog.json', syncedAt: generatedAt },
    skills,
    candidates: [],
    run: {
      id: 'wagmi-skills', name: 'ark.insight Skill 目录与趋势同步', channel: 'skills', schedule: '每天 07:40',
      lastSuccess: status === 'success' ? generatedAt : previousSnapshot?.run?.lastSuccess ?? null,
      status, artifact: `/reports/skills-radar-${asOf}.md`,
      message: requiredSourceFailures.length
        ? `已生成 ${asOf} Skill 快照，但必需来源不可用或返回空数据：${requiredSourceFailures.join('、')}；未以旧数据冒充当天结果。`
        : `已同步 ${catalog.stats.totalSkills} 个 Skill，收录 ${catalog.stats.officialSkills} 个企业官方 Skill，并生成 24 小时趋势精选 ${skills.length} 条；其中 ${comparison.comparableSkills} 条完成与 ${comparison.date ?? '前日'} 的热度对比。`,
    },
    report: { id: reportId, title: `Skill 24 小时趋势 ${asOf}`, date: asOf, channel: 'skills', format: 'markdown', path: `/reports/skills-radar-${asOf}.md` },
  };
}

export function openDatabase(path) {
  const database = new DatabaseSync(path);
  database.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY, source TEXT NOT NULL, skill_id TEXT NOT NULL, name TEXT NOT NULL,
      source_type TEXT NOT NULL, url TEXT NOT NULL, install_url TEXT, total_installs INTEGER NOT NULL,
      weekly_installs_json TEXT NOT NULL, all_time_rank INTEGER, is_official INTEGER NOT NULL,
      official_owner TEXT, raw_description TEXT, description_zh TEXT NOT NULL, use_cases_json TEXT NOT NULL, category TEXT NOT NULL,
      hour_installs INTEGER, installs_yesterday INTEGER, change INTEGER, hot_rank INTEGER,
      first_seen_at TEXT NOT NULL, last_seen_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      availability_status TEXT NOT NULL DEFAULT 'active', missing_runs INTEGER NOT NULL DEFAULT 0,
      missing_since TEXT, last_missing_date TEXT, last_checked_at TEXT
    );
    CREATE INDEX IF NOT EXISTS skills_official_idx ON skills(is_official, official_owner);
    CREATE INDEX IF NOT EXISTS skills_rank_idx ON skills(all_time_rank);
    CREATE TABLE IF NOT EXISTS rankings (
      snapshot_date TEXT NOT NULL, view TEXT NOT NULL, skill_id TEXT NOT NULL, rank INTEGER NOT NULL,
      installs INTEGER NOT NULL, captured_at TEXT NOT NULL,
      PRIMARY KEY(snapshot_date, view, skill_id)
    );
    CREATE TABLE IF NOT EXISTS sync_runs (
      generated_at TEXT PRIMARY KEY, snapshot_date TEXT NOT NULL, total_skills INTEGER NOT NULL,
      official_skills INTEGER NOT NULL, new_skills INTEGER NOT NULL, status TEXT NOT NULL
    );
  `);
  const columns = new Set(database.prepare('PRAGMA table_info(skills)').all().map((column) => column.name));
  for (const [name, definition] of [
    ['hour_installs', 'INTEGER'], ['installs_yesterday', 'INTEGER'], ['change', 'INTEGER'], ['hot_rank', 'INTEGER'],
    ['availability_status', "TEXT NOT NULL DEFAULT 'active'"], ['missing_runs', 'INTEGER NOT NULL DEFAULT 0'],
    ['missing_since', 'TEXT'], ['last_missing_date', 'TEXT'], ['last_checked_at', 'TEXT'], ['raw_description', 'TEXT'],
  ]) {
    if (!columns.has(name)) database.exec(`ALTER TABLE skills ADD COLUMN ${name} ${definition}`);
  }
  database.exec('CREATE INDEX IF NOT EXISTS skills_availability_idx ON skills(availability_status, missing_runs)');
  return database;
}

function readExistingIds(database) {
  return new Set(database.prepare('SELECT id FROM skills').all().map((row) => row.id));
}

function readNewIdsForDate(database, date) {
  return new Set(database.prepare("SELECT id FROM skills WHERE substr(datetime(first_seen_at, '+8 hours'), 1, 10) = ?").all(date).map((row) => row.id));
}

function databaseSkill(row) {
  return {
    id: row.id,
    name: row.name,
    source: row.source,
    skillId: row.skill_id,
    sourceType: row.source_type,
    url: row.url,
    installUrl: row.install_url,
    totalInstalls: Number(row.total_installs) || 0,
    weeklyInstalls: JSON.parse(row.weekly_installs_json || '[]'),
    allTimeRank: row.all_time_rank == null ? null : Number(row.all_time_rank),
    isOfficial: Boolean(row.is_official),
    officialOwner: row.official_owner,
    rawDescription: row.raw_description || undefined,
    hourInstalls: row.hour_installs == null ? undefined : Number(row.hour_installs),
    installsYesterday: row.installs_yesterday == null ? undefined : Number(row.installs_yesterday),
    change: row.change == null ? undefined : Number(row.change),
    hotRank: row.hot_rank == null ? undefined : Number(row.hot_rank),
    descriptionZh: row.description_zh,
    useCases: JSON.parse(row.use_cases_json || '[]'),
    category: row.category,
    capturedAt: row.updated_at,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    lastCheckedAt: row.last_checked_at,
    availabilityStatus: row.availability_status || 'active',
    missingRuns: Number(row.missing_runs) || 0,
    missingSince: row.missing_since,
  };
}

export function readCumulativeCatalog(database, currentCatalog) {
  const skills = database.prepare(`
    SELECT * FROM skills
    ORDER BY CASE availability_status WHEN 'active' THEN 0 WHEN 'monitoring' THEN 1 ELSE 2 END,
      CASE WHEN all_time_rank IS NULL THEN 1 ELSE 0 END, all_time_rank, total_installs DESC, id
  `).all().map(databaseSkill);
  const activeSkills = skills.filter((skill) => skill.availabilityStatus === 'active').length;
  const monitoringSkills = skills.filter((skill) => skill.availabilityStatus === 'monitoring').length;
  const needsReviewSkills = skills.filter((skill) => skill.availabilityStatus === 'needs_review').length;
  const officialSkills = skills.filter((skill) => skill.isOfficial).length;
  const newSkills = skills.filter((skill) => shanghaiDate(new Date(skill.firstSeenAt)) === currentCatalog.asOf).length;
  return {
    ...currentCatalog,
    stats: {
      ...currentCatalog.stats,
      totalSkills: skills.length,
      activeSkills,
      monitoringSkills,
      needsReviewSkills,
      officialSkills,
      newSkills,
    },
    skills,
  };
}

export function syncDatabase(database, catalog, trendingRows, hotRows) {
  const upsert = database.prepare(`
    INSERT INTO skills (id, source, skill_id, name, source_type, url, install_url, total_installs,
      weekly_installs_json, all_time_rank, is_official, official_owner, raw_description, description_zh, use_cases_json,
      category, hour_installs, installs_yesterday, change, hot_rank, first_seen_at, last_seen_at, updated_at,
      availability_status, missing_runs, missing_since, last_missing_date, last_checked_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 0, NULL, NULL, ?)
    ON CONFLICT(id) DO UPDATE SET
      source=excluded.source, skill_id=excluded.skill_id, name=excluded.name, source_type=excluded.source_type,
      url=excluded.url, install_url=excluded.install_url, total_installs=excluded.total_installs,
      weekly_installs_json=excluded.weekly_installs_json, all_time_rank=excluded.all_time_rank,
      is_official=MAX(skills.is_official, excluded.is_official),
      official_owner=COALESCE(excluded.official_owner, skills.official_owner), raw_description=COALESCE(excluded.raw_description, skills.raw_description),
      description_zh=excluded.description_zh, use_cases_json=excluded.use_cases_json, category=excluded.category,
      hour_installs=excluded.hour_installs, installs_yesterday=excluded.installs_yesterday,
      change=excluded.change, hot_rank=excluded.hot_rank,
      last_seen_at=excluded.last_seen_at, updated_at=excluded.updated_at,
      availability_status='active', missing_runs=0, missing_since=NULL, last_missing_date=NULL,
      last_checked_at=excluded.last_checked_at
  `);
  const ranking = database.prepare(`
    INSERT INTO rankings (snapshot_date, view, skill_id, rank, installs, captured_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(snapshot_date, view, skill_id) DO UPDATE SET rank=excluded.rank, installs=excluded.installs, captured_at=excluded.captured_at
  `);
  database.exec('BEGIN');
  try {
    database.exec('CREATE TEMP TABLE current_skill_ids (id TEXT PRIMARY KEY)');
    const currentId = database.prepare('INSERT INTO current_skill_ids VALUES (?)');
    catalog.skills.forEach((skill) => upsert.run(
      skill.id, skill.source, skill.skillId, skill.name, skill.sourceType, skill.url, skill.installUrl,
      skill.totalInstalls, JSON.stringify(skill.weeklyInstalls), skill.allTimeRank, skill.isOfficial ? 1 : 0,
      skill.officialOwner, skill.rawDescription ?? null, skill.descriptionZh, JSON.stringify(skill.useCases), skill.category,
      skill.hourInstalls ?? null, skill.installsYesterday ?? null, skill.change ?? null, skill.hotRank ?? null,
      catalog.generatedAt, catalog.generatedAt, catalog.generatedAt, catalog.generatedAt,
    ));
    const updateEditorial = database.prepare(`
      UPDATE skills SET description_zh = ?, use_cases_json = ?, category = ?, updated_at = ?
      WHERE lower(id) = ?
    `);
    editorialOverrides.forEach((override, id) => updateEditorial.run(
      override.descriptionZh, JSON.stringify(override.useCases), override.category, catalog.generatedAt, id,
    ));
    catalog.skills.forEach((skill) => currentId.run(skill.id));
    database.prepare(`
      UPDATE skills SET
        missing_runs = CASE WHEN last_missing_date = ? THEN missing_runs ELSE missing_runs + 1 END,
        missing_since = COALESCE(missing_since, ?),
        availability_status = CASE
          WHEN (CASE WHEN last_missing_date = ? THEN missing_runs ELSE missing_runs + 1 END) >= 3 THEN 'needs_review'
          ELSE 'monitoring'
        END,
        last_missing_date = ?,
        last_checked_at = ?,
        updated_at = ?,
        hour_installs = NULL,
        installs_yesterday = NULL,
        change = NULL,
        hot_rank = NULL
      WHERE NOT EXISTS (SELECT 1 FROM current_skill_ids WHERE current_skill_ids.id = skills.id)
    `).run(catalog.asOf, catalog.generatedAt, catalog.asOf, catalog.asOf, catalog.generatedAt, catalog.generatedAt);
    database.exec('DROP TABLE current_skill_ids');
    database.prepare("DELETE FROM rankings WHERE snapshot_date = ? AND view IN ('trending', 'hot')").run(catalog.asOf);
    trendingRows.forEach((row, index) => ranking.run(catalog.asOf, 'trending', skillIdOf(row), index + 1, Number(row.installs) || 0, catalog.generatedAt));
    hotRows.forEach((row, index) => ranking.run(catalog.asOf, 'hot', skillIdOf(row), index + 1, Number(row.installs) || 0, catalog.generatedAt));
    const cumulative = database.prepare(`
      SELECT COUNT(*) total_skills, SUM(is_official) official_skills FROM skills
    `).get();
    const dailyNewSkills = database.prepare(
      "SELECT COUNT(*) new_skills FROM skills WHERE substr(datetime(first_seen_at, '+8 hours'), 1, 10) = ?",
    ).get(catalog.asOf);
    database.prepare('INSERT OR REPLACE INTO sync_runs VALUES (?, ?, ?, ?, ?, ?)').run(
      catalog.generatedAt, catalog.asOf, Number(cumulative.total_skills) || 0,
      Number(cumulative.official_skills) || 0, Number(dailyNewSkills.new_skills) || 0, 'success',
    );
    database.exec('COMMIT');
    return readCumulativeCatalog(database, catalog);
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  }
}

function markdownCell(value) {
  return cleanText(value, 240).replace(/\|/g, '\\|');
}

function buildReport(snapshot) {
  return `${[
    `# Skill 24 小时趋势 ${snapshot.asOf}`, '',
    `- 来源：[skills.sh](${snapshot.source})`,
    `- 口径：[Trending（24h）](https://skills.sh/trending)`,
    `- 全量目录：${snapshot.catalog.totalSkills} 个`,
    `- 企业官方：${snapshot.catalog.officialSkills} 个 / ${snapshot.catalog.officialOwners} 家`,
    `- 本次新增：${snapshot.catalog.newSkills} 个`,
    `- 运行状态：${snapshot.run.status}${snapshot.run.status === 'success' ? '' : `（${snapshot.run.message}）`}`, '',
    '> 仅收录元数据、中文说明与官方跳转，不保存 Skill 文件、不执行安装。热度不代表安全或质量。', '',
    `- 日快照对比：${snapshot.comparison.date ?? '暂无前日快照'}；可比 ${snapshot.comparison.comparableSkills} 条，新上榜 ${snapshot.comparison.newEntries} 条`, '',
    '| 排名 | Skill | 来源 | 24h 安装 | 较前日 24h | 排名变化 | 源站 Hot 同比 | 中文说明 | 使用场景 |',
    '| ---: | --- | --- | ---: | ---: | ---: | ---: | --- | --- |',
    ...snapshot.skills.map((skill) => `| ${skill.rank} | [${markdownCell(skill.name)}](${skill.url}) | ${markdownCell(skill.source)} | ${skill.trendInstalls} | ${skill.trendInstallChange == null ? '新上榜' : `${skill.trendInstallChange >= 0 ? '+' : ''}${skill.trendInstallChange}`} | ${skill.rankChange == null ? '--' : `${skill.rankChange >= 0 ? '+' : ''}${skill.rankChange}`} | ${skill.change == null ? '--' : `${skill.change >= 0 ? '+' : ''}${skill.change}`} | ${markdownCell(skill.descriptionZh)} | ${markdownCell(skill.useCases.join('；'))} |`),
    '',
  ].join('\n')}\n`;
}

async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, content, 'utf8');
  await rename(temporaryPath, path);
}

async function applyEditorialOnly(root) {
  const catalogPath = resolve(root, 'data/dev/skills-catalog.json');
  const queuePath = resolve(root, 'data/dev/skills-review-queue.json');
  const latestPath = resolve(root, 'data/dev/skills-radar-latest.json');
  const [catalog, queue, snapshot] = await Promise.all([
    readOptionalJson(catalogPath),
    readOptionalJson(queuePath),
    readOptionalJson(latestPath),
  ]);
  if (!catalog || !queue || !snapshot) throw new Error('Editorial-only refresh requires the current dev catalog, review queue, and latest snapshot.');

  const apply = (skill) => sourceAwareEditorial(applyEditorialOverride({ ...skill }));
  catalog.skills = catalog.skills.map(apply);
  queue.skills = queue.skills.map(apply);
  snapshot.skills = snapshot.skills.map(apply);
  const requiredIds = new Set(['skills-sh-trending', 'skills-sh-hot', 'skills-sh-catalog', 'skills-sh-official']);
  const requiredFailures = snapshot.sourceStatus.filter((source) => requiredIds.has(source.id) && (source.status !== 'success' || !(source.count > 0)));
  const detailSource = snapshot.sourceStatus.find((source) => source.id === 'skills-sh-detail');
  if (detailSource) detailSource.status = detailSource.failed > Math.ceil(snapshot.skills.length / 4) ? 'warning' : 'success';
  snapshot.run.status = requiredFailures.length || detailSource?.status === 'warning' ? 'warning' : 'success';
  if (requiredFailures.length) {
    snapshot.run.lastSuccess = null;
    snapshot.run.message = `已生成 ${snapshot.asOf} Skill 快照，但必需来源不可用或返回空数据：${requiredFailures.map((source) => source.id.replace('skills-sh-', '')).join('、')}；未以旧数据冒充当天结果。`;
  } else if (detailSource?.status === 'warning') {
    snapshot.run.lastSuccess = null;
    snapshot.run.message = `已生成 ${snapshot.asOf} Skill 快照，四个必需来源均可用；趋势详情成功 ${detailSource.count}/${snapshot.skills.length}，失败 ${detailSource.failed}，已保留 warning 状态且未用旧数据冒充当天结果。`;
  }

  const database = openDatabase(resolve(root, 'data/dev/skills-catalog.sqlite'));
  try {
    const updateEditorial = database.prepare(`
      UPDATE skills SET description_zh = ?, use_cases_json = ?, category = ?
      WHERE lower(id) = ?
    `);
    database.exec('BEGIN');
    editorialOverrides.forEach((override, id) => updateEditorial.run(
      override.descriptionZh, JSON.stringify(override.useCases), override.category, id,
    ));
    database.exec('COMMIT');
  } catch (error) {
    database.exec('ROLLBACK');
    throw error;
  } finally {
    database.close();
  }

  const historyPath = resolve(root, `data/dev/skills-history/${snapshot.asOf}.json`);
  const reportName = `skills-radar-${snapshot.asOf}.md`;
  await Promise.all([
    writeAtomic(catalogPath, `${JSON.stringify(catalog)}\n`),
    writeAtomic(queuePath, `${JSON.stringify(queue, null, 2)}\n`),
    writeAtomic(latestPath, `${JSON.stringify(snapshot, null, 2)}\n`),
    writeAtomic(historyPath, `${JSON.stringify(snapshot, null, 2)}\n`),
    writeAtomic(resolve(root, 'reports', reportName), buildReport(snapshot)),
    writeAtomic(resolve(root, 'public/reports', reportName), buildReport(snapshot)),
  ]);
  console.log(`Applied editorial metadata to ${catalog.skills.length} catalog entries without contacting remote sources.`);
}

async function run() {
  const dryRun = process.argv.includes('--dry-run');
  const editorialOnly = process.argv.includes('--editorial-only');
  const root = process.cwd();
  if (editorialOnly) {
    await applyEditorialOnly(root);
    return;
  }
  const maxPagesArg = process.argv.find((item) => item.startsWith('--max-pages='));
  const maxPages = Math.max(1, Number(maxPagesArg?.split('=')[1]) || Number.POSITIVE_INFINITY);
  const limitArg = process.argv.find((item) => item.startsWith('--limit='));
  const limit = Math.min(100, Math.max(1, Number(limitArg?.split('=')[1]) || defaultTrendingLimit));
  const sourcePagesArg = process.argv.find((item) => item.startsWith('--source-pages='));
  const sourceExpansionLimit = Math.max(0, Number(sourcePagesArg?.split('=')[1]) || (dryRun ? 5 : defaultSourceExpansionLimit));
  const asOf = shanghaiDate();
  const previousSnapshot = await readOptionalJson(resolve(root, `data/dev/skills-history/${dateMinus(asOf, 1)}.json`));
  const databasePath = resolve(root, 'data/dev/skills-catalog.sqlite');
  await mkdir(dirname(databasePath), { recursive: true });
  const database = openDatabase(databasePath);
  try {
    const previousIds = readExistingIds(database);
    readNewIdsForDate(database, shanghaiDate()).forEach((id) => previousIds.delete(id));
    const [allTime, trendingPayload, hotPayload, officialHtml] = await Promise.all([
      fetchAllTimeCatalog({ maxPages }), fetchJson(trendingEndpoint), fetchJson(hotEndpoint), fetchText(officialPage),
    ]);
    const expansions = await fetchSourceExpansions(allTime.rows, sourceExpansionLimit);
    const officialOwners = parseOfficialOwners(officialHtml);
    const officialRows = flattenOfficialOwners(officialOwners);
    const generatedAt = new Date().toISOString();
    const catalog = buildCatalog({
      allTimeRows: allTime.rows,
      sourceTotal: allTime.sourceTotal,
      pages: allTime.pages,
      officialRows,
      expandedRows: expansions.rows,
      trendingRows: trendingPayload.skills ?? [],
      hotRows: hotPayload.skills ?? [],
      officialOwnerCount: officialOwners.length,
      expansionSources: expansions.sources,
      expansionFailures: expansions.failures,
      generatedAt,
      asOf,
      previousIds,
    });
    const trendingRows = (trendingPayload.skills ?? []).slice(0, limit);
    const newSkills = catalog.skills.filter((skill) => !previousIds.has(skill.id));
    const detailRows = [...new Map([...trendingRows, ...newSkills].map((row) => [skillIdOf(row).toLowerCase(), row])).values()];
    const detailMetadata = await mapLimit(detailRows, 5, enrichTrendingRow);
    const metadataLookup = new Map(detailRows.map((row, index) => [skillIdOf(row).toLowerCase(), detailMetadata[index]]));
    newSkills.forEach((skill) => {
      const detail = metadataLookup.get(skill.id.toLowerCase());
      if (!detail?.description) return;
      const profile = inferSkillProfile({ name: skill.name, description: detail.description });
      skill.rawDescription = detail.description;
      skill.descriptionZh = profile.descriptionZh;
      skill.useCases = profile.useCases;
      skill.category = profile.category;
    });
    catalog.skills.forEach(applyEditorialOverride);
    catalog.skills.forEach(sourceAwareEditorial);
    const metadata = trendingRows.map((row) => metadataLookup.get(skillIdOf(row).toLowerCase()));
    if (dryRun) {
      const snapshot = buildTrendingSnapshot({ rows: trendingPayload.skills ?? [], hotRows: hotPayload.skills ?? [], metadata, catalog, previousSnapshot, generatedAt, asOf, limit });
      console.log(JSON.stringify({ asOf: snapshot.asOf, catalog: snapshot.catalog, sourceStatus: snapshot.sourceStatus, skills: snapshot.skills.slice(0, 3) }, null, 2));
      return;
    }

    const cumulativeCatalog = syncDatabase(database, catalog, trendingRows, hotPayload.skills ?? []);
    const snapshot = buildTrendingSnapshot({
      rows: trendingPayload.skills ?? [], hotRows: hotPayload.skills ?? [], metadata,
      catalog: cumulativeCatalog, previousSnapshot, generatedAt, asOf, limit,
    });
    const reviewQueue = {
      schemaVersion: '1.0.0',
      generatedAt,
      asOf,
      thresholdDays: 3,
      comparisonCadence: 'daily',
      total: cumulativeCatalog.stats.needsReviewSkills,
      skills: cumulativeCatalog.skills.filter((skill) => skill.availabilityStatus === 'needs_review'),
    };
    const reportName = `skills-radar-${snapshot.asOf}.md`;
    await writeAtomic(resolve(root, 'data/dev/skills-catalog.json'), `${JSON.stringify(cumulativeCatalog)}\n`);
    await writeAtomic(resolve(root, 'data/dev/skills-review-queue.json'), `${JSON.stringify(reviewQueue, null, 2)}\n`);
    await writeAtomic(resolve(root, 'data/dev/skills-radar-latest.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
    await writeAtomic(resolve(root, `data/dev/skills-history/${snapshot.asOf}.json`), `${JSON.stringify(snapshot, null, 2)}\n`);
    await writeAtomic(resolve(root, 'reports', reportName), buildReport(snapshot));
    await writeAtomic(resolve(root, 'public/reports', reportName), buildReport(snapshot));
    console.log(
      `Skill catalog accumulated ${cumulativeCatalog.stats.totalSkills} entries `
      + `(${cumulativeCatalog.stats.activeSkills} active, ${cumulativeCatalog.stats.monitoringSkills} monitoring, `
      + `${cumulativeCatalog.stats.needsReviewSkills} review, ${cumulativeCatalog.stats.newSkills} new), `
      + `${cumulativeCatalog.stats.officialSkills} official, ${snapshot.skills.length} trending, ${hotPayload.skills?.length ?? 0} hot.`,
    );
  } finally {
    database.close();
  }
}

const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isEntryPoint) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
