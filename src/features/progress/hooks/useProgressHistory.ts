import useSWR, { SWRResponse } from "swr";
import { fetchProgressHistory } from "@/features/progress/api";
import { useState, useEffect } from "react";
import { formatISO } from "date-fns";
import { HistoryDates } from "@/features/progress/types/HistoryDates";

export default function useProgressHistory(selectedMonth?: Date) {
  const [monthStartDate, setMonthStartDate] = useState<string>("");
  const [monthEndDate, setMonthEndDate] = useState<string>("");

  useEffect(() => {
    if (selectedMonth) {
      const year = selectedMonth.getFullYear();
      const month = selectedMonth.getMonth();

      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0);

      setMonthStartDate(formatISO(firstDay, { representation: "date" }));
      setMonthEndDate(formatISO(lastDay, { representation: "date" }));
    } else {
      setMonthStartDate("");
      setMonthEndDate("");
    }
  }, [selectedMonth]);

  const cacheKey =
    monthStartDate && monthEndDate
      ? (["progressHistory", monthStartDate, monthEndDate] as const)
      : (["progressHistory"] as const);

  const { data, error, isLoading }: SWRResponse<HistoryDates[], Error> = useSWR<
    HistoryDates[],
    Error
  >(cacheKey, () => fetchProgressHistory(monthStartDate, monthEndDate));

  return {
    historyData: data ?? [],
    isLoading,
    error,
  };
}
