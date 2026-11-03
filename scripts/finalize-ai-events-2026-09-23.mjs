import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { validateAiLatest, validatePaperCatalog } from './data-contract.mjs';

const readJson = async (path) => JSON.parse(await readFile(path, 'utf8'));
const date = '2026-09-23';
const ai = await readJson('data/dev/ai-events-latest.json');
const memene = await readJson('data/dev/memene-daily-latest.json');
const catalog = await readJson('data/dev/papers-catalog.json');
assert.equal(ai.asOf, date);
assert.equal(catalog.asOf, date);
assert.equal(memene.asOf, date);
assert.equal(memene.run.status, 'success');
assert.equal(memene.target.date, date);
assert.equal(memene.target.id, '155129036396298240');
assert.equal(memene.target.candidates.length, 19);

// arXiv first-submission dates, not the RSS announcement or recommendation date.
const publishedDates = {
  '2609.21712': '2026-09-18T12:49:01.000Z',
  '2609.20649': '2026-09-17T16:28:34.000Z',
  '2605.26880': '2026-05-26T11:41:10.000Z',
};
for (const [arxivId, publishedAt] of Object.entries(publishedDates)) {
  const event = ai.aiEvents.find((item) => item.paper?.paperUrl === `https://arxiv.org/abs/${arxivId}`);
  const paper = catalog.papers.find((item) => item.arxivId === arxivId);
  assert.ok(event && paper, `Missing verified paper ${arxivId}`);
  event.date = publishedAt.slice(0, 10);
  event.paper.publishedAt = publishedAt;
  paper.publishedAt = publishedAt;
}

const openai = ai.aiEvents.find((item) => item.id === 'ai-2026-09-23-openai-gpt-6-sol-luna');
openai.sources = openai.sources.filter((source) => !source.url.includes('/gpt-6-astra/'));
const announcement = 'https://openai.com/index/introducing-gpt-6-sol-and-luna/';
if (!openai.sources.some((source) => source.url === announcement)) {
  openai.sources.unshift({ label: 'OpenAI 官方发布公告', url: announcement });
}
// Keep only the architecture explicitly documented in the current technical post.
const transformers = ai.aiEvents.find((item) => item.id === 'ai-2026-09-23-transformers-gguf');
transformers.summary = transformers.summary.replace('Qwen3.5、Qwen3.8', 'Qwen3.5');

const mimo = {
  id: 'ai-2026-09-23-xiaomi-mimo-v2-6',
  date: '2026-09-22',
  contentKind: 'event',
  title: '小米发布 MiMo-V2.6 并开放模型权重，展示 3D 建模与具身仿真工作流',
  summary: '小米正式发布 MiMo-V2.6-Pro 与 Flash。官方模型卡覆盖文本、图像、视频、音频和百万 token 上下文，Pro-RL 权重标注 MIT 许可；发布页展示了 Blender 建模、交互式场景生成和机械臂闭环仿真案例。',
  whyItMatters: '对设计与物理 AI 工作流而言，多模态理解、代码生成和工具调用有望形成可本地验证的统一入口；这是基于官方演示的应用判断，尚不能等同于稳定的工程交付能力。',
  action: '优先复测参考图到 Blender 场景、资产可编辑性及多视角仿真任务，记录显存、成本、成功率和人工修正量；厂商榜单与演示效果需独立复核。',
  priority: 'A',
  boards: ['AI Product / Model Launch', 'AI 3D / World Models', 'AI Agent', 'AI Coding'],
  sourceType: 'official_announcement',
  verification: 'verified',
  entities: ['Xiaomi', 'MiMo-V2.6', 'MiMo-V2.6-Pro', 'MiMo-V2.6-Flash', 'Blender'],
  repoCandidates: [],
  sources: [
    { label: '小米官方发布公告（9 月 22 日）', url: 'https://mimo.xiaomi.com/mimo-v2-6/article' },
    { label: '小米官方 Hugging Face 模型卡', url: 'https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Pro-RL' },
  ],
  sourceReportId: 'ai-2026-09-23',
};
if (!ai.aiEvents.some((item) => item.id === mimo.id)) ai.aiEvents.unshift(mimo);

const generatedAt = new Date().toISOString();
ai.generatedAt = generatedAt;
ai.run.status = 'success';
ai.run.lastSuccess = generatedAt;
ai.run.message = '独立批次 wagmi-ai:2026-09-23 已恢复完成：早晨 Memene 结构化来源延迟，11:00 复采确认当日记录 155129036396298240、19 条候选；新增官方核验 MiMo-V2.6，正式收录 6 条行业事件与 3 篇论文推荐，修正 3 篇论文首次发布日期。已完成 10 篇中文解读；历史窗口 09-19 来源缺口仍保留，不伪装补齐。本次人工恢复不发送钉钉。';
catalog.generatedAt = generatedAt;
assert.deepEqual(validateAiLatest(ai), []);
assert.deepEqual(validatePaperCatalog(catalog), []);
await writeFile('data/dev/ai-events-latest.json', `${JSON.stringify(ai, null, 2)}\n`, 'utf8');
await writeFile('data/dev/papers-catalog.json', `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
console.log(JSON.stringify({ asOf: date, generatedAt, events: ai.aiEvents.length, paperDatesCorrected: Object.keys(publishedDates), sourceStatus: ai.run.status }, null, 2));
