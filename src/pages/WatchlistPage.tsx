import { Alert, Button, Cascader, Empty, Form, Input, Modal, Popconfirm, Select, Tag } from 'antd';
import { useState } from 'react';
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
import type { CreatorWatch, Snapshot } from '../types';

interface WatchlistPageProps {
  snapshot: Snapshot;
  params: URLSearchParams;
  followed: Set<string>;
  updateParams: (patch: Record<string, string | undefined | null>) => void;
  toggleFollow: (projectId: string) => void;
  onCandidateChanged: () => void;
}

interface SourceFormValues {
  name: string;
  kind: 'official' | 'media' | 'creator' | 'community';
  status: 'official_priority' | 'followed' | 'observe_new';
  priority: 1 | 2 | 3;
  url: string;
  focus: string;
  why: string;
  seedLinks?: string;
}

const creatorStatusLabels: Record<string, string> = {
  official_priority: '官方优先',
  followed: '重点关注',
  observe_new: '观察中',
};

const sourceKinds: Record<string, string> = {
  official: '官方来源',
  media: '可信媒体',
  creator: '创作者渠道',
  community: '社区信号',
};

const candidateStatus: Record<string, { label: string; color: string }> = {
  pending: { label: '待核验', color: 'gold' },
  verified: { label: '已核验', color: 'blue' },
  approved: { label: '已通过', color: 'green' },
  observe: { label: '继续观察', color: 'cyan' },
  rejected: { label: '已驳回', color: 'default' },
};

const candidateOrder: Record<string, number> = { pending: 0, verified: 1, observe: 2, approved: 3, rejected: 4 };
const sourceKindOrder = ['official', 'media', 'creator', 'community'];
const modelRelationshipLabels = {
  'official-base-model': '官方基座',
  'official-derivative': '官方衍生',
  'community-finetune': '社区微调',
} as const;
const modelReleaseLabels = {
  'open-source': '开放源码',
  'open-weight': '开放权重',
} as const;
const modelAccessLabels = {
  public: '公开访问',
  gated: '申请访问',
} as const;

function inferSourceKind(source: CreatorWatch) {
  if (source.kind) return source.kind;
  return source.status === 'official_priority' ? 'official' : 'creator';
}

function splitList(value = '') {
  return value.split(/[\n,，]/).map((item) => item.trim()).filter(Boolean);
}

function matchesProjectText(values: Array<string | undefined>, query: string) {
  return !query || values.join(' ').toLowerCase().includes(query.trim().toLowerCase());
}

