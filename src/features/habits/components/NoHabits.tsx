import { memo } from 'react';
import { Button } from '@shared/components/ui/button';
import { CalendarX2, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';

const NoHabits = memo(function NoHabits() {
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="mx-auto max-w-md px-6 py-16 text-center"
    >
      <div className="border-(--color-border-primary) mx-auto mb-4 flex size-12 items-center justify-center rounded-full border">
        <CalendarX2
          className="text-(--color-text-secondary) h-6 w-6"
          aria-hidden="true"
        />
      </div>

      <h3 className="text-(--color-foreground) text-xl font-semibold tracking-tight">
        No habits yet
      </h3>

      <p className="text-(--color-text-secondary) mx-auto mt-2 max-w-prose text-sm sm:text-base">
        Start your streak by adding your first habit. Small steps today become
        big wins over time.
      </p>

      <motion.div
        className="mt-6"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <Button
          onClick={toggleShowAddHabitDialog}
          className="rounded-full px-6 py-5"
        >
          <PlusCircle aria-hidden="true" className="mr-2 h-4 w-4" />
          Add habit
        </Button>
      </motion.div>
    </motion.div>
  );
});

export default NoHabits;
