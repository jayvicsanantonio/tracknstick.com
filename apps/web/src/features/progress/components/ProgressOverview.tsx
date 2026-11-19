import { useState, memo } from 'react';
import StreakDisplayDays from '@/features/progress/components/StreakDisplayDays';
import ProgressTabs from '@/features/progress/components/ProgressTabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import useProgressHistory from '../hooks/useProgressHistory';
import useProgressStreaks from '../hooks/useProgressStreaks';
import { motion } from 'framer-motion';

const ProgressOverview = memo(function ProgressOverview() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Use separate hooks for history and streaks
  const {
    historyData,
    isLoading: isHistoryLoading,
    error: historyError,
  } = useProgressHistory(selectedMonth);
  const {
    currentStreak,
    longestStreak,
    isLoading: isStreaksLoading,
    error: streaksError,
  } = useProgressStreaks();

  // Combine loading states
  const isLoading = isHistoryLoading || isStreaksLoading;
  // Either failure hides the figures: zeros and an empty calendar would read
  // as "no progress" rather than "could not load".
  const loadFailed = Boolean(historyError ?? streaksError);

  return (
    <motion.div
      className="flex h-full flex-1 flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="flex w-full flex-1 flex-col overflow-hidden"
        >
          <CardHeader className="px-3 pt-4 sm:px-6 sm:pt-6">
            <div>
              <CardTitle className="mb-2 flex items-center gap-2 text-xl font-bold text-(--color-foreground) sm:text-2xl">
                Progress Overview
              </CardTitle>
              <p className="text-sm text-(--color-text-secondary)">
                View your progress in one place
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-3 pb-6 sm:px-6 sm:pb-8">
            {loadFailed ? (
              <p
                role="alert"
                className="py-12 text-center text-(--color-text-secondary)"
              >
                Your progress could not be loaded. Check your connection and try
                again.
              </p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-center">
                  <div className="grid w-full grid-cols-2 gap-3 text-(--color-brand-text) sm:flex sm:w-auto sm:items-center sm:gap-8">
                    <StreakDisplayDays
                      value={currentStreak}
                      label="Current Streak"
                    />
                    <StreakDisplayDays
                      value={longestStreak}
                      label="Longest Streak"
                    />
                  </div>
                </div>
                <ProgressTabs
                  historyData={historyData}
                  selectedMonth={selectedMonth}
                  setSelectedMonth={setSelectedMonth}
                  isLoading={isLoading}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
});

export default ProgressOverview;
