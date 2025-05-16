import useSWR, { SWRResponse } from "swr";
import {
  fetchProgressStreaks,
  ProgressStreaksResponse,
} from "@/features/progress/api";

export default function useProgressStreaks() {
  const {
    data,
    error,
    isLoading,
  }: SWRResponse<ProgressStreaksResponse, Error> = useSWR<
    ProgressStreaksResponse,
    Error
  >("progressStreaks", fetchProgressStreaks);

  return {
    currentStreak: data?.currentStreak ?? 0,
    longestStreak: data?.longestStreak ?? 0,
    isLoading,
    error,
  };
}
