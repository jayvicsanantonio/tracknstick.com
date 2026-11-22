import { useState, useMemo, useCallback, memo, type ReactNode } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@shared/components/ui/card';
import { useAllHabits } from '@/features/habits/hooks/useAllHabits';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@shared/components/ui/alert-dialog';
import { Tabs, TabsList, TabsTrigger } from '@shared/components/ui/tabs';
import { Input } from '@shared/components/ui/input';
import { Button } from '@shared/components/ui/button';
import {
  Archive,
  ListChecks,
  Search,
  SearchX,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Habit } from '@/features/habits/types/Habit';
import HabitsIcons from '@/icons/habits';
import HabitActions from '@/features/habits/components/HabitActions';
import SwipeableHabitRow from '@/features/habits/components/SwipeableHabitRow';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import { triggerHaptic } from '@shared/utils/haptics';
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

function HabitsListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading habits"
      className="ios-grouped-card divide-y divide-(--color-border-primary)/40 overflow-hidden rounded-2xl"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center gap-3 px-4 py-3.5">
          <div className="size-10 shrink-0 animate-pulse rounded-xl bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-36 animate-pulse rounded bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
            <div className="h-3 w-24 animate-pulse rounded bg-(--color-brand-primary)/8 motion-reduce:animate-none" />
          </div>
        </div>
      ))}
    </div>
  );
}

