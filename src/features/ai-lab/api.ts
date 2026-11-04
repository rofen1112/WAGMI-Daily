export const API = '/api/ai-lab/v1';

export interface LabAsset { id: string; name: string; width: number; height: number; url: string; mime: string }
export interface LabProject { id: string; title: string; updatedAt?: string; sceneVersion: number; latestJob?: LabJob | null }
export interface LabJob {
  id: string; projectId: string; status: string; stage?: string; progress?: number | null;
  message?: string; events?: Array<string | { stage?: string; message?: string; at?: string }>;
  error?: string | { code?: string; message?: string; details?: unknown }; sceneVersion?: number;
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

export function projectStatusLabel(project: LabProject) {
  const version = Number.isFinite(project.sceneVersion) && project.sceneVersion > 0 ? `版本 ${project.sceneVersion} · ` : '';
  const status = project.latestJob?.status;
  const modified = ['modified', 'baseline_reference_modified'].includes(project.latestJob?.source || '');
  const labels: Record<string, string> = { queued: '排队中', running: '生成中', failed: modified ? '修改失败' : '生成失败', cancelled: '已取消', canceled: '已取消', needs_input: '需补信息' };
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
