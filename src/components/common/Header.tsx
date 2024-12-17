import { useContext } from "react";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
const { BarChart2, CheckCircle2, Edit, Moon, Plus, Sun } = MiscellaneousIcons;

export default function Header({
  isNewUser,
  isEditMode,
  toggleShowAddHabitDialog,
  toggleIsEditMode,
  toggleIsOverviewMode,
}: {
  isNewUser: boolean;
  isEditMode: boolean;
  toggleShowAddHabitDialog: () => void;
  toggleIsEditMode: () => void;
  toggleIsOverviewMode: () => void;
}) {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);

  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center">
        <CheckCircle2
          className={`h-8 w-8 ${
            isDarkMode ? "text-purple-400" : "text-purple-600"
          } mr-2`}
        />
        <span
          className={`text-2xl font-bold ${
            isDarkMode ? "text-purple-200" : "text-purple-800"
          }`}
        >
          Track N' Stick
        </span>
      </div>
      <div className="flex items-center space-x-4">
        {!isNewUser && (
          <>
            <Button
              className={`rounded-full w-10 h-10 p-0 ${
                isDarkMode
                  ? "bg-purple-700 hover:bg-purple-600"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
              onClick={toggleShowAddHabitDialog}
            >
              <Plus className="h-6 w-6" />
            </Button>
            <Button
              className={`rounded-full w-10 h-10 p-0 ${
                isEditMode
                  ? "bg-purple-400"
                  : isDarkMode
                  ? "bg-purple-700 hover:bg-purple-600"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
              onClick={toggleIsEditMode}
              aria-label="Toggle Edit Mode"
            >
              <Edit className="h-6 w-6" />
            </Button>
            <Button
              className={`rounded-full w-10 h-10 p-0 ${
                isDarkMode
                  ? "bg-purple-700 hover:bg-purple-600"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
              aria-label="Toggle Progress Overview"
              onClick={toggleIsOverviewMode}
            >
              <BarChart2 className="h-6 w-6" />
            </Button>
          </>
        )}
        <Button
          className={`rounded-full w-10 h-10 p-0 ${
            isDarkMode
              ? "bg-purple-700 hover:bg-purple-600"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
          onClick={toggleDarkMode}
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? (
            <Sun className="h-6 w-6" />
          ) : (
            <Moon className="h-6 w-6" />
          )}
        </Button>
      </div>
    </div>
  );
}
