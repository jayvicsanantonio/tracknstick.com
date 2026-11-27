// Keeps the metric registry honest against the seeded achievement catalogue
// Previously 20 of 44 definitions matched no branch and reported a false 0%

import { beforeAll, describe, it, expect } from 'vitest';
import { env } from 'cloudflare:workers';
import {
  METRICS,
  TRACKS,
  UNMEASURABLE,
  measure,
  type UserStatsSnapshot,
} from '../achievementMetrics.js';

// The catalogue as the seed migration writes it, read in beforeAll.
let definitions: { key: string }[];

const SNAPSHOT: UserStatsSnapshot = {
  totalHabits: 3,
  totalCompletions: 42,
  longestStreak: 9,
  currentStreaks: [4],
  currentStreak: 4,
  activeDays: 31,
  perfectDays: 8,
  notedCompletions: 21,
  maxHabitsInOneDay: 11,
  earlyDays: 6,
  lateDays: 5,
  weekendDays: 12,
  habitComebacks: 2,
  longComebacks: 1,
};

describe('achievement metric registry', () => {
  beforeAll(async () => {
    const { results } = await env.DB.prepare(
      'SELECT key FROM achievements ORDER BY id'
    ).all<{ key: string }>();
    definitions = results;
  });

  it('covers every seeded achievement exactly once', () => {
    for (const def of definitions) {
      const registered = def.key in METRICS;
      const excused = def.key in UNMEASURABLE;

      expect(
        registered || excused,
        `"${def.key}" is neither measured nor listed as unmeasurable`
      ).toBe(true);
      expect(
        registered && excused,
        `"${def.key}" is both measured and listed as unmeasurable`
      ).toBe(false);
    }
  });

  it('registers no key that is not a seeded achievement', () => {
    const keys = new Set(definitions.map((d) => d.key));
    for (const key of [...Object.keys(METRICS), ...Object.keys(UNMEASURABLE)]) {
      expect(keys.has(key), `"${key}" is not a seeded achievement`).toBe(true);
    }
  });

  it('leaves no achievement silently unearnable', () => {
    // The original defect: a definition whose type matched no switch branch
    // returned a well-formed progress object of 0 and could never be awarded.
    const unmeasured = definitions.filter((d) => !(d.key in METRICS));
    for (const def of unmeasured) {
      expect(measure(def, SNAPSHOT), def.key).toBeNull();
      expect(UNMEASURABLE[def.key], `${def.key} needs a reason`).toBeTruthy();
    }
  });

  it.each([
    ['first_habit', 3],
    ['completions_25', 42],
    ['streak_7', 9],
    ['active_30_days', 31],
    ['perfect_week', 8],
    ['social_butterfly', 21],
    ['maximalist', 11],
    ['early_bird', 6],
    ['night_owl', 5],
    ['weekend_warrior', 12],
    ['comeback_kid', 2],
    ['phoenix', 1],
  ])('measures %s from the snapshot', (key, expected) => {
    expect(measure({ key }, SNAPSHOT)).toBe(expected);
  });

  it('returns null rather than zero for an unregistered key', () => {
    expect(measure({ key: 'habit_legend' }, SNAPSHOT)).toBeNull();
  });
});

describe('achievement tracks', () => {
  it('puts only measured achievements on a track', () => {
    for (const key of Object.keys(TRACKS)) {
      expect(key in METRICS, `"${key}" is on a track but not measured`).toBe(
        true
      );
    }
  });

  it('measures every achievement on a track by the same value', () => {
    // Distinct values, so two metrics that differ cannot agree by chance.
    const snapshot: UserStatsSnapshot = {
      totalHabits: 1,
      totalCompletions: 2,
      currentStreaks: [],
      currentStreak: 3,
      longestStreak: 4,
      activeDays: 5,
      perfectDays: 6,
      notedCompletions: 7,
      maxHabitsInOneDay: 8,
      earlyDays: 9,
      lateDays: 10,
      weekendDays: 11,
      habitComebacks: 12,
      longComebacks: 13,
    };
    const valueByTrack = new Map<string, number | null>();
    for (const [key, track] of Object.entries(TRACKS)) {
      const value = measure({ key }, snapshot);
      if (!valueByTrack.has(track)) valueByTrack.set(track, value);
      expect(value, `"${key}" on the ${track} track`).toBe(
        valueByTrack.get(track)
      );
    }
  });

  it.each([
    ['first_completion', 'check_ins'],
    ['completions_1000', 'check_ins'],
    ['streak_3', 'streak'],
    ['streak_1000', 'streak'],
    ['first_week', 'active_days'],
    ['time_traveler', 'active_days'],
    ['perfect_week', 'perfect_days'],
    ['first_habit', 'habits'],
    ['twenty_habits', 'habits'],
  ])('puts %s on the %s track', (key, track) => {
    expect(TRACKS[key]).toBe(track);
  });

  it('leaves one-off achievements off every track', () => {
    expect(TRACKS.social_butterfly).toBeUndefined();
    expect(TRACKS.maximalist).toBeUndefined();
  });
});
