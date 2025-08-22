// Offline-first hook for fetching all habits without date filtering
// Used in Habits Overview page to show all user habits regardless of schedule
// Provides full offline support using OfflineStore

import { useCallback, useState, useEffect, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { Habit } from '@/features/habits/types/Habit';
import { OfflineHabit } from '@/core/offline';
import { fetchHabits } from '@/features/habits/api';
import { useAuth } from '@clerk/clerk-react';
import { useOffline } from '@app/providers/OfflineContext';

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

// Helper functions to convert between Habit and OfflineHabit
function convertOfflineHabitToHabit(offlineHabit: OfflineHabit): Habit {
  return {
    id: offlineHabit.serverId ?? offlineHabit.id,
    name: offlineHabit.name,
    icon: offlineHabit.icon,
    frequency: offlineHabit.frequency,
    completed: offlineHabit.completed,
    startDate: offlineHabit.startDate,
    endDate: offlineHabit.endDate,
  };
}

function convertHabitToOfflineHabit(
  habit: Habit,
): Omit<OfflineHabit, 'lastModified' | 'synced' | 'version'> {
  return {
    id: habit.id,
    serverId: habit.id,
    name: habit.name,
    icon: habit.icon,
    frequency: habit.frequency,
    completed: habit.completed,
    startDate: habit.startDate,
    endDate: habit.endDate,
  };
}

/**
 * Offline-first hook for fetching all habits without date filtering.
 * This hook works both online and offline, providing seamless experience
 * for the Habits Overview page.
 *
 * Features:
 * - Loads habits from IndexedDB (offline store) for immediate display
 * - Syncs with server when online
 * - Optimistic updates for all mutations
 * - Automatic background sync when coming back online
 */
export function useAllHabitsOffline(): UseAllHabitsReturn {
  const { toast } = useToast();
  const { isSignedIn } = useAuth();
  const { offlineStore, isOnline, sync } = useOffline();
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);

  // Load habits from offline store (all habits, no date filter)
  const loadLocalHabits = useCallback(async () => {
    try {
      setIsLoadingLocal(true);
      const offlineHabits = await offlineStore.getHabits();
      const habits = offlineHabits.map(convertOfflineHabitToHabit);
      setLocalHabits(habits);
    } catch (error) {
      console.error('Failed to load local habits:', error);
    } finally {
      setIsLoadingLocal(false);
    }
  }, [offlineStore]);

  // Load local habits on mount
  useEffect(() => {
    void loadLocalHabits();
  }, [loadLocalHabits]);

  // SWR for server data (background updates when online)
  const habitsEndpointKey = isSignedIn && isOnline ? '/api/v1/habits' : null;

  const {
    error: serverError,
    isLoading: isLoadingServer,
    isValidating,
    mutate: mutateServerHabits,
  } = useSWR<Habit[], unknown>(
    habitsEndpointKey,
    () => fetchHabits(), // Call without date parameter to get all habits
    {
      revalidateOnFocus: false, // We'll handle this manually
      revalidateOnReconnect: false, // We handle this manually in sync
      revalidateIfStale: false, // Prevent automatic revalidation loops
      keepPreviousData: true,
      dedupingInterval: 5000, // Avoid duplicate requests within 5 seconds
      errorRetryInterval: 30000, // Wait 30s before retrying failed requests
      errorRetryCount: 2, // Limit retry attempts
      onSuccess: (data) => {
        // Update local store with server data when online
        if (data && isOnline) {
          try {
            // TODO: Implement server data sync to local store
            // This should detect conflicts and merge server updates
            console.log('Server habits received (all habits):', data.length);
          } catch (error) {
            console.error('Failed to sync server data to local store:', error);
          }
        }
      },
    },
  );

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline) {
      sync().catch((error) => {
        // Don't log sync-in-progress errors as they're expected
        if (
          error instanceof Error &&
          error.message.includes('Sync already in progress')
        ) {
          console.log('Sync request handled (sync already in progress)');
        } else {
          console.error('Sync error:', error);
        }
      });
    }
  }, [isOnline, sync]);

  const addHabit = useCallback(
    async (habitData: Omit<Habit, 'id' | 'completed'>) => {
      try {
        // Create habit in offline store (optimistic update)
        await offlineStore.createHabit(
          convertHabitToOfflineHabit({
            ...habitData,
            id: '', // Will be generated
            completed: false,
          }),
        );

        await loadLocalHabits();

        toast({
          description: `Habit "${habitData.name}" added successfully.`,
        });

        // Invalidate both all-habits and date-specific caches
        if (isOnline) {
          void mutateServerHabits();
          void mutate(
            (key) =>
              typeof key === 'string' && key.includes('/api/v1/habits?date='),
          );
        }
      } catch (err) {
        console.error('Failed to add habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to add habit "${habitData.name}". Please try again.`,
        });
      }
    },
    [offlineStore, loadLocalHabits, toast, isOnline, mutateServerHabits],
  );

  const updateHabit = useCallback(
    async (
      habitId: string,
      habitData: Partial<Omit<Habit, 'id' | 'completed'>>,
    ) => {
      try {
        // Optimistically update local habits
        setLocalHabits((currentHabits) =>
          currentHabits.map((h) =>
            h.id === habitId ? { ...h, ...habitData } : h,
          ),
        );

        // Update in offline store
        await offlineStore.updateHabit(habitId, habitData);

        toast({
          description: `Habit "${habitData.name ?? 'habit'}" updated.`,
        });

        // Invalidate both all-habits and date-specific caches
        if (isOnline) {
          void mutateServerHabits();
          void mutate(
            (key) =>
              typeof key === 'string' && key.includes('/api/v1/habits?date='),
          );
        }
      } catch (err) {
        console.error('Failed to update habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to update habit "${
            habitData.name ?? 'habit'
          }". Reverting changes.`,
        });
        // Reload local habits to revert optimistic update
        await loadLocalHabits();
      }
    },
    [offlineStore, toast, isOnline, mutateServerHabits, loadLocalHabits],
  );

  const deleteHabit = useCallback(
    async (habitId: string, habitName: string) => {
      try {
        // Optimistically update local habits
        setLocalHabits((currentHabits) =>
          currentHabits.filter((h) => h.id !== habitId),
        );

        // Delete from offline store
        await offlineStore.deleteHabit(habitId);

        toast({ description: `Habit "${habitName}" deleted.` });

        // Invalidate both all-habits and date-specific caches
        if (isOnline) {
          void mutateServerHabits();
          void mutate(
            (key) =>
              typeof key === 'string' && key.includes('/api/v1/habits?date='),
          );
        }
      } catch (err) {
        console.error('Failed to delete habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to delete habit "${habitName}". Restoring habit.`,
        });
        // Reload local habits to revert optimistic update
        await loadLocalHabits();
      }
    },
    [offlineStore, toast, isOnline, mutateServerHabits, loadLocalHabits],
  );

  const mutateHabits = useCallback(async (): Promise<Habit[] | undefined> => {
    await loadLocalHabits();
    if (isOnline) {
      await mutateServerHabits();
    }
    return localHabits;
  }, [loadLocalHabits, isOnline, mutateServerHabits, localHabits]);

  // Use local habits as the source of truth
  const habits = useMemo(() => localHabits, [localHabits]);

  return {
    habits,
    isLoading:
      isLoadingLocal || (isOnline && isLoadingServer && habits.length === 0),
    isValidating: isValidating && isOnline,
    error: serverError,
    mutateHabits,
    addHabit,
    updateHabit,
    deleteHabit,
  };
}
