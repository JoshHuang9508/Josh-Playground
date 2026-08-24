import styles from './Settings.module.css';

interface ColorRowProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
}

export function ColorRow({ label, value, onChange }: ColorRowProps) {
  return (
    <div className={styles['color-row']}>
      <span className={styles['color-row-label']}>{label}</span>
      <div className={styles['color-picker']} style={{ background: value }} />
      <input type="text" className={styles['color-text']} value={value} onChange={(e) => onChange(e.target.value)} spellCheck={false} />
    </div>
  );
}
