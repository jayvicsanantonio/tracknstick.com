// The Progress page's opening card before a first check-in, in place of an all-time summary of zeros.
// With no habits it offers to add one; with habits it points to the Tracker to check one off.

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChartNoAxesColumn, Plus } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import EmptyState from '@shared/components/feedback/EmptyState';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { triggerHaptic } from '@shared/utils/haptics';

interface ProgressGettingStartedProps {
  activeHabitsCount: number;
}

const ProgressGettingStarted = memo(function ProgressGettingStarted({
  activeHabitsCount,
}: ProgressGettingStartedProps) {
  const { openAddHabitDialog } = useHabitsContext();

  if (activeHabitsCount === 0) {
    return (
      <EmptyState
        Icon={ChartNoAxesColumn}
        title="Your progress shows up here"
        detail="Add a habit and check it off on the Tracker. Your streaks, calendar and achievements fill in from there."
        className="max-w-none"
      >
        <Button
          onClick={() => {
            triggerHaptic('medium');
            openAddHabitDialog();
          }}
          className="h-11 rounded-full px-6"
        >
          <Plus aria-hidden="true" className="mr-1 h-4 w-4" />
          Add habit
        </Button>
      </EmptyState>
    );
  }

  return (
    <EmptyState
      Icon={ChartNoAxesColumn}
      title="Check off your first habit"
      detail="Your streaks, consistency and perfect days start counting from your first check-in."
      className="max-w-none"
    >
      <Button asChild className="h-11 rounded-full px-6">
        <Link to="/" onClick={() => triggerHaptic('medium')}>
          Go to Tracker
          <ArrowRight aria-hidden="true" className="ml-1 h-4 w-4" />
        </Link>
      </Button>
    </EmptyState>
  );
});

export default ProgressGettingStarted;
