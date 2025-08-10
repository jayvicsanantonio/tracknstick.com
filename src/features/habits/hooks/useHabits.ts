import { useCallback, useContext, useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { DateContext } from '@app/providers/DateContext';

import toggleOnSound from '@/assets/audio/habit-toggled-on.mp3';
import toggleOffSound from '@/assets/audio/habit-toggled-off.mp3';
import completedAllHabits from '@/assets/audio/completed-all-habits.mp3';
import { Habit } from '@/features/habits/types/Habit';
import {
  fetchHabits,
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion,
} from '@/features/habits/api';
import { useAuth } from '@clerk/clerk-react';

interface UseHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  isValidating: boolean;
  error: unknown;
  animatingHabitId: string | null;
  mutateHabits: () => Promise<Habit[] | undefined>;
  addHabit: (habitData: Omit<Habit, 'id' | 'completed'>) => Promise<void>;
  updateHabit: (
    habitId: string,
    habitData: Partial<Omit<Habit, 'id' | 'completed'>>,
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
  const { date, setDate, timeZone } = useContext(DateContext);
  const { isSignedIn } = useAuth();

  const habitsEndpointKey =
    date && isSignedIn
      ? `/api/v1/habits?date=${date.toISOString()}&timeZone=${timeZone}`
      : null;

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
    async (habitData: Omit<Habit, 'id' | 'completed'>) => {
      try {
        await apiAddHabit(habitData);
        toast({
          description: `Habit "${habitData.name}" added successfully.`,
        });
        setDate(new Date());
        void mutateHabits();
      } catch (err) {
        console.error('Failed to add habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to add habit "${habitData.name}". Please try again.`,
        });
      }
    },
    [mutateHabits, toast, setDate],
  );

  const habits = useMemo(() => fetchedHabits ?? [], [fetchedHabits]);

  const updateHabit = useCallback(
    async (
      habitId: string,
      habitData: Partial<Omit<Habit, 'id' | 'completed'>>,
    ) => {
      void mutateHabits(
        (currentHabits) =>
          currentHabits?.map((h) =>
            h.id === habitId ? { ...h, ...habitData } : h,
          ),
        false,
      );

      try {
        await apiUpdateHabit(habitId, habitData);
        toast({
          description: `Habit "${habitData.name ?? 'habit'}" updated.`,
        });
      } catch (err) {
        console.error('Failed to update habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to update habit "${
            habitData.name ?? 'habit'
          }". Reverting changes.`,
        });
      } finally {
        void mutateHabits();
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
      } catch (err) {
        console.error('Failed to delete habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to delete habit "${habitName}". Restoring habit.`,
        });
      } finally {
        void mutateHabits();
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
      } catch (err) {
        console.error('Failed to toggle habit completion:', err);
        toast({
          variant: 'destructive',
          description: 'Failed to update habit status. Reverting change.',
        });
        void mutateHabits();
      }
    },
    [date, timeZone, mutateHabits, toast],
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
