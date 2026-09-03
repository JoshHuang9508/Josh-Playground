/* eslint-disable @next/next/no-img-element */

import { useContext, useEffect, useState } from 'react';

import { AppContext } from '@/pages/index';
import { PROJECTS } from '@/lib/constants';
import { escapeCustomColorTags } from '@/lib/color';
import useBlogPosts from '@/lib/hooks/BlogPosts';
import useI18n from '@/lib/hooks/i18n';
import useOsuStats from '@/lib/hooks/OsuStats';
import { useDiscordWidget, useGitHubWidget, useYouTubeWidget } from '@/lib/hooks/SocialWidgets';

import MusicCard from '@/components/MusicCard';

import styles from './DesktopWidgets.module.css';

function formatNumber(value: number | null | undefined): string {
  return value == null ? '--' : value.toLocaleString();
}

function formatDate(value: string | undefined): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(new Date(value));
}

export default function DesktopWidgets() {
  const { setIsBlogOpen, setIsProjectsOpen, setSelectedBlogSlug } = useContext(AppContext)!;
  const { posts } = useBlogPosts();
  const { user } = useOsuStats();
  const github = useGitHubWidget();
  const youtube = useYouTubeWidget();
  const discord = useDiscordWidget();
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
      <a className={`${styles['widget']} ${styles['github-widget']} ${styles['size-2x2']}`} href="https://github.com/JoshHuang9508" target="_blank" rel="noreferrer">
        <div className={styles['social-header']}>
          <img className={styles['social-avatar']} src={github?.avatarUrl ?? '/assets/pfp.png'} alt="" />
          <div className={styles['social-identity']}>
            <strong>Josh</strong>
            <span>@JoshHuang9508</span>
          </div>
          <img className={styles['platform-icon']} src="/assets/github.png" alt="GitHub" />
        </div>
        <p className={styles['social-bio']}>{github?.bio ?? 'Josh@NTUST-CSIE, Taiwan'}</p>
        <div className={styles['social-stats']}>
          <div>
            <strong>{formatNumber(github?.publicRepos)}</strong>
            <span>Repositories</span>
          </div>
          <div>
            <strong>{formatNumber(github?.followers)}</strong>
            <span>Followers</span>
          </div>
        </div>
        <div className={styles['latest-activity']}>
          <span>Latest activity</span>
          <strong>{github?.latestActivity?.repo ?? 'Loading activity…'}</strong>
          {github?.latestActivity && (
            <small>
              {github.latestActivity.type} · {formatDate(github.latestActivity.createdAt)}
            </small>
          )}
        </div>
      </a>

      <a className={`${styles['widget']} ${styles['youtube-widget']} ${styles['size-2x2']}`} href={youtube?.latestVideo?.url ?? 'https://www.youtube.com/@whydog5555'} target="_blank" rel="noreferrer">
        {youtube?.latestVideo?.thumbnail && <img className={styles['video-thumbnail']} src={youtube.latestVideo.thumbnail} alt="" />}
        <div className={styles['video-gradient']} />
        <div className={styles['social-header']}>
          <img className={styles['social-avatar']} src={youtube?.channelAvatar ?? '/assets/youtube.png'} alt="" />
          <div className={styles['social-identity']}>
            <strong>{youtube?.channelName ?? 'Whydog'}</strong>
            <span>@whydog5555</span>
          </div>
          <img className={styles['platform-icon']} src="/assets/youtube.png" alt="YouTube" />
        </div>
        <div className={styles['video-info']}>
          <span>Latest video</span>
          <strong>{youtube?.latestVideo?.title ?? 'Loading latest video…'}</strong>
          {youtube?.latestVideo && (
            <small>
              {formatNumber(youtube.latestVideo.views)} views · {formatDate(youtube.latestVideo.publishedAt)}
            </small>
          )}
        </div>
      </a>

      <a
        className={`${styles['widget']} ${styles['profile-widget']} ${styles['compact-profile-widget']} ${styles['twitter-widget']} ${styles['size-1x1']}`}
        href="https://x.com/whydog5555"
        target="_blank"
        rel="noreferrer"
      >
        <img className={styles['social-avatar']} src="https://pbs.twimg.com/profile_images/1941466908206743552/EvKYWbtM_200x200.jpg" alt="" />
        <div className={styles['social-identity']}>
          <strong>Whydog</strong>
          <span>@whydog5555</span>
          <small>R18 retweet only #loli</small>
        </div>
        <img className={styles['platform-icon']} src="/assets/twitter.png" alt="X" />
      </a>

      <a
        className={`${styles['widget']} ${styles['profile-widget']} ${styles['compact-profile-widget']} ${styles['instagram-widget']} ${styles['size-1x1']}`}
        href="https://www.instagram.com/whydog5555/"
        target="_blank"
        rel="noreferrer"
      >
        <span className={`${styles['platform-avatar']} ${styles['instagram-avatar']}`}>
          <img src="/assets/instagram.png" alt="" />
        </span>
        <div className={styles['social-identity']}>
          <strong>Whydog</strong>
          <span>@whydog5555</span>
          <small>View profile on Instagram</small>
        </div>
        <img className={styles['platform-icon']} src="/assets/instagram.png" alt="Instagram" />
      </a>

      <a
        className={`${styles['widget']} ${styles['profile-widget']} ${styles['compact-profile-widget']} ${styles['twitch-widget']} ${styles['size-1x1']}`}
        href="https://www.twitch.tv/whydog5555"
        target="_blank"
        rel="noreferrer"
      >
        <span className={`${styles['platform-avatar']} ${styles['twitch-avatar']}`}>
          <img src="/assets/twitch.png" alt="" />
        </span>
        <div className={styles['social-identity']}>
          <strong>Whydog</strong>
          <span>twitch.tv/whydog5555</span>
          <small>Visit Twitch channel</small>
        </div>
        <img className={styles['platform-icon']} src="/assets/twitch.png" alt="Twitch" />
      </a>

      <a className={`${styles['widget']} ${styles['discord-widget']} ${styles['size-2x1']}`} href={`https://discord.com/users/614396443016560649`} target="_blank" rel="noreferrer">
        <div className={styles['discord-profile']}>
          <span className={styles['avatar-wrap']}>
            <img className={styles['social-avatar']} src={discord?.avatarUrl ?? '/assets/discord.png'} alt="" />
            <i className={`${styles['status-dot']} ${styles[`status-${discord?.status ?? 'offline'}`]}`} />
          </span>
          <div className={styles['social-identity']}>
            <strong>{discord?.displayName ?? 'Whydog'}</strong>
            <span>@{discord?.username ?? 'whydog'}</span>
          </div>
        </div>
        <div className={styles['discord-activity']}>
          {discord?.activity?.imageUrl && <img src={discord.activity.imageUrl} alt="" />}
          <div>
            <span>{discord?.activity ? 'Playing now' : (discord?.status ?? 'Offline')}</span>
            <strong>{discord?.activity?.name ?? discord?.customStatus ?? 'No current activity'}</strong>
            {discord?.activity && <small>{discord.activity.details ?? discord.activity.state}</small>}
          </div>
        </div>
        <img className={styles['platform-icon']} src="/assets/discord.png" alt="Discord" />
      </a>

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

      <div className={`${styles['music-widget']} ${styles['size-2x2']}`}>
        <MusicCard />
      </div>

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

      <button
        type="button"
        className={`${styles['widget']} ${styles['content-widget']} ${styles['size-2x1']}`}
        onClick={() => {
          setSelectedBlogSlug(latestPost?.slug ?? null);
          setIsBlogOpen(true);
        }}
      >
        <span className={styles['label']}>{escapeCustomColorTags(t('home.sections.latestPost'))}</span>
        <strong>{latestPost?.title ?? t('home.latestPost.comingSoon')}</strong>
        <span className={styles['description']}>{latestPost?.excerpt ?? t('home.latestPost.stayTuned')}</span>
      </button>
    </aside>
  );
}
