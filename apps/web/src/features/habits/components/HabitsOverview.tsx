import { useState, useMemo, useCallback, memo, type ReactNode } from 'react';
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
  ChevronRight,
  ListChecks,
  Search,
  SearchX,
  Trash2,
  WifiOff,
  X,
  type LucideIcon,
} from 'lucide-react';
import { Habit } from '@/features/habits/types/Habit';
import HabitsIcons from '@/icons/habits';
import SwipeableHabitRow from '@/features/habits/components/SwipeableHabitRow';
import MobileNavBar from '@/features/layout/components/MobileNavBar';
import { useIsMobile } from '@shared/hooks/useIsMobile';
import { frequencyLabel } from '@shared/utils/frequencyLabel';
import { triggerHaptic } from '@shared/utils/haptics';
import { cn } from '@shared/utils/utils';
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
    <div className="ios-tracker-card mx-auto flex w-full max-w-md flex-col items-center rounded-[26px] px-6 py-12 text-center sm:px-8 sm:py-14">
      <span className="mb-4 flex size-13 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 ring-1 ring-(--color-brand-primary)/24 ring-inset">
        <Icon
          aria-hidden="true"
          className="h-6 w-6 text-(--color-brand-primary)"
        />
      </span>
      <p className="text-lg font-semibold tracking-tight text-(--color-foreground)">
        {title}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-(--color-text-secondary)">
        {detail}
      </p>
      {children ? <div className="mt-5">{children}</div> : null}
    </div>
  );
}

interface DesktopHabitCardProps {
  habit: Habit;
  frequencyLabelText: string;
  startDateText: string;
  onEdit: (habit: Habit) => void;
  onDelete: (habit: Habit) => void;
}

/** Tactile habit card for tablet & desktop matching phone's SwipeableHabitRow visual design. */
const DesktopHabitCard = memo(function DesktopHabitCard({
  habit,
  frequencyLabelText,
  startDateText,
  onEdit,
  onDelete,
}: DesktopHabitCardProps) {
  const Icon = HabitsIcons[habit.icon];
  const archived = isArchived(habit);

  return (
    <li className="ios-tracker-card group relative flex items-center overflow-hidden rounded-[20px] transition-[border-color,transform] duration-150 hover:border-(--color-brand-primary)/35">
      <button
        type="button"
        aria-label={`Edit ${habit.name}`}
        onClick={() => {
          triggerHaptic('light');
          onEdit(habit);
        }}
        className="flex min-h-[76px] min-w-0 flex-1 cursor-pointer items-center gap-3.5 px-4 py-3.5 text-left transition-colors hover:bg-(--color-brand-primary)/[0.04] focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none focus-visible:ring-inset active:bg-(--color-brand-primary)/8"
      >
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-[15px] ring-1 ring-inset',
            archived
              ? 'bg-(--color-text-secondary)/12 text-(--color-text-secondary) ring-(--color-border-primary)/45'
              : 'bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-(--color-brand-primary)/24',
          )}
        >
          <Icon aria-hidden="true" className="size-6" />
        </span>

        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span
              className={cn(
                'truncate text-[16px] leading-snug font-semibold tracking-[-0.01em]',
                archived
                  ? 'text-(--color-foreground)/75'
                  : 'text-(--color-foreground)',
              )}
            >
              {habit.name}
            </span>
            <span
              className={cn(
                'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[11px]',
                archived
                  ? 'bg-(--color-text-secondary)/12 font-medium text-(--color-text-secondary)'
                  : 'bg-(--color-brand-primary)/14 font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/20 ring-inset dark:text-(--color-brand-text-light)',
              )}
            >
              {!archived ? (
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-(--color-brand-primary)"
                />
              ) : null}
              {archived ? 'Archived' : 'Active'}
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[13px] leading-tight text-(--color-text-secondary)">
            <span className="truncate">{frequencyLabelText}</span>
            <span aria-hidden="true" className="opacity-50">
              ·
            </span>
            <span className="shrink-0 tabular-nums">Since {startDateText}</span>
          </span>
        </span>

        <ChevronRight
          aria-hidden="true"
          className={cn(
            'size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5',
            archived
              ? 'text-(--color-text-secondary)/50'
              : 'text-(--color-brand-primary)/60 group-hover:text-(--color-brand-primary)',
          )}
        />
      </button>

      <div
        aria-hidden="true"
        className="h-8 w-px shrink-0 bg-(--color-border-primary)/45"
      />

      <button
        type="button"
        aria-label={`Delete ${habit.name}`}
        onClick={() => {
          triggerHaptic('light');
          onDelete(habit);
        }}
        className="mx-2 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl text-(--color-text-secondary)/65 transition-[background-color,color,transform] hover:bg-(--color-destructive)/12 hover:text-(--color-destructive) focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-92"
      >
        <Trash2 aria-hidden="true" className="size-4" />
      </button>
    </li>
  );
});

function HabitsListSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading habits"
      className="flex w-full flex-col gap-3 pt-1"
    >
      {/* Tablet & desktop page title placeholder */}
      <div className="mb-2 hidden flex-col gap-2 sm:flex">
        <div className="h-8 w-28 animate-pulse rounded-xl bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
        <div className="h-4 w-56 animate-pulse rounded-full bg-(--color-brand-primary)/8 motion-reduce:animate-none" />
      </div>

      {/* Controls row: search capsule + segmented filter */}
      <div className="mb-2 flex flex-col justify-between gap-2.5 sm:mb-3 sm:flex-row sm:items-center sm:gap-4">
        <div className="ios-tracker-card h-11 w-full animate-pulse rounded-2xl motion-reduce:animate-none sm:max-w-sm" />
        <div className="ios-tracker-card h-11 w-full animate-pulse rounded-2xl motion-reduce:animate-none sm:max-w-[300px]" />
      </div>

      {/* Section eyebrow */}
      <div className="flex items-center justify-between px-1">
        <div className="h-3 w-24 animate-pulse rounded-full bg-(--color-brand-primary)/10 motion-reduce:animate-none" />
        <div className="h-5 w-8 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
      </div>

      {/* Tactile habit cards */}
      <div className="grid grid-cols-1 gap-2.5 sm:gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="ios-tracker-card flex items-center gap-3.5 rounded-[20px] px-3.5 py-3 sm:px-4 sm:py-3.5"
          >
            <div className="size-12 shrink-0 animate-pulse rounded-[15px] bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 animate-pulse rounded-full bg-(--color-brand-primary)/12 motion-reduce:animate-none" />
              <div className="h-3 w-24 animate-pulse rounded-full bg-(--color-brand-primary)/8 motion-reduce:animate-none" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const SECTION_TITLE: Record<OverviewTab, string> = {
  all: 'All Habits',
  active: 'Active Habits',
  archived: 'Archived Habits',
};

