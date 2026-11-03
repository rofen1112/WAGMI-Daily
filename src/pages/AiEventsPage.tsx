import { Button, Empty, Segmented, Select, Tag } from 'antd';
import { useEffect, useState } from 'react';
import { isChineseAiEvent } from '../aiEventLanguage';
import { aiReadingSources } from '../aiReadingSources';
import FloatingReadingNav from '../components/FloatingReadingNav';
import ImeSafeSearchInput from '../components/ImeSafeSearchInput';
import { aiEventEditionDate, formatDate } from '../data';
import type { AiEvent, AiWeeklySummary, Snapshot } from '../types';

interface AiEventsPageProps {
  snapshot: Snapshot;
  params: URLSearchParams;
  updateParams: (patch: Record<string, string | undefined | null>) => void;
}

const sourceLabels: Record<string, string> = {
  official: '官方来源',
  official_announcement: '官方发布',
  official_release: '官方发布',
  official_blog: '官方博客',
  official_docs: '官方文档',
  official_changelog: '官方更新日志',
  official_research: '官方研究',
  original_research: '原始研究',
  official_creator: '作者原创',
  creator: '作者原创',
  followed_creator: '关注作者',
  official_and_followed: '官方 + 关注作者',
  official_and_trusted_media: '官方 + 可信媒体',
  trusted_media: '可信媒体',
  historical_report: '历史报告归档',
  official_paper: '官方论文',
  official_paper_and_project: '论文 + 官方项目',
};

function sourceTypeLabel(sourceType: string) {
  return sourceLabels[sourceType]
    ?? (sourceType.startsWith('official') ? '官方来源'
      : sourceType.startsWith('creator') ? '作者原创'
        : sourceType.startsWith('trusted') ? '可信媒体'
          : sourceType === 'industry_aggregator' ? '行业汇总' : '参考来源');
}

const boardAliases: Record<string, string> = {
  'AI Product / Model Launch': 'AI 产品 / 模型',
  'AI Products / Models': 'AI 产品 / 模型',
  'AI 产品 / 模型发布': 'AI 产品 / 模型',
  'AI Coding': 'AI 编程',
  'AI Security / Governance': 'AI 安全 / 治理',
  'Market / Business Model': '市场 / 商业模式',
  'Market / Business Models': '市场 / 商业模式',
  'Workflow / Tutorial / Usage Tips': '使用技巧 / 工作流',
  '使用技巧 / 教程': '使用技巧 / 工作流',
  'AI 3D / World Models': 'AI 3D / 世界模型',
  'Funding / Investment': '融资 / 投资',
  'Financing / Investment': '融资 / 投资',
  'Creator / YouTube Signals': '作者 / 渠道信号',
  'YouTube / Creator Watch': '作者 / 渠道信号',
  'Frontier Paper / Research': '前沿论文',
  'Paper / Academic Research': '前沿论文',
};

function boardDisplayName(name: string) {
  return boardAliases[name] ?? name;
}

function eventBoardNames(event: AiEvent) {
  return [...new Set(event.boards.map(boardDisplayName))];
}

