import { useState, memo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Button } from '@shared/components/ui/button';

const ProgressOverview = memo(function ProgressOverview() {
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Use separate hooks for history and streaks
  const { historyData, isLoading: isHistoryLoading } =
    useProgressHistory(selectedMonth);
  const {
    currentStreak,
    longestStreak,
    isLoading: isStreaksLoading,
  } = useProgressStreaks();

  // Combine loading states
  const isLoading = isHistoryLoading || isStreaksLoading;

  const handleNavigateBack = useCallback(() => {
    void navigate('/');
  }, [navigate]);

  return (
    <motion.div
      className="flex h-full flex-1 flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-(--color-border-brand) bg-(--color-surface) shadow-(--color-border-brand)/50 dark:border-(--color-border-brand) dark:bg-(--color-surface)/10 dark:shadow-(--color-border-brand)/20 flex w-full flex-1 flex-col overflow-hidden shadow-xl">
        <CardHeader className="px-3 pt-4 sm:px-6 sm:pt-6">
          <div>
            <CardTitle className="mb-2 flex items-center gap-2 text-xl font-bold sm:text-2xl dark:text-white">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNavigateBack}
                className="mr-2 dark:text-white dark:hover:bg-purple-900/70 dark:hover:text-purple-300"
                aria-label="Back to daily view"
              >
                <svg
                  aria-hidden="true"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19 12H5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 19L5 12L12 5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Button>
              Progress Overview
            </CardTitle>
            <p className="text-sm text-zinc-600 dark:text-purple-400">
              View your progress in one place
            </p>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto px-3 pb-6 sm:px-6 sm:pb-8">
          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center space-x-8 text-purple-800 dark:text-purple-300">
              <StreakDisplayDays value={currentStreak} label="Current Streak" />
              <StreakDisplayDays value={longestStreak} label="Longest Streak" />
            </div>
          </div>
          <ProgressTabs
            historyData={historyData}
            selectedMonth={selectedMonth}
            setSelectedMonth={setSelectedMonth}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
});

export default ProgressOverview;
