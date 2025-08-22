// Service for calculating habit completion status based on entries
// Provides centralized logic for determining if habits are completed for specific dates

import { OfflineHabit, HabitEntry } from '../types';
import { IDBManager } from '../database/IDBManager';
import { Frequency } from '@/features/habits/types/Frequency';
export interface HabitWithCompletion extends OfflineHabit {
  completed: boolean;
  completionDate?: Date;
}

export interface CompletionStats {
  totalHabits: number;
  completedHabits: number;
  completionRate: number;
  streakCount: number;
  lastCompletionDate?: Date;
}

export class HabitCompletionService {
  private dbManager: IDBManager;

  constructor(dbManager: IDBManager) {
    this.dbManager = dbManager;
  }

  /**
   * Calculate completion status for habits on a specific date
   */
  async getHabitsWithCompletion(
    habits: OfflineHabit[],
    date: Date,
  ): Promise<HabitWithCompletion[]> {
    const normalizedDate = this.normalizeDate(date);
    // const dateKey = this.formatDateKey(normalizedDate);

    // Get all entries for this date
    const entriesForDate = await this.dbManager.getByIndex<HabitEntry>(
      'habitEntries',
      'date',
      normalizedDate,
    );

    // Create a map for quick lookup
    const entryMap = new Map<string, HabitEntry>();
    entriesForDate
      .filter((entry) => !entry.deleted)
      .forEach((entry) => {
        entryMap.set(entry.habitId, entry);
      });

    // Map habits with completion status
    return habits
      .filter((habit) => !habit.deleted)
      .filter((habit) => this.isHabitActiveOnDate(habit, date))
      .map((habit) => {
        const entry = entryMap.get(habit.id!);
        const completed = entry?.completed ?? false;

        return {
          ...habit,
          completed,
          completionDate: completed ? entry?.date : undefined,
        };
      });
  }

  /**
   * Get completion status for a specific habit on a specific date
   */
  async getHabitCompletion(
    habitId: string,
    date: Date,
  ): Promise<{ completed: boolean; entry?: HabitEntry }> {
    const normalizedDate = this.normalizeDate(date);
    const entryId = this.generateEntryId(habitId, normalizedDate);

    const entry = await this.dbManager.get<HabitEntry>('habitEntries', entryId);

    return {
      completed: entry?.completed ?? false,
      entry: entry && !entry.deleted ? entry : undefined,
    };
  }

  /**
   * Calculate completion statistics for a date range
   */
  async getCompletionStats(
    habits: OfflineHabit[],
    startDate: Date,
    endDate: Date,
  ): Promise<CompletionStats> {
    const activeHabits = habits.filter((habit) => !habit.deleted);

    if (activeHabits.length === 0) {
      return {
        totalHabits: 0,
        completedHabits: 0,
        completionRate: 0,
        streakCount: 0,
      };
    }

    // Get all entries in the date range
    const entries = await this.dbManager.getByDateRange<HabitEntry>(
      'habitEntries',
      'date',
      this.normalizeDate(startDate),
      this.normalizeDate(endDate),
    );

    const completedEntries = entries.filter(
      (entry) => entry.completed && !entry.deleted,
    );

    const totalPossibleCompletions = this.calculateTotalPossibleCompletions(
      activeHabits,
      startDate,
      endDate,
    );

    const completionRate =
      totalPossibleCompletions > 0
        ? Math.round((completedEntries.length / totalPossibleCompletions) * 100)
        : 0;

    // Calculate current streak
    const streakCount = await this.calculateCurrentStreak(
      activeHabits,
      endDate,
    );

    // Find last completion date
    const lastCompletionDate = completedEntries.sort(
      (a, b) => b.date.getTime() - a.date.getTime(),
    )[0]?.date;

    return {
      totalHabits: activeHabits.length,
      completedHabits: completedEntries.length,
      completionRate,
      streakCount,
      lastCompletionDate,
    };
  }

