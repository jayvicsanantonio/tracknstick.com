import { SignedIn, SignedOut } from "@clerk/clerk-react";

import Welcome from "@/components/common/Welcome";
import DailyHabitTracker from "@/components/common/DailyHabitTracker";
import { Habit } from "@/types/habit";

export default function Body({
  isEditMode,
  toggleShowAddHabitDialog,
  toggleShowEditHabitDialog,
  setEditingHabit,
}: {
  isEditMode: boolean;
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
          toggleIsEditingHabit={toggleShowEditHabitDialog}
          setEditingHabit={setEditingHabit}
          onAddHabitClick={toggleShowAddHabitDialog}
        />
      </SignedIn>
    </>
  );
}
