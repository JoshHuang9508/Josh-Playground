import { useEffect, useState } from 'react';

import type * as Types from '@/lib/types';

import Terminal from '@/components/Terminal';

type TerminalInstance = {
  id: string;
  windowState: Types.TerminalWindowState;
  positionOffset: number;
};

interface TerminalManagerProps {
  onVisibilityChange: (visible: boolean) => void;
}

export default function TerminalManager({ onVisibilityChange }: TerminalManagerProps) {
  const [terminals, setTerminals] = useState<TerminalInstance[]>([{ id: '1', windowState: 'closed', positionOffset: 0 }]);

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
    setTerminals((prev) => prev.map((t) => (t.id === id ? { ...t, windowState: state } : t)));
  };

  useEffect(() => {
    onVisibilityChange(terminals.some((terminal) => terminal.windowState !== 'closed'));
  }, [terminals, onVisibilityChange]);

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

    const onDockToggle = () => {
      setTerminals((prev) => prev.map((terminal) => ({ ...terminal, windowState: terminal.windowState === 'closed' ? 'normal' : 'closed' })));
    };

    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('toggle-terminal', onDockToggle);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('toggle-terminal', onDockToggle);
    };
  }, []);

  return terminals.map((t) => (
    <Terminal key={t.id} id={t.id} windowState={t.windowState} onWindowStateChange={handleWindowStateChange} positionOffset={t.positionOffset} />
  ));
}
