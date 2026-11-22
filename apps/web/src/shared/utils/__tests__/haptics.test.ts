// Covers native iOS Safari 17.4+ switch haptics, Android vibrate fallback,
// and honouring the user's Haptic Feedback preference toggle.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { triggerHaptic } from '@shared/utils/haptics';
import { usePreferences } from '@shared/hooks/usePreferences';

describe('triggerHaptic & usePreferences', () => {
  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(true);
      result.current.setSoundEnabled(true);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('creates and triggers a hidden iOS checkbox switch element when vibrate is absent', () => {
    const originalDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'vibrate',
    );
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

    if (originalDescriptor) {
      Object.defineProperty(navigator, 'vibrate', originalDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'vibrate');
    }
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
