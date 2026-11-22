// Tuned iOS spring physics presets matching UIKit / SwiftUI spring timing.
// Used across sheets, segmented controls, tab lenses, and tactile press states.

import type { Transition } from 'framer-motion';

export const IOS_SPRING_TAP: Transition = {
  type: 'spring',
  stiffness: 520,
  damping: 32,
  mass: 0.6,
};

export const IOS_SPRING_CONTROL: Transition = {
  type: 'spring',
  stiffness: 440,
  damping: 34,
  mass: 0.8,
};

export const IOS_SPRING_SHEET: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 38,
  mass: 0.9,
};

export const IOS_SPRING_TAB: Transition = {
  type: 'spring',
  stiffness: 460,
  damping: 36,
  mass: 0.75,
};
