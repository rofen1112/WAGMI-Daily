import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import { buildSkillSnapshot, inferSkillProfile } from '../scripts/discover-skills-trends.mjs';
import {
  buildCatalog,
  buildTrendingSnapshot,
  compareSkillTrend,
  flattenOfficialOwners,
  openDatabase,
  parseOfficialOwners,
  parseRepositorySkills,
  syncDatabase,
} from '../scripts/sync-skills-catalog.mjs';

test('skill profiles always provide Chinese explanations and scenarios', () => {
  const profile = inferSkillProfile({ name: 'browser-act', description: 'Browser automation for agents' });
  assert.equal(profile.category, '浏览器自动化');
  assert.match(profile.descriptionZh, /[\u4e00-\u9fff]/);
  assert.ok(profile.useCases.length >= 2);
  assert.ok(profile.useCases.every((item) => /[\u4e00-\u9fff]/.test(item)));
});

test('source-aware profiles prevent obvious new and trending skill misclassification', () => {
  const rbac = inferSkillProfile({ name: 'azure-rbac', description: 'Find the least privilege Azure role.' });
  assert.equal(rbac.category, '安全与合规');
  assert.match(rbac.descriptionZh, /最小权限/);

  const paper = inferSkillProfile({ name: 'deeppapernote', description: 'Generate a deep-reading note for a paper.' });
  assert.equal(paper.category, '文档与知识');
  assert.match(paper.descriptionZh, /论文/);

  const media = inferSkillProfile({ name: 'higgsfield-generate', description: 'Generate images, videos, 3D assets and audio.' });
  assert.equal(media.category, '图像与多媒体');
  assert.match(media.descriptionZh, /图片、视频、3D 资产和音频/);

  const productPhotos = inferSkillProfile({ name: 'higgsfield-product-photoshoot', description: 'Generate brand-quality product images.' });
  assert.equal(productPhotos.category, '电商与商品研究');
  assert.match(productPhotos.descriptionZh, /棚拍、生活方式、横幅、轮播和广告创意/);

  const soulId = inferSkillProfile({ name: 'higgsfield-soul-id', description: 'Train a Soul Character for identity-faithful generation.' });
  assert.equal(soulId.category, '图像与多媒体');
  assert.match(soulId.descriptionZh, /身份一致/);

  const kubernetes = inferSkillProfile({ name: 'kubernetes-patterns', description: 'Production-grade Kubernetes patterns.' });
  assert.equal(kubernetes.category, '云平台与运维');
  assert.match(kubernetes.descriptionZh, /Kubernetes/);

  const accessibility = inferSkillProfile({ name: 'better-accessibility', description: 'Accessibility engineering for product interfaces.' });
  assert.equal(accessibility.category, '沟通与可访问性');
  assert.match(accessibility.descriptionZh, /键盘操作、焦点、ARIA/);

  const twitter = inferSkillProfile({ name: 'twitter-automation', description: 'Post, schedule, like and retweet on X.' });
  assert.equal(twitter.category, '营销与增长');
  assert.match(twitter.descriptionZh, /发帖、排期、互动/);

  const telemetry = inferSkillProfile({ name: 'clickstack-otel-collector', description: 'Wire an OpenTelemetry collector into Managed ClickStack.' });
  assert.equal(telemetry.category, '云平台与运维');
  assert.match(telemetry.descriptionZh, /OpenTelemetry Collector/);

  const policy = inferSkillProfile({ name: 'platform-policy-rule-generate', description: 'Author Salesforce PolicyRuleDefinition metadata XML.' });
  assert.equal(policy.category, '安全与合规');
  assert.match(policy.descriptionZh, /治理策略/);

  const marketplaceCards = inferSkillProfile({ name: 'higgsfield-marketplace-cards', description: 'Generate marketplace product image cards.' });
  assert.equal(marketplaceCards.category, '电商与商品研究');
  assert.match(marketplaceCards.descriptionZh, /合规主图/);

  const holderAnalysis = inferSkillProfile({ name: 'gmgn-holder-analysis', description: 'Token holder chip analysis.' });
  assert.equal(holderAnalysis.category, '金融与市场数据');
  assert.match(holderAnalysis.descriptionZh, /持有者结构/);

  const competitorAds = inferSkillProfile({ name: 'competitor-ad-intelligence', description: 'Analyze competitor paid ads.' });
  assert.equal(competitorAds.category, '营销与增长');
  assert.match(competitorAds.descriptionZh, /付费广告/);

  const groundcover = inferSkillProfile({ name: 'groundcover-cli', description: 'Manage groundcover dashboards and monitors.' });
  assert.equal(groundcover.category, '云平台与运维');
  assert.match(groundcover.descriptionZh, /可观测性资源/);

  const crmQuality = inferSkillProfile({ name: 'crm-data-quality', description: 'Find incomplete HubSpot records and normalize values.' });
  assert.equal(crmQuality.category, '销售与 CRM');
  assert.match(crmQuality.descriptionZh, /字段不完整/);

  const presentation = inferSkillProfile({ name: 'popai-powerpoint-pptx', description: 'Create presentations using PopAI API.' });
  assert.equal(presentation.category, '演示文稿');
  assert.match(presentation.descriptionZh, /PopAI API/);

  const hyperframes = inferSkillProfile({ name: 'remotion-to-hyperframes', description: 'Port a Remotion composition to HyperFrames HTML.' });
  assert.equal(hyperframes.category, '图像与多媒体');
  assert.match(hyperframes.descriptionZh, /Remotion React composition/);

  const fiveDive = inferSkillProfile({ name: '5dive-cli', description: 'Manage sibling agents on a 5dive runtime VM.' });
  assert.equal(fiveDive.category, '多 Agent 编排');
  assert.match(fiveDive.descriptionZh, /共享任务队列/);

  const openAgent = inferSkillProfile({ name: 'openagent', description: 'Author an OpenAgent persona and trading card.' });
  assert.equal(openAgent.category, 'Agent 身份与展示');
  assert.match(openAgent.descriptionZh, /holo 身份卡/);
});

