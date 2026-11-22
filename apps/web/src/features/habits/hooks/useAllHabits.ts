// Hook for fetching all habits without date filtering
// Used in contexts where we need to see all user habits regardless of schedule
import { useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { Habit } from '@/features/habits/types/Habit';
import {
  fetchHabits,
  deleteHabit as apiDeleteHabit,
  allHabitsKey,
  mutateHabitLists,
} from '@/features/habits/api';
import { useAuth } from '@clerk/clerk-react';

interface UseAllHabitsReturn {
  habits: Habit[];
  isLoading: boolean;
  error: unknown;
  deleteHabit: (habitId: string, habitName: string) => Promise<void>;
  /** Asks the API for the list again, as after a failed request. */
  retry: () => Promise<unknown>;
}

interface UseAllHabitsOptions {
  /** False sends no request and reports no habits. Defaults to true. */
  enabled?: boolean;
}

export function useAllHabits({
  enabled = true,
}: UseAllHabitsOptions = {}): UseAllHabitsReturn {
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const { cache, mutate } = useSWRConfig();

  const {
    data: fetchedHabits,
    error,
    isLoading,
    mutate: mutateHabits,
  } = useSWR<Habit[], unknown>(
    isSignedIn && enabled ? allHabitsKey : null,
    () => fetchHabits(), // Call without date parameter to get all habits
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  const habits = fetchedHabits ?? [];

  const deleteHabit = useCallback(
    async (habitId: string, habitName: string) => {
      // Out of every list at once, the Tracker's days included.
      void mutateHabitLists({ cache, mutate }, habitId);

      try {
        // No message on success: the row leaving the list says it.
        await apiDeleteHabit(habitId);
      } catch (err) {
        console.error('Failed to delete habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to delete habit "${habitName}". Restoring habit.`,
        });
      } finally {
        // Both branches revalidated identically before; the only difference
        // between them was the toast.
        void mutateHabitLists({ cache, mutate });
      }
    },
    [cache, mutate, toast],
  );

  const retry = useCallback(() => mutateHabits(), [mutateHabits]);

  return {
    habits,
    isLoading,
    error,
    deleteHabit,
    retry,
  };
}
