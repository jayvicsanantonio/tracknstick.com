// Covers how an achievement card reads: when it was earned, its palette, and no catalogue labels.
// Earned cards use the brand tokens; earnedAt is a UTC SQLite timestamp shown as its local calendar date.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import AchievementCard from '../AchievementCard';
import type { Achievement } from '../../types/Achievement';

const earned: Achievement = {
  id: '1',
  key: 'first_habit',
  name: 'First Step',
  description: 'Create your first habit',
  type: 'habit_creation',
  category: 'getting_started',
  requirementType: 'count',
  requirementValue: 1,
  isEarned: true,
  // 18:30 on 17 November in Los Angeles, as SQLite's CURRENT_TIMESTAMP writes it.
  earnedAt: '2026-11-18 02:30:00',
};

describe('AchievementCard', () => {
  it('marks an earned achievement as earned, once, with its date', () => {
    vi.stubEnv('TZ', 'UTC');
    render(<AchievementCard achievement={earned} />);

    expect(screen.getAllByText(/Earned/)).toHaveLength(1);
    expect(screen.getByText('Earned Nov 18, 2026')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('leaves out the catalogue category and type labels', () => {
    render(<AchievementCard achievement={earned} />);

    expect(screen.queryByText('Getting Started')).not.toBeInTheDocument();
    expect(screen.queryByText('Creation')).not.toBeInTheDocument();
  });

  it('styles an earned card with the brand palette only', () => {
    const { container } = render(<AchievementCard achievement={earned} />);

    expect(container.innerHTML).not.toMatch(/yellow|orange-50/);
  });

  it('styles an unearned card and its labels with the brand palette only', () => {
    const { container } = render(
      <AchievementCard
        achievement={{
          ...earned,
          type: 'streak',
          category: 'consistency',
          isEarned: false,
          earnedAt: undefined,
          progress: {
            achievementId: 1,
            isEarned: false,
            currentValue: 2,
            targetValue: 7,
            progressPercentage: 29,
          },
        }}
      />,
    );

    expect(container.innerHTML).not.toMatch(
      /\b(?:bg|text|from|to)-(?:blue|purple|orange|indigo|red|emerald|amber|cyan|teal|gray|green)-/,
    );
  });

  describe('west of UTC', () => {
    beforeEach(() => {
      vi.stubEnv('TZ', 'America/Los_Angeles');
    });

    afterEach(() => {
      vi.unstubAllEnvs();
    });

    it('shows the local date an achievement was earned on', () => {
      render(<AchievementCard achievement={earned} />);

      expect(screen.getByText('Earned Nov 17, 2026')).toBeInTheDocument();
    });
  });
});
