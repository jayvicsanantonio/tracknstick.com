import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/features/layout/components/Welcome";
import DailyHabitTracker from "@/features/habits/components/DailyHabitTracker";
import ProgressOverview from "@/features/progress/components/ProgressOverview";

export default function Body() {
  return (
    <>
      <SignedOut>
        <Welcome />
      </SignedOut>
      <SignedIn>
        <DailyHabitTracker />
        <ProgressOverview />
      </SignedIn>
    </>
  );
}
