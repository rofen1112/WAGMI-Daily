import { mkdir, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import './network-fetch.mjs';

const sourceHomepage = 'https://skills.sh/';
const officialEndpoint = 'https://skills.sh/api/v1/skills?view=hot&page=0&per_page=100';
const publicEndpoint = 'https://skills.sh/api/skills/hot/1';
const defaultLimit = 20;

function shanghaiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function cleanText(value, limit = 1400) {
  return String(value ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, limit);
}

function readableName(value) {
  return cleanText(value, 100).replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const profiles = [
  {
    id: '浏览器自动化',
    pattern: /browser|playwright|puppeteer|web.?scrap|crawl|selenium|网页|浏览器/i,
    summary: '面向 AI Agent 的浏览器自动化能力，可处理网页访问、内容提取和交互流程。',
    useCases: ['抓取 JavaScript 渲染后的网页内容', '自动执行点击、输入和表单操作', '检查页面布局、截图或登录态流程'],
  },
  {
    id: '电商与商品研究',
    pattern: /amazon|e.?commerce|product.?research|shopify|shopping|product listing/i,
    summary: '用于电商商品研究与市场信息整理，帮助 Agent 形成结构化的选品或竞品判断。',
    useCases: ['整理商品卖点、价格与评价信号', '执行竞品和细分市场调研', '为选品、营销或采购准备研究摘要'],
  },
  {
    id: '设计与前端',
    pattern: /design|\bui\b|\bux\b|frontend|front-end|brand|tailwind|\bcss\b|figma|website|webapp/i,
    summary: '用于界面、品牌或前端实现工作的设计规范与执行流程，提升 Agent 产出的可用性和一致性。',
    useCases: ['生成或审核网页与应用界面', '建立品牌、色彩和排版规范', '把设计要求转化为可实现的前端方案'],
  },
  {
    id: '图像与多媒体',
    pattern: /image|video|audio|media|photo|illustration|animation|motion|canvas|caption|subtitle|remotion/i,
    summary: '面向图像、视频或多媒体内容生产的 Agent 工作流，覆盖生成、编辑和质量检查。',
    useCases: ['生成或编辑视觉与多媒体素材', '为内容生产准备提示词和处理流程', '检查素材尺寸、格式与视觉质量'],
  },
  {
    id: '办公与效率',
    pattern: /calendar|gmail|workspace|notion|slack|email|spreadsheet|excel|document|office/i,
    summary: '用于办公信息处理和协作自动化，帮助 Agent 操作日历、邮件、文档或团队工作流。',
    useCases: ['整理日历、邮件和待办事项', '处理表格、文档与协作信息', '自动化重复的办公和沟通流程'],
  },
  {
    id: '测试与质量',
    pattern: /test|testing|\bqa\b|quality|debug|lint|review|audit|verify|verification/i,
    summary: '用于软件测试、调试和质量审查，为 Agent 提供可重复的验证步骤与检查标准。',
    useCases: ['编写或执行自动化测试', '定位错误并检查回归风险', '进行代码、界面或交付物质量审查'],
  },
  {
    id: '安全与合规',
    pattern: /security|secure|vulnerability|pentest|compliance|privacy|threat/i,
    summary: '用于安全分析、风险识别或合规检查，帮助 Agent 按明确边界处理敏感任务。',
    useCases: ['审查配置、依赖和潜在漏洞', '整理安全风险与修复建议', '执行隐私或合规检查清单'],
  },
  {
    id: '数据与研究',
    pattern: /data|sql|database|research|analysis|analytics|report|scrape|search/i,
    summary: '用于数据收集、分析和研究整理，使 Agent 能把分散信息转化为结构化结论。',
    useCases: ['收集并清洗研究资料', '分析数据、指标或查询结果', '生成带来源的结构化研究报告'],
  },
  {
    id: 'Skill 管理',
    pattern: /find.?skills|writing.?skills|skill.?creator|skill.?installer|manage.?skills|skill.?management|prompt|context|memory|instruction/i,
    summary: '用于发现、组织或改进 Agent Skill，帮助团队维护可复用的能力与工作规范。',
    useCases: ['查找适合当前任务的 Skill', '整理和维护团队能力清单', '改进 Agent 的上下文与执行规范'],
  },
  {
    id: '开发与工程',
    pattern: /\bcode\b|coding|developer|\bcli\b|terminal|github|\bgit\b|deploy|docker|kubernetes|\bapi\b|\bsdk\b/i,
    summary: '面向软件开发和工程协作的 Agent 技能，封装编码、命令行、部署或开发工具使用流程。',
    useCases: ['辅助编码、重构和工程实现', '操作命令行、API 或开发者工具', '执行构建、部署和仓库协作任务'],
  },
];

const specificProfiles = [
  { pattern: /^argent-screen-recording$/i, category: '图像与多媒体', summary: '名称指向 Argent 项目的屏幕录制流程；skills.sh 当前未提供可审校的公开说明，录制范围、平台与输出格式仍需以来源页后续信息为准。', useCases: ['核对 Argent 屏幕录制的支持平台', '确认录制范围与输出格式', '在公开说明补充后再评估具体工作流'] },
  { pattern: /^vip-knowledge-inject$/i, category: '上下文与知识管理', summary: '名称指向知识注入流程；skills.sh 当前未提供可审校的公开说明，知识来源、注入目标与更新方式尚无法确认。', useCases: ['核对知识来源与授权边界', '确认注入目标和数据格式', '在说明充分后评估知识更新流程'] },
  { pattern: /^platform-encryption-configure$/i, category: '安全与合规', summary: '名称与 Salesforce 发布方指向平台加密配置；skills.sh 当前未提供可审校的公开说明，支持的加密对象与配置步骤需由来源页确认。', useCases: ['核对 Salesforce 平台加密的适用对象', '确认配置前提与权限要求', '依据来源说明审查加密配置范围'] },
  { pattern: /^platform-dataspace-access-configure$/i, category: '身份与访问管理', summary: '名称与 Salesforce 发布方指向数据空间访问配置；skills.sh 当前未提供可审校的公开说明，权限模型与支持范围需由来源页确认。', useCases: ['核对数据空间的访问对象', '确认角色与权限配置范围', '依据来源说明审查访问控制设置'] },
  { pattern: /^api-review$/i, category: '代码审查与协作', summary: '名称指向 API 审查流程；skills.sh 当前未提供可审校的公开说明，审查对象、规则和输出格式尚无法确认。', useCases: ['核对 API 审查的输入范围', '确认接口设计或实现检查规则', '在规则明确后用于审查协作'] },
  { pattern: /^level-design$/i, category: '游戏开发', summary: '名称与发布方指向游戏关卡设计；skills.sh 当前未提供可审校的公开说明，支持的引擎、设计阶段与交付形式尚无法确认。', useCases: ['核对支持的游戏引擎与项目类型', '确认关卡设计覆盖的阶段', '在说明充分后评估关卡工作流'] },
  { pattern: /^taste$/i, category: '设计与前端', summary: '名称指向设计品味或视觉质量相关流程；skills.sh 当前未提供可审校的公开说明，具体审查标准与适用界面尚无法确认。', useCases: ['核对其设计审查标准', '确认适用的界面或视觉任务', '在公开说明补充后再用于设计工作'] },
  { pattern: /^pr-finish$/i, category: '代码审查与协作', summary: '名称指向 Pull Request 收尾流程；skills.sh 当前未提供可审校的公开说明，检查项、合并条件与自动化范围尚无法确认。', useCases: ['核对 PR 收尾检查项', '确认合并前的验证条件', '在规则明确后用于协作流程'] },
  { pattern: /^pre-session-end$/i, category: 'Agent 工作流', summary: '名称指向会话结束前的收尾流程；skills.sh 当前未提供可审校的公开说明，状态保存、总结或清理范围尚无法确认。', useCases: ['核对会话结束前的检查项', '确认是否保存状态或生成总结', '在说明充分后评估收尾流程'] },
  { pattern: /^launch-with-aws$/i, category: '云平台与运维', summary: '名称与 AWS 发布方指向在 AWS 上启动或发布项目；skills.sh 当前未提供可审校的公开说明，支持的服务、部署路径与权限要求尚无法确认。', useCases: ['核对支持的 AWS 服务', '确认发布路径与权限前提', '在来源说明充分后规划部署'] },
  { pattern: /^malware-awareness-bitdefender-crack-fraud$/i, category: '安全与合规', summary: '名称指向与 Bitdefender 破解诈骗相关的恶意软件安全意识内容；skills.sh 当前未提供可审校的公开说明，不据此推断检测或处置能力。', useCases: ['核对公开的安全意识说明', '确认是否仅用于诈骗风险教育', '避免在能力未证实时用于恶意软件处置'] },
  { pattern: /^bench-read$/i, category: 'Agent 工作流', summary: 'skills.sh 当前未提供可审校的公开说明；名称仅指向读取某类 bench 内容，具体对象、数据范围与输出尚无法确认。', useCases: ['核对 bench 所指的具体对象', '确认读取范围和输出格式', '在信息充分后再评估使用场景'] },
  { pattern: /^desk-journal$/i, category: 'Agent 工作流', summary: 'skills.sh 当前未提供可审校的公开说明；名称指向 desk 工作流中的日志或日记记录，具体数据与持久化方式尚无法确认。', useCases: ['核对 desk journal 的记录对象', '确认数据保存与读取方式', '在说明充分后再用于工作流记录'] },
  { pattern: /^desk-open$/i, category: 'Agent 工作流', summary: 'skills.sh 当前未提供可审校的公开说明；名称指向打开 desk 工作区或上下文，具体对象与交互范围尚无法确认。', useCases: ['核对 desk 所指的工作区对象', '确认打开操作的输入与状态', '在说明充分后再用于会话流程'] },
  { pattern: /^azure-container-registry-cli$/i, category: '云平台与运维', summary: '名称指向通过 CLI 操作 Azure Container Registry；skills.sh 当前未提供可审校的公开说明，覆盖的仓库操作与认证方式需由来源页确认。', useCases: ['核对 Azure Container Registry 的支持操作', '确认 CLI 认证与权限要求', '在来源说明充分后管理容器镜像仓库'] },
  { pattern: /^okx-activity$/i, category: '区块链与链上数据', summary: '名称与 OKX OnchainOS 发布方指向链上活动相关流程；skills.sh 当前未提供可审校的公开说明，查询对象、网络与数据口径尚无法确认。', useCases: ['核对支持的链与活动类型', '确认查询对象和数据口径', '在说明充分后评估链上活动分析'] },
  { pattern: /^muse$/i, category: 'Agent 工作流', summary: 'skills.sh 当前未提供可审校的公开说明；仅凭 Muse 名称无法确认具体能力、输入或适用场景。', useCases: ['核对来源页后续公开说明', '确认输入输出与维护方定位', '在能力明确后再评估使用场景'] },
  { pattern: /^higgsfield-websites$/i, category: '网站开发与部署', summary: '通过 Higgsfield CLI 创建、编辑和部署基于 React 19、TanStack Start SSR 与 Cloudflare 的全栈网站。', useCases: ['创建 Higgsfield 全栈网站项目', '编辑 React 与 TanStack Start 网站', '把网站部署到 Cloudflare 环境'] },
  { pattern: /^higgsfield-marketplace-cards$/i, category: '电商与商品研究', summary: '通过 Higgsfield 生成电商平台商品图卡，包括合规主图、辅助商品图和 A+ 风格内容模块。', useCases: ['制作电商平台合规商品主图', '生成多角度辅助商品图', '整理 A+ 风格商品详情模块'] },
  { pattern: /^higgsfield-video-explainer$/i, category: '图像与多媒体', summary: '按有序的 10 秒片段制作非写实旁白解说或故事视频，统一叙述者、视觉风格、配音和背景音乐。', useCases: ['制作分段式旁白解说视频', '统一多片段的角色与视觉风格', '组合配音、音乐和画面生成完整故事'] },
  { pattern: /^genshijin-commit$/i, category: '代码审查与协作', summary: '生成符合 Conventional Commits 的日文或英文精简提交信息，标题控制在 50 字符内并强调变更原因。', useCases: ['为暂存变更生成提交信息', '把提交标题压缩到 50 字符内', '用日文或英文解释变更原因'] },
  { pattern: /^genshijin-compress$/i, category: '上下文与记忆管理', summary: '把 CLAUDE.md、待办和设置等自然语言记忆文件压缩为低令牌格式，同时保留技术内容、代码、URL 和结构。', useCases: ['压缩 Agent 记忆文件的令牌占用', '保留代码与链接的同时精简说明', '维护压缩版与人类可读原始副本'] },
  { pattern: /^genshijin-help$/i, category: 'Skill 管理', summary: '一次性展示 genshijin 模式、Skill 和命令的快速参考卡，不切换模式或持久化状态。', useCases: ['查询 genshijin 可用模式', '快速查找 Skill 与命令', '在不改变当前状态时查看帮助'] },
  { pattern: /^genshijin-review$/i, category: '代码审查与协作', summary: '把 Pull Request 审查意见压缩为逐行的“位置、问题、修正”格式，减少前置说明并突出可操作信号。', useCases: ['生成精简的 PR 审查评论', '按位置列出问题与修正建议', '压缩日文代码审查反馈'] },
  { pattern: /^gmgn-holder-analysis$/i, category: '金融与市场数据', summary: '分析代币持有者结构，包括筹码分布、入场成本、鲸鱼、开发者与 KOL 行为，以及公开摘要列出的风险钱包信号。', useCases: ['分析代币持仓与筹码分布', '观察鲸鱼、开发者和 KOL 行为', '整理公开标记的风险钱包信号'] },
  { pattern: /^thermo-nuclear-review$/i, category: '代码审查与协作', summary: '对分支或 Pull Request 的代码差异进行深入安全性与正确性审计，并整理高影响问题。', useCases: ['深度审查分支代码变更', '审计 PR 差异中的安全问题', '检查实现正确性并整理关键缺陷'] },
  { pattern: /^groundcover-cli$/i, category: '云平台与运维', summary: '通过 groundcover Go CLI 管理仪表盘、监控项、静默规则、通知路由、API 密钥和策略等可观测性资源。', useCases: ['管理 groundcover 仪表盘与监控项', '维护静默和通知路由', '查看或更新 API 密钥与策略'] },
  { pattern: /^bulk-operations$/i, descriptionPattern: /hubspot|jsonl|batch read/i, category: '销售与 CRM', summary: '为 HubSpot CLI 批量操作提供 JSONL 管道、批量读取、分页，以及高风险操作的预演、摘要和确认流程。', useCases: ['批量读取和分页处理 HubSpot 数据', '用 JSONL 管道组织 CLI 操作', '在破坏性批处理前执行预演与确认'] },
  { pattern: /^competitor-ad-intelligence$/i, category: '营销与增长', summary: '分析和拆解竞争对手的付费广告，整理广告创意、信息角度、落地页和投放模式等公开信号。', useCases: ['研究竞争对手的付费广告', '拆解广告创意与信息角度', '比较广告与落地页的转化路径'] },
  { pattern: /^webmcpify$/i, category: '开发与工程', summary: '为现有 Web 应用设计 WebMCP 工具清单并完成集成、真实浏览器验证和针对性修复，使应用可被 Agent 调用。', useCases: ['为 Web 应用规划 WebMCP 工具', '集成并验证 Agent 可调用接口', '在真实浏览器中修复集成问题'] },
  { pattern: /^amazon-search-listing$/i, category: '电商与商品研究', summary: '从 Amazon 搜索结果、关键词搜索页或分类浏览页提取结构化商品列表。', useCases: ['抓取 Amazon 关键词搜索结果', '整理分类页商品列表', '提取商品信息用于市场研究'] },
  { pattern: /^crm-data-quality$/i, category: '销售与 CRM', summary: '查找 HubSpot CRM 中字段不完整的记录，批量规范字段值、合并重复对象并审计自定义属性。', useCases: ['定位字段不完整的 CRM 记录', '批量规范字段值并合并重复对象', '审计 HubSpot 自定义属性'] },
  { pattern: /^codex-theme-installer$/i, category: '开发工具与配置', summary: '从 codexthemes.ai 获取已发布的 Codex 主题源文件，并写入本地主题库；公开摘要说明匿名使用受免费额度限制。', useCases: ['获取已发布的 Codex 主题', '把主题源文件加入本地主题库', '核对匿名免费额度与主题来源'] },
  { pattern: /^herdr$/i, category: 'Agent 工作流', summary: '控制面向编码 Agent 的 Herdr 终端多路复用器，用于查看或操作窗格、布局和会话。', useCases: ['查看 Herdr 窗格与布局', '控制编码 Agent 的终端会话', '在明确指定 Herdr 时执行窗格操作'] },
  { pattern: /^page-text-compare$/i, category: '测试与质量', summary: 'skills.sh 公开摘要仅将其标为可用的 AI Agent Skill；名称指向页面文本比较，但比较范围、输入形式和判定规则暂无可审校说明。', useCases: ['核对 skills.sh 后续公开说明', '确认页面文本比较的输入与范围', '在规则明确后再用于质量检查'] },
  { pattern: /^migrate-to-parallel$/i, category: '搜索与信息检索', summary: '把 Exa、Tavily、Perplexity 或 Firecrawl 的网页数据集成迁移到相应的 Parallel 产品，同时保持应用行为。', useCases: ['把现有网页搜索集成迁移到 Parallel', '替换 Exa、Tavily 或 Perplexity 接入', '迁移 Firecrawl 流程并核对应用行为'] },
  { pattern: /^popai-powerpoint-pptx$/i, category: '演示文稿', summary: '通过 PopAI API 创建 PPT 演示文稿、幻灯片和 Deck，并使用公开摘要所述的内置研究能力准备内容。', useCases: ['通过 PopAI API 创建演示文稿', '生成 PPT 幻灯片与 Deck 内容', '为演示文稿整理研究材料'] },
  { pattern: /^remotion-to-hyperframes$/i, category: '图像与多媒体', summary: '把现有 Remotion React composition 的源代码迁移为 HyperFrames HTML，仅用于明确提出的移植或转换任务。', useCases: ['把 Remotion composition 移植到 HyperFrames', '将 React 视频源转换为 HTML', '核对迁移前后的结构与表现'] },
  { pattern: /^5dive-cli$/i, category: '多 Agent 编排', summary: '在 5dive runtime VM 上通过本地 CLI 创建、查看、通信和结束同级 Agent，并管理共享任务队列与组织图。', useCases: ['创建并查看同级 Agent', '向运行中的 Agent 发送消息', '管理共享任务队列和组织关系'] },
  { pattern: /^openagent$/i, category: 'Agent 身份与展示', summary: '创建、校验和渲染 OpenAgent persona，并生成可分享的 holo 身份卡。', useCases: ['编写 OpenAgent persona', '校验 Agent 身份卡配置', '渲染并分享 holo 身份卡'] },
  { pattern: /^affirmations$/i, category: 'Agent 工作流', summary: '在陷入停滞、反复尝试或受挫时，用简短肯定语帮助 Agent 重新聚焦，并把下一步收敛为一个可执行动作。', useCases: ['在任务卡住时重置思路', '从反复尝试中收敛下一步', '在受挫后恢复清晰的执行节奏'] },
  { pattern: /^dynamic-workflow-mode$/i, category: 'Agent 工作流', summary: '为动态 Agent 工作流设计任务内执行框架、评估门禁和可复用 Skill 提取流程。', useCases: ['为自适应 Agent 任务设计执行框架', '建立任务内评估与质量门禁', '从重复工作中提取可复用 Skill'] },
  { pattern: /^deep-skill-finder$/i, category: 'Skill 管理', summary: 'skills.sh 详情页未提供可审校的公开说明；当前仅能确认该条目用于查找 Skill，具体检索范围与方式以来源页后续公开信息为准。', useCases: ['核对 skills.sh 详情页后续公开说明', '确认来源方与条目维护状态', '在信息充分后再评估检索范围'] },
  { pattern: /^attribution$/i, category: '营销与增长', summary: '分析营销渠道对转化和收入的贡献，比较归因模型，并处理不同分析工具之间的结果差异。', useCases: ['比较首次、末次与多触点归因', '分析渠道对转化和收入的贡献', '排查广告与分析平台数据差异'] },
  { pattern: /^prototype$/i, descriptionPattern: /visual picker|versions of a UI/i, category: '设计与前端', summary: '为同一界面需求生成多个有实质差异的原型版本，并通过可视化选择器比较和选定方案。', useCases: ['探索同一界面的多种设计方向', '实时比较不同原型版本', '选定一个方案继续实现'] },
  { pattern: /^extension-to-functions-codebase$/i, category: '云平台与运维', summary: '把 Firebase Extension 转换为独立的 Cloud Functions 代码库或可发布 npm 包，并处理触发器升级与生命周期配置。', useCases: ['把 Firebase Extension 迁移为独立函数', '将 V1 触发器升级为 V2', '配置函数生命周期钩子与安全声明'] },
  { pattern: /^game-feel$/i, category: '游戏开发', summary: '使用屏幕震动、命中停顿、缓动、挤压拉伸、击退和视听反馈等引擎无关手法增强游戏操作反馈。', useCases: ['增强攻击、跳跃和拾取反馈', '设计命中停顿与屏幕震动', '为角色动作加入缓动和视听层次'] },
  { pattern: /^k6-perf-test-website$/i, category: '性能测试', summary: '为公开网站构建 k6 协议层与浏览器层混合性能测试，并设置 SLO 阈值、负载监控和调查流程。', useCases: ['对网站执行负载与压力测试', '建立基于 SLO 的性能阈值', '准备监控与性能问题调查流程'] },
  { pattern: /^crm-lookup$/i, category: '销售与 CRM', summary: '按 ID、邮箱、域名或名称片段查找 CRM 记录，并沿关联关系整理完整客户信息。', useCases: ['查找联系人、公司或交易记录', '按邮箱或域名定位客户', '查看关联记录形成账户全貌'] },
  { pattern: /^academic-research-suite$/i, category: '学术研究与写作', summary: '提供文献综述、研究设计、论文写作、稿件审查、引文核对和修订等学术研究工作流。', useCases: ['开展文献综述或系统性回顾', '规划研究与实验方案', '起草、审查和修订学术稿件'] },
  { pattern: /^redesign-existing-projects$/i, category: '设计与前端', summary: '审查并升级现有网站或应用的视觉与交互质量，同时保持既有功能和技术框架。', useCases: ['审查现有产品的设计问题', '升级页面排版、配色与组件质感', '在不破坏功能的前提下重做界面'] },
  { pattern: /^intended-vs-implemented$/i, category: '代码审查与协作', summary: '对照文档化意图与实际代码证据，识别系统承诺和实现之间的一致性缺口。', useCases: ['审计代码是否符合产品文档', '核对权限实现与既定规则', '发现通用扫描器难以识别的意图偏差'] },
  { pattern: /^rstest-best-practices$/i, category: '测试与质量', summary: '整理 Rstest 的配置、命令行、测试编写、Mock、快照、覆盖率、多项目、CI、性能和调试实践。', useCases: ['搭建或审查 Rstest 测试项目', '编写 Mock、快照和 DOM 测试', '排查覆盖率、CI 与性能问题'] },
  { pattern: /^a-stock-data$/i, category: '金融与市场数据', summary: '在需要编程取数时，通过公开说明列出的多种数据源获取 A 股行情、研报、资金、财务、公告和市场信号。', useCases: ['编程获取 A 股行情与 K 线', '整理财务、公告和研报数据', '汇总资金面与市场信号'] },
  { pattern: /^remotion-multimedia$/i, category: '图像与多媒体', summary: 'skills.sh 公开说明仅表明其用于在 Remotion 工作流中操作 Mediabunny；具体媒体处理范围以来源页公开信息为准。', useCases: ['核对 Remotion 与 Mediabunny 的公开集成说明', '确认待处理媒体类型与接口范围', '在信息充分后设计多媒体处理流程'] },
  { pattern: /^coll_ai-image-generation$/i, category: '图像与多媒体', summary: 'skills.sh 详情页仅将其标注为可安装的 AI Agent Skill；除名称指向图像生成外，具体模型、编辑能力与适用范围暂无可审校公开说明。', useCases: ['核对 skills.sh 详情页后续公开说明', '确认来源方与条目维护状态', '在信息充分后再评估图像生成范围'] },
  { pattern: /^coll_ai-video-generation$/i, category: '图像与多媒体', summary: 'skills.sh 详情页仅将其标注为可安装的 AI Agent Skill；除名称指向视频生成外，具体模型、编辑能力与适用范围暂无可审校公开说明。', useCases: ['核对 skills.sh 详情页后续公开说明', '确认来源方与条目维护状态', '在信息充分后再评估视频生成范围'] },
  { pattern: /^coll_ai-music$/i, category: '音频与语音', summary: 'skills.sh 详情页仅将其标注为可安装的 AI Agent Skill；除名称指向 AI 音乐外，具体生成、编辑能力与适用范围暂无可审校公开说明。', useCases: ['核对 skills.sh 详情页后续公开说明', '确认来源方与条目维护状态', '在信息充分后再评估音乐处理范围'] },
  { pattern: /^claude-handoff$/i, category: 'Agent 工作流', summary: '把当前对话和未完成工作交接给新的后台 Agent，使其从现有上下文继续执行。', useCases: ['把长任务交接给新的后台 Agent', '在会话切换时保留工作上下文', '让后续 Agent 接续未完成步骤'] },
  { pattern: /^wizard$/i, descriptionPattern: /bash wizard|手动流程/i, category: '开发与工程', summary: '生成交互式 Bash 向导，引导用户完成第三方配置、一次性迁移或状态切换等手动流程。', useCases: ['为第三方服务配置制作交互向导', '引导一次性迁移或状态切换', '逐步收集并确认配置值'] },
  { pattern: /^team-agent-orchestration$/i, category: 'Agent 工作流', summary: '使用工作项、所有权、Agent 看板、合并门禁和控制面交接来编排多 Agent 团队。', useCases: ['给 Agent 团队分配工作项与所有权', '用看板跟踪多 Agent 进度', '设置合并门禁和任务交接'] },
  { pattern: /^at-email-cli$/i, category: '办公与效率', summary: '通过 AgentTeam Email CLI 操作 Agent 邮箱，覆盖状态检查、收件箱浏览和安全读取邮件等公开能力。', useCases: ['检查 Agent 邮箱状态', '列出并浏览收件箱消息', '读取需要处理的邮件内容'] },
  { pattern: /^financial-deep-research$/i, category: '金融与市场数据', summary: '开展多来源金融研究，综合市场、公司与监管信息，并在报告中保留核验依据与合规事项。', useCases: ['研究公司与行业财务表现', '综合多来源市场信息', '跟踪监管事项并整理研究结论'] },
  { pattern: /^loops-api$/i, category: '开发与工程', summary: '在应用代码、后端服务、Webhook 或服务端自动化中集成 Loops API。', useCases: ['从应用后端调用 Loops API', '处理 Loops Webhook 事件', '构建服务端消息自动化流程'] },
  { pattern: /^gpt-image$/i, category: '图像与多媒体', summary: '通过公开说明中的 GPT-Image 模型生成和编辑图片，覆盖文生图、局部重绘与蒙版编辑。', useCases: ['根据文字生成图片', '编辑已有图片内容', '使用蒙版进行局部重绘'] },
  { pattern: /^happyhorse$/i, category: '图像与多媒体', summary: '通过公开说明中的 HappyHorse 模型生成和编辑视频，覆盖文生视频、图生视频与参考视频流程。', useCases: ['根据文字生成视频', '把图片转换为视频', '参考现有素材编辑视频'] },
  { pattern: /^p-image$/i, category: '图像与多媒体', summary: '通过公开说明中的 P-Image 模型生成或编辑图片，并支持相应的 LoRA 变体。', useCases: ['根据文字生成图片', '编辑现有图片', '使用公开模型变体制作视觉素材'] },
  { pattern: /^p-video$/i, category: '图像与多媒体', summary: '通过公开说明中的 P-Video 与 WAN 模型生成视频，覆盖文生视频、图生视频和音频驱动流程。', useCases: ['根据文字生成视频', '把图片转换为视频', '为视频生成流程加入音频输入'] },
  { pattern: /^p-video-avatar$/i, category: '图像与多媒体', summary: '把人像图片与文本或语音输入组合为说话人头像视频，并使用公开说明中的内置语音合成能力。', useCases: ['把人像制作成口播视频', '为头像视频生成语音', '制作虚拟讲解或演示素材'] },
  { pattern: /^seedance$/i, category: '图像与多媒体', summary: '通过公开说明中的 Seedance 模型生成视频，覆盖文生视频、图生视频、参考视频与同步音频。', useCases: ['根据文字生成视频', '从图片生成动态片段', '使用参考素材和同步音频制作视频'] },
  { pattern: /^php-development$/i, category: '开发与工程', summary: '提供 PHP 8+ 开发参考，涵盖 SOLID 原则、PSR 标准与现代 PHP 工程实践。', useCases: ['编写或重构 PHP 8+ 代码', '按 PSR 标准审查项目', '应用 SOLID 原则改进 PHP 结构'] },
  { pattern: /^pr-feedback-quality-gate$/i, category: '代码审查与协作', summary: '跟踪 Pull Request 反馈，处理审查意见或合并冲突，验证修复，并在提交或推送前进行只读复核。', useCases: ['整理并处理 PR 审查意见', '解决合并冲突后验证修复', '在提交或推送前执行只读复核'] },
  { pattern: /^cubox$/i, category: '文档与知识', summary: '通过 Cubox CLI 搜索、阅读和利用已保存内容，并对个人阅读库执行语义查询。', useCases: ['搜索个人收藏内容', '读取并整理已保存文章', '对阅读库执行语义检索'] },
  { pattern: /^cron-jobs$/i, category: '开发与工程', summary: '整理 Rivet Actors 中一次性、日历式和固定间隔任务的持久化调度模式。', useCases: ['安排一次性后台任务', '建立按日历触发的任务', '实现固定间隔的持久调度'] },
  { pattern: /^higgsfield-game-generation$/i, category: '游戏开发', summary: '使用公开说明中的 Higgsfield CLI 构建和迭代浏览器游戏，并生成精灵、纹理、3D 动画与音频等游戏素材。', useCases: ['创建和迭代浏览器游戏', '生成精灵图与可平铺纹理', '制作 3D 角色动画和游戏音频'] },
  { pattern: /^impeccable$/i, category: '设计与前端', summary: '设计、审查和改进前端界面，覆盖视觉层级、信息架构、可访问性、响应式布局、动效和设计系统。', useCases: ['设计或重构网站与产品界面', '审查可访问性和响应式表现', '优化排版、色彩、布局与微交互'] },
  { pattern: /^connect-recommend$/i, category: '支付与订阅', summary: 'skills.sh 详情页未提供可审校的公开说明；当前仅能确认条目名称为 Connect Recommend，具体能力与适用范围需以来源页后续公开信息为准。', useCases: ['核对 skills.sh 详情页后续公开说明', '确认来源方与条目维护状态', '在信息充分后再评估适用范围'] },
  { pattern: /^azure-quotas$/i, category: '云平台与运维', summary: '检查和管理不同 Azure 区域的配额与用量，用于部署规划和容量验证。', useCases: ['部署前核对资源配额与当前用量', '比较不同 Azure 区域的可用容量', '准备配额提升申请并跟踪状态'] },
  { pattern: /^azure-upgrade$/i, category: '云平台与运维', summary: 'skills.sh 详情页未提供公开 Summary；当前仅能确认该条目来自 Microsoft Azure 官方目录，具体升级范围以来源页后续公开信息为准。', useCases: ['核对 skills.sh 详情页后续公开说明', '查看 Microsoft Azure 来源仓库的公开信息', '确认升级对象与版本范围后再采用'] },
  { pattern: /^caveman$/i, category: '沟通与可访问性', summary: '把回复压缩为省略填充语和客套语的短句，在减少篇幅的同时保留技术信息。', useCases: ['把技术回复改成极简短句', '在低令牌预算下压缩沟通', '减少解释中的填充语和重复内容'] },
  { pattern: /^documenting-decisions$/i, category: '文档与知识', summary: '在 Agent 生成的代码中标记需要人工关注的关键决策，并支持规划、实现、修复和按需审查场景。', useCases: ['在代码注释中标出关键决策', '审查差异中的决策标记是否充分', '把人工注意力引导到高影响选择'] },
  { pattern: /^domain-modeling$/i, category: '产品与架构', summary: '建立和完善项目领域模型，统一领域术语、通用语言与相关架构决策。', useCases: ['梳理项目领域术语', '建立团队通用语言', '记录与领域模型有关的架构决策'] },
  { pattern: /^grilling$/i, category: '决策与规划', summary: '通过结构化多选问题压力测试计划、决策或想法，并记录选择及否决理由。', useCases: ['压力测试产品或工程计划', '用多选问题收敛关键决策', '记录选项取舍与否决理由'] },
  { pattern: /^tdd$/i, category: '测试与质量', summary: '按红灯、绿灯、重构流程开展测试驱动开发，并保留可审计的提交节奏。', useCases: ['用测试先行方式实现新功能', '为缺陷修复建立回归测试', '按红绿重构节奏完成行为变更'] },
  { pattern: /^to-spec$/i, category: '产品与需求', summary: '把当前对话中已经讨论的内容综合为规格说明，并发布到项目问题跟踪器。', useCases: ['把已讨论需求整理为规格', '将会话结论发布到项目跟踪器', '在不追加访谈的情况下沉淀共识'] },
  { pattern: /^to-tickets$/i, category: '项目管理', summary: '把计划、规格或当前对话拆成带阻塞关系的细粒度任务，并发布到项目跟踪器。', useCases: ['把已批准方案拆成任务单', '标记任务之间的阻塞关系', '把实施计划发布到项目跟踪器'] },
  { pattern: /^writing-adrs$/i, category: '文档与知识', summary: '定义架构决策记录的格式、编号和适用条件，用于编写或审查 ADR。', useCases: ['编写新的架构决策记录', '判断决策是否值得记录为 ADR', '审查 ADR 的格式、编号和内容'] },
  { pattern: /^google-maps-scraper$/i, category: '数据与研究', summary: '从 Google Maps 公开页面整理本地商家、评价、评分和联系信息，用于本地市场与线索研究。', useCases: ['查找指定地区和行业的商家', '整理商家评分与公开评价', '汇总本地市场研究所需的公开联系信息'] },
  { pattern: /^transitions-polish$/i, category: '设计与前端', summary: '依据 transitions.dev 的运动令牌细化已有动效，调整时长、距离、缩放、模糊、缓动和触发时机。', useCases: ['审查并替换零散的动效参数', '调整转场时长、缓动和错峰节奏', '统一打开关闭与悬停动效的不对称规则'] },
  { pattern: /^export-download-debugging$/i, category: '开发与工程', summary: '诊断浏览器、预览或 Electron 中的导出与下载失败，重点排查图片导出、文件写入和空文件问题。', useCases: ['排查导出后生成 0 KB 文件', '诊断 Blob、Data URL 或保存对话框问题', '定位 File System Access API 写入失败'] },
  { pattern: /^no-ai-slop$/i, category: '写作与内容', summary: '识别机械化 AI 文风，或在保留作者个人声音的前提下把草稿改得更清晰、直接和自然。', useCases: ['检查文本是否带有明显 AI 套话', '把草稿改得更直接自然', '润色内容同时保留作者语气'] },
  { pattern: /^loop-me$/i, descriptionPattern: /工作流规格|workflow spec/i, category: '产品与需求', summary: '围绕用户想构建的工作流开展规格访谈，逐步补齐目标、约束和流程细节。', useCases: ['访谈并梳理工作流需求', '补齐规格中的目标与约束', '把模糊想法收敛为可讨论流程'] },
  { pattern: /^i-have-adhd$/i, category: '沟通与可访问性', summary: '按公开说明把回复组织成更适合注意力缺陷读者阅读的结构，突出下一步、编号步骤与会话状态。', useCases: ['把长任务拆成清晰的下一步', '用编号和状态提示降低阅读负担', '为解释、规划或调试回复压缩旁支信息'] },
  { pattern: /^pick-ui-library$/i, category: '设计与前端', summary: '从公开说明列出的前端组件与工具范围中，为特定界面任务选择合适的库。', useCases: ['为图表、拖放或虚拟列表选择库', '比较表单与交互组件方案', '为前端任务整理候选依赖'] },
  { pattern: /^byted-web-search$/i, category: '搜索与信息检索', summary: '通过公开说明所述的豆包搜索 API 返回网页或图片搜索结果，用于需要联网事实的检索任务。', useCases: ['搜索近期网页信息', '查找图片结果与来源链接', '为时效性事实准备检索材料'] },
  { pattern: /^strengthen$/i, descriptionPattern: /vigiles|guidance\(\)|enforce\(\)/i, category: '代码质量规则', summary: '检查 Vigiles 规范中的 guidance 规则，并寻找现有代码检查器规则作为可执行约束依据。', useCases: ['盘点可由 linter 支撑的规范', '把指导性规则映射到检查器', '识别暂时无法自动执行的规则'] },
  { pattern: /^nature-shared$/i, category: '学术写作支持', summary: '作为 Nature 系列写作 Skill 的共享参考支持包；公开说明明确其不作为独立用户工作流。', useCases: ['为 Nature 写作流程提供共享参考', '支持论文润色或阅读相关 Skill', '核对其作为内部依赖的适用边界'] },
  { pattern: /^test-harness$/i, descriptionPattern: /vigiles|Claude Code harness/i, category: '测试与质量', summary: '按公开说明为 Claude Code harness 选择测试层级，并验证钩子、Skill、设置或上下文注入行为。', useCases: ['验证钩子是否触发或阻止操作', '检查 Skill 与设置的触发行为', '为 harness 变更编写可重复测试'] },
  { pattern: /^nature-statistics$/i, category: '学术与统计', summary: '审校或起草面向高影响力期刊稿件的统计报告内容，覆盖样本量、区间、重复与多重比较等要素。', useCases: ['审校论文统计分析小节', '检查图注中的统计报告', '整理审稿人提出的统计问题'] },
  { pattern: /^flutter-fix-layout-issues$/i, category: 'Flutter 开发', summary: '定位并修复 Flutter 布局中的溢出和无界约束等公开说明列出的常见错误。', useCases: ['修复 RenderFlex 溢出', '排查无界高度或宽度约束', '调整 Flutter 组件布局关系'] },
  { pattern: /^flutter-apply-architecture-best-practices$/i, category: 'Flutter 开发', summary: '按公开说明使用 UI、逻辑和数据分层方式组织或重构 Flutter 应用。', useCases: ['规划新 Flutter 项目结构', '把现有应用重构为分层架构', '明确界面、逻辑与数据职责'] },
  { pattern: /^flutter-add-widget-test$/i, category: '测试与质量', summary: '使用 WidgetTester 为 Flutter 组件编写渲染与交互测试。', useCases: ['验证组件渲染结果', '测试点击、滚动和文本输入', '检查 Widget 对事件的响应'] },
  { pattern: /^wayfinder$/i, category: 'Agent 工作流', summary: '把超出单次 Agent 会话规模的工作拆成议题地图，并逐项调查直到实施路径清晰。', useCases: ['拆分大型跨会话任务', '在 issue tracker 中维护调查地图', '逐项收敛未知问题与依赖'] },
  { pattern: /^flutter-add-widget-preview$/i, category: 'Flutter 开发', summary: '使用公开说明所述的 previews.dart 机制为 Flutter 组件添加交互式预览。', useCases: ['为新组件建立交互预览', '检查不同状态下的界面表现', '辅助维护组件视觉一致性'] },
  { pattern: /^flutter-add-integration-test$/i, category: '测试与质量', summary: '配置 Flutter 集成测试，并把公开说明所述的交互动作整理成可重复的用户流程测试。', useCases: ['为 Flutter 项目配置集成测试', '自动化跨组件用户流程', '把探索性操作固化为回归测试'] },
  { pattern: /^flutter-implement-json-serialization$/i, category: 'Flutter 开发', summary: '使用 dart:convert 为简单数据结构编写 fromJson 与 toJson 映射。', useCases: ['创建 Dart 数据模型', '实现 JSON 到对象的字段映射', '为简单接口数据补充序列化'] },
  { pattern: /^flutter-setup-declarative-routing$/i, category: 'Flutter 开发', summary: '使用 MaterialApp.router 与公开说明列出的路由方案配置 URL 导航、深链和浏览器历史。', useCases: ['配置 Flutter 声明式路由', '支持移动端深链', '处理 Web 端 URL 与历史记录'] },
  { pattern: /^flutter-setup-localization$/i, category: 'Flutter 开发', summary: '为 Flutter 项目配置本地化依赖、代码生成与 l10n.yaml。', useCases: ['初始化多语言支持', '配置本地化代码生成', '建立 Flutter 文案资源结构'] },
  { pattern: /^flutter-use-http-package$/i, category: 'Flutter 开发', summary: '使用 Dart http 包执行公开说明列出的 REST API 请求。', useCases: ['从 REST API 获取数据', '发送 POST、PUT 或 DELETE 请求', '为 Flutter 应用封装基础网络访问'] },
  { pattern: /^fusion-skill-self-report-bug$/i, category: '问题反馈与协作', summary: '收集 Fusion Skill 工作流失败上下文，并按先起草、确认后再进行 GitHub 变更的流程准备问题反馈。', useCases: ['整理 Skill 失败现场', '生成待确认的 Bug 报告草稿', '在外部提交前核对反馈内容'] },
  { pattern: /^stripe-docs$/i, category: '开发文档与 API', summary: '搜索和查阅 Stripe 的公开文档与 API 参考，为开发问题定位对应说明。', useCases: ['查找 Stripe API 参考', '核对参数与集成文档', '为 Stripe 开发问题寻找官方依据'] },
  { pattern: /^slideshow$/i, descriptionPattern: /HyperFrames slideshow|presentation|pitch deck/i, category: '演示文稿', summary: '创建带离散页面、逐步揭示、分支导航、热点和演讲者备注的 HyperFrames 可导航演示文稿。', useCases: ['制作演示文稿或路演 Deck', '设计分支与热点导航', '把现有页面转换为可导航幻灯片'] },
  { pattern: /^ruflo$/i, category: 'Agent 工作流', summary: '用于协调多种 AI 编码 Agent 的任务编排、路由、记忆、子 Agent 与工作流。', useCases: ['组织多 Agent 协作任务', '管理任务路由、记忆和钩子', '检查编排平台的公开状态信息'] },
  { pattern: /datalineage-bigquery-asset-impact-analysis/i, category: '数据与研究', summary: '分析 BigQuery 表或视图变更的下游影响范围，识别受影响的数据表、仪表盘与处理流程。', useCases: ['评估 BigQuery 资产变更影响', '识别下游表和仪表盘依赖', '为删除或暂停更新准备影响清单'] },
  { pattern: /three-best-practices/i, category: '开发与工程', summary: '汇总 Three.js 在场景、材质、纹理、光照、着色器和 WebGL/WebGPU 渲染方面的性能实践。', useCases: ['审查 Three.js 场景性能', '优化几何体、材质与纹理', '检查 WebGL 或 WebGPU 渲染实现'] },
  { pattern: /^code-testing-agent$/i, category: '测试与质量', summary: '为多种编程语言生成单元测试、测试工程和覆盖率配置，并以测试可编译通过为目标组织实现流程。', useCases: ['为应用或服务补充单元测试', '搭建 pytest、Vitest 或其他测试工程', '为新增测试配置覆盖率工具'] },
  { pattern: /^ad-campaign-analyzer$/i, category: '营销与增长', summary: '分析已有广告活动绩效数据，识别应削减、扩量或继续试验的投放项。', useCases: ['比较广告活动的 ROAS 与花费', '定位浪费预算的投放项', '制定预算再分配和测试建议'] },
  { pattern: /^hyva-exec-shell-cmd$/i, category: '开发与工程', summary: '识别 Magento 开发环境，并为 Warden、docker-magento、DDEV 或本地环境选择对应命令包装方式。', useCases: ['识别当前 Magento 运行环境', '为其他 Hyvä 流程选择命令包装器', '统一容器化与本地命令调用方式'] },
  { pattern: /^improve-ui$/i, category: '设计与前端', summary: '依据产品现有设计证据只读审查界面问题，并形成可交给开发者实施的改进计划。', useCases: ['审查现有页面的界面问题', '识别设计系统偏移与不一致', '输出自包含的设计改进交接方案'] },
  { pattern: /^caveman-stats$/i, category: 'Agent 工作流', summary: '读取当前会话日志中的真实令牌用量，并展示上下文节省估算。', useCases: ['查看当前会话令牌用量', '评估上下文压缩节省效果', '跟踪长会话的输入成本'] },
  { pattern: /^azure-app-onboard$/i, category: '云平台与运维', summary: '从应用构想或现有代码出发规划 Azure 服务与基础设施，在部署前提供成本估算和审批节点。', useCases: ['为应用选择 Azure 托管服务', '规划应用迁移与基础设施', '在部署前估算成本并核对方案'] },
  { pattern: /^azure-app-onboard-prereq$/i, category: '云平台与运维', summary: '在基础设施工作前检查代码构建、依赖、框架兼容性与配置，识别 Azure 部署阻塞项。', useCases: ['评估代码库是否可部署到 Azure', '检查依赖与框架兼容性', '整理部署前需要修复的阻塞项'] },
  { pattern: /^context-mode-ops$/i, category: 'Agent 工作流', summary: '编排多 Agent 处理 context-mode 项目的议题、PR、发布、分支同步与发布沟通任务。', useCases: ['批量分派议题与 PR 工作', '协调版本发布和分支同步', '组织发布说明与营销内容准备'] },
  { pattern: /^remotion-maps$/i, category: '图像与多媒体', summary: '整理在 Remotion 中制作地图动画的性能与实现实践。', useCases: ['制作地图移动与缩放动画', '优化 Remotion 地图场景性能', '审查地图视频的动画实现'] },
  { pattern: /^configurator$/i, descriptionPattern: /Continuous Clearing Auction|\bCCA\b/i, category: '区块链与智能合约', summary: '通过交互式批量表单配置连续清算拍卖（CCA）智能合约参数。', useCases: ['配置代币拍卖参数', '批量核对 CCA 合约设置', '准备连续拍卖的合约配置'] },
  { pattern: /revenue-centric-design/i, category: '产品与增长', summary: '面向 SaaS 和创业产品的转化、激活、留存、定价与定位设计方法。', useCases: ['优化落地页与转化路径', '改进上手、试用和留存体验', '梳理定价、定位与目标客户'] },
  { pattern: /^spec$/i, category: 'Agent 工作流', summary: '按规范驱动方法逐段澄清和编写大型功能规格，帮助实施前建立明确结构。', useCases: ['为大型功能编写规格', '逐段澄清需求与约束', '在编码前确定实现边界'] },
  { pattern: /^cn-stats$/i, category: '数据与研究', summary: '查询中国国家统计局公开数据，覆盖经济、物价、人口和房地产等统计指标。', useCases: ['查询 GDP、CPI 与人口数据', '检索房价等公开统计指标', '整理宏观经济数据摘要'] },
  { pattern: /^m14-mental-model$/i, category: '开发与工程', summary: '通过心智模型、类比和内存布局解释 Rust 所有权、借用检查等学习难点。', useCases: ['理解 Rust 所有权与借用', '纠正常见 Rust 概念误解', '面向其他语言开发者解释 Rust'] },
  { pattern: /^flux-2-klein$/i, category: '图像与多媒体', summary: '整理 Flux 2 Klein 文生图模型的提示方式、迭代参数与不同变体取舍。', useCases: ['使用 Flux 2 Klein 生成图像', '比较快速迭代与精细输出参数', '选择 9B、4B 或其他图像模型'] },
  { pattern: /^image-outpainting$/i, category: '图像与多媒体', summary: '扩展图片原始画布并补全画面外内容，用于改比例、横竖版转换或解除裁切。', useCases: ['把方图扩展为横版或竖版', '补全照片画面外区域', '在保留主体的前提下调整构图'] },
  { pattern: /^pptx-visual-assets$/i, category: '演示文稿', summary: '为可编辑 PPTX 选择和放置图标、图片、SVG、图表与信息图等辅助视觉素材。', useCases: ['为幻灯片选择合适视觉素材', '放置可编辑图标与图表', '检查素材是否支持页面叙事'] },
  { pattern: /^pptx-slide-specification$/i, category: '演示文稿', summary: '编写或修复包含明确坐标与尺寸的 PPTX 幻灯片 JSON 规格。', useCases: ['生成幻灯片坐标规格', '修复页面元素位置定义', '为可编辑 PPTX 建立结构化输入'] },
  { pattern: /^pptx-reference-deck-analysis$/i, category: '演示文稿', summary: '只读分析参考 PPTX 的结构、主题、字体、版式节奏和 OOXML 包信息。', useCases: ['提取参考演示文稿的设计规律', '检查主题、字体与版式结构', '建立可复用的页面模板目录'] },
  { pattern: /^pptx-quality-gates$/i, category: '演示文稿', summary: '检查或修复 PPTX 的几何布局、无障碍、可编辑性、来源记录与 OOXML 完整性。', useCases: ['验证幻灯片布局与可编辑性', '检查演示文稿无障碍问题', '核对 OOXML 包完整性'] },
  { pattern: /^pptx-deck-context$/i, category: '演示文稿', summary: '在创建可编辑 PPTX 前整理叙事目标、证据来源和视觉设计上下文。', useCases: ['准备演示文稿故事线', '整理页面所需来源与证据', '定义新 Deck 的视觉上下文'] },
  { pattern: /^caveman-compress$/i, category: 'Agent 工作流', summary: '把自然语言记忆文件压缩为更省上下文的格式，同时保留技术信息、代码、链接和结构。', useCases: ['压缩 Agent 记忆文件', '减少长会话的上下文占用', '保留技术内容并生成可读备份'] },
  { pattern: /^cavecrew$/i, category: 'Agent 工作流', summary: '根据任务类型决定何时委派代码定位、少量文件修改或差异审查，并压缩子 Agent 输出。', useCases: ['选择合适的子 Agent 角色', '委派代码调查或小范围修改', '减少子 Agent 结果的上下文占用'] },
  { pattern: /^lark-contact$/i, category: '办公与效率', summary: '查询飞书联系人身份信息，在姓名、邮箱和 open_id 之间进行解析。', useCases: ['按姓名或邮箱查找联系人', '把联系人解析为 open_id', '查询联系人部门与状态'] },
  { pattern: /^lark-markdown$/i, category: '文档与知识', summary: '查看、创建、上传、编辑和比较飞书中的 Markdown 文件。', useCases: ['创建或读取 Markdown 文件', '局部修改 Markdown 内容', '比较 Markdown 文件差异'] },
  { pattern: /^lark-vc-agent$/i, category: '会议与协作', summary: '让应用机器人加入进行中的飞书会议，并读取可见会中事件或发送会中消息。', useCases: ['加入或离开进行中会议', '读取当前会议事件', '发送会中文本或表情'] },
  { pattern: /^lark-minutes$/i, category: '会议与协作', summary: '搜索和管理飞书妙记，读取或编辑纪要产物，并处理关联音视频与权限。', useCases: ['查找和读取飞书妙记', '编辑标题、说话人或关键词', '上传下载关联音视频'] },
  { pattern: /^lark-task$/i, category: '办公与效率', summary: '管理飞书任务、清单、子任务、协作成员、附件和任务智能体记录。', useCases: ['创建和更新待办任务', '拆分子任务并分配成员', '维护任务清单与进度'] },
  { pattern: /^lark-attendance$/i, category: '办公与效率', summary: '查询当前用户可见的飞书考勤打卡记录。', useCases: ['查看个人打卡记录', '核对指定日期考勤', '整理个人考勤信息'] },
  { pattern: /^lark-im$/i, category: '会议与协作', summary: '收发飞书消息并管理群聊、成员、文件、表情、加急和交互卡片。', useCases: ['发送或搜索飞书消息', '管理群聊与成员', '处理消息附件和交互卡片'] },
  { pattern: /^lark-note$/i, category: '会议与协作', summary: '在已知 note_id 时直接查询飞书会议纪要详情、关联文档和原始逐字记录。', useCases: ['按 note_id 查询会议纪要', '读取关联文档标识', '查看纪要原始逐字记录'] },
  { pattern: /^lark-doc$/i, category: '文档与知识', summary: '读取、创建和编辑飞书云文档，并处理文档中的图片附件与嵌入对象标识。', useCases: ['读取或编辑飞书文档', '创建云文档内容', '处理文档图片和嵌入对象'] },
  { pattern: /^lark-wiki$/i, category: '文档与知识', summary: '管理飞书知识空间、成员和文档节点层级，用于组织知识库内容。', useCases: ['创建或查询知识空间', '管理知识库成员', '移动、复制和组织文档节点'] },
  { pattern: /^lark-event$/i, category: '开发与工程', summary: '订阅并消费飞书实时事件流，覆盖消息、审批、任务、会议与画板等事件。', useCases: ['监听飞书实时事件', '构建有界事件消费流程', '处理机器人消息与业务状态变化'] },
  { pattern: /^lark-slides$/i, category: '演示文稿', summary: '创建、读取和编辑飞书幻灯片，包括页面管理与局部内容替换。', useCases: ['创建飞书演示文稿', '读取或修改幻灯片页面', '新增、删除或局部替换页面'] },
  { pattern: /^lark-approval$/i, category: '办公与效率', summary: '查询和处理飞书审批待办、已办、实例与审批定义，并发起原生审批。', useCases: ['查看和处理审批待办', '查询审批实例', '查找定义并发起审批'] },
  { pattern: /^lark-workflow-meeting-summary$/i, category: '会议与协作', summary: '汇总指定时间范围内的会议纪要并生成结构化回顾报告。', useCases: ['整理一段时间内的会议纪要', '生成会议周报', '汇总会议结论与待办'] },
  { pattern: /^lark-base$/i, category: '数据与研究', summary: '操作飞书多维表格的表、字段、记录、视图、统计、公式、仪表盘与工作流。', useCases: ['创建和维护多维表格', '读写记录、字段和视图', '构建统计、仪表盘与工作流'] },
  { pattern: /^orca-cli$/i, category: '开发与工程', summary: '通过公开 Orca CLI 管理工作树、仓库、终端、自动化与 Orca 内嵌浏览器上下文。', useCases: ['管理 Orca 工作树与仓库上下文', '读写和等待 Orca 终端', '操作 Orca 内嵌浏览器或自动化'] },
  { pattern: /^simple$/i, descriptionPattern: /brainstorming|creative or architectural work/i, category: 'Agent 工作流', summary: '在创意或架构工作前进行精简的需求澄清与方案讨论，帮助快速形成聚焦决策。', useCases: ['澄清功能、组件或行为变更目标', '快速比较架构或创意方案', '在实现前确定关键约束与取舍'] },
  { pattern: /supabase-postgres-best-practices/i, category: '数据与研究', summary: '汇总 Supabase 提供的 Postgres 性能与最佳实践，用于查询、模式和数据库配置的编写与审查。', useCases: ['优化 Postgres 查询性能', '审查数据库模式设计', '检查 Postgres 配置与实践'] },
  { pattern: /^brainstorming$/i, category: 'Agent 工作流', summary: '在创意或实现工作开始前梳理目标、约束和可选方案，为后续决策形成清晰输入。', useCases: ['澄清功能或内容创作目标', '比较多个可行方向及其取舍', '在实施前整理需求与验收标准'] },
  { pattern: /^orchestration$/i, category: 'Agent 工作流', summary: '用于组织多 Agent 的任务分派、消息协作、等待节点和决策关卡。', useCases: ['拆分并分派相互关联的 Agent 任务', '协调任务依赖、回复和完成状态', '为多步骤协作设置决策与复核节点'] },
  { pattern: /^supabase$/i, category: '开发与工程', summary: '为 Supabase 相关开发任务提供工作参考，覆盖其公开说明列出的数据库、认证、存储和服务端能力。', useCases: ['处理 Supabase 数据库与迁移任务', '排查认证、会话或访问策略问题', '集成 Supabase 客户端与服务端功能'] },
  { pattern: /wind-mcp-skill/i, category: '金融与市场数据', summary: '用于查询公开说明列出的股票、基金、债券、公告、财经新闻和宏观行业数据。', useCases: ['查询 A 股、港股或美股行情与基本面', '筛选基金、ETF、指数或板块数据', '检索公司公告、财经新闻和宏观指标'] },
  { pattern: /browser-act-skill-forge/i, category: 'Skill 管理', summary: '根据网站公开交互与数据加载方式整理可复用的浏览器自动化 Skill。', useCases: ['梳理网站公开页面与数据接口', '把重复网页采集流程整理为 Skill', '为批量公开数据提取设计去重流程'] },
  { pattern: /full-output-enforcement/i, category: 'Agent 工作流', summary: '用于要求模型完整输出代码或长内容，并在输出超长时保持可续接的分段结构。', useCases: ['生成不省略实现细节的完整代码', '避免用占位符替代必要内容', '将超长输出拆成可连续拼接的分段'] },
  { pattern: /cross-border-ecommerce/i, category: '电商与商品研究', summary: '用于比较跨境电商目标市场、履约方式、税务要求和本地支付偏好，并整理分阶段扩张方案。', useCases: ['按市场规模、竞争和监管维度比较目标国家', '比较不同跨境履约模式的成本与时效', '整理税务、支付和分阶段进入市场的检查项'] },
  { pattern: /prisma-mongodb-upgrade/i, category: '开发与工程', summary: '指导 Prisma ORM MongoDB 项目评估版本升级和迁移路径，重点处理 v6 无法直接升级到 v7 的限制。', useCases: ['评估 Prisma MongoDB 项目的升级方案', '比较 Prisma v6、v7 与 Prisma Next 路径', '为 MongoDB 项目制定迁移和风险清单'] },
  { pattern: /prisma-driver-adapter-implementation/i, category: '开发与工程', summary: '提供 Prisma v7 驱动适配器的关键接口契约、事务生命周期、错误映射和验证要求。', useCases: ['实现新的 Prisma 数据库驱动适配器', '修改 SqlDriverAdapter 或事务接口', '核对适配器的错误映射和验证清单'] },
  { pattern: /test-driven-development/i, category: '测试与质量', summary: '在编写实现代码前先建立失败测试，以测试驱动功能开发和缺陷修复。', useCases: ['用失败测试定义新功能行为', '修复缺陷前建立可复现用例', '按红灯、绿灯、重构循环推进开发'] },
  { pattern: /cut-the-curve/i, category: '动效与视频', summary: '提供镜头转场、动势衔接、景深变化和文字节奏的技术目录，用于保持多场景视频的连续运动。', useCases: ['设计缩放、瀑布和模糊转场', '制作动效文字和分段开场', '让跨镜头运动方向与速度连续'] },
  { pattern: /captions-overlay/i, category: '动效与视频', summary: '定义视频字幕作为画面叠加层的排版规则，并区分普通字幕、逐字轨道和重点嵌入字幕。', useCases: ['为口播或发布视频添加字幕', '决定字幕内容的层级和节奏', '在不挤压主画面的前提下完成字幕布局'] },
  { pattern: /motion-doctrine/i, category: '动效与视频', summary: '建立多场景视频的统一运动法则，通过方向、动量和因果衔接让镜头像连续运动而非独立幻灯片。', useCases: ['规划多场景视频的运动方向', '设计镜头之间的动量衔接', '检查无意义晃动和转场断裂'] },
  { pattern: /oversized-cursor/i, category: '动效与视频', summary: '使用超大 macOS 风格光标引导 UI 视频视线，并通过点击触发下一段动画或场景。', useCases: ['制作指针引导的产品演示', '用点击动作触发界面转场', '为静态 UI 场景增加明确视觉焦点'] },
  { pattern: /seam-craft/i, category: '动效与视频', summary: '处理多场景视频在主时间线上的合成衔接，重点避免白闪、透明度穿透和重叠帧错误。', useCases: ['修复转场或交叉淡化时的白闪', '配置场景包装层和最终帧保持', '验证主时间线的渲染与合成正确性'] },
  { pattern: /changelog-video/i, category: '动效与视频', summary: '把每周更新日志转换为带品牌视觉、旁白、模拟界面和字幕的短视频。', useCases: ['将 Markdown 更新日志制作成视频', '生成固定品牌风格的周报短片', '制作带旁白和字幕的产品更新内容'] },
  { pattern: /receiving-code-review/i, category: '代码审查', summary: '在处理代码审查意见时先核验技术依据，避免对模糊或可疑建议直接照单修改。', useCases: ['分析并确认审查意见是否成立', '对不清晰的反馈提出技术问题', '修改代码前补充测试和证据'] },
  { pattern: /using-git-worktrees/i, category: '开发与工程', summary: '在开始独立功能或实施计划前创建隔离工作区，优先使用原生能力并以 Git worktree 作为补充。', useCases: ['为新功能创建隔离开发目录', '避免当前工作区改动互相干扰', '并行推进多个分支或任务'] },
  { pattern: /verification-before-completion/i, category: '测试与质量', summary: '在宣布任务完成前强制运行验证命令并检查真实输出，避免无证据的成功结论。', useCases: ['提交代码前运行测试和构建', '修复问题后核对实际输出', '创建 PR 前确认验收证据'] },
  { pattern: /writing-skills/i, category: 'Skill 管理', summary: '用于创建、修改和验证 Agent Skill，帮助维护可复用且能通过实际检查的能力说明。', useCases: ['新建团队专用 Skill', '修改现有 Skill 的触发与流程', '发布前验证 Skill 是否按预期工作'] },
  { pattern: /dispatching-parallel-agents/i, category: 'Agent 工作流', summary: '识别彼此独立且无共享状态的任务，并将它们并行分派给多个 Agent 执行。', useCases: ['并行调查多个互不依赖的问题', '同时处理不同模块的独立任务', '缩短批量分析和验证的等待时间'] },
  { pattern: /finishing-a-development-branch/i, category: '开发与工程', summary: '在实现和测试完成后，帮助选择合并、创建 PR、保留或清理分支的收尾路径。', useCases: ['完成功能分支后的合并决策', '提交 PR 前整理验证结果', '清理临时分支和工作目录'] },
  { pattern: /executing-plans/i, category: 'Agent 工作流', summary: '按既定实施计划分阶段执行任务，并在关键节点停下来复核进度和结果。', useCases: ['执行已经评审过的开发计划', '按检查点推进多步骤任务', '在独立会话中保持实施节奏'] },
  { pattern: /subagent-driven-development/i, category: 'Agent 工作流', summary: '把实施计划拆成独立任务交给子 Agent，并在当前会话中汇总、复核和整合结果。', useCases: ['并行推进多个独立开发任务', '为每个子任务分配专门 Agent', '集中复核子 Agent 的交付结果'] },
  { pattern: /^systematic-debugging$/i, category: '测试与质量', summary: '按根因调查、模式分析、假设验证和最小修复四阶段系统定位软件问题。', useCases: ['从报错和失败测试追查根因', '用单一假设设计验证实验', '在确认原因后实施最小修复'] },
  { pattern: /^writing-plans$/i, category: 'Agent 工作流', summary: '把已明确的需求整理成可逐步执行的实施计划，标注文件、测试和验证动作。', useCases: ['把规格拆成细粒度实施步骤', '为每一步标注代码与测试位置', '在开发前建立可复核执行顺序'] },
  { pattern: /^industrial-brutalist-ui$/i, category: '设计与前端', summary: '定义融合瑞士印刷排版与军用终端气质的工业粗野主义界面，适合数据密集型页面。', useCases: ['设计数据仪表盘与编辑型页面', '建立刚性网格和强烈字号层级', '制作蓝图或终端感的品牌界面'] },
  { pattern: /^prisma-database-setup$/i, category: '数据库与 ORM', summary: '配置 Prisma 与 PostgreSQL、MySQL、SQLite 或 MongoDB 等数据库的连接与项目初始化。', useCases: ['为新项目配置数据库提供方', '切换 Prisma 项目的数据库', '排查数据库连接与初始化问题'] },
  { pattern: /^prisma-client-api$/i, category: '数据库与 ORM', summary: '提供 Prisma Client 查询 API 参考，覆盖 CRUD、过滤、关联查询、事务和类型安全用法。', useCases: ['编写 Prisma Client 数据查询', '处理关联、过滤和分页逻辑', '组织事务与类型安全的数据访问'] },
  { pattern: /^prisma-cli$/i, category: '数据库与 ORM', summary: '整理 Prisma ORM CLI 的初始化、生成、迁移、数据库、Studio、校验和调试命令。', useCases: ['初始化或生成 Prisma 项目文件', '执行数据库迁移与模式校验', '使用 Studio 或调试命令排查问题'] },
  { pattern: /^prisma-postgres$/i, category: '数据库与 ORM', summary: '说明 Prisma Postgres 的创建、控制台操作和 Management API 集成方式。', useCases: ['创建和管理 Prisma Postgres 数据库', '通过 CLI 或控制台完成配置', '用 Management API 自动化数据库供应'] },
  { pattern: /^prisma-postgres-setup$/i, category: '数据库与 ORM', summary: '通过 Management API 新建 Prisma Postgres 数据库并连接到本地项目。', useCases: ['创建 Prisma Postgres 项目', '获取数据库连接字符串', '把本地应用连接到新数据库'] },
  { pattern: /^prisma-upgrade-v7$/i, category: '数据库与 ORM', summary: '指导 Prisma ORM v6 到 v7 的迁移，覆盖破坏性变更、生成器和驱动适配器要求。', useCases: ['评估 Prisma v7 升级影响', '修复升级后的配置或生成错误', '制定 v6 到 v7 的迁移步骤'] },
  { pattern: /^prisma-compute$/i, category: '云平台与运维', summary: '指导 Prisma Compute 应用的配置、部署、构建日志、域名和框架上线准备。', useCases: ['部署和托管 Prisma 应用', '配置 Compute 项目与服务令牌', '排查构建日志、端口或域名问题'] },
  { pattern: /^review-animations$/i, category: '动效与视频', summary: '按高质量动效工程标准审查动画与运动代码，并标记需要改进的实现。', useCases: ['审查界面动画代码质量', '检查缓动、时序与交互反馈', '为动效差异整理修改意见'] },
  { pattern: /^improve-animations$/i, category: '动效与视频', summary: '只读审计代码库中的动画实现，输出按优先级排序的改进路线和可执行计划。', useCases: ['盘点应用现有动效问题', '制定动画改进优先级', '为后续实现准备独立任务计划'] },
  { pattern: /^animation-vocabulary$/i, category: '动效与视频', summary: '把对网页动效的模糊描述映射为准确术语，便于与设计师或生成模型沟通。', useCases: ['查询某种动效的专业名称', '把口语描述转换为动画术语', '为设计提示词补充准确词汇'] },
  { pattern: /^find-animation-opportunities$/i, category: '动效与视频', summary: '只读查找界面中值得增加动效的位置，并排除不应动画化的元素。', useCases: ['发现界面中的动效机会', '为建议动效给出具体参数', '避免无意义或干扰性的动画'] },
  { pattern: /^gws-gmail$/i, category: '办公与效率', summary: '通过 Google Workspace CLI 读取、发送和管理 Gmail 邮件。', useCases: ['读取和搜索 Gmail 邮件', '发送或回复电子邮件', '整理邮件与会话状态'] },
  { pattern: /^gws-drive$/i, category: '办公与效率', summary: '通过 Google Workspace CLI 管理 Google Drive 文件、文件夹和共享云端硬盘。', useCases: ['查询和整理云端文件', '管理文件夹与共享云端硬盘', '查看或更新 Drive 资源信息'] },
  { pattern: /^design-taste-frontend-v1$/i, category: '设计与前端', summary: '保留旧版前端设计规范的兼容入口，供依赖其既有行为的项目继续使用。', useCases: ['维持旧项目的设计行为兼容', '复现依赖 v1 规范的界面输出', '评估迁移到新版设计规范的差异'] },
  { pattern: /^figma$/i, descriptionPattern: /HyperFrames|composition|motion/i, category: '动效与视频', summary: '把 Figma 画面、品牌令牌、组件或动画导入 HyperFrames 并重建为视频运动状态。', useCases: ['将 Figma 设计导入视频合成', '复用品牌令牌和画面组件', '把设计帧重建为连续运动状态'] },
  { pattern: /^landing-page-design$/i, category: '产品与增长', summary: '围绕首屏结构、CTA、社会证明和移动端布局优化落地页转化。', useCases: ['设计 SaaS 或产品落地页', '优化首屏信息和行动按钮', '检查移动端转化路径与内容顺序'] },
  { pattern: /^youtube-thumbnail-design$/i, category: '图像与多媒体', summary: '按 YouTube 缩略图尺寸、对比度、安全区和移动端预览规则设计视频封面。', useCases: ['制作 YouTube 视频缩略图', '优化文字与主体在小尺寸下的可读性', '为点击率测试准备封面变体'] },
  { pattern: /^app-store-screenshots$/i, category: '图像与多媒体', summary: '按 App Store 与 Google Play 规格制作应用截图、设备样机、排序和预览素材。', useCases: ['制作 iOS 与 Android 商店截图', '规划截图画廊叙事顺序', '检查设备样机和平台尺寸'] },
  { pattern: /^character-design-sheet$/i, category: '图像与多媒体', summary: '通过角色设定表、转面图、表情表和配色规范保持生成图像中的角色一致性。', useCases: ['制作角色设定与参考表', '统一不同视角和表情的角色特征', '为游戏、漫画或动画保持视觉一致'] },
  { pattern: /^fish-audio$/i, category: '音频与语音', summary: '使用 Fish Audio 生成文本转语音音频，并从公开模型目录选择参考声音。', useCases: ['生成旁白和配音音频', '合成多语言语音', '浏览并选择公开参考声音'] },
  { pattern: /^antfu-design$/i, category: '设计与前端', summary: '采用 UnoCSS 优先的语义令牌、明暗主题与微交互规范构建工具型和产品型界面。', useCases: ['建立 UnoCSS 语义样式系统', '统一工具界面的明暗主题', '审查落地页和产品界面的细节质量'] },
  { pattern: /^nitro$/i, category: '开发与工程', summary: '围绕 Nitro 服务端工具包配置路由、缓存、存储、任务、WebSocket 和多平台部署。', useCases: ['编写 Nitro 服务端路由', '配置缓存、存储和路由规则', '部署到 Node、Bun 或边缘平台'] },
  { pattern: /^dart-use-primary-constructors$/i, category: '开发与工程', summary: '编写和迁移 Dart 主构造器语法，覆盖简写构造器、初始化列表和空体形式。', useCases: ['将旧构造器迁移为主构造器', '检查 Dart 新构造器语法', '使用简写和初始化列表形式'] },
  { pattern: /^dt-obs-gcp$/i, category: '云平台与运维', summary: '监控和分析 GCP 计算、容器、网络、消息、IAM 与密钥等云资源的运行状态。', useCases: ['监控 GCE、GKE 与 Cloud Run', '分析资源用量和组织层级', '审查 GCP 资源的公开安全配置项'] },
  { pattern: /^fusion-help-docs$/i, category: '文档与知识', summary: '使用 Fusion Help CLI 编写、组织、同步和发布帮助文章、发布说明与常见问题。', useCases: ['撰写产品帮助文章', '维护发布说明和 FAQ', '配置并同步 Fusion 帮助内容'] },
  { pattern: /^expo-migrate-module$/i, category: '开发与工程', summary: '将 Apple/Swift Expo 原生模块从 Modules API 1.0 定义 DSL 迁移到 2.0 宏 API。', useCases: ['迁移现有 Swift Expo 模块', '采用 @ExpoModule 等新宏', '在迁移中保持 JavaScript 与 TypeScript 契约'] },
  { pattern: /^anti-ui-slop$/i, category: '设计与前端', summary: '依据公开真实界面参考提取产品特定设计决策，并检查网页与 iOS 界面的模板化问题。', useCases: ['减少生成界面的模板化观感', '从公开案例提炼设计方向', '在交付前执行界面完成度检查'] },
  { pattern: /^release-skills$/i, category: '发布与变更管理', summary: '为 Node.js、Python、Rust 和通用项目整理版本号、变更日志、标签与 GitHub Release 流程。', useCases: ['提升版本并更新变更日志', '创建带注释的版本标签', '准备 GitHub Release 或历史版本回填'] },
  { pattern: /^byted-ark-seedream-skill$/i, category: '图像与多媒体', summary: '通过公开说明中的火山方舟 Seedream 能力生成和迭代图片，支持组图与提示词优化。', useCases: ['根据文字生成图片', '参考现有图片进行视觉创作', '制作风格连贯的系列图像'] },
  { pattern: /^vision$/i, descriptionPattern: /OCR|understand images|截图/i, category: '图像与多媒体', summary: '调用可配置的视觉模型读取、描述、OCR 和分析图片、截图、图表或扫描页。', useCases: ['识别图片与截图内容', '提取扫描页或图片文字', '分析图表、界面和示意图'] },
  { pattern: /^nature-ref-verifier$/i, category: '数据与研究', summary: '对学术参考文献执行多源交叉核验，比较作者、标题、年份、卷期、页码和 DOI 信息。', useCases: ['批量核验论文参考文献', '发现年份、作者与页码冲突', '输出结构化文献校验报告'] },
  { pattern: /^nts-tax-delinquency$/i, category: '企业与公共数据', summary: '查询韩国国税厅公开的高额及惯常欠税名单，并按名称并列公开的欠税事实。', useCases: ['核对韩国企业公开欠税记录', '按名称交叉查询法人和个人名单', '整理公开欠税额、税目与摘要'] },
  { pattern: /^lark-apps$/i, category: '开发与工程', summary: '使用飞书妙搭创建、开发、托管和监控应用，并配置角色、环境变量和自动化触发器。', useCases: ['创建并发布妙搭应用', '查看日志、监控与访问指标', '配置成员角色和自动化任务'] },
  { pattern: /^lark-calendar$/i, category: '办公与效率', summary: '管理飞书日历、日程、参会人、忙闲时段和会议室预订。', useCases: ['查看和搜索日程', '创建或修改会议安排', '查询忙闲并预订会议室'] },
  { pattern: /^lark-drive$/i, category: '文档与知识', summary: '管理飞书云空间文件与文件夹，覆盖上传、下载、移动、权限、版本和本地文件导入。', useCases: ['整理飞书云盘目录', '上传下载或移动文件', '管理文件权限、版本与导入'] },
  { pattern: /^lark-mail$/i, category: '办公与效率', summary: '读取、搜索、起草、发送、回复和整理飞书邮箱中的邮件。', useCases: ['查阅和搜索邮件', '起草、发送或回复邮件', '管理邮件文件夹、标签和规则'] },
  { pattern: /^lark-okr$/i, category: '办公与效率', summary: '管理飞书 OKR 周期、目标、关键结果、对齐关系、量化指标和进展记录。', useCases: ['查看或创建目标与关键结果', '更新 OKR 进展和量化指标', '检查目标之间的对齐关系'] },
  { pattern: /^lark-openapi-explorer$/i, category: '开发与工程', summary: '从飞书官方文档中查找现有 CLI 尚未封装的原生 OpenAPI，并整理调用入口。', useCases: ['查找未封装的飞书 OpenAPI', '核对接口参数和官方说明', '补足现有 lark-cli 命令覆盖缺口'] },
  { pattern: /^lark-shared$/i, category: '开发与工程', summary: '处理 lark-cli 的登录、身份、业务域权限、缺失作用域和授权状态。', useCases: ['登录或检查 lark-cli 认证', '区分用户与机器人身份', '排查权限域和授权范围问题'] },
  { pattern: /^lark-sheets$/i, category: '数据与研究', summary: '创建和操作飞书电子表格，覆盖单元格、公式、样式、图表、透视表和批量更新。', useCases: ['批量读写表格数据', '创建公式、图表和透视表', '管理工作表结构与格式'] },
  { pattern: /^lark-skill-maker$/i, category: 'Skill 管理', summary: '把飞书 API 原子操作或多步流程封装为可复用的 lark-cli Skill。', useCases: ['为飞书 API 创建自定义 Skill', '封装重复的 CLI 操作', '编排多步飞书业务流程'] },
  { pattern: /^lark-vc$/i, category: '会议与协作', summary: '搜索已结束的飞书视频会议，读取纪要、章节、待办、逐字稿和参会人快照。', useCases: ['查找历史视频会议', '读取会议纪要与逐字稿', '查看参会人和会议产物'] },
  { pattern: /^lark-whiteboard$/i, category: '设计与前端', summary: '读取和编辑飞书画板中的图形、文本、连接关系与布局结构。', useCases: ['查看飞书画板内容', '创建或调整画板图形', '维护节点连接与版面结构'] },
  { pattern: /^lark-workflow-standup-report$/i, category: '办公与效率', summary: '组合飞书日历和未完成任务，生成指定日期的日程待办摘要。', useCases: ['生成今日或明日安排摘要', '汇总本周日程与待办', '准备站会前的个人工作概览'] },
  { pattern: /^ai-research-reproduction$/i, category: 'AI 与研究工程', summary: '按 README 优先原则复现深度学习仓库，协调目标选择、环境准备、可信执行和证据记录。', useCases: ['复现论文配套代码仓库', '选择最小可信推理或评估目标', '输出标准化复现证据包'] },
  { pattern: /^ai-research-explore$/i, category: 'AI 与研究工程', summary: '在研究者明确授权后组织有边界的深度学习探索实验，并记录公平比较和不过度宣称的结果。', useCases: ['规划小规模探索实验', '协调候选实现与试运行', '整理带限制条件的探索证据'] },
  { pattern: /^analyze-project$/i, category: 'AI 与研究工程', summary: '只读分析深度学习仓库的模型结构、训练推理入口、配置和可疑实现模式。', useCases: ['理解研究代码仓库结构', '定位训练与推理入口', '审查模型插入点和实现风险'] },
  { pattern: /^env-and-assets-bootstrap$/i, category: 'AI 与研究工程', summary: '为特定深度学习复现目标准备保守环境、检查点与数据路径假设、缓存位置和配置说明。', useCases: ['准备仓库复现环境', '记录数据与检查点路径假设', '整理运行前环境配置说明'] },
  { pattern: /^explore-code$/i, category: 'AI 与研究工程', summary: '在隔离分支中实现低风险研究候选方案，并留下可回滚的变更与实验记录。', useCases: ['移植或适配模型模块', '添加 LoRA 或适配器层', '在隔离工作区验证候选实现'] },
  { pattern: /^explore-run$/i, category: 'AI 与研究工程', summary: '执行有边界的深度学习探索运行，如小样本验证、短周期试验或批量搜索。', useCases: ['执行小样本或短周期实验', '开展有限参数或批次搜索', '记录公平比较前提与实验结果'] },
  { pattern: /^minimal-run-and-audit$/i, category: 'AI 与研究工程', summary: '运行最小可信的推理或评估命令，并把命令、状态、结果和补丁说明写入标准证据包。', useCases: ['执行仓库最小烟雾测试', '规范化推理与评估证据', '记录运行导致的代码变更'] },
  { pattern: /^paper-context-resolver$/i, category: '数据与研究', summary: '仅在仓库说明存在关键缺口时，从论文原始来源核对数据集划分、预处理、评估或检查点信息。', useCases: ['核对复现所需论文细节', '解决 README 与论文的冲突', '记录评估协议和运行假设'] },
  { pattern: /^repo-intake-and-plan$/i, category: 'AI 与研究工程', summary: '扫描深度学习仓库和 README，提取已记录命令并制定最小可信复现计划。', useCases: ['梳理研究仓库入口文件', '分类推理、评估和训练命令', '形成最小可执行复现方案'] },
  { pattern: /^run-train$/i, category: 'AI 与研究工程', summary: '保守执行已记录的深度学习训练命令，并保存配置、种子、日志、检查点和指标证据。', useCases: ['验证训练任务能否启动', '执行正式训练或恢复训练', '记录训练配置与指标证据'] },
  { pattern: /^safe-debug$/i, category: 'AI 与研究工程', summary: '对深度学习训练报错、显存不足、形状不匹配或 NaN 等问题先做保守诊断，再区分修复与研究贡献。', useCases: ['诊断 CUDA OOM 与训练失败', '排查检查点和张量形状问题', '在修改前建立根因证据'] },
  { pattern: /ui-ux-pro-max/i, category: '设计与前端', summary: '提供 UI/UX 风格、配色、字体、布局、无障碍和图表规范库，辅助网页与移动端设计。', useCases: ['为新页面选择视觉风格和设计系统', '检查界面布局、字体与无障碍问题', '生成适配 React、Vue、SwiftUI 等技术栈的设计方案'] },
  { pattern: /vercel-react-best-practices/i, category: '开发与工程', summary: '汇总 Vercel 的 React 与 Next.js 性能实践，用于编写、审查和重构前端代码。', useCases: ['审查 React 组件的性能问题', '优化 Next.js 数据获取和包体积', '重构页面以符合生产级性能规范'] },
  { pattern: /web-design-guidelines/i, category: '设计与前端', summary: '依据 Web 界面规范审查 UI 代码，重点检查可用性、无障碍和常见设计问题。', useCases: ['审核现有网页的 UI 与 UX', '检查无障碍和交互一致性', '对照界面规范整理修改清单'] },
  { pattern: /hallmark/i, category: '设计与前端', summary: '用于新页面设计、视觉审计和重设计，重点识别并减少模板化的 AI 生成痕迹。', useCases: ['从零设计应用或落地页', '审计现有界面的视觉质量', '根据网页或截图提取设计方向'] },
  { pattern: /playwright-cli/i, category: '浏览器自动化', summary: '通过 Playwright 命令行自动操作浏览器、测试网页并检查真实页面状态。', useCases: ['执行网页端到端测试', '自动完成点击、输入和导航', '验证不同页面状态与渲染结果'] },
  { pattern: /gws-shared/i, category: '办公与效率', summary: '封装 Google Workspace CLI 的认证、全局参数和输出格式等通用操作模式。', useCases: ['统一 Google Workspace CLI 认证流程', '复用跨命令的参数和输出处理', '为日历、邮件等 GWS Skill 提供公共基础'] },
  { pattern: /^pptx$/i, category: '演示文稿', summary: '处理 PowerPoint 文件的创建、读取、编辑、合并、模板、版式和演讲者备注。', useCases: ['创建或修改演示文稿', '读取并提取 PPTX 内容', '套用模板、调整版式或合并幻灯片'] },
  { pattern: /remotion-captions/i, category: '图像与多媒体', summary: '处理 Remotion 视频中的字幕数据、时间轴同步和字幕呈现。', useCases: ['为程序化视频添加字幕', '同步字幕时间轴与画面', '调整字幕样式和可读性'] },
  { pattern: /remotion-render/i, category: '图像与多媒体', summary: '提供 Remotion 视频渲染的生产实践，覆盖输出配置、性能和常见故障处理。', useCases: ['配置 Remotion 视频渲染任务', '优化渲染性能和输出质量', '排查渲染失败或格式问题'] },
  { pattern: /remotion-create/i, category: '图像与多媒体', summary: '用于创建新的 Remotion 程序化视频项目，并组织后续画面与时间线实现。', useCases: ['初始化 Remotion 视频项目', '搭建程序化视频的基础结构', '为后续场景和时间线开发准备工程'] },
  { pattern: /^microsoft-foundry$/i, category: 'AI 与 Agent 工程', summary: '围绕 Microsoft Foundry Agent 的部署、评估、优化和微调整理端到端工程流程。', useCases: ['部署和调用 Foundry Agent', '建立批量或持续评估流程', '准备数据集并执行模型微调'] },
  { pattern: /^azure-diagnostics$/i, category: '云平台与运维', summary: '使用 Azure Monitor、AppLens 和资源健康信息排查 Azure 生产环境故障。', useCases: ['定位应用高负载或启动失败', '分析日志、健康探针和资源状态', '排查 AKS、Functions 或消息服务异常'] },
  { pattern: /^azure-deploy$/i, category: '云平台与运维', summary: '执行已经准备并验证过的 Azure 应用部署，覆盖 azd、Bicep 和 Terraform 工作流。', useCases: ['执行 azd 或基础设施部署', '发布已准备的应用到 Azure', '处理部署过程中的可恢复错误'] },
  { pattern: /^azure-ai$/i, category: 'AI 与 Agent 工程', summary: '面向 Azure AI Search、Speech、OpenAI 和 Document Intelligence 的查询与集成参考。', useCases: ['实现向量、混合或语义搜索', '处理语音转写和语音合成', '集成 OCR 与文档智能能力'] },
  { pattern: /^azure-compliance$/i, category: '安全与合规', summary: '使用公开说明列出的评估工具检查 Azure 最佳实践、合规状态与 Key Vault 到期项。', useCases: ['执行 Azure 合规与安全审计', '检查证书和机密到期风险', '整理资源最佳实践评估结果'] },
  { pattern: /^azure-validate$/i, category: '测试与质量', summary: '在部署前验证 Azure 配置、基础设施代码、RBAC 和托管身份权限是否就绪。', useCases: ['检查 azure.yaml 与部署配置', '验证 Bicep 或 Terraform 基础设施', '核对角色分配和托管身份权限'] },
  { pattern: /^azure-aigateway$/i, category: 'AI 与 Agent 工程', summary: '使用 Azure API Management 配置面向模型、工具和 Agent 的 AI Gateway 策略。', useCases: ['配置模型后端和负载均衡', '设置令牌限制、缓存与内容策略', '为模型或 MCP 接口建立网关治理'] },
  { pattern: /^azure-prepare$/i, category: '云平台与运维', summary: '为 azd 部署工作流准备 Azure 项目配置、容器文件和 Bicep 或 Terraform 基础设施。', useCases: ['生成 azure.yaml 与部署配置', '准备 Bicep 或 Terraform 资源', '为应用建立 azd 部署工程'] },
  { pattern: /^azure-storage$/i, category: '云平台与运维', summary: '解释并使用 Azure Blob、文件、队列、表和 Data Lake 等存储服务及访问层级。', useCases: ['选择 Azure 存储服务与访问层级', '规划 Blob 生命周期管理', '处理对象、文件或队列存储需求'] },
  { pattern: /^azure-resource-lookup$/i, category: '云平台与运维', summary: '跨订阅或资源组列出、查找和盘点 Azure 资源，并支持按标签与类型查询。', useCases: ['盘点订阅中的 Azure 资源', '按标签或资源类型查找实例', '识别未挂载磁盘等孤立资源'] },
  { pattern: /^azure-resource-visualizer$/i, category: '云平台与运维', summary: '分析 Azure 资源组内的资源关系，并生成 Mermaid 架构与拓扑图。', useCases: ['绘制资源组架构图', '展示资源之间的依赖关系', '整理 Azure 基础设施拓扑'] },
  { pattern: /^appinsights-instrumentation$/i, category: '云平台与运维', summary: '提供 Azure Application Insights 的 SDK 配置、遥测模式和 Web 应用可观测性参考。', useCases: ['为 Web 应用接入 Application Insights', '设计遥测和 APM 数据采集', '检查监控 SDK 与配置方式'] },
  { pattern: /^entra-app-registration$/i, category: '安全与合规', summary: '指导 Microsoft Entra ID 应用注册、OAuth 2.0、API 权限和 MSAL 集成。', useCases: ['创建 Entra 应用注册', '配置 OAuth 与 API 权限', '集成 MSAL 和服务主体认证'] },
  { pattern: /^azure-kusto$/i, category: '数据与研究', summary: '使用 KQL 查询 Azure Data Explorer 中的日志、遥测和时序数据。', useCases: ['编写 KQL 查询', '分析日志与遥测数据', '处理时序与异常检测任务'] },
  { pattern: /^azure-compute$/i, category: '云平台与运维', summary: '规划、选择和排查 Azure 虚拟机与虚拟机规模集，覆盖规格、网络和容量需求。', useCases: ['选择 VM 或 VMSS 规格', '规划自动扩缩与容量预留', '排查 RDP、SSH 或节点连接问题'] },
  { pattern: /^azure-messaging$/i, category: '云平台与运维', summary: '排查 Azure Event Hubs 与 Service Bus SDK 的连接、认证和消息处理问题。', useCases: ['诊断 AMQP 与 SDK 连接错误', '排查消息锁、重连和超时', '分析 Event Hubs 或 Service Bus 消费异常'] },
  { pattern: /^azure-cloud-migrate$/i, category: '云平台与运维', summary: '评估并迁移其他云平台上的函数、应用和容器工作负载到 Azure。', useCases: ['评估 AWS 或 GCP 工作负载迁移', '转换函数与应用托管方案', '规划容器工作负载迁移到 Azure'] },
  { pattern: /^azure-enterprise-infra-planner$/i, category: '云平台与运维', summary: '根据工作负载要求规划企业 Azure 网络、身份、安全与多资源拓扑，并生成基础设施代码。', useCases: ['设计企业 Azure 基础设施', '规划中心辐射网络与灾备拓扑', '生成 Bicep 或 Terraform 方案'] },
  { pattern: /^azure-cost$/i, category: '云平台与运维', summary: '查询、预测和优化 Azure 成本，帮助识别浪费、异常增长与资源调整机会。', useCases: ['分析 Azure 账单与成本构成', '预测支出并定位成本突增', '寻找闲置或规格过高的资源'] },
  { pattern: /^azure-kubernetes$/i, category: '云平台与运维', summary: '规划和配置生产级 Azure Kubernetes Service 集群，覆盖网络、安全、扩缩与升级策略。', useCases: ['设计和创建 AKS 集群', '规划 AKS 网络与安全配置', '优化节点、Pod 与升级策略'] },
  { pattern: /^shadcn$/i, category: '设计与前端', summary: '管理 shadcn/ui 项目和组件，支持检索、添加、修复、调试、样式调整与界面组合。', useCases: ['添加或检索 shadcn/ui 组件', '修复组件配置与样式问题', '组合表单、对话等应用界面'] },
  { pattern: /remotion-docs/i, category: '文档与知识', summary: '搜索并读取 Remotion 官方文档，为实现问题提供对应 API 和用法依据。', useCases: ['查询 Remotion API 与组件用法', '核对版本相关的官方说明', '为视频实现寻找权威示例'] },
  { pattern: /remotion-saas/i, category: '图像与多媒体', summary: '用于构建基于 Remotion 的视频 SaaS，覆盖应用架构、渲染服务和播放器实践。', useCases: ['搭建在线程序化视频产品', '设计服务端渲染流程', '集成 Remotion Player 与编辑体验'] },
  { pattern: /remotion-interactivity/i, category: '图像与多媒体', summary: '编写对 Agent 和视觉编辑器都易于理解、调整的 Remotion 交互动画。', useCases: ['制作可编辑的交互动画', '保持动画参数和结构清晰', '适配 Remotion Studio 可视化编辑'] },
  { pattern: /remotion-markup/i, category: '图像与多媒体', summary: '提供 Remotion React Markup 的编写规范，用于构建结构清晰的视频画面组件。', useCases: ['编写程序化视频的 React 画面', '组织可复用的视频组件', '提升 Markup 的可维护性和编辑性'] },
  { pattern: /mediabunny/i, category: '图像与多媒体', summary: '使用 Mediabunny 库处理音视频和多媒体数据，支持常见媒体读取、转换与输出任务。', useCases: ['读取和处理音视频文件', '转换媒体格式或数据流', '在应用中集成多媒体处理能力'] },
  { pattern: /^verify-this$/i, category: '测试与质量', summary: '用本地新证据验证可证伪的主张，对照基线与处理结果并给出已验证、未验证或证据不足的结论。', useCases: ['验证修复或优化是否真实生效', '比较变更前后的产物与指标', '为技术结论补充可复核证据'] },
  { pattern: /^competitive-landscape$/i, category: '市场与竞争研究', summary: '梳理 SEO 市场中的领先站点、内容主题、关键词覆盖、反向链接和策略空白。', useCases: ['绘制自然搜索竞争格局', '比较竞品内容与关键词覆盖', '识别可切入的 SEO 机会'] },
  { pattern: /^competitor-analysis$/i, category: '市场与竞争研究', summary: '分析单个竞品的自然搜索表现、排名关键词、内容主题、反向链接和覆盖缺口。', useCases: ['审查竞品自然搜索表现', '比较关键词与内容主题', '寻找反向链接和内容缺口'] },
  { pattern: /^keyword-clustering$/i, category: 'SEO 与内容增长', summary: '按搜索意图对关键词分组，并映射到现有页面或建议的新页面。', useCases: ['按意图聚类关键词', '规划关键词到页面的映射', '识别需要新增或合并的内容页'] },
  { pattern: /^keyword-research$/i, category: 'SEO 与内容增长', summary: '发现关键词机会，结合指标与搜索结果页进行评估，并保存和标记候选词。', useCases: ['挖掘搜索关键词机会', '比较关键词指标与 SERP', '维护可跟进的关键词清单'] },
  { pattern: /^link-prospecting$/i, category: 'SEO 与内容增长', summary: '根据搜索结果和反向链接信号寻找外链潜在对象、联系路径并起草沟通内容。', useCases: ['发现潜在外链来源', '查找公开联系路径', '准备针对性的外联草稿'] },
  { pattern: /^maintain-greptile-rules$/i, category: '代码审查', summary: '把已核实且可复用的代码审查发现沉淀到版本控制的 Greptile 规则与上下文配置中。', useCases: ['补充重复出现的仓库审查规则', '修正持续出现的误报规则', '审计 Greptile 配置覆盖范围'] },
  { pattern: /^merge-ready$/i, category: '代码审查', summary: '围绕代码审查、已核实问题、CI 检查和 PR 更新整理分支的合并前准备流程。', useCases: ['完成分支合并前复核', '修复经验证的审查问题', '运行检查并更新 PR 状态'] },
  { pattern: /^openseo-release-notes$/i, category: '发布与变更管理', summary: '为 OpenSEO 版本发布整理版本号、提交记录、用户可读更新说明、复核流程和发布 PR。', useCases: ['准备 OpenSEO 版本发布', '从提交记录生成更新说明', '执行发布前复核并创建 PR'] },
  { pattern: /^seo-coach$/i, category: 'SEO 与内容增长', summary: '以引导模式解释 OpenSEO 工作流、推荐下一步，并说明如何组合 Agent、网页搜索、抓取和 MCP 数据。', useCases: ['了解 OpenSEO 工作流程', '选择下一步 SEO 分析动作', '组合公开搜索与数据工具'] },
  { pattern: /^seo-project-setup$/i, category: 'SEO 与内容增长', summary: '建立可持续维护的本地 SEO 项目空间，整理项目背景、目标、定位、偏好、数据连接检查和 Search Console 数据入口。', useCases: ['初始化 SEO 项目工作区', '记录目标、定位与研究偏好', '检查数据连接并接入搜索数据'] },
  { pattern: /^cargo-diagnostics$/i, category: '工作流诊断', summary: '复盘 Cargo 工作流运行结果，追踪单次错误、归并批量失败根因，并分析 play 的 credits 消耗。', useCases: ['解释工作流为何输出异常', '归并批量运行错误的根因', '分析 credits 消耗与优化空间'] },
  { pattern: /^game-design-document$/i, category: '游戏设计', summary: '把游戏概念整理成覆盖玩法循环、机制、UX、艺术方向、商业化、技术要求和竞品分析的游戏设计文档，并可配套提案材料。', useCases: ['编写完整游戏设计文档', '整理游戏提案与一页简介', '明确玩法、艺术和技术需求'] },
  { pattern: /^spec-impl$/i, category: '开发与工程', summary: '在规格已获批准的前提下创建对应 Git 分支，并按步骤实施规格、分段停下复核差异。', useCases: ['落实已批准的功能规格', '按规格建立独立开发分支', '分阶段实现并复核代码差异'] },
  { pattern: /^meshy-3d-agent$/i, category: '3D 与多媒体', summary: '使用 Meshy AI API 生成和处理 3D 模型、纹理、角色绑定与动画，并整理面向 3D 打印的处理流程。', useCases: ['从文字或图像生成 3D 模型', '为模型生成纹理或角色动画', '准备模型的 3D 打印流程'] },
  { pattern: /^biz-health-check$/i, category: '企业与公共数据', summary: '以韩国企业注册号交叉查询税务状态、养老金参保单位、欠税名单、法人概况、采购制裁和地方许可经营状态，并只并列事实。', useCases: ['核对韩国企业基本经营状态', '交叉检查多项公共登记信息', '整理不含评分的企业尽调事实'] },
  { pattern: /^fsc-corporate-info$/i, category: '企业与公共数据', summary: '通过韩国公共数据查询金融委员会法人基本信息，查看代表人、成立日期、行业等概况，并在可用时核对企业编号。', useCases: ['查询韩国法人基本资料', '按法人名称核对代表人与行业', '交叉验证返回的企业编号'] },
  { pattern: /^g2b-sanctioned-supplier$/i, category: '企业与公共数据', summary: '通过韩国公共数据查询采购厅不当供应商制裁信息，按企业注册号核对当前有效的投标资格限制、期限、机构和法律依据。', useCases: ['核查韩国供应商采购制裁', '确认投标资格限制是否有效', '整理制裁期限、机构与依据'] },
  { pattern: /^localdata-business-status$/i, category: '企业与公共数据', summary: '查询韩国地方行政许可数据，了解餐饮、住宿、药店等许可行业商户的营业、停业、歇业状态及许可日期和地址。', useCases: ['查询韩国本地商户营业状态', '核对许可与停业日期', '按商号和地区检索许可信息'] },
  { pattern: /^national-pension-workplace$/i, category: '企业与公共数据', summary: '通过韩国公共数据查询国民年金参保单位记录，以参保人数、当月缴费额和月度增减观察企业人员规模变化。', useCases: ['查询韩国企业参保单位信息', '观察参保人数和月度变化', '辅助了解企业人员规模趋势'] },
  { pattern: /^using-superpowers$/i, category: 'Skill 管理', summary: '描述在会话开始时发现和调用 Skill 的流程约定，用于规范 Agent 如何选择可用能力。', useCases: ['建立会话开始时的 Skill 检查流程', '规范任务与 Skill 的匹配方式', '审查 Agent 能力调用约定'] },
  { pattern: /^scroll-world$/i, category: '设计与前端', summary: '设计随滚动连续推进的沉浸式 3D 世界落地页，串联场景、品牌素材和可移植的滚动驱动播放逻辑。', useCases: ['制作滚动控制的品牌叙事页面', '规划连续镜头式 3D 场景', '为落地页接入滚动播放交互'] },
  { pattern: /^remotion-upgrade$/i, category: '图像与多媒体', summary: '升级 Remotion 及其相关包、兼容的 Mediabunny 包和已安装的 Remotion Agent Skills。', useCases: ['升级 Remotion 项目依赖', '核对相关包的兼容版本', '更新 Remotion 工程的配套能力'] },
  { pattern: /^decision-records$/i, category: '文档与知识', summary: '管理 ADR 风格的决策记录草稿、发布、归档和替代关系，并维护索引与交叉链接。', useCases: ['起草并发布决策记录', '归档或替代已有决策', '维护决策索引和关联链接'] },
  { pattern: /^dual-axis-skill-reviewer$/i, category: 'Skill 管理', summary: '以确定性代码检查和模型深度审查两个维度评估项目中的 Skill，输出可复现评分和改进项。', useCases: ['审查 Skill 结构、脚本与测试', '对比自动检查和深度审查发现', '为低分 Skill 制定改进清单'] },
  { pattern: /^nature-experiment-log$/i, category: '文档与知识', summary: '把图片、语音或文字等原始实验材料整理成带 YAML frontmatter 的标准实验日志，并写入指定 Obsidian vault。', useCases: ['标准化记录自然实验过程', '把多种原始材料整理成日志', '维护 Obsidian 实验记录库'] },
  { pattern: /^deeppapernote$/i, category: '文档与知识', summary: '为单篇论文生成结构清晰、基于证据的深度阅读笔记，并整理为 Obsidian 风格 Markdown。', useCases: ['把论文链接或 PDF 整理成深度笔记', '提炼论文方法、证据与局限', '为知识库预留图表与引用位置'] },
  { pattern: /^codex-delegate$/i, category: 'Agent 工作流', summary: '把编码任务委派给 Codex CLI 后台执行，再由当前协作者审查差异并决定如何落地。', useCases: ['把明确的实现任务交给 Codex', '排队处理多个编码子任务', '审查 Codex 生成的代码差异'] },
  { pattern: /^base44-remote-dev$/i, category: '开发与工程', summary: '通过 MCP 或 Base44 CLI 连接云端沙箱，远程开发、预览和验证 Base44 应用。', useCases: ['连接并编辑 Base44 云端应用', '执行远程开发与预览循环', '检查沙箱状态和连接器配置'] },
  { pattern: /^base44-sandbox$/i, category: '开发与工程', summary: '在 Base44 云端沙箱中直接编写应用资源、后端函数、实体和 Agent，并管理远程连接器。', useCases: ['在云端沙箱开发 Base44 应用', '创建后端函数、实体或 Agent', '配置远程应用连接器'] },
  { pattern: /^influencer-marketing$/i, category: '营销与增长', summary: '规划创作者、达人和品牌大使合作，覆盖伙伴筛选、合作结构、内容简报、披露与效果衡量。', useCases: ['筛选和评估创作者合作对象', '设计赞助、赠品或大使计划', '制定内容简报并衡量合作回报'] },
  { pattern: /^query$/i, descriptionPattern: /DuckDB|SQL queries/i, category: '数据库与 ORM', summary: '使用 SQL 或自然语言查询 DuckDB 数据库及临时文件，并采用 DuckDB 友好 SQL 习惯。', useCases: ['查询已连接的 DuckDB 数据库', '直接分析 CSV 或 Parquet 等文件', '把自然语言问题转成 SQL 查询'] },
  { pattern: /^cmux-billing$/i, category: '支付与订阅', summary: '维护 cmux 的 Stripe 结账、定价、订阅、Webhook 和 Pro 权益记录流程。', useCases: ['实现或排查 Stripe Checkout', '维护订阅状态与 Pro 权益', '调试计费 Webhook 和价格配置'] },
  { pattern: /^strategy-red-team$/i, category: '产品与战略', summary: '对 PRD、路线图或战略的关键假设做压力测试，并按影响、可能性和验证成本排列失败模式。', useCases: ['挑战产品战略的关键假设', '为高风险判断设计低成本测试', '准备管理层评审前的反方审查'] },
  { pattern: /^argent-settings-permissions$/i, category: '移动开发与测试', summary: '通过 Argent 工具在 iOS 模拟器或 Android 设备上授予、拒绝或重置应用运行时权限。', useCases: ['预先配置相机或定位权限', '恢复已拒绝的移动端权限', '重置权限以重新触发系统提示'] },
  { pattern: /^wwdc$/i, category: '文档与知识', summary: '查找、比较、引用和总结 WWDC 会议视频、逐字稿、会话编号与相关技术说明。', useCases: ['检索 WWDC 会话与逐字稿', '比较不同年份的技术说明', '为 Apple 开发问题整理可引用资料'] },
  { pattern: /^azure-rbac$/i, category: '安全与合规', summary: '为 Azure 身份选择最小权限 RBAC 角色，并生成对应的 CLI 与 Bicep 角色分配配置。', useCases: ['查找满足访问需求的最小权限角色', '生成 Azure 角色分配命令或 Bicep', '核对授予角色所需的管理权限'] },
  { pattern: /^higgsfield-generate$/i, category: '图像与多媒体', summary: '通过 Higgsfield AI 生成或处理图片、视频、3D 资产和音频，并支持广告与多媒体工作流。', useCases: ['生成或编辑图片与视频', '创建 3D 模型、音效或音乐', '制作广告素材并分析视频传播表现'] },
  { pattern: /^brandkit$/i, category: '品牌与视觉设计', summary: '生成品牌规范板、Logo 系统、视觉识别提案和品牌世界展示，强调高完成度构图与应用样机。', useCases: ['制作品牌视觉规范板', '探索 Logo 与符号系统', '生成品牌提案和应用场景样机'] },
  { pattern: /^minimalist-ui$/i, category: '设计与前端', summary: '定义编辑感极简界面风格，使用暖色单色体系、字体对比、平面网格和克制的视觉效果。', useCases: ['设计极简网页或应用界面', '建立克制的色彩与排版体系', '审核渐变、阴影和装饰是否过度'] },
  { pattern: /^apple-design$/i, category: '设计与前端', summary: '把 Apple 的界面、手势和物理动效原则转译到 Web，覆盖弹簧、拖拽、层次、排版与减少动效。', useCases: ['实现可中断的手势与弹簧动画', '设计拖拽、滑动和 Sheet 交互', '检查深度、排版与减少动效体验'] },
  { pattern: /^gpt-taste$/i, category: '设计与前端', summary: '面向营销页面的 UI 与 GSAP 动效规范，强调 AIDA 结构、编辑式排版、Bento 网格和滚动驱动动画。', useCases: ['设计转化导向的营销页面', '规划 GSAP ScrollTrigger 动效', '建立大尺度编辑式页面节奏'] },
  { pattern: /^imagegen-frontend-web$/i, category: '品牌与视觉设计', summary: '为网站各区块分别生成一致配色、构图多样且便于开发还原的高质量视觉参考图。', useCases: ['为落地页逐区块生成设计参考', '保持多张页面视觉的一致性', '为前端实现提供清晰可复刻的画面'] },
  { pattern: /^imagegen-frontend-mobile$/i, category: '品牌与视觉设计', summary: '生成适合 iOS、Android 和跨平台产品的移动应用界面概念与多屏流程图像，不包含代码实现。', useCases: ['生成移动应用关键界面概念', '规划一致的多屏用户流程', '用手机样机展示应用视觉方案'] },
  { pattern: /^image-to-code$/i, category: '设计与前端', summary: '先生成并分析独立的网页设计图，再据此实现高还原度网站，重点保持层级、留白和区块可读性。', useCases: ['从新生成的设计图实现网页', '按区块分析并还原视觉细节', '检查实现与参考图的一致性'] },
  { pattern: /^stitch-design-taste$/i, category: '设计系统', summary: '为 Google Stitch 生成便于 Agent 使用的 DESIGN.md，约束排版、色彩、非对称布局、微动效与性能。', useCases: ['为 Stitch 项目建立设计规则', '生成可执行的 DESIGN.md', '统一界面质感、动效与性能约束'] },
  { pattern: /^ai-avatar-video$/i, category: '图像与多媒体', summary: '通过公开说明列出的模型生成数字人、口型同步和虚拟讲解视频，支持文本或音频驱动。', useCases: ['制作虚拟讲解员或数字人视频', '让角色音频与口型同步', '生成营销、配音或游戏角色视频'] },
  { pattern: /^twitter-automation$/i, category: '营销与增长', summary: '通过公开说明所述的 inference.sh CLI 管理 X/Twitter 发帖、排期、互动、私信和关注操作。', useCases: ['发布或排期 X/Twitter 内容', '执行点赞、转发和私信互动', '查询资料并维护关注关系'] },
  { pattern: /^ai-video-generation$/i, category: '图像与多媒体', summary: '通过公开说明列出的多种模型完成文生视频、图生视频、参考生成、编辑、口型同步和放大。', useCases: ['从文字或图片生成视频', '编辑、放大或补充视频声音', '制作营销、演示或数字人内容'] },
  { pattern: /^ai-image-generation$/i, category: '图像与多媒体', summary: '通过公开说明列出的多种模型完成文生图、图生图、局部重绘、LoRA、编辑和放大。', useCases: ['生成插画、概念图和营销视觉', '编辑或局部重绘现有图片', '制作产品样机与社交媒体图片'] },
  { pattern: /^clickstack-otel-collector$/i, category: '云平台与运维', summary: '把 OpenTelemetry Collector 接入 ClickHouse Cloud 的 Managed ClickStack，并用合成遥测验证数据可见性。', useCases: ['部署本地 OpenTelemetry Collector', '把现有 Collector 接入 ClickStack', '发送并核验测试遥测数据'] },
  { pattern: /^dart-fix-runtime-errors$/i, category: 'Flutter 开发', summary: '结合运行时错误和语言服务定位 Dart 失败代码，应用修复后通过热重载验证。', useCases: ['读取当前 Dart 堆栈错误', '定位并修复失败代码行', '通过热重载确认问题解决'] },
  { pattern: /^dart-run-static-analysis$/i, category: '测试与质量', summary: '运行 Dart 静态分析，并用 dart fix 处理可机械修复的警告与 lint 问题。', useCases: ['检查 Dart 警告和错误', '自动修复机械性 lint 问题', '在提交前执行代码质量检查'] },
  { pattern: /^dart-resolve-package-conflicts$/i, category: 'Flutter 开发', summary: '排查 pub get 的 Dart 包版本约束冲突，并调整依赖以恢复解析。', useCases: ['诊断 pub get 失败原因', '比较冲突包的版本约束', '调整依赖并重新验证解析'] },
  { pattern: /^dart-use-pattern-matching$/i, category: 'Flutter 开发', summary: '在适合的 Dart 代码中使用 switch 表达式和模式匹配，简化分支与数据解构。', useCases: ['把条件分支改写为 switch 表达式', '使用模式解构结构化数据', '审查模式匹配是否适合当前代码'] },
  { pattern: /^dart-add-unit-test$/i, category: '测试与质量', summary: '使用 package:test 为 Dart 函数、方法和类编写与组织单元测试。', useCases: ['为新增逻辑编写单元测试', '为缺陷修复补充回归测试', '组织 Dart 测试文件与断言'] },
  { pattern: /^dart-setup-ffi-assets$/i, category: 'Flutter 开发', summary: '使用 Dart Native Assets 钩子编译、链接和打包 C/C++ 动态或静态库。', useCases: ['配置 Dart 原生资产构建钩子', '把 C/C++ 库接入 Dart 或 Flutter', '生成并链接跨平台原生二进制'] },
  { pattern: /^dart-generate-test-mocks$/i, category: '测试与质量', summary: '使用 Mockito 和 build_runner 为 Dart 外部依赖定义并生成测试 Mock。', useCases: ['为 API 或数据库依赖生成 Mock', '隔离被测类的外部服务', '维护 Dart 单元测试替身'] },
  { pattern: /^dart-use-ffigen$/i, category: 'Flutter 开发', summary: '使用 package:ffigen 自动生成 C、Objective-C 或 Swift 的 Dart FFI 绑定。', useCases: ['为原生库生成 Dart FFI 绑定', '扩展 C 或 Apple 平台接口集成', '替换手写的 dart:ffi 绑定'] },
  { pattern: /^dart-collect-coverage$/i, category: '测试与质量', summary: '使用 Dart coverage 包收集测试覆盖率并生成 LCOV 报告。', useCases: ['采集 Dart 测试覆盖率', '生成 LCOV 覆盖率文件', '检查未覆盖的代码区域'] },
  { pattern: /^dart-migrate-to-checks-package$/i, category: '测试与质量', summary: '把 Dart 测试中 package:matcher 的 expect 等断言迁移到 package:checks 对应写法。', useCases: ['迁移 matcher 断言代码', '替换 expect 等旧式用法', '验证迁移后的测试行为'] },
  { pattern: /^dart-build-cli-app$/i, category: 'Flutter 开发', summary: '组织 Dart 命令行应用的入口、退出码和跨平台启动脚本。', useCases: ['搭建 Dart CLI 项目结构', '设计命令退出码', '编写跨平台命令行脚本'] },
  { pattern: /^platform-models-api-configure$/i, category: 'AI 与 Agent 工程', summary: '配置或排查 AI 编码 Agent 通过 OrgJWT 接入 Salesforce Models API 的路由、认证与模型设置。', useCases: ['把 Agent 指向 Salesforce 模型端点', '配置 OrgJWT 与凭据助手', '排查 Models API 的认证或模型错误'] },
  { pattern: /^platform-policy-rule-generate$/i, category: '安全与合规', summary: '为 Salesforce Data Cloud 治理策略编写和校验 PolicyRuleDefinition 及其集合的元数据 XML。', useCases: ['生成数据治理策略元数据', '编辑策略规则定义 XML', '检查策略类别、结构和构建器兼容性'] },
  { pattern: /^genshijin$/i, category: '沟通与可访问性', summary: '把回复压缩为原始人式短句，在保留技术准确性的同时减少上下文和令牌占用。', useCases: ['把长回复改成极简短句', '为低令牌预算压缩沟通', '按不同强度控制回复简洁度'] },
  { pattern: /^serenity-skill$/i, category: '金融与市场数据', summary: '围绕产业链瓶颈开展有来源的投资研究、主题扫描、候选排序和论点压力测试，不提供交易执行。', useCases: ['梳理 AI 或半导体产业链卡点', '筛选并排序待研究公司', '挑战投资论点并列出验证步骤'] },
  { pattern: /^od-contribute$/i, category: '开发与工程', summary: '为 Open Design 项目准备 Skill、设计系统、文档翻译、内容修正或问题报告的贡献流程。', useCases: ['提交 Open Design Skill 或设计系统', '准备文档翻译或小型修正', '验证内容并创建贡献 PR 或问题'] },
  { pattern: /^spartan$/i, descriptionPattern: /spartan\/ui|@spartan-ng/i, category: '设计与前端', summary: '管理 Angular 的 spartan/ui 组件库，覆盖初始化、添加、组合、修复、调试和样式调整。', useCases: ['初始化 spartan/ui 项目', '添加和组合 Angular 界面组件', '排查 Brain 或 Helm 组件问题'] },
  { pattern: /^audio-transcription$/i, category: '音频与语音', summary: '使用托管 Whisper 模型把音频转为持久化文本、时间戳和字幕就绪产物。', useCases: ['转写远程或已上传音频', '生成带时间戳的逐字稿', '准备字幕格式的文本产物'] },
  { pattern: /^price-optimization-tool$/i, category: '电商与商品研究', summary: '结合单位经济、历史观测、弹性、情景模型和受控实验评估电商价格候选，不直接改动线上价格。', useCases: ['比较候选价格对收入和贡献的影响', '估算价格弹性并设计实验', '评估套餐或价格档位'] },
  { pattern: /^dynamic-pricing-ecommerce$/i, category: '电商与商品研究', summary: '设计带价格上下限、审批、模拟、监控和回滚的电商动态定价或重新定价机制。', useCases: ['设计需求或库存驱动的调价规则', '设置 SKU 范围与价格护栏', '规划调价模拟、审批和回滚'] },
  { pattern: /^competitive-pricing-strategy$/i, category: '电商与商品研究', summary: '基于竞品证据、利润边界、促销和套餐设计制定电商竞争定价策略。', useCases: ['确定相对竞品的价格定位', '规划常规价与促销价', '设计套餐、价格档位和竞品响应'] },
  { pattern: /^java-helidon$/i, category: '开发与工程', summary: '整理 Helidon 4 SE 与 MP 的 Java 21+ 应用开发实践，覆盖路由、数据访问、配置、安全和测试。', useCases: ['开发 Helidon SE 或 MP 服务', '配置路由、数据库与 MicroProfile', '审查 Helidon 安全和测试实现'] },
  { pattern: /^agent-skill-stack$/i, category: 'Skill 管理', summary: '为多步骤目标查找、评估并组合最小兼容 Skill 集合，同时检查重叠、适配性和冲突。', useCases: ['为端到端工作流选择 Skill 组合', '审计已安装 Skill 的覆盖与冲突', '形成项目专用 Skill Stack 方案'] },
  { pattern: /^competitor-teardown$/i, category: '市场与竞争研究', summary: '通过功能矩阵、SWOT、定位图、定价比较、评论挖掘和 UX 审查开展结构化竞品分析。', useCases: ['制作竞品功能和定价对比', '开展 SWOT 与市场定位分析', '为产品战略或销售材料整理结论'] },
  { pattern: /^product-hunt-launch$/i, category: '营销与增长', summary: '规划 Product Hunt 上线的标语、图库、Maker 评论、发布时间和上线日动作。', useCases: ['准备 Product Hunt 上线素材', '优化产品标语与图库顺序', '制定上线日发布和互动计划'] },
  { pattern: /^video-ad-specs$/i, category: '营销与增长', summary: '按 TikTok、Instagram、YouTube、Facebook 和 LinkedIn 的尺寸、时长与字幕要求规划视频广告。', useCases: ['制作不同平台的视频广告规格表', '按 AIDA 结构规划广告内容', '检查尺寸、时长和字幕要求'] },
  { pattern: /^storyboard-creation$/i, category: '图像与多媒体', summary: '使用镜头类型、机位、运动、连续性和分镜注释规则规划影视或广告故事板。', useCases: ['为视频或广告制作分镜', '规划镜头表和机位运动', '检查 180 度规则与场景连续性'] },
  { pattern: /^product-photography$/i, category: '图像与多媒体', summary: '按棚拍灯光、生活方式场景、背景、阴影、角度和电商图规范规划 AI 商品摄影。', useCases: ['制作商品主图和棚拍画面', '规划生活方式商品图片', '检查电商图片角度、背景和阴影'] },
  { pattern: /^image-to-video$/i, category: '图像与多媒体', summary: '根据静态图内容选择公开说明列出的图生视频模型，并设计运动与镜头提示。', useCases: ['把静态图片转成视频', '为图片添加主体或镜头运动', '为产品图、照片或插画选择模型'] },
  { pattern: /^gh-stackx$/i, category: '开发与工程', summary: '在 GitHub Stacked PRs API 不可用时，通过 gh-stackx 扩展提交、同步和合并堆叠式 PR。', useCases: ['提交堆叠式 Pull Request', '同步堆叠分支关系', '按顺序合并堆叠 PR'] },
  { pattern: /^kelos-e2e$/i, category: '测试与质量', summary: '运行 Kelos 的 skills.sh 安装端到端检查，用于确认其 Skill 安装流程是否通过。', useCases: ['执行 Kelos E2E 检查', '验证 skills.sh 安装流程', '记录安装验证结果'] },
  { pattern: /^higgsfield-product-photoshoot$/i, category: '电商与商品研究', summary: '通过 Higgsfield 的商品摄影提示增强流程生成棚拍、生活方式、横幅、轮播和广告创意等品牌商品图。', useCases: ['生成棚拍或生活方式商品图', '制作横幅、轮播和付费社交广告素材', '创建虚拟试穿或概念商品视觉'] },
  { pattern: /^higgsfield-soul-id$/i, category: '图像与多媒体', summary: '训练基于人物面部的 Soul Character 引用，用于后续保持身份一致的 Higgsfield 图像和视频生成。', useCases: ['训练个人数字形象引用', '在后续图像生成中保持人物身份一致', '为视频生成准备可复用的人物身份'] },
  { pattern: /^sleek-design-mobile-apps$/i, category: '设计与前端', summary: '设计移动应用界面，读取 Sleek 项目上下文，或把 Sleek 设计实现为 HTML、React Native 或 SwiftUI。', useCases: ['设计移动应用关键界面', '基于 Sleek 项目继续迭代设计', '把 Sleek 设计转为移动端代码'] },
  { pattern: /^better-layout$/i, category: '设计与前端', summary: '审查和改进网页界面的分组、对齐、留白、阅读顺序、渐进披露与响应式断点。', useCases: ['调整页面或组件布局层级', '优化响应式断点与小屏折叠', '检查 RTL、安全区和全宽布局'] },
  { pattern: /^better-accessibility$/i, category: '沟通与可访问性', summary: '审查产品界面的键盘操作、焦点、ARIA、表单、语义 HTML、屏幕阅读器和减少动效支持。', useCases: ['修复键盘导航与焦点问题', '检查表单和自定义组件的 ARIA', '审查屏幕阅读器与减少动效体验'] },
  { pattern: /^better-interface$/i, category: '设计与前端', summary: '协调无障碍、布局、文案、排版、色彩和 UI 规则，对界面开展快速或完整的跨领域审查。', useCases: ['全面审查单个页面或流程', '汇总跨设计领域的界面问题', '形成有优先级的 UI 改进清单'] },
  { pattern: /^better-writing$/i, category: '内容与写作', summary: '编写和审查按钮、链接、错误提示、空状态、占位符、设置项与引导流程等界面文案。', useCases: ['改写按钮和链接标签', '优化错误提示与空状态文案', '统一产品语气和大小写规范'] },
  { pattern: /^codehealth-mcp$/i, category: '测试与质量', summary: '通过 CodeScene MCP 检查代码结构健康度，在修改前后比较评分，并为提交或 PR 设置质量门槛。', useCases: ['重构前检查代码健康度', '比较修改前后的结构评分', '在提交或 PR 前执行质量门禁'] },
  { pattern: /^kubernetes-patterns$/i, category: '云平台与运维', summary: '整理生产级 Kubernetes 的工作负载、资源、RBAC、探针、伸缩、配置与 kubectl 排障模式。', useCases: ['设计 Kubernetes 工作负载', '配置资源、探针与自动伸缩', '排查 RBAC、配置和运行问题'] },
  { pattern: /^intent-driven-development$/i, category: '产品与增长', summary: '把模糊或高影响的产品与工程变更转化为有边界、可验证的验收标准。', useCases: ['澄清复杂功能范围', '为安全、数据或迁移变更定义验收标准', '把需求整理成可测试的实现条件'] },
  { pattern: /^slack-cli$/i, category: '办公与效率', summary: '通过公开说明所述的 Slack CLI 读取频道、消息、线程和用户，并执行发帖、回应、标记已读等协作操作。', useCases: ['读取或搜索 Slack 对话', '发送消息或添加回应', '管理未读、收藏和用户组'] },
  { pattern: /^inherit-legacy-style$/i, category: '开发与工程', summary: '分析手写遗留项目的架构与代码风格约束，帮助编码 Agent 避免引入不一致的主流惯例。', useCases: ['为 Agent 建立遗留项目风格边界', '减少重构中的代码风格漂移', '保持既有架构和命名习惯'] },
  { pattern: /^orch-pipeline$/i, category: 'Agent 工作流', summary: '为 orch 系列流程定义研究、计划、TDD、审查和提交的共享门禁、规模分类与 Agent 分工。', useCases: ['统一多阶段工程编排', '按任务规模选择执行流程', '设置人工确认与提交门禁'] },
  { pattern: /^shipping-artifacts$/i, category: '文档与知识', summary: '为 AI 构建的应用整理架构、用户与权限流程、变量、密钥和测试覆盖等可交接文档。', useCases: ['准备应用交付文档', '记录权限和信任边界', '为安全、性能或测试审计建立材料'] },
  { pattern: /^orch-build-mvp$/i, category: 'Agent 工作流', summary: '从设计或规格文档出发，以垂直切片、TDD、审查和门禁提交方式编排可运行 MVP。', useCases: ['把 PRD 或设计稿转为 MVP', '规划首个端到端垂直切片', '协调实现、测试和审查阶段'] },
  { pattern: /^orch-refine-code$/i, category: 'Agent 工作流', summary: '编排行为保持型重构，在测试为绿的前提下调整结构、复核结果并经过门禁提交。', useCases: ['重构但保持外部行为', '在调整前后持续验证测试', '组织重构审查和提交门禁'] },
  { pattern: /^orch-fix-defect$/i, category: 'Agent 工作流', summary: '编排缺陷修复：先用回归测试复现，再修复到通过，完成审查后进入门禁提交。', useCases: ['为缺陷建立失败测试', '协调修复与回归验证', '完成修复审查和提交门禁'] },
  { pattern: /^orch-add-feature$/i, category: 'Agent 工作流', summary: '编排全新功能的研究、计划、TDD 实现、审查与门禁提交。', useCases: ['端到端开发新功能', '协调研究、测试和实现阶段', '在提交前完成质量审查'] },
  { pattern: /^orch-change-feature$/i, category: 'Agent 工作流', summary: '编排现有功能的行为变更，先更新目标测试，再修改实现、审查并经过门禁提交。', useCases: ['改变已有功能行为', '把新规格固化为测试', '协调实现、审查和提交门禁'] },
  { pattern: /^opencli-sitemap-author$/i, category: '浏览器自动化', summary: '为网站创建或维护供 Agent 使用的导航、页面状态、动作、工作流、API 和降级知识地图。', useCases: ['把浏览器探索沉淀为站点地图', '更新过期的网站操作知识', '记录网页动作、陷阱与降级路径'] },
  { pattern: /^graphify$/i, category: '数据与研究', summary: '把代码、文档或媒体转化为持久知识图谱，并通过社区、路径和解释查询理解内容关系。', useCases: ['查询代码库架构和文件关系', '把异构资料构造成知识图谱', '分析节点路径和主题社区'] },
  { pattern: /^opencode-delegate$/i, category: 'Agent 工作流', summary: '把编码任务交给 OpenCode CLI 后台实现，再由当前执行者审查差异并决定是否落地。', useCases: ['委派明确的编码实现', '批量排队 OpenCode 任务', '审查委派结果的代码差异'] },
  { pattern: /^cx-cases$/i, category: '云平台与运维', summary: '通过 Coralogix cx cases CLI 查看、确认、分派、调整优先级或解决事件案例。', useCases: ['分诊 Coralogix Cases', '查看事件时间线与通知投递', '确认、分派或解决案例'] },
  { pattern: /^gitmoji$/i, category: '开发与工程', summary: '根据变更意图选择合适的 gitmoji，并生成符合约定的提交消息，但不执行 Git 命令。', useCases: ['为代码差异生成 gitmoji 提交消息', '为变更选择合适表情符号', '统一项目提交消息格式'] },
  { pattern: /^agent-ui$/i, category: '设计与前端', summary: '使用 ui.inference.sh 的 React/Next.js Agent 组件构建带流式输出、工具、审批和 Widget 的 AI 界面。', useCases: ['构建 AI 助手或 Copilot 界面', '接入客户端工具和审批流程', '为 SaaS 添加 Agent 交互组件'] },
  { pattern: /^ai-automation-workflows$/i, category: 'AI 与 Agent 工程', summary: '组合模型、脚本、Webhook 与定时或事件触发机制，构建批处理和 Agent 循环等 AI 自动化流程。', useCases: ['建立定时内容生成任务', '设计事件驱动 AI 流程', '批量处理数据或媒体任务'] },
  { pattern: /^ai-content-pipeline$/i, category: '图像与多媒体', summary: '串联图像、视频、音频和文本模型构建多步骤 AI 内容生产流水线。', useCases: ['把图片生成、动画和配音串成流程', '自动化社交或营销内容生产', '规划多媒体内容工厂'] },
  { pattern: /^ai-marketing-videos$/i, category: '营销与增长', summary: '使用公开视频、图像和语音模型规划广告、产品发布、演示和品牌营销视频。', useCases: ['制作社交平台广告视频', '生成产品演示或发布视频', '组合画面、旁白和品牌内容'] },
  { pattern: /^ai-music-generation$/i, category: '音频与语音', summary: '通过公开说明列出的 ElevenLabs、Diffrythm 和腾讯模型生成歌曲、配乐、器乐或广告短曲。', useCases: ['生成视频或播客背景音乐', '把歌词转成完整歌曲', '制作游戏配乐或广告短曲'] },
  { pattern: /^ai-podcast$/i, category: '图像与多媒体', summary: '从角色创建、TTS、数字人动画到视频拼接，生成多人对谈式播客视频。', useCases: ['制作多人播客视频', '生成角色语音与对谈画面', '拼接完整访谈式视频'] },
  { pattern: /^ai-podcast-creation$/i, category: '音频与语音', summary: '组合多角色 TTS、背景音乐和音频编辑流程制作播客、有声书或音频通讯。', useCases: ['生成多人对话播客', '制作有声书或音频通讯', '添加片头片尾和背景音乐'] },
  { pattern: /^ai-product-photography$/i, category: '电商与商品研究', summary: '使用公开图像模型生成棚拍、生活方式、包装、样机与电商商品视觉。', useCases: ['制作电商商品主图', '生成生活方式或棚拍画面', '创建包装和广告样机'] },
  { pattern: /^ai-rag-pipeline$/i, category: 'AI 与 Agent 工程', summary: '组合网页搜索与语言模型构建带检索、事实核对、来源和知识库能力的 RAG 流程。', useCases: ['构建研究或问答 Agent', '生成有来源的检索增强回答', '为知识库加入事实核对流程'] },
  { pattern: /^ai-social-media-content$/i, category: '营销与增长', summary: '为 TikTok、Instagram、YouTube 和 X 生成图片、短视频、缩略图、文案和标签。', useCases: ['制作 Reels、Shorts 或 TikTok 内容', '生成社交缩略图与配文', '规划多平台内容资产'] },
  { pattern: /^ai-voice-cloning$/i, category: '音频与语音', summary: '通过公开说明列出的 TTS 与语音模型生成多语言、可调情绪和角色风格的合成语音。', useCases: ['制作旁白、有声书或播客语音', '生成角色或数字人音频', '为无障碍和游戏场景合成语音'] },
  { pattern: /^background-removal$/i, category: '图像与多媒体', summary: '通过 BiRefNet 从商品、人像等图片中移除背景并生成透明底素材。', useCases: ['生成透明背景 PNG', '处理电商商品或人像抠图', '为设计和合成准备前景素材'] },
  { pattern: /^book-cover-design$/i, category: '品牌与视觉设计', summary: '按不同图书类型的构图、字体、尺寸和缩略图规则设计电子书、纸书或有声书封面。', useCases: ['设计小说或非虚构图书封面', '检查缩略图可读性', '制作封面概念与展示样机'] },
  { pattern: /^building-inferencesh-apps$/i, category: 'AI 与 Agent 工程', summary: '使用 Python 或 Node.js 在 inference.sh 上创建、配置资源并部署 AI 应用。', useCases: ['搭建 inference.sh 应用', '配置 GPU、变量和资源', '用 Python 或 Node.js 部署服务'] },
  { pattern: /^case-study-writing$/i, category: '内容与写作', summary: '使用 STAR 结构、客户引语、指标和数据可视化编写 B2B 客户案例。', useCases: ['撰写客户成功故事', '制作销售赋能案例材料', '整理成果指标与客户引语'] },
  { pattern: /^chat-ui$/i, category: '设计与前端', summary: '使用 ui.inference.sh 的 React/Next.js 组件构建消息列表、输入框、头像和流式状态等聊天界面。', useCases: ['构建 AI 聊天界面', '实现消息列表和输入交互', '加入流式响应和输入状态'] },
  { pattern: /^content-repurposing$/i, category: '内容与写作', summary: '把博客、播客或视频拆解并改写为帖子、轮播、文章和引语等多平台内容。', useCases: ['把博客改成线程或轮播', '把播客整理成文章', '为多平台分发复用长内容'] },
  { pattern: /^customer-persona$/i, category: '市场与竞争研究', summary: '结合人口、心理、待办任务、旅程和反向画像，创建有研究依据的客户 Persona。', useCases: ['建立目标客户画像', '支持产品与营销策略', '梳理客户旅程和反向 Persona'] },
  { pattern: /^data-visualization$/i, category: '数据与研究', summary: '依据图表选择、色彩、坐标轴和标注原则设计图表、仪表盘与数据叙事。', useCases: ['为数据选择合适图表', '改进仪表盘与报告图形', '检查坐标轴、色彩和注释'] },
  { pattern: /^(dialogue-audio|elevenlabs-dialogue)$/i, category: '音频与语音', summary: '生成带多角色、情绪、节奏和说话人区分的对话音频。', useCases: ['制作多人播客或有声书对话', '生成角色对白和配音', '控制对话节奏与说话人'] },
  { pattern: /^elevenlabs-dubbing$/i, category: '音频与语音', summary: '通过 ElevenLabs 生成跨语言配音，并尽量保留原说话人的声音风格和时间关系。', useCases: ['为视频制作多语言配音', '本地化访谈或课程音频', '保持配音时序与说话人区分'] },
  { pattern: /^elevenlabs-music$/i, category: '音频与语音', summary: '通过 ElevenLabs Music 根据文字说明生成歌曲、器乐和较长音乐片段。', useCases: ['生成背景音乐或完整歌曲', '制作播客与视频配乐', '创建广告或游戏音乐'] },
  { pattern: /^elevenlabs-sound-effects$/i, category: '音频与语音', summary: '通过 ElevenLabs 根据文字说明生成可指定时长的音效和环境声。', useCases: ['生成影视或游戏音效', '制作环境声和拟音', '为演示和社交内容补充声音'] },
  { pattern: /^(elevenlabs-stt|speech-to-text)$/i, category: '音频与语音', summary: '使用公开说明列出的语音识别模型完成多语言转写、说话人区分、时间戳和字幕准备。', useCases: ['转写会议、播客或语音笔记', '生成带时间戳的字幕文本', '识别说话人和音频事件'] },
  { pattern: /^(elevenlabs-tts|text-to-speech)$/i, category: '音频与语音', summary: '使用公开说明列出的语音模型把文本转为多语言、可调风格的自然语音。', useCases: ['制作旁白、有声书或播客', '生成视频和数字人语音', '为无障碍或 IVR 合成语音'] },
  { pattern: /^elevenlabs-voice-changer$/i, category: '音频与语音', summary: '在保留语音内容和情绪的同时，把已有说话声音转换为另一种声音。', useCases: ['转换角色或配音声音', '制作跨语言语音表演', '为隐私或内容创作改变音色'] },
  { pattern: /^elevenlabs-voice-isolator$/i, category: '音频与语音', summary: '从录音中移除背景噪声并分离人声，用于访谈、播客和音频修复。', useCases: ['清理嘈杂录音', '提取或分离人声', '修复播客与访谈音频'] },
  { pattern: /^email-design$/i, category: '营销与增长', summary: '按邮件布局、主题行、投递和移动端规则设计欢迎、推广、交易或滴灌邮件。', useCases: ['设计营销邮件和 Newsletter', '规划欢迎或滴灌邮件序列', '优化移动端布局和投递表现'] },
  { pattern: /^explainer-video-guide$/i, category: '图像与多媒体', summary: '按脚本、旁白、分镜、节奏和多工具组装流程规划产品演示与解释视频。', useCases: ['制作产品演示或上手视频', '规划解释视频脚本与场景', '组合旁白、画面和后期流程'] },
  { pattern: /^flux-image$/i, category: '图像与多媒体', summary: '通过 inference.sh 调用公开说明列出的 FLUX 模型完成文生图、图生图和 LoRA 风格适配。', useCases: ['使用 FLUX 生成或编辑图像', '训练或调用自定义 LoRA', '制作特定风格的视觉素材'] },
  { pattern: /^google-veo$/i, category: '图像与多媒体', summary: '通过 inference.sh 调用公开说明列出的 Google Veo 模型生成高质量视频。', useCases: ['使用文字生成视频', '比较 Veo 不同模型版本', '制作电影感或营销视频素材'] },
  { pattern: /^image-upscaling$/i, category: '图像与多媒体', summary: '使用公开说明列出的放大模型提升低分辨率图像、AI 艺术或旧照片的尺寸和清晰度。', useCases: ['放大低分辨率图片', '增强 AI 图像细节', '修复旧照片并输出高清版本'] },
  { pattern: /^javascript-sdk$/i, category: 'AI 与 Agent 工程', summary: '使用 inference.sh 的 JavaScript/TypeScript SDK 调用模型、流式输出、上传文件并构建带工具和审批的 Agent。', useCases: ['在 Node.js 或 Next.js 中接入模型', '实现流式与文件上传', '构建带工具和人工审批的 Agent'] },
  { pattern: /^linkedin-content$/i, category: '内容与写作', summary: '按 LinkedIn 的开头、排版、内容支柱和互动规律撰写专业帖子与思想领导力内容。', useCases: ['撰写 LinkedIn 专业帖子', '规划 B2B 内容主题', '优化开头、格式和互动设计'] },
  { pattern: /^llm-models$/i, category: 'AI 与 Agent 工程', summary: '通过 inference.sh 和 OpenRouter 访问公开说明列出的多种语言模型，并支持统一调用、回退与成本取舍。', useCases: ['为应用接入多种 LLM', '比较模型能力和成本', '配置统一 API 与回退策略'] },
  { pattern: /^logo-design-guide$/i, category: '品牌与视觉设计', summary: '按 Logo 类型、可缩放性、提示方式和迭代流程创建品牌标志与应用图标概念。', useCases: ['设计品牌 Logo 或图标', '检查小尺寸可读性', '迭代标志概念和视觉方向'] },
  { pattern: /^nano-banana(-2)?$/i, category: '图像与多媒体', summary: '通过 inference.sh 调用公开说明列出的 Gemini 原生图像模型完成文生图、多图输入和图像编辑。', useCases: ['用 Gemini 生成图像', '编辑或组合多张参考图', '比较 Nano Banana 模型版本'] },
  { pattern: /^newsletter-curation$/i, category: '内容与写作', summary: '规划 Newsletter 的选题来源、编辑结构、链接点评、发送节奏和订阅增长。', useCases: ['制作每周摘要或链接合集', '建立 Newsletter 栏目结构', '规划发送节奏与订阅增长'] },
  { pattern: /^og-image-design$/i, category: '品牌与视觉设计', summary: '按 Open Graph、Twitter 和 LinkedIn 分享预览规格设计品牌化社交卡片。', useCases: ['制作博客或页面分享图', '设计 Twitter 和 LinkedIn 预览卡', '检查文字安全区与品牌一致性'] },
  { pattern: /^pitch-deck-visuals$/i, category: '演示文稿', summary: '按投资人路演的页面结构、图表和视觉规则规划融资 Deck。', useCases: ['制作融资或 Demo Day Deck', '规划 12 页左右的路演结构', '优化团队、市场和数据页面'] },
  { pattern: /^press-release-writing$/i, category: '内容与写作', summary: '按 AP 风格和倒金字塔结构撰写包含日期行、引语、公司简介与事实核对的新闻稿。', useCases: ['撰写产品发布或融资新闻稿', '准备合作与公司动态公告', '检查新闻稿格式和事实'] },
  { pattern: /^product-changelog$/i, category: '内容与写作', summary: '用用户可理解的分类、语言和视觉整理产品更新日志与发布说明。', useCases: ['编写版本发布说明', '整理功能更新和修复', '规划 Changelog 的分发方式'] },
  { pattern: /^prompt-engineering$/i, category: 'AI 与 Agent 工程', summary: '整理语言、图像和视频模型的提示结构、示例、负面提示与优化方法。', useCases: ['改进 LLM 任务提示', '设计图像或视频提示词', '建立可复用的提示模板'] },
  { pattern: /^python-sdk$/i, category: 'AI 与 Agent 工程', summary: '使用 inference.sh 的 Python SDK 同步或异步调用模型、流式输出、上传文件并构建带工具和审批的 Agent。', useCases: ['在 Python 应用中接入模型', '实现异步、流式和文件上传', '构建 RAG 或自动化 Agent'] },
  { pattern: /^qwen-image-2(-pro)?$/i, category: '图像与多媒体', summary: '通过 inference.sh 调用 Qwen-Image-2.0 系列完成文生图、多图编辑和复杂文字渲染。', useCases: ['生成或编辑视觉图片', '制作含复杂文字的海报与横幅', '比较标准版和 Pro 版输出'] },
  { pattern: /^related-skill$/i, category: 'Skill 管理', summary: '从 inference.sh Skill 注册表发现与当前工作流相关或互补的 Skill。', useCases: ['查找相似或互补 Skill', '扩展现有 AI 工作流', '探索注册表中的能力范围'] },
  { pattern: /^seo-content-brief$/i, category: '营销与增长', summary: '结合关键词、搜索意图、SERP、标题层级和内链策略创建 SEO 内容 Brief。', useCases: ['为文章制定 SEO Brief', '分析搜索意图与竞品结构', '规划标题、篇幅和内链'] },
  { pattern: /^social-media-carousel$/i, category: '品牌与视觉设计', summary: '按 Instagram、LinkedIn 和 X 的多页结构、文字层级与滑动节奏设计社交轮播。', useCases: ['制作 Instagram 或 LinkedIn 轮播', '规划首屏钩子和页面节奏', '检查平台尺寸与文字层级'] },
  { pattern: /^talking-head-production$/i, category: '图像与多媒体', summary: '使用数字人、口型同步、旁白与视频拼接流程制作 AI 出镜讲解视频。', useCases: ['制作虚拟讲解员视频', '生成课程或社交口播内容', '组合肖像、语音和口型同步'] },
  { pattern: /^technical-blog-writing$/i, category: '内容与写作', summary: '面向开发者受众，以合适结构、代码示例和解释深度撰写技术博客与教程。', useCases: ['撰写工程博客或教程', '组织代码示例与技术解释', '调整面向开发者的内容深度'] },
  { pattern: /^tools-ui$/i, category: '设计与前端', summary: '使用 ui.inference.sh 的 React/Next.js 组件展示工具调用的等待、进度、审批与结果状态。', useCases: ['展示 Agent 工具调用过程', '实现人工审批界面', '呈现工具结果和进度'] },
  { pattern: /^twitter-thread-creation$/i, category: '内容与写作', summary: '按 X/Twitter 的钩子、线程结构、字符限制、媒体和发布策略撰写长线程。', useCases: ['撰写 X/Twitter 线程', '优化首帖钩子和结构', '规划媒体附件和发布节奏'] },
  { pattern: /^video-prompting-guide$/i, category: '图像与多媒体', summary: '按镜头、机位、光线、节奏、风格和负面提示规则编写多种 AI 视频模型的提示词。', useCases: ['为 Veo、Seedance 等模型写提示', '设计镜头运动和画面风格', '优化视频生成的一致性'] },
  { pattern: /^widgets-ui$/i, category: '设计与前端', summary: '使用 ui.inference.sh 将结构化 JSON 渲染为表单、按钮、卡片和布局等 React/Next.js 交互组件。', useCases: ['渲染 Agent 生成的动态界面', '构建结构化表单与卡片', '展示可交互的工具结果'] },
  { pattern: /^azure-well-architected-review$/i, category: '云平台与运维', summary: '依据 Azure Well-Architected Framework 审查工作负载的基础设施和架构，并整理改进发现。', useCases: ['审查 Azure IaC 与架构', '识别可靠性、安全和成本问题', '把改进项整理为 GitHub Issues'] },
  { pattern: /^sentry-cli$/i, category: '可观测性与运维', summary: '通过 Sentry CLI 查看组织、项目、Issue 与事件，执行 API 调用并处理命令行认证。', useCases: ['从命令行查看 Sentry Issue 与事件', '查询组织和项目信息', '配置认证并调用 Sentry API'] },
  { pattern: /^skill-creator$/i, category: 'Skill 管理', summary: '创建、修改和优化 Agent Skill，并通过评测、基准与方差分析检查触发准确性和表现。', useCases: ['从零创建或编辑 Agent Skill', '运行评测与基准衡量 Skill 表现', '优化描述以提高触发准确性'] },
  { pattern: /^infsh-cli$/i, category: 'AI 模型与多媒体', summary: '通过 inference.sh CLI 调用公开说明列出的图像、视频、语言模型、搜索、3D 与社交自动化应用。', useCases: ['从 CLI 调用图像或视频模型', '调用语言模型与网页搜索服务', '运行公开说明列出的 AI 应用流程'] },
  { pattern: /^agent-tools$/i, descriptionPattern: /inference\.sh|Run AI apps/i, category: 'AI 模型与多媒体', summary: '通过 inference.sh 运行公开说明列出的图像、视频、语言模型、搜索、3D 与社交自动化应用。', useCases: ['调用图像或视频生成应用', '运行语言模型与搜索服务', '组合公开 AI 应用完成多媒体任务'] },
  { pattern: /^python-executor$/i, category: '代码执行与数据处理', summary: '在 inference.sh 提供的沙箱环境中执行 Python，用于数据处理、网页抓取、媒体处理、PDF、3D 与自动化脚本。', useCases: ['运行 Python 数据分析与可视化', '执行网页抓取和自动化脚本', '处理图片、视频、PDF 或 3D 数据'] },
  { pattern: /^copywriting$/i, category: '营销与增长', summary: '撰写、重写和优化网站营销文案，覆盖首页、落地页、定价页、功能页、标题、价值主张与行动按钮。', useCases: ['撰写落地页和产品页文案', '优化标题、价值主张与 CTA', '重写现有网站文案以提升说服力'] },
  { pattern: /^seo-audit$/i, category: '营销与增长', summary: '审查和诊断网站的技术 SEO、页面 SEO、索引、抓取、排名与 Core Web Vitals 问题。', useCases: ['执行网站 SEO 健康检查', '排查抓取、索引与排名下降', '审查 Meta 标签和 Core Web Vitals'] },
  { pattern: /^infra-clickhouse$/i, category: '数据库与分析', summary: '通过 clickhousectl 运行本地 ClickHouse 开发服务，或创建和管理 ClickHouse Cloud 服务、模式迁移与应用连接。', useCases: ['搭建本地 ClickHouse 开发环境', '创建表并开始查询', '将本地数据库迁移到 ClickHouse Cloud'] },
  { pattern: /^infra-postgres$/i, category: '数据库与分析', summary: '通过 clickhousectl 运行本地 Docker Postgres，或管理 ClickHouse Cloud Postgres 的连接、TLS、只读副本、故障转移和时点恢复。', useCases: ['搭建本地 Postgres 开发环境', '配置生产数据库连接与 TLS', '管理副本、故障转移和时点恢复'] },
  { pattern: /^limrun-maestro-testing$/i, category: '测试与质量', summary: '通过 Limrun 云端 iOS 模拟器运行、编写和调试 Maestro YAML UI 测试流程。', useCases: ['在云端 iOS 模拟器运行 Maestro 测试', '调试 Maestro YAML 流程', '把现有 Maestro 套件迁移到远程模拟器'] },
  { pattern: /^contentful-custom-app-from-scratch$/i, category: '开发与工程', summary: '为客户自有仓库设计、搭建和验证 Contentful App Framework 自定义应用，覆盖侧边栏、字段编辑器、页面、对话框和 Function。', useCases: ['从零搭建 Contentful 自定义应用', '创建字段编辑器或侧边栏应用', '在本地验证组织专用 Contentful 流程'] },
  { pattern: /^physics-tuning$/i, category: '游戏开发', summary: '优化引擎无关的游戏物理参数与时间步，处理抖动、穿透、碰撞层和运动手感。', useCases: ['调整质量、重力和阻力', '修复物理抖动与高速穿透', '配置固定时间步和碰撞层'] },
  { pattern: /^google-ads-api-mcp-setup$/i, category: '开发与工程', summary: '指导下载、配置和安装官方 Google Ads MCP Server，使 AI 助手可查询广告活动与报表指标。', useCases: ['连接 AI 助手与 Google Ads 账号', '配置 Google Ads MCP Server', '查询广告活动和报表指标'] },
  { pattern: /^google-cloud-solution-agentic-ai-bidirectional-streaming$/i, category: '云平台与架构', summary: '收集实时双向多 Agent 系统的需求，并生成处理连续多模态数据流的 Google Cloud 解决方案。', useCases: ['设计实时双向多模态 Agent 系统', '规划多产品 Google Cloud 架构', '为实时技术指导或安全监控准备方案'] },
  { pattern: /^dialogue-systems$/i, category: '游戏开发', summary: '构建带条件、变量和本地化钩子的分支对话与叙事图，并比较 Ink、Yarn Spinner 或自定义运行时。', useCases: ['设计 NPC 分支对话树', '维护对话条件和变量', '选择 Ink、Yarn Spinner 或自定义方案'] },
  { pattern: /^unity-cli$/i, category: '游戏开发', summary: '从终端操作 Unity CLI 或已连接的 Unity Editor，管理对象、场景、资产、项目、构建和测试。', useCases: ['通过命令行修改 Unity 场景与对象', '创建、打开和构建 Unity 项目', '运行测试并查看 Editor 日志'] },
  { pattern: /^custom-object-management$/i, category: '销售与 CRM', summary: '在 HubSpot CRM 中发现、创建、更新或删除自定义对象模式。', useCases: ['创建新的 CRM 自定义对象', '检查现有对象模式', '更新或移除自定义对象定义'] },
  { pattern: /^qwencloud-vision$/i, category: '视觉理解', summary: '使用 Qwen 视觉模型分析图像和视频，覆盖 OCR、图表读取、视觉推理和多图比较。', useCases: ['识别图像中的文字', '读取图表与表格', '比较多张图像或理解视频内容'] },
  { pattern: /^data-enrichment$/i, category: '销售与 CRM', summary: '将外部 CSV/JSONL 记录按邮箱或域名匹配到 HubSpot 联系人与公司，并回写补全后的数据。', useCases: ['按邮箱匹配 CRM 联系人', '按域名匹配公司记录', '批量回写外部补全数据'] },
  { pattern: /^deal-management$/i, category: '销售与 CRM', summary: '从命令行管理 HubSpot 交易全生命周期，包括管道阶段、关联、批量推进、停滞检查和成交。', useCases: ['把线索转为关联交易', '批量推进或重新分配交易', '查找停滞交易并完成结单'] },
  { pattern: /^communication-history$/i, category: '销售与 CRM', summary: '读取 CRM 记录的电话、邮件、备注、会议和任务历史，组装会前简报。', useCases: ['查看客户沟通活动历史', '汇总邮件、会议和任务', '生成销售会议前简报'] },
  { pattern: /^shader-programming$/i, category: '游戏开发', summary: '从顶点到片元的跨引擎基础编写游戏 Shader，覆盖坐标空间、UV 数学和常见 2D/3D 效果。', useCases: ['编写 GLSL 或 HLSL Shader', '实现溶解、轮廓或边缘光', '排查 UV 和坐标空间问题'] },
  { pattern: /^incidentio-cli$/i, category: '事故响应与运维', summary: '通过 incident.io CLI 调用 API，管理事故、行动项、告警、值班、状态页和工作流。', useCases: ['列出或创建 incident.io 事故', '查看值班与升级日程', '创建和管理公开状态页'] },
  { pattern: /^atlas-stream-processing$/i, category: '数据工程', summary: '管理 MongoDB Atlas Stream Processing 工作区、数据源与接收端、处理器生命周期、诊断和规格选择。', useCases: ['配置 Kafka、Atlas、S3 或 HTTPS 流连接', '创建和管理流处理器', '排查实时数据处理问题'] },
  { pattern: /^airbnb-(listing-detail|search-listing)$/i, category: '旅行与住宿数据', summary: '从 Airbnb 搜索页或房源详情页提取公开的房源、价格、评分和设施信息。', useCases: ['搜索目的地 Airbnb 房源', '提取单个房源的价格与设施', '整理住宿对比数据'] },
  { pattern: /^(douyin-video-search|xiaohongshu-search-full)$/i, category: '社交内容研究', summary: '按关键词搜索公开短视频或笔记，并提取内容、媒体链接、发布时间和互动指标。', useCases: ['搜索公开短视频或笔记', '整理主题、媒体和互动数据', '进行公开内容趋势监测'] },
  { pattern: /^(ebay-sold-listings-search|etsy-product-detail|walmart-product-reviews)$/i, category: '电商与商品研究', summary: '提取公开电商页面的成交列表、商品详情或用户评论数据，用于商品研究与比较。', useCases: ['整理成交商品或价格记录', '提取商品属性和变体', '收集公开评论用于市场研究'] },
  { pattern: /^threads-(keyword-search|profile-search|user-posts)$/i, category: '社交内容研究', summary: '从 Threads 公开页面搜索帖子或账号，并提取个人资料、帖子文本、媒体与互动指标。', useCases: ['按关键词搜索 Threads 帖子', '发现相关公开账号', '整理指定账号的公开帖子'] },
  { pattern: /^open-knowledge$/i, category: '文档与知识', summary: '定义 OpenKnowledge 项目中 Markdown CRDT 知识库的 Agent 运行时契约，覆盖读写、链接、目录和预览规则。', useCases: ['读写 OpenKnowledge 项目中的 Markdown', '搜索和检查知识库内容', '维护文档链接与目录约定'] },
  { pattern: /^open-knowledge-discovery$/i, category: '文档与知识', summary: '介绍 OpenKnowledge、项目初始化、单个 Markdown 预览和协作共享流程。', useCases: ['了解 OpenKnowledge 的用途', '初始化或共享 OpenKnowledge 项目', '预览项目外的单个 Markdown 文件'] },
  { pattern: /^open-knowledge-write-skill$/i, category: 'Skill 管理', summary: '创建或改进 Agent Skill，覆盖作用域选择、SKILL.md 结构、渐进式披露、评估与编辑器安装指导。', useCases: ['从工作流起草新 Skill', '优化 Skill 的触发说明和结构', '评估并准备可安装的 Skill'] },
  { pattern: /^resume-intelligence$/i, category: '职业发展与文档', summary: '根据职业经历和职位材料构建或定制简历，并准备 ATS 检查、求职信、面试资料与 DOCX/HTML/PDF 交付。', useCases: ['起草或按职位定制简历', '执行 ATS 与关键词匹配检查', '整理面试准备和职业证据'] },
  { pattern: /^remotion-studio$/i, category: '动效与视频', summary: '在 Remotion Studio 中预览 Remotion 程序化视频。', useCases: ['启动 Remotion 视频预览', '检查 composition 画面', '在渲染前审查视频时间线'] },
  { pattern: /^storytelling$/i, descriptionPattern: /narrative structure|protagonist-arc/i, category: '设计与叙事', summary: '使用主角弧线、编排、情境-复杂-解决和现状-可能性等结构，为设计工作与方案沟通建立叙事。', useCases: ['把用户旅程组织成可沟通的故事', '向非设计受众解释方案依据', '检查简报或演示中的叙事结构'] },
  { pattern: /^google-ads-api-quickstart$/i, category: '开发与工程', summary: '指导 Google Ads API 凭据、开发者令牌、客户端库或 REST 环境配置，并运行广告活动查询快速开始示例。', useCases: ['配置 Google Ads API 凭据和令牌', '选择客户端库或 REST 接入', '排查权限、login_customer_id 和令牌批准错误'] },
  { pattern: /^build-audit-logs$/i, category: '测试与质量', summary: 'skills.sh 详情页未提供可审校的公开说明；名称只指向构建审计日志，具体日志来源、格式与用途无法确认。', useCases: ['核对审计日志的来源', '确认输出格式和保留策略', '在公开说明充分后再评估使用场景'] },
  { pattern: /^rams$/i, descriptionPattern: /accessibility|WCAG/i, category: '设计与前端', summary: '对前端组件执行可访问性与视觉设计审查，重点检查 WCAG 合规与设计问题。', useCases: ['审查 UI 组件的 WCAG 问题', '检查前端视觉设计质量', '整理组件可访问性修改项'] },
  { pattern: /^sales-reporting$/i, category: '销售与 CRM', summary: '从终端生成 HubSpot 销售日报、管道快照和输赢分析，覆盖本周结单、按阶段或负责人的开放管道。', useCases: ['生成每日销售简报', '查看按阶段或负责人的管道快照', '对比一段时间的成交与丢单'] },
  { pattern: /^review-skill$/i, descriptionPattern: /structural validity|skill-validator/i, category: 'Skill 管理', summary: '在发布前检查 Agent Skill 的结构有效性和内容质量，结合 skill-validator 与 LLM 评分解读待修改项。', useCases: ['发布前验证 Agent Skill 结构', '评估 Skill 内容质量', '向编写者整理需要修改的问题'] },
  { pattern: /^firecrawl-developer-index$/i, category: '开发与工程', summary: '使用 Firecrawl Developer 从 issue、已合并 PR、仓库 README 和筛选文档站查找编程问题的一手资料答案。', useCases: ['从 issue 与已合并 PR 查找已知问题', '核对库或 API 的一手文档', '用仓库证据回答编程行为问题'] },
];

export function inferSkillProfile({ name, description = '' }) {
  const haystack = `${name} ${description}`;
  const specific = specificProfiles.find((item) => item.pattern.test(name) && (!item.descriptionPattern || item.descriptionPattern.test(description)));
  const profile = specific ? { id: specific.category, summary: specific.summary, useCases: specific.useCases } : profiles.find((item) => item.pattern.test(haystack)) ?? {
    id: '通用能力',
    summary: '为 AI Agent 提供可复用的专业流程与操作规范，适合在对应领域任务中作为执行参考。',
    useCases: ['为特定任务补充标准化执行步骤', '把重复工作沉淀为可复用流程', '为团队 Agent 提供一致的任务规范'],
  };
  const displayName = readableName(name);
  return {
    category: profile.id,
    descriptionZh: `${displayName}：${profile.summary}`,
    useCases: profile.useCases,
  };
}

function detailUrl(row) {
  return row.url || `https://skills.sh/${row.source}/${row.skillId || row.slug || row.name}`;
}

async function fetchText(url, options = {}) {
  let lastError;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: 'text/html,application/json',
          'User-Agent': 'WAGMI-Daily/0.1',
          ...(options.headers ?? {}),
        },
        signal: AbortSignal.timeout(20_000),
      });
      const text = await response.text();
      if (!response.ok) {
        const error = new Error(`${response.status} ${response.statusText}: ${text.slice(0, 180)}`);
        if (response.status !== 429 && response.status < 500) throw error;
        lastError = error;
      } else {
        return { response, text };
      }
    } catch (error) {
      lastError = error;
      if (/^4\d\d /.test(error.message) && !/^429 /.test(error.message)) throw error;
    }
    if (attempt < 2) await new Promise((resolveDelay) => setTimeout(resolveDelay, 750 * (attempt + 1)));
  }
  throw lastError;
}

