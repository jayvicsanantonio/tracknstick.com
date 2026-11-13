// Progress bar component for achievements
// Shows visual progress towards achievement completion

import { memo } from 'react';

interface AchievementProgressBarProps {
  current: number;
  target: number;
  percentage: number;
}

const AchievementProgressBar = memo(function AchievementProgressBar({
  current,
  target,
  percentage,
}: AchievementProgressBarProps) {
  const clampedPercentage = Math.min(100, Math.max(0, percentage));

  return (
    <div className="space-y-1">
      {/* Progress Text */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-(--color-text-secondary) dark:text-gray-300">
          Progress: {current} / {target}
        </span>
        <span className="text-xs font-medium text-(--color-brand-primary) dark:text-(--color-brand-secondary)">
          {Math.round(clampedPercentage)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600/50">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-(--color-brand-primary) to-(--color-brand-secondary) transition-all duration-300 ease-out dark:from-(--color-brand-secondary) dark:to-(--color-brand-primary)"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
});

export default AchievementProgressBar;
