// Hook for managing achievements data
// Provides data fetching and state management for achievements

import { useState, useEffect, useCallback } from 'react';
import { achievementApi } from '../api';
import { Achievement, AchievementStats, AchievementCheckResponse } from '../types/Achievement';

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [stats, setStats] = useState<AchievementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all achievements
  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [achievementsData, statsData] = await Promise.all([
        achievementApi.getAllAchievements(),
        achievementApi.getAchievementStats(),
      ]);
      
      setAchievements(achievementsData);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Check for new achievements
  const checkNewAchievements = useCallback(async (): Promise<AchievementCheckResponse | null> => {
    try {
      const result = await achievementApi.checkAchievements();
      
      // Refresh data if new achievements were awarded
      if (result.count > 0) {
        await fetchAchievements();
      }
      
      return result;
    } catch (err) {
      console.error('Error checking achievements:', err);
      return null;
    }
  }, [fetchAchievements]);

  // Initialize achievements (admin function)
  const initializeAchievements = useCallback(async () => {
    try {
      await achievementApi.initializeAchievements();
      await fetchAchievements(); // Refresh data after initialization
    } catch (err) {
      console.error('Error initializing achievements:', err);
      setError('Failed to initialize achievements.');
    }
  }, [fetchAchievements]);

  // Refresh achievements data
  const refresh = useCallback(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

  return {
    achievements,
    stats,
    loading,
    error,
    checkNewAchievements,
    initializeAchievements,
    refresh,
  };
}

export function useAchievementProgress() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filterAchievementsByCategory = useCallback((achievements: Achievement[], category: string) => {
    if (category === 'all') return achievements;
    return achievements.filter(achievement => achievement.category === category);
  }, []);

  return {
    selectedCategory,
    setSelectedCategory,
    filterAchievementsByCategory,
  };
}