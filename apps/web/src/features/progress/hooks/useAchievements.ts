// Hook for managing achievements data
// Provides data fetching and state management for achievements

import { useState, useCallback, useContext } from 'react';
import useSWR from 'swr';
import { DateContext } from '@app/providers/DateContext';
import { achievementApi, achievementsKey, achievementStatsKey } from '../api';
import {
  Achievement,
  AchievementStats,
  AchievementCheckResponse,
} from '../types/Achievement';

const logLoadError = (err: unknown) => {
  console.error('Error fetching achievements:', err);
};

export function useAchievements() {
  const dateContext = useContext(DateContext);
  const timeZone =
    dateContext?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const {
    data: achievements,
    error: achievementsError,
    isLoading: achievementsLoading,
    mutate: mutateAchievements,
  } = useSWR<Achievement[], Error>(
    [achievementsKey, timeZone],
    () => achievementApi.getAllAchievements(timeZone),
    { onError: logLoadError },
  );
  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR<AchievementStats, Error>(
    achievementStatsKey,
    () => achievementApi.getAchievementStats(),
    { onError: logLoadError },
  );

  // Fetch the achievements and their stats again
  const refetch = useCallback(async () => {
    await Promise.all([mutateAchievements(), mutateStats()]);
  }, [mutateAchievements, mutateStats]);

  // Check for new achievements
  const checkNewAchievements =
    useCallback(async (): Promise<AchievementCheckResponse | null> => {
      try {
        const result = await achievementApi.checkAchievements(timeZone);

        // Refresh data if new achievements were awarded
        if (result.count > 0) {
          await refetch();
        }

        return result;
      } catch (err) {
        console.error('Error checking achievements:', err);
        return null;
      }
    }, [refetch, timeZone]);

  // Refresh achievements data
  const refresh = useCallback(() => {
    void refetch();
  }, [refetch]);

  const loadFailed = Boolean(achievementsError ?? statsError);

  return {
    achievements: achievements ?? [],
    stats: stats ?? null,
    loading: achievementsLoading || statsLoading,
    error: loadFailed ? 'Failed to load achievements. Please try again.' : null,
    checkNewAchievements,
    refresh,
  };
}

export function useAchievementProgress() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filterAchievementsByCategory = useCallback(
    (achievements: Achievement[], category: string) => {
      if (category === 'all') return achievements;
      return achievements.filter(
        (achievement) => achievement.category === category,
      );
    },
    [],
  );

  return {
    selectedCategory,
    setSelectedCategory,
    filterAchievementsByCategory,
  };
}
