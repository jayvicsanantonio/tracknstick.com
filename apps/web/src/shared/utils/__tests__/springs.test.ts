// Covers the app's springs: how each one settles, which is what makes motion feel like iOS.
// Progress and controls settle without overshooting; a pop lands with a small bounce.

import { describe, it, expect } from 'vitest';
import { SPRINGS } from '@shared/utils/springs';

/** 1 settles as fast as possible without overshooting; below 1 bounces. */
function dampingRatio({
  stiffness,
  damping,
}: {
  stiffness: number;
  damping: number;
}) {
  return damping / (2 * Math.sqrt(stiffness));
}

describe('SPRINGS', () => {
  it('fills progress without running past the value it shows', () => {
    expect(SPRINGS.settle.type).toBe('spring');
    expect(dampingRatio(SPRINGS.settle)).toBeGreaterThanOrEqual(1);
  });

  it('snaps controls into place quickly, without a bounce', () => {
    expect(SPRINGS.snap.type).toBe('spring');
    expect(dampingRatio(SPRINGS.snap)).toBeGreaterThanOrEqual(1);
    expect(SPRINGS.snap.stiffness).toBeGreaterThan(SPRINGS.settle.stiffness);
  });

  it('pops something into place with a small bounce', () => {
    expect(SPRINGS.pop.type).toBe('spring');
    expect(dampingRatio(SPRINGS.pop)).toBeGreaterThan(0.3);
    expect(dampingRatio(SPRINGS.pop)).toBeLessThan(0.9);
  });
});
