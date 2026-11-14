import type {
  ProgressHistoryResponse,
  ProgressStreaksResponse,
} from '@tracknstick/contracts';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import { HistoryDates } from '@/features/progress/types/HistoryDates';

export type { ProgressHistoryResponse, ProgressStreaksResponse };

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

// Export achievement API
export {
  achievementApi,
  achievementsKey,
  achievementStatsKey,
} from './achievements';
