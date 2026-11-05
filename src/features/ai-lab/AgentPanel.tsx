import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LabApiError, defaultExecutionMode, errorMessage, executionModeLabel, generationAvailable, isActiveJob, jobExecutionMode, knownJobExecutionMode, request, type ExecutionMode, type LabAsset, type LabHealth, type LabJob, type LabJobEvent, type LabJobEvents } from './api';
import StudioIcon from './StudioIcon';

const phases = ['尺寸核对', '识别结构', '搭建空间', '检查复核', '方案完成'];
const phaseIndex: Record<string, number> = { queued: 0, awaiting_codex: 0, awaiting_input: 0, analyzing: 0, analysis: 0, scale_estimation: 0, scale_check: 0, structure: 1, furnishing: 2, building: 2, compiling: 2, preview: 2, validating: 3, geometry_repair: 3, visual_review: 3, visual_repair: 3, awaiting_review_images: 3, saved: 4, completed: 4, succeeded: 4 };

function publicEvent(value: unknown): LabJobEvent | null {
  if (!value || typeof value !== 'object') return null;
  const event = value as Record<string, unknown>;
  if (!(typeof event.id === 'string' || typeof event.id === 'number') || !['stage', 'agent_message', 'status'].includes(String(event.type)) || typeof event.message !== 'string') return null;
  return { id: event.id, type: event.type as LabJobEvent['type'], message: event.message.slice(0, 1600), stage: typeof event.stage === 'string' ? event.stage.slice(0, 80) : undefined, at: typeof event.at === 'string' ? event.at : undefined };
}

function useJobEvents(job: LabJob | null) {
  const [events, setEvents] = useState<LabJobEvent[]>([]);
  const [error, setError] = useState('');
  const [retry, setRetry] = useState(0);
  const latest = useRef(job); latest.current = job;
  useEffect(() => {
    setEvents([]); setError('');
    if (!job?.id) return;
    const id = job.id;
    let disposed = false, cursor: string | number = 0;
    let timer: number | undefined;
    const controller = new AbortController();
    const poll = async () => {
      try {
        const response = await request<LabJobEvents>(`/jobs/${encodeURIComponent(id)}/events?after=${encodeURIComponent(cursor)}`, { signal: controller.signal });
        if (disposed) return;
        const incoming = Array.isArray(response.events) ? response.events.map(publicEvent).filter((item): item is LabJobEvent => Boolean(item)) : [];
        setEvents((current) => {
          const seen = new Set(current.map((item) => String(item.id)));
          return [...current, ...incoming.filter((item) => { const key = String(item.id); if (seen.has(key)) return false; seen.add(key); return true; })].slice(-300);
        });
        if (typeof response.cursor === 'number' || typeof response.cursor === 'string') cursor = response.cursor;
        setError('');
        if (response.hasMore || (!response.terminal && isActiveJob(latest.current))) timer = window.setTimeout(poll, response.hasMore ? 30 : 1400);
      } catch (reason) {
        if (disposed) return;
        if (reason instanceof LabApiError && reason.status === 404 && !job.pipelineVersion?.startsWith('codex-handoff')) return;
        setError(errorMessage(reason));
        if (isActiveJob(latest.current)) timer = window.setTimeout(poll, 3500);
      }
    };
    void poll();
    return () => { disposed = true; controller.abort(); window.clearTimeout(timer); };
  }, [job?.id, retry]);
  const fallback = (job?.events || []).slice(-300).map((event, index) => publicEvent(event) || { id: `history-${index}`, type: 'stage' as const, message: (typeof event === 'string' ? event : typeof event?.message === 'string' ? event.message : '').slice(0, 1600), stage: typeof event === 'object' ? event?.stage : undefined }).filter((event) => event.message);
  return { events: events.length ? events : fallback, error, retry: () => setRetry((value) => value + 1) };
}

