export const COMMAND_LIST = {
    '*': [
        {
            name: 'cd',
            description: 'Navigate to a different page',
            usage: '@#00ffaacd@# @#fff700<path>@#',
        },
        {
            name: 'cl',
            description: 'Clear the console output',
            usage: '@#00ffaacl@#',
        },
        {
            name: 'help',
            description: 'List all available commands',
            usage: '@#00ffaahelp@#',
        },
        {
            name: 'echo',
            description: 'Print a message to the console',
            usage: '@#00ffaaecho@# @#fff700<message>@#',
        },
        {
            name: 'ls',
            description: 'List available paths in the current directory',
            usage: '@#00ffaals@# @#fff700[-a | -l | -t]@#',
            options: ['-a', '-l', '-t', '--all', '--long', '--tree'],
        },
        {
            name: 'background',
            description: 'Set or reset the background image',
            usage: '@#00ffaabackground@# @#fff700<image_url> | -r@#',
            options: ['-r', '--reset'],
        },
        {
            name: 'backgroundcolor',
            description: 'Set or reset the background color (hex code)',
            usage: '@#00ffaabackgroundcolor@# @#fff700<#hex_color> | -r@#',
            options: ['-r', '--reset'],
        },
        {
            name: 'username',
            description: 'Change your display name (max 20 chars)',
            usage: '@#00ffaausername@# @#fff700<name>@#',
        },
        {
            name: 'download',
            description: 'Download a YouTube video as mp4 or mp3',
            usage: '@#00ffaadownload@# @#fff700<video_url>@# @#fff700[-v | -a]@#',
            options: ['-v', '-a', '--video', '--audio'],
        },
        {
            name: 'music',
            description: 'Control background music playback',
            usage: '@#00ffaamusic@# @#fff700[-p | -s | -i | -l]@#',
            options: ['-p', '-s', '-i', '-l', '--play', '--stop', '--info', '--list'],
        },
    ],
    '/': [
        {
            name: 'github',
            description: 'Open my GitHub profile in a new tab',
            usage: '@#00ffaagithub@#',
        },
        {
            name: 'youtube',
            description: 'Open my YouTube channel in a new tab',
            usage: '@#00ffaayoutube@#',
        },
        {
            name: 'twitter',
            description: 'Open my Twitter profile in a new tab',
            usage: '@#00ffaatwitter@#',
        },
        {
            name: 'instagram',
            description: 'Open my Instagram profile in a new tab',
            usage: '@#00ffaainstagram@#',
        },
        {
            name: 'twitch',
            description: 'Open my Twitch channel in a new tab',
            usage: '@#00ffaatwitch@#',
        },
        {
            name: 'discord',
            description: 'Open my Discord profile in a new tab',
            usage: '@#00ffaadiscord@#',
        },
        {
            name: 'email',
            description: 'Compose an email to me',
            usage: '@#00ffaaemail@#',
        },
        {
            name: 'osu',
            description: 'Open my osu! profile in a new tab',
            usage: '@#00ffaaosu@#',
        },
    ],
    'listentogether/': [
        {
            name: 'loop',
            description: 'Toggle loop mode for the current track',
            usage: '@#00ffaaloop@# @#fff700[-t | -f]@#',
            options: ['-t', '-f', '--true', '--false'],
        },
        {
            name: 'pause',
            description: 'Pause the current playback',
            usage: '@#00ffaapause@#',
        },
        {
            name: 'play',
            description: 'Resume or start playback',
            usage: '@#00ffaaplay@#',
        },
        {
            name: 'playlist',
            description: 'Show the current playlist',
            usage: '@#00ffaaplaylist@# @#fff700[-d]@#',
            options: ['-d', '--detail'],
        },
        {
            name: 'queue',
            description: 'Add a YouTube video or playlist to the queue',
            usage: '@#00ffaaqueue@# @#fff700<video_url | playlist_url>@#',
        },
        {
            name: 'random',
            description: 'Toggle shuffle / random playback',
            usage: '@#00ffaarandom@# @#fff700[-t | -f]@#',
            options: ['-t', '-f', '--true', '--false'],
        },
        {
            name: 'rate',
            description: 'Set playback speed (e.g. 100 = normal)',
            usage: '@#00ffaarate@# @#fff700<percent>@#',
        },
        {
            name: 'refresh',
            description: 'Re-sync the player state from the server',
            usage: '@#00ffaarefresh@#',
        },
        {
            name: 'remove',
            description: 'Remove a track from the queue by index (* = all)',
            usage: '@#00ffaaremove@# @#fff700<index | *>@#',
        },
        {
            name: 'seek',
            description: 'Jump to a specific time in seconds',
            usage: '@#00ffaaseek@# @#fff700<seconds>@#',
        },
        {
            name: 'send',
            description: 'Send a chat message to the room',
            usage: '@#00ffaasend@# @#fff700<message>@#',
        },
        {
            name: 'switch',
            description: 'Switch to a track by index, or next / previous',
            usage: '@#00ffaaswitch@# @#fff700<index> | -n | -p@#',
            options: ['-n', '-p', '--next', '--prev'],
        },
        {
            name: 'volume',
            description: 'Set playback volume (0–100)',
            usage: '@#00ffaavolume@# @#fff700<value>@#',
        },
    ],
    'projects/': [
        {
            name: 'open',
            description: 'Open a GitHub repo in a new tab',
            usage: '@#00ffaaopen@# @#fff700<repo-name>@#',
        },
    ],
    'osu/': [
        {
            name: 'stats',
            description: 'Show osu! stats summary in console',
            usage: '@#00ffaastats@#',
        },
    ],
    'blog/': [
        {
            name: 'read',
            description: 'Open a blog post by slug',
            usage: '@#00ffaaread@# @#fff700<slug>@#',
        },
    ],
};