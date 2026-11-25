// Tactile haptic feedback utility with semantic patterns and strength scaling.
// Uses `navigator.vibrate` waveforms on Android and Safari's native
// `<input type="checkbox" switch>` Taptic Engine primitive on iOS.

import {
  getPreferences,
  type HapticStrength,
} from '@shared/hooks/usePreferences';

export type HapticStyle =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'allDone'
  | 'allDoneSingle'
  | 'achievement'
  | 'warning'
  | 'error';

export interface HapticOptions {
  /**
   * Use for haptics triggered after an `await` or timer (e.g. API rollbacks,
   * achievements, long-press timers). iOS Safari ignores switch clicks outside
   * a synchronous user gesture, so these calls only run `navigator.vibrate` on
   * Android and never cancel a pending iOS follow-up pulse.
   */
  androidOnly?: boolean;
  /**
   * Set when a direct physical tap on a native `<input type="checkbox" switch>`
   * (such as `IosSwitch`) has already triggered the iOS Taptic Engine.
   */
  iosNativeHandled?: boolean;
}

export const IOS_HAPTIC_SWITCH_ID = 'track-n-stick-haptic-switch';

const QUEUED_ACHIEVEMENT_GAP_MS = 120;

let hapticInput: HTMLInputElement | null = null;
let imperativeLabel: HTMLLabelElement | null = null;
let pendingIosTarget: HTMLElement | null = null;
let suppressingIosImmediatePulse = false;
let pendingIosPulseTimer: number | null = null;
let pendingQueuedVibrateTimer: number | null = null;
let activeCelebrationEndsAt = 0;

/**
 * Returns true on iOS/iPadOS WebKit devices where Taptic Engine feedback is
 * exposed via native `<input type="checkbox" switch>` controls rather than
 * `navigator.vibrate`.
 */
export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
}

function activateTarget(target: HTMLElement): void {
  // The user's physical tap on the overlay `<label>` already toggled the native
  // iOS switch and fired the Taptic Engine; skip redundant immediate clicks.
  suppressingIosImmediatePulse = true;
  try {
    // Radix TabsTrigger activates on mousedown (primary button) rather than click.
    if (target.getAttribute('role') === 'tab') {
      target.dispatchEvent(
        new MouseEvent('mousedown', {
          bubbles: true,
          cancelable: true,
          button: 0,
        }),
      );
    }
    target.click();
  } finally {
    suppressingIosImmediatePulse = false;
  }
}

function flushPendingIosActivation(): void {
  const target = pendingIosTarget;
  if (!target) return;
  pendingIosTarget = null;
  activateTarget(target);
}

/**
 * Ensures the shared, viewport-anchored native `<input type="checkbox" switch>`
 * exists in `document.body` so WebKit keeps a live switch renderer ready before
 * the user's first physical tap on any `<label for={IOS_HAPTIC_SWITCH_ID}>`.
 */
export function ensureIosHapticSwitch(): HTMLInputElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  if (hapticInput && document.body.contains(hapticInput)) {
    return hapticInput;
  }

  const input = document.createElement('input');
  input.id = IOS_HAPTIC_SWITCH_ID;
  input.type = 'checkbox';
  input.setAttribute('switch', '');
  input.tabIndex = -1;
  input.setAttribute('aria-hidden', 'true');
  // Keep intrinsic native switch dimensions inside the viewport without
  // `display: none` or `overflow: hidden` clipping so WebKit's RenderThemeIOS
  // fires `performSwitchHapticFeedback()` without scrolling or stealing touches.
  input.style.cssText =
    'position:fixed;top:0;left:0;opacity:0;pointer-events:none;margin:0;padding:0;border:0;z-index:-1;';
  input.addEventListener('change', flushPendingIosActivation);

  document.body.appendChild(input);
  hapticInput = input;
  return input;
}

function ensureImperativeLabel(): HTMLLabelElement | null {
  const input = ensureIosHapticSwitch();
  if (!input || !document.body) return null;
  if (imperativeLabel && document.body.contains(imperativeLabel)) {
    return imperativeLabel;
  }

  const label = document.createElement('label');
  label.htmlFor = IOS_HAPTIC_SWITCH_ID;
  label.setAttribute('aria-hidden', 'true');
  label.style.cssText =
    'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;margin:0;padding:0;z-index:-1;';

  document.body.appendChild(label);
  imperativeLabel = label;
  return label;
}

/**
 * Forwards activation to `target` right after Safari's native `<label>` click
 * toggles the shared `<input type="checkbox" switch>` and fires Taptic Engine
 * feedback, keeping the `<label>` connected through `defaultEventHandler` and
 * staying inside the synchronous user gesture via the switch's `change` event.
 */
export function scheduleIosHapticActivation(target: HTMLElement | null): void {
  if (!target) return;
  ensureIosHapticSwitch();
  pendingIosTarget = target;
  queueMicrotask(flushPendingIosActivation);
}

function pulseIosSwitch(): void {
  const label = ensureImperativeLabel();
  if (!label) return;
  label.click();
}

function patternDurationMs(pattern: number | number[]): number {
  return Array.isArray(pattern)
    ? pattern.reduce((sum, ms) => sum + ms, 0)
    : pattern;
}

