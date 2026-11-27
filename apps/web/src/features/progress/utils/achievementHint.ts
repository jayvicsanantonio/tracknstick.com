// The Tracker's hint that checking off the habits still open would earn the next check-ins level.
// Each habit checked off is one check-in, so the hint shows only when the check-ins left fit in the habits left.

import { plural } from '@shared/utils/plural';
import type { Achievement } from '../types/Achievement';
import { groupAchievements } from './achievementTracks';

export function checkInHint(
  achievements: Achievement[],
  habitsLeft: number,
): string | null {
  const next = groupAchievements(achievements).tracks.find(
    (group) => group.track === 'check_ins',
  )?.next;
  if (!next?.progress || habitsLeft <= 0) return null;

  const left = next.progress.targetValue - next.progress.currentValue;
  if (left <= 0 || left > habitsLeft) return null;

  return `${left} more ${plural(left, 'check-in')} ${left === 1 ? 'earns' : 'earn'} ${next.name}`;
}
