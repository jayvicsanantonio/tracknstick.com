// Follows the on-screen keyboard through the visual viewport: iOS does not resize the page for it.
// Publishes the height left visible and marks the root element while the keyboard is up.

/** More than this much of the screen hidden is the keyboard, not a toolbar. */
const KEYBOARD_MIN_HEIGHT = 150;

/** The part of window.visualViewport this needs, so tests can stand in for it. */
interface ViewportLike extends EventTarget {
  height: number;
}

/**
 * Sets `--visual-viewport-height` on the root element to the height left
 * visible, and `data-keyboard-open` while the keyboard covers the page, for
 * the `keyboard-open:` variant. Returns a function that stops watching.
 */
export function watchKeyboard(
  viewport: ViewportLike | null = window.visualViewport,
): () => void {
  if (!viewport) return () => undefined;
  const root = document.documentElement;

  const update = () => {
    root.style.setProperty('--visual-viewport-height', `${viewport.height}px`);
    root.toggleAttribute(
      'data-keyboard-open',
      window.innerHeight - viewport.height > KEYBOARD_MIN_HEIGHT,
    );
  };

  update();
  viewport.addEventListener('resize', update);
  return () => viewport.removeEventListener('resize', update);
}
