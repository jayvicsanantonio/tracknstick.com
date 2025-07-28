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

/**
 * Hook variant that only sets the title without the app name suffix
 * Useful for specific cases where you want full control over the title
 *
 * @param title - The complete title to set
 */
export function usePageTitleRaw(title: string) {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    return () => {
      document.title = originalTitle;
    };
  }, [title]);
}
