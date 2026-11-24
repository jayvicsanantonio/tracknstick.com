import { createContext } from 'react';
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
}

export const HabitsStateContext = createContext<HabitsStateContextValue | null>(
  null,
);
