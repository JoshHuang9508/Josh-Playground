/* eslint-disable @next/next/no-img-element */

import { useRef, useState } from 'react';

import { youtubeThumbnail } from '@/lib/constants';

import useI18n from '@/lib/hooks/i18n';
import useMusic from '@/lib/hooks/Music';

import styles from './MusicCard.module.css';

const SWIPE_THRESHOLD = 48;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function MusicCard() {
  const { t } = useI18n();
  const { playlists, playlistIndex, track, playing, playedSeconds, duration, toggle, next, previous, seek, selectPlaylist } = useMusic();

  const viewportRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const hasPlaylist = Boolean(playlists[playlistIndex]?.id);
  const canSwipe = playlists.length > 1;
  const progressPercent = duration > 0 ? (playedSeconds / duration) * 100 : 0;

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    seek(ratio * duration);
  };

  // The transport controls and the seek bar own their own horizontal gestures,
  // so a swipe may only start outside them.
  const isSwipeArea = (target: HTMLElement) => !target.closest(`.${styles['controls']}`) && !target.closest(`.${styles['progress-track']}`);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canSwipe || !isSwipeArea(e.target as HTMLElement)) return;
    startXRef.current = e.clientX;
    setDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const width = viewportRef.current?.clientWidth ?? 0;
    const raw = e.clientX - startXRef.current;
    // Nothing lies beyond the first and last playlist, so pulling past either
    // end drags at a quarter speed rather than exposing empty space.
    const overscrolling = (playlistIndex === 0 && raw > 0) || (playlistIndex === playlists.length - 1 && raw < 0);
    const limited = overscrolling ? raw * 0.25 : raw;
    setDragOffset(width ? Math.max(Math.min(limited, width), -width) : limited);
  };

  const handlePointerEnd = () => {
    if (!dragging) return;
    setDragging(false);

    const travelled = dragOffset;
    setDragOffset(0);
    if (Math.abs(travelled) < SWIPE_THRESHOLD) return;

    const target = playlistIndex + (travelled < 0 ? 1 : -1);
    if (target < 0 || target >= playlists.length) return;
    selectPlaylist(target);
  };

  return (
    <div
      className={styles['card']}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onPointerLeave={handlePointerEnd}
    >
      {!hasPlaylist ? (
        <p className={styles['empty']}>{t('home.music.noPlaylist')}</p>
      ) : (
        <>
          <div ref={viewportRef} className={styles['viewport']}>
            <div className={`${styles['slides']} ${dragging ? styles['dragging'] : ''}`} style={{ transform: `translateX(calc(${-playlistIndex * 100}% + ${dragOffset}px))` }}>
              {playlists.map((playlist, index) => {
                const isCurrent = index === playlistIndex;
                // Only the playing playlist knows its live track; the others
                // stand in with their cover art and playlist name.
                const image = isCurrent && track ? track.thumbnail : youtubeThumbnail(playlist.coverVideoId);
                const title = isCurrent ? track?.title || t('home.music.loading') : playlist.name;
                const subtitle = isCurrent ? track?.author || '' : t('home.music.playlistHint');

                return (
                  <div key={playlist.id} className={styles['slide']}>
                    <img className={styles['thumbnail']} src={image} alt="" draggable={false} />
                    <span className={styles['track-title']}>{title}</span>
                    <span className={styles['track-author']}>{subtitle}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles['timeline']}>
            <span className={styles['time']}>{formatTime(playedSeconds)}</span>
            <div className={styles['progress-track']} onClick={handleSeek}>
              <div className={styles['progress-fill']} style={{ width: `${progressPercent}%` }} />
            </div>
            <span className={styles['time']}>{formatTime(duration)}</span>
          </div>

          <div className={styles['controls']}>
            <button type="button" className={styles['control']} onClick={previous} aria-label={t('home.music.previous')} title={t('home.music.previous')}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M6 5h2v14H6zm3 7 9-7v14z" />
              </svg>
            </button>
            <button
              type="button"
              className={`${styles['control']} ${styles['primary']}`}
              onClick={toggle}
              aria-label={playing ? t('home.music.pause') : t('home.music.play')}
              title={playing ? t('home.music.pause') : t('home.music.play')}
            >
              {playing ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M7 5h3.5v14H7zm6.5 0H17v14h-3.5z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M7 5l12 7-12 7z" />
                </svg>
              )}
            </button>
            <button type="button" className={styles['control']} onClick={next} aria-label={t('home.music.next')} title={t('home.music.next')}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M16 5h2v14h-2zM6 5l9 7-9 7z" />
              </svg>
            </button>
          </div>

          {canSwipe && (
            <div className={styles['playlist-dots']}>
              {playlists.map((playlist, index) => (
                <span key={playlist.id} className={`${styles['playlist-dot']} ${index === playlistIndex ? styles['active'] : ''}`} title={playlist.name} onClick={() => selectPlaylist(index)} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
