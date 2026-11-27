// The Tracker's hint that checking off the habits still open would earn an achievement.
// It names the first within reach, least effort first: an active day, then check-ins, then a perfect day.

import type { AchievementTrack } from '@tracknstick/contracts';
import { plural } from '@shared/utils/plural';
import type { Achievement } from '../types/Achievement';
import { groupAchievements } from './achievementTracks';

/** The day the Tracker shows. */
interface TrackerDay {
  /** Habits due that day and not yet checked off. */
  habitsLeft: number;
  /** Habits due that day and checked off. */
  doneCount: number;
  isToday: boolean;
}

/** The next level of a track, with how many more it needs. */
function nextLevel(
  achievements: Achievement[],
  track: AchievementTrack,
): { name: string; left: number } | null {
  const next = groupAchievements(achievements).tracks.find(
    (group) => group.track === track,
  )?.next;
  if (!next?.progress) return null;
  const left = next.progress.targetValue - next.progress.currentValue;
  return left > 0 ? { name: next.name, left } : null;
}

export function achievementHint(
  achievements: Achievement[],
  { habitsLeft, doneCount, isToday }: TrackerDay,
): string | null {
  if (habitsLeft <= 0) return null;

  // A day becomes active with its first check-in.
  const activeDays = nextLevel(achievements, 'active_days');
  if (isToday && doneCount === 0 && activeDays?.left === 1) {
    return `Your first check-in today earns ${activeDays.name}`;
  }

  // Each habit checked off, on any day, is one check-in.
  const checkIns = nextLevel(achievements, 'check_ins');
  if (checkIns && checkIns.left <= habitsLeft) {
    return `${checkIns.left} more ${plural(checkIns.left, 'check-in')} ${checkIns.left === 1 ? 'earns' : 'earn'} ${checkIns.name}`;
  }

  // A day is perfect once every habit due is checked off.
  const perfectDays = nextLevel(achievements, 'perfect_days');
  if (isToday && perfectDays?.left === 1) {
    return `${habitsLeft} more ${plural(habitsLeft, 'habit')} today ${habitsLeft === 1 ? 'earns' : 'earn'} ${perfectDays.name}`;
  }

  return null;
}
