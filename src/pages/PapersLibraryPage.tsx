import { Alert, Button, Drawer, Empty, Pagination, Segmented, Select, Skeleton, Tag } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import ImeSafeSearchInput from '../components/ImeSafeSearchInput';
import { formatDate, formatNumber, loadPaperCatalog } from '../data';
import type { PaperCatalog, PaperCatalogItem, PaperRepositoryRelation, PaperReviewStatus } from '../types';

interface PapersLibraryPageProps {
  params: URLSearchParams;
  isAdmin: boolean;
  updateParams: (patch: Record<string, string | undefined | null>) => void;
}

type PaperView = 'recommended' | 'queue' | 'interpreted' | 'catalog';

const paperReviewEndpoint = import.meta.env.MODE === 'admin' ? '/__admin/papers/review-now' : null;

const reviewLabels: Record<PaperReviewStatus, string> = {
  discovered: '已收录',
  queued: '待解读',
  interpreted: '已解读',
  verified: '已复核',
};

const relationLabels: Record<PaperRepositoryRelation, string> = {
  official_code: '官方代码',
  project_page: '项目主页',
  baseline: '论文基线',
  related_method: '相关方法',
  downstream_application: '应用项目',
};

function paperMatches(paper: PaperCatalogItem, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return [
    paper.titleZh,
    paper.titleOriginal,
    paper.summaryZh,
    paper.authors.join(' '),
    paper.arxivId,
    paper.topics.map((topic) => topic.labelZh).join(' '),
    paper.relatedRepositories.map((link) => link.repo).join(' '),
  ].join(' ').toLowerCase().includes(needle);
}

function sortPapers(papers: PaperCatalogItem[], sort: string) {
  return [...papers].sort((left, right) => {
    if (sort === 'latest') return String(right.publishedAt).localeCompare(String(left.publishedAt)) || right.heatScore - left.heatScore;
    if (sort === 'relevance') return right.score - left.score || right.heatScore - left.heatScore;
    if (sort === 'title') return (left.titleZh || left.titleOriginal).localeCompare(right.titleZh || right.titleOriginal, 'zh-CN');
    return right.heatScore - left.heatScore || right.score - left.score;
  });
}

function readingLabel(paper: PaperCatalogItem) {
  if (paper.readingLevel === 'fulltext') return '全文级';
  if (paper.readingLevel === 'abstract') return '摘要级';
  return '元数据级';
}

