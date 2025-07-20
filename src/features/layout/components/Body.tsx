import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';

import Welcome from '@/features/layout/components/Welcome';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';
import { featureFlags } from '@/config/featureFlags';

export default function Body() {
  if (featureFlags.isUrlRoutingEnabled) {
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
  }

  // Legacy state-based navigation - default to Daily Habit Tracker
  return (
    <>
      <SignedOut>
        <h1 className="sr-only">Welcome</h1>
        <Welcome />
      </SignedOut>
      <SignedIn>
        <h1 className="sr-only">Daily Habit Tracker</h1>
        <DailyHabitTracker />
      </SignedIn>
    </>
  );
}
