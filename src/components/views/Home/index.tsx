import React, { useEffect, useRef, useState } from 'react';

import { AddConsoleLog } from '@/redux';

import { t } from '@/lib/i18n';

import { SOCIAL_LINKS, PROJECTS } from '@/lib/constants';

import useCommandHandler from '@/lib/hooks/CommandHandler';
import useOsuStats from '@/lib/hooks/OsuStats';
import useBlogPosts from '@/lib/hooks/BlogPosts';

import ColorSpan from '@/components/ColorSpan';

import styles from './Home.module.css';

export default function HomeView() {
  const imageRef = useRef<HTMLImageElement>(null);

  const [activeProjectIndex, setActiveProjectIndex] = useState(0);

  const { user: osuUser } = useOsuStats();
  const { posts: blogPosts } = useBlogPosts();

  const latestPost = blogPosts[0] ?? null;

  useCommandHandler({
    github: () => {
      window.open('https://github.com/JoshHuang9508', '_blank');
      AddConsoleLog(t('home.commands.github'));
    },
    youtube: () => {
      window.open('https://www.youtube.com/@whydog5555', '_blank');
      AddConsoleLog(t('home.commands.youtube'));
    },
    twitter: () => {
      window.open('https://x.com/whydog5555', '_blank');
      AddConsoleLog(t('home.commands.twitter'));
    },
    instagram: () => {
      window.open('https://www.instagram.com/whydog5555/', '_blank');
      AddConsoleLog(t('home.commands.instagram'));
    },
    twitch: () => {
      window.open('https://www.twitch.tv/whydog5555', '_blank');
      AddConsoleLog(t('home.commands.twitch'));
    },
    discord: () => {
      window.open('https://discord.com/users/whydog5555', '_blank');
      AddConsoleLog(t('home.commands.discord'));
    },
    email: () => {
      window.open('mailto:joshhuang9508@gmail.com', '_blank');
      AddConsoleLog(t('home.commands.email'));
    },
    osu: () => {
      window.open('https://osu.ppy.sh/users/15100005', '_blank');
      AddConsoleLog(t('home.commands.osu'));
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
      <div className={styles['feature-section']}>
        <ColorSpan str={t('/.sections.aboutMe')} className="section-label" />
        <div className={styles['bento']}>
          {/* Left column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Hero card */}
            <div className={styles['hero-card']}>
              <img ref={imageRef} className={`${styles['avatar']} ${false ? styles['spin'] : ''}`} src="/assets/pfp.png" alt="Profile" />
              <div className={styles['hero-info']}>
                <span className={styles['hero-name']}>{t('/.hero.name')}</span>
                <span className={styles['hero-school']}>{t('/.hero.school')}</span>
                <p className={styles['hero-bio']}>{t('/.hero.bio')}</p>
                <div className={styles['social-row']}>
                  {SOCIAL_LINKS.map((social) => (
                    <img
                      key={social.icon}
                      className={styles['social-icon']}
                      src={`/assets/${social.icon}.png`}
                      alt={social.icon}
                      title={social.icon}
                      onClick={() => window.open(social.url, '_blank')}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Latest post preview */}
            <div className={styles['preview-card']} style={{ cursor: 'pointer' }} onClick={() => (window.location.hash = latestPost ? `#/blog/${latestPost.slug}` : '#/blog')}>
              <div className={styles['preview-header']}>
                <ColorSpan str={t('/.sections.latestPost')} className="section-label" />
                <a className="view-all-link" href="#/blog" onClick={(e) => e.stopPropagation()}>
                  {t('/.latestPost.allPosts')}
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
                  <span className={styles['post-title']}>{t('/.latestPost.comingSoon')}</span>
                  <p className={styles['post-excerpt']}>{t('/.latestPost.stayTuned')}</p>
                </>
              )}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Projects preview */}
            <div className={styles['preview-card']} style={{ cursor: 'pointer' }} onClick={() => (window.location.hash = `#/projects`)}>
              <div className={styles['preview-header']}>
                <ColorSpan str={t('/.sections.projects')} className="section-label" />
                <a className="view-all-link" href="#/projects" onClick={(e) => e.stopPropagation()}>
                  {t('/.projects.viewAll')}
                </a>
              </div>
              <div className={styles['project-carousel']}>
                {PROJECTS.map((project, i) => (
                  <div
                    key={project.slug}
                    className={`${styles['mini-project']} ${i === activeProjectIndex ? styles['active'] : ''}`}
                    style={{
                      position: i === 0 ? 'relative' : 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                    }}
                  >
                    <div className={styles['mini-project-img']} style={{ borderColor: project.accent }}>
                      {project.images[0] ? <img src={project.images[0]} alt={project.name} /> : <span style={{ color: '#555', fontSize: '0.8rem' }}>{t('/.projects.noImage')}</span>}
                    </div>
                    <div className={styles['mini-project-info']}>
                      <span className={styles['mini-repo-name']}>{project.name}</span>
                      <span
                        style={{
                          fontSize: '0.8rem',
                          color: '#888',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {project.tags.join(' · ')}
                      </span>
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

            {/* osu! stats preview */}
            <div className={styles['preview-card']} style={{ cursor: 'pointer' }} onClick={() => (window.location.hash = '#/osu')}>
              <div className={styles['preview-header']}>
                <ColorSpan str={t('/.sections.osuStats')} className="section-label" />
                <a className="view-all-link" href="#/osu" onClick={(e) => e.stopPropagation()}>
                  {t('/.osu.details')}
                </a>
              </div>
              <div className={styles['stat-row']}>
                <div className={styles['stat-item']}>
                  <span className={styles['stat-value']}>{osuUser ? `#${osuUser.globalRank?.toLocaleString() ?? '--'}` : '--'}</span>
                  <span className={styles['stat-label']}>{t('/.osu.globalRank')}</span>
                </div>
                <div className={styles['stat-item']}>
                  <span className={styles['stat-value']}>{osuUser ? `${osuUser.pp.toLocaleString()}` : '--'}</span>
                  <span className={styles['stat-label']}>{t('/.osu.pp')}</span>
                </div>
                <div className={styles['stat-item']}>
                  <span className={styles['stat-value']}>{osuUser ? `${osuUser.accuracy.toFixed(1)}%` : '--'}</span>
                  <span className={styles['stat-label']}>{t('/.osu.accuracy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <hr className="divider" />

      {/* Feature showcase & console tutorial */}
      <div className={styles['feature-section']}>
        <ColorSpan str={t('/.sections.aboutSite')} className="section-label" />
        <div className={styles['feature-card']}>
          <p className={styles['feature-title']}>
            <ColorSpan str={t('/.features.terminal.title')} />
          </p>
          <p className={styles['feature-desc']}>
            <ColorSpan str={t('/.features.terminal.desc')} />
          </p>
          <div className={styles['shortcut-list']}>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('/.features.terminal.ctrl')}</span>+<span className={styles['shortcut-key']}>{t('/.features.terminal.backtick')}</span>{' '}
              {t('/.features.terminal.toggleConsole')}
            </span>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('/.features.terminal.esc')}</span> {t('/.features.terminal.minimize')}
            </span>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('/.features.terminal.tab')}</span> {t('/.features.terminal.autocomplete')}
            </span>
          </div>
        </div>
        <div className={styles['feature-card']}>
          <p className={styles['feature-title']}>
            <ColorSpan str={t('/.features.commands.title')} />
          </p>
          <p className={styles['feature-desc']}>
            <ColorSpan str={t('/.features.commands.desc')} />
          </p>
        </div>
      </div>

      <hr className="divider" />

      <p className={styles['footer']}>{t('/.footer')}</p>
    </div>
  );
}
