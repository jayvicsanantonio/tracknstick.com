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
          className="p-4 rounded-lg bg-[var(--color-surface)] dark:bg-[var(--color-brand-light)] shadow-md flex items-center space-x-4"
        >
          <div
            aria-hidden="true"
            className="p-2 rounded-full bg-[var(--color-brand-light)] dark:bg-[var(--color-brand-primary)]"
          >
            <achievement.icon className="h-6 w-6 text-[var(--color-brand-primary)] dark:text-[var(--color-brand-text-light)]" />
          </div>
          <div>
            <h4 className="font-semibold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)]">
              {achievement.name}
            </h4>
            <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-brand-text-light)]">
              {achievement.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
