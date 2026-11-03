import { Alert, Button, Popconfirm, Spin, Tag } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { formatDate } from '../data';
import type { RunRecord, Snapshot } from '../types';

interface OperationsPageProps {
  snapshot: Snapshot;
  onPublished: () => void;
}

interface PublishStatus {
  ready: boolean;
  requiresWarningApproval: boolean;
  errors: string[];
  warnings: string[];
  current: { generatedAt?: string; asOf?: { ai: string; github: string; skills: string } };
  preview: null | {
    generatedAt: string;
    asOf: { ai: string; github: string; skills: string };
    counts: { projects: number; aiEvents: number; skills: number; reports: number; weeklySummaries: number };
  };
}

interface SitesPublishStatus {
  state: 'not-prepared' | 'pending' | 'current' | 'deployed';
  message: string;
  requestedAt: string | null;
  deployedAt: string | null;
  deployedVersion: string | null;
  url: string | null;
  asOf?: { ai: string | null; github: string | null; skills: string | null };
  counts?: { projects: number; aiEvents: number; skills: number; catalogSkills: number };
}

const statusLabels: Record<RunRecord['status'], string> = {
  success: '成功',
  warning: '需检查',
  failed: '失败',
  unknown: '无记录',
};

const statusColors: Record<RunRecord['status'], string> = {
  success: 'success',
  warning: 'warning',
  failed: 'error',
  unknown: 'default',
};

