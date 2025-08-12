// Category tabs component for achievements
// Allows filtering achievements by category

import { memo } from 'react';
import { Trophy, Sprout, Flame, Shield, Star } from 'lucide-react';
import { Achievement } from '../types/Achievement';

interface AchievementCategoryTabsProps {
  selectedCategory: string;
  onCategoryChange?: (category: string) => void;
  achievements: Achievement[];
}

const categories = [
  { key: 'all', label: 'All', icon: Trophy },
  { key: 'getting_started', label: 'Getting Started', icon: Sprout },
  { key: 'consistency', label: 'Consistency', icon: Flame },
  { key: 'dedication', label: 'Dedication', icon: Shield },
  { key: 'milestones', label: 'Milestones', icon: Star },
];

const AchievementCategoryTabs = memo(function AchievementCategoryTabs({
  selectedCategory,
  onCategoryChange,
  achievements,
}: AchievementCategoryTabsProps) {
  // Calculate counts for each category
  const getCategoryCount = (categoryKey: string) => {
    if (categoryKey === 'all') return achievements.length;
    return achievements.filter(achievement => achievement.category === categoryKey).length;
  };

  const getEarnedCount = (categoryKey: string) => {
    if (categoryKey === 'all') return achievements.filter(a => a.isEarned).length;
    return achievements.filter(achievement => 
      achievement.category === categoryKey && achievement.isEarned
    ).length;
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <nav className="-mb-px flex space-x-8 overflow-x-auto">
        {categories.map((category) => {
          const count = getCategoryCount(category.key);
          const earnedCount = getEarnedCount(category.key);
          const isSelected = selectedCategory === category.key;
          
          // Don't show categories with no achievements (except 'all')
          if (count === 0 && category.key !== 'all') return null;

          return (
            <button
              key={category.key}
              onClick={() => onCategoryChange?.(category.key)}
              className={`
                flex items-center space-x-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors
                ${isSelected
                  ? 'border-(--color-brand-primary) text-(--color-brand-primary) dark:text-(--color-brand-secondary) dark:border-(--color-brand-secondary)'
                  : 'border-transparent text-(--color-text-secondary) hover:text-(--color-brand-tertiary) hover:border-gray-300 dark:text-gray-300 dark:hover:text-(--color-brand-secondary) dark:hover:border-gray-500'
                }
              `}
            >
              <category.icon className="w-4 h-4" aria-hidden="true" />
              <span>{category.label}</span>
              <span className={`
                px-2 py-1 text-xs rounded-full
                ${isSelected
                  ? 'bg-(--color-brand-primary) text-white dark:bg-(--color-brand-secondary) dark:text-gray-900'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-700/50 dark:text-gray-200'
                }
              `}>
                {earnedCount}/{count}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
});

export default AchievementCategoryTabs;