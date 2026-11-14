// Calls every endpoint of the real app, on a real local D1 database,
// and checks each response body against its schema in the contracts package.
// @vitest-environment node

import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import type { ZodType } from 'zod';
import {
  achievementListResponseSchema,
  achievementStatsResponseSchema,
  checkAchievementsResponseSchema,
  createHabitResponseSchema,
  deleteHabitResponseSchema,
  earnedAchievementsResponseSchema,
  errorResponseSchema,
  habitListResponseSchema,
  habitStatsResponseSchema,
  initializeAchievementsResponseSchema,
  progressHistoryResponseSchema,
  progressOverviewResponseSchema,
  progressStreaksResponseSchema,
  restoreHabitResponseSchema,
  toggleTrackerResponseSchema,
  trackersResponseSchema,
  updateHabitResponseSchema,
} from '@tracknstick/contracts';
import app from '../index.js';
import { createMigratedDatabase } from './realD1.js';
import { mockAuthentication } from './setup.js';

const DAY_MS = 24 * 60 * 60 * 1000;
const EVERY_DAY = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * The body must satisfy the schema, and must not carry anything the schema
 * does not describe: zod drops unknown keys while parsing, so an undeclared
 * field makes the parsed value differ from the body.
 */
function expectToMatchContract(schema: ZodType, body: unknown) {
  expect(schema.parse(body)).toEqual(body);
}

