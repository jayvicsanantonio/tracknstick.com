// The tablet & desktop app header: the Track N' Stick logo linking to the Tracker,
// and a Liquid Glass navigation & actions toolbar visually matching the phone tab bar.

import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { Button } from '@shared/components/ui/button';
import IconNavLink from './IconNavLink';
import { useTheme } from '@shared/hooks/useTheme';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { PAGE_CONTAINER } from '@shared/constants/layout';
import { preloadChunk } from '@shared/utils/preloadRoutes';
import { cn } from '@shared/utils/utils';

const { Check, ListChecks, Moon, Plus, Sun, BarChart2, Calendar } =
  MiscellaneousIcons;

// Shared iOS 26 Liquid Glass capsule matching MobileTabBar. One height, h-14,
// holds 44px controls with 6px padding so the logo and toolbar align cleanly.
const PILL = 'ios-liquid-glass flex h-14 items-center rounded-full p-1.5';

const Header = memo(function Header() {
  const { toggleMode } = useTheme();
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <header className="sticky top-0 z-40 hidden sm:block">
      {/* Frosted fade behind the pills so content scrolling underneath
          blurs away instead of showing through between them. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-28 bg-(--color-background)/55 [mask-image:linear-gradient(to_bottom,black_55%,transparent)] backdrop-blur-xl"
      />
      <div
        className={cn(PAGE_CONTAINER, 'flex items-center justify-between py-5')}
      >
        <Link
          to="/"
          aria-label="Track N' Stick"
          className={cn(
            PILL,
            'gap-2.5 pr-5 transition-transform outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) active:scale-[0.98]',
          )}
        >
          {/* Filled circle mark matching the 44px toolbar controls for concentric pill alignment */}
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_2px_8px_rgba(0,0,0,0.12)] ring-1 ring-white/20 ring-inset"
          >
            <Check className="size-5" strokeWidth={3} />
          </span>
          <span
            aria-hidden="true"
            className="text-lg leading-none font-extrabold tracking-tight whitespace-nowrap text-(--color-foreground) sm:text-[19px]"
          >
            Track N&apos; Stick
          </span>
        </Link>

        <div className="flex items-center">
          <SignedIn>
            <div
              role="toolbar"
              aria-label="User actions"
              className={cn(PILL, 'gap-1 sm:gap-1.5')}
            >
              <div className="flex items-center gap-1">
                <IconNavLink
                  to="/"
                  label="Tracker"
                  preload="dashboard"
                  aria-label="Daily Tracker"
                >
                  <Calendar aria-hidden="true" className="size-[19px]" />
                </IconNavLink>
                <IconNavLink
                  to="/habits"
                  label="Habits"
                  preload="habits"
                  aria-label="Habits Overview"
                >
                  <ListChecks aria-hidden="true" className="size-[19px]" />
                </IconNavLink>
                <IconNavLink
                  to="/progress"
                  label="Progress"
                  preload="progress"
                  aria-label="Progress Overview"
                >
                  <BarChart2 aria-hidden="true" className="size-[19px]" />
                </IconNavLink>
                <IconNavLink
                  to="/coach"
                  label="Coach"
                  preload="coach"
                  aria-label="Habit Coach"
                >
                  <MessageCircle aria-hidden="true" className="size-[19px]" />
                </IconNavLink>
              </div>

              <span
                role="separator"
                aria-orientation="vertical"
                aria-hidden="true"
                className="mx-1 h-6 w-px self-center rounded-full bg-(--color-border-primary)/60"
              />

              {/* Primary "+" action orb matching phone's detached brand-primary "+" button */}
              <Button
                variant="default"
                size="icon"
                onPointerEnter={() => preloadChunk('habitForm')}
                onClick={toggleShowAddHabitDialog}
                aria-label="Add Habit"
                className="size-11 rounded-full bg-(--color-brand-primary) text-(--color-primary-foreground) shadow-[inset_0_1px_0_rgba(255,255,255,0.28),0_4px_12px_rgba(0,0,0,0.14)] ring-1 ring-white/20 transition-[transform,background-color] ring-inset hover:bg-(--color-brand-secondary) active:scale-92 sm:size-11"
              >
                <Plus aria-hidden="true" className="size-5" strokeWidth={2.6} />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMode}
                aria-label="Toggle Theme"
                className="size-11 rounded-full bg-(--color-brand-primary)/10 text-(--color-brand-primary) shadow-none transition-[transform,background-color] hover:bg-(--color-brand-primary)/18 hover:text-(--color-brand-primary) active:scale-92 sm:size-11"
              >
                <Sun aria-hidden="true" className="size-[19px] dark:hidden" />
                <Moon
                  aria-hidden="true"
                  className="hidden size-[19px] dark:block"
                />
              </Button>

              {/* Clerk draws the button once it has loaded; the slot keeps
                  the toolbar its full width until then. */}
              <span className="flex size-11 shrink-0 items-center justify-center">
                <UserButton
                  appearance={{
                    variables: {
                      colorPrimary: 'var(--color-brand-primary)',
                      colorBackground: 'var(--color-card)',
                      colorText: 'var(--color-foreground)',
                      borderRadius: '1.25rem',
                    },
                    elements: {
                      userButtonAvatarBox:
                        // !important: Clerk's own avatar size would otherwise win.
                        '!size-11 ring-1 ring-(--color-border-primary)/60',
                      userButtonPopoverCard:
                        'ios-action-sheet-surface text-(--color-foreground) rounded-[24px]',
                      userButtonPopoverMain:
                        'bg-transparent text-(--color-foreground)',
                      userPreview:
                        'grid grid-cols-[auto_1fr] items-center gap-3 p-3',
                      userPreviewText:
                        'text-(--color-foreground) text-sm font-medium',
                      userButtonActionButton:
                        '!text-(--color-foreground) !opacity-100 hover:bg-(--color-brand-primary)/10 focus:bg-(--color-brand-primary)/10 rounded-xl h-10 px-3',
                      userButtonActionButtonText:
                        '!text-(--color-foreground) !opacity-100 text-sm',
                      userButtonActionButtonIcon: '!text-(--color-foreground)',
                      userButtonPopoverActionButton:
                        '!text-(--color-foreground) !opacity-100 hover:bg-(--color-brand-primary)/10 focus:bg-(--color-brand-primary)/10 rounded-xl h-10 px-3',
                      userButtonPopoverActionButtonText:
                        '!text-(--color-foreground) !opacity-100 text-sm',
                      userButtonPopoverActionButtonIcon:
                        '!text-(--color-foreground)',
                      userButtonPopoverFooter:
                        'bg-transparent border-t border-(--color-border-primary)/50 text-(--color-text-secondary)',
                    },
                  }}
                />
              </span>
            </div>
          </SignedIn>
          <SignedOut>
            <div
              role="toolbar"
              aria-label="User actions"
              className={cn(PILL, 'gap-1.5')}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMode}
                aria-label="Toggle Theme"
                className="size-11 rounded-full bg-(--color-brand-primary)/10 text-(--color-brand-primary) shadow-none transition-[transform,background-color] hover:bg-(--color-brand-primary)/18 hover:text-(--color-brand-primary) active:scale-92 sm:size-11"
              >
                <Sun aria-hidden="true" className="size-[19px] dark:hidden" />
                <Moon
                  aria-hidden="true"
                  className="hidden size-[19px] dark:block"
                />
              </Button>
            </div>
          </SignedOut>
        </div>
      </div>
    </header>
  );
});

export default Header;
