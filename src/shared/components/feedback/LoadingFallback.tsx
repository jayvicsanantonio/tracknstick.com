import { memo } from 'react';

const LoadingFallback = memo(function LoadingFallback() {
  return (
    <div className="flex items-center justify-center py-16">
      <div
        role="status"
        aria-live="polite"
        className="bg-(--color-surface)/60 dark:bg-(--color-surface-secondary)/40 ring-(--color-border-primary)/40 inline-flex items-center gap-3 rounded-full px-4 py-2 shadow-sm ring-1 ring-inset backdrop-blur-sm"
      >
        <span className="border-(--color-brand-primary) h-5 w-5 animate-spin rounded-full border-2 border-r-transparent" />
        <span className="text-(--color-text-secondary) text-sm">Loading…</span>
      </div>
    </div>
  );
});

export default LoadingFallback;
