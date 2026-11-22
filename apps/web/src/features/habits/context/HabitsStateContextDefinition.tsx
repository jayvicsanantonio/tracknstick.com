import { createContext } from 'react';
import { Habit } from '@/features/habits/types/Habit';

export type EditHabitTab = 'edit' | 'stats';

export interface HabitsStateContextValue {
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
  editDialogTab: EditHabitTab;
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
  openEditDialog: (habit: Habit, initialTab?: EditHabitTab) => void;
}

export const HabitsStateContext = createContext<HabitsStateContextValue | null>(
  null,
);
