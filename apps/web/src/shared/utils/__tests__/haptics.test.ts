// Covers semantic Android vibrate waveforms (Prominent vs Subtle), unclipped
// viewport-anchored iOS switch haptics, direct-tap activation, and allDone queuing.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  IOS_HAPTIC_SWITCH_ID,
  ensureIosHapticSwitch,
  isIosDevice,
  scheduleIosHapticActivation,
  triggerHaptic,
} from '@shared/utils/haptics';
import { usePreferences } from '@shared/hooks/usePreferences';

describe('triggerHaptic & usePreferences', () => {
  const originalVibrateDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'vibrate',
  );
  const originalUserAgentDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'userAgent',
  );
  const originalPlatformDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'platform',
  );
  const originalMaxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'maxTouchPoints',
  );

  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(true);
      result.current.setHapticStrength('prominent');
      result.current.setSoundEnabled(true);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    if (originalVibrateDescriptor) {
      Object.defineProperty(navigator, 'vibrate', originalVibrateDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'vibrate');
    }
    if (originalUserAgentDescriptor) {
      Object.defineProperty(
        navigator,
        'userAgent',
        originalUserAgentDescriptor,
      );
    }
    if (originalPlatformDescriptor) {
      Object.defineProperty(navigator, 'platform', originalPlatformDescriptor);
    }
    if (originalMaxTouchPointsDescriptor) {
      Object.defineProperty(
        navigator,
        'maxTouchPoints',
        originalMaxTouchPointsDescriptor,
      );
    }
  });

  it('mounts an unclipped viewport-anchored native iOS switch in document.body', () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    triggerHaptic('selection');

    const switchInput = document.getElementById(
      IOS_HAPTIC_SWITCH_ID,
    ) as HTMLInputElement | null;
    expect(switchInput).not.toBeNull();
    expect(switchInput?.type).toBe('checkbox');
    expect(switchInput?.hasAttribute('switch')).toBe(true);
    expect(switchInput?.getAttribute('aria-hidden')).toBe('true');
    expect(switchInput?.parentElement).toBe(document.body);
    expect(switchInput?.style.position).toBe('fixed');
    expect(switchInput?.style.top).toBe('0px');
    expect(switchInput?.style.left).toBe('0px');
    expect(switchInput?.style.opacity).toBe('0');
    expect(switchInput?.style.pointerEvents).toBe('none');
    expect(switchInput?.style.display).not.toBe('none');
    expect(switchInput?.style.overflow).not.toBe('hidden');
  });

  it('detects iPhone and touch iPadOS devices without matching desktop browsers', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X) AppleWebKit/605.1.15',
    });
    expect(isIosDevice()).toBe(true);

    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15',
    });
    Object.defineProperty(navigator, 'platform', {
      configurable: true,
      value: 'MacIntel',
    });
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 5,
    });
    expect(isIosDevice()).toBe(true);

    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    });
    expect(isIosDevice()).toBe(false);
  });

  it('forwards direct-tap switch activation synchronously without double-clicking the imperative label', () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    // Ensure both the shared switch and imperative label exist first.
    triggerHaptic('selection');
    const switchInput = ensureIosHapticSwitch()!;
    const imperativeLabel = document.querySelector<HTMLLabelElement>(
      `label[for="${IOS_HAPTIC_SWITCH_ID}"]`,
    )!;
    const imperativeClickSpy = vi.spyOn(imperativeLabel, 'click');

    const button = document.createElement('button');
    const onButtonClick = vi.fn(() => {
      triggerHaptic('selection');
    });
    button.addEventListener('click', onButtonClick);
    document.body.appendChild(button);

    scheduleIosHapticActivation(button);
    // Simulate Safari's native `<label>` default action firing `change` on the switch.
    switchInput.checked = !switchInput.checked;
    switchInput.dispatchEvent(new Event('change', { bubbles: true }));

    expect(onButtonClick).toHaveBeenCalledTimes(1);
    expect(imperativeClickSpy).not.toHaveBeenCalled();

    button.remove();
  });

  it('uses distinct prominent and subtle Android vibration waveforms for multi- and single-habit days', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    triggerHaptic('selection');
    triggerHaptic('heavy');
    triggerHaptic('achievement', { androidOnly: true });
    triggerHaptic('allDone');
    triggerHaptic('allDoneSingle');
    triggerHaptic('warning');
    triggerHaptic('error', { androidOnly: true });
    triggerHaptic('success', { iosNativeHandled: true });

    expect(vibrate).toHaveBeenNthCalledWith(1, 12);
    expect(vibrate).toHaveBeenNthCalledWith(2, [18, 28, 32]);
    expect(vibrate).toHaveBeenNthCalledWith(3, [24, 50, 24, 50, 60]);
    expect(vibrate).toHaveBeenNthCalledWith(4, [20, 320, 36, 264, 20, 55, 55]);
    expect(vibrate).toHaveBeenNthCalledWith(5, [20, 400, 36, 44, 20, 55, 55]);
    expect(vibrate).toHaveBeenNthCalledWith(6, [36, 50, 42]);
    expect(vibrate).toHaveBeenNthCalledWith(7, [35, 35, 35, 35, 50]);
    expect(vibrate).toHaveBeenNthCalledWith(8, [18, 45, 34]);

    vibrate.mockClear();
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticStrength('subtle');
    });

    triggerHaptic('selection');
    triggerHaptic('heavy');
    triggerHaptic('allDoneSingle');
    triggerHaptic('error', { androidOnly: true });

    expect(vibrate).toHaveBeenNthCalledWith(1, 8);
    expect(vibrate).toHaveBeenNthCalledWith(2, 22);
    expect(vibrate).toHaveBeenNthCalledWith(3, [14, 406, 24, 56, 14, 55, 32]);
    expect(vibrate).toHaveBeenNthCalledWith(4, [22, 35, 22, 35, 28]);
  });

  it('waits for an active allDone celebration to finish before playing an achievement fanfare', () => {
    vi.useFakeTimers();
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    triggerHaptic('allDone');
    expect(vibrate).toHaveBeenCalledTimes(1);
    expect(vibrate).toHaveBeenLastCalledWith([20, 320, 36, 264, 20, 55, 55]);

    // Achievement resolves 200ms in, well before the 770ms allDone pattern finishes.
    vi.advanceTimersByTime(200);
    triggerHaptic('achievement', { androidOnly: true });
    expect(vibrate).toHaveBeenCalledTimes(1);

    // Still uninterrupted at 760ms.
    vi.advanceTimersByTime(560);
    expect(vibrate).toHaveBeenCalledTimes(1);

    // Fires after 770ms + 120ms gap (890ms total).
    vi.advanceTimersByTime(130);
    expect(vibrate).toHaveBeenCalledTimes(2);
    expect(vibrate).toHaveBeenLastCalledWith([24, 50, 24, 50, 60]);
  });

  it('keeps androidOnly haptics off the iOS switch path and preserves pending iOS pulses', () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    triggerHaptic('selection');
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${IOS_HAPTIC_SWITCH_ID}"]`,
    );
    expect(label).not.toBeNull();

    const clickSpy = vi.spyOn(label!, 'click');
    triggerHaptic('success');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // An async androidOnly error fired 20ms later neither clicks the switch nor cancels the 65ms pulse.
    vi.advanceTimersByTime(20);
    triggerHaptic('error', { androidOnly: true });
    expect(clickSpy).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(50);
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('keeps haptics active under prefers-reduced-motion when enabled in preferences', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (query: string) =>
        ({
          matches: query === '(prefers-reduced-motion: reduce)',
          media: query,
          onchange: null,
          addListener: vi.fn(),
          removeListener: vi.fn(),
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          dispatchEvent: vi.fn(),
        }) as MediaQueryList,
    );

    triggerHaptic('heavy');
    expect(vibrate).toHaveBeenCalledTimes(1);
  });

  it('cancels a pending delayed iOS pulse when a newer synchronous haptic fires', () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    triggerHaptic('selection');
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${IOS_HAPTIC_SWITCH_ID}"]`,
    );
    expect(label).not.toBeNull();

    const clickSpy = vi.spyOn(label!, 'click');
    triggerHaptic('error');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    // Firing a synchronous selection pulse before 65ms cancels the pending error follow-up.
    vi.advanceTimersByTime(30);
    triggerHaptic('selection');
    expect(clickSpy).toHaveBeenCalledTimes(2);

    vi.advanceTimersByTime(100);
    expect(clickSpy).toHaveBeenCalledTimes(2);
  });

  it('skips the delayed iOS follow-up pulse if haptics are disabled during the 65ms window', () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    triggerHaptic('selection');
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${IOS_HAPTIC_SWITCH_ID}"]`,
    );
    expect(label).not.toBeNull();

    const clickSpy = vi.spyOn(label!, 'click');
    triggerHaptic('success');
    expect(clickSpy).toHaveBeenCalledTimes(1);

    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(false);
    });

    vi.advanceTimersByTime(100);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('produces distinct iOS switch previews for subtle vs prominent heavy haptics', () => {
    vi.useFakeTimers();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    triggerHaptic('selection');
    const label = document.querySelector<HTMLLabelElement>(
      `label[for="${IOS_HAPTIC_SWITCH_ID}"]`,
    );
    expect(label).not.toBeNull();
    const clickSpy = vi.spyOn(label!, 'click');

    // Prominent heavy triggers initial pulse + 65ms follow-up pulse.
    triggerHaptic('heavy');
    vi.advanceTimersByTime(100);
    expect(clickSpy).toHaveBeenCalledTimes(2);

    // Subtle heavy triggers a single pulse.
    clickSpy.mockClear();
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticStrength('subtle');
    });
    triggerHaptic('heavy');
    vi.advanceTimersByTime(100);
    expect(clickSpy).toHaveBeenCalledTimes(1);
  });

  it('does nothing when hapticsEnabled is turned off in preferences', () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(false);
    });

    triggerHaptic('medium');
    expect(vibrate).not.toHaveBeenCalled();

    act(() => {
      result.current.setHapticsEnabled(true);
    });

    triggerHaptic('medium');
    expect(vibrate).toHaveBeenCalledTimes(1);
  });
});
