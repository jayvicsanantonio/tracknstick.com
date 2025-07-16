import { Button } from "@/components/ui/button";
import { CalendarX2, PlusCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";

export default function NoHabits() {
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="
        relative overflow-hidden
        bg-[var(--color-surface)] dark:bg-[var(--color-surface-secondary)]
        flex flex-col items-center justify-center gap-4 py-10 px-8 sm:px-20 text-center rounded-xl shadow-lg
        border border-[var(--color-border-brand)] dark:border-[var(--color-border-brand)]
      "
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-[var(--color-brand-light)]"></div>
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-[var(--color-brand-primary)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div
          aria-hidden="true"
          className="mb-2 p-4 rounded-full inline-flex bg-[var(--color-brand-lighter)] dark:bg-[var(--color-surface-tertiary)]"
        >
          <CalendarX2 className="text-[var(--color-brand-primary)] dark:text-[var(--color-brand-primary)] h-10 w-10" />
        </div>

        <h3 className="text-[var(--color-brand-text)] dark:text-[var(--color-brand-text-light)] text-xl font-bold mb-2">
          No Habits Found
        </h3>

        <p className="text-[var(--color-brand-primary)] dark:text-[var(--color-brand-text-light)] max-w-md mx-auto mb-4 text-sm sm:text-base">
          Try adding a new habit to start tracking your daily progress, or check
          a different date to view existing habits. Building good habits is the
          first step towards achieving your goals!
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={toggleShowAddHabitDialog}
            className="
              bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-primary)] hover:from-[var(--color-brand-primary)] hover:to-[var(--color-brand-primary)]
              text-[var(--color-text-inverse)] rounded-full font-semibold transition-all duration-300
              shadow-md hover:shadow-lg px-6 py-5 mt-2
            "
            aria-label="Add a new habit"
          >
            <PlusCircle aria-hidden="true" className="mr-2 h-4 w-4" /> Add New
            Habit
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
