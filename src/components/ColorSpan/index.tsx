import React from 'react';

import styles from './ColorSpan.module.css';

interface ColorSpanProps {
  str: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ColorSpan({ str, className, style }: ColorSpanProps) {
  const regex = /@#([0-9a-fA-F]{3,6})(.+?)(@#|$)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.slice(lastIndex, match.index));
    }
    const [, color, content] = match;
    parts.push(
      <span key={match.index} className={className} style={{ ...style, color: `#${color}` }}>
        {content}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.slice(lastIndex));
  }

  return <div className={styles['color-span']}>{parts}</div>;
}
