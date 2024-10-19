import { BarChart2, CheckCircle2, Edit, Plus, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header({
  isDarkMode,
  isEditMode,
  toggleEditMode,
  toggleDarkMode,
}: {
  isDarkMode: boolean;
  isEditMode: boolean;
  toggleEditMode: () => void;
  toggleDarkMode: () => void;
}) {
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
          HabitHub
        </span>
      </div>
      <div className="flex items-center space-x-4">
        <Button className="rounded-full w-10 h-10 p-0 bg-purple-600 hover:bg-purple-700">
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
          onClick={toggleEditMode}
        >
          <Edit className="h-6 w-6" />
        </Button>
        <Button
          className={`rounded-full w-10 h-10 p-0 ${
            isDarkMode
              ? "bg-purple-700 hover:bg-purple-600"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          <BarChart2 className="h-6 w-6" />
        </Button>
        <Button
          className={`rounded-full w-10 h-10 p-0 ${
            isDarkMode
              ? "bg-purple-700 hover:bg-purple-600"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
          onClick={toggleDarkMode}
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
