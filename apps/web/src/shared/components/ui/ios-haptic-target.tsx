// Direct-tap iOS Taptic Engine overlays for interactive buttons, tabs, and links.
// Renders a transparent sibling `<label for={IOS_HAPTIC_SWITCH_ID}>` on iOS when haptics are enabled so Safari registers a physical user tap on the native switch without blocking scroll.

import {
  useCallback,
  useEffect,
  useRef,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { usePreferences } from '@shared/hooks/usePreferences';
import {
  IOS_HAPTIC_SWITCH_ID,
  ensureIosHapticSwitch,
  isIosDevice,
  scheduleIosHapticActivation,
} from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';

const INTERACTIVE_SELECTOR =
  'button, a[href], [role="button"], [role="tab"], [role="radio"], [role="gridcell"]';

function isTargetDisabled(target: HTMLElement): boolean {
  if ('disabled' in target && Boolean((target as HTMLButtonElement).disabled)) {
    return true;
  }
  return target.getAttribute('aria-disabled') === 'true';
}

export interface IosHapticOverlayProps {
  /** Underlying interactive element activated after Safari toggles the native switch. */
  targetRef: RefObject<HTMLElement | null>;
  /** Disables the overlay (e.g., disabled controls or silent no-op retaps). */
  disabled?: boolean;
  /** Optional dynamic guard to suppress activation (e.g., after a long-press or swipe). */
  shouldSuppressTap?: () => boolean;
  className?: string;
}

/**
 * Transparent sibling `<label>` overlay for components that already have a
 * positioned (`relative`) wrapper around their interactive control.
 */
export function IosHapticOverlay({
  targetRef,
  disabled = false,
  shouldSuppressTap,
  className,
}: IosHapticOverlayProps) {
  const { hapticsEnabled } = usePreferences();
  const active = isIosDevice() && hapticsEnabled && !disabled;

  useEffect(() => {
    if (active) {
      ensureIosHapticSwitch();
    }
  }, [active]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLLabelElement>) => {
      const target = targetRef.current;
      if (!target || shouldSuppressTap?.() || isTargetDisabled(target)) {
        event.preventDefault();
        return;
      }
      event.stopPropagation();
      scheduleIosHapticActivation(target);
    },
    [shouldSuppressTap, targetRef],
  );

  if (!active) return null;

  return (
    <label
      htmlFor={IOS_HAPTIC_SWITCH_ID}
      aria-hidden="true"
      data-ios-haptic-overlay="true"
      onClick={handleClick}
      className={cn(
        'absolute inset-0 z-20 m-0 cursor-pointer touch-manipulation rounded-[inherit] opacity-0 select-none [-webkit-tap-highlight-color:transparent]',
        className,
      )}
    />
  );
}

export interface IosHapticTargetProps {
  children: ReactNode;
  /** Disables the overlay (returns children unwrapped). */
  disabled?: boolean;
  /** Optional dynamic guard to suppress activation (e.g., after a drag gesture). */
  shouldSuppressTap?: () => boolean;
  /** Layout classes applied to the `relative` wrapper when the iOS overlay is active. */
  className?: string;
  /** Optional explicit ref when multiple interactive controls exist inside children. */
  targetRef?: RefObject<HTMLElement | null>;
}

/**
 * Wraps a standalone interactive element with a sibling iOS switch `<label>`
 * overlay only on iOS devices with Haptic Feedback enabled; renders `children`
 * unwrapped everywhere else so desktop, Android, and E2E layouts stay untouched.
 */
export function IosHapticTarget({
  children,
  disabled = false,
  shouldSuppressTap,
  className,
  targetRef,
}: IosHapticTargetProps) {
  const { hapticsEnabled } = usePreferences();
  const containerRef = useRef<HTMLSpanElement>(null);
  const active = isIosDevice() && hapticsEnabled && !disabled;

  useEffect(() => {
    if (active) {
      ensureIosHapticSwitch();
    }
  }, [active]);

  const handleClick = useCallback(
    (event: MouseEvent<HTMLLabelElement>) => {
      const target =
        targetRef?.current ??
        containerRef.current?.querySelector<HTMLElement>(
          INTERACTIVE_SELECTOR,
        ) ??
        null;
      if (!target || shouldSuppressTap?.() || isTargetDisabled(target)) {
        event.preventDefault();
        return;
      }
      event.stopPropagation();
      scheduleIosHapticActivation(target);
    },
    [shouldSuppressTap, targetRef],
  );

  if (!active) {
    return <>{children}</>;
  }

  return (
    <span ref={containerRef} className={cn('relative inline-flex', className)}>
      {children}
      <label
        htmlFor={IOS_HAPTIC_SWITCH_ID}
        aria-hidden="true"
        data-ios-haptic-overlay="true"
        onClick={handleClick}
        className="absolute inset-0 z-20 m-0 cursor-pointer touch-manipulation rounded-[inherit] opacity-0 select-none [-webkit-tap-highlight-color:transparent]"
      />
    </span>
  );
}
