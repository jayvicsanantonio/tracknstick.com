// Characterization tests for the timezone day-boundary math
// Written before the deduplication below so the refactor is provably
// behaviour-preserving

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  getLocalStartofDayUTC,
  getLocalEndOfDayUTC,
  parseDateKey,
  parseUTCTimestamp,
} from '@shared/utils/date/formatDate';

const ZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Asia/Kolkata', // +05:30
  'Asia/Tokyo',
  'Australia/Sydney',
  'Pacific/Kiritimati', // +14:00
  'America/Santiago', // DST transition at midnight
];

const INSTANTS = [
  '2026-01-15T12:00:00Z',
  '2026-06-15T12:00:00Z',
  '2026-03-08T12:00:00Z', // US spring forward
  '2026-11-01T12:00:00Z', // US fall back
  '2024-02-29T12:00:00Z', // leap day
];

/** The local calendar date an instant falls on, in a timezone. */
const localDateKey = (d: Date, timeZone: string) =>
  new Intl.DateTimeFormat('en-CA', { timeZone }).format(d);

describe('local day boundaries', () => {
  it.each(ZONES)('start of day precedes end of day in %s', (zone) => {
    for (const iso of INSTANTS) {
      const date = new Date(iso);
      expect(
        getLocalStartofDayUTC(date, zone).getTime(),
        `${zone} ${iso}`,
      ).toBeLessThan(getLocalEndOfDayUTC(date, zone).getTime());
    }
  });

  it.each(ZONES)('both bounds land on the same local date in %s', (zone) => {
    for (const iso of INSTANTS) {
      const date = new Date(iso);
      const expected = localDateKey(date, zone);

      expect(localDateKey(getLocalStartofDayUTC(date, zone), zone)).toBe(
        expected,
      );
      expect(localDateKey(getLocalEndOfDayUTC(date, zone), zone)).toBe(
        expected,
      );
    }
  });

  it.each(ZONES)('is idempotent in %s', (zone) => {
    // HabitForm applies these twice: once seeding state, once on submit.
    for (const iso of INSTANTS) {
      const once = getLocalStartofDayUTC(new Date(iso), zone);
      const twice = getLocalStartofDayUTC(once, zone);
      expect(twice.toISOString(), `${zone} ${iso}`).toBe(once.toISOString());
    }
  });

  it('spans just under 24 hours on a normal day', () => {
    const date = new Date('2026-06-15T12:00:00Z');
    const span =
      getLocalEndOfDayUTC(date, 'America/New_York').getTime() -
      getLocalStartofDayUTC(date, 'America/New_York').getTime();

    expect(span).toBe(24 * 60 * 60 * 1000 - 1);
  });

  it('keeps the millisecond precision of the end boundary', () => {
    // The end offset is probed at 23:59:59 while the instant is built from
    // 23:59:59.999. That asymmetry is deliberate and load-bearing.
    const end = getLocalEndOfDayUTC(new Date('2026-06-15T12:00:00Z'), 'UTC');
    expect(end.toISOString()).toBe('2026-06-15T23:59:59.999Z');
  });

  it('handles a UTC+14 zone without shifting the day', () => {
    const date = new Date('2026-06-15T12:00:00Z');
    const zone = 'Pacific/Kiritimati';
    expect(localDateKey(getLocalStartofDayUTC(date, zone), zone)).toBe(
      localDateKey(date, zone),
    );
  });
});

describe('parsing API dates in a US timezone', () => {
  beforeEach(() => {
    vi.stubEnv('TZ', 'America/Los_Angeles');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('reads a YYYY-MM-DD key as that local calendar day', () => {
    const date = parseDateKey('2026-11-17');

    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(10);
    expect(date.getDate()).toBe(17);
    expect(date.getHours()).toBe(0);
  });

  it('reads a zoneless SQLite timestamp as UTC', () => {
    // 02:30 UTC on the 18th is 18:30 on the 17th in Los Angeles.
    const date = parseUTCTimestamp('2026-11-18 02:30:00');

    expect(date.toISOString()).toBe('2026-11-18T02:30:00.000Z');
    expect(date.getDate()).toBe(17);
  });

  it('keeps the zone of a timestamp that already has one', () => {
    expect(parseUTCTimestamp('2026-11-18T02:30:00.000Z').toISOString()).toBe(
      '2026-11-18T02:30:00.000Z',
    );
    expect(parseUTCTimestamp('2026-11-18T02:30:00+01:00').toISOString()).toBe(
      '2026-11-18T01:30:00.000Z',
    );
  });
});
