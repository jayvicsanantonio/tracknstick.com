import { useContext, useState } from "react";
import { useToggle } from "@/hooks/use-toggle";
import { Habit } from "@/features/habits/types";
import { ThemeContext } from "@/context/ThemeContext";
import Header from "@/components/common/Header";
import Body from "@/components/common/Body";
import AddHabitDialog from "@/components/common/AddHabitDialog";
import ProgressOverview from "@/components/common/ProgressOverview";
import Footer from "@/components/common/Footer";
import EditHabitDialog from "@/components/common/EditHabitDialog";

function App() {
  const { isDarkMode } = useContext(ThemeContext);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [isEditMode, toggleIsEditMode] = useToggle(false);
  const [showAddHabitDialog, toggleShowAddHabitDialog] = useToggle(false);
  const [showEditHabitDialog, toggleShowEditHabitDialog] = useToggle(false);
  const [isOverviewMode, toggleIsOverviewMode] = useToggle(false);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-purple-100"
      } p-4 sm:p-8`}
    >
      <div className="min-w-[400px] max-w-7xl mx-auto flex flex-col min-h-screen">
        <Header
          isEditMode={isEditMode}
          toggleShowAddHabitDialog={toggleShowAddHabitDialog}
          toggleIsEditMode={toggleIsEditMode}
          toggleIsOverviewMode={toggleIsOverviewMode}
        />

        <Body
          isEditMode={isEditMode}
          toggleShowAddHabitDialog={toggleShowAddHabitDialog}
          toggleShowEditHabitDialog={toggleShowEditHabitDialog}
          setEditingHabit={setEditingHabit}
        />
        <Footer />
      </div>
      <AddHabitDialog
        showAddHabitDialog={showAddHabitDialog}
        toggleShowAddHabitDialog={toggleShowAddHabitDialog}
      />
      <EditHabitDialog
        habit={editingHabit}
        showEditHabitDialog={showEditHabitDialog}
        toggleShowEditHabitDialog={toggleShowEditHabitDialog}
      />
      <ProgressOverview
        isOverviewMode={isOverviewMode}
        toggleIsOverviewMode={toggleIsOverviewMode}
      />
    </div>
  );
}

export default App;