export default function PapersLibraryPage({ params, isAdmin, updateParams }: PapersLibraryPageProps) {
  const view = (['recommended', 'queue', 'interpreted', 'catalog'].includes(params.get('view') ?? '') ? params.get('view') : 'recommended') as PaperView;
  const query = params.get('q') ?? '';
  const topic = params.get('topic') ?? '';
  const status = params.get('status') ?? '';
  const sort = params.get('sort') ?? 'heat';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const pageSize = 30;
  const [catalog, setCatalog] = useState<PaperCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestingReviewId, setRequestingReviewId] = useState<string | null>(null);
  const [reviewFeedback, setReviewFeedback] = useState<{ paperId: string; type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    loadPaperCatalog(controller.signal)
      .then(setCatalog)
      .catch((reason: unknown) => {
        if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : '论文目录加载失败');
      });
    return () => controller.abort();
  }, []);

  const sourceRows = useMemo(() => {
    if (!catalog) return [];
    if (view === 'recommended') {
      const ids = new Set(catalog.dailyRecommendations);
      return catalog.papers.filter((paper) => ids.has(paper.id));
    }
    if (view === 'queue') {
      const order = new Map(catalog.reviewQueue.map((id, index) => [id, index]));
      return catalog.papers.filter((paper) => order.has(paper.id)).sort((left, right) => (order.get(left.id) ?? 0) - (order.get(right.id) ?? 0));
    }
    if (view === 'interpreted') return catalog.papers.filter((paper) => ['interpreted', 'verified'].includes(paper.reviewStatus));
    return catalog.papers;
  }, [catalog, view]);

  const topics = useMemo(() => {
    if (!catalog) return [];
    const values = new Map<string, string>();
    catalog.papers.forEach((paper) => paper.topics.forEach((item) => values.set(item.id, item.labelZh)));
    return [...values.entries()].sort((left, right) => left[1].localeCompare(right[1], 'zh-CN'));
  }, [catalog]);

  const filtered = useMemo(() => sortPapers(sourceRows
    .filter((paper) => paperMatches(paper, query))
    .filter((paper) => !topic || paper.topics.some((item) => item.id === topic))
    .filter((paper) => !status || paper.reviewStatus === status), sort), [query, sort, sourceRows, status, topic]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const selected = catalog?.papers.find((paper) => paper.id === params.get('paper'));

  const changeView = (next: string | number) => {
    const target = String(next) as PaperView;
    updateParams({ view: target === 'recommended' ? undefined : target, page: undefined, paper: undefined });
  };

  const requestImmediateReview = async (paper: PaperCatalogItem) => {
    if (!paperReviewEndpoint) return;
    setRequestingReviewId(paper.id);
    setReviewFeedback(null);
    try {
      const response = await fetch(paperReviewEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paperId: paper.id }),
      });
      const payload = await response.json().catch(() => ({})) as {
        error?: string;
        created?: boolean;
        catalog?: PaperCatalog;
      };
      if (!response.ok) throw new Error(payload.error || '请求失败（HTTP ' + response.status + '）');
      if (payload.catalog) setCatalog(payload.catalog);
      setReviewFeedback({
        paperId: paper.id,
        type: 'success',
        message: payload.created ? '已加入最高优先级解读队列' : '该论文已在最高优先级解读队列',
      });
    } catch (reason) {
      setReviewFeedback({
        paperId: paper.id,
        type: 'error',
        message: reason instanceof Error ? reason.message : '提交解读请求失败',
      });
    } finally {
      setRequestingReviewId(null);
    }
  };
  if (error) return <Alert type="error" showIcon message="论文研究库加载失败" description={error} />;
  if (!catalog) return <div className="paper-loading"><Skeleton active paragraph={{ rows: 10 }} /></div>;

  return (
    <div className="page-stack papers-page">
      <section className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Research evidence index</p>
          <h1>论文研究库</h1>
          <p className="lead">批量收录前沿论文，分批完成中文解读，并用可核验的 GitHub 项目连接研究、应用与实践。</p>
        </div>
        <div className="as-of-group">
          <span>更新至 {formatDate(catalog.asOf)}</span>
          <span>{formatNumber(catalog.stats.totalPapers)} 篇论文</span>
        </div>
      </section>

      <section className="metric-strip papers-metrics" aria-label="论文目录概览">
        <div className="metric-cell"><span>累计收录</span><strong>{formatNumber(catalog.stats.totalPapers)}</strong><small>入库后不因单次缺失删除</small></div>
        <div className="metric-cell"><span>今日新增</span><strong>{formatNumber(catalog.stats.addedToday)}</strong><small>来自今日批量扫描</small></div>
        <div className="metric-cell"><span>待解读</span><strong>{formatNumber(catalog.stats.queuedPapers)}</strong><small>今日排期 {catalog.reviewQueue.length} 篇</small></div>
        <div className="metric-cell"><span>GitHub 关联</span><strong>{formatNumber(catalog.stats.linkedPapers)}</strong><small>{formatNumber(catalog.stats.linkedRepositories)} 个已跟踪仓库</small></div>
      </section>

      <section className="papers-view-switch" aria-label="论文浏览方式">
        <Segmented
          block
          value={view}
          options={[
            { label: `今日推荐 ${catalog.dailyRecommendations.length}`, value: 'recommended' },
            { label: `解读队列 ${catalog.reviewQueue.length}`, value: 'queue' },
            { label: `已解读 ${catalog.stats.interpretedPapers}`, value: 'interpreted' },
            { label: `全部论文 ${formatNumber(catalog.stats.totalPapers)}`, value: 'catalog' },
          ]}
          onChange={changeView}
        />
      </section>

      <section className="filter-bar papers-filter-bar" aria-label="论文筛选">
        <ImeSafeSearchInput
          className="filter-search"
          allowClear
          placeholder="搜索论文、作者、方向、arXiv ID 或 GitHub 仓库"
          value={query}
          onValueChange={(value) => updateParams({ q: value || undefined, page: undefined, paper: undefined })}
        />
        <Select
          className="filter-select"
          allowClear
          placeholder="全部研究方向"
          value={topic || undefined}
          options={topics.map(([value, label]) => ({ value, label }))}
          onChange={(value) => updateParams({ topic: value, page: undefined, paper: undefined })}
        />
        <Select
          className="filter-select"
          allowClear
          placeholder="全部解读状态"
          value={status || undefined}
          options={Object.entries(reviewLabels).map(([value, label]) => ({ value, label }))}
          onChange={(value) => updateParams({ status: value, page: undefined, paper: undefined })}
        />
        <Select
          className="filter-select"
          value={sort}
          options={[
            { label: '按推荐热度', value: 'heat' },
            { label: '按发布时间', value: 'latest' },
            { label: '按方向相关度', value: 'relevance' },
            { label: '按标题', value: 'title' },
          ]}
          onChange={(value) => updateParams({ sort: value, page: undefined, paper: undefined })}
        />
        {(query || topic || status) && <Button onClick={() => updateParams({ q: undefined, topic: undefined, status: undefined, page: undefined, paper: undefined })}>清空</Button>}
      </section>

      {view === 'recommended' && catalog.trendClusters.length > 0 && (
        <section className="paper-trend-strip" aria-label="趋势证据">
          <div className="section-heading">
            <div><p className="eyebrow">Evidence-backed signals</p><h2>研究趋势证据</h2></div>
            <span className="section-note">论文与项目共同支持后才形成结论</span>
          </div>
          <div className="paper-trend-list">
            {catalog.trendClusters.slice(0, 4).map((cluster) => (
              <article key={cluster.id}>
                <div><Tag color={cluster.evidenceLevel === 'strong' ? 'green' : 'gold'}>{cluster.evidenceLevel === 'strong' ? '强证据' : '研究信号'}</Tag><strong>{cluster.labelZh}</strong></div>
                <p>{cluster.conclusionZh}</p>
                <small>{cluster.paperIds.length} 篇论文 · {cluster.repositories.length} 个项目</small>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="content-section papers-ranking-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{view === 'recommended' ? 'Daily research brief' : view === 'queue' ? 'Reading queue' : view === 'interpreted' ? 'Interpreted papers' : 'Complete catalog'}</p>
            <h2>{view === 'recommended' ? '今日论文推荐' : view === 'queue' ? '分批解读队列' : view === 'interpreted' ? '已完成中文解读' : '全量论文目录'}</h2>
          </div>
          <span className="section-note">{formatNumber(filtered.length)} 条结果</span>
        </div>

        {visible.length ? (
          <>
            <div className="paper-ranking-list">
              <div className="paper-ranking-header" aria-hidden="true">
                <span>序号</span><span>论文与中文解读</span><span>研究方向</span><span>证据</span><span>状态</span><span />
              </div>
              {visible.map((paper, index) => (
                <article className="paper-ranking-row" key={paper.id}>
                  <span className="paper-rank">{String((safePage - 1) * pageSize + index + 1).padStart(2, '0')}</span>
                  <div className="paper-identity">
                    <div className="paper-title-line">
                      <h3>{paper.titleZh || '待中文标题翻译'}</h3>
                      {paper.relatedRepositories.some((link) => link.relation === 'official_code') && <Tag color="green">有官方代码</Tag>}
                    </div>
                    <a href={paper.url} target="_blank" rel="noreferrer">{paper.titleOriginal}</a>
                    <p>{paper.summaryZh || '已完成论文元数据与研究方向收录，等待进入中文解读队列。'}</p>
                    <small>{paper.authors.slice(0, 4).join('、')}{paper.authors.length > 4 ? ` 等 ${paper.authors.length} 位作者` : ''} · {paper.dateSemantics === 'rss_announcement' ? 'RSS 通告 ' : '首发 '}{formatDate(paper.publishedAt)}</small>
                  </div>
                  <div className="paper-topics">{paper.topics.slice(0, 3).map((item) => <Tag key={item.id}>{item.labelZh}</Tag>)}</div>
                  <div className="paper-evidence">
                    <strong>{paper.relatedRepositories.length}</strong>
                    <span>关联项目</span>
                    <small>热度 {paper.heatScore} · 相关度 {paper.score}</small>
                  </div>
                  <div className="paper-status">
                    <Tag color={paper.reviewStatus === 'verified' ? 'green' : paper.reviewStatus === 'interpreted' ? 'blue' : paper.reviewStatus === 'queued' ? 'gold' : undefined}>{reviewLabels[paper.reviewStatus]}</Tag>
                    <span>{readingLabel(paper)}</span>
                  </div>
                  <Button size="small" onClick={() => updateParams({ paper: paper.id })}>详情</Button>
                </article>
              ))}
            </div>
            {filtered.length > pageSize && (
              <Pagination
                className="papers-pagination"
                current={safePage}
                pageSize={pageSize}
                total={filtered.length}
                showSizeChanger={false}
                showLessItems
                onChange={(next) => updateParams({ page: next === 1 ? undefined : String(next), paper: undefined })}
              />
            )}
          </>
        ) : <Empty description="当前条件下没有论文" />}
      </section>

      <Drawer title="论文详情" size={720} open={Boolean(selected)} onClose={() => updateParams({ paper: undefined })}>
        {selected && (
          <article className="detail-stack paper-detail">
            <div className="detail-kicker">
              <Tag color={selected.reviewStatus === 'verified' ? 'green' : selected.reviewStatus === 'interpreted' ? 'blue' : selected.reviewStatus === 'queued' ? 'gold' : undefined}>{reviewLabels[selected.reviewStatus]}</Tag>
              <Tag>{readingLabel(selected)}</Tag>
              <span>arXiv {selected.arxivId}</span>
            </div>
            <h2>{selected.titleZh || '待中文标题翻译'}</h2>
            <a className="repo-link" href={selected.url} target="_blank" rel="noreferrer">{selected.titleOriginal}</a>
            <div className="detail-metrics">
              <div><span>推荐热度</span><strong>{selected.heatScore}</strong></div>
              <div><span>方向相关度</span><strong>{selected.score}</strong></div>
              <div><span>关联项目</span><strong>{selected.relatedRepositories.length}</strong></div>
              <div><span>{selected.dateSemantics === 'rss_announcement' ? 'RSS 通告时间（非首次发表）' : '原始提交时间'}</span><strong>{formatDate(selected.publishedAt)}</strong></div>
            </div>

            <section>
              <h3>中文解读</h3>
              <p>{selected.summaryZh || '尚未进入中文解读流程。当前只展示来源元数据，不生成未经核验的结论。'}</p>
            </section>
            {selected.keyContributionsZh.length > 0 && (
              <section><h3>核心贡献</h3><ul className="plain-list">{selected.keyContributionsZh.map((item) => <li key={item}>{item}</li>)}</ul></section>
            )}
            {selected.industryValueZh && <section><h3>行业价值</h3><p>{selected.industryValueZh}</p></section>}
            {selected.futureOutlookZh && <section><h3>趋势判断</h3><p>{selected.futureOutlookZh}</p></section>}
            {selected.limitationsZh && <section className="paper-limitations"><h3>限制与待验证项</h3><p>{selected.limitationsZh}</p></section>}

            <section>
              <h3>GitHub 与实践证据</h3>
              {selected.relatedRepositories.length ? (
                <div className="paper-repository-list">
                  {selected.relatedRepositories.map((link) => (
                    <div key={`${link.repo}-${link.relation}`}>
                      <div><Tag color={link.relation === 'official_code' ? 'green' : undefined}>{relationLabels[link.relation]}</Tag><a href={link.url} target="_blank" rel="noreferrer">{link.repo}</a></div>
                      <p>{link.labelZh}</p>
                      <a href={link.evidenceUrl} target="_blank" rel="noreferrer">查看关联依据</a>
                    </div>
                  ))}
                </div>
              ) : <p>尚未发现可核验的官方代码或已跟踪关联项目。不会仅凭名称猜测仓库关系。</p>}
            </section>

            <section>
              <h3>来源摘要</h3>
              <p className="paper-original-abstract">{selected.abstractOriginal}</p>
            </section>
            {reviewFeedback?.paperId === selected.id && (
              <Alert
                className="paper-review-feedback"
                type={reviewFeedback.type}
                showIcon
                closable
                message={reviewFeedback.message}
                onClose={() => setReviewFeedback(null)}
              />
            )}
            <div className="detail-actions">
              {isAdmin && !['interpreted', 'verified'].includes(selected.reviewStatus) && (
                <Button
                  type="primary"
                  loading={requestingReviewId === selected.id}
                  disabled={selected.reviewPriority === 'immediate'}
                  onClick={() => void requestImmediateReview(selected)}
                >
                  {selected.reviewPriority === 'immediate' ? '已优先排队' : '立即解读'}
                </Button>
              )}
              <Button href={selected.url} target="_blank">打开 arXiv</Button>
              {selected.pdfUrl && <Button href={selected.pdfUrl} target="_blank">查看 PDF</Button>}
            </div>
          </article>
        )}
      </Drawer>
    </div>
  );
}
