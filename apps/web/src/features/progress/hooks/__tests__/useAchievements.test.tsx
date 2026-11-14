// Pins what useAchievements gives the progress page: the catalogue, the stats, loading and errors.
// Also covers its refresh, check and initialize actions, which refetch through the API client.

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  type MockInstance,
} from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { achievementApi } from '../../api';
import { useAchievements } from '../useAchievements';
import type { Achievement, AchievementStats } from '../../types/Achievement';

// Fresh cache per test so one test's data cannot answer another's
const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

const achievement = {
  id: '1',
  key: 'first_habit',
  name: 'First Step',
  description: 'Create your first habit',
  type: 'habit_creation',
  category: 'getting_started',
  requirementType: 'count',
  requirementValue: 1,
  isEarned: false,
} as Achievement;

const stats: AchievementStats = {
  totalAchievements: 1,
  earnedAchievements: 0,
  completionPercentage: 0,
  categoryStats: { getting_started: { total: 1, earned: 0 } },
  recentAchievements: [],
};

describe('useAchievements', () => {
  let getAllAchievements: MockInstance<
    typeof achievementApi.getAllAchievements
  >;

  beforeEach(() => {
    getAllAchievements = vi
      .spyOn(achievementApi, 'getAllAchievements')
      .mockResolvedValue([achievement]);
    vi.spyOn(achievementApi, 'getAchievementStats').mockResolvedValue(stats);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the achievements and their stats', async () => {
    const { result } = renderHook(() => useAchievements(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.achievements).toEqual([achievement]);
    expect(result.current.stats).toEqual(stats);
    expect(result.current.error).toBeNull();
  });

  it('reports an error, and no achievements, when loading fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    getAllAchievements.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAchievements(), { wrapper });

    await waitFor(() =>
      expect(result.current.error).toBe(
        'Failed to load achievements. Please try again.',
      ),
    );
    expect(result.current.achievements).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('fetches again on refresh', async () => {
    const { result } = renderHook(() => useAchievements(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => result.current.refresh());

    await waitFor(() => expect(getAllAchievements).toHaveBeenCalledTimes(2));
  });

  it('fetches again after a check awards new achievements', async () => {
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      message: 'checked',
      newAchievements: [],
      count: 1,
    });
    const { result } = renderHook(() => useAchievements(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let checked;
    await act(async () => {
      checked = await result.current.checkNewAchievements();
    });

    expect(checked).toEqual({
      message: 'checked',
      newAchievements: [],
      count: 1,
    });
    await waitFor(() => expect(getAllAchievements).toHaveBeenCalledTimes(2));
  });

  it('does not fetch again after a check awards nothing', async () => {
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      message: 'checked',
      newAchievements: [],
      count: 0,
    });
    const { result } = renderHook(() => useAchievements(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.checkNewAchievements();
    });

    expect(getAllAchievements).toHaveBeenCalledTimes(1);
  });

  it('returns null, and logs, when the check fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.spyOn(achievementApi, 'checkAchievements').mockRejectedValue(
      new Error('Network Error'),
    );
    const { result } = renderHook(() => useAchievements(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    let checked;
    await act(async () => {
      checked = await result.current.checkNewAchievements();
    });

    expect(checked).toBeNull();
    expect(consoleError).toHaveBeenCalledWith(
      'Error checking achievements:',
      expect.any(Error),
    );
  });

  it('fetches again after initializing achievements', async () => {
    vi.spyOn(achievementApi, 'initializeAchievements').mockResolvedValue({
      message: 'initialized',
    });
    const { result } = renderHook(() => useAchievements(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.initializeAchievements();
    });

    await waitFor(() => expect(getAllAchievements).toHaveBeenCalledTimes(2));
  });

  it('reports an error when initializing achievements fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    vi.spyOn(achievementApi, 'initializeAchievements').mockRejectedValue(
      new Error('Network Error'),
    );
    const { result } = renderHook(() => useAchievements(), { wrapper });
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.initializeAchievements();
    });

    expect(result.current.error).toBe('Failed to initialize achievements.');
  });
});