test('skill snapshot preserves leaderboard order and source evidence', () => {
  const snapshot = buildSkillSnapshot({
    asOf: '2026-07-17',
    generatedAt: '2026-07-17T07:40:00+08:00',
    rows: [
      { source: 'owner/skills', skillId: 'browser-tool', name: 'browser-tool', installs: 12, installsYesterday: 5, change: 7 },
      { source: 'owner/skills', skillId: 'ui-review', name: 'ui-review', installs: 10, installsYesterday: 9, change: 1 },
    ],
    metadata: [
      { description: 'Browser automation', totalInstalls: 100, url: 'https://skills.sh/owner/skills/browser-tool', metadataStatus: 'success' },
      { description: 'Review UI design quality', totalInstalls: 80, url: 'https://skills.sh/owner/skills/ui-review', metadataStatus: 'success' },
    ],
  });
  assert.deepEqual(snapshot.skills.map((skill) => skill.rank), [1, 2]);
  assert.equal(snapshot.skills[0].change, 7);
  assert.equal(snapshot.skills[0].sourceReportId, 'skills-2026-07-17');
  assert.equal(snapshot.run.channel, 'skills');
});

test('official page payload is parsed and flattened without executing page content', () => {
  const owners = [{ owner: 'maker', repos: [{ repo: 'maker/skills', skills: [{ name: 'official-tool', installs: 12 }] }] }];
  const escaped = JSON.stringify(owners).replaceAll('"', '\\"');
  const parsed = parseOfficialOwners(`<script>self.__next_f.push([1,"\\"data\\":{\\"owners\\":${escaped},\\"totalOwners\\":1"])</script>`);
  assert.deepEqual(parsed, owners);
  assert.deepEqual(flattenOfficialOwners(parsed)[0], {
    id: 'maker/skills/official-tool', owner: 'maker', source: 'maker/skills', skillId: 'official-tool',
    name: 'official-tool', installs: 12, totalInstalls: 12, isOfficial: true,
  });
});

test('official display names are normalized to leaderboard slugs', () => {
  const [skill] = flattenOfficialOwners([{ owner: 'maker', repos: [{ repo: 'maker/skills', skills: [{ name: 'Agent Development', installs: 3 }] }] }]);
  assert.equal(skill.id, 'maker/skills/Agent-Development');
  assert.equal(skill.skillId, 'Agent-Development');
  assert.equal(skill.name, 'Agent Development');
});

