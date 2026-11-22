// Covers the native mobile Profile & Settings sheet:
// Appearance segmented control (System / Light / Dark), Haptics & Sound switches,
// Clerk account actions, and the relocated copyright line.

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeProvider from '@app/providers/ThemeProvider';
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
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('displays the signed-in user, appearance controls, feedback switches, and app info', () => {
    renderSheet();

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'System' })).toBeChecked();
    expect(
      screen.getByRole('switch', { name: 'Haptic Feedback' }),
    ).toBeChecked();
    expect(screen.getByRole('switch', { name: 'Sound Effects' })).toBeChecked();
    expect(screen.getByText(/Track N' Stick/)).toBeInTheDocument();
  });

  it('switches appearance mode and feedback toggles', async () => {
    renderSheet();

    await userEvent.click(screen.getByRole('radio', { name: 'Dark' }));
    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked();
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    const haptics = screen.getByRole('switch', { name: 'Haptic Feedback' });
    await userEvent.click(haptics);
    expect(haptics).not.toBeChecked();
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
