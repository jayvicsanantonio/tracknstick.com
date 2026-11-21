// Sums up one month of progress history: the average completion and the perfect days.
// The history holds only days that had habits scheduled, so those are the days counted.

import { InsightData } from '@/features/progress/types/InsightData';

export interface MonthSummary {
  /** Average completion of the scheduled days, rounded; null when none. */
  averageRate: number | null;
  /** Scheduled days with every habit done. */
  perfectDays: number;
  /** Days that had habits scheduled. */
  scheduledDays: number;
}

/**
 * Summarizes the days of `month` in `history`. The request for a month can
 * return a neighbouring month's day, so days are matched by their
 * YYYY-MM-DD key.
 */
export function summarizeMonth(
  history: InsightData[],
  month: Date,
): MonthSummary {
  const prefix = `${month.getFullYear()}-${`${month.getMonth() + 1}`.padStart(2, '0')}-`;
  const days = history.filter((entry) => entry.date.startsWith(prefix));

  if (days.length === 0) {
    return { averageRate: null, perfectDays: 0, scheduledDays: 0 };
  }

  const total = days.reduce((sum, entry) => sum + entry.completionRate, 0);
  return {
    averageRate: Math.round(total / days.length),
    perfectDays: days.filter((entry) => entry.completionRate >= 100).length,
    scheduledDays: days.length,
  };
}
