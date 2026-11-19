// Covers how an achievement card reads once earned.
// Earned cards use the app's own brand tokens, not a separate yellow-and-orange palette.

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import AchievementCard from '../AchievementCard';
import type { Achievement } from '../../types/Achievement';

const earned = {
  id: '1',
  key: 'first_step',
  name: 'First Step',
  description: 'Create your very first habit',
  type: 'habit_creation',
  category: 'getting_started',
  requirementType: 'count',
  requirementValue: 1,
  isEarned: true,
} satisfies Achievement;

describe('AchievementCard', () => {
  it('marks an earned achievement as earned', () => {
    render(<AchievementCard achievement={earned} />);

    expect(screen.getByText(/Earned/)).toBeInTheDocument();
  });

  it('styles an earned card with the brand palette only', () => {
    const { container } = render(<AchievementCard achievement={earned} />);

    expect(container.innerHTML).not.toMatch(/yellow|orange-50/);
  });
});
