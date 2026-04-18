import { useCallback, useContext, useRef, useState } from 'react';

import { AppContext } from '@/pages/index';

import type * as Types from '@/lib/types';

import { DEFAULT_SETTINGS } from '@/lib/constants';

import { hslString } from '@/lib/settings';

import ColorSpan from '@/components/ColorSpan';

import styles from './Settings.module.css';

type TextColorKey = 'primary' | 'secondary' | 'muted';

const TEXT_FIELDS: { key: TextColorKey; label: string }[] = [
  { key: 'primary', label: 'primary' },
  { key: 'secondary', label: 'secondary' },
  { key: 'muted', label: 'muted' },
];

function Slider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  suffix,
  hsl,
}: {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  hsl: Types.HSL;
}) {
  return (
    <label className={styles['slider']}>
      <span className={styles['slider-label']}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ accentColor: hslString(hsl) }} />
      <span className={styles['slider-value']}>
        {step < 1 ? value.toFixed(2) : value}
        {suffix ?? ''}
      </span>
    </label>
  );
}

function HslPicker({ value, onChange }: { value: Types.HSL; onChange: (v: Types.HSL) => void }) {
  return (
    <div className={styles['hsl']}>
      <Slider label="H" min={0} max={360} value={value.h} onChange={(h) => onChange({ ...value, h })} suffix="°" hsl={value} />
      <Slider label="S" min={0} max={100} value={value.s} onChange={(s) => onChange({ ...value, s })} suffix="%" hsl={value} />
      <Slider label="L" min={0} max={100} value={value.l} onChange={(l) => onChange({ ...value, l })} suffix="%" hsl={value} />
      <span className={styles['hsl-out']}>{`hsl(${value.h} ${value.s}% ${value.l}%)`}</span>
    </div>
  );
}

function ColorRow({ label, value, onChange, onRemove }: { label: string; value: string; onChange: (v: string) => void; onRemove?: () => void }) {
  return (
    <div className={styles['color-row']}>
      <span className={styles['color-row-label']}>{label}</span>
      <div className={styles['color-picker']} style={{ background: value }} />
      <input type="text" className={styles['color-text']} value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
      {onRemove && (
        <button type="button" className={styles['icon-btn']} onClick={onRemove} title="remove">
          [×]
        </button>
      )}
    </div>
  );
}

export default function Settings() {
  const { settings, setSettings, isSettingsOpen, setIsSettingsOpen } = useContext(AppContext)!;

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
  const [newAccent, setNewAccent] = useState('#ffffff');

  const themeHex = hslString(settings.themeColor);
  const highlightHex = hslString(settings.textColors.highlight);

  const update = (patch: Partial<Types.ThemeSettings>) => setSettings({ ...settings, ...patch });

  const updateText = (key: TextColorKey, color: string) => setSettings({ ...settings, textColors: { ...settings.textColors, [key]: color } });

  const updateAccent = (idx: number, color: string) => {
    const accent = [...settings.textColors.accent];
    accent[idx] = color;
    setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
  };

  const addAccent = () => {
    const color = /^#[0-9a-fA-F]{6}$/.test(newAccent) ? newAccent : '#ffffff';
    setSettings({
      ...settings,
      textColors: { ...settings.textColors, accent: [...settings.textColors.accent, color] },
    });
  };

  const removeAccent = (idx: number) => {
    const accent = settings.textColors.accent.filter((_, i) => i !== idx);
    setSettings({ ...settings, textColors: { ...settings.textColors, accent } });
  };

  const reset = () => setSettings(DEFAULT_SETTINGS);

  const handleMouseMove = useCallback((e: MouseEvent) => {
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
  }, []);

  const handleMouseUp = useCallback(() => {
    interactionRef.current.type = '';
    setIsDragging(false);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

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
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

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
          <ColorSpan str={'// tip: type @#fff700theme --help@# in console for CLI access'} />
        </div>

        {/* Background */}
        <section className={styles['section']}>
          <div className={styles['section-head']}>
            <span className={styles['bracket']}>[</span>
            <span className={styles['section-title']}>background</span>
            <span className={styles['bracket']}>]</span>
            <span className={styles['section-rule']} />
          </div>

          <div className={styles['field']}>
            <span className={styles['field-key']}>image</span>
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
              <span className={styles['field-key']}>Background Overlay</span>
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
            <span className={styles['section-title']}>theme</span>
            <span className={styles['bracket']}>]</span>
            <span className={styles['section-rule']} />
          </div>

          <div className={styles['hint']} style={{ marginBottom: '0.25rem' }}>
            <ColorSpan str={'// drives @#fff700--card-color@#'} />
          </div>

          <div className={styles['block']}>
            <div className={styles['block-head']}>
              <span className={styles['field-key']}>Card Color</span>
              <span className={styles['swatch']} style={{ background: themeHex }} />
            </div>
            <HslPicker value={settings.themeColor} onChange={(themeColor) => update({ themeColor })} />
            <Slider label="blur" min={0} max={40} value={settings.cardBlur} onChange={(cardBlur) => update({ cardBlur })} suffix="px" hsl={settings.themeColor} />
          </div>

          <div className={styles['hint']} style={{ marginBottom: '0.25rem' }}>
            <ColorSpan str={'// drives @#fff700--text-highlight@#'} />
          </div>

          <div className={styles['block']}>
            <div className={styles['block-head']}>
              <span className={styles['field-key']}>Text Highlight</span>
              <span className={styles['swatch']} style={{ background: highlightHex }} />
            </div>
            <HslPicker value={settings.textColors.highlight} onChange={(highlight) => update({ textColors: { ...settings.textColors, highlight } })} />
          </div>
        </section>

        {/* Text */}
        <section className={styles['section']}>
          <div className={styles['section-head']}>
            <span className={styles['bracket']}>[</span>
            <span className={styles['section-title']}>text</span>
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
            <span className={styles['section-title']}>accent</span>
            <span className={styles['bracket']}>]</span>
            <span className={styles['accent-count']}>({settings.textColors.accent.length})</span>
            <span className={styles['section-rule']} />
          </div>

          {settings.textColors.accent.map((color, idx) => (
            <ColorRow key={idx} label={`[${idx}]`} value={color} onChange={(c) => updateAccent(idx, c)} onRemove={() => removeAccent(idx)} />
          ))}

          <div className={styles['accent-add']}>
            <button type="button" className={styles['ghost-btn']} onClick={addAccent}>
              [+ push]
            </button>
          </div>
        </section>

        <div className={styles['footer']}>
          <button type="button" className={styles['ghost-btn']} onClick={reset}>
            [reset --all]
          </button>
          <button type="button" className={styles['ghost-btn']} onClick={() => setIsSettingsOpen(false)}>
            [exit]
          </button>
        </div>
      </div>
    </div>
  );
}
