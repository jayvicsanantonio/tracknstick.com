import { plural } from '@shared/utils/plural';
import { memo, useMemo } from 'react';
import { Habit } from '@/features/habits/types/Habit';
import formatDate from '@shared/utils/date/formatDate';
import MiscellaneousIcons from '@/icons/miscellaneous';
import useHabitStats from '@/features/habits/hooks/useHabitStats';
import { motion } from 'framer-motion';

const { Trophy, Calendar, CheckCircle2, Award } = MiscellaneousIcons;

interface HabitStatsProps {
  habit: Habit | null;
}

const HabitStats = memo(function HabitStats({ habit }: HabitStatsProps) {
  const habitStats = useHabitStats(habit?.id ?? '');

  const motivationalMessage = useMemo(() => {
    if (!habit) return '';
    return habitStats.streak > 0
      ? `Great job! You've been consistent with "${habit.name}" for ${habitStats.streak} ${plural(habitStats.streak, 'day')}.`
      : `Start your streak by completing "${habit.name}" today!`;
  }, [habit, habitStats.streak]);

  if (!habit) return null;

  return (
    <div
      className="grid gap-3 py-2 sm:gap-4 sm:py-2"
      aria-label="Habit Statistics"
    >
      {/* Streak Cards Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {/* Current Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="ios-tracker-card flex flex-col items-center justify-center space-y-2 rounded-[20px] p-4 text-center sm:p-5"
        >
          <div
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-[14px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset"
          >
            <Trophy className="size-6" />
          </div>
          <h3 className="text-xs font-semibold tracking-wide text-(--color-text-secondary) uppercase">
            Current Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-extrabold tracking-[-0.03em] text-(--color-foreground) tabular-nums sm:text-4xl">
              {habitStats.streak}
            </span>
            <span className="ml-1 text-xs font-medium text-(--color-text-secondary) sm:text-sm">
              {plural(habitStats.streak, 'day')}
            </span>
          </div>
        </motion.div>

        {/* Longest Streak Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="ios-tracker-card flex flex-col items-center justify-center space-y-2 rounded-[20px] p-4 text-center sm:p-5"
        >
          <div
            aria-hidden="true"
            className="flex size-12 items-center justify-center rounded-[14px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset"
          >
            <Award className="size-6" />
          </div>
          <h3 className="text-xs font-semibold tracking-wide text-(--color-text-secondary) uppercase">
            Longest Streak
          </h3>
          <div className="flex items-baseline justify-center">
            <span className="text-3xl font-extrabold tracking-[-0.03em] text-(--color-foreground) tabular-nums sm:text-4xl">
              {habitStats.longestStreak}
            </span>
            <span className="ml-1 text-xs font-medium text-(--color-text-secondary) sm:text-sm">
              {plural(habitStats.longestStreak, 'day')}
            </span>
          </div>
        </motion.div>
      </div>

      {/* Additional Stats */}
      <div className="ios-tracker-card divide-y divide-(--color-brand-primary)/12 overflow-hidden rounded-[20px]">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.16 }}
          className="flex items-center justify-between px-4 py-3.5 sm:px-5"
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-[11px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset"
            >
              <CheckCircle2 className="size-4" />
            </div>
            <span className="text-sm font-medium text-(--color-foreground) sm:text-[15px]">
              Total Completions
            </span>
          </div>
          <span className="text-xl font-bold text-(--color-foreground) tabular-nums sm:text-2xl">
            {habitStats.totalCompletions}
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.24 }}
          className="flex items-center justify-between px-4 py-3.5 sm:px-5"
        >
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-[11px] bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/22 ring-inset"
            >
              <Calendar className="size-4" />
            </div>
            <span className="text-sm font-medium text-(--color-foreground) sm:text-[15px]">
              Last Completed
            </span>
          </div>
          <span className="text-sm font-semibold text-(--color-foreground) tabular-nums sm:text-[15px]">
            {formatDate(habitStats?.lastCompleted)}
          </span>
        </motion.div>
      </div>

      {/* Consistency message */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
        className="rounded-2xl bg-(--color-brand-primary)/[0.06] px-4 py-3.5 text-center ring-1 ring-(--color-brand-primary)/14 ring-inset"
      >
        <p className="text-xs font-medium text-(--color-text-secondary) sm:text-sm">
          {motivationalMessage}
        </p>
      </motion.div>
    </div>
  );
});

export default HabitStats;
