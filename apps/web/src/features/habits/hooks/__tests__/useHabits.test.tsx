// Covers marking a habit complete on the tracker, with and without a connection.
// A change that reaches no server is kept on the device and shown until it is sent.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { AxiosError, type AxiosResponse } from 'axios';
import { useHabits } from '../useHabits';
import * as habitsApi from '@/features/habits/api';
import { achievementApi } from '@/features/progress/api';
import {
  pendingCompletions,
  queueCompletion,
} from '@/features/habits/api/pendingCompletions';
import type { Habit } from '@/features/habits/types/Habit';

const DATE = new Date('2026-11-23T16:00:00.000Z');
const DAY = '2026-11-23T00:00:00.000Z';
const mockToast = vi.hoisted(() => vi.fn());

vi.mock('@app/providers/useDate', () => ({
  useDate: () => ({ date: DATE, setDate: vi.fn(), timeZone: 'UTC' }),
}));
vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: true, userId: 'user_1' }),
}));
vi.mock('@shared/hooks/useOfflineSession', () => ({
  useOfflineSession: () => false,
  lastSignedInUserId: () => 'user_1',
}));
vi.mock('@shared/hooks/use-toast', () => ({
  useToast: () => ({ toast: mockToast }),
}));
vi.mock('@shared/utils/sound', () => ({ playHabitSound: vi.fn() }));
vi.mock('@shared/utils/haptics', () => ({ triggerHaptic: vi.fn() }));

const habit: Habit = {
  id: '7',
  name: 'Read',
  icon: 'Activity',
  frequency: ['Mon'],
  startDate: '2026-11-01T00:00:00.000Z',
  completed: false,
} as Habit;

// Fresh cache per test so one test's data cannot answer another's
const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

async function renderTracker() {
  const view = renderHook(() => useHabits(), { wrapper });
  await waitFor(() => expect(view.result.current.habits).toHaveLength(1));
  return view;
}

describe('useHabits', () => {
  beforeEach(() => {
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([habit]);
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      count: 0,
      newAchievements: [],
    } as never);
  });

  afterEach(() => {
    localStorage.clear();
    mockToast.mockReset();
    vi.restoreAllMocks();
  });

  it('shows a habit at the outcome still waiting to be sent', async () => {
    queueCompletion({
      userId: 'user_1',
      habitId: '7',
      day: DAY,
      timestamp: DATE.toISOString(),
      timeZone: 'UTC',
      completed: true,
    });

    const { result } = await renderTracker();

    expect(result.current.habits[0].completed).toBe(true);
  });

  it('asks the API for the outcome the user chose', async () => {
    const toggle = vi
      .spyOn(habitsApi, 'toggleHabitCompletion')
      .mockResolvedValue({ message: 'ok' });
    const { result } = await renderTracker();

    await act(() => result.current.toggleHabit('7'));

    expect(toggle).toHaveBeenCalledWith('7', DATE, 'UTC', true);
  });

  it('keeps a change that reaches no server, to send it later', async () => {
    vi.spyOn(habitsApi, 'toggleHabitCompletion').mockRejectedValue(
      new AxiosError('Network Error', 'ERR_NETWORK'),
    );
    const { result } = await renderTracker();

    await act(() => result.current.toggleHabit('7'));

    expect(result.current.habits[0].completed).toBe(true);
    expect(pendingCompletions()).toEqual([
      {
        userId: 'user_1',
        habitId: '7',
        day: DAY,
        timestamp: DATE.toISOString(),
        timeZone: 'UTC',
        completed: true,
      },
    ]);
    expect(mockToast).toHaveBeenCalledWith({
      description: "Saved on this device. It's sent when you're back online.",
    });
  });

  it('undoes a change the API refuses, and keeps nothing to send', async () => {
    vi.spyOn(habitsApi, 'toggleHabitCompletion').mockRejectedValue(
      new AxiosError('Bad', 'ERR_BAD_REQUEST', undefined, undefined, {
        status: 400,
      } as AxiosResponse),
    );
    vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const { result } = await renderTracker();

    await act(() => result.current.toggleHabit('7'));

    await waitFor(() => expect(result.current.habits[0].completed).toBe(false));
    expect(pendingCompletions()).toEqual([]);
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      description: 'Failed to update habit status. Reverting change.',
    });
    expect(console.error).toHaveBeenCalledWith(
      'Failed to toggle habit completion:',
      expect.any(AxiosError),
    );
  });
});
