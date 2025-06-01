import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/features/layout/components/Welcome";
import DailyHabitTracker from "@/features/habits/components/DailyHabitTracker";
// Removed ProgressOverview and useHabitsContext imports as routing handles ProgressOverview
// and the old HabitsOverview logic is being replaced.

// This component now serves as the main content for the root path "/"
export default function HabitsOverview() {
  // The logic from the old Body.tsx is moved here.
  // It shows Welcome for signed-out users, and DailyHabitTracker for signed-in users.
  // The conditional rendering based on isHabitsOverviewMode or isProgressOverviewMode
  // is no longer needed here as this component is specifically for the "habits" (root) route.
  return (
    <>
      <SignedOut>
        {/* Screen reader text can be improved or moved to Welcome component if appropriate */}
        <h1 className="sr-only">Welcome</h1>
        <Welcome />
      </SignedOut>
      <SignedIn>
        {/* Screen reader text can be improved or moved to DailyHabitTracker if appropriate */}
        <h1 className="sr-only">Daily Habit Tracker</h1>
        <DailyHabitTracker />
      </SignedIn>
    </>
  );
}
