import useSWR from "swr";
import { ProgressOverview } from "@/features/progress/types/ProgressOverview";
import { fetchProgressOverview } from "@/features/habits/api";
import { useContext } from "react";
import { DateContext } from "@/context/DateContext";

export default function useProgressOverview(selectedDate?: Date) {
  const { currentDate, timeZone } = useContext(DateContext);
  const date = selectedDate ?? currentDate;

  const progressOverviewEndpointKey = timeZone
    ? `/api/v1/habits/progress/overview?date=${date.toISOString()}&timeZone=${timeZone}`
    : null;
  const { data: progressOverview } = useSWR<ProgressOverview>(
    progressOverviewEndpointKey,
    () => fetchProgressOverview(date, timeZone || ""),
  );

  return {
    currentStreak: progressOverview?.currentStreak ?? 0,
    longestStreak: progressOverview?.longestStreak ?? 0,
    insightData: progressOverview?.days ?? [],
  };
}