  /**
   * Calculate completion streak for habits
   */
  async calculateCurrentStreak(
    habits: OfflineHabit[],
    fromDate: Date = new Date(),
  ): Promise<number> {
    const activeHabits = habits.filter((habit) => !habit.deleted);

    if (activeHabits.length === 0) return 0;

    let streakCount = 0;
    let currentDate = this.normalizeDate(fromDate);

    // Go backward day by day to find the streak
    while (true) {
      const habitsWithCompletion = await this.getHabitsWithCompletion(
        activeHabits,
        currentDate,
      );

      const habitsForDay = habitsWithCompletion.filter((habit) =>
        this.isHabitActiveOnDate(habit, currentDate),
      );

      if (habitsForDay.length === 0) {
        // No habits scheduled for this day, continue to previous day
        currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
        continue;
      }

      const allCompleted = habitsForDay.every((habit) => habit.completed);

      if (!allCompleted) {
        // Streak is broken
        break;
      }

      streakCount++;
      currentDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

      // Prevent infinite loop - limit to reasonable streak length
      if (streakCount > 365) break;
    }

    return streakCount;
  }

  /**
   * Check if a habit should be active on a specific date
   */
  private isHabitActiveOnDate(habit: OfflineHabit, date: Date): boolean {
    const normalizedDate = this.normalizeDate(date);

    // Check if date is within habit's active period
    if (normalizedDate < this.normalizeDate(habit.startDate)) {
      return false;
    }

    if (habit.endDate && normalizedDate > this.normalizeDate(habit.endDate)) {
      return false;
    }

    // Check if habit is scheduled for this day of week
    const dayOfWeek = normalizedDate.getDay();
    // Convert numeric day (0-6) to Frequency type
    const dayNames: Frequency[] = [
      'Sun',
      'Mon',
      'Tue',
      'Wed',
      'Thu',
      'Fri',
      'Sat',
    ];
    const dayName = dayNames[dayOfWeek];
    const isScheduledDay = dayName ? habit.frequency.includes(dayName) : false;

    return isScheduledDay;
  }

  /**
   * Calculate total possible completions for habits in date range
   */
  private calculateTotalPossibleCompletions(
    habits: OfflineHabit[],
    startDate: Date,
    endDate: Date,
  ): number {
    let total = 0;
    let currentDate = this.normalizeDate(startDate);
    const endDateNormalized = this.normalizeDate(endDate);

    while (currentDate <= endDateNormalized) {
      const activeHabitsForDay = habits.filter((habit) =>
        this.isHabitActiveOnDate(habit, currentDate),
      );

      total += activeHabitsForDay.length;
      currentDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
    }

    return total;
  }

  /**
   * Normalize date to remove time component
   */
  private normalizeDate(date: Date): Date {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
  }

  /**
   * Format date as key for consistent indexing
   */
  private formatDateKey(date: Date): string {
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }

  /**
   * Generate consistent entry ID for habit and date
   */
  private generateEntryId(habitId: string, date: Date): string {
    const dateStr = this.formatDateKey(date);
    return `${habitId}_${dateStr}`;
  }

  /**
   * Get completion summary for multiple dates
   */
  async getDailyCompletionSummary(
    habits: OfflineHabit[],
    dates: Date[],
  ): Promise<Map<string, { completed: number; total: number; rate: number }>> {
    const summary = new Map<
      string,
      { completed: number; total: number; rate: number }
    >();

    for (const date of dates) {
      const habitsWithCompletion = await this.getHabitsWithCompletion(
        habits,
        date,
      );
      const activeHabits = habitsWithCompletion.filter((habit) =>
        this.isHabitActiveOnDate(habit, date),
      );

      const completedCount = activeHabits.filter(
        (habit) => habit.completed,
      ).length;
      const totalCount = activeHabits.length;
      const rate =
        totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const dateKey = this.formatDateKey(date);
      summary.set(dateKey, {
        completed: completedCount,
        total: totalCount,
        rate,
      });
    }

    return summary;
  }

  /**
   * Check for potential habit entry conflicts
   */
  async detectEntryConflicts(
    habitId: string,
    date: Date,
  ): Promise<HabitEntry[]> {
    const normalizedDate = this.normalizeDate(date);

    // Get all entries for this habit and date (including deleted ones for conflict detection)
    // Note: We need to search for entries with the composite key
    const entryId = this.generateEntryId(habitId, normalizedDate);
    const entry = await this.dbManager.get<HabitEntry>('habitEntries', entryId);
    const entries = entry ? [entry] : [];

    // Return entries that might be conflicting (multiple entries for same habit/date)
    return entries.filter(() => entries.length > 1);
  }
}
