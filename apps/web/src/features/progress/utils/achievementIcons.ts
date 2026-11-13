// Achievement icon mapping using Lucide React icons
// Maps icon name strings to Lucide React components

import * as Icons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// Get Lucide icon component by name
export const getAchievementIcon = (iconName?: string): LucideIcon => {
  if (!iconName) return Icons.Trophy;

  // Get the icon component from Lucide React
  const IconComponent = (Icons as unknown as Record<string, LucideIcon>)[
    iconName
  ];

  // Return the icon or fallback to Trophy
  return IconComponent ?? Icons.Trophy;
};

// Get icon color class based on achievement category
export const getIconColorClass = (category: string, isEarned: boolean) => {
  if (isEarned) {
    return 'text-yellow-400 dark:text-yellow-300'; // Gold color for earned achievements
  }

  switch (category) {
    case 'getting_started':
      return 'text-green-500 dark:text-green-400';
    case 'consistency':
      return 'text-blue-500 dark:text-blue-400';
    case 'dedication':
      return 'text-purple-500 dark:text-purple-400';
    case 'milestones':
      return 'text-orange-500 dark:text-orange-400';
    default:
      return 'text-gray-500 dark:text-gray-400';
  }
};

// Get background color class based on achievement category
export const getIconBackgroundClass = (category: string, isEarned: boolean) => {
  if (isEarned) {
    return 'bg-gradient-to-br from-yellow-400 to-orange-500 dark:from-yellow-500 dark:to-orange-600';
  }

  switch (category) {
    case 'getting_started':
      return 'bg-green-100 dark:bg-green-900/30';
    case 'consistency':
      return 'bg-blue-100 dark:bg-blue-900/30';
    case 'dedication':
      return 'bg-purple-100 dark:bg-purple-900/30';
    case 'milestones':
      return 'bg-orange-100 dark:bg-orange-900/30';
    default:
      return 'bg-gray-100 dark:bg-gray-800/30';
  }
};
