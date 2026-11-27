// Covers the Tracker's hint that checking off the habits still open would earn an achievement.
// It names the first active day, check-ins or perfect day within reach, the least effort first.

import { describe, it, expect } from 'vitest';
import type { Achievement } from '../../types/Achievement';
import { achievementHint } from '../achievementHint';

const level = (
  key: string,
  name: string,
  requirementValue: number,
  overrides: Partial<Achievement> = {},
): Achievement => ({
  id: key,
  key,
  name,
  description: 'Description',
  type: 'completion',
  category: 'dedication',
  track: 'check_ins',
  requirementType: 'count',
  requirementValue,
  isEarned: false,
  ...overrides,
});

const at = (currentValue: number, targetValue: number) => ({
  progress: {
    achievementId: 0,
    isEarned: false,
    currentValue,
    targetValue,
    progressPercentage: (currentValue / targetValue) * 100,
  },
});

const checkIns = (current: number) => [
  level('completions_25', 'Quarter Century', 25, { isEarned: true }),
  level('completions_50', 'Half Century', 50, at(current, 50)),
  level('completions_100', 'Century Club', 100, at(current, 100)),
];

/** A day on the Tracker: how many habits are done and left, and whether it is today. */
const day = (habitsLeft: number, doneCount = 0, isToday = true) => ({
  habitsLeft,
  doneCount,
  isToday,
});

const track = (
  key: string,
  name: string,
  track: Achievement['track'],
  current: number,
  target: number,
  overrides: Partial<Achievement> = {},
) =>
  level(key, name, target, {
    track,
    type: 'special_achievement',
    requirementType: 'days',
    ...at(current, target),
    ...overrides,
  });

describe('achievementHint', () => {
  it('names the next check-ins level when the check-ins left fit in the habits left', () => {
    expect(achievementHint(checkIns(48), day(3))).toBe(
      '2 more check-ins earn Half Century',
    );
    expect(achievementHint(checkIns(49), day(1, 2, false))).toBe(
      '1 more check-in earns Half Century',
    );
  });

  it('says nothing when the habits left cannot reach it', () => {
    expect(achievementHint(checkIns(40), day(3))).toBeNull();
  });

  it('says nothing once every habit is checked off', () => {
    expect(achievementHint(checkIns(49), day(0, 3))).toBeNull();
  });

  it('says nothing without a level to reach', () => {
    expect(achievementHint([], day(3))).toBeNull();
    expect(
      achievementHint(
        [level('completions_10', 'Getting Active', 10, { isEarned: true })],
        day(3),
      ),
    ).toBeNull();
  });

  it("names the next active-days level when today's first check-in earns it", () => {
    const monthlyActive = track(
      'active_30_days',
      'Monthly Active',
      'active_days',
      29,
      30,
    );

    expect(achievementHint([monthlyActive], day(2))).toBe(
      'Your first check-in today earns Monthly Active',
    );
    expect(achievementHint([monthlyActive], day(1, 1))).toBeNull();
    expect(achievementHint([monthlyActive], day(2, 0, false))).toBeNull();
  });

  it("names the next perfect-days level when finishing today's habits earns it", () => {
    const perfectMonth = track(
      'perfect_month',
      'Perfect Month',
      'perfect_days',
      29,
      30,
      { requirementData: { type: 'perfect_days' } },
    );

    expect(achievementHint([perfectMonth], day(2, 1))).toBe(
      '2 more habits today earn Perfect Month',
    );
    expect(achievementHint([perfectMonth], day(1, 2))).toBe(
      '1 more habit today earns Perfect Month',
    );
    expect(achievementHint([perfectMonth], day(2, 1, false))).toBeNull();
  });

  it('names the achievement that takes the least effort first', () => {
    const achievements = [
      ...checkIns(48),
      track('active_30_days', 'Monthly Active', 'active_days', 29, 30),
      track('perfect_month', 'Perfect Month', 'perfect_days', 29, 30),
    ];

    expect(achievementHint(achievements, day(3))).toBe(
      'Your first check-in today earns Monthly Active',
    );
    expect(achievementHint(achievements, day(2, 1))).toBe(
      '2 more check-ins earn Half Century',
    );
  });
});
