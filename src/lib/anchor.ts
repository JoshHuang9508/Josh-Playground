const VIEWPORT_MARGIN = 8;
const ANCHOR_GAP = 8;

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Places a floating panel just under its trigger button, right edges aligned,
// clamped so the panel never leaves the viewport.
export function anchoredPosition(anchorSelector: string, panel: HTMLElement): { x: number; y: number } | null {
  if (typeof document === 'undefined') return null;

  const anchor = document.querySelector(anchorSelector);
  if (!anchor) return null;

  const rect = anchor.getBoundingClientRect();
  const width = panel.clientWidth;
  const height = panel.clientHeight;

  return {
    x: clamp(rect.right - width, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerWidth - width - VIEWPORT_MARGIN)),
    y: clamp(rect.bottom + ANCHOR_GAP, VIEWPORT_MARGIN, Math.max(VIEWPORT_MARGIN, window.innerHeight - height - VIEWPORT_MARGIN)),
  };
}
