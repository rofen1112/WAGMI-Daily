const boardLabels = new Map([
  ['AI Product / Model Launch', 'AI 产品 / 模型发布'],
  ['AI Agent', 'AI Agent'],
  ['AI Coding', 'AI 编程'],
  ['AI Security / Governance', 'AI 安全 / 治理'],
  ['Financing / Investment', '融资 / 投资'],
  ['AI 3D / World Models', 'AI 3D / 世界模型'],
  ['AI-CAD / AEC', 'AI-CAD / AEC'],
  ['Interior Design AI', '室内设计 AI'],
  ['Workflow / Tutorial / Usage Tips', '使用技巧 / 工作流'],
  ['Market / Business Model', '市场 / 商业模式'],
]);

function stripMarkdown(value) {
  return value
    .replace(/^\s*-\s*/, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

function parseFields(block) {
  const fields = new Map();
  let current = null;
  for (const line of block.split(/\r?\n/)) {
    const field = line.match(/^- ([^:]+):\s*(.*)$/);
    if (field) {
      current = field[1].trim().toLowerCase();
      fields.set(current, field[2] ? [field[2].trim()] : []);
      continue;
    }
    if (current && /^\s{2,}-\s+/.test(line)) {
      fields.get(current).push(stripMarkdown(line));
    }
  }
  return fields;
}

function getField(fields, names) {
  for (const name of names) {
    const value = fields.get(name);
    if (value) return value;
  }
  return [];
}

function monthEnd(value) {
  const [year, month] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month, 0)).toISOString().slice(0, 10);
}

export function parseDateRange(rawDate) {
  const value = rawDate.trim();
  const dates = value.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
  if (dates.length >= 2) return { dateStart: dates[0], dateEnd: dates[1], periodLabel: value };
  if (dates.length === 1) return { dateStart: dates[0], dateEnd: dates[0], periodLabel: dates[0] };
  if (/^\d{4}-\d{2}$/.test(value)) {
    return { dateStart: `${value}-01`, dateEnd: monthEnd(value), periodLabel: value };
  }
  throw new Error(`Unsupported historical event date: ${rawDate}`);
}

function sourceLabel(url) {
  const hostname = new URL(url).hostname.replace(/^www\./, '');
  const known = {
    'openai.com': 'OpenAI',
    'github.blog': 'GitHub Blog',
    'github.com': 'GitHub',
    'developers.googleblog.com': 'Google Developers Blog',
    'developer.apple.com': 'Apple Developer',
    'mistral.ai': 'Mistral AI',
    'runwayml.com': 'Runway',
    'blogs.nvidia.com': 'NVIDIA Blog',
    'businesswire.com': 'Business Wire',
    'techcrunch.com': 'TechCrunch',
    'arxiv.org': 'arXiv',
  };
  return known[hostname] ?? hostname;
}

function parseSources(values) {
  const urls = values.flatMap((value) => value.match(/https:\/\/[^\s)]+/g) ?? []);
  return [...new Set(urls)].map((url) => ({ label: sourceLabel(url), url }));
}

function parseCandidates(values) {
  return values
    .map((value) => stripMarkdown(value).split(/\s+->\s+/)[0].trim())
    .filter(Boolean);
}

function deriveBoards(title, summary) {
  const text = `${title} ${summary}`.toLowerCase();
  const boards = [];
  if (/\b(agent|agents|agentic|copilot|teleop)\b/.test(text)) boards.push('AI Agent');
  if (/\b(coding|copilot|kotlin|benchmark|benchmarks|eval|evals|github)\b/.test(text)) boards.push('AI 编程');
  if (/\b(world model|world models|4d|spatial|robot|robotic|embodied|video-world|generative worlds)\b/.test(text)) boards.push('AI 3D / 世界模型');
  if (/cad|design-to-manufacturing|interior/.test(text)) boards.push('AI-CAD / AEC');
  if (/\b(funding|funded|raises|series [abc])\b/.test(text)) boards.push('融资 / 投资');
  return boards.length ? [...new Set(boards)] : ['AI 产品 / 模型发布'];
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'event';
}

function joinParagraphs(values) {
  return values.map(stripMarkdown).filter(Boolean).join(' ');
}

export function parseHistoricalReport(markdown, report) {
  const sectionStart = markdown.search(/^## (Top Events|Events)\s*$/m);
  if (sectionStart < 0) throw new Error(`${report.id} does not contain an Events section`);
  const sectionWithHeading = markdown.slice(sectionStart);
  const firstLineEnd = sectionWithHeading.indexOf('\n');
  const section = sectionWithHeading.slice(firstLineEnd + 1).split(/^## (?!#)/m)[0];
  const headingPattern = /^###\s+(\d+)\.\s+(.+)$/gm;
  const matches = [...section.matchAll(headingPattern)];

  return matches.map((match, index) => {
    const blockStart = match.index + match[0].length;
    const blockEnd = matches[index + 1]?.index ?? section.length;
    const fields = parseFields(section.slice(blockStart, blockEnd));
    const title = match[2].trim();
    const rawDate = getField(fields, ['date'])[0];
    if (!rawDate) throw new Error(`${report.id} event ${match[1]} has no date`);
    const range = parseDateRange(rawDate);
    const summaryValues = getField(fields, ['summary']);
    const whyValues = getField(fields, ['why it matters', 'impact judgment']);
    const actionValues = getField(fields, ['action']);
    const candidateValues = getField(fields, ['github / project intake', 'repository radar']);
    const companyValues = getField(fields, ['companies / products / authors']);
    const sourceValues = getField(fields, ['source', 'sources', 'source links']);
    const sources = parseSources(sourceValues);
    if (!sources.length) throw new Error(`${report.id} event ${match[1]} has no HTTPS source`);

    const summary = joinParagraphs(summaryValues.length ? summaryValues : whyValues.slice(0, 1));
    const whyItMatters = joinParagraphs(whyValues.length ? whyValues : summaryValues);
    const repoCandidates = parseCandidates(candidateValues);
    const boardsValue = getField(fields, ['boards'])[0] ?? '';
    const boards = boardsValue
      ? boardsValue.split(',').map((board) => boardLabels.get(board.trim()) ?? board.trim()).filter(Boolean)
      : deriveBoards(title, summary);
    const impact = whyItMatters.toLowerCase();
    const priority = /^high\b/.test(impact) || index < 4 ? 'A' : 'B';
    const action = joinParagraphs(actionValues) || (repoCandidates.length
      ? `按原报告线索继续核验：${repoCandidates.join('、')}。`
      : '继续跟踪官方后续、公开实现与可复核的产品进展。');

    return {
      id: `archive-${report.id}-${String(index + 1).padStart(2, '0')}-${slugify(title)}`,
      date: range.dateEnd,
      ...range,
      archived: true,
      title,
      summary,
      whyItMatters,
      action,
      priority,
      boards: [...new Set(boards)],
      sourceType: 'historical_report',
      verification: 'verified',
      entities: companyValues.flatMap((value) => value.split(',')).map((value) => value.trim()).filter(Boolean),
      repoCandidates,
      sources,
      sourceReportId: report.id,
    };
  });
}

export function mergeHistoricalEvents(snapshot, events, reportIds) {
  const importedReports = new Set(reportIds);
  const retained = snapshot.aiEvents.filter((event) => !(event.archived && importedReports.has(event.sourceReportId)));
  return {
    ...snapshot,
    aiEvents: [...retained, ...events].sort((left, right) => right.date.localeCompare(left.date) || left.priority.localeCompare(right.priority)),
  };
}
