import { useEffect } from 'react';

/**
 * Custom hook to dynamically update the document title
 * This hook provides a clean way to manage page titles in React Router v7.7
 *
 * @param title - The title to set for the current page
 * @param suffix - Optional suffix to append to the title (defaults to app name)
 *
 * @example
 * ```tsx
 * function HabitsPage() {
 *   usePageTitle('Habits Overview');
 *   return <HabitsOverview />;
 * }
 * ```
 */
export function usePageTitle(title: string, suffix?: string) {
  useEffect(() => {
    const appName = "Track N' Stick";
    const fullTitle = suffix ? `${title} | ${suffix}` : `${title} | ${appName}`;

    // Update the document title
    document.title = fullTitle;

    // Cleanup function to reset title when component unmounts
    return () => {
      document.title = appName;
    };
  }, [title, suffix]);
}
