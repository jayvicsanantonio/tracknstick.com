import useSWR, { SWRResponse } from 'swr';
import { fetchProgressHistory } from '@/features/progress/api';
import { useContext, useMemo } from 'react';
import { HistoryDates } from '@/features/progress/types/HistoryDates';
import {
  getLocalStartofDayUTC,
  getLocalEndOfDayUTC,
} from '@shared/utils/date/formatDate';
import { DateContext } from '@app/providers/DateContext';

const getMonthBoundaryDates = (date: Date, timeZone: string) => {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  return {
    startDate: getLocalStartofDayUTC(firstDay, timeZone),
    endDate: getLocalEndOfDayUTC(lastDay, timeZone),
  };
};

export default function useProgressHistory(selectedMonth: Date) {
  const { timeZone } = useContext(DateContext);

  // Derived, not mirrored into state. Holding these in useState and syncing
  // them in an effect left one commit where selectedMonth had advanced but
  // the boundaries had not, so that render used the previous month's SWR key
  // -- already cached, so isLoading was false and the calendar drew last
  // month's data on the new month's grid.
  const { startDate, endDate } = useMemo(
    () => getMonthBoundaryDates(selectedMonth, timeZone),
    [selectedMonth, timeZone],
  );

  // timeZone rather than the selected dashboard day: the fetcher does not use
  // that day, so keying on it fragmented the cache at millisecond precision
  // for identical requests.
  const cacheKey = ['progressHistory', timeZone, startDate, endDate] as const;

  const { data, error, isLoading }: SWRResponse<HistoryDates[], Error> = useSWR<
    HistoryDates[],
    Error
  >(cacheKey, () => fetchProgressHistory(timeZone, startDate, endDate));

  return {
    historyData: data ?? [],
    isLoading,
    error,
  };
}
