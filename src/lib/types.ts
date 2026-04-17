export type ConsoleWindowState = 'normal' | 'minimized' | 'maximized' | 'closed';

export type Command = {
  name: string;
  description: string;
  usage: string;
  subCommands?: Command[];
  options?: string[];
};

export type CommandHandler = (fullCommand: string, args: string[], flags: string[]) => void;

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

export type VibeName = 'default' | 'lofi' | 'rave' | 'cinema' | 'dawn';

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

export type BlogPostMeta = Omit<BlogPost, 'content'>;

export type GitHubProjectConfig = {
  slug: string;
  name: string;
  description: string;
  github: { owner: string; repo: string };
  images: string[];
  tags: string[];
  accent: string;
};

export type GitHubProject = {
  name: string;
  description: string;
  language: string | null;
  stars: number;
  forks: number;
  url: string;
  updatedAt: string;
};

export type OsuUserReturnType = {
  avatar_url: string,
  country_code: string,
  default_group: string,
  id: number,
  is_active: boolean,
  is_bot: boolean,
  is_deleted: boolean,
  is_online: boolean,
  is_supporter: boolean,
  last_visit: string,
  pm_friends_only: boolean,
  profile_colour: string | null,
  username: string,
  cover_url: string,
  discord: string,
  has_supported: boolean,
  interests: string,
  join_date: string,
  location: string,
  max_blocks: number,
  max_friends: number,
  occupation: string,
  playmode: string,
  playstyle: string[],
  post_count: number,
  profile_hue: number,
  profile_order: string[],
  title: string | null,
  title_url: string | null,
  twitter: string,
  website: string | null,
  country: {
    code: string,
    name: string
  },
  cover: {
    custom_url: string,
    url: string,
    id: number | null
  },
  kudosu: {
    available: number,
    total: number
  },
  account_history: string[],
  active_tournament_banner: string | null,
  active_tournament_banners: string[],
  badges: string[],
  beatmap_playcounts_count: number,
  comments_count: number,
  current_season_stats: string | null,
  daily_challenge_user_stats: {
    daily_streak_best: number,
    daily_streak_current: number,
    last_update: string,
    last_weekly_streak: string,
    playcount: number,
    top_10p_placements: number,
    top_50p_placements: number,
    user_id: number,
    weekly_streak_best: number,
    weekly_streak_current: number
  },
  favourite_beatmapset_count: number,
  follower_count: number,
  graveyard_beatmapset_count: number,
  groups: string[],
  guest_beatmapset_count: number,
  loved_beatmapset_count: number,
  mapping_follower_count: number,
  matchmaking_stats: string[],
  monthly_playcounts: {
    start_date: string,
    count: number
  }[]
  nominated_beatmapset_count: number,
  page: {
    html: string,
    raw: string
  },
  pending_beatmapset_count: number
  previous_usernames: string[]
  rank_highest: {
    rank: number,
    updated_at: string
  },
  ranked_beatmapset_count: number,
  replays_watched_counts: {
    start_date: string,
    count: number
  }[]
  scores_best_count: number,
  scores_first_count: number,
  scores_pinned_count: number,
  scores_recent_count: number,
  statistics: {
    count_100: number,
    count_300: number,
    count_50: number,
    count_miss: number,
    level: {
      current: number,
      progress: number
    },
    global_rank: number,
    global_rank_percent: number,
    global_rank_exp: number | null,
    pp: number,
    pp_exp: number,
    ranked_score: number,
    hit_accuracy: number,
    accuracy: number,
    play_count: number,
    play_time: number,
    total_score: number,
    total_hits: number,
    maximum_combo: number,
    replays_watched_by_others: number,
    is_ranked: boolean,
    grade_counts: {
      ss: number,
      ssh: number,
      s: number,
      sh: number,
      a: number
    },
    country_rank: number,
    rank: {
      country: number
    }
  },
  support_level: number,
  team: {
    flag_url: string,
    id: number,
    name: string,
    short_name: string
  },
  user_achievements: {
    achieved_at: string,
    achievement_id: number
  }[],
  rank_history: {
    mode: string,
    data: number[]
  },
  rankHistory: {
    mode: string,
    data: number[]
  },
  ranked_and_approved_beatmapset_count: number,
  unranked_beatmapset_count: number
}

export type OsuUser = {
  username: string;
  avatarUrl: string;
  coverUrl: string;
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
  rankHistory: number[];
  monthlyPlaycounts: { start_date: string; count: number }[];
  peakRank: { rank: number; updated_at: string } | null;
  totalHits: number;
  rankedScore: number;
  maximumCombo: number;
  hitCounts: {
    count300: number;
    count100: number;
    count50: number;
    countMiss: number;
  };
  dailyChallenge: {
    currentStreak: number;
    bestStreak: number;
    totalPlaycount: number;
  };
  pageHtml: string;
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
