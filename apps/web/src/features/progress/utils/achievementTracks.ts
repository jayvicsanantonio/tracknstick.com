// Groups achievements into tracks, each a ladder of targets on one count, and one-off badges.
// Each level of a track earns a medal by how far up the ladder it sits: bronze, silver, gold, platinum.

import type { AchievementTrack } from '@tracknstick/contracts';
import type { Achievement } from '../types/Achievement';

/** A track's name, in the order the tracks are listed. */
const TRACK_LABELS: Record<AchievementTrack, string> = {
  check_ins: 'Check-ins',
  streak: 'Streak',
  active_days: 'Active days',
  perfect_days: 'Perfect days',
  habits: 'Habits',
};

export type Medal = 'bronze' | 'silver' | 'gold' | 'platinum';

const MEDALS: Medal[] = ['bronze', 'silver', 'gold', 'platinum'];

export interface AchievementTrackGroup {
  track: AchievementTrack;
  label: string;
  /** Every level, smallest target first. */
  levels: Achievement[];
  earnedCount: number;
  /** The first level not yet earned; none once all are. */
  next: Achievement | undefined;
}

export function groupAchievements(achievements: Achievement[]): {
  tracks: AchievementTrackGroup[];
  badges: Achievement[];
} {
  const tracks = (Object.keys(TRACK_LABELS) as AchievementTrack[])
    .map((track) => {
      const levels = achievements
        .filter((achievement) => achievement.track === track)
        .sort((a, b) => a.requirementValue - b.requirementValue);
      return {
        track,
        label: TRACK_LABELS[track],
        levels,
        earnedCount: levels.filter((level) => level.isEarned).length,
        next: levels.find((level) => !level.isEarned),
      };
    })
    .filter((group) => group.levels.length > 0);

  const badges = achievements.filter((achievement) => !achievement.track);

  return { tracks, badges };
}

/**
 * The medal for a level (counted from 1) of a track with `levelCount`
 * levels: the track's span is split into quarters, so the last level of any
 * track is platinum.
 */
export function medalFor(level: number, levelCount: number): Medal {
  const quarter = Math.ceil((level / levelCount) * MEDALS.length);
  return MEDALS[Math.min(MEDALS.length, Math.max(1, quarter)) - 1];
}
