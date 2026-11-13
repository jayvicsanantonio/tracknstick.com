export interface HabitStats {
  streak: number;
  longestStreak: number;
  totalCompletions: number;
  // Null when the habit has never been completed. The API returns
  // `string | null` (habit.repository.getHabitStats), so this must too.
  lastCompleted: string | null;
}
