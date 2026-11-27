// Covers how the date an achievement was earned reads: the user's own calendar day, with the year.
// earnedAt is a UTC SQLite timestamp, so west of UTC an evening reads as the day before in UTC terms.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { formatEarnedDate } from '../formatEarnedDate';

// 18:30 on 17 November in Los Angeles, as SQLite's CURRENT_TIMESTAMP writes it.
const EARNED_AT = '2026-11-18 02:30:00';

describe('formatEarnedDate', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads as the day, month and year it was earned', () => {
    vi.stubEnv('TZ', 'UTC');

    expect(formatEarnedDate(EARNED_AT)).toBe('Earned Nov 18, 2026');
  });

  it('shows the local day west of UTC', () => {
    vi.stubEnv('TZ', 'America/Los_Angeles');

    expect(formatEarnedDate(EARNED_AT)).toBe('Earned Nov 17, 2026');
  });
});
