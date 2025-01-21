import React from "react";

interface ColorSpanProps {
  str: string;
  className?: string;
  style?: React.CSSProperties;
}

function ColorSpan({ str, className, style }: ColorSpanProps) {
  function isValidColorCode(color) {
    const regex = /^([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
    return regex.test(color);
  }

  return (
    <>
      {str
        .split("@#")
        .filter((i) => i !== "")
        .map((item) => {
          const color = item.slice(0, 6);
          const content = isValidColorCode(color) ? item.slice(6) : item;
          return (
            <span
              key={color + content}
              style={{ color: `#${color}`, ...style }}
              className={className}
            >
              {content}
            </span>
          );
        })}
    </>
  );
}

export default ColorSpan;
