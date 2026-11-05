import type { CSSProperties } from 'react';

type IconName = 'back' | 'left' | 'right' | 'focus' | 'close' | 'plus' | 'plan' | 'upload' | 'arrow' | 'spark' | 'chat' | 'search' | 'projects' | 'view' | 'furniture' | 'properties' | 'ruler' | 'top' | 'iso' | 'fit' | 'send' | 'check' | 'clock' | 'sun';
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
  projects: <><rect x="3" y="4" width="7" height="7" rx="1"/><rect x="14" y="4" width="7" height="7" rx="1"/><rect x="3" y="15" width="7" height="6" rx="1"/><rect x="14" y="15" width="7" height="6" rx="1"/></>,
  view: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></>,
  furniture: <><path d="M5 10V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v5M5 17v4m14-4v4M3 10h3v4h12v-4h3v7H3z"/></>,
  properties: <><path d="m12 3 9 5-9 5-9-5 9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5"/></>,
  ruler: <><path d="m3 16 13-13 5 5L8 21l-5-5Z"/><path d="m7 12 2 2m2-6 2 2m2-6 2 2"/></>,
  top: <><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 12h16M12 4v16" opacity=".45"/></>,
  iso: <><path d="m12 3 9 5v9l-9 5-9-5V8l9-5Zm0 10v9M3 8l9 5 9-5"/></>,
  fit: <><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5M7 7l4 4m6-4-4 4m-6 6 4-4m6 4-4-4"/></>,
  send: <><path d="m4 4 17 8-17 8 3-8-3-8Zm3 8h14"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v6l4 2"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.4 1.4M17.6 17.6 19 19M5 19l1.4-1.4M17.6 6.4 19 5"/></>,
};

export default function StudioIcon({ name, size = 18, style }: { name: IconName; size?: number; style?: CSSProperties }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]}</svg>;
}
