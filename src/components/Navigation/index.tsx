import React from 'react';

import Segment from './Segment';

import styles from './Navigation.module.css';

interface NavigationProps {
  currentHash: string;
}

export default function Navigation({ currentHash }: NavigationProps) {
  const segments = currentHash.split('/').filter(Boolean);

  const handleSegmentClick = (path: string) => {
    window.location.hash = path;
  };

  return (
    <nav className={styles['breadcrumb']}>
      <span className={`${styles['segment']} ${styles['home']}`} onClick={() => handleSegmentClick('#/')}>
        ~
      </span>
      {segments.map((segment, index) => (
        <Segment key={index} segment={segment} isLast={index === segments.length - 1} onSegmentClick={() => handleSegmentClick(`#/${segments.slice(0, index + 1).join('/')}`)} />
      ))}
    </nav>
  );
}
