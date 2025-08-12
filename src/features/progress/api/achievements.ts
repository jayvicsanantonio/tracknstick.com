// API functions for achievement operations
// Handles HTTP requests to the achievements API

import { axiosInstance } from '@/shared/services/api/axiosInstance';
import { Achievement, AchievementStats, UserAchievement, AchievementCheckResponse } from '../types/Achievement';

export const achievementApi = {
  // Get all achievements with progress for the current user
  async getAllAchievements(): Promise<Achievement[]> {
    const response = await axiosInstance.get('/api/v1/achievements');
    return response.data.achievements;
  },

  // Get only earned achievements for the current user
  async getEarnedAchievements(): Promise<UserAchievement[]> {
    const response = await axiosInstance.get('/api/v1/achievements/earned');
    return response.data.achievements;
  },

  // Get achievement statistics for the current user
  async getAchievementStats(): Promise<AchievementStats> {
    const response = await axiosInstance.get('/api/v1/achievements/stats');
    return response.data;
  },

  // Check for new achievements and award them to the user
  async checkAchievements(): Promise<AchievementCheckResponse> {
    const response = await axiosInstance.post('/api/v1/achievements/check');
    return response.data;
  },

  // Initialize achievements in the database (admin/setup)
  async initializeAchievements(): Promise<{ message: string }> {
    const response = await axiosInstance.post('/api/v1/achievements/initialize');
    return response.data;
  },
};