import type { SkillCatalogItem, SkillTrend } from './types';
import { getSkillExperience } from './skillTaxonomy';

type SearchableSkill = SkillTrend | SkillCatalogItem;

export function normalizeSkillSearchText(value: string) {
  return value
    .normalize('NFKD')
    .toLocaleLowerCase()
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\u4e00-\u9fff]+/g, '');
}

export function matchesSkillSearch(skill: SearchableSkill, query: string) {
  const normalizedQuery = normalizeSkillSearchText(query);
  if (!normalizedQuery) return true;
  const fields = [
    skill.name,
    skill.source,
    skill.skillId ?? '',
    skill.descriptionZh,
    skill.category,
    skill.officialOwner ?? '',
    ...skill.useCases,
  ];
  const haystack = normalizeSkillSearchText(fields.join(' '));
  if (haystack.includes(normalizedQuery)) return true;
  const longSegments = query
    .split(/[^a-z0-9\u4e00-\u9fff]+/i)
    .map(normalizeSkillSearchText)
    .filter((segment) => segment.length >= 6);
  return longSegments.some((segment) => haystack.includes(segment));
}
