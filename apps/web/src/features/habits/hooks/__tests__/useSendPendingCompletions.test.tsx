// Covers when the habit changes kept on the device are sent: signed in, online, with some to send.
// Coming back online sends them too, and the app's data is fetched again once they are saved.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import useSWR from 'swr';
import { queueCompletion } from '@/features/habits/api/pendingCompletions';
import { useSendPendingCompletions } from '../useSendPendingCompletions';

const mockAuth = vi.hoisted(() => ({
  isSignedIn: true as boolean,
  userId: 'user_1' as string | null,
}));
const mockSend = vi.hoisted(() => vi.fn());

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => mockAuth,
}));
vi.mock('@/features/habits/api/pendingCompletions', async (importOriginal) => ({
  ...(await importOriginal<
    typeof import('@/features/habits/api/pendingCompletions')
  >()),
  sendPendingCompletions: mockSend,
}));

function setOnline(online: boolean) {
  vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
  window.dispatchEvent(new Event(online ? 'online' : 'offline'));
}

const queueOne = () =>
  queueCompletion({
    userId: 'user_1',
    habitId: '7',
    day: '2026-11-23T00:00:00.000Z',
    timestamp: '2026-11-23T16:00:00.000Z',
    timeZone: 'UTC',
    completed: true,
  });

describe('useSendPendingCompletions', () => {
  beforeEach(() => {
    mockAuth.isSignedIn = true;
    mockAuth.userId = 'user_1';
    mockSend.mockResolvedValue(undefined);
    setOnline(true);
  });

  afterEach(() => {
    localStorage.clear();
    mockSend.mockReset();
    vi.restoreAllMocks();
  });

  it("sends the signed-in user's changes", async () => {
    queueOne();
    renderHook(() => useSendPendingCompletions());

    await waitFor(() => expect(mockSend).toHaveBeenCalledWith('user_1'));
  });

  it('sends nothing when nothing is waiting', async () => {
    renderHook(() => useSendPendingCompletions());

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('sends nothing before a user is signed in', async () => {
    mockAuth.isSignedIn = false;
    mockAuth.userId = null;
    queueOne();
    renderHook(() => useSendPendingCompletions());

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mockSend).not.toHaveBeenCalled();
  });

  it('waits while offline, and sends once the connection returns', async () => {
    setOnline(false);
    queueOne();
    renderHook(() => useSendPendingCompletions());

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(mockSend).not.toHaveBeenCalled();

    act(() => setOnline(true));

    await waitFor(() => expect(mockSend).toHaveBeenCalledWith('user_1'));
  });

  it('fetches the data again once the changes are sent', async () => {
    const fetcher = vi.fn().mockResolvedValue('data');
    queueOne();
    renderHook(() => {
      useSWR('pending-completions-refetch', fetcher);
      useSendPendingCompletions();
    });

    await waitFor(() => expect(mockSend).toHaveBeenCalled());
    await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  });
});
