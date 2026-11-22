// Covers the progress page as a whole: the summary figures, and the calendar, chart and achievements together.
// A failed request shows an error, not an empty calendar that reads as "no progress".

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ProgressOverview from '../ProgressOverview';
import useProgressHistory from '../../hooks/useProgressHistory';
import useProgressSummary from '../../hooks/useProgressSummary';

vi.mock('../../hooks/useProgressHistory', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useProgressSummary', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({
    achievements: [],
    stats: {
      totalAchievements: 44,
      earnedAchievements: 3,
      completionPercentage: 7,
      categoryStats: {},
    },
    loading: false,
    error: null,
  }),
  useAchievementProgress: () => ({
    selectedCategory: 'all',
    setSelectedCategory: vi.fn(),
  }),
}));
// jsdom cannot lay out the chart; ProgressChart has tests of its own.
vi.mock('../ProgressChart', () => ({
  default: () => <div data-testid="progress-chart" />,
}));
vi.mock('../ProgressAchievements', () => ({
  default: () => <div data-testid="all-achievements" />,
}));

const loaded = {
  history: {
    historyData: [
      { date: '2026-11-03', completionRate: 0 },
      { date: '2026-11-02', completionRate: 50 },
      { date: '2026-11-01', completionRate: 100 },
    ],
    isLoading: false,
    error: undefined,
  },
  summary: {
    currentStreak: 2,
    longestStreak: 5,
    totalCompletions: 12,
    activeDays: 8,
    perfectDays: 5,
    overallCompletionRate: 75,
    activeHabitsCount: 2,
    memberSince: '2026-10-01',
    isLoading: false,
    error: undefined,
  },
};

function renderOverview() {
  render(
    <MemoryRouter>
      <ProgressOverview />
    </MemoryRouter>,
  );
}

describe('ProgressOverview', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 10, 17, 12));
    vi.mocked(useProgressHistory).mockReturnValue(loaded.history);
    vi.mocked(useProgressSummary).mockReturnValue(loaded.summary);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('sums up the streaks and the month in four figures', () => {
    renderOverview();

    expect(
      screen.getByRole('status', { name: 'Current streak: 2 days' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Longest streak: 5 days' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'November average: 50%' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Perfect days in November: 1 day' }),
    ).toBeInTheDocument();
  });

  it('has no average for a month with nothing scheduled', () => {
    vi.mocked(useProgressHistory).mockReturnValue({
      ...loaded.history,
      historyData: [],
    });

    renderOverview();

    expect(
      screen.getByRole('status', { name: 'November average: no data yet' }),
    ).toBeInTheDocument();
  });

  it('marks the current streak when it is the best yet', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      ...loaded.summary,
      currentStreak: 5,
      longestStreak: 5,
    });

    renderOverview();

    expect(
      screen.getByRole('status', { name: 'Current streak: 5 days, best yet' }),
    ).toBeInTheDocument();
  });

  it('does not mark a streak of nothing as the best yet', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      ...loaded.summary,
      currentStreak: 0,
      longestStreak: 0,
    });

    renderOverview();

    expect(
      screen.getByRole('status', { name: 'Current streak: 0 days' }),
    ).toBeInTheDocument();
  });

  it('shows no streak figures while the summary loads', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      ...loaded.summary,
      currentStreak: 0,
      longestStreak: 0,
      isLoading: true,
    });

    renderOverview();

    expect(
      screen.getByRole('status', { name: 'Current streak: loading' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Longest streak: loading' }),
    ).toBeInTheDocument();
  });

  it("keeps the calendar's grid on screen while a month's history loads", () => {
    vi.mocked(useProgressHistory).mockReturnValue({
      historyData: [],
      isLoading: true,
      error: undefined,
    });
    renderOverview();

    expect(
      screen.getByRole('heading', { name: 'November 2026' }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('gridcell')).toHaveLength(42);
    expect(
      screen.getByRole('gridcell', { name: 'Day 6: loading' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Loading chart' }),
    ).toBeInTheDocument();
  });

  it('shows the calendar, the chart and the achievements together, with no tabs', () => {
    renderOverview();

    expect(
      screen.getByRole('heading', { name: 'November 2026' }),
    ).toBeInTheDocument();
    expect(screen.getByTestId('progress-chart')).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Achievements' }),
    ).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  });

  it('opens the full achievement list from the summary', async () => {
    vi.useRealTimers();
    renderOverview();

    expect(screen.queryByTestId('all-achievements')).not.toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'See all achievements' }),
    );
    expect(screen.getByTestId('all-achievements')).toBeInTheDocument();
  });

  it('shows an error instead of the progress when the history fails to load', () => {
    vi.mocked(useProgressHistory).mockReturnValue({
      ...loaded.history,
      error: new Error('Network Error'),
    });

    renderOverview();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your progress could not be loaded',
    );
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('shows an error instead of the progress when the summary fails to load', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      ...loaded.summary,
      error: new Error('Network Error'),
    });

    renderOverview();

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Your progress could not be loaded',
    );
    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
  });

  it('has no back button, since the header navigation covers it', () => {
    renderOverview();

    expect(
      screen.queryByRole('button', { name: /back/i }),
    ).not.toBeInTheDocument();
  });
});
