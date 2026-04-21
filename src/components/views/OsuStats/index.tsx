import React from 'react';
import DOMPurify from 'dompurify';

import type * as Types from '@/lib/types';

import { t } from '@/lib/i18n';

import useTerminalCommand from '@/lib/hooks/TerminalCommand';
import useOsuStats from '@/lib/hooks/OsuStats';

import { emitTerminalLog } from '@/lib/terminalLog';

import styles from './OsuStats.module.css';

const RANK_GRADIENT_ID = 'osu-rank-gradient';

function formatNumber(n: number | null): string {
  if (n === null) return '--';
  return n.toLocaleString();
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours.toLocaleString()}h`;
}

function formatLargeNumber(n: number): string {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return Math.round(n / 1_000) + 'K';
  return n.toLocaleString();
}

function formatHueStyleProperty(hue: number): string {
  return `hsl(${hue}, 100%, 60%)`;
}

function CardHeader({ color, title }: { color: string; title: string }) {
  return (
    <div className={styles['card-header']}>
      <div className={styles['card-header-bar']} style={{ background: color }} />
      <span className={styles['card-title']}>{title}</span>
    </div>
  );
}

function RankHistoryChart({ data, peakRank }: { data: number[]; peakRank: number | null }) {
  if (data.length < 2) return <div className={styles['chart-empty']}>No data</div>;

  const VW = 1000,
    VH = 80,
    PAD = 10;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const toX = (i: number) => PAD + (i / (data.length - 1)) * (VW - PAD * 2);
  const toY = (rank: number) => PAD + ((rank - min) / range) * (VH - PAD * 2);

  const linePoints = data.map((rank, i) => `${toX(i)},${toY(rank)}`).join(' ');
  const fillPoints = `${toX(0)},${VH} ${linePoints} ${toX(data.length - 1)},${VH}`;
  const lastX = toX(data.length - 1);
  const lastY = toY(data[data.length - 1]);
  const peakY = peakRank !== null ? toY(Math.max(min, Math.min(max, peakRank))) : null;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" width="100%" height="80">
      <defs>
        <linearGradient id={RANK_GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff77b7" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#ff77b7" stopOpacity="0" />
        </linearGradient>
      </defs>
      {peakY !== null && <line x1={PAD} y1={peakY} x2={VW - PAD} y2={peakY} stroke="#ff77b7" strokeWidth="1.5" strokeDasharray="8 5" opacity="0.4" />}
      <polygon points={fillPoints} fill={`url(#${RANK_GRADIENT_ID})`} />
      <polyline points={linePoints} fill="none" stroke="#ff77b7" strokeWidth="2" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r="5" fill="#ff77b7" />
    </svg>
  );
}

function MonthlyChart({ data }: { data: Types.OsuUser['monthlyPlaycounts'] }) {
  if (!data.length) return <div className={styles['chart-empty']}>No data</div>;

  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const VW = data.length * 12;
  const VH = 50;

  return (
    <svg viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="none" width="100%" height="50">
      {data.map((d, i) => {
        const h = Math.max(2, (d.count / maxCount) * (VH - 4));
        const opacity = 0.25 + 0.75 * (d.count / maxCount);
        return (
          <rect key={d.start_date} x={i * 12 + 1} y={VH - h} width={10} height={h} fill={`rgba(255,162,76,${opacity.toFixed(2)})`} rx="1.5">
            <title>
              {new Date(d.start_date).toLocaleDateString('en', { year: 'numeric', month: 'short' })}: {d.count.toLocaleString()}
            </title>
          </rect>
        );
      })}
    </svg>
  );
}

function HitDistChart({ counts }: { counts: Types.OsuUser['hitCounts'] }) {
  const total = counts.count300 + counts.count100 + counts.count50 + counts.countMiss;
  if (!total) return <div className={styles['chart-empty']}>No data</div>;

  const R = 18,
    CX = 0,
    CY = 30,
    STROKE = 9;
  const C = 2 * Math.PI * R;

  const segments = [
    { key: '300', count: counts.count300, color: '#00f3ff' },
    { key: '100', count: counts.count100, color: '#00ffaa' },
    { key: '50', count: counts.count50, color: '#fff700' },
    { key: 'Miss', count: counts.countMiss, color: '#ff4466' },
  ];

  let cumulativeOffset = 0;
  const arcs = segments.map((seg) => {
    const pct = seg.count / total;
    const dash = pct * C;
    const arc = { ...seg, pct, dash, offset: cumulativeOffset };
    cumulativeOffset += dash;
    return arc;
  });

  return (
    <svg viewBox="0 0 90 60" width="100%" height="60">
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={STROKE} />
      {arcs.map((arc) => (
        <circle
          key={arc.key}
          cx={CX}
          cy={CY}
          r={R}
          fill="none"
          stroke={arc.color}
          strokeWidth={STROKE}
          strokeDasharray={`${arc.dash} ${C - arc.dash}`}
          strokeDashoffset={-arc.offset}
          transform={`rotate(-90 ${CX} ${CY})`}
        />
      ))}
      {arcs.map((arc, i) => (
        <text key={arc.key} x={110} y={15 + i * 11} fill={arc.color} fontSize="0.85rem" textAnchor="end" dominantBaseline="middle">
          {arc.key} · {(arc.pct * 100).toFixed(1)}%
        </text>
      ))}
    </svg>
  );
}

