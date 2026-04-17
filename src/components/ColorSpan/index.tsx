import React from 'react';

import styles from './ColorSpan.module.css';

interface ColorSpanProps {
  str: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function ColorSpan({ str, className, style }: ColorSpanProps) {
  const isColorCode = (color: string) => {
    const regex = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    return regex.test(color);
  };

  return (
    <div className={styles['color-span']}>
      {str
        .split('@#')
        .filter((i) => i !== '')
        .map((item, index) => {
          const color = item.slice(0, 6);
          if (isColorCode(color))
            return (
              <span key={color + index} className={className} style={{ ...style, color: `#${color}` }}>
                {item.slice(6)}
              </span>
            );
          return (
            <span key={color + index} className={className} style={style}>
              {item}
            </span>
          );
        })}
    </div>
  );
}
