// Covers the cache key of a day's habit list: one key per calendar day, not per moment.
// A key that changed every launch would never find the habits saved last time.

import { describe, it, expect } from 'vitest';
import { habitsForDateKey } from '@/features/habits/api';

const TIME_ZONE = 'America/Los_Angeles';

describe('habitsForDateKey', () => {
  it('is the same at any moment of one day, so a launch finds that day saved', () => {
    const morning = new Date('2026-11-21T08:00:00-08:00');
    const evening = new Date('2026-11-21T23:30:00-08:00');

    expect(habitsForDateKey(evening, TIME_ZONE)).toBe(
      habitsForDateKey(morning, TIME_ZONE),
    );
  });

  it('differs from one day to the next', () => {
    const today = new Date('2026-11-21T12:00:00-08:00');
    const tomorrow = new Date('2026-11-22T12:00:00-08:00');

    expect(habitsForDateKey(tomorrow, TIME_ZONE)).not.toBe(
      habitsForDateKey(today, TIME_ZONE),
    );
  });

  it("follows the user's time zone, not UTC, for where a day ends", () => {
    // 23:30 in Los Angeles is already the next day in UTC.
    const lateEvening = new Date('2026-11-21T23:30:00-08:00');

    expect(habitsForDateKey(lateEvening, TIME_ZONE)).toBe(
      `/api/v1/habits?date=2026-11-21&timeZone=${TIME_ZONE}`,
    );
  });
});
