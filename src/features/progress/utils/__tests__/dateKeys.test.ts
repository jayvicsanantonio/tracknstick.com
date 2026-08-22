import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { fromDateKey, toDateKey } from '../dateKeys';

// Pinned west of Greenwich: that is where Date's own YYYY-MM-DD parsing goes
// wrong, and a suite running in UTC cannot tell the two apart.
const ORIGINAL_TZ = process.env.TZ;

beforeAll(() => {
  process.env.TZ = 'America/Los_Angeles';
});

afterAll(() => {
  process.env.TZ = ORIGINAL_TZ;
});

describe('date keys', () => {
  it('names the day the key names, not the day UTC midnight lands on', () => {
    expect(new Date('2026-08-01').getDate()).toBe(31); // the bug, for contrast

    const parsed = fromDateKey('2026-08-01');
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(7);
    expect(parsed.getDate()).toBe(1);
  });

  it('round-trips a key through the local calendar', () => {
    expect(toDateKey(fromDateKey('2026-08-01'))).toBe('2026-08-01');
  });

  it('pads single-digit months and days', () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });

  it('handles the last day of a month', () => {
    expect(toDateKey(fromDateKey('2026-02-28'))).toBe('2026-02-28');
  });
});
