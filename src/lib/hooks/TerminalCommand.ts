import { createContext, useContext, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';

import type * as Types from '@/lib/types';

import { MUSIC_LIST } from '@/lib/constants';

import { DEFAULT_SETTINGS } from '@/lib/settings';

import { t } from '@/lib/i18n';

import { clearActiveConsole, setActiveConsole } from '@/lib/consoleLog';

import { getVideoBlob } from '@/api';

import { AddConsoleLog, SetCommand, SetUsername } from '@/redux';

import { AppContext } from '@/pages/index';

import { renderWebPaths } from '@/utils';

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
  const { availableCommands, availablePaths, setAvailableCommands, setBackgroundImageUrl, setBackgroundColor, setUsername, isSettingsOpen, setIsSettingsOpen, settings, setSettings } =
    useContext(AppContext)!;

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
    settings: {
      name: 'settings',
      description: 'Open or toggle the settings panel',
      usage: '@#00ffaasettings@# @#fff700[-c]@#',
      flags: ['-c', '--close'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-c') || flags.includes('--close')) {
          setIsSettingsOpen(false);
          AddConsoleLog(t('commands.settings.closed'));
          return;
        }
        setIsSettingsOpen(!isSettingsOpen);
        AddConsoleLog(isSettingsOpen ? t('commands.settings.closed') : t('commands.settings.opened'));
      },
    },
    theme: {
      name: 'theme',
      description: 'Inspect or modify theme settings',
      usage: '@#00ffaatheme@# @#fff700<sub>@# @#fff700[args]@# (try @#fff700theme -h@#)',
      flags: ['-h', '--help'],
      handler: (_cmd, args, flags) => {
        const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
        const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : NaN);
        const printHelp = () => AddConsoleLog(...t('commands.theme.help'));

        if (flags.includes('-h') || flags.includes('--help')) {
          printHelp();
          return;
        }

        const sub = args[0];

        if (!sub) {
          AddConsoleLog(
            ...t(
              'commands.theme.show',
              settings.backgroundImageUrl || '(default)',
              `H:${settings.backgroundColor.h} S:${settings.backgroundColor.s} L:${settings.backgroundColor.l} / A:${settings.backgroundAlpha}`,
              `H:${settings.themeColor.h} S:${settings.themeColor.s} L:${settings.themeColor.l}`,
              `${settings.cardBlur}px`,
              `H:${settings.textColors.highlight.h} S:${settings.textColors.highlight.s} L:${settings.textColors.highlight.l}`,
              settings.textColors.primary,
              settings.textColors.secondary,
              settings.textColors.muted,
              settings.textColors.accent.length > 0 ? settings.textColors.accent.join(', ') : '(empty)',
            ),
          );
          return;
        }

        if (sub === 'reset') {
          setSettings(DEFAULT_SETTINGS);
          AddConsoleLog(t('commands.theme.reset'));
          return;
        }

        if (sub === 'bg-image') {
          const url = args[1];
          if (!url || flags.includes('-r') || flags.includes('--reset')) {
            setSettings({ ...settings, backgroundImageUrl: '' });
            AddConsoleLog(t('commands.theme.bgImageReset'));
            return;
          }
          setSettings({ ...settings, backgroundImageUrl: url });
          AddConsoleLog(t('commands.theme.bgImageSet', url));
          return;
        }

        if (sub === 'bg' || sub === 'color') {
          const h = num(args[1]);
          const s = num(args[2]);
          const l = num(args[3]);
          if ([h, s, l].some(Number.isNaN)) {
            AddConsoleLog(t('commands.theme.hslInvalid'));
            return;
          }
          if (sub === 'bg') {
            const a = args[4] !== undefined ? num(args[4]) : settings.backgroundAlpha;
            if (Number.isNaN(a)) {
              AddConsoleLog(t('commands.theme.hslInvalid'));
              return;
            }
            setSettings({ ...settings, backgroundColor: { h, s, l }, backgroundAlpha: a });
            AddConsoleLog(t('commands.theme.bgSet', `${h} ${s} ${l} / ${a}`));
          } else {
            setSettings({ ...settings, themeColor: { h, s, l } });
            AddConsoleLog(t('commands.theme.colorSet', `${h} ${s} ${l}`));
          }
          return;
        }

        if (sub === 'blur') {
          const px = num(args[1]);
          if (Number.isNaN(px) || px < 0) {
            AddConsoleLog(t('commands.theme.blurInvalid'));
            return;
          }
          setSettings({ ...settings, cardBlur: px });
          AddConsoleLog(t('commands.theme.blurSet', `${px}`));
          return;
        }

        if (sub === 'text-highlight') {
          const h = num(args[1]);
          const s = num(args[2]);
          const l = num(args[3]);
          if ([h, s, l].some(Number.isNaN)) {
            AddConsoleLog(t('commands.theme.hslInvalid'));
            return;
          }
          setSettings({ ...settings, textColors: { ...settings.textColors, highlight: { h, s, l } } });
          AddConsoleLog(t('commands.theme.textHighlightSet', `${h} ${s} ${l}`));
          return;
        }

        if (sub === 'text') {
          const which = args[1];
          const color = args[2];
          if (!['primary', 'secondary', 'muted'].includes(which)) {
            AddConsoleLog(t('commands.theme.textKey'));
            return;
          }
          if (!isHex(color)) {
            AddConsoleLog(t('commands.theme.hexInvalid'));
            return;
          }
          setSettings({
            ...settings,
            textColors: { ...settings.textColors, [which]: color },
          });
          AddConsoleLog(t('commands.theme.textSet', which, color));
          return;
        }

        if (sub === 'accent') {
          const action = args[1];
          if (action === 'add') {
            const color = args[2];
            if (!isHex(color)) {
              AddConsoleLog(t('commands.theme.hexInvalid'));
              return;
            }
            const accent = [...settings.textColors.accent, color];
            setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
            AddConsoleLog(t('commands.theme.accentAdded', color, `${accent.length - 1}`));
            return;
          }
          if (action === 'rm' || action === 'remove') {
            const idx = num(args[2]);
            if (Number.isNaN(idx) || idx < 0 || idx >= settings.textColors.accent.length) {
              AddConsoleLog(t('commands.theme.accentIndexInvalid'));
              return;
            }
            const accent = settings.textColors.accent.filter((_, i) => i !== idx);
            setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
            AddConsoleLog(t('commands.theme.accentRemoved', `${idx}`));
            return;
          }
          if (action === 'set') {
            const idx = num(args[2]);
            const color = args[3];
            if (Number.isNaN(idx) || idx < 0 || idx >= settings.textColors.accent.length) {
              AddConsoleLog(t('commands.theme.accentIndexInvalid'));
              return;
            }
            if (!isHex(color)) {
              AddConsoleLog(t('commands.theme.hexInvalid'));
              return;
            }
            const accent = [...settings.textColors.accent];
            accent[idx] = color;
            setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
            AddConsoleLog(t('commands.theme.accentSet', `${idx}`, color));
            return;
          }
          AddConsoleLog(t('commands.theme.accentUsage'));
          return;
        }

        AddConsoleLog(t('commands.theme.unknownSub', sub));
        printHelp();
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
