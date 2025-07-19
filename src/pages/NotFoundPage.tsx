import { usePageTitle } from '@/hooks/usePageTitle';
import { useAppNavigation } from '@/utils/navigation';
import { Button } from '@/components/ui/button';

/**
 * 404 Not Found page component
 *
 * This page is displayed when users navigate to a route that doesn't exist.
 * It provides a friendly error message and navigation options to return to the app.
 *
 * Route: * (catch-all for unmatched routes)
 */
export function NotFoundPage() {
  usePageTitle('Page Not Found');

  const { goToDashboard } = useAppNavigation();

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16">
      <div className="text-center">
        {/* 404 Icon */}
        <div className="mb-8 text-8xl font-bold text-purple-300 dark:text-purple-800">
          404
        </div>

        {/* Error Message */}
        <h1 className="mb-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
          Page Not Found
        </h1>
        <p className="mb-8 max-w-md text-gray-600 dark:text-gray-400">
          The page you&apos;re looking for doesn&apos;t exist. It might have
          been moved, deleted, or you may have typed the wrong URL.
        </p>

        {/* Navigation Options */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Button onClick={goToDashboard} className="min-w-[140px]">
            Go to Dashboard
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="min-w-[140px]"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
