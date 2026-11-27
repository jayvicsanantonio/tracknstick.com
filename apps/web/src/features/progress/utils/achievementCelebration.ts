// Describes a newly earned achievement for its celebration: its medal, the level reached, and the next target.
// A level's medal follows its place on its track; a one-off badge always earns gold.

import type { Achievement } from '../types/Achievement';
import { describeRemaining } from './achievementRemaining';
import { groupAchievements, medalFor, type Medal } from './achievementTracks';

export interface Celebration {
  medal: Medal;
  /** "Level 3 of 8 on your check-ins track"; null before the list loads. */
  level: string | null;
  /** The track's next level after this one not yet earned, if any. */
  next: Achievement | undefined;
  /** What is left to reach the next level. */
  remaining: string | null;
}

export function describeCelebration(
  key: string,
  achievements: Achievement[],
  currentStreak: number,
): Celebration {
  const earned = achievements.find((achievement) => achievement.key === key);
  if (!earned) {
    return { medal: 'gold', level: null, next: undefined, remaining: null };
  }
  if (!earned.track) {
    return {
      medal: 'gold',
      level: 'Badge earned',
      next: undefined,
      remaining: null,
    };
  }

  const group = groupAchievements(achievements).tracks.find(
    (candidate) => candidate.track === earned.track,
  );
  const levels = group?.levels ?? [earned];
  const index = levels.findIndex((candidate) => candidate.key === key);
  const trackName = (group?.label ?? '').toLowerCase();
  const isTop = index === levels.length - 1;
  // The next level still to reach: one check can earn several levels, and
  // the ones it earned alongside this are already behind the user.
  const next = levels.slice(index + 1).find((level) => !level.isEarned);

  return {
    medal: medalFor(index + 1, levels.length),
    level: isTop
      ? `The top of your ${trackName} track`
      : `Level ${index + 1} of ${levels.length} on your ${trackName} track`,
    next,
    remaining: next ? describeRemaining(next, currentStreak) : null,
  };
}
