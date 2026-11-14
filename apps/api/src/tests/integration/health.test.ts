// Calls the health routes through Hono against a real local D1 database.
// The failure cases, which need a database that misbehaves, are in healthStatus.test.ts.

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createTestEnv, resetMocks } from '../setup.js';
import { healthRoutes } from '../../routes/health.js';

describe('Health API Integration', () => {
  let app: any;
  let env: any;

  beforeEach(() => {
    const testEnv = createTestEnv();
    app = testEnv.app;
    env = testEnv.env;

    resetMocks();

    // Add health routes
    app.route('/health', healthRoutes);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /health', () => {
    it('should return a 200 OK response', async () => {
      const res = await app.request('/health', {}, env);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('environment', 'test');
    });
  });

  describe('GET /health/db', () => {
    it('should return OK when the database check passes', async () => {
      const res = await app.request('/health/db', {}, env);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('message', 'Database connection successful');
      expect(data).toHaveProperty('responseTime');
    });
  });

  describe('GET /health/details', () => {
    it('should return detailed health information', async () => {
      const res = await app.request('/health/details', {}, env);

      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data).toHaveProperty('status', 'ok');
      expect(data).toHaveProperty('environment', 'test');
      expect(data).toHaveProperty('components.database.status', 'ok');
      expect(data).toHaveProperty('responseTime');
    });
  });
});
