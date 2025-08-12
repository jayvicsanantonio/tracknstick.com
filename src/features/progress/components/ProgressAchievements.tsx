import { memo } from 'react';
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
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(achievement => achievement.category === selectedCategory);

  // Group achievements by earned/unearned
  const earnedAchievements = filteredAchievements.filter(achievement => achievement.isEarned);
  const unearnedAchievements = filteredAchievements.filter(achievement => !achievement.isEarned);

  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-(--color-text-secondary) dark:text-(--color-brand-text-light)">
          No achievements available yet.
        </p>
      </div>
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
          <h3 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) font-semibold text-lg mb-4">
            Earned ({earnedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {earnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}

      {/* In Progress / Unearned Achievements */}
      {unearnedAchievements.length > 0 && (
        <div>
          <h3 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) font-semibold text-lg mb-4">
            In Progress ({unearnedAchievements.length})
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {unearnedAchievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

export default ProgressAchievements;
