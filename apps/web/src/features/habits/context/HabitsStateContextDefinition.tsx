import { createContext } from 'react';
import type { AwardedAchievementResponse } from '@tracknstick/contracts';
import { Habit, HabitPayload } from '@/features/habits/types/Habit';

export type EditHabitTab = 'edit' | 'stats';

/** What the Add dialog's form starts with, as when a starter habit is chosen. */
export type HabitDraft = Pick<HabitPayload, 'name' | 'icon' | 'frequency'>;

export interface HabitsStateContextValue {
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
  editDialogTab: EditHabitTab;
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
  /** The starter habit the Add dialog was opened with; null for a blank form. */
  addHabitDraft: HabitDraft | null;
  /** Opens the Add dialog, filled in with the draft when one is given. */
  openAddHabitDialog: (draft?: HabitDraft) => void;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
  openEditDialog: (habit: Habit, initialTab?: EditHabitTab) => void;
  /** Newly earned achievements still to celebrate, the one shown first. */
  achievementCelebrations: AwardedAchievementResponse[];
  /** Queues achievements a check just awarded for the celebration sheet. */
  celebrateAchievements: (achievements: AwardedAchievementResponse[]) => void;
  /** Moves past the achievement being celebrated. */
  dismissAchievementCelebration: () => void;
  /** Drops every celebration still queued, as when the user changes. */
  clearAchievementCelebrations: () => void;
}

export const HabitsStateContext = createContext<HabitsStateContextValue | null>(
  null,
);
