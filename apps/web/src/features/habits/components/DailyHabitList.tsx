import { memo } from 'react';
import DailyHabitItem from '@/features/habits/components/DailyHabitItem';
import { useHabits } from '@/features/habits/hooks/useHabits';

const DailyHabitList = memo(function DailyHabitList() {
  const { habits } = useHabits();

  return (
    // On phones a centred, wrapping row of fixed-width habits, so a short
    // last row sits in the middle; a grid from sm up. Renders immediately
    // with zero artificial stagger delay so tab switches and day swipes feel native.
    <div
      className="flex flex-wrap justify-center gap-x-3 gap-y-5 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      aria-label="List of daily habits"
    >
      {habits.map((habit) => (
        <div key={habit.id} className="w-[5.75rem] sm:w-auto">
          <DailyHabitItem habit={habit} />
        </div>
      ))}
    </div>
  );
});

export default DailyHabitList;
