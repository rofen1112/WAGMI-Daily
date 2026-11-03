import { Button, Cascader, Drawer, Empty, Pagination, Segmented, Select, Table, Tag, type TableColumnsType } from 'antd';
import ImeSafeSearchInput from '../components/ImeSafeSearchInput';
import { formatDate, formatNumber } from '../data';
import {
  classifyGithubRecord,
  githubTaxonomy,
  githubTaxonomyKey,
  githubTaxonomyLabel,
  matchesGithubTaxonomy,
  parseGithubTaxonomyKey,
} from '../githubTaxonomy';
import type { GithubTrendCandidate, Project, Snapshot } from '../types';

interface GithubRadarPageProps {
  snapshot: Snapshot;
  params: URLSearchParams;
  isAdmin: boolean;
  followed: Set<string>;
  updateParams: (patch: Record<string, string | undefined | null>) => void;
  toggleFollow: (projectId: string) => void;
}

type GithubView = 'priority' | 'tracked' | 'trending';

const verificationLabels = {
  verified: '精确仓库',
  related_official: '官方相关',
};

const priorityDomainLabels: Record<string, string> = {
  'architecture-aec': '建筑 / AEC',
  'interior-design': '室内设计',
  '3d-reconstruction': '3D 重建',
  '3dgs': '3DGS',
  'design-tools': '设计工具',
  'image-generation': '生成式图像模型',
  'open-model': '开放模型',
  simulation: '物理一致 / SimReady',
  'physical-ai': 'WAIC 物理 AI',
  'embodied-robotics': '具身机器人',
  vla: 'VLA / 机器人基础模型',
  'world-model': '世界模型',
  'robot-simulation': '机器人仿真',
  sim2real: 'Sim2Real',
  'synthetic-data': '合成数据',
  'robot-learning': '机器人学习',
  'robot-control': '机器人控制',
  'digital-twin': '工业数字孪生',
  'ai-benchmark': 'AI 评测',
  'video-intelligence': '视频算法 / 理解',
  'video-generation': '视频生成模型',
  'video-editing': '视频生成 / 自动剪辑',
  'virtual-production': '视频 3D 舞台',
  'web-data': '网页采集与检索',
  'browser-automation': '浏览器执行',
  'deep-research': '深度研究',
  'document-processing': '文档解析与转换',
};

const hotLevelLabels = {
  surging: '快速上升',
  hot: '热门',
  watch: '观察',
};

const hotLevelColors = {
  surging: 'red',
  hot: 'volcano',
  watch: 'default',
} as const;

const sourceSignalLabels: Record<string, string> = {
  'industry-watchlist': '行业清单',
  tracked: '正式跟踪',
  'github-simready-active': 'SimReady 检索',
  'github-3d-active': '3D 活跃项目',
  'github-3d-generation-active': '3D 生成项目',
  'github-3dgs-active': '3DGS 项目',
  'github-aec-design-active': '建筑与设计',
  'github-interior-design-active': '室内设计',
  'github-open-model-new': '开放模型',
  'github-image-generation-active': '生成式图像模型',
  'github-ai-new': '新 AI 项目',
  'github-ai-active': 'AI 活跃项目',
  'github-agent-active': 'Agent 活跃项目',
  'github-video-intelligence-active': '视频算法项目',
  'github-video-generation-active': '视频生成模型',
  'github-video-editing-active': '视频剪辑项目',
  'github-video-3d-stage-active': '视频 3D 舞台项目',
  'github-video-2026-new': '2026 视频新项目',
  'github-web-data-active': '网页采集与检索',
  'github-browser-automation-active': '浏览器执行项目',
  'github-deep-research-active': '深度研究项目',
  'github-document-processing-active': '文档解析项目',
  'github-physical-ai-active': '物理 AI 活跃项目',
  'github-vla-robotics-active': 'VLA 机器人项目',
  'github-robot-simulation-active': '机器人仿真项目',
  'ossinsight-24h-all': 'OSS Insight 24h',
  'ossinsight-24h-python': 'OSS Insight Python',
  'ossinsight-24h-typescript': 'OSS Insight TypeScript',
  'ossinsight-weekly-all': 'OSS Insight 周榜',
  'github-trending-24h-all': 'GitHub 当日榜',
  'github-trending-24h-python': 'GitHub Python 当日榜',
  'github-trending-24h-typescript': 'GitHub TypeScript 当日榜',
  'github-trending-weekly-all': 'GitHub 周榜',
};

