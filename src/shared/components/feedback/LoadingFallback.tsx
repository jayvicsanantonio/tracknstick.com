import { memo } from 'react';

const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        role="status"
        aria-live="polite"
        className="bg-(--color-surface)/80 dark:bg-(--color-surface-secondary)/80 ring-(--color-border-primary)/40 inline-flex items-center gap-4 rounded-full px-6 py-4 shadow-sm ring-1 ring-inset backdrop-blur-sm"
      >
        <span className="border-(--color-brand-primary) h-10 w-10 animate-spin rounded-full border-4 border-r-transparent sm:h-12 sm:w-12" />
        <span className="text-(--color-text-secondary) text-base font-medium sm:text-lg">
          Loading…
        </span>
      </div>
    </div>
  );
});

export default LoadingFallback;