test('catalog merges all-time and official rows into unique Chinese records', () => {
  const officialRows = [
    { id: 'maker/skills/ui-review', owner: 'maker', source: 'maker/skills', skillId: 'ui-review', name: 'ui-review', installs: 8, isOfficial: true },
    { id: 'maker/skills/ui-review', owner: 'maker', source: 'maker/skills', skillId: 'ui-review', name: 'ui-review', installs: 8, isOfficial: true },
  ];
  const catalog = buildCatalog({
    asOf: '2026-07-17', generatedAt: '2026-07-17T07:40:00+08:00', officialOwnerCount: 1, officialRows,
    allTimeRows: [
      { source: 'maker/skills', skillId: 'ui-review', name: 'ui-review', installs: 80 },
      { source: 'community/skills', skillId: 'browser-tool', name: 'browser-tool', installs: 40 },
    ],
  });
  assert.equal(catalog.skills.length, 2);
  assert.equal(catalog.stats.officialSkills, 1);
  assert.equal(catalog.stats.sourceOfficialRows, 2);
  assert.ok(catalog.skills.every((skill) => /[\u4e00-\u9fff]/.test(skill.descriptionZh)));
  assert.ok(catalog.skills.every((skill) => skill.useCases.length >= 2));
});

test('domain-hosted skills use the public site detail route and keep stable identities', () => {
  const catalog = buildCatalog({
    asOf: '2026-10-26', officialRows: [],
    allTimeRows: [
      { source: 'smithery.ai', skillId: 'pptx', name: 'pptx', installs: 915 },
      { source: 'anthropics/skills', skillId: 'pptx', name: 'pptx', installs: 1000 },
    ],
  });
  const hosted = catalog.skills.find(skill => skill.source === 'smithery.ai');
  const repository = catalog.skills.find(skill => skill.source === 'anthropics/skills');
  assert.equal(hosted.id, 'smithery.ai/pptx');
  assert.equal(hosted.url, 'https://skills.sh/site/smithery.ai/pptx');
  assert.equal(hosted.installUrl, null);
  assert.equal(repository.url, 'https://skills.sh/anthropics/skills/pptx');
});

test('repository page expansion discovers skills omitted by the leaderboard', () => {
  const html = `
    <a href="/emilkowalski/skills/emil-design-eng"><h3>emil-design-eng</h3><span>144.0K</span></a>
    <a href="/emilkowalski/skills/review-animations"><h3>review-animations</h3><span>41.9K</span></a>
  `;
  assert.deepEqual(parseRepositorySkills(html, 'emilkowalski/skills'), [
    { id: 'emilkowalski/skills/emil-design-eng', source: 'emilkowalski/skills', skillId: 'emil-design-eng', name: 'emil-design-eng', installs: 144000, totalInstalls: 144000 },
    { id: 'emilkowalski/skills/review-animations', source: 'emilkowalski/skills', skillId: 'review-animations', name: 'review-animations', installs: 41900, totalInstalls: 41900 },
  ]);
});

test('catalog merges Hot comparisons into expanded repository records', () => {
  const catalog = buildCatalog({
    asOf: '2026-07-17', generatedAt: '2026-07-17T07:40:00+08:00', officialRows: [],
    allTimeRows: [{ source: 'emilkowalski/skills', skillId: 'review-animations', name: 'review-animations', installs: 41800 }],
    expandedRows: [{ id: 'emilkowalski/skills/emil-design-eng', source: 'emilkowalski/skills', skillId: 'emil-design-eng', name: 'emil-design-eng', installs: 144000, totalInstalls: 144000 }],
    hotRows: [{ source: 'emilkowalski/skills', skillId: 'emil-design-eng', name: 'emil-design-eng', installs: 97, installsYesterday: 145, change: -48 }],
  });
  const skill = catalog.skills.find((item) => item.skillId === 'emil-design-eng');
  assert.equal(skill.totalInstalls, 144000);
  assert.equal(skill.hourInstalls, 97);
  assert.equal(skill.installsYesterday, 145);
  assert.equal(skill.change, -48);
});

test('catalog retains skills discovered only through Trending', () => {
  const catalog = buildCatalog({
    asOf: '2026-07-28',
    generatedAt: '2026-07-28T07:40:00+08:00',
    officialRows: [],
    allTimeRows: [],
    trendingRows: [{ source: 'larksuite/cli', skillId: 'lark-shared', name: 'lark-shared', installs: 1600 }],
  });
  assert.equal(catalog.skills.length, 1);
  assert.equal(catalog.skills[0].id, 'larksuite/cli/lark-shared');
});

