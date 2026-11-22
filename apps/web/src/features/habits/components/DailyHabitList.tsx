import { memo } from 'react';
import DailyHabitItem from '@/features/habits/components/DailyHabitItem';
import { useHabits } from '@/features/habits/hooks/useHabits';

const DailyHabitList = memo(function DailyHabitList() {
  const { habits } = useHabits();

  return (
    // On phones a centred, wrapping row of fixed-width habits, so a short
    // last row sits in the middle; a grid from sm up. The habits show at
    // once, as a native app's list does, rather than one after another.
    <div
      className="flex flex-wrap justify-center gap-x-2 gap-y-5 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      aria-label="List of daily habits"
    >
      {habits.map((habit) => (
        <div key={habit.id} className="w-24 sm:w-auto">
          <DailyHabitItem habit={habit} />
        </div>
      ))}
    </div>
  );
});

export default DailyHabitList;
