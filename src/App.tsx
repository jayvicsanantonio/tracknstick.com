import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";
import { HabitsStateProvider } from "@/features/habits/context/HabitsStateContext";
import Header from "@/components/common/Header";
import Body from "@/components/common/Body";
import AddHabitDialog from "@/features/habits/components/AddHabitDialog";
import ProgressOverview from "@/components/common/ProgressOverview";
import Footer from "@/components/common/Footer";
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
