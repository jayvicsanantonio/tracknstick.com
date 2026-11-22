// Catch-all page for routes that do not exist, with ways back into the app.
// Uses the theme tokens so it matches both palettes.

import { usePageTitle } from '@shared/hooks/usePageTitle';
import { useNavigate } from 'react-router-dom';
import { Button } from '@shared/components/ui/button';

/**
 * 404 Not Found page component
 *
 * This page is displayed when users navigate to a route that doesn't exist.
 * It provides a friendly error message and navigation options to return to the app.
 *
 * Route: * (catch-all for unmatched routes)
 */
function NotFoundPage() {
  usePageTitle('Page Not Found');

  const navigate = useNavigate();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-12">
      <div className="ios-tracker-card w-full max-w-md rounded-[26px] px-6 py-12 text-center sm:px-10 sm:py-14">
        {/* 404 Icon */}
        <div className="mb-5 text-7xl font-extrabold tracking-tight text-(--color-brand-primary)/40 sm:mb-6 sm:text-8xl">
          404
        </div>

        {/* Error Message */}
        <h1 className="mb-3 text-2xl font-bold tracking-[-0.02em] text-(--color-foreground) sm:text-3xl">
          Page Not Found
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-(--color-text-secondary) sm:text-base">
          The page you&apos;re looking for doesn&apos;t exist. It might have
          been moved, deleted, or you may have typed the wrong URL.
        </p>

        {/* Navigation Options */}
        <div className="flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-center sm:gap-3">
          <Button
            onClick={() => void navigate('/')}
            className="h-11 min-w-[148px] rounded-full px-6"
          >
            Go to Dashboard
          </Button>
          <Button
            onClick={() => void navigate(-1)}
            variant="outline"
            className="h-11 min-w-[132px] rounded-full px-6"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}

export default NotFoundPage;
