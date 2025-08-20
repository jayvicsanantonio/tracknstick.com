// Achievement statistics component
// Shows summary statistics for user achievements

import { memo } from 'react';
import { Trophy, Sprout, Flame, Shield, Star } from 'lucide-react';
import { AchievementStats } from '../types/Achievement';

interface AchievementStatsProps {
  stats: AchievementStats;
}

const AchievementStatsComponent = memo(function AchievementStatsComponent({
  stats,
}: AchievementStatsProps) {
  const {
    totalAchievements,
    earnedAchievements,
    completionPercentage,
    categoryStats,
  } = stats;

  return (
    <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Progress */}
      <div className="bg-(--color-surface) dark:bg-(--color-brand-light) rounded-lg p-4 shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-(--color-text-secondary) dark:text-(--color-brand-text-light) text-sm">
              Total Progress
            </p>
            <p className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) text-2xl font-bold">
              {earnedAchievements}/{totalAchievements}
            </p>
          </div>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <div className="mt-2">
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="from-(--color-brand-primary) to-(--color-brand-secondary) h-2 rounded-full bg-gradient-to-r"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <p className="text-(--color-brand-primary) dark:text-(--color-brand-secondary) mt-1 text-sm font-medium">
            {completionPercentage}% Complete
          </p>
        </div>
      </div>

      {/* Category Stats */}
      {Object.entries(categoryStats).map(([category, data]) => {
        const percentage =
          data.total > 0 ? Math.round((data.earned / data.total) * 100) : 0;

        return (
          <div
            key={category}
            className="bg-(--color-surface) dark:bg-(--color-brand-light) rounded-lg p-4 shadow-md"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-(--color-text-secondary) text-sm dark:text-gray-300">
                  {getCategoryLabel(category)}
                </p>
                <p className="text-(--color-brand-tertiary) text-xl font-bold dark:text-gray-100">
                  {data.earned}/{data.total}
                </p>
              </div>
              <div className="text-xl">
                {getCategoryIconComponent(category)}
              </div>
            </div>
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${getCategoryColor(category)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <p className="text-(--color-text-secondary) mt-1 text-sm dark:text-gray-300">
                {percentage}%
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
});

function getCategoryLabel(category: string): string {
  switch (category) {
    case 'getting_started':
      return 'Getting Started';
    case 'consistency':
      return 'Consistency';
    case 'dedication':
      return 'Dedication';
    case 'milestones':
      return 'Milestones';
    default:
      return category;
  }
}

function getCategoryIconComponent(category: string) {
  const iconClass = 'w-6 h-6';

  switch (category) {
    case 'getting_started':
      return (
        <Sprout className={`${iconClass} text-green-500 dark:text-green-400`} />
      );
    case 'consistency':
      return (
        <Flame className={`${iconClass} text-blue-500 dark:text-blue-400`} />
      );
    case 'dedication':
      return (
        <Shield
          className={`${iconClass} text-purple-500 dark:text-purple-400`}
        />
      );
    case 'milestones':
      return (
        <Star className={`${iconClass} text-orange-500 dark:text-orange-400`} />
      );
    default:
      return (
        <Trophy className={`${iconClass} text-gray-500 dark:text-gray-400`} />
      );
  }
}

function getCategoryColor(category: string): string {
  switch (category) {
    case 'getting_started':
      return 'bg-gradient-to-r from-green-400 to-green-500 dark:from-green-500 dark:to-green-600';
    case 'consistency':
      return 'bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600';
    case 'dedication':
      return 'bg-gradient-to-r from-purple-400 to-purple-500 dark:from-purple-500 dark:to-purple-600';
    case 'milestones':
      return 'bg-gradient-to-r from-orange-400 to-orange-500 dark:from-orange-500 dark:to-orange-600';
    default:
      return 'bg-gradient-to-r from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-600';
  }
}

export default AchievementStatsComponent;
