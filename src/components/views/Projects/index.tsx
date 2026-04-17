import { useContext, useEffect } from 'react';

import { PROJECTS } from '@/lib/constants';

import { t } from '@/lib/i18n';

import useTerminalCommand from '@/lib/hooks/TerminalCommand';

import { AddConsoleLog } from '@/redux';

import { AppContext } from '@/pages/index';

import ProjectCard from './ProjectCard';

import styles from './Projects.module.css';

export default function ProjectsView() {
  const appContext = useContext(AppContext);

  useEffect(() => {
    appContext?.setAvailableArgs({ open: PROJECTS.map((p) => p.slug) });
    return () => appContext?.setAvailableArgs({});
  }, []);

  useTerminalCommand({
    open: {
      name: 'open',
      description: 'Open a project',
      usage: '@#00ffaaopen@# @#fff700<project_name>@#',
      handler: (_cmd, args) => {
        const name = args[0] ?? '';
        if (!name) {
          AddConsoleLog(t('/projects.commands.open.usage'));
          return;
        }
        const project = PROJECTS.find((p) => p.slug.toLowerCase() === name.toLowerCase());
        if (project) {
          window.open(`https://github.com/${project.github.owner}/${project.github.repo}`, '_blank');
          AddConsoleLog(t('/projects.commands.open.opening', project.name));
        } else {
          AddConsoleLog(t('/projects.commands.open.notFound', name));
        }
      },
    },
  });

  return (
    <div className={styles['projects-page']}>
      <p className="page-subtitle">{t('/projects.subtitle')}</p>
      <hr className="divider" />

      {PROJECTS.map((project) => (
        <ProjectCard key={project.slug} project={project} />
      ))}
    </div>
  );
}
