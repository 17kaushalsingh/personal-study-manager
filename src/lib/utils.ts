import { HeatmapData, Difficulty } from '@/types';

/**
 * Format a date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

/**
 * Get today's date at midnight (UTC)
 */
export function getToday(): Date {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

/**
 * Calculate streak from activity logs
 */
export function calculateStreak(activities: { date: Date; tasksCompleted: number }[]): number {
  if (activities.length === 0) return 0;

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = getToday();
  let currentDate = today;

  for (const activity of sortedActivities) {
    const activityDate = new Date(activity.date);
    activityDate.setUTCHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0 && activity.tasksCompleted > 0) {
      streak++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
    } else if (diffDays === 1 && activity.tasksCompleted > 0) {
      streak++;
      currentDate = activityDate;
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}

/**
 * Generate heatmap data for the last N weeks
 */
export function generateHeatmapData(
  activities: { date: Date; tasksCompleted: number }[],
  weeks: number = 12
): HeatmapData[] {
  const heatmap: HeatmapData[] = [];
  const today = getToday();
  const totalDays = weeks * 7;

  const activityMap = new Map<string, number>();
  activities.forEach((activity) => {
    const dateStr = formatDate(new Date(activity.date));
    activityMap.set(dateStr, activity.tasksCompleted);
  });

  for (let i = totalDays - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const dateStr = formatDate(date);
    const count = activityMap.get(dateStr) || 0;

    heatmap.push({
      date: dateStr,
      count,
      level: getHeatmapLevel(count),
    });
  }

  return heatmap;
}

/**
 * Get heatmap level (0-4) based on activity count
 */
export function getHeatmapLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count === 0) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 6) return 3;
  return 4;
}

/**
 * Get difficulty color based on difficulty level
 */
export function getDifficultyColor(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'EASY':
      return 'var(--difficulty-easy)';
    case 'MEDIUM':
      return 'var(--difficulty-medium)';
    case 'HARD':
      return 'var(--difficulty-hard)';
    default:
      return 'var(--secondary)';
  }
}

/**
 * Capitalize first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a random ID
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}

/**
 * Class name helper (similar to clsx)
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
