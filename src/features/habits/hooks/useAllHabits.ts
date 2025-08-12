// Hook for fetching all habits without date filtering
// Used in contexts where we need to see all user habits regardless of schedule
import { useCallback } from 'react';
import useSWR, { mutate } from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { Habit } from '@/features/habits/types/Habit';
import {
  fetchHabits,
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
} from '@/features/habits/api';
import { useAuth } from '@clerk/clerk-react';

interface UseAllHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  isValidating: boolean;
  error: unknown;
  mutateHabits: () => Promise<Habit[] | undefined>;
  addHabit: (habitData: Omit<Habit, 'id' | 'completed'>) => Promise<void>;
  updateHabit: (
    habitId: string,
    habitData: Partial<Omit<Habit, 'id' | 'completed'>>,
  ) => Promise<void>;
  deleteHabit: (habitId: string, habitName: string) => Promise<void>;
}

export function useAllHabits(): UseAllHabitsReturn {
  const { toast } = useToast();
  const { isSignedIn } = useAuth();

  const habitsEndpointKey = isSignedIn ? '/api/v1/habits' : null;

  const {
    data: fetchedHabits,
    error,
    isLoading,
    isValidating,
    mutate: mutateHabits,
  } = useSWR<Habit[], unknown>(
    habitsEndpointKey,
    () => fetchHabits(), // Call without date parameter to get all habits
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  const habits = fetchedHabits ?? [];

  const addHabit = useCallback(
    async (habitData: Omit<Habit, 'id' | 'completed'>) => {
      try {
        await apiAddHabit(habitData);
        toast({
          description: `Habit "${habitData.name}" added successfully.`,
        });
        // Invalidate both all-habits and date-specific caches
        void mutateHabits();
        void mutate(
          (key) =>
            typeof key === 'string' && key.includes('/api/v1/habits?date='),
        );
      } catch (err) {
        console.error('Failed to add habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to add habit "${habitData.name}". Please try again.`,
        });
      }
    },
    [mutateHabits, toast],
  );

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
        // Invalidate both all-habits and date-specific caches
        void mutateHabits();
        void mutate(
          (key) =>
            typeof key === 'string' && key.includes('/api/v1/habits?date='),
        );
      } catch (err) {
        console.error('Failed to update habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to update habit "${
            habitData.name ?? 'habit'
          }". Reverting changes.`,
        });
        // Still need to invalidate both caches on error to ensure consistency
        void mutateHabits();
        void mutate(
          (key) =>
            typeof key === 'string' && key.includes('/api/v1/habits?date='),
        );
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
        // Invalidate both all-habits and date-specific caches
        void mutateHabits();
        void mutate(
          (key) =>
            typeof key === 'string' && key.includes('/api/v1/habits?date='),
        );
      } catch (err) {
        console.error('Failed to delete habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to delete habit "${habitName}". Restoring habit.`,
        });
        // Still need to invalidate both caches on error to ensure consistency
        void mutateHabits();
        void mutate(
          (key) =>
            typeof key === 'string' && key.includes('/api/v1/habits?date='),
        );
      }
    },
    [mutateHabits, toast],
  );

  return {
    habits,
    isLoading,
    isValidating,
    error,
    mutateHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };
}
