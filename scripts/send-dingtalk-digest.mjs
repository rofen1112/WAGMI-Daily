import { createHash, createHmac } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import './network-fetch.mjs';
import { checkPublicUrl } from './check-public-url.mjs';
import { aiPublicationBlockers } from './ai-source-policy.mjs';
import { evaluateSkillsPublication, readSkillsReview } from './skills-source-policy.mjs';
import { loadAiDiscoveryReview } from './ai-discovery-review.mjs';
import { acquireDingtalkSendLock } from './dingtalk-send-lock.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const privateEnvPath = resolve(root, '.env.dingtalk.local');
const sendRecordPath = resolve(root, 'data/dev/dingtalk-last-send.json');
const runRecordPath = resolve(root, 'data/dev/dingtalk-run.json');

class StaleDataError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StaleDataError';
    this.exitCode = 2;
  }
}

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function loadPrivateEnv() {
  let content = '';
  try {
    content = await readFile(privateEnvPath, 'utf8');
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
  for (const line of content.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].trim();
  }
}

function shanghaiDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function compact(value, length = 118) {
  const text = String(value ?? '').replace(/\s+/g, ' ').trim();
  return text.length > length ? `${text.slice(0, length - 1)}…` : text;
}

function markdownText(value, length) {
  return compact(value, length).replace(/[\\`*_[\]]/g, '\\$&');
}

function safeExternalUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

export function normalizePublicUrl(value) {
  const url = new URL(String(value ?? '').trim());
  if (url.protocol !== 'https:') throw new Error('WAGMI_PUBLIC_URL must use HTTPS');
  if (['localhost', '127.0.0.1', '0.0.0.0'].includes(url.hostname)) {
    throw new Error('WAGMI_PUBLIC_URL must be reachable outside this computer');
  }
  url.hash = '';
  url.search = '';
  return url.toString().replace(/\/$/, '');
}

function channelState(source, date, schedule) {
  const asOf = source?.asOf ?? null;
  const runStatus = source?.run?.status ?? 'unknown';
  const runStatusLabel = {
    success: '成功',
    warning: '采集警告',
    failed: '失败',
    unknown: '状态未知',
  }[runStatus] ?? runStatus;
  const current = asOf === date;
  const fresh = current && runStatus === 'success';
  let display;
  if (fresh) display = `[最新] ${asOf} · 成功`;
  else if (current) display = `[需复查] ${asOf} · ${runStatusLabel}`;
  else display = `[待更新] 当前 ${asOf ?? '无数据'} · 上次${runStatusLabel}`;
  return { schedule, asOf, runStatus, current, fresh, display };
}

export function buildFreshness({ date, aiLatest, githubLatest, skillsLatest, skillsReview = null, discoveryReview = null }) {
  const ai = channelState(aiLatest, date, '07:30');
  ai.blockers = aiPublicationBlockers(aiLatest, date);
  if (date >= '2026-10-29') {
    ai.blockers.push(...(discoveryReview?.blockers ?? ['AI candidate discovery review has not been checked']));
    if (discoveryReview && !discoveryReview.ready && !discoveryReview.blockers?.length) ai.blockers.push('AI candidate discovery review is incomplete');
  }
  ai.fresh = ai.fresh && ai.blockers.length === 0;
  if (ai.current && !ai.fresh) ai.display = `[需复查] ${ai.asOf} · 原始来源或批次待核验`;
  const github = channelState(githubLatest, date, '07:30');
  const skills = channelState(skillsLatest, date, '07:40');
  const skillsPublication = evaluateSkillsPublication(skillsLatest, skillsReview);
  skills.blockers = skillsPublication.blockers;
  skills.notices = skillsPublication.notices;
  skills.fresh = skills.current && skillsPublication.ready;
  if (skills.fresh && skills.notices.length) skills.display = `[最新] ${skills.asOf} · 当天采集通过，历史目录待核验`;
  return { date, ready: ai.fresh && github.fresh && skills.fresh, ai, github, skills };
}

export function buildPublicationState({ date, main = {} }) {
  const channels = ['ai', 'github', 'skills'];
  const asOf = Object.fromEntries(channels.map((channel) => [channel, main.asOf?.[channel] ?? null]));
  const staleChannels = channels.filter((channel) => asOf[channel] !== date);
  const generatedAt = main.generatedAt ?? null;
  const ready = main.track === 'main' && Boolean(generatedAt) && staleChannels.length === 0;
  return {
    ready,
    track: main.track ?? null,
    generatedAt,
    asOf,
    staleChannels,
  };
}

function selectHotItems(aiEvents, projects) {
  const aiScores = { A: 1_200, B: 800, C: 300 };
  const aiItems = aiEvents
    .filter((event) => ['A', 'B'].includes(event.priority ?? 'B'))
    .map((event) => ({
      type: 'AI',
      score: aiScores[event.priority ?? 'B'],
      title: event.title,
      url: safeExternalUrl(event.sources?.find((source) => source?.url)?.url),
      date: event.date,
    }));
  const githubItems = projects
    .filter((project) => Number(project.starsDelta ?? 0) >= 10)
    .map((project) => ({
      type: 'GitHub',
      score: 600 + Math.min(Number(project.starsDelta ?? 0), 500),
      title: project.repo ?? project.name,
      url: safeExternalUrl(project.url),
      starsDelta: Number(project.starsDelta ?? 0),
    }));
  return [...aiItems, ...githubItems]
    .sort((left, right) => right.score - left.score)
    .slice(0, 3);
}

function buildDailySummary(hotItems) {
  if (!hotItems.length) {
    return '今日没有达到热点门槛的新事件；我的判断是市场处于信息消化期，继续关注官方发布、真实产品进展和开源项目的持续增长。';
  }
  const topAi = hotItems.find((item) => item.type === 'AI');
  const topGithub = hotItems.find((item) => item.type === 'GitHub');
  if (topAi && topGithub) {
    return `今日焦点集中在“${compact(topAi.title, 54)}”；开源侧 ${compact(topGithub.title, 42)} 以 +${topGithub.starsDelta} Stars 成为最强增长信号。`;
  }
  if (topAi) return `今日 AI 热点集中在“${compact(topAi.title, 72)}”，值得优先跟进官方进展与后续落地。`;
  return `今日开源侧最强信号来自 ${compact(topGithub.title, 58)}，本地快照新增 ${topGithub.starsDelta} Stars（间隔以实际快照为准）。`;
}

function itemTitle(item) {
  const title = markdownText(item.title, 82);
  return item.url ? `[${title}](${item.url})` : title;
}

export function buildDigest({ date, aiLatest, githubLatest, skillsLatest, skillsReview = null, discoveryReview = null, main = {}, publicUrl }) {
  const normalizedPublicUrl = normalizePublicUrl(publicUrl);
  const freshness = buildFreshness({ date, aiLatest, githubLatest, skillsLatest, skillsReview, discoveryReview });
  const publication = buildPublicationState({ date, main });
  const aiEvents = aiLatest?.asOf === date
    ? (aiLatest.aiEvents ?? [])
    : (main.aiEvents ?? []).filter((event) => event.sourceReportId === `ai-${date}`);
  const projects = (githubLatest?.asOf === date
    ? (githubLatest.projects ?? [])
    : (main.projects ?? []).filter((project) => project.sourceReportId === `github-${date}`))
    .sort((left, right) => (right.starsDelta ?? 0) - (left.starsDelta ?? 0));
  const hotItems = selectHotItems(aiEvents, projects);
  const dateLabel = date.slice(5).replace('-', '/');
  const dailyReportUrl = `${normalizedPublicUrl}/#/today`;
  const lines = [
    `### ark.insight · ${dateLabel}`,
    `### [打开今日完整日报 →](${dailyReportUrl})`,
    `> ${markdownText(buildDailySummary(hotItems), 180)}`,
    '',
  ];

  if (hotItems.length) {
    lines.push(`#### 今日热点 · ${hotItems.length} 条`);
    hotItems.forEach((item, index) => {
      lines.push(`${index + 1}. **${item.type}｜${itemTitle(item)}**`);
    });
  } else {
    lines.push('#### 今日观察');
    lines.push('- 不为凑数收录低置信度消息，等待下一批可核验的官方信号。');
  }

  lines.push(
    '',
    '#### 数据检查',
    `- AI ${freshness.ai.schedule}：${freshness.ai.display}`,
    `- GitHub ${freshness.github.schedule}：${freshness.github.display}`,
    `- Skill ${freshness.skills.schedule}：${freshness.skills.display}`,
  );

  const text = lines.join('\n').slice(0, 18_000);
  return {
    date,
    title: `ark.insight ${dateLabel}`,
    text,
    summary: buildDailySummary(hotItems),
    counts: { aiEvents: aiEvents.length, projects: projects.length, hotItems: hotItems.length },
    freshness,
    publication,
    publicUrl: normalizedPublicUrl,
  };
}

async function loadDigestInput(date) {
  const [main, aiLatest, githubLatest, skillsLatest] = await Promise.all([
    readJson('data/main/index.json', {}),
    readJson('data/dev/ai-events-latest.json'),
    readJson('data/dev/github-radar-latest.json'),
    readJson('data/dev/skills-radar-latest.json'),
  ]);
  return buildDigest({
    date,
    aiLatest,
    githubLatest,
    skillsLatest,
    skillsReview: await readSkillsReview(root, skillsLatest),
    discoveryReview: date >= '2026-10-29' ? await loadAiDiscoveryReview(root, date, {
      events: aiLatest?.aiEvents ?? [], allEvents: [...(main.aiEvents ?? []), ...(aiLatest?.aiEvents ?? [])],
    }) : null,
    main,
    publicUrl: process.env.WAGMI_PUBLIC_URL,
  });
}

async function latestAvailableDate() {
  const [main, aiLatest, githubLatest, skillsLatest] = await Promise.all([
    readJson('data/main/index.json', {}),
    readJson('data/dev/ai-events-latest.json'),
    readJson('data/dev/github-radar-latest.json'),
    readJson('data/dev/skills-radar-latest.json'),
  ]);
  return [main.brief?.date, main.asOf?.ai, main.asOf?.github, main.asOf?.skills, aiLatest?.asOf, githubLatest?.asOf, skillsLatest?.asOf]
    .filter((value) => /^\d{4}-\d{2}-\d{2}$/.test(value ?? ''))
    .sort()
    .pop() ?? shanghaiDate();
}

async function verifyPublicPublication(digest) {
  if (!digest.publication.ready) {
    const channels = digest.publication.staleChannels.join(', ') || 'unknown';
    throw new StaleDataError(`Local main is not ready for ${digest.date}: stale channels ${channels}`);
  }
  try {
    return await checkPublicUrl({
      base: digest.publicUrl,
      expectedGeneratedAt: digest.publication.generatedAt,
      cacheKey: `dingtalk-${Date.now()}`,
    });
  } catch (error) {
    throw new StaleDataError(`Public report is not current: ${error instanceof Error ? error.message : 'validation failed'}`);
  }
}

async function writeRunRecord(status, message, lastSuccess = null) {
  const previous = await readJson('data/dev/dingtalk-run.json', {});
  const record = {
    id: 'wagmi-dingtalk',
    name: '钉钉日报推送',
    channel: 'operations',
    schedule: '每天 08:30',
    checkedAt: new Date().toISOString(),
    lastSuccess: lastSuccess ?? previous.lastSuccess ?? null,
    status,
    artifact: null,
    message,
  };
  await mkdir(dirname(runRecordPath), { recursive: true });
  await writeFile(runRecordPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
}

async function sendMessage({ title, text }, onRequestStarted = async () => {}) {
  const webhook = process.env.DINGTALK_WEBHOOK;
  const secret = process.env.DINGTALK_SECRET;
  if (!webhook || !secret) throw new Error('Missing DingTalk credentials in .env.dingtalk.local');
  const signedWebhook = buildSignedWebhook(webhook, secret, Date.now());
  await onRequestStarted();
  const response = await fetch(signedWebhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      msgtype: 'markdown',
      markdown: { title, text },
      at: { isAtAll: false },
    }),
  });
  const result = await response.json();
  if (!response.ok || result.errcode !== 0) {
    const error = new Error(`DingTalk send failed: HTTP ${response.status}, code ${result.errcode ?? 'unknown'}, ${result.errmsg ?? 'unknown error'}`);
    error.deliveryRejected = Number.isFinite(result.errcode) && result.errcode !== 0;
    throw error;
  }
  return result;
}

