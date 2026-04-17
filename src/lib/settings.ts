export type HSL = { h: number; s: number; l: number };

export type ThemeSettings = {
  backgroundImageUrl: string;
  backgroundColor: HSL;
  backgroundAlpha: number;
  cardColor: HSL;
  cardBlur: number;
  textColors: {
    primary: string;
    secondary: string;
    muted: string;
    highlight: string;
    accentGreen: string;
    accentPink: string;
    accentOrange: string;
    accentCyan: string;
    custom1: string;
    custom2: string;
    custom3: string;
  };
};

export const DEFAULT_SETTINGS: ThemeSettings = {
  backgroundImageUrl: '',
  backgroundColor: { h: 0, s: 0, l: 4 },
  backgroundAlpha: 0.8,
  cardColor: { h: 0, s: 0, l: 100 },
  cardBlur: 4,
  textColors: {
    primary: '#ffffff',
    secondary: '#cccccc',
    muted: '#888888',
    highlight: '#fff700',
    accentGreen: '#00ffaa',
    accentPink: '#ff77b7',
    accentOrange: '#ffa24c',
    accentCyan: '#00f3ff',
    custom1: '#b07219',
    custom2: '#a97bff',
    custom3: '#00b4ab',
  },
};

const STORAGE_KEY = 'themeSettings';

export function loadSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      backgroundColor: { ...DEFAULT_SETTINGS.backgroundColor, ...(parsed.backgroundColor ?? {}) },
      cardColor: { ...DEFAULT_SETTINGS.cardColor, ...(parsed.cardColor ?? {}) },
      textColors: { ...DEFAULT_SETTINGS.textColors, ...(parsed.textColors ?? {}) },
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: ThemeSettings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function clearSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

function hsl(c: HSL, alpha?: number): string {
  if (alpha !== undefined) return `hsl(${c.h} ${c.s}% ${c.l}% / ${alpha})`;
  return `hsl(${c.h} ${c.s}% ${c.l}%)`;
}

export function applySettingsToDOM(s: ThemeSettings): void {
  if (typeof document === 'undefined') return;
  const r = document.documentElement.style;
  r.setProperty('--bg-color', hsl(s.backgroundColor, s.backgroundAlpha));
  r.setProperty('--card-color', hsl(s.cardColor, 0.06));
  r.setProperty('--card-border', hsl(s.cardColor, 0.12));
  r.setProperty('--card-blur', `${s.cardBlur}px`);
  r.setProperty('--text-primary', s.textColors.primary);
  r.setProperty('--text-secondary', s.textColors.secondary);
  r.setProperty('--text-muted', s.textColors.muted);
  r.setProperty('--text-highlight', s.textColors.highlight);
  r.setProperty('--accent-green', s.textColors.accentGreen);
  r.setProperty('--accent-pink', s.textColors.accentPink);
  r.setProperty('--accent-orange', s.textColors.accentOrange);
  r.setProperty('--accent-cyan', s.textColors.accentCyan);
  r.setProperty('--accent-custom-1', s.textColors.custom1);
  r.setProperty('--accent-custom-2', s.textColors.custom2);
  r.setProperty('--accent-custom-3', s.textColors.custom3);
}
