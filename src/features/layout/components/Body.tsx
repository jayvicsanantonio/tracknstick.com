import { memo } from 'react';
import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';
import Welcome from '@/features/layout/components/Welcome';

const Body = memo(function Body() {
  return (
    <>
      <SignedOut>
        <h1 className="sr-only">Welcome</h1>
        <Welcome />
      </SignedOut>
      <SignedIn>
        <Outlet />
      </SignedIn>
    </>
  );
});

export default Body;
