// Covers the habit changes kept on the device until the API can take them, and how they are sent.
// Each change names the outcome the user wants, so sending one twice, or late, is safe.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AxiosError, type AxiosResponse } from 'axios';
import { axiosInstance } from '@shared/services/api/axiosInstance';
import {
  type PendingCompletion,
  pendingCompletions,
  queueCompletion,
  removeCompletion,
  sendPendingCompletions,
  subscribeToPendingCompletions,
} from '../pendingCompletions';

const STORAGE_KEY = 'track-n-stick-pending-completions';

const change = (
  overrides: Partial<PendingCompletion> = {},
): PendingCompletion => ({
  userId: 'user_1',
  habitId: '7',
  day: '2026-11-23T00:00:00.000Z',
  timestamp: '2026-11-23T16:00:00.000Z',
  timeZone: 'UTC',
  completed: true,
  ...overrides,
});

const networkError = () => new AxiosError('Network Error', 'ERR_NETWORK');
const responseError = (status: number) =>
  new AxiosError('Request failed', 'ERR_BAD_REQUEST', undefined, undefined, {
    status,
  } as AxiosResponse);

describe('pending completions', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('keeps a queued change on the device', () => {
    queueCompletion(change());

    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([
      change(),
    ]);
    expect(pendingCompletions()).toEqual([change()]);
  });

  it('keeps only the latest change to a habit on a day', () => {
    queueCompletion(change({ completed: true }));
    queueCompletion(change({ completed: false }));

    expect(pendingCompletions()).toEqual([change({ completed: false })]);
  });

  it('keeps changes to other days and habits apart', () => {
    queueCompletion(change());
    queueCompletion(change({ day: '2026-11-22T00:00:00.000Z' }));
    queueCompletion(change({ habitId: '8' }));

    expect(pendingCompletions()).toHaveLength(3);
  });

  it('removes a change only while it still asks for the outcome that was sent', () => {
    queueCompletion(change({ completed: true }));

    // The user changed it again while the first outcome was being sent.
    queueCompletion(change({ completed: false }));
    removeCompletion(change({ completed: true }));
    expect(pendingCompletions()).toEqual([change({ completed: false })]);

    removeCompletion(change({ completed: false }));
    expect(pendingCompletions()).toEqual([]);
  });

  it('tells subscribers when the changes do', () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToPendingCompletions(listener);

    queueCompletion(change());
    removeCompletion(change());
    unsubscribe();
    queueCompletion(change());

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('starts with no changes when the stored ones cannot be read', () => {
    localStorage.setItem(STORAGE_KEY, 'not json');

    expect(pendingCompletions()).toEqual([]);
  });

  describe('sending', () => {
    it('sends each change with its outcome and forgets it once saved', async () => {
      const post = vi
        .spyOn(axiosInstance, 'post')
        .mockResolvedValue({ data: { message: 'ok' } });
      queueCompletion(change({ completed: false }));

      await sendPendingCompletions('user_1');

      expect(post).toHaveBeenCalledWith('/api/v1/habits/7/trackers', {
        timestamp: '2026-11-23T16:00:00.000Z',
        timeZone: 'UTC',
        completed: false,
      });
      expect(pendingCompletions()).toEqual([]);
    });

    it("drops another user's changes without sending them", async () => {
      const post = vi.spyOn(axiosInstance, 'post');
      queueCompletion(change({ userId: 'user_2' }));

      await sendPendingCompletions('user_1');

      expect(post).not.toHaveBeenCalled();
      expect(pendingCompletions()).toEqual([]);
    });

    it('keeps the changes when the connection still gets nowhere', async () => {
      const post = vi
        .spyOn(axiosInstance, 'post')
        .mockRejectedValue(networkError());
      queueCompletion(change());
      queueCompletion(change({ habitId: '8' }));

      await sendPendingCompletions('user_1');

      // The first failure says the connection is down; the rest wait.
      expect(post).toHaveBeenCalledTimes(1);
      expect(pendingCompletions()).toHaveLength(2);
    });

    it('drops a change the API refuses, such as one for a deleted habit', async () => {
      vi.spyOn(axiosInstance, 'post').mockRejectedValue(responseError(404));
      vi.spyOn(console, 'error').mockImplementation(() => undefined);
      queueCompletion(change());

      await sendPendingCompletions('user_1');

      expect(pendingCompletions()).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Dropped a habit change the API refused:',
        expect.any(AxiosError),
      );
    });

    it('keeps a change the API failed to save, to try again later', async () => {
      vi.spyOn(axiosInstance, 'post').mockRejectedValue(responseError(500));
      queueCompletion(change());

      await sendPendingCompletions('user_1');

      expect(pendingCompletions()).toEqual([change()]);
    });
  });
});
