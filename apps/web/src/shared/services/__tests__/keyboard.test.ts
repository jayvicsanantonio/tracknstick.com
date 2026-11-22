// Covers how the app follows the on-screen keyboard: the visible height, and whether the keyboard is up.
// iOS does not resize the page for its keyboard; the visual viewport is the only sign of it.

import { describe, it, expect, afterEach } from 'vitest';
import { watchKeyboard } from '@shared/services/keyboard';

/** A stand-in for window.visualViewport, whose height the test sets. */
class FakeViewport extends EventTarget {
  height = window.innerHeight;

  resizeTo(height: number) {
    this.height = height;
    this.dispatchEvent(new Event('resize'));
  }
}

const root = document.documentElement;

describe('watchKeyboard', () => {
  let stop: () => void = () => undefined;

  afterEach(() => {
    stop();
    root.removeAttribute('data-keyboard-open');
    root.style.removeProperty('--visual-viewport-height');
  });

  it('publishes the height left visible, for layouts to fit in', () => {
    const viewport = new FakeViewport();
    stop = watchKeyboard(viewport);

    viewport.resizeTo(400);

    expect(root.style.getPropertyValue('--visual-viewport-height')).toBe(
      '400px',
    );
  });

  it('marks the page while the keyboard is up, and clears the mark when it goes', () => {
    const viewport = new FakeViewport();
    stop = watchKeyboard(viewport);

    viewport.resizeTo(window.innerHeight - 300);
    expect(root).toHaveAttribute('data-keyboard-open');

    viewport.resizeTo(window.innerHeight);
    expect(root).not.toHaveAttribute('data-keyboard-open');
  });

  it('does not take a small change, like the toolbar showing, for the keyboard', () => {
    const viewport = new FakeViewport();
    stop = watchKeyboard(viewport);

    viewport.resizeTo(window.innerHeight - 60);

    expect(root).not.toHaveAttribute('data-keyboard-open');
  });

  it('stops following the viewport when stopped', () => {
    const viewport = new FakeViewport();
    watchKeyboard(viewport)();

    viewport.resizeTo(window.innerHeight - 300);

    expect(root).not.toHaveAttribute('data-keyboard-open');
  });

  it('does nothing where there is no visual viewport', () => {
    expect(() => {
      stop = watchKeyboard(null);
    }).not.toThrow();
  });
});