export function buildSignedWebhook(webhook, secret, timestamp) {
  const url = new URL(webhook);
  if (url.protocol !== 'https:' || url.hostname !== 'oapi.dingtalk.com' || url.pathname !== '/robot/send') {
    throw new Error('DingTalk webhook must use the official HTTPS robot endpoint');
  }
  if (!url.searchParams.get('access_token')) throw new Error('DingTalk webhook is missing access_token');
  if (!secret?.startsWith('SEC')) throw new Error('DingTalk signing secret is invalid');
  const sign = createHmac('sha256', secret).update(`${timestamp}\n${secret}`).digest('base64');
  url.searchParams.set('timestamp', String(timestamp));
  url.searchParams.set('sign', sign);
  return url.toString();
}

export function decideSendAction({ existing, date, digestHash, supplement = false, force = false }) {
  if (existing?.date === date && existing.digestHash === digestHash) return 'skip';
  if (existing?.date === date) return supplement || force ? 'supplement' : 'needs-supplement';
  return 'initial';
}

export function isDingtalkSuppressed(control, date) {
  return Array.isArray(control?.suppressedDates) && control.suppressedDates.some((entry) => entry.date === date);
}

function staleMessage(digest) {
  const channels = [
    !digest.freshness.ai.fresh ? `AI(${digest.freshness.ai.display})` : null,
    !digest.freshness.github.fresh ? `GitHub(${digest.freshness.github.display})` : null,
    !digest.freshness.skills.fresh ? `Skill(${digest.freshness.skills.display})` : null,
  ].filter(Boolean);
  return `${digest.date} 推送已暂停，需先更新：${channels.join('、')}`;
}

