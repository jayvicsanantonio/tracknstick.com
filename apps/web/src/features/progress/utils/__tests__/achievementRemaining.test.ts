// Covers the line that says what is left to earn an achievement, in the words of what it counts.
// Streaks depend on the streak running now, since only an unbroken run can reach the target.

import { describe, it, expect } from 'vitest';
import type { Achievement } from '../../types/Achievement';
import { describeRemaining } from '../achievementRemaining';

const achievement = (
  overrides: Partial<Achievement>,
  currentValue: number,
  targetValue: number,
): Achievement => ({
  id: '1',
  key: 'key',
  name: 'Name',
  description: 'Description',
  type: 'completion',
  category: 'dedication',
  requirementType: 'count',
  requirementValue: targetValue,
  isEarned: false,
  progress: {
    achievementId: 1,
    isEarned: false,
    currentValue,
    targetValue,
    progressPercentage: (currentValue / targetValue) * 100,
  },
  ...overrides,
});

describe('describeRemaining', () => {
  it('counts the check-ins left', () => {
    expect(describeRemaining(achievement({}, 40, 50), 0)).toBe(
      '10 more check-ins',
    );
    expect(describeRemaining(achievement({}, 49, 50), 0)).toBe(
      '1 more check-in',
    );
  });

  it('counts the habits left to add', () => {
    expect(
      describeRemaining(achievement({ type: 'habit_creation' }, 3, 5), 0),
    ).toBe('2 more habits');
  });

  it('counts the active days left', () => {
    expect(
      describeRemaining(
        achievement(
          { type: 'special_achievement', requirementType: 'days' },
          19,
          30,
        ),
        0,
      ),
    ).toBe('11 more active days');
  });

  it('counts the perfect days left', () => {
    expect(
      describeRemaining(
        achievement(
          {
            type: 'special_achievement',
            requirementType: 'days',
            requirementData: { type: 'perfect_days' },
          },
          15,
          30,
        ),
        0,
      ),
    ).toBe('15 more perfect days');
  });

  it('counts the notes left to add', () => {
    expect(
      describeRemaining(
        achievement(
          {
            type: 'special_achievement',
            requirementData: { type: 'notes_added' },
          },
          0,
          20,
        ),
        0,
      ),
    ).toBe('20 more notes');
  });

  it('says how many habits to do in one day, and the best so far', () => {
    expect(
      describeRemaining(
        achievement(
          {
            type: 'special_achievement',
            requirementData: { type: 'single_day_completions' },
          },
          3,
          10,
        ),
        0,
      ),
    ).toBe('10 habits in one day, best so far 3');
  });

  it('counts the days left in the streak running now', () => {
    expect(describeRemaining(achievement({ type: 'streak' }, 8, 14), 2)).toBe(
      '12 more days in a row',
    );
  });

  it('asks for a new streak when none is running', () => {
    expect(describeRemaining(achievement({ type: 'streak' }, 8, 14), 0)).toBe(
      'Start a streak today',
    );
  });

  it('says nothing when there is no progress to measure', () => {
    expect(
      describeRemaining({ ...achievement({}, 0, 1), progress: undefined }, 0),
    ).toBeNull();
  });

  it('says nothing when the target is already reached but not yet awarded', () => {
    expect(describeRemaining(achievement({}, 50, 50), 0)).toBeNull();
    expect(describeRemaining(achievement({ type: 'streak' }, 3, 7), 7)).toBe(
      null,
    );
  });

  it.each([
    ['early_morning', 3, 7, '4 more days before 8 AM'],
    ['late_night', 6, 7, '1 more day at 10 PM or later'],
    ['weekend_only', 5, 8, '3 more weekend days'],
  ])('counts the %s days left', (type, current, target, expected) => {
    expect(
      describeRemaining(
        achievement(
          { type: 'special_achievement', requirementData: { type } },
          current,
          target,
        ),
        0,
      ),
    ).toBe(expected);
  });

  it.each(['habit_restart', 'long_comeback'])(
    'says nothing for a %s, which one return earns',
    (type) => {
      expect(
        describeRemaining(
          achievement(
            { type: 'special_achievement', requirementData: { type } },
            0,
            1,
          ),
          0,
        ),
      ).toBeNull();
    },
  );
});
