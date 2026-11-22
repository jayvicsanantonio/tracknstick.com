// Interactive horizontal swipe hook for navigating between days on the Daily Tracker.
// Uses iOS-style hyperbolic rubber-band drag physics, rolling instantaneous velocity
// (supporting both brisk flick-commits and flick-back cancels), threshold detent
// haptics, continuous 60/120fps MotionValues for zero-rerender edge feedback,
// directional incoming transitions (shared with arrow/keyboard day navigation),
// iOS edge-back protection, and post-swipe click suppression.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import {
  animate,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
} from 'framer-motion';
import { triggerHaptic } from '@shared/utils/haptics';
import { IOS_SPRING_PAGE } from '@shared/utils/motion';

const DIRECTION_LOCK_PX = 10;
const COMMIT_DISTANCE_PX = 52;
const FLICK_MIN_DISTANCE_PX = 24;
const FLICK_VELOCITY_PX_PER_MS = 0.32;
const CANCEL_FLICK_VELOCITY_PX_PER_MS = 0.3;
const MAX_VISUAL_OFFSET_PX = 148;
const INITIAL_DRAG_SLOPE = 0.85;
const SWIPE_INCOMING_OFFSET_PX = 56;
const BUTTON_INCOMING_OFFSET_PX = 32;
const IOS_EDGE_GUARD_PX = 16;
const MOBILE_BREAKPOINT_PX = 640;
const VELOCITY_WINDOW_MS = 100;
const MAX_VELOCITY_SAMPLES = 6;
const DRAG_MIN_OPACITY = 0.54;

const INTERACTIVE_EXCLUDE_SELECTOR =
  'input, textarea, select, [contenteditable="true"], [data-no-day-swipe]';

export type DaySwipeDirection = 'prev' | 'next';

export interface DaySwipeFeedback {
  direction: DaySwipeDirection;
  ready: boolean;
}

interface UseDaySwipeOptions {
  enabled: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

interface VelocitySample {
  x: number;
  t: number;
}

interface DragSession {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  axis: 'none' | 'x' | 'y';
  wasReady: boolean;
  samples: VelocitySample[];
}

/** Smooth hyperbolic rubber-band curve (responsive near 0, never hits a hard wall). */
function rubberBandOffset(dx: number): number {
  const abs = Math.abs(dx);
  if (abs === 0) return 0;
  const damped =
    (MAX_VISUAL_OFFSET_PX * abs) /
    (abs + MAX_VISUAL_OFFSET_PX / INITIAL_DRAG_SLOPE);
  return Math.sign(dx) * damped;
}

/** Signed velocity in px/ms over the trailing ~100ms of pointer movement. */
function computeSignedVelocity(
  samples: VelocitySample[],
  endX: number,
  endTime: number,
  startX: number,
  startTime: number,
): number {
  const cutoff = endTime - VELOCITY_WINDOW_MS;
  let anchor: VelocitySample = { x: startX, t: startTime };

  for (const sample of samples) {
    if (sample.t >= cutoff) {
      anchor = sample;
      break;
    }
  }

  const dt = Math.max(1, endTime - anchor.t);
  return (endX - anchor.x) / dt;
}

export function useDaySwipe({
  enabled,
  onPreviousDay,
  onNextDay,
}: UseDaySwipeOptions) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const opacity = useMotionValue(1);
  const dragProgress = useMotionValue(0);
  const [feedback, setFeedback] = useState<DaySwipeFeedback | null>(null);

  const sessionRef = useRef<DragSession | null>(null);
  const didSwipeRef = useRef(false);
  const resetClickGuardTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cleanupListenersRef = useRef<(() => void) | null>(null);
  const activeAnimationsRef = useRef<AnimationPlaybackControls[]>([]);

  const stopAnimations = useCallback(() => {
    for (const control of activeAnimationsRef.current) {
      control.stop();
    }
    activeAnimationsRef.current = [];
  }, []);

  const trackAnimation = useCallback((control: AnimationPlaybackControls) => {
    activeAnimationsRef.current.push(control);
    return control;
  }, []);

  const clearClickGuardTimer = useCallback(() => {
    if (resetClickGuardTimer.current !== null) {
      clearTimeout(resetClickGuardTimer.current);
      resetClickGuardTimer.current = null;
    }
  }, []);

