// Covers what the celebration says about a newly earned achievement: its medal, its level, and the next target.
// A badge has no level; the top level of a track has no next target.

import { describe, it, expect } from 'vitest';
import type { Achievement } from '../../types/Achievement';
import { describeCelebration } from '../achievementCelebration';

const level = (
  key: string,
  name: string,
  requirementValue: number,
  overrides: Partial<Achievement> = {},
): Achievement => ({
  id: key,
  key,
  name,
  description: `${name} description`,
  type: 'completion',
  category: 'dedication',
  track: 'check_ins',
  requirementType: 'count',
  requirementValue,
  isEarned: false,
  ...overrides,
});

const checkIns = [
  level('completions_10', 'Getting Active', 10, { isEarned: true }),
  level('completions_25', 'Quarter Century', 25, { isEarned: true }),
  level('completions_50', 'Half Century', 50, { isEarned: true }),
  level('completions_100', 'Century Club', 100, {
    progress: {
      achievementId: 0,
      isEarned: false,
      currentValue: 50,
      targetValue: 100,
      progressPercentage: 50,
    },
  }),
];

describe('describeCelebration', () => {
  it('names the level reached on its track, its medal, and the next target', () => {
    expect(describeCelebration('completions_50', checkIns, 0)).toEqual({
      medal: 'gold',
      level: 'Level 3 of 4 on your check-ins track',
      next: checkIns[3],
      remaining: '50 more check-ins',
    });
  });

  it('names the next level not yet earned, past any earned in the same check', () => {
    // One check earned Getting Active, Quarter Century and Half Century.
    expect(describeCelebration('completions_10', checkIns, 0)).toEqual({
      medal: 'bronze',
      level: 'Level 1 of 4 on your check-ins track',
      next: checkIns[3],
      remaining: '50 more check-ins',
    });
  });

  it('names no next target when every later level is earned too', () => {
    const allEarned = checkIns.map((level) => ({ ...level, isEarned: true }));

    expect(describeCelebration('completions_25', allEarned, 0)).toEqual({
      medal: 'silver',
      level: 'Level 2 of 4 on your check-ins track',
      next: undefined,
      remaining: null,
    });
  });

  it('has no next target at the top of a track', () => {
    expect(describeCelebration('completions_100', checkIns, 0)).toEqual({
      medal: 'platinum',
      level: 'The top of your check-ins track',
      next: undefined,
      remaining: null,
    });
  });

  it('calls a one-off achievement a badge', () => {
    const badge = level('maximalist', 'Maximalist', 10, { track: undefined });

    expect(describeCelebration('maximalist', [badge], 0)).toEqual({
      medal: 'gold',
      level: 'Badge earned',
      next: undefined,
      remaining: null,
    });
  });

  it('still celebrates before the achievement list has loaded', () => {
    expect(describeCelebration('completions_50', [], 0)).toEqual({
      medal: 'gold',
      level: null,
      next: undefined,
      remaining: null,
    });
  });
});
