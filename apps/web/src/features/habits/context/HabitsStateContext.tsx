import { useState, ReactNode, useCallback, useMemo } from 'react';
import type { AwardedAchievementResponse } from '@tracknstick/contracts';
import { useToggle } from '@shared/hooks/use-toggle';
import { Habit } from '@/features/habits/types/Habit';
import {
  HabitsStateContext,
  type EditHabitTab,
  type HabitDraft,
} from './HabitsStateContextDefinition';

export function HabitsStateProvider({ children }: { children: ReactNode }) {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [editDialogTab, setEditDialogTab] = useState<EditHabitTab>('edit');
  const [showAddHabitDialog, toggleAddHabitDialog] = useToggle(false);
  const [addHabitDraft, setAddHabitDraft] = useState<HabitDraft | null>(null);
  const [showEditHabitDialog, toggleShowEditHabitDialog] = useToggle(false);
  const [achievementCelebrations, setAchievementCelebrations] = useState<
    AwardedAchievementResponse[]
  >([]);

  const celebrateAchievements = useCallback(
    (achievements: AwardedAchievementResponse[]) => {
      setAchievementCelebrations((queued) => [...queued, ...achievements]);
    },
    [],
  );

  const dismissAchievementCelebration = useCallback(() => {
    setAchievementCelebrations((queued) => queued.slice(1));
  }, []);

  const clearAchievementCelebrations = useCallback(() => {
    setAchievementCelebrations([]);
  }, []);

  // Opening with the toggle starts a blank form, never a starter habit left
  // over from an earlier opening.
  const toggleShowAddHabitDialog = useCallback(() => {
    if (!showAddHabitDialog) setAddHabitDraft(null);
    toggleAddHabitDialog();
  }, [showAddHabitDialog, toggleAddHabitDialog]);

  const openAddHabitDialog = useCallback(
    (draft?: HabitDraft) => {
      setAddHabitDraft(draft ?? null);
      if (!showAddHabitDialog) toggleAddHabitDialog();
    },
    [showAddHabitDialog, toggleAddHabitDialog],
  );

  const openEditDialog = useCallback(
    (habit: Habit, initialTab: EditHabitTab = 'edit') => {
      setEditingHabit(habit);
      setEditDialogTab(initialTab);

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
      editDialogTab,
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      addHabitDraft,
      openAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      openEditDialog,
      achievementCelebrations,
      celebrateAchievements,
      dismissAchievementCelebration,
      clearAchievementCelebrations,
    }),
    [
      editingHabit,
      setEditingHabit,
      editDialogTab,
      showAddHabitDialog,
      toggleShowAddHabitDialog,
      addHabitDraft,
      openAddHabitDialog,
      showEditHabitDialog,
      toggleShowEditHabitDialog,
      openEditDialog,
      achievementCelebrations,
      celebrateAchievements,
      dismissAchievementCelebration,
      clearAchievementCelebrations,
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
