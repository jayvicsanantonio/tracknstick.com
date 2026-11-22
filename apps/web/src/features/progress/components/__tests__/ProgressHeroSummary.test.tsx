// Covers the mobile All-Time Progress hero summary card: lifetime check-ins,
// all-time consistency meter, "Since" journey pill, and recessed 2x2 metrics matrix.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressHeroSummary from '../ProgressHeroSummary';

function renderHero(
  overrides: Partial<Parameters<typeof ProgressHeroSummary>[0]> = {},
) {
  const props = {
    totalCompletions: 148,
    overallCompletionRate: 82,
    activeDays: 46,
    perfectDays: 31,
    currentStreak: 5,
    longestStreak: 12,
    activeHabitsCount: 4,
    memberSince: '2026-05-12',
    isBestStreak: false,
    isLoading: false,
    ...overrides,
  };
  return render(<ProgressHeroSummary {...props} />);
}

describe('ProgressHeroSummary', () => {
  it('renders all lifetime metrics with accessible status labels', () => {
    renderHero();

    expect(screen.getByText('Since May 2026')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Total check-ins: 148 check-ins' }),
    ).toHaveTextContent('148check-ins');
    expect(screen.getByText('Tracking 4 active habits')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'All-time consistency: 82%' }),
    ).toHaveTextContent('82%');
    expect(
      screen.getByRole('status', { name: 'Current streak: 5 days' }),
    ).toHaveTextContent('5days');
    expect(
      screen.getByRole('status', { name: 'Longest streak: 12 days' }),
    ).toHaveTextContent('12days');
    expect(
      screen.getByRole('status', { name: 'Active days: 46 days' }),
    ).toHaveTextContent('46days');
    expect(
      screen.getByRole('status', { name: 'Perfect days: 31 days' }),
    ).toHaveTextContent('31days');
  });

  it('handles brand-new users, singular units, and best-streak badge cleanly', () => {
    renderHero({
      totalCompletions: 1,
      overallCompletionRate: null,
      activeDays: 1,
      perfectDays: 1,
      currentStreak: 1,
      longestStreak: 1,
      activeHabitsCount: 1,
      memberSince: null,
      isBestStreak: true,
    });

    expect(screen.getByText('Day 1')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Total check-ins: 1 check-in' }),
    ).toHaveTextContent('1check-in');
    expect(screen.getByText('Tracking 1 active habit')).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'All-time consistency: no data yet' }),
    ).toHaveTextContent('—');
    expect(
      screen.getByRole('status', { name: 'Current streak: 1 day, best yet' }),
    ).toHaveTextContent('Best yet');
    expect(
      screen.getByRole('status', { name: 'Active days: 1 day' }),
    ).toHaveTextContent('1day');
    expect(
      screen.getByRole('status', { name: 'Perfect days: 1 day' }),
    ).toHaveTextContent('1day');
  });

  it('shows loading placeholders without flashing stale numbers', () => {
    renderHero({
      totalCompletions: 0,
      overallCompletionRate: 0,
      activeDays: 0,
      perfectDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      isLoading: true,
    });

    expect(
      screen.getByRole('status', { name: 'Total check-ins: loading' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('status', { name: 'All-time consistency: loading' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('status', { name: 'Current streak: loading' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('status', { name: 'Active days: loading' }),
    ).toHaveAttribute('aria-busy', 'true');
    expect(screen.queryByText('0%')).not.toBeInTheDocument();
  });
});
