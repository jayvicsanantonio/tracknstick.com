import HabitsIcons from "@/icons/habits";
import { Button } from "@/components/ui/button";
import StarAnimation from "@/components/ui/animations/StarAnimation";
import { Habit } from "@/features/habits/types/Habit";
import frequencyLabel from "@/lib/frequencyLabel";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";
import { useHabits } from "@/features/habits/hooks/useHabits";

const { Edit } = MiscellaneousIcons;

interface DailyHabitItemProps {
  habit: Habit;
}

export default function DailyHabitItem({ habit }: DailyHabitItemProps) {
  const { isEditMode, openEditDialog } = useHabitsContext();
  const { toggleHabit, animatingHabitId } = useHabits();
  const Icon = HabitsIcons[habit.icon];

  return (
    <div key={habit.id} className="flex flex-col items-center group">
      <div className="relative mb-3">
        <div
          className={`absolute -inset-1 rounded-full blur-sm opacity-0 group-hover:opacity-70 transition-opacity duration-300 ${
            habit.completed
              ? "bg-[var(--color-brand-primary)]/30 dark:bg-[var(--color-brand-primary)]/30"
              : "bg-[var(--color-brand-primary)]/20 dark:bg-[var(--color-brand-primary)]/20"
          }`}
        ></div>
        <button
          className={`cursor-pointer relative flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-full shadow-md border-2
            ${
              habit.completed
                ? "bg-gradient-to-br from-[var(--color-brand-primary)] to-[var(--color-brand-primary)] shadow-[var(--color-brand-primary)]/30 border-none dark:shadow-[var(--color-brand-primary)]/30"
                : "bg-[var(--color-surface)] shadow-[var(--color-brand-light)]/40 hover:bg-[var(--color-brand-lighter)] border-[var(--color-brand-primary)] dark:bg-[var(--color-surface)] dark:shadow-[var(--color-surface-secondary)]/20 dark:hover:bg-[var(--color-surface-secondary)] dark:border-[var(--color-brand-primary)]"
            } 
            transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 active:scale-95`}
          onClick={() => {
            if (habit.id) {
              toggleHabit(habit.id).catch((error) => {
                console.error("Failed to toggle habit:", error);
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
            className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 transition-colors ${
              habit.completed
                ? "text-[var(--color-text-inverse)]"
                : "text-[var(--color-brand-primary)] dark:text-[var(--color-brand-primary)]"
            }`}
          />
          <StarAnimation isVisible={animatingHabitId === habit.id} />
        </button>
        {isEditMode && (
          <Button
            className="absolute -top-1 -right-1 rounded-full w-6 h-6 sm:w-8 sm:h-8 p-0 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-primary)] shadow-md shadow-[var(--color-brand-primary)]/30 text-[var(--color-text-inverse)] transition-all duration-300 z-10"
            onClick={() => openEditDialog(habit)}
            aria-label={`Edit ${habit.name}`}
          >
            <Edit
              aria-hidden="true"
              className="h-3 w-3 sm:h-4 sm:w-4 text-[var(--color-text-inverse)]"
            />
          </Button>
        )}
      </div>
      <span className="text-xs sm:text-sm font-semibold text-center text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)] line-clamp-1 max-w-full px-1">
        {habit.name}
      </span>
      <span className="text-xs text-[var(--color-brand-text)] dark:text-[var(--color-brand-text-light)] mt-0.5">
        {frequencyLabel(habit.frequency)}
      </span>
    </div>
  );
}
