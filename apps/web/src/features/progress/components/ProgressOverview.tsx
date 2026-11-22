// The Progress page body: four summary figures, the month's calendar and chart, and achievements.
// Everything shows at once; the full achievement list opens below on request.

import { useState, memo } from 'react';
import { CalendarCheck, Flame, Percent, Trophy } from 'lucide-react';
import ProgressStat from '@/features/progress/components/ProgressStat';
import ProgressCalendar from '@/features/progress/components/ProgressCalendar';
import ProgressChart from '@/features/progress/components/ProgressChart';
import AchievementsSummary from '@/features/progress/components/AchievementsSummary';
import ProgressAchievements from '@/features/progress/components/ProgressAchievements';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import useProgressHistory from '../hooks/useProgressHistory';
import useProgressStreaks from '../hooks/useProgressStreaks';
import {
  useAchievementProgress,
  useAchievements,
} from '../hooks/useAchievements';
import { summarizeMonth } from '../utils/monthSummary';

// The panels inside the page card: a tint and a hairline, no card frame.
const PANEL =
  'rounded-2xl bg-(--color-surface)/60 p-4 ring-1 ring-(--color-border-primary)/50 ring-inset sm:p-5 dark:bg-(--color-surface-secondary)/60';

const ProgressOverview = memo(function ProgressOverview() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showAllAchievements, setShowAllAchievements] = useState(false);

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
  const {
    achievements,
    stats,
    loading: achievementsLoading,
    error: achievementsError,
  } = useAchievements();
  const { selectedCategory, setSelectedCategory } = useAchievementProgress();

  // Either failure hides the figures: zeros and an empty calendar would read
  // as "no progress" rather than "could not load".
  const loadFailed = Boolean(historyError ?? streaksError);

  // A streak equal to the longest one is the best yet; a streak of 0 is not.
  const isBestStreak = currentStreak > 0 && currentStreak >= longestStreak;

  const monthName = selectedMonth.toLocaleString('default', { month: 'long' });
  const { averageRate, perfectDays } = summarizeMonth(
    historyData,
    selectedMonth,
  );

  return (
    <div className="flex h-full flex-1 flex-col">
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
          <CardContent className="flex-1 px-3 pb-6 sm:px-6 sm:pb-8">
            {loadFailed ? (
              <p
                role="alert"
                className="py-12 text-center text-(--color-text-secondary)"
              >
                Your progress could not be loaded. Check your connection and try
                again.
              </p>
            ) : (
              <div className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                  <ProgressStat
                    Icon={Flame}
                    label="Current streak"
                    value={currentStreak}
                    unit="day"
                    loading={isStreaksLoading}
                    badge={isBestStreak ? 'Best yet' : undefined}
                  />
                  <ProgressStat
                    Icon={Trophy}
                    label="Longest streak"
                    value={longestStreak}
                    unit="day"
                    loading={isStreaksLoading}
                  />
                  <ProgressStat
                    Icon={Percent}
                    label={`${monthName} average`}
                    value={averageRate === null ? null : `${averageRate}%`}
                    loading={isHistoryLoading}
                  />
                  <ProgressStat
                    Icon={CalendarCheck}
                    label={`Perfect days in ${monthName}`}
                    value={perfectDays}
                    unit="day"
                    loading={isHistoryLoading}
                  />
                </div>

                <div className="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                  <section aria-label="Calendar" className={PANEL}>
                    {/* The month's grid stays while its history loads, its
                        past days marked as loading, so the calendar keeps its
                        size. */}
                    <ProgressCalendar
                      insightData={historyData}
                      loading={isHistoryLoading}
                      selectedMonth={selectedMonth}
                      setSelectedMonth={setSelectedMonth}
                    />
                  </section>

                  <div className="flex flex-col gap-4 sm:gap-6">
                    <section
                      aria-labelledby="daily-completion-heading"
                      className={PANEL}
                    >
                      <h2
                        id="daily-completion-heading"
                        className="mb-4 text-base font-semibold text-(--color-foreground) sm:text-lg"
                      >
                        Daily completion
                      </h2>
                      {isHistoryLoading ? (
                        // As tall as the chart and its key, so the panel
                        // keeps its size while a month loads.
                        <p
                          role="status"
                          aria-label="Loading chart"
                          className="flex h-62 items-center justify-center text-sm text-(--color-text-secondary)"
                        >
                          Loading chart…
                        </p>
                      ) : (
                        <ProgressChart data={historyData} />
                      )}
                    </section>

                    <AchievementsSummary
                      achievements={achievements}
                      stats={stats}
                      loading={achievementsLoading}
                      error={achievementsError}
                      isListOpen={showAllAchievements}
                      onToggleList={() =>
                        setShowAllAchievements((open) => !open)
                      }
                    />
                  </div>
                </div>

                {showAllAchievements && (
                  <section
                    id="all-achievements"
                    aria-label="All achievements"
                    className={PANEL}
                  >
                    <ProgressAchievements
                      achievements={achievements}
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                    />
                  </section>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});

export default ProgressOverview;
