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
  const { setExtensionCommands, extensionPaths, currentHash, isSettingsOpen, setIsSettingsOpen, settings, setSettings, setUsername } = useContext(AppContext)!;

  const contextCommands: Types.CommandList = {
    help: {
      name: 'help',
      description: t('global.commands.help.description'),
      usage: t('global.commands.help.usage'),
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
      description: t('global.commands.echo.description'),
      usage: t('global.commands.echo.usage'),
      handler: (_cmd, args, _flags) => {
        emitTerminalLog(args.join(' '));
      },
    },
    ls: {
      name: 'ls',
      description: t('global.commands.ls.description'),
      usage: t('global.commands.ls.usage'),
      flags: ['-a', '-l', '-t'],
      handler: (_cmd, args, flags) => {
        const path = args[0] ?? '';
        const available = findAvailablePath(path, extensionPaths, currentHash);
        if (flags.includes('-t') || flags.includes('--tree')) {
          renderWebPaths(webPaths, '').forEach((path) => {
            emitTerminalLog(path);
          });
          return;
        } else if (flags.includes('-a') || flags.includes('--all')) {
          emitTerminalLog(['./', '../', ...available].join(' '));
          return;
        } else if (flags.includes('-l') || flags.includes('--long')) {
          emitTerminalLog(t('global.commands.ls.availablePaths'), ...available);
          return;
        } else {
          emitTerminalLog(available.join(' '));
          return;
        }
      },
    },
    clear: {
      name: 'clear',
      description: t('global.commands.clear.description'),
      usage: t('global.commands.clear.usage'),
      handler: (_cmd, _args, _flags) => {
        clearActiveTerminalLog();
      },
    },
    cd: {
      name: 'cd',
      description: t('global.commands.cd.description'),
      usage: t('global.commands.cd.usage'),
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
      description: t('global.commands.download.description'),
      usage: t('global.commands.download.usage'),
      flags: ['-v', '--video', '-a', '--audio'],
      handler: (_cmd, args, flags) => {
        const URL = args[0] ?? '';
        if (!URL) {
          emitTerminalLog(t('global.commands.download.usage'));
          return;
        } else if (!ReactPlayer.canPlay(URL)) {
          emitTerminalLog(t('global.commands.download.invalidUrl'));
          return;
        } else if (flags.includes('-v') || flags.includes('--video') || flags.length === 0) {
          const downloadVideo = async () => {
            emitTerminalLog(t('global.commands.download.pending', URL, '.mp4'));
            const blob = await getVideoBlob(URL.split('v=')[1], 'mp4').catch((error) => {
              emitTerminalLog(t('global.commands.download.error.downloadVideoFailed', error.message));
              return null;
            });
            if (!blob) return;
            emitTerminalLog(t('global.commands.download.starting'));
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
            emitTerminalLog(t('global.commands.download.pending', URL, '.mp3'));
            const blob = await getVideoBlob(URL.split('v=')[1], 'mp3').catch((error) => {
              emitTerminalLog(t('global.commands.download.error.downloadAudioFailed', error.message));
              return null;
            });
            if (!blob) return;
            emitTerminalLog(t('global.commands.download.starting'));
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
      description: t('global.commands.music.description'),
      usage: t('global.commands.music.usage'),
      flags: ['-p', '--play', '-s', '--stop', '-i', '--info', '-l', '--list'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-l') || flags.includes('--list')) {
          emitTerminalLog(t('global.commands.music.list'), ...MUSIC_LIST.map((_, index) => `#${index} - ${_.name}`));
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
        emitTerminalLog(t('global.commands.music.usage'));
      },
    },
    settings: {
      name: 'settings',
      description: t('global.commands.settings.description'),
      usage: t('global.commands.settings.usage'),
      flags: ['-c', '--close'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-c') || flags.includes('--close')) {
          setIsSettingsOpen(false);
          emitTerminalLog(t('global.commands.settings.closed'));
          return;
        }
        setIsSettingsOpen(!isSettingsOpen);
        emitTerminalLog(isSettingsOpen ? t('global.commands.settings.closed') : t('global.commands.settings.opened'));
      },
    },
    theme: {
      name: 'theme',
      description: t('global.commands.theme.description'),
      usage: t('global.commands.theme.usage'),
      flags: ['-h', '--help'],
      subCommands: {
        'reset': {
          name: 'reset',
          description: t('global.commands.theme.reset.description'),
          usage: t('global.commands.theme.reset.usage'),
          handler: (_cmd, _args, _flags) => {
            setSettings(DEFAULT_SETTINGS);
            emitTerminalLog(t('global.commands.theme.reset.reset'));
          },
        },
        'bg-image': {
          name: 'bg-image',
          description: t('global.commands.theme.bgImage.description'),
          usage: t('global.commands.theme.bgImage.usage'),
          flags: ['-r', '--reset'],
          handler: (_cmd, args, flags) => {
            const url = args[0];
            if (!url && flags.length === 0) {
              emitTerminalLog(t('global.commands.theme.bgImage.usage'));
              return;
            }
            if (flags.includes('-r') || flags.includes('--reset')) {
              setSettings({ ...settings, backgroundImageUrl: '' });
              emitTerminalLog(t('global.commands.theme.bgImage.reset'));
              return;
            }
            setSettings({ ...settings, backgroundImageUrl: url });
            emitTerminalLog(t('global.commands.theme.bgImage.set', url));
          },
        },
        'bg': {
          name: 'bg',
          description: t('global.commands.theme.bg.description'),
          usage: t('global.commands.theme.bg.usage'),
          handler: (_cmd, args, _flags) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('global.commands.theme.bg.invalid'));
              return;
            }
            const a = args[3] !== undefined ? num(args[3]) : settings.backgroundAlpha;
            if (Number.isNaN(a)) {
              emitTerminalLog(t('global.commands.theme.bg.invalid'));
              return;
            }
            setSettings({ ...settings, backgroundColor: { h, s, l }, backgroundAlpha: a });
            emitTerminalLog(t('global.commands.theme.bg.set', `${h} ${s} ${l} / ${a}`));
          },
        },
        'color': {
          name: 'color',
          description: t('global.commands.theme.color.description'),
          usage: t('global.commands.theme.color.usage'),
          handler: (_cmd, args, _flags) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('global.commands.theme.color.invalid'));
              return;
            }
            setSettings({ ...settings, themeColor: { h, s, l } });
            emitTerminalLog(t('global.commands.theme.color.set', `${h} ${s} ${l}`));
          },
        },
        'blur': {
          name: 'blur',
          description: t('global.commands.theme.blur.description'),
          usage: t('global.commands.theme.blur.usage'),
          handler: (_cmd, args, _flags) => {
            const px = num(args[0]);
            if (Number.isNaN(px) || px < 0) {
              emitTerminalLog(t('global.commands.theme.blur.invalid'));
              return;
            }
            setSettings({ ...settings, cardBlur: px });
            emitTerminalLog(t('global.commands.theme.blur.set', `${px}`));
          },
        },
        'text-highlight': {
          name: 'text-highlight',
          description: t('global.commands.theme.text-highlight.description'),
          usage: t('global.commands.theme.text-highlight.usage'),
          handler: (_cmd, args, _flags) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('global.commands.theme.textHighlight.invalid'));
              return;
            }
            setSettings({ ...settings, textColors: { ...settings.textColors, highlight: { h, s, l } } });
            emitTerminalLog(t('global.commands.theme.textHighlight.set', `${h} ${s} ${l}`));
          },
        },
        'text': {
          name: 'text',
          description: t('global.commands.theme.text.description'),
          usage: t('global.commands.theme.text.usage'),
          handler: (_cmd, args, _flags) => {
            const which = args[0];
            const color = args[1];
            if (!['primary', 'secondary', 'muted'].includes(which)) {
              emitTerminalLog(t('global.commands.theme.text.invalid'));
              return;
            }
            if (!isHex(color)) {
              emitTerminalLog(t('global.commands.theme.text.invalid'));
              return;
            }
            setSettings({ ...settings, textColors: { ...settings.textColors, [which]: color } });
            emitTerminalLog(t('global.commands.theme.text.set', which, color));
          },
        },
        'accent': {
          name: 'accent',
          description: t('global.commands.theme.accent.description'),
          usage: t('global.commands.theme.accent.usage'),
          subCommands: {
            add: {
              name: 'add',
              description: t('global.commands.theme.accent.add.description'),
              usage: t('global.commands.theme.accent.add.usage'),
              handler: (_cmd, args, _flags) => {
                const color = args[0];
                if (!isHex(color)) {
                  emitTerminalLog(t('global.commands.theme.accent.add.invalid'));
                  return;
                }
                const accent = [...settings.textColors.accent, color];
                setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
                emitTerminalLog(t('global.commands.theme.accent.add.added', color, `${accent.length - 1}`));
              },
            },
            rm: {
              name: 'rm',
              description: t('global.commands.theme.accent.rm.description'),
              usage: t('global.commands.theme.accent.rm.usage'),
              handler: (_cmd, args, _flags) => {
                const index = num(args[0] ?? -1);
                if (Number.isNaN(index) || index < 0 || index >= settings.textColors.accent.length) {
                  emitTerminalLog(t('global.commands.theme.accent.rm.indexInvalid'));
                  return;
                }
                const accent = settings.textColors.accent.filter((_, i) => i !== index);
                setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
                emitTerminalLog(t('global.commands.theme.accent.rm.removed', `${index}`));
              },
            },
            set: {
              name: 'set',
              description: t('global.commands.theme.accent.set.description'),
              usage: t('global.commands.theme.accent.set.usage'),
              handler: (_cmd, args, _flags) => {
                const index = num(args[0] ?? -1);
                const color = args[1];
                if (Number.isNaN(index) || index < 0 || index >= settings.textColors.accent.length) {
                  emitTerminalLog(t('global.commands.theme.accent.set.indexInvalid'));
                  return;
                }
                if (!isHex(color)) {
                  emitTerminalLog(t('global.commands.theme.accent.set.invalid'));
                  return;
                }
                const accent = [...settings.textColors.accent];
                accent[index] = color;
                setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
                emitTerminalLog(t('global.commands.theme.accent.set.set', `${index}`, color));
              },
            },
          },
          handler: (_cmd, _args, _flags) => {
            emitTerminalLog(t('global.commands.theme.accent.usage'));
          },
        },
      },
      handler: (_cmd, args, flags) => {
        if (flags.includes('-h') || flags.includes('--help')) {
          emitTerminalLog(...t('global.commands.theme.help'));
          return;
        }
        if (!args.length && !flags.length) {
          emitTerminalLog(
            ...t(
              'global.commands.theme.show',
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
        emitTerminalLog(...t('global.commands.theme.help'));
      },
    },
    username: {
      name: 'username',
      description: t('global.commands.username.description'),
      usage: t('global.commands.username.usage'),
      handler: (_cmd, args, _flags) => {
        const name = args[0] ?? '';
        if (!name) {
          emitTerminalLog(t('global.commands.username.usage'));
          return;
        } else if (name.length > 20) {
          emitTerminalLog(t('global.commands.username.tooLong'));
          return;
        } else {
          setUsername(name);
          emitTerminalLog(t('global.commands.username.set', name));
          localStorage.setItem('username', name);
          return;
        }
      },
    },
  };

  const commandList = { ...contextCommands, ...extensionCommands };

  useEffect(() => {
    setExtensionCommands(commandList);
  }, []);
}
