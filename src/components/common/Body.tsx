import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/components/common/Welcome";
import DailyHabitTracker from "@/components/common/DailyHabitTracker";
import { Habit } from "@/types/habit";

export default function Body({
  isEditMode,
  habits,
  toggleShowEditHabitDialog,
  setEditingHabit,
}: {
  isEditMode: boolean;
  habits: Habit[];
  toggleShowAddHabitDialog: () => void;
  toggleShowEditHabitDialog: () => void;
  setEditingHabit: (habit: Habit | null) => void;
}) {
  return (
    <>
      <SignedOut>
        <Welcome />
      </SignedOut>
      <SignedIn>
        <DailyHabitTracker
          isEditMode={isEditMode}
          habits={habits}
          toggleIsEditingHabit={toggleShowEditHabitDialog}
          setEditingHabit={setEditingHabit}
        />
      </SignedIn>
    </>
  );
}
