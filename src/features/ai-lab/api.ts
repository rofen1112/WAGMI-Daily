export const API = '/api/ai-lab/v1';

export interface LabAsset { id: string; name: string; width: number; height: number; url: string; mime: string }
export interface LabProject { id: string; title: string; updatedAt?: string; sceneVersion: number; latestJob?: LabJob | null }
export interface LabJob {
  id: string; projectId: string; status: string; stage?: string; progress?: number | null;
  message?: string; events?: Array<string | { stage?: string; message?: string; at?: string }>;
  error?: string | { code?: string; message?: string; details?: unknown }; sceneVersion?: number;
  usage?: Record<string, unknown> | null; validation?: LabValidation; source?: string;
  pipelineVersion?: string; analysis?: Record<string, unknown> | null; scaleProvenance?: LabScaleProvenance | null;
  visualReview?: Record<string, unknown> | null; review?: Record<string, unknown> | null; draft?: { id: string; viewerUrl: string } | null; reviewImagesRequired?: boolean;
  sourceAsset?: LabAsset | null; input?: { scaleMode?: ScaleMode; mmPerPixel?: number; calibration?: { p1: PixelPoint; p2: PixelPoint; lengthMm: number }; prompt?: string } | null;
}
export type ScaleMode = 'auto' | 'calibrated' | 'manual';
export type PixelPoint = [number, number];
export interface LabScaleProvenance { mode: 'manual' | 'measured' | 'estimated'; mmPerPixel?: number; rangeMmPerPixel?: [number, number]; confidence?: 'low' | 'medium' | 'high'; evidence?: string[]; assumptions?: string[]; anchors?: Array<{ label?: string; p1: PixelPoint; p2: PixelPoint; lengthMm: number; source?: string }> }
export interface LabDraft { draftId: string; scene: Record<string, unknown>; state: Record<string, unknown> | null; validation?: LabValidation; sourceAsset?: LabAsset | null; scaleProvenance?: LabScaleProvenance | null }
export interface LabValidation { errors?: Array<unknown>; warnings?: Array<unknown>; counts?: Record<string, number> }
export interface LabScene { scene: Record<string, unknown>; state: Record<string, unknown> | null; version: number; validation?: LabValidation; source?: string; sourceAsset?: LabAsset | null }
export interface LabHealth { status: string; model?: string; providerConfigured: boolean; capabilities?: Record<string, unknown> }
export interface LabBaseline { id: string; title: string; description?: string }

