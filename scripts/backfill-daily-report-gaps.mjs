import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');

async function readJson(path, fallback = null) {
  try {
    return JSON.parse(await readFile(resolve(root, path), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback;
    throw error;
  }
}

async function exists(path) {
  try {
    await readFile(resolve(root, path));
    return true;
  } catch (error) {
    if (error?.code === 'ENOENT') return false;
    throw error;
  }
}

async function writeAtomic(path, content) {
  const target = resolve(root, path);
  await mkdir(dirname(target), { recursive: true });
  const temporary = `${target}.${process.pid}.tmp`;
  await writeFile(temporary, content, 'utf8');
  await rename(temporary, target);
}

function parseArgs(argv = process.argv.slice(2)) {
  const values = Object.fromEntries(argv
    .filter((value) => value.startsWith('--') && value.includes('='))
    .map((value) => value.slice(2).split(/=(.*)/s).slice(0, 2)));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.from ?? '') || !/^\d{4}-\d{2}-\d{2}$/.test(values.to ?? '')) {
    throw new Error('Use --from=YYYY-MM-DD --to=YYYY-MM-DD.');
  }
  if (values.from > values.to) throw new Error('--from must not be after --to.');
  return values;
}

function datesBetween(from, to) {
  const dates = [];
  const cursor = new Date(`${from}T00:00:00Z`);
  const end = new Date(`${to}T00:00:00Z`);
  while (cursor <= end) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

const channelConfig = {
  ai: {
    prefix: 'ai-events',
    title: (date, gap = false) => `ark.insight AI 大事件${gap ? '补录' : '日报'} ${date}`,
  },
  github: {
    prefix: 'github-radar',
    title: (date, gap = false) => `GitHub Radar ${gap ? '停机补录 ' : ''}${date}`,
  },
  skills: {
    prefix: 'skills-radar',
    title: (date, gap = false) => `Skill ${gap ? '目录停机补录 ' : '24 小时趋势 '}${date}`,
  },
};

function reportMeta(channel, date, gap = false) {
  const config = channelConfig[channel];
  return {
    id: `${channel}-${date}`,
    title: config.title(date, gap),
    date,
    channel,
    format: 'markdown',
    path: `/reports/${config.prefix}-${date}.md`,
  };
}

function sourceLinks(event) {
  return (event.sources ?? []).map((source) => `[${source.label}](${source.url})`).join('、') || '原始报告中的已核验来源';
}

function aiGapReport(date, events) {
  const sections = events.length
    ? events.map((event) => `### ${event.priority ?? 'B'}｜${event.title}\n\n${event.summary}\n\n- 事件日期：${event.date}\n- 重要性：${event.whyItMatters}\n- 建议动作：${event.action}\n- 来源：${sourceLinks(event)}\n- 首次核验报告：\`${event.sourceReportId}\``).join('\n\n')
    : '经历史数据复核，当日没有已达到正式收录门槛且能回到原始来源的事件；不以相邻日期内容冒充当日资讯。';
  return `# ark.insight AI 大事件停机补录｜${date}\n\n- **补录状态**：历史事件日期与来源复核完成\n- **当日可确认事件**：${events.length} 条\n- **处理原则**：保留事件真实发布日期，不把后续发现时间改标为 ${date}\n\n> 本报告从累计数据库中提取事件日期为 ${date}、且已经过官方公告、论文页、作者仓库或可信原始来源核验的条目。首次核验可能发生在后续日报，因此保留原始 sourceReportId 作为审计证据。\n\n## 当日已核验事件\n\n${sections}\n\n## 数据限制\n\n- 本报告不恢复当日未保存的聚合榜单顺序。\n- 不把后续日期发布的内容回填为当日事件。\n- 不修改当前 latest 快照、累计目录或后续定时任务。\n`;
}

function extractCount(channel, markdown) {
  const patterns = channel === 'github'
    ? [/正式跟踪项目[： ]+(\d+)/, /全部\s+(\d+)\s+个正式跟踪项目/]
    : [/全量目录[： ]+(\d+)\s*个/, /共\s+(\d+)\s*个 Skill/];
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

async function nearestBoundary(channel, date, direction, availableDates) {
  const candidates = availableDates
    .filter((candidate) => direction < 0 ? candidate < date : candidate > date)
    .sort((left, right) => direction < 0 ? right.localeCompare(left) : left.localeCompare(right));
  const boundaryDate = candidates[0];
  if (!boundaryDate) return null;
  const path = `reports/${channelConfig[channel].prefix}-${boundaryDate}.md`;
  const markdown = await readFile(resolve(root, path), 'utf8');
  return { date: boundaryDate, count: extractCount(channel, markdown) };
}

function timePointGapReport(channel, date, previous, next) {
  const label = channel === 'github' ? 'GitHub Radar' : 'Skill 目录';
  const metric = channel === 'github' ? '24 小时趋势、搜索排名和 Stars 增量' : 'Trending、Hot、24 小时安装量和排名变化';
  const countLabel = channel === 'github' ? '正式跟踪项目' : '累计目录';
  const boundary = (item) => item ? `${item.date}${item.count == null ? '' : `，${countLabel} ${item.count} 个`}` : '无可用边界';
  return `# ${label} 停机补录｜${date}\n\n- **补录状态**：历史审计完成，精确时间点数据不可追溯\n- **前一有效快照**：${boundary(previous)}\n- **后一有效快照**：${boundary(next)}\n\n> ${metric}属于时间点数据。${date} 没有留下本地快照，因此不能用恢复后的数值伪装当日榜单。\n\n## 可确认的连续性\n\n- 已入库的正式项目与 Skill 均按累计规则保留，不因缺失日报自动删除。\n- 后一有效快照已重新执行正式采集，恢复后的新增与热度从新基线继续累计。\n- AI 日报或论文中出现的相关 GitHub 仓库仍会进入后续强制候选核验。\n\n## 不可恢复字段\n\n- ${metric}\n- 当日来源返回顺序与精确新增归属\n- 当日未保存的安装量、Stars 或 Forks 时间点数值\n\n## 处理结论\n\n本报告补齐日期导航与审计链路，但不伪造历史热度。当前 latest 快照、main 数据和明日定时任务均不受影响。\n`;
}

export async function backfillDailyReportGaps({ from, to, refreshAiGaps = false }) {
  const [main, override, latest] = await Promise.all([
    readJson('data/main/index.json'),
    readJson('data/dev/index.json', {}),
    readJson('data/dev/ai-events-latest.json', {}),
  ]);
  const dates = datesBetween(from, to);
  const registered = new Map([...(main.reports ?? []), ...(override.reports ?? [])].map((report) => [report.id, report]));
  const generated = [];
  const events = [...new Map([...(main.aiEvents ?? []), ...(override.aiEvents ?? []), ...(latest.aiEvents ?? [])].map(event => [event.id, event])).values()];
  const added = [];

  for (const channel of Object.keys(channelConfig)) {
    const availableDates = [];
    for (const date of dates) {
      const path = `reports/${channelConfig[channel].prefix}-${date}.md`;
      if (await exists(path)) availableDates.push(date);
    }

    for (const date of dates) {
      const path = `reports/${channelConfig[channel].prefix}-${date}.md`;
      const hasArtifact = await exists(path);
      const refreshable = refreshAiGaps && channel === 'ai' && hasArtifact && (await readFile(resolve(root, path), 'utf8')).includes('# ark.insight AI 大事件停机补录｜');
      if (!hasArtifact || refreshable) {
        const markdown = channel === 'ai'
          ? aiGapReport(date, events.filter((event) => event.date === date))
          : timePointGapReport(
            channel,
            date,
            await nearestBoundary(channel, date, -1, availableDates),
            await nearestBoundary(channel, date, 1, availableDates),
          );
        await Promise.all([
          writeAtomic(path, markdown),
          writeAtomic(`public/reports/${basename(path)}`, markdown),
        ]);
        availableDates.push(date);
        availableDates.sort();
        generated.push({ channel, date, path });
      }

      const meta = reportMeta(channel, date, !hasArtifact);
      if (!registered.has(meta.id)) {
        registered.set(meta.id, meta);
        added.push(meta);
      }
    }
  }

  const nextOverride = {
    ...override,
    reports: [...registered.values()].filter((report) => !(main.reports ?? []).some((current) => current.id === report.id)),
  };
  const record = {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    range: { from, to },
    status: 'success',
    generated,
    registered: added,
    latestSnapshotsModified: false,
  };
  await Promise.all([
    writeAtomic('data/dev/index.json', `${JSON.stringify(nextOverride, null, 2)}\n`),
    writeAtomic('data/dev/daily-report-backfill-run.json', `${JSON.stringify(record, null, 2)}\n`),
  ]);
  return record;
}

const executedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (executedDirectly) {
  const result = await backfillDailyReportGaps(parseArgs());
  console.log(JSON.stringify({
    status: result.status,
    range: result.range,
    generated: result.generated.length,
    registered: result.registered.length,
    latestSnapshotsModified: result.latestSnapshotsModified,
  }, null, 2));
}
