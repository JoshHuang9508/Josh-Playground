import { useContext, useEffect, useRef, useState } from 'react';

import { AppContext } from '@/pages/index';

import { NAV_ABOUT_ANCHOR } from '@/lib/constants';

import { anchoredPosition } from '@/lib/anchor';

import useI18n from '@/lib/hooks/i18n';
import useWindowFocus from '@/lib/hooks/WindowFocus';

import ColorSpan from '@/components/ColorSpan';

import styles from './About.module.css';

export default function About() {
  const { isAboutOpen, setIsAboutOpen } = useContext(AppContext)!;
  const { t } = useI18n();
  const { zIndex, bringToFront } = useWindowFocus();

  const panelRef = useRef<HTMLDivElement>(null);
  const interactionRef = useRef({
    type: '' as '' | 'drag',
    startMouseX: 0,
    startMouseY: 0,
    startPosX: 0,
    startPosY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest(`.${styles['traffic-lights']}`)) return;
    e.preventDefault();
    interactionRef.current = {
      type: 'drag',
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
      startWidth: panelRef.current?.clientWidth ?? 0,
      startHeight: panelRef.current?.clientHeight ?? 0,
    };
    setIsDragging(true);
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  // Re-anchor under the nav button every time the panel is opened.
  useEffect(() => {
    const panel = panelRef.current;
    if (!isAboutOpen || !panel) return;
    const anchored = anchoredPosition(NAV_ABOUT_ANCHOR, panel);
    if (anchored) setPosition(anchored);
    bringToFront();
  }, [isAboutOpen, bringToFront]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const ref = interactionRef.current;
      const dx = e.clientX - ref.startMouseX;
      const dy = e.clientY - ref.startMouseY;
      const vw = window.innerWidth;
      const vh = window.innerHeight;

      if (ref.type === 'drag') {
        const newX = Math.min(Math.max(0, ref.startPosX + dx), vw - ref.startWidth);
        const newY = Math.min(Math.max(0, ref.startPosY + dy), vh - ref.startHeight);
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      interactionRef.current.type = '';
      setIsDragging(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div
      ref={panelRef}
      className={`${styles['panel']} ${isAboutOpen ? '' : styles['closed']}`}
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={bringToFront}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`${styles['header']} ${isDragging ? styles['dragging'] : ''}`} onMouseDown={handleDragStart}>
        <div className={styles['traffic-lights']}>
          <span className={styles['close']} onClick={() => setIsAboutOpen(false)} />
        </div>
        <span className={styles['header-title']}>~/about.md</span>
        <span className={styles['header-spacer']} />
      </div>

      <div className={styles['body']}>
        <span className={styles['section-label']}>{t('home.sections.aboutSite')}</span>

        <div className={styles['feature-card']}>
          <p className={styles['feature-title']}>
            <ColorSpan str={t('home.features.terminal.title')} />
          </p>
          <p className={styles['feature-desc']}>
            <ColorSpan str={t('home.features.terminal.desc')} />
          </p>
          <div className={styles['shortcut-list']}>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('home.features.terminal.ctrl')}</span>+<span className={styles['shortcut-key']}>{t('home.features.terminal.backtick')}</span>{' '}
              {t('home.features.terminal.toggleTerminal')}
            </span>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('home.features.terminal.esc')}</span> {t('home.features.terminal.minimize')}
            </span>
            <span className={styles['shortcut']}>
              <span className={styles['shortcut-key']}>{t('home.features.terminal.tab')}</span> {t('home.features.terminal.autocomplete')}
            </span>
          </div>
        </div>

        <div className={styles['feature-card']}>
          <p className={styles['feature-title']}>
            <ColorSpan str={t('home.features.commands.title')} />
          </p>
          <p className={styles['feature-desc']}>
            <ColorSpan str={t('home.features.commands.desc')} />
          </p>
        </div>

        <div className={styles['footer']}>
          <button type="button" className={styles['ghost-btn']} onClick={() => setIsAboutOpen(false)}>
            [{t('settings.exit')}]
          </button>
        </div>
      </div>
    </div>
  );
}
