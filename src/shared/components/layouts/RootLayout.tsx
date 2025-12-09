import { memo } from 'react';
import { Outlet } from 'react-router-dom';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import Welcome from '@/features/layout/components/Welcome';
import Header from '@/features/layout/components/Header';
import Footer from '@/features/layout/components/Footer';

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
      <Header />
      <main className="relative min-h-0 flex-1">
        <SignedOut>
          <h1 className="sr-only">Welcome</h1>
          <Welcome />
        </SignedOut>
        <SignedIn>
          <Outlet />
        </SignedIn>
      </main>
      <Footer />
    </>
  );
});

export default RootLayout;
