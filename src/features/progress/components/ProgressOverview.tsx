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
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8">
        <Card
          variant="glass"
          className="flex w-full flex-1 flex-col overflow-hidden"
        >
          <CardHeader className="px-3 pt-4 sm:px-6 sm:pt-6">
            <div>
              <CardTitle className="text-(--color-foreground) mb-2 flex items-center gap-2 text-xl font-bold sm:text-2xl">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleNavigateBack}
                  className="hover:bg-(--color-hover-surface) mr-2"
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
              <p className="text-(--color-text-secondary) text-sm">
                View your progress in one place
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-3 pb-6 sm:px-6 sm:pb-8">
            <div className="mb-4 flex items-center justify-center">
              <div className="text-(--color-brand-text) flex items-center space-x-8">
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
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
});

export default ProgressOverview;
