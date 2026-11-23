// Covers when the all-habits hook asks the API for the list.
// Disabled, it sends nothing: the tracker only needs the list on a day with no habits due.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { useAllHabits } from '../useAllHabits';
import * as habitsApi from '@/features/habits/api';

const mockAuth = vi.hoisted(() => ({ isSignedIn: true }));
const mockOffline = vi.hoisted(() => ({ value: false }));

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: mockAuth.isSignedIn }),
}));
vi.mock('@shared/hooks/useOfflineSession', () => ({
  useOfflineSession: () => mockOffline.value,
}));

// Fresh cache per test so one test's data cannot answer another's
const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useAllHabits', () => {
  beforeEach(() => {
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([]);
  });

  afterEach(() => {
    mockAuth.isSignedIn = true;
    mockOffline.value = false;
    vi.restoreAllMocks();
  });

  it('fetches every habit by default', async () => {
    const { result } = renderHook(() => useAllHabits(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(habitsApi.fetchHabits).toHaveBeenCalled();
  });

  it('sends no request while disabled', async () => {
    const { result } = renderHook(() => useAllHabits({ enabled: false }), {
      wrapper,
    });

    // Give SWR the chance it would have to start a request.
    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(habitsApi.fetchHabits).not.toHaveBeenCalled();
    expect(result.current.habits).toEqual([]);
  });

  it('asks again when retried', async () => {
    const { result } = renderHook(() => useAllHabits(), { wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    const callsBefore = vi.mocked(habitsApi.fetchHabits).mock.calls.length;

    await act(async () => {
      await result.current.retry();
    });

    expect(vi.mocked(habitsApi.fetchHabits).mock.calls.length).toBe(
      callsBefore + 1,
    );
  });

  it('sends no request when no one is signed in', async () => {
    mockAuth.isSignedIn = false;
    renderHook(() => useAllHabits(), { wrapper });

    await new Promise((resolve) => setTimeout(resolve, 20));
    expect(habitsApi.fetchHabits).not.toHaveBeenCalled();
  });

  it("asks for the last visit's habits while offline, before Clerk loads", async () => {
    mockAuth.isSignedIn = false;
    mockOffline.value = true;
    const { result } = renderHook(() => useAllHabits(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(habitsApi.fetchHabits).toHaveBeenCalled();
  });
});
