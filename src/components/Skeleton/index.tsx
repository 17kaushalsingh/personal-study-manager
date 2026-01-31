import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  variant?: 'text' | 'circular' | 'rectangular';
  className?: string;
}

export default function Skeleton({
  width,
  height,
  variant = 'rectangular',
  className = '',
}: SkeletonProps) {
  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  return (
    <div
      className={`${styles.skeleton} ${styles[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}

// Pre-built skeleton patterns
export function CardSkeleton() {
  return (
    <div className={styles.cardSkeleton}>
      <Skeleton height={24} width="60%" className={styles.title} />
      <Skeleton height={16} width="100%" />
      <Skeleton height={16} width="80%" />
      <Skeleton height={16} width="40%" />
    </div>
  );
}

export function TaskSkeleton() {
  return (
    <div className={styles.taskSkeleton}>
      <Skeleton variant="circular" width={40} height={40} />
      <div className={styles.taskContent}>
        <Skeleton height={18} width="70%" />
        <Skeleton height={14} width="40%" />
      </div>
    </div>
  );
}

export function StatSkeleton() {
  return (
    <div className={styles.statSkeleton}>
      <Skeleton variant="circular" width={48} height={48} />
      <div className={styles.statContent}>
        <Skeleton height={14} width={60} />
        <Skeleton height={24} width={40} />
      </div>
    </div>
  );
}
