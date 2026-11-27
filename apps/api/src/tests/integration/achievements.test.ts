// Calls the achievement routes on a real local D1 database.
// Covers the timeZone query, which sets the days the streak achievements count.

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { env } from 'cloudflare:workers';
import type { AchievementListResponse } from '@tracknstick/contracts';
import { createTestEnv, mockAuthentication, resetMocks } from '../setup.js';
import { achievementRoutes } from '../../routes/achievements.js';

const DAY_MS = 24 * 60 * 60 * 1000;

const utcDateDaysAgo = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);

describe('achievement routes', () => {
  let testEnv: ReturnType<typeof createTestEnv>;
  const userId = 'user_ach_routes_time_zone';
  const auth = { Authorization: 'Bearer test-token' };

  beforeEach(async () => {
    resetMocks();
    testEnv = createTestEnv();
    mockAuthentication(userId);
    testEnv.app.route('/api/v1/achievements', achievementRoutes);

    const db = env.DB;
    await db
      .prepare('INSERT OR IGNORE INTO users (clerk_user_id) VALUES (?)')
      .bind(userId)
      .run();
    const existing = await db
      .prepare('SELECT COUNT(*) AS count FROM habits WHERE user_id = ?')
      .bind(userId)
      .first<{ count: number }>();
    if (existing?.count) return;

    const ids: number[] = [];
    for (const name of ['Read', 'Run']) {
      const habit = await db
        .prepare(
          `INSERT INTO habits (user_id, name, frequency, start_date)
           VALUES (?, ?, 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', ?) RETURNING id`
        )
        .bind(userId, name, `${utcDateDaysAgo(10)}T00:00:00.000Z`)
        .first<{ id: number }>();
      ids.push(habit!.id);
    }
    // Both habits fall on the same three days in Los Angeles, but not in UTC.
    for (const day of [4, 3, 2]) {
      await db
        .prepare(
          'INSERT INTO trackers (habit_id, user_id, timestamp) VALUES (?, ?, ?)'
        )
        .bind(ids[0], userId, `${utcDateDaysAgo(day)}T20:00:00.000Z`)
        .run();
      await db
        .prepare(
          'INSERT INTO trackers (habit_id, user_id, timestamp) VALUES (?, ?, ?)'
        )
        .bind(ids[1], userId, `${utcDateDaysAgo(day - 1)}T03:00:00.000Z`)
        .run();
    }
  });

  afterEach(resetMocks);

  it('GET / counts streak days in the timeZone it is given', async () => {
    const res = await testEnv.app.request(
      '/api/v1/achievements?timeZone=America%2FLos_Angeles',
      { headers: auth },
      testEnv.env
    );

    expect(res.status).toBe(200);
    const body: AchievementListResponse = await res.json();
    const weekStreak = body.achievements.find((a) => a.key === 'streak_7');
    expect(weekStreak?.progress?.currentValue).toBe(3);
  });

  it('POST /check awards streaks counted in the timeZone it is given', async () => {
    const res = await testEnv.app.request(
      '/api/v1/achievements/check?timeZone=America%2FLos_Angeles',
      { method: 'POST', headers: auth },
      testEnv.env
    );

    expect(res.status).toBe(200);
    const body: { newAchievements: { key: string }[] } = await res.json();
    expect(body.newAchievements.map((a) => a.key)).toContain('streak_3');
  });
});
