import { useState, useMemo, useCallback, memo, type ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { motion } from 'framer-motion';
import { Tabs } from '@shared/components/ui/tabs';
import { SegmentedTabsList } from '@shared/components/ui/segmented-control';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import { Archive, ListChecks, SearchX, type LucideIcon } from 'lucide-react';
import { Habit } from '@/features/habits/types/Habit';
import HabitsIcons from '@/icons/habits';
import HabitActions from '@/features/habits/components/HabitActions';
import HabitListRow from '@/features/habits/components/HabitListRow';
import DeleteHabitConfirmation from '@/features/habits/components/DeleteHabitConfirmation';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import {
  isArchived,
  TAB_FILTER,
  type OverviewTab,
} from '@/features/habits/components/habitFilters';

/** The habit's start date in the viewer's locale. */
function formatStartDate(habit: Habit) {
  return new Date(habit.startDate).toLocaleDateString();
}

/** "Daily" for a habit due every day, otherwise its days, e.g. "Mon · Wed · Fri". */
function frequencyText(habit: Habit) {
  return habit.frequency.length === 7
    ? frequencyLabel(habit.frequency)
    : habit.frequency.map((day) => day.substring(0, 3)).join(' · ');
}

/** The choices of the segmented control above the list. */
const TAB_OPTIONS: { value: OverviewTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'archived', label: 'Archived' },
];

