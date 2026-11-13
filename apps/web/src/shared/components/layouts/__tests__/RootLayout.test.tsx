// Covers the real auth gate.
// Body.tsx was a byte-identical copy of this block with no importer, and its
// test made the gate look covered while RootLayout itself was mocked away in
// every suite.

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '../RootLayout';

const mockAuth = vi.hoisted(() => ({ isSignedIn: false }));

vi.mock('@clerk/clerk-react', () => ({
  SignedIn: ({ children }: { children: React.ReactNode }) =>
    mockAuth.isSignedIn ? <>{children}</> : null,
  SignedOut: ({ children }: { children: React.ReactNode }) =>
    mockAuth.isSignedIn ? null : <>{children}</>,
  useAuth: () => ({ isSignedIn: mockAuth.isSignedIn, getToken: vi.fn() }),
  UserButton: () => <div />,
  SignInButton: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  SignUpButton: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock('@/features/layout/components/Welcome', () => ({
  default: () => <div data-testid="welcome" />,
}));
vi.mock('@/features/layout/components/Header', () => ({
  default: () => <header />,
}));
vi.mock('@/features/layout/components/Footer', () => ({
  default: () => <footer />,
}));
vi.mock('@/features/chat/components/ChatWidget', () => ({
  ChatWidget: () => <div data-testid="chat-widget" />,
}));

function renderLayout() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <RootLayout />,
        children: [{ index: true, element: <div data-testid="outlet" /> }],
      },
    ],
    { initialEntries: ['/'] },
  );
  return render(<RouterProvider router={router} />);
}

describe('RootLayout auth gate', () => {
  it('shows Welcome and no routed content when signed out', () => {
    mockAuth.isSignedIn = false;
    renderLayout();

    expect(screen.getByTestId('welcome')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('includes a screen-reader heading for the signed-out view', () => {
    mockAuth.isSignedIn = false;
    renderLayout();

    expect(
      screen.getByRole('heading', { name: 'Welcome', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders the routed outlet and chat widget when signed in', () => {
    mockAuth.isSignedIn = true;
    renderLayout();

    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument();
    expect(screen.queryByTestId('welcome')).not.toBeInTheDocument();
  });
});
