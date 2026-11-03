import { useCallback, useEffect, useRef, useState } from 'react';
import { API, LabApiError, errorMessage, isActiveJob, jobError, jobUsageLabel, post, projectPath, readImage, readViewerState, request, sceneSourceLabel, type LabAsset, type LabBaseline, type LabHealth, type LabJob, type LabProject, type LabScene } from './api';
import './ai-lab.css';

const statusLabels: Record<string, string> = { queued: '等待处理', running: '正在处理', succeeded: '已完成', failed: '未能完成', cancelled: '已取消', canceled: '已取消', needs_input: '需要补充信息' };
const stageLabels: Record<string, string> = { queued: '排队中', analyzing: '识别平面图', generating: '生成空间', validating: '检查空间结构', repairing: '修正结构', compiling: '构建方案', completed: '方案已就绪', succeeded: '方案已就绪', calling_model: '模型处理中' };

function PlanIcon() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M9 11h46v42H9zM9 31h24V11M33 31v22M33 37h22" stroke="currentColor" strokeWidth="1.5"/><path d="M19 31h7m15 6h7" stroke="var(--color-surface)" strokeWidth="3"/><path d="M19 31v-7a7 7 0 0 1 7 7M41 37v7a7 7 0 0 0 7-7" stroke="currentColor" strokeWidth="1"/></svg>;
}

function detailText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value && typeof value === 'object') {
    const item = value as Record<string, unknown>;
    return [item.path, item.message].filter((part) => typeof part === 'string').join(' · ') || '请检查方案结构';
  }
  return '请检查方案结构';
}

export function ModelUncertaintyWarnings({ warnings }: { warnings: unknown }) {
  const messages = Array.isArray(warnings)
    ? warnings.slice(0, 64).filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean).slice(0, 12).map((item) => item.slice(0, 400))
    : [];
  if (messages.length === 0) return null;
  return <details className="lab-validation lab-model-warnings"><summary>模型不确定性（{messages.length}）</summary><ul>{messages.map((message, index) => <li key={index}>{message}</li>)}</ul></details>;
}

function syncProjectLocation(projectId: string | null) {
  const [path, query = ''] = window.location.hash.split('?');
  const params = new URLSearchParams(query);
  if (!params.has('tool')) params.set('tool', 'floorplan3d');
  if (projectId) params.set('projectId', projectId);
  else params.delete('projectId');
  window.history.replaceState(null, '', `${path || '#/ai-lab'}?${params}`);
}

