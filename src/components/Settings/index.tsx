import React, { useContext } from 'react';

import { AppContext } from '@/pages/index';

import { DEFAULT_SETTINGS, HSL, ThemeSettings } from '@/lib/settings';

import styles from './Settings.module.css';

type TextColorKey = keyof ThemeSettings['textColors'];

const TEXT_COLOR_FIELDS: { key: TextColorKey; label: string }[] = [
  { key: 'primary', label: 'Primary' },
  { key: 'secondary', label: 'Secondary' },
  { key: 'muted', label: 'Muted' },
  { key: 'highlight', label: 'Highlight' },
  { key: 'accentGreen', label: 'Accent Green' },
  { key: 'accentPink', label: 'Accent Pink' },
  { key: 'accentOrange', label: 'Accent Orange' },
  { key: 'accentCyan', label: 'Accent Cyan' },
  { key: 'custom1', label: 'Custom 1' },
  { key: 'custom2', label: 'Custom 2' },
  { key: 'custom3', label: 'Custom 3' },
];

function HslSliders({ value, onChange }: { value: HSL; onChange: (v: HSL) => void }) {
  return (
    <div className={styles['sliders']}>
      <label>
        <span>H</span>
        <input type="range" min={0} max={360} value={value.h} onChange={(e) => onChange({ ...value, h: Number(e.target.value) })} />
        <span className={styles['value']}>{value.h}</span>
      </label>
      <label>
        <span>S</span>
        <input type="range" min={0} max={100} value={value.s} onChange={(e) => onChange({ ...value, s: Number(e.target.value) })} />
        <span className={styles['value']}>{value.s}%</span>
      </label>
      <label>
        <span>L</span>
        <input type="range" min={0} max={100} value={value.l} onChange={(e) => onChange({ ...value, l: Number(e.target.value) })} />
        <span className={styles['value']}>{value.l}%</span>
      </label>
    </div>
  );
}

export default function Settings() {
  const { settings, setSettings, isSettingsOpen, setIsSettingsOpen } = useContext(AppContext)!;

  if (!isSettingsOpen) return null;

  const update = (patch: Partial<ThemeSettings>) => setSettings({ ...settings, ...patch });

  const updateTextColor = (key: TextColorKey, color: string) =>
    setSettings({ ...settings, textColors: { ...settings.textColors, [key]: color } });

  const reset = () => setSettings(DEFAULT_SETTINGS);

  const bgPreview = `hsl(${settings.backgroundColor.h} ${settings.backgroundColor.s}% ${settings.backgroundColor.l}% / ${settings.backgroundAlpha})`;
  const cardPreview = `hsl(${settings.cardColor.h} ${settings.cardColor.s}% ${settings.cardColor.l}% / 0.06)`;

  return (
    <div className={styles['overlay']} onClick={() => setIsSettingsOpen(false)}>
      <div className={styles['panel']} onClick={(e) => e.stopPropagation()}>
        <div className={styles['header']}>
          <span className={styles['title']}>Settings</span>
          <div className={styles['actions']}>
            <button className={styles['btn']} onClick={reset}>Reset</button>
            <button className={styles['btn-close']} onClick={() => setIsSettingsOpen(false)}>×</button>
          </div>
        </div>

        <div className={styles['body']}>
          <section className={styles['section']}>
            <span className={styles['section-title']}>Background</span>
            <label className={styles['field']}>
              <span className={styles['field-label']}>Image URL</span>
              <input
                type="text"
                className={styles['text-input']}
                placeholder="/assets/bg.jpg"
                value={settings.backgroundImageUrl}
                onChange={(e) => update({ backgroundImageUrl: e.target.value })}
              />
            </label>
            <div className={styles['field']}>
              <div className={styles['field-row']}>
                <span className={styles['field-label']}>Overlay Color</span>
                <span className={styles['swatch']} style={{ background: bgPreview }} />
              </div>
              <HslSliders value={settings.backgroundColor} onChange={(backgroundColor) => update({ backgroundColor })} />
              <label className={styles['row']}>
                <span>Alpha</span>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={settings.backgroundAlpha}
                  onChange={(e) => update({ backgroundAlpha: Number(e.target.value) })}
                />
                <span className={styles['value']}>{settings.backgroundAlpha.toFixed(2)}</span>
              </label>
            </div>
          </section>

          <section className={styles['section']}>
            <span className={styles['section-title']}>Card</span>
            <div className={styles['field']}>
              <div className={styles['field-row']}>
                <span className={styles['field-label']}>Card Color</span>
                <span className={styles['swatch']} style={{ background: cardPreview, backdropFilter: `blur(${settings.cardBlur}px)` }} />
              </div>
              <HslSliders value={settings.cardColor} onChange={(cardColor) => update({ cardColor })} />
              <label className={styles['row']}>
                <span>Blur</span>
                <input
                  type="range"
                  min={0}
                  max={40}
                  step={1}
                  value={settings.cardBlur}
                  onChange={(e) => update({ cardBlur: Number(e.target.value) })}
                />
                <span className={styles['value']}>{settings.cardBlur}px</span>
              </label>
            </div>
          </section>

          <section className={styles['section']}>
            <span className={styles['section-title']}>Theme Colors</span>
            <div className={styles['color-grid']}>
              {TEXT_COLOR_FIELDS.map(({ key, label }) => (
                <label key={key} className={styles['color-field']}>
                  <span className={styles['color-label']}>{label}</span>
                  <div className={styles['color-input-wrap']}>
                    <input
                      type="color"
                      className={styles['color-picker']}
                      value={settings.textColors[key]}
                      onChange={(e) => updateTextColor(key, e.target.value)}
                    />
                    <input
                      type="text"
                      className={styles['color-text']}
                      value={settings.textColors[key]}
                      onChange={(e) => updateTextColor(key, e.target.value)}
                    />
                  </div>
                </label>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
