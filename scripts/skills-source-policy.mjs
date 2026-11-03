import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const historySourceId = 'skills-review-source-identities';
const requiredSources = ['skills-sh-trending', 'skills-sh-hot', 'skills-sh-catalog', 'skills-sh-official', 'skills-sh-detail'];
const identity = value => String(value ?? '').toLowerCase();
const shanghaiDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Shanghai' });

export async function readSkillsReview(root, latest) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(latest?.asOf ?? '')
      || !latest?.sourceStatus?.some(source => source.id === historySourceId && source.status === 'warning')) return null;
  try {
    return JSON.parse(await readFile(resolve(root, `data/dev/skills-review-verification-${latest.asOf}.json`), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return null;
    throw error;
  }
}

// An unresolved historical identity is a maintenance notice only when dated
// review evidence proves it is separate from the verified current shortlist.
// Keep the source/run warning intact; never convert an unknown failure to success.
export function evaluateSkillsPublication(latest, review = null) {
  const sources = latest?.sourceStatus ?? [];
  const history = sources.find(source => source.id === historySourceId && source.status === 'warning');
  const pending = review?.items?.filter(item => item.classification === 'unable_to_confirm') ?? [];
  const pendingIds = new Set(pending.map(item => identity(item.id)));
  const shortlist = latest?.skills ?? [];
  const message = history?.message;
  const historicalRepositories = sources.find(source => source.id === 'github-review-repositories' && source.status === 'warning');
  const activeIds = new Set(shortlist.map(skill => identity(skill.id)));
  const repositoryRows = (review?.items ?? []).filter(item => item.evidence?.repositoryUrl);
  const unavailableRepositories = new Map(repositoryRows
    .filter(item => ![200, 404].includes(item.evidence.repositoryStatus))
    .map(item => [item.evidence.repositoryUrl, item.evidence.repositoryStatus]));
  const historicalRepositoryNotice = Boolean(historicalRepositories
    && review?.asOf === latest?.asOf
    && historicalRepositories.evidence === `skills-review-verification-${latest.asOf}.json`
    && historicalRepositories.count === review.uniqueRepositoriesChecked
    && new Set(repositoryRows.map(item => item.evidence.repositoryUrl)).size === historicalRepositories.count
    && historicalRepositories.unavailable > 0
    && historicalRepositories.unavailable === unavailableRepositories.size
    && repositoryRows.length > 0
    && repositoryRows.every(item => item.id && !activeIds.has(identity(item.id))
      && Number.isFinite(Date.parse(item.lastSeenAt))
      && shanghaiDate.format(new Date(item.lastSeenAt)) < latest.asOf
      && Number.isFinite(Date.parse(item.evidence.repositoryCheckedAt))
      && shanghaiDate.format(new Date(item.evidence.repositoryCheckedAt)) === latest.asOf));
  const currentSourcesPassed = requiredSources.every(id => {
    const source = sources.find(item => item.id === id);
    return source?.status === 'success' && Number.isInteger(source.count) && source.count > 0;
  });
  const maintenanceMessages = [message,
    ...(historicalRepositoryNotice && historicalRepositories.message ? [historicalRepositories.message] : [])];
  const warnings = latest?.run?.warnings ?? [];
  const onlyHistoricalWarning = Boolean(history && message
    && sources.filter(source => source.status !== 'success').every(source => source === history
      || (historicalRepositoryNotice && source === historicalRepositories))
    && ['success', 'warning'].includes(latest?.run?.status)
    && (latest.run.status === 'success' || latest.run.message === message
      || (historicalRepositoryNotice && warnings.length > 0 && latest.run.message === warnings.join('；')))
    && warnings.every(warning => maintenanceMessages.includes(warning)));
  const historicalEvidencePassed = Boolean(review && review.asOf === latest?.asOf
    && pending.length > 0 && pendingIds.size === pending.length
    && pending.length === review.summary?.unable_to_confirm
    && pending.length === history?.unresolved && pending.length === history?.count
    && pending.every(item => item.id && Number.isFinite(Date.parse(item.lastSeenAt))
      && shanghaiDate.format(new Date(item.lastSeenAt)) < latest.asOf));
  const detail = sources.find(source => source.id === 'skills-sh-detail');
  const shortlistPassed = shortlist.length > 0 && shortlist.every(skill => skill.id
    && skill.date === latest.asOf && skill.metadataStatus === 'success'
    && skill.availabilityStatus === 'active' && !pendingIds.has(identity(skill.id)))
    && detail?.failed === 0 && detail?.count === shortlist.length;
  const historicalNotice = onlyHistoricalWarning && currentSourcesPassed && historicalEvidencePassed && shortlistPassed;
  const blockers = sources
    .filter(source => source.status !== 'success' && !(historicalNotice && (source === history
      || (historicalRepositoryNotice && source === historicalRepositories))))
    .map(source => `Skills source ${source.id}: ${source.status}`);
  if (latest?.run?.status !== 'success' && !(historicalNotice && latest?.run?.status === 'warning')) {
    blockers.push(`Skills run status is ${latest?.run?.status ?? 'missing'}`);
  }
  return {
    ready: blockers.length === 0,
    blockers,
    notices: historicalNotice ? [`Skill 历史目录 ${pending.length} 项来源仍待核验；当天来源与趋势详情通过，历史记录和 warning 保留。`,
      ...(historicalRepositoryNotice ? [`历史维护队列 ${unavailableRepositories.size} 个 GitHub 仓库访问受限；同日检查证明全部记录早于当天且与当前精选无交集，保留真实访问状态。`] : [])] : [],
  };
}
