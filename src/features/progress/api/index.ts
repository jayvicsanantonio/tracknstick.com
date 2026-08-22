import { mutate } from 'swr';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import { HistoryDates } from '@/features/progress/types/HistoryDates';

export interface ProgressHistoryResponse {
  history: HistoryDates[];
}

export interface ProgressStreaksResponse {
  currentStreak: number;
  longestStreak: number;
}

/**
 * Fetches user's progress history showing completion rates by day
 * Includes user's timezone to ensure dates are calculated correctly
 *
 * Failures propagate. Swallowing them into an empty array made a broken
 * endpoint indistinguishable from a month in which nothing was scheduled:
 * SWR saw a successful empty result, so the calendar and the chart rendered
 * as if the user simply had no history.
 */
export const fetchProgressHistory = async (
  timeZone: string,
  startDate?: Date | null,
  endDate?: Date | null,
): Promise<HistoryDates[]> => {
  const params: {
    startDate?: Date;
    endDate?: Date;
    timeZone?: string;
  } = { timeZone };

  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axiosInstance.get<ProgressHistoryResponse>(
    '/api/v1/progress/history',
    { params },
  );

  if (!Array.isArray(response.data?.history)) {
    throw new Error(
      'Progress history response did not contain a history array',
    );
  }

  return response.data.history;
};

/**
 * Fetches user's current and longest streaks
 * Includes user's timezone for accurate day boundary calculations
 */
export const fetchProgressStreaks = async (
  timeZone: string,
): Promise<ProgressStreaksResponse> => {
  const params: Record<string, string> = { timeZone };

  const response = await axiosInstance.get<ProgressStreaksResponse>(
    '/api/v1/progress/streaks',
    { params },
  );
  return response.data;
};

// --- SWR cache keys -------------------------------------------------------

export const progressHistoryKey = (
  timeZone: string,
  startDate: Date,
  endDate: Date,
) => ['progressHistory', timeZone, startDate, endDate] as const;

export const progressStreaksKey = (timeZone: string) =>
  ['progressStreaks', timeZone] as const;

/**
 * Revalidates every progress view, whichever month or timezone it was keyed
 * on. Completing a habit changes today's rate, the month's chart and both
 * streaks, none of which the habit list's own mutate reaches -- so the
 * Progress page went on showing the figures from before the toggle.
 */
export const mutateProgress = () =>
  mutate(
    (key) =>
      Array.isArray(key) &&
      (key[0] === 'progressHistory' || key[0] === 'progressStreaks'),
  );

// Export achievement API
export { achievementApi } from './achievements';
