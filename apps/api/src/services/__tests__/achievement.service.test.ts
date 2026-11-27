// Runs the achievement service against a real local D1 database.
// Covers what the achievements count, in the user's time zone, and hiding unmeasurable achievements.

import { beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
import { AchievementService } from '../achievement.service.js';
import { UNMEASURABLE } from '../achievementMetrics.js';
import { getUserProgressSummary } from '../../repositories/tracker.repository.js';

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
    await earn(userId, 'habit_legend');

    const achievements = await service.getAllAchievementsForUser(userId, 'UTC');
    const keys = achievements.map((a) => a.key);
    const hidden = Object.keys(UNMEASURABLE).filter(
      (key) => key !== 'habit_legend'
    );

    expect(keys).toContain('habit_legend');
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

  it("counts active days, perfect days and the most habits in one day in the user's time zone", async () => {
    const userId = 'user_ach_days_time_zone';
    await addUser(userId);
    const read = await addHabit(userId, 'Read');
    const run = await addHabit(userId, 'Run');

    // In Los Angeles both habits are done on each of three days. In UTC each
    // pair lands on two days: four active days, two of them with both.
    for (const day of [4, 3, 2]) {
      await addCompletion(userId, read, `${utcDateDaysAgo(day)}T20:00:00.000Z`);
      await addCompletion(
        userId,
        run,
        `${utcDateDaysAgo(day - 1)}T03:00:00.000Z`
      );
    }

    const value = (
      achievements: { key: string; progress?: { currentValue: number } }[],
      key: string
    ) => achievements.find((a) => a.key === key)?.progress?.currentValue;
    const inLosAngeles = await service.getAllAchievementsForUser(
      userId,
      'America/Los_Angeles'
    );
    const inUtc = await service.getAllAchievementsForUser(userId, 'UTC');

    expect(value(inLosAngeles, 'active_30_days')).toBe(3);
    expect(value(inUtc, 'active_30_days')).toBe(4);
    expect(value(inLosAngeles, 'perfect_month')).toBe(3);
    expect(value(inUtc, 'perfect_month')).toBe(2);
  });

  it("counts the most habits done in one day in the user's time zone", async () => {
    const userId = 'user_ach_one_day_time_zone';
    await addUser(userId);
    const read = await addHabit(userId, 'Read');
    const run = await addHabit(userId, 'Run');
    // One Los Angeles day: midday and evening, which are two days in UTC.
    await addCompletion(userId, read, `${utcDateDaysAgo(2)}T20:00:00.000Z`);
    await addCompletion(userId, run, `${utcDateDaysAgo(1)}T03:00:00.000Z`);

    const maximalist = async (timeZone: string) =>
      (await service.getAllAchievementsForUser(userId, timeZone)).find(
        (a) => a.key === 'maximalist'
      )?.progress?.currentValue;

    expect(await maximalist('America/Los_Angeles')).toBe(2);
    expect(await maximalist('UTC')).toBe(1);
  });

  it('measures the same days and streaks as the progress summary', async () => {
    const userId = 'user_ach_matches_summary';
    await addUser(userId);
    const read = await addHabit(userId, 'Read');
    const run = await addHabit(userId, 'Run');
    for (const day of [6, 5, 4, 2, 1]) {
      await addCompletion(userId, read, `${utcDateDaysAgo(day)}T15:00:00.000Z`);
    }
    for (const day of [6, 5, 1]) {
      // Evening in Tokyo, while Read at 15:00 UTC is past midnight there.
      await addCompletion(userId, run, `${utcDateDaysAgo(day)}T10:00:00.000Z`);
    }
    const timeZone = 'Asia/Tokyo';

    const [achievements, summary] = await Promise.all([
      service.getAllAchievementsForUser(userId, timeZone),
      getUserProgressSummary(db, userId, timeZone),
    ]);
    const value = (key: string) =>
      achievements.find((a) => a.key === key)?.progress?.currentValue;

    expect(value('active_30_days')).toBe(summary.activeDays);
    expect(value('perfect_month')).toBe(summary.perfectDays);
    expect(value('streak_7')).toBe(summary.longestStreak);
    expect(value('completions_50')).toBe(summary.totalCompletions);
  });

  describe('one-off achievements', () => {
    // Tokyo keeps no daylight saving time, so each hour below is exact.
    const TOKYO = 'Asia/Tokyo';

    /** A check-in for the day of `timestamp`, tapped at `createdAt`. */
    async function addCheckIn(
      userId: string,
      habitId: number,
      timestamp: string,
      createdAt = timestamp
    ) {
      await db
        .prepare(
          `INSERT INTO trackers (habit_id, user_id, timestamp, created_at)
           VALUES (?, ?, ?, ?)`
        )
        .bind(
          habitId,
          userId,
          timestamp,
          createdAt.replace('T', ' ').slice(0, 19)
        )
        .run();
    }

    async function valueOf(userId: string, key: string, timeZone = TOKYO) {
      const achievements = await service.getAllAchievementsForUser(
        userId,
        timeZone
      );
      return achievements.find((a) => a.key === key)?.progress?.currentValue;
    }

    it('counts days with a check-in tapped before 8 AM on that same day', async () => {
      const userId = 'user_ach_early_bird';
      await addUser(userId);
      const read = await addHabit(userId, 'Read');
      // 21:30 UTC is 06:30 the next morning in Tokyo.
      for (const day of [5, 4, 3]) {
        await addCheckIn(userId, read, `${utcDateDaysAgo(day)}T21:30:00.000Z`);
      }
      // Tapped early, but for a day a week before: not an early check-in.
      await addCheckIn(
        userId,
        read,
        `${utcDateDaysAgo(9)}T03:00:00.000Z`,
        `${utcDateDaysAgo(2)}T21:30:00.000Z`
      );
      // Noon in Tokyo.
      await addCheckIn(userId, read, `${utcDateDaysAgo(1)}T03:00:00.000Z`);

      expect(await valueOf(userId, 'early_bird')).toBe(3);
      // In UTC only the noon check-in, at 03:00 there, is early.
      expect(await valueOf(userId, 'early_bird', 'UTC')).toBe(1);
    });

    it('reads the tap time the app sent over the time the check-in arrived', async () => {
      const userId = 'user_ach_tapped_at';
      await addUser(userId);
      const read = await addHabit(userId, 'Read');
      // Tapped at 06:30 in Tokyo while offline, sent at 22:30 that night.
      const timestamp = `${utcDateDaysAgo(3)}T21:30:00.000Z`;
      await addCheckIn(
        userId,
        read,
        timestamp,
        `${utcDateDaysAgo(2)}T13:30:00.000Z`
      );
      await db
        .prepare('UPDATE trackers SET tapped_at = ? WHERE habit_id = ?')
        .bind(timestamp, read)
        .run();

      expect(await valueOf(userId, 'early_bird')).toBe(1);
      expect(await valueOf(userId, 'night_owl')).toBe(0);
    });

    it('counts days with a check-in tapped after 10 PM on that same day', async () => {
      const userId = 'user_ach_night_owl';
      await addUser(userId);
      const read = await addHabit(userId, 'Read');
      // 13:30 UTC is 22:30 in Tokyo.
      for (const day of [4, 2]) {
        await addCheckIn(userId, read, `${utcDateDaysAgo(day)}T13:30:00.000Z`);
      }
      // 12:59 UTC is 21:59 in Tokyo.
      await addCheckIn(userId, read, `${utcDateDaysAgo(3)}T12:59:00.000Z`);

      expect(await valueOf(userId, 'night_owl')).toBe(2);
    });

    it('counts the weekend days with a check-in', async () => {
      const userId = 'user_ach_weekend_warrior';
      await addUser(userId);
      const read = await addHabit(userId, 'Read');
      // Saturday 7, Sunday 8 and Tuesday 10 November 2026, at noon in Tokyo.
      for (const date of ['2026-11-07', '2026-11-08', '2026-11-10']) {
        await addCheckIn(userId, read, `${date}T03:00:00.000Z`);
      }

      expect(await valueOf(userId, 'weekend_warrior')).toBe(2);
    });

    it('counts the times a habit was checked off again after 7 days or more without it', async () => {
      const userId = 'user_ach_comeback_kid';
      await addUser(userId);
      const read = await addHabit(userId, 'Read');
      const run = await addHabit(userId, 'Run');
      // Read: a break of 9 days, from the 2nd to the 12th.
      for (const date of ['2026-11-01', '2026-11-02', '2026-11-12']) {
        await addCheckIn(userId, read, `${date}T03:00:00.000Z`);
      }
      // Run: a break of 6 days, from the 2nd to the 9th, is too short.
      for (const date of ['2026-11-02', '2026-11-09']) {
        await addCheckIn(userId, run, `${date}T03:00:00.000Z`);
      }

      expect(await valueOf(userId, 'comeback_kid')).toBe(1);
    });

    it('counts the returns after 30 days or more with no check-in at all', async () => {
      const userId = 'user_ach_phoenix';
      await addUser(userId);
      const read = await addHabit(userId, 'Read');
      // 33 days away, from 1 September to 5 October; then 29 days away, to
      // 4 November, which is too short.
      for (const date of ['2026-09-01', '2026-10-05', '2026-11-04']) {
        await addCheckIn(userId, read, `${date}T03:00:00.000Z`);
      }

      expect(await valueOf(userId, 'phoenix')).toBe(1);
    });
  });
});
