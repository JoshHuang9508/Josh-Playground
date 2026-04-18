import { PROJECTS } from '@/lib/constants';

import { t } from '@/lib/i18n';

import useTerminalCommand from '@/lib/hooks/TerminalCommand';

import { emitTerminalLog } from '@/lib/terminalLog';

import ProjectCard from './ProjectCard';

import styles from './Projects.module.css';

export default function ProjectsView() {
  useTerminalCommand({
    open: {
      name: 'open',
      description: 'Open a project',
      usage: '@#00ffaaopen@# @#fff700<project_name>@#',
      args: PROJECTS.map((p) => p.slug),
      handler: (_cmd, args) => {
        const projects = args;
        if (!projects.length) {
          emitTerminalLog(t('/projects.commands.open.usage'));
          return;
        }
        projects.forEach((pj) => {
          const project = PROJECTS.find((p) => p.slug === pj);
          if (project) {
            window.open(`https://github.com/${project.github.owner}/${project.github.repo}`, '_blank');
            emitTerminalLog(t('/projects.commands.open.opening', project.name));
          } else {
            emitTerminalLog(t('/projects.commands.open.notFound', pj));
          }
        });
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