const HabitsOverview = memo(function HabitsOverview() {
  const { habits, isLoading, error, deleteHabit } = useAllHabits();
  const { openEditDialog, toggleShowAddHabitDialog } = useHabitsContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [selectedTab, setSelectedTab] = useState<OverviewTab>('all');
  // Only the id is local state. The habit itself is derived from the list, so
  // the dialog cannot describe a habit that is no longer there -- SWR
  // revalidates this list on window focus.
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteHabit = useCallback((habit: Habit) => {
    setDeletingId(habit.id);
  }, []);

  const habitToDelete = habits.find((habit) => habit.id === deletingId);

  const confirmDelete = useCallback(() => {
    if (!habitToDelete) return;
    triggerHaptic('medium');
    void deleteHabit(habitToDelete.id, habitToDelete.name);
    setDeletingId(null);
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
      <div className="flex h-full flex-1 flex-col">
        <MobileNavBar title="Habits" />
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 max-sm:pb-28 sm:px-4 md:px-8 2xl:max-w-[90rem]">
          <Card
            variant="glass"
            className="flex w-full flex-1 flex-col max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none sm:p-6 dark:max-sm:bg-transparent"
          >
            <HabitsListSkeleton />
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <MobileNavBar title="Habits" />
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-4 md:px-8">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center text-red-600 dark:border-red-700 dark:bg-red-900/30 dark:text-red-100">
            Error loading habits. Please try again.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <MobileNavBar title="Habits" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 max-sm:pb-28 sm:px-4 md:px-8 2xl:max-w-[90rem]">
        <Card
          variant="glass"
          className="flex w-full flex-1 flex-col overflow-hidden max-sm:rounded-none max-sm:bg-transparent max-sm:p-0 max-sm:shadow-none max-sm:ring-0 max-sm:backdrop-blur-none dark:max-sm:bg-transparent"
        >
          <CardHeader className="hidden px-3 pt-4 sm:grid sm:px-6 sm:pt-6">
            <div>
              <CardTitle className="mb-2 flex items-center gap-2 text-xl font-bold text-(--color-foreground) sm:text-2xl">
                Habits Overview
              </CardTitle>
              <p className="text-sm text-(--color-text-secondary)">
                Manage all your habits in one place
              </p>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-auto px-4 pb-6 sm:px-6 sm:pb-8">
            <div className="mb-5 flex flex-col justify-between gap-3 sm:mb-6 sm:flex-row sm:gap-4">
              {/* Native iOS UISearchBar on phones, classic Input on wider screens */}
              <div className="flex w-full items-center gap-2 sm:max-w-[300px]">
                <div className="relative flex-1">
                  <Search
                    aria-hidden="true"
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-(--color-text-secondary) sm:hidden"
                  />
                  <Input
                    type="search"
                    aria-label="Search habits"
                    className="w-full max-sm:h-10 max-sm:rounded-xl max-sm:border-0 max-sm:bg-(--color-muted) max-sm:pr-9 max-sm:pl-9 max-sm:shadow-none max-sm:ring-1 max-sm:ring-(--color-border-primary)/40 max-sm:ring-inset"
                    placeholder="Search habits..."
                    value={searchTerm}
                    onFocus={() => setSearchFocused(true)}
                    onBlur={() => setSearchFocused(false)}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm ? (
                    <button
                      type="button"
                      aria-label="Clear search text"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        triggerHaptic('light');
                        setSearchTerm('');
                      }}
                      className="absolute top-1/2 right-2.5 flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-(--color-text-secondary)/25 text-(--color-foreground) sm:hidden"
                    >
                      <X aria-hidden="true" className="size-3" />
                    </button>
                  ) : null}
                </div>
                {searchFocused || searchTerm ? (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      triggerHaptic('light');
                      setSearchTerm('');
                      setSearchFocused(false);
                      (document.activeElement as HTMLElement | null)?.blur();
                    }}
                    className="shrink-0 text-[15px] font-medium text-(--color-brand-primary) active:opacity-60 sm:hidden"
                  >
                    Cancel
                  </button>
                ) : null}
              </div>

              <Tabs
                value={selectedTab}
                onValueChange={(value) => {
                  triggerHaptic('selection');
                  setSelectedTab(value as OverviewTab);
                }}
                className="w-full sm:max-w-[300px]"
              >
                <TabsList className="grid w-full grid-cols-3 bg-(--color-muted)">
                  <TabsTrigger
                    className="max-sm:data-[state=active]:bg-(--color-surface) max-sm:data-[state=active]:text-(--color-foreground) sm:data-[state=active]:bg-(--color-brand-primary) sm:data-[state=active]:text-(--color-text-inverse) dark:max-sm:data-[state=active]:bg-(--color-surface-tertiary)"
                    value="all"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    className="max-sm:data-[state=active]:bg-(--color-surface) max-sm:data-[state=active]:text-(--color-foreground) sm:data-[state=active]:bg-(--color-brand-primary) sm:data-[state=active]:text-(--color-text-inverse) dark:max-sm:data-[state=active]:bg-(--color-surface-tertiary)"
                    value="active"
                  >
                    Active
                  </TabsTrigger>
                  <TabsTrigger
                    className="max-sm:data-[state=active]:bg-(--color-surface) max-sm:data-[state=active]:text-(--color-foreground) sm:data-[state=active]:bg-(--color-brand-primary) sm:data-[state=active]:text-(--color-text-inverse) dark:max-sm:data-[state=active]:bg-(--color-surface-tertiary)"
                    value="archived"
                  >
                    Archived
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {filteredHabits.length === 0 ? (
              <div className="py-8 sm:py-12">
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
              </div>
            ) : (
              <div key="habits">
                {/* Phones: native iOS Inset Grouped List — tap to edit, swipe left to delete. */}
                <div className="sm:hidden">
                  <ul
                    aria-label="Habits"
                    className="ios-grouped-card divide-y divide-(--color-border-primary)/50 overflow-hidden rounded-2xl"
                  >
                    {filteredHabits.map((habit) => (
                      <SwipeableHabitRow
                        key={habit.id}
                        habit={habit}
                        frequencyLabelText={frequencyText(habit)}
                        startDateText={formatStartDate(habit)}
                        onEdit={openEditDialog}
                        onDelete={handleDeleteHabit}
                      />
                    ))}
                  </ul>
                  <p className="mt-2.5 px-2 text-center text-[12px] text-(--color-text-secondary)/75">
                    Tap a habit to edit or view stats · Swipe left to delete
                  </p>
                </div>

                {/* Desktop & tablet: table view preserved intact. */}
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
                            <tr
                              key={habit.id}
                              className="transition-colors hover:bg-(--color-hover-surface)"
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
                              <td className="hidden px-3 py-3 text-xs text-(--color-foreground) tabular-nums sm:px-4 sm:py-4 sm:text-sm lg:table-cell">
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
                            </tr>
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

      <AlertDialog
        open={habitToDelete !== undefined}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="bg-(--color-card) text-(--color-card-foreground)">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-(--color-foreground)">
              Delete Habit
            </AlertDialogTitle>
            <AlertDialogDescription className="text-(--color-text-secondary)">
              Are you sure you want to delete &quot;
              {habitToDelete?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-(--color-muted) text-(--color-foreground) hover:bg-(--color-hover-surface)">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-(--color-destructive) text-(--color-destructive-foreground) hover:opacity-90 focus:ring-(--color-ring)"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

export default HabitsOverview;
