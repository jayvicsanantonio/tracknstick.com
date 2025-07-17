import { HistoryDates } from '@/features/progress/types/HistoryDates';

export interface ProgressOverview {
  currentStreak: number;
  longestStreak: number;
  days: HistoryDates[];
}