test('cumulative catalog retains missing skills and waits three daily checks before review', async () => {
  const root = await mkdtemp(join(tmpdir(), 'skills-catalog-'));
  const database = openDatabase(join(root, 'catalog.sqlite'));
  const makeCatalog = (asOf, rows) => buildCatalog({
    asOf,
    generatedAt: `${asOf}T07:40:00+08:00`,
    officialRows: [],
    allTimeRows: rows,
  });
  const firstRows = [
    { source: 'owner/skills', skillId: 'kept', name: 'kept', installs: 10 },
    { source: 'owner/skills', skillId: 'temporarily-missing', name: 'temporarily-missing', installs: 8 },
  ];

  try {
    const initial = syncDatabase(database, makeCatalog('2026-07-28', firstRows), [], []);
    assert.equal(initial.stats.newSkills, 2);
    const repeatedInitialDay = syncDatabase(database, makeCatalog('2026-07-28', firstRows.slice(0, 1)), [], []);
    assert.equal(repeatedInitialDay.stats.newSkills, 2);
    syncDatabase(database, makeCatalog('2026-07-28', firstRows), [], []);
    const dayOne = syncDatabase(database, makeCatalog('2026-07-29', firstRows.slice(0, 1)), [], []);
    let missing = dayOne.skills.find((skill) => skill.skillId === 'temporarily-missing');
    assert.equal(dayOne.skills.length, 2);
    assert.equal(missing.availabilityStatus, 'monitoring');
    assert.equal(missing.missingRuns, 1);

    const repeatedSameDay = syncDatabase(database, makeCatalog('2026-07-29', firstRows.slice(0, 1)), [], []);
    missing = repeatedSameDay.skills.find((skill) => skill.skillId === 'temporarily-missing');
    assert.equal(missing.missingRuns, 1);

    syncDatabase(database, makeCatalog('2026-07-30', firstRows.slice(0, 1)), [], []);
    const dayThree = syncDatabase(database, makeCatalog('2026-07-31', firstRows.slice(0, 1)), [], []);
    missing = dayThree.skills.find((skill) => skill.skillId === 'temporarily-missing');
    assert.equal(missing.availabilityStatus, 'needs_review');
    assert.equal(missing.missingRuns, 3);
    assert.equal(dayThree.stats.totalSkills, 2);
    assert.equal(dayThree.stats.activeSkills, 1);
    assert.equal(dayThree.stats.needsReviewSkills, 1);

    const reappeared = syncDatabase(database, makeCatalog('2026-08-01', firstRows), [], []);
    missing = reappeared.skills.find((skill) => skill.skillId === 'temporarily-missing');
    assert.equal(missing.availabilityStatus, 'active');
    assert.equal(missing.missingRuns, 0);
    assert.equal(reappeared.stats.needsReviewSkills, 0);
  } finally {
    database.close();
    await rm(root, { recursive: true, force: true });
  }
});

test('daily Skill heat compares 24h installs and ranks even outside the Hot subset', () => {
  assert.deepEqual(compareSkillTrend(
    { rank: 2, trendInstalls: 150 },
    { rank: 5, trendInstalls: 100, hotRank: 8 },
  ), {
    previousTrendInstalls: 100,
    trendInstallChange: 50,
    previousRank: 5,
    rankChange: 3,
    trendStatus: 'up',
    previousHotRank: 8,
    hotRankChange: null,
    hotStatus: 'exited',
  });
});

test('trending snapshot stores previous-day heat movement for every comparable row', () => {
  const catalog = buildCatalog({
    asOf: '2026-07-18', generatedAt: '2026-07-18T07:40:00+08:00', officialRows: [],
    allTimeRows: [{ source: 'owner/skills', skillId: 'design-tool', name: 'design-tool', installs: 1000 }],
  });
  const snapshot = buildTrendingSnapshot({
    asOf: '2026-07-18', generatedAt: '2026-07-18T07:40:00+08:00', catalog,
    rows: [{ source: 'owner/skills', skillId: 'design-tool', name: 'design-tool', installs: 130 }],
    metadata: [{ description: 'Design automation', totalInstalls: 1000, url: 'https://skills.sh/owner/skills/design-tool', metadataStatus: 'success' }],
    previousSnapshot: { asOf: '2026-07-17', skills: [{ id: 'owner/skills/design-tool', rank: 4, trendInstalls: 80 }] },
  });
  assert.equal(snapshot.skills[0].trendInstallChange, 50);
  assert.equal(snapshot.skills[0].rankChange, 3);
  assert.equal(snapshot.skills[0].hotStatus, 'not_hot');
  assert.equal(snapshot.comparison.comparableSkills, 1);
  assert.equal(snapshot.sourceStatus.find((source) => source.id === 'skills-sh-hot').status, 'failed');
  assert.equal(snapshot.sourceStatus.find((source) => source.id === 'skills-sh-detail').status, 'success');
  assert.equal(snapshot.run.status, 'warning');
  assert.match(snapshot.run.message, /Hot/);
});
