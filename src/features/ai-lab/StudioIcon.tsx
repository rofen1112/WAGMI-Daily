import type { CSSProperties } from 'react';

type IconName = 'back' | 'left' | 'right' | 'focus' | 'close' | 'plus' | 'plan' | 'upload' | 'arrow' | 'spark' | 'chat' | 'search';
const paths: Record<IconName, React.ReactNode> = {
  back: <><path d="m12 5-7 7 7 7M5 12h14"/></>,
  left: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16M5.5 8h1M5.5 11h1"/></>,
  right: <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M15 4v16M17.5 8h1M17.5 11h1"/></>,
  focus: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/><path d="M8 12h8M12 8v8" opacity=".5"/></>,
  close: <path d="m6 6 12 12M6 18 18 6"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  plan: <><path d="M4 3h16v18H4zM4 11h9V3M13 11v10M13 15h7"/><path d="M8 11h2m6 4h2" stroke="var(--icon-cutout, currentColor)" opacity=".3"/></>,
  upload: <><path d="M12 16V3m-5 5 5-5 5 5M4 15v5h16v-5"/></>,
  arrow: <path d="M4 12h15m-6-6 6 6-6 6"/>,
  spark: <><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5L12 3Z"/><path d="M20 3v4m-2-2h4"/></>,
  chat: <path d="M4 4h16v12H9l-5 4V4Zm4 5h8m-8 3h5"/>,
  search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
};

export default function StudioIcon({ name, size = 18, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
