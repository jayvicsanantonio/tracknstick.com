// Covers the sheet that celebrates newly earned achievements, one at a time, with the next target.
// It shows nothing until an achievement is earned, and closes once the last one is seen.

import { describe, it, expect, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AchievementCelebration from '../AchievementCelebration';
import { HabitsStateProvider } from '@/features/habits/context/HabitsStateContext';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import type { Achievement } from '../../types/Achievement';
import type { HabitsStateContextValue } from '@/features/habits/context/HabitsStateContextDefinition';

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
  isEarned: true,
  ...overrides,
});

const achievements = vi.hoisted(() => ({ list: [] as Achievement[] }));
vi.mock('../../hooks/useAchievements', () => ({
  useAchievements: () => ({ achievements: achievements.list }),
}));
vi.mock('../../hooks/useProgressSummary', () => ({
  default: () => ({ currentStreak: 0 }),
}));

achievements.list = [
  level('completions_25', 'Quarter Century', 25),
  level('completions_50', 'Half Century', 50),
  level('completions_100', 'Century Club', 100, {
    isEarned: false,
    progress: {
      achievementId: 0,
      isEarned: false,
      currentValue: 50,
      targetValue: 100,
      progressPercentage: 50,
    },
  }),
  level('maximalist', 'Maximalist', 10, {
    track: undefined,
    description: 'Complete 10+ habits in a single day',
  }),
];

const awarded = (key: string, name: string) => ({
  id: key,
  key,
  name,
  description: `${name} description`,
  type: 'completion' as const,
  category: 'dedication' as const,
});

function renderCelebration() {
  let context: HabitsStateContextValue | undefined;
  function Capture() {
    context = useHabitsContext();
    return null;
  }
  render(
    <HabitsStateProvider>
      <Capture />
      <AchievementCelebration />
    </HabitsStateProvider>,
  );
  return () => context!;
}

describe('AchievementCelebration', () => {
  it('shows nothing until an achievement is earned', () => {
    renderCelebration();

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('celebrates each new achievement in turn, then closes', async () => {
    const context = renderCelebration();

    act(() =>
      context().celebrateAchievements([
        awarded('completions_50', 'Half Century'),
        awarded('maximalist', 'Maximalist'),
      ]),
    );

    const first = screen.getByRole('dialog', { name: 'Half Century' });
    expect(first).toHaveTextContent('Level 2 of 3 on your check-ins track');
    expect(first).toHaveTextContent('Next: Century Club');
    expect(first).toHaveTextContent('50 more check-ins');
    expect(screen.getByRole('img', { name: 'Gold medal' })).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Next achievement' }),
    );

    const second = screen.getByRole('dialog', { name: 'Maximalist' });
    expect(second).toHaveTextContent('Badge earned');

    await userEvent.click(screen.getByRole('button', { name: 'Keep going' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(context().achievementCelebrations).toEqual([]);
  });
});
