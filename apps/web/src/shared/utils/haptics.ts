// Tactile haptic feedback utility with semantic patterns and strength scaling.
// Uses `navigator.vibrate` waveforms on Android and Safari's native
// `<input type="checkbox" switch>` Taptic Engine primitive on iOS Safari 17.4+.

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
}

const IOS_SWITCH_ID = 'track-n-stick-haptic-switch';
const QUEUED_ACHIEVEMENT_GAP_MS = 120;

let hapticLabel: HTMLLabelElement | null = null;
let hapticInput: HTMLInputElement | null = null;
let pendingIosPulseTimer: number | null = null;
let pendingQueuedVibrateTimer: number | null = null;
let activeCelebrationEndsAt = 0;

function ensureSwitchElement(): HTMLLabelElement | null {
  if (typeof document === 'undefined' || !document.body) return null;
  if (hapticLabel && document.body.contains(hapticLabel)) {
    return hapticLabel;
  }

  const label = document.createElement('label');
  label.htmlFor = IOS_SWITCH_ID;
  label.setAttribute('aria-hidden', 'true');
  // Keep the 1x1 switch anchored inside the viewport so WebKit synthesizes
  // haptics without skipping off-screen controls.
  label.style.cssText =
    'position:fixed;bottom:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;margin:0;padding:0;';

  const input = document.createElement('input');
  input.id = IOS_SWITCH_ID;
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
 * Must be called synchronously inside a user pointer/click event handler on iOS;
 * pass `{ androidOnly: true }` for async calls after an `await` or timer.
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

  // iOS Safari 17.4+ Taptic Engine via native checkbox switch toggle.
  try {
    pulseIosSwitch();
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
