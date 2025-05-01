import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/features/layout/components/Welcome";
import DailyHabitTracker from "@/features/habits/components/DailyHabitTracker";

export default function Body() {
  return (
    <>
      <SignedOut>
        <Welcome />
      </SignedOut>
      <SignedIn>
        <DailyHabitTracker />
      </SignedIn>
    </>
  );
}
