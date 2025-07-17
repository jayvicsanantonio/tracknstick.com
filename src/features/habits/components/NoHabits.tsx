import { Button } from '@/components/ui/button';
import { CalendarX2, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitsContext } from '@/features/habits/context/HabitsStateContext';

export default function NoHabits() {
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="relative flex flex-col items-center justify-center gap-4 overflow-hidden rounded-xl border border-[var(--color-border-brand)] bg-[var(--color-surface)] px-8 py-10 text-center shadow-lg sm:px-20 dark:border-[var(--color-border-brand)] dark:bg-[var(--color-surface-secondary)]"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-[var(--color-brand-light)]"></div>
        <div className="absolute -bottom-8 -left-8 h-40 w-40 rounded-full bg-[var(--color-brand-primary)]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div
          aria-hidden="true"
          className="mb-2 inline-flex rounded-full bg-[var(--color-brand-lighter)] p-4 dark:bg-[var(--color-surface-tertiary)]"
        >
          <CalendarX2 className="h-10 w-10 text-[var(--color-brand-primary)] dark:text-[var(--color-brand-primary)]" />
        </div>

        <h3 className="mb-2 text-xl font-bold text-[var(--color-brand-text)] dark:text-[var(--color-brand-text-light)]">
          No Habits Found
        </h3>

        <p className="mx-auto mb-4 max-w-md text-sm text-[var(--color-brand-primary)] sm:text-base dark:text-[var(--color-brand-text-light)]">
          Try adding a new habit to start tracking your daily progress, or check
          a different date to view existing habits. Building good habits is the
          first step towards achieving your goals!
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={toggleShowAddHabitDialog}
            className="mt-2 rounded-full bg-gradient-to-r from-[var(--color-brand-primary)] to-[var(--color-brand-primary)] px-6 py-5 font-semibold text-[var(--color-text-inverse)] shadow-md transition-all duration-300 hover:from-[var(--color-brand-primary)] hover:to-[var(--color-brand-primary)] hover:shadow-lg"
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
