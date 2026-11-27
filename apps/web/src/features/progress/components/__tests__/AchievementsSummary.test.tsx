// Covers the achievements summary on the progress page: how many are earned and what is next.
// It lists the unearned achievements closest to being earned, says what is left of each, and opens the full list on request.

import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementsSummary from '../AchievementsSummary';
import type { Achievement } from '../../types/Achievement';

const achievement = (
  id: string,
  name: string,
  overrides: Partial<Achievement> = {},
): Achievement => ({
  id,
  key: id,
  name,
  description: `${name} description`,
  type: 'streak',
  category: 'consistency',
  requirementType: 'count',
  requirementValue: 7,
  isEarned: false,
  ...overrides,
});

const progress = (currentValue: number, targetValue: number) => ({
  progress: {
    achievementId: 0,
    isEarned: false,
    currentValue,
    targetValue,
    progressPercentage: Math.round((currentValue / targetValue) * 100),
  },
});

const achievements: Achievement[] = [
  achievement('1', 'First Step', {
    isEarned: true,
    earnedAt: '2026-11-01 10:00:00',
  }),
  achievement('2', 'Perfect Week', progress(5, 7)),
  achievement('3', 'On a Roll', progress(1, 3)),
  achievement('4', 'Perfect Month', progress(5, 30)),
  achievement('5', 'Century', progress(90, 100)),
];

const stats = {
  totalAchievements: 5,
  earnedAchievements: 1,
  completionPercentage: 20,
  categoryStats: {},
  recentAchievements: [],
};

function renderSummary(
  overrides: Partial<Parameters<typeof AchievementsSummary>[0]> = {},
) {
  const props = {
    achievements,
    stats,
    loading: false,
    error: null,
    isListOpen: false,
    onToggleList: vi.fn(),
    currentStreak: 0,
    onSelectNextUp: vi.fn(),
    newCount: 0,
    ...overrides,
  };
  render(<AchievementsSummary {...props} />);
  return props;
}

describe('AchievementsSummary', () => {
  it('reads how many achievements are earned', () => {
    renderSummary();

    expect(screen.getByText('1 of 5 earned')).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Achievements earned' }),
    ).toHaveAttribute('aria-valuenow', '20');
  });

  it('counts the achievements earned since the last visit', () => {
    renderSummary({ newCount: 2 });

    // On the fill dark enough, in the light theme, for small white text.
    expect(screen.getByText('2 new').className).toContain('color-brand-solid');
  });

  it('shows no new count when nothing is new', () => {
    renderSummary();

    expect(screen.queryByText(/ new$/)).not.toBeInTheDocument();
  });

  it('lists the three unearned achievements closest to being earned, closest first', () => {
    renderSummary();

    const nextUp = screen.getByRole('list', { name: 'Next up' });
    const names = within(nextUp)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('p')?.textContent);
    expect(names).toEqual(['Century', 'Perfect Week', 'On a Roll']);
    expect(within(nextUp).queryByText('First Step')).not.toBeInTheDocument();
    expect(within(nextUp).getByText('90 / 100')).toBeInTheDocument();
  });

  it('says what is left of each achievement next up', () => {
    renderSummary({
      achievements: [
        achievement('2', 'Half Century', {
          type: 'completion',
          ...progress(40, 50),
        }),
        achievement('3', 'Two Weeks Strong', progress(8, 14)),
      ],
      currentStreak: 2,
    });

    const nextUp = screen.getByRole('list', { name: 'Next up' });
    expect(within(nextUp).getByText('10 more check-ins')).toBeInTheDocument();
    expect(
      within(nextUp).getByText('12 more days in a row'),
    ).toBeInTheDocument();
  });

  it('asks for a new streak when none is running', () => {
    renderSummary({
      achievements: [achievement('3', 'Two Weeks Strong', progress(8, 14))],
      currentStreak: 0,
    });

    expect(screen.getByText('Start a streak today')).toBeInTheDocument();
  });

  it('goes to the Tracker when an achievement next up is tapped', async () => {
    const { onSelectNextUp } = renderSummary();

    await userEvent.click(screen.getByRole('button', { name: /^Century/ }));

    expect(onSelectNextUp).toHaveBeenCalledTimes(1);
  });

  it('lists only the next level of each track', () => {
    renderSummary({
      achievements: [
        achievement('2', 'Half Century', {
          type: 'completion',
          track: 'check_ins',
          requirementValue: 50,
          ...progress(40, 50),
        }),
        achievement('3', 'Century Club', {
          type: 'completion',
          track: 'check_ins',
          requirementValue: 100,
          ...progress(40, 100),
        }),
        achievement('4', 'Monthly Active', {
          track: 'active_days',
          requirementType: 'days',
          requirementValue: 30,
          ...progress(19, 30),
        }),
        achievement('5', 'Social Butterfly', progress(0, 20)),
      ],
    });

    const nextUp = screen.getByRole('list', { name: 'Next up' });
    const names = within(nextUp)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('p')?.textContent);
    expect(names).toEqual([
      'Half Century',
      'Monthly Active',
      'Social Butterfly',
    ]);
  });

  it('puts the easy first wins first when nothing has progress yet', () => {
    renderSummary({
      achievements: [
        achievement('2', 'Perfect Month', progress(0, 30)),
        achievement('3', 'Perfect Week', progress(0, 7)),
        achievement('4', 'Building Momentum', {
          category: 'getting_started',
          ...progress(0, 3),
        }),
        achievement('5', 'Getting Started', {
          category: 'getting_started',
          ...progress(0, 1),
        }),
      ],
    });

    const nextUp = screen.getByRole('list', { name: 'Next up' });
    const names = within(nextUp)
      .getAllByRole('listitem')
      .map((item) => item.querySelector('p')?.textContent);
    expect(names).toEqual([
      'Getting Started',
      'Building Momentum',
      'Perfect Week',
    ]);
  });

  it('says so when every achievement is earned', () => {
    renderSummary({
      achievements: [achievements[0]],
      stats: { ...stats, totalAchievements: 1, completionPercentage: 100 },
    });

    expect(screen.getByText('Every achievement earned.')).toBeInTheDocument();
    expect(
      screen.queryByRole('list', { name: 'Next up' }),
    ).not.toBeInTheDocument();
  });

  it('opens and closes the full list', async () => {
    const { onToggleList } = renderSummary();

    const toggle = screen.getByRole('button', { name: 'See all achievements' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(toggle);
    expect(onToggleList).toHaveBeenCalledTimes(1);
  });

  it('offers to hide the full list while it is open', () => {
    renderSummary({ isListOpen: true });

    expect(
      screen.getByRole('button', { name: 'Hide all achievements' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('shows that achievements are loading', () => {
    renderSummary({ loading: true, achievements: [], stats: null });

    expect(screen.getByText('Loading achievements…')).toBeInTheDocument();
  });

  it('shows an error when achievements cannot be loaded', () => {
    renderSummary({
      achievements: [],
      stats: null,
      error: 'Failed to load achievements. Please try again.',
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Failed to load achievements',
    );
  });
});
