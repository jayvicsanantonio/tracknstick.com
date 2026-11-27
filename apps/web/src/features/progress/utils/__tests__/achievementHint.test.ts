// Covers the Tracker's hint that checking off the habits still open would earn the next check-ins level.
// It appears only when the check-ins left fit within the habits left to check off.

import { describe, it, expect } from 'vitest';
import type { Achievement } from '../../types/Achievement';
import { checkInHint } from '../achievementHint';

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

describe('checkInHint', () => {
  it('names the next level when the check-ins left fit in the habits left', () => {
    expect(checkInHint(checkIns(48), 3)).toBe(
      '2 more check-ins earn Half Century',
    );
    expect(checkInHint(checkIns(49), 1)).toBe(
      '1 more check-in earns Half Century',
    );
  });

  it('says nothing when the habits left cannot reach it', () => {
    expect(checkInHint(checkIns(40), 3)).toBeNull();
  });

  it('says nothing once every habit is checked off', () => {
    expect(checkInHint(checkIns(49), 0)).toBeNull();
  });

  it('says nothing without a check-ins level to reach', () => {
    expect(checkInHint([], 3)).toBeNull();
    expect(
      checkInHint(
        [level('completions_10', 'Getting Active', 10, { isEarned: true })],
        3,
      ),
    ).toBeNull();
  });
});
