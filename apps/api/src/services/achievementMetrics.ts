// Maps each achievement to the value that measures it
// Keyed by achievement key, which is UNIQUE in the schema and needs no re-seed

import type { AchievementTrack } from '@tracknstick/contracts';
import type { UserHabitStats } from '../repositories/achievement.repository.js';

/**
 * Everything an achievement rule can measure, read once per request. The
 * streaks and the day counts come from the progress summary, every day in
 * the user's time zone, so achievements agree with the Progress page.
 */
export interface UserStatsSnapshot extends UserHabitStats {
  currentStreak: number;
  longestStreak: number;
  /** Days with at least one check-in. */
  activeDays: number;
  /** Days on which every scheduled habit was done. */
  perfectDays: number;
  /** The most habits checked off on any one day. */
  maxHabitsInOneDay: number;
  /** Days with a check-in tapped that same day before 8 AM. */
  earlyDays: number;
  /** Days with a check-in tapped that same day at or after 10 PM. */
  lateDays: number;
  /** Saturdays and Sundays with a check-in. */
  weekendDays: number;
  /** Times a habit was checked off again after 7 days or more without it. */
  habitComebacks: number;
  /** Times any check-in came after 30 days or more with none. */
  longComebacks: number;
}

type Metric = (s: UserStatsSnapshot) => number;

/**
 * Registered achievements are measurable from the snapshot. Anything absent
 * is explicitly unmeasurable and reports no progress rather than a false 0%.
 *
 * Keyed by `key` rather than `type` or `requirement_type` on purpose: `key` is
 * the stable name of an achievement, the one the seed migration
 * (migrations/0003_seed_achievements.sql) upserts by, so it needs no schema
 * change.
 */
export const METRICS: Record<string, Metric> = {
  // Habits created
  first_habit: (s) => s.totalHabits,
  three_habits: (s) => s.totalHabits,
  five_habits: (s) => s.totalHabits,
  ten_habits: (s) => s.totalHabits,
  twenty_habits: (s) => s.totalHabits,

  // Total completions
  first_completion: (s) => s.totalCompletions,
  completions_10: (s) => s.totalCompletions,
  completions_25: (s) => s.totalCompletions,
  completions_50: (s) => s.totalCompletions,
  completions_100: (s) => s.totalCompletions,
  completions_250: (s) => s.totalCompletions,
  completions_500: (s) => s.totalCompletions,
  completions_1000: (s) => s.totalCompletions,

  // Streaks measure the best run ever of days on which every habit was done
  streak_3: (s) => s.longestStreak,
  streak_7: (s) => s.longestStreak,
  streak_14: (s) => s.longestStreak,
  streak_21: (s) => s.longestStreak,
  streak_30: (s) => s.longestStreak,
  streak_50: (s) => s.longestStreak,
  streak_66: (s) => s.longestStreak,
  streak_100: (s) => s.longestStreak,
  streak_365: (s) => s.longestStreak,
  streak_500: (s) => s.longestStreak,
  streak_1000: (s) => s.longestStreak,

  // Days on which at least one habit was completed
  first_week: (s) => s.activeDays,
  active_30_days: (s) => s.activeDays,
  active_60_days: (s) => s.activeDays,
  active_100_days: (s) => s.activeDays,
  time_traveler: (s) => s.activeDays,

  // Days on which every scheduled habit was completed
  perfect_week: (s) => s.perfectDays,
  perfect_month: (s) => s.perfectDays,

  // Miscellaneous measurable behaviours
  social_butterfly: (s) => s.notedCompletions,
  maximalist: (s) => s.maxHabitsInOneDay,

  // When and how often the user checks in, in their time zone
  early_bird: (s) => s.earlyDays,
  night_owl: (s) => s.lateDays,
  weekend_warrior: (s) => s.weekendDays,
  comeback_kid: (s) => s.habitComebacks,
  phoenix: (s) => s.longComebacks,
};

/**
 * The series each achievement belongs to. Every achievement on a track is
 * measured by the same value, so the track reads as one ladder of targets.
 * Achievements absent here are one-offs.
 */
export const TRACKS: Record<string, AchievementTrack> = {
  first_completion: 'check_ins',
  completions_10: 'check_ins',
  completions_25: 'check_ins',
  completions_50: 'check_ins',
  completions_100: 'check_ins',
  completions_250: 'check_ins',
  completions_500: 'check_ins',
  completions_1000: 'check_ins',

  streak_3: 'streak',
  streak_7: 'streak',
  streak_14: 'streak',
  streak_21: 'streak',
  streak_30: 'streak',
  streak_50: 'streak',
  streak_66: 'streak',
  streak_100: 'streak',
  streak_365: 'streak',
  streak_500: 'streak',
  streak_1000: 'streak',

  first_week: 'active_days',
  active_30_days: 'active_days',
  active_60_days: 'active_days',
  active_100_days: 'active_days',
  time_traveler: 'active_days',

  perfect_week: 'perfect_days',
  perfect_month: 'perfect_days',

  first_habit: 'habits',
  three_habits: 'habits',
  five_habits: 'habits',
  ten_habits: 'habits',
  twenty_habits: 'habits',
};

/**
 * Keys deliberately left unregistered, with the reason. Kept as data so the
 * registry test can assert every definition is either measured or listed here,
 * and neither list can silently drift from the seeded catalogue.
 */
export const UNMEASURABLE: Record<string, string> = {
  perfectionist: 'needs consecutive perfect days, not a total',
  habit_guru: 'needs a completion rate over a rolling 30-day window',
  minimalist: 'ambiguous: "maintain just 1 habit for 30 days"',
  habit_variety: 'habits have no "type" column to vary',
  habit_architect_advanced:
    'needs coverage across all frequency types, not a count',
  habit_legend:
    'counts earned achievements, which would make evaluation self-referential',
};

/** Whether an achievement has a metric, and so can be earned at all. */
export function isMeasurable(achievement: { key: string }): boolean {
  return Object.prototype.hasOwnProperty.call(METRICS, achievement.key);
}

/**
 * The measured value for an achievement, or null when it has no metric.
 * null is distinct from 0: it means "not measurable", not "none yet".
 */
export function measure(
  achievement: { key: string },
  snapshot: UserStatsSnapshot
): number | null {
  const metric = METRICS[achievement.key];
  return metric ? metric(snapshot) : null;
}
