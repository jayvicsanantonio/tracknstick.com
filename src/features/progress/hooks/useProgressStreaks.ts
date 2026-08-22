import useSWR, { SWRResponse } from 'swr';
import {
  fetchProgressStreaks,
  ProgressStreaksResponse,
} from '@/features/progress/api';
import {} from 'react';
import { useDate } from '@app/providers/useDate';

export default function useProgressStreaks() {
  const { timeZone } = useDate();
  const {
    data,
    error,
    isLoading,
  }: SWRResponse<ProgressStreaksResponse, Error> = useSWR<
    ProgressStreaksResponse,
    Error
  >(['progressStreaks', timeZone] as const, () =>
    fetchProgressStreaks(timeZone),
  );

  return {
    currentStreak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? 0,
    isLoading,
    error,
  };
}
