// iOS 26 Liquid Glass mobile bottom navigation (< sm):
// A floating translucent 4-tab glass capsule with a spring-animated active lens
// paired with a separate detached circular "+" Liquid Glass action orb beside it.
// Hides smoothly when the iOS software keyboard opens, preloads chunks on touch,
// and scrolls to top (or resets Tracker to Today) when tapping the already-active tab.

import {
  memo,
  useContext,
  useEffect,
  type ComponentType,
  type SVGProps,
} from 'react';
import { createPortal } from 'react-dom';
import { NavLink, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { DateContext } from '@app/providers/DateContext';
import { cn } from '@shared/utils/utils';
import { triggerHaptic } from '@shared/utils/haptics';
import { preloadChunk, type PreloadTarget } from '@shared/utils/preloadRoutes';
import { useVisualViewport } from '@shared/hooks/useVisualViewport';
import { IOS_SPRING_TAB, IOS_SPRING_TAP } from '@shared/utils/motion';

const { BarChart2, Calendar, ListChecks, Plus } = MiscellaneousIcons;

interface TabProps {
  to: string;
  label: string;
  preload: PreloadTarget;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  isActive: boolean;
  onActiveRetap: () => void;
}

function Tab({ to, label, preload, Icon, isActive, onActiveRetap }: TabProps) {
  return (
    <NavLink
      to={to}
      end
      onTouchStart={() => preloadChunk(preload)}
      onPointerEnter={() => preloadChunk(preload)}
      onClick={(event) => {
        triggerHaptic('selection');
        if (isActive) {
          event.preventDefault();
          onActiveRetap();
        }
      }}
      className={cn(
        'relative z-10 flex h-13 flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[10px] leading-none tracking-[-0.01em] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-95',
        isActive
          ? 'font-semibold text-(--color-brand-tertiary) dark:text-(--color-brand-primary)'
          : 'font-medium text-(--color-text-secondary)',
      )}
    >
      {isActive ? (
        <motion.span
          layoutId="ios-liquid-tab-lens"
          transition={IOS_SPRING_TAB}
          aria-hidden="true"
          className="ios-liquid-lens absolute inset-0 -z-10 rounded-full"
        />
      ) : null}
      <Icon
        aria-hidden="true"
        className="size-[21px]"
        strokeWidth={isActive ? 2.4 : 1.85}
      />
      <span>{label}</span>
    </NavLink>
  );
}

const MobileTabBar = memo(function MobileTabBar() {
  const { toggleShowAddHabitDialog } = useHabitsContext();
  const dateContext = useContext(DateContext);
  const { pathname } = useLocation();
  const { isKeyboardOpen } = useVisualViewport();

  // Reset window scroll when switching mobile tabs so each tab starts cleanly at its Large Title.
  useEffect(() => {
    if (typeof window !== 'undefined' && window.scrollY > 0) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  const handleRetap = (to: string) => {
    window.scrollTo?.({ top: 0, behavior: 'smooth' });
    if (to === '/' && dateContext) {
      dateContext.setDate(new Date());
    }
  };

  const nav = (
    <nav
      aria-label="Primary"
      aria-hidden={isKeyboardOpen || undefined}
      className={cn(
        'pointer-events-none fixed inset-x-0 bottom-0 z-40 px-4 pb-[max(env(safe-area-inset-bottom),0.75rem)] transition-[transform,opacity] duration-200 ease-out sm:hidden',
        isKeyboardOpen && 'translate-y-28 opacity-0',
      )}
    >
      <div className="mx-auto flex max-w-md items-center gap-2.5">
        {/* Floating iOS 26 Liquid Glass 4-tab capsule */}
        <div className="ios-liquid-glass pointer-events-auto flex flex-1 items-center gap-0.5 rounded-full p-1">
          <Tab
            to="/"
            label="Tracker"
            preload="dashboard"
            Icon={Calendar}
            isActive={pathname === '/'}
            onActiveRetap={() => handleRetap('/')}
          />
          <Tab
            to="/habits"
            label="Habits"
            preload="habits"
            Icon={ListChecks}
            isActive={pathname === '/habits'}
            onActiveRetap={() => handleRetap('/habits')}
          />
          <Tab
            to="/progress"
            label="Progress"
            preload="progress"
            Icon={BarChart2}
            isActive={pathname === '/progress'}
            onActiveRetap={() => handleRetap('/progress')}
          />
          <Tab
            to="/coach"
            label="Coach"
            preload="coach"
            Icon={MessageCircle}
            isActive={pathname === '/coach'}
            onActiveRetap={() => handleRetap('/coach')}
          />
        </div>

        {/* Detached iOS 26 Liquid Glass circular "+" action orb */}
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          transition={IOS_SPRING_TAP}
          onTouchStart={() => preloadChunk('habitForm')}
          onPointerEnter={() => preloadChunk('habitForm')}
          onClick={() => {
            triggerHaptic('medium');
            toggleShowAddHabitDialog();
          }}
          aria-label="Add Habit"
          className={cn(
            'pointer-events-auto flex size-[60px] shrink-0 items-center justify-center rounded-full',
            'bg-(--color-brand-primary) text-(--color-primary-foreground)',
            'shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_8px_20px_rgba(0,0,0,0.16),0_2px_6px_rgba(0,0,0,0.06)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.22),0_10px_24px_rgba(0,0,0,0.45),0_2px_6px_rgba(0,0,0,0.25)]',
            'ring-1 ring-white/20 outline-none ring-inset',
            'focus-visible:ring-2 focus-visible:ring-(--color-ring)',
          )}
        >
          <Plus aria-hidden="true" className="size-6" strokeWidth={2.6} />
        </motion.button>
      </div>
    </nav>
  );

  // Portal directly to document.body so no ancestor transform (such as the iOS
  // sheet scale-down) can ever trap position:fixed off-screen on tall pages.
  return typeof document !== 'undefined'
    ? createPortal(nav, document.body)
    : nav;
});

export default MobileTabBar;
