import type { GithubTrendCandidate, Project } from './types';

export interface GithubTaxonomyNode {
  value: string;
  label: string;
  children?: GithubTaxonomyNode[];
}

export const githubTaxonomy: GithubTaxonomyNode[] = [
  {
    value: 'world-model',
    label: '世界模型',
    children: [
      { value: '3dgs', label: '3DGS' },
      { value: '3d-parametric', label: '3D 参数化' },
      { value: '3dgs-physics', label: '3DGS 物理仿真' },
    ],
  },
  { value: 'design-tools', label: '设计工具' },
  { value: 'image-generation', label: '图像生成' },
  { value: 'multimodal-base', label: '多模态底座' },
  {
    value: 'physical-ai',
    label: '物理 AI',
    children: [
      { value: 'world-smart-space', label: '世界模型与智能空间' },
      { value: 'robot-learning-control-data', label: '机器人学习、控制与数据' },
    ],
  },
  {
    value: 'video-editing',
    label: '视频剪辑',
    children: [
      { value: 'programmatic', label: '视频程序化' },
      { value: 'content-production', label: '视频内容生成' },
    ],
  },
  {
    value: 'video-generation',
    label: '视频生成',
    children: [
      { value: 'long-video', label: '长视频' },
      { value: 'rgba-compositing', label: 'RGBA 合成' },
    ],
  },
  {
    value: 'video-algorithms',
    label: '视频算法',
    children: [
      { value: 'action-recognition', label: '动作识别' },
      { value: 'multimodal-understanding', label: '多模态理解' },
      { value: 'human-4d', label: '人体 4D' },
    ],
  },
  {
    value: 'video-stage',
    label: '视频舞台',
    children: [{ value: 'spatial-understanding', label: '空间理解' }],
  },
  {
    value: 'agent-data-infrastructure',
    label: 'Agent 数据基础设施',
    children: [
      { value: 'web-crawling-search', label: '网页采集与检索' },
      { value: 'browser-execution', label: '浏览器执行' },
      { value: 'deep-research', label: '深度研究' },
      { value: 'document-processing', label: '文档解析与转换' },
    ],
  },
  { value: 'agent-apps', label: 'Agent 应用' },
];

type TaxonomyRecord = Project | GithubTrendCandidate;

function domainValues(record: TaxonomyRecord) {
  return (record.priorityDomains ?? []).flatMap((domain) => (
    typeof domain === 'string' ? [domain] : [domain.id, domain.label]
  ));
}

function recordText(record: TaxonomyRecord) {
  const project = record as Project;
  const trend = record as GithubTrendCandidate;
  return [
    record.name,
    record.repo,
    project.summary,
    project.decisionReason,
    trend.description,
    ...(trend.topics ?? []),
    ...(trend.hotReasons ?? []),
    ...domainValues(record),
  ].filter(Boolean).join(' ').toLowerCase();
}

function sourceCategory(record: TaxonomyRecord) {
  return ('category' in record ? record.category : '').toLowerCase();
}

function includesAny(value: string, needles: string[]) {
  return needles.some((needle) => value.includes(needle));
}

