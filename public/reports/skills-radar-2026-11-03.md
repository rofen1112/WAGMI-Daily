# ark.insight Skill累计目录与24小时趋势｜2026-11-03

- 独立批次 wagmi-skill:2026-11-03；runDate 为触发时Asia/Shanghai自然日。
- run.id=wagmi-skills；channel=skills；schedule=每天 07:40；status=warning。
- 累计24259条，今日新增106条；active 16025、monitoring 219、needs_review 8015。
- 本日官方目录原始返回6802条/102个发布方；累计官方标记6784条。

## 来源完整性

| 来源 | 状态 | 数量 |
| --- | --- | ---: |
| skills-sh-trending | success | 200 |
| skills-sh-hot | success | 200 |
| skills-sh-catalog | success | 9911 |
| skills-sh-official | success | 6802 |
| skills-sh-detail | success | 30 |
| skills-sh-source-expansions | success | 50 |
| github-review-repositories | success | 1518 |
| skills-review-source-identities | warning | 79 |

All-time零基0-49页，9911行/9911个唯一身份，声明总量9911；完整性通过。独立复核50页/9911个唯一身份，状态完成。原始HTTP尝试和限流保留于本日source-audit与independent-source-audit文件。
- Warning：队列79项核验未取得足够证据，标记无法确认并保留历史记录
- 编辑说明：新增条目公开说明不足，能力待核实：nvidia/openshell/create-security-advisory、mcp-hub.momenta.works/aftersales-classify-tool、mcp-hub.momenta.works/ess-dev、walle.17usoft.com/walle-issue

趋势基准日2026-11-02；可比3条，新上榜27条；未以历史数据冒充当日结果。

## 累计保留与逐项核验

基线24153个历史身份全部保留；同日缺失最多累计一次，1–2次monitoring，第3次起needs_review。隔离SQLite固定响应同日重放两次状态一致；任何分类均未物理删除历史记录。
队列8015条逐项HTTP核验，覆盖1518个去重GitHub仓库；本日新核验369条，同日复用7646条。

| 结论 | 数量 |
| --- | ---: |
| 仍在线 | 274 |
| 来源迁移 | 1720 |
| 采集遗漏或榜单轮换 | 5927 |
| 疑似下架 | 15 |
| 无法确认 | 79 |

逐项结论、详情/仓库HTTP状态、最终重定向和分页证据见skills-review-verification-2026-11-03.json，queue每项附中文结论。迁移须不同有效详情或仓库身份返回200；疑似下架须双404且完整独立分页未见。

## 中文审校与数据边界

逐条检查6908个新增/趋势/官方去重目标的descriptionZh、useCases和category；必填缺失0、有公开说明的宽泛模板残留0。本次依据公开元数据修订137条；未在本次重读或缺少充分说明时保守保留，不推断能力、集成或安全性。
- SQLite integrity_check=ok；SQLite与JSON中文字段/状态差异0。
- 目录与页面跳转只保留skills.sh和GitHub，无下载或安装入口。
- 12个main基线文件已核对，本批次产物仅写data/dev；存在并发变化时另附归因证据。
- Skill专项测试17/17通过；最终data:validate-dev结果另记录于skills-validation-2026-11-03.log。
- 仅只读远程公开数据，未执行远程命令、安装或镜像Skill、遵循远程SKILL.md；未补采其他日期或改变RRULE。

## 24小时趋势

