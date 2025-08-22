// Enhanced habits hook with offline-first functionality
// Integrates OfflineStore with existing SWR patterns for seamless offline/online experience

import { useCallback, useContext, useState, useEffect, useMemo } from 'react';
import useSWR from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { DateContext } from '@app/providers/DateContext';
import { useOffline } from '@app/providers/OfflineContext';

import toggleOnSound from '@/assets/audio/habit-toggled-on.mp3';
import toggleOffSound from '@/assets/audio/habit-toggled-off.mp3';
import completedAllHabits from '@/assets/audio/completed-all-habits.mp3';
import { Habit } from '@/features/habits/types/Habit';
import { OfflineHabit } from '@/core/offline';
import { fetchHabits } from '@/features/habits/api';
import { achievementApi } from '@/features/progress/api';
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

export function useHabitsOffline(): UseHabitsReturn {
  const { toast } = useToast();
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);
  const [localHabits, setLocalHabits] = useState<Habit[]>([]);
  const [isLoadingLocal, setIsLoadingLocal] = useState(true);
  const { date, setDate, timeZone } = useContext(DateContext);
  const { isSignedIn } = useAuth();
  const { offlineStore, isOnline, sync } = useOffline();

  // Check for new achievements
  const checkAchievements = useCallback(async () => {
    if (!isOnline) return; // Skip achievements check when offline

    try {
      const result = await achievementApi.checkAchievements();
      if (result.count > 0) {
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
  }, [toast, isOnline]);

  // Load habits from offline store
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

  // Load local habits on mount and when date changes
  useEffect(() => {
    void loadLocalHabits();
  }, [loadLocalHabits, date]);

  // SWR for server data (background updates when online)
  // Normalize date to avoid constant key changes from millisecond differences
  const normalizedDateString = useMemo(() => {
    if (!date) return '';
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized.toISOString().split('T')[0]; // Just the date part: YYYY-MM-DD
  }, [date]);

  const habitsEndpointKey =
    normalizedDateString && isSignedIn && isOnline
      ? `/api/v1/habits?date=${normalizedDateString}&timeZone=${timeZone}`
      : null;

  const {
    error: serverError,
    isLoading: isLoadingServer,
    isValidating,
    mutate: mutateServerHabits,
  } = useSWR<Habit[], unknown>(
    habitsEndpointKey,
    () =>
      normalizedDateString
        ? fetchHabits(new Date(normalizedDateString), timeZone)
        : Promise.resolve([]),
    {
      revalidateOnFocus: false, // We'll handle this manually
      revalidateOnReconnect: false, // We handle this manually in sync
      revalidateIfStale: false, // Prevent automatic revalidation
      keepPreviousData: true,
      dedupingInterval: 5000, // Avoid duplicate requests within 5 seconds
      focusThrottleInterval: 10000, // Throttle focus revalidation
      errorRetryInterval: 30000, // Wait 30s before retrying failed requests
      errorRetryCount: 2, // Limit retry attempts
      onSuccess: (data) => {
        // Update local store with server data when online
        if (data && isOnline) {
          try {
            // TODO: Implement server data sync to local store
            // This should detect conflicts and merge server updates
            console.log('Server habits received:', data.length);
          } catch (error) {
            console.error('Failed to sync server data to local store:', error);
          }
        }
      },
    },
  );

  // Debounced mutate to prevent rapid successive calls
  const debouncedMutate = useCallback(() => {
    const timeoutId = setTimeout(() => {
      void mutateServerHabits();
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [mutateServerHabits]);

  // Trigger sync when coming back online
  useEffect(() => {
    if (isOnline) {
      void sync().catch((error) => {
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
      // Use debounced mutate to avoid rapid requests
      const cleanup = debouncedMutate();
      return cleanup;
    }
  }, [isOnline, sync, debouncedMutate]);

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

        // Reset view to today (normalize to avoid microsecond differences)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize to start of day
        if (date.getTime() !== today.getTime()) {
          setDate(today);
        }

        // If online, try to sync immediately (but don't force revalidation)
        if (isOnline) {
          try {
            // Don't sync immediately after creation to avoid revalidation loops
            // The background sync will handle it or user can manually trigger
            // await sync();
            console.log(
              'Habit created, background sync will handle server update',
            );
          } catch (error) {
            console.error('Failed to sync after adding habit:', error);
          }
        }

        void checkAchievements();
      } catch (err) {
        console.error('Failed to add habit:', err);
        toast({
          variant: 'destructive',
          description: `Failed to add habit "${habitData.name}". Please try again.`,
        });
      }
    },
    [
      offlineStore,
      loadLocalHabits,
      toast,
      date,
      setDate,
      isOnline,
      checkAchievements,
    ],
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

        // If online, try to sync immediately
        if (isOnline) {
          try {
            await sync();
            await mutateServerHabits();
          } catch (error) {
            console.error('Failed to sync after updating habit:', error);
          }
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
    [offlineStore, toast, isOnline, sync, mutateServerHabits, loadLocalHabits],
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

        // If online, try to sync immediately
        if (isOnline) {
          try {
            await sync();
            await mutateServerHabits();
          } catch (error) {
            console.error('Failed to sync after deleting habit:', error);
          }
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
    [offlineStore, toast, isOnline, sync, mutateServerHabits, loadLocalHabits],
  );

  const internalToggleHabitCompletion = useCallback(
    async (habitId: string) => {
      if (!date) throw new Error('Date context is not available');

      // Find the habit to determine current completion status
      const habit = localHabits.find((h) => h.id === habitId);
      if (!habit) throw new Error('Habit not found');

      try {
        // Create or delete habit entry based on completion status
        if (habit.completed) {
          // Remove completion (delete habit entry)
          const existingEntry = await offlineStore.getHabitEntry(habitId, date);
          if (existingEntry) {
            await offlineStore.deleteHabitEntry(existingEntry.id);
          }
        } else {
          // Add completion (create habit entry)
          await offlineStore.createHabitEntry({
            habitId,
            date,
            completed: true,
          });
        }

        // Update local habits to reflect completion change
        setLocalHabits((currentHabits) =>
          currentHabits.map((h) =>
            h.id === habitId ? { ...h, completed: !h.completed } : h,
          ),
        );

        // If online, try to sync immediately
        if (isOnline) {
          try {
            await sync();
            await mutateServerHabits();
          } catch (error) {
            console.error('Failed to sync after toggling habit:', error);
          }
        }

        void checkAchievements();
      } catch (err) {
        console.error('Failed to toggle habit completion:', err);
        toast({
          variant: 'destructive',
          description: 'Failed to update habit status. Reverting change.',
        });
        // Reload local habits to revert optimistic update
        await loadLocalHabits();
      }
    },
    [
      date,
      localHabits,
      offlineStore,
      toast,
      isOnline,
      sync,
      mutateServerHabits,
      checkAchievements,
      loadLocalHabits,
    ],
  );

  const habits = useMemo(() => localHabits, [localHabits]);

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

  const mutateHabits = useCallback(async (): Promise<Habit[] | undefined> => {
    await loadLocalHabits();
    if (isOnline) {
      await mutateServerHabits();
    }
    return habits;
  }, [loadLocalHabits, isOnline, mutateServerHabits, habits]);

  return {
    habits,
    isLoading: isLoadingLocal || (isOnline && isLoadingServer),
    isValidating: isValidating && isOnline,
    error: serverError,
    animatingHabitId,
    mutateHabits,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleHabit,
    completionRate,
  };
}
