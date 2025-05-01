import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { HabitsStateProvider } from "@/features/habits/context/HabitsStateContext";
import Header from "@/features/layout/components/Header";
import Body from "@/features/layout/components/Body";
import AddHabitDialog from "@/features/habits/components/AddHabitDialog";
import ProgressOverview from "@/features/progress/components/ProgressOverview";
import Footer from "@/features/layout/components/Footer";
import EditHabitDialog from "@/features/habits/components/EditHabitDialog";

function App() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-purple-100"
      } p-4 sm:p-8`}
    >
      <div className="min-w-[400px] max-w-7xl mx-auto flex flex-col min-h-screen">
        <HabitsStateProvider>
          <Header />
          <Body />
          <Footer />
          <AddHabitDialog />
          <EditHabitDialog />
          <ProgressOverview />
        </HabitsStateProvider>
      </div>
    </div>
  );
}

export default App;
