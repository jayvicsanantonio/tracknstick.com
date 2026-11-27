// The full list of achievements on the progress page, filtered by category.
// Earned ones come first, newest first, then those under way, closest first, then those not started.

import { memo } from 'react';
import { Trophy } from 'lucide-react';
import EmptyState from '@shared/components/feedback/EmptyState';
import { parseUTCTimestamp } from '@shared/utils/date/formatDate';
import { Achievement } from '../types/Achievement';
import AchievementCard from './AchievementCard';
import AchievementCategoryTabs from './AchievementCategoryTabs';

interface ProgressAchievementsProps {
  achievements: Achievement[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
}

/** When an achievement was earned, for ordering; 0 when there is no date. */
function earnedTime(achievement: Achievement): number {
  return achievement.earnedAt
    ? parseUTCTimestamp(achievement.earnedAt).getTime()
    : 0;
}

const ProgressAchievements = memo(function ProgressAchievements({
  achievements,
  selectedCategory = 'all',
  onCategoryChange,
}: ProgressAchievementsProps) {
  // Filter achievements by selected category
  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter(
          (achievement) => achievement.category === selectedCategory,
        );

  // Group achievements by earned/unearned
  const earnedAchievements = filteredAchievements
    .filter((achievement) => achievement.isEarned)
    .sort((a, b) => earnedTime(b) - earnedTime(a));
  // Under way once anything counts toward it; otherwise not started yet.
  const inProgressAchievements = filteredAchievements
    .filter(
      (achievement) =>
        !achievement.isEarned && (achievement.progress?.currentValue ?? 0) > 0,
    )
    .sort(
      (a, b) =>
        (b.progress?.progressPercentage ?? 0) -
        (a.progress?.progressPercentage ?? 0),
    );
  const notStartedAchievements = filteredAchievements.filter(
    (achievement) =>
      !achievement.isEarned && (achievement.progress?.currentValue ?? 0) === 0,
  );

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

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <AchievementCategoryTabs
        selectedCategory={selectedCategory}
        onCategoryChange={onCategoryChange}
        achievements={achievements}
      />

      {/* Earned Achievements */}
      {earnedAchievements.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-(--color-text-secondary) uppercase">
            Earned ({earnedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {earnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* In Progress Achievements */}
      {inProgressAchievements.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-(--color-text-secondary) uppercase">
            In Progress ({inProgressAchievements.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {inProgressAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* Not Started Achievements */}
      {notStartedAchievements.length > 0 && (
        <div>
          <h3 className="mb-3 text-xs font-semibold tracking-wide text-(--color-text-secondary) uppercase">
            Not Started ({notStartedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {notStartedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProgressAchievements;