async function fetchLeaderboard() {
  const token = process.env.SKILLS_SH_TOKEN || process.env.VERCEL_OIDC_TOKEN;
  if (token) {
    const { text } = await fetchText(officialEndpoint, { headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' } });
    const payload = JSON.parse(text);
    return { rows: payload.data ?? [], endpoint: officialEndpoint, mode: 'official_v1' };
  }
  const { text } = await fetchText(publicEndpoint, { headers: { Accept: 'application/json' } });
  const payload = JSON.parse(text);
  return { rows: payload.skills ?? [], endpoint: publicEndpoint, mode: 'public_fallback' };
}

function readSoftwareMetadata(html) {
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  for (const match of scripts) {
    try {
      const value = JSON.parse(match[1]);
      if (value?.['@type'] === 'SoftwareApplication') {
        return {
          description: cleanText(value.description),
          totalInstalls: Number(value.interactionStatistic?.userInteractionCount) || null,
        };
      }
    } catch {
      // Ignore malformed page metadata and use the local fallback profile.
    }
  }
  return { description: '', totalInstalls: null };
}

async function enrichRow(row) {
  const url = detailUrl(row);
  try {
    const { text } = await fetchText(url);
    return { ...readSoftwareMetadata(text), url, metadataStatus: 'success' };
  } catch (error) {
    return { description: '', totalInstalls: null, url, metadataStatus: 'fallback', metadataError: cleanText(error.message, 220) };
  }
}

async function enrichRows(rows, concurrency = 5) {
  const results = new Array(rows.length);
  let cursor = 0;
  async function worker() {
    while (cursor < rows.length) {
      const index = cursor;
      cursor += 1;
      results[index] = await enrichRow(rows[index]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, () => worker()));
  return results;
}

export function buildSkillSnapshot({ rows, metadata = [], asOf = shanghaiDate(), generatedAt = new Date().toISOString(), limit = defaultLimit, endpoint = publicEndpoint, mode = 'public_fallback' }) {
  const reportId = `skills-${asOf}`;
  const skills = rows.slice(0, limit).map((row, index) => {
    const detail = metadata[index] ?? { description: '', totalInstalls: null, url: detailUrl(row), metadataStatus: 'fallback' };
    const profile = inferSkillProfile({ name: row.name || row.skillId || row.slug, description: detail.description });
    const source = cleanText(row.source, 140);
    const skillId = cleanText(row.skillId || row.slug || row.name, 140);
    return {
      id: `${source}/${skillId}`,
      date: asOf,
      rank: index + 1,
      name: cleanText(row.name || skillId, 140),
      source,
      sourceType: row.sourceType || (source.includes('/') ? 'github' : 'well-known'),
      url: detail.url,
      installUrl: row.installUrl || (source.includes('/') ? `https://github.com/${source}` : null),
      heatInstalls: Number(row.installs) || 0,
      installsYesterday: Number(row.installsYesterday) || 0,
      change: Number(row.change) || 0,
      totalInstalls: detail.totalInstalls,
      isOfficial: row.isOfficial === true,
      rawDescription: detail.description,
      descriptionZh: profile.descriptionZh,
      useCases: profile.useCases,
      category: profile.category,
      metadataStatus: detail.metadataStatus,
      capturedAt: generatedAt,
      sourceReportId: reportId,
    };
  });
  const metadataFailures = skills.filter((skill) => skill.metadataStatus !== 'success').length;
  const status = metadataFailures > Math.ceil(skills.length / 4) ? 'warning' : 'success';
  return {
    schemaVersion: '1.0.0',
    generatedAt,
    asOf,
    view: 'hot',
    source: sourceHomepage,
    sourceStatus: [{ id: 'skills-sh-hot', url: endpoint, mode, status: 'success', count: rows.length }, { id: 'skills-sh-detail', url: 'https://skills.sh/{source}/{skillId}', status, count: skills.length - metadataFailures, failed: metadataFailures }],
    skills,
    candidates: [],
    run: {
      id: 'wagmi-skills',
      name: 'WAGMI Skill 每日热度排行',
      channel: 'skills',
      schedule: '每天 07:40',
      lastSuccess: generatedAt,
      status,
      artifact: `/reports/skills-radar-${asOf}.md`,
      message: `已抓取 skills.sh 热榜 ${skills.length} 条，其中 ${skills.length - metadataFailures} 条读取到详情说明。`,
    },
    report: {
      id: reportId,
      title: `Skill 每日热度排行 ${asOf}`,
      date: asOf,
      channel: 'skills',
      format: 'markdown',
      path: `/reports/skills-radar-${asOf}.md`,
    },
  };
}

function markdownCell(value) {
  return cleanText(value, 220).replace(/\|/g, '\\|');
}

function buildReport(snapshot) {
  const lines = [
    `# Skill 每日热度排行 ${snapshot.asOf}`,
    '',
    `- 来源：${snapshot.source}`,
    `- 视图：hot（当前小时安装量与昨日同小时对比）`,
    `- 抓取时间：${snapshot.generatedAt}`,
    `- 条目：${snapshot.skills.length}`,
    '',
    '> 安全说明：排行榜仅代表安装热度。采集过程不会执行或安装任何 Skill，使用前仍需人工审核来源和内容。',
    '',
    '| 排名 | Skill | 来源 | 当前热度 | 同比变化 | 中文说明 | 使用场景 |',
    '| ---: | --- | --- | ---: | ---: | --- | --- |',
    ...snapshot.skills.map((skill) => `| ${skill.rank} | [${markdownCell(skill.name)}](${skill.url}) | ${markdownCell(skill.source)} | ${skill.heatInstalls} | ${skill.change >= 0 ? '+' : ''}${skill.change} | ${markdownCell(skill.descriptionZh)} | ${markdownCell(skill.useCases.join('；'))} |`),
    '',
  ];
  return `${lines.join('\n')}\n`;
}

async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporaryPath = `${path}.tmp`;
  await writeFile(temporaryPath, content, 'utf8');
  await rename(temporaryPath, path);
}

async function run() {
  const dryRun = process.argv.includes('--dry-run');
  const limitArg = process.argv.find((item) => item.startsWith('--limit='));
  const limit = Math.min(50, Math.max(1, Number(limitArg?.split('=')[1]) || defaultLimit));
  const leaderboard = await fetchLeaderboard();
  const rows = leaderboard.rows.slice(0, limit);
  const metadata = await enrichRows(rows);
  const snapshot = buildSkillSnapshot({ rows, metadata, limit, endpoint: leaderboard.endpoint, mode: leaderboard.mode });

  if (dryRun) {
    console.log(JSON.stringify({ asOf: snapshot.asOf, mode: leaderboard.mode, sourceStatus: snapshot.sourceStatus, skills: snapshot.skills.slice(0, 5) }, null, 2));
    return;
  }

  const root = process.cwd();
  const latestPath = resolve(root, 'data/dev/skills-radar-latest.json');
  const historyPath = resolve(root, `data/dev/skills-history/${snapshot.asOf}.json`);
  const reportName = `skills-radar-${snapshot.asOf}.md`;
  const report = buildReport(snapshot);
  await writeAtomic(latestPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeAtomic(historyPath, `${JSON.stringify(snapshot, null, 2)}\n`);
  await writeAtomic(resolve(root, 'reports', reportName), report);
  await writeAtomic(resolve(root, 'public/reports', reportName), report);
  console.log(`Skill radar wrote ${snapshot.skills.length} entries for ${snapshot.asOf} (${leaderboard.mode}).`);
}

const isEntryPoint = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isEntryPoint) {
  run().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  });
}
