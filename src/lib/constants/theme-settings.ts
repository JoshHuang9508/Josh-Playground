import type * as Types from '@/lib/types';

export const STORAGE_KEY = 'settings';
export const ABOUT_SEEN_KEY = 'aboutSeen';
export const DEFAULT_SETTINGS: Types.Settings = {
  backgroundImageUrl: '',
  backgroundColor: { h: 200, s: 60, l: 5 },
  backgroundAlpha: 0.95,
  cardColor: { h: 360, s: 0, l: 75 },
  cardBlur: 4,
  textHighlight: { h: 200, s: 100, l: 60 },
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
