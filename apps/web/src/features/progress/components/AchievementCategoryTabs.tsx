// Category tabs component for achievements
// Allows filtering achievements by category

import { memo } from 'react';
import { Trophy, Sprout, Flame, Shield, Star } from 'lucide-react';
import { triggerHaptic } from '@shared/utils/haptics';
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
              onClick={() => {
                triggerHaptic('selection');
                onCategoryChange?.(category.key);
              }}
              className={`flex min-h-10 shrink-0 cursor-pointer items-center gap-2 rounded-full px-3.5 py-2 text-[13px] font-semibold whitespace-nowrap ring-1 transition-[background-color,color,transform,box-shadow] ring-inset active:scale-95 sm:min-h-10 sm:text-sm ${
                isSelected
                  ? 'bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-[0_2px_10px_color-mix(in_oklab,var(--color-brand-primary)_35%,transparent)] ring-(--color-brand-primary)'
                  : 'bg-(--color-brand-primary)/8 text-(--color-text-secondary) ring-(--color-brand-primary)/18 hover:bg-(--color-brand-primary)/14 hover:text-(--color-foreground)'
              }`}
            >
              <category.icon className="h-4 w-4" aria-hidden="true" />
              <span>{category.label}</span>
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  isSelected
                    ? 'bg-(--color-primary-foreground)/18'
                    : 'bg-(--color-brand-primary)/12 text-(--color-brand-text) dark:text-(--color-brand-text-light)'
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
