// Says what is left to earn an achievement, in the words of what it counts: "10 more check-ins".
// A streak can only be reached by the run going on now, so streaks count from the current streak.

import { plural } from '@shared/utils/plural';
import type { Achievement } from '../types/Achievement';

/** The kind of count an achievement's requirementData names, if any. */
function dataType(achievement: Achievement): string | undefined {
  const data = achievement.requirementData;
  if (data && typeof data === 'object' && 'type' in data) {
    const { type } = data as { type: unknown };
    return typeof type === 'string' ? type : undefined;
  }
  return undefined;
}

/**
 * What is left to earn the achievement, or null when there is no progress to
 * measure or the target is already reached but not yet awarded.
 */
export function describeRemaining(
  achievement: Achievement,
  currentStreak: number,
): string | null {
  const { progress } = achievement;
  if (!progress) return null;

  const { currentValue, targetValue } = progress;
  const left = targetValue - currentValue;

  if (achievement.type === 'streak') {
    if (currentStreak <= 0) return 'Start a streak today';
    const days = targetValue - currentStreak;
    return days > 0 ? `${days} more ${plural(days, 'day')} in a row` : null;
  }

  if (left <= 0) return null;

  switch (dataType(achievement)) {
    case 'perfect_days':
      return `${left} more perfect ${plural(left, 'day')}`;
    case 'notes_added':
      return `${left} more ${plural(left, 'note')}`;
    case 'single_day_completions':
      return `${targetValue} habits in one day, best so far ${currentValue}`;
  }

  if (achievement.type === 'completion') {
    return `${left} more ${plural(left, 'check-in')}`;
  }
  if (achievement.type === 'habit_creation') {
    return `${left} more ${plural(left, 'habit')}`;
  }
  if (achievement.requirementType === 'days') {
    return `${left} more active ${plural(left, 'day')}`;
  }
  return `${currentValue} of ${targetValue}`;
}
