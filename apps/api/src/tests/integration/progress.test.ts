import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  createTestEnv,
  mockAuthentication,
  resetMocks,
  takeConsole,
  takeUnauthenticatedRequestLogs,
} from '../setup.js';
import progressRoutes from '../../routes/progress.js';
import { errorHandler } from '../../middlewares/errorHandler.js';

describe('Progress API Integration Tests', () => {
  let app: any;
  let authHeader: { headers: { Authorization: string } };
  let testEnv: any;
  let userId: string;

  // Set up test environment
  beforeEach(() => {
    resetMocks();
    mockAuthentication(); // Mock authentication without a specific user initially

    testEnv = createTestEnv();
    app = testEnv.app;
    userId = 'test-user-123'; // Keep this line from original
    authHeader = { headers: { Authorization: 'Bearer test-token' } }; // Keep this line from original

    // Re-mock authentication with specific user after env is set up, if needed for the test
    // The original mockAuthentication(userId) was here, but the new snippet implies it's done earlier.
    // Let's assume the initial mockAuthentication() is sufficient for the setup,
    // and specific user mocking happens later if needed, or the global mockAuthentication needs to be updated.
    // For now, I'll keep the original mockAuthentication(userId) as it seems more specific.
    mockAuthentication(userId);

    // Add progress routes
    app.route('/api/v1/progress', progressRoutes);

    // Global error handler
    app.onError(errorHandler);
  });

  // Clean up after tests
  afterEach(() => {
    resetMocks();
    vi.restoreAllMocks();
  });

  describe('GET /api/v1/progress/history', () => {
    it('should return progress history data', async () => {
      const response = await app.request(
        '/api/v1/progress/history',
        {
          ...authHeader,
        },
        testEnv.env
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        history: { date: string; completionRate: number }[];
      };
      expect(data).toHaveProperty('history');
      expect(Array.isArray(data.history)).toBe(true);

      // If any entries are returned, verify their structure
      if (data.history.length > 0) {
        expect(data.history[0]).toHaveProperty('date');
        expect(data.history[0]).toHaveProperty('completionRate');
        expect(typeof data.history[0].completionRate).toBe('number');
      }
    });

    it('should filter history by date range', async () => {
      // Get data for a specific date range
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '2023-01-31T23:59:59Z';

      const response = await app.request(
        `/api/v1/progress/history?startDate=${startDate}&endDate=${endDate}`,
        {
          ...authHeader,
        },
        testEnv.env
      );

      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toHaveProperty('history');
    });

    it('should validate date format', async () => {
      const response = await app.request(
        '/api/v1/progress/history?startDate=invalid-date',
        {
          ...authHeader,
        },
        testEnv.env
      );

      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data).toHaveProperty('error');

      expect(takeConsole('warn')).toEqual([
        expect.stringContaining('Client error occurred'),
      ]);
    });
  });

  describe('GET /api/v1/progress/streaks', () => {
    it('should return streak information', async () => {
      const response = await app.request(
        '/api/v1/progress/streaks',
        {
          ...authHeader,
        },
        testEnv.env
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        currentStreak: number;
        longestStreak: number;
      };
      expect(data).toHaveProperty('currentStreak');
      expect(data).toHaveProperty('longestStreak');
      expect(typeof data.currentStreak).toBe('number');
      expect(typeof data.longestStreak).toBe('number');
    });
  });

  describe('GET /api/v1/progress/overview', () => {
    it('should return combined history and streak data', async () => {
      const response = await app.request(
        '/api/v1/progress/overview',
        {
          ...authHeader,
        },
        testEnv.env
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        history: { date: string; completionRate: number }[];
        currentStreak: number;
        longestStreak: number;
      };
      expect(data).toHaveProperty('history');
      expect(data).toHaveProperty('currentStreak');
      expect(data).toHaveProperty('longestStreak');

      expect(Array.isArray(data.history)).toBe(true);
      expect(typeof data.currentStreak).toBe('number');
      expect(typeof data.longestStreak).toBe('number');
    });

    it('should filter overview by date range', async () => {
      // Get data for a specific date range
      const startDate = '2023-01-01T00:00:00Z';
      const endDate = '2023-01-31T23:59:59Z';

      const response = await app.request(
        `/api/v1/progress/overview?startDate=${startDate}&endDate=${endDate}`,
        {
          ...authHeader,
        },
        testEnv.env
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        history: { date: string; completionRate: number }[];
        currentStreak: number;
        longestStreak: number;
      };
      expect(data).toHaveProperty('history');
      expect(data).toHaveProperty('currentStreak');
      expect(data).toHaveProperty('longestStreak');
    });
  });

  describe('GET /api/v1/progress/summary', () => {
    it('should return all-time lifetime progress summary', async () => {
      const response = await app.request(
        '/api/v1/progress/summary?timeZone=UTC',
        {
          ...authHeader,
        },
        testEnv.env
      );

      expect(response.status).toBe(200);
      const data = (await response.json()) as {
        currentStreak: number;
        longestStreak: number;
        totalCompletions: number;
        activeDays: number;
        perfectDays: number;
        overallCompletionRate: number | null;
        activeHabitsCount: number;
        memberSince: string | null;
      };
      expect(typeof data.currentStreak).toBe('number');
      expect(typeof data.longestStreak).toBe('number');
      expect(typeof data.totalCompletions).toBe('number');
      expect(typeof data.activeDays).toBe('number');
      expect(typeof data.perfectDays).toBe('number');
      expect(typeof data.activeHabitsCount).toBe('number');
      expect(
        data.overallCompletionRate === null ||
          typeof data.overallCompletionRate === 'number'
      ).toBe(true);
      expect(
        data.memberSince === null || typeof data.memberSince === 'string'
      ).toBe(true);
    });
  });

  describe('Authentication', () => {
    it('should require authentication for all progress endpoints', async () => {
      // Mock unauthenticated state
      mockAuthentication(undefined, false);

      // Test each endpoint without auth header
      const endpoints = [
        '/api/v1/progress/history',
        '/api/v1/progress/streaks',
        '/api/v1/progress/overview',
        '/api/v1/progress/summary',
      ];

      for (const endpoint of endpoints) {
        const response = await app.request(endpoint, undefined, testEnv.env);
        expect(response.status).toBe(401);
      }

      takeUnauthenticatedRequestLogs(endpoints.length);
    });
  });
});