function GradeChart({ grades }: { grades: Types.OsuUser['gradeCounts'] }) {
  const data = [
    { label: 'XH', count: grades.ssh, color: '#00f3ff' },
    { label: 'SS', count: Math.max(0, grades.ss - grades.ssh), color: '#fff700' },
    { label: 'SH', count: grades.sh, color: '#4dd2ff' },
    { label: 'S', count: Math.max(0, grades.s - grades.sh), color: '#ffa24c' },
    { label: 'A', count: grades.a, color: '#00ffaa' },
  ];
  const maxCount = Math.max(...data.map((d) => d.count), 1);
  const VH = 48;

  return (
    <svg viewBox="0 0 100 60" width="100%" height="60">
      {data.map((d, i) => {
        const barH = Math.max(2, (d.count / maxCount) * (VH - 10));
        const x = 3 + i * 19;
        return (
          <g key={d.label}>
            <rect x={x} y={VH - barH} width={15} height={barH} fill={d.color} rx="2" opacity="0.85" />
            <text x={x + 7.5} y={VH + 9} fill={d.color} fontSize="0.85rem" textAnchor="middle">
              {d.label}
            </text>
            <text x={x + 7.5} y={VH - barH - 3} fill={d.color} fontSize="0.75rem" textAnchor="middle">
              {d.count}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function OsuStatsView() {
  const { user, loading, error } = useOsuStats();

  useTerminalCommand({
    stats: {
      name: 'stats',
      description: t('osu.commands.stats.description'),
      usage: t('osu.commands.stats.usage'),
      handler: (_cmd, _args, _flags) => {
        if (!user) {
          emitTerminalLog(t('osu.commands.stats.notAvailable'));
          return;
        }
        emitTerminalLog(
          t('osu.commands.stats.header', user.username),
          t('osu.commands.stats.globalRank', formatNumber(user.globalRank)),
          t('osu.commands.stats.countryRank', formatNumber(user.countryRank)),
          t('osu.commands.stats.pp', formatNumber(user.pp)),
          t('osu.commands.stats.accuracy', user.accuracy.toFixed(2) + '%'),
          t('osu.commands.stats.playCount', formatNumber(user.playCount)),
          t('osu.commands.stats.playTime', formatPlayTime(user.playTime)),
        );
      },
    },
  });

  if (loading) {
    return (
      <div className={styles['osu-page']}>
        <p className={styles['loading-text']}>{t('osu.loading')}</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className={styles['osu-page']}>
        <div className={styles['unavailable']}>
          <p>{t('osu.unavailable.title')}</p>
          <p className={styles['unavailable-text']}>{t('osu.unavailable.desc')}</p>
        </div>
      </div>
    );
  }

  const statCells = [
    { label: t('osu.globalRank'), value: user.globalRank !== null ? `#${formatNumber(user.globalRank)}` : '--' },
    { label: t('osu.pp'), value: `${formatNumber(user.pp)}pp` },
    { label: t('osu.playCount'), value: formatNumber(user.playCount) },
    { label: t('osu.country'), value: user.countryRank !== null ? `#${formatNumber(user.countryRank)}` : '--' },
    { label: t('osu.accuracy'), value: `${user.accuracy.toFixed(2)}%` },
    { label: t('osu.playTime'), value: formatPlayTime(user.playTime) },
  ];

  const peakRankValue = user.peakRank?.rank ?? null;

  return (
    <div className={styles['osu-page']} style={{ '--profile-hue': user.profileHue } as React.CSSProperties}>
      <hr className="divider" />

      {/* Hero Card */}
      <div className={styles['hero-card']}>
        <img className={styles['osu-cover']} src={user.coverUrl} alt="" />
        <div className={styles['hero-left']}>
          <img className={styles['osu-avatar']} src={user.avatarUrl} alt={user.username} />
          <div className={styles['hero-identity']}>
            <span className={styles['osu-username']}>{user.username}</span>
            <span className={styles['osu-details']}>
              {user.countryCode} · {new Date(user.joinDate).getFullYear()} · Lv.{user.level}
            </span>
            <div className={styles['level-bar-wrap']}>
              <div className={styles['level-bar']}>
                <div className={styles['level-fill']} style={{ width: `${user.levelProgress}%` }} />
              </div>
              <span className={styles['level-pct']}>{user.levelProgress}%</span>
            </div>
          </div>
        </div>
        <div className={styles['stat-cells']}>
          {statCells.map(({ label, value }) => (
            <div key={label} className={styles['stat-cell']} style={{ '--cell-accent': formatHueStyleProperty(user.profileHue) } as React.CSSProperties}>
              <span className={styles['cell-label']}>{label}</span>
              <span className={styles['cell-value']} style={{ color: formatHueStyleProperty(user.profileHue) }}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Rank History */}
      <div className={styles['rank-card']}>
        <div className={styles['rank-card-top']}>
          <CardHeader color="#ff77b7" title={t('osu.rankHistory')} />
          {user.peakRank && (
            <span className={styles['peak-note']}>
              {`${t('osu.peakRank')} `}
              <span className={styles['peak-rank']}>#{formatNumber(user.peakRank.rank)}</span>
              {` · ${new Date(user.peakRank.updated_at).toLocaleDateString()}`}
            </span>
          )}
        </div>
        <div className={styles['rank-chart-wrap']}>
          <RankHistoryChart data={user.rankHistory} peakRank={peakRankValue} />
        </div>
      </div>

      {/* Three-column charts */}
      <div className={styles['charts-row']}>
        <div className={`${styles['chart-card']} ${styles['chart-card-2wide']}`}>
          <CardHeader color="#ffa24c" title={t('osu.monthlyActivity')} />
          <MonthlyChart data={user.monthlyPlaycounts} />
        </div>
        <div className={styles['chart-card']}>
          <CardHeader color="#00f3ff" title={t('osu.hitDistribution')} />
          <HitDistChart counts={user.hitCounts} />
        </div>
        <div className={styles['chart-card']}>
          <CardHeader color="#fff700" title={t('osu.gradeCounts')} />
          <GradeChart grades={user.gradeCounts} />
        </div>
      </div>

      {/* Pill row: Daily Challenge + Peak Stats */}
      <div className={styles['pill-row']}>
        <div className={styles['pill']}>
          <span className={styles['pill-value']} style={{ color: formatHueStyleProperty(user.profileHue) }}>
            {t('osu.day', user.dailyChallenge.currentStreak.toString())}
          </span>
          <span className={styles['pill-label']}>{t('osu.dailyStreak')}</span>
          <span className={styles['pill-sep']}>·</span>
          <span className={styles['pill-label']}>{t('osu.bestStreak')}</span>
          <span className={styles['pill-value']} style={{ color: formatHueStyleProperty(user.profileHue) }}>
            {t('osu.day', user.dailyChallenge.bestStreak.toString())}
          </span>
        </div>

        {user.peakRank && (
          <div className={styles['pill']}>
            <span className={styles['pill-label']}>{t('osu.peakRank')}</span>
            <span className={styles['pill-value']} style={{ color: formatHueStyleProperty(user.profileHue) }}>
              #{formatNumber(user.peakRank.rank)}
            </span>
          </div>
        )}

        <div className={styles['pill']}>
          <span className={styles['pill-label']}>{t('osu.maxCombo')}</span>
          <span className={styles['pill-value']} style={{ color: formatHueStyleProperty(user.profileHue) }}>
            {formatNumber(user.maximumCombo)}x
          </span>
        </div>

        <div className={styles['pill']}>
          <span className={styles['pill-label']}>{t('osu.totalHits')}</span>
          <span className={styles['pill-value']} style={{ color: formatHueStyleProperty(user.profileHue) }}>
            {formatLargeNumber(user.totalHits)}
          </span>
        </div>

        <div className={styles['pill']}>
          <span className={styles['pill-label']}>{t('osu.rankedScore')}</span>
          <span className={styles['pill-value']} style={{ color: formatHueStyleProperty(user.profileHue) }}>
            {formatLargeNumber(user.rankedScore)}
          </span>
        </div>
      </div>

      {/* Profile Page */}
      {user.pageHtml && (
        <div className={styles['profile-card']}>
          <CardHeader color="#fff700" title={t('osu.profilePage')} />
          <div
            className={`${styles['profile-page-content']} markdown-content`}
            dangerouslySetInnerHTML={{
              __html: typeof window !== 'undefined' ? DOMPurify.sanitize(user.pageHtml) : '',
            }}
          />
        </div>
      )}
    </div>
  );
}
