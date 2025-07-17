import HabitsIcons from '@/icons/habits';
import { Button } from '@/components/ui/button';
import StarAnimation from '@/components/ui/animations/StarAnimation';
import { Habit } from '@/features/habits/types/Habit';
import frequencyLabel from '@/lib/frequencyLabel';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { useHabitsContext } from '@/features/habits/context/HabitsStateContext';
import { useHabits } from '@/features/habits/hooks/useHabits';

const { Edit } = MiscellaneousIcons;

interface DailyHabitItemProps {
  habit: Habit;
}

export default function DailyHabitItem({ habit }: DailyHabitItemProps) {
  const { isEditMode, openEditDialog } = useHabitsContext();
  const { toggleHabit, animatingHabitId } = useHabits();
  const Icon = HabitsIcons[habit.icon];

  return (
    <div key={habit.id} className="group flex flex-col items-center">
      <div className="relative mb-3">
        <div
          className={`absolute -inset-1 rounded-full opacity-0 blur-sm transition-opacity duration-300 group-hover:opacity-70 ${
            habit.completed
              ? 'bg-(--color-brand-primary)/30 dark:bg-(--color-brand-primary)/30'
              : 'bg-(--color-brand-primary)/20 dark:bg-(--color-brand-primary)/20'
          }`}
        ></div>
        <button
          className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-full border-2 shadow-md sm:h-24 sm:w-24 md:h-28 md:w-28 ${
            habit.completed
              ? 'border-none bg-linear-to-br from-(--color-brand-primary) to-(--color-brand-primary) shadow-(--color-brand-primary)/30 dark:shadow-(--color-brand-primary)/30'
              : 'border-(--color-brand-primary) bg-(--color-surface) shadow-(--color-brand-light)/40 hover:bg-(--color-brand-lighter) dark:border-(--color-brand-primary) dark:bg-(--color-surface) dark:shadow-(--color-surface-secondary)/20 dark:hover:bg-(--color-surface-secondary)'
          } transform transition-all duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95`}
          onClick={() => {
            if (habit.id) {
              toggleHabit(habit.id).catch((error) => {
                console.error('Failed to toggle habit:', error);
              });
            }
          }}
          aria-pressed={habit.completed}
          aria-label={
            habit.completed
              ? `Mark ${habit.name} as incomplete`
              : `Mark ${habit.name} as complete`
          }
        >
          <Icon
            aria-hidden="true"
            className={`h-10 w-10 transition-colors sm:h-12 sm:w-12 md:h-14 md:w-14 ${
              habit.completed
                ? 'text-(--color-text-inverse)'
                : 'text-(--color-brand-primary) dark:text-(--color-brand-primary)'
            }`}
          />
          <StarAnimation isVisible={animatingHabitId === habit.id} />
        </button>
        {isEditMode && (
          <Button
            className="absolute -top-1 -right-1 z-10 h-6 w-6 rounded-full bg-(--color-brand-primary) p-0 text-(--color-text-inverse) shadow-(--color-brand-primary)/30 shadow-md transition-all duration-300 hover:bg-(--color-brand-primary) sm:h-8 sm:w-8"
            onClick={() => openEditDialog(habit)}
            aria-label={`Edit ${habit.name}`}
          >
            <Edit
              aria-hidden="true"
              className="h-3 w-3 text-(--color-text-inverse) sm:h-4 sm:w-4"
            />
          </Button>
        )}
      </div>
      <span className="line-clamp-1 max-w-full px-1 text-center text-xs font-semibold text-(--color-brand-tertiary) sm:text-sm dark:text-(--color-brand-text-light)">
        {habit.name}
      </span>
      <span className="mt-0.5 text-xs text-(--color-brand-text) dark:text-(--color-brand-text-light)">
        {frequencyLabel(habit.frequency)}
      </span>
    </div>
  );
}
