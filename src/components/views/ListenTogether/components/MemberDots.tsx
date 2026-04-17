import React from 'react';
import type { User } from '@/lib/types';

interface MemberDotsProps {
  users: User;
}

const WARM_COLORS = [
  '#e8a87c', // caramel
  '#ff77b7', // pink
  '#00ffaa', // mint
  '#00f3ff', // cyan
  '#fff700', // yellow
  '#ffa24c', // orange
  '#c9b1ff', // lavender
];

function userColor(id: string): string {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return WARM_COLORS[Math.abs(hash) % WARM_COLORS.length];
}

export default function MemberDots({ users }: MemberDotsProps) {
  const entries = Object.entries(users);
  if (entries.length === 0) return null;

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.75rem',
      alignItems: 'center',
    }}>
      {entries.map(([id, name]) => {
        const color = userColor(id);
        return (
          <div key={id} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            animation: 'member-appear 0.4s ease forwards',
          }}>
            <span style={{
              display: 'inline-block',
              width: '0.55rem',
              height: '0.55rem',
              borderRadius: '50%',
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
            }} />
            <span style={{
              fontFamily: 'Consolas, monospace',
              fontSize: '0.8rem',
              color: `${color}cc`,
            }}>{name}</span>
          </div>
        );
      })}
    </div>
  );
}
