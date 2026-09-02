/* eslint-disable @next/next/no-img-element */

import { useContext } from 'react';

import { AppContext } from '@/pages/index';
import { PROJECTS, SOCIAL_LINKS } from '@/lib/constants';
import useBlogPosts from '@/lib/hooks/BlogPosts';
import useI18n from '@/lib/hooks/i18n';
import useOsuStats from '@/lib/hooks/OsuStats';

import MusicCard from '@/components/MusicCard';

import styles from './DesktopWidgets.module.css';

function formatNumber(value: number | null | undefined): string {
  return value == null ? '--' : value.toLocaleString();
}

export default function DesktopWidgets() {
  const { setIsBlogOpen, setIsProjectsOpen, setSelectedBlogSlug } = useContext(AppContext)!;
  const { posts } = useBlogPosts();
  const { user } = useOsuStats();
  const { t } = useI18n();
  const latestPost = posts[0] ?? null;
  const featuredProject = PROJECTS[0];

  return (
    <aside className={styles['widgets']} aria-label="Desktop widgets">
      <div className={`${styles['widget']} ${styles['social-widget']}`}>
        {SOCIAL_LINKS.map((social) => (
          <button key={social.icon} type="button" className={styles['social-link']} title={social.icon} aria-label={`Open ${social.icon}`} onClick={() => window.open(social.url, '_blank')}>
            <img src={`/assets/${social.icon}.png`} alt="" />
          </button>
        ))}
      </div>

      <button type="button" className={`${styles['widget']} ${styles['content-widget']}`} onClick={() => { setSelectedBlogSlug(latestPost?.slug ?? null); setIsBlogOpen(true); }}>
        <span className={styles['label']}>{t('home.sections.latestPost')}</span>
        <strong>{latestPost?.title ?? t('home.latestPost.comingSoon')}</strong>
        <span className={styles['description']}>{latestPost?.excerpt ?? t('home.latestPost.stayTuned')}</span>
      </button>

      <button type="button" className={`${styles['widget']} ${styles['project-widget']}`} onClick={() => setIsProjectsOpen(true)}>
        <span className={styles['label']}>{t('home.sections.projects')}</span>
        {featuredProject?.images[0] && <img src={featuredProject.images[0]} alt="" />}
        <strong>{featuredProject?.name}</strong>
        <span className={styles['description']}>{featuredProject?.tags.join(' · ')}</span>
      </button>

      <a className={`${styles['widget']} ${styles['osu-widget']}`} href="https://osu.ppy.sh/users/15100005" target="_blank" rel="noreferrer">
        <img src={user?.avatarUrl} alt="" />
        <div>
          <span className={styles['label']}>{t('home.sections.osuStats')}</span>
          <strong>{user?.username ?? '—'}</strong>
          <span className={styles['description']}>#{formatNumber(user?.globalRank)} · {formatNumber(user?.pp)}pp</span>
        </div>
      </a>

      <div className={styles['music-widget']}><MusicCard /></div>
    </aside>
  );
}