const HabitsOverview = memo(function HabitsOverview() {
  const { habits, isLoading, error, deleteHabit, retry } = useAllHabits();
  const { openEditDialog, toggleShowAddHabitDialog } = useHabitsContext();
  const isMobile = useIsMobile();
  const [searchTerm, setSearchTerm] = useState('');
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
        <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 max-sm:pb-28 sm:pt-1 sm:pb-6 md:px-8 2xl:max-w-[90rem]">
          <HabitsListSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-1 flex-col">
        <MobileNavBar title="Habits" />
        <div className="mx-auto flex w-full max-w-7xl flex-1 items-center justify-center px-4 max-sm:pb-28 md:px-8 2xl:max-w-[90rem]">
          <div className="ios-tracker-card flex w-full max-w-md flex-col items-center gap-4 rounded-[26px] px-6 py-10 text-center sm:px-8 sm:py-12">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-(--color-brand-primary)/14 text-(--color-brand-primary) ring-1 ring-(--color-brand-primary)/24 ring-inset">
              <WifiOff aria-hidden="true" className="size-5" />
            </span>
            <p role="alert" className="text-[15px] text-(--color-foreground)">
              Your habits could not be loaded. Check your connection and try
              again.
            </p>
            {retry ? (
              <Button
                variant="outline"
                className="h-11 rounded-full px-6"
                onClick={() => void retry()}
              >
                Try again
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-1 flex-col">
      <MobileNavBar title="Habits" />

      <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 pt-1 max-sm:pb-28 sm:pb-8 md:px-8 2xl:max-w-[90rem]">
        {/* Tablet & desktop page header matching phone Large Title hierarchy */}
        <div className="mb-5 hidden sm:block">
          <h2 className="text-[32px] leading-none font-extrabold tracking-[-0.025em] text-(--color-foreground)">
            Habits
          </h2>
          <p className="mt-1.5 text-sm text-(--color-text-secondary)">
            Manage all your habits in one place
          </p>
        </div>

        {/* Search capsule + segmented filter matching phone across all viewports */}
        <div className="mb-5 flex flex-col justify-between gap-2.5 sm:mb-6 sm:flex-row sm:items-center sm:gap-4">
          <div className="ios-tracker-card relative flex h-11 w-full items-center rounded-2xl transition-shadow focus-within:ring-2 focus-within:ring-(--color-ring) sm:max-w-sm">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-(--color-brand-primary)/80"
            />
            <Input
              type="search"
              aria-label="Search habits"
              className="h-full w-full border-0 bg-transparent pr-10 pl-10 text-[16px] shadow-none placeholder:text-(--color-text-secondary)/70 focus-visible:ring-0 sm:text-sm [&::-webkit-search-cancel-button]:hidden"
              placeholder="Search habits..."
              value={searchTerm}
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
                className="absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-(--color-brand-primary)/15 text-(--color-brand-primary) transition-transform hover:bg-(--color-brand-primary)/25 active:scale-90"
              >
                <X aria-hidden="true" className="size-3.5" />
              </button>
            ) : null}
          </div>

          <div className="ios-tracker-card w-full rounded-2xl p-1 sm:max-w-[300px]">
            <Tabs
              value={selectedTab}
              onValueChange={(value) => {
                triggerHaptic('selection');
                setSelectedTab(value as OverviewTab);
              }}
              className="w-full"
            >
              <TabsList className="grid h-9 w-full grid-cols-3 bg-transparent p-0 ring-0">
                <TabsTrigger
                  className="rounded-xl text-[13px] font-semibold text-(--color-text-secondary) hover:text-(--color-foreground) data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-primary-foreground) data-[state=active]:shadow-[0_2px_10px_color-mix(in_oklab,var(--color-brand-primary)_35%,transparent)] sm:rounded-xl"
                  value="all"
                >
                  All
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-xl text-[13px] font-semibold text-(--color-text-secondary) hover:text-(--color-foreground) data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-primary-foreground) data-[state=active]:shadow-[0_2px_10px_color-mix(in_oklab,var(--color-brand-primary)_35%,transparent)] sm:rounded-xl"
                  value="active"
                >
                  Active
                </TabsTrigger>
                <TabsTrigger
                  className="rounded-xl text-[13px] font-semibold text-(--color-text-secondary) hover:text-(--color-foreground) data-[state=active]:bg-(--color-brand-primary) data-[state=active]:text-(--color-primary-foreground) data-[state=active]:shadow-[0_2px_10px_color-mix(in_oklab,var(--color-brand-primary)_35%,transparent)] sm:rounded-xl"
                  value="archived"
                >
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {filteredHabits.length === 0 ? (
          <div className="py-2 sm:py-8">
            {searchTerm ? (
              <EmptyResult
                Icon={SearchX}
                title={`No habits match “${searchTerm}”`}
                detail="Check the spelling, or try fewer letters."
              >
                <Button
                  variant="outline"
                  className="h-11 rounded-full px-6"
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
                  className="h-11 rounded-full px-6"
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
                  className="h-11 rounded-full px-6"
                  onClick={toggleShowAddHabitDialog}
                >
                  Add habit
                </Button>
              </EmptyResult>
            )}
          </div>
        ) : (
          <div key="habits">
            {/* Section eyebrow matching Tracker & Coach across all viewports */}
            <div className="mb-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-1.5 rounded-full bg-(--color-brand-primary)"
                />
                <span className="text-[11px] leading-none font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
                  {searchTerm ? 'Search Results' : SECTION_TITLE[selectedTab]}
                </span>
              </div>
              <span className="rounded-full bg-(--color-brand-primary)/12 px-2.5 py-0.5 text-[11px] font-semibold text-(--color-brand-text) tabular-nums ring-1 ring-(--color-brand-primary)/20 ring-inset dark:text-(--color-brand-text-light)">
                {filteredHabits.length}
              </span>
            </div>

            {isMobile ? (
              <>
                <ul aria-label="Habits" className="flex flex-col gap-2.5">
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
                <p className="mt-5 px-2 text-center text-[12px] text-(--color-text-secondary)/65">
                  Tap a habit to edit or view stats · Swipe left to delete
                </p>
              </>
            ) : (
              <>
                <ul
                  aria-label="Habits"
                  className="grid grid-cols-1 gap-3 lg:grid-cols-2"
                >
                  {filteredHabits.map((habit) => (
                    <DesktopHabitCard
                      key={habit.id}
                      habit={habit}
                      frequencyLabelText={frequencyText(habit)}
                      startDateText={formatStartDate(habit)}
                      onEdit={openEditDialog}
                      onDelete={handleDeleteHabit}
                    />
                  ))}
                </ul>
                <p className="mt-5 px-2 text-center text-xs text-(--color-text-secondary)/65">
                  Click a habit to edit or view stats
                </p>
              </>
            )}
          </div>
        )}
      </div>

      <AlertDialog
        open={habitToDelete !== undefined}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent className="text-(--color-card-foreground)">
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
