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

// Category and type labels share one subtle tinted style; the brand color marks earned.
const CHIP =
  'rounded-full bg-(--color-brand-primary)/10 px-2 py-0.5 text-xs text-(--color-text-secondary)';

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard = memo(function AchievementCard({
  achievement,
}: AchievementCardProps) {
  const {
    name,
    description,
    icon,
    isEarned,
    earnedAt,
    progress,
    category,
    type,
  } = achievement;

  return (
    <div
      className={`h-full rounded-[20px] p-4 transition-colors sm:rounded-2xl sm:ring-1 sm:ring-inset ${
        isEarned
          ? 'ios-tracker-card-done sm:bg-(--color-brand-primary)/8 sm:ring-(--color-brand-primary)/50'
          : 'ios-tracker-card sm:bg-(--color-surface)/60 sm:ring-(--color-border-primary)/50 sm:hover:ring-(--color-brand-primary)/40 dark:sm:bg-(--color-surface-secondary)/60'
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
          <div className="mb-2 flex items-center justify-between">
            <h4 className="text-sm font-semibold text-(--color-foreground)">
              {name}
            </h4>

            {isEarned && (
              <div className="shrink-0 rounded-full bg-(--color-brand-primary) px-2 py-1 text-xs font-medium text-(--color-primary-foreground)">
                ✓ Earned
              </div>
            )}
          </div>

          <p className="mb-3 text-xs text-(--color-text-secondary)">
            {description}
          </p>

          {/* Progress Bar */}
          {!isEarned && progress && (
            <ProgressBar
              current={progress.currentValue}
              target={progress.targetValue}
              percentage={progress.progressPercentage}
            />
          )}

          {/* Achievement Metadata */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className={CHIP}>{getCategoryLabel(category)}</span>
              <span className={CHIP}>{getTypeLabel(type)}</span>
            </div>

            {isEarned && earnedAt && (
              <span className="text-xs text-(--color-text-secondary)">
                {parseUTCTimestamp(earnedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
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

function getTypeLabel(type: string): string {
  switch (type) {
    case 'habit_creation':
      return 'Creation';
    case 'streak':
      return 'Streak';
    case 'completion':
      return 'Completion';
    case 'special_achievement':
      return 'Special';
    case 'perfect_completion':
      return 'Perfect';
    case 'activity_tracking':
      return 'Activity';
    default:
      return type;
  }
}

export default AchievementCard;
