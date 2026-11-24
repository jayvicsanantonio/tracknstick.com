import { lazy, memo, Suspense, useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SignedOut, useClerk } from '@clerk/clerk-react';
import Header from '@/features/layout/components/Header';
import Footer from '@/features/layout/components/Footer';
import MobileTabBar from '@/features/layout/components/MobileTabBar';
import { MobileShellProvider } from '@/features/layout/context/MobileShellContext';
import { ChatConversationProvider } from '@features/chat/context/ChatConversationContext';
import { useHideSplash, useHoldSplash } from '@shared/hooks/useHideSplash';
import { useOfflineSession } from '@shared/hooks/useOfflineSession';
import { reloadPage } from '@shared/utils/reloadPage';

/**
 * Reloads when the app comes back to the foreground with a connection, so
 * that Clerk tries again after it gave up on one that got nowhere. Offline it
 * stays put: the reconnect reloads it instead.
 */
function reloadIfShownOnline() {
  if (document.visibilityState === 'visible' && navigator.onLine) {
    reloadPage();
  }
}
import SignedInOrOffline from './SignedInOrOffline';

// Only signed-out visitors see the welcome page, so it loads on demand and
// signed-in users never download it.
const Welcome = lazy(() => import('@/features/layout/components/Welcome'));

/**
 * The welcome page while its code downloads: nothing, and the launch splash
 * held up over it, so the splash fades straight onto the welcome page.
 */
function WelcomeLoading() {
  useHoldSplash(true);
  return null;
}

/**
 * Root layout component that handles authentication-based rendering
 *
 * - On phones (< sm): full-bleed native iOS shell — each page renders its own
 *   Collapsing Large Title nav bar, the iOS 26 Liquid Glass tab bar floats at
 *   the bottom, and website Header/Footer chrome stay hidden.
 * - On wider screens (sm+): classic glass Header, routed content, and Footer.
 *
 * Offline, Clerk cannot load, so the last visit's user sees the pages from
 * the service worker's cache, and the page reloads when the connection
 * returns, or when the app comes back to the foreground with one, so that
 * Clerk loads and takes over.
 */
const RootLayout = memo(function RootLayout() {
  const offline = useOfflineSession();
  const { status } = useClerk();
  // The launch splash in index.html covers the page until there is
  // something to show: Clerk's answer, or the last visit's user offline.
  // The page beneath holds it up while it loads (useHoldSplash).
  useHideSplash(offline || status !== 'loading');
  // Stays true once set: React re-renders between the 'online' event's
  // listeners, so the offline session can end before the reload's listener
  // runs, and a listener tied to it would be removed unrun.
  const [reloadWhenOnline, setReloadWhenOnline] = useState(false);

  useEffect(() => {
    if (offline) setReloadWhenOnline(true);
  }, [offline]);

  useEffect(() => {
    if (!reloadWhenOnline) return;
    window.addEventListener('online', reloadPage);
    document.addEventListener('visibilitychange', reloadIfShownOnline);
    return () => {
      window.removeEventListener('online', reloadPage);
      document.removeEventListener('visibilitychange', reloadIfShownOnline);
    };
  }, [reloadWhenOnline]);

  return (
    <>
      <Header />
      <main className="relative flex min-h-0 flex-1 flex-col">
        <SignedOut>
          <h1 className="sr-only">Welcome</h1>
          <Suspense fallback={<WelcomeLoading />}>
            <Welcome />
          </Suspense>
        </SignedOut>
        <SignedInOrOffline>
          <MobileShellProvider>
            {/* The coach conversation outlives each page, so it wraps them. */}
            <ChatConversationProvider>
              <Outlet />
            </ChatConversationProvider>
          </MobileShellProvider>
        </SignedInOrOffline>
      </main>
      <Footer />
      <SignedInOrOffline>
        <MobileTabBar />
      </SignedInOrOffline>
    </>
  );
});

export default RootLayout;
