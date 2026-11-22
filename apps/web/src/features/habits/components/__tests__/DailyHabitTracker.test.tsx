// Covers what the daily tracker shows: which habits are done, and what a failed load offers.
// A completed habit carries a visible check, and a load error offers a way to try again.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DailyHabitTracker from '../DailyHabitTracker';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import type { Habit } from '@/features/habits/types/Habit';
import { isEnteringOnScreen } from '@testing/utils';

vi.mock('@/features/habits/hooks/useHabits', () => ({ useHabits: vi.fn() }));
vi.mock('@/features/habits/hooks/useAllHabits', () => ({
  useAllHabits: vi.fn(),
}));
// The date header and the ring need the date provider and animation; they
// are not what these tests are about.
vi.mock('../DailyHabitDate', () => ({
  default: () => <nav aria-label="Day navigation" />,
}));
vi.mock('../DailyHabitProgressIndicator', () => ({ default: () => null }));

const habit = (overrides: Partial<Habit>): Habit =>
  ({
    id: '1',
    name: 'Read',
    icon: 'BookOpen',
    frequency: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    completed: false,
    startDate: '2026-11-01',
    ...overrides,
  }) as Habit;

const mutateHabits = vi.fn();

function mockHabits(values: Partial<ReturnType<typeof useHabits>>) {
  vi.mocked(useHabits).mockReturnValue({
    habits: [],
    isLoading: false,
    error: undefined,
    completionRate: 0,
    animatingHabitId: null,
    toggleHabit: vi.fn(),
    mutateHabits,
    ...values,
  } as unknown as ReturnType<typeof useHabits>);
}

/** Every habit the user has, due or not on the day shown. */
const retryAllHabits = vi.fn();

function mockAllHabits(habits: Habit[], error?: unknown) {
  vi.mocked(useAllHabits).mockReturnValue({
    habits,
    isLoading: false,
    error,
    deleteHabit: vi.fn(),
    retry: retryAllHabits,
  } as unknown as ReturnType<typeof useAllHabits>);
}

function renderTracker() {
  render(
    <HabitsStateProvider>
      <DailyHabitTracker />
    </HabitsStateProvider>,
  );
}

describe('DailyHabitTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHabits([]);
  });

  it("names the habit list section Today's Habits", () => {
    mockHabits({ habits: [habit({})] });

    renderTracker();

    expect(
      screen.getByRole('region', { name: "Today's Habits" }),
    ).toBeInTheDocument();
  });

  it('shows the day and its habits at once, as a native tab does, without fading them in', () => {
    mockHabits({
      habits: [
        habit({ id: '1', name: 'Read' }),
        habit({ id: '2', name: 'Walk' }),
      ],
    });

    renderTracker();

    for (const name of ['Read', 'Walk']) {
      const toggle = screen.getByRole('button', {
        name: `Mark ${name} as complete`,
      });
      expect(isEnteringOnScreen(toggle)).toBe(false);
    }
  });

  it('shows the loading state at once, without fading it in', () => {
    mockHabits({ isLoading: true });

    renderTracker();

    expect(isEnteringOnScreen(screen.getByRole('status'))).toBe(false);
  });

  it('shows a check badge on completed habits only', () => {
    mockHabits({
      habits: [
        habit({ id: '1', name: 'Read', completed: true }),
        habit({ id: '2', name: 'Walk', completed: false }),
      ],
    });

    renderTracker();

    const done = screen.getByRole('button', {
      name: 'Mark Read as incomplete',
    });
    const notDone = screen.getByRole('button', {
      name: 'Mark Walk as complete',
    });
    // The badge sits beside the button, on the habit's own item.
    const badgeOf = (button: HTMLElement) =>
      button
        .closest('[data-habit-item]')
        ?.querySelector('[data-completed-badge]');
    expect(badgeOf(done)).toBeTruthy();
    expect(badgeOf(notDone)).toBeFalsy();
  });

  it('offers to try again when the habits fail to load', async () => {
    mockHabits({ error: new Error('Network Error') });

    renderTracker();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your habits could not be loaded',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(mutateHabits).toHaveBeenCalledTimes(1);
  });

  it("sums up how many of the day's habits are done", () => {
    mockHabits({
      habits: [
        habit({ id: '1', name: 'Read', completed: true }),
        habit({ id: '2', name: 'Walk', completed: true }),
        habit({ id: '3', name: 'Swim', completed: false }),
      ],
    });

    renderTracker();

    expect(
      screen.getByRole('status', { name: 'Day summary' }),
    ).toHaveTextContent('2 of 3 done');
  });

  it('says so when every habit of the day is done', () => {
    mockHabits({
      habits: [
        habit({ id: '1', name: 'Read', completed: true }),
        habit({ id: '2', name: 'Walk', completed: true }),
      ],
    });

    renderTracker();

    expect(
      screen.getByRole('status', { name: 'Day summary' }),
    ).toHaveTextContent('All 2 done');
  });

  it('shows the first-habit prompt only when there are no habits at all', () => {
    mockHabits({ habits: [] });
    mockAllHabits([]);

    renderTracker();

    expect(screen.getByText('No habits yet')).toBeInTheDocument();
  });

  it('centres the first-habit prompt on its own, without the day navigation', () => {
    mockHabits({ habits: [] });
    mockAllHabits([]);

    renderTracker();

    expect(
      screen.getByRole('heading', { level: 2, name: 'No habits yet' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add habit' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('navigation', { name: 'Day navigation' }),
    ).not.toBeInTheDocument();
  });

  it('says nothing is scheduled on a day with no habits due', () => {
    mockHabits({ habits: [] });
    mockAllHabits([habit({ id: '9', name: 'Swim', frequency: ['Mon'] })]);

    renderTracker();

    expect(screen.getByText('Nothing scheduled')).toBeInTheDocument();
    expect(screen.queryByText('No habits yet')).not.toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Day navigation' }),
    ).toBeInTheDocument();
  });

  it('only asks for every habit when the day shown has none due', () => {
    mockHabits({ habits: [habit({})] });
    renderTracker();
    expect(useAllHabits).toHaveBeenLastCalledWith({ enabled: false });

    vi.clearAllMocks();
    mockAllHabits([]);
    mockHabits({ habits: [] });
    renderTracker();
    expect(useAllHabits).toHaveBeenLastCalledWith({ enabled: true });
  });

  it('offers to try again, not to add a first habit, when the habit list cannot be checked', async () => {
    mockHabits({ habits: [] });
    mockAllHabits([], new Error('Too many requests'));

    renderTracker();

    expect(screen.queryByText('No habits yet')).not.toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your habits could not be checked',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retryAllHabits).toHaveBeenCalledTimes(1);
  });
});
