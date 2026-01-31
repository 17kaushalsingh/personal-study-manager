import Link from 'next/link';
import Card from '@/components/Card';
import ProgressBar from '@/components/ProgressBar';
import { cn } from '@/lib/utils';
import styles from './SubjectCard.module.css';

interface SubjectCardProps {
  id: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  progress: number;
  topicCount: number;
  className?: string;
}

export default function SubjectCard({
  id,
  name,
  description,
  icon,
  progress,
  topicCount,
  className,
}: SubjectCardProps) {
  return (
    <Link href={`/curriculum/${id}`} className={styles.link}>
      <Card className={cn(styles.card, className)} hoverable padding="lg">
        <div className={styles.header}>
          <span className={styles.icon}>{icon || '📚'}</span>
          <span className={styles.topicCount}>{topicCount} topics</span>
        </div>
        <h3 className={styles.name}>{name}</h3>
        {description && <p className={styles.description}>{description}</p>}
        <div className={styles.progressContainer}>
          <ProgressBar
            value={progress}
            size="sm"
            color={progress === 100 ? 'success' : 'primary'}
            showLabel
          />
        </div>
      </Card>
    </Link>
  );
}
