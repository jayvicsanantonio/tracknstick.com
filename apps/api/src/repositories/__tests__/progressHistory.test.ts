// Runs the progress history query against a real local D1 database.
// Covers which day a completion counts toward, which depends on the user's timezone.
// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { createMigratedDatabase } from '../../tests/realD1.js';
import { getUserProgressHistory } from '../tracker.repository.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const EVERY_DAY = 'Mon,Tue,Wed,Thu,Fri,Sat,Sun';

/** The UTC calendar date (YYYY-MM-DD) that many days before now. */
const utcDateDaysAgo = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);

describe('getUserProgressHistory', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;

  beforeAll(async () => {
    ({ db, dispose } = await createMigratedDatabase());
  });

  afterAll(async () => {
    await dispose();
  });

  async function addUserWithDailyHabit(userId: string): Promise<number> {
    await db
      .prepare('INSERT INTO users (clerk_user_id) VALUES (?)')
      .bind(userId)
      .run();
    const habit = await db
      .prepare(
        `INSERT INTO habits (user_id, name, frequency, start_date)
         VALUES (?, ?, ?, ?) RETURNING id`
      )
      .bind(userId, 'Read', EVERY_DAY, `${utcDateDaysAgo(10)}T00:00:00.000Z`)
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

  it('reports a day as complete when its only scheduled habit was completed', async () => {
    const habitId = await addUserWithDailyHabit('user_utc');
    const completedDay = utcDateDaysAgo(3);
    await addCompletion('user_utc', habitId, `${completedDay}T12:00:00.000Z`);

    const history = await getUserProgressHistory(
      db,
      'user_utc',
      undefined,
      undefined,
      'UTC'
    );
    const rateOn = (date: string) =>
      history.find((entry) => entry.date === date)?.completionRate;

    expect(rateOn(completedDay)).toBe(100);
    expect(rateOn(utcDateDaysAgo(4))).toBe(0);
  });

  it("counts a completion toward the day it happened in the user's timezone", async () => {
    const habitId = await addUserWithDailyHabit('user_la');
    // 02:00 UTC is the evening of the previous day in Los Angeles.
    const utcDay = utcDateDaysAgo(3);
    const localDay = utcDateDaysAgo(4);
    await addCompletion('user_la', habitId, `${utcDay}T02:00:00.000Z`);

    const history = await getUserProgressHistory(
      db,
      'user_la',
      undefined,
      undefined,
      'America/Los_Angeles'
    );
    const rateOn = (date: string) =>
      history.find((entry) => entry.date === date)?.completionRate;

    expect(rateOn(localDay)).toBe(100);
    expect(rateOn(utcDay)).toBe(0);
  });
});
