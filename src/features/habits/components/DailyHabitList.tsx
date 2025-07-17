import DailyHabitItem from "@/features/habits/components/DailyHabitItem";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { motion } from "framer-motion";

export default function DailyHabitList() {
  const { habits } = useHabits();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-5"
      aria-label="List of daily habits"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {habits.map((habit) => (
        <motion.div
          key={habit.id}
          variants={{
            hidden: { opacity: 0, y: 20 },
            show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
          }}
        >
          <DailyHabitItem habit={habit} />
        </motion.div>
      ))}
    </motion.div>
  );
}
