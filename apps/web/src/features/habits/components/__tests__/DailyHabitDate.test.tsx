// Covers the tracker's date header: the day's name and a compact date that fits a small phone.
// Today reads "Today"; other days read their weekday.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateProvider from '@app/providers/DateProvider';
import DailyHabitDate from '../DailyHabitDate';

/** Finds the date by its whole text, which spans the year's own element. */
function dateReading(text: string) {
  return (_: string, element: Element | null) =>
    element?.tagName === 'SPAN' && element.textContent === text;
}

function renderDate() {
  render(
    <DateProvider>
      <DailyHabitDate />
    </DateProvider>,
  );
}

describe('DailyHabitDate', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 18, 12));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('shows "Today" and a compact date', () => {
    renderDate();

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
    expect(screen.getByText(dateReading('Nov 18, 2026'))).toBeInTheDocument();
  });

  it('names another day by its weekday', async () => {
    renderDate();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous Date' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Tuesday' }),
    ).toBeInTheDocument();
    expect(screen.getByText(dateReading('Nov 17, 2026'))).toBeInTheDocument();
  });

  it("shows the year once midnight makes the day shown last year's", () => {
    vi.useFakeTimers({ toFake: ['Date', 'setTimeout'] });
    vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 59));
    renderDate();

    // This year's year is left out on phones.
    expect(screen.getByText(', 2026')).toHaveClass('max-sm:hidden');

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(screen.getByText(', 2026')).not.toHaveClass('max-sm:hidden');
  });
});
