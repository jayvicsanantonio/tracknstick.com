// Covers fetchProgressHistory: the history on success, and a rejection on any failure.
// A failure used to come back as an empty list, which the page drew as "no progress".

import { describe, it, expect, vi, afterEach } from 'vitest';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import { fetchProgressHistory } from '../index';

describe('fetchProgressHistory', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns the history the API sends', async () => {
    const history = [{ date: '2026-11-01', completionRate: 50 }];
    vi.spyOn(axiosInstance, 'get').mockResolvedValue({ data: { history } });

    await expect(fetchProgressHistory('UTC')).resolves.toEqual(history);
  });

  it('rejects when the request fails, rather than reporting no progress', async () => {
    const failure = new Error('Network Error');
    vi.spyOn(axiosInstance, 'get').mockRejectedValue(failure);

    await expect(fetchProgressHistory('UTC')).rejects.toBe(failure);
  });

  it('rejects when the response has no history list', async () => {
    vi.spyOn(axiosInstance, 'get').mockResolvedValue({ data: {} });

    await expect(fetchProgressHistory('UTC')).rejects.toThrow(
      'Unexpected progress history response',
    );
  });
});
