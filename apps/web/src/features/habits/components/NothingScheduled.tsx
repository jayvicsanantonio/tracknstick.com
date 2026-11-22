// Empty state for a day on which none of the user's habits are due.
// Distinct from NoHabits, which invites a user who has no habits at all to add one.

import { memo } from 'react';
import { CalendarCheck2 } from 'lucide-react';
import { motion } from 'framer-motion';

const NothingScheduled = memo(function NothingScheduled() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="ios-tracker-card mx-auto max-w-md rounded-[26px] px-6 py-12 text-center sm:rounded-none sm:py-16"
    >
      <div className="mx-auto mb-4 flex size-13 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 ring-1 ring-(--color-brand-primary)/24 ring-inset sm:size-12 sm:rounded-full sm:bg-(--color-brand-primary)/10 sm:ring-0">
        <CalendarCheck2
          className="h-6 w-6 text-(--color-brand-primary)"
          aria-hidden="true"
        />
      </div>
      <h3 className="text-xl font-semibold tracking-tight text-(--color-foreground)">
        Nothing scheduled
      </h3>
      <p className="mx-auto mt-2 max-w-prose text-sm text-(--color-text-secondary) sm:text-base">
        None of your habits are due on this day. Swipe or use the arrows to
        visit another day.
      </p>
    </motion.div>
  );
});

export default NothingScheduled;
