// Runs the achievement service against a real local D1 database.
// Covers which streak the streak achievements count, the user's time zone, and hiding unmeasurable achievements.

import { beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
import { AchievementService } from '../achievement.service.js';
import { UNMEASURABLE } from '../achievementMetrics.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const EVERY_DAY = 'Mon,Tue,Wed,Thu,Fri,Sat,Sun';

const utcDateDaysAgo = (days: number) =>
  new Date(Date.now() - days * DAY_MS).toISOString().slice(0, 10);

describe('AchievementService', () => {
  let db: D1Database;
  let service: AchievementService;

  beforeAll(() => {
    db = env.DB;
    service = new AchievementService(db);
  });

  async function addUser(userId: string) {
    await db
      .prepare('INSERT INTO users (clerk_user_id) VALUES (?)')
      .bind(userId)
      .run();
  }

  async function addHabit(
    userId: string,
    name: string,
    longestStreak = 0
  ): Promise<number> {
    const habit = await db
      .prepare(
        `INSERT INTO habits (user_id, name, frequency, start_date, longest_streak)
         VALUES (?, ?, ?, ?, ?) RETURNING id`
      )
      .bind(
        userId,
        name,
        EVERY_DAY,
        `${utcDateDaysAgo(10)}T00:00:00.000Z`,
        longestStreak
      )
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

  async function earn(userId: string, key: string) {
    await db
      .prepare(
        `INSERT INTO user_achievements (user_id, achievement_id)
         SELECT ?, id FROM achievements WHERE key = ?`
      )
      .bind(userId, key)
      .run();
  }

  it('counts streaks of days on which every habit was done, not the best single habit', async () => {
    const userId = 'user_ach_streak_definition';
    await addUser(userId);
    // One habit once ran for 8 days on its own.
    const read = await addHabit(userId, 'Read', 8);
    const run = await addHabit(userId, 'Run');

    // Read on days -4 to -1; Run only on days -4 to -2. Every habit was done
    // on three days in a row.
    for (const day of [4, 3, 2, 1]) {
      await addCompletion(userId, read, `${utcDateDaysAgo(day)}T12:00:00.000Z`);
    }
    for (const day of [4, 3, 2]) {
      await addCompletion(userId, run, `${utcDateDaysAgo(day)}T12:00:00.000Z`);
    }

    const achievements = await service.getAllAchievementsForUser(userId, 'UTC');
    const weekStreak = achievements.find((a) => a.key === 'streak_7');

    expect(weekStreak?.progress?.currentValue).toBe(3);
  });

  it("counts streak days in the user's time zone", async () => {
    const userId = 'user_ach_streak_time_zone';
    await addUser(userId);
    const read = await addHabit(userId, 'Read');
    const run = await addHabit(userId, 'Run');

    // In Los Angeles both habits are done on each of three days: Read at
    // 20:00 UTC (midday there) and Run at 03:00 UTC the next UTC day (evening
    // there). In UTC each pair lands on two days, so only two days in the
    // middle have both.
    for (const day of [4, 3, 2]) {
      await addCompletion(userId, read, `${utcDateDaysAgo(day)}T20:00:00.000Z`);
      await addCompletion(
        userId,
        run,
        `${utcDateDaysAgo(day - 1)}T03:00:00.000Z`
      );
    }

    const inLosAngeles = await service.getAllAchievementsForUser(
      userId,
      'America/Los_Angeles'
    );
    const inUtc = await service.getAllAchievementsForUser(userId, 'UTC');

    expect(
      inLosAngeles.find((a) => a.key === 'streak_7')?.progress?.currentValue
    ).toBe(3);
    expect(
      inUtc.find((a) => a.key === 'streak_7')?.progress?.currentValue
    ).toBe(2);

    const awarded = await service.checkAndAwardAchievements(
      userId,
      'America/Los_Angeles'
    );
    expect(awarded.map((a) => a.key)).toContain('streak_3');
  });

  it('leaves out achievements it cannot measure, unless already earned', async () => {
    const userId = 'user_ach_unmeasurable';
    await addUser(userId);
    await earn(userId, 'early_bird');

    const achievements = await service.getAllAchievementsForUser(userId, 'UTC');
    const keys = achievements.map((a) => a.key);
    const hidden = Object.keys(UNMEASURABLE).filter(
      (key) => key !== 'early_bird'
    );

    expect(keys).toContain('early_bird');
    expect(keys).toContain('streak_7');
    for (const key of hidden) {
      expect(keys, key).not.toContain(key);
    }
  });

  it('names the track of each achievement that is one of a series', async () => {
    const userId = 'user_ach_tracks';
    await addUser(userId);

    const achievements = await service.getAllAchievementsForUser(userId, 'UTC');
    const byKey = new Map(achievements.map((a) => [a.key, a]));

    expect(byKey.get('completions_50')?.track).toBe('check_ins');
    expect(byKey.get('streak_14')?.track).toBe('streak');
    expect(byKey.get('social_butterfly')).toBeDefined();
    expect(byKey.get('social_butterfly')).not.toHaveProperty('track');
  });
});
