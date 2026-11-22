// Runs the all-time lifetime progress summary query against a real local D1 database.
// Covers empty accounts, timezone day boundaries, active vs archived habits, and
// history older than 365 days.

import { beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
import { getUserProgressSummary } from '../tracker.repository.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const EVERY_DAY = 'Mon,Tue,Wed,Thu,Fri,Sat,Sun';

const utcDateDaysAgo = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);

describe('getUserProgressSummary', () => {
  let db: D1Database;

  beforeAll(() => {
    db = env.DB;
  });

  async function addUser(userId: string, createdAt?: string) {
    if (createdAt) {
      await db
        .prepare('INSERT INTO users (clerk_user_id, created_at) VALUES (?, ?)')
        .bind(userId, createdAt)
        .run();
      return;
    }
    await db
      .prepare('INSERT INTO users (clerk_user_id) VALUES (?)')
      .bind(userId)
      .run();
  }

  async function addHabit(
    userId: string,
    name: string,
    startDate: string,
    endDate: string | null = null
  ): Promise<number> {
    const habit = await db
      .prepare(
        `INSERT INTO habits (user_id, name, frequency, start_date, end_date)
         VALUES (?, ?, ?, ?, ?) RETURNING id`
      )
      .bind(userId, name, EVERY_DAY, startDate, endDate)
      .first<{ id: number }>();
    return habit!.id;
  }

  async function addCompletion(
    userId: string,
    habitId: number,
    timestamp: string
  ) {
    await db
      .prepare(
        'INSERT INTO trackers (habit_id, user_id, timestamp) VALUES (?, ?, ?)'
      )
      .bind(habitId, userId, timestamp)
      .run();
  }

  it('returns clean empty defaults for a brand-new user with no rows', async () => {
    const summary = await getUserProgressSummary(
      db,
      'user_summary_brand_new',
      'UTC'
    );

    expect(summary).toEqual({
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      activeDays: 0,
      perfectDays: 0,
      overallCompletionRate: null,
      activeHabitsCount: 0,
      memberSince: null,
    });
  });

  it('summarizes completions, consistency, active days, perfect days, and streaks', async () => {
    const userId = 'user_summary_active';
    const startDay = utcDateDaysAgo(3);
    await addUser(userId, `${startDay} 08:00:00`);

    // 2 daily active habits over 4 days (days -3, -2, -1, 0 = 8 scheduled slots)
    const h1 = await addHabit(userId, 'Read', `${startDay}T00:00:00.000Z`);
    const h2 = await addHabit(userId, 'Run', `${startDay}T00:00:00.000Z`);
    // 1 archived habit (ended before today, not counted in activeHabitsCount)
    await addHabit(
      userId,
      'Archived',
      `${startDay}T00:00:00.000Z`,
      `${startDay}T00:00:00.000Z`
    );

    // Day -3: 1 of 3 completed (partial active day)
    await addCompletion(userId, h1, `${utcDateDaysAgo(3)}T12:00:00.000Z`);
    // Day -2: 2 of 2 completed (perfect day 1)
    await addCompletion(userId, h1, `${utcDateDaysAgo(2)}T12:00:00.000Z`);
    await addCompletion(userId, h2, `${utcDateDaysAgo(2)}T12:00:00.000Z`);
    // Day -1: 2 of 2 completed (perfect day 2)
    await addCompletion(userId, h1, `${utcDateDaysAgo(1)}T12:00:00.000Z`);
    await addCompletion(userId, h2, `${utcDateDaysAgo(1)}T12:00:00.000Z`);
    // Today (day 0): 0 of 2 yet (does not break current streak of 2)

    const summary = await getUserProgressSummary(db, userId, 'UTC');

    // Scheduled slots: day -3 (3), day -2 (2), day -1 (2), day 0 (2) = 9 total; 5 completed -> 56%
    expect(summary).toEqual({
      currentStreak: 2,
      longestStreak: 2,
      totalCompletions: 5,
      activeDays: 3,
      perfectDays: 2,
      overallCompletionRate: Math.round((5 / 9) * 100),
      activeHabitsCount: 2,
      memberSince: startDay,
    });
  });

  it('includes history older than 365 days in lifetime totals and longest streak', async () => {
    const userId = 'user_summary_long_history';
    const d1 = utcDateDaysAgo(400);
    const d2 = utcDateDaysAgo(399);
    const d3 = utcDateDaysAgo(398);
    await addUser(userId, `${d1} 08:00:00`);

    // A habit that ran for 3 days more than a year ago and was then archived
    const oldHabit = await addHabit(
      userId,
      'Old Sprint',
      `${d1}T00:00:00.000Z`,
      `${d3}T00:00:00.000Z`
    );
    await addCompletion(userId, oldHabit, `${d1}T12:00:00.000Z`);
    await addCompletion(userId, oldHabit, `${d2}T12:00:00.000Z`);
    await addCompletion(userId, oldHabit, `${d3}T12:00:00.000Z`);

    const summary = await getUserProgressSummary(db, userId, 'UTC');

    expect(summary).toEqual({
      currentStreak: 3,
      longestStreak: 3,
      totalCompletions: 3,
      activeDays: 3,
      perfectDays: 3,
      overallCompletionRate: 100,
      activeHabitsCount: 0,
      memberSince: d1,
    });
  });

  it("attributes completions to the user's local calendar day", async () => {
    const userId = 'user_summary_tz';
    const localDay = utcDateDaysAgo(4);
    const utcDay = utcDateDaysAgo(3);
    await addUser(userId, `${localDay} 08:00:00`);

    const habitId = await addHabit(
      userId,
      'Stretch',
      `${localDay}T00:00:00.000Z`,
      `${localDay}T00:00:00.000Z`
    );
    // 02:00 UTC on utcDay is evening of localDay in Los Angeles
    await addCompletion(userId, habitId, `${utcDay}T02:00:00.000Z`);

    const summary = await getUserProgressSummary(
      db,
      userId,
      'America/Los_Angeles'
    );

    expect(summary.perfectDays).toBe(1);
    expect(summary.activeDays).toBe(1);
    expect(summary.overallCompletionRate).toBe(100);
    expect(summary.memberSince).toBe(localDay);
  });
});
