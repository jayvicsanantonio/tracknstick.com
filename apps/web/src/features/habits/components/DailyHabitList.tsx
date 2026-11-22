import { memo } from 'react';
import DailyHabitItem from '@/features/habits/components/DailyHabitItem';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { cn } from '@shared/utils/utils';

const DailyHabitList = memo(function DailyHabitList() {
  const { habits } = useHabits();
  const isTwoUp = habits.length <= 2 || habits.length === 4;

  return (
    // On phones: centered circular grid (2-up for 1-2 or 4 habits so there are no
    // awkward 3+1 orphans, 3-up centered flex-wrap for 3 and 5+); from sm up: classic glass-orb grid.
    <div
      className={cn(
        'flex flex-wrap justify-center gap-y-5 sm:mx-0 sm:grid sm:max-w-none sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        isTwoUp
          ? 'mx-auto max-w-[260px] gap-x-10'
          : 'gap-x-3.5 min-[380px]:gap-x-4',
      )}
      aria-label="List of daily habits"
    >
      {habits.map((habit) => (
        <div
          key={habit.id}
          className={cn(
            'sm:w-auto',
            isTwoUp ? 'w-[104px]' : 'w-[88px] min-[380px]:w-[96px]',
          )}
        >
          <DailyHabitItem habit={habit} />
        </div>
      ))}
    </div>
  );
});

export default DailyHabitList;
