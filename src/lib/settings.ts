export type HSL = { h: number; s: number; l: number };

export type ThemeSettings = {
  backgroundImageUrl: string;
  backgroundColor: HSL;
  backgroundAlpha: number;
  themeColor: HSL;
  cardBlur: number;
  textColors: {
    primary: string;
    secondary: string;
    muted: string;
    highlight: HSL;
    accent: string[];
  };
};

export const DEFAULT_SETTINGS: ThemeSettings = {
  backgroundImageUrl: '',
  backgroundColor: { h: 0, s: 0, l: 4 },
  backgroundAlpha: 0.8,
  themeColor: { h: 54, s: 100, l: 50 },
  cardBlur: 4,
  textColors: {
    primary: '#ffffff',
    secondary: '#cccccc',
    muted: '#888888',
    highlight: { h: 174, s: 100, l: 50 },
    accent: ['#00ffaa', '#ff77b7', '#ffa24c', '#00f3ff'],
  },
};

const STORAGE_KEY = 'themeSettings';

function isHslShape(v: unknown): v is HSL {
  return typeof v === 'object' && v !== null && typeof (v as HSL).h === 'number' && typeof (v as HSL).s === 'number' && typeof (v as HSL).l === 'number';
}

export function loadSettings(): ThemeSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<ThemeSettings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      backgroundColor: isHslShape(parsed.backgroundColor) ? parsed.backgroundColor : DEFAULT_SETTINGS.backgroundColor,
      themeColor: isHslShape(parsed.themeColor) ? parsed.themeColor : DEFAULT_SETTINGS.themeColor,
      textColors: {
        ...DEFAULT_SETTINGS.textColors,
        ...(parsed.textColors ?? {}),
        highlight: parsed.textColors?.highlight ?? DEFAULT_SETTINGS.textColors.highlight,
        accent: Array.isArray(parsed.textColors?.accent) ? parsed.textColors!.accent : DEFAULT_SETTINGS.textColors.accent,
      },
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

export function hslString(c: HSL, alpha?: number): string {
  if (alpha !== undefined) return `hsl(${c.h} ${c.s}% ${c.l}% / ${alpha})`;
  return `hsl(${c.h} ${c.s}% ${c.l}% / 1)`;
}

export function applySettingsToDOM(s: ThemeSettings): void {
  if (typeof document === 'undefined') return;
  const r = document.documentElement.style;

  r.setProperty('--bg-color', hslString(s.backgroundColor, s.backgroundAlpha));
  r.setProperty('--card-color', hslString(s.themeColor, 0.06));
  r.setProperty('--card-border', hslString(s.themeColor, 0.08));
  r.setProperty('--card-blur', `${s.cardBlur}px`);

  r.setProperty('--text-primary', s.textColors.primary);
  r.setProperty('--text-secondary', s.textColors.secondary);
  r.setProperty('--text-muted', s.textColors.muted);
  r.setProperty('--text-highlight', hslString(s.textColors.highlight));

  const MAX_ACCENT_SLOTS = 32;
  for (let i = 0; i < MAX_ACCENT_SLOTS; i++) {
    const name = `--accent-${i + 1}`;
    const color = s.textColors.accent[i];
    if (color) r.setProperty(name, color);
    else r.removeProperty(name);
  }
}
