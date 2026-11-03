import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const aiPath = resolve(root, 'data/dev/ai-events-latest.json');
const memenePath = resolve(root, 'data/dev/memene-daily-latest.json');
const reportPath = resolve(root, 'reports/ai-events-2026-08-17.md');
const publicReportPath = resolve(root, 'public/reports/ai-events-2026-08-17.md');

const ai = JSON.parse(await readFile(aiPath, 'utf8'));
const memene = JSON.parse(await readFile(memenePath, 'utf8'));
if (memene.asOf !== '2026-08-17' || memene.run?.status !== 'success' || memene.target?.id !== '141683593578545152') {
  throw new Error(`Memene snapshot is not the verified 2026-08-17 record: ${memene.asOf} / ${memene.run?.status} / ${memene.target?.id}`);
}

const event = {
  id: 'ai-2026-08-17-deepseek-harness-v0-1',
  date: '2026-08-13',
  title: 'DeepSeek 开源 Harness v0.1 开发者预览版，以插件架构组装智能体运行时',
  summary: 'DeepSeek 发布并开源 DeepSeek Harness v0.1 开发者预览版。项目基于 Cordis 元框架，把模型、工具、Skill、会话、沙箱、文件系统、循环、编排与界面统一实现为可替换插件，并提供本地 Web UI 与源码运行路径。',
  whyItMatters: '它把智能体 Harness 从固定产品推进为可组合运行时，便于团队独立替换权限、沙箱、模型和编排层；但开发者预览明确存在破坏性兼容变更，暂不适合未经隔离直接用于生产。',
  action: '纳入 GitHub 强制候选，重点复核插件权限边界、沙箱默认值、长期会话稳定性、升级兼容性与第三方插件供应链风险。',
  priority: 'A',
  boards: ['AI Agent', 'AI Coding', 'Open Source / Ecosystem'],
  sourceType: 'official_project_release',
  verification: 'verified',
  entities: ['DeepSeek', 'DeepSeek Harness', 'Cordis'],
  repoCandidates: ['deepseek-ai/deepseek-harness'],
  sources: [
    { label: 'DeepSeek 官方仓库', url: 'https://github.com/deepseek-ai/deepseek-harness' },
    { label: 'DeepSeek 官方发布帖', url: 'https://x.com/deepseek_ai/status/2087887408440164663' },
    { label: 'Cordis 官方仓库', url: 'https://github.com/cordiverse/cordis' },
  ],
  sourceReportId: 'ai-2026-08-17',
};

const aiEvents = [event, ...(ai.aiEvents ?? []).filter((item) => item.id !== event.id)];
const generatedAt = new Date().toISOString();
const payload = {
  ...ai,
  generatedAt,
  asOf: '2026-08-17',
  aiEvents,
  run: {
    ...ai.run,
    lastSuccess: generatedAt,
    status: 'success',
    artifact: '/reports/ai-events-2026-08-17.md',
    message: 'Memene 已更新为 2026-08-17 exact-date success/current，七日窗口完整；二次审计新增 1 条经官方仓库与官方发布帖核验的事件，并保留其 2026-08-13 实际发布日期。arXiv RSS 抓取成功但本次无新增论文，不作为发布阻断项。',
  },
};

const paperSections = aiEvents.filter((item) => item.contentKind === 'paper').map((item) => `### ${item.priority}｜${item.title}\n\n${item.summary}\n\n- 论文日期：${item.date}\n- 重要性：${item.whyItMatters}\n- 建议动作：${item.action}\n- 来源：${item.sources.map((source) => `[${source.label}](${source.url})`).join('；')}`);
const report = `# ark.insight AI 大事件与前沿论文日报｜2026-08-17\n\n- 计划时间：每天 07:30（Asia/Shanghai）\n- 二次审计：${new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', dateStyle: 'short', timeStyle: 'short', hour12: false }).format(new Date())}（Asia/Shanghai）\n- 本次新增：1 条行业事件；保留 3 篇既有论文推荐\n- 运行状态：**success**\n- Source report ID：ai-2026-08-17\n\n## 一句话热点总览\n\nMemene 在首次采集后补齐了当日 32 条候选；复核后仅 DeepSeek Harness 是尚未收录且具有官方原始来源的高价值事件，其余重点项已在此前日报收录、早于窗口或缺少一手证据。\n\n## 来源核验\n\nMemene exact-date 记录为 \`141683593578545152\`，model/daily 数据为 2026-08-17，七日窗口完整。DeepSeek 官方仓库确认项目由 \`deepseek-ai\` 发布、采用 MIT 许可证、非 Fork、未归档，README 明确标注 developer preview、Cordis 插件架构和本地运行方式。GitHub 官方元数据记录仓库创建于 2026-08-13，因此事件日期保留为 8 月 13 日，不重标为今天。\n\n## 今日新增核验事件\n\n### A｜${event.title}\n\n${event.summary}\n\n- 事件日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${event.sources.map((source) => `[${source.label}](${source.url})`).join('；')}\n- GitHub 强制候选：\`deepseek-ai/deepseek-harness\`\n\n## 去重与排除\n\n- Qwen3.8、Gemini 3.7 Flash、GPT-5.6 Sol Ultrafast 与 Anthropic 水印说明已在 8 月 14–15 日日报收录，不重复计入。\n- 4D-WAM 的原始论文日期为 8 月 8 日；OpenWorker 更早已进入观察队列，均不重标为今日事件。\n- ScienceDiscovery、AutoDesign、WorkSwarm 等条目本次未定位到足够的一手官方材料，保留为发现线索，不作为正式结果。\n\n## 今日前沿论文\n\n${paperSections.join('\n\n')}\n\n## 通道状态\n\n- AI：2026-08-17，\`run.status=success\`\n- Memene：2026-08-17 success/current，七日窗口完整\n- arXiv：RSS 抓取成功，本次新增 0 篇，不视为失败\n- 自动发布：允许进入后续数据一致性与部署门禁\n`;

async function writeAtomic(path, content) {
  await mkdir(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, path);
}

await writeAtomic(aiPath, `${JSON.stringify(payload, null, 2)}\n`);
await writeAtomic(reportPath, report);
await writeAtomic(publicReportPath, report);
console.log(JSON.stringify({ asOf: payload.asOf, status: payload.run.status, aiEvents: payload.aiEvents.length, added: event.id }, null, 2));
