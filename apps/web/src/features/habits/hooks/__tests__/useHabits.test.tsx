// Covers marking a habit complete on the tracker, with and without a connection.
// A change that reaches no server is kept on the device and shown until it is sent.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig, mutate } from 'swr';
import { AxiosError, type AxiosResponse } from 'axios';
import { useHabits } from '../useHabits';
import { useHabitsContext } from '../useHabitsContext';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import * as habitsApi from '@/features/habits/api';
import { achievementApi } from '@/features/progress/api';
import { triggerHaptic } from '@shared/utils/haptics';
import { usePreferences } from '@shared/hooks/usePreferences';
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
vi.mock('swr', async (importOriginal) => {
  const actual = await importOriginal<typeof import('swr')>();
  return { ...actual, mutate: vi.fn(actual.mutate) };
});
vi.mock('@shared/utils/haptics', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@shared/utils/haptics')>();
  return {
    ...actual,
    triggerHaptic: vi.fn(actual.triggerHaptic),
  };
});

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
    <HabitsStateProvider>{children}</HabitsStateProvider>
  </SWRConfig>
);

async function renderTracker() {
  const view = renderHook(() => useHabits(), { wrapper });
  await waitFor(() => expect(view.result.current.habits).toHaveLength(1));
  return view;
}

