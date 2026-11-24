// Finds the next day after a given one on which any of the user's habits is due.
// Lets a day with nothing scheduled point to the next day that has something.

import type { Habit } from '@/features/habits/types/Habit';
import type { Frequency } from '@/features/habits/types/Frequency';

const WEEKDAYS: Frequency[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** How far ahead to look: past a year, a habit that starts later is no help today. */
const MAX_DAYS_AHEAD = 400;

/** The instant's calendar day in the time zone, YYYY-MM-DD. */
function dateKey(instant: Date, timeZone: string): string {
  return instant.toLocaleDateString('en-CA', { timeZone });
}

/**
 * The first day after `from` on which any habit is due, as local noon of that
 * calendar day, or null when none is due within a year.
 *
 * A habit is due on its weekdays, from its start date through its end date,
 * each read as a calendar day in `timeZone`, as the API decides it.
 */
export function findNextDueDate(
  habits: Habit[],
  from: Date,
  timeZone: string,
): Date | null {
  if (habits.length === 0) return null;

  const spans = habits.map((habit) => ({
    days: new Set(habit.frequency),
    start: dateKey(new Date(habit.startDate), timeZone),
    end: habit.endDate ? dateKey(new Date(habit.endDate), timeZone) : null,
  }));

  const [year, month, day] = dateKey(from, timeZone).split('-').map(Number);

  for (let offset = 1; offset <= MAX_DAYS_AHEAD; offset += 1) {
    // Calendar arithmetic in UTC, which has no daylight-saving gaps.
    const candidate = new Date(Date.UTC(year, month - 1, day + offset));
    const key = candidate.toISOString().slice(0, 10);
    const weekday = WEEKDAYS[candidate.getUTCDay()];
    const isDue = spans.some(
      (span) =>
        span.days.has(weekday) &&
        span.start <= key &&
        (span.end === null || key <= span.end),
    );
    if (isDue) {
      return new Date(
        candidate.getUTCFullYear(),
        candidate.getUTCMonth(),
        candidate.getUTCDate(),
        12,
      );
    }
  }

  return null;
}
