import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export default function Badge({
  children,
  variant = 'default',
  size = 'md',
  className,
}: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], styles[size], className)}>
      {children}
    </span>
  );
}

// Difficulty Badge
interface DifficultyBadgeProps {
  difficulty: 'easy' | 'medium' | 'hard' | string;
}

export function DifficultyBadge({ difficulty }: DifficultyBadgeProps) {
  const variant = difficulty === 'easy' ? 'success' : difficulty === 'medium' ? 'warning' : 'error';
  return <Badge variant={variant}>{difficulty}</Badge>;
}

// Platform Badge
interface PlatformBadgeProps {
  platform: 'leetcode' | 'codeforces' | string;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  return (
    <Badge
      variant="default"
      className={platform === 'leetcode' ? styles.leetcode : styles.codeforces}
    >
      {platform}
    </Badge>
  );
}
