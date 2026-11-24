// Covers finding the next day after a given one on which any habit is due.
// A habit is due on its weekdays, from its start date until its end date, in the user's time zone.

import { describe, it, expect } from 'vitest';
import { findNextDueDate } from '../nextDueDate';
import type { Habit } from '@/features/habits/types/Habit';

const TIME_ZONE = 'America/Los_Angeles';

const habit = (overrides: Partial<Habit>): Habit =>
  ({
    id: '1',
    name: 'Swim',
    icon: 'Droplet',
    frequency: ['Thu'],
    completed: false,
    // Midnight in Los Angeles, as the form saves a start date.
    startDate: '2026-11-01T07:00:00.000Z',
    ...overrides,
  }) as Habit;

/** The calendar day of the answer, YYYY-MM-DD, read from its local fields. */
const key = (date: Date | null) =>
  date
    ? `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`
    : null;

// Tuesday, November 24, 2026, at noon in Los Angeles.
const TUESDAY = new Date('2026-11-24T20:00:00.000Z');

describe('findNextDueDate', () => {
  it('finds the next weekday a habit is due on, after the day given', () => {
    expect(key(findNextDueDate([habit({})], TUESDAY, TIME_ZONE))).toBe(
      '2026-11-26',
    );
  });

  it('never answers with the day given', () => {
    expect(
      key(findNextDueDate([habit({ frequency: ['Tue'] })], TUESDAY, TIME_ZONE)),
    ).toBe('2026-12-01');
  });

  it('takes the earliest day across every habit', () => {
    expect(
      key(
        findNextDueDate(
          [habit({ frequency: ['Sat'] }), habit({ frequency: ['Wed'] })],
          TUESDAY,
          TIME_ZONE,
        ),
      ),
    ).toBe('2026-11-25');
  });

  it('waits for a habit that has not started yet', () => {
    expect(
      key(
        findNextDueDate(
          [habit({ startDate: '2026-12-07T08:00:00.000Z' })],
          TUESDAY,
          TIME_ZONE,
        ),
      ),
    ).toBe('2026-12-10');
  });

  it('skips a habit that has ended', () => {
    expect(
      findNextDueDate(
        [habit({ endDate: '2026-11-20T07:59:59.999Z' })],
        TUESDAY,
        TIME_ZONE,
      ),
    ).toBeNull();
  });

  it('answers null when there are no habits', () => {
    expect(findNextDueDate([], TUESDAY, TIME_ZONE)).toBeNull();
  });
});
