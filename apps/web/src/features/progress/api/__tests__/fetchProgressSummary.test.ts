import { AxiosError, AxiosHeaders } from 'axios';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import { fetchProgressSummary } from '../index';

describe('fetchProgressSummary', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the lifetime summary directly from /api/v1/progress/summary', async () => {
    const summary = {
      currentStreak: 4,
      longestStreak: 12,
      totalCompletions: 85,
      activeDays: 30,
      perfectDays: 20,
      overallCompletionRate: 78,
      activeHabitsCount: 3,
      memberSince: '2026-01-15',
    };
    const getSpy = vi
      .spyOn(axiosInstance, 'get')
      .mockResolvedValue({ data: summary });

    await expect(fetchProgressSummary('America/Los_Angeles')).resolves.toEqual(
      summary,
    );
    expect(getSpy).toHaveBeenCalledWith('/api/v1/progress/summary', {
      params: { timeZone: 'America/Los_Angeles' },
    });
  });

  it('falls back to streaks and history only when /summary returns 404', async () => {
    const notFound = new AxiosError(
      'Not Found',
      'ERR_BAD_REQUEST',
      undefined,
      undefined,
      {
        status: 404,
        statusText: 'Not Found',
        headers: {},
        config: { headers: new AxiosHeaders() },
        data: {},
      },
    );

    vi.spyOn(axiosInstance, 'get').mockImplementation((url) => {
      if (url === '/api/v1/progress/summary') {
        return Promise.reject(notFound);
      }
      if (url === '/api/v1/progress/streaks') {
        return Promise.resolve({
          data: { currentStreak: 2, longestStreak: 5 },
        });
      }
      return Promise.resolve({
        data: {
          history: [
            { date: '2026-11-03', completionRate: 100 },
            { date: '2026-11-02', completionRate: 50 },
            { date: '2026-11-01', completionRate: 0 },
          ],
        },
      });
    });

    await expect(fetchProgressSummary('UTC')).resolves.toEqual({
      currentStreak: 2,
      longestStreak: 5,
      totalCompletions: 2,
      activeDays: 2,
      perfectDays: 1,
      overallCompletionRate: 50,
      activeHabitsCount: 0,
      memberSince: '2026-11-01',
    });
  });

  it('rethrows non-404 errors without swallowing failures', async () => {
    const failure = new Error('Network Error');
    vi.spyOn(axiosInstance, 'get').mockRejectedValue(failure);

    await expect(fetchProgressSummary('UTC')).rejects.toBe(failure);
  });
});
