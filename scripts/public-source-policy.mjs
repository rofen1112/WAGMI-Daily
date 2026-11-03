/** Public reading and publication policy. Keep this module usable in the browser. */
const internalDomains = ['memene.cn', 'memenews.cn'];
const omitted = Symbol('internal public value');
const urlShape = /^\s*[a-z][a-z\d+.-]*:/i;
const internalTextHint = /memene|memenews/i;
const encodedOrUnicodeHost = /https?:\/\/[^\s/]*(?:%|[^\x00-\x7f])/i;
const mayHaveInternalText = text => internalTextHint.test(text) || encodedOrUnicodeHost.test(text);

/** Match the parsed destination host, never a label, query, or username. */
export function isInternalSourceUrl(value) {
  const text = typeof value === 'string' ? value : value instanceof URL ? value.href : '';
  if (!urlShape.test(text)) return false;
  // Ordinary public ASCII URLs cannot normalize into a private host. Encoded,
  // Unicode, and control-character spellings still need the URL parser below.
  if (!/memene|memenews|%|[^\x21-\x7e]/i.test(text)) return false;
  try {
    const hostname = new URL(text).hostname.toLowerCase().replace(/\.+$/, '');
    return internalDomains.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

export function isInternalSource(source) {
  return source?.visibility === 'internal' || isInternalSourceUrl(source?.url);
}

/** Public copies retain the reporting conclusion without advertising the private channel. */
function sanitizeReportText(value, isPrivateDestination = isInternalSourceUrl, hasPrivateText = false) {
  const source = String(value);
  if (!hasPrivateText && !mayHaveInternalText(source)) return source;
  const publicUrls = [];
  const jsonBlocks = [];
  function protectJson(match, opening, content, closing, html) {
    if (!mayHaveInternalText(content)) {
      jsonBlocks.push(match);
    } else {
      let parsed;
      try { parsed = JSON.parse(content); }
      catch { throw new Error('Cannot sanitize private sources in malformed embedded JSON'); }
      let json = JSON.stringify(toPublicSnapshot(parsed) ?? null, null, content.includes('\n') ? 2 : undefined);
      if (html) json = json.replace(/</g, '\\u003c');
      jsonBlocks.push(`${opening}${json}${closing}`);
    }
    return `\uE002${jsonBlocks.length - 1}\uE003`;
  }
  return source
    .replace(/(<script\b[^>]*\btype\s*=\s*["']application\/(?:ld\+)?json["'][^>]*>)([\s\S]*?)(<\/script\s*>)/gi,
      (match, opening, content, closing) => protectJson(match, opening, content, closing, true))
    .replace(/(^```json[^\n]*\n)([\s\S]*?)(^```\s*$)/gim,
      (match, opening, content, closing) => protectJson(match, opening, content, closing, false))
    .replace(/<a\b([^>]*\bhref\s*=\s*(["'])(.*?)\2[^>]*)>([\s\S]*?)<\/a\s*>/gi,
      (match, _attributes, _quote, url, label) => isPrivateDestination(url) ? label : match)
    .replace(/(!?)\[([^\]]*)\]\(\s*<?(https?:\/\/[^\s)>]+)>?(?:\s+["'][^"']*["'])?\s*\)/gi,
      (match, _image, label, url) => isPrivateDestination(url) ? label || '内部发现源' : match)
    .replace(/\s+(?:href|src|data-url)\s*=\s*(["'])(.*?)\1/gi,
      (match, _quote, url) => isPrivateDestination(url) ? '' : match)
    .replace(/<?https?:\/\/[^\s<>"'\])}]+>?/gi, match => {
      const plain = match.replace(/^</, '').replace(/>$/, '');
      const url = plain.replace(/[.,;，。；：!?！？]+$/, '');
      if (isPrivateDestination(url)) return `内部发现源${plain.slice(url.length)}`;
      publicUrls.push(match);
      return `\uE000${publicUrls.length - 1}\uE001`;
    })
    .replace(/(?<![a-z\d.-])(?:[a-z\d-]+\.)*(?:memene|memenews)\.cn\.?(?![a-z\d.-])/gi, '内部发现源')
    .replace(/(?<![a-z\d])memene(?:ws)?(?![a-z])/gi, '内部发现源')
    .replace(/\uE000(\d+)\uE001/g, (_match, index) => publicUrls[Number(index)])
    .replace(/\uE002(\d+)\uE003/g, (_match, index) => jsonBlocks[Number(index)]);
}

export function sanitizePublicReport(value) {
  return sanitizeReportText(value);
}

/**
 * Derive a new public JSON tree; private discovery records and source objects stay intact.
 * Drop link records from source lists, but preserve events/candidates and their facts even
 * when a historical record contains an internal URL in an additional metadata field.
 */
export function toPublicSnapshot(value) {
  const privateUrls = new Set();
  const normalizeUrl = value => {
    if (typeof value !== 'string' || !urlShape.test(value)) return value;
    try { return new URL(value).href; } catch { return value; }
  };
  function collectPrivateUrls(current) {
    if (!current || typeof current !== 'object') return;
    if (typeof current.url === 'string' && isInternalSource(current)) privateUrls.add(normalizeUrl(current.url));
    for (const item of Object.values(current)) collectPrivateUrls(item);
  }
  collectPrivateUrls(value);
  const isPrivateUrl = current => isInternalSourceUrl(current)
    || (privateUrls.size > 0 && privateUrls.has(normalizeUrl(current)));
  function visit(current, key = '') {
    if (typeof current === 'string') {
      if (isPrivateUrl(current)) return omitted;
      // Identifiers connect historical records; source names belong in public prose only.
      if (/^(?:id|.*Id|.*Ids)$/.test(key)) return current;
      const hasPrivateText = privateUrls.size > 0 && current.includes('://')
        && [...privateUrls].some(url => current.includes(url));
      return sanitizeReportText(current, isPrivateUrl, hasPrivateText);
    }
    if (Array.isArray(current)) {
      return current.flatMap(item => {
        if (item && typeof item === 'object' && isInternalSource(item)
          && (key === 'sources' || key === 'readingSources' || typeof item.label === 'string')) return [];
        const next = visit(item, key);
        return next === omitted ? [] : [next];
      });
    }
    if (current && typeof current === 'object') {
      const result = {};
      for (const [childKey, item] of Object.entries(current)) {
        if (isPrivateUrl(childKey)) continue;
        // An explicitly private link also hides its URL when it lives outside a link list.
        if (childKey === 'url' && isInternalSource(current)) continue;
        const next = visit(item, childKey);
        if (next !== omitted) result[childKey] = next;
      }
      return result;
    }
    return current;
  }
  const result = visit(value);
  return result === omitted ? undefined : result;
}
