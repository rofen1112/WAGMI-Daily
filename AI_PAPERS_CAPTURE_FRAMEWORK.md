# AI 前沿论文抓取框架

## 日期完整性（2026-10-08 排查修复）

arXiv RSS pubDate 是通告或更新日期，并非必然为首次提交日。
保留 `rssAnnouncedAt`；以官方摘要页 citation_date 保存
`originalPublishedAt`（日精度），并明确 `dateSemantics`。
未核验首次提交日时只显示“RSS 通告”，不得冒充新发表。
运行 `node scripts/refresh-paper-source-dates.mjs --all-reviewed` 后执行
`npm.cmd run papers:catalog`，复核已解读和待解读队列日期。

## 1. 目标

论文不是独立堆放的资料库，而是 AI 大事件的前置信号。只有与 ark.insight 重点方向相关、能够影响产品判断、技术路线或 GitHub 项目跟踪的论文，才进入每日阅读流。

重点方向：建筑与室内设计、CAD/AEC、3D/3DGS、空间智能、世界模型、物理 AI、具身智能、视频生成与自动剪辑、生成式设计工具、Agent 与多模态基础模型。

## 2. 来源分层

### 每日元数据源

- arXiv 官方 RSS：`cs.CV`、`cs.AI`、`cs.RO`、`cs.GR`、`cs.MM`。
- 每天只请求一次组合 RSS，并缓存为 `data/dev/ai-papers-latest.json`。
- RSS 用于发现，不等于质量背书；标题、摘要、作者、类别和原文链接必须保留。

### 顶会官方源

- ICLR：OpenReview 官方会议页。
- CVPR：CVF Open Access。
- ICML：PMLR Proceedings。
- NeurIPS：NeurIPS Proceedings。

顶会页面通常按投稿、接收或正式出版批量更新，不适合每天全量解析。默认在周报中检查；进入放榜或论文集发布时间窗口后，分批处理积压候选。

### 作者与项目源

- 作者项目页、实验室主页、官方 GitHub、论文代码仓库。
- 作者或研究者解读可以帮助发现，但必须回到论文原文或官方项目页核验。

## 3. 每日流程与预算

每天 07:30，随 `wagmi-ai` 一起运行：

1. 运行 `npm.cmd run papers:discover`，只做元数据抓取和本地关键词评分，不调用模型。
2. 运行 `npm.cmd run papers:catalog`，把本次候选累计合并到 `data/dev/papers-catalog.json`。已入库论文不会因为单次来源缺失被删除；连续缺失 3 次后只标记为待核验。
3. 从累计目录中选择最多 10 篇深读；用户点击“立即解读”产生的 `priorityReviewQueue` 必须先于自动候选处理，其余名额优先跨越两个以上重点方向、出现代码/项目页、或能改变现有工作流的论文。已完成解读的论文不占用下一批队列名额。
4. 每天最多解析 3 篇 PDF 全文。其余只读标题、摘要、项目页和代码说明，并明确标记为摘要级或元数据级。
5. 最多 3 篇论文可进入当日 AI 大事件；推荐必须读取 `papers-catalog.json.dailyRecommendations`，且只允许使用已经具有中文标题和中文摘要的记录。没有达到阈值时不补数。
   当发现源还有重要研究而三篇名额已满时，完整保留在公开累计论文目录，使用防漏审阅的 `catalogued` 状态并关联 `paperIds`，不能假装无关或未证实。该状态要求：当日日报已正式收录三篇且与目录推荐一致；额外论文具备当日原始论文事实证据、中文标题/摘要/局限和实际审阅时间，并记录后续动作。缺少这些条件仍阻断。目录收录不增加当日日报论文篇数，也不把旧论文改为今日首发。
6. 论文事件必须有中文标题、中文摘要、行业价值、局限和下一步；禁止把英文摘要直接发布。

默认预算存放于 `ai-paper-sources.json`：深读 10 篇、全文 3 篇、摘要候选 20 篇。配置文件是唯一预算来源，任务不得另行硬编码旧上限。

## 4. 周度与会议窗口

- 每周一 07:50：复核最近 7 天候选和四大顶会官方页面，最多深读 5 篇遗漏论文。
- 顶会放榜/论文集更新：建立积压队列，每天最多处理 5 篇，不在一天内全量消耗模型额度。
- 论文被作者更新、代码开源、项目页上线或被顶会接收时，可以作为同一论文的新信号更新，不重复制造多个事件。

## 5. 入选规则

优先级 A：直接影响重点方向，方法或结果有明确增量，来源完整，并且有可验证实验、项目页或代码。

优先级 B：方向高度相关但证据、代码或真实场景验证仍不足。

优先级 C：作为周报背景保留，不进入每日大事件。

不入选：仅标题相关、泛用模型结构、无实验支持的观点稿、重复版本、与重点行业无直接关系的论文。

## 6. 每日事件字段

论文事件继续使用 `AiEvent`，并增加：

- `contentKind: "paper"`
- `paper.titleOriginal`
- `paper.authors`
- `paper.publishedAt`
- `paper.venue`
- `paper.paperUrl`
- `paper.pdfUrl`
- `paper.projectUrl` / `paper.codeUrl`（存在时）
- `paper.readingLevel`: `abstract` 或 `fulltext`

`boards` 必须包含 `Frontier Paper / Research`，并至少包含一个业务方向板块。论文提到的代码仓库继续强制进入 GitHub Radar 候选。

## 7. 展示原则

- AI 大事件每日页保留“前沿论文”板块筛选，承担当天推荐；一级导航“论文研究库”承担累计检索、阅读排期和证据追踪。
- 卡片先显示中文结论，再显示原始英文题名、作者/会议、论文链接和阅读深度。
- 原始发布日期与日报收录日期分别保留，不把旧论文改写成当天新论文。

## 8. 累计目录与阅读队列

- 目录主键使用稳定的 arXiv ID；同一论文的新版本更新原记录，不制造重复条目。
- 状态依次为：`discovered`（已收录）、`queued`（待解读）、`interpreted`（已解读）、`verified`（已复核）。
- 阅读深度独立记录为：`metadata`、`abstract`、`fulltext`。任何结论都必须显示实际阅读深度。
- `paper-review-overrides.json` 保存人工或 AI 审核后的中文内容，允许逐篇补充，不覆盖原始英文标题和摘要。
- 每日深读队列最多 10 篇，用户主动请求先进入最高优先级队列，其余名额优先保证研究方向多样性；已完成记录自动让位给下一批候选。

## 9. 论文与 GitHub 证据关系

- `official_code`：只允许在论文、作者项目页或官方来源明确给出仓库链接时使用。
- `project_page`：论文官方项目页，必须保留来源链接。
- `baseline`：论文正文或摘要明确比较、继承的基线项目。
- `related_method`：技术路线相近的已跟踪项目，不代表作者关系。
- `downstream_application`：可以承接该研究能力的应用或验证项目。
- 每条关系必须保留 `evidenceUrl` 和置信度。仅凭名称相似不得标记为官方代码。
- 论文或官方项目页明确给出的代码仓库会写入 `data/dev/paper-github-candidates.json`，下一次 GitHub 趋势发现将其作为 `paper-official-code` 强制候选处理。
- 趋势结论至少需要两篇论文；只有同时存在可跟踪项目时，才可标记为“强证据”，否则只能称为研究信号。
