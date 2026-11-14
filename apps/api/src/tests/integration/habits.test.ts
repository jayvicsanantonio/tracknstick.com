// Calls the habit routes through Hono against a real local D1 database.
// Each test signs in as its own user, so rows from other tests in the file do not show.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTestEnv, mockAuthentication, resetMocks } from '../setup.js';
import { habitRoutes } from '../../routes/habits.js';
import { errorHandlerEnhanced } from '../../middlewares/errorHandlerEnhanced.js';

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
    app.onError(errorHandlerEnhanced);
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
});
