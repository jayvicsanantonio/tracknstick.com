// Covers the mobile Progress hero summary card: monthly completion ring,
// contextual narrative, perfect-days pill, and dual-streak tray.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ThemeProvider from '@app/providers/ThemeProvider';
import ProgressHeroSummary from '../ProgressHeroSummary';

function renderHero(
  overrides: Partial<Parameters<typeof ProgressHeroSummary>[0]> = {},
) {
  const props = {
    monthName: 'November',
    averageRate: 78,
    perfectDays: 4,
    currentStreak: 5,
    longestStreak: 12,
    isBestStreak: false,
    isHistoryLoading: false,
    isStreaksLoading: false,
    ...overrides,
  };
  return render(
    <ThemeProvider>
      <ProgressHeroSummary {...props} />
    </ThemeProvider>,
  );
}

describe('ProgressHeroSummary', () => {
  it('exposes all four progress figures with accessible status labels', () => {
    renderHero();

    expect(
      screen.getByRole('status', { name: 'November average: 78%' }),
    ).toHaveTextContent('78%');
    expect(
      screen.getByRole('status', { name: 'Perfect days in November: 4 days' }),
    ).toHaveTextContent('4 perfect days');
    expect(
      screen.getByRole('status', { name: 'Current streak: 5 days' }),
    ).toHaveTextContent('5days');
    expect(
      screen.getByRole('status', { name: 'Longest streak: 12 days' }),
    ).toHaveTextContent('12days');
    expect(screen.getByText('Steady progress')).toBeInTheDocument();
  });

  it('handles empty months and singular day units cleanly', () => {
    renderHero({
      averageRate: null,
      perfectDays: 1,
      currentStreak: 1,
      longestStreak: 1,
      isBestStreak: true,
    });

    expect(
      screen.getByRole('status', { name: 'November average: no data yet' }),
    ).toHaveTextContent('No data');
    expect(screen.getByText('No habits logged')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Perfect days in November: 1 day' }),
    ).toHaveTextContent('1 perfect day');
    expect(
      screen.getByRole('status', { name: 'Current streak: 1 day, best yet' }),
    ).toHaveTextContent('Best yet');
  });

  it('shows loading placeholders without flashing stale numbers', () => {
    renderHero({
      averageRate: 0,
      perfectDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      isHistoryLoading: true,
      isStreaksLoading: true,
    });

    expect(
      screen.getByRole('status', { name: 'November average: loading' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('status', { name: 'Current streak: loading' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
