import {
  useCallback,
  useState,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import useSWR, { mutate } from 'swr';
import { useToast } from '@shared/hooks/use-toast';
import { useHabitsContext } from './useHabitsContext';
import { useDate } from '@app/providers/useDate';
import { triggerHaptic } from '@shared/utils/haptics';
import { playHabitSound } from '@shared/utils/sound';
import { Habit, HabitPayload } from '@/features/habits/types/Habit';
import {
  fetchHabits,
  addHabit as apiAddHabit,
  updateHabit as apiUpdateHabit,
  deleteHabit as apiDeleteHabit,
  toggleHabitCompletion as apiToggleHabitCompletion,
  dayParam,
  habitsForDateKey,
  mutateHabitLists,
} from '@/features/habits/api';
import {
  isUnreachable,
  pendingCompletions,
  queueCompletion,
  removeCompletion,
  subscribeToPendingCompletions,
} from '@/features/habits/api/pendingCompletions';
import {
  achievementApi,
  achievementsKey,
  achievementStatsKey,
} from '@/features/progress/api';
import { useAuth } from '@clerk/clerk-react';
import {
  lastSignedInUserId,
  useOfflineSession,
} from '@shared/hooks/useOfflineSession';

/** Revalidates cached progress summary and history panels after habit mutations. */
const mutateProgressCaches = () =>
  mutate(
    (key) =>
      Array.isArray(key) &&
      (key[0] === 'progressSummary' || key[0] === 'progressHistory'),
  );

/**
 * Revalidates cached achievements and their stats after a check: each check
 * changes the counts they measure, and the Tracker's hint reads them.
 */
const mutateAchievementCaches = () =>
  mutate(
    (key) =>
      key === achievementStatsKey ||
      (Array.isArray(key) && key[0] === achievementsKey),
  );

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
  const { celebrateAchievements } = useHabitsContext();
  const [timeoutId, setTimeoutId] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);
  const [animatingHabitId, setAnimatingHabitId] = useState<string | null>(null);
  const { date, setDate, timeZone } = useDate();
  const { isSignedIn: clerkSignedIn, userId } = useAuth();
  // Offline, Clerk cannot load; the last visit's user is answered from the
  // service worker's cache.
  const offline = useOfflineSession();
  const isSignedIn = clerkSignedIn === true || offline;

  // Check for new achievements
  const checkAchievements = useCallback(async () => {
    try {
      const result = await achievementApi.checkAchievements(timeZone);
      void mutateAchievementCaches();
      if (result.count > 0) {
        triggerHaptic('achievement', { androidOnly: true });
        // Celebrate each new achievement in its own sheet
        celebrateAchievements(result.newAchievements);
      }
    } catch (error) {
      console.error('Failed to check achievements:', error);
    }
  }, [celebrateAchievements, timeZone]);

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
        void mutateProgressCaches();
        // Check for achievements after adding a habit
        void checkAchievements();
      } catch (err) {
        console.error('Failed to add habit:', err);
        triggerHaptic('error', { androidOnly: true });
        toast({
          variant: 'destructive',
          description: `Failed to add habit "${habitData.name}". Please try again.`,
        });
      }
    },
    [mutateHabits, toast, setDate, checkAchievements],
  );

  // Changes kept on the device until the API can take them, shown over the
  // fetched list, which offline comes from the service worker's cache.
  const pending = useSyncExternalStore(
    subscribeToPendingCompletions,
    pendingCompletions,
  );
  const day = date ? dayParam(date, timeZone) : null;

  const habits = useMemo(
    () =>
      (fetchedHabits ?? []).map((habit) => {
        const change = pending.find(
          (c) => c.habitId === habit.id && c.day === day,
        );
        return change ? { ...habit, completed: change.completed } : habit;
      }),
    [fetchedHabits, pending, day],
  );

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
        void mutateProgressCaches();
      } catch (err) {
        console.error('Failed to update habit:', err);
        triggerHaptic('error', { androidOnly: true });
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
        void mutateProgressCaches();
      } catch (err) {
        console.error('Failed to delete habit:', err);
        triggerHaptic('error', { androidOnly: true });
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
    async (habitId: string, completed: boolean) => {
      void mutateHabits(
        (currentHabits = []) =>
          currentHabits.map((h) =>
            h.id === habitId ? { ...h, completed } : h,
          ),
        false,
      );

      // Offline, before Clerk loads, the last visit's user makes the change.
      const changedBy = userId ?? lastSignedInUserId();
      const change =
        date && day && changedBy
          ? {
              userId: changedBy,
              habitId,
              day,
              timestamp: date.toISOString(),
              timeZone,
              completed,
            }
          : null;

      try {
        if (!date) throw new Error('Date context is not available');
        await apiToggleHabitCompletion(habitId, date, timeZone, completed);
        // Saved: an earlier change to this day, kept offline, is outdated.
        if (change) removeCompletion(change);
        void mutateHabits();
        void mutateProgressCaches();
        // Check for achievements after toggling habit completion
        void checkAchievements();
      } catch (err) {
        if (change && isUnreachable(err)) {
          queueCompletion(change);
          toast({
            description:
              "Saved on this device. It's sent when you're back online.",
          });
          return;
        }
        console.error('Failed to toggle habit completion:', err);
        triggerHaptic('error', { androidOnly: true });
        toast({
          variant: 'destructive',
          description: 'Failed to update habit status. Reverting change.',
        });
        void mutateHabits();
      }
    },
    [date, day, timeZone, userId, mutateHabits, toast, checkAchievements],
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

      // Fire haptic and sound synchronously inside the user tap gesture so iOS
      // Safari never drops audio across the async network round-trip.
      if (habit) {
        const completingLastHabit =
          !habit.completed &&
          habits.filter((h) => h.completed).length === habits.length - 1;

        if (completingLastHabit) {
          triggerHaptic(habits.length === 1 ? 'allDoneSingle' : 'allDone');
          playHabitSound('allDone');
        } else if (!habit.completed) {
          triggerHaptic('heavy');
          playHabitSound('on');
        } else {
          triggerHaptic('light');
          playHabitSound('off');
        }
      }

      if (habit && !habit.completed) {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        setAnimatingHabitId(id);
        const newTimeoutId = setTimeout(() => setAnimatingHabitId(null), 900);
        setTimeoutId(newTimeoutId);
      }

      if (habit) await internalToggleHabitCompletion(id, !habit.completed);
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