async function saveSendRecord({ digest, digestHash, result, sendType, existing }) {
  const sentAt = new Date().toISOString();
  const history = Array.isArray(existing?.history) ? existing.history : [];
  if (existing?.date && existing?.digestHash && !history.some((item) => item.digestHash === existing.digestHash)) {
    history.push({ sentAt: existing.sentAt, digestHash: existing.digestHash, sendType: existing.sendType ?? 'initial' });
  }
  history.push({ sentAt, digestHash, sendType });
  const record = {
    date: digest.date,
    sentAt,
    sendType,
    digestHash,
    counts: digest.counts,
    freshness: digest.freshness,
    publicUrl: digest.publicUrl,
    history,
    response: { errcode: result.errcode, errmsg: result.errmsg },
  };
  await mkdir(dirname(sendRecordPath), { recursive: true });
  await writeFile(sendRecordPath, `${JSON.stringify(record, null, 2)}\n`, 'utf8');
  await writeRunRecord(
    'success',
    `${digest.date} ${sendType === 'supplement' ? '补发' : '日报'}发送成功：${digest.counts.hotItems} 条热点，链接已验证。`,
    sentAt,
  );
  return record;
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  const force = process.argv.includes('--force');
  const testConnection = process.argv.includes('--test-connection');
  const previewDigest = process.argv.includes('--preview-digest');
  const checkOnly = process.argv.includes('--check');
  const supplement = process.argv.includes('--supplement');
  const date = shanghaiDate();
  const control = await readJson('data/dev/dingtalk-send-control.json', {});
  if (isDingtalkSuppressed(control, date)) {
    const message = `${date} 用户指定今日不推送，已跳过钉钉；次日任务正常执行。`;
    if (!dryRun && !checkOnly) await writeRunRecord('success', message);
    console.log(JSON.stringify({ date, ready: false, action: 'suppressed', message }, null, 2));
    return;
  }
  await loadPrivateEnv();

  if (testConnection) {
    await sendMessage({
      title: 'ark.insight 推送配置',
      text: '### ark.insight\n> 钉钉机器人与加签验证成功。正式日报将在每日 08:30 推送。',
    });
    console.log('DingTalk connection test succeeded.');
    return;
  }

  const digestDate = previewDigest ? await latestAvailableDate() : date;
  const digest = await loadDigestInput(digestDate);
  const digestHash = createHash('sha256').update(digest.text).digest('hex');

  if (dryRun) {
    console.log(JSON.stringify({ ...digest, digestHash }, null, 2));
    return;
  }

  let publicPublication;
  try {
    publicPublication = await verifyPublicPublication(digest);
  } catch (error) {
    if (!checkOnly) {
      await writeRunRecord('warning', `${digest.date} 未发送：${error instanceof Error ? error.message : '公网发布验证失败'}`);
    }
    throw error;
  }

  if (checkOnly) {
    const result = {
      date: digest.date,
      ready: digest.freshness.ready && digest.publication.ready,
      publicUrl: {
        status: 'current',
        url: digest.publicUrl,
        generatedAt: publicPublication.generatedAt,
      },
      publication: digest.publication,
      ai: digest.freshness.ai,
      github: digest.freshness.github,
      skills: digest.freshness.skills,
    };
    console.log(JSON.stringify(result, null, 2));
    if (!digest.freshness.ready) {
      const message = staleMessage(digest);
      await writeRunRecord('warning', message);
      throw new StaleDataError(message);
    }
    return;
  }

  if (previewDigest) {
    await sendMessage({
      title: `[预览] ${digest.title}`,
      text: `> 预览使用 ${digest.date} 最新可用数据；明日正式推送会先完成当日数据检查。\n\n${digest.text}`,
    });
    console.log(`DingTalk preview sent using ${digest.date}: ${digest.counts.hotItems} hot items.`);
    return;
  }

  if (!digest.freshness.ready) {
    const message = staleMessage(digest);
    await writeRunRecord('warning', message);
    throw new StaleDataError(message);
  }

  const lock = await acquireDingtalkSendLock(resolve(root, `data/dev/dingtalk-send-${date}.lock.json`), date);
  try {
    // Read again inside the reservation, after all asynchronous preflight checks.
    const currentControl = await readJson('data/dev/dingtalk-send-control.json', {});
    if (isDingtalkSuppressed(currentControl, date)) return;
    const existing = await readJson('data/dev/dingtalk-last-send.json');
    const sendAction = decideSendAction({ existing, date, digestHash, supplement, force });
    if (sendAction === 'skip') {
      await writeRunRecord('success', `${date} 当前版本已发送，内容未变化，跳过重复推送。`, existing.sentAt ?? null);
      console.log(`DingTalk digest is unchanged for ${date}; skipping duplicate.`);
      return;
    }
    if (sendAction === 'needs-supplement') {
      const message = `${date} 今日已成功发送；网站内容有更新，跳过重复推送。`;
      await writeRunRecord('success', message, existing.sentAt ?? null);
      console.log(message);
      return;
    }

    const sendType = sendAction;
    const payload = {
      title: sendType === 'supplement' ? `[补发] ${digest.title}` : digest.title,
      text: sendType === 'supplement'
        ? `> 数据检查后发现当日内容有更新，以下为补发版本。\n\n${digest.text}`
        : digest.text,
    };

    let result;
    try {
      result = await sendMessage(payload, () => lock.markRequestStarted());
    } catch (error) {
      if (error.deliveryRejected) lock.markResolved();
      await writeRunRecord('failed', error instanceof Error ? error.message : '钉钉日报发送失败');
      throw error;
    }

    await saveSendRecord({ digest, digestHash, result, sendType, existing });
    lock.markResolved();
    console.log(`DingTalk ${sendType} digest sent for ${date}: ${digest.counts.hotItems} hot items.`);
  } finally {
    await lock.release();
  }
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = error?.exitCode ?? 1;
});
