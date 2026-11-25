// Takes down the launch splash drawn in index.html once the app has something to show.
// It waits for its ring and check to finish drawing and for the page beneath to load, then fades out and leaves.

import { useEffect } from 'react';

/** How long index.html's #splash takes to fade, with a little to spare. */
const FADE_MS = 400;

/**
 * The longest the splash waits on the page beneath once the app is ready. On a
 * connection that gets nowhere, the page's own loading state, with the tab bar
 * beside it, beats a splash that never goes.
 */
const MAX_HOLD_MS = 4000;

/** Whether the app is ready for the splash to go, and what still holds it up. */
interface SplashState {
  ready: boolean;
  /** Loading states beneath the splash, each holding it up while it shows. */
  holds: number;
  /** Set once the splash has waited MAX_HOLD_MS on them. */
  waitedLongEnough: boolean;
}

// Kept per element, so each splash starts afresh.
const states = new WeakMap<HTMLElement, SplashState>();

function stateOf(splash: HTMLElement): SplashState {
  let state = states.get(splash);
  if (!state) {
    state = { ready: false, holds: 0, waitedLongEnough: false };
    states.set(splash, state);
  }
  return state;
}

/**
 * Settles once the splash's ring, check and name have finished drawing in:
 * every animation of it but its endless breath. Settles at once where there is
 * none, as with reduced motion, or no Web Animations API, as in jsdom.
 */
function drawnIn(splash: HTMLElement): Promise<unknown> {
  const animations =
    typeof splash.getAnimations === 'function'
      ? splash.getAnimations({ subtree: true })
      : [];
  return Promise.allSettled(
    animations
      .filter(
        (animation) =>
          animation.effect?.getComputedTiming().endTime !== Infinity,
      )
      .map((animation) => animation.finished),
  );
}

/**
 * Fades the splash out and removes it, once the app is ready, nothing holds
 * it up, and it has drawn in. Looks after the render's effects have all run,
 * so a loading state handing over to the next in one render never lets it go
 * between the two.
 */
function settle() {
  queueMicrotask(() => {
    const splash = document.getElementById('splash');
    if (!splash) return;
    const state = stateOf(splash);
    const held = () => state.holds > 0 && !state.waitedLongEnough;
    if (!state.ready || held()) return;

    void drawnIn(splash).then(() => {
      // A loading state may have taken hold while it drew in; letting go
      // settles again.
      if (held() || splash.classList.contains('splash-done')) return;
      splash.classList.add('splash-done');
      // The system's chrome takes the theme's colour again, as the page's
      // edges do once the splash is done.
      document.getElementById('splash-theme-color')?.remove();
      // A timer rather than transitionend, which never fires when reduced
      // motion or a hidden tab skips the fade.
      window.setTimeout(() => splash.remove(), FADE_MS);
    });
  });
}

/**
 * Takes the splash down once `ready`, when nothing beneath holds it up or it
 * has waited MAX_HOLD_MS on what does.
 */
export function useHideSplash(ready: boolean): void {
  useEffect(() => {
    if (!ready) return;
    const splash = document.getElementById('splash');
    if (!splash) return;
    const state = stateOf(splash);
    state.ready = true;
    settle();

    const patience = window.setTimeout(() => {
      state.waitedLongEnough = true;
      settle();
    }, MAX_HOLD_MS);
    return () => window.clearTimeout(patience);
  }, [ready]);
}

/**
 * Holds the splash up while `loading`, so that it fades straight onto the
 * finished page rather than onto its loading state.
 */
export function useHoldSplash(loading: boolean): void {
  useEffect(() => {
    if (!loading) return;
    const splash = document.getElementById('splash');
    if (!splash) return;
    const state = stateOf(splash);
    state.holds += 1;
    return () => {
      state.holds -= 1;
      settle();
    };
  }, [loading]);
}
