import { lazy, memo, Suspense, useEffect } from 'react';
import { Outlet, ScrollRestoration, type Location } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Header from '@/features/layout/components/Header';
import Footer from '@/features/layout/components/Footer';
import MobileTabBar from '@/features/layout/components/MobileTabBar';
import { ChatConversationProvider } from '@features/chat/context/ChatConversationContext';
import { preloadPages } from '@app/routes/pages';

// Only signed-out visitors see the welcome page, so it loads on demand and
// signed-in users never download it.
const Welcome = lazy(() => import('@/features/layout/components/Welcome'));

/**
 * Each tab keeps its own scroll position, as on a native tab bar: a tab
 * opens where it was left, and at its top on a first visit. Keyed by path,
 * so a tab's place survives leaving it however the user comes back.
 */
function scrollKeyOf(location: Location) {
  return location.pathname;
}

/** Loads the tab pages in the background once a user is signed in. */
function PreloadPages() {
  useEffect(() => {
    void preloadPages();
  }, []);
  return null;
}

/**
 * Root layout component that handles authentication-based rendering
 *
 * This layout wraps all routes and conditionally renders content based on
 * authentication status:
 * - When signed in: Renders the matched route component via Outlet
 * - When signed out: Renders the Welcome component
 */
const RootLayout = memo(function RootLayout() {
  return (
    <>
      <ScrollRestoration getKey={scrollKeyOf} />
      <Header />
      {/* Pages fill the main column, so the footer sits at the foot of the
          screen however short a page is or while it loads. On phones the main
          column also reaches the tab bar, which keeps the footer tucked under
          it, below the content, rather than on show above it. */}
      <main className="relative flex min-h-0 flex-1 flex-col max-sm:min-h-[calc(100dvh-10rem)]">
        <SignedOut>
          <h1 className="sr-only">Welcome</h1>
          <Suspense fallback={null}>
            <Welcome />
          </Suspense>
        </SignedOut>
        <SignedIn>
          <PreloadPages />
          {/* The coach conversation outlives each page, so it wraps them. */}
          <ChatConversationProvider>
            <Outlet />
          </ChatConversationProvider>
        </SignedIn>
      </main>
      <Footer />
      <SignedIn>
        {/* Keeps the footer clear of the fixed tab bar on phones. */}
        <div aria-hidden="true" className="h-24 sm:hidden" />
        <MobileTabBar />
      </SignedIn>
    </>
  );
});

export default RootLayout;
