import { Alert, Button, Empty, Tag } from 'antd';
import { aiEventEditionDate, formatDate } from '../data';
import type { RouteName } from '../router';
import type { BriefAction, Highlight, Snapshot } from '../types';

interface TodayPageProps {
  snapshot: Snapshot;
  isAdmin: boolean;
  navigate: (route: RouteName, params?: URLSearchParams) => void;
}

const priorityLabels: Record<BriefAction['priority'], string> = {
  high: '优先',
  medium: '关注',
  low: '观察',
};

function shanghaiDate(value: string | null) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value.slice(0, 10);
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function actionMatchesHighlight(action: BriefAction, highlights: Highlight[]) {
  const highlightPrefix = action.id.replace(/^action-/, 'highlight-');
  return highlights.some((highlight) => highlight.id === highlightPrefix || highlight.id.startsWith(`${highlightPrefix}-`));
}

export default function TodayPage({ snapshot, isAdmin, navigate }: TodayPageProps) {
  const today = snapshot.brief.date;
  const todayHighlights = snapshot.brief.highlights.filter((highlight) => highlight.date === today);
  const todayActions = snapshot.brief.actions.filter((action) => actionMatchesHighlight(action, todayHighlights));
  const todayAiEvents = snapshot.aiEvents.filter((event) => aiEventEditionDate(event) === today);
  const todayProjects = snapshot.projects.filter((project) => project.sourceReportId === `github-${today}`);
  const todaySkills = snapshot.skills.filter((skill) => skill.date === today);
  const todayReports = snapshot.reports.filter((report) => report.date === today);
  const successfulRuns = snapshot.runs.filter((run) => run.status === 'success' && shanghaiDate(run.lastSuccess) === today).length;
  const aiLagDays = Math.round(
    (new Date(`${snapshot.asOf.github}T00:00:00+08:00`).getTime() - new Date(`${snapshot.asOf.ai}T00:00:00+08:00`).getTime()) / 86_400_000,
  );

  return (
    <div className="page-stack today-page">
      <section className="page-heading today-heading">
        <div>
          <p className="eyebrow">Daily intelligence · {formatDate(today)}</p>
          <h1>今日情报</h1>
          <p className="lead">
            仅显示 {formatDate(today)} 当日发生或完成核验的内容，共 {todayHighlights.length} 条关键信号。
          </p>
        </div>
        <div className="as-of-group" aria-label="今日数据日期">
          <span>GitHub {formatDate(snapshot.asOf.github)}</span>
          <span>AI {formatDate(snapshot.asOf.ai)}</span>
        </div>
      </section>

      {aiLagDays > 0 && (
        <Alert
          type="warning"
          showIcon
          title={`AI 数据比 GitHub 数据晚 ${aiLagDays} 天`}
          description="今日页不会使用历史 AI 事件补齐数量，请等待当日 AI 抓取完成。"
          action={isAdmin ? <Button onClick={() => navigate('operations')}>查看任务</Button> : undefined}
        />
      )}

      <section className="metric-strip" aria-label="今日数据概览">
        <div className="metric-cell">
          <span>GitHub 项目</span>
          <strong>{todayProjects.length}</strong>
          <small>当日 Radar 核验</small>
        </div>
        <div className="metric-cell">
          <span>AI 事件</span>
          <strong>{todayAiEvents.length}</strong>
          <small>今日完成收录与核验</small>
        </div>
        <div className="metric-cell">
          <span>Skill 热榜</span>
          <strong>{todaySkills.length}</strong>
          <small>skills.sh 24h 趋势</small>
        </div>
        <div className="metric-cell">
          <span>关键信号</span>
          <strong>{todayHighlights.length}</strong>
          <small>{successfulRuns}/{snapshot.runs.length} 个任务今日成功</small>
        </div>
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Action queue</p>
            <h2>今天先处理什么</h2>
          </div>
          {isAdmin && snapshot.candidates.length > 0 && (
            <Button onClick={() => navigate('watchlist')}>{snapshot.candidates.length} 个待核验项目</Button>
          )}
        </div>
        {todayActions.length ? (
          <div className="action-list">
            {todayActions.map((action, index) => (
              <article className="action-row" key={action.id}>
                <span className="row-index">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  <div className="row-title-line">
                    <h3>{action.title}</h3>
                    <Tag color={action.priority === 'high' ? 'error' : action.priority === 'medium' ? 'warning' : 'default'}>
                      {priorityLabels[action.priority]}
                    </Tag>
                  </div>
                  <p>{action.reason}</p>
                </div>
              </article>
            ))}
          </div>
        ) : <Empty description="今天暂无需要立即处理的动作" />}
      </section>

      <section className="content-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Signal review</p>
            <h2>今日关键变化</h2>
          </div>
          <span className="section-note">仅限 {formatDate(today)}</span>
        </div>
        {todayHighlights.length ? (
          <div className="highlight-grid">
            {todayHighlights.map((highlight) => (
              <article className="signal-card" key={highlight.id}>
                <div className="signal-meta">
                  <Tag color={highlight.channel === 'ai' ? 'error' : highlight.channel === 'skills' ? 'processing' : 'default'}>
                    {highlight.channel === 'ai' ? 'AI 事件' : highlight.channel === 'skills' ? 'Skill 趋势' : 'GitHub'}
                  </Tag>
                  <span>{formatDate(highlight.date)}</span>
                </div>
                <h3>{highlight.title}</h3>
                <p>{highlight.summary}</p>
                <div className="decision-note">
                  <span>下一步</span>
                  <p>{highlight.action}</p>
                </div>
                <Button type="link" onClick={() => navigate(highlight.channel as RouteName)}>查看依据</Button>
              </article>
            ))}
          </div>
        ) : <Empty description="今天尚未产生达到发布门槛的关键信号" />}
      </section>

      <section className="content-section today-sources-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Source coverage</p>
            <h2>今日数据来源</h2>
          </div>
          {isAdmin && <Button onClick={() => navigate('watchlist')}>管理来源</Button>}
        </div>
        <div className="today-source-summary">
          <div><strong>{todayProjects.length}</strong><span>GitHub 官方仓库</span></div>
          <div><strong>{todayAiEvents.flatMap((event) => event.sources).length}</strong><span>AI 原始来源</span></div>
          <div><strong>{todaySkills.length}</strong><span>Skill 来源页面</span></div>
          <div><strong>{todayReports.length}</strong><span>当日结构化报告</span></div>
        </div>
      </section>
    </div>
  );
}
