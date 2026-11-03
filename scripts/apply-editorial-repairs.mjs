import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { validateModelWatchlist } from './model-watchlist.mjs';
const root = process.cwd();
const read = async path => JSON.parse(await readFile(resolve(root, path), 'utf8'));
const date = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' }).format(new Date());
const now = new Date().toISOString();
const reviews = await read('paper-review-overrides.json');
const additions = await read(`data/dev/paper-editorial-repairs-${date}.json`);
for (const [id, review] of Object.entries(additions.reviews)) {
  reviews.reviews[id] = { ...reviews.reviews[id], ...review, reviewStatus: 'interpreted', readingLevel: 'abstract', reviewedAt: now };
}
await writeFile(resolve(root, 'paper-review-overrides.json'), JSON.stringify(reviews, null, 2) + '\n');
const models = await read('model-industry-watchlist.json');
// These four cards were read through the official web reader in this audit;
// direct HF API networking failed. No downloads or execution are performed.
for (const model of models.models) model.reviewedAt = date;
const identity = models.models.find(model => model.modelId === 'conradlocke/krea2-identity-edit');
identity.summaryZh = 'Krea 2 社区身份保持编辑 LoRA；官方模型卡当前推荐 v1.2，改善换景保真并支持参考图、局部重绘与扩图。';
identity.riskNoteZh = '社区而非 Krea 官方产品；多人身份、局部编辑与删除仍有误差。沿用 Krea Community 许可及商业收入门槛，不是无限制开源。';
const additionsModels = [
  { id: 'huggingface-francisring-prism', name: 'Prism Preview', modelId: 'FrancisRing/Prism', publisher: 'Prism / Tencent Hunyuan research team',
    relationship: 'official-derivative', releaseType: 'open-weight', license: 'MIT (模型卡声明；基础模型与组件需分别复核)',
    modalities: ['video','audio'], tasks: ['同步音视频生成','高分辨率视频研究'], priorityDomains: ['video-generation','virtual-production'],
    upstreamModels: ['MOVA-360p (仓库声明的基础检查点)'], relatedRepositories: [{ repo: 'Tencent-Hunyuan/Prism', url: 'https://github.com/Tencent-Hunyuan/Prism', roleZh: '作者发布的训练与推理代码' }],
    summaryZh: '动态稀疏注意力音视频联合生成研究的预览权重，模型卡与官方代码相互指向。',
    valueZh: '为同步音画与高分辨率内容生产提供可复核实验入口。',
    riskNoteZh: '预览版能力、演示真实性和基础模型许可应独立验证；模型卡 MIT 不应替代全部组件合规检查。', decisionReason: '作者代码与模型卡来源关系已核验，纳入观察而非宣称生产成熟。' },
  { id: 'huggingface-kandinskylab-kandinsky6-pro-distill', name: 'Kandinsky 6.0 Pro Distill', modelId: 'kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers', publisher: 'Kandinsky Lab',
    relationship: 'official-derivative', releaseType: 'open-weight', license: 'MIT (该检查点模型卡)', modalities: ['video','audio'], tasks: ['文生同步音视频','图生同步音视频'],
    priorityDomains: ['video-generation','virtual-production'], upstreamModels: ['kandinskylab/Kandinsky-6.0-Pro-5s-Diffusers'],
    relatedRepositories: [{ repo: 'kandinskylab/kandinsky-6', url: 'https://github.com/kandinskylab/kandinsky-6', roleZh: '官方推理与集成代码' }],
    summaryZh: '官方 Pro 蒸馏检查点，以十步采样生成约五秒同步音视频，支持文字与图像条件。',
    valueZh: '适合音画联合制作、工具集成和开放模型研究。',
    riskNoteZh: '设备耗时、显存和生成质量依检查点而异；超分组件单独处理，不能把演示或参数量当成功率。', decisionReason: '官方组织、模型卡与仓库相互链接，按开放权重观察收录。' },
];
for (const model of additionsModels) {
  const complete = { ...model, source: 'huggingface', url: `https://huggingface.co/${model.modelId}`, access: 'public', level: 'A', intakeDecision: 'observe', reviewedAt: date };
  const index = models.models.findIndex(current => current.modelId === model.modelId);
  if (index >= 0) models.models[index] = complete; else models.models.push(complete);
}
models.updatedAt = date;
const errors = validateModelWatchlist(models);
if (errors.length) throw new Error(errors.join('\n'));
await writeFile(resolve(root, 'model-industry-watchlist.json'), JSON.stringify(models, null, 2) + '\n');
console.log(JSON.stringify({ interpretedAdded: Object.keys(additions.reviews).length, modelsReviewed: models.models.length, date }));
