import { mutate } from 'swr';
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

export const habitsForDateKey = (date: Date, timeZone: string) =>
  `${allHabitsKey}?date=${date.toISOString()}&timeZone=${timeZone}`;

export const habitStatsKey = (habitId: string, timeZone: string) =>
  `${allHabitsKey}/${habitId}/stats?timeZone=${timeZone}`;

/**
 * Revalidates every habit list: the unfiltered one and every date-scoped one.
 *
 * Deliberately not a startsWith(allHabitsKey) sweep -- that would also match
 * the per-habit stats keys, which are not lists.
 */
export const mutateHabitLists = () =>
  mutate(
    (key) =>
      typeof key === 'string' &&
      (key === allHabitsKey || key.startsWith(`${allHabitsKey}?date=`)),
  );
