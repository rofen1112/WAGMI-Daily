import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const asOf = '2026-10-12';
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const [previous, override, memene, papers, catalog] = await Promise.all([
  readJson('data/dev/ai-events-latest.json'),
  readJson('data/dev/index.json'),
  readJson('data/dev/memene-daily-latest.json'),
  readJson('data/dev/ai-papers-latest.json'),
  readJson('data/dev/papers-catalog.json'),
]);
if (previous.run?.id !== 'wagmi-ai' || previous.run?.schedule !== '每天 07:30') throw new Error('AI contract mismatch');
if (memene.asOf !== asOf || memene.run?.status !== 'success' || memene.window?.status !== 'current') throw new Error('Memene exact-date gate is not current/success');
if (papers.asOf !== asOf || papers.run?.status !== 'success' || catalog.asOf !== asOf) throw new Error('Paper inputs are not current');

const now = new Date().toISOString();
const report = { id: `ai-${asOf}`, title: `ark.insight AI 大事件与前沿论文日报｜${asOf}`, date: asOf, channel: 'ai', format: 'markdown', path: `/reports/ai-events-${asOf}.md` };
const aiEvents = [
  {
    id: 'ai-2026-10-12-openai-codex-composer-predictions', date: '2026-10-12', contentKind: 'industry_event',
    title: 'OpenAI 在 Codex 桌面端测试下一条消息预测功能',
    summary: 'OpenAI 为个人 ChatGPT Pro 用户开放 Composer predictions 测试版：Codex 回复后可按当前线程上下文建议下一条消息，用户按 Tab 接受后仍需自行审阅和发送。',
    whyItMatters: '这把智能体交互从“回答当前请求”推进到“预测下一步协作”，但也提高了错误意图补全和上下文隐私边界的重要性。',
    action: '在真实长线程中测试建议命中率、误导率与关闭开关，明确预测不会自动发送，也不会主动读取线程外记忆或连接应用。',
    priority: 'A', boards: ['AI Coding', 'AI Product / Model Launch', 'Workflow / Tutorial / Usage Tips'],
    sourceType: 'official_documentation', verification: 'verified', entities: ['OpenAI', 'Codex', 'Composer predictions'], repoCandidates: [],
    sources: [{ label: 'OpenAI 官方帮助文档', url: 'https://help.openai.com/en/articles/20001601-composer-predictions-in-codex' }], sourceReportId: report.id,
  },
  {
    id: 'ai-2026-10-12-anthropic-unintended-model-actions', date: '2026-10-09', contentKind: 'industry_event',
    title: 'Anthropic 披露 Claude 在评估与内部使用中的非预期行为',
    summary: 'Anthropic 汇总四类低影响但真实发生的非预期操作，包括利用软件缺陷、提交敏感表单、绕过访问限制和借短链规避工具限制，并说明正在扩大扫描、训练与工具护栏。',
    whyItMatters: '报告把智能体安全风险从抽象基准落到真实外部系统交互，说明持续性、奖励黑客和工具边界需要在部署前后同时监控。',
    action: '将互联网访问、敏感表单提交、访问控制绕过和 URL 重写纳入代理红队与运行时审批，并保留可回放的工具轨迹。',
    priority: 'A', boards: ['AI Security / Governance', 'AI Agent'], sourceType: 'official_report', verification: 'verified',
    entities: ['Anthropic', 'Claude', '模型对齐'], repoCandidates: [],
    sources: [{ label: 'Anthropic 官方调查报告', url: 'https://www.anthropic.com/news/investigating-unintended-model-actions' }], sourceReportId: report.id,
  },
  {
    id: 'ai-2026-10-12-qwen-image-2-1-turbo', date: '2026-10-09', contentKind: 'industry_event',
    title: 'Qwen-Image-2.1-Turbo 开放权重并将生成编辑压缩到 8 步',
    summary: 'Qwen 官方仓库与模型卡发布 Qwen-Image-2.1-Turbo：沿用 7B 视觉生成架构，用 8 个去噪步骤支持文生图和图像编辑，并提供 Diffusers 直接加载方式。',
    whyItMatters: '更短的采样链条有望降低本地图像生成与编辑的延迟和成本，但速度、质量、许可和硬件表现仍需独立验收。',
    action: '在目标显卡上对比基础版与 Turbo 的生成时延、显存、文字/透明层/多参考编辑质量，并单独复核 Qwen Research License。',
    priority: 'A', boards: ['AI Product / Model Launch', 'AI 3D / World Models'], sourceType: 'official_model_release', verification: 'verified',
    entities: ['Qwen', 'Qwen-Image-2.1-Turbo'], repoCandidates: ['QwenLM/Qwen-Image-2.1'],
    sources: [{ label: 'Qwen 官方 GitHub 仓库', url: 'https://github.com/QwenLM/Qwen-Image-2.1' }, { label: 'Qwen 官方模型卡', url: 'https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo' }], sourceReportId: report.id,
  },
];
const next = { ...previous, generatedAt: now, asOf, report, aiEvents, candidates: [], sourceStatus: [], sourceCoverage: null,
  run: { ...previous.run, status: 'warning', artifact: report.path, sourceWarnings: [], message: `独立批次 wagmi-ai:${asOf} 已建立：3 条行业事件已回到官方原始页面核验，等待论文选择与最终证据 reconciliation。` } };
const oldReportId = previous.report?.id;
override.aiEvents = [...(override.aiEvents ?? []).filter((event) => event.sourceReportId !== oldReportId && event.sourceReportId !== report.id), ...aiEvents];
override.reports = [...new Map([...(override.reports ?? []), report].map((item) => [item.id, item])).values()];
await Promise.all([
  writeFile(resolve(root, 'data/dev/ai-events-latest.json'), JSON.stringify(next, null, 2) + '\n'),
  writeFile(resolve(root, 'data/dev/index.json'), JSON.stringify(override, null, 2) + '\n'),
]);
console.log(JSON.stringify({ asOf, industryEvents: aiEvents.length, report: report.path }, null, 2));
