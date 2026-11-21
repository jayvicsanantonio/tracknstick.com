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
    return achievements.filter(
      (achievement) => achievement.category === categoryKey,
    ).length;
  };

  const getEarnedCount = (categoryKey: string) => {
    if (categoryKey === 'all')
      return achievements.filter((a) => a.isEarned).length;
    return achievements.filter(
      (achievement) =>
        achievement.category === categoryKey && achievement.isEarned,
    ).length;
  };

  return (
    <div>
      <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]">
        {categories.map((category) => {
          const count = getCategoryCount(category.key);
          const earnedCount = getEarnedCount(category.key);
          const isSelected = selectedCategory === category.key;

          // Don't show categories with no achievements (except 'all')
          if (count === 0 && category.key !== 'all') return null;

          return (
            <button
              key={category.key}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onCategoryChange?.(category.key)}
              className={`flex min-h-11 shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-medium whitespace-nowrap ring-1 transition-colors ring-inset ${
                isSelected
                  ? 'bg-(--color-brand-primary) text-(--color-primary-foreground) ring-(--color-brand-primary)'
                  : 'text-(--color-text-secondary) ring-(--color-border-primary)/60 hover:bg-(--color-brand-primary)/8 hover:text-(--color-foreground)'
              }`}
            >
              <category.icon className="h-4 w-4" aria-hidden="true" />
              <span>{category.label}</span>
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  isSelected
                    ? 'bg-(--color-primary-foreground)/15'
                    : 'bg-(--color-muted)'
                }`}
              >
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
