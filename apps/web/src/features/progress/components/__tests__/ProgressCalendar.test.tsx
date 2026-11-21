// Covers the progress calendar: each past day's completion as a ring, with its percentage inside.
// Today stands out; a perfect day shows a check; nothing scheduled is not a missed 0%; future days have no rate.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProgressCalendar from '../ProgressCalendar';

function renderCalendar(setSelectedMonth = vi.fn()) {
  render(
    <ProgressCalendar
      insightData={[
        { date: '2026-11-17', completionRate: 33 },
        { date: '2026-11-05', completionRate: 0 },
        { date: '2026-11-04', completionRate: 100 },
      ]}
      selectedMonth={new Date(2026, 10, 17)}
      setSelectedMonth={setSelectedMonth}
    />,
  );
}

describe('ProgressCalendar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('names the month it shows', () => {
    renderCalendar();

    expect(
      screen.getByRole('heading', { name: 'November 2026' }),
    ).toBeInTheDocument();
  });

  it("marks today as the current date and reads today's completion", () => {
    renderCalendar();

    const today = screen.getByRole('gridcell', { name: /^Day 17/ });
    expect(today).toHaveAttribute('aria-current', 'date');
    expect(today).toHaveAccessibleName('Day 17: 33% completed');
  });

  it('reads a fully completed day and a day with nothing done', () => {
    renderCalendar();

    expect(
      screen.getByRole('gridcell', { name: 'Day 4: 100% completed' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: 'Day 5: 0% completed' }),
    ).toBeInTheDocument();
  });

  it('reads a past day with no habits due as nothing scheduled, not 0%', () => {
    renderCalendar();

    expect(
      screen.getByRole('gridcell', { name: 'Day 6: nothing scheduled' }),
    ).toBeInTheDocument();
  });

  it('gives a future day no rate', () => {
    renderCalendar();

    const future = screen.getByRole('gridcell', { name: 'Day 20' });
    expect(future).not.toHaveAttribute('aria-current');
    expect(within(future).queryByText(/%/)).not.toBeInTheDocument();
  });

  it("shows each past day's percentage inside its ring", () => {
    renderCalendar();

    const today = screen.getByRole('gridcell', { name: /^Day 17/ });
    expect(today).toHaveTextContent('17');
    expect(within(today).getByText('33%')).toBeInTheDocument();
    expect(
      within(screen.getByRole('gridcell', { name: /^Day 5/ })).getByText('0%'),
    ).toBeInTheDocument();
  });

  it('marks a perfect day with a check instead of 100%', () => {
    renderCalendar();

    const perfect = screen.getByRole('gridcell', { name: /^Day 4/ });
    expect(within(perfect).queryByText('100%')).not.toBeInTheDocument();
    expect(perfect.querySelector('svg.lucide-check')).not.toBeNull();
  });

  it('shows no percentage on a day with nothing scheduled', () => {
    renderCalendar();

    const unscheduled = screen.getByRole('gridcell', { name: /^Day 6/ });
    expect(within(unscheduled).queryByText(/%/)).not.toBeInTheDocument();
  });

  it('lays every month out in six weeks, so moving between months keeps its height', () => {
    // February 2026 fills four weeks exactly; August 2026 spans six.
    for (const month of [new Date(2026, 1, 1), new Date(2026, 7, 1)]) {
      const { unmount } = render(
        <ProgressCalendar
          insightData={[]}
          selectedMonth={month}
          setSelectedMonth={vi.fn()}
        />,
      );

      expect(screen.getAllByRole('gridcell')).toHaveLength(42);
      unmount();
    }
  });

  it('moves to the previous and next month', async () => {
    const setSelectedMonth = vi.fn();
    render(
      <ProgressCalendar
        insightData={[]}
        selectedMonth={new Date(2026, 7, 1)}
        setSelectedMonth={setSelectedMonth}
      />,
    );
    vi.useRealTimers();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous month' }),
    );
    await userEvent.click(screen.getByRole('button', { name: 'Next month' }));

    expect(setSelectedMonth).toHaveBeenCalledTimes(2);
  });

  it('does not move past the current month, which has nothing after it', () => {
    renderCalendar();

    expect(screen.getByRole('button', { name: 'Next month' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'This month' }),
    ).not.toBeInTheDocument();
  });

  it('offers a way back to this month from another month', async () => {
    const setSelectedMonth = vi.fn();
    render(
      <ProgressCalendar
        insightData={[]}
        selectedMonth={new Date(2026, 7, 1)}
        setSelectedMonth={setSelectedMonth}
      />,
    );

    expect(screen.getByRole('button', { name: 'Next month' })).toBeEnabled();
    vi.useRealTimers();
    await userEvent.click(screen.getByRole('button', { name: 'This month' }));

    expect(setSelectedMonth).toHaveBeenCalledTimes(1);
    const month = setSelectedMonth.mock.calls[0][0] as Date;
    expect(month.getFullYear()).toBe(new Date().getFullYear());
    expect(month.getMonth()).toBe(new Date().getMonth());
  });
});
