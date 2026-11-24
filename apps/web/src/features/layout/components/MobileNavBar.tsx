// Native iOS Collapsing Large Title Navigation Bar for mobile (< sm).
// Pins a translucent frosted top bar under the safe-area status bar whose centered
// 17px inline title fades in smoothly as the 34px Large Title scrolls underneath it.

import { memo, useEffect, useState, type ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { User } from 'lucide-react';
import { cn } from '@shared/utils/utils';
import { triggerHaptic } from '@shared/utils/haptics';
import { useMobileShell } from '@/features/layout/hooks/useMobileShell';

interface MobileNavBarProps {
  /** Large & inline navigation title (e.g. "Today", "Habits", "Progress", "Habit Coach"). */
  title: string;
  /** Optional directional hint for subtle horizontal title glides when switching days. */
  titleDirection?: 'prev' | 'next' | null;
  /** Optional secondary line shown under the title (e.g. "Atomic Habits" on Coach). */
  subtitle?: string;
  /** Compact mode skips the 34px Large Title and shows the centered inline header immediately. */
  compact?: boolean;
  /** External scroll-collapse override for pages whose scroll container is not window (e.g. Coach). */
  collapsed?: boolean;
  /**
   * Optional leading action: beside the avatar while the Large Title shows,
   * and on the left of the inline top bar once it collapses.
   */
  leading?: ReactNode;
  /** Optional trailing action rendered beside the top-right avatar button. */
  trailing?: ReactNode;
}

const COLLAPSE_SCROLL_Y = 38;

const MobileNavBar = memo(function MobileNavBar({
  title,
  titleDirection = null,
  subtitle,
  compact = false,
  collapsed = false,
  leading,
  trailing,
}: MobileNavBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const { openSettings, userImageUrl, userInitial } = useMobileShell();

  useEffect(() => {
    if (compact || typeof window === 'undefined') return;
    const onScroll = () => {
      setScrolled(window.scrollY > COLLAPSE_SCROLL_Y);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [compact]);

  const isCollapsed = scrolled || collapsed;
  const showInlineTitle = compact || isCollapsed;

  return (
    <>
      {/* Pinned translucent iOS navigation bar (direct child of page column so sticky holds all the way down) */}
      <div
        className={cn(
          'sticky top-0 z-30 w-full pt-[calc(env(safe-area-inset-top)+0.5rem)] transition-[background-color,border-color] duration-200 sm:hidden',
          showInlineTitle
            ? 'ios-nav-bar border-b border-(--color-border-primary)/50'
            : 'border-b border-transparent bg-transparent',
        )}
      >
        <div className="relative flex h-11 items-center justify-between px-4">
          {/* Leading slot (the Large Title sits here until the bar collapses) */}
          <div className="z-10 flex min-w-11 items-center justify-start">
            {showInlineTitle ? leading : null}
          </div>

          {/* Centered compact inline title (fades in when Large Title collapses, or always shown in compact mode) */}
          <div
            aria-hidden={!compact && !showInlineTitle}
            className={cn(
              'pointer-events-none absolute inset-x-16 flex flex-col items-center justify-center text-center transition-all duration-200',
              showInlineTitle
                ? 'translate-y-0 opacity-100'
                : 'translate-y-1 opacity-0',
            )}
          >
            <span className="max-w-full truncate text-[17px] leading-tight font-semibold tracking-[-0.015em] text-(--color-foreground)">
              {title}
            </span>
            {showInlineTitle && subtitle ? (
              <span className="max-w-full truncate text-[11px] leading-tight text-(--color-text-secondary)">
                {subtitle}
              </span>
            ) : null}
          </div>

          {/* Trailing actions + profile avatar */}
          <div className="z-10 flex items-center gap-1.5">
            {showInlineTitle ? null : leading}
            {trailing}
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                openSettings();
              }}
              aria-label="Open profile and settings"
              className="flex size-9 items-center justify-center overflow-hidden rounded-full bg-(--color-brand-primary)/15 text-(--color-brand-primary) ring-1 ring-(--color-border-primary)/60 transition-transform focus-visible:ring-2 focus-visible:ring-(--color-ring) focus-visible:outline-none active:scale-92"
            >
              {userImageUrl ? (
                <img
                  src={userImageUrl}
                  alt=""
                  className="size-full object-cover"
                />
              ) : userInitial ? (
                <span className="text-sm font-bold">{userInitial}</span>
              ) : (
                <User aria-hidden="true" className="size-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Collapsing 34px iOS Large Title, pulled up into the bar's row so it
          shares one line with the avatar instead of sitting under an empty row */}
      {!compact ? (
        <div
          className={cn(
            'grid transition-[grid-template-rows,opacity,margin] duration-200 sm:hidden',
            collapsed ? 'grid-rows-[0fr] opacity-0' : '-mt-11 grid-rows-[1fr]',
          )}
        >
          <div className="overflow-hidden">
            <div className="px-4 pt-0 pb-1.5">
              <div
                className={cn(
                  'transition-opacity duration-150',
                  isCollapsed ? 'opacity-0' : 'opacity-100',
                )}
              >
                <motion.p
                  key={title}
                  aria-hidden="true"
                  initial={
                    prefersReducedMotion || !titleDirection
                      ? false
                      : {
                          opacity: 0.3,
                          x: titleDirection === 'next' ? 10 : -10,
                        }
                  }
                  animate={{ opacity: 1, x: 0 }}
                  transition={
                    prefersReducedMotion
                      ? { duration: 0 }
                      : { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="text-[34px] leading-[1.12] font-bold tracking-[-0.025em] text-(--color-foreground)"
                >
                  {title}
                </motion.p>
                {subtitle ? (
                  <p className="mt-0.5 text-[14px] text-(--color-text-secondary)">
                    {subtitle}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
});

export default MobileNavBar;
