import type * as Types from '@/lib/types';

import { Slider } from './Slider';

import styles from './Settings.module.css';

interface HslPickerProps {
  value: Types.HSL;
  onChange: (v: Types.HSL) => void;
}

export function HslPicker({ value, onChange }: HslPickerProps) {
  return (
    <div className={styles['hsl']}>
      <Slider label="H" min={0} max={360} value={value.h} onChange={(h) => onChange({ ...value, h })} suffix="°" />
      <Slider label="S" min={0} max={100} value={value.s} onChange={(s) => onChange({ ...value, s })} suffix="%" />
      <Slider label="L" min={0} max={100} value={value.l} onChange={(l) => onChange({ ...value, l })} suffix="%" />
      <span className={styles['hsl-out']}>{`hsl(${value.h} ${value.s}% ${value.l}%)`}</span>
    </div>
  );
}
