export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
export const OSU_USER_ID = '15100005';
export const CONSOLE_MIN_WIDTH = 400;
export const CONSOLE_MIN_HEIGHT = 150;
export const TAG_COLORS: Record<string, string> = {
  'dev': '#00ffaa',
  'life': '#ff77b7',
  'gaming': '#00f3ff',
  'design': '#ffa24c',
  '': '#ccc',
};
export const MUSIC_LIST = [
  {
    name: 'Crywolf - Eyes Half Closed',
    path: '/musics/eyes-half-closed.mp3',
  },
  {
    name: 'BlueArchive - The Promise at Sunset',
    path: '/musics/the-promise-at-sunset.mp3',
  },
];
export const SOCIAL_LINKS = [
  { icon: 'github', url: 'https://github.com/JoshHuang9508' },
  { icon: 'youtube', url: 'https://www.youtube.com/@whydog5555' },
  { icon: 'twitter', url: 'https://x.com/whydog5555' },
  { icon: 'instagram', url: 'https://www.instagram.com/whydog5555/' },
  { icon: 'twitch', url: 'https://www.twitch.tv/whydog5555' },
  { icon: 'discord', url: 'https://discord.com/users/whydog5555' },
  { icon: 'osu', url: 'https://osu.ppy.sh/users/15100005' },
];
export const LANGUAGE_COLORS: Record<string, string> = {
  'TypeScript': '#3178c6',
  'JavaScript': '#f1e05a',
  'Python': '#3572A5',
  'Go': '#00ADD8',
  'Rust': '#dea584',
  'Vue': '#41b883',
  'Java': '#b07219',
  'C#': '#178600',
  'C++': '#f34b7d',
  'C': '#555555',
  'HTML': '#e34c26',
  'CSS': '#563d7c',
  'Shell': '#89e051',
  'Ruby': '#701516',
  'PHP': '#4F5D95',
  'Swift': '#F05138',
  'Kotlin': '#A97BFF',
  'Dart': '#00B4AB',
  '': '#ccc',
};
export * from './command-list';
export * from './path-list';
export * from './projects';
export * from './text-content';