import React from 'react';
import type { Track } from '@/lib/types';

interface QueuePanelProps {
  queue: Track[];
  currentTrackId: number | null;
}

const WARM_COLORS = [
  '#e8a87c', '#ff77b7', '#00ffaa', '#00f3ff',
  '#fff700', '#ffa24c', '#c9b1ff',
];

function nameColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return WARM_COLORS[Math.abs(hash) % WARM_COLORS.length];
}

export default function QueuePanel({ queue, currentTrackId }: QueuePanelProps) {
  if (queue.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      gap: '0.6rem',
      overflowX: 'auto',
      paddingBottom: '0.25rem',
    }}>
      {queue.map((track, index) => {
        const isCurrent = track.id === currentTrackId;
        const color = nameColor(track.requestBy);
        return (
          <div
            key={track.id}
            style={{
              position: 'relative',
              flexShrink: 0,
              width: '4.5rem',
              borderRadius: '0.4rem',
              overflow: 'hidden',
              outline: isCurrent ? `2px solid ${color}` : '2px solid transparent',
              boxShadow: isCurrent ? `0 0 10px ${color}60` : 'none',
              transition: 'outline 0.3s ease, box-shadow 0.3s ease',
              opacity: isCurrent ? 1 : 0.6,
            }}
          >
            <img
              src={track.img}
              alt={track.title}
              style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }}
            />
            <div style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              padding: '0.15rem 0.25rem',
              background: 'linear-gradient(transparent, #00000099)',
              fontSize: '0.55rem',
              fontFamily: 'Consolas, monospace',
              color: color,
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}>
              {index}
            </div>
          </div>
        );
      })}
    </div>
  );
}
