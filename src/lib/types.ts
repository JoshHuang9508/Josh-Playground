export type Command = {
  name: string;
  description: string;
  usage: string;
  subCommands?: Command[];
  options?: string[];
};

/**
 * Command handler function type
 * @param fullCommand - The full command string (e.g. "music -p")
 * @param args - Arguments after the command name without "-" (e.g. ["arg1", "arg2"])
 * @param flags - Arguments that start with "-" (e.g. ["-p", "--play"])
 */
export type CommandHandler = (
  fullCommand: string,
  args: string[],
  flags: string[],
) => void;

export type Track = {
  url: string; //https://www.youtube.com/watch?v={ID}
  title: string;
  author: string;
  img: string; //https://img.youtube.com/vi/{ID}/default.jpg
  requestBy: string;
  id: number;
};

export type PlayerState = {
  playing: boolean;
  played: number;
  playedSeconds: number;
  loaded: number;
  loadedSeconds: number;
  duration: number;
  playbackRate: number;
  loop: boolean;
  random: boolean;
  trackQueue: Track[];
  currentTrack: Track | null;
  index: number;
  isEnd: boolean;
};

export type PlayerStateClient = {
  volume: number;
  seeking: boolean;
  isReady: boolean;
};

export type User = {
  [id: string]: string;
};

export type Music = {
  name: string;
  path: string;
};

export type GitHubRepo = {
  name: string; // e.g. "RiceCall"
  owner: string; // e.g. "NerdyHomeReOpen"
  description: string;
  language: string | null; // e.g. "TypeScript", "Go", "Vue", null
  stars: number;
  forks: number;
  watchers: number;
  visibility: "Public" | "Private";
  updatedAt: string; // e.g. "Updated 4 hours ago"
  url?: string; // e.g. "https://github.com/NerdyHomeReOpen/RiceCall"
};
