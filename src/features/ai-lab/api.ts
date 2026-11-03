export const API = '/api/ai-lab/v1';

export interface LabAsset { id: string; name: string; width: number; height: number; url: string; mime: string }
export interface LabProject { id: string; title: string; updatedAt?: string; sceneVersion: number; latestJob?: LabJob | null }
export interface LabJob {
  id: string; projectId: string; status: string; stage?: string; progress?: number | null;
  message?: string; events?: Array<string | { stage?: string; message?: string; at?: string }>;
  error?: string | { code?: string; message?: string }; sceneVersion?: number;
  usage?: Record<string, unknown> | null; validation?: LabValidation; source?: string;
}
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
export const isActiveJob = (job: LabJob | null | undefined) => Boolean(job && ['queued', 'running'].includes(job.status));
export const errorMessage = (error: unknown) => error instanceof Error ? error.message : '操作未完成，请重试。';
export const jobError = (job: LabJob) => typeof job.error === 'string' ? job.error : job.error?.message || job.message || '';

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
