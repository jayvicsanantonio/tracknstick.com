// Filtering vocabulary for the habits overview
// Lives beside the component rather than inside it so fast refresh keeps
// working and so the predicate has one definition

import { Habit } from '@/features/habits/types/Habit';

/**
 * A habit is archived once it has an end date. Spelled four different ways
 * before -- twice in the tab filter, twice in the row badge.
 */
export const isArchived = (habit: Habit) => Boolean(habit.endDate);

export type OverviewTab = 'all' | 'active' | 'archived';

// Exhaustive by type, so the filter needs no fallthrough default. The tab was
// previously valued 'completed', which collides with Habit.completed -- a
// different concept entirely (today's completion), while the label already
// said "Archived".
export const TAB_FILTER: Record<OverviewTab, (habit: Habit) => boolean> = {
  all: () => true,
  active: (habit) => !isArchived(habit),
  archived: isArchived,
};
