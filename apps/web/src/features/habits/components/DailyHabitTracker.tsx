// The Tracker page body: the chosen day, its progress, and the habits due that day.
// Stacks on small screens and splits into a two-column dashboard from lg up.

import { Card, CardContent, CardHeader } from '@shared/components/ui/card';
import NoHabits from '@/features/habits/components/NoHabits';
import DailyHabitDate from '@/features/habits/components/DailyHabitDate';
import DailyHabitProgressIndicator from '@/features/habits/components/DailyHabitProgressIndicator';
import DailyHabitList from '@/features/habits/components/DailyHabitList';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import NothingScheduled from '@/features/habits/components/NothingScheduled';
import { Button } from '@shared/components/ui/button';
import LoadingFallback from '@shared/components/feedback/LoadingFallback';

export default function DailyHabitTracker() {
  const { habits, isLoading, error, completionRate, mutateHabits } =
    useHabits();
  // Every habit, due or not: tells "no habits at all" from "none due today".
  // Fetched only when the day shown has no habits, the one case that needs it.
  const {
    habits: allHabits,
    isLoading: allHabitsLoading,
    error: allHabitsError,
    retry: retryAllHabits,
  } = useAllHabits({
    enabled: !isLoading && !error && habits.length === 0,
  });
  const doneCount = habits.filter((habit) => habit.completed).length;
  // Only a successful lookup may say the user has no habits at all.
  const hasNoHabits =
    habits.length === 0 &&
    !allHabitsLoading &&
    !allHabitsError &&
    allHabits.length === 0;

  if (isLoading) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="relative flex w-full flex-1 items-center justify-center overflow-hidden"
          >
            <CardContent className="px-3 py-12 sm:px-6">
              <LoadingFallback />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="flex w-full flex-1 items-center justify-center"
        >
          <CardContent className="flex flex-col items-center gap-4 px-3 py-16 text-center sm:px-6">
            <p role="alert" className="text-(--color-foreground)">
              Your habits could not be loaded. Check your connection and try
              again.
            </p>
            <Button
              variant="outline"
              className="rounded-full px-6"
              onClick={() => void mutateHabits()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // With no habits there is no day to move through or progress to show, so
  // the first-habit prompt takes the whole card.
  if (hasNoHabits) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="flex w-full flex-1 items-center justify-center"
        >
          <NoHabits />
        </Card>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="relative flex w-full flex-1 flex-col overflow-hidden"
        >
          {/* From lg up: the day and its progress in a column, the habits
              beside it. Below lg they stack. The column has a fixed width,
              wide enough for the longest day name, so moving between days
              never moves the habits. Stacked rows keep to their content, so the
              card's spare height falls below the habits rather than between
              rows; side by side, the one row fills the card so the divider
              runs its full height. */}
          <div className="grid flex-1 content-start lg:grid-cols-[26rem_1fr] lg:content-stretch">
            <div className="lg:border-r lg:border-(--color-border-primary)/50 lg:pb-8">
              <CardHeader className="px-3 pt-4 sm:px-6 sm:pt-6">
                <DailyHabitDate />
              </CardHeader>
              {habits.length > 0 ? (
                <section
                  aria-label="Progress"
                  className="relative mx-auto mb-4 flex w-full max-w-md flex-col items-center px-3 sm:mb-8 sm:px-6 lg:mb-0"
                >
                  <DailyHabitProgressIndicator
                    completionRate={completionRate}
                  />
                  {/* On phones the ring says it alone; the summary stays
                      for screen readers. */}
                  <p
                    role="status"
                    aria-label="Day summary"
                    className="rounded-full bg-(--color-brand-primary)/10 px-4 py-1.5 text-sm font-semibold text-(--color-brand-text) max-sm:sr-only dark:text-(--color-brand-text-light)"
                  >
                    {doneCount === habits.length
                      ? `All ${habits.length} done`
                      : `${doneCount} of ${habits.length} done`}
                    <span className="font-normal text-(--color-text-secondary)">
                      {doneCount === habits.length
                        ? ' · nice work'
                        : ` · ${habits.length - doneCount} to go`}
                    </span>
                  </p>
                </section>
              ) : null}
            </div>
            <CardContent className="flex-1 px-3 pb-8 sm:px-6 lg:pt-8">
              {habits.length === 0 ? (
                allHabitsLoading ? null : allHabitsError ? (
                  // Unknown is not empty: only a successful lookup may say
                  // the user has no habits.
                  <div className="flex flex-col items-center gap-4 py-16 text-center">
                    <p role="alert" className="text-(--color-foreground)">
                      Your habits could not be checked. Check your connection
                      and try again.
                    </p>
                    <Button
                      variant="outline"
                      className="h-11 rounded-full px-6 sm:h-9"
                      onClick={() => void retryAllHabits()}
                    >
                      Try again
                    </Button>
                  </div>
                ) : (
                  <NothingScheduled />
                )
              ) : (
                <section aria-label="Today's Habits">
                  <DailyHabitList />
                </section>
              )}
            </CardContent>
          </div>
        </Card>
      </div>
    </div>
  );
}
