import { type ReactNode, useEffect, useRef, useState } from 'react';

import useWindowFocus from '@/lib/hooks/WindowFocus';

import styles from './AppWindow.module.css';

interface AppWindowProps { appId: string; children: ReactNode; title: string; isOpen: boolean; onClose: () => void }
type Layout = { x: number; y: number; width: number; height: number };
const MIN_WIDTH = 420;
const MIN_HEIGHT = 300;

function initialLayout(): Layout {
  const width = Math.min(window.innerWidth - 32, 1000);
  const height = Math.min(window.innerHeight - 128, 760);
  return { x: Math.max(0, (window.innerWidth - width) / 2), y: Math.max(0, (window.innerHeight - height) / 2 - 24), width, height };
}

export default function AppWindow({ appId, children, title, isOpen, onClose }: AppWindowProps) {
  const startLayout = useRef(initialLayout());
  const previousLayout = useRef(startLayout.current);
  const interaction = useRef({ type: '' as '' | 'drag' | 'resize', direction: '', mouseX: 0, mouseY: 0, ...startLayout.current });
  const [layout, setLayout] = useState(startLayout.current);
  const [windowState, setWindowState] = useState<'normal' | 'minimized' | 'maximized'>('normal');
  const [isInteracting, setIsInteracting] = useState(false);
  const { zIndex, bringToFront } = useWindowFocus();
  const wasOpen = useRef(isOpen);

  useEffect(() => { bringToFront(); }, [bringToFront]);

  useEffect(() => {
    if (isOpen && !wasOpen.current) {
      setWindowState('normal');
      bringToFront();
    }
    wasOpen.current = isOpen;
  }, [isOpen, bringToFront]);

  useEffect(() => {
    const restore = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== appId) return;
      setWindowState((state) => (state === 'minimized' ? 'normal' : state));
      bringToFront();
    };
    window.addEventListener('restore-desktop-app', restore);
    return () => window.removeEventListener('restore-desktop-app', restore);
  }, [appId, bringToFront]);

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      const current = interaction.current;
      if (!current.type) return;
      const dx = event.clientX - current.mouseX;
      const dy = event.clientY - current.mouseY;
      if (current.type === 'drag') {
        setLayout((value) => ({ ...value, x: Math.min(Math.max(0, current.x + dx), window.innerWidth - current.width), y: Math.min(Math.max(0, current.y + dy), window.innerHeight - current.height) }));
        return;
      }
      let { x, y, width, height } = current;
      if (current.direction.includes('e')) width = Math.min(Math.max(MIN_WIDTH, current.width + dx), window.innerWidth - x);
      if (current.direction.includes('s')) height = Math.min(Math.max(MIN_HEIGHT, current.height + dy), window.innerHeight - y);
      if (current.direction.includes('w')) { const move = Math.max(-current.x, Math.min(dx, current.width - MIN_WIDTH)); x = current.x + move; width = current.width - move; }
      if (current.direction.includes('n')) { const move = Math.max(-current.y, Math.min(dy, current.height - MIN_HEIGHT)); y = current.y + move; height = current.height - move; }
      setLayout({ x, y, width, height });
    };
    const onUp = () => {
      interaction.current.type = '';
      setIsInteracting(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => { document.removeEventListener('mousemove', onMove); document.removeEventListener('mouseup', onUp); };
  }, []);

  const startDrag = (event: React.MouseEvent) => {
    if ((event.target as HTMLElement).closest(`.${styles['traffic-lights']}`) || windowState === 'maximized') return;
    event.preventDefault();
    interaction.current = { type: 'drag', direction: '', mouseX: event.clientX, mouseY: event.clientY, ...layout };
    setIsInteracting(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const startResize = (event: React.MouseEvent, direction: string) => {
    event.preventDefault(); event.stopPropagation();
    interaction.current = { type: 'resize', direction, mouseX: event.clientX, mouseY: event.clientY, ...layout };
    setIsInteracting(true);
    document.body.style.userSelect = 'none';
  };

  const toggleMaximize = () => {
    if (windowState === 'maximized') { setLayout(previousLayout.current); setWindowState('normal'); return; }
    previousLayout.current = layout;
    setLayout({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight });
    setWindowState('maximized');
  };

  const isHidden = !isOpen || windowState === 'minimized';

  return (
    <section className={`${styles['window']} ${isHidden ? styles['closed'] : ''} ${isInteracting ? styles['no-transition'] : ''}`} style={{ left: layout.x, top: layout.y, width: layout.width, height: layout.height, borderRadius: windowState === 'maximized' ? 0 : undefined, zIndex }} onPointerDown={bringToFront} aria-hidden={isHidden}>
      {windowState !== 'maximized' && ['n', 's', 'e', 'w', 'nw', 'ne', 'sw', 'se'].map((direction) => <span key={direction} className={`${styles['resize-handle']} ${styles[`resize-${direction}`]}`} onMouseDown={(event) => startResize(event, direction)} />)}
      <header className={`${styles['header']} ${isInteracting ? styles['dragging'] : ''}`} onMouseDown={startDrag}>
        <div className={styles['traffic-lights']}>
          <button type="button" className={styles['close']} aria-label={`Close ${title}`} onClick={onClose} />
          <button type="button" className={styles['minimize']} aria-label={`Minimize ${title}`} onClick={() => setWindowState('minimized')} />
          <button type="button" className={styles['maximize']} aria-label={`Maximize ${title}`} onClick={toggleMaximize} />
        </div>
        <span className={styles['title']}>{title}</span><span className={styles['spacer']} />
      </header>
      <div className={styles['body']}>{children}</div>
    </section>
  );
}
