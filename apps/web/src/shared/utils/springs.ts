// The app's springs for framer-motion: how things move into place, in the manner of iOS.
// A spring follows on from wherever a motion was, so an interrupted one never jumps.

export const SPRINGS = {
  /** Progress filling in: settles without running past the value it shows. */
  settle: { type: 'spring', stiffness: 170, damping: 28 },
  /** A row or control settling open or shut: quick, without a bounce. */
  snap: { type: 'spring', stiffness: 500, damping: 45 },
  /** Something popping into place, like the day's check: a small bounce. */
  pop: { type: 'spring', stiffness: 400, damping: 18 },
} as const;
