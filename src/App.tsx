import { useState } from "react";
import { useToggle } from "@/hooks/use-toggle";
import { Habit } from "@/types/habit";
import Header from "@/components/common/Header";
import Welcome from "@/components/common/Welcome";
import HabitDetailsDialog from "@/components/common/HabitDetailsDialog";
import DailyHabitTracker from "@/components/common/DailyHabitTracker";
import Footer from "@/components/common/Footer";

const data: Habit[] = [
  {
    id: "1",
    name: "Read",
    completed: false,
    icon: "Book",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "2",
    name: "Exercise",
    completed: false,
    icon: "Dumbbell",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "3",
    name: "Meditate",
    completed: false,
    icon: "Brain",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "4",
    name: "Drink Water",
    completed: false,
    icon: "Coffee",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "5",
    name: "Cycle",
    completed: false,
    icon: "Bike",
    frequency: ["Tue", "Thu"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "6",
    name: "Code",
    completed: false,
    icon: "Code",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "7",
    name: "Paint",
    completed: false,
    icon: "Palette",
    frequency: ["Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "8",
    name: "Listen to Music",
    completed: false,
    icon: "Music",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "9",
    name: "Practice Instrument",
    completed: false,
    icon: "Music",
    frequency: ["Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "10",
    name: "Journal",
    completed: false,
    icon: "Pencil",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "11",
    name: "Take Photos",
    completed: false,
    icon: "Camera",
    frequency: ["Sat"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "12",
    name: "Learn Language",
    completed: false,
    icon: "Book",
    frequency: ["Wed"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "13",
    name: "Work on Project",
    completed: false,
    icon: "Briefcase",
    frequency: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "14",
    name: "Listen to Podcast",
    completed: false,
    icon: "Headphones",
    frequency: ["Sat", "Sun"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
  {
    id: "15",
    name: "Yoga",
    completed: false,
    icon: "Heart",
    frequency: ["Mon", "Wed", "Fri"],
    stats: {
      streak: 7,
      totalCompletions: 14,
      lastCompleted: "2023-01-01T00:00:00.000Z",
    },
  },
];

function App() {
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habits, setHabits] = useState<Habit[]>(data);
  const [isEditMode, toggleIsEditMode] = useToggle(false);
  const [isDarkMode, toggleDarkMode] = useToggle(false);
  const [isEditingHabit, toggleIsEditingHabit] = useToggle(false);
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
          toggleIsEditMode={toggleIsEditMode}
          toggleDarkMode={toggleDarkMode}
        />
        <div className="flex-1">
          {isNewUser ? (
            <Welcome isDarkMode={isDarkMode} />
          ) : (
            <DailyHabitTracker
              isDarkMode={isDarkMode}
              isEditMode={isEditMode}
              habits={habits}
              setHabits={setHabits}
              toggleIsEditingHabit={toggleIsEditingHabit}
              setEditingHabit={setEditingHabit}
            />
          )}
        </div>
        <Footer isDarkMode={isDarkMode} />
      </div>
      <HabitDetailsDialog
        habit={editingHabit}
        setHabit={(habit) => setHabits([...habits, habit])}
        isDarkMode={isDarkMode}
        isEditingHabit={isEditingHabit}
        toggleIsEditingHabit={toggleIsEditingHabit}
      />
    </div>
  );
}

export default App;
