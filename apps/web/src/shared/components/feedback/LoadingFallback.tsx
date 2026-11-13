import { memo } from 'react';

const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-24">
      <div
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-4 rounded-full bg-(--color-surface)/80 px-6 py-4 shadow-sm ring-1 ring-(--color-border-primary)/40 backdrop-blur-sm ring-inset dark:bg-(--color-surface-secondary)/80"
      >
        <span className="h-10 w-10 animate-spin rounded-full border-4 border-(--color-brand-primary) border-r-transparent sm:h-12 sm:w-12" />
        <span className="text-base font-medium text-(--color-text-secondary) sm:text-lg">
          Loading…
        </span>
      </div>
    </div>
  );
});

export default LoadingFallback;
