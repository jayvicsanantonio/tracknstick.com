// The app header: the Track N' Stick logo, linking to the Tracker, and a toolbar of navigation and actions.
// Both sit in matching glass pills of one height; on phones the toolbar keeps only theme and account.

import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
// import { NavLink } from 'react-router-dom';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { Button } from '@shared/components/ui/button';
// import { buttonVariants } from '@shared/components/ui/button-variants';
import IconNavLink from './IconNavLink';
import { useTheme } from '@shared/hooks/useTheme';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { cn } from '@shared/utils/utils';

const { Check, ListChecks, Moon, Plus, Sun, BarChart2, Calendar } =
  MiscellaneousIcons;

// The glass pill both halves of the header sit in. One height, h-14, holds a
// row of 44px controls with 6px padding, so the logo and the toolbar line up.
const PILL =
  'flex h-14 items-center rounded-full bg-(--color-surface)/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-(--color-border-primary)/40 backdrop-blur-xl backdrop-saturate-150 ring-inset dark:bg-(--color-surface-secondary)/80';

// Header icon buttons: 44px at every width, flat inside the pill's shadow.
const HEADER_BUTTON = 'sm:size-11 shadow-none hover:shadow-none';

const Header = memo(function Header() {
  const { toggleMode } = useTheme();
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <header className="sticky top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 sm:px-4 sm:py-8 md:px-8 2xl:max-w-[90rem]">
        <Link
          to="/"
          aria-label="Track N' Stick"
          className={cn(
            PILL,
            'gap-2.5 pr-4 outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) sm:pr-5',
          )}
        >
          {/* The mark is a filled circle the size of the toolbar's buttons,
              so the two pills read as one row. */}
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-sm"
          >
            <Check className="size-5" strokeWidth={3} />
          </span>
          <span
            aria-hidden="true"
            className="text-lg leading-none font-extrabold tracking-tight whitespace-nowrap text-(--color-brand-primary) sm:text-xl"
          >
            Track N&apos; Stick
          </span>
        </Link>
        <div className="flex items-center">
          <SignedIn>
            <div
              role="toolbar"
              aria-label="User actions"
              className={cn(PILL, 'gap-1.5 sm:gap-2')}
            >
              {/* On phones the bottom tab bar carries navigation and Add. */}
              <div className="hidden items-center gap-2 sm:flex">
                <IconNavLink to="/" label="Tracker" aria-label="Daily Tracker">
                  <Calendar aria-hidden="true" className="size-5" />
                </IconNavLink>
                <IconNavLink
                  to="/habits"
                  label="Habits"
                  aria-label="Habits Overview"
                >
                  <ListChecks aria-hidden="true" className="size-5" />
                </IconNavLink>
                <IconNavLink
                  to="/progress"
                  label="Progress"
                  aria-label="Progress Overview"
                >
                  <BarChart2 aria-hidden="true" className="size-5" />
                </IconNavLink>
                <IconNavLink to="/coach" label="Coach" aria-label="Habit Coach">
                  <MessageCircle aria-hidden="true" className="size-5" />
                </IconNavLink>

                <span
                  role="separator"
                  aria-orientation="vertical"
                  aria-hidden="true"
                  className="mx-1 h-6 w-px self-center rounded-full bg-(--color-border-primary)/70"
                />

                <Button
                  variant="brandTonal"
                  size="icon"
                  onClick={toggleShowAddHabitDialog}
                  aria-label="Add Habit"
                  className={HEADER_BUTTON}
                >
                  <Plus aria-hidden="true" className="size-5" />
                </Button>
              </div>

              <Button
                variant="brandTonal"
                size="icon"
                onClick={toggleMode}
                aria-label="Toggle Theme"
                className={HEADER_BUTTON}
              >
                <Sun aria-hidden="true" className="size-5 dark:hidden" />
                <Moon aria-hidden="true" className="hidden size-5 dark:block" />
              </Button>
              <UserButton
                appearance={{
                  variables: {
                    colorPrimary: 'var(--color-brand-primary)',
                    colorBackground: 'var(--color-card)',
                    colorText: 'var(--color-foreground)',
                    borderRadius: '1rem',
                  },
                  elements: {
                    userButtonAvatarBox:
                      // !important: Clerk's own avatar size would otherwise win.
                      '!size-11 ring-2 ring-(--color-surface) dark:ring-(--color-surface-secondary)',
                    // Popover container
                    userButtonPopoverCard:
                      'bg-(--color-card) dark:bg-(--color-surface-secondary) text-(--color-foreground) rounded-2xl border border-(--color-border-primary) shadow-2xl',
                    userButtonPopoverMain:
                      'bg-transparent text-(--color-foreground)',
                    userPreview:
                      'grid grid-cols-[auto_1fr] items-center gap-3 p-3',
                    userPreviewText:
                      'text-(--color-foreground) text-sm font-medium',
                    // Action items
                    userButtonActionButton:
                      '!text-(--color-foreground) !opacity-100 hover:bg-(--color-hover-surface) focus:bg-(--color-hover-surface) rounded-lg h-10 px-3',
                    userButtonActionButtonText:
                      '!text-(--color-foreground) !opacity-100 text-sm',
                    userButtonActionButtonIcon: '!text-(--color-foreground)',
                    userButtonPopoverActionButton:
                      '!text-(--color-foreground) !opacity-100 hover:bg-(--color-hover-surface) focus:bg-(--color-hover-surface) rounded-lg h-10 px-3',
                    userButtonPopoverActionButtonText:
                      '!text-(--color-foreground) !opacity-100 text-sm',
                    userButtonPopoverActionButtonIcon:
                      '!text-(--color-foreground)',
                    // Footer area (Secured by Clerk)
                    userButtonPopoverFooter:
                      'bg-transparent border-t border-(--color-border-primary) text-(--color-text-secondary)',
                  },
                }}
              />
            </div>
          </SignedIn>
          <SignedOut>
            <div
              role="toolbar"
              aria-label="User actions"
              className={cn(PILL, 'gap-1.5 sm:gap-2')}
            >
              <Button
                variant="brandTonal"
                size="icon"
                onClick={toggleMode}
                aria-label="Toggle Theme"
                className={HEADER_BUTTON}
              >
                <Sun aria-hidden="true" className="size-5 dark:hidden" />
                <Moon aria-hidden="true" className="hidden size-5 dark:block" />
              </Button>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
});

export default Header;
