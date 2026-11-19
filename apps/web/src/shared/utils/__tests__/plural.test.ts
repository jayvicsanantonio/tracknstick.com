// Covers the plural helper used for counts in the UI, such as streak lengths.
// One takes the singular; every other count, zero included, takes the plural.

import { describe, it, expect } from 'vitest';
import { plural } from '../plural';

describe('plural', () => {
  it('uses the singular for exactly one', () => {
    expect(plural(1, 'day')).toBe('day');
  });

  it('uses the plural for zero and for more than one', () => {
    expect(plural(0, 'day')).toBe('days');
    expect(plural(5, 'day')).toBe('days');
  });

  it('accepts an irregular plural', () => {
    expect(plural(2, 'child', 'children')).toBe('children');
  });
});