/** An empty list's explanation: an icon, what happened, and what to do next. */
function EmptyResult({
  Icon,
  title,
  detail,
  children,
}: {
  Icon: LucideIcon;
  title: string;
  detail: string;
  children?: ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center text-center">
      <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-(--color-brand-primary)/10">
        <Icon
          aria-hidden="true"
          className="h-6 w-6 text-(--color-brand-primary)"
        />
      </span>
      <p className="text-lg font-semibold text-(--color-foreground)">{title}</p>
      <p className="mt-1 text-sm text-(--color-text-secondary)">{detail}</p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

function StatusBadge({ habit }: { habit: Habit }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-1 text-xs ${
        isArchived(habit)
          ? 'bg-(--color-muted) text-(--color-text-secondary)'
          : 'bg-(--color-brand-primary)/10 text-(--color-brand-text)'
      }`}
    >
      {isArchived(habit) ? 'Archived' : 'Active'}
    </span>
  );
}

const HabitsOverview = memo(function HabitsOverview() {
  const { habits, isLoading, error, deleteHabit } = useAllHabits();
  const { openEditDialog, toggleShowAddHabitDialog } = useHabitsContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState<OverviewTab>('all');
  // Only the id is local state. The habit itself is derived from the list, so
  // the dialog cannot describe a habit that is no longer there -- SWR
  // revalidates this list on window focus.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // The phone list's row swiped open to show Delete: one at a time, as iOS.
  const [swipedId, setSwipedId] = useState<string | null>(null);

  const handleDeleteHabit = useCallback((habit: Habit) => {
    setDeletingId(habit.id);
  }, []);

  const handleSwipe = useCallback((habit: Habit, open: boolean) => {
    setSwipedId((current) =>
      open ? habit.id : current === habit.id ? null : current,
    );
  }, []);

  const cancelDelete = useCallback(() => {
    setDeletingId(null);
    setSwipedId(null);
  }, []);

  const habitToDelete = habits.find((habit) => habit.id === deletingId);

  const confirmDelete = useCallback(() => {
    if (!habitToDelete) return;
    void deleteHabit(habitToDelete.id, habitToDelete.name);
    setDeletingId(null);
    setSwipedId(null);
  }, [habitToDelete, deleteHabit]);

  // Filter habits based on search term and selected tab
  const filteredHabits = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return habits.filter(
      (habit) =>
        habit.name.toLowerCase().includes(query) &&
        TAB_FILTER[selectedTab](habit),
    );
  }, [habits, searchTerm, selectedTab]);

  if (isLoading) {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-2 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="flex w-full items-center justify-center rounded-xl p-8"
        >
          <div className="inline-flex items-center gap-4 rounded-full bg-(--color-surface)/80 px-6 py-4 shadow-sm ring-1 ring-(--color-border-primary)/40 backdrop-blur-sm ring-inset dark:bg-(--color-surface-secondary)/80">
            <span className="h-10 w-10 animate-spin rounded-full border-4 border-(--color-brand-primary) border-r-transparent" />
            <span className="text-base font-medium text-(--color-text-secondary) sm:text-lg">
              Loading…
            </span>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-700 dark:bg-red-900/30 dark:text-red-100">
        Error loading habits. Please try again.
      </div>
    );
  }

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
                Habits Overview
              </CardTitle>
              <p className="text-sm text-(--color-text-secondary)">
                Manage all your habits in one place
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-3 pb-6 sm:px-6 sm:pb-8">
            <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row">
              <Input
                type="search"
                aria-label="Search habits"
                className="w-full sm:max-w-[300px]"
                placeholder="Search habits..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Tabs
                value={selectedTab}
                onValueChange={(value) => setSelectedTab(value as OverviewTab)}
                className="w-full sm:max-w-[300px]"
              >
                <SegmentedTabsList
                  value={selectedTab}
                  options={TAB_OPTIONS}
                  aria-label="Show habits"
                />
              </Tabs>
            </div>

            {/* The empty state fades in, and either view leaves at once: an
                exit animation would hold the old view in place above the
                new one until it finished. */}
            {filteredHabits.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-8 sm:py-12"
              >
                {searchTerm ? (
                  <EmptyResult
                    Icon={SearchX}
                    title={`No habits match “${searchTerm}”`}
                    detail="Check the spelling, or try fewer letters."
                  >
                    <Button
                      variant="outline"
                      className="h-11 rounded-full px-6 sm:h-9"
                      onClick={() => setSearchTerm('')}
                    >
                      Clear search
                    </Button>
                  </EmptyResult>
                ) : selectedTab === 'archived' ? (
                  <EmptyResult
                    Icon={Archive}
                    title="No archived habits"
                    detail="Habits you give an end date appear here, with their history intact."
                  />
                ) : habits.length > 0 ? (
                  // Every habit is archived: the Active tab is empty, the
                  // account is not.
                  <EmptyResult
                    Icon={ListChecks}
                    title="No active habits"
                    detail="All your habits are archived. Add a new one, or find the others under Archived."
                  >
                    <Button
                      className="h-11 rounded-full px-6 sm:h-9"
                      onClick={toggleShowAddHabitDialog}
                    >
                      Add habit
                    </Button>
                  </EmptyResult>
                ) : (
                  <EmptyResult
                    Icon={ListChecks}
                    title="No habits yet"
                    detail="Add your first habit to start tracking it every day."
                  >
                    <Button
                      className="h-11 rounded-full px-6 sm:h-9"
                      onClick={toggleShowAddHabitDialog}
                    >
                      Add habit
                    </Button>
                  </EmptyResult>
                )}
              </motion.div>
            ) : (
              <div key="habits">
                {/* Phones: an iOS grouped list. Tap a row to edit its habit,
                    swipe it left to reveal Delete. */}
                <ul
                  aria-label="Habits"
                  className="divide-y divide-(--color-border-primary)/60 overflow-hidden rounded-2xl bg-(--color-card) ring-1 ring-(--color-border-primary)/60 ring-inset sm:hidden"
                >
                  {filteredHabits.map((habit) => (
                    <HabitListRow
                      key={habit.id}
                      habit={habit}
                      detail={`${frequencyText(habit)} · Since ${formatStartDate(habit)}`}
                      status={isArchived(habit) ? 'Archived' : 'Active'}
                      isOpen={swipedId === habit.id}
                      onOpenChange={handleSwipe}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteHabit}
                    />
                  ))}
                </ul>

                <div className="hidden overflow-hidden rounded-lg border border-(--color-border-primary) sm:block">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-(--color-surface-secondary) text-left">
                        <tr>
                          <th className="px-3 py-3 text-xs font-medium text-(--color-text-secondary) sm:px-4 sm:text-sm">
                            Habit
                          </th>
                          <th className="hidden px-3 py-3 text-xs font-medium text-(--color-text-secondary) sm:table-cell sm:px-4 sm:text-sm">
                            Frequency
                          </th>
                          <th className="hidden px-3 py-3 text-xs font-medium text-(--color-text-secondary) sm:px-4 sm:text-sm lg:table-cell">
                            Start Date
                          </th>
                          <th className="px-3 py-3 text-xs font-medium text-(--color-text-secondary) sm:px-4 sm:text-sm">
                            Status
                          </th>
                          <th className="px-3 py-3 text-right text-xs font-medium text-(--color-text-secondary) sm:px-4 sm:text-sm">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-(--color-border-primary) text-(--color-foreground)">
                        {filteredHabits.map((habit) => {
                          const Icon = HabitsIcons[habit.icon];
                          return (
                            <motion.tr
                              key={habit.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="hover:bg-(--color-hover-surface)"
                            >
                              <td className="px-3 py-3 sm:px-4 sm:py-4">
                                <div className="flex items-center gap-2 sm:gap-3">
                                  <div className="flex items-center justify-center rounded-full bg-(--color-brand-light) p-1.5 sm:p-2">
                                    <Icon className="h-4 w-4 text-(--color-brand-primary) sm:h-5 sm:w-5" />
                                  </div>
                                  <span className="line-clamp-2 text-sm font-medium text-(--color-foreground) sm:text-base">
                                    {habit.name}
                                  </span>
                                </div>
                              </td>
                              <td className="hidden px-3 py-3 sm:table-cell sm:px-4 sm:py-4">
                                <div className="flex flex-wrap gap-1">
                                  {habit.frequency.length === 7 ? (
                                    <span className="rounded-full bg-(--color-brand-primary)/10 px-2 py-0.5 text-xs font-medium text-(--color-brand-text)">
                                      {frequencyLabel(habit.frequency)}
                                    </span>
                                  ) : (
                                    habit.frequency.map((day) => (
                                      <span
                                        key={day}
                                        className="rounded-full bg-(--color-brand-primary)/10 px-2 py-0.5 text-xs text-(--color-brand-text)"
                                      >
                                        {day.substring(0, 3)}
                                      </span>
                                    ))
                                  )}
                                </div>
                              </td>
                              <td className="hidden px-3 py-3 text-xs text-(--color-foreground) sm:px-4 sm:py-4 sm:text-sm lg:table-cell">
                                {formatStartDate(habit)}
                              </td>
                              <td className="px-3 py-3 sm:px-4 sm:py-4">
                                <StatusBadge habit={habit} />
                              </td>
                              <td className="px-3 py-3 text-right sm:px-4 sm:py-4">
                                <HabitActions
                                  habit={habit}
                                  onEdit={openEditDialog}
                                  onDelete={handleDeleteHabit}
                                />
                              </td>
                            </motion.tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DeleteHabitConfirmation
        habit={habitToDelete}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
});

export default HabitsOverview;
