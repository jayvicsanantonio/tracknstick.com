import { memo } from 'react';
import DailyHabitItem from '@/features/habits/components/DailyHabitItem';
import { useHabits } from '@/features/habits/hooks/useHabits';
import { cn } from '@shared/utils/utils';

const DailyHabitList = memo(function DailyHabitList() {
  const { habits } = useHabits();
  const isTwoUp = habits.length <= 2 || habits.length === 4;

  return (
    // Centered circular medallion grid across all viewports: 2-up for 1-2 or 4 habits
    // on phones so there are no awkward 3+1 orphans, and artistically centered rows on tablet & desktop.
    <div
      className={cn(
        'flex flex-wrap justify-center gap-y-6 sm:mx-auto sm:max-w-none sm:gap-x-7 sm:gap-y-7 md:gap-x-8 md:gap-y-8',
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
            'sm:w-[108px] md:w-[116px]',
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
