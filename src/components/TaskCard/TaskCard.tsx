'use client';

import { Task } from '@/types';
import { cn } from '@/lib/utils';
import Card from '@/components/Card';
import Badge, { DifficultyBadge, PlatformBadge } from '@/components/Badge';
import Button from '@/components/Button';
import styles from './TaskCard.module.css';

interface TaskCardProps {
  task: Task;
  onComplete?: (taskId: string) => void;
  onSkip?: (taskId: string) => void;
  className?: string;
}

export default function TaskCard({
  task,
  onComplete,
  onSkip,
  className,
}: TaskCardProps) {
  const isCompleted = task.status === 'COMPLETED';
  const isSkipped = task.status === 'SKIPPED';
  const isPending = task.status === 'PENDING';

  return (
    <Card
      className={cn(
        styles.card,
        isCompleted && styles.completed,
        isSkipped && styles.skipped,
        className
      )}
      padding="md"
    >
      <div className={styles.header}>
        <div className={styles.badges}>
          {task.type === 'PROBLEM' ? (
            <Badge variant="info" size="sm">Problem</Badge>
          ) : task.type === 'LEARNING' ? (
            <Badge variant="primary" size="sm">Learning</Badge>
          ) : (
            <Badge variant="default" size="sm">Review</Badge>
          )}
          {task.platform && <PlatformBadge platform={task.platform.toLowerCase() as 'leetcode' | 'codeforces'} />}
          {task.difficulty && <DifficultyBadge difficulty={task.difficulty.toLowerCase() as 'easy' | 'medium' | 'hard'} />}
        </div>
        <div className={styles.status}>
          {isCompleted && <span className={styles.completedIcon}>✓</span>}
          {isSkipped && <span className={styles.skippedIcon}>—</span>}
        </div>
      </div>

      <h3 className={styles.title}>{task.title}</h3>
      {task.description && (
        <p className={styles.description}>{task.description}</p>
      )}

      {task.tags && task.tags.length > 0 && (
        <div className={styles.tags}>
          {task.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
          {task.tags.length > 3 && (
            <span className={styles.moreTags}>+{task.tags.length - 3}</span>
          )}
        </div>
      )}

      <div className={styles.actions}>
        {task.referenceLink && (
          <a
            href={task.referenceLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            Open Problem
          </a>
        )}
        {isPending && (
          <>
            <Button
              size="sm"
              variant="primary"
              onClick={() => onComplete?.(task.id)}
            >
              Complete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onSkip?.(task.id)}
            >
              Skip
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
