// Covers which swipe across the Tracker moves to another day: far enough, or fast enough, sideways.
// Leftward goes forward a day, as a page turns; rightward goes back.

import { describe, it, expect } from 'vitest';
import { dayStepForSwipe } from '../daySwipe';

describe('dayStepForSwipe', () => {
  it('goes to the next day on a swipe left', () => {
    expect(dayStepForSwipe({ x: -120, y: 4 }, { x: -50, y: 0 })).toBe(1);
  });

  it('goes to the day before on a swipe right', () => {
    expect(dayStepForSwipe({ x: 120, y: -6 }, { x: 50, y: 0 })).toBe(-1);
  });

  it('takes a short, quick flick as a swipe', () => {
    expect(dayStepForSwipe({ x: -30, y: 0 }, { x: -800, y: 0 })).toBe(1);
  });

  it('stays on the day for a short, slow drag', () => {
    expect(dayStepForSwipe({ x: -30, y: 0 }, { x: -100, y: 0 })).toBe(0);
  });

  it('stays on the day when the finger mostly went up or down, scrolling', () => {
    expect(dayStepForSwipe({ x: -70, y: 160 }, { x: -200, y: 900 })).toBe(0);
  });
});
