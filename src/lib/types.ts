export type Command = {
  name: string;
  description: string;
  usage: string;
  subCommands?: Command[];
  options?: string[];
};

export type CommandHandler = (
  fullCommand: string,
  args: string[],
  flags: string[],
) => void;

export type Track = {
  url: string; // e.g. https://www.youtube.com/watch?v={ID}
  title: string;
  author: string;
  img: string; // e.g. https://img.youtube.com/vi/{ID}/default.jpg
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

export type BlogPost = {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  color?: string;
  content: string;
  readTime: number;
};

export type BlogPostMeta = Omit<BlogPost, "content">;

export type OsuUser = {
  username: string;
  avatarUrl: string;
  countryCode: string;
  joinDate: string;
  globalRank: number | null;
  countryRank: number | null;
  pp: number;
  accuracy: number;
  playCount: number;
  playTime: number;
  level: number;
  levelProgress: number;
  gradeCounts: {
    ss: number;
    ssh: number;
    s: number;
    sh: number;
    a: number;
  };
};

export type YTPLReturnType = {
  id: string;
  url: string;
  title: string;
  estimatedItemCount: number;
  views: number;
  thumbnails: {
    url: string;
    width: number;
    height: number;
  }[];
  bestThumbnail: {
    url: string;
    width: number;
    height: number;
  };
  lastUpdated: string;
  description: string;
  visibility: string;
  author: {
    name: string;
    url: string;
    avatars: {
      url: string;
      width: number;
      height: number;
    }[];
    bestAvatar: {
      url: string;
      width: number;
      height: number;
    };
    channelID: string;
  }[];
  items: {
    title: string;
    index: number;
    id: string;
    shortUrl: string;
    url: string;
    author: {
      url: string;
      channelID: string;
      name: string;
    };
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }[];
    bestThumbnail: {
      url: string;
      width: number;
      height: number;
    };
    isLive: boolean;
    duration: string;
    durationSec: number;
    isPlayable: boolean;
  }[];
  continuation: string | null;
};

export type YTDLReturnType = {
  embed: {
    iframeUrl: string;
    width: number;
    height: number;
  };
  title: string;
  description: string;
  lengthSeconds: string;
  ownerProfileUrl: string;
  externalChannelId: string;
  isFamilySafe: boolean;
  availableCountries: string[];
  isUnlisted: boolean;
  hasYpcMetadata: boolean;
  viewCount: string;
  category: string;
  publishDate: string;
  ownerChannelName: string;
  liveBroadcastDetails: {
    isLiveNow: boolean;
    startTimestamp: string;
    endTimestamp: string;
  };
  keywords: string[];
  channelId: string;
  isOwnerViewing: boolean;
  isCrawlable: boolean;
  allowRatings: boolean;
  author: {
    id: string;
    name: string;
    user: string;
    channel_url: string;
    external_channel_url: string;
    user_url: string;
    thumbnails: {
      url: string;
      width: number;
      height: number;
    }[];
  };
  isLowLatencyLiveStream: boolean;
  isPrivate: boolean;
  isUnpluggedCorpus: boolean;
  latencyClass: string;
  isLiveContent: boolean;
  media: any;
  likes: number | null;
  dislikes: number | null;
  age_restricted: boolean;
  video_url: string;
  storyboards: {
    url: string;
    thumbnailWidth: number;
    thumbnailHeight: number;
    thumbnailCount: number;
    interval: number;
    columns: number;
    rows: number;
    storyboardCount: number;
  }[];
  chapters: any[];
  thumbnails: {
    url: string;
    width: number;
    height: number;
  }[];
};
