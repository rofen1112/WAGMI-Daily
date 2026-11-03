const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;
const chineseTextPattern = /[\u3400-\u9fff]/;

const releaseTypes = new Set(['open-source', 'open-weight']);
const relationships = new Set(['official-base-model', 'official-derivative', 'community-finetune']);
const accessTypes = new Set(['public', 'gated']);
const decisions = new Set(['approved', 'observe', 'rejected']);

export function validateModelWatchlist(payload) {
  const errors = [];
  if (!payload || typeof payload !== 'object') return ['model watchlist must be an object'];
  if (payload.schemaVersion !== '1.0.0') errors.push('model watchlist schemaVersion must be 1.0.0');
  if (!isoDatePattern.test(payload.updatedAt ?? '')) errors.push('model watchlist updatedAt must use YYYY-MM-DD');
  if (!Array.isArray(payload.models)) return [...errors, 'model watchlist models must be an array'];

  const ids = new Set();
  const modelIds = new Set();
  for (const model of payload.models) {
    const label = model?.modelId ?? model?.id ?? 'unknown';
    if (!model?.id) errors.push(`${label} is missing id`);
    if (ids.has(model?.id)) errors.push(`duplicate model id ${model.id}`);
    ids.add(model?.id);

    if (!/^[\w.-]+\/[\w.-]+$/.test(model?.modelId ?? '')) errors.push(`${label} has an invalid modelId`);
    const normalizedModelId = String(model?.modelId ?? '').toLowerCase();
    if (modelIds.has(normalizedModelId)) errors.push(`duplicate modelId ${model.modelId}`);
    modelIds.add(normalizedModelId);

    if (model?.source !== 'huggingface') errors.push(`${label} has an unsupported source`);
    if (model?.url !== `https://huggingface.co/${model?.modelId}`) errors.push(`${label} has an invalid Hugging Face URL`);
    if (!releaseTypes.has(model?.releaseType)) errors.push(`${label} has an invalid releaseType`);
    if (!relationships.has(model?.relationship)) errors.push(`${label} has an invalid relationship`);
    if (!accessTypes.has(model?.access)) errors.push(`${label} has an invalid access value`);
    if (!decisions.has(model?.intakeDecision)) errors.push(`${label} has an invalid intakeDecision`);
    if (!isoDatePattern.test(model?.reviewedAt ?? '')) errors.push(`${label} reviewedAt must use YYYY-MM-DD`);

    for (const field of ['name', 'publisher', 'level', 'license', 'summaryZh', 'valueZh', 'riskNoteZh', 'decisionReason']) {
      if (!model?.[field]) errors.push(`${label} is missing ${field}`);
    }
    for (const field of ['summaryZh', 'valueZh', 'riskNoteZh', 'decisionReason']) {
      if (!chineseTextPattern.test(model?.[field] ?? '')) errors.push(`${label} ${field} must contain Chinese text`);
    }
    for (const field of ['modalities', 'tasks', 'priorityDomains', 'upstreamModels', 'relatedRepositories']) {
      if (!Array.isArray(model?.[field])) errors.push(`${label} ${field} must be an array`);
    }
    if (!model?.tasks?.length) errors.push(`${label} must have at least one task`);
    if (!model?.priorityDomains?.length) errors.push(`${label} must have at least one priority domain`);
    if (model?.relationship === 'community-finetune' && !model?.upstreamModels?.length) {
      errors.push(`${label} community fine-tune must declare an upstream model`);
    }
    if (model?.releaseType === 'open-source' && /community license/i.test(model?.license ?? '')) {
      errors.push(`${label} community-licensed weights cannot be labeled open-source`);
    }
    for (const repository of model?.relatedRepositories ?? []) {
      if (!/^[\w.-]+\/[\w.-]+$/.test(repository?.repo ?? '')) errors.push(`${label} has an invalid related repository`);
      if (repository?.url !== `https://github.com/${repository?.repo}`) errors.push(`${label} has an invalid related repository URL`);
      if (!chineseTextPattern.test(repository?.roleZh ?? '')) errors.push(`${label} related repository role must contain Chinese text`);
    }
  }
  return errors;
}
