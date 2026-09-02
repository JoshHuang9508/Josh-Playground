import { useContext } from 'react';

import { AppContext } from '@/pages/index';

import styles from './Dock.module.css';

const apps = [
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'blog', label: 'Blog' },
  { id: 'listentogether', label: 'Listen Together' },
  { id: 'settings', label: 'Settings' },
  { id: 'terminal', label: 'Terminal' },
] as const;

function DockIcon({ id }: { id: (typeof apps)[number]['id'] }) {
  if (id === 'about') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="11" r="5" /><path d="M7 27c.8-6 4-9 9-9s8.2 3 9 9" /></svg>;
  }
  if (id === 'settings') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="5" /><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M25.2 6.8l-2.8 2.8M9.6 22.4l-2.8 2.8" /></svg>;
  }
  if (id === 'projects') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M4 9h10l2 3h12v15H4zM4 9V6h9l2 3" /></svg>;
  }
  if (id === 'blog') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 4h14l4 4v20H7zM21 4v5h5M11 14h10M11 19h10M11 24h7" /></svg>;
  }
  if (id === 'listentogether') {
    return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M12 24V8l13-3v16M12 12l13-3" /><circle cx="8" cy="24" r="4" /><circle cx="21" cy="21" r="4" /></svg>;
  }
  return <svg viewBox="0 0 32 32" aria-hidden="true"><path d="m7 10 6 6-6 6M16 22h9" /></svg>;
}

export default function Dock() {
  const {
    isAboutOpen, isProjectsOpen, isBlogOpen, isListenTogetherOpen, isSettingsOpen, isTerminalOpen,
    setIsAboutOpen, setIsProjectsOpen, setIsBlogOpen, setIsListenTogetherOpen, setIsSettingsOpen,
  } = useContext(AppContext)!;
  const active = { about: isAboutOpen, projects: isProjectsOpen, blog: isBlogOpen, listentogether: isListenTogetherOpen, settings: isSettingsOpen, terminal: isTerminalOpen };

  const openApp = (id: (typeof apps)[number]['id']) => {
    if (id === 'about') {
      setIsAboutOpen(!isAboutOpen);
    }
    if (id === 'projects') {
      setIsProjectsOpen(!isProjectsOpen);
    }
    if (id === 'blog') {
      setIsBlogOpen(!isBlogOpen);
    }
    if (id === 'listentogether') {
      setIsListenTogetherOpen(!isListenTogetherOpen);
    }
    if (id === 'settings') setIsSettingsOpen(!isSettingsOpen);
    if (id === 'terminal') window.dispatchEvent(new Event('toggle-terminal'));
  };

  return (
    <nav className={styles['dock']} aria-label="Applications">
      {apps.map((app) => (
        <button key={app.id} type="button" className={styles['dock-item']} onClick={() => openApp(app.id)} aria-label={`Open ${app.label}`}>
          <span className={`${styles['icon']} ${styles[app.id]}`}><DockIcon id={app.id} /></span>
          <span className={styles['tooltip']}>{app.label}</span>
          <span className={`${styles['indicator']} ${active[app.id] ? styles['active'] : ''}`} />
        </button>
      ))}
    </nav>
  );
}
