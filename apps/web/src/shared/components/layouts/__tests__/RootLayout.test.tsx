// Covers the real auth gate.
// Body.tsx was a byte-identical copy of this block with no importer, and its
// test made the gate look covered while RootLayout itself was mocked away in
// every suite.

import { describe, it, expect, vi, afterEach } from 'vitest';
import { act, render, screen, within } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import RootLayout from '../RootLayout';

const mockAuth = vi.hoisted(() => ({ isSignedIn: false }));
// The offline session as a store, so a test can change it after render the
// way a dropped or returning connection does.
const mockOffline = vi.hoisted(() => {
  const listeners = new Set<() => void>();
  const store = {
    value: false,
    set: (value: boolean) => {
      store.value = value;
      listeners.forEach((listener) => listener());
    },
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  return store;
});
const mockReloadPage = vi.hoisted(() => vi.fn());

vi.mock('@shared/hooks/useOfflineSession', async () => {
  const { useSyncExternalStore } = await import('react');
  return {
    useOfflineSession: () =>
      useSyncExternalStore(mockOffline.subscribe, () => mockOffline.value),
  };
});
vi.mock('@shared/utils/reloadPage', () => ({
  reloadPage: mockReloadPage,
}));

vi.mock('@clerk/clerk-react', () => ({
  ClerkLoading: () => null,
  SignedIn: ({ children }: { children: React.ReactNode }) =>
    mockAuth.isSignedIn ? <>{children}</> : null,
  SignedOut: ({ children }: { children: React.ReactNode }) =>
    mockAuth.isSignedIn ? null : <>{children}</>,
  useAuth: () => ({ isSignedIn: mockAuth.isSignedIn, getToken: vi.fn() }),
  useUser: () => ({ user: null }),
  useClerk: () => ({ openUserProfile: vi.fn(), signOut: vi.fn() }),
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

  describe('offline, before Clerk can load', () => {
    afterEach(() => {
      mockOffline.value = false;
      mockReloadPage.mockClear();
    });

    it("shows the last visit's user the routed content and tab bar", () => {
      mockAuth.isSignedIn = false;
      mockOffline.value = true;
      renderLayout();

      expect(screen.getByTestId('outlet')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-tab-bar')).toBeInTheDocument();
    });

    it('reloads when the connection returns, so Clerk can load', () => {
      mockOffline.value = true;
      renderLayout();
      expect(mockReloadPage).not.toHaveBeenCalled();

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(mockReloadPage).toHaveBeenCalledTimes(1);
    });

    it('still reloads when the page has seen the connection return first', () => {
      mockOffline.value = true;
      renderLayout();

      // In a browser, React re-renders between the 'online' event's
      // listeners, so the offline session can end before the reload's
      // listener runs.
      act(() => mockOffline.set(false));
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(mockReloadPage).toHaveBeenCalledTimes(1);
    });

    describe('when the app comes back to the foreground', () => {
      const showPage = (online: boolean) => {
        vi.spyOn(navigator, 'onLine', 'get').mockReturnValue(online);
        vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('visible');
        act(() => {
          document.dispatchEvent(new Event('visibilitychange'));
        });
      };

      afterEach(() => {
        vi.restoreAllMocks();
      });

      it('reloads with a connection, so Clerk can try again', () => {
        mockOffline.value = true;
        renderLayout();

        showPage(true);

        expect(mockReloadPage).toHaveBeenCalledTimes(1);
      });

      it('stays put while still offline', () => {
        mockOffline.value = true;
        renderLayout();

        showPage(false);

        expect(mockReloadPage).not.toHaveBeenCalled();
      });

      it('stays put while Clerk is in charge', () => {
        mockAuth.isSignedIn = true;
        renderLayout();

        showPage(true);

        expect(mockReloadPage).not.toHaveBeenCalled();
      });
    });

    it('does not reload on a reconnect while Clerk is in charge', () => {
      mockAuth.isSignedIn = true;
      renderLayout();

      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(mockReloadPage).not.toHaveBeenCalled();
    });
  });
});
