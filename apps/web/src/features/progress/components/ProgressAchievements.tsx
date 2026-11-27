// The full list of achievements on the progress page: one row per track, then the one-off badges.
// A track is a ladder of targets on one count; badges list earned first, newest first, then closest first.

import { memo } from 'react';
import { Trophy } from 'lucide-react';
import EmptyState from '@shared/components/feedback/EmptyState';
import { parseUTCTimestamp } from '@shared/utils/date/formatDate';
import { Achievement } from '../types/Achievement';
import AchievementMedal from './AchievementMedal';
import AchievementTrackRow from './AchievementTrackRow';
import NewMark from './NewMark';
import { getAchievementIcon } from '../utils/achievementIcons';
import { groupAchievements } from '../utils/achievementTracks';
import { formatEarnedDate } from '../utils/formatEarnedDate';
import { formatProgress } from '../utils/achievementRemaining';

const SECTION_HEADING =
  'mb-3 text-xs font-semibold tracking-wide text-(--color-text-secondary) uppercase';

interface ProgressAchievementsProps {
  achievements: Achievement[];
  /** The streak running now, which the streak track counts from. */
  currentStreak: number;
  /** Ids of achievements earned since the last visit, marked new. */
  newIds: ReadonlySet<string>;
}

/** When an achievement was earned, for ordering; 0 when there is no date. */
function earnedTime(achievement: Achievement): number {
  return achievement.earnedAt
    ? parseUTCTimestamp(achievement.earnedAt).getTime()
    : 0;
}

/** Earned badges first, newest first; then the rest, closest to earned first. */
function byBadgeOrder(a: Achievement, b: Achievement): number {
  return (
    Number(b.isEarned) - Number(a.isEarned) ||
    earnedTime(b) - earnedTime(a) ||
    (b.progress?.progressPercentage ?? 0) -
      (a.progress?.progressPercentage ?? 0)
  );
}

const ProgressAchievements = memo(function ProgressAchievements({
  achievements,
  currentStreak,
  newIds,
}: ProgressAchievementsProps) {
  if (achievements.length === 0) {
    return (
      <EmptyState
        Icon={Trophy}
        headingLevel={3}
        title="No achievements to show"
        detail="They appear here as soon as they are available."
      />
    );
  }

  const { tracks, badges } = groupAchievements(achievements);

  return (
    <div className="space-y-6">
      {tracks.length > 0 && (
        <div>
          <h3 className={SECTION_HEADING}>Tracks</h3>
          <ul
            aria-label="Tracks"
            className="grid grid-cols-1 gap-3 md:grid-cols-2"
          >
            {tracks.map((group) => (
              <li key={group.track}>
                <AchievementTrackRow
                  group={group}
                  currentStreak={currentStreak}
                  newIds={newIds}
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {badges.length > 0 && (
        <div>
          <h3 className={SECTION_HEADING}>Badges</h3>
          <ul
            aria-label="Badges"
            className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3"
          >
            {[...badges].sort(byBadgeOrder).map((badge) => (
              <li
                key={badge.id}
                className={`flex items-center gap-3 rounded-[20px] p-4 ${
                  badge.isEarned ? 'ios-tracker-card-done' : 'ios-tracker-card'
                }`}
              >
                <AchievementMedal
                  medal={badge.isEarned ? 'gold' : null}
                  Icon={getAchievementIcon(badge.icon)}
                  decorative
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-(--color-foreground)">
                      {badge.name}
                    </p>
                    {newIds.has(badge.id) && <NewMark />}
                  </div>
                  <span className="block text-xs text-(--color-text-secondary)">
                    {badge.description}
                  </span>
                  <span className="mt-1 block text-xs font-medium text-(--color-brand-text) tabular-nums dark:text-(--color-brand-text-light)">
                    {badge.isEarned && badge.earnedAt
                      ? formatEarnedDate(badge.earnedAt)
                      : formatProgress(badge)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default ProgressAchievements;
