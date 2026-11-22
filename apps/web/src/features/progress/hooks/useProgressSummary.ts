import useSWR, { SWRResponse } from 'swr';
import {
  fetchProgressSummary,
  ProgressSummaryResponse,
} from '@/features/progress/api';
import { useDate } from '@app/providers/useDate';

export default function useProgressSummary() {
  const { timeZone } = useDate();
  const {
    data,
    error,
    isLoading,
  }: SWRResponse<ProgressSummaryResponse, Error> = useSWR<
    ProgressSummaryResponse,
    Error
  >(['progressSummary', timeZone] as const, () =>
    fetchProgressSummary(timeZone),
  );

  return {
    currentStreak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? 0,
    totalCompletions: data?.totalCompletions ?? 0,
    activeDays: data?.activeDays ?? 0,
    perfectDays: data?.perfectDays ?? 0,
    overallCompletionRate: data?.overallCompletionRate ?? null,
    activeHabitsCount: data?.activeHabitsCount ?? 0,
    memberSince: data?.memberSince ?? null,
    isLoading,
    error,
  };
}
