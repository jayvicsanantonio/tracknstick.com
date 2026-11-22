import { useCallback, useState, useEffect, useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { useDate } from '@app/providers/useDate';

import { playSound, preloadSounds } from '@shared/utils/sound';
import { hapticTick } from '@shared/utils/haptics';
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
import { achievementApi } from '@/features/progress/api';
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
  const { cache, mutate } = useSWRConfig();

  // Check for new achievements
  const checkAchievements = useCallback(async () => {
    try {
      const result = await achievementApi.checkAchievements();
      if (result.count > 0) {
        // Show toast for new achievements
        result.newAchievements.forEach((achievement) => {
          toast({
            variant: 'achievement',
            title: 'Achievement earned',
            description: `${achievement.name}: ${achievement.description}`,
            duration: 5000,
          });
        });
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [toast]);

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

  // Decoded ahead of the first tap, so that tap's sound plays at once.
  useEffect(() => {
    preloadSounds();
  }, []);

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
        // No message on success: the new habit appearing says it, as in a
        // native app. Failures still say so below.
        await apiAddHabit(habitData);
        setDate(new Date());
        // Invalidate both date-specific and all-habits caches
        void mutateHabits();
        void mutateHabitLists({ cache, mutate });
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
    [cache, mutate, mutateHabits, toast, setDate, checkAchievements],
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
        // Invalidate both date-specific and all-habits caches
        void mutateHabits();
        void mutateHabitLists({ cache, mutate });
      } catch (err) {
        console.error('Failed to update habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to update habit "${
            habitData.name ?? 'habit'
          }". Reverting changes.`,
        });
        void mutateHabits();
        void mutateHabitLists({ cache, mutate });
      }
    },
    [cache, mutate, mutateHabits, toast],
  );

  const deleteHabit = useCallback(
    async (habitId: string, habitName: string) => {
      void mutateHabits(
        (currentHabits) => currentHabits?.filter((h) => h.id !== habitId),
        false,
      );

      try {
        await apiDeleteHabit(habitId);
        // Invalidate both date-specific and all-habits caches
        void mutateHabits();
        void mutateHabitLists({ cache, mutate });
      } catch (err) {
        console.error('Failed to delete habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to delete habit "${habitName}". Restoring habit.`,
        });
        void mutateHabits();
        void mutateHabitLists({ cache, mutate });
      }
    },
    [cache, mutate, mutateHabits, toast],
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

      const completesTheDay =
        habits.filter((h) => h.completed).length === habits.length - 1 &&
        !habit?.completed;

      // The haptic and the sound answer the tap itself, as a native app's
      // do, rather than the server's reply a network round trip later. The
      // tick is drawn at once too: the toggle below updates the cache first.
      hapticTick();
      if (completesTheDay) {
        playSound('all-done');
      } else if (habit) {
        playSound(habit.completed ? 'habit-off' : 'habit-on');
      }

      await internalToggleHabitCompletion(id);
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