export class LabApiError extends Error {
  constructor(message: string, public status: number, public code?: string) { super(message); }
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API}${path}`, { ...options, headers: { 'Content-Type': 'application/json', ...options.headers } });
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') throw error;
    throw new LabApiError('暂时无法连接实验室服务，请稍后重试。', 0);
  }
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new LabApiError(payload?.error?.message || `请求未完成（${response.status}）`, response.status, payload?.error?.code);
  if (payload === null || typeof payload !== 'object') throw new LabApiError('服务返回了无法读取的内容，请重试。', response.status);
  return payload as T;
}

export const post = <T>(path: string, body: unknown = {}): Promise<T> => request<T>(path, { method: 'POST', body: JSON.stringify(body) });
export const projectPath = (id: string) => `/projects/${encodeURIComponent(id)}`;
export const isActiveJob = (job: LabJob | null | undefined) => Boolean(job && ['queued', 'running', 'awaiting_review_images'].includes(job.status));
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : '操作未完成，请重试。';
export const jobError = (job: LabJob) => typeof job.error === 'string' ? job.error : job.error?.message || job.message || '';

export function projectStatusLabel(project: LabProject) {
  const version = Number.isFinite(project.sceneVersion) && project.sceneVersion > 0 ? `版本 ${project.sceneVersion} · ` : '';
  const status = project.latestJob?.status;
  const modified = ['modified', 'baseline_reference_modified'].includes(project.latestJob?.source || '');
  const labels: Record<string, string> = { queued: '排队中', running: '生成中', awaiting_review_images: '等待预览复核', failed: modified ? '修改失败' : '生成失败', cancelled: '已取消', canceled: '已取消', needs_input: '需补信息' };
  if (status && labels[status]) return `${version}${labels[status]}`;
  if (version && (!status || status === 'succeeded')) return `${version}已保存`;
  if (status === 'succeeded') return '任务已完成';
  return status ? `${version}状态待确认` : '尚未生成';
}

export function jobValidationIssues(job: LabJob) {
  const details = typeof job.error === 'object' && job.error?.details && typeof job.error.details === 'object' ? job.error.details as Record<string, unknown> : null;
  const sources = [job.validation?.errors, details?.errors];
  const labels: Record<string, string> = {
    outside_boundary: '房间范围超出模型给出的建筑外轮廓，请检查生成的房间边界。',
    room_overlap: '与其他房间重叠，请调整房间轮廓。',
    invalid_polygon: '轮廓无效，请检查交叉线段和轮廓顶点。',
    out_of_bounds: '超出了场景范围，请检查位置或尺寸。',
    nonpositive: '尺寸必须大于 0，请检查长度、宽度或高度。',
    non_finite: '数值无效，请填写有限的尺寸和坐标。',
  };
  const objects: Record<string, string> = { rooms: '房间', furniture: '家具', walls: '墙体', polygonWalls: '墙体', columns: '立柱', steps: '台阶', doors: '门', windows: '窗', measures: '标注' };
  const seen = new Set<string>();
  const issues: Array<{ label: string; path: string; code: string }> = [];
  for (const source of sources) {
    if (!Array.isArray(source)) continue;
    for (const value of source.slice(0, 64)) {
      if (!value || typeof value !== 'object' || Array.isArray(value)) continue;
      const item = value as Record<string, unknown>;
      const code = typeof item.code === 'string' && /^[a-z][a-z0-9_]{0,40}$/.test(item.code) ? item.code : '';
      const path = typeof item.path === 'string' && item.path.length <= 160 && /^\$(?:\.[A-Za-z][A-Za-z0-9_]*|\[\d{1,6}\]){0,12}$/.test(item.path) ? item.path : '';
      if (!code && !path) continue;
      const identity = `${code}:${path}`;
      if (seen.has(identity)) continue;
      seen.add(identity);
      const match = path.match(/^\$\.([A-Za-z]+)\[(\d+)\]/);
      const object = match && objects[match[1]] ? `第${Number(match[2]) + 1}个${objects[match[1]]}：` : '';
      issues.push({ label: `${object}${labels[code] || '结构数据未通过校验，请检查对应对象。'}`, path, code });
      if (issues.length === 8) return issues;
    }
  }
  return issues;
}

export function summarizeJobUsage(usage: Record<string, unknown> | null | undefined) {
  const calls = Array.isArray(usage?.calls) ? usage.calls : [];
  let reportedCalls = 0;
  let knownTotalTokens: number | null = null;
  for (const call of calls) {
    const total = call && typeof call === 'object' ? call.usage?.total_tokens : undefined;
    // A missing total stays unknown, even if input/output counts were returned.
    if (typeof total !== 'number' || !Number.isFinite(total) || total < 0) continue;
    reportedCalls += 1;
    knownTotalTokens = (knownTotalTokens ?? 0) + total;
  }
  return { knownTotalTokens, reportedCalls, callCount: calls.length };
}

export function jobUsageLabel(usage: Record<string, unknown> | null | undefined, job?: Pick<LabJob, 'status' | 'source'>) {
  if (job?.status === 'succeeded' && ['modified', 'baseline_reference_modified'].includes(job.source || '') && Array.isArray(usage?.calls) && usage.calls.length === 0) return '本次未调用模型';
  const { knownTotalTokens, reportedCalls, callCount } = summarizeJobUsage(usage);
  if (knownTotalTokens === null) return `总用量未返回${callCount ? `（${callCount} 次调用）` : ''}`;
  const total = `${knownTotalTokens.toLocaleString()} tokens`;
  return reportedCalls < callCount
    ? `已知用量 ${total}（部分：${reportedCalls}/${callCount} 次调用）`
    : `本次用量 ${total}（${callCount} 次调用）`;
}

export function sceneSourceLabel(source: string | undefined) {
  if (source === 'baseline_reference') return '历史参考 · 非本次 AI 生成';
  if (source === 'baseline_reference_modified') return '参考方案的修改版';
  return '生成结果需人工核对';
}

export function draftStatusCopy(job: LabJob | null) {
  if (job?.status === 'awaiting_review_images') return { title: '待视觉复核的候选空间', footer: '等待实际视图复核', help: '这是待复核候选。请保持空间预览打开，系统会提交实际 2D / 3D 视图；复核通过后才保存为项目版本。' };
  if (job?.status === 'failed') return { title: '未通过检查的候选空间', footer: '候选未通过 · 未保存', help: '本次任务已停止，候选未保存。可查看现有候选和右侧具体原因，核对原图或补充要求后重新提交。' };
  if (job?.status === 'cancelled' || job?.status === 'canceled') return { title: '已取消任务的候选空间', footer: '任务已取消 · 未保存', help: '本次任务已取消，现有候选仅供查看，不会继续自动复核或保存。' };
  if (job?.status === 'needs_input') return { title: '需要补充信息的候选空间', footer: '任务需补信息 · 未保存', help: '本次未完成，请补充右侧所需信息后重新提交。此候选尚未保存。' };
  if (isActiveJob(job)) return { title: job?.stage === 'visual_review' ? '视觉复核中的候选空间' : '处理中的候选空间', footer: '候选处理中 · 尚未保存', help: '任务仍在处理，候选可能继续修正。请以最终任务结果为准，当前候选尚未保存。' };
  return { title: '未提交的候选空间', footer: '候选尚未保存', help: '这是尚未提交的候选，请以右侧任务状态为准。' };
}

export function imagePixelPoint(clientX: number, clientY: number, rect: { left: number; top: number; width: number; height: number }, width: number, height: number): PixelPoint | null {
  if (![clientX, clientY, rect.left, rect.top, rect.width, rect.height, width, height].every(Number.isFinite) || rect.width <= 0 || rect.height <= 0 || width <= 0 || height <= 0) return null;
  const ratio = Math.min(rect.width / width, rect.height / height);
  const left = rect.left + (rect.width - width * ratio) / 2;
  const top = rect.top + (rect.height - height * ratio) / 2;
  const x = (clientX - left) / ratio, y = (clientY - top) / ratio;
  if (x < 0 || y < 0 || x > width || y > height) return null;
  return [Math.round(x * 100) / 100, Math.round(y * 100) / 100];
}

export function calibratedScale(points: PixelPoint[], lengthMm: number, width: number, height: number): number | null {
  if (points.length !== 2 || !Number.isFinite(lengthMm) || lengthMm <= 0 || !Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return null;
  if (points.some((point) => !Array.isArray(point) || point.length !== 2 || !point.every(Number.isFinite) || point[0] < 0 || point[1] < 0 || point[0] > width || point[1] > height)) return null;
  const distance = Math.hypot(points[1][0] - points[0][0], points[1][1] - points[0][1]);
  const ratio = distance > 0 ? lengthMm / distance : NaN;
  return Number.isFinite(ratio) && ratio > 0 ? ratio : null;
}

export function generationScalePayload(mode: ScaleMode, manual: string, points: PixelPoint[], length: string, asset: LabAsset) {
  if (mode === 'auto') return { scaleMode: mode };
  if (mode === 'manual') {
    const mmPerPixel = Number(manual);
    if (!Number.isFinite(mmPerPixel) || mmPerPixel <= 0) throw new Error('请输入大于 0 的手动比例（毫米 / 像素）。');
    return { scaleMode: mode, mmPerPixel };
  }
  const lengthMm = Number(length);
  if (calibratedScale(points, lengthMm, asset.width, asset.height) === null) throw new Error('请在原图选择两个不同点，并输入大于 0 的已知长度。');
  return { scaleMode: mode, calibration: { p1: points[0], p2: points[1], lengthMm } };
}

export function generationInputSnapshot(job: LabJob | null | undefined) {
  const original = job?.sourceAsset;
  const sourceAsset = original && typeof original.id === 'string' && typeof original.name === 'string' && typeof original.url === 'string' && original.url.startsWith(`${API}/assets/`) && Number.isFinite(original.width) && original.width > 0 && Number.isFinite(original.height) && original.height > 0 ? original : undefined;
  const input = job?.input && typeof job.input === 'object' ? job.input : undefined;
  const mmPerPixel = typeof input?.mmPerPixel === 'number' && Number.isFinite(input.mmPerPixel) && input.mmPerPixel > 0 ? input.mmPerPixel : undefined;
  const scaleMode: ScaleMode | undefined = input?.scaleMode && ['auto', 'calibrated', 'manual'].includes(input.scaleMode) ? input.scaleMode : mmPerPixel !== undefined ? 'manual' : undefined;
  const value = input?.calibration;
  const calibration = scaleMode === 'calibrated' && sourceAsset && value && typeof value === 'object' && calibratedScale([value.p1, value.p2], value.lengthMm, sourceAsset.width, sourceAsset.height) !== null
    ? { p1: [...value.p1] as PixelPoint, p2: [...value.p2] as PixelPoint, lengthMm: value.lengthMm } : undefined;
  return { sourceAsset, scaleMode, mmPerPixel, calibration, prompt: typeof input?.prompt === 'string' ? input.prompt.slice(0, 4000) : undefined };
}

export function safeDraftViewerUrl(value: string, jobId: string, draftId: string, origin: string): string {
  const url = new URL(value, origin);
  if (url.origin !== origin || url.pathname !== `${API}/jobs/${encodeURIComponent(jobId)}/viewer` || url.searchParams.get('draftId') !== draftId || url.username || url.password || url.hash) throw new Error('候选预览地址无效，请重新打开任务。');
  return `${url.pathname}${url.search}`;
}

export function readViewerCaptures(frame: HTMLIFrameElement, signal?: AbortSignal): Promise<{ planDataUrl: string; sceneDataUrl: string }> {
  return new Promise((resolve, reject) => {
    const source = frame.contentWindow;
    if (!source) { reject(new Error('候选预览尚未准备好。')); return; }
    if (signal?.aborted) { reject(new Error('截图操作已中断。')); return; }
    const requestId = `capture-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const cleanup = () => { window.clearTimeout(timer); window.removeEventListener('message', onMessage); signal?.removeEventListener('abort', onAbort); };
    const onAbort = () => { cleanup(); reject(new Error('截图操作已中断。')); };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== source || event.origin !== window.location.origin || event.data?.type !== 'ai-lab:captures' || event.data.requestId !== requestId) return;
      cleanup();
      if (event.data.error) { reject(new Error('候选预览未能生成完整截图，请重试提交视图。')); return; }
      const { planDataUrl, sceneDataUrl } = event.data;
      const valid = (value: unknown): value is string => typeof value === 'string' && value.length <= 8 * 1024 * 1024 && /^data:image\/(?:png|jpeg);base64,[A-Za-z0-9+/=]+$/.test(value);
      if (!valid(planDataUrl) || !valid(sceneDataUrl)) { reject(new Error('预览未返回有效的 2D 和 3D 图片，请重试。')); return; }
      resolve({ planDataUrl, sceneDataUrl });
    };
    const timer = window.setTimeout(() => { cleanup(); reject(new Error('等待候选截图超时。请保持空间预览打开，然后重试提交视图。')); }, 20000);
    window.addEventListener('message', onMessage);
    signal?.addEventListener('abort', onAbort, { once: true });
    source.postMessage({ type: 'ai-lab:capture', requestId }, window.location.origin);
  });
}

