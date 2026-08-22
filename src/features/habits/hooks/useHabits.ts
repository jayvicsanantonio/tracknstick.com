import { useCallback, useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { useDate } from '@app/providers/useDate';

import toggleOnSound from '@/assets/audio/habit-toggled-on.mp3';
import toggleOffSound from '@/assets/audio/habit-toggled-off.mp3';
import completedAllHabits from '@/assets/audio/completed-all-habits.mp3';
import { Habit, HabitPayload } from '@/features/habits/types/Habit';
import {
  fetchHabits,
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion,
  habitsForDateKey,
  mutateHabitLists,
} from '@/features/habits/api';
import { achievementApi, mutateProgress } from '@/features/progress/api';
import { useAuth } from '@clerk/clerk-react';

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  isValidating: boolean;
  error: unknown;
  animatingHabitId: string | null;
  mutateHabits: () => Promise<Habit[] | undefined>;
  addHabit: (habitData: HabitPayload) => Promise<void>;
  updateHabit: (
    habitId: string,
    habitData: Partial<HabitPayload>,
  ) => Promise<void>;
  deleteHabit: (habitId: string, habitName: string) => Promise<void>;
  toggleHabit: (habitId: string) => Promise<void>;
  completionRate: number;
}
export function useHabits(): UseHabitsReturn {
  const { toast } = useToast();
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);
  const { date, setDate, timeZone } = useDate();
  const { isSignedIn } = useAuth();

  // Check for new achievements
  const checkAchievements = useCallback(async () => {
    try {
      const result = await achievementApi.checkAchievements(timeZone);
      if (result.count > 0) {
        // Show toast for new achievements
        result.newAchievements.forEach((achievement) => {
          toast({
            title: '🏆 Achievement Earned!',
            description: `${achievement.name}: ${achievement.description}`,
            duration: 5000,
          });
        });
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [toast, timeZone]);

  const habitsEndpointKey =
    date && isSignedIn ? habitsForDateKey(date, timeZone) : null;

  const {
    data: fetchedHabits,
    error,
    isLoading,
    isValidating,
    mutate: mutateHabits,
  } = useSWR<Habit[], unknown>(
    habitsEndpointKey,
    () => (date ? fetchHabits(date, timeZone) : Promise.resolve([])),
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const addHabit = useCallback(
    async (habitData: HabitPayload) => {
      try {
        await apiAddHabit(habitData);
        toast({
          description: `Habit "${habitData.name}" added successfully.`,
        });
        setDate(new Date());
        // Invalidate both date-specific and all-habits caches
        void mutateHabits();
        void mutateHabitLists();
        // A new habit changes how many were scheduled today.
        void mutateProgress();
        // Check for achievements after adding a habit
        void checkAchievements();
      } catch (err) {
        console.error('Failed to add habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to add habit "${habitData.name}". Please try again.`,
        });
      }
    },
    [mutateHabits, toast, setDate, checkAchievements],
  );

  const habits = useMemo(() => fetchedHabits ?? [], [fetchedHabits]);

  const updateHabit = useCallback(
    async (habitId: string, habitData: Partial<HabitPayload>) => {
      // The payload carries Date objects; the cache holds wire strings. Convert
      // at this one merge point so the cache stays homogeneous instead of
      // holding one element in a different shape until revalidation.
      const optimistic: Partial<Habit> = {
        ...habitData,
        startDate: habitData.startDate?.toISOString(),
        endDate: habitData.endDate?.toISOString(),
      };

      void mutateHabits(
        (currentHabits) =>
          currentHabits?.map((h) =>
            h.id === habitId
              ? {
                  ...h,
                  ...optimistic,
                  startDate: optimistic.startDate ?? h.startDate,
                }
              : h,
          ),
        false,
      );

      try {
        await apiUpdateHabit(habitId, habitData);
        toast({
          description: `Habit "${habitData.name ?? 'habit'}" updated.`,
        });
        // Invalidate both date-specific and all-habits caches
        void mutateHabits();
        void mutateHabitLists();
      } catch (err) {
        console.error('Failed to update habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to update habit "${
            habitData.name ?? 'habit'
          }". Reverting changes.`,
        });
        void mutateHabits();
        void mutateHabitLists();
      }
    },
    [mutateHabits, toast],
  );

  const deleteHabit = useCallback(
    async (habitId: string, habitName: string) => {
      void mutateHabits(
        (currentHabits) => currentHabits?.filter((h) => h.id !== habitId),
        false,
      );

      try {
        await apiDeleteHabit(habitId);
        toast({ description: `Habit "${habitName}" deleted.` });
        // Invalidate both date-specific and all-habits caches
        void mutateHabits();
        void mutateHabitLists();
        void mutateProgress();
      } catch (err) {
        console.error('Failed to delete habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to delete habit "${habitName}". Restoring habit.`,
        });
        void mutateHabits();
        void mutateHabitLists();
      }
    },
    [mutateHabits, toast],
  );

  const internalToggleHabitCompletion = useCallback(
    async (habitId: string) => {
      void mutateHabits(
        (currentHabits = []) =>
          currentHabits.map((h) =>
            h.id === habitId ? { ...h, completed: !h.completed } : h,
          ),
        false,
      );

      try {
        if (!date) throw new Error('Date context is not available');
        await apiToggleHabitCompletion(habitId, date, timeZone);
        void mutateHabits();
        // Today's rate, the month's chart and both streaks all just moved.
        void mutateProgress();
        // Check for achievements after toggling habit completion
        void checkAchievements();
      } catch (err) {
        console.error('Failed to toggle habit completion:', err);
        toast({
          variant: 'destructive',
          description: 'Failed to update habit status. Reverting change.',
        });
        void mutateHabits();
      }
    },
    [date, timeZone, mutateHabits, toast, checkAchievements],
  );

  const completionRate = useMemo(() => {
    const completedHabits = habits.filter((habit) => habit.completed).length;
    const totalHabits = habits.length;
    return totalHabits > 0
      ? Math.round((completedHabits / totalHabits) * 100)
      : 0;
  }, [habits]);

  const toggleHabit = useCallback(
    async (id: string) => {
      const habit = habits.find((h) => h.id === id);

      if (habit && !habit.completed) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setAnimatingHabitId(id);
        const newTimeoutId = setTimeout(() => setAnimatingHabitId(null), 1000);
        setTimeoutId(newTimeoutId);
      }

      await internalToggleHabitCompletion(id);

      const allHabitsWereCompletedBeforeToggle =
        habits.filter((h) => h.completed).length === habits.length - 1 &&
        !habit?.completed;

      if (allHabitsWereCompletedBeforeToggle) {
        const audio = new Audio(completedAllHabits);
        await audio.play().catch((e) => console.error('Audio play failed:', e));
      } else if (habit) {
        const audio = !habit.completed
          ? new Audio(toggleOnSound)
          : new Audio(toggleOffSound);
        await audio.play().catch((e) => console.error('Audio play failed:', e));
      }
    },
    [habits, timeoutId, internalToggleHabitCompletion],
  );

  return {
    habits,
    isLoading,
    isValidating,
    error,
    animatingHabitId,
    mutateHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    completionRate,
  };
}
