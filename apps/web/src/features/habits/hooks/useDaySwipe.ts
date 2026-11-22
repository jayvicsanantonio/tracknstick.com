// Horizontal swipe gesture hook for navigating between days on the Daily Tracker.
// Tracks pointer movement across touch devices and mobile viewports with rubber-band
// visual drag feedback, direction locking (so vertical scroll stays native), edge-back
// gesture protection on iOS, and post-swipe click suppression so swiping across a habit
// circle never accidentally toggles it.

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import { animate, useMotionValue, useReducedMotion } from 'framer-motion';
import { triggerHaptic } from '@shared/utils/haptics';
import { IOS_SPRING_CONTROL } from '@shared/utils/motion';

const DIRECTION_LOCK_PX = 8;
const COMMIT_DISTANCE_PX = 48;
const FLICK_MIN_DISTANCE_PX = 24;
const FLICK_VELOCITY_PX_PER_MS = 0.35;
const MAX_VISUAL_OFFSET_PX = 84;
const DRAG_DAMPING = 0.45;
const INCOMING_OFFSET_PX = 26;
const IOS_EDGE_GUARD_PX = 16;
const MOBILE_BREAKPOINT_PX = 640;

export interface DaySwipeFeedback {
  direction: 'prev' | 'next';
  ready: boolean;
}

interface UseDaySwipeOptions {
  enabled: boolean;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

interface DragSession {
  pointerId: number;
  startX: number;
  startY: number;
  startTime: number;
  axis: 'none' | 'x' | 'y';
}

export function useDaySwipe({
  enabled,
  onPreviousDay,
  onNextDay,
}: UseDaySwipeOptions) {
  const prefersReducedMotion = useReducedMotion();
  const x = useMotionValue(0);
  const [feedback, setFeedback] = useState<DaySwipeFeedback | null>(null);

  const sessionRef = useRef<DragSession | null>(null);
  const didSwipeRef = useRef(false);
  const resetClickGuardTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const cleanupListenersRef = useRef<(() => void) | null>(null);

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
    };
  }, [clearClickGuardTimer, detachWindowListeners]);

  const springToRest = useCallback(() => {
    animate(
      x,
      0,
      prefersReducedMotion
        ? { duration: 0 }
        : { ...IOS_SPRING_CONTROL, velocity: 0 },
    );
  }, [prefersReducedMotion, x]);

  const handlePointerDown = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled) return;
      if (event.pointerType === 'mouse' && event.button !== 0) return;
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
      x.stop();

      sessionRef.current = {
        pointerId: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        startTime: Date.now(),
        axis: 'none',
      };

      const onPointerMove = (moveEvent: PointerEvent) => {
        const session = sessionRef.current;
        if (!session || moveEvent.pointerId !== session.pointerId) return;

        const dx = moveEvent.clientX - session.startX;
        const dy = moveEvent.clientY - session.startY;

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

        const damped =
          Math.sign(dx) *
          Math.min(MAX_VISUAL_OFFSET_PX, Math.abs(dx) * DRAG_DAMPING);
        x.set(prefersReducedMotion ? 0 : damped);

        const nextDirection: 'prev' | 'next' = dx > 0 ? 'prev' : 'next';
        const nextReady = Math.abs(dx) >= COMMIT_DISTANCE_PX;

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
        const elapsedMs = Math.max(1, Date.now() - session.startTime);
        const velocity = Math.abs(dx) / elapsedMs;
        const shouldCommit =
          Math.abs(dx) >= COMMIT_DISTANCE_PX ||
          (Math.abs(dx) >= FLICK_MIN_DISTANCE_PX &&
            velocity >= FLICK_VELOCITY_PX_PER_MS);

        if (!shouldCommit) {
          springToRest();
          return;
        }

        triggerHaptic('selection');
        if (dx > 0) {
          onPreviousDay();
          if (!prefersReducedMotion) {
            x.jump(-INCOMING_OFFSET_PX);
          }
        } else {
          onNextDay();
          if (!prefersReducedMotion) {
            x.jump(INCOMING_OFFSET_PX);
          }
        }
        springToRest();
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
      enabled,
      onNextDay,
      onPreviousDay,
      prefersReducedMotion,
      springToRest,
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
    feedback,
    swipeHandlers: {
      onPointerDown: handlePointerDown,
      onClickCapture: handleClickCapture,
    },
  };
}
