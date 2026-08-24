import type * as Types from '@/lib/types';

import { DEFAULT_SETTINGS, STORAGE_KEY, TEXT_COLOR_KEYS } from '@/lib/constants';

function isHslShape(v: unknown): v is Types.HSL {
  return typeof v === 'object' && v !== null && typeof (v as Types.HSL).h === 'number' && typeof (v as Types.HSL).s === 'number' && typeof (v as Types.HSL).l === 'number';
}

// Reads only the known keys, so settings saved by older versions (which stored
// an `accent` array here) drop their stale shape instead of leaking through.
function resolveTextColors(stored: unknown): Types.Settings['textColors'] {
  const source = (typeof stored === 'object' && stored !== null ? stored : {}) as Partial<Record<Types.TextColorKey, unknown>>;
  const resolved = { ...DEFAULT_SETTINGS.textColors };
  TEXT_COLOR_KEYS.forEach((key) => {
    if (typeof source[key] === 'string') resolved[key] = source[key];
  });
  return resolved;
}

export function loadSettings(): Types.Settings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw) as Partial<Types.Settings>;
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      backgroundColor: isHslShape(parsed.backgroundColor) ? parsed.backgroundColor : DEFAULT_SETTINGS.backgroundColor,
      cardColor: isHslShape(parsed.cardColor) ? parsed.cardColor : DEFAULT_SETTINGS.cardColor,
      textHighlight: isHslShape(parsed.textHighlight) ? parsed.textHighlight : DEFAULT_SETTINGS.textHighlight,
      textColors: resolveTextColors(parsed.textColors),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(s: Types.Settings): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function clearSettings(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

export function hslString(c: Types.HSL, alpha?: number): string {
  if (alpha !== undefined) return `hsl(${c.h} ${c.s}% ${c.l}% / ${alpha})`;
  return `hsl(${c.h} ${c.s}% ${c.l}% / 1)`;
}

export function applySettingsToDOM(s: Types.Settings): void {
  if (typeof document === 'undefined') return;
  const r = document.documentElement.style;

  r.setProperty('--bg-color', hslString(s.backgroundColor, s.backgroundAlpha));
  r.setProperty('--card-color', hslString(s.cardColor, 0.06));
  r.setProperty('--card-border', hslString(s.cardColor, 0.08));
  r.setProperty('--card-blur', `${s.cardBlur}px`);

  r.setProperty('--text-highlight', hslString(s.textHighlight));
  r.setProperty('--text-primary', s.textColors.primary);
  r.setProperty('--text-secondary', s.textColors.secondary);
  r.setProperty('--text-muted', s.textColors.muted);

  r.setProperty('--accent-1', s.textColors.accent1);
  r.setProperty('--accent-2', s.textColors.accent2);
  r.setProperty('--accent-3', s.textColors.accent3);
  r.setProperty('--accent-4', s.textColors.accent4);
}
