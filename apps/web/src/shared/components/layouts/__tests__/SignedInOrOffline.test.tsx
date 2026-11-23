// Covers the sign-in gate that also lets the last visit's user in while offline.
// Online it defers to Clerk's SignedIn; offline, before Clerk loads, it shows its children.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import SignedInOrOffline from '../SignedInOrOffline';

const mockOffline = vi.hoisted(() => ({ value: false }));
const mockAuth = vi.hoisted(() => ({ isSignedIn: false }));

vi.mock('@shared/hooks/useOfflineSession', () => ({
  useOfflineSession: () => mockOffline.value,
}));

vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) =>
    mockAuth.isSignedIn ? <>{children}</> : null,
}));

describe('SignedInOrOffline', () => {
  beforeEach(() => {
    mockOffline.value = false;
    mockAuth.isSignedIn = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows its children to a signed-in user', () => {
    mockAuth.isSignedIn = true;
    render(<SignedInOrOffline>Habits</SignedInOrOffline>);

    expect(screen.getByText('Habits')).toBeInTheDocument();
  });

  it('hides its children from a signed-out visitor', () => {
    render(<SignedInOrOffline>Habits</SignedInOrOffline>);

    expect(screen.queryByText('Habits')).not.toBeInTheDocument();
  });

  it("shows its children to the last visit's user while offline", () => {
    mockOffline.value = true;
    render(<SignedInOrOffline>Habits</SignedInOrOffline>);

    expect(screen.getByText('Habits')).toBeInTheDocument();
  });
});
