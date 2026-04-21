import type { User } from '@/lib/types';

import styles from './ListenTogether.module.css';

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

interface MemberDotsProps {
  users: User;
}

export default function MemberDots({ users }: MemberDotsProps) {
  const entries = Object.entries(users);
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map(([id, name]) => {
        const color = userColor(id);
        return (
          <div key={id} className={styles['member-dot']}>
            <span className={styles['member-dot-color']} style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}` }} />
            <span className={styles['member-dot-name']} style={{ color: color }}>
              {name}
            </span>
          </div>
        );
      })}
    </>
  );
}
