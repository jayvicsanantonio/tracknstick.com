import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/features/layout/components/Welcome";
import DailyHabitTracker from "@/features/habits/components/DailyHabitTracker";
import ProgressOverview from "@/features/progress/components/ProgressOverview";
import HabitsOverview from "@/features/habits/components/HabitsOverview";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";

export default function Body() {
  const { isHabitsOverviewMode, isProgressOverviewMode } = useHabitsContext();

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
