import { useState } from "react";
import { useToggle } from "@/hooks/use-toggle";
import { Habit } from "@/types/habit";
import Header from "@/components/common/Header";
import Welcome from "@/components/common/Welcome";
import Footer from "@/components/common/Footer";

const data: Habit[] = [
  {
    id: 1,
    name: "Read",
    completed: false,
    icon: "Book",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 2,
    name: "Exercise",
    completed: false,
    icon: "Dumbbell",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 3,
    name: "Meditate",
    completed: false,
    icon: "Brain",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 4,
    name: "Drink Water",
    completed: false,
    icon: "Coffee",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 5,
    name: "Cycle",
    completed: false,
    icon: "Bike",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 6,
    name: "Code",
    completed: false,
    icon: "Code",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 7,
    name: "Paint",
    completed: false,
    icon: "Palette",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 8,
    name: "Listen to Music",
    completed: false,
    icon: "Music",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 9,
    name: "Practice Instrument",
    completed: false,
    icon: "Music",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 10,
    name: "Journal",
    completed: false,
    icon: "Pencil",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 11,
    name: "Take Photos",
    completed: false,
    icon: "Camera",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 12,
    name: "Learn Language",
    completed: false,
    icon: "Book",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 13,
    name: "Work on Project",
    completed: false,
    icon: "Briefcase",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 14,
    name: "Listen to Podcast",
    completed: false,
    icon: "Headphones",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
  {
    id: 15,
    name: "Yoga",
    completed: false,
    icon: "Heart",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  },
];

function App() {
  const [habits] = useState<Habit[]>(null);
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const [isEditMode, toggleEditMode] = useToggle(false);
  const isNewUser = habits === null;

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? "bg-gray-900 text-white" : "bg-purple-100"
      } p-4 sm:p-8`}
    >
      <div className="max-w-7xl mx-auto flex flex-col min-h-screen">
        <Header
          isNewUser={isNewUser}
          isDarkMode={isDarkMode}
          isEditMode={isEditMode}
          toggleEditMode={toggleEditMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="flex-1">
          {isNewUser ? (
            <Welcome isDarkMode={isDarkMode} isNewUser={isNewUser} />
          ) : null}
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
    </div>
  );
}

export default App;
