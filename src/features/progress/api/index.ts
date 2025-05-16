import axiosInstance from "@/services/api/axiosInstance";
import { HistoryDates } from "@/features/progress/types/HistoryDates";

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
 */
export const fetchProgressHistory = async (
  startDate?: string,
  endDate?: string,
): Promise<HistoryDates[]> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  try {
    const response = await axiosInstance.get<ProgressHistoryResponse>(
      "/api/v1/progress/history",
      { params },
    );

    // Check if response.data contains a 'history' property
    if (response.data?.history) {
      return response.data.history;
    } else {
      console.error("Unexpected response format:", response.data);
      return [];
    }
  } catch (error) {
    console.error("Error fetching progress history:", error);
    return [];
  }
};

/**
 * Fetches user's current and longest streaks
 */
export const fetchProgressStreaks =
  async (): Promise<ProgressStreaksResponse> => {
    const response = await axiosInstance.get<ProgressStreaksResponse>(
      "/api/v1/progress/streaks",
    );
    return response.data;
  };

/**
 * Fetches comprehensive progress data including history and streaks
 */
export const fetchProgressOverview = async (
  startDate?: string,
  endDate?: string,
): Promise<ProgressOverviewResponse> => {
  const params: Record<string, string> = {};
  if (startDate) params.startDate = startDate;
  if (endDate) params.endDate = endDate;

  const response = await axiosInstance.get<ProgressOverviewResponse>(
    "/api/v1/progress/overview",
    { params },
  );
  return response.data;
};
