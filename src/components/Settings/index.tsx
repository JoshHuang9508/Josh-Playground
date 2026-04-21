import { useContext, useEffect, useRef, useState } from 'react';

import { AppContext } from '@/pages/index';

import type * as Types from '@/lib/types';

import { DEFAULT_SETTINGS } from '@/lib/constants';

import { hslString } from '@/lib/settings';

import useI18n from '@/lib/hooks/i18n';

import { Slider } from './Slider';
import { HslPicker } from './HslPicker';
import { ColorRow } from './ColorRow';
import ColorSpan from '@/components/ColorSpan';

import styles from './Settings.module.css';

export default function Settings() {
  const { settings, setSettings, isSettingsOpen, setIsSettingsOpen } = useContext(AppContext)!;
  const { t } = useI18n();

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

  const TEXT_FIELDS: { key: 'primary' | 'secondary' | 'muted'; label: string }[] = [
    { key: 'primary', label: t('settings.text.primary') },
    { key: 'secondary', label: t('settings.text.secondary') },
    { key: 'muted', label: t('settings.text.muted') },
  ];

  const cardHex = hslString(settings.cardColor);
  const highlightHex = hslString(settings.textHighlight);

  const update = (patch: Partial<Types.Settings>) => {
    setSettings({ ...settings, ...patch });
  };

  const updateText = (key: 'primary' | 'secondary' | 'muted', color: string) => {
    setSettings({ ...settings, textColors: { ...settings.textColors, [key]: color } });
  };

  const updateAccent = (idx: number, color: string) => {
    const accent = [...settings.textColors.accent];
    accent[idx] = color;
    setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
  };

  const addAccent = () => {
    setSettings({ ...settings, textColors: { ...settings.textColors, accent: [...settings.textColors.accent, '#ffffff'] } });
  };

  const removeAccent = (idx: number) => {
    const accent = settings.textColors.accent.filter((_, i) => i !== idx);
    setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
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
    <div ref={panelRef} className={`${styles['panel']} ${isSettingsOpen ? '' : styles['closed']}`} style={{ left: position.x, top: position.y }} onClick={(e) => e.stopPropagation()}>
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
            <Slider label="A" min={0} max={1} step={0.01} value={settings.backgroundAlpha} onChange={(backgroundAlpha) => update({ backgroundAlpha })} hsl={settings.backgroundColor} />
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

          <div className={styles['hint']} style={{ marginBottom: '0.25rem' }}>
            <ColorSpan str={t('settings.theme.cardColorHint')} />
          </div>

          <div className={styles['block']}>
            <div className={styles['block-head']}>
              <span className={styles['field-key']}>{t('settings.theme.cardColor')}</span>
              <span className={styles['swatch']} style={{ background: cardHex }} />
            </div>
            <HslPicker value={settings.cardColor} onChange={(cardColor) => update({ cardColor })} />
            <Slider label="blur" min={0} max={40} value={settings.cardBlur} onChange={(cardBlur) => update({ cardBlur })} suffix="px" hsl={settings.cardColor} />
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

        {/* Accent array */}
        <section className={styles['section']}>
          <div className={styles['section-head']}>
            <span className={styles['bracket']}>[</span>
            <span className={styles['section-title']}>{t('settings.accent.title')}</span>
            <span className={styles['bracket']}>]</span>
            <span className={styles['accent-count']}>({settings.textColors.accent.length})</span>
            <span className={styles['section-rule']} />
          </div>

          {settings.textColors.accent.map((color, idx) => (
            <ColorRow key={idx} label={`[${idx}]`} value={color} onChange={(c) => updateAccent(idx, c)} onRemove={() => removeAccent(idx)} />
          ))}

          <div className={styles['accent-add']}>
            <button type="button" className={styles['ghost-btn']} onClick={addAccent}>
              [{t('settings.accent.add')}]
            </button>
          </div>
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
