import type { AiEvent, PaperCatalog, SkillCatalog, Snapshot } from './types';

export const isAdminBuild = import.meta.env.MODE === 'admin';

const publicRetryDelays = [0, 800, 2_000];

class DataRequestError extends Error {
  retryable: boolean;

  constructor(message: string, retryable = true) {
    super(message);
    this.name = 'DataRequestError';
    this.retryable = retryable;
  }
}

function waitForRetry(delay: number, signal?: AbortSignal) {
  if (signal?.aborted) return Promise.reject(signal.reason ?? new DOMException('请求已取消', 'AbortError'));
  if (!delay) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const onAbort = () => {
      window.clearTimeout(timer);
      reject(signal?.reason ?? new DOMException('请求已取消', 'AbortError'));
    };
    const timer = window.setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, delay);
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

async function loadJson(url: string, label: string, signal?: AbortSignal): Promise<unknown> {
  const delays = isAdminBuild ? [0] : publicRetryDelays;
  let lastError: unknown = null;

  for (let attempt = 0; attempt < delays.length; attempt += 1) {
    await waitForRetry(delays[attempt], signal);
    try {
      const response = await fetch(url, { cache: isAdminBuild ? 'no-store' : 'no-cache', signal });
      if (!response.ok) {
        const retryable = response.status === 429 || response.status >= 500;
        throw new DataRequestError(`${label}加载失败（HTTP ${response.status}）`, retryable);
      }
      return await response.json();
    } catch (error) {
      if (signal?.aborted) throw error;
      lastError = error;
      if (error instanceof DataRequestError && !error.retryable) break;
    }
  }

  if (lastError instanceof DataRequestError) throw lastError;
  throw new Error(`${label}连接不稳定，已重试 ${delays.length} 次仍无法读取`);
}

function assertSnapshot(value: unknown): asserts value is Snapshot {
  if (!value || typeof value !== 'object') throw new Error('数据文件不是有效对象');
  const candidate = value as Partial<Snapshot>;
  if (candidate.schemaVersion !== '1.0.0') throw new Error('数据版本不受支持');
  for (const field of ['projects', 'aiEvents', 'skills', 'runs', 'reports'] as const) {
    if (!Array.isArray(candidate[field])) throw new Error(`数据字段 ${field} 无效`);
  }
}

export async function loadSnapshot(signal?: AbortSignal): Promise<Snapshot> {
  const url = isAdminBuild ? '/__admin/data/index.json' : '/data/main/index.json';
  const data = await loadJson(url, '数据', signal);
  assertSnapshot(data);
  return data;
}

export async function loadSkillCatalog(signal?: AbortSignal): Promise<SkillCatalog> {
  const url = isAdminBuild ? '/__admin/data/skills-catalog.json' : '/data/main/skills-catalog.json';
  const data = await loadJson(url, 'Skill 目录', signal);
  if (!data || typeof data !== 'object' || !Array.isArray((data as Partial<SkillCatalog>).skills)) {
    throw new Error('Skill 目录数据无效');
  }
  return data as SkillCatalog;
}

export async function loadPaperCatalog(signal?: AbortSignal): Promise<PaperCatalog> {
  const url = isAdminBuild ? '/__admin/data/papers-catalog.json' : '/data/main/papers-catalog.json';
  const data = await loadJson(url, '论文目录', signal);
  if (!data || typeof data !== 'object' || !Array.isArray((data as Partial<PaperCatalog>).papers)) {
    throw new Error('论文目录数据无效');
  }
  return data as PaperCatalog;
}

export function formatDate(date: string | null, includeTime = false): string {
  if (!date) return '暂无记录';
  const parsed = new Date(date.length === 10 ? `${date}T00:00:00+08:00` : date);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...(includeTime ? { hour: '2-digit', minute: '2-digit', hour12: false } : {}),
  }).format(parsed);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('zh-CN').format(value);
}

export function aiEventEditionDate(event: Pick<AiEvent, 'date' | 'sourceReportId'>): string {
  return event.sourceReportId.match(/^ai-(\d{4}-\d{2}-\d{2})$/)?.[1] ?? event.date;
}
