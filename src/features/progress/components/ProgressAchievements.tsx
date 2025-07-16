import { ElementType } from "react";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: ElementType;
}

interface ProgressAchievementsProps {
  achievements: Achievement[];
}

export default function ProgressAchievements({
  achievements,
}: ProgressAchievementsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="p-4 rounded-lg bg-white dark:bg-purple-900/50 shadow-md flex items-center space-x-4"
        >
          <div
            aria-hidden="true"
            className="p-2 rounded-full bg-purple-100 dark:bg-purple-600"
          >
            <achievement.icon className="h-6 w-6 text-purple-600 dark:text-purple-300" />
          </div>
          <div>
            <h4 className="font-semibold text-purple-800 dark:text-purple-300">
              {achievement.name}
            </h4>
            <p className="text-sm text-zinc-600 dark:text-purple-400">
              {achievement.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
