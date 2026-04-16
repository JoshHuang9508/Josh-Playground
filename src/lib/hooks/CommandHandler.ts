import { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';

import type * as Types from '@/lib/types';

import { MUSIC_LIST } from '@/lib/constants';

import { t } from '@/lib/i18n';

import { clearActiveConsole, setActiveConsole } from '@/lib/consoleLog';
import { getVideoBlob } from '@/lib/getVideoBlob';

import { AddConsoleLog, SetCommand, SetUsername } from '@/redux';

export type CommandHandlers = Record<string, Types.CommandHandler>;

export type AppContextType = {
  availableArgs: Record<string, string[]>;
  availableCommands: Types.Command[];
  availablePaths: string[];
  setAvailableArgs: (args: Record<string, string[]>) => void;
  setAvailableCommands: (cmds: Types.Command[]) => void;
  setAvailablePaths: (paths: string[]) => void;
  backgroundImageUrl: string;
  backgroundColor: string;
  dynamicTitle: string | null;
  username: string;
  setBackgroundImageUrl: (url: string) => void;
  setBackgroundColor: (color: string) => void;
  setDynamicTitle: (title: string | null) => void;
  setUsername: (name: string) => void;
  currentHash: string;
};

export const AppContext = createContext<AppContextType | null>(null);

export function parseCommand(command: string) {
  const parts = command.split(' ');
  const cmdName = parts[0];
  const args = parts.slice(1);
  const flags = args.filter((a) => a.startsWith('-'));
  return { cmdName, args, flags };
}

const webPaths = ['listentogether', 'projects', 'osu', ['blog', ':slug']];

export default function useCommandHandler(handlers: CommandHandlers) {
  const command = useSelector((state: { command: string }) => state.command);
  const appContext = useContext(AppContext);

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

  const createContextHandlers = (ctx: AppContextType | null): CommandHandlers => {
    if (!ctx) return {};
    return {
      help: () => {
        AddConsoleLog(t('commands.availableCommands'), t('commands.separator'));
        ctx.availableCommands.forEach((cmd: Types.Command) => {
          AddConsoleLog(t('commands.help.usage', cmd.usage, cmd.description));
        });
        return;
      },
      ls: (_cmd, _args, flags) => {
        if (flags.includes('-t') || flags.includes('--tree')) {
          renderWebPaths(webPaths, '').forEach((path) => {
            AddConsoleLog(path);
          });
          return;
        } else if (flags.includes('-a') || flags.includes('--all')) {
          AddConsoleLog(['./', '../', ...ctx.availablePaths].join(' '));
          return;
        } else if (flags.includes('-l') || flags.includes('--long')) {
          AddConsoleLog(t('commands.availablePaths'), ...ctx.availablePaths);
          return;
        } else {
          AddConsoleLog(ctx.availablePaths.join(' '));
          return;
        }
      },
      background: (_cmd, args, flags) => {
        const url = args[0] ?? '';
        if (flags.includes('-r') || flags.includes('--reset')) {
          AddConsoleLog(t('commands.background.reset'));
          ctx.setBackgroundImageUrl('');
          return;
        } else if (!url) {
          AddConsoleLog(t('commands.background.urlInvalid'));
          return;
        } else {
          AddConsoleLog(t('commands.background.set', url));
          ctx.setBackgroundImageUrl(url);
          localStorage.setItem('backgroundImageUrl', url);
          return;
        }
      },
      backgroundcolor: (_cmd, args, flags) => {
        const color = args[0] ?? '';
        if (flags.includes('-r') || flags.includes('--reset')) {
          AddConsoleLog(t('commands.backgroundcolor.reset'));
          ctx.setBackgroundColor('');
          return;
        } else if (!color || !/^#([0-9a-fA-F]{6,8})$/.test(color)) {
          AddConsoleLog(t('commands.backgroundcolor.colorInvalid'));
          return;
        } else {
          AddConsoleLog(t('commands.backgroundcolor.set', color));
          ctx.setBackgroundColor(color);
          localStorage.setItem('backgroundColor', color);
          return;
        }
      },
      username: (_cmd, args) => {
        const name = args[0] ?? '';
        if (!name) {
          AddConsoleLog(t('commands.username.usage'));
          return;
        } else if (name.length > 20) {
          AddConsoleLog(t('commands.username.tooLong'));
          return;
        } else {
          ctx.setUsername(name);
          SetUsername(name);
          AddConsoleLog(t('commands.username.set', name));
          localStorage.setItem('username', name);
          return;
        }
      },
    };
  };

  const builtInHandlers: CommandHandlers = {
    echo: (_cmd, args) => {
      AddConsoleLog(args.join(' '));
    },
    cl: () => {
      clearActiveConsole();
    },
    cd: (_cmd, args) => {
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
    download: (_cmd, args, flags) => {
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
          const blob = await getVideoBlob(URL.split('v=')[1], 'mp4');
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
          const blob = await getVideoBlob(URL.split('v=')[1], 'mp3');
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
    music: (_cmd, _args, flags) => {
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
  };

  const handlersRef = useRef({
    ...builtInHandlers,
    ...createContextHandlers(appContext),
    ...handlers,
  });
  handlersRef.current = {
    ...builtInHandlers,
    ...createContextHandlers(appContext),
    ...handlers,
  };

  useEffect(() => {
    if (!command || command === '') return;

    const { cmdName, args, flags } = parseCommand(command);
    const handler = handlersRef.current[cmdName];

    if (handler) {
      handler(command, args, flags);
    } else {
      AddConsoleLog(t('commands.commandNotFound', command));
    }

    SetCommand('');
    setActiveConsole(null);
  }, [command]);
}