describe('API responses match the contracts package', () => {
  let db: D1Database;
  let dispose: () => Promise<void>;

  let env: any;

  const now = new Date();
  const yesterday = new Date(now.getTime() - DAY_MS).toISOString().slice(0, 10);
  const tomorrow = new Date(now.getTime() + DAY_MS).toISOString().slice(0, 10);
  const monthAgo = new Date(now.getTime() - 30 * DAY_MS).toISOString();
  const nextMonth = new Date(now.getTime() + 30 * DAY_MS).toISOString();

  let habitId: string;
  let plainHabitId: string;

  beforeAll(async () => {
    ({ db, dispose } = await createMigratedDatabase());
    env = {
      DB: db,
      ENVIRONMENT: 'test',
      CLERK_SECRET_KEY: 'test-clerk-key',
      CLERK_PUBLISHABLE_KEY: 'test-clerk-publishable-key',
    };
    mockAuthentication('user_contract');
  });

  afterAll(async () => {
    await dispose();
  });

  async function call(
    method: string,
    path: string,
    body?: unknown,
    { signedIn = true } = {}
  ) {
    const headers: Record<string, string> = {};
    if (signedIn) headers.Authorization = 'Bearer test-token';
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    const res = await app.request(
      path,
      {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      },
      env
    );

    // The body is checked against a schema by each test, so it is left untyped.

    const responseBody: any = await res.json();
    return { status: res.status, body: responseBody };
  }

  describe('errors', () => {
    it('a request without a token', async () => {
      const res = await call('GET', '/api/v1/habits', undefined, {
        signedIn: false,
      });

      expect(res.status).toBe(401);
      expectToMatchContract(errorResponseSchema, res.body);
    });

    it('a request that fails validation', async () => {
      const res = await call('POST', '/api/v1/habits', { name: '' });

      expect(res.status).toBe(400);
      expectToMatchContract(errorResponseSchema, res.body);
    });

    it('a route that does not exist', async () => {
      const res = await call('GET', '/api/v1/nothing-here');

      expect(res.status).toBe(404);
      expectToMatchContract(errorResponseSchema, res.body);
    });
  });

  describe('habits', () => {
    it('POST /habits', async () => {
      const res = await call('POST', '/api/v1/habits', {
        name: 'Read',
        icon: 'BookOpen',
        frequency: EVERY_DAY,
        startDate: monthAgo,
        endDate: nextMonth,
      });

      expect(res.status).toBe(201);
      expectToMatchContract(createHabitResponseSchema, res.body);
      habitId = res.body.habitId;
    });

    it('GET /habits, including a habit with no icon and no end date', async () => {
      const created = await call('POST', '/api/v1/habits', {
        name: 'Walk',
        frequency: EVERY_DAY,
        startDate: monthAgo,
      });
      plainHabitId = created.body.habitId;

      const res = await call('GET', '/api/v1/habits');

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expectToMatchContract(habitListResponseSchema, res.body);
    });

    it('GET /habits for one date', async () => {
      const res = await call(
        'GET',
        `/api/v1/habits?date=${encodeURIComponent(now.toISOString())}&timeZone=UTC`
      );

      expect(res.status).toBe(200);
      expect(res.body).toHaveLength(2);
      expectToMatchContract(habitListResponseSchema, res.body);
    });

    it('GET /habits/:id/stats for a habit never completed', async () => {
      const res = await call('GET', `/api/v1/habits/${plainHabitId}/stats`);

      expect(res.status).toBe(200);
      expectToMatchContract(habitStatsResponseSchema, res.body);
      expect(res.body).not.toHaveProperty('lastCompleted');
    });

    it('POST /habits/:id/trackers when it adds a completion', async () => {
      const res = await call('POST', `/api/v1/habits/${habitId}/trackers`, {
        timestamp: now.toISOString(),
        timeZone: 'UTC',
        notes: 'chapter one',
      });

      expect(res.status).toBe(201);
      expectToMatchContract(toggleTrackerResponseSchema, res.body);
      expect(res.body.trackerId).toEqual(expect.any(String));
    });

    it('GET /habits/:id/trackers', async () => {
      const res = await call(
        'GET',
        `/api/v1/habits/${habitId}/trackers?startDate=${yesterday}&endDate=${tomorrow}`
      );

      expect(res.status).toBe(200);
      expect(res.body.trackers).toHaveLength(1);
      expectToMatchContract(trackersResponseSchema, res.body);
    });

    it('GET /habits/:id/stats for a completed habit', async () => {
      const res = await call('GET', `/api/v1/habits/${habitId}/stats`);

      expect(res.status).toBe(200);
      expectToMatchContract(habitStatsResponseSchema, res.body);
      expect(res.body.lastCompleted).toEqual(expect.any(String));
    });

    it('PUT /habits/:id', async () => {
      const res = await call('PUT', `/api/v1/habits/${plainHabitId}`, {
        name: 'Walk outside',
        frequency: ['Mon', 'Wed', 'Fri'],
        startDate: monthAgo,
      });

      expect(res.status).toBe(200);
      expectToMatchContract(updateHabitResponseSchema, res.body);
    });

    it('DELETE /habits/:id, then POST /habits/:id/restore', async () => {
      const deleted = await call('DELETE', `/api/v1/habits/${plainHabitId}`);
      expect(deleted.status).toBe(200);
      expectToMatchContract(deleteHabitResponseSchema, deleted.body);

      const restored = await call(
        'POST',
        `/api/v1/habits/${plainHabitId}/restore`
      );
      expect(restored.status).toBe(200);
      expectToMatchContract(restoreHabitResponseSchema, restored.body);
    });
  });

  describe('progress', () => {
    it('GET /progress/history', async () => {
      const res = await call('GET', '/api/v1/progress/history?timeZone=UTC');

      expect(res.status).toBe(200);
      expect(res.body.history.length).toBeGreaterThan(0);
      expectToMatchContract(progressHistoryResponseSchema, res.body);
    });

    it('GET /progress/streaks', async () => {
      const res = await call('GET', '/api/v1/progress/streaks?timeZone=UTC');

      expect(res.status).toBe(200);
      expectToMatchContract(progressStreaksResponseSchema, res.body);
    });

    it('GET /progress/overview', async () => {
      const res = await call('GET', '/api/v1/progress/overview?timeZone=UTC');

      expect(res.status).toBe(200);
      expectToMatchContract(progressOverviewResponseSchema, res.body);
    });
  });

  describe('achievements', () => {
    it('POST /achievements/initialize', async () => {
      const res = await call('POST', '/api/v1/achievements/initialize');

      expect(res.status).toBe(200);
      expectToMatchContract(initializeAchievementsResponseSchema, res.body);
    });

    it('GET /achievements before any is earned', async () => {
      const res = await call('GET', '/api/v1/achievements');

      expect(res.status).toBe(200);
      expect(res.body.achievements.length).toBeGreaterThan(0);
      expectToMatchContract(achievementListResponseSchema, res.body);
    });

    it('POST /achievements/check when it awards something', async () => {
      const res = await call('POST', '/api/v1/achievements/check');

      expect(res.status).toBe(200);
      expect(res.body.count).toBeGreaterThan(0);
      expectToMatchContract(checkAchievementsResponseSchema, res.body);
    });

    it('GET /achievements once some are earned', async () => {
      const res = await call('GET', '/api/v1/achievements');

      expect(res.status).toBe(200);
      expectToMatchContract(achievementListResponseSchema, res.body);
    });

    it('GET /achievements/earned', async () => {
      const res = await call('GET', '/api/v1/achievements/earned');

      expect(res.status).toBe(200);
      expect(res.body.achievements.length).toBeGreaterThan(0);
      expectToMatchContract(earnedAchievementsResponseSchema, res.body);
    });

    it('GET /achievements/stats', async () => {
      const res = await call('GET', '/api/v1/achievements/stats');

      expect(res.status).toBe(200);
      expect(res.body.recentAchievements.length).toBeGreaterThan(0);
      expectToMatchContract(achievementStatsResponseSchema, res.body);
    });
  });
});
