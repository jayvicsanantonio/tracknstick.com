// Tuned iOS spring physics presets matching UIKit / SwiftUI spring timing.
// Used across sheets, segmented controls, tab lenses, and tactile press states.

import type { Transition } from 'framer-motion';

export const IOS_SPRING_TAP = {
  type: 'spring',
  stiffness: 520,
  damping: 32,
  mass: 0.6,
} as const satisfies Transition;

export const IOS_SPRING_CONTROL = {
  type: 'spring',
  stiffness: 440,
  damping: 34,
  mass: 0.8,
} as const satisfies Transition;

export const IOS_SPRING_SHEET = {
  type: 'spring',
  stiffness: 380,
  damping: 38,
  mass: 0.9,
} as const satisfies Transition;

export const IOS_SPRING_TAB = {
  type: 'spring',
  stiffness: 460,
  damping: 36,
  mass: 0.75,
} as const satisfies Transition;
