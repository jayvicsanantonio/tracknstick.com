// Covers when the all-habits hook asks the API for the list.
// Disabled, it sends nothing: the tracker only needs the list on a day with no habits due.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig, type Cache } from 'swr';
import { allHabitsKey } from '@/features/habits/api';
import type { Habit } from '@/features/habits/types/Habit';
import { useAllHabits } from '../useAllHabits';
import * as habitsApi from '@/features/habits/api';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: true }),
}));
vi.mock('@shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
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
});

describe('useAllHabits deleting a habit', () => {
  const read = { id: 'read', name: 'Read' } as Habit;
  const walk = { id: 'walk', name: 'Walk' } as Habit;
  const todayKey = `${allHabitsKey}?date=2026-11-21&timeZone=UTC`;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("takes it out of every list in the app's cache at once, the Tracker's days too", async () => {
    const cache = new Map<string, unknown>([
      [todayKey, { data: [read, walk] }],
    ]);
    const appWrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig
        value={{ provider: () => cache as Cache, dedupingInterval: 0 }}
      >
        {children}
      </SWRConfig>
    );
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([read, walk]);
    vi.spyOn(habitsApi, 'deleteHabit').mockReturnValue(
      new Promise(() => undefined),
    );
    const { result } = renderHook(() => useAllHabits(), {
      wrapper: appWrapper,
    });
    await waitFor(() => expect(result.current.habits).toHaveLength(2));

    act(() => {
      void result.current.deleteHabit('read', 'Read');
    });

    await waitFor(() =>
      expect((cache.get(todayKey) as { data: Habit[] }).data).toEqual([walk]),
    );
  });

  it("asks the API again for the lists in the app's cache, not SWR's default one", async () => {
    const cache = new Map<string, unknown>();
    const appWrapper = ({ children }: { children: ReactNode }) => (
      <SWRConfig
        value={{ provider: () => cache as Cache, dedupingInterval: 0 }}
      >
        {children}
      </SWRConfig>
    );
    const fetchHabits = vi
      .spyOn(habitsApi, 'fetchHabits')
      .mockResolvedValue([read, walk]);
    vi.spyOn(habitsApi, 'deleteHabit').mockResolvedValue(
      {} as Awaited<ReturnType<typeof habitsApi.deleteHabit>>,
    );
    const { result } = renderHook(() => useAllHabits(), {
      wrapper: appWrapper,
    });
    await waitFor(() => expect(result.current.habits).toHaveLength(2));
    const callsBefore = fetchHabits.mock.calls.length;

    await act(() => result.current.deleteHabit('read', 'Read'));

    await waitFor(() =>
      expect(fetchHabits.mock.calls.length).toBeGreaterThan(callsBefore),
    );
  });
});
