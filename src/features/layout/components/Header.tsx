import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useContext } from "react";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext";
const { CheckCircle2, Edit, Moon, Plus, Sun, BarChart2 } = MiscellaneousIcons;

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
          className="h-8 w-8 sm:h-10 sm:w-10 mr-2 transition-transform duration-300 hover:scale-110 text-[var(--color-brand-primary)]"
        />
        <span className="hidden sm:inline-block text-lg sm:text-xl md:text-2xl font-bold text-[var(--color-brand-tertiary)] dark:text-[var(--color-brand-text-light)] pl-1">
          Track N&apos; Stick
        </span>
      </div>
      <div className="flex items-center">
        <SignedIn>
          <div
            role="toolbar"
            aria-label="User actions"
            className="flex space-x-2 sm:space-x-3 bg-opacity-20 rounded-full p-1 sm:p-2 transition-all duration-300 hover:bg-opacity-30"
          >
            <Button
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] hover:shadow-lg dark:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-tertiary)] dark:hover:shadow-[var(--color-brand-primary)]/20"
              onClick={toggleShowAddHabitDialog}
              aria-label="Add Habit"
            >
              <Plus
                aria-hidden="true"
                className="h-4 w-4 sm:h-6 sm:w-6 text-white dark:text-[var(--color-brand-primary)]"
              />
            </Button>
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isHabitsOverviewMode
                  ? "bg-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-tertiary)] shadow-lg dark:bg-[var(--color-brand-primary)] dark:hover:bg-[var(--color-brand-secondary)] dark:shadow-[var(--color-brand-secondary)]/20"
                  : "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] hover:shadow-lg dark:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-tertiary)] dark:hover:shadow-[var(--color-brand-primary)]/20"
              }`}
              onClick={toggleisHabitsOverviewMode}
              aria-label="Toggle Edit Mode"
            >
              <Edit
                aria-hidden="true"
                className={`h-4 w-4 sm:h-6 sm:w-6 ${isHabitsOverviewMode ? "text-white" : "text-white dark:text-[var(--color-brand-primary)]"}`}
              />
            </Button>
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isProgressOverviewMode
                  ? "bg-[var(--color-brand-secondary)] hover:bg-[var(--color-brand-tertiary)] shadow-lg dark:bg-[var(--color-brand-primary)] dark:hover:bg-[var(--color-brand-secondary)] dark:shadow-[var(--color-brand-secondary)]/20"
                  : "bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] hover:shadow-lg dark:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-tertiary)] dark:hover:shadow-[var(--color-brand-primary)]/20"
              }`}
              aria-label="Manage Habits"
              onClick={toggleisProgressOverviewMode}
            >
              <BarChart2
                aria-hidden="true"
                className={`h-4 w-4 sm:h-6 sm:w-6 ${isProgressOverviewMode ? "text-white" : "text-white dark:text-[var(--color-brand-primary)]"}`}
              />
            </Button>
            <Button
              className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] hover:shadow-lg dark:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-tertiary)] dark:hover:shadow-[var(--color-brand-primary)]/20"
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
            >
              <Sun
                aria-hidden="true"
                className="h-4 w-4 sm:h-6 sm:w-6 text-white dark:hidden"
              />
              <Moon
                aria-hidden="true"
                className="h-4 w-4 sm:h-6 sm:w-6 text-[var(--color-brand-primary)] hidden dark:block"
              />
            </Button>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    "min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 shadow-md transition-all duration-300 hover:shadow-lg dark:hover:shadow-[var(--color-brand-primary)]/20",
                },
              }}
            />
          </div>
        </SignedIn>
        <SignedOut>
          <Button
            className="rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 bg-[var(--color-brand-primary)] hover:bg-[var(--color-brand-secondary)] hover:shadow-lg dark:bg-[var(--color-surface-secondary)] dark:hover:bg-[var(--color-surface-tertiary)] dark:hover:shadow-[var(--color-brand-primary)]/20"
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
          >
            <Sun
              aria-hidden="true"
              className="h-4 w-4 sm:h-6 sm:w-6 text-white dark:hidden"
            />
            <Moon
              aria-hidden="true"
              className="h-4 w-4 sm:h-6 sm:w-6 text-[var(--color-brand-primary)] hidden dark:block"
            />
          </Button>
        </SignedOut>
      </div>
    </header>
  );
}
