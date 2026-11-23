// Covers when the app shell offers to install the app: only to a signed-in user.
// On the welcome page the prompt would cover a first-time visitor's Get started button.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

const mockAuth = vi.hoisted(() => ({ isSignedIn: false }));

vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) =>
    mockAuth.isSignedIn ? <>{children}</> : null,
  useAuth: () => ({
    isLoaded: true,
    userId: mockAuth.isSignedIn ? 'user_1' : null,
  }),
}));
vi.mock('@shared/components/feedback/PWAInstallPrompt', () => ({
  PWAInstallPrompt: () => <div data-testid="install-prompt" />,
}));
vi.mock('@features/habits/components/AddHabitDialog', () => ({
  default: () => null,
}));
vi.mock('@features/habits/components/EditHabitDialog', () => ({
  default: () => null,
}));

describe('App', () => {
  it('offers to install the app to a signed-in user', () => {
    mockAuth.isSignedIn = true;
    render(<App>page</App>);

    expect(screen.getByTestId('install-prompt')).toBeInTheDocument();
  });

  it('keeps the install prompt off the welcome page', () => {
    mockAuth.isSignedIn = false;
    render(<App>page</App>);

    expect(screen.getByText('page')).toBeInTheDocument();
    expect(screen.queryByTestId('install-prompt')).toBeNull();
  });
});
