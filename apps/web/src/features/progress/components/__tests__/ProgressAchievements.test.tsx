// Covers the full achievement list: one row per track, then the one-off achievements as badges.
// There are no category tabs: the tracks are the grouping.

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import ProgressAchievements from '../ProgressAchievements';
import type { Achievement } from '../../types/Achievement';

const achievement = (
  key: string,
  name: string,
  overrides: Partial<Achievement> = {},
): Achievement => ({
  id: key,
  key,
  name,
  description: `${name} description`,
  type: 'completion',
  category: 'dedication',
  requirementType: 'count',
  requirementValue: 1,
  isEarned: false,
  ...overrides,
});

const progress = (currentValue: number, targetValue: number) => ({
  progress: {
    achievementId: 0,
    isEarned: false,
    currentValue,
    targetValue,
    progressPercentage: (currentValue / targetValue) * 100,
  },
});

const achievements: Achievement[] = [
  achievement('streak_3', 'On a Roll', {
    type: 'streak',
    track: 'streak',
    requirementValue: 3,
    isEarned: true,
    earnedAt: '2026-11-20 12:00:00',
  }),
  achievement('completions_10', 'Getting Active', {
    track: 'check_ins',
    requirementValue: 10,
    ...progress(4, 10),
  }),
  achievement('social_butterfly', 'Social Butterfly', {
    type: 'special_achievement',
    description: 'Add notes to habit completions 20 times',
    ...progress(0, 20),
  }),
  achievement('early_bird', 'Early Bird', {
    type: 'special_achievement',
    isEarned: true,
    earnedAt: '2026-11-21 12:00:00',
  }),
];

describe('ProgressAchievements', () => {
  it('lists one row per track, in the tracks order', () => {
    render(
      <ProgressAchievements achievements={achievements} currentStreak={0} />,
    );

    const tracks = within(screen.getByRole('list', { name: 'Tracks' }))
      .getAllByRole('button')
      .map((row) => row.textContent);
    expect(tracks[0]).toMatch(/^Check-ins/);
    expect(tracks[1]).toMatch(/^Streak/);
    expect(tracks).toHaveLength(2);
  });

  it('lists one-off achievements as badges, earned first', () => {
    render(
      <ProgressAchievements achievements={achievements} currentStreak={0} />,
    );

    const badges = within(
      screen.getByRole('list', { name: 'Badges' }),
    ).getAllByRole('listitem');
    expect(
      badges.map((badge) => badge.querySelector('p')?.textContent),
    ).toEqual(['Early Bird', 'Social Butterfly']);
    expect(badges[0]).toHaveTextContent(/Earned Nov 2\d, 2026/);
    expect(badges[1]).toHaveTextContent('0 / 20');
    expect(badges[1]).toHaveTextContent(
      'Add notes to habit completions 20 times',
    );
  });

  it('has no category tabs', () => {
    render(
      <ProgressAchievements achievements={achievements} currentStreak={0} />,
    );

    expect(
      screen.queryByRole('button', { name: /Getting Started/ }),
    ).not.toBeInTheDocument();
  });

  it('says so when there are no achievements to show', () => {
    render(<ProgressAchievements achievements={[]} currentStreak={0} />);

    expect(screen.getByText('No achievements to show')).toBeInTheDocument();
  });
});
