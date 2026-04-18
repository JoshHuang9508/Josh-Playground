import { useContext, useEffect } from 'react';
import ReactPlayer from 'react-player';

import type * as Types from '@/lib/types';

import { MUSIC_LIST, DEFAULT_SETTINGS } from '@/lib/constants';

import { findAvailablePath, renderWebPaths } from '@/lib/terminal';

import { clearActiveTerminalLog, emitTerminalLog } from '@/lib/terminalLog';

import { t } from '@/lib/i18n';

import { AppContext } from '@/pages/index';

import { getVideoBlob } from '@/api';

const webPaths = ['listentogether', 'projects', 'osu', ['blog', ':slug']];

const isHex = (v: string) => /^#[0-9a-fA-F]{6}$/.test(v);
const num = (v: string) => (Number.isFinite(Number(v)) ? Number(v) : NaN);

export default function useTerminalCommand(extensionCommands: Types.CommandList) {
  const appContext = useContext(AppContext)!;

  const contextCommands: Types.CommandList = {
    help: {
      name: 'help',
      description: 'List all available commands',
      usage: '@#00ffaahelp@#',
      handler: (_cmd, _args, _flags) => {
        emitTerminalLog(t('global.commands.help.availableCommands'), t('global.commands.help.separator'));
        Object.values(commandList).forEach((cmd) => {
          emitTerminalLog(t('global.commands.help.commandUsage', cmd.usage, cmd.description));
        });
        return;
      },
    },
    echo: {
      name: 'echo',
      description: 'Print a message to the terminal',
      usage: '@#00ffaaecho@# @#fff700<message>@#',
      handler: (_cmd, args, _flags) => {
        emitTerminalLog(args.join(' '));
      },
    },
    ls: {
      name: 'ls',
      description: 'List available paths in the current directory',
      usage: '@#00ffaals@# @#fff700[-a|-l|-t]@#',
      flags: ['-a', '-l', '-t'],
      handler: (_cmd, args, flags) => {
        const path = args[0] ?? '';
        const available = findAvailablePath(path, appContext.extensionPaths, appContext.currentHash);
        if (flags.includes('-t') || flags.includes('--tree')) {
          renderWebPaths(webPaths, '').forEach((path) => {
            emitTerminalLog(path);
          });
          return;
        } else if (flags.includes('-a') || flags.includes('--all')) {
          emitTerminalLog(['./', '../', ...available].join(' '));
          return;
        } else if (flags.includes('-l') || flags.includes('--long')) {
          emitTerminalLog(t('commands.availablePaths'), ...available);
          return;
        } else {
          emitTerminalLog(available.join(' '));
          return;
        }
      },
    },
    cl: {
      name: 'cl',
      description: 'Clear the console output',
      usage: '@#00ffaacl@#',
      handler: (_cmd, _args, _flags) => {
        clearActiveTerminalLog();
      },
    },
    cd: {
      name: 'cd',
      description: 'Navigate to a different page',
      usage: '@#00ffaacd@# @#fff700<path>@#',
      handler: (_cmd, args, _flags) => {
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
      usage: '@#00ffaadownload@# @#fff700<video_url>@# @#fff700[-v|-a]@#',
      flags: ['-v', '--video', '-a', '--audio'],
      handler: (_cmd, args, flags) => {
        const URL = args[0] ?? '';
        if (!URL) {
          emitTerminalLog(t('commands.download.usage'));
          return;
        } else if (!ReactPlayer.canPlay(URL)) {
          emitTerminalLog(t('commands.download.invalidUrl'));
          return;
        } else if (flags.includes('-v') || flags.includes('--video') || flags.length === 0) {
          const downloadVideo = async () => {
            emitTerminalLog(t('commands.download.pending', URL, '.mp4'));
            const blob = await getVideoBlob(URL.split('v=')[1], 'mp4').catch((error) => {
              emitTerminalLog(t('commands.download.error.downloadVideoFailed', error.message));
              return null;
            });
            if (!blob) return;
            emitTerminalLog(t('commands.download.starting'));
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
            emitTerminalLog(t('commands.download.pending', URL, '.mp3'));
            const blob = await getVideoBlob(URL.split('v=')[1], 'mp3').catch((error) => {
              emitTerminalLog(t('commands.download.error.downloadAudioFailed', error.message));
              return null;
            });
            if (!blob) return;
            emitTerminalLog(t('commands.download.starting'));
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
      usage: '@#00ffaamusic@# @#fff700[-p|-s|-i|-l]@#',
      flags: ['-p', '--play', '-s', '--stop', '-i', '--info', '-l', '--list'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-l') || flags.includes('--list')) {
          emitTerminalLog(t('commands.music.list'), ...MUSIC_LIST.map((_, index) => `#${index} - ${_.name}`));
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
        emitTerminalLog(t('commands.music.usage'));
      },
    },
    settings: {
      name: 'settings',
      description: 'Open or toggle the settings panel',
      usage: '@#00ffaasettings@# @#fff700[-c]@#',
      flags: ['-c', '--close'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-c') || flags.includes('--close')) {
          appContext.setIsSettingsOpen(false);
          emitTerminalLog(t('commands.settings.closed'));
          return;
        }
        appContext.setIsSettingsOpen(!appContext.isSettingsOpen);
        emitTerminalLog(appContext.isSettingsOpen ? t('commands.settings.closed') : t('commands.settings.opened'));
      },
    },
    theme: {
      name: 'theme',
      description: 'Inspect or modify theme settings',
      usage: '@#00ffaatheme@# @#fff700<sub>@# @#fff700[args]@# (try @#fff700theme -h@#)',
      flags: ['-h', '--help'],
      subCommands: {
        'reset': {
          name: 'reset',
          description: 'Reset theme to defaults',
          usage: '@#00ffaatheme reset@#',
          handler: (_cmd, _args, _flags) => {
            appContext.setSettings(DEFAULT_SETTINGS);
            emitTerminalLog(t('commands.theme.reset'));
          },
        },
        'bg-image': {
          name: 'bg-image',
          description: 'Set or reset the background image',
          usage: '@#00ffaatheme bg-image@# @#fff700<image_url>|-r@#',
          flags: ['-r', '--reset'],
          handler: (_cmd, args, flags) => {
            const url = args[0];
            if (!url || flags.includes('-r') || flags.includes('--reset')) {
              appContext.setSettings({ ...appContext.settings, backgroundImageUrl: '' });
              emitTerminalLog(t('commands.theme.bgImageReset'));
              return;
            }
            appContext.setSettings({ ...appContext.settings, backgroundImageUrl: url });
            emitTerminalLog(t('commands.theme.bgImageSet', url));
          },
        },
        'bg': {
          name: 'bg',
          description: 'Set or reset the background color',
          usage: '@#00ffaatheme bg@# @#fff700<h> <s> <l> [a]@#',
          handler: (_cmd, args, _flags) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('commands.theme.hslInvalid'));
              return;
            }
            const a = args[3] !== undefined ? num(args[3]) : appContext.settings.backgroundAlpha;
            if (Number.isNaN(a)) {
              emitTerminalLog(t('commands.theme.hslInvalid'));
              return;
            }
            appContext.setSettings({ ...appContext.settings, backgroundColor: { h, s, l }, backgroundAlpha: a });
            emitTerminalLog(t('commands.theme.bgSet', `${h} ${s} ${l} / ${a}`));
          },
        },
        'color': {
          name: 'color',
          description: 'Set or reset the theme color',
          usage: '@#00ffaatheme color@# @#fff700<h> <s> <l>@#',
          handler: (_cmd, args, _flags) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('commands.theme.hslInvalid'));
              return;
            }
            appContext.setSettings({ ...appContext.settings, themeColor: { h, s, l } });
            emitTerminalLog(t('commands.theme.colorSet', `${h} ${s} ${l}`));
          },
        },
        'blur': {
          name: 'blur',
          description: 'Set or reset the card blur radius',
          usage: '@#00ffaatheme blur@# @#fff700<px>@#',
          handler: (_cmd, args, _flags) => {
            const px = num(args[0]);
            if (Number.isNaN(px) || px < 0) {
              emitTerminalLog(t('commands.theme.blurInvalid'));
              return;
            }
            appContext.setSettings({ ...appContext.settings, cardBlur: px });
            emitTerminalLog(t('commands.theme.blurSet', `${px}`));
          },
        },
        'text-highlight': {
          name: 'text-highlight',
          description: 'Set or reset the text highlight color',
          usage: '@#00ffaatheme text-highlight@# @#fff700<h> <s> <l>@#',
          handler: (_cmd, args, _flags) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('commands.theme.hslInvalid'));
              return;
            }
            appContext.setSettings({ ...appContext.settings, textColors: { ...appContext.settings.textColors, highlight: { h, s, l } } });
            emitTerminalLog(t('commands.theme.textHighlightSet', `${h} ${s} ${l}`));
          },
        },
        'text': {
          name: 'text',
          description: 'Set or reset the text color',
          usage: '@#00ffaatheme text@# @#fff700<primary|secondary|muted> <#hex>@#',
          handler: (_cmd, args, _flags) => {
            const which = args[0];
            const color = args[1];
            if (!['primary', 'secondary', 'muted'].includes(which)) {
              emitTerminalLog(t('commands.theme.textKey'));
              return;
            }
            if (!isHex(color)) {
              emitTerminalLog(t('commands.theme.hexInvalid'));
              return;
            }
            appContext.setSettings({ ...appContext.settings, textColors: { ...appContext.settings.textColors, [which]: color } });
            emitTerminalLog(t('commands.theme.textSet', which, color));
          },
        },
        'accent': {
          name: 'accent',
          description: 'Set or reset the accent color',
          usage: '@#00ffaatheme accent@# @#fff700<add|rm|set> <#hex>@#',
          handler: (_cmd, args, _flags) => {
            const action = args[0];
            if (action === 'add') {
              const color = args[1];
              if (!isHex(color)) {
                emitTerminalLog(t('commands.theme.hexInvalid'));
                return;
              }
              const accent = [...appContext.settings.textColors.accent, color];
              appContext.setSettings({ ...appContext.settings, textColors: { ...appContext.settings.textColors, accent } });
              emitTerminalLog(t('commands.theme.accentAdded', color, `${accent.length - 1}`));
              return;
            }
            if (action === 'rm' || action === 'remove') {
              const idx = num(args[1]);
              if (Number.isNaN(idx) || idx < 0 || idx >= appContext.settings.textColors.accent.length) {
                emitTerminalLog(t('commands.theme.accentIndexInvalid'));
                return;
              }
              const accent = appContext.settings.textColors.accent.filter((_, i) => i !== idx);
              appContext.setSettings({ ...appContext.settings, textColors: { ...appContext.settings.textColors, accent } });
              emitTerminalLog(t('commands.theme.accentRemoved', `${idx}`));
              return;
            }
            if (action === 'set') {
              const idx = num(args[1]);
              const color = args[2];
              if (Number.isNaN(idx) || idx < 0 || idx >= appContext.settings.textColors.accent.length) {
                emitTerminalLog(t('commands.theme.accentIndexInvalid'));
                return;
              }
              if (!isHex(color)) {
                emitTerminalLog(t('commands.theme.hexInvalid'));
                return;
              }
              const accent = [...appContext.settings.textColors.accent];
              accent[idx] = color;
              appContext.setSettings({ ...appContext.settings, textColors: { ...appContext.settings.textColors, accent } });
              emitTerminalLog(t('commands.theme.accentSet', `${idx}`, color));
              return;
            }
            emitTerminalLog(t('commands.theme.accentUsage'));
          },
        },
      },
      handler: (_cmd, args, flags) => {
        if (flags.includes('-h') || flags.includes('--help')) {
          emitTerminalLog(...t('commands.theme.help'));
          return;
        }
        if (!args.length && !flags.length) {
          emitTerminalLog(
            ...t(
              'commands.theme.show',
              appContext.settings.backgroundImageUrl || '(default)',
              `H:${appContext.settings.backgroundColor.h} S:${appContext.settings.backgroundColor.s} L:${appContext.settings.backgroundColor.l} / A:${appContext.settings.backgroundAlpha}`,
              `H:${appContext.settings.themeColor.h} S:${appContext.settings.themeColor.s} L:${appContext.settings.themeColor.l}`,
              `${appContext.settings.cardBlur}px`,
              `H:${appContext.settings.textColors.highlight.h} S:${appContext.settings.textColors.highlight.s} L:${appContext.settings.textColors.highlight.l}`,
              appContext.settings.textColors.primary,
              appContext.settings.textColors.secondary,
              appContext.settings.textColors.muted,
              appContext.settings.textColors.accent.length > 0 ? appContext.settings.textColors.accent.join(', ') : '(empty)',
            ),
          );
          return;
        }
        emitTerminalLog(...t('commands.theme.help'));
      },
    },
    username: {
      name: 'username',
      description: 'Change your display name (max 20 chars)',
      usage: '@#00ffaausername@# @#fff700<name>@#',
      handler: (_cmd, args, _flags) => {
        const name = args[0] ?? '';
        if (!name) {
          emitTerminalLog(t('commands.username.usage'));
          return;
        } else if (name.length > 20) {
          emitTerminalLog(t('commands.username.tooLong'));
          return;
        } else {
          appContext.setUsername(name);
          emitTerminalLog(t('commands.username.set', name));
          localStorage.setItem('username', name);
          return;
        }
      },
    },
  };

  const commandList = { ...contextCommands, ...extensionCommands };
  const commandKeys = Object.keys(commandList).sort().join(',');

  useEffect(() => {
    appContext.setExtensionCommands(commandList);
  }, [commandKeys]);
}
