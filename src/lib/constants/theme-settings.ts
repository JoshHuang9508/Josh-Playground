import type * as Types from '@/lib/types';

export const STORAGE_KEY = 'themeSettings';
export const DEFAULT_SETTINGS: Types.ThemeSettings = {
  backgroundImageUrl: '',
  backgroundColor: { h: 200, s: 60, l: 5 },
  backgroundAlpha: 0.95,
  themeColor: { h: 360, s: 0, l: 75 },
  cardBlur: 4,
  textColors: {
    primary: '#ffffff',
    secondary: '#cccccc',
    muted: '#888888',
    highlight: { h: 200, s: 100, l: 60 },
    accent: ['#00ffaa', '#ff77b7', '#ffa24c', '#00f3ff'],
  },
};
