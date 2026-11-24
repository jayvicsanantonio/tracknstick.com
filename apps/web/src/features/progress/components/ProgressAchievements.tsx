// The full list of achievements on the progress page, filtered by category.
// Earned ones come first, then those under way, then those not started.

import { memo } from 'react';
import { Trophy } from 'lucide-react';
import EmptyState from '@shared/components/feedback/EmptyState';
import { Achievement } from '../types/Achievement';
import AchievementCard from './AchievementCard';
import AchievementCategoryTabs from './AchievementCategoryTabs';

interface ProgressAchievementsProps {
  achievements: Achievement[];
  selectedCategory?: string;
  onCategoryChange?: (category: string) => void;
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
  const earnedAchievements = filteredAchievements.filter(
    (achievement) => achievement.isEarned,
  );
  // Under way once anything counts toward it; otherwise not started yet.
  const inProgressAchievements = filteredAchievements.filter(
    (achievement) =>
      !achievement.isEarned && (achievement.progress?.currentValue ?? 0) > 0,
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
