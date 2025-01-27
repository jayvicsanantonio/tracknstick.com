import { useContext, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { useToggle } from "@/hooks/use-toggle";
import { Habit } from "@/types/habit";
import { ThemeContext } from "@/context/ThemeContext";
import Header from "@/components/common/Header";
import Body from "@/components/common/Body";
import AddHabitDialog from "@/components/common/AddHabitDialog";
import ProgressOverview from "@/components/common/ProgressOverview";
import Footer from "@/components/common/Footer";
import EditHabitDialog from "@/components/common/EditHabitDialog";

const defaultData: Habit[] = [
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

const X_API_KEY: string = import.meta.env.VITE_X_API_KEY as string;
const API_HOST: string = import.meta.env.VITE_API_HOST as string;

const client = axios.create({
  baseURL: `${API_HOST}`,
  headers: { "X-API-Key": X_API_KEY },
});

function App() {
  const { data = [], isLoading } = useSWR<Habit[]>("/habits", fetcher);
  const { isDarkMode } = useContext(ThemeContext);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [habits, setHabits] = useState<Habit[]>(data);
  const [isEditMode, toggleIsEditMode] = useToggle(false);
  const [showAddHabitDialog, toggleShowAddHabitDialog] = useToggle(false);
  const [showEditHabitDialog, toggleShowEditHabitDialog] = useToggle(false);
  const [isOverviewMode, toggleIsOverviewMode] = useToggle(false);

  async function fetcher(endpoint: string): Promise<Habit[]> {
    try {
      const response = await client.get<Habit[]>(`${endpoint}`);
      const fetchedData = response.data;

      return fetchedData.length === 0 ? defaultData : fetchedData;
    } catch (error) {
      console.error("Error fetching data:", error);
      throw error;
    }
  }

  if (isLoading) return <div>Loading...</div>;

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
          habits={habits}
          setHabits={setHabits}
          toggleShowAddHabitDialog={toggleShowAddHabitDialog}
          toggleShowEditHabitDialog={toggleShowEditHabitDialog}
          setEditingHabit={setEditingHabit}
        />
        <Footer />
      </div>
      <AddHabitDialog
        setHabit={(habit) => setHabits((prevHabits) => [...prevHabits, habit])}
        showAddHabitDialog={showAddHabitDialog}
        toggleShowAddHabitDialog={toggleShowAddHabitDialog}
      />
      <EditHabitDialog
        habit={editingHabit}
        setHabit={(habit) =>
          setHabits(habits.map((h) => (h.id === habit.id ? habit : h)))
        }
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
