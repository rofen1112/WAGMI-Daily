import { readFile, writeFile } from 'node:fs/promises';
const read = async path => JSON.parse(await readFile(path, 'utf8'));
const path = 'data/dev/ai-editorial-repairs-2026-10-27.json';
const base = 'data/dev/source-archives/audit-1200-2026-10-27';
const manifest = await read(path);
await writeFile(`${base}/manifest-before.json`, JSON.stringify(manifest, null, 2) + '\n');
const results = await read(`${base}/fetch-results.json`);
const checkedAt = new Date().toISOString();
const findings = new Map([
 [1, 'GitHub正文日期为10月26日，Terra在Copilot GA但逐步推出；Business与Enterprise仍受管理员模型策略控制。'],
 [2, '官方10月26日公告确认拟以ANT在Nasdaq上市；股数和价格范围未定，注册声明尚未生效。不推算估值或已完成IPO。'],
 [9, '记者Sofia Chesnokova署名10月26日原文：Nous获1700万美元，Heartcore与Mosaic领投，用于增长和国际扩展；现仅英国运营，账单代办与节省数字须归因公司自述。'],
 [10, 'Google正文10月26日，15位学生大使分享11类既有Gemini使用方式，包含study notebooks与Live；用户案例不是新功能首发证据。'],
 [12, 'ArtifactWorld首次提交2026-04-14、修订2026-09-29；摘要提出107.5K配对视频、同构预测器热图和视频扩散局部修复。只核验摘要，未独立复现实验。'],
 [13, '综述首次提交2026-04-29，arXiv v4修订10月23日；摘要按资产生成、交互仿真环境、Sim2Real三类组织，强调物理与运动学可用性。未将修订日当首次发表日。'],
 [14, 'SceneMosaic首次提交2026-09-04；摘要结合图像先验和局部VLM布局演化，SceneEval-100上24倍提速为作者报告。保留摘要级限制，不声称本批实验复现。'],
 [15, 'Anthropic新闻列表的最新S-1已另读完整正文；没有发现本次午间新增可确认的模型或产品公告。'],
 [16, 'NVIDIA RSS最新仍是10月23日哈萨克斯坦算力，链接集合与09:00相同；Cosmos等较早公告不重标今天。'],
 [17, '官方Release API新增rust-v0.166.0-alpha.1，published_at=2026-10-27T01:33:18Z，正文仅Release版本号，无可核验功能，留观察；稳定0.164.0仍10月23日。'],
 [18, 'Autodesk官方新闻列表没有确认午间新增AI-CAD/AEC公告；不将既有合作和导航链接解释为产品首发。'],
 [19, 'Planner5D博客列出设计场景和既有产品文章，没有本窗口新发布的充分时间与原始正文证据。'],
 [20, 'Meshy官方列表7.1为两个月前，原生8K纹理三个月前，Rigging研究八天前；导航上的Agent、MCP和CLI不代表今天发布。'],
 [21, 'DeepMind列表包含Argon、Robotics及科研文章，多数仅2026年10月月份精度，不能据此认定午间新发布。'],
 [25, '作者综述项目页News明确10月24日v2资源列表新增84篇，首次4月29日；项目列表版本与arXiv论文v4分别记录。'],
 [26, 'OpenAI官方RSS最新Greptile为10月26日22:00Z；按来源URL匹配09:00归档后条目集合未变，已在今天正式日报中，不重复新增。'],
 [27, 'Google AI RSS最新AI Quests为10月26日16:00Z，来源条目集合与09:00相同，没有新增合格行业事件。'],
]);
const reviews = [];
for (const [i, contentExcerpt] of findings) {
 const result = results[i];
 if (!result?.success) throw new Error(`Source ${i} did not fetch successfully`);
 const previous = manifest.verifiedSources.findLast(source => source.url === result.url);
 reviews.push({url: result.url, checkedAt, fetchedAt: result.checkedAt, success: true, verification: 'verified', sourceClass: previous?.sourceClass ?? 'official', method: 'Independent original body or structured feed read, factual and date comparison with 09:00 evidence', contentExcerpt, eventIds: previous?.eventIds ?? [], discoveryChecked: i >= 15 && i !== 25, auditBatchId: 'ark-insight-12-00:2026-10-27', evidencePath: result.path});
}
for (const [i, contentExcerpt] of [
 [0, '官方完整正文说明Terra的视觉推理、电脑操作及API可用性；标准API价格与评测比较属于发布方陈述，未将其视为独立性能验证。发布日期由官方RSS10月26日核对。'],
 [11, '官方10月26日完整正文将三类AI数学、计算机科学与物理输出称为原始研究数据，说明外部协作和公开材料策略；数学与CS公开，物理材料延后。未验证证明本身。'],
]) {
 const previous = manifest.verifiedSources.findLast(source => source.url === results[i].url);
 reviews.push({url: results[i].url, checkedAt, success: true, verification: 'verified', sourceClass: 'official', method: 'web.open full official body plus official RSS publication date', contentExcerpt, eventIds: previous.eventIds, auditBatchId: 'ark-insight-12-00:2026-10-27', evidencePath: `${base}/openai-web-review.json`, initialHttpStatus: results[i].httpStatus});
}
manifest.verifiedSources.push(...reviews);
manifest.audit1200 = {batchId: 'ark-insight-12-00:2026-10-27', checkedAt, noNewEvents: true, discoveryChecked: true, newEventIds: [], independentReviews: reviews.length, memene: {recordId: '167413132250054656', candidates: 22}, notes: ['按URL匹配09:00抓取记录后，OpenAI/Google/NVIDIA/作者Atom四组发现源条目无新增。', 'Codex新alpha只有版本号，媒体候选缺少新原始事实的继续待核验。', 'OpenAI直连403保留；仅两篇通过web独立重读，其余沿用今天原始核验时间，未伪造刷新。', '未新增正式事件，保留真实事件日期与已有待核验条目。']};
await writeFile(path, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest.audit1200));
