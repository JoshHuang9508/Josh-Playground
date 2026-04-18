import { useEffect, useRef, useState } from 'react';

import type * as Types from '@/lib/types';

import Terminal from '@/components/Terminal';

type TerminalInstance = {
  id: string;
  windowState: Types.TerminalWindowState;
  positionOffset: number;
};

export default function TerminalManager() {
  const nextZIndexRef = useRef(999);

  const [terminals, setTerminals] = useState<TerminalInstance[]>([{ id: '1', windowState: 'minimized', positionOffset: 0 }]);

  const minimizedIds = terminals.filter((t) => t.windowState === 'minimized').map((t) => t.id);

  const toggleTerminal = () => {
    setTerminals((prev) => {
      if (prev.length === 0) {
        return [{ id: '1', windowState: 'normal', positionOffset: 0 }];
      }
      const c = prev[0];
      if (c.windowState === 'minimized' || c.windowState === 'closed') {
        return [{ ...c, windowState: 'normal' }];
      }
      return [{ ...c, windowState: 'minimized' }];
    });
  };

  const handleWindowStateChange = (id: string, state: Types.TerminalWindowState) => {
    if (state === 'closed') {
      setTerminals((prev) => prev.map((t) => (t.id === id ? { ...t, windowState: 'minimized' } : t)));
      return;
    }
    setTerminals((prev) => prev.map((t) => (t.id === id ? { ...t, windowState: state } : t)));
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === '`') {
        event.preventDefault();
        toggleTerminal();
        return;
      }

      if (event.key === 'Escape') {
        setTerminals((prev) => prev.map((t) => (t.windowState === 'normal' ? { ...t, windowState: 'minimized' as Types.TerminalWindowState } : t)));
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const headerEl = (event.target as HTMLElement).closest('[data-header]') as HTMLDivElement;
      if (headerEl) {
        headerEl.style.zIndex = String(nextZIndexRef.current);
        nextZIndexRef.current += 1;
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdownter', onPointerDown);
  }, []);

  return terminals.map((t) => (
    <Terminal key={t.id} id={t.id} windowState={t.windowState} onWindowStateChange={handleWindowStateChange} positionOffset={t.positionOffset} minimizedIndex={minimizedIds.indexOf(t.id)} />
  ));
}
