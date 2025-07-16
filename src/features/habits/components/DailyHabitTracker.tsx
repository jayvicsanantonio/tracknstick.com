import { Card, CardContent, CardHeader } from "@/components/ui/card";
import NoHabits from "@/features/habits/components/NoHabits";
import DailyHabitDate from "@/features/habits/components/DailyHabitDate";
import DailyHabitProgressIndicator from "@/features/habits/components/DailyHabitProgressIndicator";
import DailyHabitList from "@/features/habits/components/DailyHabitList";
import { useHabits } from "@/features/habits/hooks/useHabits";
import { motion } from "framer-motion";

export default function DailyHabitTracker() {
  const { habits, isLoading, error, completionRate } = useHabits();

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          className="rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center rounded-lg border bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200">
        Error loading habits. Please try again.
      </div>
    );
  }

  return (
    <motion.div
      className="flex-1 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="w-full flex-1 flex flex-col overflow-hidden shadow-xl border-purple-100 bg-white shadow-purple-200/50 dark:border-purple-900 dark:bg-[#121228] dark:shadow-purple-900/20">
        <CardHeader className="px-3 sm:px-6 pt-6">
          <DailyHabitDate />
        </CardHeader>
        <CardContent className="px-3 sm:px-6 pb-8 flex-1">
          {habits.length === 0 ? (
            <NoHabits />
          ) : (
            <>
              <DailyHabitProgressIndicator completionRate={completionRate} />
              <DailyHabitList />
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
