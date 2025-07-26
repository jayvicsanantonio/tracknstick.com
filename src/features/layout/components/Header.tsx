import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { Button } from '@/components/ui/button';
import { ThemeContext } from '@/context/ThemeContext';
import { useHabitsContext } from '@/features/habits/hooks/useHabitsContext';
import { trackNavigationClick } from '@/utils/monitoring';
const { CheckCircle2, Edit, Moon, Plus, Sun, BarChart2, Calendar } =
  MiscellaneousIcons;

export default function Header() {
  const { toggleDarkMode } = useContext(ThemeContext);
  const { toggleShowAddHabitDialog } = useHabitsContext();

  return (
    <header className="flex items-center justify-between py-4 sm:py-8">
      <div className="flex items-center">
        <CheckCircle2
          aria-hidden="true"
          className="mr-2 h-8 w-8 text-(--color-brand-primary) transition-transform duration-300 hover:scale-110 sm:h-10 sm:w-10"
        />
        <span className="hidden pl-1 text-lg font-bold text-(--color-brand-tertiary) sm:inline-block sm:text-xl md:text-2xl dark:text-(--color-brand-text-light)">
          Track N&apos; Stick
        </span>
      </div>
      <div className="flex items-center">
        <SignedIn>
          <div
            role="toolbar"
            aria-label="User actions"
            className="bg-opacity-20 hover:bg-opacity-30 flex space-x-2 rounded-full p-1 transition-all duration-300 sm:space-x-3 sm:p-2"
          >
            <NavLink
              to="/"
              onClick={trackNavigationClick}
              className={({ isActive }) =>
                `flex h-8 w-8 items-center justify-center rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                  isActive
                    ? 'bg-(--color-brand-secondary) text-white shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary)/60 dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                    : 'bg-(--color-brand-primary)/20 text-(--color-brand-primary) hover:bg-(--color-brand-secondary)/30 hover:shadow-lg dark:bg-(--color-surface-secondary) dark:text-(--color-brand-primary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                }`
              }
              aria-label="Daily Tracker"
            >
              <Calendar aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            </NavLink>
            <NavLink
              to="/habits"
              onClick={trackNavigationClick}
              className={({ isActive }) =>
                `flex h-8 w-8 items-center justify-center rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                  isActive
                    ? 'bg-(--color-brand-secondary) text-white shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary)/60 dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                    : 'bg-(--color-brand-primary)/20 text-(--color-brand-primary) hover:bg-(--color-brand-secondary)/30 hover:shadow-lg dark:bg-(--color-surface-secondary) dark:text-(--color-brand-primary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                }`
              }
              aria-label="Habits Overview"
            >
              <Edit aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            </NavLink>
            <NavLink
              to="/progress"
              onClick={trackNavigationClick}
              className={({ isActive }) =>
                `flex h-8 w-8 items-center justify-center rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                  isActive
                    ? 'bg-(--color-brand-secondary) text-white shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary)/60 dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                    : 'bg-(--color-brand-primary)/20 text-(--color-brand-primary) hover:bg-(--color-brand-secondary)/30 hover:shadow-lg dark:bg-(--color-surface-secondary) dark:text-(--color-brand-primary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                }`
              }
              aria-label="Progress Overview"
            >
              <BarChart2 aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            </NavLink>
            <Button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-primary)/20 p-0 text-(--color-brand-primary) shadow-md transition-all duration-300 hover:bg-(--color-brand-secondary)/30 hover:shadow-lg sm:h-10 sm:w-10 dark:bg-(--color-surface-secondary)/60 dark:text-(--color-brand-primary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-6"
              onClick={toggleShowAddHabitDialog}
              aria-label="Add Habit"
            >
              <Plus aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>

            <Button
              className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-primary)/20 p-0 text-(--color-brand-primary) shadow-md transition-all duration-300 hover:bg-(--color-brand-secondary)/30 hover:shadow-lg sm:h-10 sm:w-10 dark:bg-(--color-surface-secondary)/60 dark:text-(--color-brand-primary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-6"
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
            className="flex h-8 w-8 items-center justify-center rounded-full bg-(--color-brand-primary)/60 p-0 shadow-md transition-all duration-300 hover:bg-(--color-brand-secondary) hover:shadow-lg sm:h-10 sm:w-10 dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-6"
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
          >
            <Sun
              aria-hidden="true"
              className="h-4 w-4 text-white sm:h-6 sm:w-6 dark:hidden"
            />
            <Moon
              aria-hidden="true"
              className="hidden h-4 w-4 text-(--color-brand-primary) sm:h-6 sm:w-6 dark:block"
            />
          </Button>
        </SignedOut>
      </div>
    </header>
  );
}
