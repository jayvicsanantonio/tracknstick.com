import { useContext } from 'react';
import useSWR, { SWRResponse } from 'swr';
import {
  fetchProgressSummary,
  ProgressSummaryResponse,
} from '@/features/progress/api';
import { DateContext } from '@app/providers/DateContext';

export default function useProgressSummary(enabled = true) {
  const dateContext = useContext(DateContext);
  const timeZone =
    dateContext?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone;
  const {
    data,
    error,
    isLoading,
  }: SWRResponse<ProgressSummaryResponse, Error> = useSWR<
    ProgressSummaryResponse,
    Error
  >(enabled ? (['progressSummary', timeZone] as const) : null, () =>
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
