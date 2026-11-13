// The stats hook must not invent a completion date it does not have

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import useHabitStats from '../useHabitStats';
import * as habitsApi from '@/features/habits/api';
import formatDate from '@shared/utils/date/formatDate';

vi.mock('@app/providers/useDate', () => ({
  useDate: () => ({ timeZone: 'UTC' }),
}));

// Fresh cache per test so one test's data cannot answer another's
const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useHabitStats', () => {
  beforeEach(() => {
    vi.spyOn(habitsApi, 'fetchHabitStats');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports no completion date while loading, rather than today', () => {
    // A promise that never settles, so the hook stays in its loading state
    const neverResolves = new Promise<never>(() => undefined);
    vi.mocked(habitsApi.fetchHabitStats).mockReturnValue(neverResolves);

    const { result } = renderHook(() => useHabitStats('1'), { wrapper });

    expect(result.current.lastCompleted).toBeNull();
    // What the user actually sees, which used to be today's date
    expect(formatDate(result.current.lastCompleted)).toBe('Never');
  });

  it('passes through a null lastCompleted from the API', async () => {
    vi.mocked(habitsApi.fetchHabitStats).mockResolvedValue({
      streak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      lastCompleted: null,
    });

    const { result } = renderHook(() => useHabitStats('1'), { wrapper });

    await waitFor(() =>
      expect(vi.mocked(habitsApi.fetchHabitStats)).toHaveBeenCalled(),
    );
    await waitFor(() => expect(result.current.lastCompleted).toBeNull());
  });

  it('passes through a real lastCompleted from the API', async () => {
    vi.mocked(habitsApi.fetchHabitStats).mockResolvedValue({
      streak: 3,
      longestStreak: 5,
      totalCompletions: 9,
      lastCompleted: '2026-01-10T00:00:00Z',
    });

    const { result } = renderHook(() => useHabitStats('1'), { wrapper });

    await waitFor(() =>
      expect(result.current.lastCompleted).toBe('2026-01-10T00:00:00Z'),
    );
    expect(result.current.streak).toBe(3);
  });
});
