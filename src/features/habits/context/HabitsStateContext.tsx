import {
  createContext,
  useState,
  useContext,
  ReactNode,
  useCallback,
  useMemo,
} from 'react';
import { useToggle } from '@/hooks/use-toggle';
import { Habit } from '@/features/habits/types/Habit';

interface HabitsStateContextValue {
  isEditMode: boolean;
  toggleIsEditMode: () => void;
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
  showAddHabitDialog: boolean;
  toggleShowAddHabitDialog: () => void;
  showEditHabitDialog: boolean;
  toggleShowEditHabitDialog: () => void;
  isHabitsOverviewMode: boolean;
  toggleisHabitsOverviewMode: () => void;
  isProgressOverviewMode: boolean;
  toggleisProgressOverviewMode: () => void;
  openEditDialog: (habit: Habit) => void;
}

const HabitsStateContext = createContext<HabitsStateContextValue | null>(null);

export function HabitsStateProvider({ children }: { children: ReactNode }) {
  const [isEditMode, toggleIsEditMode] = useToggle(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [showAddHabitDialog, toggleShowAddHabitDialog] = useToggle(false);
  const [showEditHabitDialog, toggleShowEditHabitDialog] = useToggle(false);
  const [isHabitsOverviewMode, toggleisHabitsOverviewMode] = useToggle(false);
  const [isProgressOverviewMode, toggleisProgressOverviewMode] =
    useToggle(false);
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
      isEditMode,
      toggleIsEditMode,
      editingHabit,
      setEditingHabit,
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      isHabitsOverviewMode,
      toggleisHabitsOverviewMode,
      openEditDialog,
      isProgressOverviewMode,
      toggleisProgressOverviewMode,
    }),
    [
      isEditMode,
      toggleIsEditMode,
      editingHabit,
      setEditingHabit,
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      isHabitsOverviewMode,
      toggleisHabitsOverviewMode,
      openEditDialog,
      isProgressOverviewMode,
      toggleisProgressOverviewMode,
    ],
  );

  return (
    <HabitsStateContext.Provider value={value}>
      {children}
    </HabitsStateContext.Provider>
  );
}

export function useHabitsContext() {
  const context = useContext(HabitsStateContext);
  if (context === null) {
    throw new Error(
      'useHabitsContext must be used within a HabitsStateProvider',
    );
  }
  return context;
}
