import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useContext } from "react";
import { NavLink, Link } from "react-router-dom";
import MiscellaneousIcons from "@/icons/miscellaneous";
import { Button } from "@/components/ui/button";
import { ThemeContext } from "@/context/ThemeContext";
import { useHabitsContext } from "@/features/habits/context/HabitsStateContext"; // toggleShowAddHabitDialog is still used

const { CheckCircle2, Edit, Moon, Plus, Sun, BarChart2 } = MiscellaneousIcons;

// Define a reusable NavLink component for styling
const StyledNavLink = ({ to, children, ariaLabel }: { to: string, children: React.ReactNode, ariaLabel: string }) => {
  const { isDarkMode } = useContext(ThemeContext);
  return (
    <NavLink
      to={to}
      aria-label={ariaLabel}
      className={({ isActive }) =>
        `rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 flex items-center justify-center ${
          isActive
            ? "bg-purple-700 shadow-purple-700/50 text-white"
            : isDarkMode
              ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
              : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
        }`
      }
    >
      {children}
    </NavLink>
  );
};

export default function Header() {
  const { isDarkMode, toggleDarkMode } = useContext(ThemeContext);
  const { toggleShowAddHabitDialog } = useHabitsContext(); // Removed unused context values

  return (
    <header className="flex items-center justify-between py-4 sm:py-8">
      <Link to="/" className="flex items-center group">
        <CheckCircle2
          aria-hidden="true"
          className={`h-8 w-8 sm:h-10 sm:w-10 mr-2 transition-transform duration-300 group-hover:scale-110 ${
            isDarkMode ? "text-purple-500" : "text-purple-600"
          }`}
        />
        <span
          className={`hidden sm:inline-block text-lg sm:text-xl md:text-2xl font-bold ${
            isDarkMode ? "text-purple-300" : "text-purple-800"
          } pl-1 group-hover:text-purple-700 dark:group-hover:text-purple-400 transition-colors`}
        >
          Track N&apos; Stick
        </span>
      </Link>
      <div className="flex items-center">
        <SignedIn>
          <div
            role="toolbar"
            aria-label="User actions"
            className="flex space-x-2 sm:space-x-3 bg-opacity-20 rounded-full p-1 sm:p-2 transition-all duration-300 hover:bg-opacity-30"
          >
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
                  : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50"
              }`}
              onClick={toggleShowAddHabitDialog}
              aria-label="Add Habit"
            >
              <Plus aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            </Button>
            <StyledNavLink to="/" ariaLabel="Habits Dashboard">
              <Edit aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            </StyledNavLink>
            <StyledNavLink to="/progress" ariaLabel="Progress Overview">
              <BarChart2 aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            </StyledNavLink>
            <Button
              className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
                isDarkMode
                  ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
                  : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
              }`}
              onClick={toggleDarkMode}
              aria-label="Toggle Dark Mode"
            >
              {isDarkMode ? (
                <Sun aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
              ) : (
                <Moon aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
              )}
            </Button>
            <UserButton
              appearance={{
                elements: {
                  userButtonAvatarBox:
                    "min-w-8 min-h-8 sm:min-w-10 sm:min-h-10 shadow-md transition-all duration-300 hover:bg-purple-600 hover:shadow-purple-600/50",
                },
              }}
            />
          </div>
        </SignedIn>
        <SignedOut>
          <Button
            className={`rounded-full w-8 h-8 sm:w-10 sm:h-10 p-0 shadow-md transition-all duration-300 ${
              isDarkMode
                ? "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
                : "bg-purple-600 hover:bg-purple-500 hover:shadow-purple-600/50 text-white"
            }`}
            onClick={toggleDarkMode}
            aria-label="Toggle Dark Mode"
          >
            {isDarkMode ? (
              <Sun aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            ) : (
              <Moon aria-hidden="true" className="h-4 w-4 sm:h-6 sm:w-6" />
            )}
          </Button>
        </SignedOut>
      </div>
    </header>
  );
}