export function classifyGithubRecord(record: TaxonomyRecord): string[] {
  const text = recordText(record);
  const category = sourceCategory(record);
  const domains = domainValues(record).map((value) => value.toLowerCase());
  const hasDomain = (...values: string[]) => values.some((value) => domains.includes(value));
  const hasText = (...values: string[]) => includesAny(text, values);
  const categoryHas = (...values: string[]) => includesAny(category, values);

  const isSimulation = hasDomain('simulation', 'robot-simulation', 'sim2real', 'synthetic-data')
    || hasText('simulation', 'simready', 'physics', 'physical consistency', '仿真', '物理一致', '碰撞', '重力');
  const isDesignTool = hasDomain('design-tools', 'architecture-aec')
    || categoryHas('设计工具', '建筑 / aec')
    || hasText('cad', 'bim', 'ifc', 'design editor', '设计编辑器', '参数化设计');

  if (categoryHas('视频 3d 舞台', '视频舞台')) {
    return ['video-stage', 'spatial-understanding'];
  }

  if (categoryHas('视频算法') || hasDomain('video-intelligence')) {
    if (categoryHas('动作识别') || hasText('action recognition', '动作识别')) return ['video-algorithms', 'action-recognition'];
    if (categoryHas('人体 4d', '4d 轨迹') || hasText('human 4d', '人体 4d', '4d human', 'smpl')) return ['video-algorithms', 'human-4d'];
    return ['video-algorithms', 'multimodal-understanding'];
  }

  if (categoryHas('视频自动剪辑', '视频编辑')) {
    if (categoryHas('程序化', '时间线') || hasText('ffmpeg', 'timeline', 'opentimelineio', '程序化')) return ['video-editing', 'programmatic'];
    return ['video-editing', 'content-production'];
  }

  if (categoryHas('视频生成')) {
    if (categoryHas('长视频') || hasText('long video', '长视频')) return ['video-generation', 'long-video'];
    if (categoryHas('rgba') || hasText('rgba', 'alpha compositing', '透明通道')) return ['video-generation', 'rgba-compositing'];
    return ['video-generation'];
  }

  if (hasDomain('virtual-production')) return ['video-stage', 'spatial-understanding'];

  if (hasDomain('video-editing')) {
    if (hasText('ffmpeg', 'timeline', 'opentimelineio', 'programmatic', '程序化')) return ['video-editing', 'programmatic'];
    return ['video-editing', 'content-production'];
  }
  if (hasDomain('video-generation')) {
    if (hasText('long video', '长视频')) return ['video-generation', 'long-video'];
    if (hasText('rgba', 'alpha compositing', '透明通道')) return ['video-generation', 'rgba-compositing'];
    return ['video-generation'];
  }

  if (hasDomain('image-generation')) return ['image-generation'];

  if (isDesignTool && !isSimulation) return ['design-tools'];

  if (hasDomain('3dgs') && isSimulation) return ['world-model', '3dgs-physics'];

  const isPhysicalAi = hasDomain(
    'physical-ai',
    'embodied-robotics',
    'vla',
    'robot-learning',
    'robot-control',
    'robot-simulation',
    'sim2real',
    'synthetic-data',
  ) || categoryHas('物理 ai', '仿真就绪', '物理一致', '物理场景', '仿真标准');

  if (isPhysicalAi) {
    const worldAndSpace = categoryHas('世界模型与空间智能')
      || hasDomain('world-model', 'spatial-intelligence', 'digital-twin')
      || (!hasDomain('vla', 'robot-learning', 'robot-control') && isSimulation);
    return worldAndSpace
      ? ['physical-ai', 'world-smart-space']
      : ['physical-ai', 'robot-learning-control-data'];
  }

  if (hasDomain('3dgs')) return ['world-model', '3dgs'];
  if (hasDomain('3d-reconstruction', '3d-generation', 'world-model', '3d')
    || categoryHas('3d', 'world models', '世界模型', '室内与空间', 'ai 3d')) {
    return ['world-model', '3d-parametric'];
  }

  if (isDesignTool || hasDomain('interior-design')) return ['design-tools'];

  if (categoryHas('网页采集与检索')) return ['agent-data-infrastructure', 'web-crawling-search'];
  if (categoryHas('浏览器执行')) return ['agent-data-infrastructure', 'browser-execution'];
  if (categoryHas('深度研究')) return ['agent-data-infrastructure', 'deep-research'];
  if (categoryHas('文档解析与转换')) return ['agent-data-infrastructure', 'document-processing'];
  if (categoryHas('agent 数据基础设施') || hasDomain('web-data', 'browser-automation', 'deep-research', 'document-processing')) {
    if (hasDomain('document-processing')) return ['agent-data-infrastructure', 'document-processing'];
    if (hasDomain('deep-research')) return ['agent-data-infrastructure', 'deep-research'];
    if (hasDomain('browser-automation')) return ['agent-data-infrastructure', 'browser-execution'];
    return ['agent-data-infrastructure', 'web-crawling-search'];
  }


  if (hasDomain('agent') || categoryHas('agent', 'ai coding', 'ai apps', 'ai security', 'ai productivity', 'ai visualization')) {
    return ['agent-apps'];
  }

  if (hasDomain('multimodal', 'open-model') || categoryHas('开放模型', '多模态')) return ['multimodal-base'];

  return ['multimodal-base'];
}

function findNode(path: string[]) {
  let nodes = githubTaxonomy;
  let current: GithubTaxonomyNode | undefined;
  for (const value of path) {
    current = nodes.find((node) => node.value === value);
    if (!current) return undefined;
    nodes = current.children ?? [];
  }
  return current;
}

export function githubTaxonomyKey(path: string[]) {
  return path.join('/');
}

export function parseGithubTaxonomyKey(value: string) {
  const path = value.split('/').filter(Boolean);
  return findNode(path) ? path : [];
}

export function githubTaxonomyLabel(path: string[]) {
  const labels: string[] = [];
  let nodes = githubTaxonomy;
  for (const value of path) {
    const node = nodes.find((item) => item.value === value);
    if (!node) break;
    labels.push(node.label);
    nodes = node.children ?? [];
  }
  return labels.join(' / ');
}

export function matchesGithubTaxonomy(recordPath: string[], selectedPath: string[]) {
  return selectedPath.length === 0 || selectedPath.every((value, index) => recordPath[index] === value);
}
