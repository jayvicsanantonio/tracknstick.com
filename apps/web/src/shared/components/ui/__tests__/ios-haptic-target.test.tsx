// Covers direct-tap iOS Taptic Engine overlays (`IosHapticTarget` & `IosHapticOverlay`)
// and native `<input type="checkbox" switch>` behavior in `IosSwitch`.

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { IosHapticTarget } from '@shared/components/ui/ios-haptic-target';
import IosSwitch from '@shared/components/ui/ios-switch';
import { Tabs, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { usePreferences } from '@shared/hooks/usePreferences';
import { IOS_HAPTIC_SWITCH_ID } from '@shared/utils/haptics';

const IPHONE_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1';
const DESKTOP_CHROME_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36';

describe('IosHapticTarget & native IosSwitch', () => {
  const originalUserAgentDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'userAgent',
  );
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
    });
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: undefined,
    });
  });

  afterEach(() => {
    if (originalUserAgentDescriptor) {
      Object.defineProperty(
        navigator,
        'userAgent',
        originalUserAgentDescriptor,
      );
    }
    if (originalVibrateDescriptor) {
      Object.defineProperty(navigator, 'vibrate', originalVibrateDescriptor);
    } else {
      Reflect.deleteProperty(navigator, 'vibrate');
    }
  });

  it('renders children unwrapped with no overlay on non-iOS browsers', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: DESKTOP_CHROME_UA,
    });

    const { container } = render(
      <IosHapticTarget>
        <button type="button">Mark complete</button>
      </IosHapticTarget>,
    );

    expect(
      container.querySelector('[data-ios-haptic-overlay]'),
    ).not.toBeInTheDocument();
    expect(container.firstElementChild?.tagName).toBe('BUTTON');
  });

  it('renders a transparent sibling switch label on iPhone and forwards taps through the shared native switch', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: IPHONE_UA,
    });

    const onClick = vi.fn();
    const { container } = render(
      <IosHapticTarget>
        <button type="button" onClick={onClick}>
          Mark complete
        </button>
      </IosHapticTarget>,
    );

    const switchInput = document.getElementById(
      IOS_HAPTIC_SWITCH_ID,
    ) as HTMLInputElement | null;
    expect(switchInput).not.toBeNull();
    expect(switchInput?.hasAttribute('switch')).toBe(true);

    const overlay = container.querySelector<HTMLLabelElement>(
      '[data-ios-haptic-overlay]',
    );
    expect(overlay).not.toBeNull();
    expect(overlay?.htmlFor).toBe(IOS_HAPTIC_SWITCH_ID);
    expect(overlay?.getAttribute('aria-hidden')).toBe('true');
    // Sibling of <button>, never nested inside it.
    expect(overlay?.closest('button')).toBeNull();

    const wasChecked = switchInput!.checked;
    await userEvent.click(overlay!);

    expect(switchInput!.checked).toBe(!wasChecked);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('activates Radix TabsTrigger via mousedown when tapped through the iPhone overlay', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: IPHONE_UA,
    });

    const onValueChange = vi.fn();
    const { container } = render(
      <Tabs value="edit" onValueChange={onValueChange}>
        <TabsList>
          <IosHapticTarget disabled>
            <TabsTrigger value="edit">Edit</TabsTrigger>
          </IosHapticTarget>
          <IosHapticTarget>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </IosHapticTarget>
        </TabsList>
      </Tabs>,
    );

    const overlays = container.querySelectorAll<HTMLLabelElement>(
      '[data-ios-haptic-overlay]',
    );
    // Only the inactive "Stats" tab renders a haptic overlay.
    expect(overlays).toHaveLength(1);

    await userEvent.click(overlays[0]);
    expect(onValueChange).toHaveBeenCalledWith('stats');
  });

  it('suppresses activation when shouldSuppressTap returns true or haptics are disabled', async () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: IPHONE_UA,
    });

    const onClick = vi.fn();
    const { container } = render(
      <IosHapticTarget shouldSuppressTap={() => true}>
        <button type="button" onClick={onClick}>
          Long-pressed habit
        </button>
      </IosHapticTarget>,
    );

    const switchInput = document.getElementById(
      IOS_HAPTIC_SWITCH_ID,
    ) as HTMLInputElement;
    const before = switchInput.checked;
    const overlay = container.querySelector<HTMLLabelElement>(
      '[data-ios-haptic-overlay]',
    )!;
    await userEvent.click(overlay);

    expect(onClick).not.toHaveBeenCalled();
    expect(switchInput.checked).toBe(before);

    // Turning Haptic Feedback OFF removes the overlay completely.
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(false);
    });
    expect(
      container.querySelector('[data-ios-haptic-overlay]'),
    ).not.toBeInTheDocument();
  });

  it('attaches Safari native switch attribute on IosSwitch according to haptics preference and behavior', () => {
    const onCheckedChange = vi.fn();
    const { rerender } = render(
      <IosSwitch
        id="pref-haptics"
        checked={true}
        onCheckedChange={onCheckedChange}
        ariaLabel="Haptic Feedback"
        nativeSwitchBehavior="onEnableOnly"
      />,
    );

    const masterSwitch = screen.getByRole('switch', {
      name: 'Haptic Feedback',
    });
    expect(masterSwitch.tagName).toBe('INPUT');
    expect(masterSwitch).toHaveAttribute('type', 'checkbox');
    // Turning Haptic Feedback OFF should stay silent on iOS.
    expect(masterSwitch.hasAttribute('switch')).toBe(false);

    // Turning Haptic Feedback back ON exposes the native iOS switch attribute.
    rerender(
      <IosSwitch
        id="pref-haptics"
        checked={false}
        onCheckedChange={onCheckedChange}
        ariaLabel="Haptic Feedback"
        nativeSwitchBehavior="onEnableOnly"
      />,
    );
    expect(masterSwitch.hasAttribute('switch')).toBe(true);

    // Regular switches attach `switch` only while Haptic Feedback is enabled.
    rerender(
      <IosSwitch
        id="pref-sounds"
        checked={true}
        onCheckedChange={onCheckedChange}
        ariaLabel="Sound Effects"
      />,
    );
    const soundSwitch = screen.getByRole('switch', {
      name: 'Sound Effects',
    });
    expect(soundSwitch.hasAttribute('switch')).toBe(true);

    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(false);
    });
    expect(soundSwitch.hasAttribute('switch')).toBe(false);
  });
});
