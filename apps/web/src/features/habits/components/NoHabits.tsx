// Empty state for a user with no habits at all: invites them to add their first one.
// Distinct from NothingScheduled, shown when habits exist but none are due that day.

import { memo } from 'react';
import { Button } from '@shared/components/ui/button';
import { Plus, Sprout } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

const NoHabits = memo(function NoHabits() {
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="ios-tracker-card mx-auto w-full max-w-md rounded-[26px] px-6 py-12 text-center sm:px-8 sm:py-14"
    >
      <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 ring-1 ring-(--color-brand-primary)/24 ring-inset">
        <Sprout
          className="h-8 w-8 text-(--color-brand-primary)"
          aria-hidden="true"
        />
      </div>

      <h2 className="text-2xl font-semibold tracking-tight text-(--color-foreground)">
        No habits yet
      </h2>

      <p className="mx-auto mt-2 max-w-prose text-sm text-(--color-text-secondary) sm:text-base">
        Start your streak by adding your first habit. Small steps today become
        big wins over time.
      </p>

      <motion.div
        className="mt-8"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={toggleShowAddHabitDialog}
          className="h-11 rounded-full px-6"
        >
          <Plus aria-hidden="true" className="mr-1 h-4 w-4" />
          Add habit
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default NoHabits;
