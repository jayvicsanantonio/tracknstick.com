// Decides whether a swipe across the Tracker moves to another day, and which way.
// A sideways swipe far or fast enough turns the day; one that is mostly up or down is a scroll.

interface Vector {
  x: number;
  y: number;
}

/** How far a slow swipe must travel sideways, in pixels. */
const DISTANCE = 60;
/** How fast a short flick must travel sideways, in pixels a second. */
const SPEED = 500;

/**
 * The days to move by: 1 for the next day on a swipe left, -1 for the day
 * before on a swipe right, and 0 to stay. `offset` is how far the finger
 * travelled and `velocity` how fast it was moving when it lifted.
 */
export function dayStepForSwipe(offset: Vector, velocity: Vector): -1 | 0 | 1 {
  if (Math.abs(offset.y) > Math.abs(offset.x)) return 0;
  const far = Math.abs(offset.x) >= DISTANCE;
  const fast = Math.abs(velocity.x) >= SPEED;
  if (!far && !fast) return 0;
  const direction = fast ? velocity.x : offset.x;
  return direction < 0 ? 1 : -1;
}
