import { createHash } from 'node:crypto';

function text(html) {
  return String(html).replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ')
    .replace(/&#(x[0-9a-f]+|\d+);/gi, (_, code) => {
      const n = code[0].toLowerCase() === 'x' ? parseInt(code.slice(1), 16) : Number(code);
      return n > 0 && n <= 0x10ffff ? String.fromCodePoint(n) : '';
    }).replace(/&(?:amp|quot|apos|lt|gt|nbsp);/g, s => ({ '&amp;': '&', '&quot;': '"', '&apos;': "'", '&lt;': '<', '&gt;': '>', '&nbsp;': ' ' })[s])
    .replace(/\s+/g, ' ').trim();
}

/** Extract actual numbered news headings, not overview bullets or topic labels. */
export function parseJuyaSections(html, articleUrl) {
  const base = new URL(articleUrl);
  if (base.hostname !== 'daily.juya.uk') return [];
  const headings = [...String(html).matchAll(/<h([23])\b([^>]*)>([\s\S]*?)<\/h\1>/gi)];
  const sections = [];
  const ids = new Set();
  for (let i = 0; i < headings.length; i++) {
    const match = headings[i];
    const id = match[2].match(/\bid\s*=\s*["'](s\d+)["']/i)?.[1];
    const ordinal = match[3].match(/<code\b[^>]*>\s*#(\d+)\s*<\/code>/i)?.[1];
    if (match[1] !== '3' || !id || !ordinal) continue;
    if (ids.has(id)) throw new Error(`Duplicate Juya section identity: ${id}`);
    ids.add(id);
    const body = String(html).slice(match.index + match[0].length, headings[i + 1]?.index ?? String(html).length);
    const title = text(match[3].replace(/<a\b[^>]*class=["'][^"']*article-ref[^"']*["'][^>]*>[\s\S]*?<\/a>/gi, '')
      .replace(/<code\b[^>]*>\s*#\d+\s*<\/code>/gi, ''));
    const refs = [];
    for (const [, href] of (match[0] + body).matchAll(/href\s*=\s*["']([^"']+)["']/gi)) {
      if (href.startsWith('#')) continue;
      try {
        const url = new URL(href.replace(/&amp;/g, '&'), base);
        if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.hostname === base.hostname) continue;
        url.hash = '';
        refs.push(url.href);
      } catch { /* The article may contain a non-URL reference. */ }
    }
    const content = text(body);
    const blockquote = body.match(/<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/i)?.[1];
    sections.push({ id, ordinal: Number(ordinal), title, url: `${base.href.split('#')[0]}#${id}`,
      summary: text(blockquote ?? body).slice(0, 900), contentExcerpt: content.slice(0, 2400),
      contentHash: createHash('sha256').update(content).digest('hex'), referencedUrls: [...new Set(refs)] });
  }
  return sections;
}
