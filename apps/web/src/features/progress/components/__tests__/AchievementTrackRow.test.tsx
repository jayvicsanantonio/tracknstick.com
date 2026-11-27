// Covers one track in the full achievement list: its medal, its level, the next target and what is left.
// The row opens to list every level, each earned on a date or still to reach.

import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementTrackRow from '../AchievementTrackRow';
import type { Achievement } from '../../types/Achievement';
import { groupAchievements } from '../../utils/achievementTracks';

const level = (
  key: string,
  name: string,
  requirementValue: number,
  overrides: Partial<Achievement> = {},
): Achievement => ({
  id: key,
  key,
  name,
  description: `Complete habits ${requirementValue} times`,
  type: 'completion',
  category: 'dedication',
  track: 'check_ins',
  requirementType: 'count',
  requirementValue,
  isEarned: false,
  ...overrides,
});

const earned = { isEarned: true, earnedAt: '2026-11-20 12:00:00' };
const at = (currentValue: number, targetValue: number) => ({
  progress: {
    achievementId: 0,
    isEarned: false,
    currentValue,
    targetValue,
    progressPercentage: (currentValue / targetValue) * 100,
  },
});

const checkIns = [
  level('completions_10', 'Getting Active', 10, earned),
  level('completions_25', 'Quarter Century', 25, earned),
  level('completions_50', 'Half Century', 50, at(40, 50)),
  level('completions_100', 'Century Club', 100, at(40, 100)),
];

function renderTrack(levels: Achievement[], currentStreak = 0) {
  const [group] = groupAchievements(levels).tracks;
  render(<AchievementTrackRow group={group} currentStreak={currentStreak} />);
}

describe('AchievementTrackRow', () => {
  it('shows the level reached, its medal, and the next target with what is left', () => {
    renderTrack(checkIns);

    const row = screen.getByRole('button', { name: /Check-ins/ });
    expect(row).toHaveTextContent('Level 2 of 4');
    expect(
      within(row).getByRole('img', { name: 'Silver medal' }),
    ).toBeVisible();
    expect(row).toHaveTextContent('Next: Half Century');
    expect(row).toHaveTextContent('40 / 50');
    expect(row).toHaveTextContent('10 more check-ins');
  });

  it('shows no medal before the first level is earned', () => {
    renderTrack([level('completions_10', 'Getting Active', 10, at(3, 10))]);

    expect(screen.getByRole('img', { name: 'No medal yet' })).toBeVisible();
    expect(screen.getByRole('button', { name: /Check-ins/ })).toHaveTextContent(
      'Level 0 of 1',
    );
  });

  it('says so once every level is earned', () => {
    renderTrack([level('completions_10', 'Getting Active', 10, earned)]);

    const row = screen.getByRole('button', { name: /Check-ins/ });
    expect(row).toHaveTextContent('Every level earned');
    expect(
      within(row).getByRole('img', { name: 'Platinum medal' }),
    ).toBeVisible();
  });

  it('opens to list every level, earned on a date or still to reach', async () => {
    renderTrack(checkIns);

    const row = screen.getByRole('button', { name: /Check-ins/ });
    expect(row).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('list', { name: 'Check-ins levels' })).toBeNull();

    await userEvent.click(row);

    expect(row).toHaveAttribute('aria-expanded', 'true');
    const levels = within(
      screen.getByRole('list', { name: 'Check-ins levels' }),
    ).getAllByRole('listitem');
    expect(levels.map((item) => item.querySelector('p')?.textContent)).toEqual([
      'Getting Active',
      'Quarter Century',
      'Half Century',
      'Century Club',
    ]);
    expect(levels[0]).toHaveTextContent(/Earned Nov 2\d, 2026/);
    expect(levels[2]).toHaveTextContent('40 / 50');
    expect(levels[3]).toHaveTextContent('Complete habits 100 times');
  });

  it('counts a streak from the streak running now', () => {
    renderTrack(
      [
        level('streak_3', 'On a Roll', 3, {
          type: 'streak',
          track: 'streak',
          ...earned,
        }),
        level('streak_7', 'Week Streak', 7, {
          type: 'streak',
          track: 'streak',
          ...at(3, 7),
        }),
      ],
      2,
    );

    expect(screen.getByRole('button', { name: /Streak/ })).toHaveTextContent(
      '5 more days in a row',
    );
  });

  it('colours the row with theme tokens, not fixed palette colours', async () => {
    const [group] = groupAchievements(checkIns).tracks;
    const { container } = render(
      <AchievementTrackRow group={group} currentStreak={0} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /Check-ins/ }));

    expect(container.innerHTML).not.toMatch(
      /\b(?:bg|text|from|to|ring)-(?:blue|purple|orange|indigo|red|emerald|amber|yellow|cyan|teal|gray|green|zinc|slate)-/,
    );
  });
});
