import { useContext } from 'react';
import useSWR from 'swr';
import { fetchHabitStats } from '@/features/habits/api';
import { DateContext } from '@/context/DateContext';
import { HabitStats } from '../types/HabitStats';

export default function useHabitStats(habitId: string): HabitStats {
  const { timeZone } = useContext(DateContext);
  const habitStatsEndpointKey = `/api/v1/habits/${habitId}/stats?timeZone=${timeZone}`;
  const { data: habitStats } = useSWR<HabitStats | null>(
    habitStatsEndpointKey,
    () => fetchHabitStats(habitId, timeZone || '')
  );

  return (
    habitStats ?? {
      streak: 0,
      totalCompletions: 0,
      lastCompleted: new Date().toISOString(),
    }
  );
}
