// Hook for fetching all habits without date filtering
// Used in contexts where we need to see all user habits regardless of schedule
import { useCallback } from 'react';
import useSWR from 'swr';
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
}

export function useAllHabits(): UseAllHabitsReturn {
  const { toast } = useToast();
  const { isSignedIn } = useAuth();

  const {
    data: fetchedHabits,
    error,
    isLoading,
    mutate: mutateHabits,
  } = useSWR<Habit[], unknown>(
    isSignedIn ? allHabitsKey : null,
    () => fetchHabits(), // Call without date parameter to get all habits
    {
      revalidateOnFocus: true,
      keepPreviousData: true,
    },
  );

  const habits = fetchedHabits ?? [];

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
        // Both branches revalidated identically before; the only difference
        // between them was the toast.
        void mutateHabitLists();
      }
    },
    [mutateHabits, toast],
  );

  return {
    habits,
    isLoading,
    error,
    deleteHabit,
  };
}
