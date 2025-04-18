import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/components/common/Welcome";
import DailyHabitTracker from "@/components/common/DailyHabitTracker";

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