const VIBRATE_PATTERNS: Record<
  HapticStrength,
  Record<HapticStyle, number | number[]>
> = {
  prominent: {
    selection: 12,
    light: 16,
    medium: 26,
    heavy: [18, 28, 32],
    success: [18, 45, 34],
    // Multi-habit day choreography (DailyHabitProgressIndicator):
    // 0ms tap -> 340ms ring fuse + ripple -> 640ms checkmark downstroke + upstroke pop
    allDone: [20, 320, 36, 264, 20, 55, 55],
    // Single-habit day choreography (DailyHabitProgressIndicator):
    // 0ms tap -> 420ms ring connect + ripple -> 500ms checkmark downstroke + upstroke pop
    allDoneSingle: [20, 400, 36, 44, 20, 55, 55],
    achievement: [24, 50, 24, 50, 60],
    warning: [36, 50, 42],
    error: [35, 35, 35, 35, 50],
  },
  subtle: {
    selection: 8,
    light: 10,
    medium: 16,
    heavy: 22,
    success: [12, 40, 22],
    allDone: [14, 326, 24, 276, 14, 55, 32],
    allDoneSingle: [14, 406, 24, 56, 14, 55, 32],
    achievement: [16, 45, 16, 45, 36],
    warning: [22, 45, 24],
    error: [22, 35, 22, 35, 28],
  },
};

const CELEBRATION_STYLES = new Set<HapticStyle>(['allDone', 'allDoneSingle']);

const PROMINENT_IOS_DOUBLE_PULSE_STYLES = new Set<HapticStyle>([
  'heavy',
  'success',
  'allDone',
  'allDoneSingle',
  'warning',
  'error',
]);

/**
 * Triggers native haptic feedback when enabled in user preferences.
 * On iOS 26.5+, direct physical taps on `<IosHapticTarget>` / `<IosSwitch>` fire
 * the Taptic Engine natively; this helper also drives Android `navigator.vibrate`
 * waveforms and the imperative switch fallback for gesture callbacks and iOS 17.4–26.4.
 * Pass `{ androidOnly: true }` for async calls after an `await` or timer.
 * Respects the app's own Haptic Feedback toggle independently of `prefers-reduced-motion`.
 */
export function triggerHaptic(
  style: HapticStyle = 'light',
  options?: HapticOptions,
): void {
  if (typeof window === 'undefined') return;
  const { hapticsEnabled, hapticStrength } = getPreferences();
  if (!hapticsEnabled) {
    if (pendingIosPulseTimer !== null) {
      window.clearTimeout(pendingIosPulseTimer);
      pendingIosPulseTimer = null;
    }
    if (pendingQueuedVibrateTimer !== null) {
      window.clearTimeout(pendingQueuedVibrateTimer);
      pendingQueuedVibrateTimer = null;
    }
    return;
  }

  const androidOnly = options?.androidOnly === true;

  // Android / browsers supporting the Vibration API.
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.vibrate === 'function'
  ) {
    if (pendingQueuedVibrateTimer !== null) {
      window.clearTimeout(pendingQueuedVibrateTimer);
      pendingQueuedVibrateTimer = null;
    }

    const pattern = VIBRATE_PATTERNS[hapticStrength][style];

    // Let an active all-done celebration finish before playing an async achievement fanfare.
    if (style === 'achievement') {
      const remainingMs = activeCelebrationEndsAt - Date.now();
      if (remainingMs > 0 && remainingMs <= 5000) {
        pendingQueuedVibrateTimer = window.setTimeout(() => {
          pendingQueuedVibrateTimer = null;
          const latest = getPreferences();
          if (!latest.hapticsEnabled) return;
          try {
            navigator.vibrate(
              VIBRATE_PATTERNS[latest.hapticStrength].achievement,
            );
          } catch {
            // Ignore delayed vibrate errors
          }
        }, remainingMs + QUEUED_ACHIEVEMENT_GAP_MS);
        return;
      }
    }

    try {
      navigator.vibrate(pattern);
      activeCelebrationEndsAt = CELEBRATION_STYLES.has(style)
        ? Date.now() + patternDurationMs(pattern)
        : 0;
      return;
    } catch {
      if (androidOnly) return;
      // Fall through to iOS switch haptic for synchronous gesture calls
    }
  }

  // Async/timer haptics never touch the iOS switch or cancel a waiting pulse.
  if (androidOnly) return;

  if (pendingIosPulseTimer !== null) {
    window.clearTimeout(pendingIosPulseTimer);
    pendingIosPulseTimer = null;
  }

  // iOS Taptic Engine via native checkbox switch toggle.
  // Skip the immediate imperative click when a direct tap on an overlay `<label>`
  // or native `IosSwitch` already triggered Safari's switch haptic.
  const alreadyFiredNatively =
    suppressingIosImmediatePulse || options?.iosNativeHandled === true;

  try {
    if (!alreadyFiredNatively) {
      pulseIosSwitch();
    }
    if (
      hapticStrength === 'prominent' &&
      PROMINENT_IOS_DOUBLE_PULSE_STYLES.has(style)
    ) {
      pendingIosPulseTimer = window.setTimeout(() => {
        pendingIosPulseTimer = null;
        if (!getPreferences().hapticsEnabled) return;
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
