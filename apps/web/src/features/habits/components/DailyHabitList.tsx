import { memo, useMemo } from 'react';
import DailyHabitItem from '@/features/habits/components/DailyHabitItem';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { motion } from 'framer-motion';

const DailyHabitList = memo(function DailyHabitList() {
  const { habits } = useHabits();

  const container = useMemo(
    () => ({
      hidden: { opacity: 0 },
      show: {
        opacity: 1,
        transition: {
          staggerChildren: 0.1,
          delayChildren: 0.3,
        },
      },
    }),
    [],
  );

  const itemVariants = useMemo(
    () => ({
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
    }),
    [],
  );

  return (
    <motion.div
      className="grid grid-cols-3 gap-x-2 gap-y-4 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      aria-label="List of daily habits"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {habits.map((habit) => (
        <motion.div key={habit.id} variants={itemVariants}>
          <DailyHabitItem habit={habit} />
        </motion.div>
      ))}
    </motion.div>
  );
});

export default DailyHabitList;
