// Covers the full achievement list: earned ones, those under way, and those not started, each under its own heading.
// An achievement with nothing done toward it reads as not started, not as in progress.
// Earned ones list newest first, and those under way list closest to earned first.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressAchievements from '../ProgressAchievements';
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

describe('ProgressAchievements', () => {
  it('lists earned, in-progress and not-started achievements under their own headings', () => {
    render(
      <ProgressAchievements
        achievements={[
          achievement('1', 'First Step', {
            isEarned: true,
            earnedAt: '2026-11-01 10:00:00',
          }),
          achievement('2', 'Perfect Week', progress(3, 7)),
          achievement('3', 'Perfect Month', progress(0, 30)),
          achievement('4', 'Century'),
        ]}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Earned (1)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'In Progress (1)' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Not Started (2)' }),
    ).toBeInTheDocument();
  });

  it('has no In Progress heading when nothing has been started', () => {
    render(
      <ProgressAchievements
        achievements={[achievement('3', 'Perfect Month', progress(0, 30))]}
      />,
    );

    expect(
      screen.queryByRole('heading', { name: /In Progress/ }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Not Started (1)' }),
    ).toBeInTheDocument();
  });

  it('lists earned achievements newest first', () => {
    render(
      <ProgressAchievements
        achievements={[
          achievement('1', 'First Step', {
            isEarned: true,
            earnedAt: '2026-11-01 10:00:00',
          }),
          achievement('2', 'Week Streak', {
            isEarned: true,
            earnedAt: '2026-11-21 10:00:00',
          }),
          achievement('3', 'On a Roll', {
            isEarned: true,
            earnedAt: '2026-11-20 10:00:00',
          }),
        ]}
      />,
    );

    expect(
      screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent),
    ).toEqual(['Week Streak', 'On a Roll', 'First Step']);
  });

  it('lists achievements under way closest to earned first', () => {
    render(
      <ProgressAchievements
        achievements={[
          achievement('1', 'Centurion', progress(8, 100)),
          achievement('2', 'Half Century', progress(40, 50)),
          achievement('3', 'Monthly Active', progress(19, 30)),
        ]}
      />,
    );

    expect(
      screen.getAllByRole('heading', { level: 4 }).map((h) => h.textContent),
    ).toEqual(['Half Century', 'Monthly Active', 'Centurion']);
  });
});
