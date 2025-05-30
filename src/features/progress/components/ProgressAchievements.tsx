import { ElementType } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: ElementType;
}

interface ProgressAchievementsProps {
  achievements: Achievement[];
  isDarkMode: boolean;
}

export default function ProgressAchievements({
  achievements,
  isDarkMode,
}: ProgressAchievementsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className={`p-4 rounded-lg ${isDarkMode ? "bg-purple-900/50" : "bg-white"} shadow-md flex items-center space-x-4`}
        >
          <div
            aria-hidden="true"
            className={`p-2 rounded-full ${isDarkMode ? "bg-purple-600" : "bg-purple-100"}`}
          >
            <achievement.icon
              className={`h-6 w-6 ${isDarkMode ? "text-purple-300" : "text-purple-600"}`}
            />
          </div>
          <div>
            <h4
              className={`font-semibold ${isDarkMode ? "text-purple-300" : "text-purple-800"}`}
            >
              {achievement.name}
            </h4>
            <p
              className={`text-sm ${isDarkMode ? "text-purple-400" : "text-gray-600"}`}
            >
              {achievement.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
