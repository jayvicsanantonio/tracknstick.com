// Covers the haptic tick: a vibration where the browser offers one, a switch toggle on iOS.
// iOS gives no vibration API, but taps the phone when a switch checkbox is toggled.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { hapticTick } from '@shared/utils/haptics';

/** Every element a click reached while `run` ran. */
function clicksDuring(run: () => void): HTMLElement[] {
  const reached: HTMLElement[] = [];
  const record = (event: Event) => reached.push(event.target as HTMLElement);
  document.addEventListener('click', record, true);
  run();
  document.removeEventListener('click', record, true);
  return reached;
}

describe('hapticTick', () => {
  afterEach(() => {
    Reflect.deleteProperty(navigator, 'vibrate');
  });

  it('toggles a switch, which iOS answers with a tap of the phone, where there is no vibration', () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    const reached = clicksDuring(hapticTick);

    const toggled = reached.find(
      (element): element is HTMLInputElement =>
        element instanceof HTMLInputElement,
    );
    expect(toggled?.type).toBe('checkbox');
    expect(toggled?.hasAttribute('switch')).toBe(true);
  });

  it('leaves nothing behind in the page', () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });
    const before = document.documentElement.outerHTML;

    hapticTick();

    expect(document.documentElement.outerHTML).toBe(before);
  });

  it('vibrates briefly where the browser can, with no switch', () => {
    const vibrate = vi.fn(() => true);
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    const reached = clicksDuring(hapticTick);

    expect(vibrate).toHaveBeenCalledWith(10);
    expect(reached).toEqual([]);
  });
});
