// Covers what the daily tracker shows: which habits are done, what a failed load offers, and when the splash goes.
// A completed habit carries a visible check, a load error offers a way to try again, and the first load holds the splash.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DailyHabitTracker from '../DailyHabitTracker';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import { useHideSplash } from '@shared/hooks/useHideSplash';
import { DateContext } from '@app/providers/DateContext';
import type { Habit } from '@/features/habits/types/Habit';

vi.mock('@/features/habits/hooks/useHabits', () => ({ useHabits: vi.fn() }));
vi.mock('@/features/habits/hooks/useAllHabits', () => ({
  useAllHabits: vi.fn(),
}));
// The date header and the ring need the date provider and animation; they
// are not what these tests are about.
vi.mock('../DailyHabitDate', () => ({
  default: () => <nav aria-label="Day navigation" />,
}));
// The streak tray and the week strip ask the API once a date is set; they
// are not what these tests are about.
vi.mock('@/features/progress/hooks/useProgressSummary', () => ({
  default: () => ({ currentStreak: 0, longestStreak: 0, isLoading: false }),
}));
vi.mock('../TrackerWeekStrip', () => ({ default: () => null }));
vi.mock('../DailyHabitProgressIndicator', () => ({
  default: ({
    completionRate,
    totalHabits,
    completedHabits,
  }: {
    completionRate: number;
    totalHabits: number;
    completedHabits: number;
  }) => (
    <div
      role="progressbar"
      aria-label={`Daily habit completion: ${completionRate}%`}
      data-total-habits={totalHabits}
      data-completed-habits={completedHabits}
    >
      {completionRate}%
    </div>
  ),
}));

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
    <MemoryRouter>
      <HabitsStateProvider>
        <DailyHabitTracker />
      </HabitsStateProvider>
    </MemoryRouter>,
  );
}

/** The app, ready: it would take the launch splash down now. */
function AppReady() {
  useHideSplash(true);
  return null;
}

describe('DailyHabitTracker under the launch splash', () => {
  let splash: HTMLElement;

  /** The tracker as the first page, with the app ready around it. */
  function renderFirstPage() {
    return render(
      <MemoryRouter>
        <HabitsStateProvider>
          <AppReady />
          <DailyHabitTracker />
        </HabitsStateProvider>
      </MemoryRouter>,
    );
  }

  async function rerenderFirstPage(rerender: (ui: React.ReactNode) => void) {
    rerender(
      <MemoryRouter>
        <HabitsStateProvider>
          <AppReady />
          <DailyHabitTracker />
        </HabitsStateProvider>
      </MemoryRouter>,
    );
    await act(() => Promise.resolve());
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHabits([]);
    splash = document.createElement('div');
    splash.id = 'splash';
    document.body.append(splash);
  });

  afterEach(() => {
    splash.remove();
  });

  it("keeps it up while the day's habits load, then lets it fade onto them", async () => {
    mockHabits({ isLoading: true });
    const { rerender } = renderFirstPage();
    await act(() => Promise.resolve());
    expect(splash).not.toHaveClass('splash-done');

    mockHabits({ habits: [habit({})] });
    await rerenderFirstPage(rerender);
    expect(splash).toHaveClass('splash-done');
  });

  // A day with nothing due waits on every habit to choose between the
  // first-habit prompt and "nothing today", which lay the page out apart.
  it('keeps it up while a day with nothing due checks for any habits at all', async () => {
    mockHabits({ habits: [] });
    vi.mocked(useAllHabits).mockReturnValue({
      habits: [],
      isLoading: true,
      error: undefined,
      deleteHabit: vi.fn(),
      retry: retryAllHabits,
    } as unknown as ReturnType<typeof useAllHabits>);
    const { rerender } = renderFirstPage();
    await act(() => Promise.resolve());
    expect(splash).not.toHaveClass('splash-done');

    mockAllHabits([]);
    await rerenderFirstPage(rerender);
    expect(screen.getByText('No habits yet')).toBeInTheDocument();
    expect(splash).toHaveClass('splash-done');
  });
});

