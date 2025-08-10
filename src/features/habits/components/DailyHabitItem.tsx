import { memo, useCallback } from 'react';
import HabitsIcons from '@/icons/habits';
import { Button } from '@shared/components/ui/button';
import StarAnimation from '@shared/components/ui/animations/StarAnimation';
import { Habit } from '@/features/habits/types/Habit';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { useHabits } from '@/features/habits/hooks/useHabits';

const { Edit } = MiscellaneousIcons;

interface DailyHabitItemProps {
  habit: Habit;
}

const DailyHabitItem = memo(function DailyHabitItem({
  habit,
}: DailyHabitItemProps) {
  const { isEditMode, openEditDialog } = useHabitsContext();
  const { toggleHabit, animatingHabitId } = useHabits();
  const Icon = HabitsIcons[habit.icon];

  const handleToggle = useCallback(() => {
    if (habit.id) {
      toggleHabit(habit.id).catch((error) => {
        console.error('Failed to toggle habit:', error);
      });
    }
  }, [habit.id, toggleHabit]);

  const handleEdit = useCallback(() => {
    openEditDialog(habit);
  }, [habit, openEditDialog]);

  return (
    <div key={habit.id} className="group flex flex-col items-center">
      <div className="relative mb-3">
        <button
          className={`relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-inset backdrop-blur-xl backdrop-saturate-150 sm:h-24 sm:w-24 md:h-28 md:w-28 ${
            habit.completed
              ? 'bg-(--color-brand-primary)/18 dark:bg-(--color-brand-primary)/20 ring-(--color-brand-primary)/55'
              : 'bg-(--color-surface)/60 dark:bg-(--color-surface-secondary)/40 ring-(--color-border-primary)/40'
          } transition-transform hover:-translate-y-1 hover:scale-105 active:scale-95`}
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
              className="pointer-events-none absolute inset-0 z-0 rounded-full bg-gradient-to-b from-white/80 to-transparent opacity-60 dark:from-white/30"
            />
          ) : null}
          <Icon
            aria-hidden="true"
            className={`text-(--color-brand-primary) relative z-10 h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14`}
          />
          <StarAnimation isVisible={animatingHabitId === habit.id} />
        </button>
        {isEditMode && (
          <Button
            className="bg-(--color-brand-primary) text-(--color-text-inverse) shadow-(--color-brand-primary)/30 hover:bg-(--color-brand-primary) absolute -right-1 -top-1 z-10 h-6 w-6 rounded-full p-0 shadow-md sm:h-8 sm:w-8"
            onClick={handleEdit}
            aria-label={`Edit ${habit.name}`}
          >
            <Edit
              aria-hidden="true"
              className="text-(--color-text-inverse) h-3 w-3 sm:h-4 sm:w-4"
            />
          </Button>
        )}
      </div>
      <span className="text-(--color-brand-tertiary) dark:text-(--color-brand-text-light) line-clamp-1 max-w-full px-1 text-center text-xs font-semibold sm:text-sm">
        {habit.name}
      </span>
      <span className="text-(--color-brand-text) dark:text-(--color-brand-text-light) mt-0.5 text-xs">
        {frequencyLabel(habit.frequency)}
      </span>
    </div>
  );
});

export default DailyHabitItem;
