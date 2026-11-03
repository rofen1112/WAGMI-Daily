import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { validateModelWatchlist } from '../scripts/model-watchlist.mjs';

test('open model watchlist is valid and retains the Krea 2 model lineage', async () => {
  const watchlist = JSON.parse(await readFile(new URL('../model-industry-watchlist.json', import.meta.url), 'utf8'));
  assert.deepEqual(validateModelWatchlist(watchlist), []);

  const models = new Map(watchlist.models.map((model) => [model.modelId, model]));
  assert.ok(models.has('conradlocke/krea2-identity-edit'));
  assert.ok(models.has('krea/Krea-2-Raw'));
  assert.equal(models.get('conradlocke/krea2-identity-edit').relationship, 'community-finetune');
  assert.equal(models.get('conradlocke/krea2-identity-edit').releaseType, 'open-weight');
  assert.deepEqual(models.get('conradlocke/krea2-identity-edit').upstreamModels, ['krea/Krea-2-Raw']);
});

test('community-license weights cannot be mislabeled as open source', () => {
  const payload = {
    schemaVersion: '1.0.0',
    updatedAt: '2026-07-29',
    models: [{
      id: 'owner-model',
      name: '模型',
      modelId: 'owner/model',
      source: 'huggingface',
      url: 'https://huggingface.co/owner/model',
      publisher: 'owner',
      level: 'A',
      relationship: 'official-base-model',
      releaseType: 'open-source',
      access: 'public',
      license: 'Example Community License',
      modalities: ['image'],
      tasks: ['图像生成'],
      priorityDomains: ['image-generation'],
      summaryZh: '中文摘要',
      valueZh: '中文价值',
      riskNoteZh: '中文风险',
      upstreamModels: [],
      relatedRepositories: [],
      metrics: { likes: 1, downloadsLastMonth: 1, downloadsTracked: true },
      reviewedAt: '2026-07-29',
      intakeDecision: 'approved',
      decisionReason: '中文理由',
    }],
  };

  assert.ok(validateModelWatchlist(payload).some((error) => error.includes('cannot be labeled open-source')));
});
