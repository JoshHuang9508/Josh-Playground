import type * as Types from '@/lib/types';

export const STORAGE_KEY = 'settings';
export const ABOUT_SEEN_KEY = 'aboutSeen';
export const DEFAULT_SETTINGS: Types.Settings = {
  backgroundImageUrl: '',
  backgroundColor: { h: 240, s: 5, l: 8 },
  backgroundAlpha: 0.72,
  cardBlur: 28,
  textHighlight: { h: 263, s: 100, l: 74 },
  textColors: {
    primary: '#ffffff',
    secondary: '#cccccc',
    muted: '#888888',
    accent1: '#00ffaa',
    accent2: '#ff77b7',
    accent3: '#ffa24c',
    accent4: '#00f3ff',
  },
};

// Every editable text colour, in the order the settings panel lists them.
export const TEXT_COLOR_KEYS: Types.TextColorKey[] = ['primary', 'secondary', 'muted', 'accent1', 'accent2', 'accent3', 'accent4'];
