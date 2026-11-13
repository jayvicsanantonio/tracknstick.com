// Error element for React Router routes
// The class boundary cannot serve this role: Router catches render errors in
// its own boundary inside RouterProvider, so the class never enters its error
// state and returns its (undefined) children, blanking the page.

import { isRouteErrorResponse, useRouteError } from 'react-router-dom';
import { ErrorFallback } from '@shared/components/feedback/ErrorFallback';

export function RouteErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <ErrorFallback
        title={`${error.status} ${error.statusText}`}
        description="That page could not be loaded."
      />
    );
  }

  return <ErrorFallback />;
}

export default RouteErrorBoundary;
