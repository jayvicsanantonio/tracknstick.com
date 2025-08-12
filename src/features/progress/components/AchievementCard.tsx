// Individual achievement card component
// Displays achievement details with progress information

import { memo } from 'react';
import { Achievement } from '../types/Achievement';
import ProgressBar from './AchievementProgressBar';
import { getAchievementIcon, getIconColorClass, getIconBackgroundClass } from '../utils/achievementIcons';

interface AchievementCardProps {
  achievement: Achievement;
}

const AchievementCard = memo(function AchievementCard({
  achievement,
}: AchievementCardProps) {
  const { name, description, icon, isEarned, earnedAt, progress, category, type } = achievement;

  return (
    <div
      className={`
        bg-(--color-surface) dark:bg-(--color-brand-light) 
        rounded-lg p-4 shadow-md border-2 transition-all duration-200
        ${isEarned 
          ? 'border-(--color-brand-primary) bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 dark:border-yellow-400' 
          : 'border-transparent hover:border-(--color-brand-primary)/30 dark:hover:border-(--color-brand-primary)/50'
        }
      `}
    >
      {/* Achievement Header */}
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div
          className={`
            rounded-full p-3 flex-shrink-0
            ${getIconBackgroundClass(category, isEarned)}
          `}
        >
          {(() => {
            const IconComponent = getAchievementIcon(icon);
            return (
              <IconComponent 
                className={`w-6 h-6 ${isEarned ? 'text-white' : getIconColorClass(category, isEarned)}`}
                aria-label={name}
              />
            );
          })()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`
              font-semibold text-sm
              ${isEarned 
                ? 'text-(--color-brand-primary) dark:text-yellow-300' 
                : 'text-(--color-brand-tertiary) dark:text-gray-200'
              }
            `}>
              {name}
            </h4>
            
            {isEarned && (
              <div className="text-xs bg-(--color-brand-primary) text-white px-2 py-1 rounded-full">
                ✓ Earned
              </div>
            )}
          </div>

          <p className="text-(--color-text-secondary) dark:text-gray-300 text-xs mb-3">
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
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center space-x-2">
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${getCategoryColor(category)}
              `}>
                {getCategoryLabel(category)}
              </span>
              <span className={`
                text-xs px-2 py-1 rounded-full
                ${getTypeColor(type)}
              `}>
                {getTypeLabel(type)}
              </span>
            </div>
            
            {isEarned && earnedAt && (
              <span className="text-xs text-(--color-text-secondary) dark:text-gray-400">
                {new Date(earnedAt).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

function getCategoryColor(category: string): string {
  switch (category) {
    case 'getting_started':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'consistency':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'dedication':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'milestones':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
}

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

function getTypeColor(type: string): string {
  switch (type) {
    case 'habit_creation':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300';
    case 'streak':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'completion':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
    case 'special_achievement':
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
    case 'perfect_completion':
      return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-300';
    case 'activity_tracking':
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
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