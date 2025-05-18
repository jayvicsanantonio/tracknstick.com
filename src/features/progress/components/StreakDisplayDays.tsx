import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

export default function StreakDisplayDays({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`flex items-center ${
        isDarkMode ? "bg-purple-900/50" : "bg-purple-100"
      } rounded-lg p-4 shadow-md`}
      role="status"
      aria-label={`${label}: ${value} days`}
    >
      <span
        className={`text-4xl font-bold mr-2 ${
          isDarkMode ? "text-purple-300" : "text-purple-800"
        }`}
      >
        {value}
      </span>
      <div className="flex flex-col">
        <span
          className={`text-sm ${isDarkMode ? "text-purple-300" : "text-purple-800"}`}
        >
          {label}
        </span>
        <span
          className={`text-xs ${
            isDarkMode ? "text-purple-400" : "text-purple-600"
          }`}
        >
          days
        </span>
      </div>
    </div>
  );
}
