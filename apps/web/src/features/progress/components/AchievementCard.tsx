// Individual achievement card component
// Displays achievement details with progress information

import { memo } from 'react';
import { Achievement } from '../types/Achievement';
import ProgressBar from './AchievementProgressBar';
import { parseUTCTimestamp } from '@shared/utils/date/formatDate';
import {
  getAchievementIcon,
  getIconColorClass,
  getIconBackgroundClass,
} from '../utils/achievementIcons';

// An earned date reads as "Nov 18, 2026" in the user's own calendar day.
const EARNED_DATE_OPTIONS: Intl.DateTimeFormatOptions = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
};

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard = memo(function AchievementCard({
  achievement,
}: AchievementCardProps) {
  const { name, description, icon, isEarned, earnedAt, progress } = achievement;

  return (
    <div
      className={`h-full rounded-[20px] p-4 transition-colors ${
        isEarned
          ? 'ios-tracker-card-done'
          : 'ios-tracker-card hover:border-(--color-brand-primary)/40'
      }`}
    >
      {/* Achievement Header */}
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`flex-shrink-0 rounded-xl p-2.5 ${getIconBackgroundClass(isEarned)}`}
        >
          {(() => {
            const IconComponent = getAchievementIcon(icon);
            return (
              <IconComponent
                className={`h-5 w-5 ${getIconColorClass(isEarned)}`}
                aria-label={name}
              />
            );
          })()}
        </div>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <h4 className="mb-1 text-sm font-semibold text-(--color-foreground)">
            {name}
          </h4>

          <p className="text-xs text-(--color-text-secondary)">{description}</p>

          {/* Progress Bar */}
          {!isEarned && progress && (
            <div className="mt-3">
              <ProgressBar
                current={progress.currentValue}
                target={progress.targetValue}
                percentage={progress.progressPercentage}
              />
            </div>
          )}

          {isEarned && earnedAt && (
            <p className="mt-2 text-xs font-medium text-(--color-brand-text) dark:text-(--color-brand-text-light)">
              Earned{' '}
              {parseUTCTimestamp(earnedAt).toLocaleDateString(
                undefined,
                EARNED_DATE_OPTIONS,
              )}
            </p>
          )}
        </div>
      </div>
    </div>
  );
});

export default AchievementCard;