export default function AiLabPage() {
  const [projects, setProjects] = useState<LabProject[]>([]);
  const [baselines, setBaselines] = useState<LabBaseline[]>([]);
  const [health, setHealth] = useState<LabHealth | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scene, setScene] = useState<LabScene | null>(null);
  const [job, setJob] = useState<LabJob | null>(null);
  const [asset, setAsset] = useState<LabAsset | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [title, setTitle] = useState('');
  const [scale, setScale] = useState('');
  const [prompt, setPrompt] = useState('请识别户型的墙体、门窗与房间结构，保留原图布局。');
  const [chat, setChat] = useState('');
  const [tab, setTab] = useState<'space' | 'image'>('space');
  const [initialLoading, setInitialLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [viewerReady, setViewerReady] = useState(false);
  const [projectMenu, setProjectMenu] = useState(false);
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectionToken = useRef(0);
  const initialProjectId = useRef(new URLSearchParams(window.location.hash.split('?')[1] || '').get('projectId'));
  const initialProjectRestored = useRef(false);
  const projectsLoaded = useRef(false);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const active = isActiveJob(job);
  const working = Boolean(busy) || active || opening;
  const selected = projects.find((item) => item.id === selectedId);

  const refreshProjects = useCallback(async () => {
    const result = await request<{ projects: LabProject[] }>('/projects');
    projectsLoaded.current = true;
    setProjects(Array.isArray(result.projects) ? result.projects : []);
    return result.projects || [];
  }, []);

  const initialize = useCallback(async () => {
    setInitialLoading(true);
    setError('');
    const results = await Promise.allSettled([
      request<LabHealth>('/health'), refreshProjects(), request<{ baselines: LabBaseline[] }>('/baselines'),
    ]);
    if (results[0].status === 'fulfilled') setHealth(results[0].value);
    if (results[2].status === 'fulfilled') setBaselines(results[2].value.baselines || []);
    const failure = results.find((result) => result.status === 'rejected');
    if (failure?.status === 'rejected') setError(errorMessage(failure.reason));
    setInitialLoading(false);
  }, [refreshProjects]);

  useEffect(() => { void initialize(); }, [initialize]);

  const fetchScene = useCallback(async (id: string) => {
    try { return await request<LabScene>(`${projectPath(id)}/scene`); }
    catch (reason) { if (reason instanceof LabApiError && reason.status === 404) return null; throw reason; }
  }, []);

  const openProject = useCallback(async (project: LabProject) => {
    const token = ++selectionToken.current;
    initialProjectRestored.current = true;
    selectedIdRef.current = project.id;
    syncProjectLocation(project.id);
    setSelectedId(project.id); setScene(null); setJob(project.latestJob || null); setAsset(null); setImagePreview('');
    setTitle(project.title); setNotice(''); setError(''); setViewerReady(false); setOpening(true); setProjectMenu(false); setTab('space');
    try {
      const result = await fetchScene(project.id);
      if (token !== selectionToken.current) return;
      setScene(result);
      const metadata = result?.scene?.metadata;
      const mmPerPixel = metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? (metadata as Record<string, unknown>).mmPerPixel : undefined;
      setScale(typeof mmPerPixel === 'number' && Number.isFinite(mmPerPixel) && mmPerPixel > 0 ? String(mmPerPixel) : '');
      if (result?.sourceAsset) setAsset(result.sourceAsset);
    } catch (reason) { if (token === selectionToken.current) setError(errorMessage(reason)); }
    finally { if (token === selectionToken.current) setOpening(false); }
  }, [fetchScene]);

  useEffect(() => {
    if (initialLoading || !projectsLoaded.current || initialProjectRestored.current) return;
    initialProjectRestored.current = true;
    const id = initialProjectId.current;
    if (!id) return;
    const project = projects.find((item) => item.id === id);
    if (project) void openProject(project);
    else setError('链接中的项目不存在，请从项目列表重新选择。');
  }, [initialLoading, projects, openProject]);

  useEffect(() => {
    if (!job?.id || !isActiveJob(job)) return;
    let disposed = false;
    let timer: number | undefined;
    const poll = async () => {
      try {
        const result = await request<{ job: LabJob }>(`/jobs/${encodeURIComponent(job.id)}`);
        if (disposed) return;
        if (!isActiveJob(result.job)) {
          await refreshProjects();
          if (disposed) return;
          if (result.job.status === 'succeeded') {
            const current = await fetchScene(job.projectId);
            if (!disposed && selectedIdRef.current === job.projectId) { setScene(current); setViewerReady(false); setTab('space'); setNotice('方案已更新。可在预览中继续编辑，然后保存。'); }
          }
          if (!disposed) setJob(result.job);
          return;
        }
        setJob(result.job);
      } catch (reason) { if (!disposed) setError(errorMessage(reason)); }
      if (!disposed) timer = window.setTimeout(poll, 1500);
    };
    timer = window.setTimeout(poll, 500);
    return () => { disposed = true; window.clearTimeout(timer); };
  }, [job?.id, job?.status, fetchScene, refreshProjects]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source === frameRef.current?.contentWindow && event.origin === window.location.origin && event.data?.type === 'ai-lab:ready') setViewerReady(true);
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  const newProject = useCallback(() => {
    ++selectionToken.current;
    initialProjectRestored.current = true;
    selectedIdRef.current = null;
    syncProjectLocation(null);
    setSelectedId(null); setScene(null); setAsset(null); setImagePreview(''); setJob(null); setTitle(''); setError(''); setNotice(''); setChat(''); setViewerReady(false); setTab('space'); setProjectMenu(false);
  }, []);

  useEffect(() => {
    const onHashChange = () => {
      const [path, query = ''] = window.location.hash.split('?');
      if (path !== '#/ai-lab') return;
      const id = new URLSearchParams(query).get('projectId') || null;
      initialProjectId.current = id;
      if (!projectsLoaded.current) {
        initialProjectRestored.current = false;
        return;
      }
      if (id === selectedIdRef.current) return;
      if (!id) { newProject(); return; }
      const project = projectsRef.current.find((item) => item.id === id);
      if (project) void openProject(project);
      else setError('链接中的项目不存在，请从项目列表重新选择。');
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [newProject, openProject]);

  const ensureProject = async () => {
    if (selectedId) return selectedId;
    const result = await post<{ project: LabProject }>('/projects', { title: title.trim() || asset?.name.replace(/\.[^.]+$/, '') || '未命名空间' });
    setSelectedId(result.project.id);
    selectedIdRef.current = result.project.id;
    syncProjectLocation(result.project.id);
    await refreshProjects();
    return result.project.id;
  };

  const upload = async (file?: File) => {
    if (!file) return;
    setBusy('upload'); setError(''); setNotice('');
    try {
      const dataUrl = await readImage(file);
      const result = await post<{ asset: LabAsset }>('/assets', { name: file.name, dataUrl });
      setAsset(result.asset); setImagePreview(dataUrl); setTab('image');
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); if (fileRef.current) fileRef.current.value = ''; }
  };

  const generate = async () => {
    setError(''); setNotice('');
    const mmPerPixel = Number(scale);
    if (!asset) { setError('请先上传一张平面图。'); return; }
    if (!Number.isFinite(mmPerPixel) || mmPerPixel <= 0) { setError('请输入大于 0 的比例（毫米 / 像素）。'); return; }
    if (!prompt.trim()) { setError('请写下这次生成的要求。'); return; }
    setBusy('generate');
    try {
      const id = await ensureProject();
      const result = await post<{ job: LabJob }>(`${projectPath(id)}/jobs`, { assetId: asset.id, mmPerPixel, prompt: prompt.trim(), action: 'generate', baseVersion: scene?.version ?? 0 });
      setJob(result.job); setTab('space');
      setProjects((current) => current.map((item) => item.id === id ? { ...item, latestJob: result.job } : item));
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); }
  };

  const loadBaseline = async (baseline: LabBaseline) => {
    setBusy(`baseline:${baseline.id}`); setError(''); setNotice('');
    try {
      // Reference loading creates its own project so it cannot overwrite an AI result.
      const created = await post<{ project: LabProject }>('/projects', { title: `${baseline.title} · 参考方案` });
      await post(`${projectPath(created.project.id)}/baseline`, { baselineId: baseline.id });
      await refreshProjects();
      await openProject(created.project);
      setNotice('已载入历史参考方案。这是预先整理的案例，并非本次 AI 生成。');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); }
  };

  const save = async () => {
    if (!selectedId || !scene || !frameRef.current) return;
    setBusy('save'); setError(''); setNotice('');
    try {
      const state = await readViewerState(frameRef.current);
      const result = await post<{ version: number }>(`${projectPath(selectedId)}/state`, { baseVersion: scene.version, state });
      setScene((current) => current ? { ...current, state, version: result.version } : current);
      setViewerReady(false);
      await refreshProjects(); setNotice('完整方案已保存，包含当前房间、家具和标注。');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); }
  };

  const exportScene = async () => {
    if (!selectedId) return;
    setBusy('export'); setError('');
    try {
      const result = await request<unknown>(`${projectPath(selectedId)}/export`);
      const url = URL.createObjectURL(new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' }));
      const link = document.createElement('a'); link.href = url; link.download = `${(selected?.title || '空间方案').replace(/[<>:"/\\|?*]/g, '-')}.json`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setNotice('已导出最近保存的完整方案。预览中的新编辑请先保存。');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); }
  };

  const modify = async () => {
    if (!selectedId || !scene || !chat.trim()) return;
    setBusy('modify'); setError(''); setNotice('');
    try {
      const result = await post<{ job: LabJob }>(`${projectPath(selectedId)}/jobs`, { action: 'modify', prompt: chat.trim(), baseVersion: scene.version });
      setJob(result.job); setChat(''); setTab('space');
      setProjects((current) => current.map((item) => item.id === selectedId ? { ...item, latestJob: result.job } : item));
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); }
  };

  const cancel = async () => {
    if (!job) return;
    setBusy('cancel'); setError('');
    try {
      const result = await post<{ job?: LabJob }>(`/jobs/${encodeURIComponent(job.id)}/cancel`);
      if (result.job) setJob(result.job);
      setNotice('已请求取消。已经发出的模型请求可能仍产生用量。');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); }
  };

  const warnings = scene?.validation?.warnings || [];
  const progress = typeof job?.progress === 'number' && Number.isFinite(job.progress) ? Math.max(0, Math.min(100, job.progress)) : null;
  const showImage = tab === 'image' && (imagePreview || asset?.url);
  const furnitureSource = scene?.state?.furniture ?? scene?.scene?.furniture;
  const furniture = Array.isArray(furnitureSource) ? furnitureSource.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object' && typeof item.id === 'string')) : [];

  return <section className="ai-lab" aria-label="AI 实验室">
    <div className="lab-heading">
      <div><div className="lab-eyebrow">AI 实验室 <span>实验功能</span></div><h1>从一张平面图，开始构建空间</h1><p>识别户型，生成 2D / 3D 方案，再用对话持续调整。</p></div>
      <button type="button" className="lab-button lab-project-toggle" onClick={() => setProjectMenu((value) => !value)} aria-expanded={projectMenu}>我的项目 <span>{projects.length}</span></button>
    </div>

    <div className="lab-workspace">
      <aside className={`lab-sidebar ${projectMenu ? 'is-open' : ''}`} aria-label="空间项目">
        <div className="lab-section-label">工作空间</div>
        <button className="lab-button lab-new" type="button" onClick={newProject} disabled={working}>＋ 新建方案</button>
        <div className="lab-sidebar-title">我的项目 <span>{projects.length}</span></div>
        <div className="lab-project-list">
          {initialLoading ? <p className="lab-muted">正在读取项目…</p> : projects.length === 0 ? <p className="lab-sidebar-empty">还没有项目。<br/>上传平面图后开始第一个方案。</p> : projects.map((project) => <button className={`lab-project ${project.id === selectedId ? 'is-selected' : ''}`} key={project.id} type="button" disabled={Boolean(busy) || opening} onClick={() => void openProject(project)}><span className="lab-project-icon">▧</span><span><strong>{project.title || '未命名空间'}</strong><small>{project.sceneVersion > 0 ? `版本 ${project.sceneVersion}` : '等待生成'}{project.latestJob && isActiveJob(project.latestJob) ? ' · 处理中' : ''}</small></span></button>)}
        </div>
        <div className="lab-reference-heading"><span>历史参考</span><small>非 AI 实时生成</small></div>
        <p className="lab-reference-copy">载入独立参考项目，体验完整编辑器。</p>
        {baselines.map((baseline, index) => <button className="lab-reference" type="button" disabled={working} key={baseline.id} onClick={() => void loadBaseline(baseline)}><span>{String(index + 1).padStart(2, '0')}</span><span>{baseline.title}</span><span aria-hidden="true">↗</span></button>)}
        {!initialLoading && baselines.length === 0 && <p className="lab-muted">参考案例暂时不可用</p>}
        <div className="lab-sidebar-foot"><span className={`lab-dot ${health ? '' : 'is-offline'}`}/>{health ? '实验室已连接' : '实验室待连接'}{health?.model && <small title={health.model}>{health.model}</small>}</div>
      </aside>

      <div className="lab-editor">
        <div className="lab-editor-toolbar"><div className="lab-tabs" role="tablist" aria-label="预览内容"><button type="button" role="tab" aria-selected={tab === 'space'} onClick={() => setTab('space')}>空间预览</button><button type="button" role="tab" aria-selected={tab === 'image'} onClick={() => setTab('image')} disabled={!asset && !imagePreview}>原始平面图</button></div><div className="lab-save-actions"><button className="lab-button" type="button" disabled={!scene || working} onClick={() => void exportScene()}>{busy === 'export' ? '导出中…' : '导出 JSON'}</button><button className="lab-button lab-primary" type="button" disabled={!scene || !viewerReady || working} onClick={() => void save()}>{busy === 'save' ? '保存中…' : '保存方案'}</button></div></div>
        <div className={`lab-canvas ${scene && tab === 'space' ? 'has-scene' : ''}`}>
          {opening ? <div className="lab-canvas-empty"><span className="lab-spinner"/><p>正在打开空间方案…</p></div> : showImage ? <div className="lab-source-image"><img src={imagePreview || asset?.url} alt={`原始平面图：${asset?.name || '已上传图片'}`}/><span>原始平面图 · {asset?.width} × {asset?.height} px</span></div> : scene && selectedId ? <iframe key={`${selectedId}:${scene.version}`} ref={frameRef} className="lab-viewer" title="空间方案 2D / 3D 编辑器" src={`${API}${projectPath(selectedId)}/viewer?version=${scene.version}`} sandbox="allow-scripts allow-same-origin allow-downloads"/> : <div className="lab-canvas-empty"><div className="lab-plan-icon"><PlanIcon/></div><span className="lab-canvas-kicker">平面图 → 可编辑空间</span><h2>{active ? '正在构建你的空间' : '让空间从图纸中展开'}</h2><p>{active ? '任务状态会在右侧更新。完成后，方案将在这里打开。' : '上传一张清晰的平面图，填写比例与要求。生成后可在这里切换 2D / 3D、调整家具与标注。'}</p>{!active && <button type="button" className="lab-button" onClick={() => fileRef.current?.click()} disabled={working}>选择平面图 <span aria-hidden="true">↗</span></button>}<small>也可以先载入左侧的历史参考方案</small></div>}
        </div>
        <div className="lab-canvas-footer"><span>{scene ? `${selected?.title || title || '空间方案'} · 版本 ${scene.version}` : '等待生成空间方案'}</span><span>{scene ? sceneSourceLabel(scene.source) : '比例与结构均需核对'}</span></div>
        {scene && <div className="lab-editor-help">在预览内切换 2D / 3D，编辑家具、房间或测量标注。完成后点击「保存方案」。</div>}
        {scene && <ModelUncertaintyWarnings warnings={scene.scene?.warnings}/>}
        {warnings.length > 0 && <details className="lab-validation"><summary>结构校验提醒（{warnings.length}）</summary><ul>{warnings.map((item, index) => <li key={index}>{detailText(item)}</li>)}</ul></details>}
      </div>

      <aside className="lab-controls" aria-label="生成与调整">
        <div className="lab-control-heading"><h2>平面图转 3D</h2><span>01 / 生成空间</span></div>
        {error && <div className="lab-alert lab-error" role="alert"><strong>操作未完成</strong><p>{error}</p><button type="button" onClick={() => { if (!health) void initialize(); else setError(''); }}>{!health ? '重新连接' : '关闭提示'}</button></div>}
        {notice && <div className="lab-alert lab-notice" role="status">{notice}</div>}
        {health && !health.providerConfigured && <div className="lab-alert lab-notice">生成服务尚未就绪。你仍可打开历史参考、编辑方案和调整家具。</div>}
        <label className="lab-field-label" htmlFor="lab-title">方案名称</label>
        <input id="lab-title" className="lab-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这个空间起个名字" maxLength={120} disabled={working || Boolean(selectedId)}/>
        <label className="lab-field-label" htmlFor="lab-file">平面图 <span>PNG / JPG</span></label>
        <input className="lab-file-input" ref={fileRef} id="lab-file" type="file" accept="image/png,image/jpeg" disabled={working} onChange={(event) => void upload(event.target.files?.[0])}/>
        <button className={`lab-upload ${asset ? 'has-file' : ''}`} type="button" disabled={working} onClick={() => fileRef.current?.click()}><span className="lab-upload-symbol" aria-hidden="true">{asset ? '▧' : '↑'}</span><strong>{busy === 'upload' ? '正在上传…' : asset?.name || '点击上传平面图'}</strong><small>{asset ? `${asset.width} × ${asset.height} px · 点击更换` : '清晰完整的图纸，最大 12 MB'}</small></button>
        <label className="lab-field-label" htmlFor="lab-scale">图纸比例 <span>毫米 / 像素</span></label>
        <div className="lab-scale"><input id="lab-scale" className="lab-input" type="number" inputMode="decimal" min="0.001" step="any" placeholder="例如 10" value={scale} onChange={(event) => setScale(event.target.value)} disabled={working}/><span>mm / px</span></div>
        <p className="lab-field-help">已知长度（mm）÷ 图中对应像素长度。未标尺寸时只能估算，生成结果不代表实测精度。</p>
        <label className="lab-field-label" htmlFor="lab-prompt">生成要求</label>
        <textarea id="lab-prompt" className="lab-textarea" rows={3} value={prompt} maxLength={4000} onChange={(event) => setPrompt(event.target.value)} disabled={working}/>
        <button className="lab-button lab-primary lab-generate" type="button" disabled={working || !asset || !scale || !health?.providerConfigured} onClick={() => void generate()}>{busy === 'generate' || active ? '正在处理…' : '生成空间方案'}<span aria-hidden="true">→</span></button>
        <p className="lab-fine-print">AI 可能遗漏门窗或误判结构，请核对后使用。</p>

        {job && <section className={`lab-job ${['failed', 'needs_input'].includes(job.status) ? 'has-error' : ''}`} aria-label="任务状态" aria-live="polite"><div className="lab-job-heading"><strong>{statusLabels[job.status] || job.status}</strong>{active && <button type="button" disabled={busy === 'cancel'} onClick={() => void cancel()}>{busy === 'cancel' ? '取消中…' : '取消任务'}</button>}</div><p>{stageLabels[job.stage || ''] || job.message || (active ? '等待服务更新' : '')}</p>{active && progress !== null && <><progress max={100} value={progress} aria-label="任务进度"/><small>{Math.round(progress)}%</small></>}{jobError(job) && ['failed', 'needs_input'].includes(job.status) && <p className="lab-job-error">{jobError(job)}</p>}{job.events && job.events.length > 0 && <details><summary>任务记录</summary><ol>{job.events.map((event, index) => <li key={index}>{typeof event === 'string' ? event : event.message || stageLabels[event.stage || ''] || event.stage || '状态更新'}</li>)}</ol></details>}{(job.usage || !active) && <><p><small>{jobUsageLabel(job.usage, job)}</small></p><small>费用未报价</small></>}</section>}

        <section className="lab-chat"><div className="lab-control-heading"><h2>继续调整</h2><span>02 / 对话编辑</span></div><p>支持家具定位、旋转和尺寸调整。选择一个对象插入指令，再按需要修改。</p>{furniture.length > 0 && <><label className="lab-sr-only" htmlFor="lab-object">选择调整的家具</label><select id="lab-object" className="lab-input lab-object-select" value="" disabled={working} onChange={(event) => { if (event.target.value) setChat(`${event.target.value}旋转到90度`); }}><option value="">选择家具，插入修改指令</option>{furniture.map((item) => <option value={String(item.id)} key={String(item.id)}>{String(item.name || item.type || '家具')} · {String(item.id)}</option>)}</select></>}<label className="lab-sr-only" htmlFor="lab-chat">家具修改要求</label><textarea id="lab-chat" className="lab-textarea" rows={3} placeholder={scene ? `例如：${furniture[0]?.id || '家具ID'}旋转到90度` : '生成或打开方案后，继续对话调整'} value={chat} maxLength={4000} disabled={!scene || working} onChange={(event) => setChat(event.target.value)}/><button className="lab-button lab-modify" type="button" disabled={!scene || !chat.trim() || working} onClick={() => void modify()}>{busy === 'modify' ? '正在提交…' : '提交修改'}<span aria-hidden="true">↗</span></button><small>修改基于最近保存版本。预览中有新编辑时，请先保存。复杂改动可在预览中手动编辑。</small></section>
      </aside>
    </div>
  </section>;
}
