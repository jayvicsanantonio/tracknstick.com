// Covers the progress page as a whole: the summary figures, and the calendar, chart and achievements together.
// A failed request shows an error, not an empty calendar that reads as "no progress".

import { useState } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProgressOverview from '../ProgressOverview';
import { DateContext, type DateContextProps } from '@app/providers/DateContext';
import type { Achievement } from '../../types/Achievement';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useHideSplash } from '@shared/hooks/useHideSplash';
import useProgressHistory from '../../hooks/useProgressHistory';
import useProgressSummary from '../../hooks/useProgressSummary';

vi.mock('../../hooks/useProgressHistory', () => ({ default: vi.fn() }));
vi.mock('../../hooks/useProgressSummary', () => ({ default: vi.fn() }));
const mockAchievements = vi.hoisted(() => ({ list: [] as Achievement[] }));
vi.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({
    achievements: mockAchievements.list,
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
      <HabitsStateProvider>
        <ProgressOverview />
      </HabitsStateProvider>
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
    mockAchievements.list = [];
  });

  it('shows the all-time lifetime progress hero summary across viewports', () => {
    renderOverview();

    expect(
      screen.getByRole('status', { name: 'Total check-ins: 12 check-ins' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'All-time consistency: 75%' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Current streak: 2 days' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Longest streak: 5 days' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Active days: 8 days' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Perfect days: 5 days' }),
    ).toBeInTheDocument();
  });

  it('shows no data yet for consistency when there is no history yet', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      ...loaded.summary,
      overallCompletionRate: null,
    });

    renderOverview();

    expect(
      screen.getByRole('status', { name: 'All-time consistency: no data yet' }),
    ).toBeInTheDocument();
  });

  describe('before the first check-in', () => {
    const fresh = {
      ...loaded.summary,
      currentStreak: 0,
      longestStreak: 0,
      totalCompletions: 0,
      activeDays: 0,
      perfectDays: 0,
      overallCompletionRate: null,
    };

    it('invites a user with no habits to add one, in place of a summary of zeros', () => {
      vi.mocked(useProgressSummary).mockReturnValue({
        ...fresh,
        activeHabitsCount: 0,
      });

      renderOverview();

      expect(
        screen.getByRole('heading', { name: 'Your progress shows up here' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Add habit' }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('region', { name: 'All-time progress summary' }),
      ).not.toBeInTheDocument();
    });

    it('points a user with habits to the Tracker for their first check-in', () => {
      vi.mocked(useProgressSummary).mockReturnValue({
        ...fresh,
        activeHabitsCount: 2,
      });

      renderOverview();

      expect(
        screen.getByRole('heading', { name: 'Check off your first habit' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: 'Go to Tracker' }),
      ).toHaveAttribute('href', '/');
    });

    it('keeps the summary while it loads, so the prompt never flashes', () => {
      vi.mocked(useProgressSummary).mockReturnValue({
        ...fresh,
        activeHabitsCount: 0,
        isLoading: true,
      });

      renderOverview();

      expect(
        screen.queryByRole('heading', { name: 'Your progress shows up here' }),
      ).not.toBeInTheDocument();
      expect(
        screen.getByRole('region', { name: 'All-time progress summary' }),
      ).toBeInTheDocument();
    });
  });

  it('tells the calendar which days came before the user started', () => {
    vi.mocked(useProgressSummary).mockReturnValue({
      ...loaded.summary,
      memberSince: '2026-11-10',
    });

    renderOverview();

    expect(
      screen.getByRole('gridcell', { name: 'Day 9: before you started' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('gridcell', { name: 'Day 10: nothing scheduled' }),
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

  it('on a phone, shows the achievements right after the all-time summary', () => {
    const desktop = vi.mocked(window.matchMedia).getMockImplementation();
    vi.mocked(window.matchMedia).mockImplementation(
      (query: string) =>
        ({
          matches: query === '(max-width: 639px)',
          media: query,
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
        }) as unknown as MediaQueryList,
    );
    renderOverview();

    const achievements = screen.getByRole('heading', { name: 'Achievements' });
    const calendar = screen.getByRole('heading', { name: 'November 2026' });
    expect(
      achievements.compareDocumentPosition(calendar) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    vi.mocked(window.matchMedia).mockImplementation(desktop!);
  });

  it('opens the Tracker on today when an achievement next up is tapped', async () => {
    vi.useRealTimers();
    mockAchievements.list = [
      {
        id: '1',
        key: 'completions_50',
        name: 'Half Century',
        description: 'Complete habits 50 times',
        type: 'completion',
        category: 'dedication',
        requirementType: 'count',
        requirementValue: 50,
        isEarned: false,
        progress: {
          achievementId: 1,
          isEarned: false,
          currentValue: 40,
          targetValue: 50,
          progressPercentage: 80,
        },
      },
    ];
    const setDate = vi.fn<(day: Date) => void>();
    render(
      <DateContext.Provider value={{ setDate } as unknown as DateContextProps}>
        <MemoryRouter initialEntries={['/progress']}>
          <HabitsStateProvider>
            <Routes>
              <Route path="/progress" element={<ProgressOverview />} />
              <Route path="/" element={<p>Tracker</p>} />
            </Routes>
          </HabitsStateProvider>
        </MemoryRouter>
      </DateContext.Provider>,
    );

    expect(screen.getByText('10 more check-ins')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: /^Half Century/ }),
    );

    expect(screen.getByText('Tracker')).toBeInTheDocument();
    const [day] = setDate.mock.calls[0];
    expect(day.toDateString()).toBe(new Date().toDateString());
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

  it('holds the launch splash while progress loads, then lets it fade', async () => {
    function AppReady() {
      useHideSplash(true);
      return null;
    }

    const splash = document.createElement('div');
    splash.id = 'splash';
    document.body.append(splash);

    try {
      let finishSummary: () => void = () => undefined;
      vi.mocked(useProgressSummary).mockImplementation(() => {
        const [isLoading, setIsLoading] = useState(true);
        finishSummary = () => setIsLoading(false);
        return { ...loaded.summary, isLoading };
      });
      render(
        <MemoryRouter>
          <HabitsStateProvider>
            <AppReady />
            <ProgressOverview />
          </HabitsStateProvider>
        </MemoryRouter>,
      );
      await act(() => Promise.resolve());
      expect(splash).not.toHaveClass('splash-done');

      act(() => {
        finishSummary();
      });
      await act(() => Promise.resolve());
      expect(splash).toHaveClass('splash-done');
    } finally {
      splash.remove();
    }
  });
});
