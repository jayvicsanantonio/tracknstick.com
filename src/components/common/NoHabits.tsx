import { useContext } from 'react';
import { Button } from '@/components/ui/button';
import { ThemeContext } from '@/context/ThemeContext';
import { CalendarX2, PlusCircle } from 'lucide-react';

export default function NoHabits({
  onAddHabitClick,
}: {
  onAddHabitClick: () => void;
}) {
  const { isDarkMode } = useContext(ThemeContext);

  return (
    <div
      className={`${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100 '
      } flex flex-col items-center justify-center gap-4 py-8 px-20 text-center rounded-lg`}
    >
      <CalendarX2
        className={`${
          isDarkMode ? 'text-purple-400' : 'text-purple-600'
        } h-12 w-12`}
      />
      <h3
        className={`${
          isDarkMode ? 'text-purple-400' : 'text-purple-600'
        } text-lg font-semibold`}
      >
        No Habits Found
      </h3>
      <p
        className={`${
          isDarkMode ? 'text-purple-400' : 'text-purple-600'
        } mt-2`}
      >
        Try adding a new habit to start tracking your daily progress,
        or check a different date to view existing habits. Building
        good habits is the first step towards achieving your goals!
      </p>
      <Button
        onClick={onAddHabitClick}
        className={`${
          isDarkMode
            ? 'bg-purple-700 hover:bg-purple-600'
            : 'bg-purple-600 hover:bg-purple-700'
        } text-white rounded-full font-semibold transition-colors duration-300 shadow-lg mt-4`}
        aria-label="Add a new habit"
      >
        <PlusCircle className="mr-2 h-4 w-4" /> Add New Habit
      </Button>
    </div>
  );
}
