import { useContext, useEffect, useRef, useState } from 'react';

import { AppContext } from '@/pages/index';

import type * as Types from '@/lib/types';

import { DEFAULT_SETTINGS, TEXT_COLOR_KEYS } from '@/lib/constants';

import { hslString } from '@/lib/settings';

import useI18n from '@/lib/hooks/i18n';
import useWindowFocus from '@/lib/hooks/WindowFocus';

import { Slider } from './Slider';
import { HslPicker } from './HslPicker';
import { ColorRow } from './ColorRow';
import ColorSpan from '@/components/ColorSpan';

import styles from './Settings.module.css';

export default function Settings() {
  const { settings, setSettings, isSettingsOpen, setIsSettingsOpen } = useContext(AppContext)!;
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

  const [position, setPosition] = useState(() => ({
    x: 0,
    y: 0,
  }));
  const [isDragging, setIsDragging] = useState(false);

  const TEXT_FIELDS: { key: Types.TextColorKey; label: string }[] = TEXT_COLOR_KEYS.map((key) => ({ key, label: t(`settings.text.${key}`) }));

  const highlightHex = hslString(settings.textHighlight);

  const update = (patch: Partial<Types.Settings>) => {
    setSettings({ ...settings, ...patch });
  };

  const updateText = (key: Types.TextColorKey, color: string) => {
    setSettings({ ...settings, textColors: { ...settings.textColors, [key]: color } });
  };

  const reset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

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

  // Center the app window whenever it is opened from the Dock.
  useEffect(() => {
    const panel = panelRef.current;
    if (!isSettingsOpen || !panel) return;
    setPosition({
      x: Math.max(16, (window.innerWidth - panel.offsetWidth) / 2),
      y: Math.max(24, (window.innerHeight - panel.offsetHeight) / 2 - 24),
    });
    bringToFront();
  }, [isSettingsOpen, bringToFront]);

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
      className={`${styles['panel']} ${isSettingsOpen ? '' : styles['closed']}`}
      style={{ left: position.x, top: position.y, zIndex }}
      onPointerDown={bringToFront}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`${styles['header']} ${isDragging ? styles['dragging'] : ''}`} onMouseDown={handleDragStart}>
        <div className={styles['traffic-lights']}>
          <span className={styles['close']} onClick={() => setIsSettingsOpen(false)} />
          {/* <span className={styles['minimize']} /> */}
          {/* <span className={styles['maximize']} /> */}
        </div>
        <span className={styles['header-title']}>~/settings.config</span>
        <span className={styles['header-spacer']} />
      </div>

      <div className={styles['body']}>
        <div className={styles['hint']}>
          <ColorSpan str={t('settings.tip')} />
        </div>

        {/* Background */}
        <section className={styles['section']}>
          <div className={styles['section-head']}>
            <span className={styles['bracket']}>[</span>
            <span className={styles['section-title']}>{t('settings.background.title')}</span>
            <span className={styles['bracket']}>]</span>
            <span className={styles['section-rule']} />
          </div>

          <div className={styles['field']}>
            <span className={styles['field-key']}>{t('settings.background.image')}</span>
            <span className={styles['field-eq']}>=</span>
            <input
              type="text"
              className={styles['text-input']}
              placeholder="/assets/bg.jpg"
              value={settings.backgroundImageUrl}
              onChange={(e) => update({ backgroundImageUrl: e.target.value })}
              spellCheck={false}
            />
          </div>

          <div className={styles['block']}>
            <div className={styles['block-head']}>
              <span className={styles['field-key']}>{t('settings.background.overlay')}</span>
              <span className={styles['swatch']} style={{ background: hslString(settings.backgroundColor, settings.backgroundAlpha) }} />
            </div>
            <HslPicker value={settings.backgroundColor} onChange={(backgroundColor) => update({ backgroundColor })} />
            <Slider label="A" min={0} max={1} step={0.01} value={settings.backgroundAlpha} onChange={(backgroundAlpha) => update({ backgroundAlpha })} />
          </div>
        </section>

        {/* Theme */}
        <section className={styles['section']}>
          <div className={styles['section-head']}>
            <span className={styles['bracket']}>[</span>
            <span className={styles['section-title']}>{t('settings.theme.title')}</span>
            <span className={styles['bracket']}>]</span>
            <span className={styles['section-rule']} />
          </div>

          <div className={styles['block']}>
            <Slider label="blur" min={0} max={40} value={settings.cardBlur} onChange={(cardBlur) => update({ cardBlur })} suffix="px" />
          </div>

          <div className={styles['hint']} style={{ marginBottom: '0.25rem' }}>
            <ColorSpan str={t('settings.theme.textHighlightHint')} />
          </div>

          <div className={styles['block']}>
            <div className={styles['block-head']}>
              <span className={styles['field-key']}>{t('settings.theme.textHighlight')}</span>
              <span className={styles['swatch']} style={{ background: highlightHex }} />
            </div>
            <HslPicker value={settings.textHighlight} onChange={(textHighlight) => update({ textHighlight })} />
          </div>
        </section>

        {/* Text */}
        <section className={styles['section']}>
          <div className={styles['section-head']}>
            <span className={styles['bracket']}>[</span>
            <span className={styles['section-title']}>{t('settings.text.title')}</span>
            <span className={styles['bracket']}>]</span>
            <span className={styles['section-rule']} />
          </div>

          {TEXT_FIELDS.map(({ key, label }) => (
            <ColorRow key={key} label={label} value={settings.textColors[key]} onChange={(c) => updateText(key, c)} />
          ))}
        </section>

        <div className={styles['footer']}>
          <button type="button" className={styles['ghost-btn']} onClick={reset}>
            [{t('settings.reset')}]
          </button>
          <button type="button" className={styles['ghost-btn']} onClick={() => setIsSettingsOpen(false)}>
            [{t('settings.exit')}]
          </button>
        </div>
      </div>
    </div>
  );
}
