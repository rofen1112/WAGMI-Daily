import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import ts from 'typescript';

const source = await readFile(new URL('../src/githubTaxonomy.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
});
const {
  classifyGithubRecord,
  githubTaxonomyLabel,
  matchesGithubTaxonomy,
  parseGithubTaxonomyKey,
} = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);

const project = (overrides) => ({
  name: 'Project',
  repo: 'owner/project',
  category: '',
  summary: '',
  priorityDomains: [],
  ...overrides,
});

test('GitHub taxonomy classifies projects by product capability instead of intake campaign', () => {
  assert.deepEqual(classifyGithubRecord(project({ name: 'OpenVLA', category: 'WAIC 物理 AI / VLA 与机器人基础模型', priorityDomains: ['physical-ai', 'vla', 'robot-learning'] })), ['physical-ai', 'robot-learning-control-data']);
  assert.deepEqual(classifyGithubRecord(project({ name: 'REST3D', category: '物理一致 3D', summary: '场景重建、碰撞纠正和重力沉降', priorityDomains: ['3d-reconstruction', 'simulation'] })), ['physical-ai', 'world-smart-space']);
  assert.deepEqual(classifyGithubRecord(project({ name: 'FreeCAD', category: '建筑 / AEC', summary: '参数化 CAD 与 BIM', priorityDomains: ['architecture-aec', 'design-tools'] })), ['design-tools']);
});

test('GitHub taxonomy keeps video subdirectories precise and readable', () => {
  const action = classifyGithubRecord(project({ category: '视频算法 / 动作识别', summary: '视频动作识别模型', priorityDomains: ['video-intelligence'] }));
  const timeline = classifyGithubRecord(project({ name: 'OpenTimelineIO', category: '视频自动剪辑 / 时间线', summary: 'timeline exchange API', priorityDomains: ['video-editing'] }));
  const rgba = classifyGithubRecord(project({ category: '视频生成 / RGBA 合成', summary: 'RGBA alpha compositing', priorityDomains: ['video-generation'] }));
  const human4d = classifyGithubRecord(project({ category: '视频算法 / 人体 4D', summary: 'human 4D motion capture', priorityDomains: ['video-intelligence', 'virtual-production'] }));

  assert.deepEqual(action, ['video-algorithms', 'action-recognition']);
  assert.deepEqual(timeline, ['video-editing', 'programmatic']);
  assert.deepEqual(rgba, ['video-generation', 'rgba-compositing']);
  assert.deepEqual(human4d, ['video-algorithms', 'human-4d']);
  assert.equal(githubTaxonomyLabel(action), '视频算法 / 动作识别');
});

test('GitHub taxonomy keeps image generation separate from design tools', () => {
  const path = classifyGithubRecord(project({
    name: 'SenseNova-U1',
    category: '生成模型 / 原生多模态理解与生成',
    priorityDomains: ['open-model', 'multimodal', 'image-generation'],
  }));

  assert.deepEqual(path, ['image-generation']);
  assert.equal(githubTaxonomyLabel(path), '图像生成');
});

test('GitHub taxonomy separates web data infrastructure capabilities', () => {
  const crawler = classifyGithubRecord(project({ name: 'Firecrawl', category: 'Agent 数据基础设施 / 网页采集与检索', priorityDomains: ['web-data'] }));
  const browser = classifyGithubRecord(project({ name: 'Stagehand', category: 'Agent 数据基础设施 / 浏览器执行', priorityDomains: ['browser-automation'] }));
  const research = classifyGithubRecord(project({ name: 'GPT Researcher', category: 'Agent 数据基础设施 / 深度研究', priorityDomains: ['deep-research'] }));
  const documentParser = classifyGithubRecord(project({ name: 'pdf-inspector', category: 'Agent 数据基础设施 / 文档解析与转换', priorityDomains: ['document-processing'] }));

  const hybridCrawler = classifyGithubRecord(project({ name: 'Crawlee', category: 'Agent 数据基础设施 / 网页采集与检索', priorityDomains: ['web-data', 'browser-automation'] }));

  assert.deepEqual(crawler, ['agent-data-infrastructure', 'web-crawling-search']);
  assert.deepEqual(hybridCrawler, ['agent-data-infrastructure', 'web-crawling-search']);
  assert.deepEqual(browser, ['agent-data-infrastructure', 'browser-execution']);
  assert.deepEqual(research, ['agent-data-infrastructure', 'deep-research']);
  assert.deepEqual(documentParser, ['agent-data-infrastructure', 'document-processing']);
  assert.equal(githubTaxonomyLabel(crawler), 'Agent 数据基础设施 / 网页采集与检索');
});
test('GitHub taxonomy accepts parent directory filters and rejects legacy flat values', () => {
  assert.deepEqual(parseGithubTaxonomyKey('physical-ai/world-smart-space'), ['physical-ai', 'world-smart-space']);
  assert.deepEqual(parseGithubTaxonomyKey('WAIC 物理 AI / 世界模型与空间智能'), []);
  assert.equal(matchesGithubTaxonomy(['physical-ai', 'world-smart-space'], ['physical-ai']), true);
  assert.equal(matchesGithubTaxonomy(['physical-ai', 'robot-learning-control-data'], ['world-model']), false);
});