describe('useHabits', () => {
  const originalVibrateDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'vibrate',
  );

  beforeEach(() => {
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(true);
      result.current.setHapticStrength('prominent');
    });
    vi.mocked(triggerHaptic).mockClear();
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([habit]);
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      count: 0,
      newAchievements: [],
    } as never);
  });

  afterEach(() => {
    vi.useRealTimers();
    localStorage.clear();
    mockToast.mockReset();
    vi.restoreAllMocks();
    if (originalVibrateDescriptor) {
      Object.defineProperty(navigator, 'vibrate', originalVibrateDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'vibrate');
    }
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

  it('asks the API for the outcome the user chose and uses single-habit allDone timing on a 1-habit day', async () => {
    const toggle = vi
      .spyOn(habitsApi, 'toggleHabitCompletion')
      .mockResolvedValue({ message: 'ok' });
    const { result } = await renderTracker();

    await act(() => result.current.toggleHabit('7'));

    expect(toggle).toHaveBeenCalledWith('7', DATE, 'UTC', true);
    expect(triggerHaptic).toHaveBeenCalledWith('allDoneSingle');
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
    expect(triggerHaptic).not.toHaveBeenCalledWith('error', {
      androidOnly: true,
    });
  });

  it('undoes a change the API refuses, fires an Android-only error haptic, and keeps nothing to send', async () => {
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
    expect(triggerHaptic).toHaveBeenCalledWith('error', { androidOnly: true });
    expect(mockToast).toHaveBeenCalledWith({
      variant: 'destructive',
      description: 'Failed to update habit status. Reverting change.',
    });
    expect(console.error).toHaveBeenCalledWith(
      'Failed to toggle habit completion:',
      expect.any(AxiosError),
    );
  });

  it('celebrates the achievements a check awards, instead of a toast', async () => {
    vi.spyOn(habitsApi, 'toggleHabitCompletion').mockResolvedValue({
      message: 'ok',
    });
    const earned = {
      id: 'a1',
      key: 'completions_50',
      name: 'Half Century',
      description: 'Complete habits 50 times',
      type: 'completion' as const,
      category: 'dedication' as const,
    };
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      message: 'checked',
      newAchievements: [earned],
      count: 1,
    });
    const view = renderHook(
      () => ({ habits: useHabits(), state: useHabitsContext() }),
      { wrapper },
    );
    await waitFor(() =>
      expect(view.result.current.habits.habits).toHaveLength(1),
    );

    await act(() => view.result.current.habits.toggleHabit('7'));

    await waitFor(() =>
      expect(view.result.current.state.achievementCelebrations).toEqual([
        earned,
      ]),
    );
    expect(mockToast).not.toHaveBeenCalled();
  });

  it('fetches the achievements again after each check, so their progress stays current', async () => {
    vi.spyOn(habitsApi, 'toggleHabitCompletion').mockResolvedValue({
      message: 'ok',
    });
    const { result } = await renderTracker();
    vi.mocked(mutate).mockClear();

    await act(() => result.current.toggleHabit('7'));

    await waitFor(() => {
      const matchesAchievements = vi
        .mocked(mutate)
        .mock.calls.map(([match]) => match)
        .filter(
          (match): match is (key: unknown) => boolean =>
            typeof match === 'function',
        )
        .some(
          (match) =>
            match(['/api/v1/achievements', 'UTC']) &&
            match('/api/v1/achievements/stats') &&
            !match(['progressSummary', 'UTC']),
        );
      expect(matchesAchievements).toBe(true);
    });
  });

  it('triggers distinct heavy, allDone, light, and achievement haptics across toggle states', async () => {
    const secondHabit: Habit = { ...habit, id: '8', name: 'Walk' };
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([habit, secondHabit]);
    vi.spyOn(habitsApi, 'toggleHabitCompletion').mockResolvedValue({
      message: 'ok',
    });
    const checkAchievements = vi
      .spyOn(achievementApi, 'checkAchievements')
      .mockResolvedValueOnce({ count: 0, newAchievements: [] } as never)
      .mockResolvedValueOnce({
        count: 1,
        newAchievements: [
          { id: 'a1', name: 'Perfect Day', description: 'All habits done' },
        ],
      } as never);

    const view = renderHook(() => useHabits(), { wrapper });
    await waitFor(() => expect(view.result.current.habits).toHaveLength(2));

    // Checking first of two habits -> heavy
    await act(() => view.result.current.toggleHabit('7'));
    expect(triggerHaptic).toHaveBeenCalledWith('heavy');
    // Streak achievements count days in the user's time zone.
    await waitFor(() => expect(checkAchievements).toHaveBeenCalledWith('UTC'));

    // Mock refetch keeping habit 7 done so habit 8 is the final incomplete habit
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([
      { ...habit, completed: true },
      secondHabit,
    ]);
    await act(() => view.result.current.mutateHabits());

    vi.mocked(triggerHaptic).mockClear();
    await act(() => view.result.current.toggleHabit('8'));
    expect(triggerHaptic).toHaveBeenCalledWith('allDone');
    await waitFor(() =>
      expect(triggerHaptic).toHaveBeenCalledWith('achievement', {
        androidOnly: true,
      }),
    );

    // Unchecking a completed habit -> light
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([
      { ...habit, completed: true },
      { ...secondHabit, completed: true },
    ]);
    await act(() => view.result.current.mutateHabits());

    vi.mocked(triggerHaptic).mockClear();
    await act(() => view.result.current.toggleHabit('7'));
    expect(triggerHaptic).toHaveBeenCalledWith('light');
  });

  it('lets the allDone pattern finish on Android when an achievement resolves within 830ms', async () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    const firstDone: Habit = { ...habit, completed: true };
    const secondHabit: Habit = { ...habit, id: '8', name: 'Walk' };
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([
      firstDone,
      secondHabit,
    ]);
    vi.spyOn(habitsApi, 'toggleHabitCompletion').mockResolvedValue({
      message: 'ok',
    });

    let resolveAchievements!: (value: {
      count: number;
      newAchievements: { id: string; name: string; description: string }[];
    }) => void;
    vi.spyOn(achievementApi, 'checkAchievements').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveAchievements = resolve;
        }) as never,
    );

    const view = renderHook(() => useHabits(), { wrapper });
    await waitFor(() => expect(view.result.current.habits).toHaveLength(2));

    vi.useFakeTimers();

    await act(async () => {
      await view.result.current.toggleHabit('8');
    });

    // allDone starts immediately on tap (770ms total duration).
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenLastCalledWith([20, 320, 36, 264, 20, 55, 55]);

    // Achievement check resolves 200ms later (well inside the 830ms window).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
      resolveAchievements({
        count: 1,
        newAchievements: [
          { id: 'a1', name: 'Perfect Day', description: 'All habits done' },
        ],
      });
      await Promise.resolve();
    });

    // allDone is not cut off at t = 200ms or t = 750ms.
    expect(vibrate).toHaveBeenCalledTimes(1);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(550);
    });
    expect(vibrate).toHaveBeenCalledTimes(1);

    // After allDone completes (770ms) plus the 120ms gap, the achievement fanfare plays.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(200);
    });
    expect(vibrate).toHaveBeenCalledTimes(2);
    expect(vibrate).toHaveBeenLastCalledWith([24, 50, 24, 50, 60]);
  });
});
