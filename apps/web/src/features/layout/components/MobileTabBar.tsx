// Bottom navigation shown below the sm breakpoint: Tracker, Habits, Progress and Coach tabs, and an Add button beside them.
// Puts the app's main actions within thumb reach; the header carries them on wider screens.

import {
  memo,
  type ComponentType,
  type MouseEvent,
  type SVGProps,
} from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { SPRINGS } from '@shared/utils/springs';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { cn } from '@shared/utils/utils';

const { BarChart2, Calendar, ListChecks, Plus } = MiscellaneousIcons;

/** The frosted glass of the tab bar's capsule and its Add button. */
const GLASS =
  'bg-(--color-surface)/85 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_32px_rgba(0,0,0,0.12)] ring-1 ring-(--color-border-primary)/50 backdrop-blur-xl backdrop-saturate-150 ring-inset dark:bg-(--color-surface-secondary)/85';

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
      className="relative flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium text-(--color-text-secondary) outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) aria-[current=page]:font-semibold aria-[current=page]:text-(--color-brand-tertiary) dark:aria-[current=page]:text-(--color-brand-primary)"
    >
      {/* One highlight, shared by every tab, slides to the tab opened, as
          the selection in an iOS tab bar does. */}
      {pathname === to ? (
        <motion.span
          aria-hidden="true"
          data-tab-highlight
          layoutId="tab-highlight"
          transition={SPRINGS.snap}
          className="absolute inset-0 rounded-full bg-(--color-brand-primary)/15"
        />
      ) : null}
      <Icon aria-hidden="true" className="relative h-5 w-5" />
      <span className="relative">{label}</span>
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
      {/* As iOS 26 draws a tab bar: the tabs in one glass capsule, and
          the page's main action in a round glass button of its own. */}
      <div className="flex items-center gap-2">
        <div
          data-tab-capsule
          className={cn(
            GLASS,
            'flex flex-1 items-center gap-0.5 rounded-full p-1',
          )}
        >
          <Tab to="/" label="Tracker" Icon={Calendar} />
          <Tab to="/habits" label="Habits" Icon={ListChecks} />
          <Tab to="/progress" label="Progress" Icon={BarChart2} />
          <Tab to="/coach" label="Coach" Icon={MessageCircle} />
        </div>
        <button
          type="button"
          onClick={toggleShowAddHabitDialog}
          aria-label="Add Habit"
          className={cn(
            GLASS,
            'flex size-16 shrink-0 items-center justify-center rounded-full',
            'text-(--color-brand-tertiary) dark:text-(--color-brand-primary)',
            'transition-transform outline-none active:scale-90 motion-reduce:transition-none',
            'focus-visible:ring-2 focus-visible:ring-(--color-ring)',
          )}
        >
          <Plus aria-hidden="true" className="h-7 w-7" strokeWidth={2.5} />
        </button>
      </div>
    </nav>
  );
});

export default MobileTabBar;
