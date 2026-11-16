import { useState, ReactNode, useCallback, useMemo } from 'react';
import { useToggle } from '@shared/hooks/use-toggle';
import { Habit } from '@/features/habits/types/Habit';
import { HabitsStateContext } from './HabitsStateContextDefinition';

export function HabitsStateProvider({ children }: { children: ReactNode }) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showAddHabitDialog, toggleShowAddHabitDialog] = useToggle(false);
  const [showEditHabitDialog, toggleShowEditHabitDialog] = useToggle(false);
  const openEditDialog = useCallback(
    (habit: Habit) => {
      setEditingHabit(habit);

      if (!showEditHabitDialog) {
        toggleShowEditHabitDialog();
      }
    },
    [showEditHabitDialog, toggleShowEditHabitDialog],
  );

  const value = useMemo(
    () => ({
      editingHabit,
      setEditingHabit,
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      openEditDialog,
    }),
    [
      editingHabit,
      setEditingHabit,
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      openEditDialog,
    ],
  );

  return (
    <HabitsStateContext.Provider value={value}>
      {children}
    </HabitsStateContext.Provider>
  );
}

// Re-export for backward compatibility
export { HabitsStateContext } from './HabitsStateContextDefinition';
