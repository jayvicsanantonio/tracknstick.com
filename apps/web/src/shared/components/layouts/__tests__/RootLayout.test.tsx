// Covers the real auth gate.
// Body.tsx was a byte-identical copy of this block with no importer, and its
// test made the gate look covered while RootLayout itself was mocked away in
// every suite.

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, Link, RouterProvider } from 'react-router-dom';
import RootLayout from '../RootLayout';
import { preloadPages } from '@app/routes/pages';

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
vi.mock('@/features/layout/components/MobileTabBar', () => ({
  default: () => <nav data-testid="mobile-tab-bar" />,
}));
vi.mock('@features/chat/context/ChatConversationContext', () => ({
  ChatConversationProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="chat-conversation">{children}</div>
  ),
}));

vi.mock('@app/routes/pages', () => ({
  preloadPages: vi.fn(() => Promise.resolve()),
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
  it('shows Welcome and no routed content when signed out', async () => {
    mockAuth.isSignedIn = false;
    renderLayout();

    // Welcome is lazy-loaded, so it appears once its module has loaded.
    expect(await screen.findByTestId('welcome')).toBeInTheDocument();
    expect(screen.queryByTestId('outlet')).not.toBeInTheDocument();
  });

  it('includes a screen-reader heading for the signed-out view', () => {
    mockAuth.isSignedIn = false;
    renderLayout();

    expect(
      screen.getByRole('heading', { name: 'Welcome', level: 1 }),
    ).toBeInTheDocument();
  });

  it('renders the routed outlet inside the coach conversation when signed in', () => {
    mockAuth.isSignedIn = true;
    renderLayout();

    // The conversation outlives each page, so it wraps the routed outlet.
    expect(
      within(screen.getByTestId('chat-conversation')).getByTestId('outlet'),
    ).toBeInTheDocument();
    expect(screen.queryByTestId('welcome')).not.toBeInTheDocument();
  });

  it('shows the mobile tab bar only when signed in', async () => {
    mockAuth.isSignedIn = true;
    const { unmount } = renderLayout();
    expect(screen.getByTestId('mobile-tab-bar')).toBeInTheDocument();
    unmount();

    mockAuth.isSignedIn = false;
    renderLayout();
    expect(await screen.findByTestId('welcome')).toBeInTheDocument();
    expect(screen.queryByTestId('mobile-tab-bar')).not.toBeInTheDocument();
  });
});

describe('RootLayout tab pages', () => {
  beforeEach(() => {
    vi.mocked(preloadPages).mockClear();
  });

  it('preloads the tab pages once signed in', async () => {
    mockAuth.isSignedIn = true;
    renderLayout();

    await waitFor(() => expect(preloadPages).toHaveBeenCalledTimes(1));
  });

  it('does not download the tab pages for a signed-out visitor', async () => {
    mockAuth.isSignedIn = false;
    renderLayout();

    await screen.findByTestId('welcome');
    expect(preloadPages).not.toHaveBeenCalled();
  });
});

describe('RootLayout scroll positions', () => {
  let scrollY = 0;
  const scrollTo = vi.fn((_x: number, y: number) => {
    scrollY = y;
  });

  beforeEach(() => {
    mockAuth.isSignedIn = true;
    scrollY = 0;
    scrollTo.mockClear();
    vi.spyOn(window, 'scrollY', 'get').mockImplementation(() => scrollY);
    vi.stubGlobal('scrollTo', scrollTo);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function renderTabs() {
    const tab = (name: string) => (
      <>
        <p>{name} page</p>
        <Link to="/">Tracker</Link>
        <Link to="/habits">Habits</Link>
      </>
    );
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <RootLayout />,
          children: [
            { index: true, element: tab('Tracker') },
            { path: 'habits', element: tab('Habits') },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );
    render(<RouterProvider router={router} />);
  }

  it('opens a tab at its top, wherever the last tab was scrolled to', async () => {
    renderTabs();
    scrollY = 600;

    await userEvent.click(screen.getByRole('link', { name: 'Habits' }));

    await screen.findByText('Habits page');
    expect(scrollTo).toHaveBeenLastCalledWith(0, 0);
  });

  it('returns to a tab where it was left, as a native tab bar does', async () => {
    renderTabs();
    scrollY = 600;
    await userEvent.click(screen.getByRole('link', { name: 'Habits' }));
    await screen.findByText('Habits page');

    await userEvent.click(screen.getByRole('link', { name: 'Tracker' }));

    await screen.findByText('Tracker page');
    expect(scrollTo).toHaveBeenLastCalledWith(0, 600);
  });
});
