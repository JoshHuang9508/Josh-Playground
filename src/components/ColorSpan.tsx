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
        .map((item, index) => {
          const color = item.slice(0, 6);
          if (!isValidColorCode(color))
            return (
              <span key={color + index} style={style} className={className}>
                {item}
              </span>
            );
          return (
            <span
              key={color + index}
              style={{ color: `#${color}`, ...style }}
              className={className}
            >
              {item.slice(6)}
            </span>
          );
        })}
    </>
  );
}

export default ColorSpan;
