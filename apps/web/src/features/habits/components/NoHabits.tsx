// Empty state for a user with no habits at all: invites them to add their first one.
// Distinct from NothingScheduled, shown when habits exist but none are due that day.

import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle, Plus, Sprout } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import EmptyState from '@shared/components/feedback/EmptyState';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import type { HabitDraft } from '@/features/habits/context/HabitsStateContextDefinition';
import HabitsIcons from '@/icons/habits';
import { triggerHaptic } from '@shared/utils/haptics';

const EVERY_DAY: HabitDraft['frequency'] = [
  'Sun',
  'Mon',
  'Tue',
  'Wed',
  'Thu',
  'Fri',
  'Sat',
];

/** Small daily habits a new user can start from, each one tap from a filled-in form. */
const STARTER_HABITS: HabitDraft[] = [
  { name: 'Drink water', icon: 'GlassWater', frequency: EVERY_DAY },
  { name: 'Read 10 pages', icon: 'BookOpen', frequency: EVERY_DAY },
  { name: 'Take a walk', icon: 'Footprints', frequency: EVERY_DAY },
  { name: 'Meditate', icon: 'Brain', frequency: EVERY_DAY },
];

const NoHabits = memo(function NoHabits() {
  const { openAddHabitDialog } = useHabitsContext();

  return (
    <EmptyState
      Icon={Sprout}
      title="No habits yet"
      detail="Start your streak by adding your first habit. Small steps today become big wins over time."
      footer={
        <div className="border-t border-(--color-brand-primary)/12 pt-5">
          <p className="text-[11px] leading-none font-semibold tracking-[0.09em] text-(--color-brand-primary) uppercase">
            Or start with one of these
          </p>
          <ul
            aria-label="Starter habits"
            className="mt-3 flex flex-wrap justify-center gap-2"
          >
            {STARTER_HABITS.map((starter) => {
              const Icon = HabitsIcons[starter.icon];
              return (
                <li key={starter.name}>
                  <button
                    type="button"
                    aria-label={`Start with ${starter.name}`}
                    onClick={() => {
                      triggerHaptic('light');
                      openAddHabitDialog(starter);
                    }}
                    className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-(--color-brand-primary)/10 px-3.5 text-[13px] font-semibold text-(--color-brand-text) ring-1 ring-(--color-brand-primary)/20 transition-[background-color,transform] ring-inset hover:bg-(--color-brand-primary)/16 focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-95 dark:text-(--color-brand-text-light)"
                  >
                    <Icon aria-hidden="true" className="size-4" />
                    {starter.name}
                  </button>
                </li>
              );
            })}
          </ul>
          <Link
            to="/coach"
            className="mt-5 inline-flex items-center gap-1.5 rounded-md text-[13px] font-medium text-(--color-text-secondary) underline-offset-4 hover:text-(--color-brand-primary) hover:underline focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none"
          >
            <MessageCircle aria-hidden="true" className="size-3.5" />
            Not sure where to start? Ask the coach
          </Link>
        </div>
      }
    >
      <Button
        onClick={() => openAddHabitDialog()}
        className="h-11 rounded-full px-6"
      >
        <Plus aria-hidden="true" className="mr-1 h-4 w-4" />
        Add habit
      </Button>
    </EmptyState>
  );
});

export default NoHabits;
