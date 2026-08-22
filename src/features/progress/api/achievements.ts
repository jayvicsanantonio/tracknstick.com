// API functions for achievement operations
// Handles HTTP requests to the achievements API

import { axiosInstance } from '@/shared/services/api/axiosInstance';
import {
  Achievement,
  AchievementStats,
  UserAchievement,
  AchievementCheckResponse,
} from '../types/Achievement';

/**
 * Active days, perfect days and streaks are counts of the user's own
 * calendar days, so the server needs to be told which calendar that is.
 * Without it the API measures them in UTC and the badges disagree with the
 * history calendar rendered beside them.
 */
export const achievementApi = {
  // Get all achievements with progress for the current user
  async getAllAchievements(timeZone: string): Promise<Achievement[]> {
    const response = await axiosInstance.get<{ achievements: Achievement[] }>(
      '/api/v1/achievements',
      { params: { timeZone } },
    );
    return response.data.achievements;
  },

  // Get only earned achievements for the current user
  async getEarnedAchievements(): Promise<UserAchievement[]> {
    const response = await axiosInstance.get<{
      achievements: UserAchievement[];
    }>('/api/v1/achievements/earned');
    return response.data.achievements;
  },

  // Get achievement statistics for the current user
  async getAchievementStats(timeZone: string): Promise<AchievementStats> {
    const response = await axiosInstance.get<AchievementStats>(
      '/api/v1/achievements/stats',
      { params: { timeZone } },
    );
    return response.data;
  },

  // Check for new achievements and award them to the user
  async checkAchievements(timeZone: string): Promise<AchievementCheckResponse> {
    const response = await axiosInstance.post<AchievementCheckResponse>(
      '/api/v1/achievements/check',
      undefined,
      { params: { timeZone } },
    );
    return response.data;
  },

  // Initialize achievements in the database (admin/setup)
  async initializeAchievements(): Promise<{ message: string }> {
    const response = await axiosInstance.post<{ message: string }>(
      '/api/v1/achievements/initialize',
    );
    return response.data;
  },
};
