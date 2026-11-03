export interface ThemeSettings {
  preset: string;
  background: string;
  accent: string;
}

export interface ThemeColors {
  page: string;
  surface: string;
  surfaceMuted: string;
  accent: string;
  accentSoft: string;
  accentBorder: string;
  border: string;
  divider: string;
}

export const themePresets: Array<ThemeSettings & { label: string }> = [
  { preset: 'paper', label: '纸白', background: '#fcfbf8', accent: '#a1263b' },
  { preset: 'white', label: '纯白', background: '#ffffff', accent: '#98263a' },
  { preset: 'mist', label: '浅灰', background: '#f5f6f4', accent: '#315d55' },
];

export const defaultTheme: ThemeSettings = themePresets[0];

const storageKey = 'wagmi-daily-theme-v1';
const hexPattern = /^#[0-9a-f]{6}$/i;

function rgb(hex: string) {
  const value = hex.replace('#', '');
  return [0, 2, 4].map((index) => Number.parseInt(value.slice(index, index + 2), 16));
}

function hex(values: number[]) {
  return `#${values.map((value) => Math.round(value).toString(16).padStart(2, '0')).join('')}`;
}

export function mixColors(foreground: string, background: string, foregroundWeight: number) {
  const front = rgb(foreground);
  const back = rgb(background);
  return hex(front.map((value, index) => value * foregroundWeight + back[index] * (1 - foregroundWeight)));
}

export function ensureLightBackground(value: string) {
  if (!hexPattern.test(value)) return defaultTheme.background;
  const [red, green, blue] = rgb(value).map((channel) => channel / 255);
  const luminance = 0.2126 * red + 0.7152 * green + 0.0722 * blue;
  return luminance >= 0.82 ? value.toLowerCase() : mixColors(value, '#ffffff', 0.08);
}

export function buildThemeColors(theme: ThemeSettings): ThemeColors {
  const page = ensureLightBackground(theme.background);
  const accent = hexPattern.test(theme.accent) ? theme.accent.toLowerCase() : defaultTheme.accent;
  return {
    page,
    surface: mixColors(page, '#ffffff', 0.16),
    surfaceMuted: mixColors(page, '#ffffff', 0.48),
    accent,
    accentSoft: mixColors(accent, page, 0.07),
    accentBorder: mixColors(accent, page, 0.38),
    border: mixColors('#746f68', page, 0.2),
    divider: mixColors('#746f68', page, 0.12),
  };
}

export function readStoredTheme(): ThemeSettings {
  try {
    const value = JSON.parse(localStorage.getItem(storageKey) ?? 'null') as Partial<ThemeSettings> | null;
    if (value && typeof value.preset === 'string' && hexPattern.test(value.background ?? '') && hexPattern.test(value.accent ?? '')) {
      return { preset: value.preset, background: ensureLightBackground(value.background!), accent: value.accent!.toLowerCase() };
    }
  } catch {
    // Ignore malformed browser preferences and use the product default.
  }
  return defaultTheme;
}

export function storeTheme(theme: ThemeSettings) {
  localStorage.setItem(storageKey, JSON.stringify(theme));
}

export function applyTheme(theme: ThemeSettings) {
  const colors = buildThemeColors(theme);
  const root = document.documentElement;
  root.style.setProperty('--color-page', colors.page);
  root.style.setProperty('--color-surface', colors.surface);
  root.style.setProperty('--color-surface-muted', colors.surfaceMuted);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-soft', colors.accentSoft);
  root.style.setProperty('--color-accent-border', colors.accentBorder);
  root.style.setProperty('--color-border', colors.border);
  root.style.setProperty('--color-divider', colors.divider);
}
