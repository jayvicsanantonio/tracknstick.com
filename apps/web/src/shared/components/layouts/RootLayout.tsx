import { lazy, memo, Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Header from '@/features/layout/components/Header';
import Footer from '@/features/layout/components/Footer';
import MobileTabBar from '@/features/layout/components/MobileTabBar';
import { ChatWidget } from '@/features/chat/components/ChatWidget';

// Only signed-out visitors see the welcome page, so it loads on demand and
// signed-in users never download it.
const Welcome = lazy(() => import('@/features/layout/components/Welcome'));

/**
 * Root layout component that handles authentication-based rendering
 *
 * This layout wraps all routes and conditionally renders content based on
 * authentication status:
 * - When signed in: Renders the matched route component via Outlet
 * - When signed out: Renders the Welcome component
 */
const RootLayout = memo(function RootLayout() {
  // Shared by the chat widget and the phone tab bar, which both open the chat.
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <>
      <Header />
      <main className="relative min-h-0 flex-1">
        <SignedOut>
          <h1 className="sr-only">Welcome</h1>
          <Suspense fallback={null}>
            <Welcome />
          </Suspense>
        </SignedOut>
        <SignedIn>
          <Outlet />
          <ChatWidget isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
        </SignedIn>
      </main>
      <Footer />
      <SignedIn>
        {/* Keeps the footer clear of the fixed tab bar on phones. */}
        <div aria-hidden="true" className="h-24 sm:hidden" />
        <MobileTabBar onOpenChat={() => setIsChatOpen(true)} />
      </SignedIn>
    </>
  );
});

export default RootLayout;