describe('DailyHabitTracker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockAllHabits([]);
  });

  it("names the habit list section Today's Habits with a done count pill", () => {
    mockHabits({
      habits: [
        habit({ id: '1', name: 'Workout', completed: false }),
        habit({ id: '2', name: 'Bible Study', completed: true }),
      ],
      completionRate: 50,
    });

    renderTracker();

    const section = screen.getByRole('region', { name: "Today's Habits" });
    expect(section).toBeInTheDocument();
    expect(within(section).getByText('1/2 done')).toBeInTheDocument();
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

  it('passes daily completion rate and habit counts to the segmented progress circle', () => {
    mockHabits({
      habits: [
        habit({ id: '1', name: 'Read', completed: true }),
        habit({ id: '2', name: 'Walk', completed: true }),
        habit({ id: '3', name: 'Swim', completed: false }),
      ],
      completionRate: 67,
    });

    renderTracker();

    const progress = screen.getByRole('region', { name: 'Progress' });
    const ring = within(progress).getByRole('progressbar', {
      name: 'Daily habit completion: 67%',
    });
    expect(ring).toHaveTextContent('67%');
    expect(ring).toHaveAttribute('data-total-habits', '3');
    expect(ring).toHaveAttribute('data-completed-habits', '2');
  });

  it('replaces the Ready for today summary panel with only the segmented percentage circle', () => {
    mockHabits({
      habits: [
        habit({ id: '1', name: 'Workout', completed: false }),
        habit({ id: '2', name: 'Meditate', completed: false }),
      ],
      completionRate: 0,
    });

    renderTracker();

    const progress = screen.getByRole('region', { name: 'Progress' });
    expect(within(progress).getByText('0%')).toBeInTheDocument();
    expect(screen.queryByText('Ready for today')).not.toBeInTheDocument();
    expect(screen.queryByText('All caught up!')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: 'Day summary' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByText('Workout')).toHaveLength(1);
    expect(screen.getAllByText('Meditate')).toHaveLength(1);
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

  describe('on a day with nothing due', () => {
    // Tuesday, November 24, 2026, at noon in Los Angeles.
    const tuesday = new Date('2026-11-24T20:00:00.000Z');
    const setDate = vi.fn();

    function renderTuesday() {
      render(
        <DateContext.Provider
          value={{
            date: tuesday,
            currentDate: tuesday,
            setDate,
            handlePreviousDate: vi.fn(),
            handleNextDate: vi.fn(),
            timeZone: 'America/Los_Angeles',
          }}
        >
          <MemoryRouter>
            <HabitsStateProvider>
              <DailyHabitTracker />
            </HabitsStateProvider>
          </MemoryRouter>
        </DateContext.Provider>,
      );
    }

    beforeEach(() => {
      mockHabits({ habits: [] });
      mockAllHabits([
        habit({
          id: '9',
          name: 'Swim',
          frequency: ['Thu'],
          startDate: '2026-11-01T07:00:00.000Z',
        }),
      ]);
    });

    it('names the next day a habit is due and goes there', async () => {
      renderTuesday();

      expect(screen.getByText('Next up: Thursday, Nov 26')).toBeInTheDocument();
      await userEvent.click(
        screen.getByRole('button', { name: 'Go to Thursday' }),
      );

      expect(setDate).toHaveBeenCalledTimes(1);
      const target = setDate.mock.calls[0][0] as Date;
      expect([target.getMonth(), target.getDate()]).toEqual([10, 26]);
    });

    it('tells a keyboard how to change days, and leaves swiping to the hint below', () => {
      renderTuesday();

      const card = screen
        .getByRole('heading', { name: 'Nothing scheduled' })
        .closest('div') as HTMLElement;
      expect(card).toHaveTextContent('← → keys');
      expect(card).not.toHaveTextContent(/swipe/i);
    });

    it('marks it a rest day where the progress ring would be', () => {
      renderTuesday();

      expect(
        screen.getByRole('img', { name: 'Rest day: nothing to check off' }),
      ).toBeInTheDocument();
    });
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

  it('on today, the hint under the habits mentions swiping only', () => {
    mockHabits({ habits: [habit({})] });
    renderTracker();

    expect(screen.getByText('Swipe to switch days')).toBeInTheDocument();
  });

  it('on another day, the hint under the habits says how to go back to today', () => {
    mockHabits({ habits: [habit({})] });
    const currentDate = new Date(2026, 10, 18, 12);
    render(
      <DateContext.Provider
        value={{
          date: new Date(2026, 10, 17, 12),
          currentDate,
          setDate: vi.fn(),
          handlePreviousDate: vi.fn(),
          handleNextDate: vi.fn(),
          timeZone: 'America/Los_Angeles',
        }}
      >
        <MemoryRouter>
          <HabitsStateProvider>
            <DailyHabitTracker />
          </HabitsStateProvider>
        </MemoryRouter>
      </DateContext.Provider>,
    );

    expect(
      screen.getByText('Swipe to switch days · Double-tap the date for today'),
    ).toBeInTheDocument();
  });

  it('keeps the date navigation mounted instead of flashing a full-page skeleton while switching days', () => {
    mockHabits({
      habits: [habit({ id: '1', name: 'Read', completed: false })],
      isLoading: false,
      completionRate: 0,
    });

    const { rerender } = render(
      <MemoryRouter>
        <HabitsStateProvider>
          <DailyHabitTracker />
        </HabitsStateProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('navigation', { name: 'Day navigation' }),
    ).toBeInTheDocument();

    // Simulate SWR fetching an uncached adjacent day while keepPreviousData holds the last day.
    mockHabits({
      habits: [habit({ id: '1', name: 'Read', completed: false })],
      isLoading: true,
      completionRate: 0,
    });

    rerender(
      <MemoryRouter>
        <HabitsStateProvider>
          <DailyHabitTracker />
        </HabitsStateProvider>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('navigation', { name: 'Day navigation' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('status', { name: 'Loading habits' }),
    ).not.toBeInTheDocument();
  });
});
