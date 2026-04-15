export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export const CONSOLE_MIN_WIDTH = 400;
export const CONSOLE_MIN_HEIGHT = 150;
export const COMMAND_LIST = {
  "*": [
    {
      name: "cd",
      description: "Navigate to a different page",
      usage: "@#00ffaacd@# @#fff700<path>@#",
    },
    {
      name: "cl",
      description: "Clear the console output",
      usage: "@#00ffaacl@#",
    },
    {
      name: "help",
      description: "List all available commands",
      usage: "@#00ffaahelp@#",
    },
    {
      name: "echo",
      description: "Print a message to the console",
      usage: "@#00ffaaecho@# @#fff700<message>@#",
    },
    {
      name: "ls",
      description: "List available paths in the current directory",
      usage: "@#00ffaals@# @#fff700[-a | -l | -t]@#",
      options: ["-a", "-l", "-t", "--all", "--long", "--tree"],
    },
    {
      name: "background",
      description: "Set or reset the background image",
      usage: "@#00ffaabackground@# @#fff700<image_url> | -r@#",
      options: ["-r", "--reset"],
    },
    {
      name: "backgroundcolor",
      description: "Set or reset the background color (hex code)",
      usage: "@#00ffaabackgroundcolor@# @#fff700<#hex_color> | -r@#",
      options: ["-r", "--reset"],
    },
    {
      name: "username",
      description: "Change your display name (max 20 chars)",
      usage: "@#00ffaausername@# @#fff700<name>@#",
    },
  ],
  "/": [
    {
      name: "github",
      description: "Open my GitHub profile in a new tab",
      usage: "@#00ffaagithub@#",
    },
    {
      name: "youtube",
      description: "Open my YouTube channel in a new tab",
      usage: "@#00ffaayoutube@#",
    },
    {
      name: "twitter",
      description: "Open my Twitter profile in a new tab",
      usage: "@#00ffaatwitter@#",
    },
    {
      name: "instagram",
      description: "Open my Instagram profile in a new tab",
      usage: "@#00ffaainstagram@#",
    },
    {
      name: "twitch",
      description: "Open my Twitch channel in a new tab",
      usage: "@#00ffaatwitch@#",
    },
    {
      name: "discord",
      description: "Open my Discord profile in a new tab",
      usage: "@#00ffaadiscord@#",
    },
    {
      name: "email",
      description: "Compose an email to me",
      usage: "@#00ffaaemail@#",
    },
    {
      name: "osu",
      description: "Open my osu! profile in a new tab",
      usage: "@#00ffaaosu@#",
    },
    {
      name: "music",
      description: "Control background music playback",
      usage: "@#00ffaamusic@# @#fff700[-p | -s | -i | -l]@#",
      options: ["-p", "-s", "-i", "-l", "--play", "--stop", "--info", "--list"],
    },
  ],
  "listentogether/": [
    {
      name: "loop",
      description: "Toggle loop mode for the current track",
      usage: "@#00ffaaloop@# @#fff700[-t | -f]@#",
      options: ["-t", "-f", "--true", "--false"],
    },
    {
      name: "pause",
      description: "Pause the current playback",
      usage: "@#00ffaapause@#",
    },
    {
      name: "play",
      description: "Resume or start playback",
      usage: "@#00ffaaplay@#",
    },
    {
      name: "playlist",
      description: "Show the current playlist",
      usage: "@#00ffaaplaylist@# @#fff700[-d]@#",
      options: ["-d", "--detail"],
    },
    {
      name: "queue",
      description: "Add a YouTube video or playlist to the queue",
      usage: "@#00ffaaqueue@# @#fff700<video_url | playlist_url>@#",
    },
    {
      name: "random",
      description: "Toggle shuffle / random playback",
      usage: "@#00ffaarandom@# @#fff700[-t | -f]@#",
      options: ["-t", "-f", "--true", "--false"],
    },
    {
      name: "rate",
      description: "Set playback speed (e.g. 100 = normal)",
      usage: "@#00ffaarate@# @#fff700<percent>@#",
    },
    {
      name: "refresh",
      description: "Re-sync the player state from the server",
      usage: "@#00ffaarefresh@#",
    },
    {
      name: "remove",
      description: "Remove a track from the queue by index (* = all)",
      usage: "@#00ffaaremove@# @#fff700<index | *>@#",
    },
    {
      name: "seek",
      description: "Jump to a specific time in seconds",
      usage: "@#00ffaaseek@# @#fff700<seconds>@#",
    },
    {
      name: "send",
      description: "Send a chat message to the room",
      usage: "@#00ffaasend@# @#fff700<message>@#",
    },
    {
      name: "switch",
      description: "Switch to a track by index, or next / previous",
      usage: "@#00ffaaswitch@# @#fff700<index> | -n | -p@#",
      options: ["-n", "-p", "--next", "--prev"],
    },
    {
      name: "volume",
      description: "Set playback volume (0–100)",
      usage: "@#00ffaavolume@# @#fff700<value>@#",
    },
  ],
  "ytdownloader/": [
    {
      name: "download",
      description: "Download a YouTube video as mp4 or mp3",
      usage: "@#00ffaadownload@# @#fff700<video_url>@# @#fff700[-v | -a]@#",
      options: ["-v", "-a", "--video", "--audio"],
    },
  ],
};
export const PATH_LIST = {
  "/": ["listentogether/", "ytdownloader/"],
  "/listentogether": [],
  "/ytdownloader": [],
};
export const MUSIC_LIST = [
  {
    name: "Crywolf - Eyes Half Closed",
    path: "/musics/eyes-half-closed.mp3",
  },
  {
    name: "BlueArchive - The Promise at Sunset",
    path: "/musics/the-promise-at-sunset.mp3",
  },
];
export const TEXT_CONTENT = {
  global: {
    siteName: "Whydog",
    siteTitle: "Whydog - {0}",
    defaultUsername: "Anonymous",
  },
  console: {
    title: "Console {0}",
    placeholder: "Feel confused? Type 'help' to get started!",
    welcome: [
      " ",
      "  @#FFF700██╗    ██╗██╗  ██╗██╗   ██╗██████╗  ██████╗  ██████╗",
      "  @#FFF700██║    ██║██║  ██║╚██╗ ██╔╝██╔══██╗██╔═══██╗██╔════╝",
      "  @#FFF700██║ █╗ ██║███████║ ╚████╔╝ ██║  ██║██║   ██║██║  ███╗",
      "  @#FFF700██║███╗██║██╔══██║  ╚██╔╝  ██║  ██║██║   ██║██║   ██║",
      "  @#FFF700╚███╔███╔╝██║  ██║   ██║   ██████╔╝╚██████╔╝╚██████╔╝",
      "  @#FFF700 ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚═════╝  ╚═════╝  ╚═════╝",
      " ",
      "  @#bababaWhydog's Playground — Personal Terminal v1.0",
      "  @#bababa─────────────────────────────────────────────",
      " ",
      "  @#FF77B7Quick Start:@#",
      "    @#00ffaahelp@#            List all available commands",
      "    @#00ffaacd@# @#FFF700<path>@#       Navigate to a different page",
      "    @#00ffaals@#              List available paths",
      "    @#00ffaacl@#              Clear console output",
      " ",
      "  @#FF77B7Shortcuts:@#",
      "    @#FFF700Ctrl + `@#        Open a new console window",
      "    @#FFF700Esc@#             Restore last minimized console",
      "    @#FFF700Tab@#             Auto-complete commands",
      "    @#FFF700↑ / ↓@#           Browse command history",
      " ",
      "  @#f9f284Ready. Type a command to get started.",
      " ",
    ],
  },
  commands: {
    commandNotFound:
      "Unknown command: @#fff700{0}@#. Type @#00ffaahelp@# to see available commands.",
    availableCommands: "Available commands:",
    separator: "---",
    availablePaths: "Available paths:",
    help: {
      usage: "{0} — {1}",
    },
    background: {
      reset: "Background image has been reset.",
      urlInvalid:
        "Invalid URL. Usage: @#00ffaabackground@# @#fff700<image_url>@#",
      set: "Background image set to @#fff700{0}@#",
    },
    backgroundcolor: {
      reset: "Background color has been reset.",
      colorInvalid:
        "Invalid color. Must be a hex code (e.g. #FF0000). Usage: @#00ffaabackgroundcolor@# @#fff700<#hex>@#",
      set: "Background color set to @#fff700{0}@#",
    },
    username: {
      usage: "Usage: @#00ffaausername@# @#fff700<name>@#",
      tooLong: "Name too long — max 20 characters.",
      set: "Username changed to @#fff700{0}@#",
    },
    music: {
      usage: "Usage: @#00ffaamusic@# @#fff700[-p | -s | -i | -l]@#",
      list: "Music list:",
      nowPlaying: "Now playing: @#FFF700{0}@#...",
    },
  },
  home: {
    commands: {
      github: "Opening @#FFF700GitHub@# profile...",
      youtube: "Opening @#FFF700YouTube@# channel...",
      twitter: "Opening @#FFF700Twitter@# profile...",
      instagram: "Opening @#FFF700Instagram@# profile...",
      twitch: "Opening @#FFF700Twitch@# channel...",
      discord: "Opening @#FFF700Discord@# profile...",
      email: "Opening email client...",
      osu: "Opening @#FFF700osu!@# profile...",
    },
  },
  listentogether: {
    unmute: "點我一下",
    commands: {
      send: {
        usage: "Usage: @#00ffaasend@# @#fff700<message>@#",
      },
      queue: {
        usage: "Usage: @#00ffaaqueue@# @#fff700<video_url | playlist_url>@#",
        cannotPlay: "Unsupported URL — cannot play this link.",
        addedTracks: "Added @#fff700{0}@# tracks to queue (#{1} ~ #{2})",
        addedTrack: "Added @#fff700{0}@# to queue (#{1})",
        invalidUrl: "Invalid URL.",
      },
      remove: {
        usage: "Usage: @#00ffaaremove@# @#fff700<index | *>@#",
        removedAll: "All tracks removed from the queue.",
        invalidIndex: "Invalid index.",
        indexOutOfRange: "Index out of range.",
        removed: "Removed track #{0} from the queue.",
      },
      play: {
        start: "Resuming playback...",
      },
      pause: {
        pause: "Playback paused.",
      },
      switch: {
        usage: "Usage: @#00ffaaswitch@# @#fff700<index> | -n | -p@#",
        next: "Switched to the next track.",
        prev: "Switched to the previous track.",
        invalidIndex: "Invalid index.",
        indexOutOfRange: "Index out of range.",
        switchTo: "Switched to track #{0}.",
      },
      volume: {
        usage: "Usage: @#00ffaavolume@# @#fff700<0–100>@#",
        invalid: "Invalid volume value.",
        set: "Volume set to @#fff700{0}@#",
      },
      loop: {
        usage: "Usage: @#00ffaaloop@# @#fff700[-t | -f]@#",
        on: "Loop enabled.",
        off: "Loop disabled.",
      },
      random: {
        usage: "Usage: @#00ffaarandom@# @#fff700[-t | -f]@#",
        on: "Shuffle enabled.",
        off: "Shuffle disabled.",
      },
      rate: {
        usage: "Usage: @#00ffaarate@# @#fff700<percent>@#",
        invalid: "Invalid rate value.",
        set: "Playback speed set to @#fff700{0}%@#",
      },
      seek: {
        usage: "Usage: @#00ffaaseek@# @#fff700<seconds>@#",
        invalid: "Invalid time value.",
        outOfRange: "Time out of range.",
        seekTo: "Seeked to @#fff700{0}s@#",
      },
      refresh: {
        message: "Player state refreshed.",
      },
      playlist: {
        detail: "Playlist (detailed):",
        list: "Playlist:",
      },
    },
    logs: {
      addedTracks: "{0} 在播放清單中新增了 {1} 首歌曲 (#{2} ~ #{3})",
      addedTrack: "{0} 在播放清單中新增了 {1} (#{2})",
      removedAll: "{0} 清空了播放清單",
      removedTrack: "{0} 移除了 {1} (#{2})",
      play: "{0} 繼續播放",
      pause: "{0} 暫停播放",
      switchNext: "{0} 切換到下一首",
      switchPrev: "{0} 切換到上一首",
      switchTo: "{0} 切換到 #{1}",
      loopOn: "{0} 開啟循環播放",
      loopOff: "{0} 關閉循環播放",
      randomOn: "{0} 開啟隨機播放",
      randomOff: "{0} 關閉隨機播放",
      rate: "{0} 將播放速度設為 {1}%",
      seek: "{0} 跳轉到 {1} 秒",
      refresh: "{0} 重新同步播放器",
      playlistUpdated: "Playlist updated:",
      joined: "{0} joined the room",
    },
    errors: {
      getVideoInfo: "Failed to fetch video info: {0}",
      getPlaylist: "Failed to fetch playlist info: {0}",
      connectError: "Server connection failed (id: {0})",
      serverError: "Server error: {0}",
      disconnect: "Disconnected from server.",
      playerError: "Player error: {0}",
    },
  },
  ytdownloader: {
    commands: {
      download: {
        usage:
          "Usage: @#00ffaadownload@# @#fff700<video_url>@# @#fff700[-v | -a]@#",
        invalidUrl: "Invalid video URL.",
        pending: "Preparing download: @#fff700{0}@# ({1})",
        starting: "Download started...",
      },
    },
    errors: {
      downloadVideo: "Video download failed: {0}",
      downloadAudio: "Audio download failed: {0}",
      mp4Failed: "Failed to retrieve .mp4 file.",
      mp3Failed: "Failed to retrieve .mp3 file.",
    },
  },
  "/": {
    title: "Personal site",
    subtitle:
      "I'm Whydog, a 18yo developer passionate about full-stack development, UI/UX design.",
    about: [
      "@#FFF700Whitedog@#@@#00f3ffNTUST-CSIE@#, Taiwan",
      "(18yo) (a.k.a. Whydog)",
      "I @#FF77B7love@# @#00ffaaplaying games@# and @#00ffaacoding@#. Sometimes @#00ffaawatching anime@#.",
      "I @#FF77B7want@# to be a @#00ffaafull-stack@# developer, as well as a @#00ffaaUI/UX@# designer.",
      "This website is built with @#00ffaaReact@#, and I'm still working on it.",
      "@#f9f284Hope you enjoy your stay here.",
    ],
    social: [
      {
        icon: "gmail",
        value:
          "joshhuang9508@gmail.com — Type @#FFF700email@# to send me an email",
      },
      {
        icon: "twitter",
        value:
          "@whydog5555 — Type @#FFF700twitter@# to open my Twitter profile",
      },
      {
        icon: "instagram",
        value:
          "@whydog5555 — Type @#FFF700instagram@# to open my Instagram profile",
      },
      {
        icon: "github",
        value:
          "Joshhuang9508 — Type @#FFF700github@# to open my GitHub profile",
      },
      {
        icon: "youtube",
        value: "Whydog — Type @#FFF700youtube@# to open my YouTube channel",
      },
      {
        icon: "twitch",
        value: "whydog5555 — Type @#FFF700twitch@# to open my Twitch channel",
      },
      {
        icon: "discord",
        value: "@whydog — Type @#FFF700discord@# to open my Discord profile",
      },
      {
        icon: "osu",
        value: "-Whitedog- — Type @#FFF700osu@# to open my osu! profile",
      },
    ],
  },
  "/listentogether": {
    title: "Listen Together",
    subtitle:
      "A web-based music sync player. Listen to music with your friends in real-time.",
  },
  "/ytdownloader": {
    title: "YouTube Downloader",
    subtitle:
      "A web-based YouTube video downloader. Download YouTube videos in audio or video format.",
    tutorial: [
      "@#FFF700How to use?",
      "1. @#FF77B7Copy@# the @#00ffaaURL@# of the @#00ffaaYouTube video@# you want to download.",
      "2. @#FF77B7Type@# @#00ffaa'download'@# and paste the @#00ffaaURL@#.",
      "3. @#FF77B7Use@# flag @#00ffaa'-a'@# for @#00ffaaaudio@# only, or @#00ffaa'-v'@# for @#00ffaavideo@# only.",
      "4. @#FF77B7Wait@# for the download to complete.",
      "@#f9f284Enjoy your download!",
    ],
  },
  "*": {
    title: "Oops!",
    subtitle: "Page not found!",
    error:
      "@#FF77B7Error:@# This page doesn't exist. Type @#00ffaa'cd'@# to go back to the home page.",
  },
};
