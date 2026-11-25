// Covers the native mobile Profile & Settings sheet:
// Appearance segmented control (System / Light / Dark), Haptics & Sound switches,
// Haptic Strength selector with live feel previews, Clerk account actions, and app info.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeProvider from '@app/providers/ThemeProvider';
import { usePreferences } from '@shared/hooks/usePreferences';
import ProfileSettingsSheet from '../ProfileSettingsSheet';

const openUserProfile = vi.fn();
const signOut = vi.fn();

vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      fullName: 'Ada Lovelace',
      firstName: 'Ada',
      primaryEmailAddress: { emailAddress: 'ada@example.com' },
      imageUrl: '',
    },
  }),
  useClerk: () => ({
    openUserProfile,
    signOut,
  }),
}));

function renderSheet(onOpenChange = vi.fn()) {
  return render(
    <ThemeProvider>
      <ProfileSettingsSheet open onOpenChange={onOpenChange} />
    </ThemeProvider>,
  );
}

describe('ProfileSettingsSheet', () => {
  const originalVibrateDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'vibrate',
  );
  const originalUserAgentDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'userAgent',
  );

  beforeEach(() => {
    localStorage.clear();
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.setHapticsEnabled(true);
      result.current.setHapticStrength('prominent');
      result.current.setSoundEnabled(true);
    });
    vi.clearAllMocks();
  });

  afterEach(() => {
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
  });

  it('displays the signed-in user, appearance controls, feedback switches, haptic strength, and app info', () => {
    renderSheet();

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Haptic Feedback' }),
    ).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Prominent' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Sound Effects' })).toBeChecked();
    expect(screen.getByText(/Track N' Stick/)).toBeInTheDocument();
  });

  it('switches appearance mode, toggles haptics with correct preview timing, and previews strength changes', async () => {
    const vibrate = vi.fn();
    Object.defineProperty(navigator, 'vibrate', {
      configurable: true,
      value: vibrate,
    });

    renderSheet();

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Switching Haptic Strength plays an immediate preview at the newly selected strength.
    vibrate.mockClear();
    await userEvent.click(screen.getByRole('radio', { name: 'Subtle' }));
    expect(screen.getByRole('radio', { name: 'Subtle' })).toBeChecked();
    expect(vibrate).toHaveBeenCalledWith(22);

    vibrate.mockClear();
    await userEvent.click(screen.getByRole('radio', { name: 'Prominent' }));
    expect(screen.getByRole('radio', { name: 'Prominent' })).toBeChecked();
    expect(vibrate).toHaveBeenCalledWith([18, 28, 32]);

    // Turning Haptic Feedback OFF hides strength control and stays silent.
    vibrate.mockClear();
    const haptics = screen.getByRole('switch', { name: 'Haptic Feedback' });
    await userEvent.click(haptics);
    expect(haptics).not.toBeChecked();
    expect(
      screen.queryByRole('radiogroup', { name: 'Haptic strength' }),
    ).not.toBeInTheDocument();
    expect(vibrate).not.toHaveBeenCalled();

    // Turning Haptic Feedback back ON immediately plays a confirmation pulse.
    await userEvent.click(haptics);
    expect(haptics).toBeChecked();
    expect(vibrate).toHaveBeenCalledWith([18, 45, 34]);
  });

  it('hides Haptic Strength on iOS devices while keeping the Haptic Feedback switch', () => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 26_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.5 Mobile/15E148 Safari/604.1',
    });

    renderSheet();

    expect(
      screen.getByRole('switch', { name: 'Haptic Feedback' }),
    ).toBeChecked();
    expect(
      screen.queryByRole('radiogroup', { name: 'Haptic strength' }),
    ).not.toBeInTheDocument();
  });

  it('invokes Clerk Manage Account and Sign Out actions', async () => {
    const onOpenChange = vi.fn();
    renderSheet(onOpenChange);

    await userEvent.click(
      screen.getByRole('button', { name: 'Manage Account' }),
    );
    expect(openUserProfile).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);

    await userEvent.click(screen.getByRole('button', { name: 'Sign Out' }));
    expect(signOut).toHaveBeenCalledWith({ redirectUrl: '/' });
  });
});
