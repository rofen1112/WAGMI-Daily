import type { LabJob, LabScaleProvenance } from './api';

export const workflowStageLabels: Record<string, string> = {
  analyzing: '分析图纸', scale_estimation: '估算参照尺度', structure: '重建结构', furnishing: '添加可见家具', validating: '结构校验',
  geometry_repair: '修正结构', preview: '准备预览视图', visual_review: '视觉复核', visual_repair: '按复核修正', saved: '方案已保存',
};

function strings(value: unknown, limit = 6) {
  return Array.isArray(value) ? value.slice(0, 32).filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean).slice(0, limit).map((item) => item.slice(0, 300)) : [];
}

function reviewItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 8).map((item) => {
    if (typeof item === 'string') return item.slice(0, 400);
    if (!item || typeof item !== 'object') return '';
    const description = typeof item.description === 'string' ? item.description : typeof item.message === 'string' ? item.message : '';
    if (!description) return '';
    const severity = item.severity === 'critical' ? '关键问题：' : '';
    const suggestion = typeof item.suggestedChange === 'string' ? ` 建议：${item.suggestedChange.slice(0, 200)}` : '';
    return `${severity}${description.slice(0, 300)}${suggestion}`;
  }).filter(Boolean);
}

export function ScaleProvenanceSummary({ provenance }: { provenance: LabScaleProvenance | null | undefined }) {
  if (!provenance || !['manual', 'measured', 'estimated'].includes(provenance.mode)) return null;
  const labels = { manual: '手动比例', measured: '按已知长度校准', estimated: '自动估算' };
  const confidence = { low: '低', medium: '中', high: '高' };
  const value = typeof provenance.mmPerPixel === 'number' && Number.isFinite(provenance.mmPerPixel) && provenance.mmPerPixel > 0 ? Number(provenance.mmPerPixel.toPrecision(5)) : null;
  const range = provenance.rangeMmPerPixel;
  const validRange = Array.isArray(range) && range.length === 2 && range.every((item) => typeof item === 'number' && Number.isFinite(item) && item > 0) && range[0] <= range[1];
  const evidence = strings(provenance.evidence);
  const assumptions = strings(provenance.assumptions);
  return <div className="lab-provenance"><strong>比例依据 · {labels[provenance.mode]}</strong>{value !== null && <p>{value} mm / px{provenance.confidence && confidence[provenance.confidence] ? ` · 置信度${confidence[provenance.confidence]}` : ''}</p>}{validRange && <p>估算范围 {Number(range[0].toPrecision(5))}–{Number(range[1].toPrecision(5))} mm / px</p>}{evidence.length > 0 && <ul>{evidence.map((item, index) => <li key={index}>{item}</li>)}</ul>}{assumptions.length > 0 && <details><summary>假设与限制</summary><ul>{assumptions.map((item, index) => <li key={index}>{item}</li>)}</ul></details>}<small>{provenance.mode === 'estimated' ? '这是模型估算，不能作为实测尺寸。' : '依据提供或识别的长度换算，未经现场实测核验。'}</small></div>;
}

export default function WorkflowSummary({ job, provenance }: { job: LabJob | null; provenance?: LabScaleProvenance | null }) {
  const handoff = job?.executionMode ? job.executionMode === 'codex_handoff' : Boolean(job?.pipelineVersion?.startsWith('codex-handoff') || job?.handoff || job?.status === 'awaiting_codex' || job?.model === 'codex-current-session' || job?.usageAccounting === 'current_session_unreported');
  const analysis = job?.analysis;
  const summary = typeof analysis?.summary === 'string' ? analysis.summary.slice(0, 800) : '';
  const notes = strings(analysis?.notes, 4);
  const review = job?.visualReview || job?.review;
  const reviewPass = typeof review?.pass === 'boolean' ? review.pass : null;
  const issues = reviewItems(review?.issues);
  const limitations = strings(review?.limitations);
  const reasons = strings(review?.reasons).length > 0 ? strings(review?.reasons) : typeof review?.reason === 'string' ? [review.reason.slice(0, 500)] : [];
  const recorded = [...new Set([...(job?.events || []).map((item) => typeof item === 'object' ? item.stage || '' : ''), job?.stage || ''])].filter((stage) => workflowStageLabels[stage]);
  return <>{job && (job.pipelineVersion || job.executionMode) && <p className="lab-workflow-label">{handoff ? '当前 Codex 聊天接力' : job.pipelineVersion === 'codex-workflow-v1' ? 'API 分阶段生成 · 含视觉复核' : '历史单次生成流程 · API'}</p>}{recorded.length > 0 && <ol className="lab-workflow-stages" aria-label="已记录的生成阶段">{recorded.map((stage) => <li key={stage} aria-current={stage === job?.stage ? 'step' : undefined}>{workflowStageLabels[stage]}</li>)}</ol>}{summary && <details className="lab-workflow-detail" open><summary>图纸分析</summary><p>{summary}</p>{notes.length > 0 && <ul>{notes.map((item, index) => <li key={index}>{item}</li>)}</ul>}</details>}<ScaleProvenanceSummary provenance={provenance || job?.scaleProvenance}/>{review && <details className="lab-workflow-detail" open><summary>模型视觉复核 · {reviewPass === true ? '通过' : reviewPass === false ? '需要调整' : '待结论'}</summary>{[...reasons, ...issues].length > 0 && <ul>{[...reasons, ...issues].slice(0, 10).map((item, index) => <li key={index}>{item}</li>)}</ul>}{limitations.length > 0 && <><p>复核限制</p><ul>{limitations.map((item, index) => <li key={index}>{item}</li>)}</ul></>}<small>模型复核不能替代独立人工验收。</small></details>}</>;
}
