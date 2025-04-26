import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/components/common/Welcome";
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
