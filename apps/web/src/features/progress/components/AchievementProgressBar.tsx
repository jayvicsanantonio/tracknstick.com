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
        <span className="text-xs text-(--color-text-secondary) tabular-nums">
          {current} / {target}
        </span>
        <span className="text-xs font-medium text-(--color-brand-text) dark:text-(--color-brand-text-light)">
          {Math.round(clampedPercentage)}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-(--color-brand-primary)/16">
        <div
          className="h-full rounded-full bg-(--color-brand-primary) shadow-[0_0_8px_color-mix(in_oklab,var(--color-brand-primary)_40%,transparent)] transition-all duration-300 ease-out"
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
    </div>
  );
});

export default AchievementProgressBar;
