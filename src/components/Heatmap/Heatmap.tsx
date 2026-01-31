'use client';

import { HeatmapData } from '@/types';
import { cn } from '@/lib/utils';
import styles from './Heatmap.module.css';

interface HeatmapProps {
  data: HeatmapData[];
  className?: string;
}

export default function Heatmap({ data, className }: HeatmapProps) {
  // Group data by weeks
  const weeks: HeatmapData[][] = [];
  let currentWeek: HeatmapData[] = [];

  data.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === data.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const days = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  // Calculate month labels
  const monthLabels: { month: string; position: number }[] = [];
  let lastMonth = -1;

  weeks.forEach((week, weekIndex) => {
    const firstDay = week[0];
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: months[month], position: weekIndex });
        lastMonth = month;
      }
    }
  });

  return (
    <div className={cn(styles.container, className)}>
      <div className={styles.monthLabels}>
        {monthLabels.map(({ month, position }) => (
          <span
            key={`${month}-${position}`}
            className={styles.monthLabel}
            style={{ left: `${position * 14}px` }}
          >
            {month}
          </span>
        ))}
      </div>
      <div className={styles.heatmapContainer}>
        <div className={styles.dayLabels}>
          {days.map((day, i) => (
            <span key={i} className={styles.dayLabel}>
              {day}
            </span>
          ))}
        </div>
        <div className={styles.grid}>
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className={styles.week}>
              {week.map((day) => (
                <div
                  key={day.date}
                  className={cn(styles.cell, styles[`level${day.level}`])}
                  title={`${day.date}: ${day.count} activities`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className={styles.legend}>
        <span className={styles.legendLabel}>Less</span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(styles.legendCell, styles[`level${level}`])}
          />
        ))}
        <span className={styles.legendLabel}>More</span>
      </div>
    </div>
  );
}
