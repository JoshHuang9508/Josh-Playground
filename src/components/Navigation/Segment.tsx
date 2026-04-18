import styles from './Navigation.module.css';

interface SegmentProps {
  segment: string;
  isLast: boolean;
  onSegmentClick: () => void;
}

export default function Segment({ segment, isLast, onSegmentClick }: SegmentProps) {
  return (
    <>
      <span className={styles['separator']}>{'/'}</span>
      <span className={`${styles['segment']} ${isLast ? styles['active'] : ''}`} onClick={onSegmentClick}>
        {segment}
      </span>
    </>
  );
}
