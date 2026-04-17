import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import ReactPlayer from 'react-player';

import type * as Types from '@/lib/types';

import { VALID_VIBES } from '@/lib/constants';

import { t } from '@/lib/i18n';

import useTerminalCommand from '@/lib/hooks/TerminalCommand';

import { AddConsoleLog } from '@/redux';

import { getVideoInfo, getPlaylist } from '@/api';

import ListenTogetherSocket from '@/socket';

import { IDiffArray, IDiffObject } from '@/utils';

import MemberDots from './MemberDots';

import styles from './ListenTogether.module.css';

export default function ListenTogetherView() {
  const playerRef = useRef<ReactPlayer>(null);

  const username = useSelector((state: { user: string }) => state.user);

  const [mute, setMute] = useState(true);
  const [vibe, setVibe] = useState('default');
  const [flash, setFlash] = useState(false);
  const [socketInstance, setSocketInstance] = useState<ListenTogetherSocket | null>(null);
  const [playerState, setPlayerState] = useState<Types.PlayerState>({
    playing: false,
    played: 0,
    playedSeconds: 0,
    loaded: 0,
    loadedSeconds: 0,
    duration: 0,
    playbackRate: 1,
    loop: false,
    random: false,
    trackQueue: [],
    currentTrack: null,
    index: 0,
    isEnd: false,
  });
  const [cachedPlayerState, setCachedPlayerState] = useState<Types.PlayerState | null>(null);
  const [PlayerStateClientState, setPlayerStateClient] = useState<Types.PlayerStateClient>({
    volume: 0.5,
    seeking: false,
    isReady: false,
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [cachedLogs, setCachedLogs] = useState<string[]>([]);
  const [users, setUsers] = useState<Types.User>({});
  const [cachedUsers, setCachedUsers] = useState<Types.User>({});

  const triggerFlash = () => {
    setFlash(true);
    setTimeout(() => setFlash(false), 400);
  };

  const handlePlayerEnded = () => socketInstance?.onEnded();

  const handlePlayerProgress = (state: Types.PlayerState) => {
    socketInstance?.onProgress(state.playedSeconds);
    setPlayerState((prev) => ({ ...prev, playedSeconds: state.playedSeconds }));
  };

  const handlePlayerDuration = (duration: number) => socketInstance?.onDuration(duration);

  const handlePlayerError = (error: any) => AddConsoleLog(t('listentogether.errors.playerError', String(error)));

  const handlePlayerReady = () => {
    if (PlayerStateClientState.isReady) return;
    socketInstance?.refresh();
    setPlayerStateClient((prev) => ({ ...prev, isReady: true }));
  };

  const handlePlayerSeek = () => {
    setPlayerStateClient((prev) => ({ ...prev, seeking: true }));
    setTimeout(() => setPlayerStateClient((prev) => ({ ...prev, seeking: false })), 1000);
  };

  useTerminalCommand({
    send: {
      name: 'send',
      description: 'Send a message to the room',
      usage: '@#00ffaasend@# @#fff700<message>@#',
      handler: (_cmd, args) => {
        const message = args.join(' ') ?? '';
        if (!message) {
          AddConsoleLog(t('listentogether.commands.send.usage'));
          return;
        }
        socketInstance?.addRoomLog(`${username}: ${message}`);
      },
    },
    queue: {
      name: 'queue',
      description: 'Add a YouTube video or playlist to the queue',
      usage: '@#00ffaaqueue@# @#fff700<video_url | playlist_url>@#',
      handler: async (_cmd, args) => {
        const URL = args[0] ?? '';
        if (!URL) {
          AddConsoleLog(t('listentogether.commands.queue.usage'));
          return;
        }
        if (!ReactPlayer.canPlay(URL)) {
          AddConsoleLog(t('listentogether.commands.queue.cannotPlay'));
          return;
        }
        if (URL.includes('playlist?list=')) {
          const tracks = await getPlaylist(URL.split('list=')[1], username).catch((error) => {
            AddConsoleLog(t('listentogether.errors.getPlaylist', error.message));
            return null;
          });
          if (!tracks) return;
          socketInstance?.addTracks(tracks);
          AddConsoleLog(t('listentogether.commands.queue.addedTracks', String(tracks.length), String(playerState.trackQueue.length), String(playerState.trackQueue.length + tracks.length - 1)));
          socketInstance?.addRoomLog(
            t('listentogether.logs.addedTracks', username, String(tracks.length), String(playerState.trackQueue.length), String(playerState.trackQueue.length + tracks.length - 1)),
          );
        } else if (URL.includes('watch?v=')) {
          const track = await getVideoInfo(URL.split('v=')[1], username).catch((error) => {
            AddConsoleLog(t('listentogether.errors.getVideoInfo', error.message));
            return null;
          });
          if (!track) return;
          socketInstance?.addTrack(track);
          AddConsoleLog(t('listentogether.commands.queue.addedTrack', track.title, String(playerState.trackQueue.length)));
          socketInstance?.addRoomLog(t('listentogether.logs.addedTrack', username, track.title, String(playerState.trackQueue.length)));
        } else {
          AddConsoleLog(t('listentogether.commands.queue.invalidUrl'));
        }
      },
    },
    remove: {
      name: 'remove',
      description: 'Remove a track from the queue by index (* = all)',
      usage: '@#00ffaaremove@# @#fff700<index | *>@#',
      handler: (_cmd, args) => {
        const indexToRm = args[0] ?? '';
        if (!indexToRm) {
          AddConsoleLog(t('listentogether.commands.remove.usage'));
          return;
        }
        if (indexToRm === '*') {
          socketInstance?.setTrackQueue([]);
          AddConsoleLog(t('listentogether.commands.remove.removedAll'));
          socketInstance?.addRoomLog(t('listentogether.logs.removedAll', username));
          triggerFlash();
          return;
        }
        if (isNaN(parseFloat(indexToRm))) {
          AddConsoleLog(t('listentogether.commands.remove.invalidIndex'));
          return;
        }
        if (parseInt(indexToRm) >= playerState.trackQueue.length) {
          AddConsoleLog(t('listentogether.commands.remove.indexOutOfRange'));
          return;
        }
        const trackToRm = playerState.trackQueue[parseInt(indexToRm)];
        socketInstance?.removeTrack(parseInt(indexToRm));
        AddConsoleLog(t('listentogether.commands.remove.removed', indexToRm));
        socketInstance?.addRoomLog(t('listentogether.logs.removedTrack', username, trackToRm.title, indexToRm));
      },
    },
    play: {
      name: 'play',
      description: 'Start or resume playback',
      usage: '@#00ffaaplay@#',
      handler: () => {
        socketInstance?.play();
        AddConsoleLog(t('listentogether.commands.play.start'));
        socketInstance?.addRoomLog(t('listentogether.logs.play', username));
        triggerFlash();
      },
    },
    pause: {
      name: 'pause',
      description: 'Pause playback',
      usage: '@#00ffaapause@#',
      handler: () => {
        socketInstance?.pause();
        AddConsoleLog(t('listentogether.commands.pause.pause'));
        socketInstance?.addRoomLog(t('listentogether.logs.pause', username));
        triggerFlash();
      },
    },
    switch: {
      name: 'switch',
      description: 'Switch to a track by index, or next / previous',
      usage: '@#00ffaaswitch@# @#fff700<index> | -n | -p@#',
      flags: ['-n', '--next', '-p', '--prev'],
      handler: (_cmd, args, flags) => {
        const index = args[0] ?? '';
        if (flags.includes('-n') || flags.includes('--next')) {
          socketInstance?.nextTrack();
          AddConsoleLog(t('listentogether.commands.switch.next'));
          socketInstance?.addRoomLog(t('listentogether.logs.switchNext', username));
          return;
        }
        if (flags.includes('-p') || flags.includes('--prev')) {
          socketInstance?.prevTrack();
          AddConsoleLog(t('listentogether.commands.switch.prev'));
          socketInstance?.addRoomLog(t('listentogether.logs.switchPrev', username));
          return;
        }
        if (!index) {
          AddConsoleLog(t('listentogether.commands.switch.usage'));
          return;
        }
        if (isNaN(parseFloat(index))) {
          AddConsoleLog(t('listentogether.commands.switch.invalidIndex'));
          return;
        }
        if (parseInt(index) >= playerState.trackQueue.length || parseInt(index) < 0) {
          AddConsoleLog(t('listentogether.commands.switch.indexOutOfRange'));
          return;
        }
        socketInstance?.setTrackIndex(parseInt(index));
        AddConsoleLog(t('listentogether.commands.switch.switchTo', index));
        socketInstance?.addRoomLog(t('listentogether.logs.switchTo', username, index));
      },
    },
    volume: {
      name: 'volume',
      description: 'Set the playback volume (0-100)',
      usage: '@#00ffaavolume@# @#fff700<0-100>@#',
      handler: (_cmd, args) => {
        const volume = args[0] ?? '';
        if (!volume) {
          AddConsoleLog(t('listentogether.commands.volume.usage'));
          return;
        }
        if (isNaN(parseFloat(volume))) {
          AddConsoleLog(t('listentogether.commands.volume.invalid'));
          return;
        }
        setPlayerStateClient((prev) => ({ ...prev, volume: parseFloat(volume) / 100 }));
        localStorage.setItem('volume', volume);
        AddConsoleLog(t('listentogether.commands.volume.set', volume));
      },
    },
    loop: {
      name: 'loop',
      description: 'Toggle loop mode for the current track',
      usage: '@#00ffaaloop@# @#fff700[-t | -f]@#',
      flags: ['-t', '--true', '-f', '--false'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-t') || flags.includes('--true')) {
          socketInstance?.setLoop(true);
          AddConsoleLog(t('listentogether.commands.loop.on'));
          socketInstance?.addRoomLog(t('listentogether.logs.loopOn', username));
          return;
        }
        if (flags.includes('-f') || flags.includes('--false')) {
          socketInstance?.setLoop(false);
          AddConsoleLog(t('listentogether.commands.loop.off'));
          socketInstance?.addRoomLog(t('listentogether.logs.loopOff', username));
          return;
        }
        AddConsoleLog(t('listentogether.commands.loop.usage'));
      },
    },
    random: {
      name: 'random',
      description: 'Toggle shuffle / random playback',
      usage: '@#00ffaarandom@# @#fff700[-t | -f]@#',
      flags: ['-t', '--true', '-f', '--false'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-t') || flags.includes('--true')) {
          socketInstance?.setPlayerState({ ...playerState, random: true });
          AddConsoleLog(t('listentogether.commands.random.on'));
          socketInstance?.addRoomLog(t('listentogether.logs.randomOn', username));
          return;
        }
        if (flags.includes('-f') || flags.includes('--false')) {
          socketInstance?.setPlayerState({ ...playerState, random: false });
          AddConsoleLog(t('listentogether.commands.random.off'));
          socketInstance?.addRoomLog(t('listentogether.logs.randomOff', username));
          return;
        }
        AddConsoleLog(t('listentogether.commands.random.usage'));
      },
    },
    rate: {
      name: 'rate',
      description: 'Set playback speed (e.g. 100 = normal)',
      usage: '@#00ffaarate@# @#fff700<percent>@#',
      handler: (_cmd, args) => {
        const rate = args[0] ?? '';
        if (!rate) {
          AddConsoleLog(t('listentogether.commands.rate.usage'));
          return;
        }
        if (isNaN(parseFloat(rate))) {
          AddConsoleLog(t('listentogether.commands.rate.invalid'));
          return;
        }
        socketInstance?.setPlayBackRate(parseFloat(rate) / 100);
        AddConsoleLog(t('listentogether.commands.rate.set', rate));
        socketInstance?.addRoomLog(t('listentogether.logs.rate', username, rate));
      },
    },
    seek: {
      name: 'seek',
      description: 'Jump to a specific time in seconds',
      usage: '@#00ffaaseek@# @#fff700<seconds>@#',
      handler: (_cmd, args) => {
        const seek = args[0] ?? '';
        if (!seek) {
          AddConsoleLog(t('listentogether.commands.seek.usage'));
          return;
        }
        if (isNaN(parseFloat(seek))) {
          AddConsoleLog(t('listentogether.commands.seek.invalid'));
          return;
        }
        if (parseFloat(seek) < 0 || parseFloat(seek) > playerState.duration) {
          AddConsoleLog(t('listentogether.commands.seek.outOfRange'));
          return;
        }
        socketInstance?.seek(parseFloat(seek));
        AddConsoleLog(t('listentogether.commands.seek.seekTo', seek));
        socketInstance?.addRoomLog(t('listentogether.logs.seek', username, seek));
      },
    },
    refresh: {
      name: 'refresh',
      description: 'Re-sync the player state from the server',
      usage: '@#00ffaarefresh@#',
      handler: () => {
        socketInstance?.refresh();
        AddConsoleLog(t('listentogether.commands.refresh.message'));
        socketInstance?.addRoomLog(t('listentogether.logs.refresh', username));
      },
    },
    playlist: {
      name: 'playlist',
      description: 'Show the current playlist',
      usage: '@#00ffaaplaylist@# @#fff700[-d | -l]@#',
      flags: ['-d', '--detail', '-l', '--list'],
      handler: (_cmd, _args, flags) => {
        if (flags.includes('-d') || flags.includes('--detail')) {
          AddConsoleLog(
            t('listentogether.commands.playlist.detail'),
            ...playerState.trackQueue.map((track, index) =>
              track.id === playerState.currentTrack?.id
                ? `@#fff700#${index} - ${track.title} by ${track.author} | Requested: ${track.requestBy}`
                : `#${index} - ${track.title} by ${track.author} | Requested: ${track.requestBy}`,
            ),
          );
          return;
        }
        AddConsoleLog(
          t('listentogether.commands.playlist.list'),
          ...playerState.trackQueue.map((track, index) => (track.id === playerState.currentTrack?.id ? `@#fff700#${index} - ${track.title}` : `#${index} - ${track.title}`)),
        );
      },
    },
    vibe: {
      name: 'vibe',
      description: 'Set the ambiance of the room',
      usage: '@#00ffaavibe@# @#fff700<vibe_name>@#',
      flags: VALID_VIBES,
      handler: (_cmd, args) => {
        const vibeName = args[0] as Types.VibeName;
        if (!vibeName || !VALID_VIBES.includes(vibeName)) {
          AddConsoleLog(t('listentogether.commands.vibe.invalid'));
          return;
        }
        socketInstance?.setVibe(vibeName);
        setVibe(vibeName);
        AddConsoleLog(t('listentogether.commands.vibe.set', vibeName));
        socketInstance?.addRoomLog(t('listentogether.logs.vibe', username, vibeName));
      },
    },
  });

  useEffect(() => {
    const onInteraction = () => {
      if (PlayerStateClientState.isReady) setMute(false);
    };
    document.addEventListener('click', onInteraction);
    document.addEventListener('touchstart', onInteraction);
    return () => {
      document.removeEventListener('click', onInteraction);
      document.removeEventListener('touchstart', onInteraction);
    };
  }, [PlayerStateClientState.isReady]);

  useEffect(() => {
    const socket = new ListenTogetherSocket();
    socket.connect({
      onConnect: async () => {
        socket.join(localStorage.getItem('username') ?? t('global.defaultUsername'));
        socket.ready();
      },
      onConnectError: () => AddConsoleLog(t('listentogether.errors.connectError', String(socket.id))),
      onError: (error) => AddConsoleLog(t('listentogether.errors.serverError', error.message)),
      onDisconnect: () => AddConsoleLog(t('listentogether.errors.disconnect')),
      onPlayerState: (state) => setPlayerState((prev) => ({ ...prev, ...state })),
      onLogs: (logs) => setLogs(logs),
      onUsers: (users) => setUsers(users),
      onProgress: (progress) => setPlayerState((prev) => ({ ...prev, playedSeconds: progress })),
      onSeek: (time) => {
        if (playerRef.current) playerRef.current.seekTo(time);
      },
      onVibe: (incoming) => setVibe(incoming),
    });
    setSocketInstance(socket);
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    socketInstance?.setUsername(username);
  }, [username]);

  useEffect(() => {
    const volume = parseFloat(localStorage.getItem('volume') ?? '50');
    setPlayerStateClient((prev) => ({ ...prev, volume: volume / 100 }));
  }, []);

  useEffect(() => {
    if (cachedPlayerState === null) {
      setCachedPlayerState(playerState);
      return;
    }
    const trackQueueDiff = IDiffArray(playerState.trackQueue, cachedPlayerState.trackQueue);
    const currentTrackDiff = IDiffObject(playerState.currentTrack, cachedPlayerState.currentTrack);
    setCachedPlayerState(playerState);
    if (trackQueueDiff || currentTrackDiff) {
      AddConsoleLog(
        t('listentogether.logs.playlistUpdated'),
        ...playerState.trackQueue.map((track, index) => (track.id === playerState.currentTrack?.id ? `@#fff700#${index} - ${track.title}` : `#${index} - ${track.title}`)),
      );
    }
  }, [playerState.trackQueue, playerState.currentTrack]);

  useEffect(() => {
    if (cachedLogs.length === 0) {
      setCachedLogs(logs);
      return;
    }
    const diff = logs.filter((log) => !cachedLogs.includes(log));
    setCachedLogs(logs);
    if (diff.length > 0) AddConsoleLog(...diff.map((log) => `[${new Date().toLocaleTimeString()}] ${log}`));
  }, [logs]);

  useEffect(() => {
    if (Object.keys(cachedUsers).length === 0) {
      setCachedUsers(users);
      return;
    }
    const diff = Object.entries(users).filter(([id]) => !Object.keys(cachedUsers).includes(id));
    setCachedUsers(users);
    if (diff.length > 0) AddConsoleLog(...diff.map(([, user]) => `[${new Date().toLocaleTimeString()}] ${t('listentogether.logs.joined', user)}`));
  }, [users]);

  const progressPercent = playerState.duration > 0 ? (playerState.playedSeconds / playerState.duration) * 100 : 0;

  const ambientSrc = playerState.currentTrack?.img ?? '';

  return (
    <div className={`${styles['content']} ${flash ? styles['flash'] : ''}`} data-vibe={vibe === 'default' ? undefined : vibe}>
      {/* Ambient background */}
      {ambientSrc && <div className={styles['ambient']} style={{ backgroundImage: `url(${ambientSrc})` }} />}

      {/* Room content */}
      <div className={styles['room']}>
        {/* Player area */}
        <div className={styles['player-area']} inert>
          {/* Unmute overlay */}
          <div className={`${styles['unmute-container']} ${!playerState.trackQueue.length || !mute ? styles['active'] : ''}`}>
            <p className="header2">{t('listentogether.unmute')}</p>
          </div>
          {playerState.trackQueue.length === 0 ? (
            <div className={styles['no-track-placeholder']}>queue a track to begin</div>
          ) : (
            <ReactPlayer
              ref={playerRef}
              url={playerState.currentTrack?.url ?? ''}
              playing={PlayerStateClientState.isReady && !PlayerStateClientState.seeking && playerState.playing}
              volume={PlayerStateClientState.volume}
              muted={mute}
              loop={playerState.loop}
              playbackRate={playerState.playbackRate}
              controls={false}
              onProgress={handlePlayerProgress}
              onDuration={handlePlayerDuration}
              onEnded={handlePlayerEnded}
              onError={handlePlayerError}
              onReady={handlePlayerReady}
              onSeek={handlePlayerSeek}
              userSelect="none"
              width="100%"
              height="100%"
            />
          )}
        </div>

        {/* Track info + progress */}
        {playerState.currentTrack && (
          <div className={styles['track-info']}>
            <div className={styles['track-title']}>{playerState.currentTrack.title}</div>
            <div className={styles['track-author']}>{playerState.currentTrack.author}</div>
            <div className={styles['progress-bar-track']}>
              <div className={styles['progress-bar-fill']} style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        )}

        {/* Members */}
        {Object.keys(users).length > 0 && (
          <div className={styles['members-row']}>
            <MemberDots users={users} />
          </div>
        )}
      </div>
    </div>
  );
}
