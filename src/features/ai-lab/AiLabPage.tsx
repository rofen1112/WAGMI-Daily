import { useCallback, useEffect, useRef, useState } from 'react';
import { API, LabApiError, calibratedScale, draftStatusCopy, errorMessage, generationInputSnapshot, generationScalePayload, isActiveJob, jobError, jobUsageLabel, jobValidationIssues, post, projectPath, projectStatusLabel, readImage, readViewerCaptures, readViewerState, request, safeDraftViewerUrl, sceneSourceLabel, type LabAsset, type LabBaseline, type LabDraft, type LabHealth, type LabJob, type LabProject, type LabScaleProvenance, type LabScene, type PixelPoint, type ScaleMode } from './api';
import ScaleCalibrator from './ScaleCalibrator';
import WorkflowSummary, { workflowStageLabels } from './WorkflowSummary';
import StudioIcon from './StudioIcon';
import ProjectsGallery from './ProjectsGallery';
import arkLogo from './assets/ark-logo.png';
import './ai-lab.css';

const statusLabels: Record<string, string> = { queued: '等待处理', running: '正在处理', awaiting_review_images: '等待预览复核', succeeded: '已完成', failed: '未能完成', cancelled: '已取消', canceled: '已取消', needs_input: '需要补充信息' };
const stageLabels: Record<string, string> = { queued: '排队中', generating: '生成空间', repairing: '修正结构', compiling: '构建方案', completed: '方案已就绪', succeeded: '方案已就绪', calling_model: '模型处理中', ...workflowStageLabels };
const defaultPrompt = '请识别户型的墙体、门窗与房间结构，保留原图布局。';

export function floorplanLocation(hash: string) {
  const [path, query = ''] = hash.replace(/^#\/?/, '').split('?');
  const params = new URLSearchParams(query);
  const projectId = params.get('projectId') || null;
  const tool = params.get('tool');
  const isFloorplan = path === 'ai-lab' && (tool === 'floorplan3d' || (!tool && Boolean(projectId)));
  const isNew = isFloorplan && !projectId && params.get('view') === 'new';
  return { isFloorplan, projectId, isNew, view: isFloorplan && (projectId || isNew) ? 'editor' as const : 'gallery' as const };
}

function PlanIcon() {
  return <svg viewBox="0 0 64 64" fill="none" aria-hidden="true"><path d="M9 11h46v42H9zM9 31h24V11M33 31v22M33 37h22" stroke="currentColor" strokeWidth="1.5"/><path d="M19 31h7m15 6h7" stroke="var(--color-surface)" strokeWidth="3"/><path d="M19 31v-7a7 7 0 0 1 7 7M41 37v7a7 7 0 0 0 7-7" stroke="currentColor" strokeWidth="1"/></svg>;
}

export function ModelUncertaintyWarnings({ warnings }: { warnings: unknown }) {
  const messages = Array.isArray(warnings)
    ? warnings.slice(0, 64).filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean).slice(0, 12).map((item) => item.slice(0, 400))
    : [];
  if (messages.length === 0) return null;
  return <details className="lab-validation lab-model-warnings"><summary>模型不确定性（{messages.length}）</summary><ul>{messages.map((message, index) => <li key={index}>{message}</li>)}</ul></details>;
}

export function JobFeedback({ job }: { job: LabJob }) {
  const failed = ['failed', 'needs_input'].includes(job.status);
  const message = failed ? jobError(job) : stageLabels[job.stage || ''] || job.message || (isActiveJob(job) ? '等待服务更新' : '');
  const issues = failed ? jobValidationIssues(job) : [];
  return <>{message && <p className={failed ? 'lab-job-error' : undefined}>{message.slice(0, 400)}</p>}{issues.length > 0 && <div><p>未通过检查的原因：</p><ul>{issues.map((issue, index) => <li key={index}>{issue.label}</li>)}</ul><details><summary>查看对应对象</summary><ul>{issues.map((issue, index) => <li key={index}>{issue.path || '场景结构'}{issue.code ? ` · ${issue.code}` : ''}</li>)}</ul></details></div>}</>;
}

function syncProjectLocation(projectId: string | null, view: 'new' | 'gallery' = 'gallery', push = false) {
  const [, query = ''] = window.location.hash.split('?');
  const params = new URLSearchParams(query);
  params.set('tool', 'floorplan3d');
  if (projectId) { params.set('projectId', projectId); params.delete('view'); }
  else { params.delete('projectId'); if (view === 'new') params.set('view', 'new'); else params.delete('view'); }
  const href = `#/ai-lab?${params}`;
  if (push && window.location.hash !== href) window.location.hash = href;
  else window.history.replaceState(null, '', href);
}

