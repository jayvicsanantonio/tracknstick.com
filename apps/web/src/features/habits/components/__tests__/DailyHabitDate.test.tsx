// Covers the tracker's date header: the day's name and a compact date that fits a small phone.
// Today reads "Today"; other days read their weekday, and double-tapping the date goes back to today.

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

  it('goes back to today when the date is double-tapped', async () => {
    renderDate();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous Date' }),
    );
    await userEvent.dblClick(screen.getByText(dateReading('Nov 17, 2026')));

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
  });

  it('stays on the day when the date is tapped once', async () => {
    renderDate();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous Date' }),
    );
    await userEvent.click(screen.getByText(dateReading('Nov 17, 2026')));

    expect(
      screen.getByRole('heading', { name: 'Tuesday' }),
    ).toBeInTheDocument();
  });

  it('shows no visible Today button on another day', async () => {
    renderDate();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous Date' }),
    );

    expect(
      screen.queryByRole('button', { name: 'Today' }),
    ).not.toBeInTheDocument();
  });

  it('gives screen readers on phones a way back to today', async () => {
    renderDate();

    expect(
      screen.queryByRole('button', { name: 'Go to today' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous Date' }),
    );
    const goToToday = screen.getByRole('button', { name: 'Go to today' });
    // Hidden from sight; tablets and desktops have Back to Today instead.
    expect(goToToday).toHaveClass('sr-only', 'sm:hidden');

    await userEvent.click(goToToday);

    expect(screen.getByRole('heading', { name: 'Today' })).toBeInTheDocument();
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
