import { ElementType } from 'react';

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
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="flex items-center space-x-4 rounded-lg bg-(--color-surface) p-4 shadow-md dark:bg-(--color-brand-light)"
        >
          <div
            aria-hidden="true"
            className="rounded-full bg-(--color-brand-light) p-2 dark:bg-(--color-brand-primary)"
          >
            <achievement.icon className="h-6 w-6 text-(--color-brand-primary) dark:text-(--color-brand-text-light)" />
          </div>
          <div>
            <h4 className="font-semibold text-(--color-brand-tertiary) dark:text-(--color-brand-text-light)">
              {achievement.name}
            </h4>
            <p className="text-sm text-(--color-text-secondary) dark:text-(--color-brand-text-light)">
              {achievement.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
