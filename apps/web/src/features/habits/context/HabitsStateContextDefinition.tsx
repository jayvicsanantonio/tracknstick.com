import { createContext } from 'react';
import { Habit } from '@/features/habits/types/Habit';

export interface HabitsStateContextValue {
  isEditMode: boolean;
  toggleIsEditMode: () => void;
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
  openEditDialog: (habit: Habit) => void;
}

export const HabitsStateContext = createContext<HabitsStateContextValue | null>(
  null,
);
