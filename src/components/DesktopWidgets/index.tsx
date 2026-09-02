/* eslint-disable @next/next/no-img-element */

import { useContext, useEffect, useState } from 'react';

import { AppContext } from '@/pages/index';
import { PROJECTS, SOCIAL_LINKS } from '@/lib/constants';
import { escapeCustomColorTags } from '@/lib/color';
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
  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const latestPost = posts[0] ?? null;
  const featuredProject = PROJECTS[activeProjectIndex];

  useEffect(() => {
    const interval = window.setInterval(() => setActiveProjectIndex((index) => (index + 1) % PROJECTS.length), 4000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <aside className={styles['widgets']} aria-label="Desktop widgets">
      <div className={`${styles['widget']} ${styles['social-widget']} ${styles['size-2x1']}`}>
        {SOCIAL_LINKS.map((social) => (
          <button key={social.icon} type="button" className={styles['social-link']} title={social.icon} aria-label={`Open ${social.icon}`} onClick={() => window.open(social.url, '_blank')}>
            <img src={`/assets/${social.icon}.png`} alt="" />
          </button>
        ))}
      </div>

      <button type="button" className={`${styles['widget']} ${styles['content-widget']} ${styles['size-2x1']}`} onClick={() => { setSelectedBlogSlug(latestPost?.slug ?? null); setIsBlogOpen(true); }}>
        <span className={styles['label']}>{escapeCustomColorTags(t('home.sections.latestPost'))}</span>
        <strong>{latestPost?.title ?? t('home.latestPost.comingSoon')}</strong>
        <span className={styles['description']}>{latestPost?.excerpt ?? t('home.latestPost.stayTuned')}</span>
      </button>

      <button type="button" className={`${styles['widget']} ${styles['project-widget']} ${styles['size-2x2']}`} onClick={() => setIsProjectsOpen(true)}>
        <span className={styles['label']}>{escapeCustomColorTags(t('home.sections.projects'))}</span>
        {featuredProject?.images[0] && <img key={featuredProject.slug} src={featuredProject.images[0]} alt="" />}
        <strong>{featuredProject?.name}</strong>
        <span className={styles['description']}>{featuredProject?.tags.join(' · ')}</span>
        <span className={styles['project-dots']}>
          {PROJECTS.map((project, index) => (
            <span
              key={project.slug}
              className={`${styles['project-dot']} ${index === activeProjectIndex ? styles['active'] : ''}`}
              onClick={(event) => {
                event.stopPropagation();
                setActiveProjectIndex(index);
              }}
            />
          ))}
        </span>
      </button>

      <a className={`${styles['widget']} ${styles['osu-widget']} ${styles['size-2x1']}`} href="https://osu.ppy.sh/users/15100005" target="_blank" rel="noreferrer">
        <img className={styles['osu-icon']} src="/assets/osu.png" alt="osu!" />
        <div className={styles['osu-profile']}>
          <img className={styles['osu-avatar']} src={user?.avatarUrl} alt="" />
          <strong>{user?.username ?? '—'}</strong>
        </div>
        <div className={styles['osu-ranks']}>
          <div>
            <span>{t('home.osu.rank')}</span>
            <strong>#{formatNumber(user?.globalRank)}</strong>
          </div>
          <div>
            <span>{t('home.osu.country')}</span>
            <strong>#{formatNumber(user?.countryRank)}</strong>
          </div>
        </div>
      </a>

      <div className={`${styles['music-widget']} ${styles['size-2x2']}`}><MusicCard /></div>
    </aside>
  );
}
