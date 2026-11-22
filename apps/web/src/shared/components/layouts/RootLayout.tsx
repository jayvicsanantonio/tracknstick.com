import { lazy, memo, Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ClerkLoading, SignedIn, SignedOut } from '@clerk/clerk-react';
import { Check } from 'lucide-react';
import Header from '@/features/layout/components/Header';
import Footer from '@/features/layout/components/Footer';
import MobileTabBar from '@/features/layout/components/MobileTabBar';
import { MobileShellProvider } from '@/features/layout/context/MobileShellContext';
import { ChatConversationProvider } from '@features/chat/context/ChatConversationContext';

// Only signed-out visitors see the welcome page, so it loads on demand and
// signed-in users never download it.
const Welcome = lazy(() => import('@/features/layout/components/Welcome'));

/**
 * Root layout component that handles authentication-based rendering
 *
 * - On phones (< sm): full-bleed native iOS shell — each page renders its own
 *   Collapsing Large Title nav bar, the iOS 26 Liquid Glass tab bar floats at
 *   the bottom, and website Header/Footer chrome stay hidden.
 * - On wider screens (sm+): classic glass Header, routed content, and Footer.
 */
const RootLayout = memo(function RootLayout() {
  return (
    <>
      <Header />
      <main className="relative flex min-h-0 flex-1 flex-col">
        <ClerkLoading>
          <div
            role="status"
            aria-label="Loading Track N' Stick"
            className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-24"
          >
            <span
              aria-hidden="true"
              className="flex size-16 animate-pulse items-center justify-center rounded-[20px] bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-lg motion-reduce:animate-none"
            >
              <Check className="size-8" strokeWidth={3} />
            </span>
          </div>
        </ClerkLoading>
        <SignedOut>
          <h1 className="sr-only">Welcome</h1>
          <Suspense fallback={null}>
            <Welcome />
          </Suspense>
        </SignedOut>
        <SignedIn>
          <MobileShellProvider>
            {/* The coach conversation outlives each page, so it wraps them. */}
            <ChatConversationProvider>
              <Outlet />
            </ChatConversationProvider>
          </MobileShellProvider>
        </SignedIn>
      </main>
      <Footer />
      <SignedIn>
        <MobileTabBar />
      </SignedIn>
    </>
  );
});

export default RootLayout;
