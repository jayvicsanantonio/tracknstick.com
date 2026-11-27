// Data access for trackers (habit completions) in D1.
// Also builds the progress history and streak figures from those rows.
import type { ProgressSummaryResponse } from '@tracknstick/contracts';
import { D1Database } from '@cloudflare/workers-types';
import { computeStreaks } from '../utils/streakUtils.js';
import {
  getLocaleStartEndForDateKey,
  isValidTimeZone,
} from '../utils/dateUtils.js';
import { Tracker } from '../types/d1.js';

const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;
const SQLITE_DATETIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
const MAX_SUMMARY_YEARS = 10;

function extractDateKey(value: string | null): string | null {
  if (!value) return null;
  const head = value.split('T')[0];
  return DATE_KEY_RE.test(head) ? head : null;
}

/** An ISO or SQLite UTC timestamp as an instant, or null when unreadable. */
function parseInstant(value: string | null): Date | null {
  if (!value) return null;
  const iso = SQLITE_DATETIME_RE.test(value)
    ? `${value.replace(' ', 'T')}Z`
    : value;
  const parsed = new Date(iso);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseInstantToDateKey(
  value: string | null,
  formatter: Intl.DateTimeFormat
): string | null {
  if (!value) return null;
  if (DATE_KEY_RE.test(value)) return value;
  const parsed = parseInstant(value);
  return parsed ? formatter.format(parsed) : null;
}

/** Whole days from one YYYY-MM-DD date key to a later one. */
function daysBetween(from: string, to: string): number {
  return Math.round(
    (Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) /
      86_400_000
  );
}

/** Check-ins tapped before this hour count toward Early Bird. */
const EARLY_BEFORE_HOUR = 8;
/** Check-ins tapped at or after this hour count toward Night Owl. */
const LATE_FROM_HOUR = 22;
/** A habit checked off again this many days after its last check-in is a comeback. */
const HABIT_COMEBACK_DAYS = 8;
/** Any check-in this many days after the last one is a return from an absence. */
const LONG_COMEBACK_DAYS = 31;
/** Habit Guru's window: this many days in a row. */
const RATE_WINDOW_DAYS = 30;

/**
 * The best completion rate, as a whole percentage rounded down, over any
 * window of consecutive days; 0 until there are that many days.
 */
function bestWindowRate(
  days: readonly { scheduled: number; completed: number }[],
  windowDays: number
): number {
  if (days.length < windowDays) return 0;
  let scheduled = 0;
  let completed = 0;
  let best = 0;
  for (let i = 0; i < days.length; i++) {
    scheduled += days[i].scheduled;
    completed += days[i].completed;
    if (i >= windowDays) {
      scheduled -= days[i - windowDays].scheduled;
      completed -= days[i - windowDays].completed;
    }
    if (i >= windowDays - 1 && scheduled > 0) {
      best = Math.max(best, Math.floor((completed / scheduled) * 100));
    }
  }
  return best;
}

interface TrackerRow {
  id: number;
  habit_id: number;
  user_id: string;
  timestamp: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Finds tracker entries for multiple habits within a specific ISO date range for a user.
 */
export async function findTrackersByDateRange(
  db: D1Database,
  userId: string,
  habitIds: number[],
  startDate: string,
  endDate: string
): Promise<TrackerRow[]> {
  if (!habitIds || habitIds.length === 0) {
    return [];
  }

  // Convert habitIds to strings for SQL placeholders
  const placeholders = habitIds.map(() => '?').join(',');

  // Build the parameter list with userId first, then all habitIds
  const params = [userId, ...habitIds, startDate, endDate];

  const trackers = await db
    .prepare(
      `SELECT * FROM trackers 
       WHERE user_id = ? 
       AND habit_id IN (${placeholders})
       AND timestamp >= ? 
       AND timestamp <= ?
       AND deleted_at IS NULL`
    )
    .bind(...params)
    .all<TrackerRow>();

  if (!trackers.success) {
    throw new Error('Failed to fetch trackers');
  }

  return trackers.results;
}

/**
 * Finds tracker entries for a specific habit, optionally filtered by a date range (YYYY-MM-DD).
 */
export async function findTrackersByHabitAndDateRange(
  db: D1Database,
  habitId: number,
  userId: string,
  startDate?: string,
  endDate?: string
): Promise<Tracker[]> {
  let sql = `
    SELECT id, habit_id, user_id, timestamp, notes, created_at, updated_at
    FROM trackers
    WHERE habit_id = ? AND user_id = ? AND deleted_at IS NULL
  `;
  const params: (string | number)[] = [habitId, userId];

  if (startDate && endDate) {
    sql += ` AND DATE(timestamp) BETWEEN DATE(?) AND DATE(?)`;
    params.push(startDate, endDate);
  } else if (startDate) {
    sql += ` AND DATE(timestamp) >= DATE(?)`;
    params.push(startDate);
  } else if (endDate) {
    sql += ` AND DATE(timestamp) <= DATE(?)`;
    params.push(endDate);
  }

  sql += ` ORDER BY timestamp DESC`;

  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<Tracker>();

  if (!result.success) {
    throw new Error('Failed to fetch trackers by habit and date range');
  }

  return result.results;
}

/**
 * Finds tracker IDs for a specific habit within a precise ISO date range (used for checking existence).
 */
export async function findTrackersInDateRange(
  db: D1Database,
  habitId: number,
  userId: string,
  startDateISO: string,
  endDateISO: string
): Promise<{ id: number }[]> {
  const sql = `
    SELECT id
    FROM trackers
    WHERE habit_id = ? AND user_id = ? AND (timestamp BETWEEN ? AND ?)
    AND deleted_at IS NULL
  `;
  const params = [habitId, userId, startDateISO, endDateISO];

  const result = await db
    .prepare(sql)
    .bind(...params)
    .all();

  if (!result.success) {
    throw new Error('Failed to check for trackers in date range');
  }

  return result.results as { id: number }[];
}

/**
 * Removes specific tracker entries by their IDs for a given habit and user.
 */
export async function removeTrackersByIds(
  db: D1Database,
  trackerIds: number[],
  habitId: number,
  userId: string
): Promise<{ changes: number }> {
  if (!trackerIds || trackerIds.length === 0) {
    return { changes: 0 };
  }

  // D1 doesn't support array parameters directly, so we need to build the query
  const placeholders = trackerIds.map(() => '?').join(',');
  const sql = `
    DELETE FROM trackers
    WHERE id IN (${placeholders}) AND habit_id = ? AND user_id = ?
  `;
  const params = [...trackerIds, habitId, userId];

  const result = await db
    .prepare(sql)
    .bind(...params)
    .run();

  if (!result.success) {
    throw new Error('Failed to remove trackers by IDs');
  }

  return { changes: result.meta.changes || 0 };
}

/**
 * Removes all tracker entries associated with a specific habit for a user.
 */
export async function removeAllByHabit(
  db: D1Database,
  habitId: number,
  userId: string
): Promise<{ changes: number }> {
  const sql = `DELETE FROM trackers WHERE habit_id = ? AND user_id = ?`;
  const params = [habitId, userId];

  const result = await db
    .prepare(sql)
    .bind(...params)
    .run();

  if (!result.success) {
    throw new Error('Failed to remove trackers by habit');
  }

  return { changes: result.meta.changes || 0 };
}

/**
 * Creates a new tracker entry for a habit.
 */
export async function create(
  db: D1Database,
  habitId: number,
  userId: string,
  timestamp: string,
  notes?: string
): Promise<number> {
  const sql = `
    INSERT INTO trackers (habit_id, user_id, timestamp, notes)
    VALUES (?, ?, ?, ?)
  `;
  const params = [habitId, userId, timestamp, notes || null];

  const result = await db
    .prepare(sql)
    .bind(...params)
    .run();

  if (!result.success) {
    throw new Error('Failed to create tracker');
  }

  return result.meta.last_row_id;
}

/**
 * Finds all tracker entries for a specific habit, ordered by timestamp descending.
 */
export async function findAllByHabit(
  db: D1Database,
  habitId: number,
  userId: string
): Promise<Tracker[]> {
  const sql = `
    SELECT id, habit_id, user_id, timestamp, notes, created_at, updated_at
    FROM trackers
    WHERE habit_id = ? AND user_id = ? AND deleted_at IS NULL
    ORDER BY timestamp DESC
  `;
  const params = [habitId, userId];

  const result = await db
    .prepare(sql)
    .bind(...params)
    .all<Tracker>();

  if (!result.success) {
    throw new Error('Failed to fetch all trackers for habit');
  }

  return result.results;
}

/**
 * Get all trackers for a specific habit
 */
export async function getAllTrackersForHabit(
  db: D1Database,
  userId: string,
  habitId: string | number
): Promise<TrackerRow[]> {
  const trackers = await db
    .prepare(
      `SELECT * FROM trackers 
       WHERE user_id = ? 
       AND habit_id = ?
       AND deleted_at IS NULL
       ORDER BY timestamp DESC`
    )
    .bind(userId, habitId)
    .all<TrackerRow>();

  if (!trackers.success) {
    throw new Error(`Failed to fetch trackers for habit ${habitId}`);
  }

  return trackers.results;
}

/**
 * Gets the user's progress history showing completion rate for each day
 * This uses a fixed calculation window of the past 365 days to ensure comprehensive tracking
 * Optional date parameters can restrict what's returned to the client but don't affect calculation
 * @param db D1Database instance
 * @param userId User's Clerk ID
 * @param startDate Optional start date (ISO format) to filter returned results
 * @param endDate Optional end date (ISO format) to filter returned results
 * @param timeZone User's timezone (IANA format, e.g., 'America/Los_Angeles')
 * @returns Array of daily completion records with date and completion percentage
 */
export async function getUserProgressHistory(
  db: D1Database,
  userId: string,
  startDate?: string,
  endDate?: string,
  timeZone = 'UTC'
): Promise<{ date: string; completionRate: number }[]> {
  try {
    if (!isValidTimeZone(timeZone)) {
      console.warn(`Invalid timezone "${timeZone}", falling back to UTC`);
      timeZone = 'UTC';
    }

    const now = new Date();

    // Get today's date in user's timezone (YYYY-MM-DD format)
    const todayInTZ = new Intl.DateTimeFormat('en-CA', { timeZone }).format(
      now
    );

    // Calculate start date (365 days ago in user's timezone)
    const startDateObj = new Date();
    startDateObj.setDate(startDateObj.getDate() - 365);
    const calculationStartDate = new Intl.DateTimeFormat('en-CA', {
      timeZone,
    }).format(startDateObj);

    // Generate list of all dates in range (in user's timezone)
    const dates: string[] = [];
    const currentDate = new Date(calculationStartDate + 'T12:00:00Z'); // Use noon to avoid DST issues
    const endDateObj = new Date(todayInTZ + 'T12:00:00Z');

    while (currentDate <= endDateObj) {
      dates.push(
        new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(
          currentDate
        )
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Fetch all habits for user (including deleted ones for historical accuracy)
    const habitsResult = await db
      .prepare(
        `
        SELECT id, frequency, start_date, end_date, deleted_at
        FROM habits 
        WHERE user_id = ?
      `
      )
      .bind(userId)
      .all();

    if (!habitsResult.success) {
      throw new Error('Failed to fetch habits for progress history');
    }

    const habits = habitsResult.results as {
      id: number;
      frequency: string;
      start_date: string;
      end_date: string | null;
      deleted_at: string | null;
    }[];

    if (habits.length === 0) {
      return [];
    }

    // Fetch all trackers in the date range
    // We need to query with UTC boundaries that cover the entire range in user's timezone
    const rangeStart = getLocaleStartEndForDateKey(
      calculationStartDate,
      timeZone
    ).localeStartISO;
    const rangeEnd = getLocaleStartEndForDateKey(
      todayInTZ,
      timeZone
    ).localeEndISO;

    const trackersResult = await db
      .prepare(
        `
        SELECT habit_id, timestamp 
        FROM trackers 
        WHERE user_id = ? 
        AND timestamp >= ? 
        AND timestamp <= ?
        AND deleted_at IS NULL
      `
      )
      .bind(userId, rangeStart, rangeEnd)
      .all();

    if (!trackersResult.success) {
      throw new Error('Failed to fetch trackers for progress history');
    }

    const trackers = trackersResult.results as {
      habit_id: number;
      timestamp: string;
    }[];

    // The calendar date (YYYY-MM-DD) an instant falls on in the user's
    // timezone. One formatter serves every tracker row in the request;
    // constructing an Intl.DateTimeFormat per row is the slow part.
    const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone });
    const trackerDateKey = (instant: Date): string =>
      dateKeyFormatter.format(instant);

    // Build a map of tracker completions by date (in user's timezone)
    const trackersByDate = new Map<string, Set<number>>();
    for (const tracker of trackers) {
      const trackerDate = trackerDateKey(new Date(tracker.timestamp));
      if (!trackersByDate.has(trackerDate)) {
        trackersByDate.set(trackerDate, new Set());
      }
      trackersByDate.get(trackerDate)!.add(tracker.habit_id);
    }

    // Calculate completion rate for each date
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const history: { date: string; completionRate: number }[] = [];

    for (const dateStr of dates) {
      // Get day of week for this date
      const date = new Date(dateStr + 'T12:00:00Z');
      const dayOfWeek = dayNames[date.getUTCDay()];

      // Count habits that should be active on this date
      let totalHabits = 0;
      const activeHabitIds: number[] = [];

      for (const habit of habits) {
        // Check if habit was active on this date
        const habitStartDate = habit.start_date.split('T')[0];
        const habitEndDate = habit.end_date
          ? habit.end_date.split('T')[0]
          : null;
        const habitDeletedAt = habit.deleted_at
          ? habit.deleted_at.split('T')[0]
          : null;

        // Habit must have started before or on this date
        if (habitStartDate > dateStr) continue;

        // Habit must not have ended before this date
        if (habitEndDate && habitEndDate < dateStr) continue;

        // If habit was deleted, it should still count for dates before deletion
        // (for historical accuracy)
        if (habitDeletedAt && habitDeletedAt <= dateStr) continue;

        // Check if habit is scheduled for this day of week
        const frequencyDays = habit.frequency.split(',');
        if (!frequencyDays.includes(dayOfWeek)) continue;

        totalHabits++;
        activeHabitIds.push(habit.id);
      }

      // Skip days with no scheduled habits
      if (totalHabits === 0) continue;

      // Count completed habits for this date
      const completedHabits = trackersByDate.get(dateStr);
      let completedCount = 0;

      if (completedHabits) {
        for (const habitId of activeHabitIds) {
          if (completedHabits.has(habitId)) {
            completedCount++;
          }
        }
      }

      const completionRate = Math.round((completedCount / totalHabits) * 100);
      history.push({ date: dateStr, completionRate });
    }

    // Sort by date descending (most recent first)
    history.sort((a, b) => b.date.localeCompare(a.date));

    // If startDate and endDate are provided, filter the results to the requested range
    if (startDate || endDate) {
      const filterStart = startDate ? startDate.split('T')[0] : null;
      const filterEnd = endDate ? endDate.split('T')[0] : null;

      return history.filter((entry) => {
        const afterStart = !filterStart || entry.date >= filterStart;
        const beforeEnd = !filterEnd || entry.date <= filterEnd;
        return afterStart && beforeEnd;
      });
    }

    return history;
  } catch (error) {
    console.error('Error fetching user progress history:', error);
    throw error;
  }
}

/**
 * Gets the user's current and longest streaks based on 100% completion days
 * @param db D1Database instance
 * @param userId User's Clerk ID
 * @param timeZone User's timezone (IANA format)
 * @returns Object containing current streak and longest streak
 */
export async function getUserStreaks(
  db: D1Database,
  userId: string,
  timeZone = 'UTC'
): Promise<{ currentStreak: number; longestStreak: number }> {
  try {
    if (!isValidTimeZone(timeZone)) {
      console.warn(`Invalid timezone "${timeZone}", falling back to UTC`);
      timeZone = 'UTC';
    }

    // Get the user's progress history with full year of data to ensure accurate streak calculation
    const history = await getUserProgressHistory(
      db,
      userId,
      undefined,
      undefined,
      timeZone
    );

    // history is already ordered newest-first by getUserProgressHistory and
    // contains one entry per *scheduled* day, so the fold can work by array
    // position without re-parsing or re-sorting dates.
    const today = new Intl.DateTimeFormat('en-CA', { timeZone }).format(
      new Date()
    );

    return computeStreaks(history, today);
  } catch (error) {
    console.error('Error calculating user streaks:', error);
    throw error;
  }
}

/** The lifetime summary, plus the most habits done on any one day. */
export interface UserLifetimeStats extends ProgressSummaryResponse {
  mostHabitsInOneDay: number;
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
  /** The best completion rate over any 30 days in a row; 0 before 30 days. */
  bestMonthRate: number;
}

/**
 * Computes all-time lifetime progress metrics since the user started using the app.
 * Reads user, habits, and tracker rows in a single D1 batch transaction and walks
 * every scheduled day from the earliest habit start date through today in the user's
 * timezone (not capped to 365 days).
 */
export async function getUserProgressSummary(
  db: D1Database,
  userId: string,
  timeZone = 'UTC'
): Promise<ProgressSummaryResponse> {
  // The response is exactly the summary contract, without the extra counts.
  const stats = await getUserLifetimeStats(db, userId, timeZone);
  return {
    currentStreak: stats.currentStreak,
    longestStreak: stats.longestStreak,
    totalCompletions: stats.totalCompletions,
    activeDays: stats.activeDays,
    perfectDays: stats.perfectDays,
    overallCompletionRate: stats.overallCompletionRate,
    activeHabitsCount: stats.activeHabitsCount,
    memberSince: stats.memberSince,
  };
}

/**
 * The lifetime summary's figures, every day counted in the user's time zone,
 * and the most habits done on any one of those days. Achievements measure
 * these, so they always agree with the Progress page.
 */
export async function getUserLifetimeStats(
  db: D1Database,
  userId: string,
  timeZone = 'UTC'
): Promise<UserLifetimeStats> {
  try {
    if (!isValidTimeZone(timeZone)) {
      console.warn(`Invalid timezone "${timeZone}", falling back to UTC`);
      timeZone = 'UTC';
    }

    const [userResult, habitsResult, trackersResult] = await db.batch([
      db
        .prepare(`SELECT created_at FROM users WHERE clerk_user_id = ?`)
        .bind(userId),
      db
        .prepare(
          `SELECT id, frequency, start_date, end_date, deleted_at
           FROM habits
           WHERE user_id = ?`
        )
        .bind(userId),
      db
        .prepare(
          `SELECT habit_id, timestamp,
                  COALESCE(tapped_at, created_at) AS tapped_at
           FROM trackers
           WHERE user_id = ? AND deleted_at IS NULL`
        )
        .bind(userId),
    ]);

    if (
      !userResult.success ||
      !habitsResult.success ||
      !trackersResult.success
    ) {
      throw new Error('Failed to fetch lifetime progress summary');
    }

    const userRow = (userResult.results[0] ?? null) as {
      created_at: string | null;
    } | null;
    const habits = habitsResult.results as {
      id: number;
      frequency: string;
      start_date: string;
      end_date: string | null;
      deleted_at: string | null;
    }[];
    const trackers = trackersResult.results as {
      habit_id: number;
      timestamp: string;
      tapped_at: string | null;
    }[];

    const dateKeyFormatter = new Intl.DateTimeFormat('en-CA', { timeZone });
    const hourFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone,
      hour: 'numeric',
      hourCycle: 'h23',
    });
    const todayInTZ = dateKeyFormatter.format(new Date());

    // Group completions by local calendar date in the user's timezone.
    const trackersByDate = new Map<string, Set<number>>();
    const datesByHabit = new Map<number, Set<string>>();
    const earlyDates = new Set<string>();
    const lateDates = new Set<string>();
    for (const tracker of trackers) {
      const dateKey = parseInstantToDateKey(
        tracker.timestamp,
        dateKeyFormatter
      );
      if (!dateKey) continue;
      let completedSet = trackersByDate.get(dateKey);
      if (!completedSet) {
        completedSet = new Set<number>();
        trackersByDate.set(dateKey, completedSet);
      }
      completedSet.add(tracker.habit_id);

      let habitDates = datesByHabit.get(tracker.habit_id);
      if (!habitDates) {
        habitDates = new Set<string>();
        datesByHabit.set(tracker.habit_id, habitDates);
      }
      habitDates.add(dateKey);

      // The time of day is when the check-in was tapped: tapped_at, as the
      // app sent it, or created_at for check-ins from before it did. It counts
      // only when tapped on the day it is for: `timestamp` holds the time the
      // app was opened, and a day checked off later says nothing about the
      // morning or night it was for.
      const tappedAt = parseInstant(tracker.tapped_at);
      if (tappedAt && dateKeyFormatter.format(tappedAt) === dateKey) {
        const hour = Number(hourFormatter.format(tappedAt));
        if (hour < EARLY_BEFORE_HOUR) earlyDates.add(dateKey);
        if (hour >= LATE_FROM_HOUR) lateDates.add(dateKey);
      }
    }

    const activeDates = [...trackersByDate.keys()].sort();
    const weekendDays = activeDates.filter((dateKey) => {
      const weekday = new Date(`${dateKey}T12:00:00Z`).getUTCDay();
      return weekday === 0 || weekday === 6;
    }).length;

    let habitComebacks = 0;
    for (const habitDates of datesByHabit.values()) {
      const sorted = [...habitDates].sort();
      for (let i = 1; i < sorted.length; i++) {
        if (daysBetween(sorted[i - 1], sorted[i]) >= HABIT_COMEBACK_DAYS) {
          habitComebacks += 1;
        }
      }
    }

    let longComebacks = 0;
    for (let i = 1; i < activeDates.length; i++) {
      if (
        daysBetween(activeDates[i - 1], activeDates[i]) >= LONG_COMEBACK_DAYS
      ) {
        longComebacks += 1;
      }
    }

    const occasionCounts = {
      earlyDays: earlyDates.size,
      lateDays: lateDates.size,
      weekendDays,
      habitComebacks,
      longComebacks,
    };

    // Earliest date the user started using the app (never in the future).
    let memberSince: string | null = null;
    const considerMemberSince = (candidate: string | null) => {
      if (!candidate || candidate > todayInTZ) return;
      if (memberSince === null || candidate < memberSince) {
        memberSince = candidate;
      }
    };

    considerMemberSince(
      parseInstantToDateKey(userRow?.created_at ?? null, dateKeyFormatter)
    );
    for (const dateKey of trackersByDate.keys()) {
      considerMemberSince(dateKey);
    }

    let activeHabitsCount = 0;
    let earliestHabitStart: string | null = null;
    const parsedHabits: {
      id: number;
      startDate: string | null;
      endDate: string | null;
      deletedAt: string | null;
      frequencySet: Set<string>;
    }[] = [];

    for (const habit of habits) {
      const startDate = extractDateKey(habit.start_date);
      const endDate = extractDateKey(habit.end_date);
      const deletedAt = extractDateKey(habit.deleted_at);

      if (habit.deleted_at === null && !habit.end_date) {
        activeHabitsCount += 1;
      }
      considerMemberSince(startDate);
      if (
        startDate &&
        startDate <= todayInTZ &&
        (earliestHabitStart === null || startDate < earliestHabitStart)
      ) {
        earliestHabitStart = startDate;
      }

      parsedHabits.push({
        id: habit.id,
        startDate,
        endDate,
        deletedAt,
        frequencySet: new Set(
          habit.frequency.split(',').map((day) => day.trim())
        ),
      });
    }

    const totalCompletions = trackers.length;
    const activeDays = trackersByDate.size;
    let mostHabitsInOneDay = 0;
    for (const completedOnDay of trackersByDate.values()) {
      mostHabitsInOneDay = Math.max(mostHabitsInOneDay, completedOnDay.size);
    }

    if (!earliestHabitStart) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalCompletions,
        activeDays,
        perfectDays: 0,
        overallCompletionRate: null,
        activeHabitsCount,
        memberSince,
        mostHabitsInOneDay,
        ...occasionCounts,
        bestMonthRate: 0,
      };
    }

    // Clamp extremely backdated habits so the daily walk always finishes quickly.
    const boundDate = new Date(`${todayInTZ}T12:00:00Z`);
    boundDate.setUTCFullYear(boundDate.getUTCFullYear() - MAX_SUMMARY_YEARS);
    const minWalkDate = boundDate.toISOString().slice(0, 10);
    const walkStart =
      earliestHabitStart < minWalkDate ? minWalkDate : earliestHabitStart;

    const currentDate = new Date(`${walkStart}T12:00:00Z`);
    const endDateObj = new Date(`${todayInTZ}T12:00:00Z`);
    const ascendingHistory: { date: string; completionRate: number }[] = [];
    let totalScheduled = 0;
    let totalScheduledCompleted = 0;
    let perfectDays = 0;
    // Every day walked, in order, for the best rate over a window of days.
    const walkedDays: { scheduled: number; completed: number }[] = [];

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().slice(0, 10);
      const dayOfWeek = DAY_NAMES[currentDate.getUTCDay()];
      const completedOnDay = trackersByDate.get(dateStr);

      let scheduledForDay = 0;
      let completedForDay = 0;

      for (const habit of parsedHabits) {
        if (!habit.startDate || habit.startDate > dateStr) continue;
        if (habit.endDate && habit.endDate < dateStr) continue;
        if (habit.deletedAt && habit.deletedAt <= dateStr) continue;
        if (!habit.frequencySet.has(dayOfWeek)) continue;

        scheduledForDay += 1;
        if (completedOnDay?.has(habit.id)) {
          completedForDay += 1;
        }
      }

      if (scheduledForDay > 0) {
        totalScheduled += scheduledForDay;
        totalScheduledCompleted += completedForDay;
        const completionRate = Math.round(
          (completedForDay / scheduledForDay) * 100
        );
        if (completionRate === 100) {
          perfectDays += 1;
        }
        ascendingHistory.push({ date: dateStr, completionRate });
      }
      walkedDays.push({
        scheduled: scheduledForDay,
        completed: completedForDay,
      });

      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
    }

    const descendingHistory = ascendingHistory.reverse();
    const { currentStreak, longestStreak } = computeStreaks(
      descendingHistory,
      todayInTZ
    );

    const overallCompletionRate =
      totalScheduled === 0
        ? null
        : Math.round((totalScheduledCompleted / totalScheduled) * 100);

    return {
      currentStreak,
      longestStreak,
      totalCompletions,
      activeDays,
      perfectDays,
      overallCompletionRate,
      activeHabitsCount,
      memberSince,
      mostHabitsInOneDay,
      ...occasionCounts,
      bestMonthRate: bestWindowRate(walkedDays, RATE_WINDOW_DAYS),
    };
  } catch (error) {
    console.error('Error calculating user progress summary:', error);
    throw error;
  }
}
