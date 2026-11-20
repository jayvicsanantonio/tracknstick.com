// Bottom navigation shown below the sm breakpoint: Tracker, Habits, Add, Progress and the habit Coach.
// Puts the app's main actions within thumb reach; the header and chat button carry them on wider screens.

import { memo, type ComponentType, type SVGProps } from 'react';
import { NavLink } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { cn } from '@shared/utils/utils';

const { BarChart2, Calendar, ListChecks, Plus } = MiscellaneousIcons;

interface TabProps {
  to: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
}

function Tab({ to, label, Icon }: TabProps) {
  return (
    <NavLink
      to={to}
      end
      className="group flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium text-(--color-text-secondary) outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) aria-[current=page]:font-bold aria-[current=page]:text-(--color-brand-tertiary) dark:aria-[current=page]:text-(--color-brand-primary)"
    >
      <span className="flex h-8 w-12 items-center justify-center rounded-full transition-colors group-aria-[current=page]:bg-(--color-brand-primary)/15">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      {label}
    </NavLink>
  );
}

interface MobileTabBarProps {
  /** Opens the habit coach, which has no route of its own. */
  onOpenChat: () => void;
}

const MobileTabBar = memo(function MobileTabBar({
  onOpenChat,
}: MobileTabBarProps) {
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:hidden"
    >
      <div className="flex items-center gap-1 rounded-3xl bg-(--color-surface)/90 px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-(--color-border-primary)/50 backdrop-blur-xl backdrop-saturate-150 ring-inset dark:bg-(--color-surface-secondary)/90">
        <Tab to="/" label="Tracker" Icon={Calendar} />
        <Tab to="/habits" label="Habits" Icon={ListChecks} />
        <div className="flex flex-1 justify-center">
          <button
            type="button"
            onClick={toggleShowAddHabitDialog}
            aria-label="Add Habit"
            className={cn(
              '-mt-7 flex h-14 w-14 items-center justify-center rounded-full',
              'bg-(--color-brand-primary) text-(--color-primary-foreground)',
              'shadow-(--color-brand-primary)/30 shadow-lg ring-4 ring-(--color-background)',
              'transition-transform outline-none active:scale-95 motion-reduce:transition-none',
              'focus-visible:ring-(--color-ring)',
            )}
          >
            <Plus aria-hidden="true" className="h-6 w-6" strokeWidth={2.5} />
          </button>
        </div>
        <Tab to="/progress" label="Progress" Icon={BarChart2} />
        <button
          type="button"
          onClick={onOpenChat}
          className="flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium text-(--color-text-secondary) outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring)"
        >
          <span className="flex h-8 w-12 items-center justify-center rounded-full">
            <MessageCircle aria-hidden="true" className="h-5 w-5" />
          </span>
          Coach
        </button>
      </div>
    </nav>
  );
});

export default MobileTabBar;
