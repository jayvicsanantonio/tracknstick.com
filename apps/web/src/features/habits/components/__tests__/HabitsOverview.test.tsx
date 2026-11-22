// Covers the habits overview table: its controls are labelled and its rows read clearly.
// The habits come from a stubbed useAllHabits; the table itself is real.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HabitsOverview from '../HabitsOverview';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import type { Habit } from '@/features/habits/types/Habit';

vi.mock('@/features/habits/hooks/useAllHabits', () => ({
  useAllHabits: vi.fn(),
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

function renderOverview(habits: Habit[]) {
  vi.mocked(useAllHabits).mockReturnValue({
    habits,
    isLoading: false,
    error: undefined,
    deleteHabit: vi.fn(),
  } as unknown as ReturnType<typeof useAllHabits>);
  render(
    <MemoryRouter>
      <HabitsStateProvider>
        <HabitsOverview />
      </HabitsStateProvider>
    </MemoryRouter>,
  );
}

describe('HabitsOverview', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('gives every button an accessible name', () => {
    renderOverview([habit({})]);

    for (const button of screen.getAllByRole('button')) {
      expect(button).toHaveAccessibleName();
    }
  });

  it('has no back button, since the header navigation covers it', () => {
    renderOverview([habit({})]);

    expect(
      screen.queryByRole('button', { name: /back/i }),
    ).not.toBeInTheDocument();
  });

  it('labels the search field', () => {
    renderOverview([habit({})]);

    expect(
      screen.getByRole('searchbox', { name: 'Search habits' }),
    ).toBeInTheDocument();
  });

  it('shows "Daily" for a habit due every day, and the days otherwise', () => {
    renderOverview([
      habit({ id: '1', name: 'Read' }),
      habit({ id: '2', name: 'Swim', frequency: ['Mon', 'Wed', 'Fri'] }),
    ]);

    const read = screen.getByRole('row', { name: /Read/ });
    expect(within(read).getByText('Daily')).toBeInTheDocument();
    expect(within(read).queryByText('Sun')).not.toBeInTheDocument();

    const swim = screen.getByRole('row', { name: /Swim/ });
    expect(within(swim).getByText('Mon')).toBeInTheDocument();
    expect(within(swim).queryByText('Daily')).not.toBeInTheDocument();
  });

  describe('on phones, as a card list', () => {
    it('shows each habit as a card with its frequency, status and start', () => {
      renderOverview([
        habit({ id: '1', name: 'Read' }),
        habit({ id: '2', name: 'Swim', frequency: ['Mon', 'Wed', 'Fri'] }),
      ]);

      const list = screen.getByRole('list', { name: 'Habits' });
      const cards = within(list).getAllByRole('listitem');
      expect(cards).toHaveLength(2);

      expect(cards[0]).toHaveTextContent('Read');
      expect(cards[0]).toHaveTextContent('Daily');
      expect(cards[0]).toHaveTextContent('Active');
      expect(within(cards[0]).getByText(/^Since /)).toBeInTheDocument();

      expect(cards[1]).toHaveTextContent('Mon · Wed · Fri');
    });

    it('asks to confirm before deleting from a card', async () => {
      renderOverview([habit({ id: '1', name: 'Read' })]);

      const card = within(
        screen.getByRole('list', { name: 'Habits' }),
      ).getByRole('listitem');
      await userEvent.click(
        within(card).getByRole('button', { name: 'Delete Read' }),
      );

      expect(
        screen.getByRole('alertdialog', { name: 'Delete Habit' }),
      ).toHaveTextContent('Read');
    });

    it('offers an edit button on each card', () => {
      renderOverview([habit({ id: '1', name: 'Read' })]);

      const card = within(
        screen.getByRole('list', { name: 'Habits' }),
      ).getByRole('listitem');
      expect(
        within(card).getByRole('button', { name: 'Edit Read' }),
      ).toBeInTheDocument();
    });
  });

  describe('empty results', () => {
    it('explains an empty Archived tab', async () => {
      renderOverview([habit({ id: '1', name: 'Read' })]);

      await userEvent.click(screen.getByRole('tab', { name: 'Archived' }));

      expect(screen.getByText('No archived habits')).toBeInTheDocument();
      expect(
        screen.getByText(/habits you give an end date/i),
      ).toBeInTheDocument();
    });

    it('offers to clear a search that matches nothing', async () => {
      renderOverview([habit({ id: '1', name: 'Read' })]);
      const search = screen.getByRole('searchbox', { name: 'Search habits' });

      await userEvent.type(search, 'zzz');
      expect(screen.getByText('No habits match “zzz”')).toBeInTheDocument();

      await userEvent.click(
        screen.getByRole('button', { name: 'Clear search' }),
      );
      expect(search).toHaveValue('');
      expect(
        within(screen.getByRole('list', { name: 'Habits' })).getAllByRole(
          'listitem',
        ),
      ).toHaveLength(1);
    });
  });

  it('says there are no active habits, not no habits, when every habit is archived', async () => {
    renderOverview([
      habit({ id: '1', name: 'Read', endDate: '2026-11-10T00:00:00Z' }),
    ]);

    await userEvent.click(screen.getByRole('tab', { name: 'Active' }));

    expect(screen.getByText('No active habits')).toBeInTheDocument();
    expect(screen.queryByText('No habits yet')).not.toBeInTheDocument();
  });

  it('offers to try again when habits fail to load', async () => {
    const retry = vi.fn();
    vi.mocked(useAllHabits).mockReturnValue({
      habits: [],
      isLoading: false,
      error: new Error('Network error'),
      deleteHabit: vi.fn(),
      retry,
    } as unknown as ReturnType<typeof useAllHabits>);

    render(
      <MemoryRouter>
        <HabitsStateProvider>
          <HabitsOverview />
        </HabitsStateProvider>
      </MemoryRouter>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your habits could not be loaded',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalledTimes(1);
  });
});
