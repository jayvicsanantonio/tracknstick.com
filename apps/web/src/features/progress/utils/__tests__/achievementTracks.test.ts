// Covers how achievements are grouped into tracks, ladders of targets on one count, and one-off badges.
// Also covers the medal each level of a track earns, from bronze at the start to platinum at the top.

import { describe, it, expect } from 'vitest';
import type { Achievement } from '../../types/Achievement';
import { groupAchievements, medalFor } from '../achievementTracks';

const achievement = (
  key: string,
  overrides: Partial<Achievement> = {},
): Achievement => ({
  id: key,
  key,
  name: key,
  description: `${key} description`,
  type: 'completion',
  category: 'dedication',
  requirementType: 'count',
  requirementValue: 1,
  isEarned: false,
  ...overrides,
});

describe('groupAchievements', () => {
  it('puts the tracks in a fixed order, each with its levels from the smallest target', () => {
    const { tracks } = groupAchievements([
      achievement('streak_7', { track: 'streak', requirementValue: 7 }),
      achievement('completions_50', {
        track: 'check_ins',
        requirementValue: 50,
      }),
      achievement('streak_3', { track: 'streak', requirementValue: 3 }),
      achievement('completions_10', {
        track: 'check_ins',
        requirementValue: 10,
      }),
    ]);

    expect(tracks.map((t) => t.label)).toEqual(['Check-ins', 'Streak']);
    expect(tracks[1].levels.map((a) => a.key)).toEqual([
      'streak_3',
      'streak_7',
    ]);
  });

  it('counts the levels earned and finds the next one', () => {
    const { tracks } = groupAchievements([
      achievement('completions_10', {
        track: 'check_ins',
        requirementValue: 10,
        isEarned: true,
      }),
      achievement('completions_25', {
        track: 'check_ins',
        requirementValue: 25,
        isEarned: true,
      }),
      achievement('completions_50', {
        track: 'check_ins',
        requirementValue: 50,
      }),
    ]);

    expect(tracks[0].earnedCount).toBe(2);
    expect(tracks[0].next?.key).toBe('completions_50');
  });

  it('has no next level once every level is earned', () => {
    const { tracks } = groupAchievements([
      achievement('perfect_week', {
        track: 'perfect_days',
        isEarned: true,
      }),
    ]);

    expect(tracks[0].next).toBeUndefined();
  });

  it('keeps achievements with no track as badges', () => {
    const { tracks, badges } = groupAchievements([
      achievement('maximalist'),
      achievement('first_habit', { track: 'habits' }),
    ]);

    expect(tracks).toHaveLength(1);
    expect(badges.map((a) => a.key)).toEqual(['maximalist']);
  });
});

describe('medalFor', () => {
  it('gives the first levels bronze and the top level platinum', () => {
    const medals = [1, 2, 3, 4, 5, 6, 7, 8].map((level) => medalFor(level, 8));

    expect(medals).toEqual([
      'bronze',
      'bronze',
      'silver',
      'silver',
      'gold',
      'gold',
      'platinum',
      'platinum',
    ]);
  });

  it('spreads a short track across the medals by how far up it is', () => {
    expect(medalFor(1, 2)).toBe('silver');
    expect(medalFor(2, 2)).toBe('platinum');
  });
});
