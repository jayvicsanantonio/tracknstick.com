import { memo } from 'react';
import DailyHabitItem from '@/features/habits/components/DailyHabitItem';
import { useHabits } from '@/features/habits/hooks/useHabits';

const DailyHabitList = memo(function DailyHabitList() {
  const { habits } = useHabits();

  return (
    // On phones a full-width stack of tactile native iOS habit check cards;
    // from sm up, the spacious circular glass-orb grid. Renders immediately
    // with zero artificial stagger delay so tab switches and day swipes feel native.
    <div
      className="flex flex-col gap-2.5 sm:grid sm:grid-cols-3 sm:gap-4 md:grid-cols-4 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5"
      aria-label="List of daily habits"
    >
      {habits.map((habit) => (
        <div key={habit.id} className="w-full sm:w-auto">
          <DailyHabitItem habit={habit} />
        </div>
      ))}
    </div>
  );
});

export default DailyHabitList;
