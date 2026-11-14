// Tests for habit request validation schemas
// Pins the timezone default and the date-range invariant

import { describe, it, expect } from 'vitest';
import {
  createHabitSchema,
  getHabitsByDateSchema,
  getHabitStatsSchema,
  manageTrackerSchema,
  updateHabitSchema,
} from '../habits.js';

describe('habit request schemas', () => {
  describe('getHabitsByDateSchema', () => {
    it('applies the UTC default when timeZone is omitted', () => {
      const result = getHabitsByDateSchema.parse({
        date: '2026-01-05T00:00:00Z',
      });
      expect(result.timeZone).toBe('UTC');
    });

    it('preserves an explicit timeZone', () => {
      const result = getHabitsByDateSchema.parse({
        date: '2026-01-05T00:00:00Z',
        timeZone: 'America/New_York',
      });
      expect(result.timeZone).toBe('America/New_York');
    });

    it('still accepts a request with neither field', () => {
      const result = getHabitsByDateSchema.parse({});
      expect(result.timeZone).toBe('UTC');
      expect(result.date).toBeUndefined();
    });
  });

  describe('sibling schemas already default correctly', () => {
    it('getHabitStatsSchema defaults timeZone', () => {
      expect(getHabitStatsSchema.parse({}).timeZone).toBe('UTC');
    });

    it('manageTrackerSchema defaults timeZone', () => {
      const parsed = manageTrackerSchema.parse({
        timestamp: '2026-01-05T10:00:00Z',
      });
      expect(parsed.timeZone).toBe('UTC');
    });
  });
});

describe('datetime fields', () => {
  const habit = { name: 'Read', frequency: ['Mon'] };

  it('accepts the format the web app sends', () => {
    // The web app serialises every date with Date.prototype.toISOString().
    const sent = new Date('2026-01-10T08:30:00Z').toISOString();

    expect(
      createHabitSchema.safeParse({ ...habit, startDate: sent }).success
    ).toBe(true);
    expect(getHabitsByDateSchema.safeParse({ date: sent }).success).toBe(true);
  });

  it('requires seconds', () => {
    // RFC 3339 requires seconds, so minute precision is rejected.
    const minutePrecision = '2026-01-10T08:30Z';

    expect(
      createHabitSchema.safeParse({ ...habit, startDate: minutePrecision })
        .success
    ).toBe(false);
    expect(
      getHabitsByDateSchema.safeParse({ date: minutePrecision }).success
    ).toBe(false);
  });
});

describe('date-range invariant (shared by create and update)', () => {
  const base = {
    name: 'Read',
    frequency: ['Mon'],
    startDate: '2026-01-10T00:00:00Z',
  };

  it.each([
    ['createHabitSchema', createHabitSchema],
    ['updateHabitSchema', updateHabitSchema],
  ])('%s rejects endDate before startDate', (_name, schema) => {
    const result = schema.safeParse({
      ...base,
      endDate: '2026-01-01T00:00:00Z',
    });
    expect(result.success).toBe(false);
  });

  it.each([
    ['createHabitSchema', createHabitSchema],
    ['updateHabitSchema', updateHabitSchema],
  ])('%s accepts endDate equal to startDate', (_name, schema) => {
    const result = schema.safeParse({
      ...base,
      endDate: '2026-01-10T00:00:00Z',
    });
    expect(result.success).toBe(true);
  });

  it.each([
    ['createHabitSchema', createHabitSchema],
    ['updateHabitSchema', updateHabitSchema],
  ])('%s accepts a null endDate', (_name, schema) => {
    expect(schema.safeParse({ ...base, endDate: null }).success).toBe(true);
  });

  it.each([
    ['createHabitSchema', createHabitSchema],
    ['updateHabitSchema', updateHabitSchema],
  ])('%s accepts an omitted endDate', (_name, schema) => {
    expect(schema.safeParse(base).success).toBe(true);
  });
});
