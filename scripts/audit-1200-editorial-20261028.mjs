import { readFile, writeFile, copyFile } from 'node:fs/promises';
import { XMLParser } from 'fast-xml-parser';
const base = 'data/dev/source-archives/audit-1200-2026-10-28/';
const path = 'data/dev/ai-editorial-repairs-2026-10-28.json';
const manifest = JSON.parse(await readFile(path, 'utf8'));
const results = JSON.parse(await readFile(base + 'fetch-results.json', 'utf8'));
for (const [source, name] of [[path, 'manifest-before.json'], ['data/dev/ai-events-latest.json', 'ai-before.json'], ['data/main/index.json', 'main-before.json']]) await copyFile(source, base + name);
const observations = {
  0: '10月27日Genie 4正文：键盘与自然语言实时引导、原生音频和Gemini观察规划闭环；可信测试者研究预览，消费者及API接入仍是后续阶段。未观看或实测演示。',
  1: 'Google发布说明独立确认10月27日世界模拟研究、原生音乐和对话、有限可信测试者；Ultra、API与AI Studio为coming soon。',
  2: '10月27日Argon应用正文有照片到可玩桌面三维赛道示例：Antigravity协调子任务、Blender MCP与Nano Banana。属于官方工作流演示，未做独立性能复现。',
  3: '官方release API稳定版仍为0.165.0（10月27日20:09:38Z）：Vertex AI、记忆v2、会话导航及MCP取消/中断/市场URL修复；新增0.166.0-alpha.4只有版本号，无可收录功能说明。',
  4: '官方release API稳定版仍为2.1.312（10月27日20:24:20Z）：大规则文件完整读取或原地编辑、Bash cd后技能发现、组织策略与设置获取修复。没有本轮新稳定版。',
  5: 'GitHub10月27日原文：组织安装GitHub Apps的服务间认证公开预览；Copilot Requests只读权限、短期token、组织预算和计费，管理员可暂停或卸载。',
  9: 'Anthropic10月27日原文：三类Claude产品40%政府折扣；直接采购今天可用，云渠道未来数月，多级政府适用且无最低消费承诺。节省金额属于公司估计。',
  12: 'ArtifactWorld原始摘要复核：107.5K配对视频、同构预测器与伪影热图引导视频扩散修复稀疏3DGS；首次4月14日、修订9月29日。仅摘要级、未复现实验。',
  13: '3D生成具身综述原始摘要：数据生成、交互仿真环境、Sim2Real桥梁三类；要求运动学/材质/物理有效性及交互就绪。首次4月29日、v4为10月23日。',
  14: 'SceneMosaic原始摘要：图像先验初始化、VLM局部单元演化后全局组合；SceneEval-100报告24倍速度与物理违规下降，属于作者实验结果。首次9月4日。',
  15: 'Autodesk列表最新明确日期仍为10月21日设计工程合作，未发现本轮新增AI-CAD正式公告。',
  16: 'Planner5D最新列表10月14日；Copilot旧文9月22日、WebMCP旧文9月11日，不能由导航和访问时间构造今日首发。',
  17: 'Meshy列表仍为相对月份和9天前研究，未取得本轮新产品原始正文及日级首发证据，不新增事件。',
  18: 'DeepMind列表首项仍Genie4，其余仅月份精度，不据列表制造新日级事件。',
  22: 'NVIDIA官方RSS较09:00无新增链接；最新10月27日C-BRAIN认知疾病工具，未确认空间与设计重点领域新增公告。',
  23: 'OpenAI官方RSS较09:00无新增链接，最新Retell、Oracle和Check Point均已收录，未发现媒体科学突破说法的对应新原文。',
  24: 'Google AI官方RSS较09:00无新增链接，最新AI Quest为10月26日，未发现本轮新增合格事件。',
};
const parser = new XMLParser();
const feedComparisons = [];
for (const i of [21, 22, 23, 24]) {
  const readEntries = async directory => { const x = parser.parse(await readFile(directory + i + '.raw', 'utf8')); return x.rss?.channel?.item ?? x.feed?.entry ?? []; };
  const current = await readEntries(base), previous = await readEntries('data/dev/source-archives/audit-0900-2026-10-28/');
  const key = x => JSON.stringify(x.guid ?? x.id ?? x.link);
  const old = new Set(previous.map(key));
  const added = current.filter(x => !old.has(key(x))).map(x => ({ title: x.title, link: x.link, date: x.pubDate ?? x.published }));
  if (added.length) throw new Error('New feed entries require editorial review: ' + JSON.stringify(added));
  feedComparisons.push({ url: results[i].url, checkedAt: results[i].checkedAt, newEntries: added });
}
const reviews = Object.entries(observations).map(([index, contentExcerpt]) => {
  const r = results[Number(index)];
  if (!r.success) throw new Error('Cannot assert a failed fetch as reviewed: ' + index);
  const prior = manifest.verifiedSources.find(s => s.url === r.url);
  return { url: r.url, checkedAt: r.checkedAt, success: true, verification: 'verified', sourceClass: prior?.sourceClass ?? 'official', method: 'Independent original body/date review; feed discovery compared by stable URL with 09:00 snapshot', contentExcerpt, eventIds: prior?.eventIds ?? [], discoveryChecked: !(prior?.eventIds?.length), evidencePath: base + index + (Number(index) === 3 || Number(index) === 4 ? '.raw' : '.txt'), auditBatchId: 'ark-insight-12-00:2026-10-28' };
});
const webTime = new Date().toISOString();
const webObservations = {
  6: '10月27日OpenAI正文区分开发中的Oracle AI Workspace、组织权限与审批、三类Oracle产品方案及美国Marketplace采购；未将开发中能力写为已全面可用。',
  7: '10月27日客户案例：Retell报告9月月通话超过一亿；模型请求工具，平台执行并支持人工转接与服务冗余。规模及效果为客户报告，未独立复现。',
  8: '10月27日Check Point案例：漏洞研究已应用，Daybreak网络编排仍在开发；重大动作人审，小时到分钟为客户自述，非通用保证。',
};
for (const [index, contentExcerpt] of Object.entries(webObservations)) {
  const r = results[Number(index)], prior = manifest.verifiedSources.find(s => s.url === r.url);
  reviews.push({ url: r.url, checkedAt: webTime, success: true, verification: 'verified', sourceClass: 'official', method: 'web.open successful full official body and publication date read after direct HTTP403', contentExcerpt, eventIds: prior.eventIds, evidencePath: base + 'web-reviewed-excerpts.json', auditBatchId: 'ark-insight-12-00:2026-10-28' });
}
await writeFile(base + 'web-reviewed-excerpts.json', JSON.stringify({ checkedAt: webTime, reviews: reviews.filter(r => r.method.startsWith('web.open')) }, null, 2) + '\n');
await writeFile(base + 'feed-comparison.json', JSON.stringify(feedComparisons, null, 2) + '\n');
manifest.verifiedSources.push(...reviews);
manifest.audit1200 = { batchId: 'ark-insight-12-00:2026-10-28', checkedAt: new Date().toISOString(), noNewEvents: true, discoveryChecked: true, newEventIds: [], independentReviews: reviews.length, sourcesFetched: results.length, feedsCompared: feedComparisons.length, memene: { recordId: '167775517687152640', candidates: 22 }, notes: ['四个RSS/Atom较09:00无新链接；Codex新alpha仅版本号，不构造功能发布。', '3个OpenAI直接403，通过web实际读取完整正文和日期；其他未重读证据保留原核验时间。', '本次未新增合格事件；14条正式内容含3篇当天目录推荐，保留真实发表日和摘要级阅读边界；既有2条pending继续保留。'] };
await writeFile(path, JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest.audit1200, null, 2));