export default function AiLabPage() {
  const [workspaceView, setWorkspaceView] = useState<'gallery' | 'editor'>(floorplanLocation(window.location.hash).view);
  const workspaceViewRef = useRef(workspaceView);
  workspaceViewRef.current = workspaceView;
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
  const [scaleMode, setScaleMode] = useState<ScaleMode>('auto');
  const [calibrationPoints, setCalibrationPoints] = useState<PixelPoint[]>([]);
  const [knownLength, setKnownLength] = useState('');
  const [draft, setDraft] = useState<LabDraft | null>(null);
  const [draftLoading, setDraftLoading] = useState(false);
  const [draftError, setDraftError] = useState('');
  const [draftRetry, setDraftRetry] = useState(0);
  const [previewKind, setPreviewKind] = useState<'candidate' | 'saved'>('candidate');
  const [captureStatus, setCaptureStatus] = useState<'idle' | 'capturing' | 'uploading' | 'submitted' | 'error'>('idle');
  const [captureError, setCaptureError] = useState('');
  const [captureRetry, setCaptureRetry] = useState(0);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [tab, setTab] = useState<'space' | 'image'>('space');
  const [initialLoading, setInitialLoading] = useState(true);
  const [opening, setOpening] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [viewerReady, setViewerReady] = useState(false);
  const [projectMenu, setProjectMenu] = useState(false);
  const [controlsMenu, setControlsMenu] = useState(false);
  const [leftDockOpen, setLeftDockOpen] = useState(true);
  const [rightDockOpen, setRightDockOpen] = useState(true);
  const [projectQuery, setProjectQuery] = useState('');
  const dockRestore = useRef({ left: true, right: true });
  const frameRef = useRef<HTMLIFrameElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const selectionToken = useRef(0);
  const unknownProjectLookup = useRef<{ id: string; selection: number } | null>(null);
  const captureAttempts = useRef(new Set<string>());
  const initialProjectId = useRef(new URLSearchParams(window.location.hash.split('?')[1] || '').get('projectId'));
  const initialProjectRestored = useRef(false);
  const projectsLoaded = useRef(false);
  const projectsRef = useRef(projects);
  projectsRef.current = projects;
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const showGenerationPanel = !scene;
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
  useEffect(() => () => { ++selectionToken.current; unknownProjectLookup.current = null; }, []);

  const fetchScene = useCallback(async (id: string) => {
    try { return await request<LabScene>(`${projectPath(id)}/scene`); }
    catch (reason) { if (reason instanceof LabApiError && reason.status === 404) return null; throw reason; }
  }, []);

  const openProject = useCallback(async (project: LabProject, recordHistory = false) => {
    const token = ++selectionToken.current;
    const input = generationInputSnapshot(project.latestJob);
    initialProjectRestored.current = true;
    selectedIdRef.current = project.id;
    workspaceViewRef.current = 'editor'; setWorkspaceView('editor');
    syncProjectLocation(project.id, 'gallery', recordHistory);
    setSelectedId(project.id); setScene(null); setJob(project.latestJob || null); setAsset(input.sourceAsset || null); setImagePreview('');
    setDraft(null); setDraftLoading(false); setDraftError(''); setCaptureError(''); setCaptureStatus('idle'); setPreviewKind('candidate');
    setScale(input.mmPerPixel !== undefined ? String(input.mmPerPixel) : ''); setScaleMode(input.scaleMode || 'auto'); setPrompt(input.prompt ?? defaultPrompt);
    setCalibrationPoints(input.calibration ? [input.calibration.p1, input.calibration.p2] : []); setKnownLength(input.calibration ? String(input.calibration.lengthMm) : '');
    setDraftRetry((value) => value + 1);
    setTitle(project.title); setNotice(''); setError(''); setViewerReady(false); setOpening(true); setProjectMenu(false); setControlsMenu(false); setTab('space');
    try {
      const result = await fetchScene(project.id);
      if (token !== selectionToken.current) return;
      setScene(result);
      const metadata = result?.scene?.metadata;
      const mmPerPixel = metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? (metadata as Record<string, unknown>).mmPerPixel : undefined;
      const provenance = metadata && typeof metadata === 'object' && !Array.isArray(metadata) ? (metadata as Record<string, unknown>).scaleProvenance as LabScaleProvenance | undefined : undefined;
      const anchor = provenance?.mode === 'measured' && result?.sourceAsset && Array.isArray(provenance.anchors) ? provenance.anchors.find((item) => item && typeof item === 'object' && calibratedScale([item.p1, item.p2], item.lengthMm, result.sourceAsset!.width, result.sourceAsset!.height) !== null) : undefined;
      if (!input.scaleMode) {
        setScale(typeof mmPerPixel === 'number' && Number.isFinite(mmPerPixel) && mmPerPixel > 0 ? String(mmPerPixel) : '');
        if (anchor) { setScaleMode('calibrated'); setCalibrationPoints([anchor.p1, anchor.p2]); setKnownLength(String(anchor.lengthMm)); }
        else setScaleMode(provenance?.mode === 'estimated' ? 'auto' : typeof mmPerPixel === 'number' && Number.isFinite(mmPerPixel) && mmPerPixel > 0 ? 'manual' : 'auto');
      }
      if (!input.sourceAsset && result?.sourceAsset && !isActiveJob(project.latestJob) && (!project.latestJob?.draft || project.latestJob.status === 'succeeded')) setAsset(result.sourceAsset);
      if (!result && input.sourceAsset && !project.latestJob?.draft) setTab('image');
    } catch (reason) { if (token === selectionToken.current) setError(errorMessage(reason)); }
    finally { if (token === selectionToken.current) setOpening(false); }
  }, [fetchScene]);

  useEffect(() => {
    if (initialLoading || !projectsLoaded.current || initialProjectRestored.current) return;
    initialProjectRestored.current = true;
    if (!floorplanLocation(window.location.hash).isFloorplan) return;
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
        setProjects((current) => current.map((item) => item.id === result.job.projectId ? { ...item, latestJob: result.job } : item));
        if (!isActiveJob(result.job)) {
          await refreshProjects();
          if (disposed) return;
          if (result.job.status === 'succeeded') {
            const current = await fetchScene(job.projectId);
            if (!disposed && selectedIdRef.current === job.projectId) { setScene(current); setDraft(null); setPreviewKind('saved'); setViewerReady(false); setTab('space'); setNotice('方案已通过检查并保存。仍需人工核对后使用。'); }
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
    if (!job?.id || !job.draft?.id || job.status === 'succeeded' || job.projectId !== selectedId) return;
    let disposed = false;
    const draftId = job.draft.id;
    setDraftLoading(true); setDraftError('');
    request<LabDraft>(`/jobs/${encodeURIComponent(job.id)}/draft`).then((result) => {
      if (disposed) return;
      if (result.draftId !== draftId) throw new Error('候选方案已更新，请等待任务刷新。');
      safeDraftViewerUrl(job.draft!.viewerUrl, job.id, draftId, window.location.origin);
      setDraft(result); setPreviewKind('candidate'); setViewerReady(false); setTab('space'); setCaptureStatus('idle'); setCaptureError('');
      if (result.sourceAsset) setAsset(result.sourceAsset);
    }).catch((reason) => { if (!disposed) setDraftError(errorMessage(reason)); }).finally(() => { if (!disposed) setDraftLoading(false); });
    return () => { disposed = true; };
  }, [job?.id, job?.draft?.id, job?.status === 'succeeded', selectedId, draftRetry]);

  const displayingDraft = Boolean(draft && previewKind === 'candidate');
  let draftViewerUrl = '';
  if (displayingDraft && job?.draft && draft?.draftId === job.draft.id) {
    try { draftViewerUrl = safeDraftViewerUrl(job.draft.viewerUrl, job.id, draft.draftId, window.location.origin); } catch { /* The loading effect supplies a visible error. */ }
  }
  const viewerSrc = displayingDraft ? draftViewerUrl : scene && selectedId ? `${API}${projectPath(selectedId)}/viewer?version=${scene.version}` : '';
  const viewerKey = displayingDraft ? `draft:${job?.id}:${draft?.draftId}` : `${selectedId}:${scene?.version}`;

  useEffect(() => { setViewerReady(false); }, [viewerSrc]);

  useEffect(() => {
    if (!job || job.status !== 'awaiting_review_images' || !job.reviewImagesRequired || !draft || !displayingDraft || draft.draftId !== job.draft?.id || !viewerReady || tab !== 'space' || !frameRef.current) return;
    const key = `${job.id}:${draft.draftId}`;
    if (captureAttempts.current.has(key)) return;
    captureAttempts.current.add(key);
    let disposed = false;
    let finished = false;
    let uploadStarted = false;
    const controller = new AbortController();
    setCaptureStatus('capturing'); setCaptureError('');
    const submit = async () => {
      try {
        const captures = await readViewerCaptures(frameRef.current!, controller.signal);
        if (disposed || selectedIdRef.current !== job.projectId) return;
        setCaptureStatus('uploading');
        uploadStarted = true;
        const result = await post<{ job?: LabJob }>(`/jobs/${encodeURIComponent(job.id)}/review-images`, { draftId: draft.draftId, images: [{ view: '2d', dataUrl: captures.planDataUrl }, { view: '3d', dataUrl: captures.sceneDataUrl }] });
        if (disposed) return;
        finished = true;
        setCaptureStatus('submitted');
        if (result.job) setJob(result.job);
      } catch (reason) { finished = true; if (!disposed) { setCaptureStatus('error'); setCaptureError(errorMessage(reason)); } }
    };
    void submit();
    return () => {
      disposed = true; controller.abort();
      if (!finished) {
        if (!uploadStarted) captureAttempts.current.delete(key);
        if (selectedIdRef.current === job.projectId) {
          setCaptureStatus(uploadStarted ? 'error' : 'idle');
          if (uploadStarted) setCaptureError('视图提交已中断，请先等待任务状态更新，需要时再重试。');
        }
      }
    };
  }, [job?.id, job?.status, job?.draft?.id, job?.reviewImagesRequired, draft?.draftId, displayingDraft, viewerReady, tab, captureRetry]);

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
    workspaceViewRef.current = 'editor'; setWorkspaceView('editor');
    syncProjectLocation(null, 'new', true);
    setSelectedId(null); setScene(null); setAsset(null); setImagePreview(''); setJob(null); setTitle(''); setError(''); setNotice(''); setViewerReady(false); setTab('space'); setProjectMenu(false); setControlsMenu(false);
    setScale(''); setScaleMode('auto'); setCalibrationPoints([]); setKnownLength(''); setDraft(null); setDraftLoading(false); setDraftError(''); setCaptureError(''); setCaptureStatus('idle');
    setPrompt(defaultPrompt); setBusy(null);
  }, []);

  const showGallery = useCallback((changeUrl: boolean) => {
    ++selectionToken.current;
    initialProjectRestored.current = true;
    unknownProjectLookup.current = null;
    selectedIdRef.current = null;
    workspaceViewRef.current = 'gallery'; setWorkspaceView('gallery');
    setSelectedId(null); setJob(null); setScene(null); setDraft(null); setDraftLoading(false); setViewerReady(false); setOpening(false);
    setProjectMenu(false); setControlsMenu(false); setError(''); setBusy(null);
    if (changeUrl) syncProjectLocation(null, 'gallery', true);
  }, []);

  useEffect(() => {
    let disposed = false;
    const onHashChange = () => {
      const location = floorplanLocation(window.location.hash);
      if (!location.isFloorplan || location.view === 'gallery') { showGallery(false); return; }
      const id = location.projectId;
      initialProjectId.current = id;
      if (location.isNew) {
        if (workspaceViewRef.current !== 'editor' || selectedIdRef.current !== null) newProject();
        return;
      }
      if (!projectsLoaded.current) {
        initialProjectRestored.current = false;
        return;
      }
      if (id === selectedIdRef.current) return;
      if (!id) return;
      const project = projectsRef.current.find((item) => item.id === id);
      if (project) void openProject(project);
      else {
        if (unknownProjectLookup.current?.id === id && unknownProjectLookup.current.selection === selectionToken.current) return;
        const lookup = { id, selection: selectionToken.current };
        unknownProjectLookup.current = lookup;
        const isCurrent = () => {
          const current = floorplanLocation(window.location.hash);
          return !disposed && unknownProjectLookup.current === lookup && selectionToken.current === lookup.selection && current.isFloorplan && current.view === 'editor' && current.projectId === id;
        };
        void refreshProjects().then((latest) => {
          if (!isCurrent()) return;
          const refreshedProject = latest.find((item) => item.id === id);
          if (refreshedProject) void openProject(refreshedProject);
          else setError('链接中的项目不存在，请从项目列表重新选择。');
        }).catch((reason) => { if (isCurrent()) setError(errorMessage(reason)); }).finally(() => {
          if (unknownProjectLookup.current === lookup) unknownProjectLookup.current = null;
        });
      }
    };
    window.addEventListener('hashchange', onHashChange);
    return () => { disposed = true; window.removeEventListener('hashchange', onHashChange); };
  }, [newProject, openProject, refreshProjects, showGallery]);

  const ensureProject = async () => {
    if (selectedId) return selectedId;
    const token = selectionToken.current;
    const result = await post<{ project: LabProject }>('/projects', { title: title.trim() || asset?.name.replace(/\.[^.]+$/, '') || '未命名空间' });
    if (token !== selectionToken.current || workspaceViewRef.current !== 'editor') throw new Error('页面已切换，尚未开始生成。');
    setSelectedId(result.project.id);
    selectedIdRef.current = result.project.id;
    syncProjectLocation(result.project.id);
    await refreshProjects();
    return result.project.id;
  };

  const upload = async (file?: File) => {
    if (!file) return;
    const token = selectionToken.current;
    setBusy('upload'); setError(''); setNotice('');
    try {
      const dataUrl = await readImage(file);
      if (token !== selectionToken.current) return;
      const result = await post<{ asset: LabAsset }>('/assets', { name: file.name, dataUrl });
      if (token !== selectionToken.current) return;
      setAsset(result.asset); setImagePreview(dataUrl); setTab('image');
      setCalibrationPoints([]); setKnownLength('');
      if (!title) setTitle(file.name.replace(/\.[^.]+$/, ''));
    } catch (reason) { if (token === selectionToken.current) setError(errorMessage(reason)); }
    finally { if (token === selectionToken.current) { setBusy(null); if (fileRef.current) fileRef.current.value = ''; } }
  };

  const generate = async () => {
    if (scene) return;
    setError(''); setNotice('');
    if (!asset) { setError('请先上传一张平面图。'); return; }
    if (!prompt.trim()) { setError('请写下这次生成的要求。'); return; }
    let scalePayload;
    try { scalePayload = generationScalePayload(scaleMode, scale, calibrationPoints, knownLength, asset); }
    catch (reason) { setError(errorMessage(reason)); return; }
    const token = selectionToken.current;
    setBusy('generate');
    try {
      const id = await ensureProject();
      const result = await post<{ job: LabJob }>(`${projectPath(id)}/jobs`, { assetId: asset.id, ...scalePayload, pipelineVersion: 'codex-workflow-v1', prompt: prompt.trim(), action: 'generate', baseVersion: 0 });
      if (token !== selectionToken.current || selectedIdRef.current !== id) return;
      setDraft(null); setDraftLoading(false); setDraftError(''); setCaptureError(''); setCaptureStatus('idle'); setPreviewKind('candidate');
      setJob(result.job); setTab('space');
      setProjects((current) => current.map((item) => item.id === id ? { ...item, latestJob: result.job } : item));
    } catch (reason) { if (token === selectionToken.current) setError(errorMessage(reason)); }
    finally { if (token === selectionToken.current) setBusy(null); }
  };

  const loadBaseline = async (baseline: LabBaseline) => {
    const token = selectionToken.current;
    setBusy(`baseline:${baseline.id}`); setError(''); setNotice('');
    try {
      // Reference loading creates its own project so it cannot overwrite an AI result.
      const created = await post<{ project: LabProject }>('/projects', { title: `${baseline.title} · 参考方案` });
      await post(`${projectPath(created.project.id)}/baseline`, { baselineId: baseline.id });
      await refreshProjects();
      if (token !== selectionToken.current || !floorplanLocation(window.location.hash).isFloorplan) return;
      setBusy(null);
      await openProject(created.project, true);
      if (selectedIdRef.current === created.project.id && workspaceViewRef.current === 'editor') setNotice('已载入历史参考方案。这是预先整理的案例，并非本次 AI 生成。');
    } catch (reason) { if (token === selectionToken.current) setError(errorMessage(reason)); }
    finally { if (token === selectionToken.current) setBusy(null); }
  };

  const save = async () => {
    if (!selectedId || !scene || !frameRef.current || displayingDraft || active) return;
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
    if (!selectedId || displayingDraft || active) return;
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

  const cancel = async () => {
    if (!job) return;
    setBusy('cancel'); setError('');
    try {
      const result = await post<{ job?: LabJob }>(`/jobs/${encodeURIComponent(job.id)}/cancel`);
      if (result.job) {
        const cancelledJob = result.job;
        setJob(cancelledJob);
        setProjects((current) => current.map((item) => item.id === cancelledJob.projectId ? { ...item, latestJob: cancelledJob } : item));
      }
      setNotice('已请求取消。已经发出的模型请求可能仍产生用量。');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(null); }
  };

  const draftCopy = draftStatusCopy(job);
  const progress = typeof job?.progress === 'number' && Number.isFinite(job.progress) ? Math.max(0, Math.min(100, job.progress)) : null;
  const finishedWithoutScene = Boolean(!scene && job && ['failed', 'cancelled', 'canceled', 'needs_input', 'succeeded'].includes(job.status));
  const failedValidation = job?.status === 'failed' && jobValidationIssues(job).length > 0;
  const showImage = tab === 'image' && (imagePreview || asset?.url);
  const visibleProjects = projects.filter((project) => !projectQuery.trim() || (project.title || '').toLocaleLowerCase().includes(projectQuery.trim().toLocaleLowerCase()));
  const focusMode = !leftDockOpen && (!showGenerationPanel || !rightDockOpen);
  const isNarrow = () => typeof window.matchMedia === 'function' && window.matchMedia('(max-width: 980px)').matches;
  const toggleProjects = () => {
    if (isNarrow()) { setProjectMenu((value) => !value); setControlsMenu(false); }
    else setLeftDockOpen((value) => !value);
  };
  const toggleControls = () => {
    if (!showGenerationPanel) return;
    if (isNarrow()) { setControlsMenu((value) => !value); setProjectMenu(false); }
    else setRightDockOpen((value) => !value);
  };
  const toggleFocus = () => {
    setProjectMenu(false); setControlsMenu(false);
    if (focusMode) { setLeftDockOpen(showGenerationPanel ? dockRestore.current.left : true); if (showGenerationPanel) setRightDockOpen(dockRestore.current.right); }
    else { dockRestore.current = { left: leftDockOpen, right: rightDockOpen }; setLeftDockOpen(false); setRightDockOpen(false); }
  };
  useEffect(() => { if (!showGenerationPanel) setControlsMenu(false); }, [showGenerationPanel]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setProjectMenu(false); setControlsMenu(false);
      if (focusMode) { setLeftDockOpen(showGenerationPanel ? dockRestore.current.left : true); if (showGenerationPanel) setRightDockOpen(dockRestore.current.right); }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [focusMode, showGenerationPanel]);

  if (workspaceView === 'gallery') return <section className="ai-lab lab-gallery-shell" aria-label="Floorplan-Editor 项目管理"><header className="lab-gallery-topbar"><a href="#/ai-lab" className="lab-gallery-back" aria-label="返回应用目录"><StudioIcon name="back" size={17}/><span>AI 实验室</span></a><div className="lab-gallery-brand"><img src={arkLogo} alt="暗壳"/><strong>Floorplan-Editor</strong></div><span className="lab-gallery-connection"><span className={'lab-dot' + (health ? '' : ' is-offline')}/>{health ? '工作空间已连接' : '等待连接'}</span></header><ProjectsGallery projects={projects} baselines={baselines} loading={initialLoading} busy={Boolean(busy) || opening} error={error} onOpen={(project) => void openProject(project, true)} onNew={newProject} onBaseline={(baseline) => void loadBaseline(baseline)} onRetry={() => void initialize()}/></section>;

  return <section className={'ai-lab' + (scene ? ' is-local-editor' : '') + (!leftDockOpen ? ' is-left-collapsed' : '') + (!showGenerationPanel || !rightDockOpen ? ' is-right-collapsed' : '') + (projectMenu ? ' mobile-projects-open' : '') + (showGenerationPanel && controlsMenu ? ' mobile-controls-open' : '') + (focusMode ? ' is-focused' : '')} aria-label="AI 实验室">
    <header className="lab-appbar">
      <div className="lab-brand-area">
        <a href="#/ai-lab?tool=floorplan3d" className="lab-back-link" aria-label="返回项目管理" title="返回项目管理" onClick={(event) => { event.preventDefault(); showGallery(true); }}><StudioIcon name="back" size={17}/></a>
        <div className="lab-studio-brand"><img className="lab-ark-logo" src={arkLogo} alt="暗壳"/><span><strong>Floorplan-Editor</strong><small>空间编辑器</small></span></div>
      </div>
      <div className="lab-project-identity"><h1 title={selected?.title || title || '新建空间'}>{selected?.title || title || '新建空间'}</h1>{scene && <span className="lab-version">v{scene.version}</span>}{displayingDraft && <span className="lab-draft-pill">未保存候选</span>}</div>
      <div className="lab-appbar-actions">
        <button className="lab-icon-button lab-focus-button" type="button" title={focusMode ? '退出专注画布' : '专注画布'} aria-label="专注画布" aria-pressed={focusMode} onClick={toggleFocus}><StudioIcon name="focus"/></button>
        <span className="lab-appbar-divider"/>
        <button className="lab-button lab-export-button" type="button" disabled={!scene || displayingDraft || working} onClick={() => void exportScene()}>{busy === 'export' ? '导出中…' : '导出 JSON'}</button>
        <button className="lab-button lab-primary lab-save-button" type="button" disabled={!scene || displayingDraft || !viewerReady || working} onClick={() => void save()}>{busy === 'save' ? '保存中…' : '保存方案'}</button>
        {showGenerationPanel && <button className="lab-icon-button lab-panel-toggle" type="button" title={rightDockOpen ? '收起新建空间侧栏' : '显示新建空间侧栏'} aria-label="切换新建空间侧栏" aria-expanded={isNarrow() ? controlsMenu : rightDockOpen} onClick={toggleControls}><StudioIcon name="right"/></button>}
      </div>
    </header>

    <div className="lab-workspace">
      {(projectMenu || (showGenerationPanel && controlsMenu)) && <button type="button" className="lab-drawer-scrim" aria-label="关闭侧栏" onClick={() => { setProjectMenu(false); setControlsMenu(false); }}/>}
      <aside className="lab-sidebar" aria-label="空间项目" aria-hidden={isNarrow() ? !projectMenu : !leftDockOpen}>
        <div className="lab-dock-heading"><div><span className="lab-section-label">WORKSPACE</span><h2>空间项目 <span>{projects.length}</span></h2></div><button className="lab-icon-button" type="button" aria-label="收起项目侧栏" onClick={() => { setLeftDockOpen(false); setProjectMenu(false); }}><StudioIcon name="left" size={17}/></button></div>
        <div className="lab-project-tools"><button className="lab-button lab-new" type="button" onClick={newProject} disabled={working}><StudioIcon name="plus" size={16}/>新建方案</button><label className="lab-project-search"><StudioIcon name="search" size={15}/><input aria-label="搜索项目" placeholder="搜索项目" value={projectQuery} onChange={(event) => setProjectQuery(event.target.value)}/></label></div>
        <div className="lab-project-list" aria-label="项目列表">
          {initialLoading ? <p className="lab-muted">正在读取项目…</p> : projects.length === 0 ? <p className="lab-sidebar-empty">上传一张平面图，<br/>开始第一个空间方案。</p> : visibleProjects.length === 0 ? <p className="lab-sidebar-empty">没有匹配的项目</p> : visibleProjects.map((project) => <button className={'lab-project' + (project.id === selectedId ? ' is-selected' : '')} key={project.id} type="button" disabled={Boolean(busy) || opening} onClick={() => void openProject(project, true)} title={project.title}><span className="lab-project-icon"><StudioIcon name="plan" size={21}/></span><span className="lab-project-copy"><strong>{project.title || '未命名空间'}</strong><small><span className={'lab-project-status-dot ' + (project.latestJob?.status || (project.sceneVersion > 0 ? 'succeeded' : 'new'))}/>{projectStatusLabel(project)}</small></span>{project.id === selectedId && <span className="lab-project-selected-mark"/>}</button>)}
        </div>
        <details className="lab-reference-section" open><summary><span>参考空间</span><small>{baselines.length} 个案例</small></summary><p>历史参考 · 非本次 AI 生成</p>{baselines.map((baseline, index) => <button className="lab-reference" type="button" disabled={working} key={baseline.id} onClick={() => void loadBaseline(baseline)}><span className="lab-reference-number">{String(index + 1).padStart(2, '0')}</span><span>{baseline.title}</span><StudioIcon name="arrow" size={14}/></button>)}{!initialLoading && baselines.length === 0 && <p className="lab-muted">参考案例暂时不可用</p>}</details>
        <div className="lab-sidebar-foot"><div><span className={'lab-dot' + (health ? '' : ' is-offline')}/>{health ? '工作空间已连接' : '正在等待连接'}</div></div>
      </aside>

      <div className="lab-editor">
        <div className="lab-editor-toolbar"><button className="lab-icon-button lab-project-dock-toggle" type="button" title={leftDockOpen ? '收起项目侧栏' : '显示项目侧栏'} aria-label="切换项目侧栏" aria-expanded={isNarrow() ? projectMenu : leftDockOpen} onClick={toggleProjects}><StudioIcon name="left"/></button><div className="lab-tabs" role="tablist" aria-label="预览内容"><button type="button" role="tab" aria-selected={tab === 'space'} onClick={() => setTab('space')}>空间预览</button><button type="button" role="tab" aria-selected={tab === 'image'} onClick={() => setTab('image')} disabled={!asset && !imagePreview}>原始平面图</button></div><span className="lab-canvas-label">{tab === 'image' ? scaleMode === 'calibrated' ? '比例校准' : 'SOURCE PLAN' : 'SPATIAL WORKSPACE'}</span></div>
        {(error || notice) && <div className="lab-canvas-feedback">{error && <div className="lab-alert lab-error lab-canvas-alert" role="alert"><span>{error}</span><button type="button" onClick={() => { if (!health) void initialize(); else setError(''); }}>{!health ? '重新连接' : '关闭提示'}</button></div>}{notice && <div className="lab-alert lab-notice lab-canvas-alert" role="status">{notice}</div>}</div>}
        {draft && <div className="lab-draft-bar"><div><button type="button" aria-pressed={previewKind === 'candidate'} onClick={() => { setPreviewKind('candidate'); setTab('space'); }}>候选方案</button>{scene && <button type="button" aria-pressed={previewKind === 'saved'} onClick={() => { setPreviewKind('saved'); setTab('space'); }}>已保存版本 {scene.version}</button>}</div><span>{displayingDraft ? '尚未提交为项目版本' : '正在查看已保存版本'}</span></div>}
        {draftError && <div className="lab-alert lab-error lab-canvas-alert" role="alert">{draftError} <button className="lab-button" type="button" onClick={() => setDraftRetry((value) => value + 1)}>重新打开候选</button></div>}
        <div className={'lab-canvas' + (viewerSrc && tab === 'space' ? ' has-scene' : '')}>
          {opening || (draftLoading && !viewerSrc) ? <div className="lab-canvas-empty"><span className="lab-spinner"/><p>正在打开空间方案…</p></div> : showImage && asset ? scaleMode === 'calibrated' ? <ScaleCalibrator asset={asset} imageUrl={imagePreview || asset.url} points={calibrationPoints} lengthMm={knownLength} disabled={working} onPoints={setCalibrationPoints} onLength={setKnownLength}/> : <div className="lab-source-image"><img src={imagePreview || asset.url} alt={'原始平面图：' + asset.name}/><span>{asset.name}<i/> {asset.width} × {asset.height} px</span></div> : viewerSrc ? <iframe key={viewerKey} ref={frameRef} className={'lab-viewer' + (displayingDraft ? ' is-draft' : '')} tabIndex={displayingDraft ? -1 : 0} title={displayingDraft ? draftCopy.title : '空间方案 2D / 3D 编辑器'} src={viewerSrc} sandbox="allow-scripts allow-same-origin allow-downloads"/> : <div className="lab-canvas-empty"><div className="lab-plan-icon"><PlanIcon/></div><span className="lab-canvas-kicker">FLOORPLAN-EDITOR</span><h2>{active ? '正在构建你的空间' : finishedWithoutScene ? failedValidation ? '生成未通过检查' : '本次未生成可保存的方案' : '从一张平面图开始'}</h2><p>{active ? '真实任务进度会持续更新。候选方案就绪后，将在这里进行预览与复核。' : finishedWithoutScene ? '查看新建空间侧栏中的具体原因，核对原图或补充要求后再试。' : '上传图纸，选择比例依据，构建可编辑的 2D / 3D 空间。'}</p>{!active && <button type="button" className="lab-button" onClick={() => fileRef.current?.click()} disabled={working}>{finishedWithoutScene ? '重新选择平面图' : '选择平面图'} <StudioIcon name="upload" size={15}/></button>}<small>{finishedWithoutScene ? '可核对原图或补充要求后重新提交' : '也可以从项目列表中打开已有空间'}</small></div>}
        </div>
        <div className="lab-canvas-footer"><span><span className={'lab-footer-dot' + (active ? ' is-active' : '')}/>{displayingDraft ? '候选方案 · 尚未保存' : scene ? (selected?.title || title || '空间方案') + ' · 版本 ' + scene.version : selected ? projectStatusLabel(selected) : job ? statusLabels[job.status] || '方案尚未就绪' : '准备就绪'}</span><span>{displayingDraft ? draftCopy.footer : scene ? sceneSourceLabel(scene.source) : '比例与结构均需核对'}</span></div>
      </div>

      {showGenerationPanel && <aside className="lab-controls" aria-label="新建空间" aria-hidden={isNarrow() ? !controlsMenu : !rightDockOpen}>
        <div className="lab-dock-heading"><div><span className="lab-section-label">CREATE WITH AI</span><h2>新建空间</h2></div><button className="lab-icon-button" type="button" aria-label="收起新建空间侧栏" onClick={() => { setRightDockOpen(false); setControlsMenu(false); }}><StudioIcon name="right" size={17}/></button></div>
        <div className="lab-controls-scroll">
          {health && !health.providerConfigured && <div className="lab-alert lab-notice">生成服务尚未就绪。可继续打开参考空间和编辑已有方案。</div>}
          <div className="lab-generate-panel" aria-label="生成空间">
            <div className="lab-panel-intro"><h3>从图纸到空间</h3><p>保留原图结构，让空间变得可编辑。</p></div>
            <label className="lab-field-label" htmlFor="lab-title">方案名称</label>
            <input id="lab-title" className="lab-input" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="给这个空间起个名字" maxLength={120} disabled={working || Boolean(selectedId)}/>
            <label className="lab-field-label" htmlFor="lab-file">原始平面图 <span>PNG / JPG</span></label>
            <input className="lab-file-input" ref={fileRef} id="lab-file" type="file" accept="image/png,image/jpeg" disabled={working} onChange={(event) => void upload(event.target.files?.[0])}/>
            <button className={'lab-upload' + (asset ? ' has-file' : '')} type="button" disabled={working} onClick={() => fileRef.current?.click()}><span className="lab-upload-symbol">{asset ? <StudioIcon name="plan" size={24}/> : <StudioIcon name="upload" size={24}/>}</span><strong>{busy === 'upload' ? '正在上传…' : asset?.name || '选择平面图'}</strong><small>{asset ? asset.width + ' × ' + asset.height + ' px · 点击更换' : '点击上传 · 最大 12 MB'}</small></button>
            <label className="lab-field-label" htmlFor="lab-scale-mode">比例依据</label>
            <select id="lab-scale-mode" className="lab-input" value={scaleMode} disabled={working} onChange={(event) => { const mode = event.target.value as ScaleMode; setScaleMode(mode); if (mode === 'calibrated' && asset) setTab('image'); }}><option value="auto">自动估算</option><option value="calibrated">已知长度校准</option><option value="manual">手动比例</option></select>
            {scaleMode === 'manual' ? <><label className="lab-field-label" htmlFor="lab-scale">手动比例 <span>毫米 / 像素</span></label><div className="lab-scale"><input id="lab-scale" className="lab-input" type="number" inputMode="decimal" min="0.001" step="any" placeholder="例如 10" value={scale} onChange={(event) => setScale(event.target.value)} disabled={working}/><span>mm / px</span></div><p className="lab-field-help">按输入比例换算，结果不代表现场实测精度。</p></> : scaleMode === 'calibrated' ? <><button className="lab-button lab-calibration-open" type="button" disabled={!asset || working} onClick={() => setTab('image')}>在原图选择两点 · {calibrationPoints.length}/2</button><p className="lab-field-help">填写两点间已知长度，按原始图片像素计算比例。</p></> : <p className="lab-field-help">识别图中尺寸或参照物，任务中将展示估算依据与置信度。</p>}
            <label className="lab-field-label" htmlFor="lab-prompt">生成要求</label>
            <textarea id="lab-prompt" className="lab-textarea" rows={4} value={prompt} maxLength={4000} onChange={(event) => setPrompt(event.target.value)} disabled={working}/>
            <button className="lab-button lab-primary lab-generate" type="button" disabled={working || !asset || !health?.providerConfigured} onClick={() => void generate()}>{busy === 'generate' || active ? '正在处理…' : '生成空间方案'}<StudioIcon name="arrow" size={17}/></button>
            <p className="lab-fine-print">AI 结果需核对，复核通过后才保存方案。</p>
          </div>

          {job && <section className={'lab-job' + (['failed', 'needs_input'].includes(job.status) ? ' has-error' : '')} aria-label="任务状态" aria-live="polite">
            <div className="lab-job-heading"><strong><span className={'lab-dot ' + job.status}/>{statusLabels[job.status] || job.status}</strong>{active && <button type="button" disabled={busy === 'cancel'} onClick={() => void cancel()}>{busy === 'cancel' ? '取消中…' : '取消任务'}</button>}</div>
            {active && <p className="lab-current-stage">{stageLabels[job.stage || ''] || '等待服务更新'}</p>}
            {active && progress !== null && <div className="lab-progress-line"><progress max={100} value={progress} aria-label="任务进度"/><small>{Math.round(progress)}%</small></div>}
            {job.status === 'awaiting_review_images' && <div className="lab-capture-status"><p>{captureStatus === 'capturing' ? '正在获取实际 2D / 3D 视图…' : captureStatus === 'uploading' ? '正在提交预览视图…' : captureStatus === 'submitted' ? '视图已提交，等待视觉复核。' : '请保持本项目的空间预览打开，以提交实际视图进行复核。'}</p>{captureError && <p className="lab-job-error" role="alert">{captureError}</p>}<button className="lab-button" type="button" disabled={captureStatus === 'capturing' || captureStatus === 'uploading' || captureStatus === 'submitted'} onClick={() => { if (job.draft) captureAttempts.current.delete(job.id + ':' + job.draft.id); setCaptureError(''); setCaptureStatus('idle'); setPreviewKind('candidate'); setTab('space'); setCaptureRetry((value) => value + 1); }}>重试提交视图</button></div>}
            <details className="lab-task-details"><summary>{['failed', 'needs_input'].includes(job.status) ? '查看原因与任务详情' : '任务详情与视觉复核'}</summary><JobFeedback job={job}/><WorkflowSummary job={job} provenance={displayingDraft ? draft?.scaleProvenance : undefined}/>{job.events && job.events.length > 0 && <details><summary>阶段记录</summary><ol>{job.events.map((event, index) => <li key={index}>{typeof event === 'string' ? event : event.message || stageLabels[event.stage || ''] || event.stage || '状态更新'}</li>)}</ol></details>}{(job.usage || !active) && <div className="lab-usage"><small>{jobUsageLabel(job.usage, job)}</small><small>费用未报价</small></div>}</details>
          </section>}
        </div>
        <div className="lab-controls-foot"><StudioIcon name="spark" size={13}/><span>AI 辅助创作 · 人工判断与验收</span></div>
      </aside>}
    </div>
  </section>;
}
