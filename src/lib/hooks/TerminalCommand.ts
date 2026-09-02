import { useContext } from 'react';
import ReactPlayer from 'react-player';

import type * as Types from '@/lib/types';

import { DEFAULT_SETTINGS, TEXT_COLOR_KEYS } from '@/lib/constants';

import { findCommandObject } from '@/lib/terminal';

import { clearActiveTerminalLog, emitTerminalLog } from '@/lib/terminalLog';

import { escapeCustomColorTags } from '@/lib/color';

import useI18n from '@/lib/hooks/i18n';
import useMusic from '@/lib/hooks/Music';

import { AppContext } from '@/pages/index';

import { getVideoBlob } from '@/api';

const isHex = (v: string) => {
  return /^#[0-9a-fA-F]{6}$/.test(v);
};

const num = (v: string) => {
  if (Number.isFinite(Number(v))) return Number(v);
  return NaN;
};

export default function useTerminalCommand(extension: Types.CommandList) {
  const { extensionCommands, settings, setSettings, setUsername, setExtensionCommands } = useContext(AppContext)!;
  const { t, setLocale } = useI18n();
  const music = useMusic();

  const contextCommands: Types.CommandList = {
    help: {
      name: 'help',
      description: t('global.commands.help.description'),
      usage: t('global.commands.help.usage'),
      handler: (_cmd, args) => {
        if (args.length > 0) {
          const command = findCommandObject(args.join(' '), extensionCommands.current);
          if (!command) {
            emitTerminalLog(t('terminal.commandNotFound', args.join(' ')));
            return;
          }
          emitTerminalLog(t('terminal.commandUsage', command.usage, command.description));
        } else {
          emitTerminalLog(t('terminal.availableCommands'));
          const commands = Object.values(extensionCommands.current);
          const paddingWidth = Math.max(...commands.map((cmd) => escapeCustomColorTags(cmd.usage).length));
          commands.forEach((cmd) => {
            const offset = cmd.usage.length - escapeCustomColorTags(cmd.usage).length;
            const paddedUsage = cmd.usage.padEnd(paddingWidth + offset, ' ');
            emitTerminalLog(t('terminal.commandUsage', paddedUsage, cmd.description));
          });
        }
      },
    },
    echo: {
      name: 'echo',
      description: t('global.commands.echo.description'),
      usage: t('global.commands.echo.usage'),
      handler: (_cmd, args) => {
        emitTerminalLog(args.join(' '));
      },
    },
    clear: {
      name: 'clear',
      description: t('global.commands.clear.description'),
      usage: t('global.commands.clear.usage'),
      handler: () => {
        clearActiveTerminalLog();
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
      flags: ['-p', '--play', '-s', '--stop', '-n', '--next', '-b', '--back', '-l', '--list'],
      handler: (_cmd, args, flags) => {
        if (flags.includes('-l') || flags.includes('--list')) {
          emitTerminalLog(t('global.commands.music.list'), ...music.playlists.map((playlist, index) => `  #${index} - ${playlist.name}${index === music.playlistIndex ? ' *' : ''}`));
          return;
        }
        if (flags.includes('-p') || flags.includes('--play')) {
          if (!music.playing) music.toggle();
          if (music.track) emitTerminalLog(t('global.commands.music.nowPlaying', music.track.title));
          return;
        }
        if (flags.includes('-s') || flags.includes('--stop')) {
          if (music.playing) music.toggle();
          return;
        }
        if (flags.includes('-n') || flags.includes('--next')) {
          music.next();
          return;
        }
        if (flags.includes('-b') || flags.includes('--back')) {
          music.previous();
          return;
        }
        if (args.length) {
          const index = num(args[0]);
          if (Number.isNaN(index) || index < 0 || index >= music.playlists.length) {
            emitTerminalLog(t('global.commands.music.invalidPlaylist'));
            return;
          }
          music.selectPlaylist(index);
          emitTerminalLog(t('global.commands.music.switched', music.playlists[index].name));
          return;
        }
        emitTerminalLog(t('global.commands.music.usage'));
      },
    },
    settings: {
      name: 'settings',
      description: t('global.commands.settings.description'),
      usage: t('global.commands.settings.usage'),
      flags: ['-h', '--help'],
      subCommands: {
        'reset': {
          name: 'reset',
          description: t('global.commands.settings.reset.description'),
          usage: t('global.commands.settings.reset.usage'),
          handler: () => {
            setSettings(DEFAULT_SETTINGS);
            emitTerminalLog(t('global.commands.settings.reset.reset'));
          },
        },
        'bg-image': {
          name: 'bg-image',
          description: t('global.commands.settings.bgImage.description'),
          usage: t('global.commands.settings.bgImage.usage'),
          flags: ['-r', '--reset'],
          handler: (_cmd, args, flags) => {
            const url = args[0];
            if (!url && flags.length === 0) {
              emitTerminalLog(t('global.commands.settings.bgImage.usage'));
              return;
            }
            if (flags.includes('-r') || flags.includes('--reset')) {
              setSettings({ ...settings, backgroundImageUrl: '' });
              emitTerminalLog(t('global.commands.settings.bgImage.reset'));
              return;
            }
            setSettings({ ...settings, backgroundImageUrl: url });
            emitTerminalLog(t('global.commands.settings.bgImage.set', url));
          },
        },
        'bg': {
          name: 'bg',
          description: t('global.commands.settings.bg.description'),
          usage: t('global.commands.settings.bg.usage'),
          handler: (_cmd, args) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('global.commands.settings.bg.invalid'));
              return;
            }
            const a = args[3] !== undefined ? num(args[3]) : settings.backgroundAlpha;
            if (Number.isNaN(a)) {
              emitTerminalLog(t('global.commands.settings.bg.invalid'));
              return;
            }
            setSettings({ ...settings, backgroundColor: { h, s, l }, backgroundAlpha: a });
            emitTerminalLog(t('global.commands.settings.bg.set', `${h} ${s} ${l} / ${a}`));
          },
        },
        'blur': {
          name: 'blur',
          description: t('global.commands.settings.blur.description'),
          usage: t('global.commands.settings.blur.usage'),
          handler: (_cmd, args) => {
            const px = num(args[0]);
            if (Number.isNaN(px) || px < 0) {
              emitTerminalLog(t('global.commands.settings.blur.invalid'));
              return;
            }
            setSettings({ ...settings, cardBlur: px });
            emitTerminalLog(t('global.commands.settings.blur.set', `${px}`));
          },
        },
        'text-highlight': {
          name: 'text-highlight',
          description: t('global.commands.settings.textHighlight.description'),
          usage: t('global.commands.settings.textHighlight.usage'),
          handler: (_cmd, args) => {
            const h = num(args[0]);
            const s = num(args[1]);
            const l = num(args[2]);
            if ([h, s, l].some(Number.isNaN)) {
              emitTerminalLog(t('global.commands.settings.textHighlight.invalid'));
              return;
            }
            setSettings({ ...settings, textHighlight: { h, s, l } });
            emitTerminalLog(t('global.commands.settings.textHighlight.set', `${h} ${s} ${l}`));
          },
        },
        'text': {
          name: 'text',
          description: t('global.commands.settings.text.description'),
          usage: t('global.commands.settings.text.usage'),
          handler: (_cmd, args) => {
            const which = args[0] as Types.TextColorKey;
            const color = args[1];
            if (!TEXT_COLOR_KEYS.includes(which)) {
              emitTerminalLog(t('global.commands.settings.text.invalid'));
              return;
            }
            if (!isHex(color)) {
              emitTerminalLog(t('global.commands.settings.text.invalid'));
              return;
            }
            setSettings({ ...settings, textColors: { ...settings.textColors, [which]: color } });
            emitTerminalLog(t('global.commands.settings.text.set', which, color));
          },
        },
      },
      handler: (_cmd, args, flags, cmdObj) => {
        if (flags.includes('-h') || flags.includes('--help')) {
          emitTerminalLog(t('terminal.availableCommands'));
          const commands = Object.values(cmdObj?.subCommands ?? {});
          const paddingWidth = Math.max(...commands.map((cmd) => escapeCustomColorTags(cmd.usage).length));
          commands.forEach((cmd) => {
            const offset = cmd.usage.length - escapeCustomColorTags(cmd.usage).length;
            const paddedUsage = cmd.usage.padEnd(paddingWidth + offset, ' ');
            emitTerminalLog(t('terminal.commandUsage', paddedUsage, cmd.description));
          });
          return;
        }
        if (!args.length && !flags.length) {
          emitTerminalLog(
            ...t(
              'global.commands.settings.show',
              settings.backgroundImageUrl || '(default)',
              `H:${settings.backgroundColor.h} S:${settings.backgroundColor.s} L:${settings.backgroundColor.l} / A:${settings.backgroundAlpha}`,
              `${settings.cardBlur}px`,
              `H:${settings.textHighlight.h} S:${settings.textHighlight.s} L:${settings.textHighlight.l}`,
              settings.textColors.primary,
              settings.textColors.secondary,
              settings.textColors.muted,
              settings.textColors.accent1,
              settings.textColors.accent2,
              settings.textColors.accent3,
              settings.textColors.accent4,
            ),
          );
          return;
        }
        emitTerminalLog(t('global.commands.settings.usage'));
      },
    },
    username: {
      name: 'username',
      description: t('global.commands.username.description'),
      usage: t('global.commands.username.usage'),
      handler: (_cmd, args) => {
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
    locale: {
      name: 'locale',
      description: t('global.commands.locale.description'),
      usage: t('global.commands.locale.usage'),
      args: ['en', 'zh'],
      handler: (_cmd, args) => {
        const locale = args[0] ?? '';
        if (!['en', 'zh'].includes(locale)) {
          emitTerminalLog(t('global.commands.locale.invalid'));
          return;
        }
        setLocale(locale as Types.Locale);
        emitTerminalLog(t('global.commands.locale.set', locale));
        localStorage.setItem('locale', locale);
      },
    },
  };

  const commandList = { ...extensionCommands.current, ...contextCommands, ...extension };

  setExtensionCommands(commandList);
}
