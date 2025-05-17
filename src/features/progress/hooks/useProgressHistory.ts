import useSWR, { SWRResponse } from "swr";
import { fetchProgressHistory } from "@/features/progress/api";
import { useState, useEffect, useContext } from "react";
import { HistoryDates } from "@/features/progress/types/HistoryDates";
import { getLocalStartofDayUTC, getLocalEndOfDayUTC } from "@/lib/formatDate";
import { DateContext } from "@/context/DateContext";

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
  const { date, timeZone } = useContext(DateContext);
  const [monthStartDate, setMonthStartDate] = useState<Date>(() => {
    const { startDate } = getMonthBoundaryDates(
      selectedMonth || new Date(),
      timeZone,
    );
    return startDate;
  });
  const [monthEndDate, setMonthEndDate] = useState<Date>(() => {
    const { endDate } = getMonthBoundaryDates(
      selectedMonth || new Date(),
      timeZone,
    );
    return endDate;
  });

  useEffect(() => {
    const { startDate, endDate } = getMonthBoundaryDates(
      selectedMonth || new Date(),
      timeZone,
    );
    setMonthStartDate(startDate);
    setMonthEndDate(endDate);
  }, [selectedMonth, timeZone]);

  const cacheKey =
    monthStartDate && monthEndDate
      ? ([
          "progressHistory",
          date.toISOString(),
          monthStartDate,
          monthEndDate,
        ] as const)
      : (["progressHistory", date.toISOString()] as const);

  const { data, error, isLoading }: SWRResponse<HistoryDates[], Error> = useSWR<
    HistoryDates[],
    Error
  >(cacheKey, () =>
    fetchProgressHistory(timeZone, monthStartDate, monthEndDate),
  );

  return {
    historyData: data ?? [],
    isLoading,
    error,
  };
}
