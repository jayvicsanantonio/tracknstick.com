// Fetches daily completion rates for the 7-day Sunday-Saturday week containing a given date.
// Safely returns empty state when disabled or when DateContext is not mounted.

import { useContext, useMemo } from 'react';
import useSWR, { type SWRResponse } from 'swr';
import { DateContext } from '@app/providers/DateContext';
import { fetchProgressHistory } from '@/features/progress/api';
import type { HistoryDates } from '@/features/progress/types/HistoryDates';
import {
  getLocalEndOfDayUTC,
  getLocalStartofDayUTC,
} from '@shared/utils/date/formatDate';

export interface WeekDayInfo {
  /** Midday local Date used for navigation and formatting. */
  date: Date;
  /** YYYY-MM-DD key in the viewer's timezone. */
  dateKey: string;
  /** Short weekday label, e.g. "Sun". */
  weekdayShort: string;
  /** Day of month (1-31). */
  dayOfMonth: number;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
}

/** Builds the 7 Sunday-Saturday days around `anchorDate` in `timeZone`. */
export function buildWeekDays(
  anchorDate: Date,
  todayDate: Date,
  timeZone: string,
): WeekDayInfo[] {
  const anchorMidday = new Date(
    anchorDate.getFullYear(),
    anchorDate.getMonth(),
    anchorDate.getDate(),
    12,
    0,
    0,
  );
  const sunday = new Date(anchorMidday);
  sunday.setDate(anchorMidday.getDate() - anchorMidday.getDay());

  const todayKey = todayDate.toLocaleDateString('en-CA', { timeZone });
  const selectedKey = anchorDate.toLocaleDateString('en-CA', { timeZone });

  return Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(sunday);
    day.setDate(sunday.getDate() + offset);
    const dateKey = day.toLocaleDateString('en-CA', { timeZone });

    return {
      date: day,
      dateKey,
      weekdayShort: day.toLocaleDateString('en-US', {
        timeZone,
        weekday: 'short',
      }),
      dayOfMonth: day.getDate(),
      isToday: dateKey === todayKey,
      isPast: dateKey < todayKey,
      isSelected: dateKey === selectedKey,
    };
  });
}

export function useWeekProgressHistory(enabled = true) {
  const dateContext = useContext(DateContext);
  const timeZone = dateContext?.timeZone ?? 'UTC';
  const selectedDate = dateContext?.date;
  const currentDate = dateContext?.currentDate;

  const days = useMemo(() => {
    if (!selectedDate || !currentDate) return [];
    return buildWeekDays(selectedDate, currentDate, timeZone);
  }, [selectedDate, currentDate, timeZone]);

  const boundaries = useMemo(() => {
    if (days.length !== 7) return null;
    const first = days[0].date;
    const last = days[6].date;
    return {
      startDate: getLocalStartofDayUTC(first, timeZone),
      endDate: getLocalEndOfDayUTC(last, timeZone),
    };
  }, [days, timeZone]);

  const cacheKey =
    enabled && boundaries
      ? ([
          'progressHistory',
          timeZone,
          boundaries.startDate,
          boundaries.endDate,
        ] as const)
      : null;

  const { data, error, isLoading }: SWRResponse<HistoryDates[], Error> = useSWR<
    HistoryDates[],
    Error
  >(
    cacheKey,
    () =>
      boundaries
        ? fetchProgressHistory(
            timeZone,
            boundaries.startDate,
            boundaries.endDate,
          )
        : Promise.resolve([]),
    { keepPreviousData: true },
  );

  const rateByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of data ?? []) {
      map.set(entry.date, Math.round(entry.completionRate));
    }
    return map;
  }, [data]);

  return {
    days,
    rateByDate,
    isLoading,
    error,
  };
}
