// Covers the date an earned achievement card shows.
// The API sends earnedAt as a UTC SQLite timestamp; the card shows its local calendar date.

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
  beforeEach(() => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('shows the local date an achievement was earned on', () => {
    render(<AchievementCard achievement={earned} />);

    expect(
      screen.getByText(new Date(2026, 10, 17).toLocaleDateString()),
    ).toBeInTheDocument();
  });
});
