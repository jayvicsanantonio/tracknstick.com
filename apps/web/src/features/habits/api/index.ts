import type { Cache, ScopedMutator } from 'swr';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import type {
  CreateHabitResponse,
  DeleteHabitResponse,
  HabitListResponse,
  ToggleTrackerResponse,
  UpdateHabitResponse,
} from '@tracknstick/contracts';
import { Habit, HabitPayload } from '@/features/habits/types/Habit';
import HabitsIcons from '@/icons/habits';
import { HabitStats } from '@/features/habits/types/HabitStats';

const FALLBACK_ICON: keyof typeof HabitsIcons = 'Activity';

/**
 * The server types icon as an optional free string, while components index
 * HabitsIcons with it directly -- an unknown key renders `undefined` and React
 * throws "Element type is invalid". Normalising once here is the only place
 * that assertion can actually be made true.
 */
const toKnownIcon = (icon: string | undefined): keyof typeof HabitsIcons =>
  icon && icon in HabitsIcons
    ? (icon as keyof typeof HabitsIcons)
    : FALLBACK_ICON;

export const fetchHabits = async (
  date?: Date,
  timeZone?: string,
): Promise<Habit[]> => {
  const params =
    date && timeZone ? { date: date.toISOString(), timeZone } : undefined;

  const response = await axiosInstance.get<HabitListResponse>(
    '/api/v1/habits',
    {
      params,
    },
  );

  return response.data.map((habit) => ({
    ...habit,
    icon: toKnownIcon(habit.icon),
  }));
};

export const fetchHabitStats = async (
  habitId: string,
  timeZone: string,
): Promise<HabitStats> => {
  const response = await axiosInstance.get<HabitStats>(
    `/api/v1/habits/${habitId}/stats`,
    {
      params: { timeZone },
    },
  );
  return response.data;
};

export const addHabit = async (
  habitData: HabitPayload,
): Promise<CreateHabitResponse> => {
  const response = await axiosInstance.post<CreateHabitResponse>(
    '/api/v1/habits',
    habitData,
  );
  return response.data;
};

export const updateHabit = async (
  habitId: string,
  habitData: Partial<HabitPayload>,
): Promise<UpdateHabitResponse> => {
  const response = await axiosInstance.put<UpdateHabitResponse>(
    `/api/v1/habits/${habitId}`,
    habitData,
  );
  return response.data;
};

export const deleteHabit = async (
  habitId: string,
): Promise<DeleteHabitResponse> => {
  const response = await axiosInstance.delete<DeleteHabitResponse>(
    `/api/v1/habits/${habitId}`,
  );
  return response.data;
};

export const toggleHabitCompletion = async (
  habitId: string,
  date: Date,
  timeZone: string,
): Promise<ToggleTrackerResponse> => {
  const response = await axiosInstance.post<ToggleTrackerResponse>(
    `/api/v1/habits/${habitId}/trackers`,
    {
      timestamp: date.toISOString(),
      timeZone,
    },
  );

  return response.data;
};

// --- SWR cache keys -------------------------------------------------------
// The URLs live here, so the keys derived from them do too. Previously each
// hook built its own key inline and open-coded the invalidation rule, in two
// mutually incompatible idioms.

export const allHabitsKey = '/api/v1/habits';

/**
 * One key per calendar day in the user's time zone, e.g. `date=2026-11-21`.
 * The request itself still sends the moment (see fetchHabits); the key only
 * names the list. Keyed by the moment, it changed on every launch, and the
 * habits saved last time (see swrCache) were never found again.
 */
export const habitsForDateKey = (date: Date, timeZone: string) =>
  `${allHabitsKey}?date=${date.toLocaleDateString('en-CA', { timeZone })}&timeZone=${timeZone}`;

export const habitStatsKey = (habitId: string, timeZone: string) =>
  `${allHabitsKey}/${habitId}/stats?timeZone=${timeZone}`;

/**
 * Whether a cache key names a habit list: the unfiltered one or a day's.
 * Deliberately not a startsWith(allHabitsKey) test -- that would also match
 * the per-habit stats keys, which are not lists.
 */
const isHabitList = (key: unknown) =>
  typeof key === 'string' &&
  (key === allHabitsKey || key.startsWith(`${allHabitsKey}?date=`));

/**
 * Revalidates every habit list in the cache: the unfiltered one and every
 * date-scoped one. Given a deleted habit's id, it first takes that habit out
 * of each list, so no screen shows it while the API answers.
 *
 * `swr` is useSWRConfig(), for the cache the app provides; SWR's own exported
 * mutate works on a default cache the app does not use. The lists are found
 * by their keys in that cache, which also holds lists saved from the last
 * launch that no screen has asked for yet.
 */
export const mutateHabitLists = (
  swr: { cache: Cache; mutate: ScopedMutator },
  deletedHabitId?: string,
) =>
  Promise.all(
    [...swr.cache.keys()]
      .filter(isHabitList)
      .map((key) =>
        deletedHabitId === undefined
          ? swr.mutate(key)
          : swr.mutate(
              key,
              (habits?: Habit[]) =>
                habits?.filter((habit) => habit.id !== deletedHabitId),
              { revalidate: true },
            ),
      ),
  );
