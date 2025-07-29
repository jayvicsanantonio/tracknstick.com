import { memo } from 'react';

const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-purple-600"></div>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
});

export default LoadingFallback;