function sortedProjects(projects: Project[], sort: string) {
  return [...projects].sort((a, b) => {
    if (sort === 'stars') return b.stars - a.stars;
    if (sort === 'activity') return b.lastActivity.localeCompare(a.lastActivity);
    if (sort === 'name') return a.name.localeCompare(b.name, 'zh-CN');
    if (sort === 'priority') return Number(Boolean(b.industryFit)) - Number(Boolean(a.industryFit)) || b.lastActivity.localeCompare(a.lastActivity);
    return b.starsDelta - a.starsDelta || Number(Boolean(b.industryFit)) - Number(Boolean(a.industryFit)) || b.stars - a.stars;
  });
}

function sortedTrends(candidates: GithubTrendCandidate[], sort: string) {
  return [...candidates].sort((left, right) => {
    if (sort === 'daily') return right.periodStars24h - left.periodStars24h || right.hotScore - left.hotScore;
    if (sort === 'weekly') return right.periodStarsWeekly - left.periodStarsWeekly || right.hotScore - left.hotScore;
    if (sort === 'stars') return right.totalStars - left.totalStars;
    if (sort === 'activity') return right.pushedAt.localeCompare(left.pushedAt);
    if (sort === 'name') return left.name.localeCompare(right.name, 'zh-CN');
    return right.hotScore - left.hotScore || right.periodStars24h - left.periodStars24h || right.totalStars - left.totalStars;
  });
}