export default function WatchlistPage({ snapshot, params, followed, updateParams, toggleFollow, onCandidateChanged }: WatchlistPageProps) {
  const [savingId, setSavingId] = useState<string | null>(null);
  const [decisionError, setDecisionError] = useState<string | null>(null);
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [sourceSaving, setSourceSaving] = useState(false);
  const [sourceError, setSourceError] = useState<string | null>(null);
  const [sourceForm] = Form.useForm<SourceFormValues>();
  const query = params.get('q') ?? '';
  const categoryPath = parseGithubTaxonomyKey(params.get('category') ?? '');
  const level = params.get('level') ?? '';
  const sort = params.get('sort') ?? 'activity';
  const followedProjects = snapshot.projects.filter((project) => followed.has(project.id));
  const projectTaxonomy = new Map(followedProjects.map((project) => [project.id, classifyGithubRecord(project)]));
  const projectLevels = [...new Set(followedProjects.map((project) => project.level))].sort();
  const projects = followedProjects
    .filter((project) => matchesProjectText([
      project.name,
      project.repo,
      project.summary,
      githubTaxonomyLabel(projectTaxonomy.get(project.id) ?? []),
      ...(project.priorityDomains ?? []),
    ], query))
    .filter((project) => matchesGithubTaxonomy(projectTaxonomy.get(project.id) ?? [], categoryPath))
    .filter((project) => !level || project.level === level)
    .sort((left, right) => {
      if (sort === 'stars') return right.stars - left.stars;
      if (sort === 'delta') return right.starsDelta - left.starsDelta || right.stars - left.stars;
      if (sort === 'name') return left.name.localeCompare(right.name, 'zh-CN');
      return right.lastActivity.localeCompare(left.lastActivity) || right.starsDelta - left.starsDelta;
    });
  const sources = [...snapshot.watchlist].sort((a, b) => a.priority - b.priority || a.name.localeCompare(b.name));
  const models = [...(snapshot.modelWatchlist ?? [])].sort((a, b) => {
    if (a.level !== b.level) return a.level.localeCompare(b.level);
    return a.name.localeCompare(b.name, 'zh-CN');
  });
  const candidates = [...snapshot.candidates].sort((a, b) => (candidateOrder[a.status] ?? 9) - (candidateOrder[b.status] ?? 9) || a.name.localeCompare(b.name));
  const unresolvedCount = candidates.filter((candidate) => ['pending', 'verified'].includes(candidate.status)).length;
  const sourceGroups = sourceKindOrder
    .map((kind) => [kind, sources.filter((source) => inferSourceKind(source) === kind)] as const)
    .filter(([, items]) => items.length > 0);

  const decideCandidate = async (id: string, status: 'approved' | 'observe' | 'rejected') => {
    setSavingId(id);
    setDecisionError(null);
    try {
      const response = await fetch('/__admin/candidates/decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      const payload = await response.json() as { error?: string };
      if (!response.ok) throw new Error(payload.error ?? '候选状态保存失败');
      onCandidateChanged();
    } catch (error) {
      setDecisionError(error instanceof Error ? error.message : '候选状态保存失败');
    } finally {
      setSavingId(null);
    }
  };

  const saveSource = async () => {
    const values = await sourceForm.validateFields();
    setSourceSaving(true);
    setSourceError(null);
    try {
      const response = await fetch('/__admin/sources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name,
          kind: values.kind,
          status: values.status,
          priority: values.priority,
          url: values.url,
          focus: splitList(values.focus),
          why: values.why,
          seed_links: splitList(values.seedLinks),
        }),
      });
      const payload = await response.json() as { error?: string; errors?: string[] };
      if (!response.ok) throw new Error(payload.errors?.join('；') ?? payload.error ?? '来源保存失败');
      sourceForm.resetFields();
      setSourceModalOpen(false);
      onCandidateChanged();
    } catch (error) {
      setSourceError(error instanceof Error ? error.message : '来源保存失败');
    } finally {
      setSourceSaving(false);
    }
  };

  return (
    <div className="page-stack watchlist-page">
      <section className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Personal watchlist</p>
          <h1>我的关注</h1>
          <p className="lead">集中浏览已关注项目，并维护采集来源与待核验线索。</p>
        </div>
        <div className="as-of-group">
          <span>{followedProjects.length} 个关注项目</span>
          <span>{models.length} 个开放模型</span>
          <span>{sources.length} 个 AI 来源</span>
          <span>{unresolvedCount} 个待处理线索</span>
        </div>
      </section>

      <section className="content-section followed-project-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Repository watch</p>
            <h2>关注项目</h2>
          </div>
          <span className="section-note">{projects.length} 条结果</span>
        </div>
        <div className="filter-bar watch-filter-bar" aria-label="关注项目筛选">
          <ImeSafeSearchInput
            className="filter-search"
            allowClear
            placeholder="搜索项目、仓库、方向或目录"
            value={query}
            onValueChange={(value) => updateParams({ q: value || undefined })}
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
              updateParams({ category: nextPath.length ? githubTaxonomyKey(nextPath) : undefined });
            }}
          />
          <Select
            className="filter-select short-select"
            allowClear
            placeholder="全部等级"
            value={level || undefined}
            options={projectLevels.map((name) => ({ label: name, value: name }))}
            onChange={(value) => updateParams({ level: value })}
          />
          <Select
            className="filter-select"
            value={sort}
            options={[
              { label: '按最近活动', value: 'activity' },
              { label: '按快照增量', value: 'delta' },
              { label: '按 Stars', value: 'stars' },
              { label: '按名称', value: 'name' },
            ]}
            onChange={(value) => updateParams({ sort: value === 'activity' ? undefined : value })}
          />
          {(query || categoryPath.length || level) && (
            <Button onClick={() => updateParams({ q: undefined, category: undefined, level: undefined })}>清空</Button>
          )}
        </div>
        {projects.length ? (
          <div className="watch-projects">
            {projects.map((project) => (
              <article className="watch-row" key={project.id}>
                <div>
                  <div className="row-title-line">
                    <h3>{project.name}</h3>
                    <Tag color={project.level.includes('A') ? 'green' : 'blue'}>{project.level}</Tag>
                    {project.trackingStatus === 'delisted' && <Tag>已下架 · {formatDate(project.delistedAt ?? '')}</Tag>}
                  </div>
                  <a href={project.url} target="_blank" rel="noreferrer">{project.repo}</a>
                  <p>{project.summary}</p>
                  <div className="watch-project-taxonomy">{githubTaxonomyLabel(projectTaxonomy.get(project.id) ?? [])}</div>
                </div>
                <div className="watch-row-side">
                  <strong className={project.trackingStatus === 'delisted' ? undefined : 'positive'}>{project.trackingStatus === 'delisted' ? '—' : `+${formatNumber(project.starsDelta)}`}</strong>
                  <span>{formatNumber(project.stars)} Stars</span>
                  <span>{project.trackingStatus === 'delisted' ? `下架 ${formatDate(project.delistedAt ?? '')}` : `更新 ${formatDate(project.lastActivity)}`}</span>
                  <div className="watch-row-actions">
                    <Button size="small" href={project.url} target="_blank" rel="noreferrer">打开项目</Button>
                    <Button size="small" onClick={() => toggleFollow(project.id)}>移除</Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty description={followedProjects.length ? '当前筛选下没有项目' : '尚未关注项目，可在 GitHub Radar 中添加'} />
        )}
      </section>

      <section className="content-section model-watch-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Open model watch</p>
            <h2>开放模型关注</h2>
          </div>
          <span className="section-note">{models.length} 个模型</span>
        </div>
        <p className="section-intro">
          跟踪与生成式设计、3D、视频、世界模型和物理 AI 相关的模型发布。开放源码、开放权重、官方版本与社区微调分别标注。
        </p>
        {models.length ? (
          <div className="watch-projects">
            {models.map((model) => (
              <article className="watch-row model-watch-row" key={model.id}>
                <div>
                  <div className="row-title-line">
                    <h3>{model.name}</h3>
                    <Tag color={model.level.includes('A') ? 'green' : 'blue'}>{model.level}</Tag>
                    <Tag>{modelReleaseLabels[model.releaseType]}</Tag>
                    <Tag>{modelRelationshipLabels[model.relationship]}</Tag>
                    <Tag color={model.access === 'gated' ? 'gold' : 'default'}>{modelAccessLabels[model.access]}</Tag>
                  </div>
                  <a href={model.url} target="_blank" rel="noreferrer">{model.modelId}</a>
                  <p>{model.summaryZh}</p>
                  <p className="model-value-note"><strong>行业价值：</strong>{model.valueZh}</p>
                  <div className="tag-line model-task-line">
                    {model.tasks.map((task) => <Tag key={task}>{task}</Tag>)}
                  </div>
                  <p className="model-risk-note"><strong>限制：</strong>{model.riskNoteZh}</p>
                  {model.relatedRepositories.length > 0 && (
                    <div className="model-related-links">
                      {model.relatedRepositories.map((repository) => (
                        <a href={repository.url} target="_blank" rel="noreferrer" key={repository.repo}>
                          {repository.roleZh} · {repository.repo}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
                <div className="watch-row-side model-watch-side">
                  <strong>{model.license}</strong>
                  {model.metrics.downloadsTracked && model.metrics.downloadsLastMonth != null
                    ? <span>{formatNumber(model.metrics.downloadsLastMonth)} 月下载</span>
                    : <span>下载量未公开</span>}
                  {model.metrics.likes != null && <span>{formatNumber(model.metrics.likes)} Likes</span>}
                  <span>核验 {formatDate(model.reviewedAt)}</span>
                  <Button size="small" href={model.url} target="_blank" rel="noreferrer">打开模型页</Button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <Empty description="尚未录入开放模型" />
        )}
      </section>

      <section className="content-section source-management-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Daily source directory</p>
            <h2>AI 每日数据来源</h2>
          </div>
          <Button type="primary" onClick={() => { setSourceError(null); setSourceModalOpen(true); }}>新增渠道</Button>
        </div>
        <div className="source-metrics" aria-label="来源结构统计">
          {sourceKindOrder.map((kind) => (
            <div key={kind}>
              <strong>{sources.filter((source) => inferSourceKind(source) === kind).length}</strong>
              <span>{sourceKinds[kind]}</span>
            </div>
          ))}
        </div>
        <div className="source-directory">
          {sourceGroups.map(([kind, items]) => (
            <section className="source-group" key={kind}>
              <div className="source-group-heading">
                <h3>{sourceKinds[kind]}</h3>
                <span>{items.length} 个渠道</span>
              </div>
              <div className="source-list-rows">
                {items.map((source) => (
                  <article className="source-row" key={`${source.name}-${source.url}`}>
                    <div className="source-row-main">
                      <div className="row-title-line">
                        <h3><a href={source.url} target="_blank" rel="noreferrer">{source.name}</a></h3>
                        <Tag color={source.status === 'official_priority' ? 'error' : source.status === 'followed' ? 'default' : 'gold'}>
                          {creatorStatusLabels[source.status] ?? source.status}
                        </Tag>
                      </div>
                      <p>{source.why}</p>
                      <div className="tag-line">{source.focus.map((item) => <Tag key={item}>{item}</Tag>)}</div>
                    </div>
                    <div className="source-row-meta">
                      <span>P{source.priority}</span>
                      <small>检查 {formatDate(source.last_seen_at)}</small>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Verification queue</p>
            <h2>GitHub 入库候选</h2>
          </div>
          <span className="section-note">待处理 {unresolvedCount} · 已决策 {candidates.length - unresolvedCount}</span>
        </div>
        {decisionError && <Alert className="candidate-alert" type="error" showIcon closable message={decisionError} onClose={() => setDecisionError(null)} />}
        {candidates.length ? (
          <div className="candidate-list">
            {candidates.map((candidate) => (
              <article className="candidate-row" data-candidate-id={candidate.id} key={candidate.id}>
                <div className="row-title-line">
                  <h3>{candidate.name}</h3>
                  <Tag color={candidateStatus[candidate.status]?.color ?? 'default'}>{candidateStatus[candidate.status]?.label ?? candidate.status}</Tag>
                </div>
                <p>{candidate.reason}</p>
                <small>线索来源：{candidate.source}</small>
                <div className="candidate-actions">
                  <Button size="small" type={candidate.status === 'approved' ? 'primary' : 'default'} loading={savingId === candidate.id} onClick={() => decideCandidate(candidate.id, 'approved')}>通过</Button>
                  <Button size="small" type={candidate.status === 'observe' ? 'primary' : 'default'} disabled={savingId === candidate.id} onClick={() => decideCandidate(candidate.id, 'observe')}>观察</Button>
                  <Popconfirm title="驳回这个候选？" description="后续抓取会跳过它，除非出现新的可靠证据。" okText="驳回" cancelText="取消" onConfirm={() => decideCandidate(candidate.id, 'rejected')}>
                    <Button size="small" danger type={candidate.status === 'rejected' ? 'primary' : 'default'} disabled={savingId === candidate.id}>驳回</Button>
                  </Popconfirm>
                </div>
              </article>
            ))}
          </div>
        ) : <Empty description="当前没有待核验候选" />}
      </section>

      <Modal
        title="新增 AI 数据渠道"
        open={sourceModalOpen}
        confirmLoading={sourceSaving}
        okText="保存渠道"
        cancelText="取消"
        onOk={() => void saveSource()}
        onCancel={() => setSourceModalOpen(false)}
        destroyOnHidden
      >
        {sourceError && <Alert className="source-form-alert" type="error" showIcon message={sourceError} />}
        <Form form={sourceForm} layout="vertical" initialValues={{ kind: 'official', status: 'official_priority', priority: 1 }}>
          <Form.Item name="name" label="渠道名称" rules={[{ required: true }, { min: 2, max: 80 }]}>
            <Input placeholder="例如 OpenAI News" />
          </Form.Item>
          <div className="source-form-grid">
            <Form.Item name="kind" label="来源类型" rules={[{ required: true }]}>
              <Select options={sourceKindOrder.map((kind) => ({ label: sourceKinds[kind], value: kind }))} />
            </Form.Item>
            <Form.Item name="status" label="跟踪状态" rules={[{ required: true }]}>
              <Select options={[
                { label: '官方优先', value: 'official_priority' },
                { label: '重点关注', value: 'followed' },
                { label: '观察中', value: 'observe_new' },
              ]} />
            </Form.Item>
            <Form.Item name="priority" label="抓取优先级" rules={[{ required: true }]}>
              <Select options={[1, 2, 3].map((value) => ({ label: `P${value}`, value }))} />
            </Form.Item>
          </div>
          <Form.Item name="url" label="渠道地址" rules={[{ required: true }, { type: 'url' }]}>
            <Input placeholder="https://" />
          </Form.Item>
          <Form.Item name="focus" label="关注方向" rules={[{ required: true }]}>
            <Input.TextArea rows={2} placeholder="用逗号分隔，例如：模型发布，AI Agent，开发工具" />
          </Form.Item>
          <Form.Item name="why" label="收录原因" rules={[{ required: true }, { min: 8, max: 400 }]}>
            <Input.TextArea rows={3} placeholder="说明该渠道提供什么独特、可核验的信息" />
          </Form.Item>
          <Form.Item name="seedLinks" label="种子链接">
            <Input.TextArea rows={2} placeholder="可选，每行一个 HTTPS 链接" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
