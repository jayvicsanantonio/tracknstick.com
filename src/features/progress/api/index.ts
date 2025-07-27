import { axiosInstance } from '@shared/services/api/axiosInstance';
import { HistoryDates } from '@/features/progress/types/HistoryDates';

export interface ProgressHistoryResponse {
  history: HistoryDates[];
}

export interface ProgressStreaksResponse {
  currentStreak: number;
  longestStreak: number;
}

export interface ProgressOverviewResponse {
  history: HistoryDates[];
  currentStreak: number;
  longestStreak: number;
}

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

  try {
    const response = await axiosInstance.get<ProgressHistoryResponse>(
      '/api/v1/progress/history',
      { params },
    );

    if (response.data?.history) {
      return response.data.history;
    } else {
      console.error('Unexpected response format:', response.data);
      return [];
    }
  } catch (error) {
    console.error('Error fetching progress history:', error);
    return [];
  }
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

/**
 * Fetches comprehensive progress data including history and streaks
 * Includes user's timezone for consistent date calculations
 */
export const fetchProgressOverview = async (
  timeZone: string,
  startDate?: Date,
  endDate?: Date,
): Promise<ProgressOverviewResponse> => {
  const params: {
    startDate?: Date;
    endDate?: Date;
    timeZone?: string;
  } = { timeZone };
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axiosInstance.get<ProgressOverviewResponse>(
    '/api/v1/progress/overview',
    { params },
  );
  return response.data;
};
