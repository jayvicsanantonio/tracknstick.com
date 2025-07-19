import { SignedIn, SignedOut } from '@clerk/clerk-react';
import { Outlet } from 'react-router-dom';

import Welcome from '@/features/layout/components/Welcome';
import DailyHabitTracker from '@/features/habits/components/DailyHabitTracker';
import ProgressOverview from '@/features/progress/components/ProgressOverview';
import HabitsOverview from '@/features/habits/components/HabitsOverview';
import { useHabitsContext } from '@/features/habits/context/HabitsStateContext';
import { featureFlags } from '@/config/featureFlags';

export default function Body() {
  const { isHabitsOverviewMode, isProgressOverviewMode } = useHabitsContext();

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

  return (
    <>
      <SignedOut>
        <h1 className="sr-only">Welcome</h1>
        <Welcome />
      </SignedOut>
      <SignedIn>
        {isHabitsOverviewMode ? (
          <h1 className="sr-only">Habits Overview</h1>
        ) : isProgressOverviewMode ? (
          <h1 className="sr-only">Progress Overview</h1>
        ) : (
          <h1 className="sr-only">Daily Habit Tracker</h1>
        )}
        {isHabitsOverviewMode ? (
          <HabitsOverview />
        ) : isProgressOverviewMode ? (
          <ProgressOverview />
        ) : (
          <>
            <DailyHabitTracker />
          </>
        )}
      </SignedIn>
    </>
  );
}
