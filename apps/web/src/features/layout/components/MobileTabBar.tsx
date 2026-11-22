// Bottom navigation shown below the sm breakpoint: Tracker, Habits, Add, Progress and the habit Coach.
// Puts the app's main actions within thumb reach; the header carries them on wider screens.

import {
  memo,
  type ComponentType,
  type MouseEvent,
  type SVGProps,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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

/**
 * A tap on the tab already open scrolls it back to its top, as an iOS tab
 * bar does, and goes nowhere: a fresh visit to the same page would have the
 * layout put back the scroll position it keeps for that tab. Moving to
 * another tab leaves its scroll position to the layout.
 */
function scrollToTop(event: MouseEvent<HTMLAnchorElement>) {
  event.preventDefault();
  const reduceMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)',
  ).matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
}

function Tab({ to, label, Icon }: TabProps) {
  const { pathname } = useLocation();

  return (
    <NavLink
      to={to}
      end
      onClick={pathname === to ? scrollToTop : undefined}
      className="group flex min-h-14 flex-1 flex-col items-center justify-center gap-1 rounded-2xl text-[11px] font-medium text-(--color-text-secondary) outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) aria-[current=page]:font-bold aria-[current=page]:text-(--color-brand-tertiary) dark:aria-[current=page]:text-(--color-brand-primary)"
    >
      <span className="flex h-8 w-12 items-center justify-center rounded-full transition-colors group-aria-[current=page]:bg-(--color-brand-primary)/15">
        <Icon aria-hidden="true" className="h-5 w-5" />
      </span>
      {label}
    </NavLink>
  );
}

const MobileTabBar = memo(function MobileTabBar() {
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    // Hidden while the keyboard is up, as iOS hides a tab bar: Safari would
    // otherwise leave it floating over the page above the keyboard.
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(env(safe-area-inset-bottom),0.75rem)] sm:hidden keyboard-open:hidden"
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
        <Tab to="/coach" label="Coach" Icon={MessageCircle} />
      </div>
    </nav>
  );
});

export default MobileTabBar;
