import { useContext } from "react";
import { createBrowserRouter, Outlet } from "react-router-dom";
import { ThemeContext } from "@/context/ThemeContext";
import { HabitsStateProvider } from "@/features/habits/context/HabitsStateContext";
import Header from "@/features/layout/components/Header";
import AddHabitDialog from "@/features/habits/components/AddHabitDialog";
import Footer from "@/features/layout/components/Footer";
import EditHabitDialog from "@/features/habits/components/EditHabitDialog";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import HabitsOverview from "@/features/habits/components/HabitsOverview";
import ProgressOverview from "@/features/progress/components/ProgressOverview";
import AllHabitsOverview from "@/features/habits/components/AllHabitsOverview"; // Import the new component

// Main application layout component
function AppLayout() {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode
          ? "bg-gray-900 text-white bg-[radial-gradient(circle_at_top_right,rgba(147,51,234,0.05),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(147,51,234,0.08),transparent_40%)]"
          : "bg-purple-50 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.15),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent_40%)]"
      } px-2 sm:px-4 md:px-8 bg-fixed`}
    >
      <div className="w-full max-w-7xl mx-auto flex flex-col min-h-screen">
        <HabitsStateProvider>
          <Header />
          <main>
            <Outlet /> {/* Nested routes will render here */}
          </main>
          <Footer />
          <AddHabitDialog />
          <EditHabitDialog />
          <PWAInstallPrompt />
        </HabitsStateProvider>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HabitsOverview />,
      },
      {
        path: "progress",
        element: <ProgressOverview />,
      },
      {
        path: "/habits/overview", // New route for all habits overview
        element: <AllHabitsOverview />,
      },
    ],
  },
]);

// It's good practice to keep a default export if other parts of the app might still expect it,
// or for testing. However, for routing, we'll primarily use the named 'router' export.
// For now, we can export the AppLayout as default, or remove default export if not needed.
export default AppLayout;
