import { ElementType, memo } from 'react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: ElementType;
}

interface ProgressAchievementsProps {
  achievements: Achievement[];
}

const ProgressAchievements = memo(function ProgressAchievements({
  achievements,
}: ProgressAchievementsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {achievements.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-(--color-surface) dark:bg-(--color-brand-light) flex items-center space-x-4 rounded-lg p-4 shadow-md"
        >
          <div
            aria-hidden="true"
            className="bg-(--color-brand-light) dark:bg-(--color-brand-primary) rounded-full p-2"
          >
            <achievement.icon className="text-(--color-brand-primary) dark:text-(--color-brand-text-light) h-6 w-6" />
          </div>
          <div>
            <h4 className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) font-semibold">
              {achievement.name}
            </h4>
            <p className="text-(--color-text-secondary) dark:text-(--color-brand-text-light) text-sm">
              {achievement.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
});

export default ProgressAchievements;
