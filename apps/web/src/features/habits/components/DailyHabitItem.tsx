import { memo, useCallback } from 'react';
import HabitsIcons from '@/icons/habits';
import MiscellaneousIcons from '@/icons/miscellaneous';
import StarAnimation from '@shared/components/ui/animations/StarAnimation';
import { Habit } from '@/features/habits/types/Habit';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import { useHabits } from '@/features/habits/hooks/useHabits';

const { Check } = MiscellaneousIcons;

interface DailyHabitItemProps {
  habit: Habit;
}

const DailyHabitItem = memo(function DailyHabitItem({
  habit,
}: DailyHabitItemProps) {
  const { toggleHabit, animatingHabitId } = useHabits();
  const Icon = HabitsIcons[habit.icon];

  const handleToggle = useCallback(() => {
    toggleHabit(habit.id).catch((error) => {
      console.error('Failed to toggle habit:', error);
    });
  }, [habit.id, toggleHabit]);

  return (
    <div
      key={habit.id}
      data-habit-item
      className="group flex flex-col items-center"
    >
      <div className="relative mb-3">
        <button
          className={`relative flex h-16 w-16 cursor-pointer items-center justify-center overflow-hidden rounded-full p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 outline-none ring-inset focus-visible:ring-[3px] focus-visible:ring-(--color-ring) sm:h-24 sm:w-24 md:h-28 md:w-28 ${
            habit.completed
              ? 'bg-(--color-brand-primary) ring-(--color-brand-primary)'
              : 'bg-(--color-surface)/60 ring-(--color-border-primary)/40 dark:bg-(--color-surface-secondary)/40'
          } transition-[transform,background-color] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 hover:scale-105 active:scale-90 active:duration-75 active:ease-out motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100`}
          onClick={handleToggle}
          aria-pressed={habit.completed}
          aria-label={
            habit.completed
              ? `Mark ${habit.name} as incomplete`
              : `Mark ${habit.name} as complete`
          }
        >
          {habit.completed ? (
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 z-0 rounded-full"
            />
          ) : null}
          <Icon
            aria-hidden="true"
            className={`relative z-10 h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14 ${
              habit.completed
                ? 'text-(--color-primary-foreground)'
                : 'text-(--color-brand-primary)'
            }`}
          />
          <StarAnimation isVisible={animatingHabitId === habit.id} />
        </button>
        {/* Outside the button, whose clipping would cut the badge off. */}
        {habit.completed ? (
          <span
            aria-hidden="true"
            data-completed-badge
            className="pointer-events-none absolute -top-0.5 -right-0.5 flex h-6 w-6 items-center justify-center rounded-full bg-(--color-card) text-(--color-brand-primary) shadow-md ring-2 ring-(--color-brand-primary) sm:h-7 sm:w-7"
          >
            <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={3} />
          </span>
        ) : null}
      </div>
      <span className="line-clamp-2 max-w-full px-1 text-center text-xs leading-snug font-semibold text-(--color-brand-tertiary) sm:text-sm dark:text-(--color-brand-text-light)">
        {habit.name}
      </span>
      <span className="mt-0.5 text-xs text-(--color-brand-text) dark:text-(--color-brand-text-light)">
        {frequencyLabel(habit.frequency)}
      </span>
    </div>
  );
});

export default DailyHabitItem;
