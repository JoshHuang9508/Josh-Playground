/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import ReactPlayer from 'react-player';

import type * as Types from '@/lib/types';

import { MUSIC_PLAYLISTS, MUSIC_VOLUME, youtubeThumbnail } from '@/lib/constants';

const LISTEN_TOGETHER_HASH = '#/listentogether';

type MusicContextValue = {
  playlists: Types.MusicPlaylist[];
  playlistIndex: number;
  track: Types.MusicTrack | null;
  playing: boolean;
  playedSeconds: number;
  duration: number;
  toggle: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  selectPlaylist: (index: number) => void;
};

const MusicContext = createContext<MusicContextValue | null>(null);

function playlistUrl(playlist: Types.MusicPlaylist | undefined): string {
  if (!playlist?.id || !playlist.coverVideoId) return '';
  return `https://www.youtube.com/watch?v=${playlist.coverVideoId}&list=${playlist.id}`;
}

export function MusicProvider({ children }: { children: ReactNode }) {
  const playerRef = useRef<ReactPlayer>(null);

  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [track, setTrack] = useState<Types.MusicTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [playedSeconds, setPlayedSeconds] = useState(0);
  const [duration, setDuration] = useState(0);
  // The ListenTogether room runs its own YouTube player; two audio sources at
  // once is never what anyone wants, so background music yields while there.
  const [suspended, setSuspended] = useState(() => window.location.hash === LISTEN_TOGETHER_HASH);

  const url = playlistUrl(MUSIC_PLAYLISTS[playlistIndex]);

  const internalPlayer = useCallback((): any => playerRef.current?.getInternalPlayer(), []);

  // ReactPlayer surfaces no "playlist advanced" event, so the current video is
  // read back off the YouTube player whenever progress ticks.
  const syncTrack = useCallback(() => {
    const player = internalPlayer();
    if (typeof player?.getVideoData !== 'function') return;

    const data = player.getVideoData();
    if (!data?.video_id) return;

    setTrack((prev) =>
      prev?.id === data.video_id
        ? prev
        : {
            id: data.video_id,
            title: data.title ?? '',
            author: data.author ?? '',
            thumbnail: youtubeThumbnail(data.video_id),
          },
    );
  }, [internalPlayer]);

  const handleReady = useCallback(() => {
    const player = internalPlayer();
    player?.setShuffle?.(true);
    player?.setLoop?.(true);
    syncTrack();
  }, [internalPlayer, syncTrack]);

  const toggle = useCallback(() => setPlaying((prev) => !prev), []);

  const next = useCallback(() => internalPlayer()?.nextVideo?.(), [internalPlayer]);

  const previous = useCallback(() => internalPlayer()?.previousVideo?.(), [internalPlayer]);

  const seek = useCallback((seconds: number) => {
    playerRef.current?.seekTo(seconds, 'seconds');
    setPlayedSeconds(seconds);
  }, []);

  const selectPlaylist = useCallback((index: number) => {
    setPlaylistIndex(index);
    setTrack(null);
    setPlayedSeconds(0);
    setDuration(0);
  }, []);

  // Browsers block audible autoplay until the visitor interacts, so the first
  // click or tap anywhere is what actually starts playback.
  useEffect(() => {
    const start = () => setPlaying(true);
    document.addEventListener('click', start, { once: true });
    document.addEventListener('touchstart', start, { once: true });
    return () => {
      document.removeEventListener('click', start);
      document.removeEventListener('touchstart', start);
    };
  }, []);

  useEffect(() => {
    const onHashChange = () => setSuspended(window.location.hash === LISTEN_TOGETHER_HASH);
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const value = useMemo(
    () => ({
      playlists: MUSIC_PLAYLISTS,
      playlistIndex,
      track,
      playing: playing && !suspended,
      playedSeconds,
      duration,
      toggle,
      next,
      previous,
      seek,
      selectPlaylist,
    }),
    [playlistIndex, track, playing, suspended, playedSeconds, duration, toggle, next, previous, seek, selectPlaylist],
  );

  return (
    <MusicContext.Provider value={value}>
      {children}
      <div style={{ position: 'fixed', width: 0, height: 0, overflow: 'hidden', pointerEvents: 'none' }} aria-hidden>
        {url && (
          <ReactPlayer
            ref={playerRef}
            url={url}
            playing={playing && !suspended}
            volume={MUSIC_VOLUME}
            controls={false}
            width="0"
            height="0"
            onReady={handleReady}
            onPlay={syncTrack}
            onDuration={setDuration}
            onProgress={(state) => {
              setPlayedSeconds(state.playedSeconds);
              syncTrack();
            }}
          />
        )}
      </div>
    </MusicContext.Provider>
  );
}

export default function useMusic(): MusicContextValue {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error('useMusic must be used within a MusicProvider');
  return ctx;
}