export default function OperationsPage({ snapshot, onPublished }: OperationsPageProps) {
  const [publishStatus, setPublishStatus] = useState<PublishStatus | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [sitesStatus, setSitesStatus] = useState<SitesPublishStatus | null>(null);
  const [sitesError, setSitesError] = useState<string | null>(null);
  const [preparingSites, setPreparingSites] = useState(false);
  const issueCount = snapshot.runs.filter((run) => run.status !== 'success').length;
  const reports = [...snapshot.reports].sort((a, b) => b.date.localeCompare(a.date));

  const refreshPublishStatus = useCallback(async () => {
    setLoadingStatus(true);
    setPublishError(null);
    try {
      const response = await fetch('/__admin/publish/status', { cache: 'no-store' });
      const data = await response.json() as PublishStatus & { error?: string };
      if (!response.ok) throw new Error(data.error ?? `预检失败（HTTP ${response.status}）`);
      setPublishStatus(data);
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : '发布预检失败');
    } finally {
      setLoadingStatus(false);
    }
  }, []);

  useEffect(() => {
    void refreshPublishStatus();
  }, [refreshPublishStatus]);

  const refreshSitesStatus = useCallback(async () => {
    setSitesError(null);
    try {
      const response = await fetch('/__admin/sites/status', { cache: 'no-store' });
      const data = await response.json() as SitesPublishStatus & { error?: string };
      if (!response.ok) throw new Error(data.error ?? `Sites 状态读取失败（HTTP ${response.status}）`);
      setSitesStatus(data);
    } catch (error) {
      setSitesError(error instanceof Error ? error.message : 'Sites 状态读取失败');
    }
  }, []);

  useEffect(() => {
    void refreshSitesStatus();
  }, [refreshSitesStatus]);

  const publish = async () => {
    setPublishing(true);
    setPublishError(null);
    setPublishSuccess(null);
    try {
      const response = await fetch('/__admin/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ allowWarnings: publishStatus?.requiresWarningApproval === true }),
      });
      const data = await response.json() as {
        error?: string;
        manifest?: { publishedAt?: string };
        publication?: { publicReady?: boolean; message?: string; config?: { mode?: string } };
      };
      if (!response.ok) throw new Error(data.error ?? `发布失败（HTTP ${response.status}）`);
      const destination = data.publication?.config?.mode === 'local' ? '本机网站' : '网站托管';
      const publicState = data.publication?.publicReady ? '公网已验证。' : '公网尚未验证，日报推送仍需通过公网检查。';
      setPublishSuccess(`main 与${destination}已更新：${formatDate(data.manifest?.publishedAt ?? new Date().toISOString(), true)}。${publicState}`);
      onPublished();
      await refreshPublishStatus();
    } catch (error) {
      setPublishError(error instanceof Error ? error.message : '发布失败');
    } finally {
      setPublishing(false);
    }
  };

  const publishButton = (
    <Button className="publication-action-button" type="primary" loading={publishing} disabled={!publishStatus?.ready} onClick={publishStatus?.requiresWarningApproval ? undefined : publish}>
      发布 main / 网站
    </Button>
  );

  const prepareSites = async () => {
    setPreparingSites(true);
    setSitesError(null);
    try {
      const response = await fetch('/__admin/sites/prepare', { method: 'POST' });
      const data = await response.json() as { error?: string; status?: SitesPublishStatus };
      if (!response.ok || !data.status) throw new Error(data.error ?? `Sites 更新包准备失败（HTTP ${response.status}）`);
      setSitesStatus(data.status);
    } catch (error) {
      setSitesError(error instanceof Error ? error.message : 'Sites 更新包准备失败');
    } finally {
      setPreparingSites(false);
    }
  };

  return (
    <div className="page-stack">
      <section className="page-heading compact-heading">
        <div>
          <p className="eyebrow">Automation operations</p>
          <h1>任务运行</h1>
          <p className="lead">核对抓取任务、结构化产物和发布快照；通过预检后更新网站，公网验证通过后才能推送日报。</p>
        </div>
        <div className="as-of-group">
          <span>数据契约 v{snapshot.schemaVersion}</span>
          <span>{formatDate(snapshot.generatedAt, true)} 生成</span>
        </div>
      </section>

      {issueCount > 0 && <Alert type="warning" showIcon title={`${issueCount} 个任务需要检查`} description="警告和无记录不会被当作成功；发布时必须明确确认仍然存在的警告。" />}

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Publication gate</p>
            <h2>dev → main 发布</h2>
          </div>
          <Button onClick={() => void refreshPublishStatus()} loading={loadingStatus}>重新预检</Button>
        </div>
        <div className="publish-panel">
          {loadingStatus && !publishStatus ? (
            <div className="inline-loading"><Spin /><span>正在执行数据与来源预检</span></div>
          ) : publishStatus ? (
            <>
              <div className="publish-comparison">
                <div>
                  <span>当前 main</span>
                  <strong>AI {formatDate(publishStatus.current.asOf?.ai ?? '')}</strong>
                  <small>GitHub {formatDate(publishStatus.current.asOf?.github ?? '')} · Skill {formatDate(publishStatus.current.asOf?.skills ?? '')}</small>
                </div>
                <div>
                  <span>待发布 dev</span>
                  <strong>AI {formatDate(publishStatus.preview?.asOf.ai ?? '')}</strong>
                  <small>GitHub {formatDate(publishStatus.preview?.asOf.github ?? '')} · Skill {formatDate(publishStatus.preview?.asOf.skills ?? '')}</small>
                </div>
                <div>
                  <span>发布内容</span>
                  <strong>{publishStatus.preview?.counts.aiEvents ?? 0} 条 AI 事件</strong>
                  <small>{publishStatus.preview?.counts.projects ?? 0} 个项目 · {publishStatus.preview?.counts.skills ?? 0} 个 Skill · {publishStatus.preview?.counts.reports ?? 0} 份报告</small>
                </div>
              </div>
              {publishStatus.errors.length > 0 && <Alert type="error" showIcon title="预检未通过" description={publishStatus.errors.join('；')} />}
              {publishStatus.warnings.length > 0 && <Alert type="warning" showIcon title="发布前需要确认" description={publishStatus.warnings.join('；')} />}
              {publishSuccess && <Alert type="success" showIcon title={publishSuccess} />}
              {publishError && <Alert type="error" showIcon title={publishError} />}
              <div className="publish-actions">
                {publishStatus.requiresWarningApproval ? (
                  <Popconfirm title="确认保留当前警告并发布？" description="警告会写入发布清单，main 仍会保留真实任务状态。" okText="确认发布" cancelText="取消" onConfirm={publish}>
                    {publishButton}
                  </Popconfirm>
                ) : publishButton}
                <span>{publishStatus.ready ? '预检通过' : '存在阻断错误'}</span>
              </div>
            </>
          ) : publishError ? <Alert type="error" showIcon title={publishError} /> : null}
        </div>
      </section>

      <section className="content-section sites-publish-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Personal Sites copy</p>
            <h2>Sites 独立更新</h2>
          </div>
          <Tag color={sitesStatus?.state === 'deployed' || sitesStatus?.state === 'current' ? 'success' : sitesStatus?.state === 'pending' ? 'warning' : 'default'}>
            {sitesStatus?.state === 'deployed' ? '已部署' : sitesStatus?.state === 'current' ? '数据一致' : sitesStatus?.state === 'pending' ? '待部署' : '未准备'}
          </Tag>
        </div>
        <div className="sites-publish-row">
          <div>
            <strong>{sitesStatus?.message ?? '正在读取 Sites 状态…'}</strong>
            <p>Sites 仅供个人存储，独立于 main 公网站点；此处只生成并校验更新包，云端部署需在 Codex 中完成。</p>
            {sitesStatus?.asOf && (
              <small>AI {formatDate(sitesStatus.asOf.ai ?? '')} · GitHub {formatDate(sitesStatus.asOf.github ?? '')} · Skill {formatDate(sitesStatus.asOf.skills ?? '')}</small>
            )}
          </div>
          <Button loading={preparingSites} onClick={() => void prepareSites()}>准备 Sites 更新</Button>
        </div>
        {sitesStatus?.requestedAt && <span className="section-note">最近准备：{formatDate(sitesStatus.requestedAt, true)}{sitesStatus.deployedVersion ? ` · Sites v${sitesStatus.deployedVersion}` : ''}</span>}
        {sitesError && <Alert type="error" showIcon title={sitesError} />}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Scheduled runs</p>
            <h2>定时任务状态</h2>
          </div>
        </div>
        <div className="run-list">
          {snapshot.runs.map((run) => (
            <article className="run-row" key={run.id}>
              <div className={`status-indicator status-${run.status}`} aria-hidden="true" />
              <div className="run-main">
                <div className="row-title-line">
                  <h3>{run.name}</h3>
                  <Tag color={statusColors[run.status]}>{statusLabels[run.status]}</Tag>
                </div>
                <p>{run.message}</p>
                <div className="run-meta">
                  <span>{run.schedule}</span>
                  <span>最近成功：{formatDate(run.lastSuccess, true)}</span>
                </div>
              </div>
              {run.artifact && <Button href={run.artifact} target="_blank">查看产物</Button>}
            </article>
          ))}
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Published artifacts</p>
            <h2>历史报告</h2>
          </div>
          <span className="section-note">{reports.length} 份</span>
        </div>
        <div className="report-list">
          {reports.map((report) => (
            <a className="report-row" href={report.path} target="_blank" rel="noreferrer" key={report.id}>
              <div>
                <strong>{report.title}</strong>
                <span>{report.channel === 'ai' ? 'AI 事件' : report.channel === 'skills' ? 'Skill 目录' : 'GitHub Radar'}</span>
              </div>
              <span>{formatDate(report.date)}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