export default function AgentPanel({ job, health, asset, title, prompt, busy, working, readOnly, onTitle, onPrompt, onUpload, onSubmit, onCancel, onScale, executionMode, onExecutionMode, children }: {
  job: LabJob | null; health: LabHealth | null; asset: LabAsset | null; title: string; prompt: string; busy: string | null; working: boolean; readOnly: boolean;
  executionMode?: ExecutionMode; onExecutionMode?: (mode: ExecutionMode) => void;
  onTitle: (value: string) => void; onPrompt: (value: string) => void; onUpload: () => void; onSubmit: () => void; onCancel: () => void; onScale: () => void; children?: ReactNode;
}) {
  const { events, error, retry } = useJobEvents(job);
  const [copyStatus, setCopyStatus] = useState('');
  useEffect(() => setCopyStatus(''), [job?.id]);
  const active = isActiveJob(job), needsInput = job?.status === 'awaiting_input';
  const selectedMode = executionMode || defaultExecutionMode(health);
  const knownMode = knownJobExecutionMode(job);
  const actualMode = jobExecutionMode(job, selectedMode);
  const guideMode = job && (active || readOnly) ? actualMode : selectedMode;
  const composerMode = active ? actualMode : selectedMode;
  const canGenerate = generationAvailable(health, composerMode);
  const sourceLabel = job && !knownMode ? '历史任务（执行方式未记录）' : actualMode === 'api' ? 'API 自动执行' : '当前 Codex 聊天接力';
  const recorded = new Set(events.map((event) => phaseIndex[event.stage || '']).filter((index) => index !== undefined));
  const current = job?.status === 'succeeded' ? 4 : job?.status === 'awaiting_review_images' ? 3 : phaseIndex[job?.stage || job?.status || ''];
  const status = job?.status === 'awaiting_codex' ? actualMode === 'api' ? '等待服务继续处理' : '等待当前 Codex 聊天接力' : needsInput || job?.status === 'needs_input' ? '需要补充尺寸依据' : job?.status === 'failed' ? '本次任务未完成' : job?.status === 'cancelled' ? '任务已取消' : job?.status === 'succeeded' ? '方案已完成' : active ? '任务进行中' : '准备创建空间';
  return <>
    <div className="lab-agent-stage-strip" aria-label="建模阶段">{phases.map((label, index) => <div key={label} className={(recorded.has(index) ? ' is-recorded' : '') + (current === index ? ' is-current' : '')} aria-current={current === index ? 'step' : undefined}><span>{job?.status === 'succeeded' && index === 4 ? <StudioIcon name="check" size={12}/> : index + 1}</span><small>{label}</small></div>)}</div>
    <div className="lab-agent-timeline" aria-label="Agent 任务时间线" aria-live="polite">
      <div className="lab-agent-message is-guide"><span className="lab-agent-avatar"><StudioIcon name="spark" size={16}/></span><div><strong>空间建模助手 <small>使用引导</small></strong><p>{readOnly ? '这里显示已提交任务的真实记录。当前方案可在画布中本地编辑，完成后保存。' : job && active && !knownMode ? '这里展示已有任务的真实进展。该历史任务未记录执行方式。' : guideMode === 'api' ? '上传平面图，描述空间要求。API 将自动执行分析、结构与家具重建，并在浏览器提交实际预览后继续复核。这里显示真实任务进展。' : '上传平面图，描述空间要求。任务将交给当前 Codex 聊天接力执行，这里显示实际进度与结果。'}</p>{!readOnly && <p>可先使用自动比例；尺寸依据不足时，再通过画布左下角的比例尺补充。</p>}</div></div>
      {job && <div className="lab-agent-request"><span>本次要求 · {sourceLabel}</span><p>{job.input?.prompt || '根据已提交的平面图构建空间。'}</p>{job.sourceAsset && <small><StudioIcon name="plan" size={13}/>{job.sourceAsset.name}</small>}</div>}
      {events.map((event) => <div className={'lab-agent-message is-' + event.type} key={String(event.id)}><span className="lab-agent-avatar"><StudioIcon name={event.type === 'agent_message' ? 'spark' : 'clock'} size={14}/></span><div><strong>{event.type === 'agent_message' ? !knownMode && job ? '任务进展' : actualMode === 'api' ? 'API 执行进展' : 'Codex 接力进展' : '任务记录'}{event.at && Number.isFinite(Date.parse(event.at)) && <time dateTime={event.at}>{new Date(event.at).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</time>}</strong><p>{event.message}</p></div></div>)}
      {actualMode === 'codex_handoff' && job?.status === 'awaiting_codex' && <div className="lab-agent-handoff"><StudioIcon name="clock" size={16}/><div><strong>等待当前聊天接力</strong><p>请回到当前 Codex 聊天继续处理此任务。网页不会自行开始推理。</p><code>任务 {job.id}</code><button className="lab-button" type="button" onClick={async () => { try { await navigator.clipboard.writeText(`请继续 Floorplan-Editor 的 Codex 接力任务：${job.id}（项目 ${job.projectId}）。请读取已提交的原图与要求，按尺寸核对、识别结构、搭建空间、检查复核、方案完成推进，回写真实任务进展和候选视图。`); setCopyStatus('接力指令已复制'); } catch { setCopyStatus('复制未完成，请在当前聊天提供上方任务编号。'); } }}>复制接力指令</button>{copyStatus && <p role="status">{copyStatus}</p>}</div></div>}
      {(needsInput || job?.status === 'needs_input') && <div className="lab-agent-handoff"><StudioIcon name="ruler" size={17}/><div><strong>补充一个可靠尺寸</strong><p>{job?.message || '请选择两点填写已知长度，或输入毫米 / 像素比例。'}</p><button className="lab-button" type="button" onClick={onScale}>打开比例尺</button></div></div>}
      {error && <div className="lab-agent-stream-error" role="status">进展暂未更新：{error}<button type="button" onClick={retry}>重试读取</button></div>}
      {children}
    </div>
    <div className="lab-agent-status"><span className={'lab-dot' + (active ? ' running' : '')}/><span>{status}</span>{active && <button type="button" disabled={busy === 'cancel'} onClick={onCancel}>{busy === 'cancel' ? '取消中…' : '取消任务'}</button>}</div>
    {!readOnly && <div className="lab-agent-composer">
      <label className="lab-execution-choice"><span>执行方式 <small>开发</small></span><select aria-label="执行方式" value={active && !knownMode ? '' : composerMode} disabled={!health || active || Boolean(busy) || working} onChange={(event) => { const mode = event.target.value; if (!active && !busy && !working && (mode === 'api' || mode === 'codex_handoff') && generationAvailable(health, mode)) onExecutionMode?.(mode); }}>{active && !knownMode && <option value="" disabled>历史任务 · 方式未记录</option>}<option value="api" disabled={!generationAvailable(health, 'api')}>{executionModeLabel('api')}{!generationAvailable(health, 'api') ? '（暂不可用）' : ''}</option><option value="codex_handoff" disabled={!generationAvailable(health, 'codex_handoff')}>{executionModeLabel('codex_handoff')}</option></select></label>
      <label className="lab-composer-title"><span>方案</span><input id="lab-title" aria-label="方案名称" value={title} maxLength={120} disabled={working || Boolean(job)} placeholder="未命名空间" onChange={(event) => onTitle(event.target.value)}/></label>
      {asset && <button type="button" className="lab-attachment-chip" disabled={working || active} onClick={onUpload}><StudioIcon name="plan" size={16}/><span>{asset.name}<small>{asset.width} × {asset.height} px</small></span><StudioIcon name="upload" size={14}/></button>}
      <label className="lab-sr-only" htmlFor="lab-prompt">生成要求</label><textarea id="lab-prompt" value={prompt} maxLength={4000} rows={3} disabled={working || needsInput} placeholder="描述需要保留的结构与空间要求…" onChange={(event) => onPrompt(event.target.value)}/>
      <div className="lab-composer-actions"><button type="button" className="lab-icon-button" aria-label="上传平面图 PNG 或 JPG" title="上传 PNG / JPG 平面图" disabled={working || active} onClick={onUpload}><StudioIcon name="plus" size={19}/></button><span>PNG / JPG · 最大 12 MB</span><button type="button" className="lab-agent-send" disabled={working || needsInput || !asset || !canGenerate} aria-label={composerMode === 'api' ? '开始 API 建模' : '发起 Codex 接力'} title={composerMode === 'api' ? '提交 API 自动建模任务' : '提交任务，等待当前聊天接力'} onClick={onSubmit}><StudioIcon name="send" size={17}/></button></div>
      {!canGenerate && <p className="lab-composer-note">所选执行方式暂不可用，请等待服务就绪或切换执行方式。</p>}
    </div>}
  </>;
}
