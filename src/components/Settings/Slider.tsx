import styles from './Settings.module.css';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
}

export function Slider({ label, min, max, step = 1, value, onChange, suffix }: SliderProps) {
  return (
    <label className={styles['slider']}>
      <span className={styles['slider-label']}>{label}</span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
      <span className={styles['slider-value']}>
        {step < 1 ? value.toFixed(2) : value}
        {suffix ?? ''}
      </span>
    </label>
  );
}
