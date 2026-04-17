import { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';

import type * as Types from '@/lib/types';

import { MUSIC_LIST } from '@/lib/constants';

import { t } from '@/lib/i18n';

import { clearActiveConsole, setActiveConsole } from '@/lib/consoleLog';
import { getVideoBlob } from '@/lib/getVideoBlob';

import { AddConsoleLog, SetCommand, SetUsername } from '@/redux';

import { AppContext } from '@/pages/index';

export function parseCommand(command: string) {
  const parts = command.split(' ');
  const cmdName = parts.shift() ?? null;
  const args: string[] = [];
  const flags: string[] = [];
  for (const part of parts) {
    if (part.startsWith('-')) {
      if (part.startsWith('--')) {
        flags.push(part);
      } else {
        flags.push(
          ...part
            .slice(1)
            .split('')
            .map((flag) => `-${flag}`),
        );
      }
    } else {
      args.push(part);
    }
  }
  return { cmdName, args, flags };
}

const webPaths = ['listentogether', 'projects', 'osu', ['blog', ':slug']];

export default function useTerminalCommand(extensions: Types.CommandList) {
  const command = useSelector((state: { command: string }) => state.command);
  const { availableCommands, availablePaths, setAvailableCommands, setBackgroundImageUrl, setBackgroundColor, setUsername } = useContext(AppContext)!;

  const renderWebPaths = (paths: any, prefix: string): string[] => {
    const result: string[] = [];
    paths.map((path, index) => {
      if (Array.isArray(path)) {
        if (index != paths.length - 1) {
          result.push(`${prefix}├─ ${path[0]}/`);
          result.push(
            ...renderWebPaths(
              path.filter((_, i) => i > 0),
              prefix + '│　',
            ),
          );
        } else {
          result.push(`${prefix}└─ ${path[0]}/`);
          result.push(
            ...renderWebPaths(
              path.filter((_, i) => i > 0),
              prefix + '　　',
            ),
          );
        }
      } else {
        if (index != paths.length - 1) {
          result.push(`${prefix}├─ ${path}`);
        } else {
          result.push(`${prefix}└─ ${path}`);
        }
      }
    });
    return result;
  };

  const contextCommands: Types.CommandList = {
    help: {
      name: 'help',
      description: 'List all available commands',
      usage: '@#00ffaahelp@#',
      handler: (_cmd, _args, _flags) => {
        AddConsoleLog(t('commands.availableCommands'), t('commands.separator'));
        availableCommands.forEach((cmd: Types.Command) => {
          AddConsoleLog(t('commands.help.usage', cmd.usage, cmd.description));
        });
        return;
      },
    },
    ls: {
      name: 'ls',
      description: 'List available paths in the current directory',
      usage: '@#00ffaals@# @#fff700[-a | -l | -t]@#',
      flags: ['-a', '-l', '-t'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-t') || flags.includes('--tree')) {
          renderWebPaths(webPaths, '').forEach((path) => {
            AddConsoleLog(path);
          });
          return;
        } else if (flags.includes('-a') || flags.includes('--all')) {
          AddConsoleLog(['./', '../', ...availablePaths].join(' '));
          return;
        } else if (flags.includes('-l') || flags.includes('--long')) {
          AddConsoleLog(t('commands.availablePaths'), ...availablePaths);
          return;
        } else {
          AddConsoleLog(availablePaths.join(' '));
          return;
        }
      },
    },
    background: {
      name: 'background',
      description: 'Set or reset the background image',
      usage: '@#00ffaabackground@# @#fff700<image_url> | -r@#',
      flags: ['-r', '--reset'],
      handler: (_cmd, args, flags) => {
        const url = args[0] ?? '';
        if (flags.includes('-r') || flags.includes('--reset')) {
          AddConsoleLog(t('commands.background.reset'));
          setBackgroundImageUrl('');
          return;
        } else if (!url) {
          AddConsoleLog(t('commands.background.urlInvalid'));
          return;
        } else {
          AddConsoleLog(t('commands.background.set', url));
          setBackgroundImageUrl(url);
          localStorage.setItem('backgroundImageUrl', url);
          return;
        }
      },
    },
    backgroundcolor: {
      name: 'backgroundcolor',
      description: 'Set or reset the background color (hex code)',
      usage: '@#00ffaabackgroundcolor@# @#fff700<#hex_color> | -r@#',
      flags: ['-r', '--reset'],
      handler: (_cmd, args, flags) => {
        const color = args[0] ?? '';
        if (flags.includes('-r') || flags.includes('--reset')) {
          AddConsoleLog(t('commands.backgroundcolor.reset'));
          setBackgroundColor('');
          return;
        } else if (!color || !/^#([0-9a-fA-F]{6,8})$/.test(color)) {
          AddConsoleLog(t('commands.backgroundcolor.colorInvalid'));
          return;
        } else {
          AddConsoleLog(t('commands.backgroundcolor.set', color));
          setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
          return;
        }
      },
    },
    username: {
      name: 'username',
      description: 'Change your display name (max 20 chars)',
      usage: '@#00ffaausername@# @#fff700<name>@#',
      handler: (_cmd, args) => {
        const name = args[0] ?? '';
        if (!name) {
          AddConsoleLog(t('commands.username.usage'));
          return;
        } else if (name.length > 20) {
          AddConsoleLog(t('commands.username.tooLong'));
          return;
        } else {
          setUsername(name);
          SetUsername(name);
          AddConsoleLog(t('commands.username.set', name));
          localStorage.setItem('username', name);
          return;
        }
      },
    },
  };

  const builtInCommands: Types.CommandList = {
    echo: {
      name: 'echo',
      description: 'Print a message to the console',
      usage: '@#00ffaaecho@# @#fff700<message>@#',
      handler: (_cmd, args) => {
        AddConsoleLog(args.join(' '));
      },
    },
    cl: {
      name: 'cl',
      description: 'Clear the console output',
      usage: '@#00ffaacl@#',
      handler: () => {
        clearActiveConsole();
      },
    },
    cd: {
      name: 'cd',
      description: 'Navigate to a different page',
      usage: '@#00ffaacd@# @#fff700<path>@#',
      handler: (_cmd, args) => {
        const page = args[0] ?? '';
        const hash = window.location.hash.slice(1) || '/';
        let paths = hash.split('/').filter(Boolean);
        if (!page) {
          window.location.hash = '#/';
        } else {
          page.split('/').forEach((element, index) => {
            if (index === 0 && element === '~') {
              paths = [];
            } else if (element === '.') {
              return;
            } else if (element === '..') {
              paths.pop();
            } else if (element !== '') {
              paths.push(element);
            }
          });
          window.location.hash = paths.length > 0 ? `#/${paths.join('/')}` : '#/';
        }
      },
    },
    download: {
      name: 'download',
      description: 'Download a YouTube video as mp4 or mp3',
      usage: '@#00ffaadownload@# @#fff700<video_url>@# @#fff700[-v | -a]@#',
      flags: ['-v', '--video', '-a', '--audio'],
      handler: (_cmd, args, flags) => {
        const URL = args[0] ?? '';
        if (!URL) {
          AddConsoleLog(t('commands.download.usage'));
          return;
        } else if (!ReactPlayer.canPlay(URL)) {
          AddConsoleLog(t('commands.download.invalidUrl'));
          return;
        } else if (flags.includes('-v') || flags.includes('--video') || flags.length === 0) {
          const downloadVideo = async () => {
            AddConsoleLog(t('commands.download.pending', URL, '.mp4'));
            const blob = await getVideoBlob(URL.split('v=')[1], 'mp4').catch((error) => {
              AddConsoleLog(t('commands.download.error.downloadVideoFailed', error.message));
              return null;
            });
            if (!blob) return;
            AddConsoleLog(t('commands.download.starting'));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${URL.split('v=')[1]}.mp4`;
            a.click();
          };
          downloadVideo();
          return;
        } else if (flags.includes('-a') || flags.includes('--audio')) {
          const downloadAudio = async () => {
            AddConsoleLog(t('commands.download.pending', URL, '.mp3'));
            const blob = await getVideoBlob(URL.split('v=')[1], 'mp3').catch((error) => {
              AddConsoleLog(t('commands.download.error.downloadAudioFailed', error.message));
              return null;
            });
            if (!blob) return;
            AddConsoleLog(t('commands.download.starting'));
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${URL.split('v=')[1]}.mp3`;
            a.click();
          };
          downloadAudio();
          return;
        }
      },
    },
    music: {
      name: 'music',
      description: 'Control background music playback',
      usage: '@#00ffaamusic@# @#fff700[-p | -s | -i | -l]@#',
      flags: ['-p', '--play', '-s', '--stop', '-i', '--info', '-l', '--list'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-l') || flags.includes('--list')) {
          AddConsoleLog(t('commands.music.list'), ...MUSIC_LIST.map((_, index) => `#${index} - ${_.name}`));
          return;
        }
        if (flags.includes('-p') || flags.includes('--play')) {
          const audioPlayer = document.querySelector('[data-audio-player]') as HTMLAudioElement;
          if (audioPlayer) audioPlayer.play();
          return;
        }
        if (flags.includes('-s') || flags.includes('--stop')) {
          const audioPlayer = document.querySelector('[data-audio-player]') as HTMLAudioElement;
          if (audioPlayer) audioPlayer.pause();
          return;
        }
        AddConsoleLog(t('commands.music.usage'));
      },
    },
  };

  const commandList = { ...builtInCommands, ...contextCommands, ...extensions };
  const commandKeys = Object.keys(commandList).sort().join(',');

  const commandListRef = useRef<Types.CommandList>(commandList);

  commandListRef.current = commandList;

  useEffect(() => {
    setAvailableCommands(Object.values(commandListRef.current));
  }, [commandKeys]);

  useEffect(() => {
    if (!command || command === '') return;

    const { cmdName, args, flags } = parseCommand(command);
    if (!cmdName) return;

    const commandObj = commandListRef.current[cmdName];
    if (commandObj) {
      commandObj.handler(command, args, flags);
    } else {
      AddConsoleLog(t('commands.commandNotFound', command));
    }

    SetCommand('');
    setActiveConsole(null);
  }, [command]);
}
