// The app header: on wider screens the Track N' Stick logo and a toolbar of navigation and actions, in glass pills;
// on phones, signed in, an iOS navigation bar naming the page once its large title scrolls away, with the account button.

import { SignedIn, UserButton, useAuth } from '@clerk/clerk-react';
import { memo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
// import { NavLink } from 'react-router-dom';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { Button } from '@shared/components/ui/button';
// import { buttonVariants } from '@shared/components/ui/button-variants';
import IconNavLink from './IconNavLink';
import { useTheme } from '@shared/hooks/useTheme';
import { useScrolledPast } from '@shared/hooks/useScrolledPast';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { LARGE_TITLE_HEIGHT } from '@shared/components/layouts/LargeTitle';
import { pageTitleFor } from '@app/routes/pageTitles';
import { cn } from '@shared/utils/utils';
import type { ThemePreference } from '@shared/types/theme';

const { Check, ListChecks, Moon, Plus, Sun, BarChart2, Calendar } =
  MiscellaneousIcons;

const PREFERENCE_LABELS: Record<ThemePreference, string> = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
};

// The glass pill both halves of the header sit in. One height, h-14, holds a
// row of 44px controls with 6px padding, so the logo and the toolbar line up.
const PILL =
  'flex h-14 items-center rounded-full bg-(--color-surface)/80 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-(--color-border-primary)/40 backdrop-blur-xl backdrop-saturate-150 ring-inset dark:bg-(--color-surface-secondary)/80';

// Header icon buttons: 44px at every width, flat inside the pill's shadow.
const HEADER_BUTTON = 'sm:size-11 shadow-none hover:shadow-none';

/**
 * The signed-in user's account button. Its menu also holds the appearance:
 * the app follows the system's light or dark setting, as iOS apps do, and
 * the menu item steps through System, Light and Dark for anyone who wants
 * their own.
 */
function AccountButton({ size }: { size: 'small' | 'regular' }) {
  const { preference, cyclePreference } = useTheme();
  const AppearanceIcon = preference === 'dark' ? Moon : Sun;

  return (
    // Clerk draws the button once it has loaded; the slot keeps its place
    // until then.
    <span
      className={cn(
        'flex shrink-0 items-center justify-center',
        size === 'small' ? 'size-9' : 'size-11',
      )}
    >
      <UserButton
        appearance={{
          variables: {
            colorPrimary: 'var(--color-brand-primary)',
            colorBackground: 'var(--color-card)',
            colorText: 'var(--color-foreground)',
            borderRadius: '1rem',
          },
          elements: {
            userButtonAvatarBox: cn(
              // !important: Clerk's own avatar size would otherwise win.
              size === 'small' ? '!size-9' : '!size-11',
              'ring-2 ring-(--color-surface) dark:ring-(--color-surface-secondary)',
            ),
            // Popover container
            userButtonPopoverCard:
              'bg-(--color-card) dark:bg-(--color-surface-secondary) text-(--color-foreground) rounded-2xl border border-(--color-border-primary) shadow-2xl',
            userButtonPopoverMain: 'bg-transparent text-(--color-foreground)',
            userPreview: 'grid grid-cols-[auto_1fr] items-center gap-3 p-3',
            userPreviewText: 'text-(--color-foreground) text-sm font-medium',
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
            userButtonPopoverActionButtonIcon: '!text-(--color-foreground)',
            // Footer area (Secured by Clerk)
            userButtonPopoverFooter:
              'bg-transparent border-t border-(--color-border-primary) text-(--color-text-secondary)',
          },
        }}
      >
        <UserButton.MenuItems>
          <UserButton.Action
            label={`Appearance: ${PREFERENCE_LABELS[preference]}`}
            labelIcon={<AppearanceIcon className="size-4" />}
            onClick={cyclePreference}
          />
        </UserButton.MenuItems>
      </UserButton>
    </span>
  );
}

/**
 * The phone's top bar while signed in, as iOS draws a navigation bar: clear
 * over the page's large title, then frosted with the page's name centred in
 * it once the large title has scrolled under it.
 */
function PhoneTopBar() {
  const { pathname } = useLocation();
  const scrolled = useScrolledPast(LARGE_TITLE_HEIGHT);

  return (
    <div
      data-phone-bar
      data-scrolled={String(scrolled)}
      className={cn(
        'relative box-content flex h-11 items-center justify-center border-b px-4 pt-[env(safe-area-inset-top)] transition-[background-color,border-color] duration-200 sm:hidden',
        scrolled
          ? 'border-(--color-border-primary)/50 bg-(--color-surface)/80 backdrop-blur-xl backdrop-saturate-150 dark:bg-(--color-surface-secondary)/80'
          : 'border-transparent',
      )}
    >
      {/* The page's h1 is its large title; this repeats it for the eye. */}
      <span
        aria-hidden="true"
        className={cn(
          'text-[17px] font-semibold text-(--color-foreground) transition-opacity duration-200',
          scrolled ? 'opacity-100' : 'opacity-0',
        )}
      >
        {pageTitleFor(pathname)}
      </span>
      <div className="absolute right-3 bottom-1">
        <AccountButton size="small" />
      </div>
    </div>
  );
}

const Header = memo(function Header() {
  const { isSignedIn } = useAuth();
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <header className="sticky top-0 z-40">
      <SignedIn>
        <PhoneTopBar />
      </SignedIn>
      {/* Signed in, a phone has the top bar above instead of this row. */}
      <div
        className={cn(
          'mx-auto flex max-w-7xl items-center justify-between px-2 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3 sm:px-4 sm:py-8 md:px-8 2xl:max-w-[90rem]',
          isSignedIn && 'max-sm:hidden',
        )}
      >
        <Link
          to="/"
          aria-label="Track N' Stick"
          className={cn(
            PILL,
            'gap-2.5 pr-4 outline-none focus-visible:ring-2 focus-visible:ring-(--color-ring) sm:pr-5',
            isSignedIn && 'max-sm:hidden',
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
            className="font-display text-lg leading-none font-extrabold tracking-tight whitespace-nowrap text-(--color-brand-primary) sm:text-xl"
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

              <AccountButton size="regular" />
            </div>
          </SignedIn>
        </div>
      </div>
    </header>
  );
});

export default Header;
