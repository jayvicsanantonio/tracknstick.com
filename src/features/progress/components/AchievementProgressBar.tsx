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
        <span className="text-(--color-text-secondary) text-xs dark:text-gray-300">
          Progress: {current} / {target}
        </span>
        <span className="text-(--color-brand-primary) dark:text-(--color-brand-secondary) text-xs font-medium">
          {Math.round(clampedPercentage)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600/50">
        <div
          className="from-(--color-brand-primary) to-(--color-brand-secondary) dark:from-(--color-brand-secondary) dark:to-(--color-brand-primary) h-2 rounded-full bg-gradient-to-r transition-all duration-300 ease-out"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
});

export default AchievementProgressBar;
