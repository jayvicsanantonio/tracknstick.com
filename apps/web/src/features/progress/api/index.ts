import { isAxiosError } from 'axios';
import type {
  ProgressHistoryResponse,
  ProgressStreaksResponse,
  ProgressSummaryResponse,
} from '@tracknstick/contracts';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import { HistoryDates } from '@/features/progress/types/HistoryDates';

export type { ProgressHistoryResponse, ProgressSummaryResponse };

/**
 * Fetches user's progress history showing completion rates by day
 * Includes user's timezone to ensure dates are calculated correctly
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

  // A failure rejects, as fetchProgressStreaks does, so the page can show it
  // rather than an empty calendar that reads as "no progress".
  const response = await axiosInstance.get<ProgressHistoryResponse>(
    '/api/v1/progress/history',
    { params },
  );

  if (!Array.isArray(response.data?.history)) {
    throw new Error('Unexpected progress history response');
  }
  return response.data.history;
};

/**
 * Fetches user's current and longest streaks
 * Includes user's timezone for accurate day boundary calculations
 */
const fetchProgressStreaks = async (
  timeZone: string,
): Promise<ProgressStreaksResponse> => {
  const params: Record<string, string> = { timeZone };

  const response = await axiosInstance.get<ProgressStreaksResponse>(
    '/api/v1/progress/streaks',
    { params },
  );
  return response.data;
};

/**
 * Fetches all-time lifetime progress metrics since the user started using the app.
 * Falls back to streaks + full history only if an older API deployment returns 404.
 */
export const fetchProgressSummary = async (
  timeZone: string,
): Promise<ProgressSummaryResponse> => {
  try {
    const response = await axiosInstance.get<ProgressSummaryResponse>(
      '/api/v1/progress/summary',
      { params: { timeZone } },
    );
    return response.data;
  } catch (error) {
    if (!isAxiosError(error) || error.response?.status !== 404) {
      throw error;
    }

    const [streaks, history] = await Promise.all([
      fetchProgressStreaks(timeZone),
      fetchProgressHistory(timeZone),
    ]);
    const activeDays = history.filter((d) => d.completionRate > 0).length;
    const perfectDays = history.filter((d) => d.completionRate === 100).length;
    const overallCompletionRate =
      history.length === 0
        ? null
        : Math.round(
            history.reduce((sum, d) => sum + d.completionRate, 0) /
              history.length,
          );
    const earliest = history.reduce<string | null>(
      (min, d) => (min === null || d.date < min ? d.date : min),
      null,
    );

    return {
      currentStreak: streaks.currentStreak,
      longestStreak: streaks.longestStreak,
      totalCompletions: activeDays,
      activeDays,
      perfectDays,
      overallCompletionRate,
      activeHabitsCount: 0,
      memberSince: earliest,
    };
  }
};

// Export achievement API
export {
  achievementApi,
  achievementsKey,
  achievementStatsKey,
} from './achievements';
