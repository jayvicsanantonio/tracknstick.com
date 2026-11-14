// Runs the tracker repository against a real local D1 database.
// Covers which rows each function reads, writes and deletes.

import { beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import { env } from 'cloudflare:workers';
import * as trackerRepository from '../tracker.repository.js';

const JUNE_START = '2023-06-01T00:00:00Z';
const JUNE_END = '2023-06-30T23:59:59Z';

describe('Tracker Repository', () => {
  let db: D1Database;

  beforeAll(() => {
    db = env.DB;
  });

  async function addUserWithHabit(userId: string): Promise<number> {
    await db
      .prepare('INSERT INTO users (clerk_user_id) VALUES (?)')
      .bind(userId)
      .run();
    const habit = await db
      .prepare(
        `INSERT INTO habits (user_id, name, frequency, start_date)
         VALUES (?, 'Read', 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', '2023-01-01T00:00:00Z')
         RETURNING id`
      )
      .bind(userId)
      .first<{ id: number }>();
    return habit!.id;
  }

  async function addTracker(
    userId: string,
    habitId: number,
    timestamp: string
  ): Promise<number> {
    const tracker = await db
      .prepare(
        `INSERT INTO trackers (habit_id, user_id, timestamp)
         VALUES (?, ?, ?) RETURNING id`
      )
      .bind(habitId, userId, timestamp)
      .first<{ id: number }>();
    return tracker!.id;
  }

  async function trackerIdsOf(habitId: number): Promise<number[]> {
    const { results } = await db
      .prepare('SELECT id FROM trackers WHERE habit_id = ? ORDER BY id')
      .bind(habitId)
      .all<{ id: number }>();
    return results.map((row) => row.id);
  }

  describe('findTrackersByDateRange', () => {
    it('returns an empty array if no habit IDs are given', async () => {
      const result = await trackerRepository.findTrackersByDateRange(
        db,
        'user_none',
        [],
        JUNE_START,
        JUNE_END
      );

      expect(result).toEqual([]);
    });

    it("returns the user's trackers inside the range and nothing else", async () => {
      const habitId = await addUserWithHabit('user_range');
      const inRange = await addTracker(
        'user_range',
        habitId,
        '2023-06-15T10:00:00Z'
      );
      await addTracker('user_range', habitId, '2023-07-01T10:00:00Z');
      const deleted = await addTracker(
        'user_range',
        habitId,
        '2023-06-16T10:00:00Z'
      );
      await db
        .prepare(
          'UPDATE trackers SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?'
        )
        .bind(deleted)
        .run();

      const result = await trackerRepository.findTrackersByDateRange(
        db,
        'user_range',
        [habitId],
        JUNE_START,
        JUNE_END
      );

      expect(result.map((tracker) => tracker.id)).toEqual([inRange]);
    });

    it("does not return another user's trackers for the same habit IDs", async () => {
      const habitId = await addUserWithHabit('user_owner');
      await addTracker('user_owner', habitId, '2023-06-15T10:00:00Z');

      const result = await trackerRepository.findTrackersByDateRange(
        db,
        'user_stranger',
        [habitId],
        JUNE_START,
        JUNE_END
      );

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('inserts the tracker and returns its id', async () => {
      const habitId = await addUserWithHabit('user_create');

      const trackerId = await trackerRepository.create(
        db,
        habitId,
        'user_create',
        '2023-06-15T10:00:00Z',
        'Test notes'
      );

      const row = await db
        .prepare('SELECT habit_id, user_id, notes FROM trackers WHERE id = ?')
        .bind(trackerId)
        .first();
      expect(row).toEqual({
        habit_id: habitId,
        user_id: 'user_create',
        notes: 'Test notes',
      });
    });
  });

  describe('removeTrackersByIds', () => {
    it('reports 0 changes if no tracker IDs are given', async () => {
      const result = await trackerRepository.removeTrackersByIds(
        db,
        [],
        1,
        'user_none'
      );

      expect(result).toEqual({ changes: 0 });
    });

    it('deletes the given trackers and keeps the rest', async () => {
      const habitId = await addUserWithHabit('user_remove');
      const first = await addTracker(
        'user_remove',
        habitId,
        '2023-06-01T10:00:00Z'
      );
      const second = await addTracker(
        'user_remove',
        habitId,
        '2023-06-02T10:00:00Z'
      );
      const kept = await addTracker(
        'user_remove',
        habitId,
        '2023-06-03T10:00:00Z'
      );

      const result = await trackerRepository.removeTrackersByIds(
        db,
        [first, second],
        habitId,
        'user_remove'
      );

      expect(result).toEqual({ changes: 2 });
      expect(await trackerIdsOf(habitId)).toEqual([kept]);
    });

    it("does not delete another user's trackers", async () => {
      const habitId = await addUserWithHabit('user_victim');
      const tracker = await addTracker(
        'user_victim',
        habitId,
        '2023-06-01T10:00:00Z'
      );

      const result = await trackerRepository.removeTrackersByIds(
        db,
        [tracker],
        habitId,
        'user_attacker'
      );

      expect(result).toEqual({ changes: 0 });
      expect(await trackerIdsOf(habitId)).toEqual([tracker]);
    });
  });
});
