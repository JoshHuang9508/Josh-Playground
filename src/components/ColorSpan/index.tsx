import React from 'react';

import { CUSTOM_COLOR_TAG_REGEX } from '@/lib/constants';

import styles from './ColorSpan.module.css';

interface ColorSpanProps {
  str: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ColorSpan({ str, className, style }: ColorSpanProps) {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = CUSTOM_COLOR_TAG_REGEX.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.slice(lastIndex, match.index));
    }
    const [, color, content] = match;
    parts.push(
      <span key={match.index} className={className} style={{ ...style, color: `#${color}` }}>
        {content}
      </span>,
    );
    lastIndex = CUSTOM_COLOR_TAG_REGEX.lastIndex;
  }

  if (lastIndex < str.length) {
    parts.push(str.slice(lastIndex));
  }

  return <span className={styles['color-span']}>{parts}</span>;
}
