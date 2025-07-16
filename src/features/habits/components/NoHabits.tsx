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
        bg-white dark:bg-zinc-800/70
        flex flex-col items-center justify-center gap-4 py-10 px-8 sm:px-20 text-center rounded-xl shadow-lg
        border border-purple-100 dark:border-purple-900/30
      "
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10 dark:opacity-5">
        <div className="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-purple-300"></div>
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-purple-400"></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        <div
          aria-hidden="true"
          className="mb-2 p-4 rounded-full inline-flex bg-purple-50 dark:bg-zinc-700"
        >
          <CalendarX2 className="text-purple-600 dark:text-purple-500 h-10 w-10" />
        </div>

        <h3 className="text-purple-700 dark:text-purple-300 text-xl font-bold mb-2">
          No Habits Found
        </h3>

        <p className="text-purple-600/90 dark:text-purple-400 max-w-md mx-auto mb-4 text-sm sm:text-base">
          Try adding a new habit to start tracking your daily progress, or check
          a different date to view existing habits. Building good habits is the
          first step towards achieving your goals!
        </p>

        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
          <Button
            onClick={toggleShowAddHabitDialog}
            className="
              bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400
              text-white rounded-full font-semibold transition-all duration-300 
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
