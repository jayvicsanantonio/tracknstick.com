import {} from 'react';
import useSWR from 'swr';
import { fetchHabitStats, habitStatsKey } from '@/features/habits/api';
import { useDate } from '@app/providers/useDate';
import { HabitStats } from '../types/HabitStats';

export default function useHabitStats(habitId: string): HabitStats {
  const { timeZone } = useDate();
  const habitStatsEndpointKey = habitStatsKey(habitId, timeZone);
  const { data: habitStats } = useSWR<HabitStats | null>(
    habitStatsEndpointKey,
    () => fetchHabitStats(habitId, timeZone || ''),
  );

  return (
    habitStats ?? {
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      lastCompleted: new Date().toISOString(),
    }
  );
}
