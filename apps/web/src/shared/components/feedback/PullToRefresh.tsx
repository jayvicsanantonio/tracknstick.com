// Pull to refresh, as on an iOS list: pull the page down from its top, let go past the mark, and it refreshes.
// A spinner follows the pull under the header, ticks the phone at the mark, and spins until the data arrives.

import { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { hapticTick } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';

/** How far the spinner must travel before letting go refreshes, in pixels. */
const TRIGGER = 70;
/** How far the spinner can travel at most. */
const MAX = 110;
/** The spinner moves half as far as the finger, as iOS resists a pull. */
const RESISTANCE = 0.5;

/** Pulls that start in these are theirs to handle, not the page's. */
const OWN_GESTURES =
  '[role="dialog"], [role="alertdialog"], [data-vaul-drawer]';

interface PullToRefreshProps {
  /** Fetches fresh data; the spinner spins until it settles. */
  onRefresh: () => Promise<unknown>;
}

export default function PullToRefresh({ onRefresh }: PullToRefreshProps) {
  const [distance, setDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  // While a finger is pulling, the spinner follows it without easing.
  const [pulling, setPulling] = useState(false);
  const startY = useRef<number | null>(null);
  const distanceRef = useRef(0);
  const refreshingRef = useRef(false);

  useEffect(() => {
    const onStart = (event: TouchEvent) => {
      const target = event.target as Element | null;
      const fromTop = window.scrollY <= 0;
      const inOwnGesture = target?.closest?.(OWN_GESTURES);
      startY.current =
        fromTop && !inOwnGesture && !refreshingRef.current
          ? event.touches[0].clientY
          : null;
    };

    const onMove = (event: TouchEvent) => {
      if (startY.current === null) return;
      const pulled = event.touches[0].clientY - startY.current;
      const next = pulled > 0 ? Math.min(MAX, pulled * RESISTANCE) : 0;
      // A tick as the pull passes the mark, as iOS gives one.
      if (next >= TRIGGER && distanceRef.current < TRIGGER) hapticTick();
      distanceRef.current = next;
      setPulling(true);
      setDistance(next);
    };

    const onEnd = () => {
      if (startY.current === null) return;
      startY.current = null;
      const pulled = distanceRef.current;
      distanceRef.current = 0;
      setPulling(false);
      setDistance(0);
      if (pulled < TRIGGER) return;
      refreshingRef.current = true;
      setRefreshing(true);
      void onRefresh().finally(() => {
        refreshingRef.current = false;
        setRefreshing(false);
      });
    };

    window.addEventListener('touchstart', onStart, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onEnd);
    window.addEventListener('touchcancel', onEnd);
    return () => {
      window.removeEventListener('touchstart', onStart);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onEnd);
      window.removeEventListener('touchcancel', onEnd);
    };
  }, [onRefresh]);

  const offset = refreshing ? TRIGGER : distance;

  return (
    <div
      role="status"
      className="pointer-events-none fixed inset-x-0 top-[calc(max(env(safe-area-inset-top),0.75rem)+3.5rem)] z-30 flex justify-center"
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-9 items-center justify-center rounded-full bg-(--color-card) text-(--color-brand-primary) shadow-md ring-1 ring-(--color-border-primary)/50',
          // Springs back into place once let go.
          !pulling &&
            'transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]',
        )}
        style={{
          opacity: Math.min(1, offset / TRIGGER),
          transform: `translateY(${offset - 40}px)`,
        }}
      >
        <RefreshCw
          className={cn('size-4', refreshing && 'animate-spin')}
          style={refreshing ? undefined : { rotate: `${distance * 3}deg` }}
        />
      </span>
      {refreshing ? <span className="sr-only">Refreshing</span> : null}
    </div>
  );
}
