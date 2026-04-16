import React from 'react';

import styles from './Navigation.module.css';

interface NavigationProps {
  currentHash: string;
}

export default function Navigation({ currentHash }: NavigationProps) {
  const segments = currentHash.split('/').filter(Boolean);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return (
    <nav className={styles['breadcrumb']}>
      <span className={`${styles['segment']} ${styles['home']}`} onClick={() => navigate('#/')}>
        ~
      </span>
      {segments.map((segment, index) => {
        const path = `#/${segments.slice(0, index + 1).join('/')}`;
        const isLast = index === segments.length - 1;
        return (
          <React.Fragment key={path}>
            <span className={styles['separator']}>/</span>
            <span className={`${styles['segment']} ${isLast ? styles['active'] : ''}`} onClick={() => navigate(path)}>
              {segment}
            </span>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
