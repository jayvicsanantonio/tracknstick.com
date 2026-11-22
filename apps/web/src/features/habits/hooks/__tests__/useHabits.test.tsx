// Covers the feedback of ticking a habit off in useHabits: the sound and haptic answer the tap itself.
// The server's answer is held back, to show neither waits for it.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { SWRConfig } from 'swr';
import { useHabits } from '../useHabits';
import * as habitsApi from '@/features/habits/api';
import { achievementApi } from '@/features/progress/api';
import DateProvider from '@app/providers/DateProvider';
import { playSound, preloadSounds } from '@shared/utils/sound';
import { hapticTick } from '@shared/utils/haptics';
import type { Habit } from '@/features/habits/types/Habit';

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ isSignedIn: true }),
}));
vi.mock('@shared/utils/haptics', () => ({ hapticTick: vi.fn() }));
const toast = vi.hoisted(() => vi.fn());
vi.mock('@shared/hooks/use-toast', () => ({ useToast: () => ({ toast }) }));
vi.mock('@shared/utils/sound', () => ({
  playSound: vi.fn(),
  preloadSounds: vi.fn(),
}));

const habit = (overrides: Partial<Habit>): Habit =>
  ({
    id: '1',
    name: 'Read',
    icon: 'BookOpen',
    frequency: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    completed: false,
    startDate: '2026-11-01',
    ...overrides,
  }) as Habit;

const wrapper = ({ children }: { children: ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    <DateProvider>{children}</DateProvider>
  </SWRConfig>
);

/** The hook, loaded with these habits, and a server that never answers a toggle. */
async function renderWithHabits(habits: Habit[]) {
  vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue(habits);
  vi.spyOn(habitsApi, 'toggleHabitCompletion').mockReturnValue(
    new Promise(() => undefined),
  );
  const { result } = renderHook(() => useHabits(), { wrapper });
  await waitFor(() =>
    expect(result.current.habits).toHaveLength(habits.length),
  );
  return result;
}

describe('useHabits toggle feedback', () => {
  beforeEach(() => {
    vi.mocked(playSound).mockClear();
    vi.mocked(preloadSounds).mockClear();
    vi.mocked(hapticTick).mockClear();
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      count: 0,
      newAchievements: [],
    } as unknown as Awaited<
      ReturnType<typeof achievementApi.checkAchievements>
    >);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads the sounds ahead of the first tap', async () => {
    await renderWithHabits([habit({})]);

    expect(preloadSounds).toHaveBeenCalled();
  });

  it('plays the tick on the tap, before the server has answered', async () => {
    const result = await renderWithHabits([
      habit({ id: 'read', name: 'Read' }),
      habit({ id: 'walk', name: 'Walk' }),
    ]);

    act(() => {
      void result.current.toggleHabit('read');
    });

    expect(playSound).toHaveBeenCalledExactlyOnceWith('habit-on');
    expect(habitsApi.toggleHabitCompletion).toHaveBeenCalled();
  });

  it('taps the phone on the tap, before the server has answered', async () => {
    const result = await renderWithHabits([habit({ id: 'read' })]);

    act(() => {
      void result.current.toggleHabit('read');
    });

    expect(hapticTick).toHaveBeenCalledTimes(1);
  });

  it('plays the untick sound for a habit already done', async () => {
    const result = await renderWithHabits([
      habit({ id: 'read', completed: true }),
    ]);

    act(() => {
      void result.current.toggleHabit('read');
    });

    expect(playSound).toHaveBeenCalledExactlyOnceWith('habit-off');
  });

  it("plays the all-done sound for the day's last habit", async () => {
    const result = await renderWithHabits([
      habit({ id: 'read', completed: true }),
      habit({ id: 'walk', completed: false }),
    ]);

    act(() => {
      void result.current.toggleHabit('walk');
    });

    expect(playSound).toHaveBeenCalledExactlyOnceWith('all-done');
  });
});

describe('useHabits messages', () => {
  beforeEach(() => {
    toast.mockClear();
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      count: 0,
      newAchievements: [],
    } as unknown as Awaited<
      ReturnType<typeof achievementApi.checkAchievements>
    >);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  async function renderLoaded() {
    vi.spyOn(habitsApi, 'fetchHabits').mockResolvedValue([habit({})]);
    const { result } = renderHook(() => useHabits(), { wrapper });
    await waitFor(() => expect(result.current.habits).toHaveLength(1));
    return result;
  }

  it('adds a habit without a toast: the new habit on screen says it', async () => {
    vi.spyOn(habitsApi, 'addHabit').mockResolvedValue(
      {} as Awaited<ReturnType<typeof habitsApi.addHabit>>,
    );
    const result = await renderLoaded();

    await act(() =>
      result.current.addHabit({ name: 'Walk' } as Parameters<
        typeof result.current.addHabit
      >[0]),
    );

    expect(toast).not.toHaveBeenCalled();
  });

  it('updates a habit without a toast', async () => {
    vi.spyOn(habitsApi, 'updateHabit').mockResolvedValue(
      {} as Awaited<ReturnType<typeof habitsApi.updateHabit>>,
    );
    const result = await renderLoaded();

    await act(() => result.current.updateHabit('1', { name: 'Read more' }));

    expect(toast).not.toHaveBeenCalled();
  });

  it('deletes a habit without a toast', async () => {
    vi.spyOn(habitsApi, 'deleteHabit').mockResolvedValue(
      {} as Awaited<ReturnType<typeof habitsApi.deleteHabit>>,
    );
    const result = await renderLoaded();

    await act(() => result.current.deleteHabit('1', 'Read'));

    expect(toast).not.toHaveBeenCalled();
  });

  it('still says so when a habit cannot be added', async () => {
    const error = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);
    vi.spyOn(habitsApi, 'addHabit').mockRejectedValue(new Error('offline'));
    const result = await renderLoaded();

    await act(() =>
      result.current.addHabit({ name: 'Walk' } as Parameters<
        typeof result.current.addHabit
      >[0]),
    );

    expect(toast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'destructive' }),
    );
    expect(error).toHaveBeenCalled();
  });

  it('announces a new achievement in a banner', async () => {
    vi.spyOn(achievementApi, 'checkAchievements').mockResolvedValue({
      count: 1,
      newAchievements: [
        { name: 'First Step', description: 'Tick a habit off' },
      ],
    } as unknown as Awaited<
      ReturnType<typeof achievementApi.checkAchievements>
    >);
    vi.spyOn(habitsApi, 'toggleHabitCompletion').mockResolvedValue(
      {} as Awaited<ReturnType<typeof habitsApi.toggleHabitCompletion>>,
    );
    const result = await renderLoaded();

    await act(() => result.current.toggleHabit('1'));

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.objectContaining({
          variant: 'achievement',
          title: 'Achievement earned',
          description: 'First Step: Tick a habit off',
        }),
      ),
    );
  });
});
