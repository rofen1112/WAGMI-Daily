import type { SourceLink } from './types';
import { isInternalSource } from '../scripts/public-source-policy.mjs';

const brands: Record<string, string> = {
  'openai.com': 'OpenAI',
  'developers.openai.com': 'OpenAI 开发者文档',
  'platform.openai.com': 'OpenAI 开发者文档',
  'blog.google': 'Google 官方博客',
  'deepmind.google': 'Google DeepMind',
  'anthropic.com': 'Anthropic',
  'github.blog': 'GitHub 官方博客',
  'github.com': 'GitHub',
  'huggingface.co': 'Hugging Face',
  'blogs.nvidia.com': 'NVIDIA 官方博客',
  'nvidia.com': 'NVIDIA',
  'arxiv.org': 'arXiv 论文',
  'simonwillison.net': 'Simon Willison',
  'bloomberg.com': '彭博社',
  'reuters.com': '路透社',
  'theverge.com': 'The Verge',
  'qbitai.com': '量子位',
  'geekpark.net': '极客公园',
  'aiera.com.cn': '新智元',
  'jiqizhixin.com': '机器之心',
};

const chineseMediaHosts = new Set(['qbitai.com', 'geekpark.net', 'aiera.com.cn', 'jiqizhixin.com']);
const genericLabel = /^(?:原始来源|官方(?:来源|正文|原文)?|来源|参考来源|original source|official)$/i;

export interface ReadingSource extends SourceLink {
  domain: string;
  displayName: string;
  category: string;
  chinese: boolean;
}

/** Reading links are optional context; they never replace the factual source evidence. */
export function aiReadingSources(sources: SourceLink[], readingSources: SourceLink[] = []): ReadingSource[] {
  const records = new Map<string, ReadingSource>();
  for (const source of [...readingSources, ...sources]) {
    if (isInternalSource(source)) continue;
    let url: URL;
    try { url = new URL(source.url); } catch { continue; }
    if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) continue;
    const domain = url.hostname.replace(/^www\./, '');
    const chinese = source.language === 'zh' || (!source.language && (chineseMediaHosts.has(domain)
      || domain === 'mp.weixin.qq.com'
      || /\/(?:zh|zh-cn|zh-hans)(?:\/|$)/i.test(url.pathname)));
    const role = source.role ?? (chineseMediaHosts.has(domain) ? 'coverage' : 'original');
    const label = source.label.trim();
    const displayName = genericLabel.test(label) || !label ? brands[domain] ?? domain : label;
    const category = role === 'discovery' ? (chinese ? '中文速览' : '发现来源')
      : role === 'coverage' ? (chinese ? '中文解读' : '延伸阅读')
        : chinese ? '中文原文' : '原始来源';
    if (!records.has(url.href)) records.set(url.href, { ...source, url: url.href, role, domain, displayName, category, chinese });
  }
  return [...records.values()].sort((left, right) => Number(right.chinese) - Number(left.chinese)
    || Number(left.role === 'discovery') - Number(right.role === 'discovery'));
}
