import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import MiscellaneousIcons from '@/icons/miscellaneous';
import { Button } from '@/components/ui/button';
import { ThemeContext } from '@/context/ThemeContext';
import { useHabitsContext } from '@/features/habits/context/HabitsStateContext';
import { featureFlags } from '@/config/featureFlags';
const { CheckCircle2, Edit, Moon, Plus, Sun, BarChart2, Calendar } =
  MiscellaneousIcons;

export default function Header() {
  const { toggleDarkMode } = useContext(ThemeContext);
  const {
    toggleShowAddHabitDialog,
    toggleisHabitsOverviewMode,
    isHabitsOverviewMode,
    isProgressOverviewMode,
    toggleisProgressOverviewMode,
  } = useHabitsContext();

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
            <Button
              className="h-8 w-8 rounded-full bg-(--color-brand-primary) p-0 shadow-md transition-all duration-300 hover:bg-(--color-brand-secondary) hover:shadow-lg sm:h-10 sm:w-10 dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20"
              onClick={toggleShowAddHabitDialog}
              aria-label="Add Habit"
            >
              <Plus
                aria-hidden="true"
                className="h-4 w-4 text-white sm:h-6 sm:w-6 dark:text-(--color-brand-primary)"
              />
            </Button>

            {featureFlags.isUrlRoutingEnabled ? (
              <>
                <NavLink
                  to="/"
                  className={({ isActive }) =>
                    `flex h-8 w-8 items-center justify-center rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                      isActive
                        ? 'bg-(--color-brand-secondary) shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary) dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                        : 'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) hover:shadow-lg dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                    }`
                  }
                  aria-label="Daily Tracker"
                >
                  <Calendar
                    aria-hidden="true"
                    className="h-4 w-4 text-white sm:h-6 sm:w-6 dark:text-(--color-brand-primary)"
                  />
                </NavLink>
                <NavLink
                  to="/habits"
                  className={({ isActive }) =>
                    `flex h-8 w-8 items-center justify-center rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                      isActive
                        ? 'bg-(--color-brand-secondary) shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary) dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                        : 'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) hover:shadow-lg dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                    }`
                  }
                  aria-label="Habits Overview"
                >
                  <Edit
                    aria-hidden="true"
                    className="h-4 w-4 text-white sm:h-6 sm:w-6 dark:text-(--color-brand-primary)"
                  />
                </NavLink>
                <NavLink
                  to="/progress"
                  className={({ isActive }) =>
                    `flex h-8 w-8 items-center justify-center rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                      isActive
                        ? 'bg-(--color-brand-secondary) shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary) dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                        : 'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) hover:shadow-lg dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                    }`
                  }
                  aria-label="Progress Overview"
                >
                  <BarChart2
                    aria-hidden="true"
                    className="h-4 w-4 text-white sm:h-6 sm:w-6 dark:text-(--color-brand-primary)"
                  />
                </NavLink>
              </>
            ) : (
              <>
                <Button
                  className={`h-8 w-8 rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                    isHabitsOverviewMode
                      ? 'bg-(--color-brand-secondary) shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary) dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                      : 'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) hover:shadow-lg dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                  }`}
                  onClick={toggleisHabitsOverviewMode}
                  aria-label="Toggle Edit Mode"
                >
                  <Edit
                    aria-hidden="true"
                    className={`h-4 w-4 sm:h-6 sm:w-6 ${isHabitsOverviewMode ? 'text-white' : 'text-white dark:text-(--color-brand-primary)'}`}
                  />
                </Button>
                <Button
                  className={`h-8 w-8 rounded-full p-0 shadow-md transition-all duration-300 sm:h-10 sm:w-10 ${
                    isProgressOverviewMode
                      ? 'bg-(--color-brand-secondary) shadow-lg hover:bg-(--color-brand-tertiary) dark:bg-(--color-brand-primary) dark:shadow-(--color-brand-secondary)/20 dark:hover:bg-(--color-brand-secondary)'
                      : 'bg-(--color-brand-primary) hover:bg-(--color-brand-secondary) hover:shadow-lg dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20'
                  }`}
                  aria-label="Manage Habits"
                  onClick={toggleisProgressOverviewMode}
                >
                  <BarChart2
                    aria-hidden="true"
                    className={`h-4 w-4 sm:h-6 sm:w-6 ${isProgressOverviewMode ? 'text-white' : 'text-white dark:text-(--color-brand-primary)'}`}
                  />
                </Button>
              </>
            )}

            <Button
              className="h-8 w-8 rounded-full bg-(--color-brand-primary) p-0 shadow-md transition-all duration-300 hover:bg-(--color-brand-secondary) hover:shadow-lg sm:h-10 sm:w-10 dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20"
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
            className="h-8 w-8 rounded-full bg-(--color-brand-primary) p-0 shadow-md transition-all duration-300 hover:bg-(--color-brand-secondary) hover:shadow-lg sm:h-10 sm:w-10 dark:bg-(--color-surface-secondary) dark:hover:bg-(--color-surface-tertiary) dark:hover:shadow-(--color-brand-primary)/20"
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