  const detachWindowListeners = useCallback(() => {
    cleanupListenersRef.current?.();
    cleanupListenersRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      detachWindowListeners();
      clearClickGuardTimer();
      stopAnimations();
    };
  }, [clearClickGuardTimer, detachWindowListeners, stopAnimations]);

  // Guarantee content never stays shifted or dimmed if swipe is disabled mid-gesture.
  useEffect(() => {
    if (enabled) return;
    detachWindowListeners();
    sessionRef.current = null;
    setFeedback(null);
    stopAnimations();
    x.jump(0);
    opacity.jump(1);
    dragProgress.jump(0);
  }, [
    detachWindowListeners,
    dragProgress,
    enabled,
    opacity,
    stopAnimations,
    x,
  ]);

  const springToRest = useCallback(
    (velocityPxPerSec = 0) => {
      stopAnimations();
      if (prefersReducedMotion) {
        x.jump(0);
        opacity.jump(1);
        dragProgress.jump(0);
        return;
      }

      trackAnimation(
        animate(x, 0, {
          ...IOS_SPRING_PAGE,
          velocity: Math.max(-1200, Math.min(1200, velocityPxPerSec)),
        }),
      );
      trackAnimation(
        animate(opacity, 1, {
          duration: 0.22,
          ease: [0.22, 1, 0.36, 1],
        }),
      );
      trackAnimation(
        animate(dragProgress, 0, {
          duration: 0.18,
          ease: [0.22, 1, 0.36, 1],
        }),
      );
    },
    [
      dragProgress,
      opacity,
      prefersReducedMotion,
      stopAnimations,
      trackAnimation,
      x,
    ],
  );

  /**
   * Plays a crisp directional incoming glide for the newly selected day.
   * Shared by swipe commits and arrow/keyboard/Today date navigation.
   */
  const playIncomingTransition = useCallback(
    (
      direction: DaySwipeDirection,
      options?: { source?: 'swipe' | 'button'; releaseVelocity?: number },
    ) => {
      stopAnimations();
      dragProgress.jump(0);

      if (prefersReducedMotion) {
        x.jump(0);
        opacity.jump(1);
        return;
      }

      const source = options?.source ?? 'button';
      const offset =
        source === 'swipe'
          ? SWIPE_INCOMING_OFFSET_PX
          : BUTTON_INCOMING_OFFSET_PX;
      const startX = direction === 'prev' ? -offset : offset;
      const startOpacity = source === 'swipe' ? 0 : 0.2;
      const clampedVelocity = options?.releaseVelocity
        ? Math.max(-900, Math.min(900, options.releaseVelocity))
        : 0;

      x.jump(startX);
      opacity.jump(startOpacity);

      trackAnimation(
        animate(x, 0, {
          ...IOS_SPRING_PAGE,
          velocity: clampedVelocity,
        }),
      );
      trackAnimation(
        animate(opacity, 1, {
          duration: source === 'swipe' ? 0.24 : 0.2,
          ease: [0.22, 1, 0.36, 1],
        }),
      );
    },
    [
      dragProgress,
      opacity,
      prefersReducedMotion,
      stopAnimations,
      trackAnimation,
      x,
    ],
  );

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;

      // Never hijack text fields or explicitly excluded interactive surfaces.
      if (
        event.target instanceof Element &&
        event.target.closest(INTERACTIVE_EXCLUDE_SELECTOR)
      ) {
        return;
      }

      // Preserve normal mouse text selection on wide desktop screens while
      // allowing swipe on all touch screens and phone-sized viewports.
      if (
        event.pointerType !== 'touch' &&
        typeof window !== 'undefined' &&
        window.innerWidth >= MOBILE_BREAKPOINT_PX
      ) {
        return;
      }

      // Leave the 16px left/right edge zone free for iOS Safari's back/forward swipe.
      if (
        event.pointerType === 'touch' &&
        typeof window !== 'undefined' &&
        (event.clientX < IOS_EDGE_GUARD_PX ||
          event.clientX > window.innerWidth - IOS_EDGE_GUARD_PX)
      ) {
        return;
      }

      clearClickGuardTimer();
      didSwipeRef.current = false;
      detachWindowListeners();
      stopAnimations();
      if (opacity.get() < 0.95) {
        opacity.jump(1);
      }

      const now = Date.now();
      sessionRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: now,
        axis: 'none',
        wasReady: false,
        samples: [{ x: event.clientX, t: now }],
      };

      const onPointerMove = (moveEvent: PointerEvent) => {
        const session = sessionRef.current;
        if (!session || moveEvent.pointerId !== session.pointerId) return;

        const dx = moveEvent.clientX - session.startX;
        const dy = moveEvent.clientY - session.startY;
        const moveNow = Date.now();

        session.samples.push({ x: moveEvent.clientX, t: moveNow });
        if (session.samples.length > MAX_VELOCITY_SAMPLES) {
          session.samples.shift();
        }

        if (session.axis === 'none') {
          if (Math.max(Math.abs(dx), Math.abs(dy)) < DIRECTION_LOCK_PX) {
            return;
          }
          if (Math.abs(dx) > Math.abs(dy) * 1.15) {
            session.axis = 'x';
            didSwipeRef.current = true;
          } else {
            session.axis = 'y';
            detachWindowListeners();
            sessionRef.current = null;
            return;
          }
        }

        if (session.axis !== 'x') return;

        const absDx = Math.abs(dx);
        const progress = Math.min(1, absDx / COMMIT_DISTANCE_PX);
        dragProgress.set(progress);

        if (!prefersReducedMotion) {
          const offset = rubberBandOffset(dx);
          x.set(offset);
          const dragFade = Math.min(1, absDx / (COMMIT_DISTANCE_PX * 2.4));
          opacity.set(1 - dragFade * (1 - DRAG_MIN_OPACITY));
        }

        const nextDirection: DaySwipeDirection = dx > 0 ? 'prev' : 'next';
        const nextReady = absDx >= COMMIT_DISTANCE_PX;

        // Subtle tactile detent the instant the drag crosses the commit threshold.
        if (nextReady && !session.wasReady) {
          triggerHaptic('light');
        }
        session.wasReady = nextReady;

        setFeedback((prev) =>
          prev && prev.direction === nextDirection && prev.ready === nextReady
            ? prev
            : { direction: nextDirection, ready: nextReady },
        );
      };

      const finish = (endEvent: PointerEvent, cancelled: boolean) => {
        const session = sessionRef.current;
        if (!session || endEvent.pointerId !== session.pointerId) return;

        detachWindowListeners();
        sessionRef.current = null;
        setFeedback(null);

        if (session.axis !== 'x') return;

        // Clear the synthetic-click guard shortly after pointerup in case the
        // browser doesn't emit a click (e.g. iOS touch drags).
        clearClickGuardTimer();
        resetClickGuardTimer.current = setTimeout(() => {
          didSwipeRef.current = false;
        }, 80);

        if (cancelled) {
          springToRest();
          return;
        }

        const dx = endEvent.clientX - session.startX;
        const absDx = Math.abs(dx);
        const dragSign = Math.sign(dx);
        const signedVx = computeSignedVelocity(
          session.samples,
          endEvent.clientX,
          Date.now(),
          session.startX,
          session.startTime,
        );
        const alignedVx = signedVx * dragSign;

        // If the user actively flicked back toward center, honor the cancel intent.
        const isFlickCancel = alignedVx <= -CANCEL_FLICK_VELOCITY_PX_PER_MS;
        const shouldCommit =
          !isFlickCancel &&
          (absDx >= COMMIT_DISTANCE_PX ||
            (absDx >= FLICK_MIN_DISTANCE_PX &&
              alignedVx >= FLICK_VELOCITY_PX_PER_MS));

        if (!shouldCommit) {
          springToRest(signedVx * 1000);
          return;
        }

        const direction: DaySwipeDirection = dx > 0 ? 'prev' : 'next';
        triggerHaptic('selection');
        if (direction === 'prev') {
          onPreviousDay();
        } else {
          onNextDay();
        }
        playIncomingTransition(direction, {
          source: 'swipe',
          releaseVelocity: signedVx * 650,
        });
      };

      const onPointerUp = (endEvent: PointerEvent) => finish(endEvent, false);
      const onPointerCancel = (endEvent: PointerEvent) =>
        finish(endEvent, true);

      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerup', onPointerUp, { passive: true });
      window.addEventListener('pointercancel', onPointerCancel, {
        passive: true,
      });

      cleanupListenersRef.current = () => {
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
        window.removeEventListener('pointercancel', onPointerCancel);
      };
    },
    [
      clearClickGuardTimer,
      detachWindowListeners,
      dragProgress,
      enabled,
      onNextDay,
      onPreviousDay,
      opacity,
      playIncomingTransition,
      prefersReducedMotion,
      springToRest,
      stopAnimations,
      x,
    ],
  );

  const handleClickCapture = useCallback(
    (event: ReactMouseEvent<HTMLDivElement>) => {
      if (!didSwipeRef.current) return;
      event.preventDefault();
      event.stopPropagation();
      didSwipeRef.current = false;
      clearClickGuardTimer();
    },
    [clearClickGuardTimer],
  );

  return {
    x,
    opacity,
    dragProgress,
    feedback,
    playIncomingTransition,
    swipeHandlers: {
      onPointerDown: handlePointerDown,
      onClickCapture: handleClickCapture,
    },
  };
}
