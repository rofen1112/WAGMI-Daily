import { Alert, Button, Drawer, Empty, Pagination, Segmented, Select, Skeleton, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ImeSafeSearchInput from '../components/ImeSafeSearchInput';
import { formatDate, formatNumber, loadSkillCatalog } from '../data';
import { matchesSkillSearch } from '../skillSearch';
import { getSkillExperience, SKILL_CATEGORY_GROUPS } from '../skillTaxonomy';
import type { SkillCatalog, SkillCatalogItem, SkillTrend, Snapshot } from '../types';

interface SkillsRadarPageProps {
  snapshot: Snapshot;
  params: URLSearchParams;
  updateParams: (patch: Record<string, string | undefined | null>) => void;
}

type SkillView = 'trending' | 'official' | 'catalog';
type SkillTopic = 'all' | 'automation' | 'video';
type VisibleSkill = SkillTrend | SkillCatalogItem;

function totalInstalls(skill: VisibleSkill) {
  return skill.totalInstalls ?? 0;
}

function sortSkills(skills: VisibleSkill[], sort: string, view: SkillView) {
  return [...skills].sort((left, right) => {
    if (sort === 'name') return left.name.localeCompare(right.name);
    if (sort === 'source') return left.source.localeCompare(right.source) || left.name.localeCompare(right.name);
    if (sort === 'total') return totalInstalls(right) - totalInstalls(left) || left.name.localeCompare(right.name);
    if (view === 'trending') return (left as SkillTrend).rank - (right as SkillTrend).rank;
    return ((left as SkillCatalogItem).allTimeRank ?? Number.MAX_SAFE_INTEGER) - ((right as SkillCatalogItem).allTimeRank ?? Number.MAX_SAFE_INTEGER);
  });
}

function rowRank(skill: VisibleSkill, view: SkillView, fallback: number) {
  if (view === 'trending') return (skill as SkillTrend).rank;
  return (skill as SkillCatalogItem).allTimeRank ?? fallback;
}

function trendInstalls(skill: VisibleSkill) {
  return 'rank' in skill ? (skill.trendInstalls ?? skill.heatInstalls) : null;
}

function hotMetrics(skill: VisibleSkill) {
  if (skill.hourInstalls == null || skill.installsYesterday == null || skill.change == null) return null;
  return { current: skill.hourInstalls, previous: skill.installsYesterday, change: skill.change };
}

function dailyHeatMetrics(skill: VisibleSkill) {
  if (!('rank' in skill)) return null;
  if (skill.trendStatus === 'new') return { status: 'new' as const, change: null, rankChange: null, date: skill.comparisonDate };
  if (skill.trendInstallChange == null) return null;
  return {
    status: skill.trendStatus ?? (skill.trendInstallChange > 0 ? 'up' : skill.trendInstallChange < 0 ? 'down' : 'flat'),
    change: skill.trendInstallChange,
    rankChange: skill.rankChange ?? null,
    date: skill.comparisonDate,
  };
}

function HotDelta({ skill }: { skill: VisibleSkill }) {
  const daily = dailyHeatMetrics(skill);
  const sourceHot = hotMetrics(skill);
  if (!daily && !sourceHot) return <div className="skill-hot-delta is-empty"><strong>--</strong><span>暂无前日快照</span></div>;
  if (daily?.status === 'new') {
    return (
      <div className="skill-hot-delta is-new" title="未出现在前一日 24h 精选榜单">
        <strong>NEW</strong>
        <span>今日新上榜</span>
        {skill.hotRank != null && <small>Hot #{skill.hotRank}</small>}
      </div>
    );
  }
  const change = daily?.change ?? sourceHot?.change ?? 0;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'flat';
  const symbol = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '→';
  const rankLabel = daily?.rankChange == null || daily.rankChange === 0
    ? ''
    : ` · 排名${daily.rankChange > 0 ? '升' : '降'} ${Math.abs(daily.rankChange)}`;
  return (
    <div
      className={`skill-hot-delta is-${direction}`}
      title={daily
        ? `过去 24h ${formatNumber(trendInstalls(skill) ?? 0)}，前日 ${formatNumber(skill.previousTrendInstalls ?? 0)}${rankLabel}`
        : `本小时 ${formatNumber(sourceHot?.current ?? 0)}，昨日同小时 ${formatNumber(sourceHot?.previous ?? 0)}`}
      aria-label={`热度较前日${change > 0 ? '增加' : change < 0 ? '减少' : '持平'} ${Math.abs(change)}${rankLabel}`}
    >
      <strong><span aria-hidden="true">{symbol}</span> {formatNumber(Math.abs(change))}</strong>
      <span>{daily ? '较前日 24h' : '较昨日同小时'}</span>
      {(skill.hotRank != null || daily?.rankChange != null) && (
        <small>{skill.hotRank != null ? `Hot #${skill.hotRank}` : '非 Hot 子榜'}{rankLabel}</small>
      )}
    </div>
  );
}

export default function SkillsRadarPage({ snapshot, params, updateParams }: SkillsRadarPageProps) {
  const view = (['trending', 'official', 'catalog'].includes(params.get('view') ?? '') ? params.get('view') : 'trending') as SkillView;
  const query = params.get('q') ?? '';
  const isGlobalSearch = Boolean(query.trim());
  const topic = (['automation', 'video'].includes(params.get('topic') ?? '') ? params.get('topic') : 'all') as SkillTopic;
  const group = params.get('group') ?? '';
  const subgroup = params.get('subcategory') ?? '';
  const owner = params.get('owner') ?? '';
  const sort = params.get('sort') ?? (view === 'trending' && !isGlobalSearch ? 'rank' : 'total');
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = 40;
  const [catalog, setCatalog] = useState<SkillCatalog | null>(null);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);

  useEffect(() => {
    if ((view === 'trending' && !isGlobalSearch) || catalog) return;
    const controller = new AbortController();
    setCatalogLoading(true);
    setCatalogError(null);
    loadSkillCatalog(controller.signal)
      .then(setCatalog)
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setCatalogError(error instanceof Error ? error.message : 'Skill 目录加载失败');
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogLoading(false);
      });
    return () => controller.abort();
  }, [catalog, isGlobalSearch, view]);

  const sourceRows = useMemo<VisibleSkill[]>(() => {
    if (isGlobalSearch) return catalog?.skills ?? [];
    if (view === 'trending') return snapshot.skills.filter((skill) => skill.date === snapshot.asOf.skills);
    if (!catalog) return [];
    return view === 'official' ? catalog.skills.filter((skill) => skill.isOfficial) : catalog.skills;
  }, [catalog, isGlobalSearch, snapshot.asOf.skills, snapshot.skills, view]);

  const skillExperiences = useMemo(
    () => new Map(sourceRows.map((skill) => [skill.id, getSkillExperience(skill)])),
    [sourceRows],
  );
  const groupOptions = useMemo(() => SKILL_CATEGORY_GROUPS.map((item) => ({
    ...item,
    count: sourceRows.filter((skill) => skillExperiences.get(skill.id)?.taxonomy.groupId === item.id).length,
  })).filter((item) => item.count > 0), [skillExperiences, sourceRows]);
  const subgroupOptions = useMemo(() => {
    const items = new Map<string, { id: string; label: string; count: number }>();
    sourceRows.forEach((skill) => {
      const taxonomy = skillExperiences.get(skill.id)?.taxonomy;
      if (!taxonomy || (group && taxonomy.groupId !== group)) return;
      const current = items.get(taxonomy.subgroupId);
      items.set(taxonomy.subgroupId, {
        id: taxonomy.subgroupId,
        label: taxonomy.subgroupLabel,
        count: (current?.count ?? 0) + 1,
      });
    });
    return [...items.values()].sort((left, right) => left.label.localeCompare(right.label, 'zh-CN'));
  }, [group, skillExperiences, sourceRows]);
  const topicCounts = useMemo(() => ({
    automation: sourceRows.filter((skill) => skillExperiences.get(skill.id)?.focusTracks.includes('automation')).length,
    video: sourceRows.filter((skill) => skillExperiences.get(skill.id)?.focusTracks.includes('video')).length,
  }), [skillExperiences, sourceRows]);
  const owners = useMemo(() => [...new Set(sourceRows.map((skill) => skill.officialOwner).filter((value): value is string => Boolean(value)))].sort(), [sourceRows]);
  const filteredSkills = useMemo(() => sortSkills(sourceRows
    .filter((skill) => matchesSkillSearch(skill, query))
    .filter((skill) => topic === 'all' || skillExperiences.get(skill.id)?.focusTracks.includes(topic))
    .filter((skill) => !group || skillExperiences.get(skill.id)?.taxonomy.groupId === group)
    .filter((skill) => !subgroup || skillExperiences.get(skill.id)?.taxonomy.subgroupId === subgroup)
    .filter((skill) => !owner || skill.officialOwner === owner), sort, isGlobalSearch ? 'catalog' : view), [group, isGlobalSearch, owner, query, skillExperiences, sort, sourceRows, subgroup, topic, view]);
  const pageCount = Math.max(1, Math.ceil(filteredSkills.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visibleSkills = filteredSkills.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selected = sourceRows.find((skill) => skill.id === params.get('skill'));
  const selectedExperience = selected ? skillExperiences.get(selected.id) ?? getSkillExperience(selected) : null;
  const selectedReport = selected && 'sourceReportId' in selected ? snapshot.reports.find((report) => report.id === selected.sourceReportId) : undefined;
  const catalogStats = snapshot.skillCatalog;

  const changeView = (next: string | number) => {
    const target = String(next) as SkillView;
    updateParams({ view: target === 'trending' ? undefined : target, q: undefined, topic: undefined, group: undefined, subcategory: undefined, owner: undefined, sort: undefined, page: undefined, skill: undefined });
  };

  return (
    <div className="page-stack skills-page">
      <section className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Agent capability index</p>
          <h1>Skill 能力库</h1>
          <p className="lead">24 小时趋势精选、企业官方 Skill 与完整目录，统一补充中文说明和适用场景。</p>
        </div>
        <div className="as-of-group">
          <span>更新至 {formatDate(snapshot.asOf.skills)}</span>
          <span>{formatNumber(catalogStats?.totalSkills ?? snapshot.skills.length)} 个 Skill</span>
        </div>
      </section>

      <section className="metric-strip skills-metrics" aria-label="Skill 数据概览">
        <div className="metric-cell"><span>24h 精选</span><strong>{snapshot.skills.length}</strong><small>每日趋势过滤</small></div>
        <div className="metric-cell"><span>完整目录</span><strong>{formatNumber(catalogStats?.totalSkills ?? 0)}</strong><small>每日增量同步</small></div>
        <div className="metric-cell"><span>企业官方</span><strong>{formatNumber(catalogStats?.officialSkills ?? 0)}</strong><small>{catalogStats?.officialOwners ?? 0} 家机构</small></div>
        <div className="metric-cell"><span>本次新增</span><strong>{formatNumber(catalogStats?.newSkills ?? 0)}</strong><small>首次进入本地库</small></div>
      </section>

      <section className="skills-view-switch" aria-label="Skill 浏览方式">
        <Segmented
          block
          value={view}
          options={[
            { label: '24h 精选', value: 'trending' },
            { label: `企业官方 ${catalogStats?.officialSkills ? formatNumber(catalogStats.officialSkills) : ''}`, value: 'official' },
            { label: `完整目录 ${catalogStats?.totalSkills ? formatNumber(catalogStats.totalSkills) : ''}`, value: 'catalog' },
          ]}
          onChange={changeView}
        />
      </section>

      <section className="skill-focus-switch" aria-label="Skill 重点能力">
        <Segmented
          value={topic}
          options={[
            { label: '全部方向', value: 'all' },
            { label: '自动化 ' + formatNumber(topicCounts.automation), value: 'automation' },
            { label: '视频能力 ' + formatNumber(topicCounts.video), value: 'video' },
          ]}
          onChange={(value) => updateParams({
            topic: value === 'all' ? undefined : String(value),
            group: undefined,
            subcategory: undefined,
            page: undefined,
            skill: undefined,
          })}
        />
      </section>

      <section className="filter-bar skills-filter-bar" aria-label="Skill 筛选">
        <ImeSafeSearchInput
          className="filter-search"
          allowClear
          placeholder="搜索 Skill、来源或使用场景"
          value={query}
          onValueChange={(value) => updateParams({ q: value || undefined, page: undefined, skill: undefined })}
        />
        <Select
          className="filter-select skill-group-select"
          allowClear
          placeholder="一级目录"
          value={group || undefined}
          options={groupOptions.map((item) => ({ label: item.label + ' ' + formatNumber(item.count), value: item.id }))}
          onChange={(value) => updateParams({ group: value, subcategory: undefined, topic: undefined, page: undefined, skill: undefined })}
        />
        <Select
          className="filter-select skill-subgroup-select"
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="二级分类"
          value={subgroup || undefined}
          options={subgroupOptions.map((item) => ({ label: item.label + ' ' + formatNumber(item.count), value: item.id }))}
          onChange={(value) => updateParams({ subcategory: value, topic: undefined, page: undefined, skill: undefined })}
        />
        {view === 'official' && (
          <Select
            className="filter-select"
            allowClear
            showSearch
            optionFilterProp="label"
            placeholder="全部机构"
            value={owner || undefined}
            options={owners.map((name) => ({ label: name, value: name }))}
            onChange={(value) => updateParams({ owner: value, page: undefined, skill: undefined })}
          />
        )}
        <Select
          className="filter-select"
          value={sort}
          options={[
            ...(view === 'trending' && !isGlobalSearch ? [{ label: '按 24h 排名', value: 'rank' }] : [{ label: '按累计安装', value: 'total' }]),
            { label: '按名称', value: 'name' },
            { label: '按来源', value: 'source' },
            ...(view === 'trending' && !isGlobalSearch ? [{ label: '按累计安装', value: 'total' }] : []),
          ]}
          onChange={(value) => updateParams({ sort: value, page: undefined, skill: undefined })}
        />
        {(query || topic !== 'all' || group || subgroup || owner) && <Button onClick={() => updateParams({ q: undefined, topic: undefined, group: undefined, subcategory: undefined, owner: undefined, page: undefined, skill: undefined })}>清空</Button>}
      </section>

      <section className="content-section skills-ranking-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{isGlobalSearch ? 'Catalog search' : view === 'trending' ? 'Trending · 24 hours' : view === 'official' ? 'Official makers' : 'Complete catalog'}</p>
            <h2>{isGlobalSearch ? '全库搜索结果' : view === 'trending' ? '每日趋势精选' : view === 'official' ? '企业官方 Skill' : '全量 Skill 目录'}</h2>
          </div>
          <span className="section-note">{formatNumber(filteredSkills.length)} 条结果</span>
        </div>

        {catalogLoading ? <Skeleton active paragraph={{ rows: 8 }} /> : catalogError ? (
          <Alert type="error" showIcon message="目录加载失败" description={catalogError} />
        ) : visibleSkills.length ? (
          <>
            <div className="skill-ranking-list">
              <div className="skill-ranking-header" aria-hidden="true">
                <span>排名</span><span>Skill 与中文说明</span><span>典型场景</span><span>热度变化</span><span>{view === 'trending' && !isGlobalSearch ? '24h 安装' : '累计安装'}</span><span>来源类型</span><span />
              </div>
              {visibleSkills.map((skill, index) => {
                const displayView = isGlobalSearch ? 'catalog' : view;
                const rank = rowRank(skill, displayView, (safePage - 1) * pageSize + index + 1);
                const installs = displayView === 'trending' ? trendInstalls(skill) ?? 0 : totalInstalls(skill);
                const experience = skillExperiences.get(skill.id) ?? getSkillExperience(skill);
                return (
                  <article className="skill-ranking-row" key={skill.id}>
                    <span className="skill-rank">{String(rank).padStart(2, '0')}</span>
                    <div className="skill-identity">
                      <div className="skill-title-line">
                        <h3>{skill.name}</h3>
                        {skill.isOfficial && <Tag color="green">官方</Tag>}
                        <Tag>{experience.taxonomy.subgroupLabel}</Tag>
                      </div>
                      <a href={skill.url} target="_blank" rel="noreferrer">{skill.source}</a>
                      <p>{skill.descriptionZh}</p>
                    </div>
                    <ul className="skill-use-cases">
                      {skill.useCases.slice(0, 3).map((item) => <li key={item}>{item}</li>)}
                    </ul>
                    <HotDelta skill={skill} />
                    <div className="skill-heat-number"><strong>{formatNumber(installs)}</strong><span>{displayView === 'trending' ? '过去 24h' : '累计安装'}</span></div>
                    <div className="skill-source-type"><strong>{skill.isOfficial ? '企业官方' : '社区来源'}</strong><span>{skill.sourceType === 'github' ? 'GitHub' : '公开来源'}</span></div>
                    <Button size="small" onClick={() => updateParams({ skill: skill.id })}>详情</Button>
                  </article>
                );
              })}
            </div>
            {filteredSkills.length > pageSize && (
              <Pagination
                className="skills-pagination"
                current={safePage}
                pageSize={pageSize}
                total={filteredSkills.length}
                showSizeChanger={false}
                showLessItems
                onChange={(next) => updateParams({ page: next === 1 ? undefined : String(next), skill: undefined })}
              />
            )}
          </>
        ) : <Empty description="当前条件下没有 Skill" />}
      </section>

      <Drawer title="Skill 详情" size={640} open={Boolean(selected)} onClose={() => updateParams({ skill: undefined })}>
        {selected && (
          <article className="detail-stack skill-detail">
            <div className="detail-kicker">
              {selected.isOfficial && <Tag color="green">企业官方</Tag>}
              {selectedExperience && <Tag>{selectedExperience.taxonomy.groupLabel}</Tag>}
              {selectedExperience && <Tag>{selectedExperience.taxonomy.subgroupLabel}</Tag>}
              <span>{selected.source}</span>
            </div>
            <h2>{selected.name}</h2>
            <a className="repo-link" href={selected.url} target="_blank" rel="noreferrer">{selected.url}</a>
            <div className="detail-metrics">
              <div><span>{view === 'trending' && !isGlobalSearch ? '过去 24h' : '累计安装'}</span><strong>{formatNumber(view === 'trending' && !isGlobalSearch ? trendInstalls(selected) ?? 0 : totalInstalls(selected))}</strong></div>
              <div><span>较前日 24h</span><strong>{dailyHeatMetrics(selected)?.status === 'new' ? '新上榜' : dailyHeatMetrics(selected)?.change == null ? '--' : `${(selected.trendInstallChange ?? 0) > 0 ? '+' : ''}${formatNumber(selected.trendInstallChange ?? 0)}`}</strong></div>
              <div><span>来源</span><strong>{selected.isOfficial ? '企业官方' : '社区'}</strong></div>
              <div><span>分类</span><strong>{selectedExperience ? selectedExperience.taxonomy.groupLabel + ' / ' + selectedExperience.taxonomy.subgroupLabel : selected.category}</strong></div>
            </div>
            {(dailyHeatMetrics(selected) || hotMetrics(selected)) && (
              <p className="skill-hot-note">
                {dailyHeatMetrics(selected) && selected.previousTrendInstalls != null
                  ? `前日 24h ${formatNumber(selected.previousTrendInstalls)} 次，当前 ${formatNumber(trendInstalls(selected) ?? 0)} 次${selected.rankChange ? `，排名${selected.rankChange > 0 ? '上升' : '下降'} ${Math.abs(selected.rankChange)} 位` : ''}。`
                  : dailyHeatMetrics(selected)?.status === 'new' ? '该 Skill 今日首次进入 24h 精选榜。' : ''}
                {hotMetrics(selected) ? ` 源站 Hot #${selected.hotRank}：本小时 ${formatNumber(selected.hourInstalls ?? 0)} 次，昨日同小时 ${formatNumber(selected.installsYesterday ?? 0)} 次。` : ''}
              </p>
            )}
            <section>
              <h3>中文说明</h3>
              <p>{selected.descriptionZh}</p>
            </section>
            <section>
              <h3>适用场景</h3>
              <ul className="plain-list">{selected.useCases.map((item) => <li key={item}>{item}</li>)}</ul>
            </section>
            {selectedExperience && (
              <section className="skill-effect-section">
                <h3>实际效果</h3>
                <div className="skill-effect-flow">
                  <div>
                    <span>输入</span>
                    <p>{selectedExperience.inputLabel}</p>
                  </div>
                  <span className="skill-effect-arrow" aria-hidden="true">→</span>
                  <div>
                    <span>可实现结果</span>
                    <ul>
                      {selectedExperience.outputs.map((item) => <li key={item}>{item}</li>)}
                    </ul>
                  </div>
                </div>
                <a className="skill-showcase-link" href={selectedExperience.showcase.url} target="_blank" rel="noreferrer">
                  <span className="skill-showcase-play" aria-hidden="true">{selectedExperience.showcase.kind === 'official-video' ? '▶' : '↗'}</span>
                  <span className="skill-showcase-copy">
                    <strong>{selectedExperience.showcase.title}</strong>
                    <span>{selectedExperience.showcase.description}</span>
                    <small>{selectedExperience.showcase.sourceLabel}</small>
                  </span>
                </a>
              </section>
            )}
            {'rawDescription' in selected && selected.rawDescription && (
              <section className="skill-original-description">
                <h3>来源原文</h3>
                <p>{selected.rawDescription}</p>
              </section>
            )}
            <div className="detail-actions">
              <Button type="primary" href={selected.url} target="_blank">打开 skills.sh</Button>
              {selected.installUrl?.startsWith('https://github.com/') && <Button href={selected.installUrl} target="_blank">查看 GitHub 仓库</Button>}
              {selectedReport && <Button href={selectedReport.path} target="_blank">打开当日报告</Button>}
            </div>
          </article>
        )}
      </Drawer>
    </div>
  );
}
