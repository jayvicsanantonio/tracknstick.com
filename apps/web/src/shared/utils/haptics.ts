// Native iOS Safari 17.4+ Taptic Engine haptics utility.
// Uses Safari's native `<input type="checkbox" switch>` haptic primitive triggered
// synchronously within a user gesture, with `navigator.vibrate` fallback on Android.

import { getPreferences } from '@shared/hooks/usePreferences';

export type HapticStyle =
  | 'light'
  | 'medium'
  | 'selection'
  | 'success'
  | 'error';

let hapticLabel: HTMLLabelElement | null = null;
let hapticInput: HTMLInputElement | null = null;

function ensureSwitchElement(): HTMLLabelElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  if (hapticLabel && document.body.contains(hapticLabel)) {
    return hapticLabel;
  }

  const label = document.createElement('label');
  label.setAttribute('aria-hidden', 'true');
  label.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;';

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');

  label.appendChild(input);
  document.body.appendChild(label);

  hapticLabel = label;
  hapticInput = input;
  return label;
}

function pulseIosSwitch(): void {
  const label = ensureSwitchElement();
  if (!label || !hapticInput) return;
  label.click();
}

const VIBRATE_PATTERN: Record<HapticStyle, number | number[]> = {
  selection: 6,
  light: 10,
  medium: 18,
  success: [12, 45, 18],
  error: [20, 40, 20],
};

/**
 * Triggers subtle native haptic feedback when enabled in user preferences.
 * Must be called synchronously inside a user pointer/click event handler on iOS.
 */
export function triggerHaptic(style: HapticStyle = 'light'): void {
  if (typeof window === 'undefined') return;
  if (!getPreferences().hapticsEnabled) return;

  // Respect reduced motion preference for non-essential sensory pulses.
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;

  // Android / browsers supporting Vibration API.
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    try {
      navigator.vibrate(VIBRATE_PATTERN[style]);
      return;
    } catch {
      // Fall through to iOS switch haptic
    }
  }

  // iOS Safari 17.4+ Taptic Engine via native checkbox switch toggle.
  try {
    pulseIosSwitch();
    if (style === 'success' || style === 'error') {
      window.setTimeout(() => {
        try {
          pulseIosSwitch();
        } catch {
          // Ignore delayed haptic errors
        }
      }, 65);
    }
  } catch {
    // Ignore unsupported environments (e.g. jsdom)
  }
}
