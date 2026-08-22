// The archived predicate and the tab table, which the overview filter and the
// row badge both derive from

import { describe, it, expect } from 'vitest';
import { isArchived, TAB_FILTER } from '../habitFilters';
import type { Habit } from '@/features/habits/types/Habit';

const habit = (overrides: Partial<Habit>): Habit => ({
  id: '1',
  name: 'Read',
  icon: 'BookOpen',
  frequency: ['Mon'],
  completed: false,
  startDate: '2026-01-01T00:00:00Z',
  ...overrides,
});

describe('isArchived', () => {
  it('is true only when an end date is set', () => {
    expect(isArchived(habit({ endDate: '2026-02-01T00:00:00Z' }))).toBe(true);
    expect(isArchived(habit({}))).toBe(false);
  });

  it('does not depend on completed, which is a different concept', () => {
    expect(isArchived(habit({ completed: true }))).toBe(false);
  });
});

describe('TAB_FILTER', () => {
  const active = habit({});
  const archived = habit({ id: '2', endDate: '2026-02-01T00:00:00Z' });

  it('all accepts everything', () => {
    expect([active, archived].filter(TAB_FILTER.all)).toHaveLength(2);
  });

  it('active excludes archived habits', () => {
    expect([active, archived].filter(TAB_FILTER.active)).toEqual([active]);
  });

  it('archived excludes active habits', () => {
    expect([active, archived].filter(TAB_FILTER.archived)).toEqual([archived]);
  });

  it('covers every tab exactly once', () => {
    expect(Object.keys(TAB_FILTER).sort()).toEqual([
      'active',
      'all',
      'archived',
    ]);
  });
});
