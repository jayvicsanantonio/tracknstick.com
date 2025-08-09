import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useContext, memo } from 'react';
// import { NavLink } from 'react-router-dom';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { Button } from '@shared/components/ui/button';
// import { buttonVariants } from '@shared/components/ui/button-variants';
import IconNavLink from './IconNavLink';
import { ThemeContext } from '@app/providers/ThemeContext';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { trackNavigationClick } from '@shared/utils/monitoring';

const { CheckCircle2, Edit, Moon, Plus, Sun, BarChart2, Calendar } =
  MiscellaneousIcons;

const Header = memo(function Header() {
  const { toggleDarkMode } = useContext(ThemeContext);
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <header className="sticky top-0 z-40 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-2 py-4 sm:px-4 sm:py-8 md:px-8">
        <div className="bg-(--color-surface)/30 dark:bg-(--color-surface-secondary)/40 ring-(--color-border-primary)/40 flex items-center gap-2 rounded-full px-2 py-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-inset backdrop-blur-xl backdrop-saturate-150 sm:gap-3 sm:px-3 sm:py-2">
          <CheckCircle2
            aria-hidden="true"
            className="text-(--color-brand-primary) h-8 w-8 shrink-0 hover:scale-110 sm:h-10 sm:w-10"
          />
          <span className="text-(--color-brand-text) dark:text-(--color-brand-text-light) hidden pl-1 pr-2 text-lg font-bold sm:inline-block sm:text-xl md:text-2xl">
            Track N&apos; Stick
          </span>
        </div>
        <div className="flex items-center">
          <SignedIn>
            <div
              role="toolbar"
              aria-label="User actions"
              className="bg-(--color-surface)/30 dark:bg-(--color-surface-secondary)/40 ring-(--color-border-primary)/40 flex gap-2 rounded-full p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_8px_24px_rgba(0,0,0,0.06)] ring-1 ring-inset backdrop-blur-xl backdrop-saturate-150 sm:gap-3 sm:p-2"
            >
              <IconNavLink
                to="/"
                onClick={trackNavigationClick}
                aria-label="Daily Tracker"
              >
                <Calendar
                  aria-hidden="true"
                  className="h-4 w-4 sm:h-6 sm:w-6"
                />
              </IconNavLink>
              <IconNavLink
                to="/habits"
                onClick={trackNavigationClick}
                aria-label="Habits Overview"
              >
                <Edit aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
              </IconNavLink>
              <IconNavLink
                to="/progress"
                onClick={trackNavigationClick}
                aria-label="Progress Overview"
              >
                <BarChart2
                  aria-hidden="true"
                  className="h-4 w-4 sm:h-6 sm:w-6"
                />
              </IconNavLink>

              <span
                role="separator"
                aria-orientation="vertical"
                aria-hidden="true"
                className="bg-(--color-border-primary)/60 mx-1 w-px self-stretch rounded-full sm:mx-2"
              />

              <Button
                variant="brandTonal"
                size="icon"
                onClick={toggleShowAddHabitDialog}
                aria-label="Add Habit"
              >
                <Plus aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
              </Button>

              <Button
                variant="brandTonal"
                size="icon"
                onClick={toggleDarkMode}
                aria-label="Toggle Dark Mode"
              >
                <Sun
                  aria-hidden="true"
                  className="h-4 w-4 sm:h-6 sm:w-6 dark:hidden"
                />
                <Moon
                  aria-hidden="true"
                  className="hidden h-4 w-4 sm:h-6 sm:w-6 dark:block"
                />
              </Button>
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox:
                      'min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 shadow-md transition-all duration-300 hover:shadow-lg dark:hover:shadow-(--color-brand-primary)/20',
                  },
                }}
              />
            </div>
          </SignedIn>
          <SignedOut>
            <Button
              variant="brandTonal"
              size="icon"
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
            >
              <Sun
                aria-hidden="true"
                className="text-(--color-text-inverse) h-4 w-4 sm:h-6 sm:w-6 dark:hidden"
              />
              <Moon
                aria-hidden="true"
                className="text-(--color-brand-primary) hidden h-4 w-4 sm:h-6 sm:w-6 dark:block"
              />
            </Button>
          </SignedOut>
        </div>
      </div>
    </header>
  );
});

export default Header;
