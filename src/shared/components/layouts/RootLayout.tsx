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
export const RootLayout = memo(function RootLayout() {
  return (
    <>
      <Header />
      <main className="relative">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 select-none [mask-image:radial-gradient(60%_60%_at_50%_20%,black,transparent)]"
        >
          <div className="bg-(--color-brand-light) dark:bg-(--color-brand-light) absolute -left-32 -top-24 h-72 w-72 rounded-full opacity-25 blur-3xl" />
          <div className="bg-(--color-accent) absolute right-0 top-40 h-80 w-80 rounded-full opacity-20 blur-3xl" />
        </div>
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
