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
      <div className="flex flex-1 items-center justify-center">
        <motion.div
          className="h-12 w-12 rounded-full border-4 border-[var(--color-brand-primary)] border-t-transparent"
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
      <div className="rounded-lg border border-[var(--color-error-light)] bg-[var(--color-error-light)] p-8 text-center text-[var(--color-error-text)] dark:border-[var(--color-error)] dark:bg-[var(--color-error-light)] dark:text-[var(--color-error-text)]">
        Error loading habits. Please try again.
      </div>
    );
  }

  return (
    <motion.div
      className="flex h-full flex-1 flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="flex w-full flex-1 flex-col overflow-hidden border-[var(--color-border-brand)] bg-[var(--color-surface)] shadow-[var(--color-border-brand)]/50 shadow-xl dark:border-[var(--color-border-brand)] dark:bg-[var(--color-surface)] dark:shadow-[var(--color-border-brand)]/20">
        <CardHeader className="px-3 pt-6 sm:px-6">
          <DailyHabitDate />
        </CardHeader>
        <CardContent className="flex-1 px-3 pb-8 sm:px-6">
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
