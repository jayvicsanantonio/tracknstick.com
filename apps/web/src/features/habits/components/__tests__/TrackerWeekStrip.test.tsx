// Covers the desktop & tablet 7-day weekly overview strip on the Daily Tracker:
// renders Sunday–Saturday rings, overlays live completion for the active day,
// jumps to any clicked day, and links to the full progress calendar.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { DateContext } from '@app/providers/DateContext';
import TrackerWeekStrip from '../TrackerWeekStrip';
import { useWeekProgressHistory } from '@/features/habits/hooks/useWeekProgressHistory';
import { buildWeekDays } from '@/features/habits/hooks/useWeekProgressHistory';

vi.mock('@/features/habits/hooks/useWeekProgressHistory', async () => {
  const actual = await vi.importActual<
    typeof import('@/features/habits/hooks/useWeekProgressHistory')
  >('@/features/habits/hooks/useWeekProgressHistory');
  return {
    ...actual,
    useWeekProgressHistory: vi.fn(),
  };
});

describe('TrackerWeekStrip', () => {
  const setDate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  function renderStrip({
    selectedDate = new Date(2026, 10, 25, 12), // Wed Nov 25, 2026
    currentDate = new Date(2026, 10, 25, 12),
    rates = new Map<string, number>([
      ['2026-11-22', 100],
      ['2026-11-23', 50],
      ['2026-11-24', 0],
    ]),
    selectedDayRate = 75,
    isSelectedDayLoading = false,
  }: {
    selectedDate?: Date;
    currentDate?: Date;
    rates?: Map<string, number>;
    selectedDayRate?: number | null;
    isSelectedDayLoading?: boolean;
  } = {}) {
    const timeZone = 'UTC';
    const days = buildWeekDays(selectedDate, currentDate, timeZone);

    vi.mocked(useWeekProgressHistory).mockReturnValue({
      days,
      rateByDate: rates,
      isLoading: false,
      error: undefined,
    });

    return render(
      <MemoryRouter>
        <DateContext.Provider
          value={{
            date: selectedDate,
            currentDate,
            setDate,
            handlePreviousDate: vi.fn(),
            handleNextDate: vi.fn(),
            timeZone,
          }}
        >
          <TrackerWeekStrip
            selectedDayRate={selectedDayRate}
            isSelectedDayLoading={isSelectedDayLoading}
          />
        </DateContext.Provider>
      </MemoryRouter>,
    );
  }

  it('renders 7 days with live progress overlaid on the active day and links to /progress', () => {
    renderStrip({ selectedDayRate: 75 });

    expect(screen.getByText('This Week')).toBeInTheDocument();
    expect(screen.getByText('Nov 22 – 28')).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /view full calendar/i });
    expect(link).toHaveAttribute('href', '/progress');

    expect(
      screen.getByRole('button', { name: 'Sun 22: 100% completed' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Mon 23: 50% completed' }),
    ).toBeInTheDocument();

    const todayBtn = screen.getByRole('button', {
      name: 'Wed 25: 75% completed',
    });
    expect(todayBtn).toHaveAttribute('aria-pressed', 'true');
    expect(todayBtn).toHaveAttribute('aria-current', 'date');
  });

  it('navigates directly to a clicked day in the week', async () => {
    renderStrip();

    await userEvent.click(
      screen.getByRole('button', { name: 'Mon 23: 50% completed' }),
    );

    expect(setDate).toHaveBeenCalledTimes(1);
    const chosenDate = setDate.mock.calls[0][0] as Date;
    expect(chosenDate.getFullYear()).toBe(2026);
    expect(chosenDate.getMonth()).toBe(10);
    expect(chosenDate.getDate()).toBe(23);
  });

  it('formats cross-month weeks cleanly and labels non-current weeks', () => {
    renderStrip({
      selectedDate: new Date(2026, 11, 2, 12), // Wed Dec 2, 2026 (Sun Nov 29 – Sat Dec 5)
      currentDate: new Date(2026, 10, 22, 12), // Sun Nov 22, 2026
      rates: new Map(),
      selectedDayRate: null,
    });

    expect(screen.getByText('Selected Week')).toBeInTheDocument();
    expect(screen.getByText('Nov 29 – Dec 5')).toBeInTheDocument();
  });
});
