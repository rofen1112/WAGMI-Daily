import type { AiEvent } from './types';

const chineseTextPattern = /[\u3400-\u9fff]/;

export function hasChineseText(value: string | null | undefined) {
  return chineseTextPattern.test(value ?? '');
}

export function isChineseAiEvent(event: AiEvent) {
  return [event.title, event.summary, event.whyItMatters, event.action].every(hasChineseText);
}
