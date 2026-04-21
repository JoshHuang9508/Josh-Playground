/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react';

import type * as Types from '@/lib/types';

import { LANGUAGE_COLORS } from '@/lib/constants';

import useI18n from '@/lib/hooks/i18n';
import useProjectRepo from '@/lib/hooks/ProjectRepo';

import styles from './Projects.module.css';

interface ProjectCardProps {
  project: Types.GitHubProjectConfig;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const { data: repo } = useProjectRepo(project.github.owner, project.github.repo);
  const { t } = useI18n();

  const [activeImage, setActiveImage] = useState(0);

  const repoUrl = repo?.url ?? `https://github.com/${project.github.owner}/${project.github.repo}`;
  const langColor = LANGUAGE_COLORS[repo?.language ?? ''];

  useEffect(() => {
    if (project.images.length <= 1) return;
    const interval = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % project.images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [project.images.length]);

  return (
    <div className={styles['project-row']} style={{ borderLeftColor: project.accent }}>
      {/* Top: image gallery */}
      <div className={styles['project-gallery']}>
        {project.images.length > 0 ? (
          <div className={styles['gallery-wrapper']}>
            {project.images.map((img, i) => (
              <img key={img} src={img} alt={`${project.name} screenshot ${i + 1}`} className={i === activeImage ? styles['active'] : ''} />
            ))}
            {project.images.length > 1 && (
              <div className={styles['gallery-dots']}>
                {project.images.map((_, i) => (
                  <span key={i} className={`${styles['gallery-dot']} ${i === activeImage ? styles['active'] : ''}`} onClick={() => setActiveImage(i)} />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className={styles['gallery-placeholder']}>{t('projects.noImages')}</div>
        )}
      </div>

      {/* Bottom: info + GitHub card */}
      <div className={styles['project-info']}>
        <span className={styles['project-name']}>{project.name}</span>
        <p className={styles['project-desc']}>{project.description}</p>
        <div className={styles['project-tags']}>
          {project.tags.map((tag) => (
            <span key={tag} className={styles['project-tag']} style={{ color: project.accent }}>
              {tag}
            </span>
          ))}
        </div>

        {/* GitHub repo card */}
        <div className={styles['github-card']} onClick={() => window.open(repoUrl, '_blank')}>
          <div className={styles['github-card-header']}>
            <img className={styles['github-icon']} src="/assets/github.png" alt="GitHub" />
            <span className={styles['github-repo-name']}>
              {project.github.owner}/{project.github.repo}
            </span>
          </div>
          <div className={styles['github-card-meta']}>
            {repo?.language && (
              <span className={styles['lang']}>
                <span className={styles['lang-dot']} style={{ backgroundColor: langColor }} />
                {repo.language}
              </span>
            )}
            {repo && repo.stars > 0 && <span className={styles['stars']}>&#9733; {repo.stars}</span>}
            {repo && repo.forks > 0 && <span className={styles['forks']}>&#9906; {repo.forks}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}
