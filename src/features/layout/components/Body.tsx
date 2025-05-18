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
        <Welcome />
      </SignedOut>
      <SignedIn>
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