function matchesEvent(event: AiEvent, query: string) {
  if (!query) return true;
  const haystack = [event.title, event.summary, event.whyItMatters, ...event.entities, ...event.boards].join(' ').toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function countBoards(events: AiEvent[]) {
  return [...new Set(events.flatMap((event) => event.boards.map(boardDisplayName)))]
    .map((name) => ({
      name,
      count: events.filter((event) => event.boards.some((board) => boardDisplayName(board) === name)).length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'));
}

function groupEvents(events: AiEvent[], selectedBoard: string) {
  const groups = new Map<string, AiEvent[]>();
  events.forEach((event) => {
    const name = selectedBoard || boardDisplayName(event.boards[0] || '其他');
    const group = groups.get(name) ?? [];
    group.push(event);
    groups.set(name, group);
  });
  return [...groups.entries()];
}

function priorityColor(priority: AiEvent['priority']) {
  if (priority === 'A') return 'red';
  if (priority === 'B') return 'gold';
  return 'default';
}

function scrollToEvent(eventId: string) {
  document.getElementById(`event-${eventId}`)?.scrollIntoView({
    behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    block: 'start',
  });
}

function groupEventsByDate(events: AiEvent[]) {
  const groups = new Map<string, AiEvent[]>();
  events.forEach((event) => {
    const editionDate = aiEventEditionDate(event);
    const group = groups.get(editionDate) ?? [];
    group.push(event);
    groups.set(editionDate, group);
  });
  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([date, group]) => [
      date,
      group.sort((left, right) => left.priority.localeCompare(right.priority) || left.title.localeCompare(right.title, 'zh-CN')),
    ] as const);
}

function weekdayLabel(date: string) {
  return new Intl.DateTimeFormat('zh-CN', {
    weekday: 'long',
    timeZone: 'Asia/Shanghai',
  }).format(new Date(`${date}T12:00:00+08:00`));
}

function shiftDate(date: string, days: number) {
  const [year, month, day] = date.split('-').map(Number);
  const point = new Date(Date.UTC(year, month - 1, day));
  point.setUTCDate(point.getUTCDate() + days);
  return point.toISOString().slice(0, 10);
}

function calendarWeekRange(date: string) {
  const [year, month, day] = date.split('-').map(Number);
  const point = new Date(Date.UTC(year, month - 1, day));
  const mondayOffset = (point.getUTCDay() + 6) % 7;
  const start = shiftDate(date, -mondayOffset);
  return { start, end: shiftDate(start, 6) };
}

interface WeekView {
  id: string;
  range: { start: string; end: string };
  totalEvents: number;
  summary?: AiWeeklySummary;
}

function buildWeekViews(events: AiEvent[], summaries: AiWeeklySummary[]): WeekView[] {
  const sortedDates = [...new Set(events.map(aiEventEditionDate))].sort();
  const sortedSummaries = [...summaries].sort((left, right) => right.range.end.localeCompare(left.range.end));
  const fallbackRange = calendarWeekRange(sortedDates[sortedDates.length - 1] ?? new Date().toISOString().slice(0, 10));
  const anchor = sortedSummaries[0]?.range ?? fallbackRange;
  const earliest = sortedDates[0] ?? anchor.start;
  const latest = sortedDates[sortedDates.length - 1] ?? anchor.end;
  const ranges = new Map<string, { start: string; end: string }>();

  sortedSummaries.forEach((summary) => ranges.set(summary.range.start, summary.range));
  for (let offset = 0; shiftDate(anchor.start, offset) <= latest; offset += 7) {
    const start = shiftDate(anchor.start, offset);
    ranges.set(start, { start, end: shiftDate(anchor.end, offset) });
  }
  for (let offset = -7; shiftDate(anchor.end, offset) >= earliest; offset -= 7) {
    const start = shiftDate(anchor.start, offset);
    ranges.set(start, { start, end: shiftDate(anchor.end, offset) });
  }

  return [...ranges.values()]
    .map((range) => {
      const summary = sortedSummaries.find((item) => item.range.start === range.start && item.range.end === range.end);
      const totalEvents = events.filter((event) => {
        const editionDate = aiEventEditionDate(event);
        return editionDate >= range.start && editionDate <= range.end;
      }).length;
      return {
        id: summary?.id ?? `ai-week-${range.end}`,
        range,
        totalEvents: totalEvents || summary?.totalEvents || 0,
        summary,
      };
    })
    .filter((week) => week.totalEvents > 0 || week.summary)
    .sort((left, right) => right.range.end.localeCompare(left.range.end));
}

function weekOptionLabel(week: WeekView) {
  return `${formatDate(week.range.start)} - ${formatDate(week.range.end)} · ${week.totalEvents} 条`;
}

interface EventArticleProps {
  event: AiEvent;
  index: number;
  selected: boolean;
  expanded: boolean;
  fullReading: boolean;
  onToggle: () => void;
}

function EventArticle({
  event,
  index,
  selected,
  expanded,
  fullReading,
  onToggle,
}: EventArticleProps) {
  const readingSources = aiReadingSources(event.sources, event.readingSources);
  const boardNames = eventBoardNames(event);
  const editionDate = aiEventEditionDate(event);

  return (
    <article className={`ai-event-article${selected ? ' selected' : ''}`} id={`event-${event.id}`}>
      <div className="ai-event-kicker">
        <span className="ai-event-number">{String(index).padStart(2, '0')}</span>
        <span>
          {editionDate === event.date
            ? formatDate(event.date)
            : `日报 ${formatDate(editionDate)} · 原文 ${formatDate(event.date)}`}
        </span>
        <Tag color={priorityColor(event.priority)}>{event.priority} 级</Tag>
        <span>{event.archived ? '历史归档' : sourceTypeLabel(event.sourceType)}</span>
      </div>

      <h3>{event.title}</h3>
      <p className="ai-event-summary">{event.summary}</p>

      {event.contentKind === 'paper' && event.paper && (
        <div className="ai-paper-meta">
          <div>
            <span>原始题名</span>
            <strong>{event.paper.titleOriginal}</strong>
          </div>
          <p>
            {event.paper.authors.slice(0, 4).join('、')}
            {event.paper.authors.length > 4 ? ` 等 ${event.paper.authors.length} 位作者` : ''}
            <span> · {event.paper.venue}</span>
            <span> · {event.paper.readingLevel === 'fulltext' ? '全文解读' : '摘要解读'}</span>
          </p>
          <div className="ai-paper-links">
            <a href={event.paper.paperUrl} target="_blank" rel="noreferrer">论文页面 ↗</a>
            {event.paper.pdfUrl && <a href={event.paper.pdfUrl} target="_blank" rel="noreferrer">PDF ↗</a>}
            {event.paper.projectUrl && <a href={event.paper.projectUrl} target="_blank" rel="noreferrer">项目页 ↗</a>}
            {event.paper.codeUrl && <a href={event.paper.codeUrl} target="_blank" rel="noreferrer">代码 ↗</a>}
          </div>
        </div>
      )}

      <div className="ai-event-tags">
        {boardNames.slice(0, 3).map((name) => <Tag key={name}>{name}</Tag>)}
        {boardNames.length > 3 && <span>+{boardNames.length - 3}</span>}
        {event.entities.slice(0, 2).map((name) => <Tag color="blue" key={name}>{name}</Tag>)}
      </div>

      {readingSources.length > 0 && (
        <nav className="ai-event-sources" aria-label={`${event.title}的阅读来源`}>
          {readingSources.map((source) => (
            <a className={`ai-reading-source${source.chinese ? ' chinese' : ''}`} href={source.url} target="_blank" rel="noreferrer" key={source.url} title={`${source.category}：${source.displayName} · ${source.domain}`}>
              <span className="ai-reading-source-kind">{source.category}</span>
              <span className="ai-reading-source-name">{source.displayName}</span>
              <span className="ai-reading-source-arrow" aria-hidden="true">↗</span>
            </a>
          ))}
        </nav>
      )}

      {!fullReading && (
        <Button className="ai-expand-button" type="text" aria-expanded={expanded} aria-controls={`analysis-${event.id}`} onClick={onToggle}>
          {expanded ? '收起' : '展开分析'}
        </Button>
      )}

      {expanded && (
        <div className="ai-event-detail" id={`analysis-${event.id}`}>
          <section>
            <h4>为什么重要</h4>
            <p>{event.whyItMatters}</p>
          </section>
          <section>
            <h4>下一步</h4>
            <p>{event.action}</p>
          </section>
          {event.repoCandidates.length > 0 && (
            <section>
              <h4>GitHub 入库线索</h4>
              <ul className="plain-list">
                {event.repoCandidates.map((candidate) => <li key={candidate}>{candidate}</li>)}
              </ul>
            </section>
          )}
        </div>
      )}
    </article>
  );
}

export default function AiEventsPage({ snapshot, params, updateParams }: AiEventsPageProps) {
  const mode = params.get('mode') === 'weekly' ? 'weekly' : 'daily';
  const query = params.get('q') ?? '';
  const board = params.get('board') ?? '';
  const start = params.get('start') ?? '';
  const end = params.get('end') ?? '';
  const selectedId = params.get('event') ?? '';
  const isFullReading = params.get('view') === 'full';
  const [filtersExpanded, setFiltersExpanded] = useState(Boolean(board || start || end || params.get('date') || params.get('week')));
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const readableEvents = snapshot.aiEvents.filter(isChineseAiEvent);
  const dailyDates = [...new Set(readableEvents.map(aiEventEditionDate))].sort((a, b) => b.localeCompare(a));
  const defaultDate = dailyDates.includes(snapshot.asOf.ai) ? snapshot.asOf.ai : (dailyDates[0] ?? snapshot.asOf.ai);
  const selectedDate = params.get('date') ?? defaultDate;
  const weeklySummaries = [...(snapshot.weeklySummaries ?? [])]
    .sort((left, right) => right.range.end.localeCompare(left.range.end));
  const weekViews = buildWeekViews(readableEvents, weeklySummaries);
  const weekFromRange = weekViews.find((week) => week.range.start === start && week.range.end === end);
  const selectedWeek = weekViews.find((week) => week.id === params.get('week'))
    ?? weekFromRange
    ?? weekViews[0];
  const weekly = selectedWeek?.summary;
  const selectedWeekId = selectedWeek?.id ?? '';
  const selectedWeekIndex = weekViews.findIndex((week) => week.id === selectedWeekId);
  const effectiveStart = selectedWeek?.range.start || start || dailyDates[dailyDates.length - 1] || selectedDate;
  const effectiveEnd = selectedWeek?.range.end || end || dailyDates[0] || selectedDate;
  const scopedEvents = readableEvents.filter((event) => mode === 'daily'
    ? aiEventEditionDate(event) === selectedDate
    : aiEventEditionDate(event) >= effectiveStart && aiEventEditionDate(event) <= effectiveEnd);
  const boards = [...new Set(scopedEvents.flatMap((event) => event.boards.map(boardDisplayName)))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
  const matchedEvents = scopedEvents
    .filter((event) => matchesEvent(event, query))
    .sort((a, b) => aiEventEditionDate(b).localeCompare(aiEventEditionDate(a)) || b.date.localeCompare(a.date) || a.priority.localeCompare(b.priority));
  const events = matchedEvents.filter((event) => !board || event.boards.some((name) => boardDisplayName(name) === board));
  const boardCounts = countBoards(events);
  const dailyBoardCounts = countBoards(matchedEvents);
  const eventGroups = groupEvents(events, board);
  const weeklyEventGroups = groupEventsByDate(events);
  const orderedEvents = mode === 'weekly' ? weeklyEventGroups.flatMap(([, group]) => group) : events;
  const eventIndexes = new Map(orderedEvents.map((event, index) => [event.id, index + 1]));
  const entityCounts = [...new Set(events.flatMap((event) => event.entities))]
    .map((name) => ({ name, count: events.filter((event) => event.entities.includes(name)).length }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
    .slice(0, 12);
  const weeklyCounts = dailyBoardCounts;
  const weeklyTotal = matchedEvents.length;
  const weeklyAEvents = matchedEvents.filter((event) => event.priority === 'A').length;
  const weeklyActiveDays = new Set(matchedEvents.map(aiEventEditionDate)).size;
  const selectedEventVisible = Boolean(selectedId && events.some((event) => event.id === selectedId));
  const groupKey = (name: string) => `${selectedDate}:${name}`;
  const selectedGroupName = eventGroups.find(([, group]) => group.some((event) => event.id === selectedId))?.[0];
  const selectedGroupKey = mode === 'daily' && selectedGroupName ? groupKey(selectedGroupName) : '';
  const allGroupsCollapsed = eventGroups.length > 0 && eventGroups.every(([name]) => collapsedGroups[groupKey(name)]);

  useEffect(() => {
    if (board && !boards.includes(board)) updateParams({ board: undefined, event: undefined });
  }, [board, boards, updateParams]);

  useEffect(() => {
    if (selectedId && !selectedEventVisible) updateParams({ event: undefined });
  }, [selectedEventVisible, selectedId, updateParams]);

  useEffect(() => {
    if (!selectedEventVisible) return;
    if (selectedGroupKey) setCollapsedGroups((current) => ({ ...current, [selectedGroupKey]: false }));
    let scrollFrame = 0;
    const frame = requestAnimationFrame(() => {
      // Allow a collapsed group to render before locating an event from a deep link.
      scrollFrame = requestAnimationFrame(() => scrollToEvent(selectedId));
    });
    return () => { cancelAnimationFrame(frame); cancelAnimationFrame(scrollFrame); };
  }, [selectedEventVisible, selectedId, selectedGroupKey]);

  const focusEvent = (eventId: string) => {
    const targetGroup = mode === 'daily' ? eventGroups.find(([, group]) => group.some((event) => event.id === eventId)) : undefined;
    if (targetGroup) setCollapsedGroups((current) => ({ ...current, [groupKey(targetGroup[0])]: false }));
    if (selectedId === eventId) {
      requestAnimationFrame(() => scrollToEvent(eventId));
      return;
    }
    updateParams({ event: eventId });
  };

  const focusBoard = (boardName: string) => {
    if (mode === 'weekly') {
      const event = orderedEvents.find((item) => eventBoardNames(item).includes(boardName));
      if (event) focusEvent(event.id);
      return;
    }
    setCollapsedGroups((current) => ({ ...current, [groupKey(boardName)]: false }));
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const heading = document.getElementById(`board-${encodeURIComponent(boardName)}`);
      heading?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
    }));
  };

  const readingNav = (
    <FloatingReadingNav
      entities={entityCounts.map((item) => ({ ...item, targetId: orderedEvents.find((event) => event.entities.includes(item.name))!.id }))}
      boards={mode === 'weekly'
        ? boardCounts.map((item) => ({ ...item, targetId: orderedEvents.find((event) => eventBoardNames(event).includes(item.name))!.id }))
        : eventGroups.map(([name, group]) => ({ name, count: group.length, targetId: group[0].id }))}
      onEventSelect={focusEvent}
      onBoardSelect={focusBoard}
    />
  );

  return (
    <div className="page-stack ai-events-page">
      <section className="page-heading compact-heading ai-page-heading">
        <div>
          <p className="eyebrow">AI intelligence</p>
          <h1>{mode === 'weekly' ? '每周大事件' : 'AI 大事件'}</h1>
          <p className="lead">
            {mode === 'weekly'
              ? '把一周事件按日期放回阅读顺序，趋势和类型统计只作为辅助索引。'
              : '每日事实、周期趋势和来源判断，集中在一条连续阅读流中。'}
          </p>
        </div>
        <div className="as-of-group">
          <span>{mode === 'daily' ? `浏览 ${formatDate(selectedDate)}` : `${formatDate(effectiveStart)} 至 ${formatDate(effectiveEnd)}`}</span>
          <span>{mode === 'daily' ? `${scopedEvents.length} 条当日事件` : `${matchedEvents.length} 条本周事件`}</span>
        </div>
      </section>

      <section className="filter-bar ai-filter-bar" aria-label="AI 事件筛选">
        <Segmented
          value={mode}
          options={[{ label: '每日浏览', value: 'daily' }, { label: '每周大事件', value: 'weekly' }]}
          onChange={(value) => updateParams({
            mode: String(value) === 'weekly' ? 'weekly' : undefined,
            date: undefined,
            week: undefined,
            start: undefined,
            end: undefined,
            board: undefined,
            event: undefined,
          })}
        />
        <ImeSafeSearchInput
          className="filter-search"
          allowClear
          placeholder="搜索事件、机构或产品"
          value={query}
          onValueChange={(value) => updateParams({ q: value || undefined, event: undefined })}
        />
        <Button className="ai-mobile-filter-toggle" type="text" aria-expanded={filtersExpanded} onClick={() => setFiltersExpanded((value) => !value)}>
          {filtersExpanded ? '收起筛选' : '更多筛选'}
        </Button>
        <div className={`ai-secondary-filters${filtersExpanded ? ' expanded' : ''}`}>
          <Select
            className="filter-select"
            allowClear
            placeholder="全部板块"
            value={board || undefined}
            options={boards.map((name) => ({ label: name, value: name }))}
            onChange={(value) => updateParams({ board: value, event: undefined })}
          />
          {mode === 'daily' ? (
            <Select
              className="filter-select ai-day-select"
              value={selectedDate}
              options={dailyDates.map((date) => ({
                label: `${formatDate(date)} · ${readableEvents.filter((event) => aiEventEditionDate(event) === date).length} 条`,
                value: date,
              }))}
              onChange={(value) => updateParams({ date: value === defaultDate ? undefined : value, board: undefined, event: undefined })}
            />
          ) : (
            <div className="ai-week-picker">
              <Button
                disabled={selectedWeekIndex < 0 || selectedWeekIndex >= weekViews.length - 1}
                onClick={() => {
                  const previousWeek = weekViews[selectedWeekIndex + 1];
                  if (previousWeek) updateParams({ week: previousWeek.id, start: undefined, end: undefined, board: undefined, event: undefined });
                }}
              >
                上一周
              </Button>
              <Select
                className="filter-select ai-week-select"
                value={selectedWeekId || undefined}
                placeholder="选择一周"
                options={weekViews.map((week) => ({ label: weekOptionLabel(week), value: week.id }))}
                onChange={(value) => updateParams({ week: value, start: undefined, end: undefined, board: undefined, event: undefined })}
              />
              <Button
                disabled={selectedWeekIndex <= 0}
                onClick={() => {
                  const nextWeek = weekViews[selectedWeekIndex - 1];
                  if (nextWeek) updateParams({ week: nextWeek.id, start: undefined, end: undefined, board: undefined, event: undefined });
                }}
              >
                下一周
              </Button>
            </div>
          )}
        </div>
        {(query || board || start || end || params.get('date') || params.get('week')) && (
          <Button onClick={() => updateParams({ q: undefined, board: undefined, date: undefined, week: undefined, start: undefined, end: undefined, event: undefined })}>清空</Button>
        )}
      </section>

      {mode === 'weekly' ? (
        <>
          <section className="ai-weekly-brief" aria-labelledby="weekly-brief-title">
            <div className="ai-weekly-brief-heading">
              <div>
                <p className="eyebrow">Weekly brief</p>
                <h2 id="weekly-brief-title">{formatDate(effectiveStart)} - {formatDate(effectiveEnd)}</h2>
                <p>按日期快速回看本周事件，类型统计用于定位，不替代正文阅读。</p>
              </div>
              <div className="ai-weekly-metrics" aria-label="本周事件概览">
                <span><strong>{weeklyTotal}</strong> 可浏览事件</span>
                <span><strong>{weeklyActiveDays}</strong> 有更新日期</span>
                <span><strong>{weeklyAEvents}</strong> A 级事件</span>
                <span><strong>{weeklyCounts.length}</strong> 事件类型</span>
              </div>
            </div>

            {weekly && weekly.trends.length > 0 && !query && !board && (
              <div className="ai-weekly-observations">
                <div className="ai-weekly-observations-label">
                  <p className="eyebrow">本周观察</p>
                  <span>周趋势摘要</span>
                </div>
                <ol>
                  {weekly.trends.slice(0, 3).map((trend) => (
                    <li key={trend.title}>
                      <h3>{trend.title}</h3>
                      <p>{trend.summary}</p>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <div className="ai-weekly-type-index">
              <div className="ai-board-tabs" role="tablist" aria-label="按事件类型浏览本周内容">
                <button className={!board ? 'active' : ''} type="button" role="tab" aria-selected={!board} onClick={() => updateParams({ board: undefined, event: undefined })}>
                  全部 <span>{matchedEvents.length}</span>
                </button>
                {weeklyCounts.map((item) => (
                  <button className={board === item.name ? 'active' : ''} type="button" role="tab" aria-selected={board === item.name} onClick={() => updateParams({ board: item.name, event: undefined })} key={item.name}>
                    {item.name} <span>{item.count}</span>
                  </button>
                ))}
              </div>
              <p className="method-note">事件可归入多个类型；类型数量仅用于筛选本周阅读流。</p>
            </div>
          </section>

          {events.length ? (
            <div className={`ai-reading-layout${entityCounts.length ? '' : ' without-entities'}`}>
              {readingNav}
              <section className="ai-reading-column ai-weekly-reading" aria-labelledby="weekly-events-title">
                <div className="ai-reading-toolbar">
                  <div>
                    <span id="weekly-events-title">{board || '本周全部事件'}</span>
                    <strong>{events.length} 条</strong>
                  </div>
                  <Segmented
                    size="small"
                    value={isFullReading ? 'full' : 'brief'}
                    options={[{ label: '速读', value: 'brief' }, { label: '全文', value: 'full' }]}
                    onChange={(value) => updateParams({ view: String(value) === 'full' ? 'full' : undefined })}
                  />
                </div>

                <div className="ai-weekly-date-groups">
                  {weeklyEventGroups.map(([date, dateEvents]) => (
                    <section className="ai-weekly-date-section" aria-labelledby={`week-date-${date}`} key={date}>
                      <header className="ai-weekly-date-heading">
                        <div>
                          <time id={`week-date-${date}`} dateTime={date}>{formatDate(date)}</time>
                          <span>{weekdayLabel(date)}</span>
                        </div>
                        <strong>{dateEvents.length} 条</strong>
                      </header>
                      <div className="ai-article-list">
                        {dateEvents.map((event) => {
                          const expanded = isFullReading || event.id === selectedId;
                          return (
                            <EventArticle
                              event={event}
                              index={eventIndexes.get(event.id) ?? 0}
                              selected={event.id === selectedId}
                              expanded={expanded}
                              fullReading={isFullReading}
                              onToggle={() => updateParams({ event: expanded ? undefined : event.id })}
                              key={event.id}
                            />
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            </div>
          ) : (
            <section className="content-section"><Empty description="当前一周没有符合条件的事件" /></section>
          )}
        </>
      ) : events.length ? (
        <>
          <section className="ai-overview" aria-labelledby="ai-overview-title">
            <div className="ai-overview-heading">
              <div>
                <p className="eyebrow">Daily brief</p>
                <h2 id="ai-overview-title">事件速览</h2>
              </div>
              <div className="ai-overview-stats" aria-label="筛选结果统计">
                <span><strong>{events.length}</strong> 事件</span>
                <span><strong>{boardCounts.length}</strong> 板块</span>
              </div>
            </div>

            <div className="ai-board-tabs" role="tablist" aria-label="按板块浏览">
              <button className={!board ? 'active' : ''} type="button" role="tab" aria-selected={!board} onClick={() => updateParams({ board: undefined, event: undefined })}>
                全部 <span>{matchedEvents.length}</span>
              </button>
              {dailyBoardCounts.map((item) => (
                <button className={board === item.name ? 'active' : ''} type="button" role="tab" aria-selected={board === item.name} onClick={() => updateParams({ board: item.name, event: undefined })} key={item.name}>
                  {item.name} <span>{item.count}</span>
                </button>
              ))}
            </div>

            <ol className="ai-overview-list">
              {events.slice(0, 4).map((event) => (
                <li key={event.id}>
                  <button type="button" onClick={() => focusEvent(event.id)}>
                    <span className="ai-overview-index">{String(eventIndexes.get(event.id)).padStart(2, '0')}</span>
                    <span className="ai-overview-title">{event.title}</span>
                    <span className="ai-overview-meta">原文 {event.date.slice(5).replace('-', '.')} · {event.priority} 级</span>
                  </button>
                </li>
              ))}
            </ol>
          </section>

          <div className={`ai-reading-layout${entityCounts.length ? '' : ' without-entities'}`}>
            {readingNav}

            <div className="ai-reading-column">
              <div className="ai-reading-toolbar">
                <div>
                  <span>{board || '全部板块'}</span>
                  <strong>{events.length} 条</strong>
                </div>
                <div className="ai-reading-actions">
                  <button className="ai-toggle-all-groups" type="button" onClick={() => setCollapsedGroups((current) => ({
                    ...current,
                    ...Object.fromEntries(eventGroups.map(([name]) => [groupKey(name), !allGroupsCollapsed])),
                  }))}>
                    {allGroupsCollapsed ? '全部展开' : '全部收起'}
                  </button>
                  <Segmented
                    size="small"
                    value={isFullReading ? 'full' : 'brief'}
                    options={[{ label: '速读', value: 'brief' }, { label: '全文', value: 'full' }]}
                    onChange={(value) => updateParams({ view: String(value) === 'full' ? 'full' : undefined })}
                  />
                </div>
              </div>

              <div className="ai-board-groups">
                {eventGroups.map(([groupName, groupEvents]) => {
                  const collapsed = Boolean(collapsedGroups[groupKey(groupName)]);
                  const headingId = `board-${encodeURIComponent(groupName)}`;
                  const contentId = `${headingId}-events`;
                  return (
                  <section className={`ai-board-group${collapsed ? ' collapsed' : ''}`} aria-labelledby={headingId} key={groupName}>
                    <header className="ai-board-group-heading">
                      <h2 id={headingId}>
                        <button className="ai-board-toggle" type="button" aria-expanded={!collapsed} aria-controls={contentId}
                          onClick={() => setCollapsedGroups((current) => ({ ...current, [groupKey(groupName)]: !collapsed }))}>
                          <span className="ai-board-rule" aria-hidden="true" />
                          <span className="ai-board-title">{groupName}</span>
                          <span className="ai-board-count">{groupEvents.length} 条</span>
                          <span className="ai-board-toggle-label">{collapsed ? '展开' : '收起'}</span>
                          <span className={`ai-board-chevron${collapsed ? ' collapsed' : ''}`} aria-hidden="true">⌄</span>
                        </button>
                      </h2>
                    </header>

                    <div className="ai-article-list" id={contentId} hidden={collapsed}>
                      {groupEvents.map((event) => {
                        const expanded = isFullReading || event.id === selectedId;
                        return (
                          <EventArticle
                            event={event}
                            index={eventIndexes.get(event.id) ?? 0}
                            selected={event.id === selectedId}
                            expanded={expanded}
                            fullReading={isFullReading}
                            onToggle={() => updateParams({ event: expanded ? undefined : event.id })}
                            key={event.id}
                          />
                        );
                      })}
                    </div>
                  </section>
                );})}
              </div>
            </div>
          </div>
        </>
      ) : (
        <section className="content-section"><Empty description="当前条件下没有事件" /></section>
      )}
    </div>
  );
}
