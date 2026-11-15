// Tests for the achievement response schemas' icon field
// Pins that an icon is one of ACHIEVEMENT_ICONS, or absent

import { describe, it, expect } from 'vitest';
import { earnedAchievementSchema } from '../achievements.js';

const earned = {
  id: '1',
  key: 'first_habit',
  name: 'First Step',
  description: 'Create your very first habit',
  type: 'habit_creation',
  category: 'getting_started',
  earnedAt: '2026-11-14T00:00:00.000Z',
};

describe('achievement icons', () => {
  it('accepts an icon from ACHIEVEMENT_ICONS', () => {
    expect(
      earnedAchievementSchema.safeParse({ ...earned, icon: 'Sprout' }).success
    ).toBe(true);
  });

  it('accepts an achievement with no icon', () => {
    expect(earnedAchievementSchema.safeParse(earned).success).toBe(true);
  });

  it('rejects an icon the list does not hold', () => {
    expect(
      earnedAchievementSchema.safeParse({ ...earned, icon: 'Ghost' }).success
    ).toBe(false);
  });
});
