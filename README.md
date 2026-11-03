# ark.insight

深度 AI 行业观察、趋势分析与技术资产研究平台。

ark.insight 将 AI 大事件、开源项目、Agent Skills 和前沿论文整理为可追溯的中文阅读与研究入口，帮助产品、设计与研发团队判断值得关注的变化，以及下一步可以验证的方向。重点覆盖建筑与室内设计、CAD/AEC、3D/3DGS、空间智能、世界模型、物理 AI、视频生成、Agent 和多模态模型。

本项目由 WAGMI Daily 演进而来，GitHub 仓库名和 npm 包名仍保留 `wagmi-daily`。

- 网站入口：[wagmii.cn](https://wagmii.cn)
- 项目仓库：[rofen1112/WAGMI-Daily](https://github.com/rofen1112/WAGMI-Daily)

## 可以做什么

| 模块 | 内容与用途 |
| --- | --- |
| 今日 | 汇总已发布的当日内容，进入各专题与报告。 |
| AI 大事件 | 阅读中文事件解读、历史日报与周报，查看事实来源、中文延伸阅读、行业价值与后续动作。 |
| GitHub Radar | 结合趋势发现与仓库核验，跟踪开源项目、行业分类、项目动态及 AI 事件关联。 |
| Skill 能力库 | 搜索累计收录的 Skills，查看中文用途、使用场景、发布者、来源与热度变化。 |
| 论文研究库 | 搜索累计论文目录，查看中文解读、原文、项目与代码入口；区分元数据、摘要和全文阅读深度。 |
| 本地管理 | 在本机审阅候选、维护关注对象、查看运行记录、申请论文解读并执行校验后的数据发布。 |

公开站点提供只读阅读。本地管理版另有“我的关注”和“任务运行”入口；专题采集、审阅、发布与钉钉投递需要独立配置和运行，克隆仓库或启动前端不会自动开启这些任务。

## 内容如何形成

内容经过来源发现、事实核验、中文编辑、候选审阅和发布校验，再进入公开数据快照。日报与周报共享项目和研究线索，但热度排名、累计目录和编辑推荐各有用途，不能互相替代。

- 优先使用官方公告、文档、仓库、模型卡和论文作为事实依据；媒体与创作者文章提供发现线索及中文阅读入口。
- 保留真实发布日期与实际核验时间，区分首次发布、更新、RSS 通告和本次观察。
- 数据缺失、来源失败、未验证结论与阅读局限需要明确记录，不以旧数据冒充当日结果。
- 内部发现源与原始审阅证据留在本机，公开 JSON 和报告副本由来源策略过滤。
- 每日发布和投递按上海日期处理；公开网站核验通过后，才进入当天的钉钉投递流程。

详细规则见下方的采集框架与发布手册。

## 本地运行

本项目使用 React、TypeScript、Vite 和 Ant Design；采集、数据处理与发布脚本使用 Node.js，部分目录维护脚本使用内置 SQLite。当前已在 Windows、Node.js **22.15.0** 环境运行验证；Windows 服务和启动脚本另需 PowerShell。

### 1. 安装并准备公开数据

```bash
git clone https://github.com/rofen1112/WAGMI-Daily.git
cd WAGMI-Daily
npm ci
npm run data:sync-main
```

仓库包含已审阅的 `data/main` 快照。`data:sync-main` 会先校验数据，再生成 `public/data/main` 和公开报告副本；这些生成的数据文件无需手动编辑。

### 2. 启动公开阅读版

```bash
npm run dev:public -- --host 127.0.0.1 --port 5173 --strictPort
```

打开 `http://127.0.0.1:5173/`。此模式使用公开 `main` 数据。

### 3. 启动本地管理版

在另一终端运行：

```bash
npm run dev:admin
```

打开 `http://127.0.0.1:5174/`。管理版合并本机 `data/dev` 与 `data/main`；新克隆的仓库不包含本机候选、运行历史、凭据与私人深度报告。

管理版仅供本机使用，不应通过公网隧道、端口转发或静态托管对外暴露。访问边界见 [ACCESS_POLICY.md](ACCESS_POLICY.md)。

## 校验与生产构建

```bash
npm test
npm run build
```

`npm run build` 会依次校验和同步公开数据、执行 TypeScript 检查，并将公开站点构建到 `dist/client/`。

本地预览生产构建：

```bash
npm run preview:public
```

默认访问 `http://127.0.0.1:8080/`。该服务默认也可从局域网访问，详见 [LOCAL_SERVER.md](LOCAL_SERVER.md)。本地构建成功不等于生产网站已更新，生产网站通过核验也不等于当天钉钉已投递。

## 项目结构

```text
src/                  页面、路由、组件、主题和前端数据读取
scripts/              来源采集、数据校验、发布、投递与本地服务脚本
tests/                数据契约、来源策略、发布及访问边界等回归检查
data/main/            已审阅、可公开的源数据快照
data/dev/             本机候选、审阅证据、采集结果与运行记录（不提交）
data/local-reports/   本机私人深度报告（不提交）
public/data/main/     由同步脚本生成的公开数据副本
public/reports/       公开报告副本
reports/              本机保留的报告原稿（不提交）
dist/client/          公开版生产构建产物（不提交）
```

日常数据流为 `来源采集 → data/dev 审阅与校验 → data/main → 公开副本与构建 → 网站核验 → 当日投递`。同步 GitHub 只更新仓库，不会自动执行整条发布流程。

本机 `.env` 配置、密钥、日志、临时文件和内部证据不随仓库同步。环境示例见 [.env.publication.example](.env.publication.example) 和 [.env.cloudbase.example](.env.cloudbase.example)；首次部署请按部署手册配置对应环境。

## 文档导航

| 文档 | 说明 |
| --- | --- |
| [部署说明](DEPLOY.md) | 当前托管方式、构建产物、部署与公开网站验证。 |
| [访问策略](ACCESS_POLICY.md) | 公开阅读版与本地管理版的边界。 |
| [数据目录](data/README.md) | `dev`、`main` 与公开数据副本的职责。 |
| [AI 大事件采集框架](AI_EVENTS_CAPTURE_FRAMEWORK.md) | 关注方向、来源与事件编辑规则。 |
| [GitHub Radar 框架](GITHUB_RADAR_FRAMEWORK.md) | 趋势发现、仓库核验与行业跟踪。 |
| [模型跟踪框架](MODEL_RADAR_FRAMEWORK.md) | 模型来源、分类和核验规范。 |
| [Skills 框架](SKILLS_RADAR_FRAMEWORK.md) | 累计目录、中文说明、热度比较与缺失复核。 |
| [论文框架](AI_PAPERS_CAPTURE_FRAMEWORK.md) | 论文发现、阅读预算、解读与推荐规则。 |
| [每日发布与钉钉手册](DINGTALK_PUSH_RUNBOOK.md) | 发布门禁、故障恢复、公开核验和每日投递约束。 |
| [本地公开服务](LOCAL_SERVER.md) | 生产静态服务、启动与维护。 |
| [本地健康检查](LOCAL_HEALTH_WATCHDOG.md) | 本机服务监控与恢复。 |
| [本地深度报告](LOCAL_REPORTS.md) | 私人报告的保存、登记与本机阅读。 |
| [协作说明](AGENTS.md) | 项目自动化与代理协作要求。 |
