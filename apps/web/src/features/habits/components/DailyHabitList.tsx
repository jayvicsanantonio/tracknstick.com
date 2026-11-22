import { memo } from 'react';
import DailyHabitItem from '@/features/habits/components/DailyHabitItem';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { cn } from '@shared/utils/utils';

const DailyHabitList = memo(function DailyHabitList() {
  const { habits } = useHabits();
  const isSparse = habits.length <= 2;

  return (
    // On phones: centered circular medallion constellation (always centering
    // partial last rows cleanly on 360px+ viewports); from sm up: classic glass-orb grid.
    <div
      className={cn(
        'flex flex-wrap justify-center gap-y-6 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5',
        isSparse ? 'gap-x-8' : 'gap-x-3.5 min-[380px]:gap-x-4',
      )}
      aria-label="List of daily habits"
    >
      {habits.map((habit) => (
        <div
          key={habit.id}
          className={cn(
            'sm:w-auto',
            isSparse ? 'w-[104px]' : 'w-[88px] min-[380px]:w-[96px]',
          )}
        >
          <DailyHabitItem habit={habit} />
        </div>
      ))}
    </div>
  );
});

export default DailyHabitList;
