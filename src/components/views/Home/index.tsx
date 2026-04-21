/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from 'react';

import { emitTerminalLog } from '@/lib/terminalLog';

import { SOCIAL_LINKS, PROJECTS } from '@/lib/constants';

import useI18n from '@/lib/hooks/i18n';
import useTerminalCommand from '@/lib/hooks/TerminalCommand';
import useOsuStats from '@/lib/hooks/OsuStats';
import useBlogPosts from '@/lib/hooks/BlogPosts';

import ColorSpan from '@/components/ColorSpan';

import styles from './Home.module.css';

function formatNumber(n: number | null): string {
  if (n === null) return '--';
  return n.toLocaleString();
}

function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  return `${hours.toLocaleString()}h`;
}

function formatHueStyleProperty(hue: number): string {
  return `hsl(${hue}, 100%, 60%)`;
}

export default function HomeView() {
  const { user: osuData } = useOsuStats();
  const { posts: blogPosts } = useBlogPosts();
  const { t } = useI18n();

  const imageRef = useRef<HTMLImageElement>(null);

  const [activeProjectIndex, setActiveProjectIndex] = useState(0);
  const [profileFlipped, setProfileFlipped] = useState(false);
  const [isFlipping, setIsFlipping] = useState(false);

  const statCells = [
    { label: t('home.osu.rank'), value: osuData?.globalRank !== null ? `#${formatNumber(osuData?.globalRank ?? 0)}` : '--' },
    { label: t('home.osu.pp'), value: `${formatNumber(osuData?.pp ?? 0)}pp` },
    { label: t('home.osu.playCount'), value: formatNumber(osuData?.playCount ?? 0) },
    { label: t('home.osu.country'), value: osuData?.countryRank !== null ? `#${formatNumber(osuData?.countryRank ?? 0)}` : '--' },
    { label: t('home.osu.accuracy'), value: `${osuData?.accuracy.toFixed(2) ?? '0.00'}%` },
    { label: t('home.osu.playTime'), value: formatPlayTime(osuData?.playTime ?? 0) },
  ];

  const handleProfileClick = () => {
    if (isFlipping) return;
    setIsFlipping(true);
    setProfileFlipped((prev) => !prev);
    setTimeout(() => setIsFlipping(false), 600);
  };

  const latestPost = blogPosts[0] ?? null;

  useTerminalCommand({
    open: {
      name: 'open',
      description: t('home.commands.open.description'),
      usage: t('home.commands.open.usage'),
      args: ['github', 'youtube', 'twitter', 'instagram', 'twitch', 'discord', 'email', 'osu'],
      handler: (_cmd, args) => {
        const pages = args;
        if (!pages.length) {
          emitTerminalLog(t('home.commands.open.usage'));
          return;
        }
        pages.forEach((page) => {
          switch (page) {
            case 'github':
              window.open('https://github.com/JoshHuang9508', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'GitHub'));
              break;
            case 'youtube':
              window.open('https://www.youtube.com/@whydog5555', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'YouTube'));
              break;
            case 'twitter':
              window.open('https://x.com/whydog5555', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'Twitter'));
              break;
            case 'instagram':
              window.open('https://www.instagram.com/whydog5555/', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'Instagram'));
              break;
            case 'twitch':
              window.open('https://www.twitch.tv/whydog5555', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'Twitch'));
              break;
            case 'discord':
              window.open('https://discord.com/users/whydog5555', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'Discord'));
              break;
            case 'email':
              window.open('mailto:joshhuang9508@gmail.com', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'Email'));
              break;
            case 'osu':
              window.open('https://osu.ppy.sh/users/15100005', '_blank');
              emitTerminalLog(t('home.commands.open.opening', 'osu!'));
              break;
            default:
              emitTerminalLog(t('home.commands.open.notFound', page));
              break;
          }
        });
      },
    },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveProjectIndex((prev) => (prev + 1) % PROJECTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles['home-page']}>
      <div className={styles['section']}>
        {/* Hero card */}
        <div className={`${styles['hero-card-wrapper']} ${profileFlipped ? styles['flipped'] : ''}`} onClick={handleProfileClick}>
          <div className={styles['hero-card']}>
            <div className={styles['avatar-wrapper']}>
              <img ref={imageRef} className={styles['avatar']} src="/assets/pfp_rl.png" alt="Profile" />
            </div>
            <div className={styles['hero-identity']}>
              <div className={styles['hero-name-container']}>
                <span className={styles['hero-name']}>{t('home.hero.name')}</span>
                <div className={styles['hero-title-container']}>
                  <span className={styles['hero-age']}>{t('home.hero.age')}</span>
                  <span className={styles['hero-school']}>{t('home.hero.school')}</span>
                </div>
              </div>
              <span className={styles['hero-motto']}>{t('home.hero.motto')}</span>
            </div>
            <div className={styles['hero-social-row']}>
              {SOCIAL_LINKS.map((social) => (
                <img key={social.icon} className={styles['social-icon']} src={`/assets/${social.icon}.png`} alt={social.icon} title={social.icon} onClick={() => window.open(social.url, '_blank')} />
              ))}
            </div>
          </div>

          {/* Reverse hero card */}
          <div className={styles['hero-card-back']}>
            <div className={styles['avatar-wrapper']}>
              <img ref={imageRef} className={styles['avatar']} src="/assets/pfp.png" alt="Profile" />
            </div>
            <div className={styles['hero-identity']}>
              <div className={styles['hero-name-container']}>
                <span className={styles['hero-name']}>{t('home.heroReverse.name')}</span>
                <div className={styles['hero-title-container']}>
                  <span className={styles['hero-age']}>{t('home.heroReverse.age')}</span>
                  <span className={styles['hero-school']}>{t('home.heroReverse.school')}</span>
                </div>
              </div>
              <span className={styles['hero-motto']}>{t('home.hero.motto')}</span>
            </div>
            <div className={styles['hero-social-row']}>
              {SOCIAL_LINKS.map((social) => (
                <img key={social.icon} className={styles['social-icon']} src={`/assets/${social.icon}.png`} alt={social.icon} title={social.icon} onClick={() => window.open(social.url, '_blank')} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles['section']}>
        <span className={styles['section-label']}>{t('home.sections.aboutMe')}</span>

        <div className={`${styles['hero-bio']} markdown-content`}>
          {t('home.bio').map((bio) => (
            <ColorSpan key={bio} str={bio} />
          ))}
        </div>
      </div>

      <hr className="divider" />

      <div className={styles['section']}>
        <span className={styles['section-label']}>{t('home.sections.information')}</span>

        <div className={styles['bento']}>
          {/* Left column */}
          <div className={styles['column']}>
            {/* Latest post preview */}
            <div className={styles['card']} onClick={() => (window.location.hash = latestPost ? `#/blog/${latestPost.slug}` : '#/blog')}>
              <div className={styles['card-header']}>
                <ColorSpan className={styles['card-label']} str={t('home.sections.latestPost')} />
                <a className={styles['view-all-link']} href="#/blog" onClick={(e) => e.stopPropagation()}>
                  {t('home.latestPost.allPosts')}
                </a>
              </div>
              {latestPost ? (
                <>
                  <span className={styles['post-date']}>{latestPost.date}</span>
                  <span className={styles['post-title']}>{latestPost.title}</span>
                  <p className={styles['post-excerpt']}>{latestPost.excerpt}</p>
                </>
              ) : (
                <>
                  <span className={styles['post-title']}>{t('home.latestPost.comingSoon')}</span>
                  <p className={styles['post-excerpt']}>{t('home.latestPost.stayTuned')}</p>
                </>
              )}
            </div>

            {/* Projects preview */}
            <div className={styles['card']} onClick={() => (window.location.hash = `#/projects`)}>
              <div className={styles['card-header']}>
                <ColorSpan className={styles['card-label']} str={t('home.sections.projects')} />
                <a className={styles['view-all-link']} href="#/projects" onClick={(e) => e.stopPropagation()}>
                  {t('home.projects.viewAll')}
                </a>
              </div>
              <div className={styles['project-carousel']}>
                {PROJECTS.map((project, i) => (
                  <div
                    key={project.slug}
                    className={`${styles['project']} ${i === activeProjectIndex ? styles['active'] : ''}`}
                    style={{ position: i === 0 ? 'relative' : 'absolute', top: 0, left: 0, width: '100%' }}
                  >
                    <div className={styles['project-img']} style={{ borderColor: project.accent }}>
                      {project.images[0] ? <img src={project.images[0]} alt={project.name} /> : <span className={styles['no-image']}>{t('home.projects.noImage')}</span>}
                    </div>
                    <div className={styles['project-info']}>
                      <span className={styles['project-name']}>{project.name}</span>
                      <span className={styles['project-tags']}>{project.tags.join(' · ')}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className={styles['carousel-dots']}>
                {PROJECTS.map((project, i) => (
                  <span
                    key={project.slug}
                    className={`${styles['carousel-dot']} ${i === activeProjectIndex ? styles['active'] : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveProjectIndex(i);
                    }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className={styles['column']}>
            {/* osu! stats preview */}
            <div className={styles['card']}>
              <div className={styles['card-header']}>
                <ColorSpan className={styles['card-label']} str={t('home.sections.osuStats')} />
              </div>
              <img className={styles['osu-cover']} src={osuData?.coverUrl} alt="" />
              <div className={styles['osu-card']}>
                <div className={styles['hero-left']}>
                  <img className={styles['osu-avatar']} src={osuData?.avatarUrl} alt={osuData?.username} />
                  <div className={styles['hero-identity']}>
                    <span className={styles['osu-username']}>{osuData?.username ?? 'Unknown'}</span>
                    <span className={styles['osu-details']}>{`${osuData?.countryCode ?? 'N/A'} · ${new Date(osuData?.joinDate ?? new Date()).getFullYear()} · Lv.${osuData?.level ?? 0}`}</span>
                    <div className={styles['level-bar-wrap']}>
                      <div className={styles['level-bar']}>
                        <div className={styles['level-fill']} style={{ width: `${osuData?.levelProgress ?? 0}%` }} />
                      </div>
                      <span className={styles['level-pct']}>{`${osuData?.levelProgress ?? 0}%`}</span>
                    </div>
                  </div>
                </div>
                <div className={styles['stat-cells']}>
                  {statCells.map(({ label, value }) => (
                    <div key={label} className={styles['stat-cell']} style={{ '--cell-accent': formatHueStyleProperty(osuData?.profileHue ?? 0) } as React.CSSProperties}>
                      <span className={styles['cell-label']}>{label}</span>
                      <span className={styles['cell-value']} style={{ color: formatHueStyleProperty(osuData?.profileHue ?? 0) }}>
                        {value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Feature showcase & terminal tutorial */}
      <div className={styles['section']}>
        <span className={styles['section-label']}>{t('home.sections.aboutSite')}</span>
        <div className={styles['feature-card']}>
          <p className={styles['feature-title']}>
            <ColorSpan str={t('home.features.terminal.title')} />
          </p>
          <p className={styles['feature-desc']}>
            <ColorSpan str={t('home.features.terminal.desc')} />
          </p>
          <div className={styles['shortcut-list']}>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('home.features.terminal.ctrl')}</span>+<span className={styles['shortcut-key']}>{t('home.features.terminal.backtick')}</span>{' '}
              {t('home.features.terminal.toggleTerminal')}
            </span>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('home.features.terminal.esc')}</span> {t('home.features.terminal.minimize')}
            </span>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('home.features.terminal.tab')}</span> {t('home.features.terminal.autocomplete')}
            </span>
          </div>
        </div>
        <div className={styles['feature-card']}>
          <p className={styles['feature-title']}>
            <ColorSpan str={t('home.features.commands.title')} />
          </p>
          <p className={styles['feature-desc']}>
            <ColorSpan str={t('home.features.commands.desc')} />
          </p>
        </div>
      </div>

      <hr className="divider" />

      <p className={styles['footer']}>{t('home.footer')}</p>
    </div>
  );
}
