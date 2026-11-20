// Covers the tracker's date header: the day's name and a compact date that fits a small phone.
// Today reads "Today"; other days read their weekday.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DateProvider from '@app/providers/DateProvider';
import DailyHabitDate from '../DailyHabitDate';

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
    expect(screen.getByText('Nov 18, 2026')).toBeInTheDocument();
  });

  it('names another day by its weekday', async () => {
    renderDate();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous Date' }),
    );

    expect(
      screen.getByRole('heading', { name: 'Tuesday' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Nov 17, 2026')).toBeInTheDocument();
  });
});
