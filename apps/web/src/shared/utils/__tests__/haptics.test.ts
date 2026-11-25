// Covers semantic Android vibrate waveforms (Prominent vs Subtle), viewport-anchored
// iOS Safari 17.4+ switch haptics, async Android-only isolation, and allDone queuing.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { triggerHaptic } from '@shared/utils/haptics';
import { usePreferences } from '@shared/hooks/usePreferences';

describe('triggerHaptic & usePreferences', () => {
  const originalVibrateDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'vibrate',
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
  });

  it('creates and triggers a viewport-anchored hidden iOS switch element when vibrate is absent', () => {
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });

    triggerHaptic('selection');

    const switchInput = document.querySelector<HTMLInputElement>(
      'input[type="checkbox"][switch]',
    );
    expect(switchInput).not.toBeNull();
    expect(switchInput?.getAttribute('aria-hidden')).toBe('true');
    const label = switchInput?.closest('label');
    expect(label?.style.bottom).toBe('0px');
    expect(label?.style.left).toBe('0px');
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

    expect(vibrate).toHaveBeenNthCalledWith(1, 12);
    expect(vibrate).toHaveBeenNthCalledWith(2, [18, 28, 32]);
    expect(vibrate).toHaveBeenNthCalledWith(3, [24, 50, 24, 50, 60]);
    expect(vibrate).toHaveBeenNthCalledWith(4, [20, 320, 36, 264, 20, 55, 55]);
    expect(vibrate).toHaveBeenNthCalledWith(5, [20, 400, 36, 44, 20, 55, 55]);
    expect(vibrate).toHaveBeenNthCalledWith(6, [36, 50, 42]);
    expect(vibrate).toHaveBeenNthCalledWith(7, [35, 35, 35, 35, 50]);

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
    const label = document
      .querySelector('input[type="checkbox"][switch]')
      ?.closest('label');
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
    const label = document
      .querySelector('input[type="checkbox"][switch]')
      ?.closest('label');
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
    const label = document
      .querySelector('input[type="checkbox"][switch]')
      ?.closest('label');
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
    const label = document
      .querySelector('input[type="checkbox"][switch]')
      ?.closest('label');
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
