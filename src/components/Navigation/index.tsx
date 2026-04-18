import { useContext } from 'react';

import { AppContext } from '@/pages/index';

import Segment from './Segment';

import styles from './Navigation.module.css';

interface NavigationProps {
  currentHash: string;
}

export default function Navigation({ currentHash }: NavigationProps) {
  const appContext = useContext(AppContext)!;
  const segments = currentHash.split('/').filter(Boolean);

  const handleSegmentClick = (path: string) => {
    window.location.hash = path;
  };

  return (
    <nav className={styles['breadcrumb']}>
      <span className={`${styles['segment']} ${styles['home']}`} onClick={() => handleSegmentClick('#/')}>
        {'~'}
      </span>
      {segments.map((segment, index) => (
        <Segment key={index} segment={segment} isLast={index === segments.length - 1} onSegmentClick={() => handleSegmentClick(`#/${segments.slice(0, index + 1).join('/')}`)} />
      ))}
      <button type="button" className={styles['gear']} aria-label="Open settings" title="Settings" onClick={() => appContext.setIsSettingsOpen(!appContext.isSettingsOpen)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </nav>
  );
}