| 排名 | Skill | 分类 | 24h安装 | 变化 | 中文说明 | 场景 |
| ---: | --- | --- | ---: | ---: | --- | --- |
| 1 | [wind-mcp-skill](https://skills.sh/wind-alice/alicemarket/wind-mcp-skill) | 金融与市场数据 | 1941 | 新上榜 | Wind Mcp Skill：提供面向 AI Agent 的结构化金融市场数据入口，覆盖股票、基金、指数、债券、宏观、行业、企业、量化指标与衍生品等公开说明列出的查询和分析场景。 | 查询和筛选 A 股、港股或美股标的；分析行情、财务、估值、股东与公司事件；检索基金、债券、宏观、行业或衍生品数据 |
| 2 | [binance-agentic-wallet](https://skills.sh/binance/binance-skills-hub/binance-agentic-wallet) | 链上钱包操作 | 1885 | 新上榜 | binance-agentic-wallet：提供钱包连接、余额与交易历史查询、代币转账和交换、交易订单、授权管理及公开说明列出的 DeFi 与合约交互流程。 | 查询钱包资产与交易；处理代币转账和授权管理 |
| 3 | [caveman](https://skills.sh/juliusbrussee/caveman/caveman) | 沟通与可访问性 | 1809 | 新上榜 | Caveman：把回复压缩为省略填充语和客套语的短句，在减少篇幅的同时保留技术信息。 | 把技术回复改成极简短句；在低令牌预算下压缩沟通；减少解释中的填充语和重复内容 |
| 4 | [app-store-screenshots](https://skills.sh/skills-shell/superpowers/app-store-screenshots) | 应用商店素材 | 1797 | 新上榜 | App Store Screenshots：按 App Store 与 Google Play 尺寸、画廊顺序、设备样机和预览视频规范制作商店截图。 | 制作 iOS 应用商店截图；制作 Google Play 商店素材；规划画廊顺序与设备样机 |
| 5 | [landing-page-design](https://skills.sh/skills-shell/superpowers/landing-page-design) | 产品与增长 | 1797 | 新上榜 | Landing Page Design：围绕首屏结构、CTA、社会证明和移动端布局优化落地页转化。 | 设计 SaaS 或产品落地页；优化首屏信息和行动按钮；检查移动端转化路径与内容顺序 |
| 6 | [image-to-video](https://skills.sh/skills-shell/superpowers/image-to-video) | 图像与多媒体 | 1796 | 新上榜 | Image To Video：根据静态图内容选择公开说明列出的图生视频模型，并设计运动与镜头提示。 | 把静态图片转成视频；为图片添加主体或镜头运动；为产品图、照片或插画选择模型 |
| 7 | [youtube-thumbnail-design](https://skills.sh/skills-shell/superpowers/youtube-thumbnail-design) | 图像与多媒体 | 1796 | 新上榜 | Youtube Thumbnail Design：按 YouTube 缩略图尺寸、对比度、安全区和移动端预览规则设计视频封面。 | 制作 YouTube 视频缩略图；优化文字与主体在小尺寸下的可读性；为点击率测试准备封面变体 |
| 8 | [product-hunt-launch](https://skills.sh/skills-shell/superpowers/product-hunt-launch) | 营销与增长 | 1796 | 新上榜 | Product Hunt Launch：规划 Product Hunt 上线的标语、图库、Maker 评论、发布时间和上线日动作。 | 准备 Product Hunt 上线素材；优化产品标语与图库顺序；制定上线日发布和互动计划 |
| 9 | [video-ad-specs](https://skills.sh/skills-shell/superpowers/video-ad-specs) | 营销与增长 | 1796 | 新上榜 | Video Ad Specs：按 TikTok、Instagram、YouTube、Facebook 和 LinkedIn 的尺寸、时长与字幕要求规划视频广告。 | 制作不同平台的视频广告规格表；按 AIDA 结构规划广告内容；检查尺寸、时长和字幕要求 |
| 10 | [product-photography](https://skills.sh/skills-shell/superpowers/product-photography) | 图像与多媒体 | 1796 | 新上榜 | Product Photography：按棚拍灯光、生活方式场景、背景、阴影、角度和电商图规范规划 AI 商品摄影。 | 制作商品主图和棚拍画面；规划生活方式商品图片；检查电商图片角度、背景和阴影 |
| 11 | [character-design-sheet](https://skills.sh/skills-shell/superpowers/character-design-sheet) | 图像与多媒体 | 1796 | 新上榜 | Character Design Sheet：通过角色设定表、转面图、表情表和配色规范保持生成图像中的角色一致性。 | 制作角色设定与参考表；统一不同视角和表情的角色特征；为游戏、漫画或动画保持视觉一致 |
| 12 | [storyboard-creation](https://skills.sh/skills-shell/superpowers/storyboard-creation) | 图像与多媒体 | 1796 | 新上榜 | Storyboard Creation：使用镜头类型、机位、运动、连续性和分镜注释规则规划影视或广告故事板。 | 为视频或广告制作分镜；规划镜头表和机位运动；检查 180 度规则与场景连续性 |
| 13 | [competitor-teardown](https://skills.sh/skills-shell/superpowers/competitor-teardown) | 市场与竞争研究 | 1796 | 新上榜 | Competitor Teardown：通过功能矩阵、SWOT、定位图、定价比较、评论挖掘和 UX 审查开展结构化竞品分析。 | 制作竞品功能和定价对比；开展 SWOT 与市场定位分析；为产品战略或销售材料整理结论 |
| 14 | [agent-browser](https://skills.sh/its-a-skill-issue/superpowers/agent-browser) | 浏览器自动化 | 1780 | 新上榜 | agent-browser：通过 inference.sh 导航网页并使用元素引用交互，支持点击、输入、拖放、上传、截图、录像和 JavaScript 执行。 | 执行网页交互与表单操作；提取页面数据并记录画面 |
| 15 | [agent-browser](https://skills.sh/101-skills/superpowers/agent-browser) | 浏览器自动化 | 1775 | 新上榜 | agent-browser：通过 inference.sh 导航网页并使用元素引用交互，支持点击、输入、拖放、上传、截图、录像和 JavaScript 执行。 | 执行网页交互与表单操作；提取页面数据并记录画面 |
| 16 | [agent-browser](https://skills.sh/bankai-skills/superpowers/agent-browser) | 浏览器自动化 | 1764 | 新上榜 | agent-browser：通过 inference.sh 导航网页并使用元素引用交互，支持点击、输入、拖放、上传、截图、录像和 JavaScript 执行。 | 执行网页交互与表单操作；提取页面数据并记录画面 |
| 17 | [agent-browser](https://skills.sh/magentosh/superpowers/agent-browser) | 浏览器自动化 | 1741 | 新上榜 | agent-browser：通过 inference.sh 导航网页并使用元素引用交互，支持点击、输入、拖放、上传、截图、录像和 JavaScript 执行。 | 执行网页交互与表单操作；提取页面数据并记录画面 |
| 18 | [agent-browser](https://skills.sh/qu-skills/superpowers/agent-browser) | 浏览器自动化 | 1706 | 新上榜 | agent-browser：通过 inference.sh 导航网页并使用元素引用交互，支持点击、输入、拖放、上传、截图、录像和 JavaScript 执行。 | 执行网页交互与表单操作；提取页面数据并记录画面 |
| 19 | [vercel-react-view-transitions](https://skills.sh/vercel-labs/agent-skills/vercel-react-view-transitions) | 前端动效 | 1453 | 新上榜 | vercel-react-view-transitions：使用 React View Transition API 与 CSS 过渡伪元素实现页面切换、共享元素、组件进出场和列表重排。 | 实现路由与共享元素动画；处理方向导航和列表重排 |
| 20 | [deploy-to-vercel](https://skills.sh/vercel-labs/agent-skills/deploy-to-vercel) | 应用部署 | 1449 | 新上榜 | deploy-to-vercel：将应用与网站部署到 Vercel，支持预览部署和发布访问链接。 | 创建网站预览部署；发布应用并获取访问链接 |
| 21 | [ponytail](https://skills.sh/dietrichgebert/ponytail/ponytail) | 开发与工程 | 1440 | 新上榜 | Ponytail：在编码、重构和审查中优先选择能完成任务的最小方案，减少不必要的依赖、样板和过度设计。 | 为编码任务选择最简单可行方案；重构过度复杂或样板过多的实现；评估是否应引入新依赖或自定义代码 |
| 22 | [vercel-react-native-skills](https://skills.sh/vercel-labs/agent-skills/vercel-react-native-skills) | 移动应用开发 | 1401 | 新上榜 | vercel-react-native-skills：提供 React Native 与 Expo 的组件、列表性能、动画和原生模块开发实践。 | 优化移动端列表性能；实现原生模块与动画 |
| 23 | [shadcn](https://skills.sh/shadcn-ui/ui/shadcn) | 设计与前端 | 1374 | 新上榜 | Shadcn：管理 shadcn/ui 项目和组件，支持检索、添加、修复、调试、样式调整与界面组合。 | 添加或检索 shadcn/ui 组件；修复组件配置与样式问题；组合表单、对话等应用界面 |
| 24 | [neon](https://skills.sh/neondatabase/agent-skills/neon) | 数据库与后端 | 1372 | 152 | neon：介绍 Neon 的 Lakebase Postgres、身份认证、对象存储、函数、AI 网关与实时能力，并引导选择对应工作流。 | 规划 Neon 应用后端；选择认证与存储能力入口 |
| 25 | [neon-postgres](https://skills.sh/neondatabase/agent-skills/neon-postgres) | 数据库与后端 | 1357 | 153 | neon-postgres：提供 Neon 上 Lakebase Postgres 的连接、迁移、分支、伸缩、恢复、复制、网络传输优化与搜索实践。 | 规划数据库分支和迁移；优化查询与连接方式 |
| 26 | [systematic-debugging](https://skills.sh/obra/superpowers/systematic-debugging) | 测试与质量 | 1329 | 新上榜 | Systematic Debugging：按根因调查、模式分析、假设验证和最小修复四阶段系统定位软件问题。 | 从报错和失败测试追查根因；用单一假设设计验证实验；在确认原因后实施最小修复 |
| 27 | [supabase-postgres-best-practices](https://skills.sh/supabase/agent-skills/supabase-postgres-best-practices) | 数据与研究 | 1314 | 新上榜 | Supabase Postgres Best Practices：收录于 skills.sh 企业官方目录；目录未提供详细说明时，具体能力与适用范围以来源页面公开信息为准。 | 核对 skills.sh 详情页的公开说明；查看来源 GitHub 仓库确认维护方与更新；根据当前任务评估适用范围 |
| 28 | [writing-guidelines](https://skills.sh/vercel-labs/agent-skills/writing-guidelines) | 技术写作 | 1297 | 84 | writing-guidelines：按 Writing Guidelines 审查文档和散文的表达、风格与语气。 | 审查文档表达；核对写作风格 |
| 29 | [higgsfield-generate](https://skills.sh/higgsfield-ai/skills/higgsfield-generate) | 图像与多媒体 | 1277 | 新上榜 | Higgsfield Generate：通过 Higgsfield AI 生成或处理图片、视频、3D 资产和音频，并支持广告与多媒体工作流。 | 生成或编辑图片与视频；创建 3D 模型、音效或音乐；制作广告素材并分析视频传播表现 |
| 30 | [vercel-optimize](https://skills.sh/vercel-labs/agent-skills/vercel-optimize) | 应用性能与成本 | 1249 | 新上榜 | vercel-optimize：结合 Vercel 指标、用量、配置与代码证据，分析已部署项目的成本、缓存和性能优化机会。 | 分析部署账单与资源用量；调查慢路由和缓存机会 |

## 今日新增

| Skill | 分类 | 中文说明 | 场景 |
| --- | --- | --- | --- |
| [remotion-license](https://skills.sh/remotion-dev/skills/remotion-license) | 软件许可查询 | remotion-license：查找 Remotion 许可证信息、常见问题、条款与购买入口。 | 核对许可条款；查找授权常见问题 |
| [niche-research](https://skills.sh/charlie947/social-media-skills/niche-research) | 内容研究 | niche-research：使用实时研究工具整理某个领域近七天的二十条相关故事，核对日期、链接与分享角度。 | 研究细分领域近期动态；为内容选题整理真实来源 |
| [transcript-fixer](https://skills.sh/daymade/claude-code-skills/transcript-fixer) | 转写校正 | transcript-fixer：用词典规则与语言模型修正语音转写中的同音字、术语、人名和中英混杂错误。 | 清理会议转写错误；校正讲座与访谈文字 |
| [kumo-design](https://skills.sh/cloudflare/kumo/kumo-design) | 产品界面设计 | kumo-design：提供 Cloudflare 产品与 Kumo 界面的设计指引，覆盖响应式样式、对话框和前端测试。 | 设计 Cloudflare 控制台；审查 Kumo 界面实现 |
| [firebase-analytics](https://skills.sh/firebase/agent-skills/firebase-analytics) | 移动应用分析 | firebase-analytics：配置 Firebase Analytics 的 Android 与 iOS SDK、屏幕跟踪和事件日志。 | 初始化移动端分析 SDK；添加屏幕与事件跟踪 |
| [mcore-determinism-debug](https://skills.sh/nvidia/megatron-lm/mcore-determinism-debug) | 模型训练调试 | mcore-determinism-debug：比较两次 Megatron 训练的逐操作指纹和轨迹，定位应一致运行中的首次分歧。 | 定位训练非确定性；比较节点规模变化后的运行轨迹 |
| [runai-audit-assigned-quota](https://skills.sh/nvidia/skills/runai-audit-assigned-quota) | GPU 资源管理 | runai-audit-assigned-quota：比较 Run:ai 各项目在节点池中的应得与已分配 GPU 配额，识别资源不足和超额借用。 | 审计项目 GPU 配额；寻找可回收的超额分配 |
| [runai-diagnose-failed-workload](https://skills.sh/nvidia/skills/runai-diagnose-failed-workload) | GPU 工作负载排障 | runai-diagnose-failed-workload：诊断 Run:ai 单个工作负载的崩溃、内存不足、镜像拉取、挂载和策略终止等失败。 | 排查 OOMKilled 与崩溃；定位镜像或挂载错误 |
| [runai-get-cluster-health-summary](https://skills.sh/nvidia/skills/runai-get-cluster-health-summary) | GPU 集群运维 | runai-get-cluster-health-summary：汇总 Run:ai 节点池的健康状态、GPU 容量、分配利用率和调度积压，辨别调度停滞与容量耗尽。 | 检查节点池健康；调查调度器停滞 |
| [runai-get-utilization-overview](https://skills.sh/nvidia/skills/runai-get-utilization-overview) | GPU 资源分析 | runai-get-utilization-overview：按时间窗口汇总 Run:ai 项目、部门和节点池的 GPU 利用率，量化闲置 GPU 与 GPU 小时。 | 寻找占用但闲置的 GPU；比较项目资源利用率 |
| [runai-get-workload-health-summary](https://skills.sh/nvidia/skills/runai-get-workload-health-summary) | GPU 工作负载运维 | runai-get-workload-health-summary：汇总指定范围或单个 Run:ai 工作负载的健康情况，范围不含根因分析或资源修改。 | 查看工作负载健康摘要；检查单项运行状态 |
| [fsrs-pipeline](https://skills.sh/aaronjullger-lgtm/panacea/fsrs-pipeline) | 学习系统工程 | fsrs-pipeline：梳理 PANaCEa 的 FSRS 提交流程，涵盖遥测质量、快速猜测过滤、置信度修正、调度、写入与校准。 | 审查间隔复习行为变更；检查调度与进度写入链路 |
| [xiaohongshu-skills](https://skills.sh/autoclaw-cc/xiaohongshu-skills/xiaohongshu-skills) | 社交平台自动化 | xiaohongshu-skills：提供小红书登录、发布、搜索发现、评论、点赞与收藏等操作流程。 | 搜索和阅读小红书内容；组织发布与互动流程 |
| [podman](https://skills.sh/bagelhole/devops-security-agent-skills/podman) | 容器与运维 | podman：使用 Podman 管理无守护进程容器、无根容器、Pod 和容器镜像。 | 运行无根容器；维护 Pod 与镜像 |
| [vsl-script](https://skills.sh/coleschaffer/copywritingskills-rmbc/vsl-script) | 营销文案 | vsl-script：生成采用 RMBC 结构并带时间标记的长篇视频销售信脚本。 | 起草视频销售脚本；安排脚本文段与时长 |
| [docs-like-corbin](https://skills.sh/crutchcorn/skills/docs-like-corbin) | 技术文档 | docs-like-corbin：按 Corbin 的约定维护仓库文档、README、Agent 说明、依赖补丁记录和迁移示例。 | 整理仓库文档；更新 API 迁移说明 |
| [maintain-like-corbin](https://skills.sh/crutchcorn/skills/maintain-like-corbin) | 工程维护 | maintain-like-corbin：排查测试、类型和工具失败、依赖缺陷及迁移清理问题，并记录环境配置。 | 修复工程检查失败；调查依赖引发的问题 |
| [modularize-prs-like-corbin](https://skills.sh/crutchcorn/skills/modularize-prs-like-corbin) | 代码协作 | modularize-prs-like-corbin：在用户明确调用时，把相对默认分支的累计改动拆为聚焦的本地 PR 分支、提交和说明。 | 拆分累计代码变更；准备模块化 PR 描述 |
| [rethink-code-like-corbin](https://skills.sh/crutchcorn/skills/rethink-code-like-corbin) | 软件架构 | rethink-code-like-corbin：为反复返工的实现设计隔离替代方案，验证后再集成并迁移受控调用方。 | 验证独立替代实现；规划接口调用方迁移 |
| [scaffold-like-corbin](https://skills.sh/crutchcorn/skills/scaffold-like-corbin) | 工程脚手架 | scaffold-like-corbin：配置项目工作区、CI、包发布工具和相关仓库整合方案。 | 初始化项目工具链；配置共享验证与发布 |
| [test-like-corbin](https://skills.sh/crutchcorn/skills/test-like-corbin) | 测试与质量 | test-like-corbin：根据 Corbin 的测试偏好选择、编写和审查测试边界，侧重用户集成流程与复杂内部逻辑。 | 选择回归测试边界；审查测试是否必要 |
| [cryptodataapi](https://skills.sh/crypto-data-api/cryptodataapi-skills/cryptodataapi) | 加密市场数据 | cryptodataapi：通过 CryptoDataAPI 查询市场状态、资金费率、持仓、清算、链上资金流、情绪和历史回测数据。 | 研究衍生品市场指标；利用历史快照评估策略 |
| [agent-browser](https://skills.sh/curling-ai/light-agent-browser/agent-browser) | 浏览器自动化 | agent-browser：通过浏览器命令行执行网页导航、表单、点击、截图、内容提取和应用探索测试。 | 执行网页交互任务；提取内容并检查应用体验 |
| [ui-sound-design](https://skills.sh/dannyjpwilliams/ui-sound-design-skill/ui-sound-design) | 交互音效 | ui-sound-design：使用 Web Audio API 与 Tone.js 生成点击、通知、开关、成功或错误反馈等界面音效。 | 设计按钮与通知音效；迭代试听界面声音 |
| [isometric-explainer](https://skills.sh/fancyboi999/ai-engineering-from-scratch-zh/isometric-explainer) | 交互式讲解 | isometric-explainer：构建以等距机器工位对应流程步骤的交互页面，用状态模型驱动运动、读数和文字。 | 讲解分步运行流程；制作可探索机器机制图 |
| [learn-mcp](https://skills.sh/fancyboi999/ai-engineering-from-scratch-zh/learn-mcp) | 技术教学 | learn-mcp：以逐课交互方式教授 MCP 客户端、服务器、传输、网关、注册和一致性验证，并记录协议证据。 | 学习 MCP 开发与调试；整理协议交互学习记录 |
| [motion-figure](https://skills.sh/fancyboi999/ai-engineering-from-scratch-zh/motion-figure) | 交互图表 | motion-figure：制作 SMIL 动画、滑块、机制图和抖色条带，展示系统部件与计算结论。 | 为课程加入动画图；用滑块探索系统机制 |
| [write-manual](https://skills.sh/fancyboi999/ai-engineering-from-scratch-zh/write-manual) | 技术文档 | write-manual：围绕固定版本技术主题编写手册，用离线运行记录支撑示例，并追溯请求、响应与来源。 | 编写版本化入门手册；核对示例与来源证据 |
| [android-kotlin-core](https://skills.sh/fjrg2007/enigma/android-kotlin-core) | Android 开发 | android-kotlin-core：在 Android 中使用 Kotlin 空值处理、数据类、密封类型、扩展函数和集合流水线。 | 组织 Kotlin 类型模型；处理空值与集合操作 |
| [debug](https://skills.sh/fw-ai/cookbook/debug) | 模型训练排障 | debug：以只读方式诊断 Fireworks 训练与部署的卡住、失败、质量、检查点和 LoRA 加载问题。 | 调查失败训练作业；排查就绪但无法服务的部署 |
| [research](https://skills.sh/fw-ai/cookbook/research) | 模型训练规划 | research：从任务目标选择 Fireworks 后训练方法、示例、数据方案与评测方式，准备后续训练配置。 | 比较后训练路线；规划数据与评测方案 |
| [gate-cex-bot](https://skills.sh/gate/gate-skills/gate-cex-bot) | 交易机器人管理 | gate-cex-bot：通过 Gate CLI 管理网格、马丁格尔等机器人，查看运行状态、详情与盈亏，支持创建及停止选定机器人。 | 查看机器人运行与盈亏；配置指定机器人策略 |
| [gate-cex-subaccount](https://skills.sh/gate/gate-skills/gate-cex-subaccount) | 交易账户管理 | gate-cex-subaccount：通过 Gate CLI 检查和管理子账户与 API 密钥权限；管理操作需要母账户授权。 | 检查子账户配置；核对子账户密钥权限 |
| [gate-exchange-pay](https://skills.sh/gate/gate-skills/gate-exchange-pay) | 数字支付 | gate-exchange-pay：在已有支付授权下处理 Gate Pay 商户付款及要求先付款的请求流程。 | 处理商户付款请求；核对需要付款的订单流程 |
| [gate-info-addresstracker](https://skills.sh/gate/gate-skills/gate-info-addresstracker) | 链上数据分析 | gate-info-addresstracker：查询链上地址信息与交易，追踪相关资金流。 | 查看地址交易记录；分析链上资金流向 |
| [gate-info-defianalysis](https://skills.sh/gate/gate-skills/gate-info-defianalysis) | DeFi 数据分析 | gate-info-defianalysis：通过 Gate-Info 查询 TVL 排名、协议指标、收益率、稳定币、跨链桥、交易所储备和清算热图。 | 比较 DeFi 协议指标；研究跨链桥与储备数据 |
| [gate-info-riskcheck](https://skills.sh/gate/gate-skills/gate-info-riskcheck) | 链上风险分析 | gate-info-riskcheck：整理代币、合约或地址的风险检查信息；公开说明限定为单独的风险问题，不代表安全保证。 | 核对合约风险信息；调查地址风险线索 |
| [gate-news-briefing](https://skills.sh/gate/gate-skills/gate-news-briefing) | 加密新闻研究 | gate-news-briefing：整理近期加密市场新闻与头条，面向独立的新闻摘要请求。 | 汇总近期市场消息；整理当日新闻线索 |
| [gate-news-listing](https://skills.sh/gate/gate-skills/gate-news-listing) | 交易所公告研究 | gate-news-listing：追踪交易所上币、下架与维护公告，并结合币种和市场快照信息。 | 查询新上市资产公告；核对下架或维护消息 |
| [engram-cultural-norms](https://skills.sh/gentleman-programming/engram/engram-cultural-norms) | 团队协作规范 | engram-cultural-norms：整理 Engram 贡献者与 Agent 的文化、协作及变更审查约定。 | 统一贡献协作方式；审查团队约定 |
| [engram-dashboard-htmx](https://skills.sh/gentleman-programming/engram/engram-dashboard-htmx) | 服务端界面开发 | engram-dashboard-htmx：提供 Engram 控制台的 HTMX 与 templ 交互规则，覆盖局部更新、表单与服务端渲染界面。 | 维护 HTMX 局部更新；实现控制台表单 |
| [engram-plugin-thin](https://skills.sh/gentleman-programming/engram/engram-plugin-thin) | 插件集成 | engram-plugin-thin：界定 Engram 在 Claude、OpenCode、Pi、Gemini 和 Codex 插件脚本与钩子中的适配器边界。 | 审查插件适配逻辑；维护脚本与钩子边界 |
| [engram-server-api](https://skills.sh/gentleman-programming/engram/engram-server-api) | 后端接口设计 | engram-server-api：为 Engram 路由、处理器、请求载荷和状态码变更提供 API 契约约束。 | 核对接口载荷变更；检查路由与状态码兼容性 |
| [engram-ui-elements](https://skills.sh/gentleman-programming/engram/engram-ui-elements) | 控制台界面开发 | engram-ui-elements：整理 Engram 控制台页面、卡片、指标和详情浏览流程的 UI 元素创建规则。 | 实现控制台组件；组织指标和详情浏览 |
| [gentleman-bubbletea](https://skills.sh/gentleman-programming/engram/gentleman-bubbletea) | 终端界面开发 | gentleman-bubbletea：为 Gentleman.Dots 安装器提供 Go Bubbletea TUI 模式与屏幕实现参考。 | 修改终端界面屏幕；添加安装器交互功能 |
| [bigquery-udfs](https://skills.sh/google/skills/bigquery-udfs) | 数据仓库开发 | bigquery-udfs：创建、部署和排查 BigQuery SQL、JavaScript、Python UDF 与 Cloud Run Remote Functions。 | 编写自定义聚合函数；排查远程函数调用 |
| [cloud-armor-crs-rule-upgrader](https://skills.sh/google/skills/cloud-armor-crs-rule-upgrader) | 云安全配置 | cloud-armor-crs-rule-upgrader：把 Cloud Armor WAF 规则从 OWASP CRS 3.0 或 3.3 升级至 4.22，转换签名和排除项并评估变更风险。 | 审计 WAF 规则升级；规划预览模式迁移 |
| [gke-ai-troubleshooting-tpu-mxla-hang](https://skills.sh/google/skills/gke-ai-troubleshooting-tpu-mxla-hang) | TPU 训练排障 | gke-ai-troubleshooting-tpu-mxla-hang：结合 Megascale 日志、MXLA Hang Analyzer 与监控延迟指标诊断 GKE 多切片 TPU 训练挂起。 | 定位 TPU 训练停止推进；区分输入停滞与硬件网络线索 |
| [google-cloud-scc-remediation](https://skills.sh/google/skills/google-cloud-scc-remediation) | 云安全运维 | google-cloud-scc-remediation：针对 Google Cloud Security Command Center 发现项处理 IAM、资源配置、漏洞和攻击路径；运行时威胁侧重遏制与调查指引。 | 修复 SCC 发现的配置问题；调查攻击路径与威胁线索 |
| [sound-design-film](https://skills.sh/guia-matthieu/clawfu-skills/sound-design-film) | 影视声音设计 | sound-design-film：把 Walter Murch 的电影声音原则用于品牌片与营销视频，组织音乐、音效、旁白和情绪表达。 | 设计品牌视频声景；调整音乐与旁白层次 |
| [hyfdev-adversarial-review](https://skills.sh/hyfdev/skills/hyfdev-adversarial-review) | 交付审查 | hyfdev-adversarial-review：对已完成的代码或报告组织独立审查，从遗漏、过度工程和残留问题等方向提出反证并核实修正。 | 审查待交付的代码变更；检查报告与批量编辑结果 |
| [osv-scanner](https://skills.sh/igbuend/grimbard/osv-scanner) | 依赖漏洞分析 | osv-scanner：使用 Google OSV-Scanner 检查清单、锁文件、SBOM 或容器镜像中的已知依赖漏洞。 | 扫描依赖清单；核对 SBOM 漏洞信息 |
| [repo-harden](https://skills.sh/igorguariroba/repo-harden/repo-harden) | 仓库安全配置 | repo-harden：审计 GitHub 仓库的依赖更新、CI 固定版本、OIDC 发布、分支规则和密钥扫描等配置，并支持补齐缺项。 | 审查仓库安全配置；规划分支与发布规则 |
| [xhs-cli](https://skills.sh/jackwener/xhs-cli/xhs-cli) | 社交平台自动化 | xhs-cli：通过基于无头浏览器的命令行搜索小红书笔记、阅读帖子和主页，并执行互动与发布。 | 搜索和阅读笔记；组织评论与发布操作 |
| [li-audit](https://skills.sh/jakeschincariol/linkedin-agent-skill/li-audit) | 社交内容分析 | li-audit：根据 LinkedIn 历史帖子或分析数据复盘内容效果，寻找有效内容与需要停止的做法。 | 分析过去帖子表现；确定后续内容重点 |
| [li-comment](https://skills.sh/jakeschincariol/linkedin-agent-skill/li-comment) | 社交内容写作 | li-comment：为他人的 LinkedIn 帖子起草具有明确观点的评论，支持批量互动文案。 | 起草帖子评论；准备互动回复文案 |
| [li-dm](https://skills.sh/jakeschincariol/linkedin-agent-skill/li-dm) | 社交沟通 | li-dm：起草 LinkedIn 二百字符连接邀请、首次私信与后续跟进消息。 | 编写连接邀请；准备私信跟进 |
| [li-human](https://skills.sh/jakeschincariol/linkedin-agent-skill/li-human) | 文案编辑 | li-human：检查并调整草稿中的套话、标点和不可见字符，按五项检查组织改写；不保证规避检测。 | 改善草稿表达；检查格式与不可见字符 |
| [li-inbox](https://skills.sh/jakeschincariol/linkedin-agent-skill/li-inbox) | 社交消息整理 | li-inbox：将 LinkedIn 邀请和私信分为潜在线索、招聘、同行与垃圾消息，并起草值得回复的内容。 | 分拣私信收件箱；准备重点消息回复 |
| [li-profile](https://skills.sh/jakeschincariol/linkedin-agent-skill/li-profile) | 个人资料编辑 | li-profile：按十二项框架评估 LinkedIn 资料并修改标题、简介、经历、精选与横幅内容。 | 审查个人主页文案；改写简介与经历 |
| [li-reply](https://skills.sh/jakeschincariol/linkedin-agent-skill/li-reply) | 社交内容写作 | li-reply：为用户自己 LinkedIn 帖子下的评论起草回复，并按回复价值排序。 | 批量整理评论回复；处理评论中的质疑或线索 |
| [carl-idea-king](https://skills.sh/learnprompt/laoyeye/carl-idea-king) | 方案推敲 | carl-idea-king：通过第一性原理与对抗式审查检验计划、架构或任务分工，寻找关键假设。 | 检验架构假设；审查执行分工方案 |
| [matt-grill-me](https://skills.sh/learnprompt/laoyeye/matt-grill-me) | 需求访谈 | matt-grill-me：通过持续追问帮助澄清并完善计划或设计。 | 检查计划是否完整；澄清设计中的未定问题 |
| [matt-grilling](https://skills.sh/learnprompt/laoyeye/matt-grilling) | 决策推敲 | matt-grilling：以连续追问方式检验计划、决策和想法中的假设。 | 压力测试决策依据；发现计划薄弱环节 |
| [memory-parable](https://skills.sh/learnprompt/laoyeye/memory-parable) | 概念学习 | memory-parable：用寓言帮助记忆抽象概念，再解释故事隐喻与概念之间的对应关系。 | 用故事理解陌生概念；整理隐喻与术语对应 |
| [reverse-teardown](https://skills.sh/learnprompt/laoyeye/reverse-teardown) | 案例拆解 | reverse-teardown：分析优秀产品、网页、方案或作品的有效机制，提炼可复用规律与操作清单。 | 拆解成功作品；归纳可复用实践 |
| [socratic-inquiry](https://skills.sh/learnprompt/laoyeye/socratic-inquiry) | 问题澄清 | socratic-inquiry：通过逐次提问梳理混乱的问题，最多六问后整理出更值得回答的问题。 | 澄清模糊需求；重述需要解决的问题 |
| [steelman-both-sides](https://skills.sh/learnprompt/laoyeye/steelman-both-sides) | 决策分析 | steelman-both-sides：为两个选项分别组织最强论证，识别真正分歧、关键变量和可能改变判断的问题。 | 比较两个备选方案；识别决策关键变量 |
| [two-layer-explain](https://skills.sh/learnprompt/laoyeye/two-layer-explain) | 概念讲解 | two-layer-explain：以通俗与专业两个层次解释概念、术语、报错或技术栈，并附术语对照和自测题。 | 理解陌生技术术语；分层解释报错原因 |
| [aftersales-classify-tool](https://skills.sh/site/mcp-hub.momenta.works/aftersales-classify-tool) | 能力待核实 | aftersales-classify-tool：本次公开详情未提供可用功能说明，现有元数据不足以确认具体能力。 | 复查公开详情是否恢复；等待可验证的功能说明 |
| [ess-dev](https://skills.sh/site/mcp-hub.momenta.works/ess-dev) | 能力待核实 | ess-dev：本次公开详情未提供可用功能说明，现有元数据不足以确认具体能力。 | 复查公开详情是否恢复；等待可验证的功能说明 |
| [postgresql-best-practices](https://skills.sh/microsoft/postgres-skills/postgresql-best-practices) | 数据库与后端 | postgresql-best-practices：提供 PostgreSQL 与 Azure Database for PostgreSQL 的连接、查询、索引、权限、复制、扩容、备份和身份认证参考。 | 维护 PostgreSQL 查询与索引；规划 Azure 数据库运维 |
| [course-creation](https://skills.sh/omer-metin/skills-for-antigravity/course-creation) | 课程设计 | course-creation：设计在线课程的学习目标、模块架构、内容递进和评估方案，采用逆向设计方法。 | 规划课程大纲；设计学习成果与测评 |
| [cmc-api-market](https://skills.sh/opencmc/skills-for-ai-agents-by-coinmarketcap/cmc-api-market) | 加密市场数据 | cmc-api-market：提供 CoinMarketCap 全市场 API 参考，覆盖全局指标、恐惧贪婪、指数、热门话题与图表。 | 查询市场整体指标；接入情绪与图表数据 |
| [cmc-x402](https://skills.sh/opencmc/skills-for-ai-agents-by-coinmarketcap/cmc-x402) | 数据 API 集成 | cmc-x402：通过 x402 按请求付费协议和 Base 上的 USDC 访问 CoinMarketCap 数据。 | 研究按次付费数据接口；集成 x402 数据访问 |
| [c-hardening-baseline](https://skills.sh/outlinedriven/outline-driven-development/c-hardening-baseline) | C 语言工程 | c-hardening-baseline：为纯 C 代码提供语言标准、未定义行为、整数和缓冲区检查、Sanitizer、模糊测试与构建标志基线。 | 审查 C 代码风险；配置运行检查与模糊测试 |
| [release-ieumoffice](https://skills.sh/pblsketch/openoffice/release-ieumoffice) | 软件发布 | release-ieumoffice：组织 IeumOffice 的版本升级、Windows 安装包、GitHub Release、更新清单及 Mac 和 Linux 构建，并编写发布说明。 | 准备多平台版本发布；编辑应用内更新说明 |
| [remotion-data-viz](https://skills.sh/phamthanhnghia/remotion-agent-skills/remotion-data-viz) | 视频数据可视化 | remotion-data-viz：在 Remotion 中制作动画图表、计数器、进度条和 SVG 路径，支持 Recharts 与 D3 集成。 | 制作动态统计图；为视频加入进度与计数动画 |
| [render-textures](https://skills.sh/phaserjs/phaser/render-textures) | 游戏渲染 | render-textures：使用 Phaser 4 的 RenderTexture 与 DynamicTexture 绘制对象、创建动态纹理、快照和离屏画面。 | 生成动态游戏纹理；制作离屏渲染与快照 |
| [prune-tests](https://skills.sh/riffingonsoftware/agent-skills/prune-tests) | 测试维护 | prune-tests：按契约、已修复缺陷和关键不变量审视测试，清理不提供独有保护的测试。 | 检查重复测试价值；整理测试保留依据 |
| [ship](https://skills.sh/riffingonsoftware/agent-skills/ship) | 代码交付 | ship：在检查敏感数据、整理相关测试和拆分逻辑提交后提交并推送本地改动。 | 整理待交付提交；检查提交中的敏感内容 |
| [00-andruia-consultant](https://skills.sh/sickn33/agentic-awesome-skills/00-andruia-consultant) | AI 项目规划 | 00-andruia-consultant：以西班牙语诊断 AI 项目的代码与限制，推荐现有 Skill 并编写任务及实施计划。 | 梳理 AI 项目约束；准备实施任务清单 |
| [10-andruia-skill-smith](https://skills.sh/sickn33/agentic-awesome-skills/10-andruia-skill-smith) | Skill 创作 | 10-andruia-skill-smith：为 Andru.ia 创建或改进 Skill，定义输入输出、示例和边界，验证结构并准备 PR。 | 设计 Skill 能力边界；检查结构并准备评审 |
| [nvg-resolution-mode](https://skills.sh/skyoxu/taptapmarker/nvg-resolution-mode) | 图形界面适配 | nvg-resolution-mode：为原生 NanoVG 调用选择设计、逻辑或物理像素分辨率模式，处理 DPI、坐标转换和输入映射。 | 修复高 DPI 显示问题；核对帧参数与输入坐标 |
| [analyze-replay-report](https://skills.sh/speedscale/skills/analyze-replay-report) | 测试结果分析 | analyze-replay-report：解释 Speedscale 或 proxymock 的云端和本地回放报告，定位通过或失败原因并给出后续检查方向。 | 解读回放报告；调查低成功率与目标缺失 |
| [proxymock-chaos-mock](https://skills.sh/speedscale/skills/proxymock-chaos-mock) | 故障注入测试 | proxymock-chaos-mock：向 proxymock 依赖模拟注入状态码、损坏响应、延迟和连接故障，并设置确定性失败比例。 | 验证重试与超时行为；模拟故障下游依赖 |
| [proxymock-contract-test](https://skills.sh/speedscale/skills/proxymock-contract-test) | API 契约测试 | proxymock-contract-test：把录制或回放流量与 OpenAPI、gRPC 或 GraphQL 契约对照，并从规范生成依赖模拟。 | 检查字段级契约违例；从接口规范创建模拟依赖 |
| [proxymock-perf-container](https://skills.sh/speedscale/skills/proxymock-perf-container) | 服务性能测试 | proxymock-perf-container：用 proxymock 回放流量并模拟下游，区分服务吞吐上限和测试工具饱和，说明共享主机比较的限制。 | 测量容器服务承载量；调查压测工具瓶颈 |
| [tune-snapshot-replay](https://skills.sh/speedscale/skills/tune-snapshot-replay) | 回放测试调试 | tune-snapshot-replay：迭代调整 Speedscale 或 proxymock 的回放测试、变换、断言和配置，处理动态值与状态差异。 | 排查回放响应不一致；调整过期凭据与动态字段测试 |
| [spritecook-build-ui-kits](https://skills.sh/spritecook/skills/spritecook-build-ui-kits) | 游戏界面资产 | spritecook-build-ui-kits：使用 SpriteCook 的概念、组件表、提取和定稿工具创建或完善游戏 UI 套件。 | 制作游戏界面控件集；细化既有界面概念 |
| [spritecook-upload-assets](https://skills.sh/spritecook/skills/spritecook-upload-assets) | 游戏资产管理 | spritecook-upload-assets：通过 SpriteCook MCP 上传用户选定图像到资产库，供参考、编辑、动画或复用。 | 导入参考图到资产库；准备后续编辑素材 |
| [spritecook-use-assets-in-godot](https://skills.sh/spritecook/skills/spritecook-use-assets-in-godot) | Godot 资产集成 | spritecook-use-assets-in-godot：把 SpriteCook 精灵表与动画资产转换为 Godot SpriteFrames 和 AnimatedSprite2D 或 AnimatedSprite3D 工作流。 | 将精灵表接入 Godot；组织角色动画资源 |
| [tavily-sdk](https://skills.sh/tavily-ai/skills/tavily-sdk) | 搜索 API 集成 | tavily-sdk：提供 Tavily 网页搜索、内容提取、抓取和研究集成参考，面向 Agent 与 RAG 应用。 | 接入网页搜索与提取；构建研究和检索工作流 |
| [expo-uniwind-theme](https://skills.sh/techwithemmayt/techwithemma-skills/expo-uniwind-theme) | 移动端主题 | expo-uniwind-theme：使用 Tailwind CSS v4 与 Uniwind 配置 Expo 明暗语义主题、系统切换、路由颜色、间距、字体和提示反馈。 | 建立 Expo 主题基础；修复明暗模式与导航颜色 |
| [plan-project](https://skills.sh/techwithemmayt/techwithemma-skills/plan-project) | 需求规划 | plan-project：通过访谈澄清软件产品与技术需求，在实施规划前整理经过核对的规格。 | 明确新应用需求；整理功能与技术规格 |
| [create-verification-skill](https://skills.sh/tester-army/e2e/create-verification-skill) | 应用验证 | create-verification-skill：基于 e2e 生成项目本地验证 Skill、功能地图和探索检查项，并对应用交互保留证据。 | 建立应用验证入口；整理功能探索与缺陷证据 |
| [traceway-learn](https://skills.sh/tracewayapp/traceway/traceway-learn) | 可观测性使用 | traceway-learn：解释 Traceway 的异常、端点、追踪、日志、指标、会话、告警、值班和状态页等功能及流程。 | 查阅 Traceway 功能；配置告警与状态页流程 |
| [traceway-setup](https://skills.sh/tracewayapp/traceway/traceway-setup) | 可观测性集成 | traceway-setup：分析仓库并规划或核对 Traceway 与 OpenTelemetry 接入，区分后端 OTLP、浏览器和移动端 SDK 项目。 | 接入应用监控；核对项目拓扑与埋点方案 |
| [unbrowse](https://skills.sh/unbrowse-ai/unbrowse/unbrowse) | 网页数据接口 | unbrowse：通过 Unbrowse 托管 API 或远程 MCP 调用网站工具、阅读页面，并由云浏览器学习缺失路径。 | 执行结构化网站查询；复用已索引网站接口 |
| [sound](https://skills.sh/vibe-motion/sound/sound) | 音频素材检索 | sound：根据下载数、评分、说明和许可信息为视频寻找 Freesound 音效素材。 | 检索视频音效；核对素材许可与说明 |
| [walle-issue](https://skills.sh/site/walle.17usoft.com/walle-issue) | 能力待核实 | walle-issue：本次公开页面仅有目录元数据，无法确认具体能力与适用范围。 | 核对来源公开说明；等待可验证的功能信息 |
| [whop-api](https://skills.sh/whopio/skills/whop-api) | 支付 API 集成 | whop-api：配置 Whop 凭据与 SDK，处理版本、幂等、分页、错误和 API 文档查询。 | 初始化 Whop SDK；排查认证和分页错误 |
| [whop-checkout](https://skills.sh/whopio/skills/whop-checkout) | 支付结账集成 | whop-checkout：使用 Whop 创建商品价格与结账链接，嵌入结账组件，并处理钱包支付、优惠码及沙盒测试。 | 构建应用结账流程；测试一次性与订阅付款 |
| [whop-communities](https://skills.sh/whopio/skills/whop-communities) | 社区应用集成 | whop-communities：嵌入 Whop 聊天与私信界面，管理访问令牌、频道、消息、论坛、课程和学习进度。 | 集成聊天与私信；管理论坛或课程内容 |
| [whop-payouts](https://skills.sh/whopio/skills/whop-payouts) | 结算 API 集成 | whop-payouts：通过 Whop 管理余额转账、银行或 PayPal 提现、报价、支付方式、充值和账本活动。 | 接入提现管理界面；核对余额与结算流水 |
| [whop-platforms](https://skills.sh/whopio/skills/whop-platforms) | 平台账户集成 | whop-platforms：在 Whop 上创建卖家关联账户，配置入驻、身份验证、补充材料与平台手续费收款。 | 设计卖家入驻流程；集成关联账户身份验证 |

逐项中文审校依据见skills-editorial-review-2026-11-03.json：{"conservative_metadata_or_unconfirmed":6722,"retained_public_metadata_or_existing_editorial":36,"current_public_description":128,"exact_hash_matched_prior_editorial":22}。其中未能在本次重读详情的既有说明明确标注为保留编辑，不声称全部远程详情均已重新核实。

执行尝试：首次采集完成；启用25秒请求超时，记录16次HTTP429，均恢复成功。详见skills-attempts-2026-11-03.json。

中文编辑恢复：22条既有具体说明与当前存储公开原文SHA-256完全相同，已恢复；见skills-editorial-recovery-2026-11-03.json。该依据不等同于本日重新读取详情。

恢复证据：独立分页首轮因HTTP429失败，原始记录保留于skills-independent-source-audit-2026-11-03-attempt1.json；后续50页复核成功。GitHub连接器补查831个仓库，813个确认在线，18个连接器结果未确认；其后HTTP复查与最终逐项证据一并保留，未用API拒绝或限流推断下架。详情超时、SQLite锁及重试结果见skills-attempts-2026-11-03.json和逐项evidence。

最终验证：data:validate-dev failed（exit 1），共3项错误。完整错误见skills-validation-2026-11-03.log；完整验证保留实际结果；未伪造检查、弱化门槛或改写其他频道。
- AI event ai-2026-11-03-paper-2610-41011 lacks a current original-source review
- AI event ai-2026-11-03-paper-2610-41330 lacks a current original-source review
- AI event ai-2026-11-03-paper-2610-42146 lacks a current original-source review

本批次最终队列8015项全部实际检查详情页，1518个去重GitHub仓库亦使用本批次观察。首次采集与独立复核均完整；实际重试及HTTP响应保留。17项Skill专项测试通过，latest/history一致，12个main基线文件哈希未变。共137条中文编辑（含22条原文相同的既有编辑恢复），6908个目标字段检查通过。页面只读跳转检查见skills-ui-link-audit-2026-11-03.json。
Skill来源政策：{"ready":true,"blockers":[],"notices":["Skill 历史目录 79 项来源仍待核验；当天来源与趋势详情通过，历史记录和 warning 保留。"]}。保留历史warning；本任务产物仅写data/dev，未发布或发送。
