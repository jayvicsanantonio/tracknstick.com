// Calls the habit routes through Hono against a real local D1 database.
// Each test signs in as its own user, so rows from other tests in the file do not show.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createTestEnv,
  mockAuthentication,
  resetMocks,
  takeConsole,
} from '../setup.js';
import { habitRoutes } from '../../routes/habits.js';
import { errorHandler } from '../../middlewares/errorHandler.js';

describe('Habits API Integration', () => {
  let app: any;
  let env: any;

  const habitData = {
    name: 'New Habit',
    icon: '🏃',
    frequency: ['Mon', 'Wed', 'Fri'],
    startDate: '2023-01-01T00:00:00Z',
  };

  beforeEach(() => {
    resetMocks();

    const testEnv = createTestEnv();
    app = testEnv.app;
    env = testEnv.env;

    // Add habit routes
    app.route('/habits', habitRoutes);

    // Global error handler
    app.onError(errorHandler);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function send(method: string, path: string, body?: unknown) {
    const headers: Record<string, string> = {
      Authorization: 'Bearer test-token',
    };
    if (body !== undefined) headers['Content-Type'] = 'application/json';

    return app.fetch(
      new Request(`http://localhost${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      }),
      env
    );
  }

  describe('GET /habits', () => {
    it('should return a list of habits', async () => {
      mockAuthentication('user_list');
      await send('POST', '/habits', { ...habitData, name: 'Test Habit' });

      const res = await send('GET', '/habits');

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(Array.isArray(data)).toBe(true);
      expect(data).toHaveLength(1);
      expect(data[0]).toHaveProperty('name', 'Test Habit');
    });
  });

  describe('POST /habits', () => {
    it('should create a new habit', async () => {
      mockAuthentication('user_create');

      const res = await send('POST', '/habits', habitData);

      // Check response
      expect(res.status).toBe(201);

      const data = await res.json();
      expect(data).toHaveProperty('message', 'Habit created successfully');
      expect(data.habitId).toMatch(/^\d+$/);

      const row = await env.DB.prepare(
        'SELECT user_id, name, frequency FROM habits WHERE id = ?'
      )
        .bind(Number(data.habitId))
        .first();
      expect(row).toEqual({
        user_id: 'user_create',
        name: 'New Habit',
        frequency: 'Mon,Wed,Fri',
      });
    });

    it('should validate the request body', async () => {
      mockAuthentication('user_invalid');

      // Invalid data: the required name is missing
      const res = await send('POST', '/habits', { icon: '🏃' });

      // Check response
      expect(res.status).toBe(400);

      const data = await res.json();
      expect(data).toHaveProperty('error');
      expect(data.error).toHaveProperty('code', 'validation_error');

      expect(takeConsole('warn')).toEqual([
        expect.stringContaining('Client error occurred'),
      ]);
    });
  });

  describe('DELETE /habits/:habitId', () => {
    it('should delete a habit', async () => {
      mockAuthentication('user_delete');
      const created = await send('POST', '/habits', {
        ...habitData,
        name: 'Delete Me',
      });
      const { habitId } = await created.json();

      const res = await send('DELETE', `/habits/${habitId}`);

      // Check response
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('message', 'Habit deleted successfully');

      const remaining = await send('GET', '/habits');
      expect(await remaining.json()).toEqual([]);
    });
  });

  describe('POST /habits/:habitId/trackers', () => {
    const timestamp = '2026-11-23T16:00:00.000Z';

    async function createHabit(userId: string) {
      mockAuthentication(userId);
      const created = await send('POST', '/habits', habitData);
      const { habitId } = await created.json();
      return habitId as string;
    }

    async function completionsOf(habitId: string) {
      const row = await env.DB.prepare(
        'SELECT COUNT(*) AS count FROM trackers WHERE habit_id = ?'
      )
        .bind(Number(habitId))
        .first();
      return row.count;
    }

    it('toggles the day when the body says nothing of the outcome', async () => {
      const habitId = await createHabit('user_toggle');
      const body = { timestamp, timeZone: 'UTC' };

      const added = await send('POST', `/habits/${habitId}/trackers`, body);
      expect(added.status).toBe(201);
      expect(await completionsOf(habitId)).toBe(1);

      const removed = await send('POST', `/habits/${habitId}/trackers`, body);
      expect(removed.status).toBe(200);
      expect(await completionsOf(habitId)).toBe(0);
    });

    it('completes the day once however often it is asked to', async () => {
      const habitId = await createHabit('user_complete_twice');
      const body = { timestamp, timeZone: 'UTC', completed: true };

      const first = await send('POST', `/habits/${habitId}/trackers`, body);
      expect(first.status).toBe(201);
      expect((await first.json()).trackerId).toEqual(expect.any(String));

      const second = await send('POST', `/habits/${habitId}/trackers`, body);
      expect(second.status).toBe(200);
      expect(await second.json()).not.toHaveProperty('trackerId');
      expect(await completionsOf(habitId)).toBe(1);
    });

    it('leaves a day not completed when asked to mark it not completed', async () => {
      const habitId = await createHabit('user_incomplete');

      const res = await send('POST', `/habits/${habitId}/trackers`, {
        timestamp,
        timeZone: 'UTC',
        completed: false,
      });

      expect(res.status).toBe(200);
      expect(await completionsOf(habitId)).toBe(0);
    });

    it('removes the completion when asked to mark a completed day not completed', async () => {
      const habitId = await createHabit('user_uncomplete');
      await send('POST', `/habits/${habitId}/trackers`, {
        timestamp,
        timeZone: 'UTC',
        completed: true,
      });

      const res = await send('POST', `/habits/${habitId}/trackers`, {
        timestamp,
        timeZone: 'UTC',
        completed: false,
      });

      expect(res.status).toBe(200);
      expect(await completionsOf(habitId)).toBe(0);
    });
  });
});
