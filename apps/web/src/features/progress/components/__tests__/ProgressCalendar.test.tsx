// Covers how the progress calendar marks days: past days show their rate, today stands out.
// Future days carry no ring or percentage, so they never read as a missed "0%".

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ProgressCalendar from '../ProgressCalendar';

function renderCalendar() {
  render(
    <ProgressCalendar
      insightData={[{ date: '2026-11-17', completionRate: 33 }]}
      selectedMonth={new Date(2026, 10, 17)}
      setSelectedMonth={vi.fn()}
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

  it("shows today's completion and marks today as the current date", () => {
    renderCalendar();

    const today = screen.getByRole('gridcell', { name: 'Day 17' });
    expect(today).toHaveAttribute('aria-current', 'date');
    expect(within(today).getByText('33%')).toBeInTheDocument();
  });

  it('shows no percentage on a future day', () => {
    renderCalendar();

    const future = screen.getByRole('gridcell', { name: 'Day 20' });
    expect(future).not.toHaveAttribute('aria-current');
    expect(within(future).queryByText(/%/)).not.toBeInTheDocument();
  });

  it('still shows 0% on a past day with nothing completed', () => {
    renderCalendar();

    const past = screen.getByRole('gridcell', { name: 'Day 5' });
    expect(within(past).getByText('0%')).toBeInTheDocument();
  });
});
