import { useCallback, useState } from 'react';

import { BASE_WINDOW_Z_INDEX } from '@/lib/constants';

// Shared across every floating window (terminal, settings, about) so the most
// recently focused one always wins, no matter which component owns it.
let topZIndex = BASE_WINDOW_Z_INDEX;

export default function useWindowFocus() {
  const [zIndex, setZIndex] = useState(BASE_WINDOW_Z_INDEX);

  const bringToFront = useCallback(() => {
    topZIndex += 1;
    setZIndex(topZIndex);
  }, []);

  return { zIndex, bringToFront };
}