export function readImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg'].includes(file.type)) return Promise.reject(new Error('请选择 PNG 或 JPG 图片。'));
  if (file.size > 12 * 1024 * 1024) return Promise.reject(new Error('图片需小于 12 MB，请缩小后重试。'));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('无法读取图片。'));
    reader.onerror = () => reject(new Error('无法读取图片，请重新选择。'));
    reader.readAsDataURL(file);
  });
}

export function readViewerState(frame: HTMLIFrameElement): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const source = frame.contentWindow;
    if (!source) { reject(new Error('预览尚未准备好，请稍后再保存。')); return; }
    const requestId = `state-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const cleanup = () => { clearTimeout(timer); window.removeEventListener('message', onMessage); };
    const onMessage = (event: MessageEvent) => {
      if (event.source !== source || event.origin !== window.location.origin || event.data?.type !== 'ai-lab:state' || event.data.requestId !== requestId) return;
      cleanup();
      if (!event.data.state || typeof event.data.state !== 'object' || Array.isArray(event.data.state)) reject(new Error('预览状态无法保存，请重新打开方案。'));
      else resolve(event.data.state);
    };
    const timer = window.setTimeout(() => { cleanup(); reject(new Error('预览尚未就绪，请等待后重试。')); }, 6000);
    window.addEventListener('message', onMessage);
    source.postMessage({ type: 'ai-lab:get-state', requestId }, window.location.origin);
  });
}
