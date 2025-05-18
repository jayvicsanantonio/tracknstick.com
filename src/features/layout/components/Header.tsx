import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useContext } from "react";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";
const { CheckCircle2, Edit, Moon, Plus, Sun, BarChart2 } = MiscellaneousIcons;

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const {
    toggleShowAddHabitDialog,
    toggleisHabitsOverviewMode,
    isHabitsOverviewMode,
    isProgressOverviewMode,
    toggleisProgressOverviewMode,
  } = useHabitsContext();

  return (
    <header className="flex items-center justify-between py-4 sm:py-8">
      <div className="flex items-center">
        <CheckCircle2
          className={`h-8 w-8 sm:h-10 sm:w-10 mr-2 transition-transform duration-300 hover:scale-110 ${
            isDarkMode ? "text-purple-500" : "text-purple-600"
          }`}
        />
        <span
          className={`hidden sm:inline-block text-lg sm:text-xl md:text-2xl font-bold ${
            isDarkMode ? "text-purple-300" : "text-purple-800"
          } pl-1`}
        >
          Track N&apos; Stick
        </span>
      </div>
      <div className="flex items-center">
        <SignedIn>
          <div className="flex space-x-2 sm:space-x-3 bg-opacity-20 rounded-full p-1 sm:p-2 transition-all duration-300 hover:bg-opacity-30">
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
                  : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
              }`}
              onClick={toggleShowAddHabitDialog}
              aria-label="Add Habit"
            >
              <Plus className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isHabitsOverviewMode
                  ? "bg-purple-500 shadow-purple-500/50"
                  : isDarkMode
                    ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
                    : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
              }`}
              onClick={toggleisHabitsOverviewMode}
              aria-label="Toggle Edit Mode"
            >
              <Edit className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isProgressOverviewMode
                  ? "bg-purple-500 shadow-purple-500/50"
                  : isDarkMode
                    ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
                    : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
              }`}
              aria-label="Manage Habits"
              onClick={toggleisProgressOverviewMode}
            >
              <BarChart2 className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
                  : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
              }`}
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 sm:h-6 sm:w-6" />
              ) : (
                <Moon className="h-4 w-4 sm:h-6 sm:w-6" />
              )}
            </Button>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    "min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 shadow-md transition-all duration-300 hover:bg-purple-600 hover:shadow-purple-600/50",
                },
              }}
            />
          </div>
        </SignedIn>
        <SignedOut>
          <Button
            className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
              isDarkMode
                ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
                : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
            }`}
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun className="h-4 w-4 sm:h-6 sm:w-6" />
            ) : (
              <Moon className="h-4 w-4 sm:h-6 sm:w-6" />
            )}
          </Button>
        </SignedOut>
      </div>
    </header>
  );
}