function matchesText(values: Array<string | undefined | null>, query: string) {
  return !query || values.join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

function TaxonomyCell({ path }: { path: string[] }) {
  const labels = githubTaxonomyLabel(path).split(' / ');
  return (
    <div className="taxonomy-cell">
      <span>{labels[0]}</span>
      {labels[1] && <small>{labels[1]}</small>}
    </div>
  );
}

export default function GithubRadarPage({ snapshot, params, isAdmin, followed, updateParams, toggleFollow }: GithubRadarPageProps) {
  const view = (['priority', 'tracked', 'trending'].includes(params.get('view') ?? '') ? params.get('view') : 'priority') as GithubView;
  const query = params.get('q') ?? '';
  const categoryPath = parseGithubTaxonomyKey(params.get('category') ?? '');
  const level = params.get('level') ?? '';
  const sort = params.get('sort') ?? (view === 'trending' ? 'trend' : 'priority');
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = 30;
  const trends = snapshot.githubTrends ?? [];
  const priorityCount = snapshot.projects.filter((project) => project.industryFit === 'high').length;
  const selected = view !== 'trending' ? snapshot.projects.find((project) => project.id === params.get('project')) : undefined;
  const selectedTrend = view === 'trending' ? trends.find((candidate) => candidate.repo === params.get('trend')) : undefined;
  const projectSource = view === 'priority' ? snapshot.projects.filter((project) => project.industryFit === 'high') : snapshot.projects;
  const projectLevels = [...new Set(projectSource.map((project) => project.level))].sort();
  const projectTaxonomy = new Map(projectSource.map((project) => [project.id, classifyGithubRecord(project)]));
  const trendTaxonomy = new Map(trends.map((candidate) => [candidate.repo, classifyGithubRecord(candidate)]));
  const projects = sortedProjects(projectSource
    .filter((project) => matchesText([project.name, project.repo, project.summary, githubTaxonomyLabel(projectTaxonomy.get(project.id) ?? []), ...(project.priorityDomains ?? [])], query))
    .filter((project) => matchesGithubTaxonomy(projectTaxonomy.get(project.id) ?? [], categoryPath))
    .filter((project) => !level || project.level === level), sort);
  const trendCandidates = sortedTrends(trends
    .filter((candidate) => matchesText([
      candidate.name,
      candidate.repo,
      candidate.description,
      candidate.language,
      ...(candidate.topics ?? []),
      ...candidate.priorityDomains.map((domain) => domain.label),
      ...candidate.hotReasons,
    ], query))
    .filter((candidate) => matchesGithubTaxonomy(trendTaxonomy.get(candidate.repo) ?? [], categoryPath))
    .filter((candidate) => !level || candidate.hotLevel === level), sort);
  const totalRows = view === 'trending' ? trendCandidates.length : projects.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, pageCount);
  const pageStart = (safePage - 1) * pageSize;
  const visibleProjects = projects.slice(pageStart, pageStart + pageSize);
  const visibleTrends = trendCandidates.slice(pageStart, pageStart + pageSize);
  const report = selected ? snapshot.reports.find((item) => item.id === selected.sourceReportId) : undefined;
  const localReport = isAdmin && selected
    ? snapshot.localReports?.find((item) => item.projectRepo.toLowerCase() === selected.repo.toLowerCase())
    : undefined;

  const changeView = (next: string | number) => {
    const target = String(next) as GithubView;
    updateParams({
      view: target === 'priority' ? undefined : target,
      q: undefined,
      category: undefined,
      level: undefined,
      sort: undefined,
      page: undefined,
      project: undefined,
      trend: undefined,
    });
  };

  const projectColumns: TableColumnsType<Project> = [
    {
      title: '项目',
      key: 'project',
      width: 260,
      render: (_, project) => (
        <div className="project-cell">
          <div><strong>{project.name}</strong>{project.trackingStatus === 'delisted' && <Tag>已下架 · {formatDate(project.delistedAt ?? '')}</Tag>}{project.industryFit === 'high' && <Tag color="red">行业优先</Tag>}</div>
          <a href={project.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{project.repo}</a>
        </div>
      ),
    },
    { title: '项目目录', key: 'taxonomy', width: 180, render: (_, project) => <TaxonomyCell path={projectTaxonomy.get(project.id) ?? []} /> },
    {
      title: '等级',
      key: 'level',
      width: 100,
      render: (_, project) => <div className="level-cell"><Tag color={project.level.includes('A') ? 'green' : 'blue'}>{project.level}</Tag><small>{project.levelChange}</small></div>,
    },
    { title: 'Stars', dataIndex: 'stars', key: 'stars', width: 110, align: 'right', render: (value: number) => formatNumber(value) },
    { title: '快照增量', dataIndex: 'starsDelta', key: 'starsDelta', width: 90, align: 'right', render: (value: number, project) => project.trackingStatus === 'delisted' ? <span>—</span> : <strong className="positive" title={project.starsDeltaWindowStart ? `${project.starsDeltaWindowStart} 至 ${project.starsDeltaWindowEnd}，不是固定 24h` : '没有可比历史基线时不估算增量'}>+{formatNumber(value)}</strong> },
    { title: '活动', dataIndex: 'lastActivity', key: 'lastActivity', width: 120, render: (value: string, project) => project.trackingStatus === 'delisted' ? `下架 ${formatDate(project.delistedAt ?? '')}` : formatDate(value) },
    ...(isAdmin ? [{
      title: '关注', key: 'follow', width: 90, fixed: 'right' as const,
      render: (_: unknown, project: Project) => (
        <Button size="small" type={followed.has(project.id) ? 'primary' : 'default'} onClick={(event) => { event.stopPropagation(); toggleFollow(project.id); }}>
          {followed.has(project.id) ? '已关注' : '关注'}
        </Button>
      ),
    }] : []),
  ];

  const trendColumns: TableColumnsType<GithubTrendCandidate> = [
    {
      title: '候选项目',
      key: 'candidate',
      width: 260,
      render: (_, candidate) => (
        <div className="project-cell">
          <div>
            <strong>{candidate.name}</strong>
            <Tag color={hotLevelColors[candidate.hotLevel]}>{hotLevelLabels[candidate.hotLevel]}</Tag>
            {candidate.tracked && <Tag color="green">已跟踪</Tag>}
          </div>
          <a href={candidate.url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>{candidate.repo}</a>
        </div>
      ),
    },
    {
      title: '候选判断',
      key: 'description',
      width: 340,
      render: (_, candidate) => <p className="trend-summary">{candidate.description || candidate.hotReasons[0]}</p>,
    },
    {
      title: '项目目录',
      key: 'taxonomy',
      width: 190,
      render: (_, candidate) => <TaxonomyCell path={trendTaxonomy.get(candidate.repo) ?? []} />,
    },
    { title: '日榜增星', dataIndex: 'periodStars24h', key: 'daily', width: 100, align: 'right', render: (value: number) => <strong className="positive">+{formatNumber(value)}</strong> },
    { title: '7d 增星', dataIndex: 'periodStarsWeekly', key: 'weekly', width: 100, align: 'right', render: (value: number) => `+${formatNumber(value)}` },
    { title: 'Stars', dataIndex: 'totalStars', key: 'stars', width: 100, align: 'right', render: (value: number) => formatNumber(value) },
    { title: '活动', dataIndex: 'pushedAt', key: 'activity', width: 120, render: (value: string) => formatDate(value) },
  ];

  const viewHeading = view === 'trending'
    ? { eyebrow: 'Trend candidates', title: '趋势候选' }
    : view === 'tracked'
      ? { eyebrow: 'Tracked repositories', title: '正式跟踪项目' }
      : { eyebrow: 'Industry priority', title: '行业优先项目' };

  return (
    <div className="page-stack github-radar-page">
      <section className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Repository intelligence</p>
          <h1>GitHub Radar</h1>
          <p className="lead">用仓库身份、活跃度、增长和行业价值判断项目，不把 Stars 单独当作质量。</p>
        </div>
        <div className="as-of-group">
          <span>更新至 {formatDate(snapshot.asOf.github)}</span>
          <span>{formatNumber(snapshot.projects.length)} 正式跟踪 · {formatNumber(trends.length)} 趋势候选</span>
        </div>
      </section>

      <section className="github-view-switch" aria-label="GitHub 浏览方式">
        <Segmented
          block
          value={view}
          options={[
            { label: `行业优先 ${formatNumber(priorityCount)}`, value: 'priority' },
            { label: `正式跟踪 ${formatNumber(snapshot.projects.length)}`, value: 'tracked' },
            { label: `趋势候选 ${formatNumber(trends.length)}`, value: 'trending' },
          ]}
          onChange={changeView}
        />
      </section>

      <section className="filter-bar" aria-label="GitHub 项目筛选">
        <ImeSafeSearchInput
          className="filter-search"
          allowClear
          placeholder={view === 'trending' ? '搜索候选、仓库、技术或判断依据' : '搜索项目、仓库或目录'}
          value={query}
          onValueChange={(value) => updateParams({ q: value || undefined, page: undefined, project: undefined, trend: undefined })}
        />
        <Cascader
          className="filter-select taxonomy-cascader"
          allowClear
          changeOnSelect
          showSearch
          placeholder="全部目录"
          value={categoryPath.length ? categoryPath : undefined}
          options={githubTaxonomy}
          displayRender={(labels) => labels.join(' / ')}
          classNames={{ popup: { root: 'github-taxonomy-popup' } }}
          onChange={(value) => {
            const nextPath = Array.isArray(value) ? value.map(String) : [];
            updateParams({ category: nextPath.length ? githubTaxonomyKey(nextPath) : undefined, page: undefined, project: undefined, trend: undefined });
          }}
        />
        <Select
          className="filter-select short-select"
          allowClear
          placeholder={view === 'trending' ? '全部热度' : '全部等级'}
          value={level || undefined}
          options={view === 'trending'
            ? Object.entries(hotLevelLabels).map(([value, label]) => ({ label, value }))
            : projectLevels.map((name) => ({ label: name, value: name }))}
          onChange={(value) => updateParams({ level: value, page: undefined, project: undefined, trend: undefined })}
        />
        <Select
          className="filter-select"
          value={sort}
          options={view === 'trending' ? [
            { label: '按综合趋势', value: 'trend' },
            { label: '按日榜增星', value: 'daily' },
            { label: '按 7d 增星', value: 'weekly' },
            { label: '按 Stars', value: 'stars' },
            { label: '按最近活动', value: 'activity' },
            { label: '按名称', value: 'name' },
          ] : [
            { label: '按日增长', value: 'delta' },
            { label: '行业优先', value: 'priority' },
            { label: '按 Stars', value: 'stars' },
            { label: '按最近活动', value: 'activity' },
            { label: '按名称', value: 'name' },
          ]}
          onChange={(value) => updateParams({ sort: value, page: undefined, project: undefined, trend: undefined })}
        />
        {(query || categoryPath.length || level) && <Button onClick={() => updateParams({ q: undefined, category: undefined, level: undefined, page: undefined, project: undefined, trend: undefined })}>清空</Button>}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{viewHeading.eyebrow}</p>
            <h2>{viewHeading.title}</h2>
          </div>
          <span className="section-note">{formatNumber(totalRows)} 条结果</span>
        </div>
        {totalRows ? (
          <>
            <div className="desktop-project-table">
              {view === 'trending' ? (
                <Table<GithubTrendCandidate>
                  rowKey="repo"
                  columns={trendColumns}
                  dataSource={visibleTrends}
                  pagination={false}
                  scroll={{ x: 1210 }}
                  onRow={(candidate) => ({ onClick: () => updateParams({ trend: candidate.repo }), className: 'clickable-row' })}
                />
              ) : (
                <Table<Project>
                  rowKey="id"
                  columns={projectColumns}
                  dataSource={visibleProjects}
                  pagination={false}
                  scroll={{ x: 980 }}
                  onRow={(project) => ({ onClick: () => updateParams({ project: project.id }), className: 'clickable-row' })}
                />
              )}
            </div>
            <div className="mobile-project-list">
              {view === 'trending' ? visibleTrends.map((candidate) => (
                <article className="mobile-project" key={candidate.repo}>
                  <div className="row-title-line">
                    <div>
                      <h3>{candidate.name}</h3>
                      <a href={candidate.url} target="_blank" rel="noreferrer">{candidate.repo}</a>
                    </div>
                    <Tag color={hotLevelColors[candidate.hotLevel]}>{hotLevelLabels[candidate.hotLevel]}</Tag>
                  </div>
                  <p>{candidate.description || candidate.hotReasons[0]}</p>
                  <TaxonomyCell path={trendTaxonomy.get(candidate.repo) ?? []} />
                  <div className="project-metrics">
                    <span><strong className="positive">+{formatNumber(candidate.periodStars24h)}</strong> 日榜</span>
                    <span><strong>+{formatNumber(candidate.periodStarsWeekly)}</strong> 7d</span>
                    <span><strong>{formatNumber(candidate.totalStars)}</strong> Stars</span>
                  </div>
                  <div className="mobile-actions"><Button onClick={() => updateParams({ trend: candidate.repo })}>详情</Button></div>
                </article>
              )) : visibleProjects.map((project) => (
                <article className="mobile-project" key={project.id}>
                  <div className="row-title-line">
                    <div>
                      <h3>{project.name}</h3>
                      <a href={project.url} target="_blank" rel="noreferrer">{project.repo}</a>
                    </div>
                    <Tag color={project.level.includes('A') ? 'green' : 'blue'}>{project.level}</Tag>
                  </div>
                  <p>{project.summary}</p>
                  <div className="project-metrics">
                    <span><strong>{formatNumber(project.stars)}</strong> Stars</span>
                    <span><strong className="positive">+{formatNumber(project.starsDelta)}</strong> 快照增量</span>
                    <span>{githubTaxonomyLabel(projectTaxonomy.get(project.id) ?? [])}</span>
                  </div>
                  <div className="mobile-actions">
                    <Button onClick={() => updateParams({ project: project.id })}>详情</Button>
                    {isAdmin && <Button type={followed.has(project.id) ? 'primary' : 'default'} onClick={() => toggleFollow(project.id)}>{followed.has(project.id) ? '已关注' : '关注'}</Button>}
                  </div>
                </article>
              ))}
            </div>
            {totalRows > pageSize && (
              <div className="pagination-row">
                <Pagination current={safePage} pageSize={pageSize} total={totalRows} showSizeChanger={false} onChange={(next) => updateParams({ page: next === 1 ? undefined : String(next), project: undefined, trend: undefined })} />
              </div>
            )}
          </>
        ) : <Empty description="当前条件下没有项目" />}
      </section>

      <Drawer title="项目详情" size={620} open={Boolean(selected)} onClose={() => updateParams({ project: undefined })}>
        {selected && (
          <article className="detail-stack">
            <div className="detail-kicker">
              <Tag color={selected.level.includes('A') ? 'green' : 'blue'}>{selected.level}</Tag>
              <Tag>{verificationLabels[selected.verification]}</Tag>
              {selected.trackingStatus === 'delisted' && <Tag color="default">已下架 · {formatDate(selected.delistedAt ?? '')}</Tag>}
              {selected.industryFit === 'high' && <Tag color="red">行业优先</Tag>}
              <Tag>{githubTaxonomyLabel(classifyGithubRecord(selected))}</Tag>
              <span>活动于 {formatDate(selected.lastActivity)}</span>
            </div>
            <h2>{selected.name}</h2>
            <a className="repo-link" href={selected.url} target="_blank" rel="noreferrer">{selected.repo}</a>
            <div className="detail-metrics">
              <div><span>Stars</span><strong>{formatNumber(selected.stars)}</strong></div>
              <div><span>Forks</span><strong>{formatNumber(selected.forks)}</strong></div>
              <div><span>快照增量</span><strong className={selected.trackingStatus === 'delisted' ? undefined : 'positive'}>{selected.trackingStatus === 'delisted' ? '—' : `+${formatNumber(selected.starsDelta)}`}</strong></div>
            </div>
            <section><h3>判断</h3><p>{selected.summary}</p></section>
            {selected.priorityDomains?.length ? (
              <section>
                <h3>重点方向</h3>
                <div>{selected.priorityDomains.map((domain) => <Tag key={domain}>{priorityDomainLabels[domain] ?? domain}</Tag>)}</div>
              </section>
            ) : null}
            {selected.decisionReason && (
              <section>
                <h3>AI 收录结论</h3>
                <p>{selected.decisionReason}</p>
                {selected.maintenanceEvidence && <small>{selected.maintenanceEvidence}</small>}
              </section>
            )}
            {selected.trackingStatus === 'delisted' && (
              <section>
                <h3>跟踪状态</h3>
                <p>该项目已于 {formatDate(selected.delistedAt ?? '')} 下架；历史收录信息和最后一次可用指标继续保留，不再参与活跃项目刷新。</p>
              </section>
            )}
            <section className="risk-section"><h3>风险与限制</h3><p>{selected.riskNote}</p></section>
            {localReport && (
              <section className="local-report-section">
                <div className="local-report-heading">
                  <h3>深度报告</h3>
                  <div><Tag color="red">仅本地</Tag><Tag>{localReport.status === 'final' ? '定稿' : localReport.status === 'archived' ? '归档' : '草稿'}</Tag></div>
                </div>
                <strong>{localReport.title}</strong>
                <p>{localReport.summary}</p>
                <small>{formatDate(localReport.date)} · {localReport.author}</small>
              </section>
            )}
            <div className="detail-actions">
              {isAdmin && <Button type={followed.has(selected.id) ? 'primary' : 'default'} onClick={() => toggleFollow(selected.id)}>{followed.has(selected.id) ? '取消关注' : '加入关注'}</Button>}
              {localReport && <Button type="primary" href={localReport.path} target="_blank" rel="noreferrer">查看深度报告</Button>}
              {isAdmin && report && <Button href={report.path} target="_blank" rel="noreferrer">查看采集日报</Button>}
            </div>
          </article>
        )}
      </Drawer>

      <Drawer title="趋势候选详情" size={620} open={Boolean(selectedTrend)} onClose={() => updateParams({ trend: undefined })}>
        {selectedTrend && (
          <article className="detail-stack">
            <div className="detail-kicker">
              <Tag color={hotLevelColors[selectedTrend.hotLevel]}>{hotLevelLabels[selectedTrend.hotLevel]}</Tag>
              {selectedTrend.tracked && <Tag color="green">已正式跟踪</Tag>}
              {selectedTrend.intakePriority && <Tag>{selectedTrend.intakePriority}</Tag>}
              <Tag>{githubTaxonomyLabel(classifyGithubRecord(selectedTrend))}</Tag>
              <span>活动于 {formatDate(selectedTrend.pushedAt)}</span>
            </div>
            <h2>{selectedTrend.name}</h2>
            <a className="repo-link" href={selectedTrend.url} target="_blank" rel="noreferrer">{selectedTrend.repo}</a>
            <div className="detail-metrics">
              <div><span>日榜增星</span><strong className="positive">+{formatNumber(selectedTrend.periodStars24h)}</strong></div>
              <div><span>7d 增星</span><strong>+{formatNumber(selectedTrend.periodStarsWeekly)}</strong></div>
              <div><span>Stars</span><strong>{formatNumber(selectedTrend.totalStars)}</strong></div>
            </div>
            <section><h3>候选判断</h3><p>{selectedTrend.description}</p></section>
            {selectedTrend.priorityDomains.length ? (
              <section>
                <h3>重点方向</h3>
                <div>{selectedTrend.priorityDomains.map((domain) => <Tag key={domain.id}>{domain.label}</Tag>)}</div>
              </section>
            ) : null}
            <section>
              <h3>趋势依据</h3>
              <ul className="plain-list trend-signal-list">{selectedTrend.hotReasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>
            </section>
            <section>
              <h3>发现来源</h3>
              <div className="trend-domain-tags">
                {selectedTrend.sourceSignals.map((signal) => <Tag key={signal.id}>{sourceSignalLabels[signal.id] ?? signal.id}{signal.rank ? ` #${signal.rank}` : ''}</Tag>)}
              </div>
            </section>
            <section className={selectedTrend.qualityRisks.length ? 'risk-section' : undefined}>
              <h3>质量检查</h3>
              {selectedTrend.qualityRisks.length
                ? <ul className="plain-list">{selectedTrend.qualityRisks.map((risk) => <li key={risk}>{risk}</li>)}</ul>
                : <p>已通过基础仓库身份、原创性与活跃度检查。</p>}
            </section>
            <div className="detail-actions"><Button type="primary" href={selectedTrend.url} target="_blank">打开 GitHub</Button></div>
          </article>
        )}
      </Drawer>
    </div>
  );
}
